import { Suspense, lazy, useState } from 'react';
import { artworks } from './data/artworks';
import { useIsMobile } from './hooks/useIsMobile';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { hasWebGL } from './lib/webgl';
import { Intro } from './components/Intro';
import { MobileGallery } from './components/MobileGallery';
import { ContactSection } from './components/ContactSection';

// Lazy so the heavy three.js bundle only loads for the immersive path.
const ImmersiveGallery = lazy(() => import('./ImmersiveGallery'));

export default function App() {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();
  const [webgl] = useState(hasWebGL);

  // Lightweight, accessible fallback: no WebGL on phones, weak devices, or when
  // the visitor prefers reduced motion.
  if (isMobile || reducedMotion || !webgl) {
    return (
      <main className="bg-canvas text-ink">
        <Intro reducedMotion={reducedMotion} />
        <MobileGallery artworks={artworks} reducedMotion={reducedMotion} />
        <ContactSection reducedMotion={reducedMotion} />
      </main>
    );
  }

  return (
    <Suspense fallback={<LoadingVeil />}>
      <ImmersiveGallery />
    </Suspense>
  );
}

/** Calm off-white screen shown while the exhibition loads. */
function LoadingVeil() {
  return (
    <div className="flex h-screen items-center justify-center bg-canvas">
      <p className="font-serif text-xl font-light italic text-muted">
        Entering the exhibition…
      </p>
    </div>
  );
}
