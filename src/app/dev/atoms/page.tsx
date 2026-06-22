"use client";

import { Avatar, AvatarStack } from "@/components/Avatar";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { Pill } from "@/components/Pill";
import { SourceFooter } from "@/components/SourceFooter";
import { Icon, type IconName } from "@/design/icons";
import { useTheme, type Palette } from "@/components/ThemeProvider";

const ICONS: IconName[] = [
  "bottle", "diaper", "moon", "cal", "cart", "milestone", "chat",
  "mic", "send", "plus", "check", "sparkle", "clock", "flame",
  "home", "belly", "heart", "note", "list", "arrow", "wave",
];

const PALETTES: Palette[] = ["cream", "sage", "rose"];

export default function AtomsDev() {
  const { palette, setPalette, dark, setDark } = useTheme();

  return (
    <main className="mx-auto min-h-dvh max-w-[430px] px-4 py-6">
      <Header palette={palette} onPalette={setPalette} dark={dark} onDark={setDark} />

      <Section title="Couleurs">
        <Swatches />
      </Section>

      <Section title="Typographies">
        <div className="space-y-2">
          <p className="font-serif text-[32px] leading-[1.05] tracking-[-0.02em] text-ink">
            Bonjour Léa.
          </p>
          <p className="font-serif text-[20px] leading-tight text-ink">
            Semaine 24 · jour 3
          </p>
          <p className="font-serif text-[15px] leading-[1.4] text-ink">
            Le serif crée la chaleur. Pia répond par phrases courtes.
          </p>
          <p className="font-sans text-[13px] text-sub">
            Le sans donne la précision. Métadonnées, labels, statuts.
          </p>
          <p className="font-mono text-[12px] tabular-nums text-ink">
            120 ml · 14h32 · J+38
          </p>
          <p className="font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
            Étiquette uppercase
          </p>
        </div>
      </Section>

      <Section title="Avatars">
        <div className="flex items-center gap-3">
          <Avatar who="L" />
          <Avatar who="T" />
          <Avatar who="L" size={32} />
          <Avatar who="T" size={42} ring />
          <AvatarStack list={["L", "T"]} size={28} />
        </div>
      </Section>

      <Section title="Pills (par catégorie)">
        <div className="flex flex-wrap gap-2">
          <Pill color="#7a6fc0" bg="rgba(122,111,192,0.10)">RDV</Pill>
          <Pill color="var(--accent)" bg="var(--accent-soft)">Achat</Pill>
          <Pill color="#3f8fb3" bg="rgba(63,143,179,0.10)">Biberon</Pill>
          <Pill color="#5a7d4f" bg="rgba(90,125,79,0.10)">Change</Pill>
          <Pill color="#b67a2c" bg="rgba(182,122,44,0.10)">Admin</Pill>
          <Pill color="#c94422" bg="rgba(201,68,34,0.10)">Alerte</Pill>
        </div>
      </Section>

      <Section title="Chips">
        <div className="flex flex-wrap gap-2">
          <Chip icon={<Icon name="bottle" size={14} />}>Biberon</Chip>
          <Chip icon={<Icon name="diaper" size={14} />}>Change</Chip>
          <Chip icon={<Icon name="moon" size={14} />}>Sieste</Chip>
          <Chip selected>Sélectionné</Chip>
        </div>
      </Section>

      <Section title="Card standard">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-serif text-[17px] text-ink">Prochain RDV</p>
              <p className="font-sans text-[12px] text-sub">Dr Renaud · lundi 14h</p>
            </div>
            <Avatar who="L" />
          </div>
        </Card>
      </Section>

      <Section title="SourceFooter (règle d'or §4)">
        <Card>
          <p className="font-serif text-[15px] text-ink">
            Pas de selle depuis 52h.
          </p>
          <p className="font-sans text-[13px] text-sub mt-1">
            À signaler au pédiatre — Lucie a 4 mois.
          </p>
          <SourceFooter
            org="HAS"
            title="Constipation du nourrisson"
            year={2023}
            url="https://www.has-sante.fr/"
          />
        </Card>
        <Card>
          <p className="font-serif text-[15px] text-ink">
            3 biberons refusés au même créneau cette semaine.
          </p>
          <SourceFooter heuristic />
        </Card>
      </Section>

      <Section title={`Icônes (${ICONS.length})`}>
        <div className="grid grid-cols-6 gap-3 text-ink">
          {ICONS.map((name) => (
            <div key={name} className="flex flex-col items-center gap-1.5">
              <div className="bg-soft flex h-10 w-10 items-center justify-center rounded-xl">
                <Icon name={name} size={20} />
              </div>
              <span className="font-mono text-[9px] text-sub">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <p className="font-mono text-[10px] text-sub py-8 text-center">
        comparer pixel-près avec design_handoff/design_handoff_pia/index.html
      </p>
    </main>
  );
}

function Header({
  palette,
  onPalette,
  dark,
  onDark,
}: {
  palette: Palette;
  onPalette: (p: Palette) => void;
  dark: boolean;
  onDark: (b: boolean) => void;
}) {
  return (
    <div className="sticky top-0 z-10 -mx-4 mb-6 bg-bg/95 backdrop-blur-sm px-4 py-3 border-b border-hair">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-[20px] text-ink">/dev/atoms</h1>
        <div className="flex gap-1">
          {PALETTES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPalette(p)}
              aria-pressed={!dark && palette === p}
              className={`font-mono text-[10px] uppercase px-2.5 py-1.5 rounded-full border ${
                !dark && palette === p
                  ? "bg-accent text-white border-transparent"
                  : "bg-card text-sub border-hair"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onDark(!dark)}
            aria-pressed={dark}
            className={`font-mono text-[10px] uppercase px-2.5 py-1.5 rounded-full border ${
              dark
                ? "bg-ink text-bg border-transparent"
                : "bg-card text-sub border-hair"
            }`}
          >
            dark
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <p className="font-sans text-[10.5px] uppercase tracking-[0.04em] text-sub mb-3">
        {title}
      </p>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Swatches() {
  const tokens: { name: string; cssVar: string }[] = [
    { name: "bg", cssVar: "var(--bg)" },
    { name: "surface", cssVar: "var(--surface)" },
    { name: "card", cssVar: "var(--card)" },
    { name: "soft", cssVar: "var(--soft)" },
    { name: "ink", cssVar: "var(--ink)" },
    { name: "sub", cssVar: "var(--sub)" },
    { name: "accent", cssVar: "var(--accent)" },
    { name: "good", cssVar: "var(--good)" },
    { name: "warn", cssVar: "var(--warn)" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {tokens.map((t) => (
        <div key={t.name} className="flex items-center gap-2 rounded-lg border border-hair bg-card px-2 py-1.5">
          <span
            className="block h-6 w-6 rounded-md border border-hair"
            style={{ background: t.cssVar }}
            aria-hidden
          />
          <span className="font-mono text-[10px] text-ink">{t.name}</span>
        </div>
      ))}
    </div>
  );
}
