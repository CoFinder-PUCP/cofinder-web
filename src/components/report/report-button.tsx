'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Flag } from 'lucide-react';
import { api } from '@/lib/api';
import { ReportTargetType } from '@/lib/types';

/**
 * Botón discreto de "Reportar": pide el motivo y crea el reporte que verán
 * los admins en su bandeja de moderación.
 */
export function ReportButton({
  targetType,
  targetId,
}: {
  targetType: ReportTargetType;
  targetId: string;
}) {
  const [done, setDone] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: (reason: string) => api.post('/reports', { targetType, targetId, reason }),
    onSuccess: () => setDone(true),
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message ?? 'No se pudo enviar el reporte');
    },
  });

  if (done) {
    return <span className="text-xs text-muted-foreground">Reportado. Gracias</span>;
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        const reason = prompt('¿Por qué reportas este contenido? (mínimo 5 caracteres)');
        if (reason && reason.trim().length >= 5) mutate(reason.trim());
        else if (reason !== null) alert('El motivo es muy corto');
      }}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
    >
      <Flag className="w-3 h-3" />
      Reportar
    </button>
  );
}
