import { useScroll, useSpring } from 'framer-motion';
import { artworks } from './data/artworks';
import { GalleryCanvas } from './three/GalleryCanvas';
import { GalleryOverlay } from './components/GalleryOverlay';

/** Total scroll length of the immersive walk, in viewport heights. */
const scrollHeightVh = 240 + artworks.length * 170;

/**
 * The desktop experience: a fixed WebGL hall behind a crisp HTML overlay, both
 * driven by one page-scroll progress value. Lazy-loaded so the three.js bundle
 * is only fetched when this experience is actually used.
 */
export default function ImmersiveGallery() {
  const { scrollYProgress } = useScroll();

  // Apple-style scrub: nothing tracks the wheel 1:1 — a critically-damped
  // spring absorbs scroll jolts so camera and captions glide.
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.4,
    restDelta: 0.0005,
  });

  return (
    <main className="bg-canvas text-ink">
      <div className="fixed inset-0 z-0">
        <GalleryCanvas artworks={artworks} progress={progress} />
      </div>

      <GalleryOverlay artworks={artworks} progress={progress} />

      {/* Transparent scroll track that gives the camera its travel length */}
      <div style={{ height: `${scrollHeightVh}vh` }} aria-hidden />
    </main>
  );
}
