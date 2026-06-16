interface GalleryPathProps {
  /** Tints the floor/wall slightly to vary the corridor between scenes. */
  tone?: 'light' | 'lighter';
}

/**
 * The exhibition architecture: a back wall, a floor that recedes toward a
 * vanishing point, and soft contact shadows. Purely decorative; it sits behind
 * the artwork to create the sense of a physical room.
 */
export function GalleryPath({ tone = 'light' }: GalleryPathProps) {
  const wall = tone === 'light' ? '#efedea' : '#f2f0ed';

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Back wall */}
      <div className="absolute inset-0" style={{ background: wall }} />

      {/* Soft top-down light wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 55%)',
        }}
      />

      {/* Floor receding to a vanishing point */}
      <div
        className="absolute inset-x-0 bottom-0 h-[34%]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.015) 30%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* Wall/floor seam */}
      <div
        className="absolute inset-x-0"
        style={{
          bottom: '34%',
          height: '1px',
          background:
            'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* Edge vignette to focus the centre */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 220px rgba(0,0,0,0.05)',
        }}
      />
    </div>
  );
}
