// direction-b-deep.jsx — Approfondissements de la Direction B
// Screens: 1) Tout à faire (partagé, catégorisé)
//          2) Courses (liste dense, sections, qui achète quoi)
//          3) Demander à Pia (Q&A sur l'historique du bébé)

// ───────────────────────────────────────────────────────────────
// Écran 1 — "Tout à faire" partagé, catégorisé
// ───────────────────────────────────────────────────────────────
function DirB_Todo({ theme }) {
  return (
    <div style={{ background: theme.bg, minHeight: '100%', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ paddingTop: 56, padding: '56px 20px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase' }}>Léa & Thomas · partagé</div>
            <div style={{ fontFamily: SERIF, fontSize: 28, color: theme.ink, letterSpacing: -0.5, marginTop: 2, lineHeight: 1.1 }}>
              Tout à faire
            </div>
          </div>
          <AvatarStack list={['L','T']} size={26} />
        </div>

        {/* Stat row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, fontFamily: SANS }}>
          <Stat theme={theme} big="22" sub="à faire" />
          <Stat theme={theme} big="34" sub="terminées" muted />
          <Stat theme={theme} big="4" sub="urgentes" accent />
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ padding: '14px 16px 4px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {[
          { l: 'Tout', n: 22, on: true },
          { l: 'Moi · L', n: 12 },
          { l: 'Thomas', n: 6 },
          { l: 'Partagés', n: 4 },
        ].map((t, i) => (
          <button key={i} style={{
            fontFamily: SANS, fontSize: 13, fontWeight: 500,
            padding: '6px 12px', borderRadius: 999,
            background: t.on ? theme.ink : 'transparent',
            color: t.on ? theme.bg : theme.sub,
            border: t.on ? 'none' : `0.5px solid ${theme.hair}`,
            cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {t.l}
            <span style={{ fontSize: 11, opacity: 0.7, fontFamily: MONO }}>{t.n}</span>
          </button>
        ))}
      </div>

      {/* Sections */}
      <CategorySection theme={theme} icon="cart" title="Courses & achats" done={8} total={23} urgent={3} items={[
        { t: 'Coton bio non blanchi', s: 'pharmacie · ×2', who: 'L', urgent: true },
        { t: 'Sérum physiologique', s: 'pharmacie · ×40 doses', who: 'L', urgent: true },
        { t: 'Matelas à langer', s: 'Aubert · 89€', who: 'T' },
        { t: 'Veilleuse', s: 'cherche Léa', who: 'L', star: true },
        { t: 'Lingettes lavables ×20', s: 'Etsy', who: 'L' },
      ]} more={18} />

      <CategorySection theme={theme} icon="note" title="Démarches admin" done={2} total={7} urgent={1} items={[
        { t: 'Déclaration grossesse mairie', s: 'avant SA 28', who: 'T', urgent: true, sugg: true },
        { t: 'Mutuelle · ajouter bébé', s: 'pré-rempli par Pia', who: 'T', sugg: true },
        { t: 'Choisir la maternité', s: 'décision · 3 options', who: 'LT' },
      ]} more={4} />

      <CategorySection theme={theme} icon="cal" title="Médical & RDV" done={4} total={9} items={[
        { t: 'Échographie morpho · S24', s: 'aujourd\'hui 14h30 · Dr Lefort', who: 'LT', today: true },
        { t: 'Test glycémie', s: 'à programmer · avant SA 28', who: 'L' },
        { t: 'Cours de préparation #2', s: 'mardi prochain', who: 'LT' },
      ]} more={6} />

      <CategorySection theme={theme} icon="milestone" title="Préparation à la naissance" done={5} total={11} items={[
        { t: 'Choisir le prénom', s: '3 finalistes · décision', who: 'LT', star: true },
        { t: 'Préparer la chambre', s: 'fini la peinture, monter le lit', who: 'T' },
        { t: 'Valise maternité', s: '6 articles restants', who: 'L' },
      ]} more={8} />

      <CategorySection theme={theme} icon="note" title="Lectures & podcasts" done={3} total={6} items={[
        { t: 'Le mois d\'or — Céline Chadelat', s: 'recommandé par Pia', who: 'L', sugg: true },
        { t: 'Podcast La Matrescence · ep. 12', s: '42 min', who: 'L' },
      ]} more={1} />

      {/* Bottom add bar */}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 18 }}>
        <div style={{
          background: theme.card, borderRadius: 22, padding: '8px 8px 8px 16px',
          border: `0.5px solid ${theme.hair}`,
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Icon name="plus" size={18} color={theme.sub} />
          <span style={{ fontFamily: SANS, fontSize: 14, color: theme.sub, flex: 1 }}>Ajouter ou dicter…</span>
          <button style={{ width: 38, height: 38, borderRadius: '50%', background: theme.accent, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="mic" size={18} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ theme, big, sub, accent, muted }) {
  return (
    <div style={{ flex: 1, background: theme.card, borderRadius: 14, padding: '10px 12px', border: `0.5px solid ${theme.hair}` }}>
      <div style={{
        fontFamily: SERIF, fontSize: 22, lineHeight: 1, letterSpacing: -0.4,
        color: accent ? theme.accent : muted ? theme.sub : theme.ink,
      }}>{big}</div>
      <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function CategorySection({ theme, icon, title, done, total, urgent, items, more }) {
  const pct = (done / total) * 100;
  return (
    <div style={{ margin: '14px 16px 0' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px 8px' }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: theme.soft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={14} color={theme.ink} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: SANS, fontSize: 13, color: theme.ink, fontWeight: 600, letterSpacing: 0.1 }}>{title}</span>
            {urgent > 0 && <Pill color={theme.accent} bg={theme.accentSoft}>{urgent}</Pill>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 60, height: 3, borderRadius: 2, background: theme.hair, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: theme.accent, borderRadius: 2 }} />
          </div>
          <span style={{ fontFamily: MONO, fontSize: 11, color: theme.sub, fontVariantNumeric: 'tabular-nums' }}>{done}/{total}</span>
        </div>
      </div>

      {/* Items */}
      <div style={{ background: theme.card, borderRadius: 16, border: `0.5px solid ${theme.hair}`, overflow: 'hidden' }}>
        {items.map((it, i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i === arr.length - 1 && !more ? 'none' : `0.5px solid ${theme.hair}` }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              border: `1.5px solid ${it.urgent ? theme.accent : theme.hair}`,
              background: it.sugg ? theme.accentSoft : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {it.sugg && <Icon name="sparkle" size={10} color={theme.accent} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontFamily: SANS, fontSize: 13.5, color: theme.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.t}</span>
                {it.star && <span style={{ color: theme.warn, fontSize: 11 }}>★</span>}
                {it.today && <Pill color={theme.accent} bg={theme.accentSoft}>aujourd'hui</Pill>}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11.5, color: theme.sub, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.s}</div>
            </div>
            <AvatarStack list={it.who.split('')} size={16} />
          </div>
        ))}
        {more && (
          <div style={{ padding: '8px 14px', textAlign: 'center', fontFamily: SANS, fontSize: 12, color: theme.accent, fontWeight: 500 }}>
            + {more} autres
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Écran 2 — Courses (liste dense, sections)
// ───────────────────────────────────────────────────────────────
function DirB_CoursesList({ theme }) {
  const sections = [
    { l: 'Puériculture', n: '9 articles · ≈340€', items: [
      { t: 'Lit cododo Babybay', s: '189€ · Doudouplanet', who: 'T', done: true },
      { t: 'Matelas à langer', s: '89€ · Aubert', who: 'T' },
      { t: 'Veilleuse Béaba', s: 'cherche Léa', who: 'L', star: true },
      { t: 'Mobile musical', s: '~30€', who: 'L' },
      { t: 'Babyphone', s: 'Tommee Tippee · Amazon', who: 'T', sugg: true },
    ]},
    { l: 'Pharmacie', n: '5 articles · urgent', urgent: true, items: [
      { t: 'Coton bio non blanchi ×2', s: 'avant la valise mater', who: 'L', urgent: true },
      { t: 'Sérum physiologique', s: '×40 doses', who: 'L', urgent: true },
      { t: 'Liniment oléo-calcaire', s: 'flacon 500ml', who: 'L', urgent: true, sugg: true },
      { t: 'Thermomètre', s: '~15€', who: 'T' },
    ]},
    { l: 'Vêtements 0-3m', n: '6 ensembles', items: [
      { t: 'Bodys manches longues ×5', s: 'taille 1m', who: 'L', done: true },
      { t: 'Pyjamas naissance ×4', s: 'mix coton', who: 'L' },
      { t: 'Brassières laine', s: 'cadeau mamie', who: 'L', done: true },
      { t: 'Chaussettes ×3 paires', s: '', who: 'L' },
    ]},
    { l: 'Maternité', n: '3 articles', items: [
      { t: 'Chemise de nuit allaitement', s: '×2', who: 'L' },
      { t: 'Brassières d\'allaitement', s: '×3', who: 'L' },
    ]},
  ];

  return (
    <div style={{ background: theme.bg, minHeight: '100%', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ paddingTop: 56, padding: '56px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase' }}>Liste partagée</div>
            <div style={{ fontFamily: SERIF, fontSize: 28, color: theme.ink, letterSpacing: -0.5, marginTop: 2, lineHeight: 1.1 }}>
              Courses & achats
            </div>
          </div>
          <AvatarStack list={['L','T']} size={26} />
        </div>

        {/* Progress */}
        <div style={{ marginTop: 14, background: theme.card, borderRadius: 14, padding: '12px 14px', border: `0.5px solid ${theme.hair}` }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: SANS, fontSize: 12, color: theme.sub }}>15 / 23 articles · ≈ 340€ dépensés</span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: theme.accent, fontWeight: 600 }}>65%</span>
          </div>
          <div style={{ height: 4, background: theme.hair, borderRadius: 2, overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: '65%', background: theme.accent }} />
          </div>
        </div>
      </div>

      {/* Sections */}
      {sections.map((sec, i) => (
        <div key={i} style={{ margin: '16px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '6px 4px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: SANS, fontSize: 13, color: theme.ink, fontWeight: 600, letterSpacing: 0.1 }}>{sec.l}</span>
              {sec.urgent && <Pill color={theme.accent} bg={theme.accentSoft}>urgent</Pill>}
            </div>
            <span style={{ fontFamily: SANS, fontSize: 11.5, color: theme.sub }}>{sec.n}</span>
          </div>
          <div style={{ background: theme.card, borderRadius: 16, border: `0.5px solid ${theme.hair}`, overflow: 'hidden' }}>
            {sec.items.map((it, j, arr) => (
              <CoursesRow key={j} theme={theme} it={it} isLast={j === arr.length - 1} />
            ))}
          </div>
        </div>
      ))}

      {/* Bottom — Pia adds */}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 18 }}>
        <div style={{
          background: theme.accentSoft, borderRadius: 16, padding: '10px 14px',
          border: `0.5px solid ${theme.accent}33`,
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
        }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="sparkle" size={12} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SANS, fontSize: 12.5, color: theme.ink, lineHeight: 1.35 }}>
              "Vous passez devant la pharmacie ?" <span style={{ color: theme.sub }}>3 articles urgents groupés</span>
            </div>
          </div>
          <button style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: '#fff', background: theme.accent, border: 'none', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function CoursesRow({ theme, it, isLast }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '11px 14px',
      borderBottom: isLast ? 'none' : `0.5px solid ${theme.hair}`,
      opacity: it.done ? 0.55 : 1,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 5,
        border: `1.5px solid ${it.done ? theme.good : it.urgent ? theme.accent : theme.hair}`,
        background: it.done ? theme.good : it.sugg ? theme.accentSoft : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {it.done && <Icon name="check" size={11} color="#fff" w={2.2} />}
        {!it.done && it.sugg && <Icon name="sparkle" size={10} color={theme.accent} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontFamily: SANS, fontSize: 13.5, color: theme.ink, fontWeight: 500, textDecoration: it.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.t}</span>
          {it.star && <span style={{ color: theme.warn, fontSize: 11 }}>★</span>}
        </div>
        {it.s && <div style={{ fontFamily: SANS, fontSize: 11.5, color: theme.sub, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.s}</div>}
      </div>
      <Avatar who={it.who} size={16} />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Écran 3 — Demander à Pia (Q&A sur l'historique du bébé)
// ───────────────────────────────────────────────────────────────
function DirB_AskPia({ theme }) {
  // Sample hour-by-hour intake (24h)
  const intake = [80, 0, 0, 110, 0, 0, 90, 0, 0, 0, 100, 0, 0, 70, 0, 0, 0, 90, 0, 0, 110, 0, 0, 90];
  const maxBar = Math.max(...intake);
  const total = intake.reduce((a,b) => a+b, 0);

  return (
    <div style={{ background: theme.bg, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ paddingTop: 56, padding: '56px 18px 12px', borderBottom: `0.5px solid ${theme.hair}`, background: theme.surface }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}aa)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="sparkle" size={18} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 500, color: theme.ink, letterSpacing: -0.2 }}>Demander à Pia</div>
            <div style={{ fontFamily: SANS, fontSize: 11.5, color: theme.sub }}>Connaît tout l'historique de Lucie</div>
          </div>
        </div>

        {/* Suggested questions */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto' }}>
          {['Aujourd\'hui ?','Hier ?','Cette semaine','Compare aux 7 derniers jours','Sommeil cette nuit'].map((q, i) => (
            <button key={i} style={{
              fontFamily: SANS, fontSize: 12, fontWeight: 500,
              padding: '6px 11px', borderRadius: 999,
              background: theme.soft, color: theme.ink,
              border: `0.5px solid ${theme.hair}`,
              cursor: 'pointer', flexShrink: 0,
            }}>{q}</button>
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div style={{ flex: 1, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* User question */}
        <div style={{
          alignSelf: 'flex-end', background: theme.accent, color: '#fff',
          borderRadius: '18px 18px 4px 18px', padding: '9px 13px',
          fontFamily: SANS, fontSize: 14, maxWidth: '82%',
        }}>
          Combien Lucie a mangé hier ?
        </div>
        <div style={{ alignSelf: 'flex-end', fontFamily: SANS, fontSize: 10.5, color: theme.sub, marginRight: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Avatar who="T" size={12} /> 22:14
        </div>

        {/* Pia answer — short text + viz */}
        <div style={{
          alignSelf: 'flex-start', background: theme.soft, color: theme.ink,
          borderRadius: '18px 18px 18px 4px', padding: '12px 14px',
          maxWidth: '90%', fontFamily: SANS, fontSize: 14, lineHeight: 1.45,
        }}>
          Hier, Lucie a bu <b>{total} ml</b> répartis sur <b>{intake.filter(v=>v).length} biberons</b>.<br/>
          C'est <b style={{ color: theme.good }}>+8% par rapport à la moyenne</b> des 7 derniers jours.
        </div>

        {/* Viz card */}
        <div style={{
          alignSelf: 'flex-start', maxWidth: '92%',
          background: theme.card, borderRadius: 18, padding: '14px',
          border: `0.5px solid ${theme.hair}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600 }}>Hier · 23 mai</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: theme.sub }}>00h → 24h</span>
          </div>
          {/* Hour-by-hour bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 64 }}>
            {intake.map((v, i) => (
              <div key={i} style={{
                flex: 1, height: v ? `${(v/maxBar)*100}%` : 2,
                background: v ? theme.accent : theme.hair,
                borderRadius: 1.5, opacity: v ? 1 : 1,
                minHeight: 2,
              }} title={`${i}h · ${v}ml`} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: MONO, fontSize: 9.5, color: theme.sub }}>
            <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>24h</span>
          </div>

          {/* Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14, paddingTop: 12, borderTop: `0.5px solid ${theme.hair}` }}>
            {[
              { l: 'Plus gros', v: '110ml', sub: '03h · 20h' },
              { l: 'Intervalle', v: '3h12', sub: 'moyen' },
              { l: 'Reste nuit', v: '4h47', sub: 'sommeil' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily: SANS, fontSize: 10, color: theme.sub, letterSpacing: 0.3, textTransform: 'uppercase' }}>{s.l}</div>
                <div style={{ fontFamily: SERIF, fontSize: 17, color: theme.ink, marginTop: 2, letterSpacing: -0.3 }}>{s.v}</div>
                <div style={{ fontFamily: SANS, fontSize: 10.5, color: theme.sub, marginTop: 1 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up suggestions */}
        <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: '92%' }}>
          {['Et le sommeil ?', 'Compare aux 7 derniers jours', 'Tendance sur 2 semaines'].map((q, i) => (
            <button key={i} style={{
              fontFamily: SANS, fontSize: 12, fontWeight: 500,
              padding: '6px 10px', borderRadius: 999,
              background: 'transparent', color: theme.accent,
              border: `0.5px solid ${theme.accent}55`, cursor: 'pointer',
            }}>{q}</button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div style={{ padding: '10px 12px 14px', background: theme.surface, borderTop: `0.5px solid ${theme.hair}` }}>
        <div style={{
          flex: 1, background: theme.card, borderRadius: 22, padding: '10px 14px',
          border: `0.5px solid ${theme.hair}`,
          fontFamily: SANS, fontSize: 14, color: theme.sub,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ flex: 1 }}>Demander à propos de Lucie…</span>
          <Icon name="mic" size={18} color={theme.accent} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DirB_Todo, DirB_CoursesList, DirB_AskPia });
