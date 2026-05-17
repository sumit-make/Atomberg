import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

const AchievementTrackingPage = () => {
  const [goalSheet, setGoalSheet] = useState(null)
  const [achievements, setAchievements] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const { data: sheet } = await API.get("/goals")
        setGoalSheet(sheet)

        const { data: achs } = await API.get("/achievements")
        const achsByIndex = {}
        achs.forEach((a) => {
          achsByIndex[a.goalIndex] = a
        })
        setAchievements(achsByIndex)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleUpdate = async (goalIndex) => {
    setSaving(true)
    try {
      const ach = achievements[goalIndex]
      await API.post("/achievements/submit", {
        goalSheetId: goalSheet._id,
        goalIndex,
        achievementValue: ach?.achievementValue || 0,
        status: ach?.status || "Not Started",
        comment: ach?.comment || ""
      })
      setError("")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleFieldChange = (goalIndex, field, value) => {
    setAchievements((prev) => ({
      ...prev,
      [goalIndex]: { ...prev[goalIndex], [field]: value }
    }))
  }

  if (loading) {
    return <div className="rounded-xl bg-white p-6 shadow-sm">Loading achievements...</div>
  }

  if (!goalSheet) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p>No goal sheet found. Create goals first.</p>
        <button onClick={() => navigate("/goals")} className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-white">
          Create Goals
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Achievement Tracking</h1>
        <p className="mt-2 text-slate-600">Log your quarterly progress against planned targets.</p>
      </div>

      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <div className="space-y-4">
        {goalSheet.goals?.map((goal, index) => {
          const ach = achievements[index] || {}
          return (
            <div key={index} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{goal.title}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                  {goal.weightage}% Weight
                </span>
              </div>
              <p className="mb-4 text-sm text-slate-600">{goal.description}</p>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Target</label>
                  <input
                    type="number"
                    value={goal.target}
                    disabled
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Achievement</label>
                  <input
                    type="number"
                    value={ach.achievementValue || 0}
                    onChange={(e) => handleFieldChange(index, "achievementValue", parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Status</label>
                  <select
                    value={ach.status || "Not Started"}
                    onChange={(e) => handleFieldChange(index, "status", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="On Track">On Track</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Comment</label>
                  <input
                    type="text"
                    value={ach.comment || ""}
                    onChange={(e) => handleFieldChange(index, "comment", e.target.value)}
                    placeholder="Add a comment"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={() => handleUpdate(index)}
                disabled={saving}
                className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Progress"}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AchievementTrackingPage
