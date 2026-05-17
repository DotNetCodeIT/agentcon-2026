# Drop full-resolution photos here

- Files in this folder (`*.jpg`, `*.jpeg`, `*.png`, `*.webp`, `*.avif`, `*.gif`) are picked up by the photo gallery.
- Place matching thumbnails (same filename) under `thumbnails/`.
- The CI workflow regenerates `data/photos.json` on every push.

To preview locally:

```powershell
node ../scripts/generate-photos.mjs
```
