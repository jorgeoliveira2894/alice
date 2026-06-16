import type { Artwork } from '../types/artwork';

/**
 * The exhibition. Each entry becomes one scene in the gallery walk.
 *
 * To add a new artwork:
 *   1. Drop the image in /public/artworks/ (any web format: svg, jpg, webp…).
 *   2. Add an object below with a unique `id`.
 *   3. That's it — the scene, scroll choreography and contact button are
 *      generated automatically.
 */
export const artworks: Artwork[] = [
  {
    id: 'silent-form',
    title: 'Silent Form',
    year: 2024,
    image: '/artworks/silent-form.svg',
    technique: 'Oil and graphite on linen',
    dimensions: '120 × 90 cm',
    description:
      'A study in stillness — where presence is suggested rather than stated, and the eye is left to complete the gesture.',
    price: '€ 2 800',
    available: true,
    emailSubject: 'Inquiry about Silent Form',
  },
  {
    id: 'body-of-light',
    title: 'Body of Light',
    year: 2024,
    image: '/artworks/body-of-light.svg',
    technique: 'Acrylic and pigment on canvas',
    dimensions: '150 × 110 cm',
    description:
      'Light treated as matter. Soft fields dissolve into one another, holding a quiet warmth at their centre.',
    price: '€ 3 400',
    available: true,
    emailSubject: 'Inquiry about Body of Light',
  },
  {
    id: 'between-walls',
    title: 'Between Walls',
    year: 2023,
    image: '/artworks/between-walls.svg',
    technique: 'Mixed media on board',
    dimensions: '100 × 100 cm',
    description:
      'An interior architecture of thresholds — the narrow spaces we pass through without noticing.',
    price: 'On request',
    available: false,
    emailSubject: 'Inquiry about Between Walls',
  },
  {
    id: 'soft-tension',
    title: 'Soft Tension',
    year: 2025,
    image: '/artworks/soft-tension.svg',
    technique: 'Charcoal and wash on paper',
    dimensions: '90 × 70 cm',
    description:
      'A balance held lightly. Two forms lean toward one another, neither resolving nor letting go.',
    price: '€ 1 900',
    available: true,
    emailSubject: 'Inquiry about Soft Tension',
  },
];
