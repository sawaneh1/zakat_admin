
// ============================================
// Base Types
// ============================================

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

// ============================================
// Identity Module
// ============================================

export interface Organization extends BaseEntity {
  name: string
  name_ar?: string
  slug: string
  description?: string
  description_ar?: string
  logo_path?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  currency: string
  timezone: string
  is_active: boolean
  settings?: Record<string, unknown>
}

export interface User extends BaseEntity {
  organization_id?: string
  email: string
  first_name: string
  last_name: string
  first_name_ar?: string
  last_name_ar?: string
  full_name: string
  phone?: string
  avatar_path?: string
  locale: 'en' | 'ar'
  is_active: boolean
  email_verified_at?: string
  last_login_at?: string
  organization?: Organization
  roles: Role[]
  permissions: string[]
}

export interface Role extends BaseEntity {
  organization_id?: string
  name: string
  slug: string
  description?: string
  is_system: boolean
  permissions: Permission[]
  users_count?: number
}

export interface Permission extends BaseEntity {
  name: string
  slug: string
  group: string
  description?: string
}

// ============================================
// Calculator Module
// ============================================

export interface ZakatSetting extends BaseEntity {
  organization_id: string
  nisab_method: 'gold' | 'silver'
  gold_price_per_gram: number
  silver_price_per_gram: number
  gold_nisab_grams: number
  silver_nisab_grams: number
  jewelry_zakatable: boolean
  debt_deduction_method: 'short_term' | 'all' | 'none'
  short_term_debt_months: number
  receivables_method: 'all' | 'collectible' | 'received'
  hawl_tracking_enabled: boolean
  currency_code: string
  is_active: boolean
  effective_from?: string
  // Computed fields from API
  nisab_amount?: number
  gold_nisab_amount?: number
  silver_nisab_amount?: number
}

export interface ZakatSettingVersion extends BaseEntity {
  zakat_setting_id: string
  changed_by: string
  version_number: number
  settings_snapshot: ZakatSetting
  change_reason?: string
  changed_by_user?: {
    id: string
    first_name: string
    last_name: string
  }
}

export interface ZakatCalculation extends BaseEntity {
  organization_id: string
  user_id?: string
  reference_number: string
  calculator_name?: string
  calculator_email?: string
  calculator_phone?: string
  calculation_date: string
  lunar_year: number
  assets: ZakatAssetItem[]
  total_assets: number
  total_liabilities: number
  nisab_value: number
  is_above_nisab: boolean
  zakatable_amount: number
  zakat_amount: number
  currency: string
  status: 'draft' | 'completed' | 'paid'
  notes?: string
}

export interface ZakatAssetItem {
  id: string
  calculation_id: string
  setting_id: string
  asset_name: string
  asset_value: number
  zakatable_value: number
  rate_applied: number
  zakat_due: number
}

// ============================================
// Payment Module
// ============================================

export interface Payment extends BaseEntity {
  organization_id: string
  reference: string
  amount: number
  currency_code: string
  payment_type: 'zakat' | 'sadaqah' | 'campaign' | 'other'
  donation_type_id?: string
  donation_context?: 'general' | 'campaign'
  payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'card' | 'other'
  payment_channel?: string
  status: 'draft' | 'pending' | 'paid_unconfirmed' | 'confirmed' | 'allocated' | 'disbursed' | 'cancelled' | 'refunded'
  donor_name?: string
  donor_email?: string
  donor_phone?: string
  is_anonymous: boolean
  evidence_path?: string
  evidence_notes?: string
  external_reference?: string
  gateway_transaction_id?: string
  confirmed_at?: string
  confirmation_notes?: string
  notes?: string
  campaign?: Campaign
  donor?: {
    id: string
    name: string
    email: string
  }
  confirmed_by?: {
    id: string
    name: string
  }
}

export interface Donor extends BaseEntity {
  organization_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  address?: string
  is_recurring_donor: boolean
  total_donations: number
  last_donation_at?: string
}

// ============================================
// Beneficiary Module
// ============================================

export type BeneficiaryCategory = 
  | 'poor'
  | 'needy'
  | 'zakat_worker'
  | 'new_muslim'
  | 'debt_relief'
  | 'fisabilillah'
  | 'wayfarer';

export interface Beneficiary extends BaseEntity {
  organization_id: string
  reference_number: string
  first_name: string
  last_name: string
  first_name_ar?: string
  last_name_ar?: string
  full_name: string
  category: BeneficiaryCategory
  gender: 'male' | 'female'
  date_of_birth?: string
  national_id?: string
  phone?: string
  email?: string
  address?: string
  region?: string
  family_size: number
  monthly_income?: number
  monthly_expenses?: number
  employment_status?: string
  health_conditions?: string
  housing_status?: string
  is_verified: boolean
  is_active: boolean
  verification_date?: string
  verified_by?: string
  notes?: string
  documents?: BeneficiaryDocument[]
  total_received: number
  last_distribution_at?: string
}

export interface BeneficiaryDocument extends BaseEntity {
  beneficiary_id: string
  type: string
  file_path: string
  file_name: string
  uploaded_by: string
}

// ============================================
// Distribution Module
// ============================================

export interface Distribution extends BaseEntity {
  organization_id: string
  reference_number: string
  campaign_id?: string
  fund_type: 'zakat' | 'sadaqah' | 'general'
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  scheduled_date?: string
  completed_at?: string
  total_amount: number
  distributed_amount: number
  currency: string
  beneficiary_count: number
  description?: string
  approved_by?: string
  approved_at?: string
  items: DistributionItem[]
}

export interface DistributionItem extends BaseEntity {
  distribution_id: string
  beneficiary_id: string
  beneficiary?: Beneficiary
  amount: number
  distribution_type: 'cash' | 'goods' | 'services'
  status: 'pending' | 'distributed' | 'rejected' | 'returned'
  distributed_at?: string
  notes?: string
}

// ============================================
// Campaign Module
// ============================================

export interface Campaign extends BaseEntity {
  organization_id: string
  title: { en: string; ar?: string }
  slug: string
  short_description?: { en: string; ar?: string } | null
  description?: { en: string; ar?: string }
  featured_image_path?: string | null
  campaign_type: 'zakat' | 'sadaqah' | 'emergency' | 'seasonal' | 'project'
  status: 'draft' | 'submitted' | 'verified' | 'approved' | 'published' | 'active' | 'paused' | 'completed' | 'closed' | 'rejected' | 'cancelled'
  target_amount: number
  raised_amount: number
  currency_code: string
  start_date?: string | null
  end_date?: string | null
  is_indefinite: boolean
  zakat_eligible: boolean
  zakat_category?: string | null
  is_featured: boolean
  is_urgent: boolean
  is_active: boolean
  location?: string | null
  region?: string | null
  donor_count: number
  progress_percentage: number
  remaining_amount: number
  days_remaining?: number | null
  requester_name?: string | null
  requester_phone?: string | null
  requester_email?: string | null
}

// ============================================
// Donation Type Module
// ============================================

export interface DonationType extends BaseEntity {
  organization_id?: string
  slug: string
  name: { en: string; ar?: string }
  description?: { en: string; ar?: string } | null
  is_zakat_eligible: boolean
  is_active: boolean
  display_order: number
}

// ============================================
// Finance Module
// ============================================

export interface FundLedger extends BaseEntity {
  organization_id: string
  fund_type: 'zakat' | 'sadaqah' | 'general' | 'operational'
  reference_type: string
  reference_id: string
  transaction_type: 'credit' | 'debit'
  amount: number
  balance_before: number
  balance_after: number
  currency: string
  description?: string
  recorded_by: string
}

export interface FundBalance {
  fund_type: string
  balance: number
  currency: string
  last_updated: string
}

// ============================================
// Dashboard Stats
// ============================================

export interface DashboardStats {
  total_collected: number
  total_distributed: number
  total_beneficiaries: number
  active_campaigns: number
  pending_distributions: number
  fund_balances: FundBalance[]
  recent_payments: Payment[]
  recent_distributions: Distribution[]
  monthly_trends: {
    month: string
    label: string
    collections: number
    distributions: number
  }[]
}
