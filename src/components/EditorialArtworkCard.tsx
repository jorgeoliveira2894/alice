import type { Artwork } from '../types/artwork';
import { buildArtworkMailto } from '../lib/mailto';
import { ContactButton } from './ContactButton';

interface EditorialArtworkCardProps {
  artwork: Artwork;
  index?: number;
  total?: number;
  className?: string;
}

/**
 * The editorial caption that floats over a gallery photo: title, year,
 * technique, dimensions, price and a mailto "Request artwork" button.
 * A soft translucent panel keeps it legible over any photograph while staying
 * quiet and premium. Always real, accessible HTML — never drawn in canvas.
 */
export function EditorialArtworkCard({
  artwork,
  index,
  total,
  className = '',
}: EditorialArtworkCardProps) {
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className={`w-[min(86vw,360px)] bg-[rgba(248,246,242,0.74)] p-7 backdrop-blur-md ${className}`}
    >
      {index != null && total != null && (
        <p className="mb-5 text-[11px] uppercase tracking-editorial text-muted">
          {pad(index + 1)} — {pad(total)}
        </p>
      )}

      <h2 className="font-serif text-3xl font-light leading-tight text-ink">
        {artwork.title}
      </h2>
      <p className="mt-1 font-serif text-base italic text-muted">{artwork.year}</p>

      <dl className="mt-6 space-y-2 text-xs text-ink/75">
        <Row label="Technique" value={artwork.technique} />
        <Row label="Dimensions" value={artwork.dimensions} />
        <Row
          label={artwork.available ? 'Price' : 'Status'}
          value={artwork.available ? artwork.price : 'Not available'}
        />
      </dl>

      <div className="mt-7">
        <ContactButton href={buildArtworkMailto(artwork)}>
          {artwork.available ? 'Request artwork' : 'Enquire'}
        </ContactButton>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6">
      <dt className="uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
