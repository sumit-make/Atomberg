const mongoose = require("mongoose")

const achievementSchema = new mongoose.Schema({
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
  goalIndex: { type: Number, required: true },
  period: { type: String, enum: ["Q1", "Q2", "Q3", "Q4"], required: true },
  year: { type: Number, required: true },
  achievementValue: { type: Number, default: 0 },
  status: { type: String, enum: ["Not Started", "On Track", "Completed"], default: "Not Started" },
  comment: { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now },
  managerComment: { type: String, default: "" },
  managerReviewedAt: { type: Date, default: null }
}, { timestamps: true })

module.exports = mongoose.model("Achievement", achievementSchema)
