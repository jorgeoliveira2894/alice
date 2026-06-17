import { motion } from 'framer-motion';
import { ContactButton } from './ContactButton';
import {
  STUDIO_EMAIL,
  STUDIO_INSTAGRAM,
  buildStudioMailto,
} from '../lib/mailto';

interface ContactSectionProps {
  reducedMotion: boolean;
}

/** Closing section — the visitor steps back out of the exhibition. */
export function ContactSection({ reducedMotion }: ContactSectionProps) {
  const fade = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-15%' },
        transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section
      id="contact"
      className="flex min-h-screen flex-col items-center justify-center px-6 py-32 text-center"
    >
      <motion.div {...fade} className="max-w-xl">
        <p className="mb-6 text-[11px] uppercase tracking-editorial text-muted">
          End of exhibition
        </p>
        <h2 className="font-serif text-4xl font-light leading-tight text-ink md:text-5xl">
          For enquiries, commissions
          <br />
          or available works
        </h2>

        <div className="mt-12 flex flex-col items-center gap-1 text-sm text-ink/70">
          <a
            href={`mailto:${STUDIO_EMAIL}`}
            className="inline-flex min-h-[44px] items-center px-2 transition-colors duration-500 ease-premium hover:text-ink"
          >
            {STUDIO_EMAIL}
          </a>
          <a
            href={STUDIO_INSTAGRAM}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[44px] items-center px-2 transition-colors duration-500 ease-premium hover:text-ink"
          >
            Instagram
          </a>
        </div>

        <div className="mt-12">
          <ContactButton href={buildStudioMailto()} variant="outline">
            Contact the studio
          </ContactButton>
        </div>

        <p className="mt-24 text-[11px] uppercase tracking-editorial text-muted/70">
          Alice Moura Neves Studio © {new Date().getFullYear()}
        </p>
      </motion.div>
    </section>
  );
}
