import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  first_name_ar?: string
  last_name_ar?: string
  full_name: string
  phone?: string
  avatar_path?: string
  locale: 'en' | 'ar'
  organization?: {
    id: string
    name: string
    name_ar?: string
    slug: string
  }
  roles: Array<{
    id: string
    name: string
    slug: string
  }>
  permissions: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  setLoading: (loading: boolean) => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password })
        const { user, token } = response.data.data
        
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch {
          // Ignore errors, clear state anyway
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      fetchUser: async () => {
        try {
          const response = await api.get('/auth/me')
          set({
            user: response.data.data,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      hasPermission: (permission: string) => {
        const { user } = get()
        if (!user) return false
        return user.permissions.includes(permission)
      },

      hasRole: (role: string) => {
        const { user } = get()
        if (!user) return false
        return user.roles.some((r) => r.slug === role)
      },
    }),
    {
      name: 'zakat-auth',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: false, // Always persist as false so on reload we don't show loading
      }),
    }
  )
)
