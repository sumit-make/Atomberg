const express = require("express")
const router = express.Router()
const auth = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const { createSharedGoal, getSharedGoalsForEmployee, getSharedGoals, updateSharedGoalWeightage, updateSharedGoalAchievement } = require("../controllers/sharedGoalController")

router.post("/", auth, roleMiddleware(["admin", "manager"]), createSharedGoal)
router.get("/all", auth, roleMiddleware(["admin", "manager"]), getSharedGoals)
router.get("/", auth, roleMiddleware(["employee"]), getSharedGoalsForEmployee)
router.put("/:id/weightage", auth, roleMiddleware(["employee"]), updateSharedGoalWeightage)
router.put("/:id/achievement", auth, roleMiddleware(["employee"]), updateSharedGoalAchievement)

module.exports = router
