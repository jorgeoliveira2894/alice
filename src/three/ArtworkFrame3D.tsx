import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { SRGBColorSpace } from 'three';
import type { Artwork } from '../types/artwork';
import { ART_HEIGHT, type ArtworkPlacement } from './layout';

interface ArtworkFrame3DProps {
  artwork: Artwork;
  placement: ArtworkPlacement;
}

/**
 * A single framed artwork mounted on a side wall, lit by its own soft ceiling
 * spotlight. The plane faces into the corridor.
 */
export function ArtworkFrame3D({ artwork, placement }: ArtworkFrame3DProps) {
  const texture = useTexture(artwork.image);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  // Derive aspect ratio from the loaded image (falls back to a portrait ratio).
  const aspect = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    if (img && img.width && img.height) return img.width / img.height;
    return 0.75;
  }, [texture]);

  const height = ART_HEIGHT;
  const width = height * aspect;

  // Left wall faces +X, right wall faces -X.
  const rotationY = placement.side === -1 ? Math.PI / 2 : -Math.PI / 2;

  return (
    <group
      position={[placement.x, placement.y, placement.z]}
      rotation={[0, rotationY, 0]}
    >
      {/* White frame / mat, just proud of the wall */}
      <mesh position={[0, 0, 0.03]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.16, height + 0.16, 0.06]} />
        <meshStandardMaterial color="#fbfaf8" roughness={0.7} />
      </mesh>

      {/* The artwork surface */}
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.9} />
      </mesh>

      {/* Gallery spotlight grazing the piece from above-front */}
      <spotLight
        position={[0, 2.0, 1.6]}
        target-position={[0, 0, 0]}
        angle={0.6}
        penumbra={1}
        intensity={6}
        distance={9}
        color="#fff7ec"
      />
    </group>
  );
}
