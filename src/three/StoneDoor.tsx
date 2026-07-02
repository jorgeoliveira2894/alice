import { useMemo } from 'react';
import { CanvasTexture, RepeatWrapping } from 'three';
import { DOOR, HALL_FRONT_Z, ROOM_HALF_WIDTH, ROOM_HEIGHT } from './layout';

const WALL_WHITE = '#f1efe9';

/**
 * The monumental stone portal at the gallery entrance: two massive jambs and a
 * heavy lintel in warm grey stone, set into an otherwise white entrance wall.
 * The camera (and the visitor) passes through its opening.
 */
export function StoneDoor() {
  const stone = useStoneTexture();
  const sideSlabWidth = ROOM_HALF_WIDTH - (DOOR.halfWidth + DOOR.jambWidth);
  const lintelHeight = ROOM_HEIGHT - DOOR.height;

  return (
    <group position={[0, 0, HALL_FRONT_Z]}>
      {/* Stone jambs */}
      {([-1, 1] as const).map((side) => (
        <mesh
          key={side}
          position={[
            side * (DOOR.halfWidth + DOOR.jambWidth / 2),
            DOOR.height / 2,
            0,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[DOOR.jambWidth, DOOR.height, DOOR.depth]} />
          <meshStandardMaterial
            map={stone}
            bumpMap={stone}
            bumpScale={0.4}
            roughness={0.95}
          />
        </mesh>
      ))}

      {/* Stone lintel spanning the jambs */}
      <mesh
        position={[0, DOOR.height + lintelHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            (DOOR.halfWidth + DOOR.jambWidth) * 2,
            lintelHeight,
            DOOR.depth,
          ]}
        />
        <meshStandardMaterial
          map={stone}
          bumpMap={stone}
          bumpScale={0.4}
          roughness={0.95}
        />
      </mesh>

      {/* White wall filling from the portal to the side walls */}
      {([-1, 1] as const).map((side) => (
        <mesh
          key={`wall-${side}`}
          position={[
            side * (DOOR.halfWidth + DOOR.jambWidth + sideSlabWidth / 2),
            ROOM_HEIGHT / 2,
            0,
          ]}
          receiveShadow
        >
          <boxGeometry args={[sideSlabWidth, ROOM_HEIGHT, 0.3]} />
          <meshStandardMaterial color={WALL_WHITE} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Small procedural stone texture: warm grey base with speckle noise and faint
 * strata, generated once on a canvas — no image assets needed.
 */
function useStoneTexture(): CanvasTexture {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#a3a09a';
    ctx.fillRect(0, 0, size, size);

    const img = ctx.getImageData(0, 0, size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 30;
      img.data[i] += n;
      img.data[i + 1] += n;
      img.data[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);

    // Faint horizontal strata, like sedimentary stone
    ctx.strokeStyle = 'rgba(70, 63, 54, 0.12)';
    for (let y = 12; y < size; y += 22 + Math.random() * 26) {
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y + (Math.random() - 0.5) * 8);
      ctx.stroke();
    }

    const texture = new CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(1.5, 1.5);
    return texture;
  }, []);
}
