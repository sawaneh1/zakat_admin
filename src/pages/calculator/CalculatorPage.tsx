import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api, getErrorMessage } from '../../lib/api'
import { formatCurrency } from '../../lib/utils'
import { t } from '../../lib/i18n'
import { useLocaleStore } from '../../stores/locale'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge } from '../../components/ui'
import {
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

interface AssetItem {
  id: string
  type: string
  name: string
  value: number
}

interface CalculationResult {
  total_assets: number
  total_liabilities: number
  net_zakatable: number
  nisab_value: number
  is_above_nisab: boolean
  zakat_amount: number
  breakdown: {
    asset_type: string
    value: number
    rate: number
    zakat_due: number
  }[]
}

const assetTypes = [
  { value: 'cash', labelKey: 'asset_type.cash' as const, rate: 0.025 },
  { value: 'gold', labelKey: 'asset_type.gold' as const, rate: 0.025 },
  { value: 'silver', labelKey: 'asset_type.silver' as const, rate: 0.025 },
  { value: 'stocks', labelKey: 'asset_type.stocks' as const, rate: 0.025 },
  { value: 'business_inventory', labelKey: 'asset_type.business_inventory' as const, rate: 0.025 },
  { value: 'receivables', labelKey: 'asset_type.receivables' as const, rate: 0.025 },
  { value: 'property_investment', labelKey: 'asset_type.property_investment' as const, rate: 0.025 },
  { value: 'crypto', labelKey: 'asset_type.crypto' as const, rate: 0.025 },
]

const liabilityTypes = [
  { value: 'debt', labelKey: 'liability_type.debt' as const },
  { value: 'loan', labelKey: 'liability_type.loan' as const },
  { value: 'bills', labelKey: 'liability_type.bills' as const },
]

export default function CalculatorPage() {
  const { locale } = useLocaleStore()
  const [assets, setAssets] = useState<AssetItem[]>([
    { id: '1', type: 'cash', name: t('asset_type.cash', locale), value: 0 },
  ])
  const [liabilities, setLiabilities] = useState<AssetItem[]>([])
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [error, setError] = useState('')

  // Calculate totals
  const totalAssets = assets.reduce((sum, a) => sum + (a.value || 0), 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.value || 0), 0)
  const netWorth = totalAssets - totalLiabilities

  const calculateMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/calculator/calculate', {
        assets: assets.map((a) => ({
          asset_type: a.type,
          name: a.name,
          value: a.value,
        })),
        liabilities: liabilities.map((l) => ({
          liability_type: l.type,
          name: l.name,
          value: l.value,
        })),
      })
      return response.data.data as CalculationResult
    },
    onSuccess: (data) => {
      setResult(data)
      setError('')
    },
    onError: (err) => {
      setError(getErrorMessage(err))
    },
  })

  const addAsset = () => {
    setAssets([
      ...assets,
      { id: Date.now().toString(), type: 'cash', name: '', value: 0 },
    ])
  }

  const removeAsset = (id: string) => {
    setAssets(assets.filter((a) => a.id !== id))
  }

  const updateAsset = (id: string, field: keyof AssetItem, value: string | number) => {
    setAssets(
      assets.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      )
    )
  }

  const addLiability = () => {
    setLiabilities([
      ...liabilities,
      { id: Date.now().toString(), type: 'debt', name: '', value: 0 },
    ])
  }

  const removeLiability = (id: string) => {
    setLiabilities(liabilities.filter((l) => l.id !== id))
  }

  const updateLiability = (id: string, field: keyof AssetItem, value: string | number) => {
    setLiabilities(
      liabilities.map((l) =>
        l.id === id ? { ...l, [field]: value } : l
      )
    )
  }

  const handleCalculate = () => {
    if (totalAssets === 0) {
      setError(t('calculator.error_no_assets', locale))
      return
    }
    calculateMutation.mutate()
  }

  const resetCalculator = () => {
    setAssets([{ id: '1', type: 'cash', name: t('asset_type.cash', locale), value: 0 }])
    setLiabilities([])
    setResult(null)
    setError('')
  }

  // Simple client-side calculation for preview
  const nisabValue = 5000 // Example nisab in GMD
  const estimatedZakat = netWorth >= nisabValue ? netWorth * 0.025 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('calculator.title', locale)}</h1>
          <p className="text-gray-500 mt-1">
            {t('calculator.subtitle', locale)}
          </p>
        </div>
        <Button variant="outline" onClick={resetCalculator}>
          {t('calculator.reset', locale)}
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="bg-primary-50 border-primary-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-primary-800">
              <p className="font-medium">{t('calculator.info_title', locale)}</p>
              <p className="mt-1">
                {t('calculator.info_text', locale)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('calculator.assets', locale)}</CardTitle>
              <Button size="sm" variant="outline" onClick={addAsset}>
                <PlusIcon className={`w-4 h-4 ${locale === 'ar' ? 'ml-1' : 'mr-1'}`} />
                {t('calculator.add_asset', locale)}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {assets.map((asset) => (
                <div key={asset.id} className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      value={asset.type}
                      onChange={(e) => updateAsset(asset.id, 'type', e.target.value)}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
                    >
                      {assetTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {t(type.labelKey, locale)}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder={t('calculator.asset_name_placeholder', locale)}
                      value={asset.name}
                      onChange={(e) => updateAsset(asset.id, 'name', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={asset.value}
                      onChange={(e) => updateAsset(asset.id, 'value', parseFloat(e.target.value) || 0)}
                      prefix="D"
                    />
                  </div>
                  {assets.length > 1 && (
                    <button
                      onClick={() => removeAsset(asset.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-medium text-gray-700">{t('calculator.total_assets', locale)}</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalAssets)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Liabilities Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('calculator.liabilities', locale)}</CardTitle>
              <Button size="sm" variant="outline" onClick={addLiability}>
                <PlusIcon className={`w-4 h-4 ${locale === 'ar' ? 'ml-1' : 'mr-1'}`} />
                {t('calculator.add_liability', locale)}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {liabilities.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">
                  {t('calculator.no_liabilities', locale)}
                </p>
              ) : (
                liabilities.map((liability) => (
                  <div key={liability.id} className="flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select
                        value={liability.type}
                        onChange={(e) => updateLiability(liability.id, 'type', e.target.value)}
                        className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
                      >
                        {liabilityTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {t(type.labelKey, locale)}
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder={t('calculator.liability_name_placeholder', locale)}
                        value={liability.name}
                        onChange={(e) => updateLiability(liability.id, 'name', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={liability.value}
                        onChange={(e) => updateLiability(liability.id, 'value', parseFloat(e.target.value) || 0)}
                        prefix="D"
                      />
                    </div>
                    <button
                      onClick={() => removeLiability(liability.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}

              {liabilities.length > 0 && (
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-medium text-gray-700">{t('calculator.total_liabilities', locale)}</span>
                  <span className="text-xl font-bold text-red-600">
                    -{formatCurrency(totalLiabilities)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Sidebar */}
        <div className="space-y-6">
          <Card className={calculateMutation.isPending ? 'animate-pulse' : ''}>
            <CardHeader>
              <CardTitle>{t('calculator.summary', locale)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('calculator.total_assets', locale)}</span>
                <span className="font-semibold">{formatCurrency(totalAssets)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('calculator.total_liabilities', locale)}</span>
                <span className="font-semibold text-red-600">-{formatCurrency(totalLiabilities)}</span>
              </div>
              <hr />
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-gray-900">{t('calculator.net_zakatable', locale)}</span>
                <span className="text-xl font-bold text-primary-600">{formatCurrency(netWorth)}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-600">{t('calculator.status', locale)}</span>
                {netWorth >= nisabValue ? (
                  <Badge variant="success">{t('calculator.above_nisab', locale)}</Badge>
                ) : (
                  <Badge variant="default">{t('calculator.below_nisab', locale)}</Badge>
                )}
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-gray-500 mb-1">{t('calculator.estimated_zakat', locale)}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(estimatedZakat)}</p>
              </div>

              <Button 
                className="w-full mt-4" 
                onClick={handleCalculate}
                isLoading={calculateMutation.isPending}
              >
                {t('calculator.calculate', locale)}
              </Button>
            </CardContent>
          </Card>

          {/* Detailed Result after calculation */}
          {result && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="py-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">{t('calculator.calculation_complete', locale)}</p>
                    <p className="text-xs text-green-600">Nisab: {formatCurrency(result.nisab_value)}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">{t('calculator.net_zakatable', locale)}</span>
                    <span className="font-semibold text-green-900">{formatCurrency(result.net_zakatable)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">{t('calculator.zakat_rate', locale)}</span>
                    <span className="font-semibold text-green-900">2.5%</span>
                  </div>
                  <hr className="border-green-200" />
                  <div className="flex justify-between items-center text-green-900 font-bold">
                    <span>{t('calculator.zakat_due', locale)}</span>
                    <span className="text-2xl">{formatCurrency(result.zakat_amount)}</span>
                  </div>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700">
                  {t('calculator.pay_zakat', locale)}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
