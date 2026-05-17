const express = require("express")
const router = express.Router()
const auth = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const { getSubmittedGoals, approveGoals, rejectGoals, editGoalsInline } = require("../controllers/managerController")

router.get("/submitted", auth, roleMiddleware(["manager"]), getSubmittedGoals)
router.put("/approve/:id", auth, roleMiddleware(["manager"]), approveGoals)
router.put("/reject/:id", auth, roleMiddleware(["manager"]), rejectGoals)
router.put("/edit/:id", auth, roleMiddleware(["manager"]), editGoalsInline)

module.exports = router
