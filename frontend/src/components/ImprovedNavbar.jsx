import { useContext, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

const ImprovedNavbar = () => {
  const { user, setUser } = useContext(AuthContext)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    setUser(null)
    navigate("/login")
  }

  const navLinks = {
    employee: [
      { label: "Dashboard", path: "/employee" },
      { label: "Create Goals", path: "/goals" },
      { label: "Shared Goals", path: "/shared-goals" },
      { label: "Track Progress", path: "/achievements" },
      { label: "Check-ins", path: "/checkin" }
    ],
    manager: [
      { label: "Dashboard", path: "/manager" },
      { label: "Review Goals", path: "/manager/review" },
      { label: "Team Progress", path: "/manager/progress" },
      { label: "Shared Goals", path: "/manager/shared-goals" }
    ],
    admin: [
      { label: "Dashboard", path: "/admin" },
      { label: "Users", path: "/admin/users" },
      { label: "Reports", path: "/admin/reports" },
      { label: "Cycle Config", path: "/admin/cycle" },
      { label: "Completion", path: "/admin/completion" }
    ]
  }

  const links = navLinks[user?.role] || []

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/5">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-base font-bold text-white shadow-lg shadow-sky-500/20">
                AQ
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">AtomQuest</p>
                <p className="text-sm text-slate-500">Goals & performance simplified</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              {links.map((link) => (
                <Link key={link.path} to={link.path} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="hidden flex-col items-end sm:flex">
                    <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                    <span className="text-xs uppercase tracking-wide text-slate-500">{user.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800">
                  Login
                </Link>
              )}
            </div>
          </div>

          {links.length > 0 && (
            <nav className="flex gap-4 overflow-x-auto border-t border-slate-100 py-3 md:hidden">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="whitespace-nowrap text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
    </>
  )
}

export default ImprovedNavbar
