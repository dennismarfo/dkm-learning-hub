# HANDOFF — dkm-learning-hub

Journal de coordination entre Dennis, Claude Code et Hermès.

## 2026-06-29 — Claude Code (refactor primitives UI + nouveau logo)

- **Extraction de primitives UI** dans `src/components/` (réutilisées partout, allège
  `src/App.tsx` et supprime le bloc logo dupliqué ~7×) : atomes `Brand`, `Button`, `Pill` ;
  molécules `ModuleLink`, `QuizBlock` ; organisme `Nav` ; barrel `index.ts`. `App.tsx`
  passe des one-liners denses à du JSX multi-ligne lisible ; `SoulDocument` consomme aussi
  les atomes partagés. **Comportement strictement identique** (JSX transcrit fidèlement).
  Structure volontairement **plate** (pas de dossiers atoms/molecules/organisms imbriqués)
  pour ne pas sur-architecturer le MVP (règle #4) ; layering Atomic Design complet reporté
  à plus tard si l'UI grossit.
- **Nouveau traitement du logo** : « dkm » reste la **signature serif italique terracotta** ;
  « Learning Hub » est rétrogradé en **label discret JetBrains Mono majuscules espacé
  (ink-70)**, séparé par un fin trait vertical. Hiérarchie plus claire, raccord avec les
  eyebrows « editorial cockpit ». Remplace l'ancien Inter 800 trop lourd. (Sidebar leçon :
  label « Hub ».)
- Vérifs : `npm run build` (TS strict OK, 57 modules). Smoke test navigateur **non rejoué**
  (extension Chrome déconnectée en fin de session) — refactor sans changement de comportement,
  build vert.
- **Aucune action infra / Hermès. Aucun secret.** Travail 100 % frontend, même PR
  `feat/soul-document-resource`.

Prochaine action recommandée (1 seule) : faire reviewer puis merger la PR
`feat/soul-document-resource` (Soul Document + redesign + refactor + logo).

---

## 2026-06-28 — Claude Code (ressource Soul Document + redesign premium)

- **Nouvelle ressource phare : Soul Document generator** (`src/resources/SoulDocument.tsx`).
  Assistant guidé en **6 étapes** (Identité & mission · Audience/ICP · Offre & promesse ·
  Voix & ton · Règles do/don't/limites · Contexte & ressources) piloté par un tableau de
  config, state unique. Produit un document `.md` = **mémoire business lisible** +
  **prompt système prêt à coller**. Export 100 % natif : copie presse-papier
  (`navigator.clipboard`) + téléchargement `.md` (`Blob`), **aucune dépendance ajoutée**.
  Validation légère non bloquante (compteur de complétude), navigation Précédent/Suivant +
  pastilles d'étape, page résultat (Copier / Télécharger / Modifier / Recommencer).
- **Nouvelle route** `/resources/soul-document` (routeur custom par `pathname`, helper `go`
  factorisé dans `src/nav.ts`). Page `/resources` refondue : le Soul Document devient
  l'outil phare (« Génère la mémoire business de ton IA » + CTA « Lancer le générateur »),
  anciens items en cartes « bientôt ». Bouton retour vers Ressources sur la page outil.
- **Redesign « editorial cockpit »** (`src/styles.css`, piloté par tokens) : suppression du
  gradient jaune plein écran (fond ivory neutre), nav ivory à fine bordure, **bandes Ink
  profondes** (hero + cours vedette + hero ressources) avec halo sand, cartes plus élégantes
  (surfaces claires, ombres profondes, plus d'espace), **CTA terracotta**, Ink redevient
  structurant, Sand cantonné aux accents/halos/badges. Sections alternées light/dark, sans
  toggle. Choix validé par Dennis (cf. `DECISIONS.md` D-015).
- Vérifs : `npm run build` (TS strict OK), `npm audit --audit-level=moderate` (**0 vuln**),
  smoke test navigateur de toutes les routes (`/`, `/courses`, `/courses/architecture-ia`,
  une leçon, `/courses/architecture-ia/examen`, `/resources`, `/resources/soul-document`),
  flow Soul Document complet (remplir, naviguer, générer, copier, télécharger, recommencer),
  console **sans erreur**, cours/démos/examen toujours lisibles sur fond clair.
- **Aucune action infra / Hermès. Aucun secret.** Fonctionnalité 100 % frontend.

Prochaine action recommandée (1 seule) : faire reviewer puis merger la PR
`feat/soul-document-resource` (Soul Document + redesign premium).

---

## 2026-06-27 — Claude Code (démos interactives Tome 3 — parcours complet)

- Reconstruction des **4 démos du Tome 3** en React : `ToolUse` (réflexion → appel
  d'outil → observation → réponse), `AgentLoop` (trace ReAct pas à pas + compteur de
  tours), `McpServers` (connexion de serveurs → outils exposés), `PromptInjection`
  (repérer le piège, choix sûr/dangereux). Le piège d'injection est reproduit
  **verbatim** comme donnée pédagogique (rendu comme donnée, jamais exécuté).
- Extraction : découpage en blocs pour les **3 tomes** (sauf modules `fin`).
  Invariant : **15 blocs démo**. Les 15 démos des 3 tomes sont désormais en React.
- Vérifs : `npm run extract:content` (idempotent), `npm run build`, 0 vuln, smoke
  test navigateur des 4 démos (changement de question, trace pas à pas, connexion
  serveurs, choix injection), console sans erreur.
- **Aucune action infra / Hermès. Aucun secret.**

Prochaine action recommandée (1 seule) : faire reviewer puis merger la PR #6
(contenu réel + 15 démos interactives des 3 tomes).

---

## 2026-06-27 — Claude Code (démos interactives Tome 2)

- Reconstruction des **4 démos interactives du Tome 2** en composants React
  (même modèle que le Tome 1) : `ContextWindow` (fenêtre de contexte + débordement),
  `RagPipeline` (récupération scorée + animation), `FineTuneCompare` (base/spécialisé),
  `RlhfFeedback` (choix A/B cyclique). Logique fidèle aux littéraux source.
- Extraction étendue : découpage en blocs pour Tomes 1 **et** 2 (sauf modules `fin`
  dont le `.demo` est un bilan non interactif). Invariant : 11 blocs démo.
- Vérifs : `npm run extract:content` (idempotent, 20 modules, 11 blocs démo),
  `npm run build`, 0 vuln, smoke test navigateur des 4 démos (débordement budget,
  re-scoring RAG, bascule fine-tuning, cycle RLHF), console sans erreur.
- **Aucune action infra / Hermès. Aucun secret.**

Prochaine action recommandée (1 seule) : reconstruire les démos du **Tome 3**
(tool use, boucle ReAct, MCP, prompt injection) sur le même modèle.

---

## 2026-06-25 — Claude Code (démos interactives Tome 1)

- Reconstruction des **7 démos interactives du Tome 1** en composants React
  (`src/demos/`), à partir des littéraux source, en DA DKM. Brainstorm + spec :
  `docs/superpowers/specs/2026-06-25-demos-interactives-tome1-design.md`.
- Architecture : l'extraction découpe le corps des leçons Tome 1 en **blocs**
  (`html` | `demo`) ; rendu via registre `src/demos/registry.tsx`. Tomes 2/3
  inchangés (un seul bloc html, démos statiques).
- Démos : NestedCircles, Perceptron, NetworkSignal, GradientDescent, Attention,
  Tokenizer, NextWord. Logique fidèle aux originaux (math, matrices, états).
- Vérifs : `npm run extract:content` (idempotent, 20 modules, 7 blocs démo),
  `npm run build`, 0 vuln, smoke test navigateur des 7 démos (interaction réelle)
  + non-régression Tomes 2/3, console sans erreur. Bug corrigé au passage : les
  labels SVG des cercles interceptaient le clic (`pointer-events:none`).
- **Aucune action infra / Hermès. Aucun secret.**

Prochaine action recommandée (1 seule) : reconstruire les démos du **Tome 2**
(fenêtre de contexte, RAG, fine-tuning, RLHF) sur le même modèle.

---

## 2026-06-25 — Claude Code (extraction du contenu réel des cours)

- Dennis a fourni les 4 HTML source (zip déposé dans le repo) ; extraits dans
  `content/source/` (conservés comme provenance, GitHub = vérité technique).
- Audit : le contenu vit dans des littéraux JS (`MODULES`, `GLOSSARY`, `EXAM`),
  déjà structurés (prose, démos, quiz + bonnes réponses/corrections, glossaire).
- Nouveau script `scripts/extract-content.mjs` (`npm run extract:content`) →
  `src/content/architecture-ia.json` : **20 modules** (8/6/6), **41 termes** de
  glossaire (16/16/14), **18 questions** d'examen. Aucun contenu inventé.
- Frontend câblé sur le JSON : `src/course-data.ts` réécrit ; `App.tsx` rend le
  corps réel + quiz interactifs + glossaire défini + nouveau flux d'examen
  (`/courses/architecture-ia/examen`) ; styles ajoutés dans la DA DKM.
- Vérifs : `npm run build` OK, 0 vulnérabilité, smoke test navigateur (leçon, démo
  statique, quiz, examen, glossaire) — aucune erreur console.
- Docs : `docs/content-extraction-v1.md` (schéma + régénération + 14 démos à
  reconstruire) ; décision `DECISIONS.md` D-014.
- **Aucune action infra / Hermès. Aucun secret.**

Prochaine action recommandée (1 seule) : reconstruire les **démos interactives** en
composants React (liste dans `docs/content-extraction-v1.md`), en commençant par
Tome 1 (cercles emboîtés, neurone, descente de gradient).

---

## 2026-06-25 — Hermès

- Dennis a demandé de continuer le DKM Learning Hub et de passer à la décision / mise en place du frontend MVP dans `dkm-learning-hub`.
- Relecture effectuée : `HANDOFF.md`, `docs/product-website-plan-v1.md`, `docs/content-inventory-v1.md`.
- `dennismarfo/dkm-brand` a été utilisé seulement comme source DA : Sand / Ink / Terracotta, DM Serif Display, Inter, JetBrains Mono, ton expert accessible.
- Décision prise : garder le frontend MVP dans `dkm-learning-hub`, sans créer de repo séparé à ce stade.
- Implémentation branchée sur `feat/frontend-mvp` : app Vite + React + TypeScript statique avec landing, bibliothèque cours, fiche `Architecture IA`, skeleton module/lesson, page ressources.
- Nouveau document durable : `docs/frontend-mvp-decision-v1.md`.
- PR ouverte : #5 `feat: add DKM Learning Hub frontend MVP`.
- Vérifications locales : `npm install`, `npm run build`, `npm audit --audit-level=moderate` → 0 vulnérabilité ; smoke test navigateur local sur `http://127.0.0.1:4177`.
- Aucun changement Supabase, n8n, credentials ou secrets.

Prochaine action recommandée (1 seule) : reviewer puis merger la PR #5, ensuite extraire le contenu complet des HTML source en JSON/MDX pour remplacer les placeholders de leçon.

---

## 2026-06-25 — Hermès

- Dennis a confirmé que la conversation doit continuer sur le DKM Learning Hub / KnowledgeHub.
- Clarification importante : `dkm-brand` sert de source de vérité DA / identité, tandis que `dkm-learning-hub` reste le repo produit / backend / coordination du Learning Hub.
- Création d’un document de reprise durable pour la partie produit/site : `docs/product-website-plan-v1.md`.
- Création d’un inventaire durable du contenu source : `docs/content-inventory-v1.md`.
- `docs/content-inventory-v1.md` résume les 3 tomes, 20 modules détectés, les blocs interactifs, les glossaires et les 18 questions de l’examen final.
- PR #3 mergée : `docs: add DKM Learning Hub product website handoff`.
- PR #4 mergée : `docs: add DKM KnowledgeHub content inventory`.

Prochaine action recommandée (1 seule) : décider si le frontend du Learning Hub vit dans `dkm-learning-hub` ou dans un repo dédié, puis générer le premier squelette frontend.

---

## 2026-05-26 — Hermès

- Repo privé `dennismarfo/dkm-learning-hub` détecté.
- Accès GitHub en lecture vérifié.
- Accès GitHub Contents en écriture vérifié par création de ce fichier.
- Attention : la permission Issues semble absente du token actuel, donc la création d’issue de coordination échoue pour l’instant.

Prochaine action recommandée : laisser Claude Code bootstrapper la structure complète du repo, puis Hermès relira et exécutera côté infra.

## 2026-05-29 — Claude Code

- Structure complète du repo bootstrappée (README, CLAUDE.md, DECISIONS.md,
  docs, prompt, migration, .env.example, .gitignore, READMEs workflows/scripts).
- Aucune connexion à Supabase / n8n / Notion. Aucun secret committé.
- Voir la section « Handoff pour Hermès » ci-dessous pour les actions infra.

---

# Handoff pour Hermès

> Claude Code n'a pas exécuté d'action infra. Tout ce qui suit est à réaliser
> par Hermès via MCP, **après review**. L'état réel n'est PAS supposé connu.

## ⏭️ Prochaine action infra (1 seule)

**Relire puis appliquer `supabase/migrations/001_create_learning_hub_schema.sql`
sur le projet Supabase cible, via Supabase MCP** (`list_tables` avant,
`get_advisors` après). Le reste (workflow n8n, Notion) vient ensuite.

Note 2026-06-25 : pour la partie site/mini-LMS, voir maintenant `docs/product-website-plan-v1.md` et `docs/content-inventory-v1.md`.

## 0. Cibles à confirmer (non renseignées par Claude Code)

- **Projet Supabase** : project ref / id à confirmer par Dennis ou Hermès
  (Claude Code ne connaît pas l'état réel et n'a rien supposé).
- **Canal Telegram « Knowledge Scout »** : chat/topic id à confirmer.
- **Chat de notification de Dennis** : id à confirmer.

## 1. Fichiers à vérifier (review avant exécution)

- `supabase/migrations/001_create_learning_hub_schema.sql` — schéma + table + index + trigger.
- `docs/json-contract-v1.md` — contrat JSON strict.
- `prompts/haiku-structure-v1.md` — prompt de structuration (Claude Haiku).
- `docs/n8n-workflow-spec-v1.md` — spec du workflow MVP.
- `docs/notion-mirror-spec-v1.md` — spec du miroir Notion (optionnel V1).
- `.env.example` — noms de variables/credentials à configurer dans n8n.

## 2. Migration à appliquer (Supabase MCP)

- Appliquer `supabase/migrations/001_create_learning_hub_schema.sql`.
- **Avant** : `list_tables` pour vérifier l'état réel (le schéma/table existent-ils déjà ?).
- La migration est idempotente : réexécutable sans erreur.
- **Après** : lancer `get_advisors` (sécurité/perf) — notamment vérifier la
  politique RLS sur `learning_hub.learnings` (RLS non incluse en V1, à décider).
- Confirmer la création : schéma `learning_hub`, table `learnings`, 5 index,
  trigger `set_updated_at`, contraintes (status / priority / content_potential).

## 3. Workflow n8n à créer

- Construire le workflow décrit dans `docs/n8n-workflow-spec-v1.md` :
  capture → déduplication (`telegram_message_id`) → Claude Haiku
  (`haiku-structure-v1`) → validation JSON → insert Supabase → notif Telegram.
- Configurer les credentials dans n8n (Supabase service role, Anthropic, Telegram).
- Exporter le workflow (nettoyé des secrets) dans `workflows/capture-structure-store.json`.

## 4. Tests à exécuter

- [ ] Migration appliquée sans erreur ; réexécution idempotente OK.
- [ ] Insertion d'un learning de test, puis UPDATE → `updated_at` change bien.
- [ ] Contraintes rejettent les valeurs invalides (`status`/`priority`/`content_potential`).
- [ ] Doublon `telegram_message_id` rejeté (UNIQUE).
- [ ] Workflow n8n : 2–3 messages réels passent capture → structure → stockage.
- [ ] Notification Telegram reçue par Dennis.

## 5. Questions ouvertes

- **RLS** : faut-il activer Row Level Security sur `learning_hub.learnings` en V1 ?
  (Accès via service role uniquement pour l'instant.)
- **Notion** : activer le miroir en V1 ou reporter en V2 ?
- **Trigger n8n** : démarrer en manuel ou direct sur Telegram Trigger ?
- **Valeurs `project`** : la liste fermée (DKM / OptiAI / Next Move / Maestro /
  perso) est-elle figée ? (Impacte contrat + Select Notion.)

## 6. Risques

- Si la migration est appliquée alors qu'une version antérieure du schéma existe
  déjà, vérifier qu'aucune colonne/contrainte ne diverge (la migration ne fait
  pas d'`ALTER` correctif en V1).
- Secrets : ne jamais committer un export n8n contenant des credentials.
- Sans RLS, toute clé ayant accès au schéma peut lire/écrire — restreindre au
  service role côté n8n.
