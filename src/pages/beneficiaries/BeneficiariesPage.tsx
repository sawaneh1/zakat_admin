import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, type PaginatedResponse } from '../../lib/api'
import { formatCurrency } from '../../lib/utils'
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
  FunnelIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'
import type { Beneficiary, BeneficiaryCategory } from '../../types'

const categoryColors: Record<BeneficiaryCategory, 'default' | 'success' | 'warning' | 'info' | 'secondary'> = {
  poor: 'warning',
  needy: 'warning',
  zakat_worker: 'info',
  new_muslim: 'success',
  debt_relief: 'secondary',
  fisabilillah: 'info',
  wayfarer: 'default',
}

export default function BeneficiariesPage() {
  const { hasPermission } = useAuthStore()
  const { locale } = useLocaleStore()
  const isAr = locale === 'ar'
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState<string>('')

  const { data: beneficiariesData, isLoading } = useQuery<PaginatedResponse<Beneficiary>>({
    queryKey: ['beneficiaries', page, search, category],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      const response = await api.get(`/beneficiaries?${params}`)
      return response.data
    },
  })

  const beneficiaries = beneficiariesData?.data || []
  const meta = beneficiariesData?.meta

  const categoryLabels: Record<BeneficiaryCategory, string> = {
    poor: t('beneficiary_category.poor', locale),
    needy: t('beneficiary_category.needy', locale),
    zakat_worker: t('beneficiary_category.zakat_worker', locale),
    new_muslim: t('beneficiary_category.new_muslim', locale),
    debt_relief: t('beneficiary_category.debt_relief', locale),
    fisabilillah: t('beneficiary_category.fisabilillah', locale),
    wayfarer: t('beneficiary_category.wayfarer', locale),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('beneficiaries.title', locale)}</h1>
          <p className="text-gray-500 mt-1">
            {t('beneficiaries.subtitle', locale)}
          </p>
        </div>
        {hasPermission('beneficiaries.create') && (
          <Button leftIcon={<PlusIcon className={`w-5 h-5 ${isAr ? 'ml-2' : 'mr-2'}`} />}>
            {t('beneficiaries.add', locale)}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('beneficiaries.search', locale)}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('beneficiaries.all_categories', locale)}</option>
                {(Object.keys(categoryLabels) as BeneficiaryCategory[]).map((key) => (
                  <option key={key} value={key}>
                    {categoryLabels[key]}
                  </option>
                ))}
              </select>
              <Button variant="outline" leftIcon={<FunnelIcon className="w-4 h-4" />}>
                {t('beneficiaries.more_filters', locale)}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Beneficiaries Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('beneficiaries.name', locale)}</TableHead>
              <TableHead>{t('beneficiaries.reference', locale)}</TableHead>
              <TableHead>{t('beneficiaries.category', locale)}</TableHead>
              <TableHead>{t('beneficiaries.family_size', locale)}</TableHead>
              <TableHead>{t('beneficiaries.total_received', locale)}</TableHead>
              <TableHead>{t('beneficiaries.status', locale)}</TableHead>
              <TableHead className={isAr ? 'text-left' : 'text-right'}>{t('common.actions', locale)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : beneficiaries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {t('beneficiaries.no_results', locale)}
                </TableCell>
              </TableRow>
            ) : (
              beneficiaries.map((beneficiary) => (
                <TableRow key={beneficiary.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{beneficiary.full_name}</p>
                      {beneficiary.phone && (
                        <p className="text-xs text-gray-500">{beneficiary.phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {beneficiary.reference_number}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={categoryColors[beneficiary.category]}>
                      {categoryLabels[beneficiary.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>{beneficiary.family_size}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(beneficiary.total_received)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={beneficiary.is_verified ? 'success' : 'warning'}>
                        {beneficiary.is_verified ? t('beneficiaries.verified', locale) : t('beneficiaries.pending', locale)}
                      </Badge>
                      {!beneficiary.is_active && (
                        <Badge variant="danger">{t('beneficiaries.inactive', locale)}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-2 ${isAr ? 'justify-start' : 'justify-end'}`}>
                      <button
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                        title={t('common.edit', locale)}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {hasPermission('beneficiaries.update') && (
                        <button
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                          title={t('common.edit', locale)}
                        >
                          <PencilIcon className="w-4 h-4" />
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
