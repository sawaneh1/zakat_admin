import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { formatCurrency } from '../../lib/utils'
import { t } from '../../lib/i18n'
import { useLocaleStore } from '../../stores/locale'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../components/ui'
import {
  DocumentArrowDownIcon,
  ChartBarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'

interface ReportSummary {
  total_collected: number
  total_distributed: number
  total_beneficiaries: number
  new_beneficiaries: number
  active_campaigns: number
  fund_balances: {
    zakat: number
    sadaqah: number
    general: number
  }
}

export default function ReportsPage() {
  const { locale } = useLocaleStore()
  const [dateRange, setDateRange] = useState('this_month')

  const { data: summary, isLoading } = useQuery<ReportSummary>({
    queryKey: ['reports-summary', dateRange],
    queryFn: async () => {
      const response = await api.get(`/reports/summary?period=${dateRange}`)
      return response.data.data
    },
  })

  const reportTypes = [
    {
      id: 'collections',
      name: t('reports.type.collections', locale),
      description: t('reports.desc.collections', locale),
      icon: ChartBarIcon,
    },
    {
      id: 'distributions',
      name: t('reports.type.distributions', locale),
      description: t('reports.desc.distributions', locale),
      icon: ChartBarIcon,
    },
    {
      id: 'beneficiaries',
      name: t('reports.type.beneficiaries', locale),
      description: t('reports.desc.beneficiaries', locale),
      icon: ChartBarIcon,
    },
    {
      id: 'fund_statement',
      name: t('reports.type.fund_statement', locale),
      description: t('reports.desc.fund_statement', locale),
      icon: ChartBarIcon,
    },
    {
      id: 'zakat_calculations',
      name: t('reports.type.zakat_calculations', locale),
      description: t('reports.desc.zakat_calculations', locale),
      icon: ChartBarIcon,
    },
    {
      id: 'campaign_performance',
      name: t('reports.type.campaign_performance', locale),
      description: t('reports.desc.campaign_performance', locale),
      icon: ChartBarIcon,
    },
  ]

  const handleExport = async (type: string, format: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/reports/${type}/export`, {
        params: { format, period: dateRange },
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${type}-report.${format === 'excel' ? 'xlsx' : 'pdf'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('nav.reports', locale)}</h1>
          <p className="text-gray-500 mt-1">
            {t('reports.subtitle', locale)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="today">{t('reports.period.today', locale)}</option>
            <option value="this_week">{t('reports.period.this_week', locale)}</option>
            <option value="this_month">{t('reports.period.this_month', locale)}</option>
            <option value="last_month">{t('reports.period.last_month', locale)}</option>
            <option value="this_quarter">{t('reports.period.this_quarter', locale)}</option>
            <option value="this_year">{t('reports.period.this_year', locale)}</option>
            <option value="last_year">{t('reports.period.last_year', locale)}</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-gray-500">{t('reports.total_collected', locale)}</p>
            <p className="text-3xl font-bold text-primary-600 mt-1">
              {formatCurrency(summary?.total_collected || 0, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-gray-500">{t('reports.total_distributed', locale)}</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {formatCurrency(summary?.total_distributed || 0, locale)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-gray-500">{t('reports.beneficiaries_served', locale)}</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {(summary?.total_beneficiaries || 0).toLocaleString(locale)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fund Balances */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.fund_balances', locale)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-600 font-medium">{t('reports.fund.zakat', locale)}</p>
              <p className="text-2xl font-bold text-primary-700 mt-1">
                {formatCurrency(summary?.fund_balances?.zakat || 0, locale)}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">{t('reports.fund.sadaqah', locale)}</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {formatCurrency(summary?.fund_balances?.sadaqah || 0, locale)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">{t('reports.fund.general', locale)}</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {formatCurrency(summary?.fund_balances?.general || 0, locale)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reports.available_reports', locale)}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {reportTypes.map((report) => (
              <div
                key={report.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <report.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{report.name}</p>
                    <p className="text-sm text-gray-500">{report.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(report.id, 'pdf')}
                  >
                    <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(report.id, 'excel')}
                  >
                    <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                    Excel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  )
}
