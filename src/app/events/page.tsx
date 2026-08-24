'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Check, MapPin, Users } from 'lucide-react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AppEvent, EVENT_TYPE_LABELS, formatEventDate } from '@/lib/types';

function EventCard({ event }: { event: AppEvent }) {
  return (
    <Link href={`/events/${event.id}`} className="block">
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="pt-5 pb-5 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold leading-tight">{event.title}</p>
            <Badge variant="secondary" className="shrink-0">
              {EVENT_TYPE_LABELS[event.type]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              {formatEventDate(event.startsAt, event.endsAt)}
            </span>
            {event.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {event._count?.registrations ?? 0} inscritos
            </span>
            {event.registeredByMe && <Badge className="text-xs"><Check />Inscrito</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">
            Organiza: {event.organizer.name ?? '—'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function EventsPage() {
  const { hasHydrated, isAuthenticated } = useRequireAuth();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const { data: events = [], isLoading } = useQuery<AppEvent[]>({
    queryKey: ['events', tab],
    queryFn: async () => (await api.get(`/events?when=${tab}`)).data,
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
      
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold">Eventos</h1>
            <p className="text-sm text-muted-foreground">
              Hackathons, ferias y demo days de la comunidad.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/events/new">+ Publicar evento</Link>
          </Button>
        </div>

        <div className="flex gap-2 border-b pb-2">
          {([
            { key: 'upcoming', label: 'Próximos' },
            { key: 'past', label: 'Pasados' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-sm px-2 py-1 rounded-md ${
                tab === t.key ? 'bg-accent font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading && <p className="text-muted-foreground text-sm">Cargando eventos...</p>}

        {!isLoading && events.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center gap-3">
            <p className="text-muted-foreground text-sm">
              {tab === 'upcoming' ? 'No hay eventos próximos.' : 'No hay eventos pasados.'}
            </p>
            {tab === 'upcoming' && (
              <Button asChild variant="outline" size="sm">
                <Link href="/events/new">Publica el primero</Link>
              </Button>
            )}
          </div>
        )}

        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </main>
  );
}
