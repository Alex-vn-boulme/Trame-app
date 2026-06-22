#!/usr/bin/env node
// Generate PWA icons + iOS splash screens from the source SVG with sharp.
//
// Deterministic, no Chromium. Produces EXACTLY the files referenced by
// src/app/manifest.ts and src/app/layout.tsx. Run from the project root:
//   pnpm icons
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "scripts/icon-source.svg");
const ICONS_DIR = join(ROOT, "public/icons");
const SPLASH_DIR = join(ROOT, "public/splash");
const BG = "#f5f2ea"; // cream — design system §4

// Plain (non-rounded) icons rendered straight from the source SVG. The SVG
// already carries the cream rounded-rect background, so "any"-purpose icons
// and the Apple touch icon just need a resize.
const PLAIN_ICONS = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-256.png", size: 256 },
  { name: "icon-384.png", size: 384 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "badge-72.png", size: 72 },
];

// Apple splash screens referenced (without media queries) in layout.tsx.
const SPLASH = [
  { name: "apple-splash-1290-2796.png", width: 1290, height: 2796 },
  { name: "apple-splash-1179-2556.png", width: 1179, height: 2556 },
  { name: "apple-splash-1170-2532.png", width: 1170, height: 2532 },
];

const hexToRgb = (hex) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
  alpha: 1,
});

async function main() {
  const svg = await readFile(SRC);
  await mkdir(ICONS_DIR, { recursive: true });
  await mkdir(SPLASH_DIR, { recursive: true });
  const written = [];

  // 1. Plain icons + apple-touch + badge.
  for (const { name, size } of PLAIN_ICONS) {
    await sharp(svg, { density: 384 })
      .resize(size, size, { fit: "contain", background: BG })
      .flatten({ background: BG })
      .png()
      .toFile(join(ICONS_DIR, name));
    written.push(`icons/${name} (${size}×${size})`);
  }

  // 2. Maskable: icon scaled to ~80% (safe zone) centered on a full cream square.
  const MASK = 512;
  const inner = Math.round(MASK * 0.8);
  const innerPng = await sharp(svg, { density: 384 }).resize(inner, inner).png().toBuffer();
  await sharp({
    create: { width: MASK, height: MASK, channels: 4, background: hexToRgb(BG) },
  })
    .composite([{ input: innerPng, gravity: "center" }])
    .png()
    .toFile(join(ICONS_DIR, "icon-maskable-512.png"));
  written.push(`icons/icon-maskable-512.png (${MASK}×${MASK}, maskable)`);

  // 3. Splash screens: icon (~30% of width) centered on a cream canvas.
  for (const { name, width, height } of SPLASH) {
    const iconSize = Math.round(width * 0.3);
    const iconPng = await sharp(svg, { density: 384 }).resize(iconSize, iconSize).png().toBuffer();
    await sharp({
      create: { width, height, channels: 4, background: hexToRgb(BG) },
    })
      .composite([{ input: iconPng, gravity: "center" }])
      .png()
      .toFile(join(SPLASH_DIR, name));
    written.push(`splash/${name} (${width}×${height})`);
  }

  console.log("✓ PWA assets generated:");
  for (const line of written) console.log("  •", line);
}

main().catch((err) => {
  console.error("✗ PWA asset generation failed:", err);
  process.exit(1);
});
