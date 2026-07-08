'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message } from '@/lib/types';

interface ChatRoomProps {
  chatId: string;
  /** true si es chat grupal: muestra el nombre del que escribe */
  group?: boolean;
}

/**
 * Sala de chat reutilizable (1:1 y grupal): historial REST + tiempo real por
 * socket, indicador de escritura y confirmación de lectura (✓✓).
 */
export function ChatRoom({ chatId, group = false }: ChatRoomProps) {
  const token = useAuthStore((s) => s.token);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [socketReady, setSocketReady] = useState(false);
  const [typingName, setTypingName] = useState<string | null>(null);
  const [othersReadAt, setOthersReadAt] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const lastTypingSent = useRef(0);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messageHistory = [] } = useQuery<Message[]>({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const { data } = await api.get(`/chat/${chatId}/messages`);
      // Al listar se marcan como leídos: refrescar contadores de matches
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['matches-incoming'] });
      return data;
    },
    enabled: !!chatId,
  });

  const messages = useMemo(() => {
    const seen = new Set(messageHistory.map((m) => m.id));
    return [...messageHistory, ...liveMessages.filter((m) => !seen.has(m.id))];
  }, [messageHistory, liveMessages]);

  useEffect(() => {
    if (!chatId || !token) return;

    const s = io(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000', {
      auth: { token },
    });
    socketRef.current = s;

    s.emit('joinChat', chatId, () => {
      // Avisar lectura al entrar (el historial REST ya marcó en BD)
      s.emit('markRead', { chatId });
    });
    s.on('connect', () => setSocketReady(true));

    s.on('newMessage', (msg: Message) => {
      setLiveMessages((prev) => [...prev, msg]);
      setTypingName(null);
      // Estoy viendo el chat: confirmo lectura de lo que llega
      if (msg.sender.id !== currentUserId) s.emit('markRead', { chatId });
    });

    s.on('typing', (data: { chatId: string; userId: string; name: string | null }) => {
      if (data.userId === currentUserId) return;
      setTypingName(data.name ?? 'Alguien');
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setTypingName(null), 3000);
    });

    s.on('messagesRead', () => setOthersReadAt(Date.now()));

    return () => {
      s.disconnect();
      socketRef.current = null;
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      setSocketReady(false);
      setLiveMessages([]);
      setTypingName(null);
      setOthersReadAt(null);
    };
  }, [chatId, token, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingName]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current || !chatId) return;
    socketRef.current.emit('sendMessage', { chatId, content: input.trim() });
    setInput('');
  };

  const notifyTyping = () => {
    const now = Date.now();
    if (now - lastTypingSent.current > 2000 && socketRef.current) {
      socketRef.current.emit('typing', { chatId });
      lastTypingSent.current = now;
    }
  };

  const lastOwnMessage = [...messages].reverse().find((m) => m.sender.id === currentUserId);
  const lastOwnSeen =
    lastOwnMessage &&
    (lastOwnMessage.isRead ||
      (othersReadAt !== null && othersReadAt >= new Date(lastOwnMessage.createdAt).getTime()));

  return (
    <>
      <div className="flex flex-col gap-2 overflow-y-auto min-h-0" style={{ maxHeight: '60vh' }}>
        {messages.length === 0 && (
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
              {(group || !isMe) && (
                <p className="text-xs text-muted-foreground">{msg.sender.name ?? '—'}</p>
              )}
              <div
                className={`px-3 py-2 rounded-lg text-sm max-w-xs ${
                  isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                {msg.content}
              </div>
              {isMe && msg.id === lastOwnMessage?.id && lastOwnSeen && (
                <p className="text-[10px] text-muted-foreground">✓✓ Visto</p>
              )}
            </div>
          );
        })}
        {typingName && (
          <p className="text-xs text-muted-foreground italic">
            {group ? `${typingName} está escribiendo...` : 'Escribiendo...'}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t pt-4">
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            notifyTyping();
          }}
          placeholder="Escribe un mensaje..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        <Button onClick={sendMessage} disabled={!input.trim() || !socketReady}>
          Enviar
        </Button>
      </div>
    </>
  );
}
