import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { useLocaleStore } from '../stores/locale'
import { cn } from '../lib/utils'
import { t } from '../lib/i18n'
import ErrorBoundary from '../components/ErrorBoundary'
import LanguageSwitcher from '../components/LanguageSwitcher'
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  MegaphoneIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  CalculatorIcon,
  TagIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { nameKey: 'nav.dashboard' as const, href: '/dashboard', icon: HomeIcon },
  { nameKey: 'nav.calculator' as const, href: '/calculator', icon: CalculatorIcon },
  { nameKey: 'nav.users' as const, href: '/users', icon: UsersIcon, permission: 'users.view' },
  { nameKey: 'nav.roles' as const, href: '/roles', icon: ShieldCheckIcon, permission: 'roles.view' },
  { nameKey: 'nav.beneficiaries' as const, href: '/beneficiaries', icon: UserGroupIcon, permission: 'beneficiaries.view' },
  { nameKey: 'nav.payments' as const, href: '/payments', icon: BanknotesIcon, permission: 'payments.view' },
  { nameKey: 'nav.distributions' as const, href: '/distributions', icon: ArrowsRightLeftIcon, permission: 'distributions.view' },
  { nameKey: 'nav.campaigns' as const, href: '/campaigns', icon: MegaphoneIcon, permission: 'campaigns.view' },
  { nameKey: 'nav.donation_types' as const, href: '/donation-types', icon: TagIcon, permission: 'settings.view' },
  { nameKey: 'nav.reports' as const, href: '/reports', icon: ChartBarIcon, permission: 'reports.view' },
  { nameKey: 'nav.settings' as const, href: '/settings', icon: Cog6ToothIcon, permission: 'settings.view' },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout, hasPermission } = useAuthStore()
  const { locale } = useLocaleStore()
  const navigate = useNavigate()

  const isRtl = locale === 'ar'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const filteredNavigation = navigation.filter(
    (item) => !item.permission || hasPermission(item.permission)
  )

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600/75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 z-50 w-80 bg-white transform transition-transform duration-300 ease-in-out lg:hidden',
          isRtl ? 'right-0' : 'left-0',
          sidebarOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')
        )}
      >
        <div className="flex items-center justify-between h-20 px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="Zakat Platform Logo" className="h-14 w-auto object-contain" />
            <span className="font-semibold text-gray-900">{t('nav.title', locale) || 'Zakat Platform'}</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-4 px-2">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.nameKey}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 scale-[1.02]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {t(item.nameKey, locale)}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Desktop sidebar */}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col",
        isRtl ? "right-0 border-l border-gray-200" : "left-0 border-r border-gray-200"
      )}>
        <div className="flex flex-col flex-grow bg-white">
          {/* Logo Section */}
          <div className="flex flex-col items-center justify-center py-10 px-6 border-b border-gray-50 bg-gradient-to-b from-gray-50/50 to-transparent">
            <div className="relative group cursor-pointer transition-transform duration-500 hover:scale-105">
              <div className="absolute -inset-4 bg-primary-100/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <img 
                src="/images/logo.png" 
                alt="Zakat Platform Logo" 
                className="h-32 w-auto object-contain relative z-10" 
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.nameKey}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group',
                    isActive
                      ? `bg-primary-600 text-white shadow-lg shadow-primary-200 scale-[1.02] ${isRtl ? 'border-r-4 -mr-px' : 'border-l-4 -ml-px'} border-primary-600`
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                  )
                }
              >
                <item.icon className="w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110" />
                {t(item.nameKey, locale)}
              </NavLink>
            ))}
          </nav>

          {/* Organization info */}
          {user?.organization && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 text-xs font-semibold">
                    {getInitials(user.organization.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.organization.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.organization.slug}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={cn(isRtl ? "lg:pr-80" : "lg:pl-80")}>
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Page title - hidden on mobile */}
            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold text-gray-900">
                {/* Dynamic title based on route could go here */}
              </h2>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <LanguageSwitcher variant="toggle" />

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 text-sm font-semibold">
                      {user ? getInitials(user.full_name) : 'U'}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.roles?.[0]?.name || 'User'}
                    </p>
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-gray-500 hidden sm:block" />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className={cn(
                      "absolute mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50",
                      isRtl ? "left-0" : "right-0"
                    )}>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.full_name}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <NavLink
                        to="/settings/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {t('user.profile', locale)}
                      </NavLink>
                      <NavLink
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {t('user.settings', locale)}
                      </NavLink>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        {t('user.sign_out', locale)}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
