'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Nav } from '@/components/layout/nav';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';

interface RawMatch {
  id: string;
  projectId: string;
  chat: {
    id: string;
    messages: { content: string; createdAt: string }[];
  };
}

interface Startup {
  id: string;
  title: string;
  category: string;
}

function MatchRow({ match }: { match: RawMatch }) {
  const { data: startup } = useQuery<Startup>({
    queryKey: ['project', match.projectId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${match.projectId}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const lastMessage = match.chat?.messages?.[0];

  return (
    <Link href={`/chat/${match.id}`}>
      <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
        <CardContent className="pt-4 pb-4 flex flex-col gap-1">
          <p className="font-medium">{startup?.title ?? '...'}</p>
          <p className="text-xs text-muted-foreground">{startup?.category ?? ''}</p>
          {lastMessage ? (
            <p className="text-sm text-muted-foreground truncate">{lastMessage.content}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Sin mensajes aún</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function MatchesPage() {
  const { hasHydrated, isAuthenticated } = useRequireAuth();

  const { data: matches = [], isLoading } = useQuery<RawMatch[]>({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data } = await api.get('/matches');
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

  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Mis matches</h1>

        {isLoading && (
          <p className="text-muted-foreground text-sm">Cargando matches...</p>
        )}

        {!isLoading && matches.length === 0 && (
          <p className="text-muted-foreground text-sm py-8 text-center">
            No tienes matches todavía. ¡Ve a explorar startups!
          </p>
        )}

        {matches.map((match) => (
          <MatchRow key={match.id} match={match} />
        ))}
      </div>
    </main>
  );
}
