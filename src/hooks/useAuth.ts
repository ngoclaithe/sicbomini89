"use client";

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as Auth from '@/lib/auth'

type User = {
  id: string
  username: string
  [key: string]: any
}

type AuthState = {
  token: string | null
  user: User | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  getMe: () => Promise<void>
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      async login(username, password) {
        const data = await Auth.login(username, password)
        set({ token: data.access_token || data.token || null, user: data.user || null })
      },
      async register(username, password) {
        const data = await Auth.register(username, password)
        set({ token: data.access_token || data.token || null, user: data.user || null })
      },
      async getMe() {
        const token = get().token
        if (!token) return
        const data = await Auth.getMe(token)
        set({ user: data })
      },
      logout() {
        set({ token: null, user: null })
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
