export interface Artwork {
  /** Unique identifier, also used as a DOM/section key */
  id: string;
  title: string;
  year: number;
  /** Path under /public (e.g. "/artworks/silent-form.svg") */
  image: string;
  technique: string;
  /** Human-readable dimensions, e.g. "120 × 90 cm" */
  dimensions: string;
  /** Short, elegant description */
  description: string;
  /** Display price, e.g. "€ 2 400" or "On request" */
  price: string;
  available: boolean;
  /** Pre-filled subject line for the mailto inquiry */
  emailSubject: string;
}
