'use client';

import { NotificationBell } from '@/components/notifications/notification-bell';
import { GlobalSearch } from '@/components/layout/global-search';

export function MobileHeader() {
  return (
    /* Solo visible en móvil */
    <header className="fixed top-0 left-0 right-0 z-40 md:hidden bg-background border-b h-14 flex items-center justify-between px-4">
      <span className="text-base font-semibold tracking-tight">CoFinder</span>
      <div className="flex items-center gap-3">
        <GlobalSearch />
        <NotificationBell />
      </div>
    </header>
  );
}
