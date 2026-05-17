import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

const Navbar = () => {
  const { user, setUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    setUser(null)
    navigate("/login")
  }

  return (
    <header className="bg-slate-800 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-semibold">
          AtomQuest Portal
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline">{user.name}</span>
              <button
                onClick={handleLogout}
                className="rounded bg-slate-600 px-3 py-2 text-sm hover:bg-slate-500"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded bg-slate-600 px-3 py-2 text-sm hover:bg-slate-500">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
