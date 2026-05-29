# Live infra status — Knowledge Hub MVP

Date: 2026-05-29
Operator: Hermès via MCP Supabase, n8n and GitHub

## Summary

The MVP capture pipeline is deployed and active in n8n.

Current production flow:

```text
Webhook / Manual Trigger
→ Normalize Capture Input
→ Claude Haiku structuring
→ JSON parsing and validation
→ direct Postgres insert into Supabase
→ Telegram notification in DKM / OptiAI Agent Room topic 2
```

## GitHub

Repository: `dennismarfo/dkm-learning-hub`

Initial bootstrap PR was merged into `main`.

Relevant merged commits known at deployment time:

- Merge commit: `dd59e2b`
- Bootstrap content commit: `52a1002ab16f47ac5dd580e647b45a907e31c94d`
- Initial commit: `7e9176c`

## Supabase

Target project ref: `khwogmehrpeiwaemiccx`

Target project URL:

```text
https://khwogmehrpeiwaemiccx.supabase.co
```

Schema/table deployed:

```text
learning_hub.learnings
```

Migration applied:

```text
supabase/migrations/001_create_learning_hub_schema.sql
```

Migration result: successful.

Verified runtime behavior:

- schema `learning_hub` exists
- table `learning_hub.learnings` exists
- insert test passed
- update test passed
- `updated_at` trigger passed
- delete cleanup passed
- n8n insert through Postgres passed
- all known Hermès test rows were deleted after validation

Latest cleanup verification:

```json
{ "remaining_test_rows": 0 }
```

## n8n

Instance:

```text
https://n8n.srv775529.hstgr.cloud
```

Workflow:

```text
Name: DKM Knowledge Hub - Capture MVP
ID: mNuGTfF2XFi4Mk8n
Status: active
Archived: false
```

Runtime validation after Telegram restoration:

```json
{
  "valid": true,
  "workflowId": "mNuGTfF2XFi4Mk8n",
  "workflowName": "DKM Knowledge Hub - Capture MVP",
  "summary": {
    "totalNodes": 10,
    "enabledNodes": 10,
    "triggerNodes": 2,
    "validConnections": 9,
    "invalidConnections": 0,
    "expressionsValidated": 20,
    "errorCount": 0,
    "warningCount": 7
  }
}
```

Current node list:

1. `Manual Trigger`
2. `Webhook Capture`
3. `Normalize Capture Input`
4. `Structure Learning - Claude Haiku`
5. `Parse & Validate JSON`
6. `Learning valide ?`
7. `Prepare Supabase Insert Payload`
8. `Insert Postgres - Knowledge Hub`
9. `Notify Telegram - structured`
10. `Notify Telegram - validation issue`

Key runtime decisions:

- Anthropic model used in n8n HTTP request: `claude-haiku-4-5`
- Persistence path uses a true Postgres credential, not the n8n Supabase API node.
- Direct Postgres is used because the Supabase API path failed on the custom schema with: `Invalid schema: learning_hub`.
- Telegram notification uses a dedicated bot credential for this project.

## Credentials referenced in n8n

No secret values are stored in this repository.

Credential names used by the live workflow:

```text
Anthropic API Header
Postgres - Knowledge Hub - Supabase OptiAI OS
DKM Knowledge Hub Bot
```

Important credential note:

A credential named `Supabase Postgres - Knowledge Hub` existed during setup, but its actual n8n type was `supabaseApi`, not `postgres`. It must not be used for the direct Postgres node.

## Operational info — not secrets, but internal

Les éléments suivants ne sont PAS des secrets (aucune action possible sans les
credentials sous-jacents), mais restent des infos opérationnelles internes à ne
pas diffuser hors équipe :

- chat_id Telegram et username du bot
- noms des credentials n8n
- project ref Supabase
- hostname de l'instance n8n + chemin du webhook

⚠️ L'instance n8n et le webhook path forment ensemble l'URL de capture. Si le
webhook n'est pas protégé (header / token d'auth), restreindre l'accès avant la
mise en usage réelle.

## Telegram

Target chat:

```text
DKM / OptiAI Agent Room
chat_id: -1003730559236
topic/thread_id: 2
```

Dedicated bot:

```text
Name: DKM Knowledge Hub Bot
Username: optiai_dkm_knowledge_hub_bot
```

End-to-end Telegram test result:

```json
{
  "ok": true,
  "message_id": 345,
  "bot_username": "optiai_dkm_knowledge_hub_bot",
  "chat_id": -1003730559236,
  "message_thread_id": 2
}
```

## Final end-to-end test

Test payload id:

```text
hermes-full-telegram-test-2026-05-29-001
```

Flow validated:

```text
Webhook → Claude Haiku → Supabase Postgres → Telegram topic 2
```

Inserted row:

```json
{
  "id": "2a8b737b-7c88-4277-a3ce-404415194e37",
  "telegram_message_id": "hermes-full-telegram-test-2026-05-29-001",
  "title": "Test final Knowledge Hub - Validation chaîne complète Telegram-Claude-Supabase",
  "project": "OptiAI",
  "status": "structured",
  "priority": "high",
  "content_potential": 2,
  "created_at": "2026-05-29 18:55:36.542179+00",
  "updated_at": "2026-05-29 18:55:36.542179+00"
}
```

Cleanup:

The test row above was deleted after validation.

## Known non-blocking warnings

n8n validation still reports warnings, but no blocking errors:

- webhook response behavior could be improved for error cases
- code nodes can throw errors and should receive stronger error-handling wrappers later
- one expression warning exists in the Telegram success text
- `Learning valide ?` has a non-blocking warning around error output handling

These warnings do not block the current MVP, but should be cleaned before scaling usage.

## Security follow-ups

Open Supabase follow-ups:

1. RLS is not enabled on `learning_hub.learnings`.
2. Supabase advisor reported `function_search_path_mutable` for `learning_hub.set_updated_at`.
3. `supabase-mcp-2` is currently read/write; it can be switched to read-only once write operations are complete.

Do not enable RLS blindly without deciding policies and runtime access path.

## Next recommended actions

1. Monitor the first real captures from Telegram.
2. Patch the remaining n8n validation warnings.
3. Add a clean webhook response node/pattern.
4. Decide RLS and function `search_path` remediation.
5. Add optional Notion mirror only after the Supabase source of truth is stable.
