// direction-b.jsx — B · Dashboard-first
// Home cards with proactive briefing + tracking, chat is secondary (FAB).
// Screens: 1) Dashboard  2) Tracking · journée  3) Chat sheet (compact)

function DirB_Dashboard({ theme, density }) {
  const D = DENSITY[density];

  return (
    <div style={{ background: theme.bg, minHeight: '100%', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ paddingTop: 56, padding: '56px 20px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontSize: 12, color: theme.sub, letterSpacing: 0.3, textTransform: 'uppercase' }}>Mardi 28 mai</div>
            <div style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.05, color: theme.ink, letterSpacing: -0.6, marginTop: 4 }}>
              Bonjour Léa.
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.3, color: theme.sub, marginTop: 2 }}>
              Semaine 24 · jour 3
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <AvatarStack list={['L','T']} size={28} />
          </div>
        </div>
      </div>

      {/* Briefing du jour — agent voice */}
      <div style={{ margin: '14px 16px 0', background: theme.card, borderRadius: 22, padding: 18, border: `0.5px solid ${theme.hair}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkle" size={12} color="#fff" />
          </div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: theme.accent, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Pia · briefing</div>
          <div style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, color: theme.sub }}>7:42</div>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.4, color: theme.ink }}>
          Vous avez <b>14 choses à faire</b> cette semaine et <b>23 articles</b> dans la liste partagée. Je vous en propose <b>3 aujourd'hui</b> — le reste peut attendre.
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <button style={chip(theme, true)}>Voir les 3</button>
          <button style={chip(theme)}>Tout à faire</button>
          <button style={chip(theme)}>Plus tard</button>
        </div>
      </div>

      {/* Anticipation */}
      <div style={{ padding: '16px 16px 6px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <MiniCard theme={theme} title="Prochain RDV" big="14:30" sub="Gynéco · Dr Lefort" tag="Aujourd'hui" tagColor={theme.accent} icon="cal" />
        <MiniCard theme={theme} title="Bébé · S24" big="30cm" sub="≈ 600g · épi de maïs" tag="+0,5cm" tagColor={theme.good} icon="belly" />
      </div>

      {/* Tout à faire — partagé, vue d'ensemble */}
      <div style={{ margin: '8px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '12px 4px 8px' }}>
          <div style={{ fontFamily: SANS, fontSize: 12, color: theme.sub, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600 }}>Tout à faire · partagé</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <AvatarStack list={['L','T']} size={16} />
            <span style={{ fontFamily: SANS, fontSize: 12, color: theme.accent, fontWeight: 500 }}>Ouvrir</span>
          </div>
        </div>

        <div style={{ background: theme.card, borderRadius: 18, border: `0.5px solid ${theme.hair}`, overflow: 'hidden' }}>
          {[
            { i: 'cart', l: 'Courses & achètes',   done: 8,  total: 23, who: 'LT', urgent: 3 },
            { i: 'note', l: 'Démarches admin',      done: 2,  total: 7,  who: 'T',  urgent: 1 },
            { i: 'cal',  l: 'Médical & RDV',        done: 4,  total: 9,  who: 'L',  urgent: 0 },
            { i: 'milestone', l: 'Préparation à la naissance', done: 5, total: 11, who: 'LT', urgent: 0 },
            { i: 'note', l: 'Lectures & podcasts',  done: 3,  total: 6,  who: 'L',  urgent: 0 },
          ].map((c, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${theme.hair}` }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: theme.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={c.i} size={16} color={theme.ink} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: SANS, fontSize: 14, color: theme.ink, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.l}</span>
                  {c.urgent > 0 && <Pill color={theme.accent} bg={theme.accentSoft}>{c.urgent} urgent{c.urgent>1?'s':''}</Pill>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: theme.hair, overflow: 'hidden' }}>
                    <div style={{ width: `${(c.done/c.total)*100}%`, height: '100%', background: theme.accent, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: theme.sub, flexShrink: 0 }}>{c.done}/{c.total}</span>
                </div>
              </div>
              <AvatarStack list={c.who.split('')} size={16} />
            </div>
          ))}
        </div>
      </div>

      {/* Aujourd'hui — les 3 proposés */}
      <div style={{ margin: '16px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '4px 4px 6px' }}>
          <div style={{ fontFamily: SANS, fontSize: 12, color: theme.sub, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600 }}>Pia propose · aujourd'hui</div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: theme.accent, fontWeight: 500 }}>3</div>
        </div>
        <div style={{ background: theme.card, borderRadius: 18, padding: '4px 16px', border: `0.5px solid ${theme.hair}` }}>
          {[
            { t: 'Confirmer le RDV gynéco', s: 'aujourd\'hui · 14h30 · Dr Lefort', who: 'L', sugg: false, badge: 'med' },
            { t: 'Acheter le matériel pour la valise', s: 'pharmacie → coton, sérum physio (2 articles)', who: 'L', sugg: true, badge: 'cart' },
            { t: 'Signer la déclaration mairie', s: 'pré-rempli par Pia · à transmettre', who: 'T', sugg: true, badge: 'note' },
          ].map((it, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${theme.hair}` }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${it.sugg ? theme.accent : theme.hair}`,
                background: it.sugg ? theme.accentSoft : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {it.sugg && <Icon name="sparkle" size={11} color={theme.accent} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontSize: 14.5, color: theme.ink, fontWeight: 500 }}>{it.t}</div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: theme.sub, marginTop: 1 }}>{it.s}</div>
              </div>
              <Avatar who={it.who} size={20} />
            </div>
          ))}
        </div>
      </div>

      {/* FAB — chat */}
      <div style={{
        position: 'absolute', right: 18, bottom: 26, zIndex: 10,
      }}>
        <button style={{
          width: 60, height: 60, borderRadius: '50%', background: theme.accent,
          border: 'none', cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(201,100,66,0.4), 0 2px 6px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="sparkle" size={26} color="#fff" />
        </button>
      </div>
    </div>
  );
}

function chip(theme, active = false) {
  return {
    fontFamily: SANS, fontSize: 12.5, fontWeight: 500,
    padding: '6px 11px', borderRadius: 999,
    background: active ? theme.ink : 'transparent',
    color: active ? theme.bg : theme.sub,
    border: active ? 'none' : `0.5px solid ${theme.hair}`,
    cursor: 'pointer',
  };
}

function MiniCard({ theme, title, big, sub, tag, tagColor, icon }) {
  return (
    <div style={{ background: theme.card, borderRadius: 18, padding: 14, border: `0.5px solid ${theme.hair}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: SANS, fontSize: 11.5, color: theme.sub, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600 }}>{title}</span>
        <Icon name={icon} size={16} color={theme.sub} />
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 26, color: theme.ink, lineHeight: 1, letterSpacing: -0.6 }}>{big}</div>
      <div style={{ fontFamily: SANS, fontSize: 12, color: theme.sub, marginTop: 4 }}>{sub}</div>
      {tag && (
        <div style={{ marginTop: 8 }}>
          <Pill color={tagColor} bg={tagColor + '18'}>{tag}</Pill>
        </div>
      )}
    </div>
  );
}

function TrackRow({ theme, icon, title, detail, who, time, warn }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: warn ? '#b67a2c22' : theme.soft,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={icon} size={18} color={warn ? theme.warn : theme.ink} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: SANS, fontSize: 14.5, color: theme.ink, fontWeight: 500 }}>{title}</div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: theme.sub, marginTop: 1 }}>{detail}</div>
      </div>
      {who && <Avatar who={who} size={20} />}
      {time && <span style={{ fontFamily: MONO, fontSize: 11, color: theme.sub }}>{time}</span>}
    </div>
  );
}

function Sep({ theme }) {
  return <div style={{ height: 0.5, background: theme.hair, marginLeft: 60 }} />;
}

// ─── Screen 2 — Tracking journée (post-naissance preview) ───
function DirB_Tracking({ theme }) {
  return (
    <div style={{ background: theme.bg, minHeight: '100%' }}>
      <div style={{ paddingTop: 56, padding: '56px 20px 12px' }}>
        <div style={{ fontFamily: SANS, fontSize: 12, color: theme.sub, letterSpacing: 0.3, textTransform: 'uppercase' }}>Aujourd'hui · 18 oct</div>
        <div style={{ fontFamily: SERIF, fontSize: 28, color: theme.ink, letterSpacing: -0.5, marginTop: 2 }}>Lucie · J32</div>
      </div>

      {/* Stats summary */}
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { i: 'bottle', n: '6', s: '×120ml', c: theme.accent },
          { i: 'diaper', n: '7', s: '2 selles', c: theme.good },
          { i: 'moon', n: '4h32', s: 'sieste', c: '#7a6fc0' },
        ].map((m, i) => (
          <div key={i} style={{ background: theme.card, borderRadius: 16, padding: 12, border: `0.5px solid ${theme.hair}`, textAlign: 'center' }}>
            <Icon name={m.i} size={18} color={m.c} />
            <div style={{ fontFamily: SERIF, fontSize: 22, color: theme.ink, marginTop: 4, letterSpacing: -0.4 }}>{m.n}</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, marginTop: 1 }}>{m.s}</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontFamily: SANS, fontSize: 12, color: theme.sub, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600, padding: '4px 4px 8px' }}>Dernières actions</div>
        <div style={{ background: theme.card, borderRadius: 18, border: `0.5px solid ${theme.hair}`, overflow: 'hidden' }}>
          {[
            { t: '12:40', i: 'bottle', l: 'Biberon · 110ml', s: 'fini en 14 min', who: 'T' },
            { t: '12:05', i: 'diaper', l: 'Change · pipi', s: '', who: 'L' },
            { t: '10:30', i: 'moon', l: 'Sieste · 1h12', s: 'lit cododo', who: 'L' },
            { t: '09:15', i: 'bottle', l: 'Biberon · 120ml', s: 'fini', who: 'L' },
            { t: '08:40', i: 'diaper', l: 'Change · selle', s: 'normale', who: 'T' },
          ].map((e, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${theme.hair}` }}>
              <span style={{ fontFamily: MONO, fontSize: 11.5, color: theme.sub, width: 42 }}>{e.t}</span>
              <div style={{
                width: 30, height: 30, borderRadius: 9, background: theme.soft,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon name={e.i} size={16} color={theme.ink} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SANS, fontSize: 14, color: theme.ink, fontWeight: 500 }}>{e.l}</div>
                {e.s && <div style={{ fontFamily: SANS, fontSize: 11.5, color: theme.sub }}>{e.s}</div>}
              </div>
              <Avatar who={e.who} size={18} />
            </div>
          ))}
        </div>
      </div>

      {/* Quick log */}
      <div style={{ position: 'absolute', bottom: 28, left: 16, right: 16, display: 'flex', gap: 8 }}>
        {[
          { i: 'bottle', l: 'Biberon' },
          { i: 'diaper', l: 'Change' },
          { i: 'moon', l: 'Sieste' },
          { i: 'sparkle', l: 'Pia', primary: true },
        ].map((b, i) => (
          <button key={i} style={{
            flex: b.primary ? 0 : 1,
            width: b.primary ? 52 : 'auto',
            fontFamily: SANS, fontSize: 12.5, fontWeight: 500,
            padding: '10px 8px', borderRadius: 14,
            background: b.primary ? theme.accent : theme.card,
            color: b.primary ? '#fff' : theme.ink,
            border: `0.5px solid ${b.primary ? 'transparent' : theme.hair}`,
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          }}>
            <Icon name={b.i} size={18} color={b.primary ? '#fff' : theme.ink} />
            {!b.primary && <span>{b.l}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Screen 3 — Chat sheet (compact) ───
function DirB_ChatSheet({ theme }) {
  return (
    <div style={{ background: theme.bg, minHeight: '100%', position: 'relative' }}>
      {/* Dashboard dim behind */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none' }}>
        <DirB_Dashboard theme={theme} density="regular" />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(41,38,27,0.22)' }} />

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, top: 110,
        background: theme.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: '14px 16px 14px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: theme.hair, margin: '0 auto 12px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: `0.5px solid ${theme.hair}` }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sparkle" size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: theme.ink, fontWeight: 500 }}>Pia</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub }}>répond en quelques secondes</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '14px 0 0', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
          <Bubble theme={theme} agent>Bonjour Léa. Vous avez un RDV à 14h30 — je peux préparer vos questions ?</Bubble>
          <Bubble theme={theme}>Oui s'il te plaît. Et rappelle moi de prendre la carte vitale</Bubble>
          <Bubble theme={theme} agent>Noté. <Pill color={theme.accent} bg={theme.accentSoft} style={{ marginLeft: 4 }}>rappel · 13:45</Pill></Bubble>
          <Bubble theme={theme} agent>Voici les 6 questions, basées sur votre dernier RDV et la semaine 24 :</Bubble>
          <div style={{ background: theme.soft, borderRadius: 14, padding: '10px 12px', maxWidth: '85%', alignSelf: 'flex-start' }}>
            <div style={{ fontFamily: SERIF, fontSize: 13.5, color: theme.ink, lineHeight: 1.5 }}>
              1. Position du bébé ?<br/>
              2. Reflux nocturnes ?<br/>
              3. Test du diabète gest. ?<br/>
              <span style={{ color: theme.sub }}>+ 3 autres</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '10px 0 0', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            flex: 1, background: theme.card, borderRadius: 22, padding: '10px 14px',
            border: `0.5px solid ${theme.hair}`,
            fontFamily: SANS, fontSize: 14, color: theme.sub,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ flex: 1 }}>Écrire ou dicter…</span>
            <Icon name="mic" size={18} color={theme.accent} />
          </div>
          <button style={{
            width: 42, height: 42, borderRadius: '50%', background: theme.accent,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="send" size={18} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ theme, agent, children }) {
  return (
    <div style={{
      alignSelf: agent ? 'flex-start' : 'flex-end',
      background: agent ? theme.soft : theme.accent,
      color: agent ? theme.ink : '#fff',
      borderRadius: agent ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
      padding: '8px 12px', maxWidth: '82%',
      fontFamily: SANS, fontSize: 13.5, lineHeight: 1.4,
    }}>{children}</div>
  );
}

Object.assign(window, { DirB_Dashboard, DirB_Tracking, DirB_ChatSheet });
