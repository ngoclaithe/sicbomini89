'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm';

import { useUserStore, UserRole } from '@/store/useUserStore';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    const user = useUserStore.getState().user;
    if (user?.role === UserRole.ADMIN) {
      router.push('/admin-2026');
    } else {
      router.push('/');
    }
  };

  return <LoginForm onLogin={handleLogin} />;
}
