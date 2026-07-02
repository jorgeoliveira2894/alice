import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import {
  Group,
  MeshStandardMaterial,
  SpotLight,
  SRGBColorSpace,
} from 'three';
import type { Artwork } from '../types/artwork';
import { ART_HEIGHT, smoothstep, type ArtworkPlacement } from './layout';

interface ArtworkFrame3DProps {
  artwork: Artwork;
  placement: ArtworkPlacement;
}

// The artwork materialises on the wall as the visitor approaches: reveal
// begins this far ahead of it and completes at the shorter distance.
const REVEAL_START = 17;
const REVEAL_END = 8;
const RISE = 0.6;

/**
 * A single framed artwork mounted on a side wall, lit by its own soft ceiling
 * spotlight. It fades in and rises into place as the camera walks toward it.
 */
export function ArtworkFrame3D({ artwork, placement }: ArtworkFrame3DProps) {
  const texture = useTexture(artwork.image);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;

  const group = useRef<Group>(null);
  const frameMat = useRef<MeshStandardMaterial>(null);
  const artMat = useRef<MeshStandardMaterial>(null);
  const light = useRef<SpotLight>(null);

  useFrame(({ camera }) => {
    const ahead = camera.position.z - placement.z;
    const w = smoothstep((REVEAL_START - ahead) / (REVEAL_START - REVEAL_END));

    if (group.current) group.current.position.y = placement.y - (1 - w) * RISE;
    if (frameMat.current) frameMat.current.opacity = w;
    if (artMat.current) artMat.current.opacity = w;
    if (light.current) light.current.intensity = 6 * w;
  });

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
      ref={group}
      position={[placement.x, placement.y - RISE, placement.z]}
      rotation={[0, rotationY, 0]}
    >
      {/* White frame / mat, just proud of the wall */}
      <mesh position={[0, 0, 0.03]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.16, height + 0.16, 0.06]} />
        <meshStandardMaterial
          ref={frameMat}
          color="#fbfaf8"
          roughness={0.7}
          transparent
          opacity={0}
        />
      </mesh>

      {/* The artwork surface */}
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          ref={artMat}
          map={texture}
          roughness={0.9}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Gallery spotlight grazing the piece from above-front */}
      <spotLight
        ref={light}
        position={[0, 2.0, 1.6]}
        target-position={[0, 0, 0]}
        angle={0.6}
        penumbra={1}
        intensity={0}
        distance={9}
        color="#fff7ec"
      />
    </group>
  );
}
