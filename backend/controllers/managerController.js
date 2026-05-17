const GoalSheet = require("../models/GoalSheet")
const AuditLog = require("../models/AuditLog")

exports.getSubmittedGoals = async (req, res) => {
  try {
    const sheets = await GoalSheet.find({ status: "submitted" }).populate("employeeId", "name email role")
    res.json(sheets)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.approveGoals = async (req, res) => {
  try {
    const sheet = await GoalSheet.findById(req.params.id)
    if (!sheet) return res.status(404).json({ message: "Goal sheet not found." })

    sheet.status = "approved"
    sheet.locked = true
    await sheet.save()

    await AuditLog.create({
      action: "Approve goal sheet",
      changedBy: req.user.id,
      oldValue: { status: "submitted" },
      newValue: { status: "approved" }
    })

    res.json(sheet)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.rejectGoals = async (req, res) => {
  try {
    const sheet = await GoalSheet.findById(req.params.id)
    if (!sheet) return res.status(404).json({ message: "Goal sheet not found." })

    sheet.status = "rejected"
    await sheet.save()

    await AuditLog.create({
      action: "Reject goal sheet",
      changedBy: req.user.id,
      oldValue: { status: "submitted" },
      newValue: { status: "rejected" }
    })

    res.json(sheet)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.editGoalsInline = async (req, res) => {
  try {
    const { goals } = req.body
    const sheet = await GoalSheet.findById(req.params.id)
    if (!sheet) return res.status(404).json({ message: "Goal sheet not found." })

    if (sheet.status !== "submitted") {
      return res.status(400).json({ message: "Goals can only be edited while in submitted status." })
    }

    const totalWeightage = goals.reduce((s, g) => s + (g.weightage || 0), 0)
    if (totalWeightage !== 100) {
      return res.status(400).json({ message: "Total weightage must equal 100." })
    }

    const oldValues = sheet.goals
    sheet.goals = goals
    sheet.totalWeightage = totalWeightage
    await sheet.save()

    await AuditLog.create({
      action: "Edit goals inline during approval",
      changedBy: req.user.id,
      oldValue: { goals: oldValues },
      newValue: { goals: goals }
    })

    res.json(sheet)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
