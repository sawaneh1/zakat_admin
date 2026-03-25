import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import ErrorBoundary from './components/ErrorBoundary'

// Layouts
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Dashboard Pages
import DashboardPage from './pages/DashboardPage'
import CalculatorPage from './pages/calculator/CalculatorPage'
import UsersPage from './pages/users/UsersPage'
import RolesPage from './pages/roles/RolesPage'
import BeneficiariesPage from './pages/beneficiaries/BeneficiariesPage'
import PaymentsPage from './pages/payments/PaymentsPage'
import DistributionsPage from './pages/distributions/DistributionsPage'
import CampaignsPage from './pages/campaigns/CampaignsPage'
import ReportsPage from './pages/reports/ReportsPage'
import SettingsPage from './pages/settings/SettingsPage'
import DonationTypesPage from './pages/donation-types/DonationTypesPage'

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  const { token, user, fetchUser, setLoading } = useAuthStore()

  useEffect(() => {
    // Initialize auth state on app load
    const initAuth = async () => {
      if (token && !user) {
        // If we have a token but no user, try to fetch user info
        try {
          await fetchUser()
        } catch {
          // If fetch fails, loading will be set to false in fetchUser
        }
      } else if (!token) {
        // No token, just set loading to false
        setLoading(false)
      }
      // If we have both token and user (from rehydration), loading is already false
    }
    initAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ErrorBoundary>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/beneficiaries/*" element={<BeneficiariesPage />} />
          <Route path="/payments/*" element={<PaymentsPage />} />
          <Route path="/distributions/*" element={<DistributionsPage />} />
          <Route path="/campaigns/*" element={<CampaignsPage />} />
          <Route path="/donation-types" element={<DonationTypesPage />} />
          <Route path="/reports/*" element={<ReportsPage />} />
          <Route path="/settings/*" element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
