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
const WALL_TILE_M = 2.6; // plaster tile size
const FLOOR_TILE_M = 1.25; // travertine tile size

// CC0 PBR (ambientCG): warm lime plaster walls + travertine floor
const PLASTER_MAPS = {
  map: '/textures/plaster/color.jpg',
  normalMap: '/textures/plaster/normal.jpg',
  roughnessMap: '/textures/plaster/roughness.jpg',
};
const TRAVERTINE_MAPS = {
  map: '/textures/travertine/color.jpg',
  normalMap: '/textures/travertine/normal.jpg',
  roughnessMap: '/textures/travertine/roughness.jpg',
};

// Warm Mediterranean white / cream tints (from the references)
const WALL_TINT = '#efe8da';
const CEIL_TINT = '#ece5d6';
const FLOOR_TINT = '#eadfc9';

interface PBRMaps {
  map: Texture;
  normalMap: Texture;
  roughnessMap: Texture;
}

/**
 * The architecture: a tall warm-white plaster corridor with a polished
 * travertine floor, entered through a doorway and closed by a far wall. Lit by
 * a warm HDRI plus a soft key light, for a Mediterranean-minimal, photographic
 * result.
 */
export function Hall({ total }: HallProps) {
  const plaster = useTexture(PLASTER_MAPS) as PBRMaps;
  const travertine = useTexture(TRAVERTINE_MAPS) as PBRMaps;

  const back = hallBackZ(total);
  const frontZone = CAMERA_START_Z + 6;
  const floorLen = frontZone - back;
  const floorCenter = (frontZone + back) / 2;
  const wallLen = HALL_FRONT_Z - back;
  const wallCenter = (HALL_FRONT_Z + back) / 2;

  return (
    <group>
      {/* ---- Lighting: warm HDRI handles ambient/reflections; key adds shadows ---- */}
      <ambientLight intensity={0.18} color="#fff2dd" />
      <directionalLight
        position={[7, 15, 9]}
        intensity={1.5}
        color="#ffeccf"
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
      <directionalLight position={[-6, 8, -4]} intensity={0.2} color="#eae4f0" />

      {/* ---- Floor (polished travertine, reflective) ---- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, floorCenter]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, floorLen]} />
        <PBRMaterial
          maps={travertine}
          repeat={[ROOM_WIDTH / FLOOR_TILE_M, floorLen / FLOOR_TILE_M]}
          color={FLOOR_TINT}
          roughness={0.32}
          metalness={0.0}
          envMapIntensity={1.4}
          normalScale={0.4}
        />
      </mesh>

      {/* ---- Ceiling ---- */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, wallCenter]}>
        <planeGeometry args={[ROOM_WIDTH, wallLen]} />
        <PBRMaterial
          maps={plaster}
          repeat={[ROOM_WIDTH / WALL_TILE_M, wallLen / WALL_TILE_M]}
          color={CEIL_TINT}
          side={DoubleSide}
          normalScale={0.5}
        />
      </mesh>

      {/* ---- Side walls ---- */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, wallCenter]} receiveShadow>
        <planeGeometry args={[wallLen, ROOM_HEIGHT]} />
        <PBRMaterial maps={plaster} repeat={[wallLen / WALL_TILE_M, ROOM_HEIGHT / WALL_TILE_M]} color={WALL_TINT} side={DoubleSide} normalScale={0.6} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, wallCenter]} receiveShadow>
        <planeGeometry args={[wallLen, ROOM_HEIGHT]} />
        <PBRMaterial maps={plaster} repeat={[wallLen / WALL_TILE_M, ROOM_HEIGHT / WALL_TILE_M]} color={WALL_TINT} side={DoubleSide} normalScale={0.6} />
      </mesh>

      {/* ---- Far (back) wall ---- */}
      <mesh position={[0, ROOM_HEIGHT / 2, back]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <PBRMaterial maps={plaster} repeat={[ROOM_WIDTH / WALL_TILE_M, ROOM_HEIGHT / WALL_TILE_M]} color={WALL_TINT} side={DoubleSide} normalScale={0.6} />
      </mesh>

      {/* ---- Entrance wall with a doorway ---- */}
      <Doorway maps={plaster} />
    </group>
  );
}

interface PBRMaterialProps {
  maps: PBRMaps;
  repeat: [number, number];
  color?: string;
  side?: typeof DoubleSide | undefined;
  roughness?: number;
  metalness?: number;
  normalScale?: number;
  envMapIntensity?: number;
}

/** Clones shared PBR maps and applies per-surface tiling. */
function PBRMaterial({
  maps,
  repeat,
  color = '#ffffff',
  side,
  roughness = 1,
  metalness = 0,
  normalScale = 1,
  envMapIntensity = 1,
}: PBRMaterialProps) {
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
function Doorway({ maps }: { maps: PBRMaps }) {
  const opening = { halfW: 1.8, height: 3.8 };
  const lintelH = ROOM_HEIGHT - opening.height;
  const slabW = ROOM_HALF_WIDTH - opening.halfW;

  return (
    <group position={[0, 0, HALL_FRONT_Z]}>
      <mesh position={[-(ROOM_HALF_WIDTH + opening.halfW) / 2, ROOM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[slabW, ROOM_HEIGHT, 0.4]} />
        <PBRMaterial maps={maps} repeat={[slabW / WALL_TILE_M, ROOM_HEIGHT / WALL_TILE_M]} color={WALL_TINT} />
      </mesh>
      <mesh position={[(ROOM_HALF_WIDTH + opening.halfW) / 2, ROOM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[slabW, ROOM_HEIGHT, 0.4]} />
        <PBRMaterial maps={maps} repeat={[slabW / WALL_TILE_M, ROOM_HEIGHT / WALL_TILE_M]} color={WALL_TINT} />
      </mesh>
      <mesh position={[0, opening.height + lintelH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[opening.halfW * 2, lintelH, 0.4]} />
        <PBRMaterial maps={maps} repeat={[(opening.halfW * 2) / WALL_TILE_M, lintelH / WALL_TILE_M]} color={WALL_TINT} />
      </mesh>
    </group>
  );
}
