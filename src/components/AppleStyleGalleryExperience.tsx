import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Artwork } from '../types/artwork';
import { EditorialArtworkCard } from './EditorialArtworkCard';

interface AppleStyleGalleryExperienceProps {
  artwork: Artwork;
  total: number;
}

/**
 * Apple-product-page-style opening, built from three REAL fullscreen photos
 * animated by scroll (zoom + crossfade + parallax). No 3D, no gradient.
 *
 * Image paths are served from /public, so in the browser they MUST be referenced
 * from the web root — exactly:
 *   "/intro/01.jpg", "/intro/02.jpg", "/intro/03.jpg"
 * (never "public/intro/01.jpg", which Vite does not serve).
 */
const IMAGES = {
  facadeClosed: '/intro/01.jpg',
  facadeOpen: '/intro/02.jpg',
  interior: '/intro/03.jpg',
} as const;

const IMG_CLASS = 'absolute inset-0 h-full w-full object-cover';

function onImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  // Easy to diagnose: a missing file logs its exact URL (and 404s in Network).
  // eslint-disable-next-line no-console
  console.error('[intro] image failed to load:', e.currentTarget.src);
}

export function AppleStyleGalleryExperience({
  artwork,
  total,
}: AppleStyleGalleryExperienceProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // 01 — facade (closed): hold, slow zoom toward the doors, then dissolve
  const img1O = useTransform(p, [0, 0.28, 0.36], [1, 1, 0]);
  const img1S = useTransform(p, [0, 0.4], [1, 1.35]);

  // 02 — facade (open): crossfade in, keep zooming into the corridor
  const img2O = useTransform(p, [0.3, 0.4, 0.62, 0.7], [0, 1, 1, 0]);
  const img2S = useTransform(p, [0.3, 0.72], [1.05, 1.45]);

  // 03 — interior facing the artwork: settle from a slight zoom
  const img3O = useTransform(p, [0.66, 0.76], [0, 1]);
  const img3S = useTransform(p, [0.66, 1], [1.12, 1.0]);

  // Studio name over the facade
  const titleO = useTransform(p, [0, 0.12, 0.2], [1, 1, 0]);
  const titleY = useTransform(p, [0, 0.2], ['0%', '-18%']);
  const hintO = useTransform(p, [0, 0.1], [1, 0]);

  // Editorial card appears at the end, over image 03
  const cardO = useTransform(p, [0.82, 0.92], [0, 1]);
  const cardY = useTransform(p, [0.82, 0.92], [28, 0]);

  return (
    <section ref={ref} className="relative h-[400vh] bg-neutral-950">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.img
          src={IMAGES.facadeClosed}
          alt="Alice Moura Neves Studio — exterior facade"
          onError={onImgError}
          style={{ opacity: img1O, scale: img1S, transformOrigin: '50% 55%' }}
          className={IMG_CLASS}
        />
        <motion.img
          src={IMAGES.facadeOpen}
          alt="Gallery entrance with open doors"
          onError={onImgError}
          style={{ opacity: img2O, scale: img2S, transformOrigin: '50% 50%' }}
          className={IMG_CLASS}
        />
        <motion.img
          src={IMAGES.interior}
          alt="Gallery interior facing an artwork"
          onError={onImgError}
          style={{ opacity: img3O, scale: img3S, transformOrigin: '50% 48%' }}
          className={IMG_CLASS}
        />

        {/* Subtle overlay for legibility */}
        <div className="absolute inset-0 bg-black/10" />
        {/* Bottom scrim so the title reads over any photo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }}
        />

        {/* Studio name */}
        <motion.div
          style={{ opacity: titleO, y: titleY }}
          className="absolute inset-x-0 bottom-[22vh] flex flex-col items-center px-6 text-center"
        >
          <h1 className="font-serif text-4xl font-light tracking-tight text-white md:text-6xl">
            Alice Moura Neves
            <span className="mt-2 block text-xl tracking-editorial text-white/80 md:text-2xl">
              STUDIO
            </span>
          </h1>
        </motion.div>

        <motion.div
          style={{ opacity: hintO }}
          className="absolute bottom-9 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-editorial text-white/70"
        >
          <span className="block animate-pulse">Scroll to enter</span>
        </motion.div>

        {/* First artwork — editorial card */}
        <motion.div
          style={{ opacity: cardO, y: cardY }}
          className="absolute bottom-[10vh] left-6 md:left-16"
        >
          <EditorialArtworkCard artwork={artwork} index={0} total={total} />
        </motion.div>
      </div>
    </section>
  );
}
