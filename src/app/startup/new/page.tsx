'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Nav } from '@/components/layout/nav';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

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

export default function NewStartupPage() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useRequireAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<string>('IDEA');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [rolesNeeded, setRolesNeeded] = useState<string[]>([]);

  const toggleRole = (role: string) => {
    setRolesNeeded((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/startups', {
        title,
        description,
        stage,
        category,
        budget: budget ? parseInt(budget) : undefined,
        rolesNeeded,
      });
      return data;
    },
    onSuccess: () => router.push('/startup/mine'),
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
          <h1 className="text-xl font-semibold">Crear startup</h1>
          <p className="text-sm text-muted-foreground">Solo puedes tener una startup activa.</p>
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
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={100}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              minLength={20}
              maxLength={1000}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Etapa *</Label>
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
            <Label htmlFor="category">Categoría *</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget">Presupuesto (USD, opcional)</Label>
            <Input
              id="budget"
              type="number"
              min={1}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Roles que buscas *</Label>
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

          {error && (
            <p className="text-sm text-destructive">
              Error al crear la startup. Verifica los campos.
            </p>
          )}

          <Button type="submit" disabled={isPending || rolesNeeded.length === 0}>
            {isPending ? 'Creando...' : 'Crear startup'}
          </Button>
        </form>
      </div>
    </main>
  );
}
