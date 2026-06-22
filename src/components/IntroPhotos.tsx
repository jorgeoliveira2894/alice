import { motion, useTransform, type MotionValue } from 'framer-motion';

interface IntroPhotosProps {
  progress: MotionValue<number>;
}

/**
 * The cinematic opening: a full-screen exterior photo (01) that, as the visitor
 * scrolls, zooms toward the doorway and crossfades into a second photo (02)
 * looking down the corridor — which in turn dissolves to reveal the live 3D
 * hall. The whole layer fades out once we're "inside".
 *
 * Drop the photos in /public/intro as 01.jpg and 02.jpg. While missing, a warm
 * gradient stands in so nothing looks broken.
 */
export function IntroPhotos({ progress }: IntroPhotosProps) {
  // Photo 1 — exterior facade
  const img1Opacity = useTransform(progress, [0, 0.05, 0.085], [1, 1, 0]);
  const img1Scale = useTransform(progress, [0, 0.1], [1, 1.5]);

  // Photo 2 — through the doorway, down the corridor
  const img2Opacity = useTransform(progress, [0.04, 0.07, 0.11], [0, 1, 0]);
  const img2Scale = useTransform(progress, [0.02, 0.13], [1.15, 1.85]);

  // The whole layer is gone once we're inside the 3D hall
  const layerOpacity = useTransform(progress, [0.1, 0.12], [1, 0]);

  return (
    <motion.div
      aria-hidden
      style={{ opacity: layerOpacity }}
      className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"
    >
      {/* warm fallback behind the photos */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #dfe4ea 0%, #ece5d8 55%, #e3d8c4 100%)',
        }}
      />

      <motion.div
        style={{
          opacity: img1Opacity,
          scale: img1Scale,
          transformOrigin: '50% 54%',
          backgroundImage: 'url(/intro/01.jpg)',
        }}
        className="absolute inset-0 bg-cover bg-center"
      />
      <motion.div
        style={{
          opacity: img2Opacity,
          scale: img2Scale,
          transformOrigin: '50% 50%',
          backgroundImage: 'url(/intro/02.jpg)',
        }}
        className="absolute inset-0 bg-cover bg-center"
      />
    </motion.div>
  );
}
