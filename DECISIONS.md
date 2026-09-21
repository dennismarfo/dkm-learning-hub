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

---

## 2026-09-21 — Ressource « La pub en dix minutes » (Claude Code)

### D-020 — Guide + générateur de brief sur `/resources/pub-motion`, atelier à part du parcours
- **Contexte** : plusieurs personnes ont demandé à Dennis comment il avait produit la pub
  Maya en motion design. Demande exprimée, pas devinée. Il veut y répondre par un Reel
  (mot-clé PUB) qui renvoie vers un guide, et le guide doit exister avant le Reel : si les
  gens commentent et qu'il n'y a rien à envoyer, on perd exactement les gens qu'on visait.
- **Périmètre honnête** : les dix minutes couvrent **l'animation seule**, de la description à
  la vidéo. Le premier bloc de la page dit ce qu'elles couvrent et ce qu'elles ne couvrent pas,
  avant tout le reste. Se contredire publiquement coûte plus cher qu'un hook.
- **Décision** : implémenter la ressource comme **page 100 % client** sur `/resources/pub-motion`
  (`src/resources/PubMotion.tsx`, contenu et moteur dans `pub-motion-data.ts`, brief dans
  `pub-motion-brief.ts`), sur le modèle d'Anatomie (D-018) : un guide court lisible, puis un
  générateur en quatre étapes (la pub, le format, les scènes, la charte), brouillon persisté
  en `localStorage`, export **Markdown** par Blob / presse-papier / impression.
  Le cœur est le **tableau des scènes** (libellé, seconde de début, seconde de fin, ce qu'on
  voit) et son **moteur de vérification** (`checkTiming`) qui signale chevauchements, trous et
  scènes trop courtes. Raccourci partageable `/pub` → `/resources/pub-motion`, comme `/anatomie`.
- **Ligne gratuit / payant** : la ressource livre un **gabarit de départ neutre**
  (`public/gabarit-pub/`, trois scènes, quinze secondes) et non le vrai `index.html` de la pub
  Maya (dix scènes), ni le brief réel de quatre pages, ni `RAPPORT_MONTAGE.md`, qui restent la
  matière du produit 01 payant. `render.py` est livré tel quel : ses seize lignes sont déjà
  racontées publiquement dans le Reel.
- **Placement** : pas une « Étape 3 ». Anatomie et Soul Document forment un parcours « ton
  système » ; celle-ci est un **atelier de création**, présenté dans une section distincte sous
  le parcours en deux étapes. La fin du brief renvoie vers `/resources/anatomie`.
- **Navigation** : contrairement à Anatomie qui reste en mode autonome (`STANDALONE = true`),
  cette page garde la navigation vers le Hub. Son rôle est d'alimenter l'entonnoir depuis le
  Reel, une page sans issue ne le ferait pas. À réexaminer si Dennis veut aligner les deux.
- **Capture courriel** : conforme à D-017 et D-018, **aucun faux formulaire**. L'écran n'existe
  que si `VITE_PUB_WEBHOOK_URL` est défini au build ; il envoie prénom, courriel, consentement
  et un **résumé de format** (durée, nombre de scènes, plateforme), jamais le contenu de la pub.
  L'utilisateur peut toujours passer. Création du webhook n8n déléguée à Hermès (cf. `HANDOFF.md`).
- **Mesure** (D-019) : `pub_start`, `pub_resume`, `pub_brief`, `pub_download`, `pub_copy`,
  `pub_print`, `pub_lead`, `pub_lead_skip`. Aucune donnée personnelle.
- **Conséquence** : zéro dépendance ajoutée, aucun backend, aucun secret. Deux mots-clés actifs
  côté contenu, ANATOMIE et PUB ; SOUL reste accessible mais n'est plus promu.

#### Deux pièges corrigés dans le gabarit, vérifiés au rendu
1. **Fondu enchaîné, pas fondu au noir.** La première version laissait une image entièrement
   noire à chaque transition, et faisait partir la première image du noir. Sur un Reel la
   première image sert de vignette et la dernière porte l'appel à l'action. La scène entrante
   arrive maintenant par dessus la sortante, et il n'y a aucun fondu aux deux bouts.
2. **`-pix_fmt yuv420p` ne suffit pas avec un pipe JPEG.** ffmpeg conservait la plage de
   couleur pleine et sortait du `yuvj420p` en ignorant le réglage. La conversion
   `-vf scale=in_range=full:out_range=tv` est ajoutée avant l'encodage. Vérifié : le rendu sort
   en `yuv420p`, `color_range=tv`, 1080×1920, 30 i/s, 450 images, 15,000 s.

---

## 2026-09-21 — Corrections après relecture de Dennis (Claude Code)

### D-021 — La pub Maya a pris une soirée, pas deux jours : correction propagée
- **Contexte** : `00-STRUCTURE.md` affirmait « la pub a pris deux jours ». D-020 et toute la
  ressource reprenaient ce chiffre. Dennis a corrigé : voix off, enregistrement de l'appel et
  capture vidéo de son téléphone ont été faits dans la foulée, le même jour.
- **Vérification** : les horodatages de `~/Documents/OptiAI/.../pub-maya/` donnent tout au
  **11 septembre 2026** : voix off 15h21 et 15h22, appel enregistré 15h37, mixage audio 16h14,
  maquettes de direction artistique 21h44, rendu final 22h53. Longue coupure entre 16h26 et
  21h43, soit **environ deux heures de travail réel**. Le pipeline `Video/` n'a jamais servi :
  aucune sortie « maya » dans `Video/output/`.
- **Décision** : dire « **une soirée, environ deux heures de travail réel** » partout, et
  « **l'animation** » plutôt que « le décor » pour désigner les dix minutes. Corrigé dans
  `pub-motion-data.ts`, `pub-motion-brief.ts`, `App.tsx`, `REEL-pub-motion.md`, la mémoire
  projet, et **à la source** dans `01-pub-ia/00-STRUCTURE.md`.
- **Conséquence** : l'affirmation devient à la fois plus forte et vraie. Une pub complète en
  une soirée impressionne davantage que la même en deux jours.

### D-022 — HyperFrames n'entre pas dans le guide : il n'a pas servi à la pub Maya
- **Contexte** : Dennis utilise HyperFrames 0.8.20 (épinglé) dans `~/Documents/DKM/Video/`
  pour ses Reels (`hyperframes lint`, `render`, `check --caption-zone --frame-check`). Question
  posée : faut-il l'enseigner dans le guide ?
- **Vérification** : zéro occurrence de « hyperframe » dans `pub-maya/`. `BRIEF_CLAUDE_CODE.md`
  cite Playwright, ffmpeg, whisper et `render.py`. Aucune sortie « maya » dans `Video/output/`.
- **Décision** : **ne pas en parler**. Le guide raconte la pub Maya, donc Playwright et ffmpeg.
  Règle retenue de Dennis : on ne mentionne un outil que s'il a réellement servi à ce qu'on
  raconte. Si un futur contenu part du pipeline `Video/`, HyperFrames y aura sa place.

### D-023 — Langue du guide : pour quelqu'un qui ne s'y connaît pas
- **Contexte** : Dennis a jugé la première version « trop technique pour quelqu'un qui ne s'y
  connaît pas ». Le guide ouvrait sur `render(t)`, `index.html`, Playwright et ffmpeg.
- **Décision** : réécriture complète du contenu de `pub-motion-data.ts`. Ajout d'un bloc
  **« Tu n'as pas besoin de savoir coder »** (`NOT_NEEDED`) juste après l'honnêteté, parce que
  c'est là que les gens décrochent. Les deux réglages deviennent **deux exigences à mettre dans
  le brief**, formulées en phrases (« Attends que mes polices soient chargées »), le symptôme
  d'abord, la ligne de code reléguée en bas comme vérification facultative. Le jargon est
  expliqué à sa première apparition, ou supprimé.
- **Pourquoi c'est aligné sur la thèse** : le lecteur n'écrit jamais de code, il écrit un brief.
  Présenter les réglages comme des lignes à taper contredisait la thèse du produit.
- **Conséquence** : espacement revu aussi (`.pub-guide` en grille, gap 36px, cartes à 38px de
  padding), la page se lit au lieu de se remplir.

### D-024 — Vote anonyme sur l'intérêt pour un tuto « direction artistique »
- **Contexte** : Dennis veut mesurer si les gens veulent un tutoriel sur la création d'une
  direction artistique avec Claude. Il a déjà la matière : `pub-maya/maquettes-da/` compare
  trois pistes.
- **Décision** : un **vote anonyme** à l'étape « La charte » du générateur, c'est-à-dire au
  moment exact où la personne doit entrer ses couleurs et se rend compte qu'elle n'en a pas.
  Ni nom, ni courriel, ni consentement à gérer : un bouton, un compte.
  Le vote est **toujours réellement enregistré** via `track('pub_vote', { topic })`
  (Vercel Web Analytics, D-019), donc aucun faux formulaire au sens de D-017 même sans webhook.
  `VITE_VOTE_WEBHOOK_URL`, quand il est défini, ajoute une trace durable côté n8n.
  Anti-double-vote par `localStorage` (`dkm.vote.direction-artistique`), assumé comme
  approximatif : il décourage le clic répété, il ne prétend pas à l'unicité.
- **Conséquence** : pas de troisième mot-clé en DM, ce que Dennis voulait éviter. Si le compte
  monte, le tuto direction artistique devient le produit suivant.

---

## 2026-09-21 — Refonte du générateur après test de lisibilité (Claude Code)

### D-025 — On ne demande pas à l'utilisateur ce que la machine sait faire
- **Contexte** : Dennis a testé la ressource et a dit deux choses. « On ne sait pas trop ce
  qu'on doit faire », et surtout : l'étape des scènes est bloquante pour un non-technique,
  **« moi-même je n'ai pas eu à faire ça »**.
- **Vérification, et c'est le point important** : `pub-maya/BRIEF_CLAUDE_CODE.md` ne crée pas
  l'animation, il la **finit**. Première ligne : « tout le reste est déjà monté : animation
  60 s ». Le tableau de secondes qu'il contient concerne les **dix répliques de voix off**,
  calées sur une animation qui existait déjà (« l'appel entrant apparaît à l'écran à 12,36 s » :
  la seconde est lue, pas inventée). Dennis n'a donc jamais rédigé à la main un tableau de
  scènes avec des débuts et des fins.
- **Conclusion** : l'ancienne étape 3 demandait à un débutant le travail que la machine avait
  fait pour l'auteur. Ce n'était pas un défaut d'ergonomie, c'était une erreur de conception,
  et elle contaminait le guide, qui affirmait « décide les secondes avant de décider les images ».
- **Décision** :
  1. **Des modèles de pub** (`TEMPLATES`) : Problème → Preuve → Appel, Avant / Après,
     Démonstration, Je pars de zéro. On choisit une forme, les étapes arrivent nommées, avec
     une explication et un exemple en texte de substitution. Jamais de page blanche.
  2. **Aucune seconde à l'écran.** Le minutage est calculé à partir de parts (`share`) et de la
     durée choisie, et replié derrière « Ajuster le minutage toi-même », facultatif. Les parts
     garantissent au moins trois secondes à l'appel à l'action, même sur une pub de quinze.
  3. **Le brief demande le découpage à Claude**, en trois temps : propose le découpage, attends
     ma validation, et seulement ensuite construis. Le minutage y figure comme « proposition,
     à confirmer », avec deux contraintes de rythme non négociables (trois premières secondes,
     appel à l'action ≥ 3 s et lisible jusqu'à la dernière image). C'est le vrai déroulé.
  4. **Le choix des images par seconde disparaît de l'interface.** 30 convient à tout ; le
     proposer ne faisait qu'ajouter une décision sans enjeu. `FPS` reste dans le brief.
  5. **Les zones interdites deviennent une case à cocher** (« garder de la place pour
     l'interface de la plateforme ») au lieu d'un champ libre parlant de pixels.
  6. **Un bloc « Concrètement, tu fais quoi ? »** (`WHAT_YOU_DO`) ouvre la page, avant même
     l'honnêteté : trois temps numérotés, une estimation de durée pour chacun, et un bouton
     « Commencer ». C'est la réponse directe à « on ne sait pas trop ce qu'on doit faire ».
  7. **Plus rien ne bloque** : `isUsable` exige seulement une marque et une étape remplie, et
     `missing()` renvoie une phrase utile plutôt qu'une interdiction.
- **Garde-fou vérifié** : changer de durée ou de modèle **ne doit jamais effacer** le texte
  déjà saisi. `buildScenes` conserve le contenu position par position, et le mode « Je pars de
  zéro » conserve aussi les noms d'étapes donnés par l'utilisateur. Testé en navigateur.
- **Conséquence sur le guide** : l'étape 1 s'appelle désormais « Tu décris. Tu n'inventes pas le
  minutage », et cite le déroulé réel de la pub Maya. Les erreurs listées passent de « ce qu'il
  faut produire » à **« ce qu'il faut savoir regarder »** : accroche trop tardive, appel à
  l'action trop court, première image noire. Le lecteur valide une proposition, il ne la
  fabrique pas.
