const mongoose = require("mongoose")

const recipientProgressSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  weightage: { type: Number, required: true },
  achievement: { type: Number, default: 0 },
  isPrimaryOwner: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false })

const sharedGoalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  thrustArea: { type: String, required: true },
  uomType: { type: String, required: true },
  target: { type: Number, required: true },
  weightage: { type: Number, required: true },
  createdByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  primaryOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recipientEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  recipientProgress: [recipientProgressSchema],
  readOnly: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })

module.exports = mongoose.model("SharedGoal", sharedGoalSchema)
