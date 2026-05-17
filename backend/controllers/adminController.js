const User = require("../models/User")
const GoalSheet = require("../models/GoalSheet")
const AuditLog = require("../models/AuditLog")
const CycleConfig = require("../models/CycleConfig")
const { refreshCycleConfig } = require("../utils/scoreCalculator")

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role managerId")
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getAllGoalSheets = async (req, res) => {
  try {
    const sheets = await GoalSheet.find().populate("employeeId", "name email role")
    res.json(sheets)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.unlockGoalSheet = async (req, res) => {
  try {
    const sheet = await GoalSheet.findById(req.params.id)
    if (!sheet) return res.status(404).json({ message: "Goal sheet not found." })
    if (!sheet.locked && sheet.status !== "approved") {
      return res.status(400).json({ message: "Goal sheet is not locked or approved." })
    }

    const oldValue = { status: sheet.status, locked: sheet.locked }
    sheet.locked = false
    sheet.status = "draft"
    await sheet.save()

    await AuditLog.create({
      action: "Unlock goal sheet",
      changedBy: req.user.id,
      oldValue,
      newValue: { status: sheet.status, locked: sheet.locked }
    })

    res.json(sheet)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(20)
    res.json(logs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getCycleConfig = async (req, res) => {
  try {
    let config = await CycleConfig.findOne()
    if (!config) {
      config = await CycleConfig.create({
        windows: [
          { label: "Goal Setting", startMonth: 5, startDay: 1, endMonth: 5, endDay: 31, allows: ["goalSubmission"] },
          { label: "Q1 Check-in", startMonth: 7, startDay: 1, endMonth: 7, endDay: 31, allows: ["achievementSubmission", "checkIn"] },
          { label: "Q2 Check-in", startMonth: 10, startDay: 1, endMonth: 10, endDay: 31, allows: ["achievementSubmission", "checkIn"] },
          { label: "Q3 Check-in", startMonth: 1, startDay: 1, endMonth: 1, endDay: 31, allows: ["achievementSubmission", "checkIn"] },
          { label: "Q4 Final Capture", startMonth: 3, startDay: 1, endMonth: 4, endDay: 30, allows: ["achievementSubmission", "checkIn"] }
        ]
      })
    }
    res.json(config)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.updateCycleConfig = async (req, res) => {
  try {
    const { windows } = req.body
    if (!Array.isArray(windows) || windows.length === 0) {
      return res.status(400).json({ message: "Invalid cycle configuration." })
    }

    const validatedWindows = windows.map((window) => ({
      label: window.label || "",
      startMonth: Number(window.startMonth) || 1,
      startDay: Number(window.startDay) || 1,
      endMonth: Number(window.endMonth) || 1,
      endDay: Number(window.endDay) || 1,
      allows: Array.isArray(window.allows) ? window.allows : []
    }))

    const existingConfig = await CycleConfig.findOne()
    const config = await CycleConfig.findOneAndUpdate({}, { windows: validatedWindows }, { new: true, upsert: true, setDefaultsOnInsert: true })
    refreshCycleConfig()

    await AuditLog.create({
      action: "Update cycle configuration",
      changedBy: req.user.id,
      oldValue: existingConfig ? existingConfig.toObject() : null,
      newValue: config.toObject()
    })

    res.json(config)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
