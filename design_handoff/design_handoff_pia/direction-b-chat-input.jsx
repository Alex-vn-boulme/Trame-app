// direction-b-chat-input.jsx — Le remplissage par conversation.
// L'utilisateur dicte/écrit naturellement, Pia extrait + classe les éléments
// dans les bonnes catégories (RDV, achats, biberons, changes, sieste, admin…).
// Chaque création apparaît comme une carte inline avec badge de catégorie,
// champs extraits, et possibilité d'édition rapide.

// ─── Petite carte de "création" inline dans le chat ───────────────────
function CreatedCard({ theme, kind, title, fields = [], who, onAccent, soft }) {
  const KIND_META = {
    rdv:     { i: 'cal',       l: 'RDV',       c: '#7a6fc0' },
    course:  { i: 'cart',      l: 'Course',    c: theme.accent },
    biberon: { i: 'bottle',    l: 'Biberon',   c: '#3f8fb3' },
    change:  { i: 'diaper',    l: 'Change',    c: theme.good },
    sieste:  { i: 'moon',      l: 'Sieste',    c: '#7a6fc0' },
    admin:   { i: 'note',      l: 'Admin',     c: theme.warn },
    lecture: { i: 'note',      l: 'Lecture',   c: theme.sub },
    jalon:   { i: 'milestone', l: 'Jalon',     c: theme.accent },
  };
  const m = KIND_META[kind] || KIND_META.course;
  return (
    <div style={{
      background: soft ? `${m.c}10` : theme.card,
      borderRadius: 14,
      border: `0.5px solid ${soft ? `${m.c}40` : theme.hair}`,
      padding: '10px 12px',
      maxWidth: '88%',
      alignSelf: 'flex-start',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      {/* Header : badge + check */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '2px 7px 2px 5px', borderRadius: 999,
          background: `${m.c}1f`,
        }}>
          <Icon name={m.i} size={11} color={m.c} />
          <span style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 600, color: m.c, letterSpacing: 0.2, textTransform: 'uppercase' }}>{m.l}</span>
        </div>
        <span style={{ fontFamily: SANS, fontSize: 10.5, color: theme.sub, marginLeft: 'auto' }}>créé</span>
        <Icon name="check" size={12} color={theme.good} w={2.2} />
      </div>

      {/* Titre */}
      <div style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.25, color: theme.ink, letterSpacing: -0.1 }}>
        {title}
      </div>

      {/* Champs extraits */}
      {fields.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
          {fields.map((f, i) => (
            <span key={i} style={{
              fontFamily: SANS, fontSize: 11, color: theme.sub,
              background: theme.soft, padding: '2px 7px', borderRadius: 6,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ color: theme.sub, opacity: 0.7 }}>{f.k}</span>
              <span style={{ color: theme.ink, fontWeight: 500 }}>{f.v}</span>
            </span>
          ))}
        </div>
      )}

      {/* Footer : qui + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, paddingTop: 6, borderTop: `0.5px solid ${theme.hair}` }}>
        {who && <Avatar who={who} size={14} />}
        {who && <span style={{ fontFamily: SANS, fontSize: 11, color: theme.sub }}>pour {PARENTS[who]?.name || who}</span>}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: SANS, fontSize: 11.5, color: theme.sub, padding: 0,
          }}>Modifier</button>
          <button style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: SANS, fontSize: 11.5, color: m.c, fontWeight: 600, padding: 0,
          }}>Voir →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Bulle utilisateur (dictée / écrite) ──────────────────────────────
function UserBubble({ theme, voice, children, time, who = 'L' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <div style={{
        background: theme.accent, color: '#fff',
        borderRadius: '18px 18px 4px 18px',
        padding: '9px 13px', maxWidth: '85%',
        fontFamily: SANS, fontSize: 14, lineHeight: 1.4,
        display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        {voice && (
          <Icon name="mic" size={13} color="#ffffffcc" />
        )}
        <span>{children}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 4 }}>
        <Avatar who={who} size={12} />
        <span style={{ fontFamily: MONO, fontSize: 10, color: theme.sub }}>{time}{voice ? ' · dicté' : ''}</span>
      </div>
    </div>
  );
}

// ─── Bulle agent ─────────────────────────────────────────────────────
function PiaSay({ theme, children, summary }) {
  return (
    <div style={{
      alignSelf: 'flex-start', maxWidth: '86%',
      background: theme.soft, color: theme.ink,
      borderRadius: '18px 18px 18px 4px',
      padding: '9px 13px',
      fontFamily: SANS, fontSize: 13.5, lineHeight: 1.45,
    }}>
      {children}
      {summary && (
        <div style={{ fontFamily: SANS, fontSize: 11.5, color: theme.sub, marginTop: 4 }}>
          {summary}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Écran 1 — Discussion · création + classification
// ─────────────────────────────────────────────────────────────────────
function DirB_ChatInputCreate({ theme }) {
  return (
    <div style={{ background: theme.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header compact */}
      <div style={{
        paddingTop: 56, padding: '56px 16px 10px',
        borderBottom: `0.5px solid ${theme.hair}`, background: theme.surface,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="arrow" size={18} color={theme.sub} />
        </button>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: theme.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="sparkle" size={16} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 500, color: theme.ink }}>Pia</div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub }}>vous dictez · je classe</div>
        </div>
        <Pill color={theme.good} bg={`${theme.good}1a`}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: theme.good }} /> en ligne
        </Pill>
      </div>

      {/* Fil de conversation */}
      <div style={{ flex: 1, padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>

        {/* Date */}
        <div style={{ alignSelf: 'center', fontFamily: SANS, fontSize: 10.5, color: theme.sub, letterSpacing: 0.5, textTransform: 'uppercase', padding: '2px 10px', background: theme.surface, borderRadius: 999 }}>
          Aujourd'hui · mardi 28 mai
        </div>

        {/* Tour 1 — user dicte plusieurs choses en vrac */}
        <UserBubble theme={theme} voice time="9:14" who="L">
          Ce matin biberon de 110 à 8h30, fini en 15 minutes. Et il faut prendre RDV chez le pédiatre pour les 2 mois, et achète des lingettes lavables.
        </UserBubble>

        <PiaSay theme={theme} summary="3 éléments classés">
          Noté. J'ai créé :
        </PiaSay>

        <CreatedCard theme={theme} kind="biberon"
          title="Biberon · 110 ml"
          fields={[{k:'à', v:'8h30'}, {k:'durée', v:'15 min'}, {k:'fini', v:'oui'}]}
          who="L" />

        <CreatedCard theme={theme} kind="rdv" soft
          title="Pédiatre · visite des 2 mois"
          fields={[{k:'à programmer', v:'mi-juillet'}, {k:'demande', v:'créneau matin'}]}
          who="L" />

        <CreatedCard theme={theme} kind="course"
          title="Lingettes lavables"
          fields={[{k:'liste', v:'Puériculture'}, {k:'~', v:'12€'}]}
          who="L" />

        {/* Tour 2 — clarification proactive */}
        <PiaSay theme={theme}>
          Pour le pédiatre, je propose <b>Dr Renaud</b> (votre habituel) ou <b>Dr Costa</b> (plus proche). Tap pour réserver, sinon je le mets en "à faire".
        </PiaSay>

        <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: '86%' }}>
          <button style={{
            fontFamily: SANS, fontSize: 12, fontWeight: 500,
            padding: '6px 11px', borderRadius: 999,
            background: theme.accent, color: '#fff', border: 'none', cursor: 'pointer',
          }}>Dr Renaud</button>
          <button style={{
            fontFamily: SANS, fontSize: 12, fontWeight: 500,
            padding: '6px 11px', borderRadius: 999,
            background: 'transparent', color: theme.ink,
            border: `0.5px solid ${theme.hair}`, cursor: 'pointer',
          }}>Dr Costa</button>
          <button style={{
            fontFamily: SANS, fontSize: 12, fontWeight: 500,
            padding: '6px 11px', borderRadius: 999,
            background: 'transparent', color: theme.sub,
            border: `0.5px solid ${theme.hair}`, cursor: 'pointer',
          }}>Plus tard</button>
        </div>

        {/* Tour 3 — court */}
        <UserBubble theme={theme} time="9:16" who="L">
          change selle 9h, normal
        </UserBubble>

        <CreatedCard theme={theme} kind="change"
          title="Change · selle"
          fields={[{k:'à', v:'9h00'}, {k:'aspect', v:'normal'}]}
          who="L" />
      </div>

      {/* Composer */}
      <div style={{ padding: '8px 12px 14px', background: theme.surface, borderTop: `0.5px solid ${theme.hair}` }}>
        {/* Raccourcis rapides */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, overflowX: 'auto' }}>
          {[
            { i: 'bottle', l: 'Biberon' },
            { i: 'diaper', l: 'Change' },
            { i: 'moon', l: 'Sieste' },
            { i: 'cal', l: 'RDV' },
            { i: 'cart', l: 'Achat' },
          ].map((b, i) => (
            <button key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 10px 5px 8px', borderRadius: 999,
              background: theme.card, color: theme.ink,
              border: `0.5px solid ${theme.hair}`,
              fontFamily: SANS, fontSize: 11.5, fontWeight: 500,
              cursor: 'pointer', flexShrink: 0,
            }}>
              <Icon name={b.i} size={12} color={theme.sub} />
              {b.l}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            flex: 1, background: theme.card, borderRadius: 22, padding: '10px 14px',
            border: `0.5px solid ${theme.hair}`,
            fontFamily: SANS, fontSize: 14, color: theme.sub,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ flex: 1 }}>Dictez ou écrivez n'importe quoi…</span>
          </div>
          <button style={{
            width: 44, height: 44, borderRadius: '50%', background: theme.accent,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 6px 20px ${theme.accent}55`,
          }}>
            <Icon name="mic" size={20} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Écran 2 — Récap : tout ce que Pia a classé aujourd'hui
// ─────────────────────────────────────────────────────────────────────
function DirB_ChatInputRecap({ theme }) {
  const groups = [
    { k: 'biberon', l: 'Biberons', n: 4, items: [
      { t: '110 ml · fini', s: '8h30 · 15 min', who: 'L' },
      { t: '90 ml · refusé moitié', s: '11h45', who: 'T' },
      { t: '120 ml · fini', s: '14h20 · 22 min', who: 'L' },
      { t: '100 ml · fini', s: '17h00', who: 'T' },
    ]},
    { k: 'change', l: 'Changes', n: 5, items: [
      { t: 'Selle · normal', s: '9h00', who: 'L' },
      { t: 'Pipi', s: '11h30', who: 'T' },
      { t: 'Selle · liquide', s: '14h45', who: 'L', warn: true },
    ]},
    { k: 'rdv', l: 'RDV', n: 1, items: [
      { t: 'Pédiatre · visite 2 mois', s: 'à programmer mi-juillet', who: 'L' },
    ]},
    { k: 'course', l: 'Courses', n: 2, items: [
      { t: 'Lingettes lavables', s: 'liste Puériculture', who: 'L' },
      { t: 'Crème change Mustela', s: 'pharmacie · urgent', who: 'T' },
    ]},
    { k: 'sieste', l: 'Siestes', n: 2, items: [
      { t: '1h12 · cododo', s: '10h30 → 11h42', who: 'L' },
      { t: '45 min · poussette', s: '15h15 → 16h00', who: 'T' },
    ]},
  ];

  const KIND_C = {
    biberon: '#3f8fb3', change: theme.good, rdv: '#7a6fc0',
    course: theme.accent, sieste: '#7a6fc0', admin: theme.warn,
  };
  const KIND_I = {
    biberon: 'bottle', change: 'diaper', rdv: 'cal',
    course: 'cart', sieste: 'moon', admin: 'note',
  };

  return (
    <div style={{ background: theme.bg, minHeight: '100%', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ paddingTop: 56, padding: '56px 20px 6px' }}>
        <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase' }}>Aujourd'hui · ajouté via Pia</div>
        <div style={{ fontFamily: SERIF, fontSize: 28, color: theme.ink, letterSpacing: -0.5, marginTop: 2, lineHeight: 1.1 }}>
          14 éléments classés
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: theme.sub, marginTop: 4 }}>
          en <b>11 messages</b> · <b>2'40"</b> de dictée
        </div>
      </div>

      {/* Catégories — chip row */}
      <div style={{ padding: '14px 16px 6px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {groups.map((g, i) => {
          const c = KIND_C[g.k];
          return (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 11px 6px 8px', borderRadius: 999,
              background: `${c}15`, color: c,
              border: `0.5px solid ${c}30`,
              fontFamily: SANS, fontSize: 12, fontWeight: 600,
              flexShrink: 0,
            }}>
              <Icon name={KIND_I[g.k]} size={12} color={c} />
              {g.l}
              <span style={{ fontFamily: MONO, fontSize: 10.5, opacity: 0.7 }}>{g.n}</span>
            </div>
          );
        })}
      </div>

      {/* Groupes */}
      {groups.map((g, gi) => {
        const c = KIND_C[g.k];
        return (
          <div key={gi} style={{ margin: '14px 16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '4px 4px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name={KIND_I[g.k]} size={14} color={c} />
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: theme.ink, letterSpacing: 0.1 }}>{g.l}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: theme.sub }}>{g.n}</span>
              </div>
              <span style={{ fontFamily: SANS, fontSize: 12, color: c, fontWeight: 500 }}>Voir tout</span>
            </div>
            <div style={{ background: theme.card, borderRadius: 16, border: `0.5px solid ${theme.hair}`, overflow: 'hidden' }}>
              {g.items.map((it, i, arr) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${theme.hair}`,
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: it.warn ? theme.warn : c, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: SANS, fontSize: 13.5, color: theme.ink, fontWeight: 500 }}>{it.t}</div>
                    <div style={{ fontFamily: SANS, fontSize: 11.5, color: theme.sub, marginTop: 1 }}>{it.s}</div>
                  </div>
                  <Avatar who={it.who} size={16} />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* FAB — retour au chat */}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 18 }}>
        <button style={{
          width: '100%', background: theme.accent, color: '#fff',
          border: 'none', cursor: 'pointer',
          borderRadius: 22, padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: SANS, fontSize: 14, fontWeight: 600,
          boxShadow: `0 8px 26px ${theme.accent}55`,
        }}>
          <Icon name="mic" size={18} color="#fff" />
          Continuer à dicter à Pia
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { DirB_ChatInputCreate, DirB_ChatInputRecap, CreatedCard });
