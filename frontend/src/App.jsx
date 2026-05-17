import { Routes, Route, Navigate } from "react-router-dom"
import ImprovedNavbar from "./components/ImprovedNavbar"
import Footer from "./components/Footer"
import Login from "./pages/Login"
import Register from "./pages/Register"
import EmployeeDashboard from "./pages/EmployeeDashboard"
import ManagerDashboard from "./pages/ManagerDashboard"
import ManagerReviewPage from "./pages/ManagerReviewPage"
import ManagerProgressPage from "./pages/ManagerProgressPage"
import AdminDashboard from "./pages/AdminDashboard"
import AdminReports from "./pages/AdminReports"
import AdminUsers from "./pages/AdminUsers"
import AdminCycleConfigPage from "./pages/AdminCycleConfigPage"
import GoalPage from "./pages/GoalPage"
import CheckInPage from "./pages/CheckInPage"
import AchievementTrackingPage from "./pages/AchievementTrackingPage"
import CompletionDashboard from "./pages/CompletionDashboard"
import SharedGoalsPage from "./pages/SharedGoalsPage"
import ManagerSharedGoalsPage from "./pages/ManagerSharedGoalsPage"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200 text-slate-900">
      <ImprovedNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-6">
        <Routes>
          <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/employee" element={<ProtectedRoute role="employee"><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/manager" element={<ProtectedRoute role="manager"><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/manager/review" element={<ProtectedRoute role="manager"><ManagerReviewPage /></ProtectedRoute>} />
          <Route path="/manager/progress" element={<ProtectedRoute role="manager"><ManagerProgressPage /></ProtectedRoute>} />
          <Route path="/manager/shared-goals" element={<ProtectedRoute role="manager"><ManagerSharedGoalsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/cycle" element={<ProtectedRoute role="admin"><AdminCycleConfigPage /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute role="employee"><GoalPage /></ProtectedRoute>} />
          <Route path="/shared-goals" element={<ProtectedRoute role="employee"><SharedGoalsPage /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute role="employee"><AchievementTrackingPage /></ProtectedRoute>} />
          <Route path="/checkin" element={<ProtectedRoute role="employee"><CheckInPage /></ProtectedRoute>} />
          <Route path="/admin/completion" element={<ProtectedRoute role="admin"><CompletionDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate replace to="/login" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
