# Spec Notion miroir v1

Notion sert de **miroir léger** pour le triage mobile des learnings.
**Notion n'est PAS la source de vérité** — c'est Supabase qui l'est.

- Sens du flux : **Supabase → Notion** (push depuis n8n).
- Notion ne crée jamais de learning : il reflète l'état stocké dans Supabase.
- En cas de divergence, **Supabase fait foi**.
- Statut V1 : **optionnel / phase ultérieure** (cf. `docs/n8n-workflow-spec-v1.md` §2.8).

---

## 1. Rôle

- Permettre à Dennis de **trier rapidement** depuis mobile (Inbox, priorité,
  potentiel de contenu).
- Donner une vue lisible des learnings sans ouvrir Supabase.
- Toute modification structurelle/décisionnelle reste pilotée par Supabase + n8n.

---

## 2. Base Notion suggérée — propriétés

| Propriété Notion | Type Notion | Source Supabase |
|---|---|---|
| Title | Title | `title` |
| Project | Select | `project` |
| Status | Select | `status` |
| Priority | Select | `priority` |
| Content potential | Number | `content_potential` |
| Themes | Multi-select | `themes` |
| Summary | Text | `summary` |
| Business application | Text | `business_application` |
| Supabase ID | Text | `id` (uuid) |
| Telegram URL | URL | `telegram_message_url` |
| Created at | Date | `created_at` |

### Valeurs des Select (à aligner sur les contraintes DB)
- **Project** : `DKM`, `OptiAI`, `Next Move`, `Maestro`, `perso`.
- **Status** : `inbox`, `structured`, `content_ready`, `published`, `archived`, `error`.
- **Priority** : `low`, `medium`, `high`.

---

## 3. Règles de synchronisation

1. **Supabase → Notion** uniquement (push, V1).
2. La page Notion stocke `Supabase ID` pour permettre un éventuel retour.
3. Après création de la page, n8n écrit `notion_page_id` dans Supabase.
4. Le champ qui fait foi reste toujours Supabase ; Notion peut être recréé.
5. Pas de synchronisation bidirectionnelle en V1 (éviter les conflits).

---

## 4. Hors périmètre V1

- Édition depuis Notion qui remonterait vers Supabase.
- Automatisations Notion (boutons, formules complexes).
- Vues multiples avancées — une simple vue "Inbox triée par priorité" suffit.
