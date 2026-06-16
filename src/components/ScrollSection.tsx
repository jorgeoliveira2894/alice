import { useRef, type ReactNode } from 'react';
import { useScroll, type MotionValue } from 'framer-motion';

interface ScrollSectionProps {
  /** Total scroll length of the section, in viewport heights. */
  heightVh?: number;
  /**
   * Render prop receiving a 0→1 progress value as the section scrolls past.
   * 0 = section top hits viewport top, 1 = section bottom hits viewport bottom.
   */
  children: (progress: MotionValue<number>) => ReactNode;
  id?: string;
}

/**
 * A tall scroll track with a sticky, full-height stage. The choreography of
 * each scene is driven entirely by the progress value handed to `children`.
 */
export function ScrollSection({
  heightVh = 260,
  children,
  id,
}: ScrollSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  return (
    <section
      ref={ref}
      id={id}
      style={{ height: `${heightVh}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {children(scrollYProgress)}
      </div>
    </section>
  );
}
