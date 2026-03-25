import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '../../lib/api'
import {
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui'
import { useAuthStore } from '../../stores/auth'
import { useLocaleStore } from '../../stores/locale'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  InboxIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import type { DonationType } from '../../types'
import { t } from '../../lib/i18n'

interface DonationTypeForm {
  name_en: string
  name_ar: string
  description_en: string
  description_ar: string
  slug: string
  is_zakat_eligible: boolean
  is_active: boolean
  display_order: number
}

const emptyForm: DonationTypeForm = {
  name_en: '',
  name_ar: '',
  description_en: '',
  description_ar: '',
  slug: '',
  is_zakat_eligible: false,
  is_active: true,
  display_order: 0,
}

export default function DonationTypesPage() {
  const { hasPermission } = useAuthStore()
  const { locale } = useLocaleStore()
  const isAr = locale === 'ar'
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DonationTypeForm>(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useQuery<DonationType[]>({
    queryKey: ['donation-types'],
    queryFn: async () => {
      const response = await api.get('/donation-types/admin/list')
      return response.data.data
    },
  })

  const donationTypes: DonationType[] = data || []

  const saveMutation = useMutation({
    mutationFn: async (formData: DonationTypeForm) => {
      const payload = {
        name: { en: formData.name_en, ar: formData.name_ar || undefined },
        description: { en: formData.description_en, ar: formData.description_ar || undefined },
        slug: formData.slug,
        is_zakat_eligible: formData.is_zakat_eligible,
        is_active: formData.is_active,
        display_order: formData.display_order,
      }

      if (editingId) {
        return api.put(`/donation-types/admin/${editingId}`, payload)
      } else {
        return api.post('/donation-types/admin', payload)
      }
    },
    onSuccess: () => {
      toast.success(editingId ? t('donation_types.updated', locale) : t('donation_types.created', locale))
      queryClient.invalidateQueries({ queryKey: ['donation-types'] })
      closeModal()
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/donation-types/admin/${id}`)
    },
    onSuccess: () => {
      toast.success(t('donation_types.deleted', locale))
      queryClient.invalidateQueries({ queryKey: ['donation-types'] })
      setDeleteId(null)
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (dt: DonationType) => {
    setEditingId(dt.id)
    setForm({
      name_en: dt.name?.en || '',
      name_ar: dt.name?.ar || '',
      description_en: dt.description?.en || '',
      description_ar: dt.description?.ar || '',
      slug: dt.slug,
      is_zakat_eligible: dt.is_zakat_eligible,
      is_active: dt.is_active,
      display_order: dt.display_order,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate(form)
  }

  const canManage = hasPermission('settings.manage') || hasPermission('donation_types.manage')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('donation_types.title', locale)}</h1>
          <p className="text-gray-500 mt-1">
            {t('donation_types.subtitle', locale)}
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate} leftIcon={<PlusIcon className={`w-5 h-5 ${isAr ? 'ml-2' : 'mr-2'}`} />}>
            {t('donation_types.add', locale)}
          </Button>
        )}
      </div>

      {/* Content */}
      {error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-900 font-medium mb-2">{t('donation_types.load_failed', locale)}</p>
            <p className="text-gray-500 text-sm mb-4">{t('common.error', locale)}</p>
            <Button variant="outline" onClick={() => refetch()}>
              {t('common.retry', locale)}
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="space-y-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="h-5 bg-gray-100 rounded w-48 flex-1" />
                  <div className="h-5 bg-gray-200 rounded w-16" />
                  <div className="h-5 bg-gray-200 rounded w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : donationTypes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <InboxIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-900 font-medium mb-2">{t('donation_types.no_results', locale)}</p>
            <p className="text-gray-500 text-sm mb-4">{t('donation_types.no_results_hint', locale)}</p>
            {canManage && (
              <Button onClick={openCreate} leftIcon={<PlusIcon className={`w-5 h-5 ${isAr ? 'ml-2' : 'mr-2'}`} />}>
                {t('donation_types.add', locale)}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={isAr ? 'text-right' : 'text-left'}>{t('donation_types.display_order', locale)}</TableHead>
                <TableHead className={isAr ? 'text-right' : 'text-left'}>{t('common.name', locale)}</TableHead>
                <TableHead className={isAr ? 'text-right' : 'text-left'}>{t('donation_types.slug', locale)}</TableHead>
                <TableHead className={isAr ? 'text-right' : 'text-left'}>{t('common.description', locale)}</TableHead>
                <TableHead className={isAr ? 'text-right' : 'text-left'}>{t('donation_types.zakat_eligible', locale)}</TableHead>
                <TableHead className={isAr ? 'text-right' : 'text-left'}>{t('common.status', locale)}</TableHead>
                {canManage && <TableHead className={isAr ? 'text-left' : 'text-right'}>{t('common.actions', locale)}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {donationTypes.map((dt) => (
                <TableRow key={dt.id}>
                  <TableCell className="text-gray-500 w-16">{dt.display_order}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{isAr ? dt.name?.ar : dt.name?.en}</p>
                      {isAr ? (
                         dt.name?.en && <p className="text-sm text-gray-500" dir="ltr">{dt.name.en}</p>
                      ) : (
                        dt.name?.ar && <p className="text-sm text-gray-500 font-arabic" dir="rtl">{dt.name.ar}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{dt.slug}</code>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-gray-500 truncate">{isAr ? (dt.description?.ar || '—') : (dt.description?.en || '—')}</p>
                  </TableCell>
                  <TableCell>
                    {dt.is_zakat_eligible ? (
                      <Badge variant="success" size="sm">{t('common.yes', locale)}</Badge>
                    ) : (
                      <Badge variant="default" size="sm">{t('common.no', locale)}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {dt.is_active ? (
                      <Badge variant="success" size="sm">{t('common.active', locale)}</Badge>
                    ) : (
                      <Badge variant="danger" size="sm">{t('common.inactive', locale)}</Badge>
                    )}
                  </TableCell>
                  {canManage && (
                    <TableCell className={isAr ? 'text-left' : 'text-right'}>
                      <div className={`flex items-center gap-1 ${isAr ? 'justify-start' : 'justify-end'}`}>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(dt)}>
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(dt.id)}>
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingId ? t('donation_types.edit', locale) : t('donation_types.add', locale)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('donation_types.name_en', locale)}
              value={form.name_en}
              onChange={(e) => setForm({ ...form, name_en: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('donation_types.name_ar', locale)}
              </label>
              <input
                type="text"
                dir="rtl"
                value={form.name_ar}
                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-arabic"
              />
            </div>
          </div>

          <Input
            label={t('donation_types.slug', locale)}
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="e.g., zakat, sadaqah"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                 {t('donation_types.desc_en', locale)}
              </label>
              <textarea
                value={form.description_en}
                onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                 {t('donation_types.desc_ar', locale)}
              </label>
              <textarea
                dir="rtl"
                value={form.description_ar}
                onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-arabic"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_zakat_eligible}
                onChange={(e) => setForm({ ...form, is_zakat_eligible: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{t('donation_types.zakat_eligible', locale)}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{t('common.active', locale)}</span>
            </label>
            
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('donation_types.display_order', locale)}
              </label>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
            >
              {t('common.cancel', locale)}
            </Button>
            <Button
              type="submit"
              isLoading={saveMutation.isPending}
            >
              {editingId ? t('common.save', locale) : t('common.create', locale)}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title={t('common.delete', locale)}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {t('donation_types.delete_confirm', locale)}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
            >
              {t('common.cancel', locale)}
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              isLoading={deleteMutation.isPending}
            >
              {t('common.delete', locale)}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
