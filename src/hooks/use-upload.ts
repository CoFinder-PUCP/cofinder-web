'use client';

import { useCallback, useState } from 'react';
import { api } from '@/lib/api';
import { resizeForUpload } from '@/lib/image';

export type UploadTarget = 'project' | 'post';

interface SignResponse {
  key: string;
  uploadUrl: string;
  thumbKey: string;
  thumbUploadUrl: string;
  contentType: string;
  expiresIn: number;
}

export interface UploadResult {
  key: string;
  width: number;
  height: number;
}

/**
 * Sube una imagen en cuatro pasos: redimensionar en el navegador → pedir al API
 * una URL prefirmada → PUT directo al storage → registrar. El API nunca ve los
 * bytes, solo firma y anota.
 *
 * El registro es lo que deja la imagen "pendiente": si el usuario nunca envía
 * el formulario, el cron nocturno la borra en vez de dejarla en el bucket.
 */
export function useUpload(target: UploadTarget) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        const { full, thumb, width, height } = await resizeForUpload(file);

        const { data } = await api.post<SignResponse>('/uploads/sign', {
          target,
          size: full.size,
        });

        await Promise.all([
          put(data.uploadUrl, full, data.contentType, setProgress),
          put(data.thumbUploadUrl, thumb, data.contentType),
        ]);

        // Sin esto el backend rechaza la key al enviar el formulario: para él
        // la imagen no existe hasta que se registra.
        await api.post('/uploads/register', { key: data.key, width, height });

        setProgress(100);
        return { key: data.key, width, height };
      } catch (err) {
        setError(messageFor(err));
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [target],
  );

  return { upload, progress, isUploading, error, reset: () => setError(null) };
}

/**
 * XHR en vez de fetch para tener barra de progreso, y en vez del cliente `api`
 * para NO mandarle el JWT al storage: no lo necesita y no tiene por qué verlo.
 * El Content-Type va firmado, así que tiene que coincidir exacto.
 */
function put(
  url: string,
  blob: Blob,
  contentType: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`El storage rechazó la subida (${xhr.status}).`));
    xhr.onerror = () => reject(new Error('No se pudo conectar con el storage.'));
    xhr.ontimeout = () => reject(new Error('La subida tardó demasiado.'));

    xhr.send(blob);
  });
}

function messageFor(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const status = (err as { response?: { status?: number } }).response?.status;
    if (status === 503) return 'Las subidas de imágenes no están habilitadas.';
    if (status === 429) return 'Demasiadas subidas seguidas. Espera un momento.';
    if (status === 413 || status === 400) return 'La imagen no es válida o pesa demasiado.';
  }
  return err instanceof Error ? err.message : 'No se pudo subir la imagen.';
}
