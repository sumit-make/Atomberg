import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import API from "../services/api"

const renderAuditValue = (value) => {
  if (value === null || value === undefined) {
    return <span className="text-slate-500">None</span>
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            {renderAuditValue(item)}
          </div>
        ))}
      </div>
    )
  }

  if (typeof value === "object") {
    return (
      <div className="space-y-2">
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="flex flex-col gap-1 rounded-2xl bg-slate-100 p-3 text-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-semibold text-slate-900">{key}</span>
            <span className="text-slate-600">{renderAuditValue(val)}</span>
          </div>
        ))}
      </div>
    )
  }

  return <span>{String(value)}</span>
}

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [goals, setGoals] = useState([])
  const [completionData, setCompletionData] = useState([])
  const [trendData, setTrendData] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [unlockingId, setUnlockingId] = useState(null)
  const [error, setError] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    setError("")
    try {
      const [usersRes, goalsRes, completionRes, trendRes, auditRes] = await Promise.all([
        API.get("/admin/users"),
        API.get("/admin/goals"),
        API.get("/achievements/admin/completion"),
        API.get("/achievements/admin/trends"),
        API.get("/admin/audit-logs")
      ])
      setUsers(usersRes.data)
      setGoals(goalsRes.data)
      setCompletionData(completionRes.data)
      setTrendData(trendRes.data)
      setAuditLogs(auditRes.data)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const unlockGoalSheet = async (id) => {
    setUnlockingId(id)
    try {
      await API.put(`/admin/goals/unlock/${id}`)
      setGoals((prev) => prev.map((sheet) => (sheet._id === id ? { ...sheet, locked: false, status: "draft" } : sheet)))
      setError("")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to unlock goal sheet")
    } finally {
      setUnlockingId(null)
    }
  }

  const filteredUsers = useMemo(() => {
    return roleFilter === "all" ? users : users.filter((user) => user.role === roleFilter)
  }, [roleFilter, users])

  const roleTotals = useMemo(
    () => ({
      employee: users.filter((user) => user.role === "employee").length,
      manager: users.filter((user) => user.role === "manager").length,
      admin: users.filter((user) => user.role === "admin").length
    }),
    [users]
  )

  const statusTotals = useMemo(
    () => ({
      draft: goals.filter((sheet) => sheet.status === "draft").length,
      submitted: goals.filter((sheet) => sheet.status === "submitted").length,
      approved: goals.filter((sheet) => sheet.status === "approved").length,
      rejected: goals.filter((sheet) => sheet.status === "rejected").length
    }),
    [goals]
  )

  const achievementSummary = useMemo(() => {
    if (completionData.length === 0) return { average: 0, completed: 0, pending: 0, noSheet: 0 }
    const completed = completionData.filter((item) => item.completionPercentage === 100).length
    const pending = completionData.filter((item) => item.completionPercentage > 0 && item.completionPercentage < 100).length
    const noSheet = completionData.filter((item) => item.goalSheetStatus === "no_sheet").length
    const average = Math.round(
      completionData.reduce((sum, item) => sum + item.completionPercentage, 0) / completionData.length
    )
    return { average, completed, pending, noSheet }
  }, [completionData])

  const userNamesById = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user._id] = user.name
      return acc
    }, {})
  }, [users])

  const auditLogsByUser = useMemo(() => {
    return auditLogs.reduce((grouped, log) => {
      const userName = log.changedBy === "system" || !log.changedBy ? "System" : userNamesById[log.changedBy] || log.changedBy
      grouped[userName] = grouped[userName] || []
      grouped[userName].push(log)
      return grouped
    }, {})
  }, [auditLogs, userNamesById])

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="mt-2 text-slate-600">Monitor users, goal sheet adoption, and team progress.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/admin/cycle"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
            >
              Configure Cycle
            </Link>
            <button
              onClick={loadData}
              className="w-full rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 sm:w-auto"
            >
              {loading ? "Refreshing..." : "Refresh data"}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Employees</p>
          <p className="mt-3 text-3xl font-semibold">{roleTotals.employee}</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Managers</p>
          <p className="mt-3 text-3xl font-semibold">{roleTotals.manager}</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Admins</p>
          <p className="mt-3 text-3xl font-semibold">{roleTotals.admin}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Quarterly completion</p>
          <p className="mt-3 text-3xl font-semibold">{achievementSummary.average}%</p>
          <p className="mt-2 text-sm text-slate-500">average across employees</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Fully completed</p>
          <p className="mt-3 text-3xl font-semibold">{achievementSummary.completed}</p>
          <p className="mt-2 text-sm text-slate-500">employees with 100% coverage</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">In progress</p>
          <p className="mt-3 text-3xl font-semibold">{achievementSummary.pending}</p>
          <p className="mt-2 text-sm text-slate-500">employees with partial entries</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Missing sheets</p>
          <p className="mt-3 text-3xl font-semibold">{achievementSummary.noSheet}</p>
          <p className="mt-2 text-sm text-slate-500">employees without a goal sheet</p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Quarterly trend</h2>
            <p className="mt-1 text-sm text-slate-500">Average achievement progress by quarter.</p>
          </div>
          {!trendData.length && <span className="text-sm text-slate-500">No trend history available.</span>}
        </div>
        <div className="mt-5 space-y-4">
          {trendData.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No quarterly trend data found yet.</div>
          ) : (
            trendData.map((item) => (
              <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-900">{item.label}</span>
                  <span className="text-sm text-slate-600">{item.averagePercent}%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${item.averagePercent}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{item.trackedGoals} entries</span>
                  <span>{item.onTrackRate}% on track</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">User Directory</h2>
            <p className="mt-1 text-sm text-slate-500">Filter users by role and review user registration details.</p>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
          >
            <option value="all">All Roles</option>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="mt-5 space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">No users available for this role filter.</div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user._id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">{user.role}</span>
                </div>
                {user.managerId && <p className="mt-3 text-sm text-slate-500">Manager ID: {user.managerId}</p>}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Goal Sheet Summary</h2>
            <p className="mt-1 text-sm text-slate-500">See how many records exist by status across the portal.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            <span className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Draft: {statusTotals.draft}</span>
            <span className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Submitted: {statusTotals.submitted}</span>
            <span className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Approved: {statusTotals.approved}</span>
            <span className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Rejected: {statusTotals.rejected}</span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-600">Loading goal sheets...</div>
          ) : goals.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-600">No goal sheets found.</div>
          ) : (
            goals.map((sheet) => (
              <div key={sheet._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{sheet.employeeId?.name || "Unknown"}</p>
                    <p className="text-sm text-slate-500">Status: {sheet.status}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                    {sheet.goals.length + (sheet.sharedGoals?.length || 0)} Goals
                  </span>
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  Total weightage: {sheet.totalWeightage}%
                </div>
                {(sheet.locked || sheet.status === "approved") && (
                  <button
                    onClick={() => unlockGoalSheet(sheet._id)}
                    disabled={unlockingId === sheet._id}
                    className="mt-4 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
                  >
                    {unlockingId === sheet._id ? "Unlocking..." : "Unlock for Edit"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Audit Trail</h2>
            <p className="mt-1 text-sm text-slate-500">Track recent system changes for goals and approvals.</p>
          </div>
          <span className="text-sm text-slate-500">Latest 20 audit entries</span>
        </div>

        <div className="mt-5 space-y-6">
          {Object.keys(auditLogsByUser).length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">No audit logs available.</div>
          ) : (
            Object.entries(auditLogsByUser).map(([userName, logs]) => (
              <div key={userName} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{userName}</p>
                    <p className="text-sm text-slate-500">{logs.length} audit entries</p>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="px-4 py-3 font-semibold">Action</th>
                        <th className="px-4 py-3 font-semibold">When</th>
                        <th className="px-4 py-3 font-semibold">Old Value</th>
                        <th className="px-4 py-3 font-semibold">New Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {logs.map((log) => (
                        <tr key={log._id} className="bg-white">
                          <td className="max-w-[180px] whitespace-normal px-4 py-4 text-slate-900">{log.action}</td>
                          <td className="px-4 py-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="max-w-[260px] whitespace-normal px-4 py-4 text-slate-600">{renderAuditValue(log.oldValue)}</td>
                          <td className="max-w-[260px] whitespace-normal px-4 py-4 text-slate-600">{renderAuditValue(log.newValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
