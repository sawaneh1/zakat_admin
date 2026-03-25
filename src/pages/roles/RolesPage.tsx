import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '../../lib/api'
import { t } from '../../lib/i18n'
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
import { useLocaleStore } from '../../stores/locale'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import type { Role, Permission } from '../../types'

interface RoleFormData {
  name: string
  slug: string
  description: string
  permission_ids: string[]
}

const defaultFormData: RoleFormData = {
  name: '',
  slug: '',
  description: '',
  permission_ids: [],
}

export default function RolesPage() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuthStore()
  const { locale } = useLocaleStore()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState<RoleFormData>(defaultFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  // Fetch roles
  const { data: rolesData, isLoading } = useQuery<{ data: Role[] }>({
    queryKey: ['roles', search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      const response = await api.get(`/roles?${params}`)
      return response.data
    },
  })

  // Fetch permissions for the form
  const { data: permissionsData } = useQuery<{ data: Permission[] }>({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await api.get('/permissions')
      return response.data
    },
  })

  // Create role mutation
  const createMutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      const response = await api.post('/roles', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setIsModalOpen(false)
      resetForm()
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      setFormErrors({ general: message })
    },
  })

  // Update role mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RoleFormData }) => {
      const response = await api.put(`/roles/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setIsModalOpen(false)
      resetForm()
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      setFormErrors({ general: message })
    },
  })

  // Delete role mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/roles/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setIsDeleteModalOpen(false)
      setRoleToDelete(null)
    },
  })

  const resetForm = () => {
    setFormData(defaultFormData)
    setSelectedRole(null)
    setFormErrors({})
  }

  const openCreateModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      permission_ids: role.permissions.map((p) => p.id),
    })
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    if (selectedRole) {
      updateMutation.mutate({ id: selectedRole.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (role: Role) => {
    setRoleToDelete(role)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete.id)
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setFormData({ ...formData, name, slug })
  }

  const roles = rolesData?.data || []
  const permissions = permissionsData?.data || []

  // Group permissions by their group
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.group]) {
      acc[permission.group] = []
    }
    acc[permission.group].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('roles.title', locale)}</h1>
          <p className="text-gray-500 mt-1">{t('roles.subtitle', locale)}</p>
        </div>
        {hasPermission('roles.create') && (
          <Button leftIcon={<PlusIcon className="w-5 h-5" />} onClick={openCreateModal}>
            {t('roles.new', locale)}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder={t('common.search', locale)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('roles.name', locale)}</TableHead>
              <TableHead>{t('donation_types.slug', locale)}</TableHead>
              <TableHead>{t('roles.permissions', locale)}</TableHead>
              <TableHead>{t('users.title', locale)}</TableHead>
              <TableHead>{t('common.status', locale)}</TableHead>
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
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {t('campaigns.no_results', locale)}
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <ShieldCheckIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{role.name}</p>
                        {role.description && (
                          <p className={`text-xs text-gray-500 truncate max-w-xs ${locale === 'ar' ? 'text-right' : ''}`}>
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {role.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {role.permissions.length} {t('roles.permissions', locale)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {role.users_count ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.is_system ? 'info' : 'default'}>
                      {role.is_system ? (locale === 'ar' ? 'نظام' : 'System') : (locale === 'ar' ? 'مخصص' : 'Custom')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-2 ${locale === 'ar' ? 'justify-start' : 'justify-end'}`}>
                      {hasPermission('roles.update') && !role.is_system && (
                        <button
                          onClick={() => openEditModal(role)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded"
                          title={t('common.edit', locale)}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      )}
                      {hasPermission('roles.delete') && !role.is_system && (
                        <button
                          onClick={() => handleDelete(role)}
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
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRole ? t('common.edit', locale) : t('roles.new', locale)}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formErrors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {formErrors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('roles.name', locale)}
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
            <Input
              label={t('donation_types.slug', locale)}
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              hint="URL-friendly identifier"
            />
          </div>

          <Input
            label={t('roles.description', locale)}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('roles.permissions', locale)}
            </label>
            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {Object.entries(groupedPermissions).map(([group, perms]) => (
                <div key={group} className="border-b border-gray-100 last:border-0">
                  <div className={`px-4 py-2 bg-gray-50 font-medium text-sm text-gray-700 capitalize ${locale === 'ar' ? 'text-right' : ''}`}>
                    {group.replace('_', ' ')}
                  </div>
                  <div className="px-4 py-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {perms.map((permission) => (
                      <label key={permission.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.permission_ids.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                permission_ids: [...formData.permission_ids, permission.id],
                              })
                            } else {
                              setFormData({
                                ...formData,
                                permission_ids: formData.permission_ids.filter(
                                  (id) => id !== permission.id
                                ),
                              })
                            }
                          }}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel', locale)}
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {selectedRole ? t('common.save', locale) : t('roles.new', locale)}
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
              ? `هل أنت متأكد من حذف الدور "${roleToDelete?.name}"؟ سيفقد المستخدمون الذين لديهم هذا الدور صلاحياته.`
              : `Are you sure you want to delete the role "${roleToDelete?.name}"? Users with this role will lose its permissions.`}
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
