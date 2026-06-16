import { motion, useTransform, type MotionValue } from 'framer-motion';
import { GalleryPath } from './GalleryPath';

interface GalleryEntranceProps {
  progress: MotionValue<number>;
}

/**
 * Section 2 — entering the exhibition. A bright doorway in the far wall grows
 * as we move toward it, then a short title fades through, giving the sense of
 * stepping into the space before the first work appears.
 */
export function GalleryEntrance({ progress }: GalleryEntranceProps) {
  const doorScale = useTransform(progress, [0, 1], [0.6, 6]);
  const doorOpacity = useTransform(progress, [0, 0.7, 1], [1, 1, 0]);
  const wallOpacity = useTransform(progress, [0.6, 1], [1, 0]);

  const labelOpacity = useTransform(progress, [0.25, 0.45, 0.65, 0.8], [0, 1, 1, 0]);
  const labelY = useTransform(progress, [0.25, 0.45], [20, 0]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-wall stage-perspective">
      <GalleryPath />

      {/* The far wall with a luminous opening we travel into */}
      <motion.div className="absolute inset-0" style={{ opacity: wallOpacity }}>
        <motion.div
          className="absolute left-1/2 top-[42%] h-[34vh] w-[22vh] -translate-x-1/2 -translate-y-1/2 rounded-sm"
          style={{
            scale: doorScale,
            opacity: doorOpacity,
            background:
              'linear-gradient(180deg, #ffffff 0%, #faf9f7 100%)',
            boxShadow: '0 0 120px rgba(255,255,255,0.9)',
          }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: labelOpacity, y: labelY }}
      >
        <p className="font-serif text-2xl font-light italic text-ink/70 md:text-3xl">
          The exhibition
        </p>
      </motion.div>
    </div>
  );
}
