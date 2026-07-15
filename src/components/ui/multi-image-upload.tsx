'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useUpload, type UploadTarget } from '@/hooks/use-upload';
import { ACCEPTED_TYPES } from '@/lib/image';
import { thumbUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

interface MultiImageUploadProps {
  /** Keys en el orden en que se muestran. */
  value: string[];
  onChange: (keys: string[]) => void;
  target: UploadTarget;
  max: number;
  className?: string;
  disabled?: boolean;
}

export function MultiImageUpload({
  value,
  onChange,
  target,
  max,
  className,
  disabled,
}: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { upload, isUploading, error } = useUpload(target);

  const slotsLeft = max - value.length;
  const busy = isUploading || disabled;

  /**
   * Sube en serie, no en paralelo: /uploads/sign tiene su propio rate limit y
   * cinco fotos a la vez lo dispararían. En serie además la barra de progreso
   * significa algo.
   */
  const handleFiles = async (files: FileList | null) => {
    if (!files || busy) return;

    const batch = Array.from(files).slice(0, slotsLeft);
    const keys: string[] = [];
    for (const file of batch) {
      const result = await upload(file);
      if (!result) break; // el hook ya expone el error; no seguimos con el resto
      keys.push(result.key);
    }
    if (keys.length > 0) onChange([...value, ...keys]);
  };

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="grid grid-cols-3 gap-2">
        {value.map((key, i) => (
          <div
            key={key}
            className="relative aspect-square overflow-hidden rounded-lg border border-border"
          >
            <img src={thumbUrl(key) ?? ''} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label={`Quitar imagen ${i + 1}`}
              onClick={() => removeAt(i)}
              disabled={busy}
              className="absolute top-1 right-1 rounded-full bg-background/80 p-1 backdrop-blur-sm transition-colors hover:bg-background disabled:opacity-50"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {slotsLeft > 0 && (
          <div
            role="button"
            tabIndex={busy ? -1 : 0}
            aria-label="Agregar imágenes"
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
              void handleFiles(e.dataTransfer.files);
            }}
            className={cn(
              'flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors',
              isDragging ? 'border-primary bg-primary/5' : 'border-border',
              busy
                ? 'cursor-default opacity-70'
                : 'cursor-pointer hover:border-primary/60 hover:bg-muted/40',
              error && 'border-destructive',
            )}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <>
                <ImagePlus className="size-5 text-muted-foreground opacity-60" />
                <span className="text-[0.7rem] text-muted-foreground">
                  {slotsLeft} más
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
