const mongoose = require("mongoose")

const goalSheetSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  goals: [
    {
      title: { type: String, required: true },
      description: { type: String, default: "" },
      thrustArea: { type: String, default: "General" },
      uomType: { type: String, default: "Number" },
      target: { type: Number, required: true },
      achievement: { type: Number, default: 0 },
      weightage: { type: Number, required: true },
      status: { type: String, default: "Not Started" }
    }
  ],
  sharedGoals: [
    {
      sharedGoalId: { type: mongoose.Schema.Types.ObjectId, ref: "SharedGoal" },
      title: { type: String, required: true },
      description: { type: String, default: "" },
      thrustArea: { type: String, default: "General" },
      uomType: { type: String, default: "Number" },
      target: { type: Number, required: true },
      achievement: { type: Number, default: 0 },
      weightage: { type: Number, required: true },
      isShared: { type: Boolean, default: true },
      primaryOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }
  ],
  totalWeightage: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    enum: ["draft", "submitted", "approved", "rejected"],
    default: "draft"
  },
  locked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

module.exports = mongoose.model("GoalSheet", goalSheetSchema)
