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
