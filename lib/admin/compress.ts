const MAX_SIDE = 1600;
const QUALITY = 0.82;

export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const encode = (type: string) => new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('compression failed'))), type, QUALITY);
  });
  const webp = await encode('image/webp');
  // Safari cannot encode WebP and silently returns a huge PNG instead.
  return webp.type === 'image/webp' ? webp : encode('image/jpeg');
}
