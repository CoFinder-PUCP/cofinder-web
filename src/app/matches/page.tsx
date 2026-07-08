'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Nav } from '@/components/layout/nav';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { api } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Match } from '@/lib/types';

function MatchRow({ match, incoming }: { match: Match; incoming: boolean }) {
  const lastMessage = match.chat?.messages?.[0];
  const unread = match.chat?._count?.messages ?? 0;

  // En "mis intereses" la contraparte es el founder; en "entrantes", el interesado
  const other = incoming ? match.user : match.project.founder;
  const initials = other?.name
    ? other.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <Link href={`/chat/${match.id}`}>
      <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
        <CardContent className="pt-4 pb-4 flex items-center gap-3">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarImage src={other?.avatar ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium truncate">{match.project.title}</p>
              {unread > 0 && (
                <Badge className="shrink-0 text-xs">{unread > 9 ? '9+' : unread}</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {incoming
                ? `${other?.name ?? 'Alguien'} está interesado`
                : `Founder: ${other?.name ?? '—'}`}
              {match.project.categories.length > 0 && ` · ${match.project.categories[0]}`}
            </p>
            {lastMessage ? (
              <p className="text-sm text-muted-foreground truncate">
                <span className="font-medium">
                  {lastMessage.sender.name?.split(' ')[0] ?? '?'}:
                </span>{' '}
                {lastMessage.content}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Sin mensajes aún</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function MatchesContent() {
  const { hasHydrated, isAuthenticated } = useRequireAuth();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'mine' | 'incoming'>(
    searchParams.get('tab') === 'incoming' ? 'incoming' : 'mine',
  );

  const { data: mine = [], isLoading: loadingMine } = useQuery<Match[]>({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data } = await api.get('/matches');
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: incoming = [], isLoading: loadingIncoming } = useQuery<Match[]>({
    queryKey: ['matches-incoming'],
    queryFn: async () => {
      const { data } = await api.get('/matches/incoming');
      return data;
    },
    enabled: isAuthenticated,
  });

  if (!hasHydrated || !isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando...</p>
      </main>
    );
  }

  const isIncoming = tab === 'incoming';
  const list = isIncoming ? incoming : mine;
  const isLoading = isIncoming ? loadingIncoming : loadingMine;

  const unreadOf = (ms: Match[]) =>
    ms.reduce((acc, m) => acc + (m.chat?._count?.messages ?? 0), 0);

  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Matches</h1>

        <div className="flex gap-2 border-b pb-2">
          {([
            { key: 'mine', label: 'Mis intereses', count: unreadOf(mine) },
            { key: 'incoming', label: 'Interesados en mis proyectos', count: unreadOf(incoming) },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-sm px-2 py-1 rounded-md flex items-center gap-1.5 ${
                tab === t.key ? 'bg-accent font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
              {t.count > 0 && <Badge className="text-xs">{t.count}</Badge>}
            </button>
          ))}
        </div>

        {isLoading && <p className="text-muted-foreground text-sm">Cargando matches...</p>}

        {!isLoading && list.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center gap-3">
            <p className="text-muted-foreground text-sm">
              {isIncoming
                ? 'Nadie ha mostrado interés en tus proyectos todavía.'
                : 'No tienes matches todavía.'}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href={isIncoming ? '/projects/mine' : '/projects'}>
                {isIncoming ? 'Ver mis proyectos' : 'Explorar proyectos'}
              </Link>
            </Button>
          </div>
        )}

        {list.map((m) => (
          <MatchRow key={m.id} match={m} incoming={isIncoming} />
        ))}
      </div>
    </main>
  );
}

export default function MatchesPage() {
  return (
    <Suspense>
      <MatchesContent />
    </Suspense>
  );
}
