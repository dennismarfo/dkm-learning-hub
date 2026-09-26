# DECISIONS — dkm-learning-hub

Journal des décisions d'architecture (ADR léger). Chaque décision : date,
contexte court, décision, conséquence. Les décisions importantes futures
s'ajoutent ici.

---

## 2026-05-29 — Décisions d'architecture initiales (V1)

### D-001 — Supabase est la source de vérité des données
- **Décision** : toutes les données de learning vivent dans
  `learning_hub.learnings` (Supabase). C'est la seule référence décisionnelle.
- **Conséquence** : les autres outils lisent/écrivent via Supabase ; aucun autre
  store ne fait autorité.

### D-002 — Notion est un miroir, pas une source de vérité
- **Décision** : Notion reflète Supabase pour le triage mobile (push
  Supabase → Notion). Pas de synchro bidirectionnelle en V1.
- **Conséquence** : en cas de divergence, Supabase fait foi ; une page Notion
  peut être recréée sans perte.

### D-003 — GitHub est la source de vérité technique
- **Décision** : migrations SQL, prompts, contrats JSON, workflows n8n exportés,
  docs et handoffs sont versionnés dans ce repo.
- **Conséquence** : rien d'infra ne se fait sans qu'un artefact correspondant
  existe et soit relu dans le repo.

### D-004 — n8n assure l'orchestration
- **Décision** : la capture, l'appel IA, la validation, l'insertion et la
  notification sont orchestrés dans n8n.
- **Conséquence** : n8n ne stocke pas d'état durable ; il orchestre vers Supabase.

### D-005 — Telegram pour capture, validation et notification
- **Décision** : Knowledge Scout (Telegram) est le point d'entrée ; Dennis reçoit
  les notifications de triage par Telegram.
- **Conséquence** : `telegram_message_id` sert de clé de déduplication (UNIQUE).

### D-006 — V1 limitée à capture + structure + stockage (+ notification)
- **Décision** : le flux automatisé s'arrête à `status = 'structured'` +
  notification Dennis.
- **Conséquence** : périmètre maîtrisé, livrable rapide et testable.

### D-007 — Pas d'automatisation de publication en V1
- **Décision** : la transformation en contenus/offres et la publication restent
  **manuelles** (décision de Dennis).
- **Conséquence** : `content_ready` / `published` sont des états posés à la main ;
  les colonnes `output_*` / `published_assets` existent mais ne sont pas
  alimentées automatiquement en V1.

### D-008 — Structuration via un prompt unique versionné
- **Décision** : un seul prompt `haiku-structure-v1` (Claude Haiku) produit un
  JSON strict conforme à `json-contract-v1`.
- **Conséquence** : `structured_with_prompt_version` trace la version utilisée ;
  les évolutions passeront par `haiku-structure-v2`, etc.

### D-009 — Séparation des rôles Claude Code / Hermès
- **Décision** : Claude Code conçoit (specs, code, docs) ; Hermès exécute l'infra
  réelle via MCP. Claude Code ne se connecte pas aux services.
- **Conséquence** : toute action infra passe par une demande dans `HANDOFF.md`.

### D-010 — Migrations SQL idempotentes
- **Décision** : les migrations sont réexécutables sans erreur.
- **Conséquence** : usage de `if not exists`, `create or replace`,
  `drop ... if exists` avant `create`.

### D-011 — Schéma Postgres dédié `learning_hub`
- **Décision** : la table vit dans un schéma dédié `learning_hub`, pas dans
  `public`.
- **Conséquence** : isolation claire des objets du Hub ; les accès se font sur
  `learning_hub.learnings` (à prendre en compte côté credentials n8n et RLS).

### D-012 — Sortie de structuration toujours en français
- **Décision** : le prompt `haiku-structure-v1` produit toujours des champs
  en français, quelle que soit la langue du message brut.
- **Conséquence** : cohérence du triage et du contenu ; les messages en d'autres
  langues sont structurés en français.

---

## 2026-05-29 — Décision suite à la mise en place infra (Hermès)

### D-013 — Persistance via credential Postgres direct (pas le node Supabase API)
- **Contexte** : le node n8n Supabase passe par l'API REST (PostgREST), qui
  n'expose que les schemas listés. Le schema dédié `learning_hub` (cf. D-011)
  n'y est pas exposé → l'insert via l'API échoue (`Invalid schema: learning_hub`).
- **Décision** : écrire dans Supabase via un **credential n8n de type Postgres**
  (connexion directe au projet `khwogmehrpeiwaemiccx`), et **ne pas** exposer
  `learning_hub` dans l'API Supabase.
- **Conséquence** :
  - Surface API publique inchangée (cohérent avec l'isolation voulue par D-011).
  - La connexion Postgres directe **contourne la RLS** : en V1, seul n8n
    (credential dédié) écrit. La RLS reste une question ouverte (cf. `HANDOFF.md`).
  - Le mot de passe DB est un secret géré dans n8n, **jamais** dans le repo.
  - Le credential mal typé `Supabase Postgres - Knowledge Hub` (en réalité
    `supabaseApi`) ne doit pas être utilisé pour le node Postgres.

---

## 2026-06-25 — Décision contenu Learning Hub (Claude Code)

### D-014 — Contenu de cours extrait des littéraux JS source → JSON versionné
- **Contexte** : le frontend MVP affichait des placeholders. Le vrai contenu vit
  dans 4 HTML source (3 tomes + examen) fournis par Dennis, où chaque page embarque
  ses données dans des littéraux JS propres (`MODULES`, `GLOSSARY`, `EXAM`) — prose,
  démos, quiz avec bonnes réponses + corrections, définitions de glossaire.
- **Décision** : extraire ces littéraux via `scripts/extract-content.mjs` (parse
  conscient des chaînes + `vm`, zéro dépendance) vers `src/content/architecture-ia.json`,
  versionné dans le repo. Aucun contenu inventé (règle #2). Le corps de leçon est
  rendu en **HTML de confiance** (`dangerouslySetInnerHTML`), issu de nos propres
  sources. Les HTML source sont conservés sous `content/source/` comme provenance.
- **Conséquence** :
  - Régénération idempotente : `npm run extract:content` (ne jamais éditer le JSON).
  - Le parcours passe de 16 placeholders à **20 modules réels** + examen 18 questions.
  - Les **widgets interactifs** (démos) restent en visuel statique ; reconstruction
    React = suivi listé dans `docs/content-extraction-v1.md`.
  - Travail 100 % frontend : aucune action infra / Hermès, aucun secret.

---

## 2026-06-28 — Frontend : ressource Soul Document + direction artistique (Claude Code)

### D-015 — Direction artistique « editorial cockpit » (réduction du jaune)
- **Contexte** : la DA MVP était jugée « trop jaune » — fond `body` en gradient sand
  plein écran, nav sand opaque, cartes teintées sand. Lecture peu premium.
- **Décision** : passer à une esthétique **hybride fixe « AI Learning Lab / editorial
  cockpit »** (validée par Dennis) : fond ivory neutre (plus de gradient jaune), **bandes
  Ink profondes** pour hero / cours vedette / hero ressources (halo sand subtil), nav ivory
  à fine bordure, cartes claires plus élégantes (ombres profondes, plus d'espace), **CTA en
  terracotta**, Ink comme couleur structurante, **Sand cantonné aux accents/halos/badges/
  fines bordures**. Sections alternées light/dark, **sans theme toggle**. Système piloté par
  tokens CSS (`--bg`, `--surface`, `--ink-deep`, `--halo`…) dans `src/styles.css`.
- **Conséquence** : le redesign se concentre dans les tokens + quelques règles structurelles ;
  cours, quiz, examen et démos héritent automatiquement et restent lisibles sur fond clair.
  Les fonds sand restants sont des accents contenus (notes, chrome de démo « Interactif »),
  conformes à l'usage « sand = highlight ».

### D-016 — Soul Document : lead magnet 100 % frontend (sans backend)
- **Contexte** : `/resources` était un placeholder. Besoin d'une ressource phare qui
  transforme un visiteur en utilisateur engagé.
- **Décision** : implémenter le **Soul Document generator** comme outil 100 % client
  (`src/resources/SoulDocument.tsx`) : wizard 6 étapes piloté par config, génération d'un
  `.md` (mémoire business + prompt système), export par **copie presse-papier et
  téléchargement Blob natifs**. **Aucune dépendance, aucun backend, aucune API, aucun
  secret** ; rien n'est envoyé hors du navigateur.
- **Conséquence** : zéro coût infra et aucune action Hermès pour cette ressource. Si une
  capture/persistance des Soul Documents devient souhaitable plus tard, elle fera l'objet
  d'une décision distincte (Supabase = source de vérité, cf. D-001).


---

## 2026-08-12 — Acquisition : accès au contenu et capture email (Hermès)

### D-017 — V1 ouverte avec capture email progressive, pas de hard gate immédiat
- **Contexte** : Dennis envisage de demander nom, prénom et email avant de donner accès au Learning Hub.
- **Décision** : ne pas bloquer l’accès au cours principal en V1. Garder le parcours d’apprentissage ouvert pour réduire la friction, construire la confiance et laisser le contenu prouver sa valeur. Introduire plutôt une capture email progressive sur les éléments à forte valeur perçue : ressources bonus, mises à jour, templates, certificat/examen, communauté ou futures cohortes.
- **Conséquence** : la homepage peut annoncer une logique “accès libre maintenant, capture email bientôt”, mais la vraie persistance des leads nécessitera une décision/implémentation dédiée (formulaire + backend/Supabase/n8n + consentement). Aucun faux formulaire sans stockage réel.

### D-018 — « L'anatomie de ton entreprise » : module 0 interactif, rapport IA-ready, capture conditionnelle
- **Contexte** : cadrage de l'offre formation/coaching DKM (cohorte « Ton système IA en place »).
  Constat : la plupart des solos ne savent pas nommer leurs tâches récurrentes ni les
  fonctions de leur entreprise ; on ne peut pas auditer à partir d'une page blanche. Le
  module 0 « L'anatomie de ton entreprise » (7 fonctions, tâches typiques à cocher,
  reconstruction par agenda/courriels/messages) est le contenu gratuit d'entrée, et son
  rapport de sortie doit être réutilisable dans une IA (graine du Soul Document).
- **Décision** : implémenter le module 0 comme **outil interactif 100 % client** sur
  `/resources/anatomie` (`src/resources/Anatomie.tsx`, données et moteur de score dans
  `anatomie-data.ts`, rapport dans `anatomie-report.ts`) : 7 écrans (un par fonction),
  statut FAIS / DEVRAIS / N/A par tâche, pour FAIS fréquence + minutes + pénibilité +
  répétitivité en chips, tâches personnalisées, avancement persisté en `localStorage`,
  écran de résultats (heures/mois par fonction, DEVRAIS, top candidats par score, choix du
  processus prioritaire), rapport **Markdown** avec prompt de démarrage en tête, export par
  Blob / presse-papier / impression (PDF via `window.print()`). Score = heures/mois ×
  pénibilité × répétitivité, aligné sur le gabarit Notion de la cohorte.
- **Capture courriel** : conforme à D-017, **aucun faux formulaire**. L'écran de capture
  n'existe que si `VITE_ANATOMIE_WEBHOOK_URL` est défini au build ; il envoie alors
  prénom, courriel, consentement explicite et un **résumé chiffré** (heures, top 3,
  processus prioritaire), jamais la carte détaillée. L'utilisateur peut toujours passer
  et voir le rapport. La création du webhook n8n (→ Notion/Supabase) est déléguée à
  Hermès (cf. `HANDOFF.md`).
- **Conséquence** : la page `/resources` présente un ordre (Étape 1 anatomie, Étape 2 Soul
  Document). Le gabarit de tâches est une transposition du gabarit Notion : toute
  révision issue de l'auto-cohorte de Dennis (sept.-oct. 2026) se répercute dans
  `anatomie-data.ts`. Zéro dépendance ajoutée ; `src/vite-env.d.ts` type `import.meta.env`.

### D-019 — Mesure d'audience : Vercel Web Analytics + événements d'entonnoir
- **Contexte** : l'outil Anatomie est partagé publiquement (D-018) ; il faut savoir combien
  de personnes ouvrent, commencent, terminent et téléchargent, sans bannière cookies.
- **Décision** : Vercel Web Analytics, chargé par balise `<script>` dans `index.html`
  (`/_vercel/insights/script.js`, aucune dépendance npm, stub `window.va` en attendant le
  script). Événements personnalisés via `src/analytics.ts` (`track(name, data)`), jamais
  bloquants, sans donnée personnelle : `anatomie_start`, `anatomie_resume`,
  `anatomie_results` (nb réponses), `anatomie_report` (heures, FAIS, DEVRAIS),
  `anatomie_download`, `anatomie_copy`, `anatomie_print`, `anatomie_lead`,
  `anatomie_lead_skip`. L'activation d'Analytics se fait dans le tableau de bord Vercel
  (action Dennis). Les événements personnalisés peuvent être limités par le plan Vercel ;
  les pages vues fonctionnent dans tous les cas.
- **Conséquence** : Claude (Cowork) peut lire les chiffres via le MCP Vercel et les
  intégrer au brief. Aucun tracker tiers, pas de consentement à gérer.

### D-030 — « Checklist Loi 25 » : livrable du mot-clé LOI 25, 100 % client, sans capture
- **Contexte** : le Reel Loi 25 (publié le 26 sept. 2026) promet une checklist à qui commente
  « LOI 25 ». Il faut un lien à envoyer en DM le jour même, dans le même esprit que
  l'Anatomie et le Soul Document.
- **Décision** : ressource `/resources/loi25` (raccourci partageable `/loi25`, réécrit vers
  l'URL canonique comme `/anatomie`). Dix affirmations formulées pour que « Oui » = conforme,
  cinq sur l'outil IA (entraînement, hébergement hors Québec, conservation, accès du
  fournisseur, entente écrite) et cinq sur l'entreprise (responsable publié, EFVP, information
  à la collecte, décision automatisée, incidents), chacune avec l'article de la P-39.1, le
  pourquoi, comment vérifier et quoi faire. Réponses Oui / Non / Je ne sais pas, résultat
  X/10, liste « à régler » ordonnée (Non, puis Je ne sais pas, puis sans réponse), sanctions,
  sources officielles (LégisQuébec, CAI), rapport **Markdown** avec prompt en tête, export
  Blob / presse-papier / impression. Mention « pas un avis juridique » en haut et dans le
  rapport. `STANDALONE = true` comme l'Anatomie. **Aucune capture courriel** (D-017) : la
  page n'envoie rien hors du navigateur. Événements (D-019) : `loi25_start`,
  `loi25_results` (oui, non, nsp), `loi25_download`, `loi25_copy`, `loi25_print`.
- **Conséquence** : contenu juridique vérifié le 26 sept. 2026 dans `loi25-data.ts` ; toute
  modification de la loi ou des montants de sanctions se corrige à cet endroit. Une carte
  « Conformité · Loi 25 » s'ajoute à `/resources`. Zéro dépendance ajoutée.
