import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useLocaleStore } from './stores/locale'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// RTL initialization component
function RTLInitializer({ children }: { children: React.ReactNode }) {
  const { locale } = useLocaleStore()

  useEffect(() => {
    const htmlElement = document.documentElement
    const isRTL = locale === 'ar'
    
    // Set HTML direction and language
    htmlElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
    htmlElement.setAttribute('lang', locale)
    
    // Add RTL class for Tailwind
    if (isRTL) {
      htmlElement.classList.add('rtl')
    } else {
      htmlElement.classList.remove('rtl')
    }
    
    // Set text direction on body
    document.body.style.direction = isRTL ? 'rtl' : 'ltr'
  }, [locale])

  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RTLInitializer>
        <BrowserRouter>
          <App />
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                direction: 'inherit',
              }
            }}
          />
        </BrowserRouter>
      </RTLInitializer>
    </QueryClientProvider>
  </StrictMode>,
)
