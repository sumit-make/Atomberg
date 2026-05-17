const dotenv = require("dotenv")
const fs = require("fs")
const path = require("path")
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")
const connectDB = require("./config/db")
const User = require("./models/User")
const GoalSheet = require("./models/GoalSheet")
const CheckIn = require("./models/CheckIn")
const AuditLog = require("./models/AuditLog")

dotenv.config()

const DATA_PATH = path.join(__dirname, "data", "raw_data.json")

const load = async () => {
  await connectDB()

  if (!fs.existsSync(DATA_PATH)) {
    console.error("raw_data.json not found at", DATA_PATH)
    process.exit(1)
  }

  const raw = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"))

  // Clean collections
  await Promise.all([
    User.deleteMany({}),
    GoalSheet.deleteMany({}),
    CheckIn.deleteMany({}),
    AuditLog.deleteMany({})
  ])

  const emailToId = {}

  // Create users
  for (const u of raw.users || []) {
    const hashed = await bcrypt.hash(u.password || "password", 10)
    const user = await User.create({
      name: u.name,
      email: u.email,
      password: hashed,
      role: u.role || "employee"
    })
    emailToId[u.email] = user._id
  }

  // Set managerId relationships if specified
  for (const u of raw.users || []) {
    if (u.managerEmail && emailToId[u.email]) {
      await User.findByIdAndUpdate(emailToId[u.email], { managerId: emailToId[u.managerEmail] || null })
    }
  }

  // Create goal sheets
  for (const sheet of raw.goalSheets || []) {
    const empId = emailToId[sheet.employeeEmail]
    if (!empId) continue
    const goals = sheet.goals.map((g) => ({
      title: g.title,
      description: g.description,
      thrustArea: g.thrustArea,
      uomType: g.uomType,
      target: g.target,
      achievement: g.achievement || 0,
      weightage: g.weightage,
      status: g.status || "Not Started"
    }))
    const totalWeightage = goals.reduce((s, g) => s + (g.weightage || 0), 0)
    const created = await GoalSheet.create({
      employeeId: empId,
      goals,
      totalWeightage,
      status: sheet.status || "draft",
      locked: !!sheet.locked
    })
    // store mapping by employee email for checkins
    sheet._createdId = created._id
  }

  // Create checkins
  for (const ci of raw.checkIns || []) {
    const empId = emailToId[ci.employeeEmail]
    if (!empId) continue
    // find the latest goal sheet for employee
    const gs = await GoalSheet.findOne({ employeeId: empId })
    if (!gs) continue
    await CheckIn.create({
      goalSheetId: gs._id,
      employeeId: empId,
      comment: ci.comment,
      date: ci.date ? new Date(ci.date) : Date.now()
    })
  }

  // Create audit logs
  for (const a of raw.auditLogs || []) {
    const changedById = a.changedByEmail ? (emailToId[a.changedByEmail] || a.changedByEmail) : a.changedByEmail
    await AuditLog.create({
      action: a.action,
      changedBy: changedById || "system",
      oldValue: a.oldValue || {},
      newValue: a.newValue || {},
      createdAt: a.createdAt ? new Date(a.createdAt) : Date.now()
    })
  }

  console.log("Raw dataset loaded successfully.")
  process.exit(0)
}

load().catch((err) => {
  console.error(err)
  process.exit(1)
})
