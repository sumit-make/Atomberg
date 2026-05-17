const dotenv = require("dotenv")
const bcrypt = require("bcryptjs")
const connectDB = require("./config/db")
const User = require("./models/User")
const GoalSheet = require("./models/GoalSheet")
const CheckIn = require("./models/CheckIn")
const AuditLog = require("./models/AuditLog")

dotenv.config()

const seed = async () => {
  await connectDB()

  await Promise.all([
    User.deleteMany({}),
    GoalSheet.deleteMany({}),
    CheckIn.deleteMany({}),
    AuditLog.deleteMany({})
  ])

  const adminPassword = await bcrypt.hash("Admin@123", 10)
  const managerPassword = await bcrypt.hash("Manager@123", 10)
  const employeePassword = await bcrypt.hash("Employee@123", 10)

  const admin = await User.create({
    name: "AtomQuest Admin",
    email: "admin@atomquest.com",
    password: adminPassword,
    role: "admin"
  })

  const manager = await User.create({
    name: "Genesis Manager",
    email: "manager@atomquest.com",
    password: managerPassword,
    role: "manager"
  })

  const employee = await User.create({
    name: "Nova Employee",
    email: "employee@atomquest.com",
    password: employeePassword,
    role: "employee",
    managerId: manager._id
  })

  const goalSheet = await GoalSheet.create({
    employeeId: employee._id,
    goals: [
      {
        title: "Improve user onboarding",
        description: "Add guided walkthrough and improve retention metrics.",
        thrustArea: "User Experience",
        uomType: "Completion",
        target: 5,
        achievement: 1,
        weightage: 50,
        status: "In Progress"
      },
      {
        title: "Reduce ticket cycle time",
        description: "Optimize support flow to close issues faster.",
        thrustArea: "Operations",
        uomType: "Days",
        target: 30,
        achievement: 10,
        weightage: 50,
        status: "Not Started"
      }
    ],
    totalWeightage: 100,
    status: "submitted",
    locked: false
  })

  await CheckIn.create({
    goalSheetId: goalSheet._id,
    employeeId: employee._id,
    comment: "Completed initial planning and identified the top two workstreams."
  })

  await AuditLog.create({
    action: "Seed data created",
    changedBy: "system",
    oldValue: {},
    newValue: { admin: admin.email, manager: manager.email, employee: employee.email }
  })

  console.log("Seed data created successfully.")
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
