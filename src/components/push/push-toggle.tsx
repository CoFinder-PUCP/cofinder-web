'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

type PushState =
  | 'loading'
  | 'unsupported'
  | 'denied'
  | 'subscribed'
  | 'unsubscribed';

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/**
 * Activa/desactiva las notificaciones push de este dispositivo.
 * Si el backend no tiene VAPID configurado, se muestra como no disponible.
 */
export function PushToggle() {
  const [state, setState] = useState<PushState>('loading');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setState('unsupported');
        return;
      }
      if (Notification.permission === 'denied') {
        setState('denied');
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setState(sub ? 'subscribed' : 'unsubscribed');
      } catch {
        setState('unsupported');
      }
    })();
  }, []);

  const enable = async () => {
    setBusy(true);
    try {
      const { data } = await api.get('/push/public-key');
      if (!data.publicKey) {
        setState('unsupported');
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'unsubscribed');
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });
      await api.post('/push/subscribe', sub.toJSON());
      setState('subscribed');
    } catch {
      setState('unsubscribed');
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.delete('/push/subscribe', { data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
      setState('unsubscribed');
    } catch {
      setState('subscribed');
    } finally {
      setBusy(false);
    }
  };

  if (state === 'loading') return null;

  if (state === 'unsupported') {
    return (
      <p className="text-xs text-muted-foreground">
        Las notificaciones push no están disponibles en este navegador.
      </p>
    );
  }

  if (state === 'denied') {
    return (
      <p className="text-xs text-muted-foreground">
        Bloqueaste las notificaciones para CoFinder. Puedes volver a permitirlas
        desde la configuración del sitio en tu navegador.
      </p>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm">
        {state === 'subscribed'
          ? 'Este dispositivo recibe notificaciones push.'
          : 'Recibe avisos aunque no tengas CoFinder abierto.'}
      </p>
      <Button
        type="button"
        size="sm"
        variant={state === 'subscribed' ? 'outline' : 'default'}
        disabled={busy}
        onClick={state === 'subscribed' ? disable : enable}
      >
        {busy ? '...' : state === 'subscribed' ? 'Desactivar' : 'Activar'}
      </Button>
    </div>
  );
}
