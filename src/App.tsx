import { artworks } from './data/artworks';
import { useIsMobile } from './hooks/useIsMobile';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { Intro } from './components/Intro';
import { ScrollSection } from './components/ScrollSection';
import { GalleryEntrance } from './components/GalleryEntrance';
import { ArtworkScene } from './components/ArtworkScene';
import { ContactSection } from './components/ContactSection';
import { MobileGallery } from './components/MobileGallery';

export default function App() {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <main className="bg-canvas text-ink">
      <Intro reducedMotion={reducedMotion} />

      {isMobile ? (
        <MobileGallery artworks={artworks} reducedMotion={reducedMotion} />
      ) : (
        <>
          {/* Section 2 — entering the exhibition */}
          {!reducedMotion && (
            <ScrollSection heightVh={200}>
              {(progress) => <GalleryEntrance progress={progress} />}
            </ScrollSection>
          )}

          {/* Sections 3+ — one choreographed scene per artwork */}
          {artworks.map((artwork, index) => (
            <ScrollSection key={artwork.id} id={artwork.id}>
              {(progress) => (
                <ArtworkScene
                  artwork={artwork}
                  index={index}
                  total={artworks.length}
                  progress={progress}
                  reducedMotion={reducedMotion}
                />
              )}
            </ScrollSection>
          ))}
        </>
      )}

      {/* Closing section */}
      <ContactSection reducedMotion={reducedMotion} />
    </main>
  );
}
