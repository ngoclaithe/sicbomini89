"use client";

import { create } from 'zustand';
import * as Auth from '@/lib/auth';
import { useUserStore } from '@/store/useUserStore';

type AuthState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

export const useAuth = create<AuthState>()((set, get) => ({
  isLoading: false,
  isAuthenticated: false,

  async login(username, password) {
    set({ isLoading: true });
    try {
      const data = await Auth.login(username, password);
      useUserStore.getState().setUser(data.user);
      set({ isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  async register(username, password) {
    set({ isLoading: true });
    try {
      const data = await Auth.register(username, password);
      useUserStore.getState().setUser(data.user);
      set({ isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  async logout() {
    await Auth.logout();
    useUserStore.getState().clearUser();
    set({ isAuthenticated: false });
  },

  async checkAuth() {
    set({ isLoading: true });
    try {
      const user = await Auth.getMe();
      useUserStore.getState().setUser(user);
      set({ isAuthenticated: true });
    } catch (error) {
      useUserStore.getState().clearUser();
      set({ isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
