import { DoubleSide } from 'three';
import {
  CAMERA_START_Z,
  HALL_FRONT_Z,
  ROOM_HALF_WIDTH,
  ROOM_HEIGHT,
  hallBackZ,
} from './layout';
import { StoneDoor } from './StoneDoor';

interface HallProps {
  total: number;
}

const CONCRETE = '#f1efe9'; // all-white gallery walls
const CONCRETE_FLOOR = '#e9e6df';
const ROOM_WIDTH = ROOM_HALF_WIDTH * 2;

/**
 * The architecture: a long, tall, all-white gallery hall, entered through a
 * monumental stone portal and closed by a far wall. Lit softly from above to
 * read as a large contemporary gallery.
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
      <ambientLight intensity={0.85} />
      <hemisphereLight args={['#ffffff', '#e8e4dc', 1.0]} />
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

      {/* ---- Monumental stone portal at the entrance ---- */}
      <StoneDoor />
    </group>
  );
}
