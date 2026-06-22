import type { MetadataRoute } from "next";

/**
 * PWA manifest — served at /manifest.webmanifest.
 * The brief specifies cream (#f5f2ea + #c96442) as the default palette,
 * which we expose here as the install-time theme so iOS Safari shows the
 * right status bar tint when the user adds Pia to the home screen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pia — agent de charge mentale parentale",
    short_name: "Pia",
    description:
      "Dicte ce qui te passe par la tête, Pia s'occupe du reste : RDV, biberons, courses, vigilance, mémoire long-terme.",
    lang: "fr",
    dir: "ltr",
    start_url: "/chat",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f2ea",
    theme_color: "#c96442",
    categories: ["health", "lifestyle", "productivity"],
    prefer_related_applications: false,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-256.png", sizes: "256x256", type: "image/png", purpose: "any" },
      { src: "/icons/icon-384.png", sizes: "384x384", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
