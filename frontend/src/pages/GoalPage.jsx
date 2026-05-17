import { useEffect, useState } from "react"
import API from "../services/api"
import GoalForm from "../components/GoalForm"
import GoalCard from "../components/GoalCard"

const GoalPage = () => {
  const [goals, setGoals] = useState([])
  const [sheetId, setSheetId] = useState(null)
  const [message, setMessage] = useState("")
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingGoal, setEditingGoal] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/goals")
        setGoals(data.goals || [])
        setSheetId(data._id)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  const saveGoals = async (nextGoals, successMessage) => {
    if (nextGoals.length > 8) {
      setMessage("You can only add up to 8 goals.")
      return
    }

    setGoals(nextGoals)
    try {
      const { data } = await API.post("/goals", { goals: nextGoals })
      setGoals(data.goals || nextGoals)
      setSheetId(data._id || sheetId)
      setMessage(successMessage)
      setEditingIndex(null)
      setEditingGoal(null)
    } catch (err) {
      setMessage(err.response?.data?.message || "Save failed")
    }
  }

  const handleAdd = async (goal) => {
    await saveGoals([...goals, goal], "Goal sheet saved.")
  }

  const handleUpdate = async (goal) => {
    if (editingIndex === null) return
    const nextGoals = goals.map((item, index) => (index === editingIndex ? goal : item))
    await saveGoals(nextGoals, "Goal updated.")
  }

  const handleEditStart = (index) => {
    setEditingIndex(index)
    setEditingGoal(goals[index])
    setMessage("")
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditingGoal(null)
    setMessage("")
  }

  const handleDelete = async (index) => {
    const nextGoals = goals.filter((_, idx) => idx !== index)
    await saveGoals(nextGoals, "Goal deleted.")
  }

  const handleSubmit = async () => {
    if (!sheetId) {
      setMessage("You must save goals before submitting.")
      return
    }

    const totalWeight = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0)
    if (totalWeight !== 100) {
      setMessage("Total goal weightage must equal 100% before submission.")
      return
    }

    try {
      const { data } = await API.put(`/goals/submit/${sheetId}`)
      // refresh local state from server
      setGoals(data.goals || goals)
      setMessage("Goal sheet submitted.")
    } catch (err) {
      setMessage(err.response?.data?.message || "Submit failed")
    }
  }

  const totalWeight = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0)

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white/95 p-8 shadow-2xl shadow-slate-900/5 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Employee Goal Tracker</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Set your goals with clarity</h1>
            <p className="mt-3 max-w-2xl text-slate-600">Build your goal sheet, save drafts as you go, and submit when the plan is ready for approval.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Goals</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{goals.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Current Weight</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{totalWeight}%</p>
            </div>
          </div>
        </div>
      </section>

      <GoalForm
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onCancel={handleCancelEdit}
        initialGoal={editingGoal}
        isEditing={editingIndex !== null}
      />

      {message && <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">{message}</div>}

      <div className="grid gap-5 xl:grid-cols-2">
        {goals.map((goal, index) => (
          <GoalCard
            key={`${goal.title}-${index}`}
            goal={goal}
            onEdit={() => handleEditStart(index)}
            onDelete={() => handleDelete(index)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">Your draft is saved automatically when you add a goal.</p>
        <button onClick={handleSubmit} className="btn-primary rounded-3xl px-6 py-3 text-sm font-semibold shadow-lg shadow-sky-500/20">
          Submit Goal Sheet
        </button>
      </div>
    </div>
  )
}

export default GoalPage