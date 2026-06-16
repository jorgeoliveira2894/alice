import { motion } from 'framer-motion';
import type { Artwork } from '../types/artwork';
import { ArtworkInfo } from './ArtworkInfo';

interface MobileGalleryProps {
  artworks: Artwork[];
  reducedMotion: boolean;
}

/**
 * Mobile experience: the cinematic 3D walk is replaced by a calm, vertical
 * scroll of stacked works. Lighter on the GPU, easier to read on a phone.
 */
export function MobileGallery({ artworks, reducedMotion }: MobileGalleryProps) {
  return (
    <div className="px-6">
      {artworks.map((artwork, i) => {
        const anim = reducedMotion
          ? {}
          : {
              initial: { opacity: 0, y: 30 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: '-10%' },
              transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
            };

        return (
          <motion.article
            key={artwork.id}
            {...anim}
            className="flex min-h-screen flex-col items-center justify-center gap-8 py-16"
          >
            <figure className="bg-paper p-3 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.3)]">
              <img
                src={artwork.image}
                alt={artwork.title}
                loading="lazy"
                decoding="async"
                className="block max-h-[55vh] w-auto object-cover"
              />
            </figure>
            <ArtworkInfo
              artwork={artwork}
              index={i}
              total={artworks.length}
              align="left"
            />
          </motion.article>
        );
      })}
    </div>
  );
}
