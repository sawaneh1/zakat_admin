import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui'
import { useAuthStore } from '../stores/auth'
import {
  BanknotesIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MegaphoneIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import type { DashboardStats, Payment, Distribution } from '../types'

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
}: {
  title: string
  value: string
  icon: React.ElementType
  trend?: 'up' | 'down'
  trendValue?: string
  color?: 'primary' | 'green' | 'blue' | 'amber'
}) {
  const colors = {
    primary: 'bg-primary-100 text-primary-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={`text-sm ${
                    trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trendValue}
                </span>
                <span className="text-sm text-gray-500">vs last month</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentPaymentsList({ payments }: { payments: Payment[] }) {
  const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    completed: 'success',
    pending: 'warning',
    failed: 'danger',
    cancelled: 'default',
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {payments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No recent payments</div>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.is_anonymous ? 'Anonymous' : payment.donor_name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(payment.created_at)} • {payment.payment_type}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(payment.amount, payment.currency_code)}
                  </p>
                  <Badge variant={statusColors[payment.status] || 'default'} size="sm">
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentDistributionsList({ distributions }: { distributions: Distribution[] }) {
  const statusColors: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
    completed: 'success',
    in_progress: 'info',
    approved: 'warning',
    draft: 'default',
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Distributions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {distributions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No recent distributions</div>
          ) : (
            distributions.map((distribution) => (
              <div key={distribution.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {distribution.reference_number}
                  </p>
                  <p className="text-xs text-gray-500">
                    {distribution.beneficiary_count} beneficiaries • {distribution.fund_type}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(distribution.total_amount, distribution.currency)}
                  </p>
                  <Badge variant={statusColors[distribution.status] || 'default'} size="sm">
                    {distribution.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function FundBalancesCard({ balances }: { balances: { fund_type: string; balance: number; currency: string }[] }) {
  const fundLabels: Record<string, string> = {
    zakat: 'Zakat Fund',
    sadaqah: 'Sadaqah Fund',
    general: 'General Fund',
    operational: 'Operational',
  }

  const fundColors: Record<string, string> = {
    zakat: 'bg-primary-500',
    sadaqah: 'bg-green-500',
    general: 'bg-blue-500',
    operational: 'bg-amber-500',
  }

  const total = balances.reduce((sum, b) => sum + b.balance, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fund Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {balances.map((fund) => (
            <div key={fund.fund_type}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">{fundLabels[fund.fund_type] || fund.fund_type}</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(fund.balance, fund.currency)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${fundColors[fund.fund_type] || 'bg-gray-400'} rounded-full`}
                  style={{ width: total > 0 ? `${(fund.balance / total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(total, balances[0]?.currency || 'GMD')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats')
      return response.data.data
    },
  })

  // Mock data for when API is not ready
  const mockStats: DashboardStats = {
    total_collected: 2500000,
    total_distributed: 1850000,
    total_beneficiaries: 450,
    active_campaigns: 5,
    pending_distributions: 3,
    fund_balances: [
      { fund_type: 'zakat', balance: 450000, currency: 'GMD', last_updated: new Date().toISOString() },
      { fund_type: 'sadaqah', balance: 120000, currency: 'GMD', last_updated: new Date().toISOString() },
      { fund_type: 'general', balance: 80000, currency: 'GMD', last_updated: new Date().toISOString() },
    ],
    recent_payments: [],
    recent_distributions: [],
    monthly_trends: [],
  }

  const displayStats = stats || mockStats

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name || 'User'}
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening with your organization today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Collected"
          value={formatCurrency(displayStats.total_collected)}
          icon={BanknotesIcon}
          trend="up"
          trendValue="12%"
          color="primary"
        />
        <StatCard
          title="Total Distributed"
          value={formatCurrency(displayStats.total_distributed)}
          icon={ArrowTrendingUpIcon}
          trend="up"
          trendValue="8%"
          color="green"
        />
        <StatCard
          title="Beneficiaries"
          value={displayStats.total_beneficiaries.toString()}
          icon={UserGroupIcon}
          trend="up"
          trendValue="5%"
          color="blue"
        />
        <StatCard
          title="Active Campaigns"
          value={displayStats.active_campaigns.toString()}
          icon={MegaphoneIcon}
          color="amber"
        />
      </div>

      {/* Pending Actions Alert */}
      {displayStats.pending_distributions > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800">
                You have <strong>{displayStats.pending_distributions}</strong> distributions
                pending approval.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fund Balances */}
        <div className="lg:col-span-1">
          <FundBalancesCard balances={displayStats.fund_balances} />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecentPaymentsList payments={displayStats.recent_payments} />
          <RecentDistributionsList distributions={displayStats.recent_distributions} />
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  )
}
