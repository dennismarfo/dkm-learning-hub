# HANDOFF — dkm-learning-hub

Journal de coordination entre Dennis, Claude Code et Hermès.

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
