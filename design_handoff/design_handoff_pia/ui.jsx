// ui.jsx — shared tokens, atoms, mock data, icons.

// ─── Tokens ───────────────────────────────────────────────────────────────
const PALETTES = {
  cream:  { bg: '#f5f2ea', surface: '#faf8f3', card: '#ffffff', ink: '#29261b', sub: '#6e6757', hair: 'rgba(41,38,27,0.08)', soft: '#efe9dc', accent: '#c96442', accentSoft: 'rgba(201,100,66,0.10)', good: '#5a7d4f', warn: '#b67a2c' },
  sage:   { bg: '#eef0ea', surface: '#f6f7f3', card: '#ffffff', ink: '#22271f', sub: '#697060', hair: 'rgba(34,39,31,0.08)', soft: '#e6e9df', accent: '#6b8a5a', accentSoft: 'rgba(107,138,90,0.12)', good: '#6b8a5a', warn: '#b67a2c' },
  rose:   { bg: '#f3ecea', surface: '#faf4f2', card: '#ffffff', ink: '#2a2422', sub: '#74675f', hair: 'rgba(42,36,34,0.08)', soft: '#ebe1dc', accent: '#b15c6e', accentSoft: 'rgba(177,92,110,0.12)', good: '#5a7d4f', warn: '#b67a2c' },
};
const DARK = { bg: '#15140f', surface: '#1c1a14', card: '#222019', ink: '#f3efe4', sub: '#8a8474', hair: 'rgba(243,239,228,0.08)', soft: '#2a2720', accent: '#e89077', accentSoft: 'rgba(232,144,119,0.15)', good: '#8aa97c', warn: '#d6a25b' };

function useTheme(tweaks) {
  const base = tweaks.dark ? DARK : PALETTES[tweaks.palette] || PALETTES.cream;
  return base;
}

const DENSITY = { compact: { row: 44, gap: 8, padX: 14 }, regular: { row: 52, gap: 12, padX: 16 }, comfy: { row: 60, gap: 16, padX: 18 } };

// ─── Fonts ────────────────────────────────────────────────────────────────
const SERIF = "'Source Serif 4', ui-serif, Georgia, serif";
const SANS = "'Geist', ui-sans-serif, system-ui, sans-serif";
const MONO = "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

// ─── Mock state (semaine 24, grossesse + projection) ──────────────────────
const PARENTS = {
  L: { id: 'L', name: 'Léa',   color: '#c96442', initial: 'L' },
  T: { id: 'T', name: 'Thomas', color: '#5a7d4f', initial: 'T' },
};

// ─── Icons (line, 20px) ───────────────────────────────────────────────────
const stroke = (color, w=1.6) => ({ stroke: color, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' });
function Icon({ name, size = 20, color = 'currentColor', w = 1.6 }) {
  const s = stroke(color, w);
  const v = { width: size, height: size, viewBox: '0 0 24 24' };
  switch(name) {
    case 'bottle': return <svg {...v}><path {...s} d="M9 3h6M10 3v2.5c0 .7-.3 1.3-.8 1.8L8 8.5C7.3 9.2 7 10.1 7 11v7a3 3 0 003 3h4a3 3 0 003-3v-7c0-.9-.3-1.8-1-2.5l-1.2-1.2c-.5-.5-.8-1.1-.8-1.8V3"/><path {...s} d="M7 13h10"/></svg>;
    case 'diaper': return <svg {...v}><path {...s} d="M3 9c4 0 7 3 9 3s5-3 9-3v3c0 4-4 8-9 8s-9-4-9-8V9z"/><path {...s} d="M9 13l1 3M15 13l-1 3"/></svg>;
    case 'moon':   return <svg {...v}><path {...s} d="M20 14.5A8 8 0 119.5 4 6.5 6.5 0 0020 14.5z"/></svg>;
    case 'cal':    return <svg {...v}><rect {...s} x="3.5" y="5" width="17" height="15" rx="2.5"/><path {...s} d="M3.5 10h17M8 3v4M16 3v4"/></svg>;
    case 'cart':   return <svg {...v}><path {...s} d="M3 4h2l2.5 11.5a2 2 0 002 1.5h7.5a2 2 0 002-1.5L20.5 8H7"/><circle {...s} cx="10" cy="20" r="1.2"/><circle {...s} cx="17" cy="20" r="1.2"/></svg>;
    case 'milestone': return <svg {...v}><path {...s} d="M12 3v18M5 6h11l-2 3 2 3H5z"/></svg>;
    case 'chat':   return <svg {...v}><path {...s} d="M4 6a3 3 0 013-3h10a3 3 0 013 3v8a3 3 0 01-3 3h-6l-4 3v-3H7a3 3 0 01-3-3V6z"/></svg>;
    case 'mic':    return <svg {...v}><rect {...s} x="9" y="3" width="6" height="11" rx="3"/><path {...s} d="M5 11a7 7 0 0014 0M12 18v3"/></svg>;
    case 'send':   return <svg {...v}><path {...s} d="M4 12l16-8-6 16-3-7-7-1z"/></svg>;
    case 'plus':   return <svg {...v}><path {...s} d="M12 5v14M5 12h14"/></svg>;
    case 'check':  return <svg {...v}><path {...s} d="M5 12l4 4 10-10"/></svg>;
    case 'sparkle':return <svg {...v}><path {...s} d="M12 3l1.8 4.7L18 9.5l-4.2 1.8L12 16l-1.8-4.7L6 9.5l4.2-1.8L12 3z"/><path {...s} d="M19 16l.8 2 2 .8-2 .8L19 22l-.8-2-2-.8 2-.8L19 16z"/></svg>;
    case 'clock':  return <svg {...v}><circle {...s} cx="12" cy="12" r="8.5"/><path {...s} d="M12 7v5l3.5 2"/></svg>;
    case 'flame':  return <svg {...v}><path {...s} d="M12 3c1 4 4 5 4 9a4 4 0 11-8 0c0-2 1-3 1.5-4 .5 1.5 1.5 2 1.5 2 0-3 1-5 1-7z"/></svg>;
    case 'home':   return <svg {...v}><path {...s} d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-9z"/></svg>;
    case 'belly':  return <svg {...v}><path {...s} d="M9 5c-3 0-5 2-5 5 0 1.5.7 3 1.8 4.2A6 6 0 0011.5 16h.5c4.4 0 7-3 7-6.5S16.4 3 12 3 9 5 9 5z"/><circle cx="11.5" cy="10" r="1" fill={color}/></svg>;
    case 'heart':  return <svg {...v}><path {...s} d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/></svg>;
    case 'note':   return <svg {...v}><path {...s} d="M5 4h11l3 3v13a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"/><path {...s} d="M16 4v3h3M8 12h7M8 16h5"/></svg>;
    case 'list':   return <svg {...v}><path {...s} d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill={color}/><circle cx="4" cy="12" r="1" fill={color}/><circle cx="4" cy="18" r="1" fill={color}/></svg>;
    case 'arrow':  return <svg {...v}><path {...s} d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'wave':   return <svg {...v}><path {...s} d="M3 14c2 0 2-4 4-4s2 4 4 4 2-4 4-4 2 4 4 4"/></svg>;
    default: return null;
  }
}

// ─── Avatar ───────────────────────────────────────────────────────────────
function Avatar({ who = 'L', size = 22, ring = false }) {
  const p = PARENTS[who] || PARENTS.L;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: p.color, color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: SANS, fontSize: size * 0.45, fontWeight: 600,
      boxShadow: ring ? '0 0 0 2px #fff' : 'none', flexShrink: 0,
      letterSpacing: 0,
    }}>{p.initial}</div>
  );
}

function AvatarStack({ list = ['L','T'], size = 22 }) {
  return (
    <div style={{ display: 'inline-flex' }}>
      {list.map((w, i) => (
        <div key={i} style={{ marginLeft: i ? -size*0.35 : 0 }}>
          <Avatar who={w} size={size} ring />
        </div>
      ))}
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────
function Pill({ children, color, bg, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: SANS, fontSize: 11, fontWeight: 500,
      padding: '3px 8px', borderRadius: 999,
      background: bg, color, letterSpacing: 0.1,
      ...style,
    }}>{children}</span>
  );
}

// ─── Soft card ───────────────────────────────────────────────────────────
function Card({ children, theme, style = {}, pad = 16 }) {
  return (
    <div style={{
      background: theme.card, borderRadius: 18,
      border: `0.5px solid ${theme.hair}`,
      padding: pad, ...style,
    }}>{children}</div>
  );
}

Object.assign(window, {
  PALETTES, DARK, DENSITY, SERIF, SANS, MONO, PARENTS,
  useTheme, Icon, Avatar, AvatarStack, Pill, Card, SourceFooter,
});

// ─── Source citation footer ─────────────────────────────────────────
// Toute reco/seuil/dose Pia DOIT afficher sa source officielle.
// Usage:
//   <SourceFooter theme={theme} org="HAS" title="Suivi du nourrisson 0-2 ans" year={2024} />
//   <SourceFooter theme={theme} heuristic />   ← observation Pia non-médicale
function SourceFooter({ theme, org, title, year, heuristic, compact }) {
  if (heuristic) {
    return (
      <div style={{
        marginTop: compact ? 6 : 8,
        paddingTop: compact ? 6 : 8,
        borderTop: `0.5px solid ${theme.hair}`,
        display: 'flex', alignItems: 'center', gap: 5,
        fontFamily: SANS, fontSize: 10.5, color: theme.sub,
        fontStyle: 'italic', letterSpacing: 0.1,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 12, height: 12, borderRadius: '50%',
          border: `1px solid ${theme.sub}`,
          fontSize: 8, fontWeight: 700, fontStyle: 'normal',
        }}>i</span>
        <span>Observation Pia · pas une reco médicale</span>
      </div>
    );
  }
  return (
    <div style={{
      marginTop: compact ? 6 : 10,
      paddingTop: compact ? 6 : 8,
      borderTop: `0.5px solid ${theme.hair}`,
      display: 'flex', alignItems: 'center', gap: 5,
      fontFamily: SANS, fontSize: 10.5, color: theme.sub,
      letterSpacing: 0.1,
    }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 12, height: 12, borderRadius: '50%',
        border: `1px solid ${theme.sub}`,
        fontSize: 8, fontWeight: 700,
      }}>i</span>
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        Source&nbsp;: <span style={{ fontWeight: 600, color: theme.ink }}>{org}</span>
        {title && <> · « {title} »</>}
        {year && <> ({year})</>}
      </span>
      <span style={{ fontFamily: SANS, fontSize: 11, color: theme.accent, fontWeight: 500 }}>↗</span>
    </div>
  );
}
