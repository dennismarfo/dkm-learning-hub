# Spec workflow n8n v1 — Capture → Structure → Stockage

Spécification du **workflow MVP** à construire dans n8n.
**Claude Code n'a pas accès à n8n** : ce document est une spec destinée à
**Hermès**, qui créera le workflow réel via MCP n8n après review.

- Périmètre V1 : capturer un learning, le structurer via IA, le stocker dans
  Supabase, notifier Dennis. **Pas de publication automatique.**
- Prompt utilisé : `haiku-structure-v1` (cf. `/prompts/haiku-structure-v1.md`)
- Contrat de sortie : `docs/json-contract-v1.md`
- Table cible : `learning_hub.learnings`

---

## 1. Vue d'ensemble du flux

```
[Trigger] → [Récup message brut] → [Déduplication] → [Claude Haiku]
   → [Validation JSON] → [Insert/Update Supabase] → [Notification Telegram]
   → (option future) [Page Notion miroir]
```

---

## 2. Étapes détaillées

### 2.1 Trigger
- **V1** : Trigger manuel (bouton n8n) **ou** Telegram Trigger sur le canal
  Knowledge Scout.
- Choix recommandé pour démarrer : **manuel**, pour contrôler chaque exécution
  pendant la mise au point, puis bascule vers Telegram Trigger.

### 2.2 Récupération du message brut
- Extraire :
  - `raw_content` (texte du message) — **obligatoire** ;
  - `telegram_chat_id`, `telegram_topic_id`, `telegram_message_id`,
    `telegram_message_url` si disponibles.
- `source` = `'knowledge_scout'`, `created_by` = `'knowledge_scout'`.

### 2.3 Déduplication via `telegram_message_id`
- Avant tout traitement, vérifier si un learning existe déjà avec ce
  `telegram_message_id` (lookup Supabase).
- Si trouvé → **arrêter** (ou court-circuiter vers une branche "déjà traité").
- La contrainte `UNIQUE` sur `telegram_message_id` côté DB garantit l'idempotence
  même en cas de double déclenchement.

### 2.4 Appel Claude Haiku
- Modèle : Claude Haiku.
- Injecter le prompt `haiku-structure-v1`, en remplaçant `{{RAW_CONTENT}}` par
  `raw_content`.
- Demander une **sortie JSON stricte** (cf. contrat).

### 2.5 Validation JSON
- Parser la réponse.
- Vérifier la conformité au contrat :
  - JSON parsable ;
  - clés présentes ;
  - `content_potential` entier 1–5 ;
  - `priority` ∈ {low, medium, high} ;
  - `project` ∈ {DKM, OptiAI, Next Move, Maestro, perso}.
- **Si invalide** → insérer/mettre à jour le learning avec
  `status = 'error'` + `error_message`, puis notifier Dennis. Ne pas bloquer
  silencieusement.

### 2.6 Insertion Supabase
- Table : `learning_hub.learnings`.
- Mapper le JSON validé (cf. tableau de mapping du contrat) +
  `raw_content` + métadonnées Telegram.
- `status = 'structured'`, `processed_at = now()`,
  `structured_with_prompt_version = 'haiku-structure-v1'`.
- `updated_at` est géré automatiquement par le trigger DB.

### 2.7 Notification Telegram à Dennis
- Envoyer un message récapitulatif : `title`, `project`, `priority`,
  `content_potential`, lien/ID Supabase.
- But : validation/triage rapide depuis mobile.

### 2.8 (Option future) Page Notion miroir
- **Hors périmètre V1** mais prévu : créer une page Notion miroir
  (cf. `docs/notion-mirror-spec-v1.md`) et stocker `notion_page_id`.
- Notion = miroir de triage, **jamais** source de vérité.

---

## 3. Gestion des erreurs

| Cas | Comportement attendu |
|---|---|
| `raw_content` vide | Ne pas insérer ; notifier "message vide ignoré". |
| Doublon `telegram_message_id` | Court-circuiter, pas d'insertion. |
| Réponse IA non-JSON / non conforme | `status='error'` + `error_message`, notifier. |
| Échec insertion Supabase | Retenter une fois, sinon notifier Dennis avec le détail. |

---

## 4. Variables / credentials (références, jamais de secrets ici)

À configurer **dans n8n** (et jamais commités dans GitHub) :
- Credential Supabase (URL projet + clé service) ;
- Credential Anthropic (clé API Claude) ;
- Credential Telegram Bot.

Voir `.env.example` pour la liste des noms de variables attendues.

---

## 5. Livrable attendu d'Hermès

- Workflow n8n créé et testé sur 2–3 messages réels.
- Export JSON du workflow committé dans `/workflows/` (cf. `workflows/README.md`).
- Confirmation dans `HANDOFF.md` que le flux capture → structure → stockage
  fonctionne de bout en bout.
