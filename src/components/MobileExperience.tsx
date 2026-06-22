import { motion } from 'framer-motion';
import type { Artwork } from '../types/artwork';
import { EditorialArtworkCard } from './EditorialArtworkCard';
import { ContactSection } from './ContactSection';
import { SCENES, WARM_FALLBACK } from './PhotoLayer';

interface MobileExperienceProps {
  artworks: Artwork[];
  reducedMotion: boolean;
}

/**
 * Mobile / reduced-motion experience: a calm vertical scroll of stacked
 * full-bleed photographs and editorial cards — same story, no zoom or 3D.
 */
export function MobileExperience({ artworks, reducedMotion }: MobileExperienceProps) {
  const fade = (delay = 0) =>
    reducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-12%' },
          transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <main className="bg-canvas text-ink">
      {/* Opening — facade with the studio name */}
      <section className="relative flex h-[88vh] flex-col items-center justify-end overflow-hidden pb-16">
        <div className="absolute inset-0" style={{ background: WARM_FALLBACK }} />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${SCENES.facadeClosed})` }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{ background: 'linear-gradient(to top, rgba(247,245,241,0.7), transparent)' }}
        />
        <h1 className="relative px-6 text-center font-serif text-4xl font-light leading-none tracking-tight text-ink">
          Alice Moura Neves
          <span className="mt-2 block text-lg tracking-editorial text-ink/70">STUDIO</span>
        </h1>
      </section>

      {/* The doorway opening */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0" style={{ background: WARM_FALLBACK }} />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${SCENES.facadeOpen})` }}
        />
      </section>

      {/* Each artwork: framed work + editorial card */}
      {artworks.map((artwork, i) => (
        <motion.section
          key={artwork.id}
          {...fade()}
          className="relative flex flex-col items-center gap-8 px-6 py-20"
        >
          <figure className="m-0 bg-paper p-3 shadow-[0_30px_60px_-25px_rgba(40,32,22,0.45)]">
            <img
              src={artwork.image}
              alt={artwork.title}
              loading="lazy"
              decoding="async"
              className="block max-h-[56vh] w-auto object-contain"
            />
          </figure>
          <EditorialArtworkCard artwork={artwork} index={i} total={artworks.length} />
        </motion.section>
      ))}

      <ContactSection reducedMotion={reducedMotion} />
    </main>
  );
}
