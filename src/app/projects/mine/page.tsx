'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const STAGES = ['IDEA', 'PROTOTYPE', 'MVP', 'REVENUE'] as const;

const PRESET_CATEGORIES = [
  'AI', 'Fintech', 'EdTech', 'HealthTech', 'E-commerce',
  'SaaS', 'Gaming', 'Social', 'Sostenibilidad', 'Logística',
  'Real Estate', 'Agro', 'Seguridad', 'IoT', 'Entretenimiento',
];

interface Opening {
  id: string;
  title: string;
  description: string | null;
  isOpen: boolean;
}

interface Project {
  id: string;
  title: string;
  description: string;
  stage: string;
  categories: string[];
  budget: number | null;
  budgetCurrency: 'USD' | 'PEN' | null;
  openings: Opening[];
  teamMembers: { id: string; role: string; user: { id: string; name: string | null } }[];
  _count?: { teamMembers: number; matches: number };
}

/** Gestión de convocatorias: abrir/cerrar, eliminar y agregar. */
function OpeningsManager({ project }: { project: Project }) {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState('');
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['my-projects'] });

  const { mutate: toggleOpening } = useMutation({
    mutationFn: (o: Opening) => api.patch(`/projects/openings/${o.id}`, { isOpen: !o.isOpen }),
    onSuccess: invalidate,
  });

  const { mutate: removeOpening } = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/openings/${id}`),
    onSuccess: invalidate,
  });

  const { mutate: addOpening, isPending: isAdding } = useMutation({
    mutationFn: () => api.post(`/projects/${project.id}/openings`, { title: newTitle.trim() }),
    onSuccess: () => {
      setNewTitle('');
      invalidate();
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Convocatorias
      </p>
      {project.openings.length === 0 && (
        <p className="text-xs text-muted-foreground">Sin convocatorias. Agrega una para recibir postulaciones.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {project.openings.map((o) => (
          <span key={o.id} className="inline-flex items-center gap-1">
            <Badge
              variant={o.isOpen ? 'default' : 'outline'}
              className="cursor-pointer"
              title={o.isOpen ? 'Clic para cerrar la convocatoria' : 'Clic para reabrirla'}
              onClick={() => toggleOpening(o)}
            >
              {o.title}
              {!o.isOpen && ' (cerrada)'}
            </Badge>
            <button
              type="button"
              onClick={() => {
                if (confirm(`¿Eliminar la convocatoria "${o.title}"?`)) removeOpening(o.id);
              }}
              className="text-muted-foreground hover:text-destructive text-xs"
              aria-label={`Eliminar ${o.title}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nueva convocatoria (ej. Backend Developer)"
          maxLength={50}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (newTitle.trim().length >= 2) addOpening();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={isAdding || newTitle.trim().length < 2}
          onClick={() => addOpening()}
        >
          +
        </Button>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [stage, setStage] = useState(project.stage);
  const [categories, setCategories] = useState<string[]>(project.categories);
  const [customCat, setCustomCat] = useState('');
  const [budget, setBudget] = useState(project.budget?.toString() ?? '');
  const [budgetCurrency, setBudgetCurrency] = useState<'USD' | 'PEN'>(project.budgetCurrency ?? 'USD');

  const toggleCategory = (cat: string) =>
    setCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);

  const addCustomCategory = () => {
    const trimmed = customCat.trim();
    if (trimmed && !categories.includes(trimmed)) setCategories((prev) => [...prev, trimmed]);
    setCustomCat('');
  };

  const { mutate: update, isPending: isUpdating, error: updateError } = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(`/projects/${project.id}`, {
        title, description, stage, categories,
        budget: budget ? parseFloat(parseFloat(budget).toFixed(2)) : undefined,
        budgetCurrency: budget ? budgetCurrency : undefined,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      setEditing(false);
    },
  });

  const { mutate: remove, isPending: isDeleting } = useMutation({
    mutationFn: () => api.delete(`/projects/${project.id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-projects'] }),
  });

  if (editing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); update(); }}>
            <div className="flex flex-col gap-1.5">
              <Label>Nombre</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Descripción</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
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
            <div className="flex flex-col gap-2">
              <Label>Categorías</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_CATEGORIES.map((cat) => (
                  <Badge key={cat} variant={categories.includes(cat) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleCategory(cat)}>
                    {cat}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={customCat} onChange={(e) => setCustomCat(e.target.value)} placeholder="Otra categoría..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomCategory(); } }} />
                <Button type="button" variant="outline" onClick={addCustomCategory}>+</Button>
              </div>
              {categories.filter((c) => !PRESET_CATEGORIES.includes(c)).map((c) => (
                <Badge key={c} variant="default" className="cursor-pointer w-fit" onClick={() => toggleCategory(c)}>{c} ×</Badge>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Presupuesto</Label>
              <div className="flex gap-2">
                <select
                  value={budgetCurrency}
                  onChange={(e) => setBudgetCurrency(e.target.value as 'USD' | 'PEN')}
                  className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PEN">PEN (S/)</option>
                </select>
                <Input type="number" min={0.01} step={0.01} value={budget} onChange={(e) => setBudget(e.target.value)} className="flex-1" />
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

  const pendingCount = project._count?.teamMembers ?? 0;
  const interestedCount = project._count?.matches ?? 0;

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/projects/${project.id}`} className="font-semibold hover:underline">
            {project.title}
          </Link>
          <Badge variant="outline">{project.stage}</Badge>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {pendingCount > 0 && (
            <Link href={`/projects/${project.id}`}>
              <Badge>{pendingCount} postulación{pendingCount > 1 ? 'es' : ''} pendiente{pendingCount > 1 ? 's' : ''}</Badge>
            </Link>
          )}
          {interestedCount > 0 && (
            <Link href="/matches?tab=incoming">
              <Badge variant="secondary">{interestedCount} interesado{interestedCount > 1 ? 's' : ''}</Badge>
            </Link>
          )}
          {project.teamMembers.length > 0 && (
            <Badge variant="outline">Equipo: {project.teamMembers.map((t) => t.user.name?.split(' ')[0] ?? '?').join(', ')}</Badge>
          )}
        </div>
        {project.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.categories.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
          </div>
        )}
        <p className="text-sm leading-relaxed">{project.description}</p>
        {project.budget != null && (
          <p className="text-sm text-muted-foreground">
            Presupuesto: {project.budgetCurrency === 'PEN' ? 'S/' : '$'}{project.budget.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        )}
        <OpeningsManager project={project} />
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => setEditing(true)}>Editar</Button>
          <Button variant="destructive" className="flex-1" disabled={isDeleting}
            onClick={() => { if (confirm('¿Eliminar este proyecto? Se eliminarán también los matches y chats asociados.')) remove(); }}>
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyProjectsPage() {
  const { hasHydrated, isAuthenticated } = useRequireAuth();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['my-projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects/mine');
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
      
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Mis proyectos</h1>
          <Button asChild size="sm">
            <Link href="/projects/new">+ Nuevo proyecto</Link>
          </Button>
        </div>

        {isLoading && <p className="text-muted-foreground text-sm">Cargando...</p>}

        {!isLoading && projects.length === 0 && (
          <p className="text-muted-foreground text-sm py-8 text-center">
            No tienes ningún proyecto publicado todavía.
          </p>
        )}

        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </main>
  );
}
