import { useEffect, useState } from "react"
import API from "../services/api"

const SharedGoalsPage = () => {
  const [sharedGoals, setSharedGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [savingId, setSavingId] = useState(null)
  const [savingAchievementId, setSavingAchievementId] = useState(null)
  const [achievementInputs, setAchievementInputs] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/shared-goals")
        setSharedGoals(data)
        setAchievementInputs(data.reduce((acc, goal) => ({ ...acc, [goal._id]: goal.achievement || 0 }), {}))
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load shared goals")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleWeightageChange = (id, value) => {
    setSharedGoals((prev) => prev.map((goal) => (goal._id === id ? { ...goal, weightage: Number(value) } : goal)))
  }

  const handleAchievementChange = (id, value) => {
    setAchievementInputs((prev) => ({ ...prev, [id]: Number(value) }))
  }

  const handleSaveWeightage = async (goal) => {
    setSavingId(goal._id)
    try {
      await API.put(`/shared-goals/${goal._id}/weightage`, { weightage: goal.weightage })
      setError("")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save shared goal")
    } finally {
      setSavingId(null)
    }
  }

  const handleSaveAchievement = async (goal) => {
    setSavingAchievementId(goal._id)
    try {
      const { data } = await API.put(`/shared-goals/${goal._id}/achievement`, { achievement: achievementInputs[goal._id] })
      setSharedGoals((prev) => prev.map((item) => (item._id === goal._id ? { ...item, achievement: data.achievement } : item)))
      setError("")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update achievement")
    } finally {
      setSavingAchievementId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Shared Goals</h1>
        <p className="mt-2 text-slate-600">Review shared KPIs assigned by your manager or admin.</p>
      </div>

      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">Loading shared goals...</div>
      ) : sharedGoals.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">No shared goals assigned to you.</div>
      ) : (
        <div className="space-y-4">
          {sharedGoals.map((goal) => (
            <div key={goal._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{goal.title}</h2>
                  <p className="mt-2 text-sm text-slate-600">{goal.description}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Shared KPI
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-wide text-slate-500">Thrust Area</p>
                  <p className="mt-2 text-slate-900">{goal.thrustArea}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-wide text-slate-500">UoM</p>
                  <p className="mt-2 text-slate-900">{goal.uomType}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm uppercase tracking-wide text-slate-500">Target</p>
                  <p className="mt-2 text-slate-900">{goal.target}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Weightage</label>
                  <input
                    type="number"
                    value={goal.weightage}
                    onChange={(e) => handleWeightageChange(goal._id, e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    min="10"
                    max="100"
                  />
                </div>
                <button
                  onClick={() => handleSaveWeightage(goal)}
                  disabled={savingId === goal._id}
                  className="mt-6 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                >
                  {savingId === goal._id ? "Saving..." : "Save Weightage"}
                </button>
              </div>

              {goal.isPrimaryOwner ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Achievement</label>
                    <input
                      type="number"
                      value={achievementInputs[goal._id] ?? 0}
                      onChange={(e) => handleAchievementChange(goal._id, e.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleSaveAchievement(goal)}
                    disabled={savingAchievementId === goal._id}
                    className="mt-6 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {savingAchievementId === goal._id ? "Saving..." : "Sync Achievement"}
                  </button>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Shared achievement is controlled by the primary owner.</p>
                  <p className="mt-2 text-slate-900">Current achievement: {goal.achievement ?? 0}</p>
                </div>
              )}

              <p className="mt-4 text-xs text-slate-500">Title and target are read-only for shared goals.</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SharedGoalsPage