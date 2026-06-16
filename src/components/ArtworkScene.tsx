import {
  motion,
  useMotionTemplate,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import type { Artwork } from '../types/artwork';
import { ArtworkInfo } from './ArtworkInfo';
import { GalleryPath } from './GalleryPath';

interface ArtworkSceneProps {
  artwork: Artwork;
  index: number;
  total: number;
  /** 0→1 scroll progress for this scene, from <ScrollSection>. */
  progress: MotionValue<number>;
  reducedMotion: boolean;
}

/**
 * One artwork, choreographed as a camera move:
 *   approach (turn toward the wall + zoom in) → hold + reveal info → recede.
 * Built with CSS 3D transforms driven by scroll — no WebGL.
 */
export function ArtworkScene({
  artwork,
  index,
  total,
  progress,
  reducedMotion,
}: ArtworkSceneProps) {
  // Alternate the walking direction and the caption side per artwork.
  const dir = index % 2 === 0 ? 1 : -1;
  const infoAlign: 'left' | 'right' = index % 2 === 0 ? 'right' : 'left';

  // --- Camera (the "room") -------------------------------------------------
  const scale = useTransform(progress, [0, 0.32, 0.7, 1], [1.06, 1.42, 1.42, 1.06]);
  const tx = useTransform(progress, [0, 0.3, 0.7, 1], [dir * 16, 0, 0, -dir * 16]);
  const ry = useTransform(progress, [0, 0.3, 0.7, 1], [dir * 14, 0, 0, -dir * 14]);
  const roomTransform = useMotionTemplate`translateX(${tx}%) rotateY(${ry}deg) scale(${scale})`;

  // --- Focus: dim the surroundings as we settle on the work ----------------
  const spotlight = useTransform(progress, [0.28, 0.5], [0, 1]);

  // --- Caption -------------------------------------------------------------
  const infoOpacity = useTransform(progress, [0.4, 0.48, 0.66, 0.74], [0, 1, 1, 0]);
  const infoY = useTransform(progress, [0.4, 0.48, 0.66, 0.74], [24, 0, 0, -24]);

  if (reducedMotion) {
    return <StaticScene artwork={artwork} index={index} total={total} infoAlign={infoAlign} />;
  }

  return (
    <div className="relative h-full w-full">
      <GalleryPath tone={index % 2 === 0 ? 'light' : 'lighter'} />

      {/* Spotlight: edges darken to focus the centre */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          opacity: spotlight,
          background:
            'radial-gradient(60% 55% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.10) 100%)',
        }}
      />

      {/* The room — pseudo-3D camera target */}
      <div className="absolute inset-0 stage-perspective">
        <motion.div
          className="preserve-3d absolute inset-0 flex items-center justify-center"
          style={{ transform: roomTransform }}
        >
          <ArtworkFrame artwork={artwork} />
        </motion.div>
      </div>

      {/* Caption — kept flat (outside the 3D room) so text stays crisp */}
      <motion.div
        className={`pointer-events-none absolute inset-y-0 flex items-center px-8 md:px-16 ${
          infoAlign === 'right' ? 'right-0 justify-end' : 'left-0 justify-start'
        }`}
        style={{ opacity: infoOpacity, y: infoY }}
      >
        <div className="pointer-events-auto">
          <ArtworkInfo
            artwork={artwork}
            index={index}
            total={total}
            align={infoAlign}
          />
        </div>
      </motion.div>
    </div>
  );
}

/** The framed artwork that sits slightly proud of the wall. */
function ArtworkFrame({ artwork }: { artwork: Artwork }) {
  return (
    <figure
      className="preserve-3d relative"
      style={{ transform: 'translateZ(40px)' }}
    >
      <div className="bg-paper p-3 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] md:p-4">
        <img
          src={artwork.image}
          alt={artwork.title}
          loading="lazy"
          decoding="async"
          className="block h-[58vh] w-auto max-w-[44vw] object-cover"
        />
      </div>
    </figure>
  );
}

/** Reduced-motion / accessibility fallback: no movement, everything visible. */
function StaticScene({
  artwork,
  index,
  total,
  infoAlign,
}: {
  artwork: Artwork;
  index: number;
  total: number;
  infoAlign: 'left' | 'right';
}) {
  return (
    <div className="relative flex h-full w-full items-center justify-center gap-12 bg-wall px-10">
      {infoAlign === 'left' && (
        <ArtworkInfo artwork={artwork} index={index} total={total} align="left" />
      )}
      <figure className="bg-paper p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)]">
        <img
          src={artwork.image}
          alt={artwork.title}
          loading="lazy"
          decoding="async"
          className="block h-[60vh] w-auto max-w-[40vw] object-cover"
        />
      </figure>
      {infoAlign === 'right' && (
        <ArtworkInfo artwork={artwork} index={index} total={total} align="right" />
      )}
    </div>
  );
}
