import { useEffect, useState } from "react"
import API from "../services/api"

const CheckInPage = () => {
  const [comment, setComment] = useState("")
  const [message, setMessage] = useState("")
  const [sheet, setSheet] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/goals")
        setSheet(data)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!sheet?._id) {
      setMessage("No goal sheet available for check-in.")
      return
    }

    try {
      await API.post("/checkins", {
        goalSheetId: sheet._id,
        comment
      })
      setMessage("Check-in submitted.")
      setComment("")
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit check-in")
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Check-In</h1>
        <p className="mt-2 text-slate-600">Share a progress update for your current goal sheet.</p>
      </div>
      <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Comment</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="5"
            className="mt-2 w-full rounded border px-3 py-2"
            required
          />
        </label>
        <button type="submit" className="mt-4 rounded bg-slate-800 px-4 py-2 text-white hover:bg-slate-700">
          Submit Check-In
        </button>
      </form>
      {message && <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
    </div>
  )
}

export default CheckInPage
