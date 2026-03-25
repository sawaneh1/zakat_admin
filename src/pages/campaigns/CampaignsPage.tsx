import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, type PaginatedResponse } from '../../lib/api'
import { formatCurrency, formatDate, formatPercentage } from '../../lib/utils'
import { localized, t } from '../../lib/i18n'
import { useLocaleStore } from '../../stores/locale'
import {
  Button,
  Input,
  Badge,
  Card,
  CardContent,
} from '../../components/ui'
import { useAuthStore } from '../../stores/auth'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  InboxIcon,
} from '@heroicons/react/24/outline'
import type { Campaign } from '../../types'

const statusColors: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  draft: 'default',
  submitted: 'info',
  verified: 'info',
  approved: 'info',
  published: 'success',
  active: 'success',
  paused: 'warning',
  completed: 'info',
  closed: 'default',
  rejected: 'danger',
  cancelled: 'danger',
}

function CampaignCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200" />
      <CardContent className="p-4">
        <div className="h-4 bg-gray-200 rounded w-16 mb-2" />
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-full mb-4" />
        <div className="h-2 bg-gray-200 rounded mb-4" />
        <div className="h-8 bg-gray-200 rounded" />
      </CardContent>
    </Card>
  )
}

function getCampaignDisplayName(campaign: Campaign, locale: 'en' | 'ar'): string {
  if (campaign.title && typeof campaign.title === 'object') {
    return localized(campaign.title, locale)
  }
  return String(campaign.title || 'Untitled')
}

function getCampaignDescription(campaign: Campaign, locale: 'en' | 'ar'): string | null {
  if (!campaign.description) return null
  if (typeof campaign.description === 'object') {
    return localized(campaign.description, locale)
  }
  return String(campaign.description)
}

export default function CampaignsPage() {
  const { hasPermission } = useAuthStore()
  const { locale } = useLocaleStore()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [, setSelectedCampaign] = useState<Campaign | null>(null)

  const { data: campaignsData, isLoading, error, refetch } = useQuery<PaginatedResponse<Campaign>>({
    queryKey: ['campaigns', search, status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      const response = await api.get(`/campaigns/admin/list?${params}`)
      return response.data
    },
  })

  const openCampaignDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    // TODO: Implement campaign detail modal or navigation
  }

  const campaigns: Campaign[] = campaignsData?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('campaigns.title', locale)}</h1>
          <p className="text-gray-500 mt-1">{t('campaigns.subtitle', locale)}</p>
        </div>
        {hasPermission('campaigns.create') && (
          <Button leftIcon={<PlusIcon className="w-5 h-5" />}>
            {t('campaigns.new', locale)}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('campaigns.search', locale)}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">{t('payments.all_status', locale)}</option>
              <option value="draft">{t('campaign_status.draft', locale)}</option>
              <option value="submitted">{t('campaign_status.submitted', locale)}</option>
              <option value="verified">{t('campaign_status.verified', locale)}</option>
              <option value="approved">{t('campaign_status.approved', locale)}</option>
              <option value="published">{t('campaign_status.published', locale)}</option>
              <option value="active">{t('campaign_status.active', locale)}</option>
              <option value="paused">{t('campaign_status.paused', locale)}</option>
              <option value="completed">{t('campaign_status.completed', locale)}</option>
              <option value="closed">{t('campaign_status.closed', locale)}</option>
              <option value="rejected">{t('campaign_status.rejected', locale)}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Grid */}
      {error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-900 font-medium mb-2">{t('campaigns.error_title', locale)}</p>
            <p className="text-gray-500 text-sm mb-4">{t('campaigns.error_message', locale)}</p>
            <Button variant="outline" onClick={() => refetch()}>
              {t('campaigns.try_again', locale)}
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <InboxIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-900 font-medium mb-2">{t('campaigns.no_campaigns', locale)}</p>
            <p className="text-gray-500 text-sm">
              {search || status ? t('campaigns.adjust_filters', locale) : t('campaigns.create_first', locale)}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const name = getCampaignDisplayName(campaign, locale)
            const desc = getCampaignDescription(campaign, locale)
            return (
              <Card key={campaign.id} className="overflow-hidden">
                {/* Cover Image */}
                <div className="h-40 bg-gradient-to-br from-primary-500 to-primary-700 relative">
                  {campaign.featured_image_path ? (
                    <img
                      src={campaign.featured_image_path}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white/30">
                        {name.charAt(0)}
                      </span>
                    </div>
                  )}
                  {campaign.is_featured && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="warning">{t('campaigns.featured', locale)}</Badge>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={statusColors[campaign.status] || 'default'}>
                      {t(`campaign_status.${campaign.status}`, locale)}
                    </Badge>
                  </div>
                  {campaign.is_urgent && (
                    <div className={`${locale === 'ar' ? 'right-3' : 'left-3'} absolute bottom-3`}>
                      <Badge variant="danger">{t('campaigns.urgent', locale)}</Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Campaign Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" size="sm">
                        {t(`campaign_type.${campaign.campaign_type}`, locale) || campaign.campaign_type}
                      </Badge>
                      {campaign.zakat_eligible && (
                        <Badge variant="success" size="sm">{t('campaigns.zakat', locale)}</Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {name}
                    </h3>
                    {desc && (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {desc}
                      </p>
                    )}
                  </div>

                  {/* Progress */}
                  {campaign.target_amount > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(campaign.raised_amount, campaign.currency_code)}
                        </span>
                        <span className="text-gray-500">
                          {t('campaigns.of', locale)} {formatCurrency(campaign.target_amount, campaign.currency_code)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: `${Math.min(campaign.progress_percentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatPercentage(campaign.progress_percentage / 100)} {t('campaigns.funded', locale)}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{campaign.donor_count} {t('campaigns.donors', locale)}</span>
                    </div>
                    <span>
                      {campaign.end_date
                        ? `${t('campaigns.ends', locale)} ${formatDate(campaign.end_date)}`
                        : campaign.is_indefinite
                        ? t('campaigns.ongoing', locale)
                        : t('campaigns.no_end_date', locale)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openCampaignDetail(campaign)}
                    >
                      <EyeIcon className={`w-4 h-4 ${locale === 'ar' ? 'ml-1' : 'mr-1'}`} />
                      {t('campaigns.view', locale)}
                    </Button>
                    {hasPermission('campaigns.update') && (
                      <Button variant="ghost" size="sm">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
