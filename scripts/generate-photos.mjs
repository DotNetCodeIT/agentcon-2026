// Generate data/photos.json from the contents of photos/ and photos/thumbnails/.
// Run locally (`node scripts/generate-photos.mjs`) or in CI before deploy.
//
// Thumbnail resolution, in priority order:
//   1. photos/<basename>.thumb.<ext>          (sibling, e.g. DSC03403.thumb.jpg)
//   2. photos/thumbnails/<basename>.thumb.<ext>
//   3. photos/thumbnails/<original-filename>  (same name as the full image)
//   4. fall back to the full image
//
// Any file matching *.thumb.* anywhere is treated as a thumbnail, not a photo.

import { readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const ROOT = process.cwd();
const PHOTOS_DIR = join(ROOT, 'photos');
const THUMBS_DIR = join(PHOTOS_DIR, 'thumbnails');
const OUTPUT = join(ROOT, 'data', 'photos.json');
const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

function isImage(name) {
  return EXT.has(extname(name).toLowerCase());
}

function isThumbName(name) {
  return /\.thumb\.[^.]+$/i.test(name);
}

function stem(name) {
  return basename(name, extname(name));
}

async function listFiles(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isFile() && isImage(e.name)).map((e) => e.name);
}

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function indexThumbs(siblingFiles, thumbFiles) {
  const map = new Map();

  for (const name of siblingFiles) {
    if (!isThumbName(name)) continue;
    const photoStem = stem(stem(name));
    map.set(photoStem, `photos/${encodeURIComponent(name)}`);
  }

  for (const name of thumbFiles) {
    if (!isThumbName(name)) continue;
    const photoStem = stem(stem(name));
    if (!map.has(photoStem)) {
      map.set(photoStem, `photos/thumbnails/${encodeURIComponent(name)}`);
    }
  }

  for (const name of thumbFiles) {
    if (isThumbName(name)) continue;
    const photoStem = stem(name);
    if (!map.has(photoStem)) {
      map.set(photoStem, `photos/thumbnails/${encodeURIComponent(name)}`);
    }
  }

  return map;
}

async function main() {
  const siblingFiles = await listFiles(PHOTOS_DIR);
  const thumbFiles = await listFiles(THUMBS_DIR);

  const fulls = siblingFiles.filter((n) => !isThumbName(n)).sort(naturalSort);
  const thumbIndex = indexThumbs(siblingFiles, thumbFiles);

  const photos = fulls.map((name) => {
    const src = `photos/${encodeURIComponent(name)}`;
    const thumb = thumbIndex.get(stem(name)) || src;
    return { src, thumb, caption: stem(name) };
  });

  const payload = { generatedAt: new Date().toISOString(), count: photos.length, photos };
  await writeFile(OUTPUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${photos.length} photos to ${OUTPUT}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
