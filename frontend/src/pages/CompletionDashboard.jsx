import { useEffect, useState } from "react"
import API from "../services/api"

const CompletionDashboard = () => {
  const [completionData, setCompletionData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadCompletionData = async () => {
    setLoading(true)
    setError("")
    try {
      const { data } = await API.get("/achievements/admin/completion")
      setCompletionData(data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load completion data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompletionData()
  }, [])

  const handleExportReport = async () => {
    try {
      const response = await API.get("/achievements/report/export", {
        responseType: "blob"
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "achievement_report.csv")
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (err) {
      setError("Failed to export report")
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Completion Dashboard</h1>
            <p className="mt-2 text-slate-600">Track quarterly check-in progress across all employees.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={loadCompletionData}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Refresh Data
            </button>
            <button
              onClick={handleExportReport}
              className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Export Report
            </button>
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">Loading...</div>
      ) : completionData.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">No data available.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Employee</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Goals</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Submitted</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Completion</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {completionData.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.employeeName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.employeeEmail}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600">{item.goalsCount}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600">{item.achievementsSubmitted}</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${item.completionPercentage}%` }}
                        />
                      </div>
                      <span>{item.completionPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        item.completionPercentage === 100
                          ? "bg-emerald-100 text-emerald-700"
                          : item.completionPercentage > 50
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {item.completionPercentage === 100 ? "Complete" : item.completionPercentage > 50 ? "In Progress" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default CompletionDashboard
