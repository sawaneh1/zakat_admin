import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, getErrorMessage } from '../../lib/api'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge } from '../../components/ui'
import { useAuthStore } from '../../stores/auth'
import { formatCurrency, formatDate } from '../../lib/utils'
import {
  BuildingOfficeIcon,
  UserCircleIcon,
  BellIcon,
  CurrencyDollarIcon,
  LanguageIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import type { ZakatSetting, ZakatSettingVersion } from '../../types'

type SettingsTab = 'organization' | 'profile' | 'notifications' | 'zakat' | 'localization' | 'security'

const tabs: { id: SettingsTab; name: string; icon: React.ElementType }[] = [
  { id: 'organization', name: 'Organization', icon: BuildingOfficeIcon },
  { id: 'profile', name: 'Profile', icon: UserCircleIcon },
  { id: 'notifications', name: 'Notifications', icon: BellIcon },
  { id: 'zakat', name: 'Zakat Settings', icon: CurrencyDollarIcon },
  { id: 'localization', name: 'Localization', icon: LanguageIcon },
  { id: 'security', name: 'Security', icon: ShieldCheckIcon },
]

function OrganizationSettings() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: user?.organization?.name || '',
    email: '',
    phone: '',
    address: '',
    website: '',
    currency: 'GMD',
    timezone: 'Africa/Banjul',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    
    try {
      await api.put(`/organizations/${user?.organization?.id}`, formData)
      setMessage('Organization settings saved successfully')
      queryClient.invalidateQueries({ queryKey: ['organization'] })
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Organization Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Input
          label="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          label="Website"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        />
      </div>

      <Input
        label="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
          >
            <option value="GMD">GMD - Gambian Dalasi</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
          >
            <option value="Africa/Banjul">Africa/Banjul (GMT+0)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}

function ProfileSettings() {
  const { user, fetchUser } = useAuthStore()
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    first_name_ar: user?.first_name_ar || '',
    last_name_ar: user?.last_name_ar || '',
    email: user?.email || '',
    phone: user?.phone || '',
    locale: user?.locale || 'en',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    
    try {
      await api.put('/auth/profile', formData)
      await fetchUser()
      setMessage('Profile updated successfully')
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          value={formData.first_name}
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          required
        />
        <Input
          label="Last Name"
          value={formData.last_name}
          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
          required
        />
        <Input
          label="First Name (Arabic)"
          value={formData.first_name_ar}
          onChange={(e) => setFormData({ ...formData, first_name_ar: e.target.value })}
          dir="rtl"
        />
        <Input
          label="Last Name (Arabic)"
          value={formData.last_name_ar}
          onChange={(e) => setFormData({ ...formData, last_name_ar: e.target.value })}
          dir="rtl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Input
          label="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
        <select
          value={formData.locale}
          onChange={(e) => setFormData({ ...formData, locale: e.target.value as 'en' | 'ar' })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg max-w-xs"
        >
          <option value="en">English</option>
          <option value="ar">العربية (Arabic)</option>
        </select>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          Update Profile
        </Button>
      </div>
    </form>
  )
}

function SecuritySettings() {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    
    try {
      await api.put('/auth/password', formData)
      setMessage('Password updated successfully')
      setFormData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      })
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
        }`}>
          {message}
        </div>
      )}

      <Input
        label="Current Password"
        type="password"
        value={formData.current_password}
        onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
        required
      />
      <Input
        label="New Password"
        type="password"
        value={formData.new_password}
        onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
        required
        hint="Minimum 8 characters"
      />
      <Input
        label="Confirm New Password"
        type="password"
        value={formData.new_password_confirmation}
        onChange={(e) => setFormData({ ...formData, new_password_confirmation: e.target.value })}
        required
      />

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          Update Password
        </Button>
      </div>
    </form>
  )
}

function PlaceholderSettings({ title }: { title: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">{title} settings coming soon</p>
    </div>
  )
}

// ==================== Zakat Settings Component ====================

interface ZakatSettingsFormData {
  nisab_method: 'gold' | 'silver'
  gold_price_per_gram: string
  silver_price_per_gram: string
  gold_nisab_grams: string
  silver_nisab_grams: string
  jewelry_zakatable: boolean
  debt_deduction_method: 'short_term' | 'all' | 'none'
  short_term_debt_months: string
  receivables_method: 'all' | 'collectible' | 'received'
  hawl_tracking_enabled: boolean
  currency_code: string
  change_reason: string
}

const defaultZakatSettings: ZakatSettingsFormData = {
  nisab_method: 'silver',
  gold_price_per_gram: '3500',
  silver_price_per_gram: '45',
  gold_nisab_grams: '87.48',
  silver_nisab_grams: '612.36',
  jewelry_zakatable: false,
  debt_deduction_method: 'short_term',
  short_term_debt_months: '12',
  receivables_method: 'collectible',
  hawl_tracking_enabled: true,
  currency_code: 'GMD',
  change_reason: '',
}

function ZakatSettings() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<ZakatSettingsFormData>(defaultZakatSettings)
  const [isEditing, setIsEditing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Fetch current settings
  const { data: settingsData, isLoading, error } = useQuery<{ data: ZakatSetting[] }>({
    queryKey: ['zakat-settings'],
    queryFn: async () => {
      const response = await api.get('/admin/settings/zakat')
      return response.data
    },
  })

  const activeSetting = settingsData?.data?.find(s => s.is_active) || settingsData?.data?.[0]

  // Fetch version history
  const { data: historyData } = useQuery<{ data: ZakatSettingVersion[] }>({
    queryKey: ['zakat-settings-history', activeSetting?.id],
    queryFn: async () => {
      if (!activeSetting?.id) return { data: [] }
      const response = await api.get(`/admin/settings/zakat/${activeSetting.id}/history`)
      return response.data
    },
    enabled: !!activeSetting?.id && showHistory,
  })

  // Update form when settings load
  useEffect(() => {
    if (activeSetting) {
      setFormData({
        nisab_method: activeSetting.nisab_method || 'silver',
        gold_price_per_gram: String(activeSetting.gold_price_per_gram || 3500),
        silver_price_per_gram: String(activeSetting.silver_price_per_gram || 45),
        gold_nisab_grams: String(activeSetting.gold_nisab_grams || 87.48),
        silver_nisab_grams: String(activeSetting.silver_nisab_grams || 612.36),
        jewelry_zakatable: activeSetting.jewelry_zakatable ?? false,
        debt_deduction_method: activeSetting.debt_deduction_method || 'short_term',
        short_term_debt_months: String(activeSetting.short_term_debt_months || 12),
        receivables_method: activeSetting.receivables_method || 'collectible',
        hawl_tracking_enabled: activeSetting.hawl_tracking_enabled ?? true,
        currency_code: activeSetting.currency_code || 'GMD',
        change_reason: '',
      })
    }
  }, [activeSetting])

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ZakatSettingsFormData) => {
      const payload = {
        nisab_method: data.nisab_method,
        gold_price_per_gram: parseFloat(data.gold_price_per_gram),
        silver_price_per_gram: parseFloat(data.silver_price_per_gram),
        gold_nisab_grams: parseFloat(data.gold_nisab_grams),
        silver_nisab_grams: parseFloat(data.silver_nisab_grams),
        jewelry_zakatable: data.jewelry_zakatable,
        debt_deduction_method: data.debt_deduction_method,
        short_term_debt_months: parseInt(data.short_term_debt_months),
        receivables_method: data.receivables_method,
        hawl_tracking_enabled: data.hawl_tracking_enabled,
        currency_code: data.currency_code,
        change_reason: data.change_reason || 'Settings updated',
      }

      if (activeSetting?.id) {
        return api.put(`/admin/settings/zakat/${activeSetting.id}`, payload)
      } else {
        return api.post('/admin/settings/zakat', payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['zakat-settings'] })
      setIsEditing(false)
      setFormData(prev => ({ ...prev, change_reason: '' }))
    },
  })

  // Calculate current Nisab
  const calculateNisab = () => {
    const goldPrice = parseFloat(formData.gold_price_per_gram) || 0
    const silverPrice = parseFloat(formData.silver_price_per_gram) || 0
    const goldGrams = parseFloat(formData.gold_nisab_grams) || 87.48
    const silverGrams = parseFloat(formData.silver_nisab_grams) || 612.36

    const goldNisab = goldPrice * goldGrams
    const silverNisab = silverPrice * silverGrams
    const activeNisab = formData.nisab_method === 'gold' ? goldNisab : silverNisab

    return { goldNisab, silverNisab, activeNisab }
  }

  const { goldNisab, silverNisab, activeNisab } = calculateNisab()

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg" />
        <div className="h-64 bg-gray-200 rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load Zakat settings</p>
        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['zakat-settings'] })}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Nisab Display */}
      <div className="bg-gradient-to-r from-primary-50 to-emerald-50 rounded-xl p-6 border border-primary-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircleIcon className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Current Nisab Threshold</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(activeNisab, formData.currency_code)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Based on {formData.nisab_method === 'gold' ? 'Gold' : 'Silver'} standard
            </p>
          </div>
          <Badge variant={activeSetting?.is_active ? 'success' : 'default'}>
            {activeSetting?.is_active ? 'Active' : 'Draft'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-primary-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Gold Nisab</p>
            <p className="text-lg font-semibold text-amber-700">
              {formatCurrency(goldNisab, formData.currency_code)}
            </p>
            <p className="text-xs text-gray-500">
              {formData.gold_nisab_grams}g × {formatCurrency(parseFloat(formData.gold_price_per_gram), formData.currency_code)}/g
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Silver Nisab</p>
            <p className="text-lg font-semibold text-gray-600">
              {formatCurrency(silverNisab, formData.currency_code)}
            </p>
            <p className="text-xs text-gray-500">
              {formData.silver_nisab_grams}g × {formatCurrency(parseFloat(formData.silver_price_per_gram), formData.currency_code)}/g
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Zakat Calculation Rules</h3>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit Settings
            </Button>
          )}
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="space-y-6">
              {/* Nisab Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nisab Calculation Method
                </label>
                <div className="flex gap-4">
                  <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer flex-1 transition-colors ${
                    formData.nisab_method === 'gold' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="nisab_method"
                      value="gold"
                      checked={formData.nisab_method === 'gold'}
                      onChange={(e) => setFormData({ ...formData, nisab_method: e.target.value as 'gold' | 'silver' })}
                      className="text-amber-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Gold Standard</p>
                      <p className="text-sm text-gray-500">87.48g of gold (Higher threshold)</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer flex-1 transition-colors ${
                    formData.nisab_method === 'silver' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="nisab_method"
                      value="silver"
                      checked={formData.nisab_method === 'silver'}
                      onChange={(e) => setFormData({ ...formData, nisab_method: e.target.value as 'gold' | 'silver' })}
                      className="text-gray-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Silver Standard</p>
                      <p className="text-sm text-gray-500">612.36g of silver (Lower threshold, more inclusive)</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Metal Prices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gold Price per Gram ({formData.currency_code})
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.gold_price_per_gram}
                    onChange={(e) => setFormData({ ...formData, gold_price_per_gram: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Current market price of 24k gold</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Silver Price per Gram ({formData.currency_code})
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.silver_price_per_gram}
                    onChange={(e) => setFormData({ ...formData, silver_price_per_gram: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Current market price of pure silver</p>
                </div>
              </div>

              {/* Nisab Weights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gold Nisab Weight (grams)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.gold_nisab_grams}
                    onChange={(e) => setFormData({ ...formData, gold_nisab_grams: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Standard: 87.48g (approximately 7.5 tola)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Silver Nisab Weight (grams)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.silver_nisab_grams}
                    onChange={(e) => setFormData({ ...formData, silver_nisab_grams: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Standard: 612.36g (approximately 52.5 tola)</p>
                </div>
              </div>

              {/* Jewelry Setting */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="jewelry_zakatable"
                  checked={formData.jewelry_zakatable}
                  onChange={(e) => setFormData({ ...formData, jewelry_zakatable: e.target.checked })}
                  className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <label htmlFor="jewelry_zakatable" className="font-medium text-gray-900 cursor-pointer">
                    Personal Jewelry is Zakatable
                  </label>
                  <p className="text-sm text-gray-500">
                    According to Hanafi school, personal jewelry is zakatable. Other schools may differ.
                  </p>
                </div>
              </div>

              {/* Debt Deduction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Debt Deduction Method
                </label>
                <select
                  value={formData.debt_deduction_method}
                  onChange={(e) => setFormData({ ...formData, debt_deduction_method: e.target.value as 'short_term' | 'all' | 'none' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="short_term">Short-term debts only (due within specified months)</option>
                  <option value="all">All debts deductible</option>
                  <option value="none">No debt deduction</option>
                </select>
              </div>

              {formData.debt_deduction_method === 'short_term' && (
                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short-term Debt Period (months)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    value={formData.short_term_debt_months}
                    onChange={(e) => setFormData({ ...formData, short_term_debt_months: e.target.value })}
                  />
                </div>
              )}

              {/* Receivables Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receivables Treatment
                </label>
                <select
                  value={formData.receivables_method}
                  onChange={(e) => setFormData({ ...formData, receivables_method: e.target.value as 'all' | 'collectible' | 'received' })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All receivables are zakatable</option>
                  <option value="collectible">Only collectible receivables</option>
                  <option value="received">Only when received</option>
                </select>
              </div>

              {/* Hawl Tracking */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="hawl_tracking"
                  checked={formData.hawl_tracking_enabled}
                  onChange={(e) => setFormData({ ...formData, hawl_tracking_enabled: e.target.checked })}
                  className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <label htmlFor="hawl_tracking" className="font-medium text-gray-900 cursor-pointer">
                    Enable Hawl (Lunar Year) Tracking
                  </label>
                  <p className="text-sm text-gray-500">
                    Track the completion of one lunar year for Zakat eligibility
                  </p>
                </div>
              </div>

              {/* Change Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Change (optional)
                </label>
                <Input
                  value={formData.change_reason}
                  onChange={(e) => setFormData({ ...formData, change_reason: e.target.value })}
                  placeholder="e.g., Updated gold price to reflect market rates"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saveMutation.isPending}>
                  Save Settings
                </Button>
              </div>

              {saveMutation.isError && (
                <p className="text-sm text-red-600 mt-2">
                  {getErrorMessage(saveMutation.error)}
                </p>
              )}
            </form>
          ) : (
            /* Read-only view */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Nisab Method</p>
                  <p className="font-medium text-gray-900 capitalize">{formData.nisab_method} Standard</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Currency</p>
                  <p className="font-medium text-gray-900">{formData.currency_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gold Price/gram</p>
                  <p className="font-medium text-gray-900">{formatCurrency(parseFloat(formData.gold_price_per_gram), formData.currency_code)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Silver Price/gram</p>
                  <p className="font-medium text-gray-900">{formatCurrency(parseFloat(formData.silver_price_per_gram), formData.currency_code)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jewelry Zakatable</p>
                  <p className="font-medium text-gray-900">{formData.jewelry_zakatable ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Debt Deduction</p>
                  <p className="font-medium text-gray-900 capitalize">{formData.debt_deduction_method.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Receivables Method</p>
                  <p className="font-medium text-gray-900 capitalize">{formData.receivables_method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hawl Tracking</p>
                  <p className="font-medium text-gray-900">{formData.hawl_tracking_enabled ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Version History */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">Settings History</span>
          </div>
          <span className="text-sm text-gray-500">{showHistory ? 'Hide' : 'Show'}</span>
        </button>

        {showHistory && (
          <div className="border-t border-gray-200">
            {historyData?.data && historyData.data.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {historyData.data.map((version) => (
                  <div key={version.id} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Version {version.version_number}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(version.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {version.change_reason || 'No reason provided'}
                    </p>
                    {version.changed_by_user && (
                      <p className="text-xs text-gray-400 mt-1">
                        by {version.changed_by_user.first_name} {version.changed_by_user.last_name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No version history available
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg p-4 flex gap-3">
        <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">About Nisab Calculation</p>
          <p>
            Nisab is the minimum amount of wealth a Muslim must possess before Zakat becomes obligatory. 
            The silver standard results in a lower threshold, making Zakat obligatory for more people. 
            Many scholars recommend using the silver standard as it is more beneficial for the poor.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('organization')
  const { hasPermission } = useAuthStore()

  const renderContent = () => {
    switch (activeTab) {
      case 'organization':
        return hasPermission('settings.update') ? (
          <OrganizationSettings />
        ) : (
          <PlaceholderSettings title="You don't have permission to edit organization" />
        )
      case 'profile':
        return <ProfileSettings />
      case 'security':
        return <SecuritySettings />
      case 'notifications':
        return <PlaceholderSettings title="Notifications" />
      case 'zakat':
        return <ZakatSettings />
      case 'localization':
        return <PlaceholderSettings title="Localization" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account and organization settings
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <Card className="lg:w-64 flex-shrink-0">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>
              {tabs.find((t) => t.id === activeTab)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>
      </div>
    </div>
  )
}
