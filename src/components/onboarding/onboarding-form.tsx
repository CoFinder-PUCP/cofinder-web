'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { CareerSelect } from '@/components/ui/career-select';
import { getFacultyByCareer } from '@/lib/careers';

const SKILLS_OPTIONS = [
  'Backend', 'Frontend', 'Mobile', 'UI/UX', 'Marketing',
  'Ventas', 'Finanzas', 'Legal', 'Operaciones', 'Data',
];

const LOOKING_FOR_OPTIONS = [
  'Backend Developer', 'Frontend Developer', 'Designer',
  'Product Manager', 'Marketer', 'Investor', 'Mentor', 'Co-founder',
];

export function OnboardingForm() {
  const router = useRouter();
  const { setAuth, token } = useAuthStore();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [career, setCareer] = useState('');
  const [yearJoined, setYearJoined] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);

  const toggle = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      const faculty = career ? getFacultyByCareer(career) : undefined;
      const { data } = await api.patch('/users/me', {
        name: name.trim(),
        ...(bio.trim() ? { bio: bio.trim() } : {}),
        ...(career ? { career, faculty } : {}),
        ...(yearJoined ? { yearJoined: parseInt(yearJoined) } : {}),
        skills,
        lookingFor,
      });
      return data;
    },
    onSuccess: (user) => {
      if (token) setAuth(user, token);
      router.replace('/swipe');
    },
  });

  const isValid = name.trim().length >= 2;

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => { e.preventDefault(); if (isValid) mutate(); }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          placeholder="Tu nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Cuéntanos sobre ti en 2-3 líneas..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
        />
      </div>

      <CareerSelect value={career} onChange={setCareer} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="year">Año de ingreso</Label>
        <Input
          id="year"
          type="number"
          placeholder="Ej. 2021"
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

      <Button type="submit" disabled={!isValid || isPending} className="w-full">
        {isPending ? 'Guardando...' : 'Entrar a CoFinder'}
      </Button>
    </form>
  );
}
