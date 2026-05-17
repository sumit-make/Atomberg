import { useEffect, useState } from "react"
import API from "../services/api"

const ManagerSharedGoalsPage = () => {
  const [users, setUsers] = useState([])
  const [sharedGoals, setSharedGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thrustArea: "",
    uomType: "Numeric",
    target: 0,
    weightage: 20,
    recipientIds: [],
    primaryOwnerId: ""
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, goalsRes] = await Promise.all([
          API.get("/admin/users"),
          API.get("/shared-goals/all")
        ])
        setUsers(usersRes.data.filter((u) => u.role === "employee"))
        setSharedGoals(goalsRes.data)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "target" || name === "weightage" ? Number(value) : value
    }))
  }

  const handleRecipientChange = (userId) => {
    setFormData((prev) => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(userId)
        ? prev.recipientIds.filter((id) => id !== userId)
        : [...prev.recipientIds, userId]
    }))
  }

  const handleCreateSharedGoal = async (e) => {
    e.preventDefault()
    if (
      !formData.title ||
      !formData.thrustArea ||
      !formData.uomType ||
      formData.target == null ||
      formData.weightage == null ||
      formData.recipientIds.length === 0
    ) {
      setError("Please fill all required fields and select at least one recipient.")
      return
    }

    if (formData.weightage < 10 || formData.weightage > 100) {
      setError("Weightage must be between 10 and 100.")
      return
    }

    setIsCreating(true)
    setError("")
    try {
      const { data } = await API.post("/shared-goals", {
        ...formData,
        primaryOwnerId: formData.primaryOwnerId || formData.recipientIds[0]
      })
      setSharedGoals((prev) => [data, ...prev])
      setFormData({
        title: "",
        description: "",
        thrustArea: "",
        uomType: "Numeric",
        target: 0,
        weightage: 20,
        recipientIds: [],
        primaryOwnerId: ""
      })
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create shared goal")
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) {
    return <div className="rounded-xl bg-white p-6 shadow-sm">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Shared Goals Management</h1>
        <p className="mt-2 text-slate-600">Create and distribute departmental KPIs to employees.</p>
      </div>

      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Create New Shared Goal</h2>
        <form onSubmit={handleCreateSharedGoal} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Revenue Target Q1"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Thrust Area *</label>
              <input
                type="text"
                name="thrustArea"
                value={formData.thrustArea}
                onChange={handleInputChange}
                placeholder="e.g., Sales"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Additional details about this KPI"
              rows="2"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">UoM Type *</label>
              <select
                name="uomType"
                value={formData.uomType}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="Numeric">Numeric</option>
                <option value="%">Percentage</option>
                <option value="Timeline">Timeline</option>
                <option value="Zero-based">Zero-based</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Target *</label>
              <input
                type="number"
                name="target"
                value={formData.target}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Default Weightage * (10-100)</label>
              <input
                type="number"
                name="weightage"
                value={formData.weightage}
                onChange={handleInputChange}
                min="10"
                max="100"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Select Recipients *</label>
            <div className="grid gap-2 md:grid-cols-2">
              {users.map((user) => (
                <label key={user._id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.recipientIds.includes(user._id)}
                    onChange={() => handleRecipientChange(user._id)}
                    className="rounded"
                  />
                  <span className="text-sm">{user.name}</span>
                  <span className="text-xs text-slate-500">({user.email})</span>
                </label>
              ))}
            </div>
          </div>

          {formData.recipientIds.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Primary Owner (who can update achievement)</label>
              <select
                name="primaryOwnerId"
                value={formData.primaryOwnerId}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Auto-assign to first recipient</option>
                {formData.recipientIds.map((userId) => {
                  const user = users.find((u) => u._id === userId)
                  return (
                    <option key={userId} value={userId}>
                      {user?.name}
                    </option>
                  )
                })}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isCreating}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create Shared Goal"}
          </button>
        </form>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Existing Shared Goals ({sharedGoals.length})</h2>
        {sharedGoals.length === 0 ? (
          <p className="text-sm text-slate-600">No shared goals created yet.</p>
        ) : (
          <div className="space-y-3">
            {sharedGoals.map((goal) => (
              <div key={goal._id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{goal.title}</p>
                    <p className="text-sm text-slate-600">{goal.description}</p>
                    <div className="mt-2 flex gap-4 text-xs text-slate-500">
                      <span>Target: {goal.target}</span>
                      <span>Default Weightage: {goal.weightage}%</span>
                      <span>Recipients: {goal.recipientEmployees?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ManagerSharedGoalsPage