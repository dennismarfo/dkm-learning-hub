# workflows/

Exports JSON des workflows n8n, versionnés ici (GitHub = source de vérité technique).

## Convention

- Un fichier par workflow : `nom-du-workflow.json` (export n8n).
- Versionner les changements significatifs (commit explicite).
- Ne **jamais** committer de credentials/secrets : les exports n8n doivent être
  nettoyés de toute clé API avant commit (n8n stocke les credentials séparément).

## Workflows attendus (V1)

| Fichier | Description | Spec |
|---|---|---|
| `capture-structure-store.json` | Capture Knowledge Scout → Haiku → Supabase → notif Telegram | `docs/n8n-workflow-spec-v1.md` |

> Le workflow réel est créé/exporté par **Hermès** via MCP n8n, après review de
> la spec. Claude Code n'a pas d'accès direct à n8n.
