const express = require("express")
const router = express.Router()
const auth = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const { getUsers, getAllGoalSheets, unlockGoalSheet, getAuditLogs, getCycleConfig, updateCycleConfig } = require("../controllers/adminController")

router.get("/users", auth, roleMiddleware(["admin"]), getUsers)
router.get("/goals", auth, roleMiddleware(["admin"]), getAllGoalSheets)
router.put("/goals/unlock/:id", auth, roleMiddleware(["admin"]), unlockGoalSheet)
router.get("/audit-logs", auth, roleMiddleware(["admin"]), getAuditLogs)
router.get("/cycle-config", auth, roleMiddleware(["admin"]), getCycleConfig)
router.put("/cycle-config", auth, roleMiddleware(["admin"]), updateCycleConfig)

module.exports = router
