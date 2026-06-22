// app.jsx — wires the three directions into a Design Canvas + Tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "cream",
  "density": "regular",
  "dark": false,
  "tone": "warm",
  "age": "S35",
  "handsFree": false
}/*EDITMODE-END*/;

function Frame({ children, dark }) {
  return (
    <IOSDevice width={390} height={844} dark={dark}>
      {children}
    </IOSDevice>
  );
}

function Section({ id, title, subtitle, children }) {
  return (
    <DCSection id={id} title={title} subtitle={subtitle}>
      {children}
    </DCSection>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = useTheme(t);
  // Inject the agent-tone variant via a memo — affects copy strings shown.
  const tone = t.tone || 'warm';

  return (
    <React.Fragment>
      <DesignCanvas>
        <Section id="dir-b-input" title="B · Remplissage par conversation"
          subtitle="Tout passe par une discussion avec Pia : on dicte/écrit en vrac, elle extrait et classe (RDV, achats, biberons, changes, sieste, admin…) dans les bonnes catégories.">
          <DCArtboard id="b-chat-create" label="Discussion · création + classification" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirB_ChatInputCreate theme={theme} />
            </Frame>
          </DCArtboard>
          <DCArtboard id="b-chat-recap" label="Récap · classé aujourd'hui par Pia" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirB_ChatInputRecap theme={theme} />
            </Frame>
          </DCArtboard>
        </Section>

        <Section id="dir-b-night" title="🌙 Mode nuit & handoff matin"
          subtitle="Dictée à 3h sans réveiller personne, puis résumé « ce qui s'est passé cette nuit » au café.">
          <DCArtboard id="b-night" label="Dictée nuit · 03:42" width={390} height={844}>
            <Frame dark={true}>
              <DirB_NightDictation theme={theme} />
            </Frame>
          </DCArtboard>
          <DCArtboard id="b-handoff" label="Handoff matin · 7:18" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirB_MorningHandoff theme={theme} />
            </Frame>
          </DCArtboard>
        </Section>

        <Section id="dir-b-health" title="🩺 Santé : patterns, médicaments, urgence"
          subtitle="Pia détecte les anomalies (selle, refus biberons), répond à 'tu lui as déjà donné le doliprane ?', et garde les contacts d'urgence à 1 tap.">
          <DCArtboard id="b-vigilance" label="Vigilance · patterns détectés" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirB_Vigilance theme={theme} />
            </Frame>
          </DCArtboard>
          <DCArtboard id="b-meds" label="Médicaments & SOS" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirB_Meds theme={theme} />
            </Frame>
          </DCArtboard>
        </Section>

        <Section id="dir-b-memory" title="🧠 Mémoire long-terme"
          subtitle="Tout ce qui a été dicté ou tracké est interrogeable. Carnet de bord pour le pédiatre ou pour soi.">
          <DCArtboard id="b-recall" label="Demander à Pia · historique" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirB_Recall theme={theme} />
            </Frame>
          </DCArtboard>
          <DCArtboard id="b-logbook" label="Carnet de bord · milestones" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirB_Logbook theme={theme} />
            </Frame>
          </DCArtboard>
        </Section>

        <Section id="dir-b-proactive" title="🤖 Pia proactive"
          subtitle="Suggestions adaptées à la semaine de grossesse (ou âge du bébé), rappels admin/vaccins, stocks détectés depuis la conversation.">
          <DCArtboard id="b-antic" label="Anticipation · semaine 35" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirB_Anticipation theme={theme} />
            </Frame>
          </DCArtboard>
          <DCArtboard id="b-stocks" label="Stocks intelligents" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirB_Stocks theme={theme} />
            </Frame>
          </DCArtboard>
        </Section>

        <Section id="dir-b" title="B · Où atterrissent les éléments classés"
          subtitle="Tableau de bord, listes partagées par catégorie, historique. Tout est alimenté par la conversation ci-dessus.">
          <DCArtboard id="b-home" label="Tableau de bord" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirB_Dashboard theme={theme} density={t.density} />
            </Frame>
          </DCArtboard>
          <DCArtboard id="b-todo" label="Tout à faire · partagé" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirB_Todo theme={theme} />
            </Frame>
          </DCArtboard>
          <DCArtboard id="b-courses" label="Courses · liste dense" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirB_CoursesList theme={theme} />
            </Frame>
          </DCArtboard>
          <DCArtboard id="b-ask" label="Demander à Pia (historique)" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirB_AskPia theme={theme} />
            </Frame>
          </DCArtboard>
          <DCArtboard id="b-track" label="Tracking · journée (post-naissance)" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirB_Tracking theme={theme} />
            </Frame>
          </DCArtboard>
          <DCArtboard id="b-chat" label="Pia · feuille de chat (legacy)" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirB_ChatSheet theme={theme} />
            </Frame>
          </DCArtboard>
        </Section>

        <Section id="dir-a" title="A · Conversation-first (alternative)"
          subtitle="L'agent est la surface principale — tout passe par le chat, voix ou texte.">
          <DCArtboard id="a-conv" label="Conversation du jour" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirA_Conversation theme={theme} density={t.density} tone={tone} />
            </Frame>
          </DCArtboard>
          <DCArtboard id="a-log" label="Dictée rapide" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirA_QuickLog theme={theme} />
            </Frame>
          </DCArtboard>
          <DCArtboard id="a-rdv" label="Proposition de RDV" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirA_RdvProp theme={theme} />
            </Frame>
          </DCArtboard>
        </Section>

        <Section id="dir-c" title="C · Fil chronologique (alternative)"
          subtitle="Un seul fil pour la journée — l'agent, le tracking, les RDV se mélangent dans une timeline.">
          <DCArtboard id="c-timeline" label="Fil du jour" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirC_Timeline theme={theme} />
            </Frame>
          </DCArtboard>
          <DCArtboard id="c-jalons" label="Jalons · S24" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirC_Jalons theme={theme} />
            </Frame>
          </DCArtboard>
          <DCArtboard id="c-voice" label="Dictée nuit" width={390} height={844}>
            <Frame dark={t.dark}>
              <DirC_Composer theme={theme} />
            </Frame>
          </DCArtboard>
        </Section>
      </DesignCanvas>

      <TweaksPanel>
        <TweakSection label="Palette" />
        <TweakRadio label="Teinte"
          value={t.palette}
          options={['cream','sage','rose']}
          onChange={(v) => setTweak('palette', v)} />
        <TweakToggle label="Mode nuit" value={t.dark}
          onChange={(v) => setTweak('dark', v)} />

        <TweakSection label="Densité" />
        <TweakRadio label="Espacement" value={t.density}
          options={['compact', 'regular', 'comfy']}
          onChange={(v) => setTweak('density', v)} />

        <TweakSection label="Ton de l'agent" />
        <TweakRadio label="Voix de Pia" value={t.tone}
          options={['sobre', 'warm', 'drôle']}
          onChange={(v) => setTweak('tone', v)} />

        <TweakSection label="Contexte" />
        <TweakSelect label="Âge / stade" value={t.age}
          options={['S24', 'S30', 'S35', 'J0', 'J32 (1 mois)', '5 mois', '1 an']}
          onChange={(v) => setTweak('age', v)} />
        <TweakToggle label="Mode mains-libres" value={t.handsFree}
          onChange={(v) => setTweak('handsFree', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
