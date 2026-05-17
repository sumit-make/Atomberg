const CheckIn = require("../models/CheckIn")
const GoalSheet = require("../models/GoalSheet")
const { getActiveWindow, isActionAllowed } = require("../utils/scoreCalculator")

exports.createCheckIn = async (req, res) => {
  try {
    if (!(await isActionAllowed("checkIn"))) {
      const window = await getActiveWindow()
      return res.status(403).json({ message: `Check-ins are only accepted during the active check-in window (${window.label}).` })
    }

    const { goalSheetId, comment } = req.body
    const goalSheet = await GoalSheet.findById(goalSheetId)
    if (!goalSheet) {
      return res.status(404).json({ message: "Goal sheet not found." })
    }
    if (goalSheet.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to check in for this goal sheet." })
    }

    const checkIn = await CheckIn.create({
      goalSheetId,
      employeeId: req.user.id,
      comment
    })

    res.status(201).json(checkIn)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
