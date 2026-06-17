import { CanvasTexture, SRGBColorSpace } from 'three';

/**
 * A soft circular "cookie" (gobo) used as a spotlight projection so the gallery
 * wall-wash pools gently on the concrete rather than as a hard disc.
 *
 * (The hall surfaces themselves now use real CC0 PBR concrete textures loaded
 * from /public/textures — see Hall.tsx.)
 */
let spotCookie: CanvasTexture | null = null;

export function getSoftSpotCookie(): CanvasTexture {
  if (spotCookie) return spotCookie;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.55, 'rgba(255,255,255,0.7)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  spotCookie = new CanvasTexture(canvas);
  spotCookie.colorSpace = SRGBColorSpace;
  return spotCookie;
}
