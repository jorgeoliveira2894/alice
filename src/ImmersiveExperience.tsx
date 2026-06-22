import type { Artwork } from './types/artwork';
import { AppleStyleGalleryExperience } from './components/AppleStyleGalleryExperience';
import { ArtworkMoment } from './components/ArtworkMoment';
import { ContactSection } from './components/ContactSection';

interface ImmersiveExperienceProps {
  artworks: Artwork[];
}

/**
 * The desktop experience: a photographic, scroll-driven walk into the
 * exhibition. The opening sequence (facade → doorway → interior) flows into the
 * first artwork, then each further work gets its own quiet "moment", closing on
 * the contact section. Entirely image-based — no 3D.
 */
export default function ImmersiveExperience({ artworks }: ImmersiveExperienceProps) {
  const [first, ...rest] = artworks;

  return (
    <main className="bg-canvas text-ink">
      <AppleStyleGalleryExperience artwork={first} total={artworks.length} />

      {rest.map((artwork, i) => (
        <ArtworkMoment
          key={artwork.id}
          artwork={artwork}
          index={i + 1}
          total={artworks.length}
        />
      ))}

      <ContactSection reducedMotion={false} />
    </main>
  );
}
