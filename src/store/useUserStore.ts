"use client";

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

type User = {
  id: string;
  username: string;
  role: UserRole;
  [key: string]: any;
};

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  isAdmin: () => boolean;
};

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      user: null,

      setUser: (user) => set({ user }),

      clearUser: () => set({ user: null }),

      isAdmin: () => {
        const { user } = get();
        return user?.role === UserRole.ADMIN;
      },
    }),
    {
      name: 'user-store',
    }
  )
);
