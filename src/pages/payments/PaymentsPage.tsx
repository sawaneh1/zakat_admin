import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type PaginatedResponse } from '../../lib/api'
import { formatCurrency, formatDate } from '../../lib/utils'
import { localized, t } from '../../lib/i18n'
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
  Modal,
  Select,
} from '../../components/ui'
import { useAuthStore } from '../../stores/auth'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BanknotesIcon,
  CalendarIcon,
  TagIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import type { Payment } from '../../types'

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  confirmed: 'success',
  pending: 'warning',
  paid_unconfirmed: 'warning',
  draft: 'default',
  allocated: 'default',
  disbursed: 'success',
  cancelled: 'danger',
  refunded: 'default',
}

export default function PaymentsPage() {
  const { hasPermission } = useAuthStore()
  const { locale } = useLocaleStore()
  const isAr = locale === 'ar'
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [type, setType] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const [showRecordModal, setShowRecordModal] = useState(false)
  const [recordForm, setRecordForm] = useState({
    amount: '',
    donation_type_id: '',
    donation_context: 'general' as 'general' | 'campaign',
    payment_method: 'cash',
    donor_name: '',
    donor_phone: '',
    donor_email: '',
    notes: '',
    status: 'confirmed',
  })

  const { data: donationTypesData } = useQuery<{ data: any[] }>({
    queryKey: ['donation-types'],
    queryFn: async () => {
      const response = await api.get('/donation-types/admin/list')
      return response.data
    },
  })

  const donationTypes = donationTypesData?.data || []

  const { data: paymentsData, isLoading } = useQuery<PaginatedResponse<Payment>>({
    queryKey: ['payments', page, search, type, status],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      if (search) params.append('search', search)
      if (type) params.append('type', type)
      if (status) params.append('status', status)
      const response = await api.get(`/admin/payments?${params}`)
      return response.data
    },
  })

  const paymentTypeLabels: Record<string, string> = {
    zakat: t('payment_type.zakat', locale),
    sadaqah: t('payment_type.sadaqah', locale),
    campaign: t('payment_type.campaign', locale),
    other: t('payment_type.other', locale),
  }

  const methodLabels: Record<string, string> = {
    cash: t('payment_method.cash', locale),
    bank_transfer: t('payment_method.bank_transfer', locale),
    mobile_money: t('payment_method.mobile_money', locale),
    card: t('payment_method.card', locale),
    other: t('payment_method.other', locale),
  }

  const statusLabels: Record<string, string> = {
    draft: t('payment_status.draft', locale),
    pending: t('payment_status.pending', locale),
    paid_unconfirmed: t('payment_status.paid_unconfirmed', locale),
    confirmed: t('payment_status.confirmed', locale),
    allocated: t('payment_status.allocated', locale),
    disbursed: t('payment_status.disbursed', locale),
    cancelled: t('payment_status.cancelled', locale),
    refunded: t('payment_status.refunded', locale),
  }

  const confirmMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const response = await api.put(`/admin/payments/${paymentId}/confirm`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setShowModal(false)
      setSelectedPayment(null)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ paymentId, reason }: { paymentId: string; reason: string }) => {
      const response = await api.put(`/admin/payments/${paymentId}/reject`, { reason })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setShowRejectModal(false)
      setShowModal(false)
      setSelectedPayment(null)
      setRejectReason('')
    },
  })

  const recordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/admin/payments', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      setShowRecordModal(false)
      setRecordForm({
        amount: '',
        donation_type_id: '',
        donation_context: 'general',
        payment_method: 'cash',
        donor_name: '',
        donor_phone: '',
        donor_email: '',
        notes: '',
        status: 'confirmed',
      })
    },
  })

  const openPaymentDetail = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowModal(true)
  }

  const handleConfirm = () => {
    if (selectedPayment) {
      confirmMutation.mutate(selectedPayment.id)
    }
  }

  const handleReject = () => {
    if (selectedPayment && rejectReason.trim()) {
      rejectMutation.mutate({ paymentId: selectedPayment.id, reason: rejectReason })
    }
  }

  const payments = paymentsData?.data || []
  const meta = paymentsData?.meta

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('payments.title', locale)}</h1>
          <p className="text-gray-500 mt-1">{t('payments.subtitle', locale)}</p>
        </div>
        {hasPermission('payments.create') && (
          <Button 
            leftIcon={<PlusIcon className={`w-5 h-5 ${isAr ? 'ml-2' : 'mr-2'}`} />}
            onClick={() => setShowRecordModal(true)}
          >
            {t('payments.record', locale)}
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">{t('payments.today', locale)}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">{t('payments.this_week', locale)}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">{t('payments.this_month', locale)}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">{t('payments.pending', locale)}</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
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
                placeholder={t('payments.search', locale)}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className={`w-5 h-5 ${isAr ? 'ml-2' : 'mr-2'}`} />}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">{t('payments.all_types', locale)}</option>
                {Object.entries(paymentTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">{t('payments.all_status', locale)}</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('payments.reference', locale)}</TableHead>
              <TableHead>{t('payments.donor', locale)}</TableHead>
              <TableHead>{t('payments.type', locale)}</TableHead>
              <TableHead>{t('payments.method', locale)}</TableHead>
              <TableHead>{t('payments.amount', locale)}</TableHead>
              <TableHead>{t('payments.status', locale)}</TableHead>
              <TableHead>{t('payments.date', locale)}</TableHead>
              <TableHead className={isAr ? 'text-left' : 'text-right'}>{t('payments.actions', locale)}</TableHead>
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
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {t('payments.no_results', locale)}
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {payment.reference}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">
                        {payment.is_anonymous ? t('payments.anonymous', locale) : payment.donor_name || '-'}
                      </p>
                      {payment.donor_phone && (
                        <p className="text-xs text-gray-500">{payment.donor_phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {paymentTypeLabels[payment.payment_type] || payment.payment_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {methodLabels[payment.payment_method] || payment.payment_method}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(payment.amount, payment.currency_code)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[payment.status]}>
                      {statusLabels[payment.status] || payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {formatDate(payment.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-2 ${isAr ? 'justify-start' : 'justify-end'}`}>
                      <button
                        onClick={() => openPaymentDetail(payment)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                        title={t('common.edit', locale)}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
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

      {/* Payment Detail Modal */}
      {showModal && selectedPayment && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className={`bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t('payments.details', locale)}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('payments.reference', locale)}: <code className="bg-gray-100 px-2 py-0.5 rounded">{selectedPayment.reference}</code>
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={statusColors[selectedPayment.status]} 
                    className="text-sm px-3 py-1"
                  >
                    {(statusLabels[selectedPayment.status] || selectedPayment.status).toUpperCase()}
                  </Badge>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(selectedPayment.amount, selectedPayment.currency_code)}
                  </span>
                </div>

                {/* Donor Info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    {t('payments.donor_info', locale)}
                  </h3>
                  {selectedPayment.is_anonymous ? (
                    <p className="text-gray-500 italic">{t('payments.anonymous', locale)}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{selectedPayment.donor_name || '-'}</span>
                      </div>
                      {selectedPayment.donor_phone && (
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{selectedPayment.donor_phone}</span>
                        </div>
                      )}
                      {selectedPayment.donor_email && (
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{selectedPayment.donor_email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-500 flex items-center gap-1">
                      <TagIcon className="w-4 h-4" /> {t('payments.type', locale)}
                    </p>
                    <p className="font-medium text-gray-900">
                      {paymentTypeLabels[selectedPayment.payment_type] || selectedPayment.payment_type}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 flex items-center gap-1">
                      <BanknotesIcon className="w-4 h-4" /> {t('payments.method', locale)}
                    </p>
                    <p className="font-medium text-gray-900">
                      {methodLabels[selectedPayment.payment_method] || selectedPayment.payment_method}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" /> {t('payments.date', locale)}
                    </p>
                    <p className="font-medium text-gray-900">
                      {formatDate(selectedPayment.created_at)}
                    </p>
                  </div>
                </div>

                {/* Campaign Info */}
                {selectedPayment.campaign && (
                  <div className="bg-primary-50 rounded-xl p-4">
                    <p className="text-sm text-primary-600 font-medium">{t('payments.campaign_donation', locale)}</p>
                    <p className="text-gray-900 font-semibold mt-1">
                      {localized(selectedPayment.campaign.title, locale)}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {selectedPayment.notes && (
                  <div className="space-y-2">
                    <p className="text-gray-500 flex items-center gap-1 text-sm">
                      <DocumentTextIcon className="w-4 h-4" /> {t('payments.notes', locale)}
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                      {selectedPayment.notes}
                    </div>
                  </div>
                )}

                {/* External Reference */}
                {selectedPayment.external_reference && (
                  <div className="border-t border-gray-200 pt-4 mt-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      {t('payments.external_reference', locale)}
                    </p>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded select-all">
                      {selectedPayment.external_reference}
                    </code>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                {hasPermission('payments.verify') && selectedPayment.status === 'pending' && (
                  <>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setShowRejectModal(true)
                        // Don't close main modal yet
                      }}
                      leftIcon={<XCircleIcon className={`w-5 h-5 ${isAr ? 'ml-2' : 'mr-2'}`} />}
                    >
                      {t('payments.reject', locale)}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleConfirm}
                      isLoading={confirmMutation.isPending}
                      leftIcon={<CheckCircleIcon className={`w-5 h-5 ${isAr ? 'ml-2' : 'mr-2'}`} />}
                    >
                      {t('payments.confirm', locale)}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  {t('common.close', locale)}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowRejectModal(false)}
          />
          <div className={`bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative z-10 ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'}>
            <h3 className="text-lg font-semibold text-gray-900">{t('payments.reject_payment', locale)}</h3>
            <div className="mt-4">
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder={t('payments.reject_placeholder', locale)}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
              >
                {t('common.cancel', locale)}
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                isLoading={rejectMutation.isPending}
                disabled={!rejectReason.trim()}
              >
                {t('payments.reject_title', locale)}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        title={t('payments.record', locale)}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('payments.amount', locale)}
              type="number"
              min="0"
              step="0.01"
              value={recordForm.amount}
              onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })}
              required
            />
            <Select
              label={t('payments.donation_type', locale)}
              value={recordForm.donation_type_id}
              onChange={(e) => setRecordForm({ ...recordForm, donation_type_id: e.target.value })}
              options={[
                { value: '', label: t('payments.select_type', locale) },
                ...donationTypes.map((dt: any) => ({
                  value: dt.id,
                  label: localized(dt.name, locale)
                }))
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={t('payments.payment_method', locale)}
              value={recordForm.payment_method}
              onChange={(e) => setRecordForm({ ...recordForm, payment_method: e.target.value })}
              options={Object.entries(methodLabels).map(([value, label]) => ({ value, label }))}
            />
            <Select
              label={t('payments.initial_status', locale)}
              value={recordForm.status}
              onChange={(e) => setRecordForm({ ...recordForm, status: e.target.value })}
              options={[
                { value: 'confirmed', label: t('payments.status_confirmed', locale) },
                { value: 'pending', label: t('payments.status_pending', locale) },
              ]}
            />
          </div>

          <div className="border-t border-gray-200 pt-4 mt-2">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{t('payments.donor_info_optional', locale)}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('payments.donor_name', locale)}
                value={recordForm.donor_name}
                onChange={(e) => setRecordForm({ ...recordForm, donor_name: e.target.value })}
              />
              <Input
                label={t('payments.phone_number', locale)}
                value={recordForm.donor_phone}
                onChange={(e) => setRecordForm({ ...recordForm, donor_phone: e.target.value })}
              />
              <Input
                label={t('users.email', locale)}
                type="email"
                className="sm:col-span-2"
                value={recordForm.donor_email}
                onChange={(e) => setRecordForm({ ...recordForm, donor_email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('payments.notes', locale)}
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={2}
              placeholder={t('payments.additional_info', locale)}
              value={recordForm.notes}
              onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowRecordModal(false)}
            >
              {t('common.cancel', locale)}
            </Button>
            <Button
              onClick={() => recordMutation.mutate(recordForm)}
              isLoading={recordMutation.isPending}
              disabled={!recordForm.amount || !recordForm.donation_type_id}
            >
              {t('common.save', locale)}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
