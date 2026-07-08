'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useMe } from '@/hooks/use-me';
import { CareerSelect } from '@/components/ui/career-select';
import { getFacultyByCareer } from '@/lib/careers';
import { PushToggle } from '@/components/push/push-toggle';

const SKILLS_OPTIONS = [
  'Backend', 'Frontend', 'Mobile', 'UI/UX', 'Marketing',
  'Ventas', 'Finanzas', 'Legal', 'Operaciones', 'Data',
];

const LOOKING_FOR_OPTIONS = [
  'Backend Developer', 'Frontend Developer', 'Designer',
  'Product Manager', 'Marketer', 'Investor', 'Mentor', 'Co-founder',
];

interface EditableUser {
  name: string | null;
  bio: string | null;
  career: string | null;
  yearJoined: number | null;
  skills: string[] | null;
  lookingFor: string[] | null;
  emailNotifications: boolean;
  emailWeeklyDigest: boolean;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: { path: string[]; message: string }[];
    };
  };
}

export function ProfileEditForm() {
  const { data: user, isLoading } = useMe();

  if (isLoading || !user) {
    return <p className="text-muted-foreground text-sm">Cargando...</p>;
  }

  return <ProfileEditFormInner user={user} />;
}

function ProfileEditFormInner({ user }: { user: EditableUser }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user.name ?? '');
  const [bio, setBio] = useState(user.bio ?? '');
  const [career, setCareer] = useState(user.career ?? '');
  const [yearJoined, setYearJoined] = useState(user.yearJoined?.toString() ?? '');
  const [skills, setSkills] = useState<string[]>(user.skills ?? []);
  const [lookingFor, setLookingFor] = useState<string[]>(user.lookingFor ?? []);
  const [emailNotifications, setEmailNotifications] = useState(user.emailNotifications);
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(user.emailWeeklyDigest);

  const toggle = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      const faculty = career ? getFacultyByCareer(career) : undefined;
      const { data } = await api.patch('/users/me', {
        ...(name.trim() ? { name: name.trim() } : {}),
        ...(bio.trim() ? { bio: bio.trim() } : {}),
        ...(career ? { career, faculty } : {}),
        ...(yearJoined ? { yearJoined: parseInt(yearJoined) } : {}),
        skills,
        lookingFor,
        emailNotifications,
        emailWeeklyDigest,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      router.push('/profile');
    },
  });

  const apiError = error as ApiError | null;

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
          maxLength={300}
        />
        <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
      </div>

      <CareerSelect value={career} onChange={setCareer} />

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

      <div className="flex flex-col gap-2">
        <Label>Correos</Label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="accent-primary"
          />
          Avisarme por email de invitaciones, postulaciones y aceptaciones
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={emailWeeklyDigest}
            onChange={(e) => setEmailWeeklyDigest(e.target.checked)}
            className="accent-primary"
          />
          Recibir el resumen semanal de la comunidad
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Notificaciones push</Label>
        <PushToggle />
      </div>

      {apiError && (
        <div className="text-sm text-destructive flex flex-col gap-0.5">
          {apiError.response?.data?.errors?.map((e, i) => (
            <p key={i}>{e.path?.length ? `${e.path.join('.')}: ` : ''}{e.message}</p>
          )) ?? (
            <p>{apiError.response?.data?.message ?? 'Ocurrió un error. Intenta de nuevo.'}</p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || name.trim().length < 2} className="flex-1">
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}
