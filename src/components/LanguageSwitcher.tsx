import { useLocaleStore } from '../stores/locale'
import { LanguageIcon } from '@heroicons/react/24/outline'
import type { Locale } from '../lib/i18n'

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'toggle' | 'minimal'
  className?: string
}

const languages: { code: Locale; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
]

export default function LanguageSwitcher({ variant = 'dropdown', className = '' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocaleStore()

  if (variant === 'toggle') {
    return (
      <button
        onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 ${className}`}
        title={locale === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
      >
        <LanguageIcon className="w-5 h-5 text-gray-500" />
        <span className="text-gray-700">{locale === 'en' ? 'العربية' : 'English'}</span>
      </button>
    )
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
        className={`p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors ${className}`}
        title={locale === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
      >
        <span className="text-sm font-medium">{locale.toUpperCase()}</span>
      </button>
    )
  }

  // Default: dropdown
  return (
    <div className={`relative ${className}`}>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="appearance-none bg-transparent pl-8 pr-8 py-2 text-sm font-medium text-gray-700 rounded-lg border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
      <LanguageIcon className="w-4 h-4 text-gray-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      <svg
        className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
