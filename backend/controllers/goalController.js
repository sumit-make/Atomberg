const GoalSheet = require("../models/GoalSheet")
const AuditLog = require("../models/AuditLog")
const calculateProgress = require("../utils/progressCalculator")
const { getActiveWindow, isActionAllowed } = require("../utils/scoreCalculator")

exports.createGoalSheet = async (req, res) => {
  try {
    const { goals } = req.body

    if (!Array.isArray(goals) || goals.length === 0) {
      return res.status(400).json({ message: "At least one goal is required." })
    }

    if (goals.length > 8) {
      return res.status(400).json({ message: "Maximum 8 goals allowed." })
    }
    // Allow saving drafts without requiring total weightage === 100.
    // Final validation is applied at submission time.
    const totalWeightage = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0)

    const existing = await GoalSheet.findOne({ employeeId: req.user.id })
    if (existing && existing.locked) {
      return res.status(400).json({ message: "Goal sheet is locked and cannot be modified." })
    }

    const goalSheet = existing || new GoalSheet({ employeeId: req.user.id })
    goalSheet.goals = goals
    goalSheet.totalWeightage = totalWeightage
    goalSheet.status = "draft"
    goalSheet.locked = false
    goalSheet.sharedGoals = existing?.sharedGoals || goalSheet.sharedGoals || []

    await goalSheet.save()

    await AuditLog.create({
      action: "Create or update goal sheet",
      changedBy: req.user.id,
      oldValue: existing ? existing.toObject() : null,
      newValue: goalSheet.toObject()
    })

    res.status(201).json(goalSheet)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getGoalSheet = async (req, res) => {
  try {
    const goalSheet = await GoalSheet.findOne({ employeeId: req.user.id })
    if (!goalSheet) return res.status(404).json({ message: "Goal sheet not found." })

    const progress = calculateProgress(goalSheet.goals, goalSheet.sharedGoals)
    res.json({ ...goalSheet.toObject(), progress })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.submitGoals = async (req, res) => {
  try {
    if (!(await isActionAllowed("goalSubmission"))) {
      const window = await getActiveWindow()
      return res.status(403).json({ message: `Goal submission is only allowed during the active goal-setting window (${window.label}).` })
    }

    const goalSheet = await GoalSheet.findById(req.params.id)
    if (!goalSheet) return res.status(404).json({ message: "Goal sheet not found." })
    if (goalSheet.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized." })
    }

    // Validate weightage totals and per-goal minimums before allowing submission
    const totalWeightage = goalSheet.goals.reduce((sum, g) => sum + Number(g.weightage || 0), 0)
    if (totalWeightage !== 100) {
      return res.status(400).json({ message: "Total weightage must equal 100 before submission." })
    }

    for (const g of goalSheet.goals) {
      if (Number(g.weightage || 0) < 10) {
        return res.status(400).json({ message: "Each goal must have a minimum weightage of 10 before submission." })
      }
    }

    const oldStatus = goalSheet.status
    goalSheet.status = "submitted"
    await goalSheet.save()

    await AuditLog.create({
      action: "Submit goal sheet",
      changedBy: req.user.id,
      oldValue: { status: oldStatus },
      newValue: { status: "submitted" }
    })

    res.json(goalSheet)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
