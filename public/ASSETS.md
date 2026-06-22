# Third-party assets

All bundled 3D assets are **CC0 (public domain)** — free for commercial use, no
attribution required. Credited here as a courtesy.

| Asset | File | Source | License |
|-------|------|--------|---------|
| Lime-plaster PBR (walls/ceiling) | `textures/plaster/*.jpg` | ambientCG — *Plaster003* | CC0 |
| Travertine PBR (floor) | `textures/travertine/*.jpg` | ambientCG — *Travertine006* | CC0 |
| Warm studio HDRI (image-based lighting) | `hdri/studio_warm_1k.hdr` | Poly Haven — *brown_photostudio_02* | CC0 |

To swap a material: replace the JPGs in the relevant `textures/<name>/` folder
(keep the filenames). To change the lighting mood: replace the `.hdr` and update
the path in `src/three/GalleryCanvas.tsx`.

## Intro photography (not yet bundled)

The opening sequence is designed to use two photographs (exterior facade →
corridor through the doorway). Drop them in `intro/` as `01.jpg` and `02.jpg`.
⚠️ Only use photos you own or have a licence for — the reference images shared in
chat appear to be professional architecture photography and are **not** CC0.
