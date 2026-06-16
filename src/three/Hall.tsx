import { useMemo } from 'react';
import { DoubleSide, Vector2, type Texture } from 'three';
import {
  CAMERA_START_Z,
  HALL_FRONT_Z,
  ROOM_HALF_WIDTH,
  ROOM_HEIGHT,
  hallBackZ,
} from './layout';
import { makeConcreteTextures, type ConcreteTextures } from './textures';

interface HallProps {
  total: number;
}

const ROOM_WIDTH = ROOM_HALF_WIDTH * 2;
const TILE = 3.2; // world units covered by one texture tile

/**
 * The architecture: a long, tall corridor in burnt-white microcement, entered
 * through a doorway in the front wall and closed by a far wall. Walls, floor and
 * ceiling carry procedurally generated concrete textures (colour + normal +
 * roughness) so the surfaces read as a real, lived-in space.
 */
export function Hall({ total }: HallProps) {
  const back = hallBackZ(total);
  const frontZone = CAMERA_START_Z + 6; // floor reaches behind the start point
  const floorLen = frontZone - back;
  const floorCenter = (frontZone + back) / 2;
  const wallLen = HALL_FRONT_Z - back; // walls span the hall only
  const wallCenter = (HALL_FRONT_Z + back) / 2;

  // Bake textures once. Walls: warm matte white. Floor: slightly darker, more
  // polished (lower roughness) so it picks up soft reflections.
  const wallTex = useMemo(
    () =>
      makeConcreteTextures({
        base: [231, 228, 222],
        colorVariation: 0.09,
        roughness: 0.92,
        roughnessVariation: 0.1,
        bump: 1.1,
        seed: 11,
      }),
    [],
  );
  const floorTex = useMemo(
    () =>
      makeConcreteTextures({
        base: [223, 220, 213],
        colorVariation: 0.06,
        roughness: 0.55,
        roughnessVariation: 0.16,
        bump: 0.7,
        seed: 23,
      }),
    [],
  );

  return (
    <group>
      {/* ---- Lighting ---- */}
      <ambientLight intensity={0.4} />
      <hemisphereLight args={['#ffffff', '#d6d2ca', 0.65]} />
      <directionalLight
        position={[6, 14, 10]}
        intensity={1.05}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />

      {/* ---- Floor (polished, reflective) ---- */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, floorCenter]}
        receiveShadow
      >
        <planeGeometry args={[ROOM_WIDTH, floorLen]} />
        <ConcreteMaterial
          tex={floorTex}
          repeat={[ROOM_WIDTH / TILE, floorLen / TILE]}
          metalness={0.12}
          normalScale={0.25}
        />
      </mesh>

      {/* ---- Ceiling ---- */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, wallCenter]}>
        <planeGeometry args={[ROOM_WIDTH, wallLen]} />
        <ConcreteMaterial
          tex={wallTex}
          repeat={[ROOM_WIDTH / TILE, wallLen / TILE]}
          side={DoubleSide}
        />
      </mesh>

      {/* ---- Side walls ---- */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, wallCenter]}
        receiveShadow
      >
        <planeGeometry args={[wallLen, ROOM_HEIGHT]} />
        <ConcreteMaterial
          tex={wallTex}
          repeat={[wallLen / TILE, ROOM_HEIGHT / TILE]}
          side={DoubleSide}
        />
      </mesh>
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, wallCenter]}
        receiveShadow
      >
        <planeGeometry args={[wallLen, ROOM_HEIGHT]} />
        <ConcreteMaterial
          tex={wallTex}
          repeat={[wallLen / TILE, ROOM_HEIGHT / TILE]}
          side={DoubleSide}
        />
      </mesh>

      {/* ---- Far (back) wall ---- */}
      <mesh position={[0, ROOM_HEIGHT / 2, back]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <ConcreteMaterial
          tex={wallTex}
          repeat={[ROOM_WIDTH / TILE, ROOM_HEIGHT / TILE]}
          side={DoubleSide}
        />
      </mesh>

      {/* ---- Entrance wall with a doorway ---- */}
      <Doorway tex={wallTex} />
    </group>
  );
}

interface ConcreteMaterialProps {
  tex: ConcreteTextures;
  repeat: [number, number];
  side?: typeof DoubleSide | undefined;
  metalness?: number;
  normalScale?: number;
}

/** A textured microcement material with per-surface tiling. */
function ConcreteMaterial({
  tex,
  repeat,
  side,
  metalness = 0,
  normalScale = 0.4,
}: ConcreteMaterialProps) {
  const maps = useMemo(() => {
    const clone = (t: Texture) => {
      const c = t.clone();
      c.needsUpdate = true;
      c.repeat.set(repeat[0], repeat[1]);
      return c;
    };
    return {
      map: clone(tex.map),
      normalMap: clone(tex.normalMap),
      roughnessMap: clone(tex.roughnessMap),
    };
  }, [tex, repeat[0], repeat[1]]);

  const normalScaleVec = useMemo(
    () => new Vector2(normalScale, normalScale),
    [normalScale],
  );

  return (
    <meshStandardMaterial
      map={maps.map}
      normalMap={maps.normalMap}
      roughnessMap={maps.roughnessMap}
      normalScale={normalScaleVec}
      roughness={1}
      metalness={metalness}
      side={side}
    />
  );
}

/** Front wall built from three slabs that frame a central opening. */
function Doorway({ tex }: { tex: ConcreteTextures }) {
  const opening = { halfW: 1.8, height: 3.8 };
  const lintelH = ROOM_HEIGHT - opening.height;
  const slabW = ROOM_HALF_WIDTH - opening.halfW;

  return (
    <group position={[0, 0, HALL_FRONT_Z]}>
      {/* Left slab */}
      <mesh
        position={[-(ROOM_HALF_WIDTH + opening.halfW) / 2, ROOM_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[slabW, ROOM_HEIGHT, 0.4]} />
        <ConcreteMaterial tex={tex} repeat={[slabW / TILE, ROOM_HEIGHT / TILE]} />
      </mesh>
      {/* Right slab */}
      <mesh
        position={[(ROOM_HALF_WIDTH + opening.halfW) / 2, ROOM_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[slabW, ROOM_HEIGHT, 0.4]} />
        <ConcreteMaterial tex={tex} repeat={[slabW / TILE, ROOM_HEIGHT / TILE]} />
      </mesh>
      {/* Lintel above the opening */}
      <mesh position={[0, opening.height + lintelH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[opening.halfW * 2, lintelH, 0.4]} />
        <ConcreteMaterial
          tex={tex}
          repeat={[(opening.halfW * 2) / TILE, lintelH / TILE]}
        />
      </mesh>
    </group>
  );
}
