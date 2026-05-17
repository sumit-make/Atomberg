const mongoose = require("mongoose")

const cycleWindowSchema = new mongoose.Schema({
  label: { type: String, required: true },
  startMonth: { type: Number, required: true },
  startDay: { type: Number, required: true },
  endMonth: { type: Number, required: true },
  endDay: { type: Number, required: true },
  allows: [{ type: String, required: true }]
}, { _id: false })

const cycleConfigSchema = new mongoose.Schema({
  windows: [cycleWindowSchema]
}, { timestamps: true })

module.exports = mongoose.model("CycleConfig", cycleConfigSchema)
