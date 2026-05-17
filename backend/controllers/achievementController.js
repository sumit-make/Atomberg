const Achievement = require("../models/Achievement")
const GoalSheet = require("../models/GoalSheet")
const { calculateProgressScore, getCurrentPeriod, getActiveWindow, isActionAllowed } = require("../utils/scoreCalculator")

const resolveAchievementEmployeeId = async (achievement) => {
  if (achievement.employeeId) return achievement.employeeId.toString()

  if (!achievement.goalSheetId) return null

  let goalSheet
  if (typeof achievement.goalSheetId === "object" && achievement.goalSheetId.employeeId) {
    goalSheet = achievement.goalSheetId
  } else {
    goalSheet = await GoalSheet.findById(achievement.goalSheetId).select("employeeId")
  }

  if (!goalSheet?.employeeId) return null

  await Achievement.findByIdAndUpdate(achievement._id, { employeeId: goalSheet.employeeId })
  return goalSheet.employeeId.toString()
}

exports.submitAchievement = async (req, res) => {
  try {
    if (!(await isActionAllowed("achievementSubmission"))) {
      const window = await getActiveWindow()
      return res.status(403).json({ message: `Achievement updates are only allowed during the active check-in window (${window.label}).` })
    }

    const { goalSheetId, goalIndex, achievementValue, status, comment } = req.body
    const { period, year } = getCurrentPeriod()

    const goalSheet = await GoalSheet.findById(goalSheetId)
    if (!goalSheet) return res.status(404).json({ message: "Goal sheet not found." })
    if (goalSheet.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized." })
    }

    const existingAchievement = await Achievement.findOne({
      goalSheetId,
      goalIndex,
      period,
      year
    })

    if (existingAchievement) {
      existingAchievement.achievementValue = achievementValue
      existingAchievement.status = status || "Not Started"
      existingAchievement.comment = comment || ""
      existingAchievement.submittedAt = Date.now()
      await existingAchievement.save()
      return res.json(existingAchievement)
    }

    const achievement = await Achievement.create({
      goalSheetId,
      employeeId: req.user.id,
      goalIndex,
      period,
      year,
      achievementValue,
      status: status || "Not Started",
      comment: comment || ""
    })

    res.status(201).json(achievement)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getAchievements = async (req, res) => {
  try {
    const { goalSheetId } = req.query
    const query = { employeeId: req.user.id }
    if (goalSheetId) query.goalSheetId = goalSheetId

    let achievements = await Achievement.find(query).sort({ year: -1, period: -1 })

    if (achievements.length === 0) {
      const goalSheets = await GoalSheet.find({ employeeId: req.user.id }).select("_id")
      const goalSheetIds = goalSheets.map((sheet) => sheet._id)
      const fallbackQuery = { employeeId: { $exists: false }, goalSheetId: { $in: goalSheetIds } }
      if (goalSheetId) fallbackQuery.goalSheetId = goalSheetId
      achievements = await Achievement.find(fallbackQuery).sort({ year: -1, period: -1 })
    }

    res.json(achievements)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.addManagerComment = async (req, res) => {
  try {
    const { achievementId } = req.params
    const { managerComment } = req.body

    const achievement = await Achievement.findById(achievementId).populate("goalSheetId")
    if (!achievement) return res.status(404).json({ message: "Achievement not found." })

    const goalSheet = achievement.goalSheetId
    const manager = await require("../models/User").findById(req.user.id)
    if (manager.role !== "manager") {
      return res.status(403).json({ message: "Only managers can add comments." })
    }

    achievement.managerComment = managerComment
    achievement.managerReviewedAt = Date.now()
    await achievement.save()

    res.json(achievement)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getTeamAchievements = async (req, res) => {
  try {
    const { period, year } = getCurrentPeriod()
    const User = require("../models/User")

    const manager = await User.findById(req.user.id)
    if (manager.role !== "manager") {
      return res.status(403).json({ message: "Not authorized." })
    }

    const employees = await User.find({ managerId: req.user.id })
    const employeeIds = employees.map((e) => e._id.toString())

    const achievements = await Achievement.find({ period, year })
      .populate("employeeId", "name email")
      .populate("goalSheetId")

    const filteredAchievements = []
    for (const achievement of achievements) {
      const resolvedEmployeeId = await resolveAchievementEmployeeId(achievement)
      if (employeeIds.includes(resolvedEmployeeId)) {
        filteredAchievements.push(achievement)
      }
    }

    res.json(filteredAchievements)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getManagerTrendData = async (req, res) => {
  try {
    const User = require("../models/User")

    const manager = await User.findById(req.user.id)
    if (manager.role !== "manager") {
      return res.status(403).json({ message: "Not authorized." })
    }

    const employees = await User.find({ managerId: req.user.id })
    const employeeIds = employees.map((e) => e._id)

    const achievements = await Achievement.find({ employeeId: { $in: employeeIds } })
      .populate("goalSheetId")

    const grouped = {}
    achievements.forEach((ach) => {
      const key = `${ach.year}-${ach.period}`
      const goal = ach.goalSheetId?.goals?.[ach.goalIndex]
      const target = goal?.target || 0
      const percent = target ? Math.min(100, Math.round((ach.achievementValue / target) * 100)) : 0
      if (!grouped[key]) {
        grouped[key] = { period: ach.period, year: ach.year, totalPercent: 0, count: 0, onTrack: 0 }
      }
      grouped[key].totalPercent += percent
      grouped[key].count += 1
      if (ach.status === "On Track" || ach.status === "Completed") grouped[key].onTrack += 1
    })

    const trend = Object.values(grouped)
      .map((entry) => ({
        period: entry.period,
        year: entry.year,
        label: `${entry.period} ${entry.year}`,
        averagePercent: entry.count ? Math.round(entry.totalPercent / entry.count) : 0,
        trackedGoals: entry.count,
        onTrackRate: entry.count ? Math.round((entry.onTrack / entry.count) * 100) : 0
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        const order = ["Q1", "Q2", "Q3", "Q4"]
        return order.indexOf(a.period) - order.indexOf(b.period)
      })

    res.json(trend)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getAdminTrendData = async (req, res) => {
  try {
    const User = require("../models/User")

    const admin = await User.findById(req.user.id)
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Not authorized." })
    }

    const achievements = await Achievement.find().populate("goalSheetId")

    const grouped = {}
    achievements.forEach((ach) => {
      const key = `${ach.year}-${ach.period}`
      const goal = ach.goalSheetId?.goals?.[ach.goalIndex]
      const target = goal?.target || 0
      const percent = target ? Math.min(100, Math.round((ach.achievementValue / target) * 100)) : 0
      if (!grouped[key]) {
        grouped[key] = { period: ach.period, year: ach.year, totalPercent: 0, count: 0, onTrack: 0 }
      }
      grouped[key].totalPercent += percent
      grouped[key].count += 1
      if (ach.status === "On Track" || ach.status === "Completed") grouped[key].onTrack += 1
    })

    const trend = Object.values(grouped)
      .map((entry) => ({
        period: entry.period,
        year: entry.year,
        label: `${entry.period} ${entry.year}`,
        averagePercent: entry.count ? Math.round(entry.totalPercent / entry.count) : 0,
        trackedGoals: entry.count,
        onTrackRate: entry.count ? Math.round((entry.onTrack / entry.count) * 100) : 0
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        const order = ["Q1", "Q2", "Q3", "Q4"]
        return order.indexOf(a.period) - order.indexOf(b.period)
      })

    res.json(trend)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.getCompletionDashboard = async (req, res) => {
  try {
    const User = require("../models/User")
    const { period, year } = getCurrentPeriod()

    const admin = await User.findById(req.user.id)
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Not authorized." })
    }

    const employees = await User.find({ role: "employee" })
    const periodAchievements = await Achievement.find({ period, year }).populate("goalSheetId", "employeeId")

    const achievementsByEmployee = {}
    await Promise.all(
      periodAchievements.map(async (achievement) => {
        const resolvedEmployeeId = await resolveAchievementEmployeeId(achievement)
        if (!resolvedEmployeeId) return

        achievementsByEmployee[resolvedEmployeeId] = (achievementsByEmployee[resolvedEmployeeId] || 0) + 1
      })
    )

    const completionData = await Promise.all(
      employees.map(async (emp) => {
        const gs = await GoalSheet.findOne({ employeeId: emp._id }).sort({ updatedAt: -1, createdAt: -1 })
        const submittedCount = achievementsByEmployee[emp._id.toString()] || 0
        const totalGoals = (gs?.goals?.length || 0) + (gs?.sharedGoals?.length || 0)

        return {
          employeeName: emp.name,
          employeeEmail: emp.email,
          goalSheetStatus: gs?.status || "no_sheet",
          achievementsSubmitted: submittedCount,
          goalsCount: totalGoals,
          completionPercentage: totalGoals ? Math.round((submittedCount / totalGoals) * 100) : 0
        }
      })
    )

    res.json(completionData)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

exports.exportAchievementReport = async (req, res) => {
  try {
    const User = require("../models/User")
    const { period, year } = getCurrentPeriod()

    const achievements = await Achievement.find({ period, year })
      .populate("employeeId", "name email")
      .populate("goalSheetId")

    const rows = [
      ["Employee", "Email", "Goal", "Thrust Area", "UoM", "Target", "Achievement", "Status", "Progress Score", "Period"]
    ]

    for (const ach of achievements) {
      const goal = ach.goalSheetId?.goals?.[ach.goalIndex]
      if (!goal) continue

      const progressScore = calculateProgressScore(ach.achievementValue, goal.target, goal.uomType)

      rows.push([
        ach.employeeId?.name || "Unknown",
        ach.employeeId?.email || "Unknown",
        goal.title,
        goal.thrustArea,
        goal.uomType,
        goal.target,
        ach.achievementValue,
        ach.status,
        progressScore,
        `${ach.period} ${ach.year}`
      ])
    }

    const csv = rows.map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n")

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", `attachment; filename="achievement_report_${period}_${year}.csv"`)
    res.send(csv)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}