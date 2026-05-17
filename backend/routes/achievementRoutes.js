const express = require("express")
const router = express.Router()
const auth = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const {
  submitAchievement,
  getAchievements,
  addManagerComment,
  getTeamAchievements,
  getManagerTrendData,
  getAdminTrendData,
  getCompletionDashboard,
  exportAchievementReport
} = require("../controllers/achievementController")

router.post("/submit", auth, roleMiddleware(["employee"]), submitAchievement)
router.get("/", auth, roleMiddleware(["employee"]), getAchievements)
router.put("/:achievementId/comment", auth, roleMiddleware(["manager"]), addManagerComment)
router.get("/manager/team", auth, roleMiddleware(["manager"]), getTeamAchievements)
router.get("/manager/trends", auth, roleMiddleware(["manager"]), getManagerTrendData)
router.get("/admin/completion", auth, roleMiddleware(["admin"]), getCompletionDashboard)
router.get("/admin/trends", auth, roleMiddleware(["admin"]), getAdminTrendData)
router.get("/report/export", auth, roleMiddleware(["admin"]), exportAchievementReport)

module.exports = router
