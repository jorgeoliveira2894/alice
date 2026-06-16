import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import {
  Bloom,
  EffectComposer,
  N8AO,
  Noise,
  SMAA,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import type { MotionValue } from 'framer-motion';
import type { Artwork } from '../types/artwork';
import { NoToneMapping, SRGBColorSpace } from 'three';
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
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, EYE_HEIGHT, CAMERA_START_Z], fov: 58, near: 0.1, far: 200 }}
      onCreated={({ gl }) => {
        // Tone mapping is handled as a post effect, so keep the renderer linear.
        gl.toneMapping = NoToneMapping;
        gl.outputColorSpace = SRGBColorSpace;
      }}
    >
      {/* Warm interior air; the far end of the hall softens but stays readable */}
      <color attach="background" args={['#e7e1d6']} />
      <fog attach="fog" args={['#e7e1d6', 26, 105]} />

      <Suspense fallback={null}>
        {/* Self-contained studio environment (no HDR download) for soft
            reflections on the polished floor and the framed works. */}
        <Environment resolution={256} frames={1} environmentIntensity={0.4}>
          <Lightformer form="rect" intensity={2} color="#fff3e2" position={[0, 8, -12]} rotation={[Math.PI / 2, 0, 0]} scale={[14, 50, 1]} />
          <Lightformer form="rect" intensity={0.7} color="#ffffff" position={[-8, 3, -12]} rotation={[0, Math.PI / 2, 0]} scale={[50, 8, 1]} />
          <Lightformer form="rect" intensity={0.7} color="#ffffff" position={[8, 3, -12]} rotation={[0, -Math.PI / 2, 0]} scale={[50, 8, 1]} />
        </Environment>

        <Hall total={artworks.length} />
        {artworks.map((artwork, i) => (
          <ArtworkFrame3D key={artwork.id} artwork={artwork} placement={placements[i]} />
        ))}
      </Suspense>

      <CameraRig total={artworks.length} progress={progress} />

      {/* Cinematic finish: ambient occlusion, gentle bloom, film grain, vignette */}
      <EffectComposer multisampling={0}>
        <N8AO aoRadius={1.4} intensity={2.2} distanceFalloff={1} halfRes />
        <Bloom intensity={0.22} luminanceThreshold={0.82} luminanceSmoothing={0.25} mipmapBlur />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette eskil={false} offset={0.22} darkness={0.62} />
        <Noise opacity={0.035} premultiply blendFunction={BlendFunction.OVERLAY} />
        <SMAA />
      </EffectComposer>
    </Canvas>
  );
}
