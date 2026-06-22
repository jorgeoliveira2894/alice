import { artworks } from './data/artworks';
import { useIsMobile } from './hooks/useIsMobile';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import ImmersiveExperience from './ImmersiveExperience';
import { MobileExperience } from './components/MobileExperience';

export default function App() {
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  // Phones and reduced-motion visitors get the calm vertical version.
  if (isMobile || reducedMotion) {
    return <MobileExperience artworks={artworks} reducedMotion={reducedMotion} />;
  }

  return <ImmersiveExperience artworks={artworks} />;
}
