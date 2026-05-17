import { useEffect, useState } from "react"
import API from "../services/api"

const ManagerProgressPage = () => {
  const [achievements, setAchievements] = useState([])
  const [trendData, setTrendData] = useState([])
  const [loading, setLoading] = useState(true)
  const [trendLoading, setTrendLoading] = useState(true)
  const [error, setError] = useState("")
  const [commentDrafts, setCommentDrafts] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        const [achRes, trendRes] = await Promise.all([
          API.get("/achievements/manager/team"),
          API.get("/achievements/manager/trends")
        ])
        setAchievements(achRes.data)
        setTrendData(trendRes.data)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load team achievements")
      } finally {
        setLoading(false)
        setTrendLoading(false)
      }
    }
    load()
  }, [])

  const saveComment = async (id) => {
    try {
      const managerComment = commentDrafts[id] || ""
      await API.put(`/achievements/${id}/comment`, { managerComment })
      setAchievements((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, managerComment, managerReviewedAt: new Date().toISOString() } : item
        )
      )
      setCommentDrafts((prev) => ({ ...prev, [id]: "" }))
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save comment")
    }
  }

  const renderProgress = (achievement) => {
    const value = achievement.achievementValue ?? 0
    const target = achievement.goalSheetId?.goals?.[achievement.goalIndex]?.target || 0
    const percent = target ? Math.min(100, Math.round((value / target) * 100)) : 0
    return `${value}/${target} (${percent}%)`
  }

  const renderTrendBar = (value) => (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${value}%` }} />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h1 className="text-2xl font-semibold">Team Progress</h1>
            <p className="mt-2 text-slate-600">View current quarter achievement updates and add manager feedback.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Tracked goals</p>
              <p className="mt-2 text-3xl font-semibold">{achievements.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Latest average</p>
              <p className="mt-2 text-3xl font-semibold">
                {trendData.length ? `${trendData[trendData.length - 1].averagePercent}%` : "—"}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">On track ratio</p>
              <p className="mt-2 text-3xl font-semibold">
                {trendData.length ? `${trendData[trendData.length - 1].onTrackRate}%` : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Quarterly trend</h2>
            <p className="mt-1 text-sm text-slate-500">Average achievement rate by quarter.</p>
          </div>
          {!trendLoading && trendData.length === 0 && <span className="text-sm text-slate-500">No historical trend data available.</span>}
        </div>
        <div className="mt-5 space-y-4">
          {trendLoading ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Loading trend data...</div>
          ) : (
            trendData.map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-900">{item.label}</span>
                  <span className="text-sm text-slate-600">{item.averagePercent}%</span>
                </div>
                <div className="mt-3">{renderTrendBar(item.averagePercent)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">Loading team progress...</div>
      ) : achievements.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">No team achievements found for the current quarter.</div>
      ) : (
        <div className="space-y-4">
          {achievements.map((achievement) => {
            const goal = achievement.goalSheetId?.goals?.[achievement.goalIndex] || {}
            return (
              <div key={achievement._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-slate-500">Employee</p>
                    <h2 className="text-xl font-semibold">{achievement.employeeId?.name || "Unknown"}</h2>
                    <p className="text-sm text-slate-500">{achievement.employeeId?.email}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                    {achievement.period} {achievement.year}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm uppercase tracking-wide text-slate-500">Goal</p>
                    <h3 className="mt-2 font-semibold text-slate-900">{goal.title || "Goal detail unavailable"}</h3>
                    <p className="mt-2 text-sm text-slate-600">{goal.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>Thrust: {goal.thrustArea}</span>
                      <span>UoM: {goal.uomType}</span>
                      <span>Target: {goal.target}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm uppercase tracking-wide text-slate-500">Achievement</p>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs uppercase tracking-wide text-slate-700">
                        {achievement.status}
                      </span>
                    </div>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{renderProgress(achievement)}</p>
                    <p className="mt-2 text-sm text-slate-500">Manager comment:</p>
                    <p className="mt-1 text-sm text-slate-700">{achievement.managerComment || "No feedback yet."}</p>
                    <textarea
                      value={commentDrafts[achievement._id] || ""}
                      onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [achievement._id]: e.target.value }))}
                      placeholder="Add manager review comment"
                      className="mt-4 h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
                    />
                    <button
                      onClick={() => saveComment(achievement._id)}
                      className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                    >
                      Save Comment
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ManagerProgressPage
