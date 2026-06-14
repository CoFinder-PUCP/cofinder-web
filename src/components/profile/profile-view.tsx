'use client';

import Link from 'next/link';
import { useMe } from '@/hooks/use-me';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ProfileView() {
  const { data: user, isLoading } = useMe();

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Cargando perfil...</p>;
  }

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6 flex flex-col gap-4">

          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar ?? undefined} alt={user.name ?? ''} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-lg">{user.name ?? 'Sin nombre'}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="outline" className="w-fit text-xs mt-1">{user.role}</Badge>
            </div>
          </div>

          {user.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
          )}

          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {user.faculty && <span>📚 {user.faculty}</span>}
            {user.yearJoined && <span>🎓 Ingresó en {user.yearJoined}</span>}
          </div>

        </CardContent>
      </Card>

      {user.skills?.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Habilidades</p>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((s: string) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </div>
        </div>
      )}

      {user.lookingFor?.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Busco</p>
          <div className="flex flex-wrap gap-2">
            {user.lookingFor.map((l: string) => (
              <Badge key={l} variant="outline">{l}</Badge>
            ))}
          </div>
        </div>
      )}

      <Button asChild variant="outline" className="w-full">
        <Link href="/profile/edit">Editar perfil</Link>
      </Button>
    </div>
  );
}
