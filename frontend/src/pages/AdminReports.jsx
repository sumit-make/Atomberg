import { useEffect, useState } from "react"
import API from "../services/api"

const AdminReports = () => {
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [summary, setSummary] = useState({ average: 0, completed: 0, pending: 0, noSheet: 0 })

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const { data } = await API.get("/achievements/admin/completion")
        const completed = data.filter((item) => item.completionPercentage === 100).length
        const pending = data.filter((item) => item.completionPercentage > 0 && item.completionPercentage < 100).length
        const noSheet = data.filter((item) => item.goalSheetStatus === "no_sheet").length
        const average = data.length ? Math.round(data.reduce((sum, item) => sum + item.completionPercentage, 0) / data.length) : 0
        setSummary({ average, completed, pending, noSheet })
      } catch (err) {
        // ignore summary failure to keep page usable
      }
    }
    loadSummary()
  }, [])

  const exportReport = async () => {
    setError("")
    setMessage("")
    try {
      const response = await API.get("/achievements/report/export", { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "achievement_report.csv")
      document.body.appendChild(link)
      link.click()
      link.remove()
      setMessage("Report downloaded successfully.")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to export report")
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="mt-2 text-slate-600">Download achievement performance reports for the current quarter.</p>
      </div>

      {message && <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Quarter average</p>
          <p className="mt-3 text-3xl font-semibold">{summary.average}%</p>
          <p className="mt-2 text-sm text-slate-500">progress across team scorecards</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Full completion</p>
          <p className="mt-3 text-3xl font-semibold">{summary.completed}</p>
          <p className="mt-2 text-sm text-slate-500">employees at 100%</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">In progress</p>
          <p className="mt-3 text-3xl font-semibold">{summary.pending}</p>
          <p className="mt-2 text-sm text-slate-500">employees with partial updates</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Missing sheets</p>
          <p className="mt-3 text-3xl font-semibold">{summary.noSheet}</p>
          <p className="mt-2 text-sm text-slate-500">employees without a goal sheet</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Quarterly reports</p>
            <h2 className="text-xl font-semibold">Achievement Export</h2>
            <p className="mt-2 text-sm text-slate-500">Export goals, progress, and manager comments into CSV format.</p>
          </div>
          <button
            onClick={exportReport}
            className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        <h3 className="font-semibold text-slate-900">How it works</h3>
        <p className="mt-3">The export will include employee name, email, goal details, achievement values, status, progress score, and the current period.</p>
      </div>
    </div>
  )
}

export default AdminReports
