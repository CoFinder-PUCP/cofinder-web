'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Nav } from '@/components/layout/nav';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Project {
  id: string;
  title: string;
  description: string;
  stage: string;
  categories: string[];
  budget: number | null;
  rolesNeeded: string[];
  founder: { id: string; name: string | null; avatar: string | null };
  teamMembers: { role: string }[];
}

export default function SwipePage() {
  const { hasHydrated, isAuthenticated } = useRequireAuth();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchNotice, setMatchNotice] = useState<string | null>(null);

  const { data: feed = [], isLoading, refetch } = useQuery<Project[]>({
    queryKey: ['swipe-feed'],
    queryFn: async () => {
      const { data } = await api.get('/swipe/feed');
      return data;
    },
    enabled: isAuthenticated,
  });

  const { mutate: swipe, isPending } = useMutation({
    mutationFn: async ({ projectId, direction }: { projectId: string; direction: 'LEFT' | 'RIGHT' }) => {
      const { data } = await api.post('/swipe', { projectId, direction });
      return data as { matched: boolean; matchId?: string; chatId?: string };
    },
    onSuccess: (data, variables) => {
      if (variables.direction === 'RIGHT' && data.matched) {
        setMatchNotice(feed[currentIndex]?.title ?? 'proyecto');
        setTimeout(() => setMatchNotice(null), 4000);
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      }
      setCurrentIndex((i) => i + 1);
    },
  });

  if (!hasHydrated || !isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando...</p>
      </main>
    );
  }

  const current = feed[currentIndex];

  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Explorar proyectos</h1>

        {matchNotice && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm">
            ¡Aplicaste a <strong>{matchNotice}</strong>! Revisa tus matches para chatear.
          </div>
        )}

        {isLoading && <p className="text-muted-foreground text-sm">Cargando proyectos...</p>}

        {!isLoading && !current && (
          <div className="text-center py-16 flex flex-col gap-4 items-center">
            <p className="text-muted-foreground text-sm">No hay más proyectos por ahora.</p>
            <Button variant="outline" onClick={() => { setCurrentIndex(0); refetch(); }}>
              Actualizar
            </Button>
          </div>
        )}

        {current && (
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold">{current.title}</h2>
                <Badge variant="outline">{current.stage}</Badge>
              </div>

              {current.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {current.categories.map((c) => (
                    <Badge key={c} variant="secondary">{c}</Badge>
                  ))}
                </div>
              )}

              <p className="text-sm leading-relaxed">{current.description}</p>

              {current.rolesNeeded.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Buscan</p>
                  <div className="flex flex-wrap gap-1.5">
                    {current.rolesNeeded.map((r) => (
                      <Badge key={r} variant="outline">{r}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {current.budget != null && (
                <p className="text-sm text-muted-foreground">Presupuesto: ${current.budget.toLocaleString()}</p>
              )}

              <p className="text-sm text-muted-foreground">
                Fundador: {current.founder.name ?? current.founder.id}
              </p>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" disabled={isPending}
                  onClick={() => swipe({ projectId: current.id, direction: 'LEFT' })}>
                  Pasar
                </Button>
                <Button className="flex-1" disabled={isPending}
                  onClick={() => swipe({ projectId: current.id, direction: 'RIGHT' })}>
                  Aplicar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && feed.length > 0 && current && (
          <p className="text-xs text-center text-muted-foreground">{currentIndex + 1} / {feed.length}</p>
        )}
      </div>
    </main>
  );
}
