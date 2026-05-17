# Slide previews

This folder holds first-page preview images for the decks under `slides/`.

They are **generated automatically** by the GitHub Actions workflow
(`scripts/generate-slide-previews.mjs`) using `pdftoppm` for PDFs and
LibreOffice + `pdftoppm` for PPTX/PPT/ODP. Naming convention:

```
slides/my-talk.pdf     -> slides/previews/my-talk.png
slides/intro-demo.pptx -> slides/previews/intro-demo.png
```

If a deck doesn't have a preview, the card falls back to a gradient badge
with the file extension. You can also override per-entry in
`data/slides.json` by setting a `preview` property to any image URL.

To generate previews locally (optional), install:

- [Poppler](https://poppler.freedesktop.org/) (`pdftoppm`)
- [LibreOffice](https://www.libreoffice.org/) (only needed for PPTX/PPT/ODP)

Then run:

```
node scripts/generate-slide-previews.mjs
```
