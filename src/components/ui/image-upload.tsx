'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useUpload, type UploadTarget } from '@/hooks/use-upload';
import { ACCEPTED_TYPES } from '@/lib/image';
import { mediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  /** Key del objeto en el storage, o null si todavía no hay imagen. */
  value: string | null;
  onChange: (key: string | null) => void;
  target: UploadTarget;
  className?: string;
  /** Proporción del recuadro. La card del swipe es vertical. */
  aspect?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  target,
  className,
  aspect = 'aspect-[4/5]',
  disabled,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { upload, progress, isUploading, error } = useUpload(target);

  const busy = isUploading || disabled;

  const handleFile = async (file: File | undefined) => {
    if (!file || busy) return;
    const result = await upload(file);
    if (result) onChange(result.key);
  };

  const preview = mediaUrl(value);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div
        role="button"
        tabIndex={busy ? -1 : 0}
        aria-label={value ? 'Cambiar imagen' : 'Subir imagen'}
        aria-busy={isUploading}
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !busy) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          'relative w-full overflow-hidden rounded-xl border-2 border-dashed transition-colors',
          aspect,
          isDragging ? 'border-primary bg-primary/5' : 'border-border',
          busy ? 'cursor-default opacity-70' : 'cursor-pointer hover:border-primary/60 hover:bg-muted/40',
          error && 'border-destructive',
        )}
      >
        {preview ? (
          // <img> y no next/image a propósito: la imagen ya viene optimizada
          // (WebP, redimensionada) desde el navegador, y el optimizador de
          // Vercel tiene un límite chico en el plan gratuito.
          <img src={preview} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <ImagePlus className="size-6 opacity-60" />
            <p className="text-xs">Arrastra una foto o haz clic</p>
            <p className="text-[0.7rem] opacity-70">JPG, PNG o WebP</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 backdrop-blur-sm">
            <Loader2 className="size-5 animate-spin text-primary" />
            <div className="h-1 w-2/3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-[width] duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {value && !isUploading && (
          <button
            type="button"
            aria-label="Quitar imagen"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          // Permite volver a elegir el mismo archivo tras quitarlo.
          e.target.value = '';
        }}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
