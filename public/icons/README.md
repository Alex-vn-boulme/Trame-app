# PWA icons

Generated assets — do **not** hand-edit. Regenerate from the source SVG with:

```bash
pnpm icons   # → node scripts/generate-pwa-assets.mjs (sharp, no Chromium)
```

Source: `scripts/icon-source.svg` (512×512, cream `#f5f2ea` + accent `#c96442`).

Produced files:
- icons/icon-192.png            192×192
- icons/icon-256.png            256×256
- icons/icon-384.png            384×384
- icons/icon-512.png            512×512
- icons/icon-maskable-512.png   512×512 (icon at ~80% on a full cream square — safe zone)
- icons/apple-touch-icon.png    180×180
- icons/badge-72.png            72×72 (notification badge, used in src/app/sw.ts)

Apple splash screens go under `public/splash/` (3 sizes referenced in
`src/app/layout.tsx`): 1290×2796, 1179×2556, 1170×2532.

The manifest (`src/app/manifest.ts`) and root layout reference these exact paths.
