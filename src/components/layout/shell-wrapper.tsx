'use client';

import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';

// Rutas que NO usan el AppShell (auth, landing, etc.)
const PUBLIC_PATHS = ['/', '/auth'];

interface ShellWrapperProps {
  children: React.ReactNode;
}

export function ShellWrapper({ children }: ShellWrapperProps) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) =>
    p === '/' ? pathname === '/' : pathname.startsWith(p),
  );

  if (isPublic) return <>{children}</>;

  return <AppShell>{children}</AppShell>;
}
