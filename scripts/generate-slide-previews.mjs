#!/usr/bin/env node
/**
 * Generate first-page preview PNGs for slide decks.
 *
 * Scans `slides/` for PDF and PPTX/PPT files and writes a thumbnail to
 * `slides/previews/<stem>.png` if it does not already exist.
 *
 * Requires: poppler-utils (pdftoppm) and libreoffice (soffice).
 * If a tool is missing or conversion fails, the script logs a warning
 * and continues — the front-end falls back to a gradient placeholder.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLIDES_DIR = path.join(ROOT, 'slides');
const PREVIEWS_DIR = path.join(SLIDES_DIR, 'previews');
const SUPPORTED = new Set(['.pdf', '.pptx', '.ppt', '.odp']);

function which(cmd) {
  const probe = spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'ignore' });
  return probe.status === 0;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function pdfToPng(pdfPath, outPng) {
  // pdftoppm writes <prefix>-1.png; use a temp prefix then rename.
  const tmpPrefix = path.join(os.tmpdir(), 'slide-preview-' + Date.now());
  execFileSync('pdftoppm', ['-png', '-r', '110', '-f', '1', '-l', '1', pdfPath, tmpPrefix], { stdio: 'inherit' });
  const produced = tmpPrefix + '-1.png';
  if (!fs.existsSync(produced)) throw new Error('pdftoppm produced no output for ' + pdfPath);
  fs.renameSync(produced, outPng);
}

function pptxToPdf(pptxPath, outDir) {
  execFileSync('soffice', ['--headless', '--convert-to', 'pdf', '--outdir', outDir, pptxPath], { stdio: 'inherit' });
  const base = path.basename(pptxPath, path.extname(pptxPath)) + '.pdf';
  const produced = path.join(outDir, base);
  if (!fs.existsSync(produced)) throw new Error('LibreOffice produced no PDF for ' + pptxPath);
  return produced;
}

function main() {
  if (!fs.existsSync(SLIDES_DIR)) {
    console.log('No slides/ directory — skipping preview generation.');
    return;
  }
  ensureDir(PREVIEWS_DIR);

  const hasPdftoppm = which('pdftoppm');
  const hasSoffice = which('soffice');

  const entries = fs.readdirSync(SLIDES_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && SUPPORTED.has(path.extname(e.name).toLowerCase()));

  let generated = 0, skipped = 0, failed = 0;

  for (const entry of entries) {
    const ext = path.extname(entry.name).toLowerCase();
    const stem = path.basename(entry.name, ext);
    const outPng = path.join(PREVIEWS_DIR, stem + '.png');
    if (fs.existsSync(outPng)) { skipped++; continue; }

    const input = path.join(SLIDES_DIR, entry.name);
    try {
      if (ext === '.pdf') {
        if (!hasPdftoppm) { console.warn('pdftoppm not found; skipping ' + entry.name); failed++; continue; }
        pdfToPng(input, outPng);
      } else {
        if (!hasSoffice || !hasPdftoppm) {
          console.warn('libreoffice/pdftoppm not found; skipping ' + entry.name);
          failed++; continue;
        }
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slide-conv-'));
        const pdf = pptxToPdf(input, tmpDir);
        pdfToPng(pdf, outPng);
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
      console.log('Generated ' + path.relative(ROOT, outPng));
      generated++;
    } catch (err) {
      console.warn('Failed to generate preview for ' + entry.name + ': ' + err.message);
      failed++;
    }
  }

  console.log(`Slide previews: ${generated} generated, ${skipped} cached, ${failed} failed.`);
}

main();
