// Redimensionamos en el navegador antes de subir. Así no hace falta un
// servidor de imágenes (ni Cloudinary): el celular del usuario hace el trabajo,
// la subida pesa ~10x menos y el bucket no se llena.

export const FULL_MAX_PX = 1600;
export const THUMB_MAX_PX = 400;
const QUALITY = 0.82;

/** Lo que el navegador puede decodificar. HEIC de iPhone no entra acá: iOS
 *  lo convierte a JPEG al elegirlo desde el input de archivos. */
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Tope de entrada, antes de redimensionar. Una foto de celular ronda los 3-8 MB.
export const MAX_INPUT_BYTES = 25 * 1024 * 1024;

export interface ResizedImage {
  full: Blob;
  thumb: Blob;
  width: number;
  height: number;
}

export async function resizeForUpload(file: File): Promise<ResizedImage> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Formato no soportado. Usa JPG, PNG, WebP o GIF.');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('La imagen pesa demasiado (máx 25 MB).');
  }

  let bitmap: ImageBitmap;
  try {
    // `from-image` respeta el EXIF de orientación: sin esto, las fotos verticales
    // de celular salen giradas. Además, al re-encodear con canvas se pierde el
    // resto del EXIF — incluida la geolocalización, que no queremos publicar.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('No se pudo leer la imagen. Prueba con otro archivo.');
  }

  try {
    const full = await encode(bitmap, FULL_MAX_PX);
    const thumb = await encode(bitmap, THUMB_MAX_PX);
    return { full: full.blob, thumb: thumb.blob, width: full.width, height: full.height };
  } finally {
    bitmap.close();
  }
}

async function encode(bitmap: ImageBitmap, maxPx: number) {
  // Solo achicamos: si la imagen ya es chica, no la estiramos.
  const scale = Math.min(1, maxPx / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo procesar la imagen.');
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', QUALITY),
  );
  if (!blob) throw new Error('Tu navegador no puede convertir a WebP.');

  return { blob, width, height };
}
