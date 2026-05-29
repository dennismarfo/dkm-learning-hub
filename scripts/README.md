# scripts/

Scripts utilitaires du projet (helpers de dev, vérifications, exports).

## Principes

- Aucun secret dans les scripts ni dans le repo : lire les valeurs depuis
  l'environnement (voir `.env.example`).
- Les scripts ne se connectent pas en dur à Supabase/n8n/Notion ; toute action
  infra réelle reste déléguée à **Hermès** (cf. `HANDOFF.md`).
- Garder simple (MVP). Documenter chaque script en tête de fichier.

## Scripts prévus (à venir)

| Script | But |
|---|---|
| _(aucun pour l'instant)_ | — |

> Exemples d'usages futurs : valider un JSON contre `json-contract-v1`,
> vérifier l'idempotence d'une migration, lint des exports n8n.
