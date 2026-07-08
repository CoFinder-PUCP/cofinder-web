'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { GlobalSearch } from '@/components/layout/global-search';

const LINKS: { href: string; label: string; matches: string[] }[] = [
  { href: '/feed', label: 'Feed', matches: ['/feed'] },
  { href: '/projects', label: 'Explorar', matches: ['/projects'] },
  { href: '/swipe', label: 'Descubrir', matches: ['/swipe'] },
  { href: '/people', label: 'Personas', matches: ['/people', '/users'] },
  { href: '/events', label: 'Eventos', matches: ['/events'] },
  { href: '/matches', label: 'Matches', matches: ['/matches', '/chat'] },
  { href: '/applications', label: 'Solicitudes', matches: ['/applications'] },
  { href: '/projects/mine', label: 'Mis proyectos', matches: ['/projects/mine', '/projects/new'] },
  { href: '/profile', label: 'Perfil', matches: ['/profile'] },
];

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const role = useAuthStore((s) => s.user?.role);

  const links =
    role === 'ADMIN'
      ? [...LINKS, { href: '/admin', label: 'Admin', matches: ['/admin'] }]
      : LINKS;

  // El link más específico que matchea gana (evita que "Explorar" y
  // "Mis proyectos" se marquen activos a la vez).
  const activeHref = links.reduce<string | null>((best, l) => {
    const hit = l.matches.find((m) => pathname.startsWith(m));
    if (!hit) return best;
    const bestLen = best ? Math.max(...links.find((x) => x.href === best)!.matches.filter((m) => pathname.startsWith(m)).map((m) => m.length)) : -1;
    return hit.length > bestLen ? l.href : best;
  }, null);

  return (
    <nav className="border-b px-4 py-3 flex items-center justify-between text-sm gap-4">
      <div className="flex gap-4 sm:gap-6 flex-wrap">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={
              activeHref === l.href
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <GlobalSearch />
        <NotificationBell />
        <button
          onClick={() => {
            clearAuth();
            router.push('/');
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          Salir
        </button>
      </div>
    </nav>
  );
}
