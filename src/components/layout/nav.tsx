'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const cls = (matches: string[]) =>
    matches.some((m) => pathname.startsWith(m))
      ? 'text-foreground font-medium'
      : 'text-muted-foreground hover:text-foreground';

  return (
    <nav className="border-b px-4 py-3 flex items-center justify-between text-sm">
      <div className="flex gap-6">
        <Link href="/swipe" className={cls(['/swipe'])}>
          Explorar
        </Link>
        <Link href="/matches" className={cls(['/matches', '/chat'])}>
          Matches
        </Link>
        <Link href="/startup/mine" className={cls(['/startup'])}>
          Startup
        </Link>
        <Link href="/profile" className={cls(['/profile'])}>
          Perfil
        </Link>
      </div>
      <button
        onClick={() => {
          clearAuth();
          router.push('/');
        }}
        className="text-muted-foreground hover:text-foreground"
      >
        Salir
      </button>
    </nav>
  );
}
