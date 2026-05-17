import { useEffect, useState } from "react"
import API from "../services/api"
import GoalCard from "../components/GoalCard"
import ProgressBar from "../components/ProgressBar"

const EmployeeDashboard = () => {
  const [sheet, setSheet] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/goals")
        if (!data || Array.isArray(data) || typeof data !== "object") {
          setSheet(null)
          return
        }
        setSheet(data)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load goal sheet")
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Employee Dashboard</h1>
        {sheet ? (
          <div className="mt-4">
            <p className="text-sm text-slate-600">Status: {sheet.status}</p>
            <div className="mt-3">
              <span className="text-sm text-slate-500">Progress</span>
              <ProgressBar value={sheet.progress || 0} />
              <p className="mt-2 text-sm text-slate-700">{sheet.progress || 0}% completed</p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-slate-600">No goal sheet found yet.</p>
        )}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sheet?.goals?.map((goal) => (
          <GoalCard key={goal._id || goal.title} goal={goal} />
        ))}
      </div>
    </div>
  )
}

export default EmployeeDashboard
