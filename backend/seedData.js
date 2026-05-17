const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const User = require("./models/User")
const GoalSheet = require("./models/GoalSheet")
const SharedGoal = require("./models/SharedGoal")
const Achievement = require("./models/Achievement")
const AuditLog = require("./models/AuditLog")

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/atomquest")
    console.log("✓ Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await GoalSheet.deleteMany({})
    await SharedGoal.deleteMany({})
    await Achievement.deleteMany({})
    await AuditLog.deleteMany({})
    console.log("✓ Cleared existing data")

    // Create Admin User
    const admin = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: await bcrypt.hash("Admin@123", 10),
      role: "admin"
    })
    console.log("✓ Created admin:", admin.email)

    // Create Managers
    const manager1 = await User.create({
      name: "Alice Manager",
      email: "alice.manager@test.com",
      password: await bcrypt.hash("Manager@123", 10),
      role: "manager"
    })

    const manager2 = await User.create({
      name: "Bob Manager",
      email: "bob.manager@test.com",
      password: await bcrypt.hash("Manager@123", 10),
      role: "manager"
    })
    console.log("✓ Created managers:", manager1.email, manager2.email)

    // Create Employees
    const employees = await User.create([
      {
        name: "John Employee",
        email: "john.emp@test.com",
        password: await bcrypt.hash("Emp@123", 10),
        role: "employee",
        managerId: manager1._id
      },
      {
        name: "Sarah Employee",
        email: "sarah.emp@test.com",
        password: await bcrypt.hash("Emp@123", 10),
        role: "employee",
        managerId: manager1._id
      },
      {
        name: "Mike Employee",
        email: "mike.emp@test.com",
        password: await bcrypt.hash("Emp@123", 10),
        role: "employee",
        managerId: manager1._id
      },
      {
        name: "Emma Employee",
        email: "emma.emp@test.com",
        password: await bcrypt.hash("Emp@123", 10),
        role: "employee",
        managerId: manager2._id
      },
      {
        name: "David Employee",
        email: "david.emp@test.com",
        password: await bcrypt.hash("Emp@123", 10),
        role: "employee",
        managerId: manager2._id
      }
    ])
    console.log("✓ Created 5 employees")

    // Create individual goal sheets with personal goals
    const goalSheets = await GoalSheet.create([
      {
        employeeId: employees[0]._id,
        goals: [
          {
            title: "Increase Sales by 20%",
            description: "Drive revenue growth in Q1",
            thrustArea: "Sales",
            uomType: "Numeric",
            target: 50000,
            weightage: 40,
            status: "submitted"
          },
          {
            title: "Customer Satisfaction Score",
            description: "Maintain 90% customer satisfaction",
            thrustArea: "Customer Success",
            uomType: "%",
            target: 90,
            weightage: 30,
            status: "submitted"
          },
          {
            title: "Process Optimization",
            description: "Reduce processing time by 15%",
            thrustArea: "Operations",
            uomType: "Numeric",
            target: 15,
            weightage: 30,
            status: "submitted"
          }
        ],
        sharedGoals: [],
        totalWeightage: 100,
        status: "submitted",
        locked: false
      },
      {
        employeeId: employees[1]._id,
        goals: [
          {
            title: "Launch New Feature",
            description: "Complete Q1 product feature launch",
            thrustArea: "Product",
            uomType: "Timeline",
            target: 1,
            weightage: 50,
            status: "submitted"
          },
          {
            title: "Code Quality Improvement",
            description: "Reduce bugs by 25%",
            thrustArea: "Engineering",
            uomType: "%",
            target: 25,
            weightage: 50,
            status: "submitted"
          }
        ],
        sharedGoals: [],
        totalWeightage: 100,
        status: "submitted",
        locked: false
      },
      {
        employeeId: employees[2]._id,
        goals: [
          {
            title: "Team Training Program",
            description: "Complete 40 hours of training",
            thrustArea: "Learning & Development",
            uomType: "Numeric",
            target: 40,
            weightage: 40,
            status: "submitted"
          },
          {
            title: "Project Delivery",
            description: "Deliver Q1 roadmap on schedule",
            thrustArea: "Delivery",
            uomType: "Timeline",
            target: 1,
            weightage: 60,
            status: "submitted"
          }
        ],
        sharedGoals: [],
        totalWeightage: 100,
        status: "submitted",
        locked: false
      },
      {
        employeeId: employees[3]._id,
        goals: [
          {
            title: "Market Research",
            description: "Complete competitive analysis",
            thrustArea: "Strategy",
            uomType: "Timeline",
            target: 1,
            weightage: 45,
            status: "draft"
          },
          {
            title: "Brand Awareness",
            description: "Increase brand mentions by 30%",
            thrustArea: "Marketing",
            uomType: "%",
            target: 30,
            weightage: 55,
            status: "draft"
          }
        ],
        sharedGoals: [],
        totalWeightage: 100,
        status: "draft",
        locked: false
      },
      {
        employeeId: employees[4]._id,
        goals: [
          {
            title: "Budget Management",
            description: "Keep spending within 5% of budget",
            thrustArea: "Finance",
            uomType: "%",
            target: 5,
            weightage: 50,
            status: "submitted"
          },
          {
            title: "Audit Compliance",
            description: "Pass internal audit with zero findings",
            thrustArea: "Compliance",
            uomType: "Zero-based",
            target: 0,
            weightage: 50,
            status: "submitted"
          }
        ],
        sharedGoals: [],
        totalWeightage: 100,
        status: "submitted",
        locked: false
      }
    ])
    console.log("✓ Created 5 goal sheets with personal goals")

    // Create shared goals
    const sharedGoal1 = await SharedGoal.create({
      title: "Q1 Revenue Target",
      description: "Departmental KPI to achieve Q1 revenue target of $500k",
      thrustArea: "Sales",
      uomType: "Numeric",
      target: 500000,
      weightage: 25,
      createdByAdmin: manager1._id,
      primaryOwner: employees[0]._id,
      recipientEmployees: [employees[0]._id, employees[1]._id, employees[2]._id],
      recipientProgress: [
        {
          employeeId: employees[0]._id,
          weightage: 25,
          achievement: 350000,
          isPrimaryOwner: true,
          updatedAt: new Date()
        },
        {
          employeeId: employees[1]._id,
          weightage: 25,
          achievement: 350000,
          isPrimaryOwner: false,
          updatedAt: new Date()
        },
        {
          employeeId: employees[2]._id,
          weightage: 25,
          achievement: 350000,
          isPrimaryOwner: false,
          updatedAt: new Date()
        }
      ],
      readOnly: true
    })

    const sharedGoal2 = await SharedGoal.create({
      title: "Customer Satisfaction Initiative",
      description: "Achieve 95% customer satisfaction rating across all teams",
      thrustArea: "Customer Success",
      uomType: "%",
      target: 95,
      weightage: 20,
      createdByAdmin: manager1._id,
      primaryOwner: employees[1]._id,
      recipientEmployees: [employees[0]._id, employees[1]._id],
      recipientProgress: [
        {
          employeeId: employees[0]._id,
          weightage: 20,
          achievement: 92,
          isPrimaryOwner: false,
          updatedAt: new Date()
        },
        {
          employeeId: employees[1]._id,
          weightage: 20,
          achievement: 92,
          isPrimaryOwner: true,
          updatedAt: new Date()
        }
      ],
      readOnly: true
    })

    const sharedGoal3 = await SharedGoal.create({
      title: "Digital Transformation",
      description: "Implement new digital tools and process automation",
      thrustArea: "Operations",
      uomType: "Timeline",
      target: 1,
      weightage: 30,
      createdByAdmin: manager2._id,
      primaryOwner: employees[3]._id,
      recipientEmployees: [employees[3]._id, employees[4]._id],
      recipientProgress: [
        {
          employeeId: employees[3]._id,
          weightage: 30,
          achievement: 0.75,
          isPrimaryOwner: true,
          updatedAt: new Date()
        },
        {
          employeeId: employees[4]._id,
          weightage: 30,
          achievement: 0.75,
          isPrimaryOwner: false,
          updatedAt: new Date()
        }
      ],
      readOnly: true
    })

    console.log("✓ Created 3 shared goals")

    // Update goal sheets with shared goals
    await GoalSheet.updateOne(
      { employeeId: employees[0]._id },
      {
        sharedGoals: [
          {
            sharedGoalId: sharedGoal1._id,
            title: sharedGoal1.title,
            description: sharedGoal1.description,
            thrustArea: sharedGoal1.thrustArea,
            uomType: sharedGoal1.uomType,
            target: sharedGoal1.target,
            achievement: 350000,
            weightage: 25,
            isShared: true,
            primaryOwner: sharedGoal1.primaryOwner
          },
          {
            sharedGoalId: sharedGoal2._id,
            title: sharedGoal2.title,
            description: sharedGoal2.description,
            thrustArea: sharedGoal2.thrustArea,
            uomType: sharedGoal2.uomType,
            target: sharedGoal2.target,
            achievement: 92,
            weightage: 20,
            isShared: true,
            primaryOwner: sharedGoal2.primaryOwner
          }
        ]
      }
    )

    await GoalSheet.updateOne(
      { employeeId: employees[1]._id },
      {
        sharedGoals: [
          {
            sharedGoalId: sharedGoal1._id,
            title: sharedGoal1.title,
            description: sharedGoal1.description,
            thrustArea: sharedGoal1.thrustArea,
            uomType: sharedGoal1.uomType,
            target: sharedGoal1.target,
            achievement: 350000,
            weightage: 25,
            isShared: true,
            primaryOwner: sharedGoal1.primaryOwner
          },
          {
            sharedGoalId: sharedGoal2._id,
            title: sharedGoal2.title,
            description: sharedGoal2.description,
            thrustArea: sharedGoal2.thrustArea,
            uomType: sharedGoal2.uomType,
            target: sharedGoal2.target,
            achievement: 92,
            weightage: 20,
            isShared: true,
            primaryOwner: sharedGoal2.primaryOwner
          }
        ]
      }
    )

    await GoalSheet.updateOne(
      { employeeId: employees[2]._id },
      {
        sharedGoals: [
          {
            sharedGoalId: sharedGoal1._id,
            title: sharedGoal1.title,
            description: sharedGoal1.description,
            thrustArea: sharedGoal1.thrustArea,
            uomType: sharedGoal1.uomType,
            target: sharedGoal1.target,
            achievement: 350000,
            weightage: 25,
            isShared: true,
            primaryOwner: sharedGoal1.primaryOwner
          }
        ]
      }
    )

    await GoalSheet.updateOne(
      { employeeId: employees[3]._id },
      {
        sharedGoals: [
          {
            sharedGoalId: sharedGoal3._id,
            title: sharedGoal3.title,
            description: sharedGoal3.description,
            thrustArea: sharedGoal3.thrustArea,
            uomType: sharedGoal3.uomType,
            target: sharedGoal3.target,
            achievement: 0.75,
            weightage: 30,
            isShared: true,
            primaryOwner: sharedGoal3.primaryOwner
          }
        ]
      }
    )

    await GoalSheet.updateOne(
      { employeeId: employees[4]._id },
      {
        sharedGoals: [
          {
            sharedGoalId: sharedGoal3._id,
            title: sharedGoal3.title,
            description: sharedGoal3.description,
            thrustArea: sharedGoal3.thrustArea,
            uomType: sharedGoal3.uomType,
            target: sharedGoal3.target,
            achievement: 0.75,
            weightage: 30,
            isShared: true,
            primaryOwner: sharedGoal3.primaryOwner
          }
        ]
      }
    )

    console.log("✓ Synced shared goals to employee goal sheets")

    // Create achievements for Q1
    const achievements = await Achievement.create([
      {
        goalSheetId: goalSheets[0]._id,
        employeeId: employees[0]._id,
        goalIndex: 0,
        period: "Q1",
        year: 2026,
        achievementValue: 42000,
        status: "Completed",
        comment: "Good progress on sales targets"
      },
      {
        goalSheetId: goalSheets[0]._id,
        employeeId: employees[0]._id,
        goalIndex: 1,
        period: "Q1",
        year: 2026,
        achievementValue: 88,
        status: "On Track",
        comment: "Slightly below target due to seasonal factors"
      },
      {
        goalSheetId: goalSheets[1]._id,
        employeeId: employees[1]._id,
        goalIndex: 0,
        period: "Q1",
        year: 2026,
        achievementValue: 1,
        status: "Completed",
        comment: "Feature launched successfully"
      },
      {
        goalSheetId: goalSheets[2]._id,
        employeeId: employees[2]._id,
        goalIndex: 0,
        period: "Q1",
        year: 2026,
        achievementValue: 35,
        status: "On Track",
        comment: "5 training sessions completed, 5 more pending"
      },
      {
        goalSheetId: goalSheets[4]._id,
        employeeId: employees[4]._id,
        goalIndex: 0,
        period: "Q1",
        year: 2026,
        achievementValue: 3,
        status: "On Track",
        comment: "Within budget range so far"
      }
    ])

    console.log("✓ Created 5 achievements for Q1")

    // Create audit logs
    await AuditLog.create([
      {
        action: "Goal submission",
        changedBy: employees[0]._id,
        oldValue: { status: "draft" },
        newValue: { status: "submitted" }
      },
      {
        action: "Goal approval",
        changedBy: manager1._id,
        oldValue: { status: "submitted" },
        newValue: { status: "approved" }
      },
      {
        action: "Create shared goal",
        changedBy: manager1._id,
        oldValue: null,
        newValue: { title: sharedGoal1.title, recipients: 3 }
      },
      {
        action: "Update achievement",
        changedBy: employees[0]._id,
        oldValue: { value: 35000 },
        newValue: { value: 42000 }
      }
    ])

    console.log("✓ Created audit logs")

    console.log("\n" + "=".repeat(50))
    console.log("✅ DATABASE SEEDING COMPLETE!")
    console.log("=".repeat(50))
    console.log("\nTest Credentials:\n")
    console.log("ADMIN:")
    console.log("  Email: admin@test.com")
    console.log("  Password: Admin@123\n")
    console.log("MANAGERS:")
    console.log("  Email: alice.manager@test.com")
    console.log("  Password: Manager@123")
    console.log("  Email: bob.manager@test.com")
    console.log("  Password: Manager@123\n")
    console.log("EMPLOYEES:")
    console.log("  Email: john.emp@test.com")
    console.log("  Email: sarah.emp@test.com")
    console.log("  Email: mike.emp@test.com")
    console.log("  Email: emma.emp@test.com")
    console.log("  Email: david.emp@test.com")
    console.log("  Password: Emp@123 (for all)\n")
    console.log("DATA CREATED:")
    console.log("  ✓ 1 Admin user")
    console.log("  ✓ 2 Manager users")
    console.log("  ✓ 5 Employee users")
    console.log("  ✓ 5 Goal sheets with personal goals")
    console.log("  ✓ 3 Shared goals (KPIs)")
    console.log("  ✓ 5 Achievements for Q1")
    console.log("  ✓ 4 Audit log entries")
    console.log("=".repeat(50) + "\n")

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error("❌ Seeding failed:", error.message)
    process.exit(1)
  }
}

seedDatabase()
