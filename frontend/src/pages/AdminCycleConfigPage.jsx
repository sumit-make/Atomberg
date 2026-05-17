import { useEffect, useState } from "react"
import API from "../services/api"

const months = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" }
]

const days = Array.from({ length: 31 }, (_, index) => index + 1)

const AdminCycleConfigPage = () => {
  const [windows, setWindows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data } = await API.get("/admin/cycle-config")
        setWindows(data.windows || [])
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load cycle configuration.")
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  const handleChange = (index, field, value) => {
    setWindows((prev) => prev.map((window, idx) => (idx === index ? { ...window, [field]: value } : window)))
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      await API.put("/admin/cycle-config", { windows })
      setSuccess("Cycle configuration saved successfully.")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save cycle configuration.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Administrative Cycle Configuration</h1>
            <p className="mt-2 text-slate-600">Adjust the goal-setting and check-in windows for the current year.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 sm:w-auto disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Cycle Configuration"}
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
      {success && <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{success}</div>}

      {loading ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">Loading cycle configuration...</div>
      ) : (
        <div className="space-y-4">
          {windows.map((window, index) => (
            <div key={window.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold">{window.label}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Allowed: {window.allows.join(", ")}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Start Month</label>
                  <select
                    value={window.startMonth}
                    onChange={(e) => handleChange(index, "startMonth", Number(e.target.value))}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Start Day</label>
                  <select
                    value={window.startDay}
                    onChange={(e) => handleChange(index, "startDay", Number(e.target.value))}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">End Month</label>
                  <select
                    value={window.endMonth}
                    onChange={(e) => handleChange(index, "endMonth", Number(e.target.value))}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">End Day</label>
                  <select
                    value={window.endDay}
                    onChange={(e) => handleChange(index, "endDay", Number(e.target.value))}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminCycleConfigPage
