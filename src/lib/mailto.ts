import type { Artwork } from '../types/artwork';

export const STUDIO_EMAIL = 'hello@alicemouranevesstudio.com';
export const STUDIO_INSTAGRAM = 'https://instagram.com/alicemouranevesstudio';

/**
 * Builds a `mailto:` link pre-filled with subject and body for an artwork
 * inquiry, exactly as specified by the studio.
 */
export function buildArtworkMailto(artwork: Artwork): string {
  const subject = artwork.emailSubject || `Inquiry about ${artwork.title}`;
  const body = [
    'Hello,',
    `I would like to know more about the artwork “${artwork.title}”.`,
    'Thank you.',
  ].join('\n');

  const params = new URLSearchParams({ subject, body });
  // URLSearchParams encodes spaces as "+"; email clients prefer %20.
  return `mailto:${STUDIO_EMAIL}?${params.toString().replace(/\+/g, '%20')}`;
}

/** Generic "contact the studio" mailto for the closing section. */
export function buildStudioMailto(): string {
  const params = new URLSearchParams({
    subject: 'Studio enquiry',
    body: 'Hello,\n\n',
  });
  return `mailto:${STUDIO_EMAIL}?${params.toString().replace(/\+/g, '%20')}`;
}
