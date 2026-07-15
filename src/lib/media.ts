// La base de datos guarda la *key* del objeto (projects/{userId}/{uuid}.webp),
// no la URL. La URL se arma acá, así mudar de MinIO a R2, o de r2.dev a un
// dominio propio, es cambiar una env var en vez de migrar filas.
const BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? '').replace(/\/+$/, '');

/** URL de la imagen completa (máx 1600px). Para vistas grandes: card de swipe, detalle. */
export function mediaUrl(key: string | null | undefined): string | null {
  if (!key || !BASE) return null;
  return `${BASE}/${key}`;
}

/**
 * URL de la miniatura (máx 400px). Para listas y grillas.
 * Cada subida crea el par por convención; ver thumbKeyFor en el API.
 */
export function thumbUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  return mediaUrl(key.replace(/\.webp$/, '-thumb.webp'));
}
