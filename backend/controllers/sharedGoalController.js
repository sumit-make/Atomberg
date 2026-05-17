const SharedGoal = require("../models/SharedGoal")
const User = require("../models/User")
const GoalSheet = require("../models/GoalSheet")
const AuditLog = require("../models/AuditLog")

const syncSharedGoalToGoalSheets = async (sharedGoal) => {
  for (const recipient of sharedGoal.recipientProgress) {
    const employeeId = recipient.employeeId
    let goalSheet = await GoalSheet.findOne({ employeeId })
    if (!goalSheet) {
      goalSheet = new GoalSheet({
        employeeId,
        goals: [],
        sharedGoals: [],
        totalWeightage: 0,
        status: "draft",
        locked: false
      })
    }

    goalSheet.sharedGoals = goalSheet.sharedGoals || []
    const existingSharedGoal = goalSheet.sharedGoals.find((item) => item.sharedGoalId?.toString() === sharedGoal._id.toString())
    const sharedGoalEntry = {
      sharedGoalId: sharedGoal._id,
      title: sharedGoal.title,
      description: sharedGoal.description,
      thrustArea: sharedGoal.thrustArea,
      uomType: sharedGoal.uomType,
      target: sharedGoal.target,
      achievement: recipient.achievement,
      weightage: recipient.weightage,
      isShared: true,
      primaryOwner: sharedGoal.primaryOwner
    }

    if (existingSharedGoal) {
      Object.assign(existingSharedGoal, sharedGoalEntry)
    } else {
      goalSheet.sharedGoals.push(sharedGoalEntry)
    }

    await goalSheet.save()
  }
}

const formatSharedGoalForEmployee = (sharedGoal, userId) => {
  const recipient = sharedGoal.recipientProgress.find((item) => item.employeeId.toString() === userId)
  if (!recipient) return null
  return {
    _id: sharedGoal._id,
    title: sharedGoal.title,
    description: sharedGoal.description,
    thrustArea: sharedGoal.thrustArea,
    uomType: sharedGoal.uomType,
    target: sharedGoal.target,
    weightage: recipient.weightage,
    achievement: recipient.achievement,
    isPrimaryOwner: sharedGoal.primaryOwner?.toString() === userId,
    primaryOwner: sharedGoal.primaryOwner,
    recipientEmployees: sharedGoal.recipientEmployees,
    createdAt: sharedGoal.createdAt
  }
}

exports.createSharedGoal = async (req, res) => {
  try {
    const { title, description, thrustArea, uomType, target, weightage, recipientIds, primaryOwnerId } = req.body

    if (!title || !thrustArea || !uomType || target == null || weightage == null || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res.status(400).json({ message: "Missing required shared goal fields." })
    }

    if (weightage < 10 || weightage > 100) {
      return res.status(400).json({ message: "Shared goal weightage must be between 10 and 100." })
    }

    const uniqueRecipientIds = [...new Set(recipientIds)]
    const recipients = await User.find({ _id: { $in: uniqueRecipientIds }, role: "employee" }).select("_id")
    if (recipients.length === 0) {
      return res.status(400).json({ message: "At least one valid employee recipient is required." })
    }

    const ownerId = primaryOwnerId && uniqueRecipientIds.includes(primaryOwnerId) ? primaryOwnerId : recipients[0]._id.toString()
    const recipientProgress = recipients.map((user) => ({
      employeeId: user._id,
      weightage,
      achievement: 0,
      isPrimaryOwner: user._id.toString() === ownerId
    }))

    const sharedGoal = await SharedGoal.create({
      title,
      description,
      thrustArea,
      uomType,
      target,
      weightage,
      createdByAdmin: req.user.id,
      primaryOwner: ownerId,
      recipientEmployees: recipients.map((user) => user._id),
      recipientProgress,
      readOnly: true
    })

    await syncSharedGoalToGoalSheets(sharedGoal)

    await AuditLog.create({
      action: "Create shared goal",
      changedBy: req.user.id,
      oldValue: null,
      newValue: sharedGoal.toObject()
    })

    res.status(201).json(sharedGoal)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getSharedGoalsForEmployee = async (req, res) => {
  try {
    const sharedGoals = await SharedGoal.find({ recipientEmployees: req.user.id })
    res.json(sharedGoals.map((goal) => formatSharedGoalForEmployee(goal, req.user.id)))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getSharedGoals = async (req, res) => {
  try {
    const sharedGoals = await SharedGoal.find({ createdByAdmin: req.user.id })
      .populate("recipientEmployees", "name email")
      .populate("primaryOwner", "name email")
    res.json(sharedGoals)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateSharedGoalWeightage = async (req, res) => {
  try {
    const { weightage } = req.body
    const goal = await SharedGoal.findById(req.params.id)
    if (!goal) return res.status(404).json({ message: "Shared goal not found." })
    if (!goal.recipientEmployees.some((id) => id.toString() === req.user.id)) {
      return res.status(403).json({ message: "You are not assigned to this shared goal." })
    }

    if (weightage < 10 || weightage > 100) {
      return res.status(400).json({ message: "Weightage must be between 10 and 100." })
    }

    const recipient = goal.recipientProgress.find((item) => item.employeeId.toString() === req.user.id)
    if (!recipient) return res.status(404).json({ message: "Shared recipient entry not found." })

    const oldValue = { weightage: recipient.weightage }
    recipient.weightage = weightage
    recipient.updatedAt = Date.now()
    await goal.save()

    await syncSharedGoalToGoalSheets(goal)

    await AuditLog.create({
      action: "Update shared goal weightage",
      changedBy: req.user.id,
      oldValue,
      newValue: { weightage }
    })

    res.json(formatSharedGoalForEmployee(goal, req.user.id))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateSharedGoalAchievement = async (req, res) => {
  try {
    const { achievement } = req.body
    const goal = await SharedGoal.findById(req.params.id)
    if (!goal) return res.status(404).json({ message: "Shared goal not found." })
    if (goal.primaryOwner?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the primary owner can update shared goal achievement." })
    }

    const oldValue = { achievement: goal.recipientProgress.map((item) => ({ employeeId: item.employeeId, achievement: item.achievement })) }
    goal.recipientProgress.forEach((item) => {
      item.achievement = achievement
      item.updatedAt = Date.now()
    })
    await goal.save()

    await syncSharedGoalToGoalSheets(goal)

    await AuditLog.create({
      action: "Update shared goal achievement",
      changedBy: req.user.id,
      oldValue,
      newValue: { achievement }
    })

    res.json(formatSharedGoalForEmployee(goal, req.user.id))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}