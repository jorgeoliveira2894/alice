import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
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
        gl.toneMappingExposure = 1.18;
        gl.outputColorSpace = SRGBColorSpace;
      }}
    >
      {/* Soft atmospheric haze so the far end of the hall dissolves */}
      <color attach="background" args={['#f3f1ec']} />
      <fog attach="fog" args={['#f3f1ec', 18, 70]} />

      <Suspense fallback={null}>
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
