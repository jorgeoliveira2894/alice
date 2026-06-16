import { DoubleSide } from 'three';
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

const CONCRETE = '#e7e4de'; // burnt white microcement
const CONCRETE_FLOOR = '#e2dfd8';
const ROOM_WIDTH = ROOM_HALF_WIDTH * 2;

/**
 * The architecture: a long, tall corridor in burnt-white microcement, entered
 * through a doorway in the front wall and closed by a far wall. Lit softly from
 * above to read as a large contemporary gallery.
 */
export function Hall({ total }: HallProps) {
  const back = hallBackZ(total);
  const frontZone = CAMERA_START_Z + 6; // floor reaches behind the start point
  const floorLen = frontZone - back;
  const floorCenter = (frontZone + back) / 2;
  const wallLen = HALL_FRONT_Z - back; // walls span the hall only
  const wallCenter = (HALL_FRONT_Z + back) / 2;

  return (
    <group>
      {/* ---- Lighting ---- */}
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#ffffff', '#d6d2ca', 0.7]} />
      <directionalLight
        position={[6, 14, 10]}
        intensity={1.1}
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

      {/* ---- Floor ---- */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, floorCenter]}
        receiveShadow
      >
        <planeGeometry args={[ROOM_WIDTH, floorLen]} />
        <meshStandardMaterial color={CONCRETE_FLOOR} roughness={0.95} />
      </mesh>

      {/* ---- Ceiling ---- */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, ROOM_HEIGHT, wallCenter]}
      >
        <planeGeometry args={[ROOM_WIDTH, wallLen]} />
        <meshStandardMaterial color={CONCRETE} roughness={1} side={DoubleSide} />
      </mesh>

      {/* ---- Side walls ---- */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, wallCenter]}
        receiveShadow
      >
        <planeGeometry args={[wallLen, ROOM_HEIGHT]} />
        <meshStandardMaterial color={CONCRETE} roughness={1} side={DoubleSide} />
      </mesh>
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, wallCenter]}
        receiveShadow
      >
        <planeGeometry args={[wallLen, ROOM_HEIGHT]} />
        <meshStandardMaterial color={CONCRETE} roughness={1} side={DoubleSide} />
      </mesh>

      {/* ---- Far (back) wall ---- */}
      <mesh position={[0, ROOM_HEIGHT / 2, back]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color={CONCRETE} roughness={1} side={DoubleSide} />
      </mesh>

      {/* ---- Entrance wall with a doorway ---- */}
      <Doorway />
    </group>
  );
}

/** Front wall built from three slabs that frame a central opening. */
function Doorway() {
  const opening = { halfW: 1.8, height: 3.8 };
  const lintelH = ROOM_HEIGHT - opening.height;

  return (
    <group position={[0, 0, HALL_FRONT_Z]}>
      {/* Left slab */}
      <mesh
        position={[-(ROOM_HALF_WIDTH + opening.halfW) / 2, ROOM_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[ROOM_HALF_WIDTH - opening.halfW, ROOM_HEIGHT, 0.4]}
        />
        <meshStandardMaterial color={CONCRETE} roughness={1} />
      </mesh>
      {/* Right slab */}
      <mesh
        position={[(ROOM_HALF_WIDTH + opening.halfW) / 2, ROOM_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[ROOM_HALF_WIDTH - opening.halfW, ROOM_HEIGHT, 0.4]}
        />
        <meshStandardMaterial color={CONCRETE} roughness={1} />
      </mesh>
      {/* Lintel above the opening */}
      <mesh
        position={[0, opening.height + lintelH / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[opening.halfW * 2, lintelH, 0.4]} />
        <meshStandardMaterial color={CONCRETE} roughness={1} />
      </mesh>
    </group>
  );
}
