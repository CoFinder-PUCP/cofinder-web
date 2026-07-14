'use client';

import { Nav } from '@/components/layout/nav';
import { BottomNav } from '@/components/layout/bottom-nav';
import { MobileHeader } from '@/components/layout/mobile-header';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell envuelve todas las páginas autenticadas.
 *
 * Layout móvil (<md):
 *   - MobileHeader fijo arriba  (h-14)
 *   - Contenido con padding-top (pt-14) y padding-bottom (pb-16)
 *   - BottomNav fijo abajo       (h-16)
 *
 * Layout desktop (md+):
 *   - Nav rail estilo Instagram fijo a la izquierda: solo iconos (w-20),
 *     se expande al hacer hover (w-60) montándose sobre el contenido.
 *   - Contenido con margin-left del rail colapsado (ml-20).
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <>
      {/* Rail desktop */}
      <Nav />

      {/* Header móvil */}
      <MobileHeader />

      {/* Área de contenido */}
      <main className="min-h-screen md:ml-20 pt-14 md:pt-0 pb-16 md:pb-0">
        {children}
      </main>

      {/* Bottom nav móvil */}
      <BottomNav />
    </>
  );
}
