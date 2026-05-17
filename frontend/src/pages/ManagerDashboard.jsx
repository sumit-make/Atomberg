import { useEffect, useMemo, useState } from "react"
import API from "../services/api"

const ManagerDashboard = () => {
  const [sheets, setSheets] = useState([])
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editingGoals, setEditingGoals] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/manager/submitted")
        setSheets(data)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load submitted goals")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filteredSheets = useMemo(
    () =>
      sheets.filter((sheet) =>
        sheet.employeeId?.name?.toLowerCase().includes(search.toLowerCase())
      ),
    [search, sheets]
  )

  const handleEditGoals = (sheet) => {
    setEditingId(sheet._id)
    setEditingGoals(JSON.parse(JSON.stringify(sheet.goals)))
  }

  const handleEditGoalField = (index, field, value) => {
    const updatedGoals = [...editingGoals]
    updatedGoals[index][field] = field === "weightage" || field === "target" ? parseFloat(value) || 0 : value
    setEditingGoals(updatedGoals)
  }

  const handleSaveEdits = async () => {
    const totalWeightage = editingGoals.reduce((s, g) => s + (g.weightage || 0), 0)
    if (totalWeightage !== 100) {
      setError("Total weightage must equal 100%")
      return
    }

    try {
      await API.put(`/manager/edit/${editingId}`, { goals: editingGoals })
      setSheets((prev) => prev.map((s) => (s._id === editingId ? { ...s, goals: editingGoals } : s)))
      setEditingId(null)
      setError("")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save edits")
    }
  }

  const handleAction = async (id, action) => {
    const label = action === "approve" ? "approve" : "reject"
    if (!window.confirm(`Are you sure you want to ${label} this goal sheet?`)) {
      return
    }

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
            <h1 className="text-2xl font-semibold">Manager Dashboard</h1>
            <p className="mt-2 text-slate-600">Review submitted goal sheets, track progress, and act with confidence.</p>
          </div>
          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="text-slate-500">Submitted sheets</div>
              <div className="mt-2 text-xl font-semibold">{sheets.length}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="text-slate-500">Filtered view</div>
              <div className="mt-2 text-xl font-semibold">{filteredSheets.length}</div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by employee name"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-slate-400 focus:outline-none"
          />
          <span className="text-sm text-slate-500">Search within submitted goal sheets.</span>
        </div>
      </div>

      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      {isLoading ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">Loading submitted sheets...</div>
      ) : filteredSheets.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">No submitted goal sheets match your search.</div>
      ) : (
        <div className="space-y-4">
          {filteredSheets.map((sheet) => (
            <div key={sheet._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{sheet.employeeId?.name || "Employee"}</h2>
                  <p className="text-sm text-slate-600">{sheet.employeeId?.email}</p>
                  <p className="mt-2 text-sm text-slate-500">Status: <span className="font-medium">{sheet.status}</span></p>
                  <p className="text-sm text-slate-500">Goals: {sheet.goals.length}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingId !== sheet._id ? (
                    <>
                      <button
                        onClick={() => handleEditGoals(sheet)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Edit Goals
                      </button>
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
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveEdits}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                      >
                        Save Edits
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingId === sheet._id ? (
                <div className="mt-5 space-y-4 rounded-3xl bg-slate-50 p-5">
                  <h3 className="font-semibold">Edit Goals</h3>
                  {editingGoals.map((goal, index) => (
                    <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          type="text"
                          value={goal.title}
                          onChange={(e) => handleEditGoalField(index, "title", e.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"
                        />
                        <input
                          type="number"
                          value={goal.target}
                          onChange={(e) => handleEditGoalField(index, "target", e.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          placeholder="Target"
                        />
                        <input
                          type="number"
                          value={goal.weightage}
                          onChange={(e) => handleEditGoalField(index, "weightage", e.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          placeholder="Weightage"
                          min="10"
                          max="100"
                        />
                        <input
                          type="text"
                          value={goal.status}
                          onChange={(e) => handleEditGoalField(index, "status", e.target.value)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          placeholder="Status"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 space-y-4 rounded-3xl bg-slate-50 p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {sheet.goals.map((goal, index) => (
                      <div key={`${sheet._id}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold">{goal.title}</p>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{goal.status}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{goal.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span>Target: {goal.target}</span>
                          <span>Weight: {goal.weightage}%</span>
                          <span>UoM: {goal.uomType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ManagerDashboard
