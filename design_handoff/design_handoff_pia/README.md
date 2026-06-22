# Brief — Pia · agent de charge mentale parentale

> **À l'attention du développeur (Claude Code).** Ce dossier contient des prototypes HTML de référence (React + Babel, rendu inline) qui décrivent l'apparence et le comportement souhaités du produit. Ce ne sont pas des fichiers à expédier en production : tu dois **recréer ces écrans dans l'environnement cible** (React Native + Expo, Next.js, Swift, etc.) en t'appuyant sur ses patterns établis. S'il n'y a pas encore de codebase, choisis l'environnement le plus pertinent — pour cette app, **React Native + Expo (iOS-first)** est notre recommandation.

> **Fidélité :** haute. Les couleurs, typographies, espacements, hiérarchies et copies sont volontairement précis. À reproduire à l'identique modulo les contraintes de la plateforme cible.

---

## 1. Philosophie produit

### Le problème
La charge mentale parentale ne se résume pas aux gestes physiques (biberons, changes). Elle est faite de **mille petites infos à retenir, classer, croiser, ne pas oublier** : le RDV pédiatre à prendre, la pharmacie à passer, le poids du dernier examen, "tu lui as déjà donné le doliprane ?", l'inscription mutuelle dans les 10 jours, le stock de couches qui baisse, "à quel âge a-t-il fait sa première otite ?". Cette charge est **invisible**, asymétriquement répartie, et coûte énormément d'énergie au quotidien.

### La solution : un agent conversationnel qui écoute, classe, anticipe et se souvient
**Pia** est un agent. Le parent **dicte ou écrit en vrac**, à n'importe quel moment de la journée ou de la nuit ; Pia **extrait, classe et range** chaque élément dans la bonne catégorie (RDV, achat, biberon, change, médicament, milestone, admin…). À partir de ce corpus, Pia :
- **anticipe** : suggestions adaptées à la semaine de grossesse ou à l'âge du bébé
- **vigile** : détecte les patterns inhabituels (pas de selle depuis 52h, biberon refusés répétés)
- **mémorise** : tout est interrogeable en langage naturel ("quand a-t-elle eu sa première otite ?")
- **rappelle** : doses, délais, échéances admin, vaccins
- **partage** : co-parent voit tout en temps réel ; aucun double-emploi

### Les 6 principes UX

1. **Le chat est l'unique surface d'entrée.** Tout passe par la dictée/écriture conversationnelle. Pas de formulaires multi-champs, pas d'arbre de catégories à parcourir.
2. **Pia répond par cartes confirmées, pas par texte plat.** Chaque création apparaît comme une carte classée (badge de catégorie + champs extraits + qui c'est pour). Édition inline en 1 tap.
3. **Les listes sont des vues, pas des sources.** Les écrans "Tout à faire", "Courses", "Tracking", "Carnet" sont des projections du corpus conversationnel. Elles n'acceptent **pas** de saisie directe ; un FAB ramène toujours au chat.
4. **Sobre, sage, lisible.** Esthétique Apple Health / Notion : papier crème, typo serif pour l'humain, mono pour les chiffres, beaucoup d'air, pas d'emoji décoratif.
5. **Adaptatif au stade.** Pré-naissance (S20–S40), nouveau-né (J0–M3), nourrisson (M3–M12), enfant (12m+). Les suggestions, les patterns surveillés, le vocabulaire de Pia changent en conséquence.
6. **Toute recommandation est sourcée.** Pia ne dit jamais "il faut" sans appui. Chaque suggestion, seuil de vigilance, dose, calendrier vaccinal ou jalon de développement **affiche explicitement sa source** (OMS, HAS, ANSM, Santé publique France, Carnet de santé officiel, Société française de pédiatrie). Voir section 4 ci-dessous.

---

## 4. Source des recommandations — règle d'or

**Aucune reco ne sort de Pia sans citation de la source officielle.** Cette règle est **non-négociable** : elle protège juridiquement le produit, gagne la confiance des parents, et différencie Pia des forums et apps "wellness" approximatives.

### Sources autorisées (ordre de priorité FR)

1. **HAS** — Haute Autorité de Santé (recos cliniques FR)
2. **ANSM** — Agence nationale de sécurité du médicament (doses, posologies)
3. **Santé publique France** — calendrier vaccinal officiel, dépistages
4. **Carnet de santé** (modèle officiel 2024) — courbes de croissance FR, examens obligatoires
5. **PMI** — Protection Maternelle et Infantile (suivi local)
6. **CNGOF** — Collège des gynéco-obstétriciens (recos grossesse)
7. **OMS** — quand pas de reco française dispo, ou pour standards internationaux (courbes, allaitement)
8. **Société française de pédiatrie / AFPA** — recos cliniques pédiatriques

### Sources interdites
- Forums (Doctissimo, Magicmaman, etc.)
- Blogs personnels
- Recos commerciales (marques de lait, couches, etc.)
- "Tradition" ou "conseils de grand-mère"
- Recommandations générées par LLM sans ancrage

### Comment l'afficher dans l'UI

Toute carte qui contient une recommandation, un seuil, un délai, une dose, un jalon de développement, ou une suggestion d'âge doit comporter un **footer source** :

```
─────────────────────────────────────────
ⓘ  Source : HAS · « Suivi du nourrisson 0-2 ans » (2024)    ↗
```

Spec visuelle du footer source :
- Séparateur 0.5 px hair au-dessus
- Padding 8 px vertical
- Icône info (`Icon name="note"` ou Lucide `info`) 11 px en `theme.sub`
- Label sans 11, color `theme.sub` : `Source : <Organisme> · « <Titre court du document> » (<Année>)`
- Chevron `↗` cliquable → ouvre une vue détaillée (citation exacte + lien externe vers le PDF/page officielle)
- Si plusieurs sources : "Sources : HAS, OMS" et la vue détail liste les deux

### Exemples d'application concrets dans les écrans

| Écran | Élément | Source à afficher |
|---|---|---|
| D1 Vigilance | Alerte "Pas de selle depuis 52h" | HAS · « Constipation du nourrisson » (2023) |
| D1 Vigilance | Bande P10–P90 courbe de poids | Carnet de santé (modèle 2024) · données OMS |
| D2 Meds | Dose Doliprane 15 mg/kg | ANSM · RCP Doliprane suspension buvable |
| D2 Meds | Contact SAMU pédiatrique 15 | Santé publique France |
| F1 Anticipation | "Valise mater à S37" | Maternité Saint-Antoine (livret patient) — **source non-officielle, l'afficher comme telle** |
| F1 Anticipation | "Vaccins à 2 mois" | Santé publique France · Calendrier vaccinal 2025 |
| F1 Anticipation | "Déclaration mairie 5 jours" | Service-public.fr · Code civil art. 55 |
| E2 Logbook | Jalons développement | Carnet de santé · examens obligatoires |
| C2 Handoff | Seuil détection refus biberon | HAS · « Troubles de l'oralité » + heuristique interne |

### Heuristiques internes

Quand Pia détecte un pattern qui n'a pas de source officielle stricte (ex : "3 biberons refusés cette semaine au même créneau"), afficher :

```
ⓘ  Observation Pia · pas une reco médicale
```

Avec un visuel volontairement plus discret (italique, color sub) pour éviter la confusion avec une reco officielle.

### Implémentation backend

Chaque suggestion / pattern / dose / jalon dans la base de connaissance Pia doit avoir un schéma :

```ts
type Recommendation = {
  id: string;
  text: string;           // ce que Pia dit
  type: 'official' | 'heuristic';
  source?: {
    org: 'HAS' | 'ANSM' | 'OMS' | 'SantePubliqueFrance' | /* ... */;
    title: string;
    year: number;
    url: string;          // lien direct vers PDF/page
    excerpt?: string;     // citation exacte (max 200 chars)
  };
  appliesTo: { ageMin?: string; ageMax?: string; condition?: string };
};
```

Le LLM ne doit **jamais** fabriquer de reco hors de cette base. Toute réponse de Pia contenant une reco doit citer l'entrée correspondante par ID (RAG strict, pas de génération libre).

---

## 2. Stack & contraintes techniques

- **Plateforme cible recommandée :** React Native + Expo (iOS-first, Android suit). Le design est pensé en 390×844 (iPhone 14/15 logique).
- **Langue :** français (FR-FR). Toute la copie produit est française.
- **Voix de Pia :** trois tons à supporter (`sobre`, `warm` — défaut, `drôle`). Pour l'instant `warm` suffit.
- **Mode sombre :** complet, AMOLED (#0a0a07) sur l'écran "dictée nuit" indépendamment de la préférence système.
- **Backend :** non-spécifié à ce stade. Prévoir :
  - LLM (extraction/classification depuis langage naturel)
  - Speech-to-text (dictée français, robuste au bruit ambiant)
  - Stockage chiffré (santé sensible — RGPD)
  - Sync temps réel entre co-parents

---

## 3. Architecture des données — modèle de domaine

Tout objet créé par Pia hérite d'un type discriminé. Voici les catégories actuelles :

| Type | Code | Couleur | Icône (line, 24×24) | Champs propres |
|---|---|---|---|---|
| RDV | `rdv` | `#7a6fc0` violet | `cal` | praticien, lieu, date, durée, statut |
| Course / achat | `course` | accent (cream: `#c96442`) | `cart` | item, liste, prix~, urgence |
| Biberon | `biberon` | `#3f8fb3` bleu | `bottle` | volume (ml), heure, durée, fini/refusé |
| Change | `change` | `#5a7d4f` vert | `diaper` | type (pipi/selle), aspect, heure |
| Sieste | `sieste` | `#7a6fc0` violet | `moon` | début, fin, lieu (lit/cododo/poussette) |
| Médicament | `medic` | accent | `heart` | nom, dose, heure, prochaine prise |
| Admin | `admin` | `#b67a2c` ambre | `note` | type, échéance, statut |
| Jalon / milestone | `jalon` | accent | `milestone` | catégorie (1re fois/santé/croissance), citation, photos |
| Lecture | `lecture` | gris | `note` | titre, durée, source, statut |
| Note libre | `note` | gris | `note` | texte, vocal/écrit, durée audio |

Chaque entrée porte aussi : `id`, `createdAt`, `who` (`L`/`T`/`autre`), `assignedTo`, `source` (`vocal`/`text`/`photo`), `confidence` (extraction LLM), `linkedTo[]` (ex : "biberon 23h40" → "pattern refus du soir").

---

## 4. Design tokens

### Palettes (3 thèmes clairs + 1 nuit)

```js
PALETTES = {
  cream:  { bg:'#f5f2ea', surface:'#faf8f3', card:'#ffffff', ink:'#29261b', sub:'#6e6757',
            hair:'rgba(41,38,27,0.08)', soft:'#efe9dc',
            accent:'#c96442', accentSoft:'rgba(201,100,66,0.10)',
            good:'#5a7d4f', warn:'#b67a2c' },  // DÉFAUT
  sage:   { bg:'#eef0ea', accent:'#6b8a5a', /* … */ },
  rose:   { bg:'#f3ecea', accent:'#b15c6e', /* … */ },
}
DARK = { bg:'#15140f', surface:'#1c1a14', card:'#222019', ink:'#f3efe4',
         sub:'#8a8474', accent:'#e89077', good:'#8aa97c', warn:'#d6a25b' }

// Mode nuit AMOLED (écran dictée nuit uniquement)
NIGHT = { bg:'#0a0a07', surface:'#13110d', card:'#1a1812' }
```

### Typographies (Google Fonts)

```css
@import 'Source Serif 4' (400, 500, 600);  /* titres, copy chaleureuse */
@import 'Geist'          (400, 500, 600, 700);  /* UI, métadonnées */
@import 'Geist Mono'     (400, 500);  /* chiffres, horaires, codes */
```

Échelle :
- Titre écran (serif) : 26–32 / line-height 1.05–1.1 / letter-spacing −0.5
- H2 carte (serif) : 17–20
- Body (serif) : 14–16 / line-height 1.4
- UI (sans) : 11–14
- Label uppercase (sans 600) : 10.5–12 / letter-spacing 0.3–0.4 / `text-transform: uppercase`
- Mono : 10–12

### Espacements & rayons
- Espacement vertical entre sections : 14–18 px
- Padding carte : 14–18 px
- Rayon carte standard : 16–22 px
- Rayon mini-cards / chips : 12–14 px
- Rayon bouton pilule : 999 px
- Avatar : cercle, 14/16/20/22/28 px selon contexte

### Élévation
- Carte standard : `border: 0.5px solid hair` (pas d'ombre)
- FAB : `box-shadow: 0 10px 28px accent55`
- Sheet modal : `box-shadow: 0 -10px 40px rgba(0,0,0,0.2)`

### Iconographie
Set custom, **traits 1.6 px, line-cap round**. 16 icônes définies dans `ui.jsx` (`bottle`, `diaper`, `moon`, `cal`, `cart`, `milestone`, `chat`, `mic`, `send`, `plus`, `check`, `sparkle`, `clock`, `flame`, `home`, `belly`, `heart`, `note`, `list`, `arrow`, `wave`). À ré-implémenter telles quelles ou via Lucide/Phosphor avec adaptation manuelle (épaisseur de trait).

---

## 6. Inventaire des écrans (16)

Architecture : **un seul tab bar invisible** ; le chat est l'écran d'accueil. Tous les autres sont accessibles via le tableau de bord ou des liens contextuels.

### A. Surface d'entrée — conversation

#### A1. `ChatInputCreate` — discussion · création + classification
**Fichier de ref :** `direction-b-chat-input.jsx` → `DirB_ChatInputCreate`
**Rôle :** écran d'accueil. Le parent dicte/écrit, Pia extrait et confirme via cartes inline.
**Layout :**
- Header (h ≈ 64) : retour, avatar Pia (cercle accent 32×32 + sparkle), nom+sous-titre, pill "en ligne"
- Fil chronologique vertical, gap 10 px, padding latéral 14
  - Séparateur de date (pilule centrée, label sans 10.5 uppercase)
  - Bulles utilisateur : alignées à droite, fond accent, coin BR à 4 px, max-width 85 %, optional `Icon mic` à gauche du texte si vocal
  - Bulles Pia : fond `soft`, coin BL à 4 px, parfois suivi d'un sous-libellé "3 éléments classés"
  - Cartes de création (`CreatedCard`) : voir composant ci-dessous
  - Rangée de choix : 2–3 pilules CTA après une question de Pia
- Composer (footer collant) :
  - Ligne de raccourcis horizontale scrollable (chips icone+label : Biberon, Change, Sieste, RDV, Achat)
  - Champ texte arrondi (border `hair`) + gros bouton micro circulaire 44×44 (fond accent, `box-shadow` accent à 55)

**Composant clé — `CreatedCard` :**
- Header : badge catégorie (icône + label uppercase 10.5 + couleur de la catégorie, fond `${c}1f`), mention "créé", check vert
- Titre (serif 15)
- Chips de champs extraits : `${clé} ${valeur}`, fond `soft`, padding 2/7
- Footer divisé par hair : avatar de l'auteur + "pour Léa" + actions ("Modifier", "Voir →")

#### A2. `ChatInputRecap` — récap classé aujourd'hui
**Ref :** `direction-b-chat-input.jsx` → `DirB_ChatInputRecap`
**Rôle :** synthèse de tout ce que Pia a créé/classé sur la journée.
- Header : "14 éléments classés" en serif 28, méta "en 11 messages · 2'40" de dictée"
- Rangée de chips de catégories (scroll horizontal) avec compteurs en mono
- Groupes par catégorie : header (icône + label + compteur), liste compacte (puce colorée + titre + meta + avatar)
- FAB plein largeur en bas : "Continuer à dicter à Pia" (accent, micro + label)

---

### B. Tableau de bord & listes

#### B1. `Dashboard` — accueil briefing
**Ref :** `direction-b.jsx` → `DirB_Dashboard`
- Header sobre : date courte (sans 12 uppercase) + "Bonjour Léa." serif 30 + "Semaine 24 · jour 3" + AvatarStack
- Carte briefing : badge "Pia · briefing" + heure mono, titre serif 17 avec chiffres en gras, 3 chips d'action
- Grille 2 colonnes de MiniCard : "Prochain RDV" / "Bébé · S24"
- Liste "Tout à faire · partagé" : 5 catégories avec icône cube `soft` + barre de progression + compteur mono + avatars
- Liste "Pia propose · aujourd'hui" : checkbox avec icône sparkle (si suggéré par Pia), titre, méta, avatar
- FAB chat (cercle 60 accent, sparkle, drop-shadow accent à 40)

#### B2. `Todo` — tout à faire partagé
**Ref :** `direction-b-deep.jsx` → `DirB_Todo`
- Header + filtres (chips de catégories)
- Sections par catégorie, items avec checkbox, titre, sub, avatars

#### B3. `CoursesList` — courses dense
**Ref :** `direction-b-deep.jsx` → `DirB_CoursesList`
- Liste très dense (3 lignes par item visibles à l'écran), groupée par magasin/type
- Affichage prix~, urgence, qui a ajouté

#### B4. `AskPia` — historique (version 1)
**Ref :** `direction-b-deep.jsx` → `DirB_AskPia`
**Note dev :** la version `Recall` (D1) plus riche est à préférer pour la v1.

#### B5. `Tracking` — journée post-naissance
**Ref :** `direction-b.jsx` → `DirB_Tracking`
- Header "Aujourd'hui · 18 oct" + "Lucie · J32" serif 28
- 3 stats cards (biberons / changes / sieste cumulée) avec icône, valeur serif 22, label
- Timeline des dernières actions (heure mono + icône cube + libellé + sub + avatar)
- Barre d'action bas : 3 boutons rapides (Biberon/Change/Sieste) + 1 bouton Pia accent

#### B6. `ChatSheet` — chat compact (legacy)
**Ref :** `direction-b.jsx` → `DirB_ChatSheet`
**Note dev :** version sheet du chat appelée depuis le FAB du dashboard. À conserver comme variante "consultation rapide". L'écran principal reste **A1** (`ChatInputCreate`).

---

### C. Mode nuit & handoff matin

#### C1. `NightDictation` — dictée nuit 03:42
**Ref :** `direction-b-plus-night.jsx` → `DirB_NightDictation`
**Particularités :**
- Force la palette AMOLED `#0a0a07` même si l'utilisateur est en mode clair
- Police légère pour l'heure (serif 56, weight 300, letter-spacing −2)
- Carte "mode nuit" mentionnant "son coupé" (no haptic feedback, no TTS confirm)
- Liste compacte des dictées de la nuit (un point ambre signale les warnings)
- **Gros bouton micro central** (96×96, dégradé radial accent → #b15c4a, triple halo en `box-shadow` :  
  `0 0 0 8px ${accent}14, 0 0 0 18px ${accent}08, 0 14px 40px ${accent}33`)
- Microcopy : "tap pour dicter · maintien pour main-libre"
- 3 chips raccourci (Biberon / Change / Sieste) sans fond (ghost)

#### C2. `MorningHandoff` — résumé matin 7:18
**Ref :** `direction-b-plus-night.jsx` → `DirB_MorningHandoff`
- Header gradient subtil accent10 → bg
- Titre : "Bonjour Léa." + sous-titre serif 18 "Thomas a tenu la nuit. Voici son résumé."
- Carte 3 stats (biberons / change / sommeil) séparées par hair vertical
- **Carte "Frise"** : timeline visuelle 22h → 7h (composant `NightTimeline`) — blocs sommeil opaques + points événements ronds (couleurs catégorie)
- Carte insight Pia (fond `${accent}10`, border `${accent}30`) : observation + suggestion non-jugeante
- Carte note vocale citée (italique serif 14.5 + "5:14 · vocal · 8s" mono)

---

### D. Santé

#### D1. `Vigilance` — patterns détectés
**Ref :** `direction-b-plus-health.jsx` → `DirB_Vigilance`
- Header + bouton SOS rouge sobre (fond `#c9442218`, texte `#c94422`)
- **Alerte forte** : carte avec halo léger `box-shadow: 0 0 0 3px warn10`, header `warn10` + label "À surveiller", body serif 16, CTAs
- Liste de patterns secondaires (rang horizontal : icône carrée colorée + titre + sub + chevron)
- Grille 2×2 "Carnet de santé" : vaccins / allergies / pédiatre / ordonnances
- Mini-courbe OMS (composant `GrowthMini`) : SVG sparkline avec bande P10–P90 en `good` à 12 % d'opacité

#### D2. `Meds` — médicaments & SOS
**Ref :** `direction-b-plus-health.jsx` → `DirB_Meds`
**Particularités :**
- Carte phare "Doliprane — peux-tu lui en redonner ?" (la question canonique du parent)
- État vert avec point pulsant : "Oui — tu peux", "dernière prise il y a 6h12 · délai mini respecté"
- Mini timeline 24h : axe horizontal, prises passées (points verts), barre noire "maintenant"
- 2 mini-cards : Dose calculée au poids (serif 22 "2,1 ml") + Prochaine prise possible (serif 22 "20:10")
- CTA plein "Enregistrer la prise"
- Liste traitements actifs (vit. D, doliprane PRN)
- **Section urgence** : 3 contacts (SAMU 15, pédiatre, SOS allaitement) avec bouton "Appeler" coloré par criticité

---

### E. Mémoire long-terme

#### E1. `Recall` — recherche dans l'historique
**Ref :** `direction-b-plus-memory.jsx` → `DirB_Recall`
- Champ de recherche en haut (icône sparkle + placeholder + micro)
- **Réponse Pia enrichie** : carte avec :
  - Date relative en gras ("14 février, il y a 4 mois et 11 jours")
  - Contexte ("Lucie avait 3 mois et 2 semaines")
  - Citation italique de la dictée originale
  - Bloc citation médecin (border-left accent, fond `soft`, label "14 fév · 21:30 · Dr Renaud")
  - Liste de liens connexes (ordonnance, contrôle, biberons refusés à la même période)
  - CTA outline "Voir toute la chronologie médicale"
- Suggestions "Tu m'as aussi demandé" : 4 cartes Q/A compactes

#### E2. `Logbook` — carnet de bord
**Ref :** `direction-b-plus-memory.jsx` → `DirB_Logbook`
**Layout journal :**
- Filtres horizontaux scrollables (Tout / Premières fois / Santé / Croissance / Photos)
- Groupes par mois (header serif 18 + âge à droite)
- **Timeline verticale** : ligne 0.5 px à x=19, chaque jalon a un cercle 38 px (fond `card`, halo `bg`) avec icône colorée selon type (first/health/growth)
- Item : date + âge + avatar | titre serif 15.5 | citation italique facultative | rangée de mini-photos 56×56 (placeholders gradient catégorie)
- FAB "+" accent en bas droite, bouton "Export PDF" outline en bas gauche

---

### F. Pia proactive

#### F1. `Anticipation` — semaine 35 (ou âge bébé)
**Ref :** `direction-b-plus-proactive.jsx` → `DirB_Anticipation`
- Header : "Semaine 35", sous-titre serif "On entre dans la dernière ligne droite…"
- **Carte phare** "Préparer la valise maternité" : pill "Priorité" + emoji-bulle ronde top-right (background `${accent}10`, juste décoratif), progression 39 % avec barre, CTA double
- 5 suggestions secondaires : icône carrée colorée + titre + pill urgence + body serif + 3 chips d'action (Ajouter / Plus tard / Ignorer)
- **Section "Je penserai à te rappeler"** : rangées avec délai mono (~J1, ~J8, ~J15, ~M2) + intitulé + icône clock — projection post-naissance

#### F2. `Stocks` — stocks intelligents
**Ref :** `direction-b-plus-proactive.jsx` → `DirB_Stocks`
- **Carte phare** Couches taille 2 : pill warn "2 jours restants"
- Composant `StockGauge` : barre segmentée façon pile de couches (14 slots, couleur accent pour les remplis, `soft` pour vides)
- 2 colonnes : Consommation (7/jour, stable) + À prévoir (passage T3)
- CTA "Re-commander · 14,90€" + Ajuster
- Liste de tous les stocks suivis (icône, nom, mini-progress, jours restants en mono, couleur warn/good)
- Bandeau explicatif soft "Comment je sais" — transparence sur la détection

---

## 7. Interactions & comportements

### Composer (chat)
- **Tap micro** : ouvre l'enregistreur ; visualisation d'onde douce, possibilité d'annuler
- **Maintien micro** : mode "push to talk" mains-libres ; relâche envoie
- **Validation extraction** : chaque carte créée par Pia est confirmée auto ; l'utilisateur peut taper "Modifier" pour corriger un champ ; "Annuler" supprime la création
- **Multi-créations dans un message** : Pia répond "Noté. J'ai créé :" puis empile les cartes

### Suggestions & rappels
- Pia propose 3 actions max par briefing matin (pour ne pas submerger)
- Toute suggestion peut être : acceptée (ajoute à Tout à faire), reportée (plus tard / date), ignorée (Pia n'insiste pas)
- Les rappels admin (déclaration naissance, mutuelle, vaccins) sont **systémiques** : déclenchés par l'âge calculé ou un événement (naissance dictée)

### Patterns / vigilance
- Pia surveille des seuils paramétrables (chaque seuil cite sa source, cf. §4) :
  - selle : pas d'événement depuis ≥ 48h sur bébé < 6 mois → alerte
  - biberon : 3 refus partiels consécutifs sur même créneau → alerte
  - fièvre : 38.5 °C + change liquide → alerte forte
  - poids : > 1 percentile chuté en 2 semaines → alerte
- Toujours non-jugeantes ; toujours liées à l'historique pour contexte
- Action SOS toujours 1 tap depuis l'écran Vigilance

### Mode nuit
- Activé manuellement OU automatiquement entre 22h et 6h
- Désactive sons, vibrations, TTS de confirmation
- Bascule la palette à NIGHT (AMOLED) sur tous les écrans
- Cartes de confirmation simplifiées (juste un check vert, pas de chips)

### Recherche historique
- Langage naturel français
- L'agent doit pouvoir répondre avec date absolue + relative + contexte d'âge
- Doit citer la dictée originale quand pertinent
- Liens vers les objets connexes du corpus

---

## 8. Tweaks de prototype (à exposer en design QA, pas en prod)

| Clé | Type | Valeurs | Effet |
|---|---|---|---|
| `palette` | radio | cream / sage / rose | Palette claire |
| `dark` | toggle | – | Bascule en mode sombre standard |
| `density` | radio | compact / regular / comfy | Pas de l'espacement (row 44 / 52 / 60) |
| `tone` | radio | sobre / warm / drôle | Ton des messages Pia |
| `age` | select | S24…1 an | Adapte le contenu suggéré |
| `handsFree` | toggle | – | Mode gros boutons + dictée prioritaire |

---

## 9. Roadmap d'implémentation suggérée

**Phase 1 — Fondations conversationnelles (MVP)**
- A1 ChatInputCreate + composant CreatedCard
- A2 ChatInputRecap
- Backend LLM extraction/classification
- Speech-to-text français
- Modèle de données + sync co-parent
- Auth & RGPD

**Phase 2 — Vues secondaires**
- B1 Dashboard
- B2 Todo + B3 CoursesList
- B5 Tracking
- B6 ChatSheet

**Phase 3 — Vigilance & santé**
- D1 Vigilance (moteur de patterns)
- D2 Meds (calcul dose au poids, contacts urgence)

**Phase 4 — Mémoire**
- E1 Recall (recherche RAG sur le corpus)
- E2 Logbook (export PDF)

**Phase 5 — Proactivité**
- F1 Anticipation (catalogue de suggestions par stade)
- F2 Stocks (détection consommation)
- C1 NightDictation + C2 MorningHandoff

---

## 10. Fichiers de référence (dans ce dossier)

| Fichier | Écrans contenus |
|---|---|
| `index.html` | Point d'entrée (charge tous les scripts) |
| `app.jsx` | Composition canvas + tweaks panel |
| `ui.jsx` | Tokens, atomes (Avatar, Pill, Card, Icon), constantes |
| `direction-b-chat-input.jsx` | A1, A2 |
| `direction-b.jsx` | B1, B5, B6 |
| `direction-b-deep.jsx` | B2, B3, B4 |
| `direction-b-plus-night.jsx` | C1, C2 |
| `direction-b-plus-health.jsx` | D1, D2 |
| `direction-b-plus-memory.jsx` | E1, E2 |
| `direction-b-plus-proactive.jsx` | F1, F2 |
| `ios-frame.jsx` | Cadre iPhone (à ignorer en RN, sert juste à la mise en scène HTML) |
| `design-canvas.jsx` | Canvas de présentation (à ignorer en prod) |
| `tweaks-panel.jsx` | Panel de tweaks (à ignorer en prod, sauf si tu veux exposer un design-QA mode) |

Pour visualiser : ouvrir `index.html` dans un navigateur. Le panel Tweaks (toggle en haut à droite) permet de changer palette, densité, ton, âge, mode mains-libres.

---

## 11. Notes finales

- **Copies françaises** : ne pas anglo-traduire les microcopies (`Tap`, `Ajuster`, `Plus tard`, `Re-commander`, etc.). Le serif crée la chaleur ; le sans donne la précision.
- **Pas d'emoji décoratif** dans l'UI produit. Les emojis qui apparaissent ici (🌙 🩺 🧠 🤖) sont uniquement des labels de sections du canvas de design, pas du produit final.
- **Hiérarchie de confiance** : Pia ne décide jamais à la place du parent pour la santé. Toujours suggérer, lier au pédiatre, ne jamais diagnostiquer. Toute reco est sourcée (cf. §4).
- **Avertissement légal** dans l'onboarding et l'écran Réglages : « Pia est un assistant d'organisation, pas un dispositif médical. En cas de doute, contactez votre pédiatre ou le 15. »
- **Co-parent** : toujours afficher l'avatar de qui a fait quoi. Aucun "anonyme". Aide à la coordination, pas à la surveillance.

— Brief généré le 25 mai 2026.
