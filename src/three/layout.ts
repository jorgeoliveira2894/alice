/**
 * Geometry and choreography for the continuous gallery hall.
 *
 * Coordinate system (three.js, right-handed):
 *   - The hall runs along -Z. The visitor enters near +Z and walks toward -Z.
 *   - x = 0 is the centre of the corridor; side walls sit at x = ±ROOM_HALF_WIDTH.
 *   - y = 0 is the floor; y = ROOM_HEIGHT is the ceiling.
 *
 * The whole experience is parameterised by a single scroll progress value 0→1.
 */

export const ROOM_HALF_WIDTH = 5; // walls at x = ±5  → 10 units wide
export const ROOM_HEIGHT = 6.5; // tall, "espaço gigante"
export const SPACING = 9; // distance between consecutive artworks along Z
export const EYE_HEIGHT = 1.7;

export const ART_HEIGHT = 2.4; // default artwork height in world units
export const ART_CENTER_Y = 2.3;

export const CAMERA_START_Z = 13; // outside the doorway, looking in
export const HALL_FRONT_Z = 4; // entrance wall (with doorway) sits here

/** The monumental stone portal at the entrance. */
export const DOOR = { halfWidth: 2.0, height: 4.8, jambWidth: 1.4, depth: 1.2 };

/** Walk choreography: artworks live between these scroll positions. */
const WALK_START = 0.09;
const WALK_END = 0.9;

/** Half-width (in progress) of the pause beside each artwork. */
export const DWELL = 0.05;
/** Extra margin over which the head turns / the caption fades. */
export const TURN = 0.06;

export interface ArtworkPlacement {
  /** -1 = left wall, +1 = right wall */
  side: -1 | 1;
  x: number;
  y: number;
  z: number;
  /** Scroll position at which the camera is centred on this artwork. */
  stop: number;
}

/** Deepest Z reached, used to size and close the hall. */
export function hallBackZ(total: number): number {
  return -(total * SPACING) - SPACING;
}

export function placeArtwork(index: number, total: number): ArtworkPlacement {
  const side: -1 | 1 = index % 2 === 0 ? -1 : 1;
  const x = side * (ROOM_HALF_WIDTH - 0.06);
  const z = -(index + 1) * SPACING;
  const stop = lerp(WALK_START, WALK_END, (index + 0.5) / total);
  return { side, x, y: ART_CENTER_Y, z, stop };
}

export function allPlacements(total: number): ArtworkPlacement[] {
  return Array.from({ length: total }, (_, i) => placeArtwork(i, total));
}

// --- math helpers ----------------------------------------------------------

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

export function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

export interface Keyframe {
  p: number;
  v: number;
}

/** Samples an eased piecewise curve defined by ascending {p, v} keyframes. */
export function sampleEased(keys: Keyframe[], p: number): number {
  if (p <= keys[0].p) return keys[0].v;
  const last = keys[keys.length - 1];
  if (p >= last.p) return last.v;
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i].p) {
      const a = keys[i - 1];
      const b = keys[i];
      const t = (p - a.p) / (b.p - a.p);
      return lerp(a.v, b.v, smoothstep(t));
    }
  }
  return last.v;
}

/**
 * Camera Z keyframes: glide forward between artworks, hold still (a "dwell")
 * while beside each one so the visitor can read the caption.
 */
export function cameraZKeys(total: number): Keyframe[] {
  const placements = allPlacements(total);
  const keys: Keyframe[] = [{ p: 0, v: CAMERA_START_Z }];
  for (const pl of placements) {
    keys.push({ p: pl.stop - DWELL, v: pl.z });
    keys.push({ p: pl.stop + DWELL, v: pl.z });
  }
  keys.push({ p: 1, v: hallBackZ(total) + SPACING * 0.4 });
  return keys;
}

/**
 * Returns how strongly the camera should be turned toward the artwork nearest
 * to the current progress: 1 while dwelling beside it, easing to 0 as we leave.
 */
export function activeTurn(
  total: number,
  p: number,
): { index: number; weight: number } {
  const placements = allPlacements(total);
  let index = 0;
  let best = Infinity;
  placements.forEach((pl, i) => {
    const d = Math.abs(p - pl.stop);
    if (d < best) {
      best = d;
      index = i;
    }
  });
  const d = Math.abs(p - placements[index].stop);
  let weight = 1;
  if (d > DWELL) weight = 1 - smoothstep((d - DWELL) / TURN);
  return { index, weight: clamp01(weight) };
}
