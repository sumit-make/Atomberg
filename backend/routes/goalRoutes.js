const express = require("express")
const router = express.Router()
const auth = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const { createGoalSheet, getGoalSheet, submitGoals } = require("../controllers/goalController")

router.post("/", auth, roleMiddleware(["employee"]), createGoalSheet)
router.get("/", auth, roleMiddleware(["employee"]), getGoalSheet)
router.put("/submit/:id", auth, roleMiddleware(["employee"]), submitGoals)

module.exports = router
