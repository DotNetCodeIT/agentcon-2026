# AgentCon Rome 2026

Photo gallery, schedule and slides for **AgentCon Rome 2026** — part of the [AgentCon World Tour](https://agentcon.dev/).

🌐 Live site: <https://dotnetcodeit.github.io/agentcon-2026/>

> [!TIP]
> This repo is also a **GitHub template** — see [Using this as a template for your event](#using-this-as-a-template-for-your-event) below.

## What's inside

- A single-page static site (no Jekyll) deployed via GitHub Pages.
- Event info, speakers, schedule, sponsors, **speaker slides** (with first-page preview and in-page viewer), and a photo gallery with lightbox.
- A multi-theme switcher (light / dark + accent palettes) inspired by the [Global AI Community](https://globalai.community/) look.
- Auto-generated photo manifest and slide previews (PDF / PPTX) at deploy time.
- All event copy driven by a single config file: [`data/event.json`](data/event.json).

## Project structure

```
.
├── index.html                       # template markup with data-event-* placeholders
├── assets/
│   ├── css/styles.css               # layout + components
│   ├── css/themes.css               # theme variables (light/dark + accents)
│   ├── js/main.js                   # event config + content rendering
│   ├── js/theme.js                  # theme + accent switcher (persisted)
│   ├── js/gallery.js                # lightbox + lazy load
│   └── img/                         # logo, hero artwork
├── data/
│   ├── event.json                   # ⭐ event-wide branding, hero, theme defaults
│   ├── speakers.json                # speakers
│   ├── schedule.json                # agenda
│   ├── sponsors.json                # sponsors
│   ├── slides.json                  # decks shared by speakers
│   └── photos.json                  # AUTO-GENERATED, do not edit by hand
├── photos/                          # full-size images (drop them here)
│   └── thumbnails/                  # matching thumbnails (same filename or *.thumb.*)
├── slides/                          # speaker decks (PDF / PPTX)
│   └── previews/                    # AUTO-GENERATED first-page PNGs
├── scripts/
│   ├── generate-photos.mjs          # builds data/photos.json
│   └── generate-slide-previews.mjs  # builds slides/previews/*.png
├── .github/workflows/deploy.yml     # GitHub Pages deploy
└── .nojekyll                        # disable Jekyll on GitHub Pages
```

## Using this as a template for your event

1. On GitHub, click **Use this template → Create a new repository** (or fork).
   To enable the button on your own copy: *Settings → General → Template repository*.
2. Edit [`data/event.json`](data/event.json) with your event's name, date, venue,
   eyebrow text, default theme, social/repo links, and which sections to show.
   That single file drives the page title, OG tags, brand, hero, footer, and
   the default theme/accent — no need to touch `index.html`.
3. Replace the content data:
   - [`data/speakers.json`](data/speakers.json)
   - [`data/schedule.json`](data/schedule.json)
   - [`data/sponsors.json`](data/sponsors.json)
   - [`data/slides.json`](data/slides.json) (start empty: `[]`)
4. Replace `assets/img/favicon.svg` (and optionally add `assets/img/og.png` for
   social previews; point `ogImage` in `event.json` at it).
5. In your new repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
6. Push to `main`. The workflow regenerates photo and slide previews and deploys.

### What `data/event.json` controls

| Key             | Used for                                                       |
| --------------- | -------------------------------------------------------------- |
| `name`          | `<title>`, OG title, footer                                    |
| `shortName`     | "voices behind …", footer copyright                            |
| `tagline` + `description` | hero lead paragraph, meta description           |
| `eyebrow`       | small text above the H1                                         |
| `titleParts`    | H1 split as `before <accent> after` (accent gets the highlight) |
| `date`, `time`  | "When" line in the hero                                         |
| `venue`, `address` | "Where" line in the hero                                     |
| `ogImage`       | Open Graph preview image path                                   |
| `repoUrl`, `parentEvent` | footer links                                          |
| `aboutHtml`     | Array of paragraphs (HTML allowed) for the About section        |
| `theme.mode`    | Default `light` or `dark` (visitor can override)                |
| `theme.accent`  | Default accent: `purple`, `teal`, `blue`, or `orange`           |
| `sections`      | Per-section visibility flags                                    |

### Hiding sections

Set any section to `false` in `data/event.json` to hide both the nav link and
the section itself:

```json
"sections": {
  "about": true,
  "speakers": true,
  "schedule": true,
  "slides": false,
  "photos": false,
  "sponsors": true
}
```

Useful before the event (hide Photos) or for editions without sponsors.

## Adding photos

1. Copy full-resolution images into `photos/`.
2. Either:
   - drop a thumbnail in `photos/thumbnails/` with the same filename, **or**
   - drop a sibling `name.thumb.ext` next to the original.
3. Commit and push — the GitHub Action regenerates `data/photos.json`.

To preview locally:

```powershell
node scripts/generate-photos.mjs
npx serve .
```

## Adding speaker slides

1. Drop the deck in `slides/` — **PDF** (recommended) or **PPTX/PPT/ODP**.
2. Add an entry to `data/slides.json`:

   ```json
   {
     "title": "Talk title",
     "speaker": "Speaker Name",
     "file": "slides/talk-title.pdf",
     "url": "",
     "preview": "",
     "description": "Optional one-line description.",
     "tags": ["foundry"]
   }
   ```

   Use `url` instead of (or in addition to) `file` for externally hosted decks.

3. Push. CI generates a first-page preview at `slides/previews/<stem>.png`.
   Clicking the thumbnail opens the deck in-page (PDFs inline, PPTX through the
   Office Online viewer — requires the file to be publicly reachable, which it
   is on GitHub Pages).

## Theming

Themes live in [`assets/css/themes.css`](assets/css/themes.css). The switcher
in the navbar toggles **light** ↔ **dark** and four accent palettes
(purple, teal, blue, orange). Selection is persisted per visitor in
`localStorage`; the initial defaults come from `theme` in `event.json`.

To add a new accent, copy an existing `html[data-accent="…"]` block in
`themes.css` and add a matching swatch button in `index.html`.

## License

Code: MIT. Photos, slides and event branding © their respective owners.
