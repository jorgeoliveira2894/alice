import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Artwork } from '../types/artwork';
import { EditorialArtworkCard } from './EditorialArtworkCard';
import { PhotoLayer, SCENES, WARM_FALLBACK } from './PhotoLayer';

interface ArtworkMomentProps {
  artwork: Artwork;
  index: number;
  total: number;
}

/**
 * One artwork "moment": the gallery interior as a soft photographic backdrop,
 * the work presented framed and lit at centre with a subtle zoom/parallax, and
 * an editorial card that fades in with scroll. Photographic, calm, not 3D.
 */
export function ArtworkMoment({ artwork, index, total }: ArtworkMomentProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const cardOnLeft = index % 2 === 1;

  // Backdrop drifts slowly (parallax)
  const bgScale = useTransform(p, [0, 1], [1.08, 1.18]);

  // The framed work eases in and breathes
  const artOpacity = useTransform(p, [0.08, 0.24], [0, 1]);
  const artScale = useTransform(p, [0, 0.5, 1], [0.94, 1, 1.05]);
  const artY = useTransform(p, [0, 1], ['2%', '-3%']);

  // Editorial card
  const cardO = useTransform(p, [0.26, 0.4, 0.82, 0.95], [0, 1, 1, 0]);
  const cardY = useTransform(p, [0.26, 0.4], [28, 0]);

  return (
    <section ref={ref} style={{ height: '320vh' }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden bg-canvas">
        <div className="absolute inset-0" style={{ background: WARM_FALLBACK }} />

        {/* Gallery interior as a soft, slightly blurred backdrop */}
        <PhotoLayer src={SCENES.interior} scale={bgScale} blur={7} origin="50% 50%" />
        <div className="absolute inset-0 bg-canvas/35" />

        {/* The work, framed and centred with a warm halo */}
        <motion.figure
          style={{ opacity: artOpacity, scale: artScale, y: artY }}
          className="absolute inset-0 m-0 flex items-center justify-center"
        >
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-10 -z-10"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(255,248,236,0.85) 0%, rgba(255,248,236,0) 70%)',
              }}
            />
            <div className="bg-paper p-3 shadow-[0_40px_90px_-30px_rgba(40,32,22,0.5)]">
              <img
                src={artwork.image}
                alt={artwork.title}
                loading="lazy"
                decoding="async"
                className="block max-h-[58vh] w-auto object-contain"
              />
            </div>
          </div>
        </motion.figure>

        {/* Editorial card */}
        <motion.div
          style={{ opacity: cardO, y: cardY }}
          className={`absolute bottom-[12vh] ${cardOnLeft ? 'left-6 md:left-16' : 'right-6 md:right-16'}`}
        >
          <EditorialArtworkCard artwork={artwork} index={index} total={total} />
        </motion.div>
      </div>
    </section>
  );
}
