import { useScroll } from 'framer-motion';
import { artworks } from './data/artworks';
import { GalleryCanvas } from './three/GalleryCanvas';
import { GalleryOverlay } from './components/GalleryOverlay';
import { IntroPhotos } from './components/IntroPhotos';

/** Total scroll length of the immersive walk, in viewport heights. */
const scrollHeightVh = 320 + artworks.length * 170;

/**
 * The desktop experience: a fixed WebGL hall behind a crisp HTML overlay, both
 * driven by one page-scroll progress value. Lazy-loaded so the three.js bundle
 * is only fetched when this experience is actually used.
 */
export default function ImmersiveGallery() {
  const { scrollYProgress } = useScroll();

  return (
    <main className="bg-canvas text-ink">
      <div className="fixed inset-0 z-0">
        <GalleryCanvas artworks={artworks} progress={scrollYProgress} />
      </div>

      {/* Photographic opening that dissolves into the 3D hall */}
      <IntroPhotos progress={scrollYProgress} />

      <GalleryOverlay artworks={artworks} progress={scrollYProgress} />

      {/* Transparent scroll track that gives the camera its travel length */}
      <div style={{ height: `${scrollHeightVh}vh` }} aria-hidden />
    </main>
  );
}
