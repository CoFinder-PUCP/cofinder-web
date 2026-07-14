'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { ChatRoom } from '@/components/chat/chat-room';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { api } from '@/lib/api';

interface TeamChat {
  id: string;
  project: {
    id: string;
    title: string;
    founderId: string;
    teamMembers: { role: string; user: { id: string; name: string | null } }[];
  };
}

export default function TeamChatPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useRequireAuth();

  const { data: chat, isLoading, isError } = useQuery<TeamChat>({
    queryKey: ['team-chat', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/chat/team/${projectId}`);
      return data;
    },
    enabled: isAuthenticated && !!projectId,
    retry: false,
  });

  if (!hasHydrated || !isAuthenticated || isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando...</p>
      </main>
    );
  }

  if (isError || !chat) {
    return (
      <main className="min-h-screen bg-background">
        
        <div className="max-w-lg mx-auto px-4 py-16 text-center flex flex-col gap-3 items-center">
          <p className="text-muted-foreground text-sm">
            Este chat es solo para el equipo del proyecto.
          </p>
          <Link href={`/projects/${projectId}`} className="text-sm underline">
            Ver el proyecto
          </Link>
        </div>
      </main>
    );
  }

  const memberCount = chat.project.teamMembers.length + 1; // + founder

  return (
    <main className="min-h-screen bg-background flex flex-col">
      
      <div className="max-w-lg mx-auto w-full flex flex-col flex-1 px-4 py-4 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ←
          </button>
          <div className="min-w-0">
            <Link href={`/projects/${chat.project.id}`} className="font-semibold hover:underline">
              {chat.project.title}
            </Link>
            <p className="text-xs text-muted-foreground">
              Chat del equipo · {memberCount} miembro{memberCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <ChatRoom chatId={chat.id} group />
      </div>
    </main>
  );
}
