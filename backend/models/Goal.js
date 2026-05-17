const mongoose = require("mongoose")

const goalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  thrustArea: { type: String, default: "General" },
  uomType: { type: String, default: "Number" },
  target: { type: Number, required: true },
  achievement: { type: Number, default: 0 },
  weightage: { type: Number, required: true },
  status: { type: String, default: "Not Started" }
}, {
  timestamps: true
})

module.exports = mongoose.model("Goal", goalSchema)
