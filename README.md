# Alice Moura Neves Studio

An immersive, editorial digital exhibition. Instead of a traditional landing
page, the visitor *walks into a gallery*: the studio name appears on a calm
off-white field, then they step through a doorway into a tall hall of burnt-white
microcement, and a continuous camera glides down the corridor — easing to a stop
beside each artwork to reveal its details — before reaching a quiet contact card.

## Technical approach — a real 3D hall (React Three Fiber)

The desktop experience is a genuine 3D space: a long microcement corridor with
the artworks mounted on the left and right walls, lit as a contemporary gallery.
A single page-scroll value drives a camera that walks forward through the hall,
turning its head to face each piece as it arrives. The 3D scene is rendered with
**React Three Fiber / three.js**; the captions and UI are kept as a **crisp HTML
overlay** floating above the canvas, so the editorial typography stays sharp and
all `mailto:` links and accessibility remain intact.

One scroll value (`framer-motion`'s `useScroll`) feeds **both** the camera rig
(inside the canvas) and the HTML overlay, so movement and captions stay perfectly
in sync without two competing scroll systems.

### Performance & fallbacks

- The heavy three.js bundle is **lazy-loaded** — only fetched for the immersive
  path, never by fallback visitors.
- **Mobile, weak devices (no WebGL), and `prefers-reduced-motion`** get a calm,
  vertical HTML gallery instead — no WebGL at all.
- Soft shadows, capped DPR, atmospheric fog, and a single shadow-casting light
  keep the scene light.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- React Three Fiber + three.js + @react-three/drei (the 3D hall)
- Framer Motion (the shared scroll-progress driver)

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
│   ├── App.tsx                # picks immersive vs fallback; lazy-loads 3D
│   ├── ImmersiveGallery.tsx   # desktop: canvas + overlay + scroll track
│   ├── main.tsx
│   ├── index.css              # Tailwind base + tokens
│   ├── data/
│   │   └── artworks.ts        # ← the exhibition (edit this to add works)
│   ├── types/
│   │   └── artwork.ts
│   ├── lib/
│   │   ├── mailto.ts          # pre-filled inquiry emails
│   │   └── webgl.ts           # capability detection for the fallback
│   ├── hooks/
│   │   ├── useIsMobile.ts
│   │   └── usePrefersReducedMotion.ts
│   ├── three/                 # the WebGL hall
│   │   ├── GalleryCanvas.tsx  #     <Canvas>, lights setup, fog, tone mapping
│   │   ├── Hall.tsx           #     microcement floor/ceiling/walls + doorway
│   │   ├── ArtworkFrame3D.tsx #     one framed, spotlit artwork on a wall
│   │   ├── CameraRig.tsx      #     walks the camera from scroll progress
│   │   └── layout.ts          #     hall geometry + camera keyframe math
│   └── components/
│       ├── GalleryOverlay.tsx # crisp HTML: intro, captions, closing card
│       ├── Intro.tsx          # title block (also used by the fallback)
│       ├── ArtworkInfo.tsx    #     editorial caption + request button
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

- **`prefers-reduced-motion`** — falls back to a static, fully readable gallery.
- **Mobile / no-WebGL** — a calmer vertical HTML scroll replaces the 3D walk.
- **Lazy 3D** — the three.js bundle is code-split and only loaded when needed.
- **Tuned scene** — capped DPR, fog, soft shadows, one shadow-casting light.
