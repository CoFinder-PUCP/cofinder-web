'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Nav } from '@/components/layout/nav';
import { ChatRoom } from '@/components/chat/chat-room';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { Match } from '@/lib/types';

export default function ChatPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useRequireAuth();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const { data: match, isLoading: matchLoading } = useQuery<Match>({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const { data } = await api.get(`/matches/${matchId}`);
      return data;
    },
    enabled: isAuthenticated && !!matchId,
  });

  if (!hasHydrated || !isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando...</p>
      </main>
    );
  }

  // Contraparte: si soy quien mostró interés, es el founder; si soy el founder,
  // es la persona interesada.
  const iAmInterested = match?.userId === currentUserId;
  const other = iAmInterested ? match?.project.founder : match?.user;

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Nav />
      <div className="max-w-lg mx-auto w-full flex flex-col flex-1 px-4 py-4 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ←
          </button>
          <div className="min-w-0">
            {matchLoading ? (
              <h1 className="font-semibold">Cargando...</h1>
            ) : (
              <>
                <Link href={`/projects/${match?.project.id}`} className="font-semibold hover:underline">
                  {match?.project.title ?? 'Chat'}
                </Link>
                {other && (
                  <p className="text-xs text-muted-foreground truncate">
                    con{' '}
                    <Link href={`/users/${other.id}`} className="hover:underline">
                      {other.name ?? 'usuario'}
                    </Link>
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {match?.chat?.id && <ChatRoom chatId={match.chat.id} />}
      </div>
    </main>
  );
}
