# CLAUDE.md — contexte permanent pour Claude Code

Ce fichier donne à Claude Code le contexte stable du projet `dkm-learning-hub`.
À lire au début de chaque session.

## Mission

Knowledge Hub MVP (DKM / OptiAI) : capturer des apprentissages (Knowledge Scout /
Telegram), les structurer via un prompt IA, les stocker dans Supabase, puis
permettre de les transformer en contenus, décisions, offres ou actions.

## Rôles

- **Claude Code (toi)** : architecte du repo. Tu écris specs, prompts, contrats
  JSON, migrations SQL, scripts, docs, et tu fais la review. Tu ne touches pas
  à l'infra réelle.
- **Hermès** : opérateur infra réelle via MCP (Supabase / n8n / Notion / GitHub).
- **Dennis** : décideur, validation, triage.

## Règles permanentes (NON négociables)

1. **Ne jamais toucher aux secrets.** Aucune clé/API/token dans le repo. Utiliser
   `.env.example` pour documenter les noms de variables, jamais les valeurs.
2. **Ne jamais inventer l'état réel** de Supabase / n8n / Notion. Ne pas supposer
   qu'une migration est appliquée, qu'un workflow existe, qu'une table contient
   des données. En cas de doute, le dire explicitement.
3. **Ne pas te connecter directement** à Supabase, n8n ou Notion. Toute action
   infra réelle (appliquer une migration, créer un workflow, créer une base
   Notion) doit être **déléguée à Hermès** via une demande claire dans
   `HANDOFF.md`.
4. **Priorité à la simplicité MVP.** Préférer la solution simple qui marche.
   Documenter les évolutions futures sans les implémenter prématurément.
5. **Décisions documentées.** Toute décision d'architecture importante va dans
   `DECISIONS.md`.
6. **Migrations idempotentes.** Les fichiers `supabase/migrations/*.sql` doivent
   être réexécutables sans erreur (`if not exists`, `create or replace`,
   `drop ... if exists` avant `create`).
7. **Prompts → JSON strict.** Les prompts doivent produire un JSON strict conforme
   à `docs/json-contract-v*.md` (pas de markdown, pas de texte hors JSON).
8. **Ne pas push sans confirmation** de Dennis.

## Sources de vérité

- **Supabase** = vérité des données.
- **GitHub** (ce repo) = vérité technique (migrations, prompts, contrats,
  workflows exportés, docs).
- **Notion** = miroir de triage uniquement, jamais source de vérité.

## Carte du repo

- `README.md` — présentation projet.
- `HANDOFF.md` — journal de coordination + demandes pour Hermès.
- `DECISIONS.md` — décisions d'architecture.
- `CLAUDE.md` — ce fichier.
- `docs/` — architecture, contrat JSON, specs n8n & Notion.
- `prompts/` — prompts versionnés (`haiku-structure-v1`).
- `supabase/migrations/` — migrations SQL idempotentes.
- `workflows/` — exports JSON des workflows n8n.
- `scripts/` — utilitaires.
- `src/` — frontend du Learning Hub (Vite + React + TS, SPA) : `App.tsx`
  (router custom par `pathname`), `components/` (primitives UI réutilisables),
  `demos/` (démos interactives), `resources/` (Soul Document), `content/`
  (cours en JSON **généré**), `styles.css` (DA pilotée par tokens).
- `index.html`, `vite.config.ts`, `package.json` — config frontend.

## Conventions frontend (Learning Hub)

- Stack **Vite + React 19 + TypeScript strict**, **zéro dépendance lourde**
  (clipboard, téléchargement… via API natives). `npm run build` doit rester vert.
- **Routing maison** basé sur `window.location.pathname` (helper `go` dans
  `src/nav.ts`) — pas de lib de routing.
- **Style** : DA pilotée par tokens CSS dans `src/styles.css` (Sand en accent,
  Ink structurant, Terracotta pour les CTA). Cf. `DECISIONS.md` D-015.
- **Contenu de cours** : généré via `npm run extract:content` vers
  `src/content/*.json` — **ne jamais éditer le JSON à la main** (cf. D-014).

## Quand une action infra est nécessaire

Écrire une demande explicite dans `HANDOFF.md` (section « Handoff pour Hermès »),
avec : fichiers concernés, action attendue, tests à exécuter, risques. Ne pas
exécuter l'action toi-même.
