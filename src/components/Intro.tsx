import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface IntroProps {
  reducedMotion: boolean;
}

/**
 * Section 1 — the calm, editorial opening. The studio name sits centred on an
 * off-white field; as the visitor scrolls it drifts up and dissolves while a
 * faint room begins to take shape, suggesting the approach to the gallery.
 */
export function Intro({ reducedMotion }: IntroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const roomScale = useTransform(scrollYProgress, [0, 1], [0.9, 1.15]);
  const roomOpacity = useTransform(scrollYProgress, [0.2, 1], [0, 1]);

  if (reducedMotion) {
    return (
      <section className="flex h-screen flex-col items-center justify-center px-6 text-center">
        <Heading />
      </section>
    );
  }

  return (
    <section ref={ref} style={{ height: '200vh' }} className="relative">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Faint room forming behind the title */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{ scale: roomScale, opacity: roomOpacity }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 90% at 50% 40%, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 60%)',
            }}
          />
        </motion.div>

        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="relative px-6 text-center"
        >
          <Heading />
        </motion.div>

        <ScrollHint />
      </div>
    </section>
  );
}

function Heading() {
  return (
    <>
      <h1 className="font-serif text-5xl font-light leading-none tracking-tight text-ink md:text-7xl">
        Alice Moura Neves
        <span className="mt-2 block text-2xl tracking-editorial text-muted md:text-3xl">
          STUDIO
        </span>
      </h1>
      <p className="mt-8 text-xs uppercase tracking-editorial text-muted md:text-sm">
        Original artworks and visual explorations
      </p>
    </>
  );
}

function ScrollHint() {
  return (
    <motion.div
      className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-editorial text-muted"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      Scroll to enter
    </motion.div>
  );
}
