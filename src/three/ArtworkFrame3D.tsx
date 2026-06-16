import { useEffect, useMemo, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { Group, SRGBColorSpace, SpotLight } from 'three';
import type { Artwork } from '../types/artwork';
import { ART_HEIGHT, type ArtworkPlacement } from './layout';
import { getSoftSpotCookie } from './textures';

interface ArtworkFrame3DProps {
  artwork: Artwork;
  placement: ArtworkPlacement;
}

/**
 * A single framed artwork mounted on a side wall, washed by its own soft ceiling
 * spotlight (with a gobo so the light pools gently on the concrete). The plane
 * faces into the corridor.
 */
export function ArtworkFrame3D({ artwork, placement }: ArtworkFrame3DProps) {
  const texture = useTexture(artwork.image);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  const cookie = useMemo(() => getSoftSpotCookie(), []);

  const aspect = useMemo(() => {
    const img = texture.image as HTMLImageElement | undefined;
    if (img && img.width && img.height) return img.width / img.height;
    return 0.75;
  }, [texture]);

  const height = ART_HEIGHT;
  const width = height * aspect;

  // Left wall faces +X, right wall faces -X.
  const rotationY = placement.side === -1 ? Math.PI / 2 : -Math.PI / 2;

  // Aim the spotlight at the artwork.
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
      {/* White frame / mat, just proud of the wall */}
      <mesh position={[0, 0, 0.04]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.14, height + 0.14, 0.07]} />
        <meshStandardMaterial color="#f7f5f1" roughness={0.6} metalness={0} />
      </mesh>

      {/* The artwork surface */}
      <mesh position={[0, 0, 0.085]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0} />
      </mesh>

      {/* Soft gallery wall-wash from a ceiling track */}
      <spotLight
        ref={spotRef}
        position={[0, height * 0.7 + 0.6, 1.7]}
        angle={0.55}
        penumbra={1}
        intensity={11}
        distance={10}
        decay={1.4}
        color="#fff4e6"
        map={cookie}
        castShadow={false}
      />
      <group ref={targetRef} position={[0, 0, 0.1]} />
    </group>
  );
}
