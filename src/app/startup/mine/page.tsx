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
  'Backend Developer',
  'Frontend Developer',
  'Mobile Developer',
  'Designer',
  'Product Manager',
  'Marketing',
  'Sales',
  'Data Scientist',
  'DevOps',
  'Finance',
  'Legal',
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

export default function MyStartupPage() {
  const { hasHydrated, isAuthenticated } = useRequireAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState('IDEA');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [rolesNeeded, setRolesNeeded] = useState<string[]>([]);

  const { data: startup, isLoading } = useQuery<Startup | null>({
    queryKey: ['my-startup'],
    queryFn: async () => {
      const { data } = await api.get('/startups/mine');
      return data;
    },
    enabled: isAuthenticated,
  });

  const startEdit = (s: Startup) => {
    setTitle(s.title);
    setDescription(s.description);
    setStage(s.stage);
    setCategory(s.category);
    setBudget(s.budget?.toString() ?? '');
    setRolesNeeded(s.rolesNeeded);
    setEditing(true);
  };

  const toggleRole = (role: string) => {
    setRolesNeeded((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const { mutate: updateStartup, isPending: isUpdating, error: updateError } = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(`/startups/${startup!.id}`, {
        title,
        description,
        stage,
        category,
        budget: budget ? parseInt(budget) : undefined,
        rolesNeeded,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-startup'] });
      setEditing(false);
    },
  });

  const { mutate: deleteStartup, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      await api.delete(`/startups/${startup!.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-startup'] });
    },
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
        <h1 className="text-xl font-semibold">Mi startup</h1>

        {isLoading && <p className="text-muted-foreground text-sm">Cargando...</p>}

        {!isLoading && !startup && (
          <div className="flex flex-col gap-4 py-8 items-center text-center">
            <p className="text-muted-foreground text-sm">No tienes ninguna startup creada.</p>
            <Button asChild>
              <Link href="/startup/new">Crear startup</Link>
            </Button>
          </div>
        )}

        {startup && !editing && (
          <Card>
            <CardContent className="pt-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold">{startup.title}</h2>
                <Badge variant="outline">{startup.stage}</Badge>
              </div>

              <p className="text-xs text-muted-foreground font-medium">{startup.category}</p>

              <p className="text-sm leading-relaxed">{startup.description}</p>

              {startup.budget != null && (
                <p className="text-sm text-muted-foreground">
                  Presupuesto: ${startup.budget.toLocaleString()}
                </p>
              )}

              {startup.rolesNeeded.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Buscan
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {startup.rolesNeeded.map((r) => (
                      <Badge key={r} variant="secondary">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => startEdit(startup)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={isDeleting}
                  onClick={() => {
                    if (
                      confirm(
                        '¿Eliminar startup? Esta acción eliminará también los matches y chats asociados.',
                      )
                    ) {
                      deleteStartup();
                    }
                  }}
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {startup && editing && (
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              updateStartup();
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Nombre</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Etapa</Label>
              <div className="flex gap-2 flex-wrap">
                {STAGES.map((s) => (
                  <Badge
                    key={s}
                    variant={stage === s ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setStage(s)}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budget">Presupuesto (USD)</Label>
              <Input
                id="budget"
                type="number"
                min={1}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Roles</Label>
              <div className="flex flex-wrap gap-2">
                {ROLES_OPTIONS.map((r) => (
                  <Badge
                    key={r}
                    variant={rolesNeeded.includes(r) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleRole(r)}
                  >
                    {r}
                  </Badge>
                ))}
              </div>
            </div>

            {updateError && (
              <p className="text-sm text-destructive">Error al guardar. Intenta de nuevo.</p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setEditing(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdating} className="flex-1">
                {isUpdating ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
