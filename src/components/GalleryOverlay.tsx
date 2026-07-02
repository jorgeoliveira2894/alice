import {
  motion,
  useMotionTemplate,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import type { Artwork } from '../types/artwork';
import { ArtworkInfo } from './ArtworkInfo';
import { ContactButton } from './ContactButton';
import {
  STUDIO_EMAIL,
  STUDIO_INSTAGRAM,
  buildStudioMailto,
} from '../lib/mailto';
import { activeTurn, placeArtwork } from '../three/layout';

interface GalleryOverlayProps {
  artworks: Artwork[];
  progress: MotionValue<number>;
}

/**
 * The crisp HTML layer that floats over the WebGL hall. Text follows the
 * Apple product-page grammar: elements are revealed at precise scroll
 * positions with a blur → sharp, soft-rise entrance, hold while the camera
 * dwells, and dissolve upward on exit.
 */
export function GalleryOverlay({ artworks, progress }: GalleryOverlayProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      <DwellVignette total={artworks.length} progress={progress} />

      <Intro progress={progress} />
      <ThresholdStatement progress={progress} />

      {artworks.map((artwork, i) => (
        <ArtworkPanel
          key={artwork.id}
          artwork={artwork}
          index={i}
          total={artworks.length}
          progress={progress}
        />
      ))}

      <ProgressHairline progress={progress} />
      <Closing progress={progress} />
    </div>
  );
}

/** Soft radial darkening that peaks while the camera dwells on an artwork. */
function DwellVignette({
  total,
  progress,
}: {
  total: number;
  progress: MotionValue<number>;
}) {
  const strength = useTransform(progress, (p) => activeTurn(total, p).weight);
  const opacity = useTransform(strength, [0, 1], [0, 0.45]);

  return (
    <motion.div
      aria-hidden
      className="absolute inset-0"
      style={{
        opacity,
        background:
          'radial-gradient(70% 60% at 50% 46%, rgba(0,0,0,0) 45%, rgba(20,18,14,0.22) 100%)',
      }}
    />
  );
}

function Intro({ progress }: { progress: MotionValue<number> }) {
  // Hero à la reference video: display-scale typography laid over the stone
  // portal. On scroll it drifts up, scales toward the viewer and dissolves
  // into blur as the camera starts moving through the door.
  const opacity = useTransform(progress, [0, 0.045], [1, 0]);
  const y = useTransform(progress, [0, 0.045], [0, -80]);
  const scale = useTransform(progress, [0, 0.045], [1, 1.08]);
  const blurPx = useTransform(progress, [0, 0.045], [0, 12]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  const hint = useTransform(progress, [0, 0.03], [1, 0]);

  return (
    <>
      <motion.div
        style={{ opacity, y, scale, filter }}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <h1
          className="font-serif font-light tracking-tight text-ink"
          style={{ fontSize: 'clamp(3.5rem, 9.5vw, 10.5rem)', lineHeight: 0.95 }}
        >
          Alice
          <span className="block">Moura Neves</span>
        </h1>
        <p className="mt-6 text-sm uppercase tracking-editorial text-muted md:text-base">
          Studio
        </p>
        <p className="mt-10 text-xs uppercase tracking-editorial text-muted md:text-sm">
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

/**
 * A single editorial line that floats past while the camera crosses the stone
 * threshold — the big-type scroll moment from the reference video.
 */
function ThresholdStatement({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.05, 0.075, 0.105, 0.135], [0, 1, 1, 0]);
  const y = useTransform(progress, [0.05, 0.135], [60, -60]);
  const blurPx = useTransform(progress, [0.05, 0.068, 0.115, 0.135], [8, 0, 0, 8]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  return (
    <motion.div
      style={{ opacity, y, filter }}
      className="absolute inset-0 flex items-center justify-center px-6 text-center"
    >
      <p className="max-w-3xl font-serif text-3xl font-light italic leading-snug text-ink/80 md:text-5xl">
        A quiet walk through original works
      </p>
    </motion.div>
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

  // The caption's visibility mirrors the camera's head-turn weight, so text
  // and camera can never disagree — and only one caption exists at a time.
  const weight = useTransform(progress, (p) => {
    const turn = activeTurn(total, p);
    return turn.index === index ? turn.weight : 0;
  });

  // Enter rising from below (walking toward it), exit drifting up (moving on).
  const y = useTransform(progress, (p) => {
    const turn = activeTurn(total, p);
    const w = turn.index === index ? turn.weight : 0;
    const dir = p < stop ? 1 : -1;
    return dir * (1 - w) * 32;
  });

  const scale = useTransform(weight, [0, 1], [0.975, 1]);
  const blurPx = useTransform(weight, [0, 1], [8, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  // Hidden panels must not intercept clicks meant for the visible one.
  const visibility = useTransform(weight, (w) =>
    w > 0.02 ? ('visible' as const) : ('hidden' as const),
  );

  return (
    <motion.div
      style={{ opacity: weight, y, scale, filter, visibility }}
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

/** Minimal progress line, visible only during the walk. */
function ProgressHairline({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(
    progress,
    [0.02, 0.07, 0.88, 0.93],
    [0, 1, 1, 0],
  );

  return (
    <motion.div
      aria-hidden
      style={{ opacity }}
      className="absolute bottom-8 left-1/2 h-px w-28 -translate-x-1/2 bg-ink/15"
    >
      <motion.div
        className="h-full origin-left bg-ink/60"
        style={{ scaleX: progress }}
      />
    </motion.div>
  );
}

function Closing({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.92, 0.98], [0, 1]);
  const y = useTransform(progress, [0.92, 0.98], [28, 0]);
  const blurPx = useTransform(progress, [0.92, 0.98], [8, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  const visibility = useTransform(opacity, (o) =>
    o > 0.02 ? ('visible' as const) : ('hidden' as const),
  );

  return (
    <motion.div
      style={{ opacity, y, filter, visibility }}
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

        <div className="mt-10 flex flex-col items-center gap-3 text-sm text-ink/70">
          <a
            href={`mailto:${STUDIO_EMAIL}`}
            className="transition-colors duration-500 ease-premium hover:text-ink"
          >
            {STUDIO_EMAIL}
          </a>
          <a
            href={STUDIO_INSTAGRAM}
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-500 ease-premium hover:text-ink"
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
