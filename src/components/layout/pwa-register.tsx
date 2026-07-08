'use client';

import { useEffect } from 'react';

/** Registra el service worker (push + instalación como PWA). */
export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Sin SW la app sigue funcionando; solo se pierde push/instalación
      });
    }
  }, []);
  return null;
}
