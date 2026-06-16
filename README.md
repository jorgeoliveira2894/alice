# Alice Moura Neves Studio

An immersive, editorial digital exhibition. Instead of a traditional landing
page, the visitor *walks into a gallery*: the studio name appears on a calm
off-white field, then the camera moves into the space, turns toward each
artwork, zooms in, reveals its details, and recedes before walking on to the
next work — finishing at a quiet contact section.

## Technical approach — pseudo-3D, not WebGL

Three approaches were considered:

1. **Real 3D (React Three Fiber / Three.js)** — true camera, but heavy on the
   GPU, poor for crisp editorial typography, harder for accessibility, SEO and
   `mailto:` links, and demanding to make robust on weak devices.
2. **Pseudo-3D (CSS `perspective` / `translateZ` / `rotateY` + scroll-linked
   parallax)** — lightweight, keeps text as real DOM (sharp and editorial),
   trivial `prefers-reduced-motion` and lazy-loading, runs anywhere.
3. **Hybrid.**

**Chosen: a pseudo-3D base (approach 2/3).** The "Apple feel" of the reference
sites comes from *pinned scroll sections and refined easing*, not from real 3D.
A room built with CSS `perspective` + `rotateY` + `scale`, driven by scroll,
delivers the "enter the space and approach the work" sensation with excellent
performance. React Three Fiber is deliberately **not** included in this first
version; the architecture isolates the 3D illusion inside `ArtworkScene`, so it
can be swapped for an R3F implementation later without touching the rest.

**Animation engine:** [Framer Motion](https://www.framer.com/motion/)
(`useScroll` + `useTransform` + sticky sections) — idiomatic in React and avoids
running two competing scroll systems.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Framer Motion (scroll-linked animation)

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Project structure

```
.
├── index.html                 # fonts + root
├── public/
│   └── artworks/              # artwork images (replaceable placeholders)
├── src/
│   ├── App.tsx                # composes the narrative; desktop vs mobile
│   ├── main.tsx
│   ├── index.css              # Tailwind + 3D-stage utilities
│   ├── data/
│   │   └── artworks.ts        # ← the exhibition (edit this to add works)
│   ├── types/
│   │   └── artwork.ts
│   ├── lib/
│   │   └── mailto.ts          # pre-filled inquiry emails
│   ├── hooks/
│   │   ├── useIsMobile.ts
│   │   └── usePrefersReducedMotion.ts
│   └── components/
│       ├── Intro.tsx          # §1  name, fades up on scroll
│       ├── GalleryEntrance.tsx# §2  travel into the space
│       ├── ScrollSection.tsx  #     tall track + sticky stage + progress
│       ├── ArtworkScene.tsx   # §3+ approach → zoom → info → recede
│       ├── ArtworkInfo.tsx    #     editorial caption + request button
│       ├── GalleryPath.tsx    #     wall / floor / vanishing-point room
│       ├── ContactButton.tsx  #     discreet mailto CTA
│       ├── ContactSection.tsx # §final
│       └── MobileGallery.tsx  #     simplified vertical experience
```

## Adding a new artwork

1. Add the image to `public/artworks/` (svg, jpg, webp…).
2. Append an object to the array in `src/data/artworks.ts`:

```ts
{
  id: 'new-work',
  title: 'New Work',
  year: 2025,
  image: '/artworks/new-work.jpg',
  technique: 'Oil on canvas',
  dimensions: '100 × 80 cm',
  description: 'A short, elegant line about the work.',
  price: '€ 2 000',           // or 'On request'
  available: true,
  emailSubject: 'Inquiry about New Work',
}
```

A new choreographed scene (and its contact button) is generated automatically —
no other changes needed. Scenes alternate walking direction and caption side by
index.

## Email behaviour

Each artwork's button opens the visitor's mail client to
`hello@alicemouranevesstudio.com`, with:

- **Subject:** `Inquiry about <title>`
- **Body:**
  ```
  Hello,
  I would like to know more about the artwork "<title>".
  Thank you.
  ```

## Performance & accessibility

- **`prefers-reduced-motion`** — scenes render static, with all info visible.
- **Mobile** — a calmer vertical scroll replaces the 3D walk.
- **Lazy images** — `loading="lazy"` + `decoding="async"`.
- **Lightweight** — CSS transforms only; no WebGL bundle.
```
