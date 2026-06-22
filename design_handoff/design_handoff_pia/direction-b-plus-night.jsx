// direction-b-plus-night.jsx — 🌙 Nuit / mains-libres / handoff matin
// Screens: 1) Dictée nuit (AMOLED, gros tap micro)
//          2) Handoff matin (résumé café-à-la-main)

// ─── 1) Dictée nuit — sombre, gros, mains-libres ────────────────────
function DirB_NightDictation({ theme }) {
  // Force a near-black palette regardless of theme.dark
  const night = {
    bg: '#0a0a07', surface: '#13110d', card: '#1a1812',
    ink: '#f3efe4', sub: '#7a7464', hair: 'rgba(243,239,228,0.06)',
    accent: '#e89077', good: '#8aa97c',
  };

  return (
    <div style={{ background: night.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Status bar already in IOSDevice */}

      {/* Top : time + battery / context */}
      <div style={{ paddingTop: 56, padding: '56px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: night.sub, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Nuit · 03:42
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 56, color: night.ink, letterSpacing: -2, lineHeight: 1, marginTop: 8, fontWeight: 300 }}>
              03:42
            </div>
            <div style={{ fontFamily: SANS, fontSize: 13.5, color: night.sub, marginTop: 6 }}>
              Bébé dort depuis <span style={{ color: night.ink }}>2h14</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: SANS, fontSize: 10.5, color: night.sub, letterSpacing: 0.3, textTransform: 'uppercase' }}>Dernier biberon</div>
            <div style={{ fontFamily: SERIF, fontSize: 18, color: night.ink, marginTop: 4, letterSpacing: -0.3 }}>01:20</div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: night.sub, marginTop: 2 }}>90 ml · Thomas</div>
          </div>
        </div>
      </div>

      {/* Card : ce que tu peux dicter */}
      <div style={{ margin: '34px 18px 0', background: night.card, borderRadius: 20, padding: '14px 16px', border: `0.5px solid ${night.hair}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="sparkle" size={13} color={night.accent} />
          <span style={{ fontFamily: SANS, fontSize: 11, color: night.accent, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Pia · mode nuit</span>
          <span style={{ marginLeft: 'auto', fontFamily: SANS, fontSize: 11, color: night.sub }}>
            son coupé
          </span>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 17, color: night.ink, lineHeight: 1.4, marginTop: 8 }}>
          Tape le micro et dicte. Je classe en silence — tu verras tout au réveil.
        </div>
      </div>

      {/* Dernières dictées de la nuit */}
      <div style={{ flex: 1, margin: '18px 18px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: SANS, fontSize: 10.5, color: night.sub, letterSpacing: 0.4, textTransform: 'uppercase', padding: '0 2px 2px' }}>Cette nuit</div>
        {[
          { i: 'bottle', t: 'Biberon · 90 ml', s: '01:20 · Thomas · fini', c: night.accent },
          { i: 'diaper', t: 'Change · pipi', s: '01:18 · Thomas', c: night.good },
          { i: 'bottle', t: 'Biberon · 70 ml', s: '23:40 · Léa · à moitié', c: night.accent, warn: true },
        ].map((it, i) => (
          <div key={i} style={{
            background: night.surface, borderRadius: 14, padding: '10px 12px',
            border: `0.5px solid ${night.hair}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 9, background: `${it.c}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={it.i} size={14} color={it.c} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SANS, fontSize: 13, color: night.ink, fontWeight: 500 }}>{it.t}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: night.sub, marginTop: 1 }}>{it.s}</div>
            </div>
            {it.warn && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d6a25b' }} />
            )}
          </div>
        ))}
      </div>

      {/* Gros bouton micro */}
      <div style={{ padding: '12px 18px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ fontFamily: SANS, fontSize: 12, color: night.sub }}>tap pour dicter · maintien pour main-libre</div>
        <button style={{
          width: 96, height: 96, borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${night.accent} 0%, #b15c4a 100%)`,
          border: 'none', cursor: 'pointer',
          boxShadow: `0 0 0 8px ${night.accent}14, 0 0 0 18px ${night.accent}08, 0 14px 40px ${night.accent}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="mic" size={40} color="#fff" w={1.8} />
        </button>
        <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
          <button style={ghostNight(night)}>
            <Icon name="bottle" size={14} color={night.sub} /> Biberon
          </button>
          <button style={ghostNight(night)}>
            <Icon name="diaper" size={14} color={night.sub} /> Change
          </button>
          <button style={ghostNight(night)}>
            <Icon name="moon" size={14} color={night.sub} /> Sieste
          </button>
        </div>
      </div>
    </div>
  );
}

function ghostNight(night) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '8px 12px', borderRadius: 999,
    background: 'transparent', color: night.sub,
    border: `0.5px solid ${night.hair}`,
    fontFamily: SANS, fontSize: 12, fontWeight: 500,
    cursor: 'pointer',
  };
}

// ─── 2) Handoff matin — café à la main ──────────────────────────────
function DirB_MorningHandoff({ theme }) {
  return (
    <div style={{ background: theme.bg, minHeight: '100%', paddingBottom: 30 }}>
      {/* Header — soft sunrise */}
      <div style={{
        paddingTop: 56, padding: '56px 20px 14px',
        background: `linear-gradient(180deg, ${theme.accent}10 0%, ${theme.bg} 100%)`,
      }}>
        <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          Mercredi · 7:18
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 32, color: theme.ink, letterSpacing: -0.6, marginTop: 4, lineHeight: 1.05 }}>
          Bonjour Léa.
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 18, color: theme.sub, marginTop: 2, lineHeight: 1.3 }}>
          Thomas a tenu la nuit. Voici son résumé.
        </div>
      </div>

      {/* Carte résumé — chiffres dominants */}
      <div style={{ margin: '12px 16px 0', background: theme.card, borderRadius: 22, padding: 18, border: `0.5px solid ${theme.hair}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Avatar who="T" size={20} />
          <span style={{ fontFamily: SANS, fontSize: 12, color: theme.sub, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600 }}>Cette nuit · 22h → 7h</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
          {[
            { n: '2', l: 'biberons', s: '160 ml' },
            { n: '1', l: 'change', s: 'pipi' },
            { n: '5h12', l: 'sommeil', s: 'bébé' },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 4px',
              borderRight: i < 2 ? `0.5px solid ${theme.hair}` : 'none' }}>
              <div style={{ fontFamily: SERIF, fontSize: 28, color: theme.ink, letterSpacing: -0.5, lineHeight: 1 }}>{m.n}</div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: theme.ink, marginTop: 4 }}>{m.l}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, marginTop: 1 }}>{m.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline visuelle compact */}
      <div style={{ margin: '14px 16px 0' }}>
        <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase', padding: '0 4px 8px', fontWeight: 600 }}>Frise</div>
        <div style={{ background: theme.card, borderRadius: 18, padding: '16px 14px', border: `0.5px solid ${theme.hair}` }}>
          <NightTimeline theme={theme} />
        </div>
      </div>

      {/* Insights Pia */}
      <div style={{ margin: '14px 16px 0', background: `${theme.accent}10`, borderRadius: 18, padding: 16, border: `0.5px solid ${theme.accent}30` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Icon name="sparkle" size={13} color={theme.accent} />
          <span style={{ fontFamily: SANS, fontSize: 11, color: theme.accent, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Pia · ce que je remarque</span>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 15.5, color: theme.ink, lineHeight: 1.45 }}>
          Lucie a refusé la moitié du biberon de 23h40. <b>Troisième fois cette semaine</b> à ce créneau — peut-être pas faim juste après la sieste de 21h ?
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button style={chipBig(theme, true)}>Voir l'historique</button>
          <button style={chipBig(theme)}>Ignorer</button>
        </div>
        <SourceFooter theme={theme} heuristic />
      </div>

      {/* Notes de Thomas */}
      <div style={{ margin: '14px 16px 0' }}>
        <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase', padding: '0 4px 8px', fontWeight: 600 }}>
          Notes de Thomas
        </div>
        <div style={{ background: theme.card, borderRadius: 18, padding: '12px 16px', border: `0.5px solid ${theme.hair}`, display: 'flex', gap: 10 }}>
          <Avatar who="T" size={22} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SERIF, fontSize: 14.5, color: theme.ink, lineHeight: 1.45, fontStyle: 'italic' }}>
              "elle s'est rendormie tout seule à 5h — pas eu besoin de la bercer 🙏"
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10.5, color: theme.sub, marginTop: 6 }}>5:14 · vocal · 8s</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NightTimeline({ theme }) {
  // 22h to 7h = 9 hours
  const events = [
    { h: 22.5, kind: 'sleep', label: 'sommeil', dur: 1.5 },
    { h: 23.7, kind: 'bottle', label: '70 ml', warn: true },
    { h: 24,   kind: 'sleep', label: '', dur: 1.5 },
    { h: 1.3,  kind: 'diaper', label: 'pipi' },
    { h: 1.35, kind: 'bottle', label: '90 ml' },
    { h: 1.5,  kind: 'sleep', label: '', dur: 3.7 },
    { h: 5.2,  kind: 'note', label: 'rendormie seule' },
    { h: 5.3,  kind: 'sleep', label: '', dur: 1.5 },
    { h: 7,    kind: 'wake', label: 'réveil' },
  ];
  const COLORS = {
    sleep: '#7a6fc0', bottle: theme.accent, diaper: theme.good,
    note: theme.warn, wake: theme.ink,
  };
  return (
    <div>
      {/* axis */}
      <div style={{ position: 'relative', height: 80 }}>
        {/* base line */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 40, height: 4, background: theme.soft, borderRadius: 2 }} />
        {/* sleep blocks */}
        {events.filter(e => e.kind === 'sleep').map((e, i) => {
          const startH = e.h < 12 ? e.h + 24 : e.h; // shift to 22-31 range
          const left = ((startH - 22) / 9) * 100;
          const width = (e.dur / 9) * 100;
          return (
            <div key={i} style={{
              position: 'absolute', left: `${left}%`, width: `${width}%`,
              top: 38, height: 8, background: COLORS.sleep, opacity: 0.35, borderRadius: 4,
            }} />
          );
        })}
        {/* point events */}
        {events.filter(e => e.kind !== 'sleep').map((e, i) => {
          const startH = e.h < 12 ? e.h + 24 : e.h;
          const left = ((startH - 22) / 9) * 100;
          const c = COLORS[e.kind];
          return (
            <div key={i} style={{
              position: 'absolute', left: `calc(${left}% - 9px)`, top: 24,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: e.warn ? `0 0 0 3px ${c}30` : 'none' }}>
                <Icon name={e.kind === 'bottle' ? 'bottle' : e.kind === 'diaper' ? 'diaper' : e.kind === 'note' ? 'note' : 'sparkle'} size={10} color="#fff" />
              </div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: theme.sub, marginTop: 22 }}>
                {String(Math.floor(e.h)).padStart(2,'0')}h{String(Math.round((e.h%1)*60)).padStart(2,'0')}
              </div>
            </div>
          );
        })}
      </div>
      {/* hour ticks */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: MONO, fontSize: 10, color: theme.sub }}>
        <span>22h</span><span>0h</span><span>2h</span><span>4h</span><span>6h</span><span>7h</span>
      </div>
    </div>
  );
}

function chipBig(theme, active = false) {
  return {
    fontFamily: SANS, fontSize: 12.5, fontWeight: 500,
    padding: '7px 13px', borderRadius: 999,
    background: active ? theme.accent : 'transparent',
    color: active ? '#fff' : theme.ink,
    border: active ? 'none' : `0.5px solid ${theme.hair}`,
    cursor: 'pointer',
  };
}

Object.assign(window, { DirB_NightDictation, DirB_MorningHandoff });
