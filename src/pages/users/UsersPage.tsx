import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage, type PaginatedResponse } from '../../lib/api'
import { formatDate, getInitials, stringToColor } from '../../lib/utils'
import { t } from '../../lib/i18n'
import { useLocaleStore } from '../../stores/locale'
import {
  Button,
  Input,
  Badge,
  Modal,
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
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import type { User, Role } from '../../types'

interface UserFormData {
  email: string
  first_name: string
  last_name: string
  first_name_ar?: string
  last_name_ar?: string
  phone?: string
  locale: 'en' | 'ar'
  is_active: boolean
  role_ids: string[]
  password?: string
  password_confirmation?: string
}

const defaultFormData: UserFormData = {
  email: '',
  first_name: '',
  last_name: '',
  first_name_ar: '',
  last_name_ar: '',
  phone: '',
  locale: 'en',
  is_active: true,
  role_ids: [],
  password: '',
  password_confirmation: '',
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuthStore()
  const { locale } = useLocaleStore()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserFormData>(defaultFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  // Fetch users
  const { data: usersData, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ['users', page, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      if (search) params.append('search', search)
      const response = await api.get(`/users?${params}`)
      return response.data
    },
  })

  // Fetch roles for the form
  const { data: rolesData } = useQuery<{ data: Role[] }>({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get('/roles')
      return response.data
    },
  })

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await api.post('/users', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsModalOpen(false)
      resetForm()
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      setFormErrors({ general: message })
    },
  })

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UserFormData }) => {
      const response = await api.put(`/users/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsModalOpen(false)
      resetForm()
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      setFormErrors({ general: message })
    },
  })

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsDeleteModalOpen(false)
      setUserToDelete(null)
    },
  })

  const resetForm = () => {
    setFormData(defaultFormData)
    setSelectedUser(null)
    setFormErrors({})
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      first_name_ar: user.first_name_ar || '',
      last_name_ar: user.last_name_ar || '',
      phone: user.phone || '',
      locale: user.locale,
      is_active: user.is_active,
      role_ids: user.roles.map((r) => r.id),
      password: '',
      password_confirmation: '',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    if (selectedUser) {
      updateMutation.mutate({ id: selectedUser.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (user: User) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id)
    }
  }

  const users = usersData?.data || []
  const roles = rolesData?.data || []
  const meta = usersData?.meta

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('users.title', locale)}</h1>
          <p className="text-gray-500 mt-1">{t('users.subtitle', locale)}</p>
        </div>
        {hasPermission('users.create') && (
          <Button leftIcon={<PlusIcon className="w-5 h-5" />} onClick={openCreateModal}>
            {t('users.new', locale)}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('users.search', locale)}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('users.title', locale)}</TableHead>
              <TableHead>{t('users.email', locale)}</TableHead>
              <TableHead>{t('users.role', locale)}</TableHead>
              <TableHead>{t('users.status', locale)}</TableHead>
              <TableHead>{t('users.created_at', locale)}</TableHead>
              <TableHead className={locale === 'ar' ? 'text-left' : 'text-right'}>{t('common.actions', locale)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {t('users.no_results', locale)}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${stringToColor(
                          user.full_name
                        )}`}
                      >
                        {getInitials(user.full_name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        {user.phone && (
                          <p className={`text-xs text-gray-500 ${locale === 'ar' ? 'text-right' : ''}`}>{user.phone}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role.id} variant="secondary" size="sm">
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'success' : 'danger'}>
                      {user.is_active ? t('users.active', locale) : t('users.inactive', locale)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {user.last_login_at ? formatDate(user.last_login_at) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-2 ${locale === 'ar' ? 'justify-start' : 'justify-end'}`}>
                      <button
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                        title={t('common.edit', locale)}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {hasPermission('users.update') && (
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                          title={t('common.edit', locale)}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                      {hasPermission('users.delete') && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                          title={t('common.delete', locale)}
                        >
                          <TrashIcon className="w-4 h-4" />
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
              {locale === 'ar' 
                ? `عرض من ${meta.from} إلى ${meta.to} من أصل ${meta.total} نتائج`
                : `Showing ${meta.from} to ${meta.to} of ${meta.total} results`}
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? t('users.edit', locale) : t('users.new', locale)}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formErrors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {formErrors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('users.first_name', locale)}
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <Input
              label={t('users.last_name', locale)}
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
            <Input
              label={t('users.first_name_ar', locale)}
              value={formData.first_name_ar}
              onChange={(e) => setFormData({ ...formData, first_name_ar: e.target.value })}
              dir="rtl"
            />
            <Input
              label={t('users.last_name_ar', locale)}
              value={formData.last_name_ar}
              onChange={(e) => setFormData({ ...formData, last_name_ar: e.target.value })}
              dir="rtl"
            />
          </div>

          <Input
            label={t('users.email', locale)}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label={t('users.phone', locale)}
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('users.password', locale)}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!selectedUser}
              hint={selectedUser ? t('users.password_hint', locale) : undefined}
            />
            <Input
              label={t('users.password_confirm', locale)}
              type="password"
              value={formData.password_confirmation}
              onChange={(e) =>
                setFormData({ ...formData, password_confirmation: e.target.value })
              }
              required={!selectedUser}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('users.role', locale)}</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.role_ids.includes(role.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          role_ids: [...formData.role_ids, role.id],
                        })
                      } else {
                        setFormData({
                          ...formData,
                          role_ids: formData.role_ids.filter((id) => id !== role.id),
                        })
                      }
                    }}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{role.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{t('users.active', locale)}</span>
            </label>

            <label className="flex items-center gap-2">
              <select
                value={formData.locale}
                onChange={(e) =>
                  setFormData({ ...formData, locale: e.target.value as 'en' | 'ar' })
                }
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              >
                <option value="en">{t('lang.english', locale)}</option>
                <option value="ar">{t('lang.arabic', locale)}</option>
              </select>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel', locale)}
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {selectedUser ? t('common.save', locale) : t('users.new', locale)}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('common.delete', locale)}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {locale === 'ar' 
              ? `هل أنت متأكد من حذف ${userToDelete?.full_name}؟ لا يمكن التراجع عن هذا الإجراء.`
              : `Are you sure you want to delete ${userToDelete?.full_name}? This action cannot be undone.`}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              {t('common.cancel', locale)}
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
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
