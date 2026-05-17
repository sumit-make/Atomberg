const GoalCard = ({ goal, onEdit, onDelete }) => {
  const progress = goal.target ? Math.min(100, Math.round((goal.achievement || 0) / goal.target * 100)) : 0

  return (
    <div className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">{goal.title}</h3>
          <p className="mt-2 text-sm text-slate-500">{goal.description}</p>
        </div>
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            Delete
          </button>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${goal.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
            {goal.status}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm text-slate-600">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Thrust</p>
          <p className="mt-1 font-semibold text-slate-900">{goal.thrustArea || "—"}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">UoM</p>
          <p className="mt-1 font-semibold text-slate-900">{goal.uomType || "—"}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Target</p>
          <p className="mt-1 font-semibold text-slate-900">{goal.target}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Weight</p>
          <p className="mt-1 font-semibold text-slate-900">{goal.weightage}%</p>
        </div>
      </div>

      <div className="mt-5 rounded-full bg-slate-100 h-2 overflow-hidden">
        <div className="h-2 rounded-full bg-sky-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">Progress: {progress}%</p>
    </div>
  )
}

export default GoalCard
