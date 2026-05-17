const CycleConfig = require("../models/CycleConfig")

const defaultCycleConfig = {
  windows: [
    { label: "Goal Setting", startMonth: 5, startDay: 1, endMonth: 5, endDay: 31, allows: ["goalSubmission"] },
    { label: "Q1 Check-in", startMonth: 7, startDay: 1, endMonth: 7, endDay: 31, allows: ["achievementSubmission", "checkIn"] },
    { label: "Q2 Check-in", startMonth: 10, startDay: 1, endMonth: 10, endDay: 31, allows: ["achievementSubmission", "checkIn"] },
    { label: "Q3 Check-in", startMonth: 1, startDay: 1, endMonth: 1, endDay: 31, allows: ["achievementSubmission", "checkIn"] },
    { label: "Q4 Final Capture", startMonth: 3, startDay: 1, endMonth: 4, endDay: 30, allows: ["achievementSubmission", "checkIn"] }
  ]
}

let cachedCycleConfig = null

const loadCycleConfig = async () => {
  if (cachedCycleConfig) return cachedCycleConfig

  try {
    const config = await CycleConfig.findOne()
    if (!config) {
      cachedCycleConfig = defaultCycleConfig
      return cachedCycleConfig
    }
    cachedCycleConfig = config.toObject()
    return cachedCycleConfig
  } catch {
    cachedCycleConfig = defaultCycleConfig
    return cachedCycleConfig
  }
}

const refreshCycleConfig = () => {
  cachedCycleConfig = null
}

const isDateInRange = (date, window) => {
  const day = date.getDate()
  const month = date.getMonth() + 1

  const start = { month: window.startMonth, day: window.startDay }
  const end = { month: window.endMonth, day: window.endDay }

  const afterStart = month > start.month || (month === start.month && day >= start.day)
  const beforeEnd = month < end.month || (month === end.month && day <= end.day)

  if (start.month < end.month || (start.month === end.month && start.day <= end.day)) {
    return afterStart && beforeEnd
  }

  return afterStart || beforeEnd
}

const getActiveWindow = async () => {
  const now = new Date()
  const config = await loadCycleConfig()

  const activeWindow = config.windows.find((window) => isDateInRange(now, window))
  return activeWindow || { label: "Outside active window", allows: [] }
}

const isActionAllowed = async (action) => {
  const window = await getActiveWindow()
  return window.allows.includes(action)
}

const calculateProgressScore = (achievement, target, uomType) => {
  if (target == null || target === 0) return 0

  const formulas = {
    Numeric: () => Math.min(100, Math.round((achievement / target) * 100)),
    "%": () => Math.min(100, Math.round((achievement / target) * 100)),
    Timeline: () => (achievement >= target ? 100 : Math.round((achievement / target) * 100)),
    "Zero-based": () => (achievement === 0 ? 100 : 0)
  }

  const formula = formulas[uomType] || formulas.Numeric
  try {
    return formula()
  } catch {
    return 0
  }
}

const getCurrentPeriod = () => {
  const now = new Date()
  const month = now.getMonth() + 1
  let quarter

  if ([5, 6, 7].includes(month)) quarter = "Q1"
  else if ([8, 9, 10].includes(month)) quarter = "Q2"
  else if ([11, 12, 1].includes(month)) quarter = "Q3"
  else quarter = "Q4"

  return { period: quarter, year: now.getFullYear() }
}

module.exports = { calculateProgressScore, getCurrentPeriod, getActiveWindow, isActionAllowed, refreshCycleConfig }
