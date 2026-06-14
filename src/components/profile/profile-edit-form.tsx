'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useMe } from '@/hooks/use-me';

const SKILLS_OPTIONS = [
  'Backend', 'Frontend', 'Mobile', 'UI/UX', 'Marketing',
  'Ventas', 'Finanzas', 'Legal', 'Operaciones', 'Data',
];

const LOOKING_FOR_OPTIONS = [
  'Backend Developer', 'Frontend Developer', 'Designer',
  'Product Manager', 'Marketer', 'Investor', 'Mentor', 'Co-founder',
];

export function ProfileEditForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useMe();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [faculty, setFaculty] = useState('');
  const [yearJoined, setYearJoined] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setBio(user.bio ?? '');
      setFaculty(user.faculty ?? '');
      setYearJoined(user.yearJoined?.toString() ?? '');
      setSkills(user.skills ?? []);
      setLookingFor(user.lookingFor ?? []);
    }
  }, [user]);

  const toggle = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/users/me', {
        name,
        bio,
        faculty,
        yearJoined: yearJoined ? parseInt(yearJoined) : undefined,
        skills,
        lookingFor,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      router.push('/profile');
    },
  });

  if (isLoading) return <p className="text-muted-foreground text-sm">Cargando...</p>;

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => { e.preventDefault(); mutate(); }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="faculty">Facultad</Label>
        <Input
          id="faculty"
          value={faculty}
          onChange={(e) => setFaculty(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="year">Año de ingreso</Label>
        <Input
          id="year"
          type="number"
          value={yearJoined}
          onChange={(e) => setYearJoined(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Mis habilidades</Label>
        <div className="flex flex-wrap gap-2">
          {SKILLS_OPTIONS.map((s) => (
            <Badge
              key={s}
              variant={skills.includes(s) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggle(skills, s, setSkills)}
            >
              {s}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Busco</Label>
        <div className="flex flex-wrap gap-2">
          {LOOKING_FOR_OPTIONS.map((l) => (
            <Badge
              key={l}
              variant={lookingFor.includes(l) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggle(lookingFor, l, setLookingFor)}
            >
              {l}
            </Badge>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">Ocurrió un error. Intenta de nuevo.</p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
