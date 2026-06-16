import { useMemo } from 'react';
import { DoubleSide, Vector2 } from 'three';
import {
  CAMERA_START_Z,
  HALL_FRONT_Z,
  ROOM_HALF_WIDTH,
  ROOM_HEIGHT,
  hallBackZ,
} from './layout';
import { makeConcreteSurface, type ConcreteSurface } from './textures';

interface HallProps {
  total: number;
}

const ROOM_WIDTH = ROOM_HALF_WIDTH * 2;

// Warm architectural-concrete palette (from the reference photos)
const WALL_BASE: [number, number, number] = [205, 197, 184];
const FLOOR_BASE: [number, number, number] = [188, 181, 169];
const CEIL_BASE: [number, number, number] = [198, 191, 179];

/**
 * The architecture: a tall corridor of board-formed concrete, entered through a
 * doorway and closed by a far wall. Each surface carries its own concrete
 * texture (panel joints, tie holes, staining, grain) sized to real proportions.
 */
export function Hall({ total }: HallProps) {
  const back = hallBackZ(total);
  const frontZone = CAMERA_START_Z + 6;
  const floorLen = frontZone - back;
  const floorCenter = (frontZone + back) / 2;
  const wallLen = HALL_FRONT_Z - back;
  const wallCenter = (HALL_FRONT_Z + back) / 2;

  const sideTex = useMemo(
    () =>
      makeConcreteSurface({
        worldWidth: wallLen,
        worldHeight: ROOM_HEIGHT,
        pixelsPerUnit: 78,
        base: WALL_BASE,
        panelWidth: 2.6,
        panelHeight: ROOM_HEIGHT / 2,
        tieHoles: true,
        roughness: 0.84,
        seed: 11,
      }),
    [wallLen],
  );
  const endTex = useMemo(
    () =>
      makeConcreteSurface({
        worldWidth: ROOM_WIDTH,
        worldHeight: ROOM_HEIGHT,
        base: WALL_BASE,
        panelWidth: 2.6,
        panelHeight: ROOM_HEIGHT / 2,
        tieHoles: true,
        roughness: 0.84,
        seed: 31,
      }),
    [],
  );
  const floorTex = useMemo(
    () =>
      makeConcreteSurface({
        worldWidth: ROOM_WIDTH,
        worldHeight: floorLen,
        pixelsPerUnit: 70,
        base: FLOOR_BASE,
        panelWidth: ROOM_WIDTH / 2,
        panelHeight: 5,
        tieHoles: false,
        roughness: 0.5,
        streaks: 0,
        seed: 53,
      }),
    [floorLen],
  );
  const ceilTex = useMemo(
    () =>
      makeConcreteSurface({
        worldWidth: ROOM_WIDTH,
        worldHeight: wallLen,
        pixelsPerUnit: 60,
        base: CEIL_BASE,
        panelWidth: ROOM_WIDTH / 2,
        panelHeight: 4,
        tieHoles: false,
        streaks: 0,
        roughness: 0.9,
        seed: 71,
      }),
    [wallLen],
  );

  return (
    <group>
      {/* ---- Lighting: a soft warm key + cool fill, like daylight indoors ---- */}
      <ambientLight intensity={0.28} color="#fbf3e6" />
      <hemisphereLight args={['#fff4e2', '#c9c4ba', 0.5]} />
      <directionalLight
        position={[8, 16, 9]}
        intensity={1.7}
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
      {/* gentle cool counter-fill to keep shadows from going dead */}
      <directionalLight position={[-6, 8, -4]} intensity={0.25} color="#dce7f2" />

      {/* ---- Floor (polished, reflective) ---- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, floorCenter]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, floorLen]} />
        <ConcreteMaterial tex={floorTex} metalness={0.14} normalScale={0.2} />
      </mesh>

      {/* ---- Ceiling ---- */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, wallCenter]}>
        <planeGeometry args={[ROOM_WIDTH, wallLen]} />
        <ConcreteMaterial tex={ceilTex} side={DoubleSide} normalScale={0.4} />
      </mesh>

      {/* ---- Side walls ---- */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, wallCenter]} receiveShadow>
        <planeGeometry args={[wallLen, ROOM_HEIGHT]} />
        <ConcreteMaterial tex={sideTex} side={DoubleSide} normalScale={0.6} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, wallCenter]} receiveShadow>
        <planeGeometry args={[wallLen, ROOM_HEIGHT]} />
        <ConcreteMaterial tex={sideTex} side={DoubleSide} normalScale={0.6} />
      </mesh>

      {/* ---- Far (back) wall ---- */}
      <mesh position={[0, ROOM_HEIGHT / 2, back]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <ConcreteMaterial tex={endTex} side={DoubleSide} normalScale={0.6} />
      </mesh>

      {/* ---- Entrance wall with a doorway ---- */}
      <Doorway tex={endTex} />
    </group>
  );
}

interface ConcreteMaterialProps {
  tex: ConcreteSurface;
  side?: typeof DoubleSide | undefined;
  metalness?: number;
  normalScale?: number;
}

/** A textured microcement material (textures are pre-sized per surface). */
function ConcreteMaterial({
  tex,
  side,
  metalness = 0,
  normalScale = 0.5,
}: ConcreteMaterialProps) {
  const normalScaleVec = useMemo(
    () => new Vector2(normalScale, normalScale),
    [normalScale],
  );
  return (
    <meshStandardMaterial
      map={tex.map}
      normalMap={tex.normalMap}
      roughnessMap={tex.roughnessMap}
      normalScale={normalScaleVec}
      roughness={1}
      metalness={metalness}
      side={side}
    />
  );
}

/** Front wall built from three slabs that frame a central opening. */
function Doorway({ tex }: { tex: ConcreteSurface }) {
  const opening = { halfW: 1.8, height: 3.8 };
  const lintelH = ROOM_HEIGHT - opening.height;
  const slabW = ROOM_HALF_WIDTH - opening.halfW;

  return (
    <group position={[0, 0, HALL_FRONT_Z]}>
      <mesh position={[-(ROOM_HALF_WIDTH + opening.halfW) / 2, ROOM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[slabW, ROOM_HEIGHT, 0.4]} />
        <ConcreteMaterial tex={tex} />
      </mesh>
      <mesh position={[(ROOM_HALF_WIDTH + opening.halfW) / 2, ROOM_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[slabW, ROOM_HEIGHT, 0.4]} />
        <ConcreteMaterial tex={tex} />
      </mesh>
      <mesh position={[0, opening.height + lintelH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[opening.halfW * 2, lintelH, 0.4]} />
        <ConcreteMaterial tex={tex} />
      </mesh>
    </group>
  );
}
