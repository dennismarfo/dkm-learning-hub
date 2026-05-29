# Architecture — dkm-learning-hub

Knowledge Hub MVP pour DKM / OptiAI : capturer les apprentissages
(Knowledge Scout / Telegram), les structurer avec un prompt IA, les stocker
dans Supabase, puis les transformer en contenus, décisions, offres ou actions.

---

## 1. Composants & rôles

| Composant | Rôle | Source de vérité ? |
|---|---|---|
| **Supabase** | Stockage des learnings, état, pilotage | ✅ Oui (données) |
| **GitHub** (ce repo) | Versioning migrations SQL, prompts, contrats JSON, workflows n8n exportés, docs, handoffs | ✅ Oui (technique) |
| **n8n** | Capture, orchestration, transformation | ❌ |
| **Telegram** | Capture / validation / notification | ❌ |
| **Notion** | Miroir léger pour triage mobile | ❌ (miroir seulement) |
| **Hermès** | Opérateur infra réelle via MCP (Supabase / n8n / Notion / GitHub) | — |
| **Claude Code** | Architecte repo : specs, prompts, contrats, scripts, docs, review | — |
| **Dennis** | Décideur, validation, triage | — |

---

## 2. Flux MVP (V1)

```
Knowledge Scout (Telegram)
        │  message brut
        ▼
      n8n  ── déduplication (telegram_message_id)
        │
        ▼
  Claude Haiku  (prompt haiku-structure-v1)
        │  JSON strict (json-contract-v1)
        ▼
   Validation JSON
        │
        ▼
   Supabase  learning_hub.learnings   ◄── SOURCE DE VÉRITÉ
        │
        ├──► Notification Telegram → Dennis (triage)
        └──► (option future) Page Notion miroir
```

Cycle de vie d'un learning (`status`) :

```
inbox → structured → content_ready → published → archived
                          └────────────► error (si échec traitement)
```

> En V1, le flux automatisé s'arrête à `structured` + notification.
> Le passage à `content_ready` / `published` est **manuel** (décision de Dennis).

---

## 3. Frontières de responsabilité

- **Supabase = vérité des données.** Toute lecture/écriture décisionnelle passe
  par Supabase.
- **GitHub = vérité technique.** Migrations, prompts, contrats et workflows
  exportés sont versionnés ici avant d'être appliqués.
- **n8n orchestre**, ne stocke pas l'état durable.
- **Notion reflète**, ne décide pas.
- **Telegram capture et notifie.**

---

## 4. Modèle de données (résumé)

Schéma `learning_hub`, table `learnings`. Voir la migration
`supabase/migrations/001_create_learning_hub_schema.sql` pour le détail.

Groupes de colonnes :
- **Identité / temps** : `id`, `created_at`, `updated_at`.
- **Provenance** : `source`, `raw_content`, métadonnées `telegram_*`.
- **Structuré par IA** : `title`, `summary`, `key_points`, `project`, `themes`.
- **Pilotage** : `status`, `priority`, `content_potential`.
- **Exploitation** : `business_application`, `content_angles`,
  `recommended_action`, `output_drafts`, `output_types`, `published_assets`.
- **Traçabilité** : `structured_with_prompt_version`, `notion_page_id`,
  `processed_at`, `transformed_at`, `archived_at`, `last_reviewed_at`,
  `error_message`, `created_by`.

---

## 5. Limites de la V1

- Pas de publication automatique de contenu.
- Pas de synchronisation bidirectionnelle Notion ↔ Supabase.
- Structuration par un seul prompt (`haiku-structure-v1`).
- Un seul flux : capture → structure → stockage → notification.
- Transformation en contenus/offres = **manuelle**, assistée plus tard.

---

## 6. Évolutions envisagées (post-V1)

- Étape de transformation assistée (drafts de contenu) → `output_drafts`.
- Publication semi-automatique → `published_assets`, `status = 'published'`.
- Versions de prompt successives (`haiku-structure-v2`, …).
- Tableau de bord de revue (`last_reviewed_at`).
