// direction-b-plus-health.jsx — 🩺 Santé : patterns, médicaments, urgence
// Screens: 1) Vigilance — patterns détectés par Pia + carnet santé
//          2) Médicaments / urgence (SOS)

// ─── 1) Vigilance — patterns + carnet santé ──────────────────────────
function DirB_Vigilance({ theme }) {
  return (
    <div style={{ background: theme.bg, minHeight: '100%', paddingBottom: 30 }}>
      {/* Header */}
      <div style={{ paddingTop: 56, padding: '56px 20px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase' }}>Santé · Lucie · J32</div>
            <div style={{ fontFamily: SERIF, fontSize: 28, color: theme.ink, letterSpacing: -0.5, marginTop: 4, lineHeight: 1.1 }}>Vigilance</div>
          </div>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 12px', borderRadius: 999,
            background: '#c9442218', color: '#c94422',
            border: 'none', cursor: 'pointer',
            fontFamily: SANS, fontSize: 12, fontWeight: 600,
          }}>
            <Icon name="flame" size={13} color="#c94422" />
            SOS
          </button>
        </div>
      </div>

      {/* Alertes — patterns détectés */}
      <div style={{ padding: '4px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Alerte urgente */}
        <div style={{
          background: theme.card, borderRadius: 18, overflow: 'hidden',
          border: `0.5px solid ${theme.warn}40`,
          boxShadow: `0 0 0 3px ${theme.warn}10`,
        }}>
          <div style={{ padding: '12px 14px', background: `${theme.warn}10`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="sparkle" size={13} color={theme.warn} />
            <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: theme.warn, letterSpacing: 0.4, textTransform: 'uppercase' }}>À surveiller</span>
            <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 10.5, color: theme.sub }}>repéré il y a 2h</span>
          </div>
          <div style={{ padding: '12px 14px' }}>
            <div style={{ fontFamily: SERIF, fontSize: 16, color: theme.ink, lineHeight: 1.4 }}>
              <b>Pas de selle depuis 52h.</b> En général Lucie passe toutes les 24-36h.
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button style={chipB(theme, true)}>Voir le pédiatre</button>
              <button style={chipB(theme)}>Conseils Pia</button>
              <button style={chipB(theme)}>Ignorer</button>
            </div>
            <SourceFooter theme={theme} org="HAS" title="Constipation du nourrisson" year={2023} />
          </div>
        </div>

        {/* Patterns secondaires */}
        {[
          { c: theme.warn, t: 'Biberon refusé 3 fois cette semaine', s: 'créneau 23h-minuit · 70 ml en moyenne', i: 'bottle' },
          { c: theme.good, t: 'Sommeil en consolidation', s: 'cycles allongés de 12 min sur 7 jours', i: 'moon' },
          { c: theme.sub,  t: 'Poids · prochaine pesée demain', s: '4.2 kg lundi · +180g/sem (P50)', i: 'heart' },
        ].map((it, i) => (
          <div key={i} style={{
            background: theme.card, borderRadius: 16, padding: '12px 14px',
            border: `0.5px solid ${theme.hair}`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `${it.c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={it.i} size={16} color={it.c} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: SANS, fontSize: 13.5, color: theme.ink, fontWeight: 500 }}>{it.t}</div>
              <div style={{ fontFamily: SANS, fontSize: 11.5, color: theme.sub, marginTop: 1 }}>{it.s}</div>
            </div>
            <Icon name="arrow" size={14} color={theme.sub} />
          </div>
        ))}
      </div>

      {/* Carnet santé — accès rapides */}
      <div style={{ margin: '20px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px 8px' }}>
          <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>Carnet de santé</div>
          <span style={{ fontFamily: SANS, fontSize: 12, color: theme.accent, fontWeight: 500 }}>Ouvrir</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { l: 'Vaccins', s: 'DTP à 2 mois', icon: 'milestone', d: 'dans 4 sem' },
            { l: 'Allergies', s: 'aucune connue', icon: 'flame', d: '—' },
            { l: 'Pédiatre', s: 'Dr Renaud', icon: 'cal', d: 'visite J60 prévue' },
            { l: 'Ordonnances', s: '2 actives', icon: 'note', d: 'vit. D · dom­péridone' },
          ].map((c, i) => (
            <div key={i} style={{ background: theme.card, borderRadius: 14, padding: '12px 14px', border: `0.5px solid ${theme.hair}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600 }}>{c.l}</span>
                <Icon name={c.icon} size={13} color={theme.sub} />
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 15, color: theme.ink, marginTop: 8, lineHeight: 1.25 }}>{c.s}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, marginTop: 4 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Courbe miniature */}
      <div style={{ margin: '14px 16px 0', background: theme.card, borderRadius: 18, padding: '14px 16px', border: `0.5px solid ${theme.hair}` }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600 }}>Courbe de poids (OMS)</div>
          <span style={{ fontFamily: MONO, fontSize: 11, color: theme.good, fontWeight: 600 }}>P50</span>
        </div>
        <GrowthMini theme={theme} />
        <SourceFooter theme={theme} org="Carnet de santé" title="modèle 2024 · courbes OMS" />
      </div>
    </div>
  );
}

function GrowthMini({ theme }) {
  // Mini sparkline with OMS percentile band
  const pts = [3.2, 3.4, 3.55, 3.7, 3.85, 4.05, 4.2];
  const w = 320, h = 70;
  const min = 2.8, max = 5;
  const x = i => (i / (pts.length - 1)) * w;
  const y = v => h - ((v - min) / (max - min)) * h;
  const path = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');

  // P10 and P90 bands
  const p90 = [3.5, 3.75, 4.0, 4.2, 4.4, 4.65, 4.85];
  const p10 = [2.95, 3.15, 3.3, 3.5, 3.7, 3.9, 4.05];
  const bandTop = p90.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  const bandBot = p10.slice().reverse().map((v, i) => `L ${x(pts.length - 1 - i)} ${y(v)}`).join(' ');

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h + 18}`} style={{ marginTop: 8, display: 'block' }}>
      <path d={`${bandTop} ${bandBot} Z`} fill={theme.good} opacity="0.12" />
      <path d={path} fill="none" stroke={theme.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(pts.length - 1)} cy={y(pts[pts.length - 1])} r="4" fill={theme.good} stroke="#fff" strokeWidth="1.5" />
      <text x={x(pts.length - 1) - 6} y={y(pts[pts.length - 1]) - 8} textAnchor="end" fontFamily={MONO} fontSize="10" fill={theme.sub}>4.2kg</text>
      {['J0','J7','J14','J21','J28'].map((l, i) => (
        <text key={i} x={x(i * 1.5)} y={h + 14} textAnchor="middle" fontFamily={MONO} fontSize="9" fill={theme.sub}>{l}</text>
      ))}
    </svg>
  );
}

// ─── 2) Médicaments + urgence ────────────────────────────────────────
function DirB_Meds({ theme }) {
  return (
    <div style={{ background: theme.bg, minHeight: '100%', paddingBottom: 30 }}>
      {/* Header */}
      <div style={{ paddingTop: 56, padding: '56px 20px 10px' }}>
        <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase' }}>Santé · Lucie</div>
        <div style={{ fontFamily: SERIF, fontSize: 28, color: theme.ink, letterSpacing: -0.5, marginTop: 4, lineHeight: 1.1 }}>Médicaments & urgence</div>
      </div>

      {/* Doliprane — la grosse question */}
      <div style={{ margin: '8px 16px 0', background: theme.card, borderRadius: 22, padding: 18, border: `0.5px solid ${theme.hair}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Icon name="sparkle" size={12} color={theme.accent} />
          <span style={{ fontFamily: SANS, fontSize: 11, color: theme.accent, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Demande fréquente</span>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 19, color: theme.ink, lineHeight: 1.3 }}>
          Doliprane — peux-tu lui en redonner&nbsp;?
        </div>

        {/* Statut visuel : prochaine prise possible */}
        <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 14, background: `${theme.good}12`, border: `0.5px solid ${theme.good}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: theme.good, boxShadow: `0 0 0 4px ${theme.good}25` }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SANS, fontSize: 14, color: theme.ink, fontWeight: 600 }}>Oui — tu peux.</div>
              <div style={{ fontFamily: SANS, fontSize: 12, color: theme.sub, marginTop: 1 }}>Dernière prise il y a <b>6h12</b> · délai mini 6h respecté</div>
            </div>
          </div>
          {/* Mini timeline 24h */}
          <div style={{ marginTop: 10, position: 'relative', height: 22 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 10, height: 2, background: theme.hair, borderRadius: 1 }} />
            {[{ h: 1.5, t: '08:00' }, { h: 7.7, t: '14:10' }].map((d, i) => (
              <div key={i} style={{ position: 'absolute', left: `${(d.h / 24) * 100}%`, top: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateX(-50%)' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: theme.good }} />
                <span style={{ fontFamily: MONO, fontSize: 9, color: theme.sub, marginTop: 1 }}>{d.t}</span>
              </div>
            ))}
            {/* Now */}
            <div style={{ position: 'absolute', left: `${(13.7 / 24) * 100}%`, top: 0, height: 22, width: 1, background: theme.ink }} />
            <span style={{ position: 'absolute', left: `${(13.7 / 24) * 100}%`, top: -10, fontFamily: MONO, fontSize: 9, color: theme.ink, transform: 'translateX(-50%)', fontWeight: 700 }}>maintenant</span>
          </div>
        </div>

        {/* Dose calculée */}
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ padding: '10px 12px', background: theme.soft, borderRadius: 12 }}>
            <div style={{ fontFamily: SANS, fontSize: 10.5, color: theme.sub, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600 }}>Dose</div>
            <div style={{ fontFamily: SERIF, fontSize: 22, color: theme.ink, marginTop: 4, letterSpacing: -0.4 }}>2,1 ml</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, marginTop: 1 }}>4.2kg · 15mg/kg</div>
          </div>
          <div style={{ padding: '10px 12px', background: theme.soft, borderRadius: 12 }}>
            <div style={{ fontFamily: SANS, fontSize: 10.5, color: theme.sub, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600 }}>Prochaine</div>
            <div style={{ fontFamily: SERIF, fontSize: 22, color: theme.ink, marginTop: 4, letterSpacing: -0.4 }}>20:10</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, marginTop: 1 }}>dans 6h min.</div>
          </div>
        </div>

        <button style={{
          marginTop: 12, width: '100%',
          background: theme.accent, color: '#fff',
          border: 'none', borderRadius: 14, padding: '12px 14px',
          fontFamily: SANS, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Icon name="check" size={15} color="#fff" />
          Enregistrer la prise
        </button>
        <SourceFooter theme={theme} org="ANSM" title="RCP Doliprane susp. buvable 100mg/ml" year={2024} />
      </div>

      {/* Autres traitements actifs */}
      <div style={{ margin: '16px 16px 0' }}>
        <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase', padding: '0 4px 8px', fontWeight: 600 }}>Traitements actifs</div>
        <div style={{ background: theme.card, borderRadius: 16, border: `0.5px solid ${theme.hair}`, overflow: 'hidden' }}>
          {[
            { n: 'Vitamine D · Adrigyn', d: '1 dose/jour · le matin', last: 'donnée à 8:15', ok: true },
            { n: 'Doliprane 100mg/ml', d: 'si fièvre · max 4×/jour', last: 'dernière 14:10', ok: true },
          ].map((m, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${theme.hair}` }}>
              <div style={{ width: 28, height: 28, borderRadius: 9, background: theme.soft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="heart" size={14} color={theme.ink} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontSize: 13.5, color: theme.ink, fontWeight: 500 }}>{m.n}</div>
                <div style={{ fontFamily: SANS, fontSize: 11.5, color: theme.sub, marginTop: 1 }}>{m.d} · {m.last}</div>
              </div>
              <Icon name="check" size={14} color={theme.good} />
            </div>
          ))}
        </div>
      </div>

      {/* Urgence — bloc rouge sobre */}
      <div style={{ margin: '16px 16px 0' }}>
        <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase', padding: '0 4px 8px', fontWeight: 600 }}>En cas d'urgence</div>
        <div style={{ background: theme.card, borderRadius: 16, border: `0.5px solid ${theme.hair}`, overflow: 'hidden' }}>
          {[
            { n: 'SAMU pédiatrique', num: '15', c: '#c94422' },
            { n: 'Dr Renaud · pédiatre', num: '06 12 34 56', c: theme.accent },
            { n: 'SOS Allaitement', num: '24h/24', c: theme.accent },
          ].map((e, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px', borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${theme.hair}` }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${e.c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="flame" size={16} color={e.c} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SANS, fontSize: 14, color: theme.ink, fontWeight: 500 }}>{e.n}</div>
                <div style={{ fontFamily: MONO, fontSize: 11.5, color: theme.sub, marginTop: 1 }}>{e.num}</div>
              </div>
              <button style={{
                background: e.c, color: '#fff', border: 'none', borderRadius: 999,
                padding: '6px 12px', fontFamily: SANS, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>Appeler</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function chipB(theme, active = false) {
  return {
    fontFamily: SANS, fontSize: 12, fontWeight: 500,
    padding: '6px 11px', borderRadius: 999,
    background: active ? theme.ink : 'transparent',
    color: active ? theme.bg : theme.sub,
    border: active ? 'none' : `0.5px solid ${theme.hair}`,
    cursor: 'pointer',
  };
}

Object.assign(window, { DirB_Vigilance, DirB_Meds });
