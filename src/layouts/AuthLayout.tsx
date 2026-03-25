import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-700 to-primary-500"></div>
          <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
            {/* Logo */}
            <div className="mb-8">
              <img 
                src="/images/logo.png" 
                alt="Zakat Platform Logo" 
                className="w-56 h-auto object-contain bg-white/10 rounded-xl p-4 backdrop-blur-sm"
              />
            </div>

            <h1 className="text-4xl font-bold mb-4 text-center">Zakat Platform</h1>
            <p className="text-xl text-primary-100 text-center mb-6">
              Empowering Islamic Charity in The Gambia
            </p>

            {/* Arabic Tagline */}
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
              <p className="text-2xl font-arabic text-center" dir="rtl">
                الصدقة لا تنقص المال
              </p>
              <p className="text-sm text-primary-200 text-center mt-2">
                "Charity does not decrease wealth"
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-800/50 to-transparent"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
