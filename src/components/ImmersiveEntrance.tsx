import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Artwork } from '../types/artwork';
import { EditorialArtworkCard } from './EditorialArtworkCard';
import { PhotoLayer, SCENES, WARM_FALLBACK } from './PhotoLayer';

interface ImmersiveEntranceProps {
  artwork: Artwork;
  total: number;
}

/**
 * The cinematic opening, driven entirely by scroll over a tall sticky section:
 *
 *   0%   facade (closed doors) + studio name
 *   20%  slow zoom toward the doors
 *   35%  dissolve to the open doors
 *   50%  zoom into the entrance / corridor
 *   65%  dissolve to the interior, facing the first artwork
 *   80%  the view settles
 *   90%  the editorial card appears
 *   100% the request button is in view
 *
 * No 3D — just real photographs animated with zoom, crossfade and parallax.
 */
export function ImmersiveEntrance({ artwork, total }: ImmersiveEntranceProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // 01 — facade (closed): hold, slow zoom, then dissolve
  const o1 = useTransform(p, [0, 0.3, 0.38], [1, 1, 0]);
  const s1 = useTransform(p, [0, 0.4], [1, 1.42]);

  // 02 — facade (open): crossfade in, keep zooming into the corridor
  const o2 = useTransform(p, [0.32, 0.42, 0.58, 0.66], [0, 1, 1, 0]);
  const s2 = useTransform(p, [0.32, 0.7], [1.05, 1.55]);

  // 03 — interior facing the artwork: settle, then a breath of parallax
  const o3 = useTransform(p, [0.6, 0.7], [0, 1]);
  const s3 = useTransform(p, [0.6, 0.82, 1], [1.14, 1, 1.03]);
  const y3 = useTransform(p, [0.82, 1], ['0%', '-2%']);

  // Studio name over the facade
  const nameO = useTransform(p, [0, 0.16, 0.24], [1, 1, 0]);
  const nameY = useTransform(p, [0, 0.24], ['0%', '-22%']);
  const hintO = useTransform(p, [0, 0.12], [1, 0]);

  // Editorial card for the first artwork
  const cardO = useTransform(p, [0.82, 0.9], [0, 1]);
  const cardY = useTransform(p, [0.82, 0.9], [28, 0]);

  return (
    <section ref={ref} style={{ height: '600vh' }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden bg-canvas">
        {/* warm base behind the photos */}
        <div className="absolute inset-0" style={{ background: WARM_FALLBACK }} />

        <PhotoLayer src={SCENES.facadeClosed} opacity={o1} scale={s1} origin="50% 55%" />
        <PhotoLayer src={SCENES.facadeOpen} opacity={o2} scale={s2} origin="50% 50%" />
        <PhotoLayer src={SCENES.interior} opacity={o3} scale={s3} y={y3} origin="50% 48%" />

        {/* Studio name */}
        <motion.div
          style={{ opacity: nameO, y: nameY }}
          className="absolute inset-x-0 bottom-[20vh] flex flex-col items-center px-6 text-center"
        >
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[42vh] w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(247,245,241,0.45) 0%, rgba(247,245,241,0) 68%)',
            }}
          />
          <h1 className="relative font-serif text-4xl font-light leading-none tracking-tight text-ink md:text-6xl">
            Alice Moura Neves
            <span className="mt-2 block text-xl tracking-editorial text-ink/70 md:text-2xl">
              STUDIO
            </span>
          </h1>
        </motion.div>

        <motion.div
          style={{ opacity: hintO }}
          className="absolute bottom-9 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-editorial text-ink/60"
        >
          <span className="block animate-pulse">Scroll to enter</span>
        </motion.div>

        {/* First artwork — editorial card */}
        <motion.div
          style={{ opacity: cardO, y: cardY }}
          className="absolute bottom-[10vh] left-6 md:left-16"
        >
          <EditorialArtworkCard artwork={artwork} index={0} total={total} />
        </motion.div>
      </div>
    </section>
  );
}
