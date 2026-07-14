'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Sparkles,
  Compass,
  Users,
  CalendarDays,
  Heart,
  Inbox,
  UserCircle,
  ShieldCheck,
  LogOut,
  Rocket,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { NotificationBell } from '@/components/notifications/notification-bell';

/**
 * Menús consolidados (estilo Instagram):
 *   - Descubrir (swipe) es el core de la app → item principal
 *   - Mis proyectos vive dentro de Perfil
 *   - La búsqueda global queda solo en el header móvil
 */
const LINKS = [
  { href: '/feed',         label: 'Inicio',       icon: Home,         matches: ['/feed'] },
  { href: '/swipe',        label: 'Descubrir',    icon: Sparkles,     matches: ['/swipe'] },
  { href: '/projects',     label: 'Explorar',     icon: Compass,      matches: ['/projects'] },
  { href: '/people',       label: 'Personas',     icon: Users,        matches: ['/people', '/users'] },
  { href: '/events',       label: 'Eventos',      icon: CalendarDays, matches: ['/events'] },
  { href: '/matches',      label: 'Matches',      icon: Heart,        matches: ['/matches', '/chat'] },
  { href: '/applications', label: 'Solicitudes',  icon: Inbox,        matches: ['/applications'] },
] as const;

const PROFILE_LINK = { href: '/profile', label: 'Perfil', icon: UserCircle, matches: ['/profile'] };
const ADMIN_LINK   = { href: '/admin',   label: 'Admin',  icon: ShieldCheck, matches: ['/admin'] };

/** Fila del rail: icono siempre visible, etiqueta que aparece al expandir. */
function RailLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      className={[
        'flex items-center gap-4 h-12 rounded-lg px-2.5 text-sm transition-colors',
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      ].join(' ')}
    >
      <Icon size={24} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
      <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {label}
      </span>
    </Link>
  );
}

export function Nav() {
  const router    = useRouter();
  const pathname  = usePathname();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const role      = useAuthStore((s) => s.user?.role);

  const isActive = (matches: readonly string[]) =>
    matches.some((m) => pathname === m || pathname.startsWith(`${m}/`));

  return (
    /* Rail estilo Instagram — solo iconos; se expande al hover montándose sobre el contenido */
    <aside className="hidden md:flex group fixed left-0 top-0 z-40 h-full w-20 hover:w-60 flex-col overflow-hidden border-r bg-background px-3 py-5 transition-[width] duration-200">
      {/* Logo */}
      <Link href="/feed" title="CoFinder" className="flex items-center gap-4 h-10 px-2.5 mb-4">
        <Rocket size={26} strokeWidth={1.9} className="shrink-0 text-primary" />
        <span className="text-xl font-bold tracking-tight whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          CoFinder
        </span>
      </Link>

      {/* Menús — centrados verticalmente */}
      <nav className="flex flex-1 flex-col justify-center gap-1">
        {LINKS.map((l) => (
          <RailLink key={l.href} href={l.href} label={l.label} icon={l.icon} active={isActive(l.matches)} />
        ))}

        {/* Notificaciones — panel que se abre a la derecha del rail */}
        <NotificationBell variant="rail" />

        <RailLink {...PROFILE_LINK} active={isActive(PROFILE_LINK.matches)} />
      </nav>

      {/* Footer del rail */}
      <div className="flex flex-col gap-1 pt-3 border-t">
        {role === 'ADMIN' && (
          <RailLink {...ADMIN_LINK} active={isActive(ADMIN_LINK.matches)} />
        )}
        <button
          onClick={() => { clearAuth(); router.push('/'); }}
          title="Salir"
          className="flex items-center gap-4 h-12 rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut size={24} strokeWidth={1.8} className="shrink-0" />
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Salir
          </span>
        </button>
      </div>
    </aside>
  );
}
