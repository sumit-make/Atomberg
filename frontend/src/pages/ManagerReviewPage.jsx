import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import API from "../services/api"

const ManagerReviewPage = () => {
  const [sheets, setSheets] = useState([])
  const [teamAchievements, setTeamAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadSheets = async () => {
    setError("")
    try {
      const [sheetRes, achievementRes] = await Promise.all([
        API.get("/manager/submitted"),
        API.get("/achievements/manager/team")
      ])
      setSheets(sheetRes.data)
      setTeamAchievements(achievementRes.data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load review data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSheets()
  }, [])

  const achievementSummary = useMemo(() => {
    if (teamAchievements.length === 0) {
      return { tracked: 0, averagePercent: 0, onTrack: 0 }
    }

    const total = teamAchievements.length
    const tracked = teamAchievements.filter((item) => item.achievementValue != null).length
    const percentSum = teamAchievements.reduce((sum, item) => {
      const target = item.goalSheetId?.goals?.[item.goalIndex]?.target || 0
      const value = item.achievementValue || 0
      return sum + (target ? Math.min(100, Math.round((value / target) * 100)) : 0)
    }, 0)
    const onTrack = teamAchievements.filter((item) => item.status === "On Track" || item.status === "Completed").length

    return {
      tracked,
      averagePercent: total ? Math.round(percentSum / total) : 0,
      onTrack
    }
  }, [teamAchievements])

  const handleAction = async (id, action) => {
    const label = action === "approve" ? "approve" : "reject"
    if (!window.confirm(`Are you sure you want to ${label} this sheet?`)) return

    try {
      await API.put(`/manager/${action}/${id}`)
      setSheets((prev) => prev.filter((sheet) => sheet._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || "Action failed")
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Goal Review</h1>
            <p className="mt-2 text-slate-600">Approve or reject employee goal sheets and keep quarterly planning aligned.</p>
          </div>
          <Link
            to="/manager/progress"
            className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            View Team Progress
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Goals tracked</p>
          <p className="mt-3 text-3xl font-semibold">{achievementSummary.tracked}</p>
          <p className="mt-2 text-sm text-slate-500">achievement entries this quarter</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Average attainment</p>
          <p className="mt-3 text-3xl font-semibold">{achievementSummary.averagePercent}%</p>
          <p className="mt-2 text-sm text-slate-500">across tracked objectives</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">On Track</p>
          <p className="mt-3 text-3xl font-semibold">{achievementSummary.onTrack}</p>
          <p className="mt-2 text-sm text-slate-500">entries marked on track or complete</p>
        </div>
      </div>

      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">Loading review queue...</div>
      ) : sheets.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">No submitted goal sheets available for review.</div>
      ) : (
        <div className="grid gap-4">
          {sheets.map((sheet) => (
            <div key={sheet._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-500">Employee</p>
                  <h2 className="text-xl font-semibold">{sheet.employeeId?.name || "Unknown"}</h2>
                  <p className="text-sm text-slate-500">{sheet.employeeId?.email}</p>
                </div>
                <div className="grid gap-2 sm:auto-cols-max sm:grid-flow-col">
                  <button
                    onClick={() => handleAction(sheet._id, "approve")}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(sheet._id, "reject")}
                    className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {sheet.goals.map((goal, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold">{goal.title}</h3>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        {goal.weightage}%
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{goal.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>Thrust: {goal.thrustArea}</span>
                      <span>UoM: {goal.uomType}</span>
                      <span>Target: {goal.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ManagerReviewPage
