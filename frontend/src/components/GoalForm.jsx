import { useEffect, useState } from "react"

const defaultGoal = {
  title: "",
  description: "",
  thrustArea: "",
  uomType: "",
  target: 0,
  achievement: 0,
  weightage: 10,
  status: "Not Started"
}

const GoalForm = ({ onAdd, onUpdate, onCancel, initialGoal, isEditing }) => {
  const [goal, setGoal] = useState(initialGoal || defaultGoal)

  const handleChange = (e) => {
    setGoal((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const normalizedGoal = {
      ...goal,
      target: Number(goal.target),
      achievement: Number(goal.achievement),
      weightage: Number(goal.weightage)
    }

    if (isEditing) {
      onUpdate(normalizedGoal)
    } else {
      onAdd(normalizedGoal)
    }
    if (!isEditing) {
      setGoal(initialGoal)
    }
  }

  useEffect(() => {
    setGoal(initialGoal || defaultGoal)
  }, [initialGoal])

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{isEditing ? "Edit goal" : "Add a new goal"}</h2>
          <p className="text-sm text-slate-500">{isEditing ? "Update your goal details and save changes." : "Use this form to capture your next objective."}</p>
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <button type="button" onClick={onCancel} className="rounded-3xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          )}
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">
            Goal Builder
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input name="title" value={goal.title} onChange={handleChange} placeholder="Title" className="input-shadow w-full rounded-3xl border border-slate-200 px-4 py-3" required />
        <input name="thrustArea" value={goal.thrustArea} onChange={handleChange} placeholder="Thrust Area" className="input-shadow w-full rounded-3xl border border-slate-200 px-4 py-3" />
      </div>

      <textarea name="description" value={goal.description} onChange={handleChange} placeholder="Description" className="input-shadow w-full rounded-3xl border border-slate-200 px-4 py-3" rows="4" />

      <div className="grid gap-3 md:grid-cols-3">
        <select name="uomType" value={goal.uomType} onChange={handleChange} className="input-shadow w-full rounded-3xl border border-slate-200 px-4 py-3" required>
          <option value="">Select UoM</option>
          <option value="Numeric">Numeric</option>
          <option value="%">%</option>
          <option value="Timeline">Timeline</option>
          <option value="Zero-based">Zero-based</option>
        </select>
        <input type="number" name="target" value={goal.target} onChange={handleChange} placeholder="Target" className="input-shadow w-full rounded-3xl border border-slate-200 px-4 py-3" required />
        <input type="number" name="weightage" value={goal.weightage} onChange={handleChange} placeholder="Weightage" className="input-shadow w-full rounded-3xl border border-slate-200 px-4 py-3" min="10" required />
      </div>

      <button type="submit" className="btn-secondary w-full rounded-3xl px-4 py-3 text-sm font-semibold shadow-lg shadow-slate-900/10">
        {isEditing ? "Update Goal" : "Add Goal"}
      </button>
    </form>
  )
}

export default GoalForm
