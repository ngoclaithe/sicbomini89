'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (token: string, user: any) => {
    router.push('/');
  };

  return <LoginForm onLogin={handleLogin} />;
}
