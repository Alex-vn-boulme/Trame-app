"use client";

import { useTheme, type Palette } from "@/components/ThemeProvider";
import { Card } from "@/components/Card";

const PALETTES: { key: Palette; label: string; preview: string }[] = [
  { key: "cream", label: "Cream", preview: "#c96442" },
  { key: "sage", label: "Sage", preview: "#6b8a5a" },
  { key: "rose", label: "Rose", preview: "#b15c6e" },
];

const TONES: { key: "sobre" | "warm" | "drole"; label: string; sub: string }[] = [
  { key: "sobre", label: "Sobre", sub: "factuel · minimal" },
  { key: "warm", label: "Warm", sub: "chaleureux · défaut" },
  { key: "drole", label: "Drôle", sub: "léger · clins d'œil" },
];

const DENSITIES: { key: "compact" | "regular" | "comfy"; label: string }[] = [
  { key: "compact", label: "Compact" },
  { key: "regular", label: "Régulier" },
  { key: "comfy", label: "Spacieux" },
];

export function SettingsForm() {
  const { palette, dark, tone, density, handsFree, setPalette, setDark, setTone, setDensity, setHandsFree } = useTheme();

  return (
    <>
      <section>
        <h2 className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
          Apparence
        </h2>
        <Card pad={12}>
          <p className="font-sans text-[11px] uppercase tracking-[0.04em] text-sub">Palette</p>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {PALETTES.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPalette(p.key)}
                aria-pressed={!dark && palette === p.key}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 font-sans text-[12.5px] ${
                  !dark && palette === p.key ? "bg-accent text-white" : "bg-soft text-ink"
                }`}
              >
                <span
                  className="block h-3 w-3 rounded-full"
                  style={{ background: p.preview }}
                />
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="font-sans text-[13.5px] text-ink">Mode sombre</p>
            <Toggle checked={dark} onChange={setDark} />
          </div>

          <div className="mt-3">
            <p className="font-sans text-[11px] uppercase tracking-[0.04em] text-sub">Densité</p>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {DENSITIES.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setDensity(d.key)}
                  aria-pressed={density === d.key}
                  className={`rounded-xl px-3 py-2 font-sans text-[12.5px] ${
                    density === d.key ? "bg-accent text-white" : "bg-soft text-ink"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
          Voix de Pia
        </h2>
        <Card pad={12}>
          <div className="space-y-2">
            {TONES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTone(t.key)}
                aria-pressed={tone === t.key}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${
                  tone === t.key ? "bg-accent-soft" : "bg-soft"
                }`}
              >
                <span className="flex-1">
                  <span className="block font-serif text-[14px] text-ink">{t.label}</span>
                  <span className="block font-sans text-[11.5px] text-sub">{t.sub}</span>
                </span>
                {tone === t.key && (
                  <span className="h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
                )}
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
          Accessibilité
        </h2>
        <Card pad={12}>
          <div className="flex items-center justify-between">
            <span>
              <p className="font-serif text-[14px] text-ink">Mains libres</p>
              <p className="font-sans text-[11.5px] text-sub">
                Gros boutons, dictée prioritaire, mode nuit auto la nuit.
              </p>
            </span>
            <Toggle checked={handsFree} onChange={setHandsFree} />
          </div>
        </Card>
      </section>
    </>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 rounded-full transition-colors"
      style={{ background: checked ? "var(--accent)" : "var(--soft)" }}
    >
      <span
        className="absolute top-0.5 block h-5 w-5 rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}
