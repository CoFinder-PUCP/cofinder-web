'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      router.replace('/');
      return;
    }

    useAuthStore.setState({ token });

    api.get('/users/me').then(({ data }) => {
      setAuth(data, token);
      if (!data.name) {
        router.replace('/auth/onboarding');
      } else {
        router.replace('/profile');
      }
    }).catch(() => {
      router.replace('/');
    });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Iniciando sesión...</p>
    </main>
  );
}
