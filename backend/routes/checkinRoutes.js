const express = require("express")
const router = express.Router()
const auth = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")
const { createCheckIn } = require("../controllers/checkinController")

router.post("/", auth, roleMiddleware(["employee"]), createCheckIn)

module.exports = router
