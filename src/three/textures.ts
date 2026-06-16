import {
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from 'three';

/**
 * Procedurally generated microcement ("cimento queimado") textures.
 *
 * Everything is baked once into <canvas> elements at startup — no external
 * image files, no network requests. The look comes from tileable fractal noise
 * (fbm): broad mottling + trowel-scale variation + fine grain, turned into a
 * colour (albedo) map, a normal map (micro relief) and a roughness map.
 */

export interface ConcreteTextures {
  map: Texture;
  normalMap: Texture;
  roughnessMap: Texture;
}

interface ConcreteOptions {
  size?: number;
  /** Base RGB colour of the surface (0–255). */
  base: [number, number, number];
  /** How much the colour varies with the noise (0–1). */
  colorVariation?: number;
  /** Centre roughness and how much it varies. */
  roughness?: number;
  roughnessVariation?: number;
  /** Strength of the baked relief in the normal map. */
  bump?: number;
  seed?: number;
}

// --- tileable value-noise fbm ---------------------------------------------

function hash(ix: number, iy: number, period: number, seed: number): number {
  const px = ((ix % period) + period) % period;
  const py = ((iy % period) + period) % period;
  let h = (px * 374761393 + py * 668265263 + seed * 1274126177) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return (h >>> 0) / 4294967295;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function valueNoise(
  x: number,
  y: number,
  period: number,
  seed: number,
): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = smooth(x - x0);
  const fy = smooth(y - y0);
  const v00 = hash(x0, y0, period, seed);
  const v10 = hash(x0 + 1, y0, period, seed);
  const v01 = hash(x0, y0 + 1, period, seed);
  const v11 = hash(x0 + 1, y0 + 1, period, seed);
  return lerp(lerp(v00, v10, fx), lerp(v01, v11, fx), fy);
}

/** Fractal Brownian motion, kept seamless by doubling the lattice period. */
function fbm(
  u: number,
  v: number,
  basePeriod: number,
  seed: number,
  octaves: number,
): number {
  let amp = 0.5;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum +=
      amp *
      valueNoise(u * basePeriod * freq, v * basePeriod * freq, basePeriod * freq, seed + o * 131);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return [canvas, canvas.getContext('2d')!];
}

export function makeConcreteTextures(opts: ConcreteOptions): ConcreteTextures {
  const size = opts.size ?? 512;
  const seed = opts.seed ?? 1;
  const colorVar = opts.colorVariation ?? 0.1;
  const baseRough = opts.roughness ?? 0.9;
  const roughVar = opts.roughnessVariation ?? 0.12;
  const bump = opts.bump ?? 1;
  const [br, bg, bb] = opts.base;

  // 1. Bake a height field once; reuse it for all three maps.
  const height = new Float32Array(size * size);
  const basePeriod = 6; // broad mottling
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      // Two scales: slow trowel sweeps + finer cement grain.
      const broad = fbm(u, v, basePeriod, seed, 4);
      const grain = fbm(u, v, basePeriod * 6, seed + 50, 3);
      height[y * size + x] = broad * 0.7 + grain * 0.3;
    }
  }

  // 2. Albedo + roughness, derived per-pixel from the height field.
  const [albedoCanvas, albedoCtx] = makeCanvas(size);
  const [roughCanvas, roughCtx] = makeCanvas(size);
  const albedo = albedoCtx.createImageData(size, size);
  const rough = roughCtx.createImageData(size, size);

  for (let i = 0; i < size * size; i++) {
    const h = height[i];
    const shade = 1 + (h - 0.5) * 2 * colorVar; // around 1.0
    const speckle = (hash(i % size, (i / size) | 0, size, seed + 7) - 0.5) * 8;

    const idx = i * 4;
    albedo.data[idx] = clamp255(br * shade + speckle);
    albedo.data[idx + 1] = clamp255(bg * shade + speckle);
    albedo.data[idx + 2] = clamp255(bb * shade + speckle);
    albedo.data[idx + 3] = 255;

    const r = clamp01(baseRough + (h - 0.5) * 2 * roughVar);
    const g = Math.round(r * 255);
    rough.data[idx] = g;
    rough.data[idx + 1] = g;
    rough.data[idx + 2] = g;
    rough.data[idx + 3] = 255;
  }
  albedoCtx.putImageData(albedo, 0, 0);
  roughCtx.putImageData(rough, 0, 0);

  // 3. Normal map from the height gradient (Sobel), wrapped for tiling.
  const [normalCanvas, normalCtx] = makeCanvas(size);
  const normal = normalCtx.createImageData(size, size);
  const at = (x: number, y: number) =>
    height[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * bump;
      const dy = (at(x, y + 1) - at(x, y - 1)) * bump;
      // Normal = normalize(-dx, -dy, 1)
      const nx = -dx;
      const ny = -dy;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz) || 1;
      const idx = (y * size + x) * 4;
      normal.data[idx] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      normal.data[idx + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      normal.data[idx + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255);
      normal.data[idx + 3] = 255;
    }
  }
  normalCtx.putImageData(normal, 0, 0);

  const map = new CanvasTexture(albedoCanvas);
  map.colorSpace = SRGBColorSpace;
  const normalMap = new CanvasTexture(normalCanvas);
  const roughnessMap = new CanvasTexture(roughCanvas);

  for (const t of [map, normalMap, roughnessMap]) {
    t.wrapS = t.wrapT = RepeatWrapping;
    t.anisotropy = 8;
  }

  return { map, normalMap, roughnessMap };
}

function clamp255(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
