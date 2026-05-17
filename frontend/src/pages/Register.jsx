import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API from "../services/api"

const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("employee")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      const { data } = await API.post("/auth/register", { name, email, password, role })
      setSuccess(data.message || "Registration successful! Redirecting to login...")
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-8">
      <div className="w-full space-y-6 rounded-[32px] border border-white/10 bg-white/90 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Join AtomQuest</p>
          <h1 className="text-3xl font-semibold text-slate-950">Create your account</h1>
          <p className="text-sm text-slate-600">Start tracking your goals with a secure team portal.</p>
        </div>

        {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">{error}</div>}
        {success && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-shadow w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            required
          />

          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-shadow w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            required
          />

          <label className="block text-sm font-medium text-slate-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-shadow w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
          >
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>

          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-shadow w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            required
          />

          <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-shadow w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            required
          />

          <button type="submit" className="btn-primary w-full rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg shadow-sky-500/20">
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="font-semibold text-slate-900 hover:text-slate-700">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
