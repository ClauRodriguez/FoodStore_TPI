import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/shared/api/api'
import type { LoginCredentials, UsuarioAuth } from '../types/auth.types'

interface AuthState {
  user: UsuarioAuth | null
  checking: boolean
  login: (username: LoginCredentials['username'], password: LoginCredentials['password']) => Promise<UsuarioAuth>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      checking: true,
      login: async (username, password) => {
        const body = new URLSearchParams({ username, password })
        await api.post('/auth/token', body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        const { data } = await api.get<UsuarioAuth>('/auth/me')
        set({ user: data, checking: false })
        return data
      },
      logout: async () => {
        try {
          await api.post('/auth/logout')
        } finally {
          set({ user: null, checking: false })
        }
      },
      checkAuth: async () => {
        set({ checking: true })
        try {
          const { data } = await api.get<UsuarioAuth>('/auth/me')
          set({ user: data, checking: false })
        } catch {
          set({ user: null, checking: false })
        }
      },
      clearSession: () => set({ user: null, checking: false }),
    }),
    {
      name: 'foodstore-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
