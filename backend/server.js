const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const connectDB = require("./config/db")

dotenv.config()
connectDB()

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/goals", require("./routes/goalRoutes"))
app.use("/api/manager", require("./routes/managerRoutes"))
app.use("/api/admin", require("./routes/adminRoutes"))
app.use("/api/checkins", require("./routes/checkinRoutes"))
app.use("/api/achievements", require("./routes/achievementRoutes"))
app.use("/api/shared-goals", require("./routes/sharedGoalRoutes"))

app.get("/", (req, res) => {
  res.send({ status: "ok", message: "AtomQuest backend is running" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
