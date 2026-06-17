import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { Artwork } from '../types/artwork';
import { ArtworkInfo } from './ArtworkInfo';
import { ContactButton } from './ContactButton';
import {
  STUDIO_EMAIL,
  STUDIO_INSTAGRAM,
  buildStudioMailto,
} from '../lib/mailto';
import { DWELL, TURN, placeArtwork } from '../three/layout';

interface GalleryOverlayProps {
  artworks: Artwork[];
  progress: MotionValue<number>;
}

/**
 * The crisp HTML layer that floats over the WebGL hall: the opening title, one
 * caption per artwork (fading in as the camera arrives), and the closing
 * contact card. Everything is driven by the same scroll progress as the camera.
 */
export function GalleryOverlay({ artworks, progress }: GalleryOverlayProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      <Intro progress={progress} />

      {artworks.map((artwork, i) => (
        <ArtworkPanel
          key={artwork.id}
          artwork={artwork}
          index={i}
          total={artworks.length}
          progress={progress}
        />
      ))}

      <Closing progress={progress} />
    </div>
  );
}

function Intro({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.05], [1, 0]);
  const y = useTransform(progress, [0, 0.05], ['0%', '-30%']);
  const hint = useTransform(progress, [0, 0.04], [1, 0]);

  return (
    <>
      <motion.div
        style={{ opacity, y }}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <h1 className="font-serif text-5xl font-light leading-none tracking-tight text-ink md:text-7xl">
          Alice Moura Neves
          <span className="mt-2 block text-2xl tracking-editorial text-muted md:text-3xl">
            STUDIO
          </span>
        </h1>
        <p className="mt-8 text-xs uppercase tracking-editorial text-muted md:text-sm">
          Original artworks and visual explorations
        </p>
      </motion.div>

      <motion.div
        style={{ opacity: hint }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-editorial text-muted"
      >
        <span className="block animate-pulse">Scroll to enter</span>
      </motion.div>
    </>
  );
}

function ArtworkPanel({
  artwork,
  index,
  total,
  progress,
}: {
  artwork: Artwork;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const { side, stop } = placeArtwork(index, total);
  // Caption sits on the side opposite the wall the artwork hangs on.
  const align: 'left' | 'right' = side === -1 ? 'right' : 'left';

  const opacity = useTransform(
    progress,
    [stop - DWELL - TURN, stop - DWELL, stop + DWELL, stop + DWELL + TURN],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [stop - DWELL - TURN, stop - DWELL, stop + DWELL, stop + DWELL + TURN],
    [28, 0, 0, -28],
  );

  return (
    <motion.div
      style={{ opacity, y }}
      className={`absolute inset-y-0 flex items-center px-8 md:px-16 ${
        align === 'right' ? 'right-0 justify-end' : 'left-0 justify-start'
      }`}
    >
      <div className="pointer-events-auto">
        <ArtworkInfo
          artwork={artwork}
          index={index}
          total={total}
          align={align}
        />
      </div>
    </motion.div>
  );
}

function Closing({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.92, 0.98], [0, 1]);
  const y = useTransform(progress, [0.92, 0.98], [24, 0]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center justify-center px-6 text-center"
    >
      <div className="pointer-events-auto max-w-xl">
        <p className="mb-6 text-[11px] uppercase tracking-editorial text-muted">
          End of exhibition
        </p>
        <h2 className="font-serif text-4xl font-light leading-tight text-ink md:text-5xl">
          For enquiries, commissions
          <br />
          or available works
        </h2>

        <div className="mt-10 flex flex-col items-center gap-1 text-sm text-ink/70">
          <a
            href={`mailto:${STUDIO_EMAIL}`}
            className="inline-flex min-h-[44px] items-center px-2 transition-colors duration-500 ease-premium hover:text-ink"
          >
            {STUDIO_EMAIL}
          </a>
          <a
            href={STUDIO_INSTAGRAM}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center px-2 transition-colors duration-500 ease-premium hover:text-ink"
          >
            Instagram
          </a>
        </div>

        <div className="mt-10">
          <ContactButton href={buildStudioMailto()} variant="outline">
            Contact the studio
          </ContactButton>
        </div>
      </div>
    </motion.div>
  );
}
