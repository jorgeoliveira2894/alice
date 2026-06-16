import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { MotionValue } from 'framer-motion';
import {
  EYE_HEIGHT,
  activeTurn,
  allPlacements,
  cameraZKeys,
  lerp,
  sampleEased,
} from './layout';

interface CameraRigProps {
  total: number;
  progress: MotionValue<number>;
}

/**
 * Drives the camera each frame from the page scroll progress: a steady glide
 * forward down the corridor, easing to a stop beside each artwork while the
 * head turns to face the wall. Positions are damped so fast scrolling still
 * feels smooth and premium rather than snappy.
 */
export function CameraRig({ total, progress }: CameraRigProps) {
  const { camera } = useThree();
  const zKeys = useRef(cameraZKeys(total));
  const placements = useRef(allPlacements(total));

  // Reused vectors (avoid per-frame allocation)
  const desiredPos = useRef(new Vector3(0, EYE_HEIGHT, 12));
  const lookTarget = useRef(new Vector3(0, EYE_HEIGHT, 0));
  const smoothedLook = useRef(new Vector3(0, EYE_HEIGHT, 0));

  useFrame((_, delta) => {
    const p = progress.get();

    const z = sampleEased(zKeys.current, p);
    const { index, weight } = activeTurn(total, p);
    const art = placements.current[index];

    // Step slightly toward the centre/opposite side for a better viewing angle.
    const xOffset = lerp(0, -art.side * 1.1, weight);
    desiredPos.current.set(xOffset, EYE_HEIGHT, z);

    // Blend between looking down the hall and facing the active artwork.
    const forwardX = xOffset;
    const forwardY = EYE_HEIGHT;
    const forwardZ = z - 10;
    lookTarget.current.set(
      lerp(forwardX, art.x, weight),
      lerp(forwardY, art.y, weight),
      lerp(forwardZ, art.z, weight),
    );

    // Damping (frame-rate independent-ish)
    const posLerp = 1 - Math.pow(0.0001, delta);
    const lookLerp = 1 - Math.pow(0.00005, delta);

    camera.position.lerp(desiredPos.current, posLerp);
    smoothedLook.current.lerp(lookTarget.current, lookLerp);
    camera.lookAt(smoothedLook.current);
  });

  return null;
}
