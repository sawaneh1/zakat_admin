import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '../lib/i18n'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      
      setLocale: (locale: Locale) => {
        set({ locale })
        
        // Update document direction
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = locale
        
        // Add/remove RTL class for Tailwind
        if (locale === 'ar') {
          document.documentElement.classList.add('rtl')
        } else {
          document.documentElement.classList.remove('rtl')
        }
      },
    }),
    {
      name: 'zakat-locale',
      onRehydrateStorage: () => (state) => {
        // Apply stored locale on app load
        if (state?.locale) {
          document.documentElement.dir = state.locale === 'ar' ? 'rtl' : 'ltr'
          document.documentElement.lang = state.locale
          if (state.locale === 'ar') {
            document.documentElement.classList.add('rtl')
          }
        }
      },
    }
  )
)
