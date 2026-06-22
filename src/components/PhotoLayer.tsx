import { motion, type MotionValue } from 'framer-motion';

/** Paths to the photographic scenes (drop the files in /public/intro). */
export const SCENES = {
  facadeClosed: '/intro/01.jpg',
  facadeOpen: '/intro/02.jpg',
  interior: '/intro/03.jpg',
} as const;

/** Warm gradient shown behind the photos (and as a stand-in while missing). */
export const WARM_FALLBACK =
  'linear-gradient(180deg, #dfe4ea 0%, #ece5d8 52%, #e3d8c4 100%)';

interface PhotoLayerProps {
  src: string;
  opacity?: MotionValue<number> | number;
  scale?: MotionValue<number> | number;
  y?: MotionValue<string> | string;
  /** Zoom focal point, e.g. "50% 54%". */
  origin?: string;
  /** Light blur (px) to push a scene into the background. */
  blur?: number;
  className?: string;
}

/**
 * A single full-screen, object-cover photographic layer that can be zoomed,
 * faded and parallaxed by scroll-driven motion values.
 */
export function PhotoLayer({
  src,
  opacity = 1,
  scale = 1,
  y,
  origin = '50% 50%',
  blur,
  className = '',
}: PhotoLayerProps) {
  return (
    <motion.div
      aria-hidden
      style={{
        opacity,
        scale,
        y,
        transformOrigin: origin,
        backgroundImage: `url(${src})`,
        filter: blur ? `blur(${blur}px)` : undefined,
      }}
      className={`absolute inset-0 bg-cover bg-center ${className}`}
    />
  );
}
