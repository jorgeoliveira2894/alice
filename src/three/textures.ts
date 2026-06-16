import {
  CanvasTexture,
  ClampToEdgeWrapping,
  SRGBColorSpace,
  type Texture,
} from 'three';

/**
 * Procedurally baked architectural-concrete textures — inspired by board-formed
 * and microcement walls: panel joints, form-tie holes, vertical staining, fine
 * grain and pores. Everything is drawn once onto <canvas> at startup (no image
 * files, no network). Each surface gets a texture sized to its real proportions
 * and mapped 1:1, so panel seams and tie holes sit at true world positions.
 */

export interface ConcreteSurface {
  map: Texture;
  normalMap: Texture;
  roughnessMap: Texture;
}

export interface ConcreteOptions {
  /** Real-world surface size, in scene units (metres). */
  worldWidth: number;
  worldHeight: number;
  /** Texture resolution. Auto-capped to keep canvases sane. */
  pixelsPerUnit?: number;
  /** Base concrete colour (0–255), a warm neutral grey. */
  base?: [number, number, number];
  /** Panel grid size in world units. 0 disables seams. */
  panelWidth?: number;
  panelHeight?: number;
  /** Draw form-tie holes at panel corners. */
  tieHoles?: boolean;
  /** Number of vertical stain streaks (scaled by width if omitted). */
  streaks?: number;
  /** Base roughness (0–1) and how much it varies. */
  roughness?: number;
  seed?: number;
}

// --- seeded RNG ------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- tileable value-noise fbm (for the shared grain tile) ------------------

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
function hash(ix: number, iy: number, period: number, seed: number): number {
  const px = ((ix % period) + period) % period;
  const py = ((iy % period) + period) % period;
  let h = (px * 374761393 + py * 668265263 + seed * 1274126177) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return (h >>> 0) / 4294967295;
}
function valueNoise(x: number, y: number, period: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = smooth(x - x0);
  const fy = smooth(y - y0);
  return lerp(
    lerp(hash(x0, y0, period, seed), hash(x0 + 1, y0, period, seed), fx),
    lerp(hash(x0, y0 + 1, period, seed), hash(x0 + 1, y0 + 1, period, seed), fx),
    fy,
  );
}
function fbm(u: number, v: number, basePeriod: number, seed: number, oct: number): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < oct; o++) {
    sum += amp * valueNoise(u * basePeriod * freq, v * basePeriod * freq, basePeriod * freq, seed + o * 131);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return [canvas, canvas.getContext('2d')!];
}

// A single tileable grain tile, shared (multiplied) across every surface.
let grainTile: HTMLCanvasElement | null = null;
function getGrainTile(): HTMLCanvasElement {
  if (grainTile) return grainTile;
  const size = 256;
  const [canvas, ctx] = makeCanvas(size, size);
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const h = fbm(u, v, 8, 7, 4) * 0.6 + fbm(u, v, 40, 19, 3) * 0.4;
      const val = 120 + (h - 0.5) * 90;
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = val;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  grainTile = canvas;
  return canvas;
}

// --- the main builder ------------------------------------------------------

export function makeConcreteSurface(opts: ConcreteOptions): ConcreteSurface {
  const ppu = opts.pixelsPerUnit ?? 64;
  const base = opts.base ?? [203, 196, 184];
  const roughBase = opts.roughness ?? 0.82;
  const seed = opts.seed ?? 1;
  const rng = mulberry32(seed);

  const W = Math.min(4096, Math.max(16, Math.round(opts.worldWidth * ppu)));
  const H = Math.min(4096, Math.max(16, Math.round(opts.worldHeight * ppu)));
  const sx = W / opts.worldWidth; // px per world unit, X
  const sy = H / opts.worldHeight; // px per world unit, Y

  const [albedo, aCtx] = makeCanvas(W, H);
  const [height, hCtx] = makeCanvas(W, H);
  const [rough, rCtx] = makeCanvas(W, H);

  // 1. Base fills
  aCtx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
  aCtx.fillRect(0, 0, W, H);
  hCtx.fillStyle = '#808080';
  hCtx.fillRect(0, 0, W, H);
  rCtx.fillStyle = `rgb(${(roughBase * 255) | 0},${(roughBase * 255) | 0},${(roughBase * 255) | 0})`;
  rCtx.fillRect(0, 0, W, H);

  // 2. Broad warm/cool blotches (uneven pour, discolouration)
  for (let k = 0; k < 22; k++) {
    const cx = rng() * W;
    const cy = rng() * H;
    const r = (0.15 + rng() * 0.4) * Math.max(W, H);
    const dark = rng() > 0.5;
    const g = aCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const tint = dark ? 'rgba(120,112,98,0.10)' : 'rgba(240,236,226,0.10)';
    g.addColorStop(0, tint);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    aCtx.fillStyle = g;
    aCtx.fillRect(0, 0, W, H);
  }

  // 3. Vertical staining / streaks running down the wall
  const streaks = opts.streaks ?? Math.round(opts.worldWidth * 1.4);
  for (let s = 0; s < streaks; s++) {
    const x = rng() * W;
    const w = (0.06 + rng() * 0.22) * sx;
    const top = rng() * H * 0.5;
    const len = (0.3 + rng() * 0.6) * H;
    const a = 0.04 + rng() * 0.07;
    const g = aCtx.createLinearGradient(0, top, 0, top + len);
    g.addColorStop(0, `rgba(96,88,76,${a})`);
    g.addColorStop(1, 'rgba(96,88,76,0)');
    aCtx.fillStyle = g;
    aCtx.fillRect(x - w / 2, top, w, len);
  }

  // 4. Fine grain (shared tile), multiplied over the surface
  const grain = aCtx.createPattern(getGrainTile(), 'repeat')!;
  aCtx.save();
  aCtx.globalAlpha = 0.55;
  aCtx.globalCompositeOperation = 'overlay';
  aCtx.fillStyle = grain;
  aCtx.fillRect(0, 0, W, H);
  aCtx.restore();
  // grain also drives micro relief on the height map
  hCtx.save();
  hCtx.globalAlpha = 0.35;
  hCtx.globalCompositeOperation = 'overlay';
  hCtx.fillStyle = aCtx.createPattern(getGrainTile(), 'repeat')!;
  hCtx.fillRect(0, 0, W, H);
  hCtx.restore();

  // 5. Panel seams (board-form joints) — a soft recessed groove
  const pw = (opts.panelWidth ?? 0) * sx;
  const ph = (opts.panelHeight ?? 0) * sy;
  const grooveCol = 'rgba(70,64,56,0.55)';
  const drawVGroove = (x: number) => {
    const gw = Math.max(2, sx * 0.03);
    // albedo: darker line
    aCtx.fillStyle = grooveCol;
    aCtx.fillRect(x - gw / 2, 0, gw, H);
    // height: smooth V groove → clean normals
    const hg = hCtx.createLinearGradient(x - gw * 1.5, 0, x + gw * 1.5, 0);
    hg.addColorStop(0, '#808080');
    hg.addColorStop(0.5, '#4a4a4a');
    hg.addColorStop(1, '#808080');
    hCtx.fillStyle = hg;
    hCtx.fillRect(x - gw * 1.5, 0, gw * 3, H);
  };
  const drawHGroove = (y: number) => {
    const gh = Math.max(2, sy * 0.03);
    aCtx.fillStyle = grooveCol;
    aCtx.fillRect(0, y - gh / 2, W, gh);
    const hg = hCtx.createLinearGradient(0, y - gh * 1.5, 0, y + gh * 1.5);
    hg.addColorStop(0, '#808080');
    hg.addColorStop(0.5, '#4a4a4a');
    hg.addColorStop(1, '#808080');
    hCtx.fillStyle = hg;
    hCtx.fillRect(0, y - gh * 1.5, W, gh * 3);
  };
  if (pw > 8) for (let x = pw; x < W; x += pw) drawVGroove(x);
  if (ph > 8) for (let y = ph; y < H; y += ph) drawHGroove(y);

  // 6. Form-tie holes near panel corners
  if (opts.tieHoles && pw > 8 && ph > 8) {
    const r = Math.max(3, sx * 0.035);
    const inset = Math.min(pw, ph) * 0.16;
    for (let x = pw; x < W; x += pw) {
      for (let y = ph; y < H; y += ph) {
        for (const [ox, oy] of [
          [-inset, -inset],
          [inset, -inset],
          [-inset, inset],
          [inset, inset],
        ]) {
          drawTieHole(aCtx, hCtx, rCtx, x + ox, y + oy, r);
        }
      }
    }
  }

  // 7. Pores / speckle
  const pores = Math.round((W * H) / 9000);
  for (let p = 0; p < pores; p++) {
    const x = rng() * W;
    const y = rng() * H;
    const r = 0.5 + rng() * 1.8;
    aCtx.fillStyle = `rgba(60,55,48,${0.15 + rng() * 0.3})`;
    aCtx.beginPath();
    aCtx.arc(x, y, r, 0, Math.PI * 2);
    aCtx.fill();
  }

  // 8. Build the normal map from the height canvas
  const normalCanvas = heightToNormal(height, 1);

  const map = new CanvasTexture(albedo);
  map.colorSpace = SRGBColorSpace;
  const normalMap = new CanvasTexture(normalCanvas);
  const roughnessMap = new CanvasTexture(rough);
  for (const t of [map, normalMap, roughnessMap]) {
    t.wrapS = t.wrapT = ClampToEdgeWrapping;
    t.anisotropy = 8;
  }
  return { map, normalMap, roughnessMap };
}

function drawTieHole(
  aCtx: CanvasRenderingContext2D,
  hCtx: CanvasRenderingContext2D,
  rCtx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
) {
  // albedo: dark dimple with a faint rim
  const ag = aCtx.createRadialGradient(x, y, 0, x, y, r * 1.6);
  ag.addColorStop(0, 'rgba(40,36,30,0.85)');
  ag.addColorStop(0.6, 'rgba(70,64,55,0.5)');
  ag.addColorStop(1, 'rgba(120,112,98,0)');
  aCtx.fillStyle = ag;
  aCtx.beginPath();
  aCtx.arc(x, y, r * 1.6, 0, Math.PI * 2);
  aCtx.fill();
  // height: recess
  const hg = hCtx.createRadialGradient(x, y, 0, x, y, r * 1.4);
  hg.addColorStop(0, '#3a3a3a');
  hg.addColorStop(1, '#808080');
  hCtx.fillStyle = hg;
  hCtx.beginPath();
  hCtx.arc(x, y, r * 1.4, 0, Math.PI * 2);
  hCtx.fill();
  // roughness: slightly rougher inside
  rCtx.fillStyle = 'rgba(220,220,220,0.5)';
  rCtx.beginPath();
  rCtx.arc(x, y, r, 0, Math.PI * 2);
  rCtx.fill();
}

function heightToNormal(height: HTMLCanvasElement, strength: number): HTMLCanvasElement {
  const W = height.width;
  const H = height.height;
  const src = height.getContext('2d')!.getImageData(0, 0, W, H).data;
  const [canvas, ctx] = makeCanvas(W, H);
  const out = ctx.createImageData(W, H);
  const at = (x: number, y: number) => src[(((y + H) % H) * W + ((x + W) % W)) * 4] / 255;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength * 3;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength * 3;
      const nx = -dx;
      const ny = -dy;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      const i = (y * W + x) * 4;
      out.data[i] = ((nx / len) * 0.5 + 0.5) * 255;
      out.data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      out.data[i + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      out.data[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  return canvas;
}

/**
 * A soft circular "cookie" (gobo) used as a spotlight projection so the light
 * pools on the wall have a gentle, photographic falloff rather than a hard disc.
 */
let spotCookie: CanvasTexture | null = null;
export function getSoftSpotCookie(): CanvasTexture {
  if (spotCookie) return spotCookie;
  const size = 256;
  const [canvas, ctx] = makeCanvas(size, size);
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
