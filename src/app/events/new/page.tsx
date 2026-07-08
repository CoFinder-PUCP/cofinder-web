'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Nav } from '@/components/layout/nav';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EventType, EVENT_TYPE_LABELS } from '@/lib/types';

const TYPES = Object.keys(EVENT_TYPE_LABELS) as EventType[];

export default function NewEventPage() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useRequireAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('HACKATHON');
  const [location, setLocation] = useState('');
  const [url, setUrl] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/events', {
        title,
        description,
        type,
        location: location.trim() || undefined,
        url: url.trim() || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
      });
      return data;
    },
    onSuccess: (data) => router.push(`/events/${data.id}`),
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
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold">Publicar evento</h1>
          <p className="text-sm text-muted-foreground">
            Hackathons, ferias, demo days, talleres... cualquier espacio para que la comunidad se
            junte.
          </p>
        </div>

        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            mutate();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Nombre *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} maxLength={100} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Tipo *</Label>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map((t) => (
                <Badge
                  key={t}
                  variant={type === t ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setType(t)}
                >
                  {EVENT_TYPE_LABELS[t]}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              minLength={10}
              maxLength={2000}
              placeholder="Qué es, para quién, cómo participar, premios..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="startsAt">Inicio *</Label>
            <Input id="startsAt" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="endsAt">Fin (opcional)</Label>
            <Input id="endsAt" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Lugar (o &quot;Online&quot;)</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={150} placeholder="Ej. Complejo de Innovación Académica, PUCP" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url">Link (info, registro externo o meet)</Label>
            <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} maxLength={300} placeholder="https://..." />
          </div>

          {error && (
            <p className="text-sm text-destructive">
              No se pudo crear el evento. Revisa los campos (el fin debe ser posterior al inicio).
            </p>
          )}

          <Button type="submit" disabled={isPending || !startsAt}>
            {isPending ? 'Publicando...' : 'Publicar evento'}
          </Button>
        </form>
      </div>
    </main>
  );
}
