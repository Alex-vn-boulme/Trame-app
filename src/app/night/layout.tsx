"use client";

import { useEffect, type ReactNode } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";

/**
 * /night/* forces the AMOLED palette regardless of user prefs.
 * Brief §C: "Bascule la palette à NIGHT (AMOLED) sur tous les écrans"
 * et "désactive sons, vibrations, TTS de confirmation".
 *
 * Sound / haptic suppression is handled per-component (the night composer
 * skips the success haptic call). Here we just lock the theme.
 */
export default function NightLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.theme = "night";
    return () => {
      // We don't restore the previous palette — the outer ThemeProvider does
      // that on next mount.
    };
  }, []);
  return <ThemeProvider forceTheme="night">{children}</ThemeProvider>;
}
