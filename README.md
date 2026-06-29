# dkm-learning-hub

Knowledge Hub MVP pour **DKM / OptiAI**. Ce repo est la **source de vérité
technique** du projet (migrations, prompts, contrats, workflows exportés, docs)
et héberge le **frontend du Learning Hub** (mini-LMS Vite + React).

---

## Mission

Capturer les apprentissages issus de **Knowledge Scout / Telegram**, les
**structurer** avec un prompt IA, les **stocker dans Supabase**, puis permettre
de les **transformer** en contenus, décisions business, offres ou actions.

## Architecture (résumé)

| Composant | Rôle |
|---|---|
| **Supabase** | Source de vérité des données (`learning_hub.learnings`) |
| **GitHub** (ce repo) | Source de vérité technique (SQL, prompts, contrats, workflows, docs) |
| **n8n** | Capture, orchestration, transformation |
| **Telegram** | Capture / validation / notification |
| **Notion** | Miroir léger de triage mobile (pas source de vérité) |
| **Frontend** (Vite + React) | Learning Hub : site d'apprentissage (cours, démos, ressources comme le Soul Document) |

Détails : [`docs/architecture.md`](docs/architecture.md).

## Flux MVP

```
Knowledge Scout (Telegram) → n8n → Claude Haiku (haiku-structure-v1)
   → JSON strict → validation → Supabase → notification Telegram à Dennis
   → (option future) page Notion miroir
```

Le flux automatisé s'arrête à `status = 'structured'` + notification. La suite
(`content_ready`, `published`) est **manuelle** en V1.

## Frontend (Learning Hub)

Le repo héberge aussi le **Learning Hub** : un mini-LMS (Vite + React + TS, **sans
backend**) qui sert le cours **Architecture IA** (3 tomes, 20 modules, 15 démos
interactives, examen) et des ressources comme le **Soul Document** (générateur de
mémoire business pour une IA, export markdown, 100 % côté navigateur).

```bash
npm install
npm run dev               # serveur de dev (Vite)
npm run build             # build de production (tsc + vite)
npm run extract:content   # régénère src/content/*.json depuis les sources
```

Conventions frontend : voir [`CLAUDE.md`](CLAUDE.md). Décisions produit/design :
[`DECISIONS.md`](DECISIONS.md) (D-014 contenu, D-015 design, D-016 Soul Document).

## Rôles

- **Claude Code** — architecte du repo : specs, prompts, contrats JSON,
  migrations SQL, scripts, docs, review. Ne touche pas à l'infra réelle.
- **Hermès** — opérateur infra réelle via MCP (Supabase / n8n / Notion / GitHub) :
  applique les migrations, crée les workflows, teste. Voir [`HANDOFF.md`](HANDOFF.md).
- **Dennis** — décideur : validation, triage, choix d'exploitation.

## Structure du repo

```
.
├── README.md                  # ce fichier
├── HANDOFF.md                 # coordination + demandes pour Hermès
├── DECISIONS.md               # décisions d'architecture
├── CLAUDE.md                  # contexte permanent pour Claude Code
├── .env.example               # noms de variables (jamais de secrets)
├── .gitignore
├── docs/
│   ├── architecture.md
│   ├── json-contract-v1.md    # contrat JSON strict de sortie
│   ├── n8n-workflow-spec-v1.md
│   └── notion-mirror-spec-v1.md
├── prompts/
│   └── haiku-structure-v1.md  # prompt de structuration (Claude Haiku)
├── supabase/
│   └── migrations/
│       └── 001_create_learning_hub_schema.sql
├── workflows/                 # exports JSON des workflows n8n
│   └── README.md
├── scripts/
│   └── extract-content.mjs    # extraction du contenu de cours → JSON
├── src/                        # frontend Learning Hub (Vite + React + TS)
│   ├── App.tsx                 # router maison (pathname) + pages
│   ├── nav.ts                  # helper de navigation
│   ├── components/             # primitives UI (Brand, Button, Nav, ...)
│   ├── demos/                  # démos interactives (15)
│   ├── resources/              # Soul Document generator
│   ├── content/                # cours en JSON (généré — ne pas éditer)
│   └── styles.css              # DA pilotée par tokens
├── index.html
├── vite.config.ts
└── package.json
```

## Limites de la V1

- Pas de publication automatique de contenu.
- Pas de synchro bidirectionnelle Notion ↔ Supabase.
- Un seul prompt de structuration (`haiku-structure-v1`).
- Transformation en contenus/offres = manuelle.

## Conventions

- **Aucun secret** dans le repo (cf. `.env.example` et `.gitignore`).
- **Migrations idempotentes** (réexécutables sans erreur).
- **Prompts → JSON strict** conforme au contrat versionné.
- **Décisions** consignées dans `DECISIONS.md`.
- Toute **action infra réelle** est déléguée à Hermès via `HANDOFF.md`.

## État actuel

- ✅ Structure du repo bootstrappée par Claude Code.
- ✅ Frontend Learning Hub en ligne : cours Architecture IA (20 modules, 15 démos,
  examen), ressource Soul Document, DA premium « editorial cockpit ».
- ⏳ Migration `001` **rédigée, non appliquée** — en attente d'Hermès.
- ⏳ Workflow n8n **spécifié, non créé** — en attente d'Hermès.
