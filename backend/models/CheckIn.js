const mongoose = require("mongoose")

const checkInSchema = new mongoose.Schema({
  goalSheetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GoalSheet",
    required: true
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  comment: { type: String, default: "" },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

module.exports = mongoose.model("CheckIn", checkInSchema)
