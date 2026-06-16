import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import type { MotionValue } from 'framer-motion';
import type { Artwork } from '../types/artwork';
import {
  ACESFilmicToneMapping,
  SRGBColorSpace,
} from 'three';
import { Hall } from './Hall';
import { ArtworkFrame3D } from './ArtworkFrame3D';
import { CameraRig } from './CameraRig';
import { CAMERA_START_Z, EYE_HEIGHT, allPlacements } from './layout';

interface GalleryCanvasProps {
  artworks: Artwork[];
  progress: MotionValue<number>;
}

/** The WebGL exhibition: the concrete hall, its artworks, and the moving camera. */
export function GalleryCanvas({ artworks, progress }: GalleryCanvasProps) {
  const placements = allPlacements(artworks.length);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, EYE_HEIGHT, CAMERA_START_Z], fov: 60, near: 0.1, far: 200 }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = SRGBColorSpace;
      }}
    >
      {/* Soft atmospheric haze so the far end of the hall dissolves */}
      <color attach="background" args={['#efece6']} />
      <fog attach="fog" args={['#efece6', 18, 70]} />

      <Suspense fallback={null}>
        {/* Self-contained studio environment (no HDR download) for soft
            reflections on the polished floor and the framed works. */}
        <Environment resolution={256} frames={1} environmentIntensity={0.45}>
          {/* Broad overhead skylight */}
          <Lightformer
            form="rect"
            intensity={2}
            color="#fff6ea"
            position={[0, 8, -12]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[14, 50, 1]}
          />
          {/* Soft fill from each side */}
          <Lightformer
            form="rect"
            intensity={0.7}
            color="#ffffff"
            position={[-8, 3, -12]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[50, 8, 1]}
          />
          <Lightformer
            form="rect"
            intensity={0.7}
            color="#ffffff"
            position={[8, 3, -12]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={[50, 8, 1]}
          />
        </Environment>

        <Hall total={artworks.length} />
        {artworks.map((artwork, i) => (
          <ArtworkFrame3D
            key={artwork.id}
            artwork={artwork}
            placement={placements[i]}
          />
        ))}
      </Suspense>

      <CameraRig total={artworks.length} progress={progress} />
    </Canvas>
  );
}
