import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import {
  DoubleSide,
  RepeatWrapping,
  SRGBColorSpace,
  Vector2,
  type Texture,
} from 'three';
import {
  CAMERA_START_Z,
  HALL_FRONT_Z,
  ROOM_HALF_WIDTH,
  ROOM_HEIGHT,
  hallBackZ,
} from './layout';

interface HallProps {
  total: number;
}

const ROOM_WIDTH = ROOM_HALF_WIDTH * 2;
const TILE_M = 2.4; // one concrete texture tile ≈ 2.4 m

// CC0 PBR concrete (ambientCG · Concrete034)
const CONCRETE_MAPS = {
  map: '/textures/concrete/color.jpg',
  normalMap: '/textures/concrete/normal.jpg',
  roughnessMap: '/textures/concrete/roughness.jpg',
};

// Warm tints so the grey scan reads like the burnt-white reference concrete.
const WALL_TINT = '#ddd6c8';
const FLOOR_TINT = '#cfc8ba';
const CEIL_TINT = '#d6cfc1';

interface ConcreteMaps {
  map: Texture;
  normalMap: Texture;
  roughnessMap: Texture;
}

/**
 * The architecture: a tall concrete corridor, entered through a doorway and
 * closed by a far wall. Surfaces use real CC0 PBR concrete (colour + normal +
 * roughness) lit by an HDRI environment, for a photographic result.
 */
export function Hall({ total }: HallProps) {
  const maps = useTexture(CONCRETE_MAPS) as ConcreteMaps;

  const back = hallBackZ(total);
  const frontZone = CAMERA_START_Z + 6;
  const floorLen = frontZone - back;
  const floorCenter = (frontZone + back) / 2;
  const wallLen = HALL_FRONT_Z - back;
  const wallCenter = (HALL_FRONT_Z + back) / 2;

  return (
    <group>
      {/* ---- Lighting: HDRI handles ambient/reflections; key light adds shadows ---- */}
      <ambientLight intensity={0.12} color="#fbf4e6" />
      <directionalLight
        position={[8, 16, 9]}
        intensity={1.35}
        color="#fff1dc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
      <directionalLight position={[-6, 8, -4]} intensity={0.18} color="#dce7f2" />

      {/* ---- Floor (polished, reflective) ---- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, floorCenter]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, floorLen]} />
        <ConcreteMaterial
          maps={maps}
          repeat={[ROOM_WIDTH / TILE_M, floorLen / TILE_M]}
          color={FLOOR_TINT}
          roughness={0.42}
          metalness={0.0}
          envMapIntensity={1.25}
          normalScale={0.5}
        />
      </mesh>

      {/* ---- Ceiling ---- */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, wallCenter]}>
        <planeGeometry args={[ROOM_WIDTH, wallLen]} />
        <ConcreteMaterial
          maps={maps}
          repeat={[ROOM_WIDTH / TILE_M, wallLen / TILE_M]}
          color={CEIL_TINT}
          side={DoubleSide}
          normalScale={0.8}
        />
      </mesh>

      {/* ---- Side walls ---- */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, wallCenter]} receiveShadow>
        <planeGeometry args={[wallLen, ROOM_HEIGHT]} />
        <ConcreteMaterial maps={maps} repeat={[wallLen / TILE_M, ROOM_HEIGHT / TILE_M]} color={WALL_TINT} side={DoubleSide} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, wallCenter]} receiveShadow>
        <planeGeometry args={[wallLen, ROOM_HEIGHT]} />
        <ConcreteMaterial maps={maps} repeat={[wallLen / TILE_M, ROOM_HEIGHT / TILE_M]} color={WALL_TINT} side={DoubleSide} />
      </mesh>

      {/* ---- Far (back) wall ---- */}
      <mesh position={[0, ROOM_HEIGHT / 2, back]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <ConcreteMaterial maps={maps} repeat={[ROOM_WIDTH / TILE_M, ROOM_HEIGHT / TILE_M]} color={WALL_TINT} side={DoubleSide} />
      </mesh>

      {/* ---- Entrance wall with a doorway ---- */}
      <Doorway maps={maps} />
    </group>
  );
}

interface ConcreteMaterialProps {
  maps: ConcreteMaps;
  repeat: [number, number];
  color?: string;
  side?: typeof DoubleSide | undefined;
  roughness?: number;
  metalness?: number;
  normalScale?: number;
  envMapIntensity?: number;
}

/** Clones the shared concrete maps and applies per-surface tiling. */
function ConcreteMaterial({
  maps,
  repeat,
  color = '#ffffff',
  side,
  roughness = 1,
  metalness = 0,
  normalScale = 1,
  envMapIntensity = 1,
}: ConcreteMaterialProps) {
  const cloned = useMemo(() => {
    const tile = (t: Texture, srgb = false) => {
      const c = t.clone();
      c.wrapS = c.wrapT = RepeatWrapping;
      c.repeat.set(repeat[0], repeat[1]);
      c.anisotropy = 8;
      if (srgb) c.colorSpace = SRGBColorSpace;
      c.needsUpdate = true;
      return c;
    };
    return {
      map: tile(maps.map, true),
      normalMap: tile(maps.normalMap),
      roughnessMap: tile(maps.roughnessMap),
    };
  }, [maps, repeat[0], repeat[1]]);

  const normalScaleVec = useMemo(() => new Vector2(normalScale, normalScale), [normalScale]);

  return (
    <meshStandardMaterial
      map={cloned.map}
      normalMap={cloned.normalMap}
      roughnessMap={cloned.roughnessMap}
      normalScale={normalScaleVec}
      color={color}
      roughness={roughness}
      metalness={metalness}
      envMapIntensity={envMapIntensity}
      side={side}
    />
  );
}

/** Front wall built from three slabs that frame a central opening. */
function Doorway({ maps }: { maps: ConcreteMaps }) {
  const opening = { halfW: 1.8, height: 3.8 };
  const lintelH = ROOM_HEIGHT - opening.height;
  const slabW = ROOM_HALF_WIDTH - opening.halfW;

  return (
    <group position={[0, 0, HALL_FRONT_Z]}>
      <mesh position={[-(ROOM_HALF_WIDTH + opening.halfW) / 2, ROOM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[slabW, ROOM_HEIGHT, 0.4]} />
        <ConcreteMaterial maps={maps} repeat={[slabW / TILE_M, ROOM_HEIGHT / TILE_M]} color={WALL_TINT} />
      </mesh>
      <mesh position={[(ROOM_HALF_WIDTH + opening.halfW) / 2, ROOM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[slabW, ROOM_HEIGHT, 0.4]} />
        <ConcreteMaterial maps={maps} repeat={[slabW / TILE_M, ROOM_HEIGHT / TILE_M]} color={WALL_TINT} />
      </mesh>
      <mesh position={[0, opening.height + lintelH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[opening.halfW * 2, lintelH, 0.4]} />
        <ConcreteMaterial maps={maps} repeat={[(opening.halfW * 2) / TILE_M, lintelH / TILE_M]} color={WALL_TINT} />
      </mesh>
    </group>
  );
}
