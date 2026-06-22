// direction-b-plus-proactive.jsx — 🤖 Pia proactive
// Screens: 1) Anticipation S35 (suggestions par âge / valise mater / rappels)
//          2) Stocks intelligents (couches, lait, etc.)

// ─── 1) Anticipation contextuelle — S35 ─────────────────────────────
function DirB_Anticipation({ theme }) {
  return (
    <div style={{ background: theme.bg, minHeight: '100%', paddingBottom: 30 }}>
      {/* Header */}
      <div style={{ paddingTop: 56, padding: '56px 20px 8px' }}>
        <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase' }}>Pia · anticipation</div>
        <div style={{ fontFamily: SERIF, fontSize: 28, color: theme.ink, letterSpacing: -0.5, marginTop: 4, lineHeight: 1.1 }}>
          Semaine 35
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 15, color: theme.sub, marginTop: 2, lineHeight: 1.35 }}>
          On entre dans la dernière ligne droite. Voici ce que je suggère cette semaine.
        </div>
      </div>

      {/* Carte phare — la valise maternité */}
      <div style={{ margin: '16px 16px 0', background: theme.card, borderRadius: 22, padding: 18, border: `0.5px solid ${theme.hair}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -10, right: -10, width: 90, height: 90, borderRadius: '50%', background: `${theme.accent}10` }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 999, background: theme.accentSoft, color: theme.accent, fontFamily: SANS, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>
            <Icon name="flame" size={10} color={theme.accent} />
            Priorité
          </div>
          <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, color: theme.sub }}>~ 4 sem du terme</span>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 20, color: theme.ink, lineHeight: 1.3, position: 'relative' }}>
          Préparer la valise maternité
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 13.5, color: theme.sub, marginTop: 4, lineHeight: 1.45 }}>
          La maternité Saint-Antoine recommande de l'avoir prête à <b>S37</b>. Je peux générer la liste à partir de leur livret et de ce que tu as déjà.
        </div>

        {/* Progress / sous-tâches */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: SANS, fontSize: 11, color: theme.sub }}>12 articles cochés sur 31</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: theme.ink, fontWeight: 600 }}>39%</span>
            </div>
            <div style={{ height: 5, background: theme.soft, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: '39%', height: '100%', background: theme.accent, borderRadius: 3 }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          <button style={{
            flex: 1, fontFamily: SANS, fontSize: 13, fontWeight: 600,
            padding: '10px 12px', borderRadius: 12,
            background: theme.accent, color: '#fff', border: 'none', cursor: 'pointer',
          }}>Continuer la liste</button>
          <button style={{
            fontFamily: SANS, fontSize: 13, fontWeight: 500,
            padding: '10px 14px', borderRadius: 12,
            background: 'transparent', color: theme.ink,
            border: `0.5px solid ${theme.hair}`, cursor: 'pointer',
          }}>Plus tard</button>
        </div>
        <SourceFooter theme={theme} org="Maternité Saint-Antoine" title="livret patient" compact />
      </div>

      {/* Suggestions secondaires — semaine */}
      <div style={{ margin: '20px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px 10px' }}>
          <span style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>Cette semaine · 5 suggestions</span>
          <span style={{ fontFamily: SANS, fontSize: 12, color: theme.accent, fontWeight: 500 }}>Tout voir</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { k: 'admin', i: 'note', t: 'Inscrire bébé à la mutuelle',
              w: 'Délai 10 jours après naissance — autant le préparer maintenant.', urg: 'avant terme', c: theme.warn },
            { k: 'rdv', i: 'cal', t: 'RDV anesthésiste',
              w: 'À programmer entre S36 et S37 — créneaux limités.', urg: 'cette semaine', c: '#7a6fc0' },
            { k: 'lecture', i: 'note', t: '"Les portages physiologiques" · 12 min',
              w: 'Tu as ajouté "écharpe de portage" à la liste, ce podcast t\'aidera à choisir.', urg: 'optionnel', c: theme.sub },
            { k: 'achat', i: 'cart', t: 'Coussin d\'allaitement · 3 modèles comparés',
              w: 'Je connais tes critères (lavable, ferme, prix < 50€). Tu valides ?', urg: 'décision', c: theme.accent },
            { k: 'pres', i: 'sparkle', t: 'Choisir un prénom — vous en êtes à 3',
              w: 'Vous avez parlé de Camille, Iris et Hugo. Veux-tu un tour de décision ?', urg: 'à discuter', c: theme.accent },
          ].map((s, i) => (
            <div key={i} style={{
              background: theme.card, borderRadius: 14, padding: '12px 14px',
              border: `0.5px solid ${theme.hair}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 9, background: `${s.c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={s.i} size={14} color={s.c} />
                </div>
                <div style={{ fontFamily: SANS, fontSize: 14, color: theme.ink, fontWeight: 500, flex: 1 }}>{s.t}</div>
                <Pill color={s.c} bg={`${s.c}15`}>{s.urg}</Pill>
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 13, color: theme.sub, lineHeight: 1.45, paddingLeft: 38 }}>
                {s.w}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, paddingLeft: 38 }}>
                <button style={chipS(theme, true)}>Ajouter</button>
                <button style={chipS(theme)}>Plus tard</button>
                <button style={chipS(theme)}>Ignorer</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Au programme du mois prochain (post-naissance) */}
      <div style={{ margin: '18px 16px 0' }}>
        <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase', padding: '0 4px 10px', fontWeight: 600 }}>Je penserai à te rappeler</div>
        <div style={{ background: theme.card, borderRadius: 16, padding: '4px 14px', border: `0.5px solid ${theme.hair}` }}>
          {[
            { d: '~ J1', t: 'Déclaration de naissance (mairie · 5 jours max)' },
            { d: '~ J8', t: 'Premier examen pédiatrique obligatoire' },
            { d: '~ J15', t: 'Inscription CAF (prime de naissance)' },
            { d: '~ M2', t: 'Vaccins : DTP, coqueluche, Hib, hép. B, pneumo' },
          ].map((r, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${theme.hair}` }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: theme.sub, width: 38 }}>{r.d}</span>
              <span style={{ fontFamily: SANS, fontSize: 13.5, color: theme.ink, flex: 1 }}>{r.t}</span>
              <Icon name="clock" size={14} color={theme.sub} />
            </div>
          ))}
          <SourceFooter theme={theme} org="Santé publique France" title="Calendrier vaccinal 2025 + Service-public.fr" />
        </div>
      </div>
    </div>
  );
}

function chipS(theme, active = false) {
  return {
    fontFamily: SANS, fontSize: 11.5, fontWeight: 500,
    padding: '5px 10px', borderRadius: 999,
    background: active ? theme.ink : 'transparent',
    color: active ? theme.bg : theme.sub,
    border: active ? 'none' : `0.5px solid ${theme.hair}`,
    cursor: 'pointer',
  };
}

// ─── 2) Stocks intelligents ──────────────────────────────────────────
function DirB_Stocks({ theme }) {
  return (
    <div style={{ background: theme.bg, minHeight: '100%', paddingBottom: 30 }}>
      {/* Header */}
      <div style={{ paddingTop: 56, padding: '56px 20px 4px' }}>
        <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase' }}>Stocks · estimés par Pia</div>
        <div style={{ fontFamily: SERIF, fontSize: 28, color: theme.ink, letterSpacing: -0.5, marginTop: 4, lineHeight: 1.1 }}>
          3 produits bientôt finis
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 14, color: theme.sub, marginTop: 2, lineHeight: 1.4 }}>
          Basé sur la fréquence de consommation des 14 derniers jours.
        </div>
      </div>

      {/* Carte mise en avant — couches */}
      <div style={{ margin: '16px 16px 0', background: theme.card, borderRadius: 22, padding: 18, border: `0.5px solid ${theme.hair}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Icon name="diaper" size={16} color={theme.accent} />
          <span style={{ fontFamily: SANS, fontSize: 13, color: theme.ink, fontWeight: 600 }}>Couches taille 2</span>
          <Pill color={theme.warn} bg={`${theme.warn}18`} style={{ marginLeft: 'auto' }}>2 jours restants</Pill>
        </div>

        {/* Gauge stock */}
        <StockGauge theme={theme} pct={14} days={2} />

        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '12px 0 0', borderTop: `0.5px solid ${theme.hair}` }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10.5, color: theme.sub, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600 }}>Consommation</div>
            <div style={{ fontFamily: SERIF, fontSize: 18, color: theme.ink, marginTop: 4, letterSpacing: -0.3 }}>7 /jour</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, marginTop: 1 }}>~ stable</div>
          </div>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 10.5, color: theme.sub, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600 }}>À prévoir</div>
            <div style={{ fontFamily: SERIF, fontSize: 18, color: theme.ink, marginTop: 4, letterSpacing: -0.3 }}>passage T3</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, marginTop: 1 }}>poids proche du seuil</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          <button style={{
            flex: 1, fontFamily: SANS, fontSize: 13, fontWeight: 600,
            padding: '10px 12px', borderRadius: 12,
            background: theme.accent, color: '#fff', border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Icon name="cart" size={14} color="#fff" />
            Re-commander · 14,90€
          </button>
          <button style={{
            fontFamily: SANS, fontSize: 13, fontWeight: 500,
            padding: '10px 14px', borderRadius: 12,
            background: 'transparent', color: theme.ink,
            border: `0.5px solid ${theme.hair}`, cursor: 'pointer',
          }}>Ajuster</button>
        </div>
      </div>

      {/* Liste stocks */}
      <div style={{ margin: '16px 16px 0' }}>
        <div style={{ fontFamily: SANS, fontSize: 11, color: theme.sub, letterSpacing: 0.4, textTransform: 'uppercase', padding: '0 4px 8px', fontWeight: 600 }}>Tous les stocks suivis</div>
        <div style={{ background: theme.card, borderRadius: 16, border: `0.5px solid ${theme.hair}`, overflow: 'hidden' }}>
          {[
            { i: 'bottle', n: 'Lait Gallia 1er âge', s: '6 doses · ~ 4 jours', pct: 30, c: theme.warn },
            { i: 'note', n: 'Liniment oléo-calcaire', s: '~ 5 jours', pct: 38, c: theme.warn },
            { i: 'heart', n: 'Vitamine D Adrigyn', s: '~ 3 semaines', pct: 76, c: theme.good },
            { i: 'note', n: 'Sérum physiologique', s: '~ 1 mois', pct: 85, c: theme.good },
            { i: 'note', n: 'Compresses stériles', s: 'plein', pct: 95, c: theme.good },
          ].map((s, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${theme.hair}` }}>
              <Icon name={s.i} size={16} color={theme.sub} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontSize: 13.5, color: theme.ink, fontWeight: 500 }}>{s.n}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                  <div style={{ flex: 1, height: 3, background: theme.hair, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${s.pct}%`, height: '100%', background: s.c, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, color: theme.sub, flexShrink: 0 }}>{s.s}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comment je sais */}
      <div style={{ margin: '14px 16px 0', padding: '12px 14px', background: theme.soft, borderRadius: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Icon name="sparkle" size={13} color={theme.sub} />
        <div style={{ fontFamily: SERIF, fontSize: 12.5, color: theme.sub, lineHeight: 1.45, flex: 1 }}>
          Je détecte la consommation depuis tes dictées ("biberon de 90 ml", "change selle") et je croise avec tes derniers achats. Tu peux ajuster manuellement à tout moment.
        </div>
      </div>
    </div>
  );
}

function StockGauge({ theme, pct, days }) {
  // Stylized horizontal "diaper stack" bar
  const SLOTS = 14;
  const filled = Math.round((pct / 100) * SLOTS);
  return (
    <div>
      <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
        {[...Array(SLOTS)].map((_, i) => {
          const isFilled = i < filled;
          return (
            <div key={i} style={{
              flex: 1, height: 22, borderRadius: 4,
              background: isFilled ? theme.accent : theme.soft,
              opacity: isFilled ? 1 : 1,
            }} />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: MONO, fontSize: 10, color: theme.sub }}>
        <span>{Math.round(pct)}% · ≈ 14 couches</span>
        <span style={{ color: theme.warn, fontWeight: 600 }}>épuisement jeudi</span>
      </div>
    </div>
  );
}

Object.assign(window, { DirB_Anticipation, DirB_Stocks });
