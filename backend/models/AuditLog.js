const mongoose = require("mongoose")

const auditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  changedBy: { type: String, required: true },
  oldValue: { type: Object, default: {} },
  newValue: { type: Object, default: {} },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("AuditLog", auditSchema)
