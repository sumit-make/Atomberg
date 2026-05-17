const ProgressBar = ({ value }) => {
  return (
    <div className="rounded-full bg-slate-200 p-1">
      <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${value}%` }} />
    </div>
  )
}

export default ProgressBar
