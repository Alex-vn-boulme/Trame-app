"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Palette = "cream" | "sage" | "rose";
export type Theme = Palette | "dark" | "night";
export type Density = "compact" | "regular" | "comfy";
export type Tone = "sobre" | "warm" | "drole";

export type Settings = {
  palette: Palette;
  dark: boolean;
  density: Density;
  tone: Tone;
  handsFree: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  palette: "cream",
  dark: false,
  density: "regular",
  tone: "warm",
  handsFree: false,
};

const STORAGE_KEY = "pia.settings.v1";

type Ctx = Settings & {
  setPalette: (p: Palette) => void;
  setDark: (b: boolean) => void;
  setDensity: (d: Density) => void;
  setTone: (t: Tone) => void;
  setHandsFree: (b: boolean) => void;
  resolved: Theme;
};

const ThemeContext = createContext<Ctx | null>(null);

function resolveTheme(s: Settings): Theme {
  return s.dark ? "dark" : s.palette;
}

export function ThemeProvider({
  children,
  forceTheme,
}: {
  children: ReactNode;
  /** Force a specific theme regardless of user prefs (used on /night/*). */
  forceTheme?: Theme;
}) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist settings.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore quota errors
    }
  }, [settings, hydrated]);

  const resolved = forceTheme ?? resolveTheme(settings);

  // Apply theme to <html> so CSS variables swap globally.
  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
  }, [resolved]);

  const value: Ctx = {
    ...settings,
    setPalette: (palette) => setSettings((s) => ({ ...s, palette })),
    setDark: (dark) => setSettings((s) => ({ ...s, dark })),
    setDensity: (density) => setSettings((s) => ({ ...s, density })),
    setTone: (tone) => setSettings((s) => ({ ...s, tone })),
    setHandsFree: (handsFree) => setSettings((s) => ({ ...s, handsFree })),
    resolved,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
