import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, type PaginatedResponse } from '../../lib/api'
import { formatCurrency, formatDate } from '../../lib/utils'
import { t } from '../../lib/i18n'
import { useLocaleStore } from '../../stores/locale'
import {
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui'
import { useAuthStore } from '../../stores/auth'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import type { Distribution } from '../../types'

const statusColors: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  draft: 'default',
  approved: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'danger',
}

export default function DistributionsPage() {
  const { hasPermission } = useAuthStore()
  const { locale } = useLocaleStore()
  const isAr = locale === 'ar'
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')

  const fundTypeLabels: Record<string, string> = {
    zakat: t('fund_type.zakat', locale),
    sadaqah: t('fund_type.sadaqah', locale),
    general: t('fund_type.general', locale),
  }

  const statusLabels: Record<string, string> = {
    draft: t('distribution_status.draft', locale),
    approved: t('distribution_status.approved', locale),
    in_progress: t('distribution_status.in_progress', locale),
    completed: t('distribution_status.completed', locale),
    cancelled: t('distribution_status.cancelled', locale),
  }

  const { data: distributionsData, isLoading } = useQuery<PaginatedResponse<Distribution>>({
    queryKey: ['distributions', page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      const response = await api.get(`/distributions?${params}`)
      return response.data
    },
  })

  const distributions = distributionsData?.data || []
  const meta = distributionsData?.meta

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('distributions.title', locale)}</h1>
          <p className="text-gray-500 mt-1">
            {t('distributions.subtitle', locale)}
          </p>
        </div>
        {hasPermission('distributions.create') && (
          <Button leftIcon={<PlusIcon className={`w-5 h-5 ${isAr ? 'ml-2' : 'mr-2'}`} />}>
            {t('distributions.new', locale)}
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <ClockIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('distributions.pending_approval', locale)}</p>
                <p className="text-xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClockIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('distributions.in_progress', locale)}</p>
                <p className="text-xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('distributions.completed_month', locale)}</p>
                <p className="text-xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">{t('distributions.total_month', locale)}</p>
            <p className="text-xl font-bold text-primary-600 mt-1">
              {formatCurrency(0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('distributions.search', locale)}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className={`w-5 h-5 ${isAr ? 'ml-2' : 'mr-2'}`} />}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">{t('distributions.all_status', locale)}</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distributions Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={isAr ? 'text-right' : 'text-left'}>{t('distributions.reference', locale)}</TableHead>
              <TableHead className={isAr ? 'text-right' : 'text-left'}>{t('distributions.fund_type', locale)}</TableHead>
              <TableHead className={isAr ? 'text-right' : 'text-left'}>{t('distributions.beneficiaries', locale)}</TableHead>
              <TableHead className={isAr ? 'text-right' : 'text-left'}>{t('distributions.total_amount', locale)}</TableHead>
              <TableHead className={isAr ? 'text-right' : 'text-left'}>{t('distributions.distributed', locale)}</TableHead>
              <TableHead className={isAr ? 'text-right' : 'text-left'}>{t('distributions.status', locale)}</TableHead>
              <TableHead className={isAr ? 'text-right' : 'text-left'}>{t('distributions.scheduled', locale)}</TableHead>
              <TableHead className={isAr ? 'text-left' : 'text-right'}>{t('common.actions', locale)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : distributions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {t('distributions.no_results', locale)}
                </TableCell>
              </TableRow>
            ) : (
              distributions.map((distribution) => (
                <TableRow key={distribution.id}>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {distribution.reference_number}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {fundTypeLabels[distribution.fund_type] || distribution.fund_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{distribution.beneficiary_count}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(distribution.total_amount, distribution.currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{
                            width: distribution.total_amount > 0
                              ? `${(distribution.distributed_amount / distribution.total_amount) * 100}%`
                              : '0%',
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {distribution.total_amount > 0
                          ? `${Math.round((distribution.distributed_amount / distribution.total_amount) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[distribution.status]}>
                      {statusLabels[distribution.status] || distribution.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {distribution.scheduled_date
                      ? formatDate(distribution.scheduled_date)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-2 ${isAr ? 'justify-start' : 'justify-end'}`}>
                      <button
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                        title={t('common.edit', locale)}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {distribution.status === 'draft' && hasPermission('distributions.approve') && (
                        <button
                          className="p-1.5 text-gray-400 hover:text-green-600 rounded"
                          title={t('campaign.approve', locale)}
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {t('beneficiaries.showing', locale)} {meta.from} {t('beneficiaries.to', locale)} {meta.to} {t('beneficiaries.of', locale)} {meta.total} {t('beneficiaries.results', locale)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                {t('common.previous', locale)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === meta.last_page}
                onClick={() => setPage(page + 1)}
              >
                {t('common.next', locale)}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
