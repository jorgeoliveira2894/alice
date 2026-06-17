# Third-party assets

All bundled 3D assets are **CC0 (public domain)** — free for commercial use, no
attribution required. Credited here as a courtesy.

| Asset | File | Source | License |
|-------|------|--------|---------|
| Concrete PBR (colour / normal / roughness) | `textures/concrete/*.jpg` | ambientCG — *Concrete034* | CC0 |
| Studio HDRI (image-based lighting) | `hdri/studio_1k.hdr` | Poly Haven — *photo_studio_01* | CC0 |

To swap the concrete: replace the three JPGs in `textures/concrete/` (keep the
filenames). To change the lighting mood: replace `hdri/studio_1k.hdr` with any
other `.hdr` and update the path in `src/three/GalleryCanvas.tsx`.
