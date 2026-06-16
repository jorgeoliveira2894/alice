import type { Artwork } from '../types/artwork';
import { buildArtworkMailto } from '../lib/mailto';
import { ContactButton } from './ContactButton';

interface ArtworkInfoProps {
  artwork: Artwork;
  /** Index label shown as "01 — 04" */
  index: number;
  total: number;
  align?: 'left' | 'right';
}

/** A small editorial caption block describing one artwork. */
export function ArtworkInfo({
  artwork,
  index,
  total,
  align = 'left',
}: ArtworkInfoProps) {
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className={`max-w-xs ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <p className="mb-6 text-[11px] uppercase tracking-editorial text-muted">
        {pad(index + 1)} — {pad(total)}
      </p>

      <h2 className="font-serif text-4xl font-light leading-tight text-ink">
        {artwork.title}
      </h2>
      <p className="mt-1 font-serif text-lg italic text-muted">
        {artwork.year}
      </p>

      <p className="mt-6 text-sm font-light leading-relaxed text-ink/80">
        {artwork.description}
      </p>

      <dl
        className={`mt-8 space-y-2 text-xs text-muted ${
          align === 'right' ? 'items-end' : ''
        }`}
      >
        <div className="flex gap-3" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
          <dt className="uppercase tracking-wide text-muted/70">Technique</dt>
          <dd className="text-ink/70">{artwork.technique}</dd>
        </div>
        <div className="flex gap-3" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
          <dt className="uppercase tracking-wide text-muted/70">Dimensions</dt>
          <dd className="text-ink/70">{artwork.dimensions}</dd>
        </div>
        <div className="flex gap-3" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
          <dt className="uppercase tracking-wide text-muted/70">
            {artwork.available ? 'Price' : 'Status'}
          </dt>
          <dd className="text-ink/70">
            {artwork.available ? artwork.price : 'Not available'}
          </dd>
        </div>
      </dl>

      <div className={`mt-8 ${align === 'right' ? 'flex justify-end' : ''}`}>
        <ContactButton href={buildArtworkMailto(artwork)}>
          {artwork.available ? 'Request artwork' : 'Enquire'}
        </ContactButton>
      </div>
    </div>
  );
}
