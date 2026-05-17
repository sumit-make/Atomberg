import { useContext, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API from "../services/api"
import { AuthContext } from "../context/AuthContext"

const Login = () => {
  const { setUser } = useContext(AuthContext)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await API.post("/auth/login", { email, password })
      localStorage.setItem("token", data.token)
      setUser(data.user)
      const redirect = data.user.role === "manager" ? "/manager" : data.user.role === "admin" ? "/admin" : "/goals"
      navigate(redirect)
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-8">
      <div className="w-full space-y-6 rounded-[32px] border border-white/10 bg-white/90 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">AtomQuest</p>
          <h1 className="text-3xl font-semibold text-slate-950">Sign in to continue</h1>
          <p className="text-sm text-slate-600">Securely access your goals, check-ins, and reports.</p>
        </div>

        {error && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-shadow w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            required
          />

          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-shadow w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
            required
          />

          <button type="submit" className="btn-primary w-full rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg shadow-sky-500/20">
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Don't have an account? <Link to="/register" className="font-semibold text-slate-900 hover:text-slate-700">Create one</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
