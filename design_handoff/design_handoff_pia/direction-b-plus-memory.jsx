// direction-b-plus-memory.jsx — 🧠 Mémoire long-terme : recall + carnet de bord
// Screens: 1) Recherche dans l'historique (Q&A)
//          2) Carnet de bord / milestones timeline

// ─── 1) Recherche historique — "Demander à Pia" enrichi ─────────────
function DirB_Recall({ theme }) {
  return (
    <div style={{ background: theme.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ paddingTop: 56, padding: '56px 20px 14px', borderBottom: `0.5px solid ${theme.hair}` }}>
        <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase' }}>Mémoire de Pia</div>
        <div style={{ fontFamily: SERIF, fontSize: 26, color: theme.ink, letterSpacing: -0.5, marginTop: 4, lineHeight: 1.1 }}>
          Demande-moi n'importe quoi.
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 14, color: theme.sub, marginTop: 2, lineHeight: 1.35 }}>
          Je me souviens de tout ce qui a été dit ou tracké.
        </div>
      </div>

      {/* Search bar */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          background: theme.card, borderRadius: 14, padding: '12px 14px',
          border: `0.5px solid ${theme.hair}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Icon name="sparkle" size={14} color={theme.accent} />
          <input placeholder="ex. 'quand a-t-il commencé à dormir 5h' "
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontFamily: SANS, fontSize: 14, color: theme.ink,
            }}
            defaultValue="quand a-t-elle eu sa première otite ?"
          />
          <Icon name="mic" size={16} color={theme.sub} />
        </div>
      </div>

      {/* Réponse Pia — façon Apple Spotlight enrichi */}
      <div style={{ padding: '14px 16px 0', flex: 1, overflow: 'hidden' }}>
        <div style={{ background: theme.card, borderRadius: 18, padding: 16, border: `0.5px solid ${theme.hair}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="sparkle" size={12} color="#fff" />
            </div>
            <span style={{ fontFamily: SANS, fontSize: 11, color: theme.accent, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Pia se souvient</span>
          </div>

          <div style={{ fontFamily: SERIF, fontSize: 17, color: theme.ink, lineHeight: 1.45 }}>
            <b>14 février</b>, il y a 4 mois et 11 jours.
            <br/>
            <span style={{ color: theme.sub, fontSize: 14.5 }}>
              Lucie avait 3 mois et 2 semaines. Tu avais dicté
              <span style={{ color: theme.ink, fontStyle: 'italic' }}> "elle se tire l'oreille gauche depuis 2h, pleure beaucoup" </span>
              à 19h42.
            </span>
          </div>

          {/* Citation extracted */}
          <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 12, background: theme.soft, borderLeft: `3px solid ${theme.accent}` }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, color: theme.sub, marginBottom: 4 }}>14 fév · 21:30 · Dr Renaud</div>
            <div style={{ fontFamily: SERIF, fontSize: 13.5, color: theme.ink, lineHeight: 1.45, fontStyle: 'italic' }}>
              "Otite séreuse oreille gauche. Amoxicilline 80mg/kg/j pendant 7 jours."
            </div>
          </div>

          {/* Liens connexes */}
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { i: 'note', l: 'Ordonnance · amoxicilline', s: '14 fév → 21 fév' },
              { i: 'cal', l: 'Contrôle Dr Renaud', s: '21 fév · "guérison complète"' },
              { i: 'bottle', l: 'Biberons refusés', s: '14-16 fév · 8 biberons partiels' },
            ].map((it, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 10,
                background: 'transparent',
              }}>
                <Icon name={it.i} size={13} color={theme.sub} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SANS, fontSize: 13, color: theme.ink, fontWeight: 500 }}>{it.l}</div>
                  <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub }}>{it.s}</div>
                </div>
                <Icon name="arrow" size={12} color={theme.sub} />
              </div>
            ))}
          </div>

          {/* Action de suivi */}
          <button style={{
            marginTop: 10, width: '100%',
            background: 'transparent', color: theme.accent,
            border: `0.5px solid ${theme.accent}55`, borderRadius: 12,
            padding: '10px 12px',
            fontFamily: SANS, fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            Voir toute la chronologie médicale
          </button>
        </div>

        {/* Suggestions */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase', padding: '0 4px 8px', fontWeight: 600 }}>Tu m'as aussi demandé</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { q: 'À partir de quand a-t-elle fait ses nuits ?', a: '4 mois 6 jours · 18 mars', i: 'moon' },
              { q: 'Combien pesait-elle à la naissance ?', a: '3.18 kg · 17 sep', i: 'heart' },
              { q: 'Premier vrai sourire ?', a: '6 nov · 6 semaines', i: 'sparkle' },
              { q: 'Coliques — quand ça a commencé/fini ?', a: 'pic 2-7 sem · fini vers 11 sem', i: 'flame' },
            ].map((q, i) => (
              <div key={i} style={{
                background: theme.card, borderRadius: 12,
                padding: '10px 12px', border: `0.5px solid ${theme.hair}`,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <Icon name={q.i} size={13} color={theme.sub} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SANS, fontSize: 12.5, color: theme.ink }}>{q.q}</div>
                  <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, marginTop: 1 }}>→ {q.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2) Carnet de bord — milestones timeline ──────────────────────────
function DirB_Logbook({ theme }) {
  return (
    <div style={{ background: theme.bg, minHeight: '100%', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ paddingTop: 56, padding: '56px 20px 4px' }}>
        <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase' }}>Carnet de bord · Lucie</div>
        <div style={{ fontFamily: SERIF, fontSize: 28, color: theme.ink, letterSpacing: -0.5, marginTop: 2, lineHeight: 1.1 }}>
          5 mois, 12 jours
        </div>
      </div>

      {/* Filtres */}
      <div style={{ padding: '12px 16px 4px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[
          { l: 'Tout', active: true },
          { l: 'Premières fois', n: 18 },
          { l: 'Santé', n: 6 },
          { l: 'Croissance', n: 9 },
          { l: 'Photos', n: 142 },
        ].map((f, i) => (
          <button key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '6px 11px', borderRadius: 999,
            background: f.active ? theme.ink : theme.card,
            color: f.active ? theme.bg : theme.ink,
            border: `0.5px solid ${f.active ? 'transparent' : theme.hair}`,
            fontFamily: SANS, fontSize: 12, fontWeight: 500,
            cursor: 'pointer', flexShrink: 0,
          }}>
            {f.l}
            {f.n != null && <span style={{ fontFamily: MONO, fontSize: 10.5, opacity: 0.65 }}>{f.n}</span>}
          </button>
        ))}
      </div>

      {/* Timeline groupée par mois — façon journal */}
      <Month theme={theme} label="Ce mois-ci · mai" age="5 mois">
        <Milestone theme={theme} d="22 mai" age="5 mois 8 j" k="first"
          title="Première fois assise sans appui"
          quote="3 secondes, puis bascule. Thomas l'a rattrapée 😅" who="L" hasPhoto />
        <Milestone theme={theme} d="18 mai" age="5 mois 4 j" k="health"
          title="Visite des 5 mois"
          quote="P50 poids · P40 taille · vaccins OK" who="L" />
        <Milestone theme={theme} d="11 mai" age="4 mois 28 j" k="first"
          title="Premier rire aux éclats"
          quote="déclenché par le chien du voisin" who="T" hasPhoto />
      </Month>

      <Month theme={theme} label="Avril" age="4 mois">
        <Milestone theme={theme} d="30 avr" age="4 mois 16 j" k="first"
          title="Tient sa tête seule longtemps"
          quote="" who="L" />
        <Milestone theme={theme} d="15 avr" age="4 mois" k="growth"
          title="6.1 kg · 62 cm"
          quote="+850g sur le mois" who="L" />
        <Milestone theme={theme} d="2 avr" age="3 mois 19 j" k="first"
          title="A attrapé un hochet volontairement"
          quote="le rouge, pas le bleu" who="L" hasPhoto />
      </Month>

      {/* Bouton add */}
      <button style={{
        position: 'absolute', right: 18, bottom: 24,
        width: 54, height: 54, borderRadius: '50%',
        background: theme.accent, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 10px 28px ${theme.accent}55`,
      }}>
        <Icon name="plus" size={26} color="#fff" w={2.2} />
      </button>

      <button style={{
        position: 'absolute', left: 18, bottom: 24,
        height: 54, borderRadius: 999,
        background: theme.card, border: `0.5px solid ${theme.hair}`,
        padding: '0 18px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: SANS, fontSize: 13, color: theme.ink, fontWeight: 500,
      }}>
        <Icon name="note" size={16} color={theme.ink} />
        Export PDF
      </button>
    </div>
  );
}

function Month({ theme, label, age, children }) {
  return (
    <div style={{ margin: '16px 16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '4px 4px 10px' }}>
        <span style={{ fontFamily: SERIF, fontSize: 18, color: theme.ink, letterSpacing: -0.3 }}>{label}</span>
        <span style={{ fontFamily: SANS, fontSize: 11.5, color: theme.sub }}>{age}</span>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 19, top: 8, bottom: 8, width: 0.5, background: theme.hair }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>
      </div>
    </div>
  );
}

function Milestone({ theme, d, age, k, title, quote, who, hasPhoto }) {
  const C = { first: theme.accent, health: '#7a6fc0', growth: theme.good };
  const I = { first: 'sparkle', health: 'heart', growth: 'milestone' };
  const c = C[k] || theme.accent;
  return (
    <div style={{ display: 'flex', gap: 12, paddingLeft: 0 }}>
      {/* dot */}
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: theme.card, border: `0.5px solid ${theme.hair}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1, flexShrink: 0,
        boxShadow: `0 0 0 4px ${theme.bg}`,
      }}>
        <Icon name={I[k]} size={16} color={c} />
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: SANS, fontSize: 11.5, color: theme.sub, fontWeight: 500 }}>{d}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: theme.sub, opacity: 0.5 }} />
          <span style={{ fontFamily: SANS, fontSize: 11.5, color: theme.sub }}>{age}</span>
          <span style={{ marginLeft: 'auto' }}>
            <Avatar who={who} size={14} />
          </span>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 15.5, color: theme.ink, marginTop: 4, lineHeight: 1.3, letterSpacing: -0.1 }}>{title}</div>
        {quote && (
          <div style={{ fontFamily: SERIF, fontSize: 12.5, color: theme.sub, marginTop: 4, fontStyle: 'italic', lineHeight: 1.4 }}>
            "{quote}"
          </div>
        )}
        {hasPhoto && (
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            <div style={{ width: 56, height: 56, borderRadius: 10, background: `linear-gradient(135deg, ${c}30, ${c}10)`, border: `0.5px solid ${theme.hair}` }} />
            <div style={{ width: 56, height: 56, borderRadius: 10, background: `linear-gradient(135deg, ${theme.soft}, ${theme.hair})`, border: `0.5px solid ${theme.hair}` }} />
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { DirB_Recall, DirB_Logbook });
