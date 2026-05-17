import { useEffect, useState } from "react"
import API from "../services/api"

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await API.get("/admin/users")
        setUsers(data)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load users")
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="mt-2 text-slate-600">View all registered users and verify roles across the organization.</p>
      </div>

      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">No users found.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                  {user.role}
                </span>
              </div>
              {user.managerId && <p className="mt-4 text-sm text-slate-500">Manager ID: {user.managerId}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminUsers
