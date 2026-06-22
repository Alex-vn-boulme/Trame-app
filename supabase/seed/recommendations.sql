-- ============================================================================
-- Pia · seed du corpus RAG (recommandations officielles FR)
-- Brief §4 — règle d'or : aucune reco ne sort de Pia sans citation de source.
--
-- Cette table est lisible par tous les utilisateurs authentifiés. Les `id`
-- sont stables et référencés depuis le frontend (`<SourceFooter />`) et
-- depuis `entries.recommendation_id`.
--
-- À étendre au fil de l'app : ne JAMAIS laisser une reco dans le code sans
-- entrée correspondante ici.
-- ============================================================================

insert into public.recommendations (id, text, type, org, title, year, url, excerpt, applies_to, category) values

-- ─── Doses médicamenteuses (ANSM) ───────────────────────────────────────
('ansm-doliprane-suspension-buvable',
 'Paracétamol : 15 mg/kg par prise, toutes les 6 heures, sans dépasser 60 mg/kg/24h.',
 'official', 'ANSM', 'RCP Doliprane suspension buvable 2,4 %', 2023,
 'https://base-donnees-publique.medicaments.gouv.fr/',
 'Posologie usuelle : 60 mg/kg/jour à répartir en 4 prises, soit 15 mg/kg toutes les 6 heures.',
 '{"ageMin":"0d","ageMax":null,"condition":null}'::jsonb, 'doses'),

('ansm-vitamine-d-nourrisson',
 'Vitamine D : 1000 à 1200 UI par jour de 0 à 18 mois (allaitement maternel exclusif ou lait infantile non supplémenté).',
 'official', 'ANSM', 'Supplémentation en vitamine D chez le nourrisson', 2022,
 'https://ansm.sante.fr/',
 'Recommandation : 1000-1200 UI/jour de la naissance à 18 mois.',
 '{"ageMin":"0d","ageMax":"18m","condition":null}'::jsonb, 'doses'),

-- ─── Calendrier vaccinal (Santé publique France) ────────────────────────
('spf-vaccins-2-mois',
 'À 2 mois : DTCa-Hib-Hépatite B + Pneumocoque (1re dose, obligatoire).',
 'official', 'SantePubliqueFrance', 'Calendrier vaccinal', 2025,
 'https://sante.gouv.fr/IMG/pdf/calendrier_vaccinal_2025.pdf',
 'Vaccinations recommandées et obligatoires chez l''enfant.',
 '{"ageMin":"2m","ageMax":"2m","condition":null}'::jsonb, 'vaccins'),

('spf-vaccins-4-mois',
 'À 4 mois : DTCa-Hib-Hépatite B + Pneumocoque (2e dose, obligatoire).',
 'official', 'SantePubliqueFrance', 'Calendrier vaccinal', 2025,
 'https://sante.gouv.fr/IMG/pdf/calendrier_vaccinal_2025.pdf',
 null, '{"ageMin":"4m","ageMax":"4m","condition":null}'::jsonb, 'vaccins'),

('spf-vaccins-5-mois',
 'À 5 mois : Méningocoque B (1re dose, obligatoire).',
 'official', 'SantePubliqueFrance', 'Calendrier vaccinal', 2025,
 'https://sante.gouv.fr/IMG/pdf/calendrier_vaccinal_2025.pdf',
 null, '{"ageMin":"5m","ageMax":"5m","condition":null}'::jsonb, 'vaccins'),

('spf-vaccins-11-mois',
 'À 11 mois : DTCa-Hib-Hépatite B + Pneumocoque (rappel, obligatoires).',
 'official', 'SantePubliqueFrance', 'Calendrier vaccinal', 2025,
 'https://sante.gouv.fr/IMG/pdf/calendrier_vaccinal_2025.pdf',
 null, '{"ageMin":"11m","ageMax":"11m","condition":null}'::jsonb, 'vaccins'),

('spf-vaccins-12-mois',
 'À 12 mois : ROR (1re dose) + Méningocoque ACWY + Méningocoque B (rappel).',
 'official', 'SantePubliqueFrance', 'Calendrier vaccinal', 2025,
 'https://sante.gouv.fr/IMG/pdf/calendrier_vaccinal_2025.pdf',
 null, '{"ageMin":"12m","ageMax":"12m","condition":null}'::jsonb, 'vaccins'),

-- ─── Vigilance · seuils HAS ────────────────────────────────────────────
('has-constipation-nourrisson',
 'Pas de selle depuis plus de 48h chez un nourrisson de moins de 6 mois : à signaler au pédiatre.',
 'official', 'HAS', 'Constipation du nourrisson et du jeune enfant', 2023,
 'https://www.has-sante.fr/',
 'Surveillance : absence de selle > 48h sur un nourrisson allaité de moins de 6 mois doit alerter.',
 '{"ageMin":"0d","ageMax":"6m","condition":"selle>48h"}'::jsonb, 'vigilance'),

('has-fievre-nourrisson-3m',
 'Fièvre ≥ 38°C chez un nourrisson de moins de 3 mois : consultation médicale urgente.',
 'official', 'HAS', 'Prise en charge de la fièvre chez l''enfant', 2016,
 'https://www.has-sante.fr/',
 'Avant 3 mois, toute fièvre nécessite un avis médical sans délai.',
 '{"ageMin":"0d","ageMax":"3m","condition":"fievre>=38"}'::jsonb, 'vigilance'),

('has-troubles-oralite',
 'Refus alimentaire répété chez le nourrisson : surveiller les troubles de l''oralité, consulter si persistance > 2 semaines.',
 'official', 'HAS', 'Troubles de l''oralité du jeune enfant', 2020,
 'https://www.has-sante.fr/',
 'Refus alimentaire prolongé doit faire évoquer un trouble de l''oralité — bilan pluridisciplinaire.',
 '{"ageMin":"0d","ageMax":"24m","condition":"refus_repete"}'::jsonb, 'vigilance'),

('has-suivi-nourrisson',
 'Examens médicaux obligatoires : 20 examens entre 0 et 6 ans, dont 9 dans la première année.',
 'official', 'HAS', 'Suivi du nourrisson 0-2 ans', 2024,
 'https://www.has-sante.fr/',
 'Calendrier des examens : 8 jours, 1, 2, 3, 4, 5, 6, 9, 12 mois.',
 '{"ageMin":"0d","ageMax":"24m","condition":null}'::jsonb, 'developpement'),

-- ─── Croissance · Carnet de santé (modèle 2024) ─────────────────────────
('carnet-courbes-poids',
 'Courbes de poids P10–P90 (référentiel OMS adapté France) : suivi à chaque examen obligatoire.',
 'official', 'CarnetDeSante', 'Courbes de croissance — modèle officiel', 2024,
 'https://solidarites.gouv.fr/sites/solidarite/files/migration/carnet-de-sante-2024.pdf',
 'Référentiel de croissance utilisé en France depuis 2018, basé sur les standards OMS.',
 '{"ageMin":"0d","ageMax":"18y","condition":null}'::jsonb, 'croissance'),

('carnet-examens-obligatoires',
 'Examens obligatoires : 8 jours, 1 mois, 2 mois, 3 mois, 4 mois, 5 mois, 6 mois, 9 mois, 12 mois.',
 'official', 'CarnetDeSante', 'Examens médicaux obligatoires', 2024,
 'https://solidarites.gouv.fr/sites/solidarite/files/migration/carnet-de-sante-2024.pdf',
 null, '{"ageMin":"0d","ageMax":"24m","condition":null}'::jsonb, 'developpement'),

-- ─── Allaitement (OMS) ──────────────────────────────────────────────────
('oms-allaitement-exclusif',
 'Allaitement maternel exclusif recommandé jusqu''à 6 mois, puis avec diversification jusqu''à 2 ans ou plus.',
 'official', 'OMS', 'Recommandations sur l''allaitement', 2023,
 'https://www.who.int/fr/health-topics/breastfeeding',
 'L''OMS recommande l''allaitement exclusif pendant les 6 premiers mois de la vie.',
 '{"ageMin":"0d","ageMax":"24m","condition":null}'::jsonb, 'alimentation'),

('oms-diversification-6m',
 'Diversification alimentaire : à partir de 6 mois révolus, en complément du lait.',
 'official', 'OMS', 'Diversification alimentaire', 2023,
 'https://www.who.int/',
 null, '{"ageMin":"6m","ageMax":null,"condition":null}'::jsonb, 'alimentation'),

-- ─── Sommeil (HAS) ──────────────────────────────────────────────────────
('has-sommeil-couchage-dos',
 'Coucher le nourrisson sur le dos, dans une gigoteuse, sur matelas ferme, sans oreiller ni couverture.',
 'official', 'HAS', 'Prévention de la mort inattendue du nourrisson', 2022,
 'https://www.has-sante.fr/',
 'Position dorsale, matelas ferme adapté, pas de tour de lit, pas de jouet — réduction du risque MIN.',
 '{"ageMin":"0d","ageMax":"12m","condition":null}'::jsonb, 'vigilance'),

-- ─── Grossesse (CNGOF) ──────────────────────────────────────────────────
('cngof-consultation-pre-natale',
 '7 consultations prénatales obligatoires : 1 par mois du 4e au 9e mois.',
 'official', 'CNGOF', 'Suivi de grossesse — recommandations', 2024,
 'https://www.cngof.fr/',
 'Calendrier des consultations prénatales et examens recommandés.',
 '{"ageMin":null,"ageMax":null,"condition":"pregnancy"}'::jsonb, 'grossesse'),

('cngof-echographie-trimestre',
 '3 échographies recommandées : T1 (11-13 SA), T2 (20-22 SA), T3 (30-32 SA).',
 'official', 'CNGOF', 'Échographie obstétricale', 2024,
 'https://www.cngof.fr/',
 null, '{"ageMin":null,"ageMax":null,"condition":"pregnancy"}'::jsonb, 'grossesse'),

-- ─── Admin (Service-Public.fr) ──────────────────────────────────────────
('servicepublic-declaration-naissance',
 'Déclaration de naissance à la mairie dans les 5 jours suivant l''accouchement (Code civil art. 55).',
 'official', 'ServicePublic', 'Déclaration de naissance', 2025,
 'https://www.service-public.fr/particuliers/vosdroits/F961',
 'La déclaration doit être faite dans les 5 jours qui suivent le jour de l''accouchement.',
 '{"ageMin":"0d","ageMax":"5d","condition":null}'::jsonb, 'admin'),

('servicepublic-conge-paternite',
 'Congé paternité : 25 jours (28 en cas de naissances multiples), à prendre dans les 6 mois après la naissance.',
 'official', 'ServicePublic', 'Congé de paternité', 2024,
 'https://www.service-public.fr/particuliers/vosdroits/F3156',
 null, '{"ageMin":"0d","ageMax":"6m","condition":null}'::jsonb, 'admin'),

('servicepublic-prime-naissance',
 'Prime à la naissance CAF : à demander pendant la grossesse, versée au 7e mois.',
 'official', 'ServicePublic', 'Prime à la naissance', 2024,
 'https://www.service-public.fr/particuliers/vosdroits/F2552',
 null, '{"ageMin":null,"ageMax":null,"condition":"pregnancy"}'::jsonb, 'admin'),

('servicepublic-mutuelle-rattachement',
 'Rattachement de l''enfant à la mutuelle / Sécurité sociale : dans les 30 jours après naissance.',
 'official', 'ServicePublic', 'Affiliation Sécurité sociale enfant', 2024,
 'https://www.service-public.fr/particuliers/vosdroits/F164',
 null, '{"ageMin":"0d","ageMax":"30d","condition":null}'::jsonb, 'admin'),

-- ─── Développement (Carnet santé / HAS) ─────────────────────────────────
('has-jalon-sourire-social',
 'Sourire social : généralement entre 6 et 8 semaines.',
 'official', 'HAS', 'Repères de développement', 2024,
 'https://www.has-sante.fr/',
 null, '{"ageMin":"4w","ageMax":"12w","condition":null}'::jsonb, 'developpement'),

('has-jalon-tenue-tete',
 'Tenue de tête : acquise vers 3-4 mois.',
 'official', 'HAS', 'Repères de développement', 2024,
 'https://www.has-sante.fr/',
 null, '{"ageMin":"3m","ageMax":"4m","condition":null}'::jsonb, 'developpement'),

('has-jalon-position-assise',
 'Position assise avec appui : 6-7 mois ; sans appui : 8-9 mois.',
 'official', 'HAS', 'Repères de développement', 2024,
 'https://www.has-sante.fr/',
 null, '{"ageMin":"6m","ageMax":"9m","condition":null}'::jsonb, 'developpement'),

('has-jalon-marche',
 'Marche autonome : généralement entre 12 et 18 mois.',
 'official', 'HAS', 'Repères de développement', 2024,
 'https://www.has-sante.fr/',
 null, '{"ageMin":"12m","ageMax":"18m","condition":null}'::jsonb, 'developpement'),

-- ─── Urgence ────────────────────────────────────────────────────────────
('spf-samu-pediatrique',
 'SAMU pédiatrique : 15 (depuis un fixe ou mobile), gratuit, 24h/24.',
 'official', 'SantePubliqueFrance', 'Numéros d''urgence', 2024,
 'https://www.sante.fr/numeros-urgence',
 null, null, 'urgence'),

('spf-sos-allaitement',
 'SOS Allaitement : ligne d''écoute et de conseil par des consultantes en lactation IBCLC.',
 'official', 'SantePubliqueFrance', 'Soutien à l''allaitement', 2024,
 'https://www.sante.fr/',
 null, null, 'urgence'),

-- ─── Préparation naissance (non-officiel — affiché comme tel) ───────────
('heuristic-valise-maternite-s37',
 'Valise maternité à préparer autour de S37 (selon recos maternités).',
 'heuristic', null, null, null, null,
 null, '{"ageMin":null,"ageMax":null,"condition":"pregnancy>=37"}'::jsonb, 'grossesse');
