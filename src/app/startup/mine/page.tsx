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

const PRESET_CATEGORIES = [
  'AI', 'Fintech', 'EdTech', 'HealthTech', 'E-commerce',
  'SaaS', 'Gaming', 'Social', 'Sostenibilidad', 'Logística',
  'Real Estate', 'Agro', 'Seguridad', 'IoT', 'Entretenimiento',
];

const ROLES_OPTIONS = [
  'Backend Developer', 'Frontend Developer', 'Mobile Developer',
  'Designer', 'Product Manager', 'Marketing', 'Sales',
  'Data Scientist', 'DevOps', 'Finance', 'Legal',
];

interface Project {
  id: string;
  title: string;
  description: string;
  stage: string;
  categories: string[];
  budget: number | null;
  rolesNeeded: string[];
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
  const [rolesNeeded, setRolesNeeded] = useState<string[]>(project.rolesNeeded);

  const toggleCategory = (cat: string) =>
    setCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);

  const addCustomCategory = () => {
    const trimmed = customCat.trim();
    if (trimmed && !categories.includes(trimmed)) setCategories((prev) => [...prev, trimmed]);
    setCustomCat('');
  };

  const toggleRole = (role: string) =>
    setRolesNeeded((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);

  const { mutate: update, isPending: isUpdating, error: updateError } = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(`/projects/${project.id}`, {
        title, description, stage, categories,
        budget: budget ? parseInt(budget) : undefined,
        rolesNeeded,
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
              <Label>Presupuesto (USD)</Label>
              <Input type="number" min={1} value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
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
          <h2 className="font-semibold">{project.title}</h2>
          <Badge variant="outline">{project.stage}</Badge>
        </div>
        {project.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.categories.map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
          </div>
        )}
        <p className="text-sm leading-relaxed">{project.description}</p>
        {project.budget != null && (
          <p className="text-sm text-muted-foreground">Presupuesto: ${project.budget.toLocaleString()}</p>
        )}
        {project.rolesNeeded.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Buscan</p>
            <div className="flex flex-wrap gap-1.5">
              {project.rolesNeeded.map((r) => <Badge key={r} variant="outline">{r}</Badge>)}
            </div>
          </div>
        )}
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
      <Nav />
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Mis proyectos</h1>
          <Button asChild size="sm">
            <Link href="/startup/new">+ Nuevo proyecto</Link>
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
