# HANDOFF — dkm-learning-hub

Journal de coordination entre Dennis, Claude Code et Hermès.

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

## ⏭️ Prochaine action (1 seule)

**Relire puis appliquer `supabase/migrations/001_create_learning_hub_schema.sql`
sur le projet Supabase cible, via Supabase MCP** (`list_tables` avant,
`get_advisors` après). Le reste (workflow n8n, Notion) vient ensuite.

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

