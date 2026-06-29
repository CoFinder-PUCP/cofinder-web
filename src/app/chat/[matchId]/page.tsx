'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { Nav } from '@/components/layout/nav';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string | null };
}

interface Match {
  id: string;
  projectId: string;
  chat: { id: string };
}

interface Startup {
  id: string;
  title: string;
}

export default function ChatPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useRequireAuth();
  const token = useAuthStore((s) => s.token);
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: match, isLoading: matchLoading } = useQuery<Match>({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const { data } = await api.get(`/matches/${matchId}`);
      return data;
    },
    enabled: isAuthenticated && !!matchId,
  });

  const { data: startup } = useQuery<Startup>({
    queryKey: ['project', match?.projectId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${match!.projectId}`);
      return data;
    },
    enabled: !!match?.projectId,
    staleTime: 1000 * 60 * 5,
  });

  const chatId = match?.chat?.id;

  const { data: messageHistory = [] } = useQuery<Message[]>({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const { data } = await api.get(`/chat/${chatId}/messages`);
      return data;
    },
    enabled: !!chatId,
  });

  useEffect(() => {
    if (messageHistory.length > 0) {
      setMessages(messageHistory);
    }
  }, [messageHistory]);

  useEffect(() => {
    if (!chatId || !token) return;

    const s = io(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000', {
      auth: { token },
    });

    s.emit('joinChat', chatId);

    s.on('newMessage', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [chatId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !chatId) return;
    socket.emit('sendMessage', { chatId, content: input.trim() });
    setInput('');
  };

  if (!hasHydrated || !isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando...</p>
      </main>
    );
  }

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
          <h1 className="font-semibold">
            {matchLoading ? 'Cargando...' : (startup?.title ?? 'Chat')}
          </h1>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto min-h-0" style={{ maxHeight: '60vh' }}>
          {messages.length === 0 && !matchLoading && (
            <p className="text-center text-muted-foreground text-sm py-8">
              Sé el primero en escribir
            </p>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender.id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}
              >
                <p className="text-xs text-muted-foreground">{msg.sender.name ?? msg.sender.id}</p>
                <div
                  className={`px-3 py-2 rounded-lg text-sm max-w-xs ${
                    isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 border-t pt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
          />
          <Button onClick={sendMessage} disabled={!input.trim() || !socket}>
            Enviar
          </Button>
        </div>
      </div>
    </main>
  );
}
