'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Nav } from '@/components/layout/nav';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const STAGES = ['IDEA', 'PROTOTYPE', 'MVP', 'REVENUE'] as const;
const ROLES_OPTIONS = [
  'Backend Developer', 'Frontend Developer', 'Mobile Developer',
  'Designer', 'Product Manager', 'Marketing', 'Sales',
  'Data Scientist', 'DevOps', 'Finance', 'Legal',
];

interface Startup {
  id: string;
  title: string;
  description: string;
  stage: string;
  category: string;
  budget: number | null;
  rolesNeeded: string[];
}

function StartupCard({ startup }: { startup: Startup }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState(startup.title);
  const [description, setDescription] = useState(startup.description);
  const [stage, setStage] = useState(startup.stage);
  const [category, setCategory] = useState(startup.category);
  const [budget, setBudget] = useState(startup.budget?.toString() ?? '');
  const [rolesNeeded, setRolesNeeded] = useState<string[]>(startup.rolesNeeded);

  const toggleRole = (role: string) =>
    setRolesNeeded((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );

  const { mutate: update, isPending: isUpdating, error: updateError } = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(`/startups/${startup.id}`, {
        title, description, stage, category,
        budget: budget ? parseInt(budget) : undefined,
        rolesNeeded,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-startups'] });
      setEditing(false);
    },
  });

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: () => api.delete(`/startups/${startup.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-startups'] }),
  });

  if (editing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => { e.preventDefault(); update(); }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`title-${startup.id}`}>Nombre</Label>
              <Input id={`title-${startup.id}`} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`desc-${startup.id}`}>Descripción</Label>
              <Textarea id={`desc-${startup.id}`} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Etapa</Label>
              <div className="flex gap-2 flex-wrap">
                {STAGES.map((s) => (
                  <Badge key={s} variant={stage === s ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setStage(s)}>
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`cat-${startup.id}`}>Categoría</Label>
              <Input id={`cat-${startup.id}`} value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`budget-${startup.id}`}>Presupuesto (USD)</Label>
              <Input id={`budget-${startup.id}`} type="number" min={1} value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Roles</Label>
              <div className="flex flex-wrap gap-2">
                {ROLES_OPTIONS.map((r) => (
                  <Badge key={r} variant={rolesNeeded.includes(r) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleRole(r)}>
                    {r}
                  </Badge>
                ))}
              </div>
            </div>

            {updateError && <p className="text-sm text-destructive">Error al guardar. Intenta de nuevo.</p>}

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditing(false)}>Cancelar</Button>
              <Button type="submit" disabled={isUpdating} className="flex-1">{isUpdating ? 'Guardando...' : 'Guardar'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold">{startup.title}</h2>
          <Badge variant="outline">{startup.stage}</Badge>
        </div>

        <p className="text-xs text-muted-foreground font-medium">{startup.category}</p>
        <p className="text-sm leading-relaxed">{startup.description}</p>

        {startup.budget != null && (
          <p className="text-sm text-muted-foreground">Presupuesto: ${startup.budget.toLocaleString()}</p>
        )}

        {startup.rolesNeeded.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Buscan</p>
            <div className="flex flex-wrap gap-1.5">
              {startup.rolesNeeded.map((r) => <Badge key={r} variant="secondary">{r}</Badge>)}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => setEditing(true)}>Editar</Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={isDeleting}
            onClick={() => {
              if (confirm('¿Eliminar esta idea? Esta acción eliminará también los matches y chats asociados.')) {
                remove();
              }
            }}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyStartupsPage() {
  const { hasHydrated, isAuthenticated } = useRequireAuth();

  const { data: startups = [], isLoading } = useQuery<Startup[]>({
    queryKey: ['my-startups'],
    queryFn: async () => {
      const { data } = await api.get('/startups/mine');
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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Mis ideas</h1>
          <Button asChild size="sm">
            <Link href="/startup/new">+ Nueva idea</Link>
          </Button>
        </div>

        {isLoading && <p className="text-muted-foreground text-sm">Cargando...</p>}

        {!isLoading && startups.length === 0 && (
          <p className="text-muted-foreground text-sm py-8 text-center">
            No tienes ninguna idea publicada todavía.
          </p>
        )}

        {startups.map((s) => (
          <StartupCard key={s.id} startup={s} />
        ))}
      </div>
    </main>
  );
}
