import { useEffect, useMemo, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { AdditiveBlending, Group, SRGBColorSpace, SpotLight } from 'three';
import type { Artwork } from '../types/artwork';
import { ART_HEIGHT, type ArtworkPlacement } from './layout';
import { getSoftHalo } from './textures';

interface ArtworkFrame3DProps {
  artwork: Artwork;
  placement: ArtworkPlacement;
}

/**
 * A single framed artwork on a side wall: a thin frame, a soft warm backlight
 * halo glowing onto the plaster behind it, and a discreet ceiling wash — the
 * "luminous edge" gallery look of the reference image.
 */
export function ArtworkFrame3D({ artwork, placement }: ArtworkFrame3DProps) {
  const texture = useTexture(artwork.image);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  const halo = useMemo(() => getSoftHalo(), []);

  const aspect = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    if (img && img.width && img.height) return img.width / img.height;
    return 0.75;
  }, [texture]);

  const height = ART_HEIGHT;
  const width = height * aspect;

  // Left wall faces +X, right wall faces -X.
  const rotationY = placement.side === -1 ? Math.PI / 2 : -Math.PI / 2;

  // Backlight that washes the wall around the frame.
  const spotRef = useRef<SpotLight>(null);
  const targetRef = useRef<Group>(null);
  useEffect(() => {
    if (spotRef.current && targetRef.current) {
      spotRef.current.target = targetRef.current;
      spotRef.current.target.updateMatrixWorld();
    }
  }, []);

  return (
    <group position={[placement.x, placement.y, placement.z]} rotation={[0, rotationY, 0]}>
      {/* Warm halo glowing onto the wall behind the frame */}
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[width + 1.1, height + 1.1]} />
        <meshBasicMaterial
          map={halo}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>

      {/* Thin frame, slightly proud of the wall */}
      <mesh position={[0, 0, 0.04]} castShadow>
        <boxGeometry args={[width + 0.06, height + 0.06, 0.05]} />
        <meshStandardMaterial color="#c8bca3" roughness={0.45} metalness={0.4} />
      </mesh>

      {/* The artwork surface */}
      <mesh position={[0, 0, 0.072]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.82} metalness={0} />
      </mesh>

      {/* Actual light source behind the frame, grazing the wall → real halo */}
      <pointLight position={[0, 0, 0.06]} intensity={3.2} distance={3.2} decay={2} color="#ffe9cc" />

      {/* Subtle ceiling wash for definition */}
      <spotLight
        ref={spotRef}
        position={[0, height * 0.7 + 0.7, 1.4]}
        angle={0.5}
        penumbra={1}
        intensity={5}
        distance={9}
        decay={1.5}
        color="#fff3e0"
        castShadow={false}
      />
      <group ref={targetRef} position={[0, 0, 0.1]} />
    </group>
  );
}
