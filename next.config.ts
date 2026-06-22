import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Serwist injects a webpack plugin, so production builds must run via webpack
// (`pnpm build` uses `next build --webpack`). Dev keeps Turbopack — Serwist is
// disabled in dev anyway. Track @serwist/next + Turbopack support at
// https://github.com/serwist/serwist/issues/54.
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Pin Turbopack to this directory — sibling lockfiles in parent dirs
  // confuse the default inference. process.cwd() is the project root when
  // running `next dev`/`next build` from package.json scripts.
  turbopack: {
    root: process.cwd(),
  },

  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
