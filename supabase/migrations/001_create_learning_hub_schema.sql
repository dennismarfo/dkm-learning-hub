-- =====================================================================
-- Migration: 001_create_learning_hub_schema
-- Projet    : dkm-learning-hub (Knowledge Hub MVP — DKM / OptiAI)
-- But       : Créer le schéma et la table source de vérité des learnings
-- Auteur    : Claude Code (architecture)
-- Appliquée par : Hermès via Supabase MCP, APRÈS review
-- Idempotente : oui (réexécutable sans erreur)
--
-- IMPORTANT
--  - Cette migration ne contient AUCUN secret.
--  - Elle n'est PAS supposée déjà appliquée. Vérifier l'état réel avant.
--  - gen_random_uuid() requiert l'extension pgcrypto (incluse par défaut
--    sur Supabase). On la garantit ci-dessous de façon idempotente.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Schéma
-- ---------------------------------------------------------------------
create schema if not exists learning_hub;

-- ---------------------------------------------------------------------
-- Table principale : learning_hub.learnings
-- ---------------------------------------------------------------------
create table if not exists learning_hub.learnings (
  -- Identité / horodatage
  id                          uuid primary key default gen_random_uuid(),
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  -- Provenance
  source                      text not null default 'knowledge_scout',
  raw_content                 text not null,

  -- Métadonnées Telegram (capture)
  telegram_chat_id            text,
  telegram_topic_id           text,
  telegram_message_id         text unique,
  telegram_message_url        text,

  -- Champs structurés par le prompt IA (haiku-structure-v1)
  title                       text,
  summary                     text,
  key_points                  jsonb,
  project                     text,
  themes                      text[],

  -- Pilotage / triage
  status                      text not null default 'inbox',
  priority                    text not null default 'medium',
  content_potential           int,

  -- Exploitation business / contenu
  business_application        text,
  content_angles              jsonb,
  recommended_action          text,
  output_drafts               jsonb,
  output_types                text[],
  published_assets            jsonb,

  -- Traçabilité du traitement
  structured_with_prompt_version text default 'haiku-structure-v1',
  notion_page_id              text,
  processed_at                timestamptz,
  transformed_at              timestamptz,
  archived_at                 timestamptz,
  last_reviewed_at            timestamptz,
  error_message               text,
  created_by                  text default 'knowledge_scout',

  -- Contraintes simples (créées avec la table => idempotentes)
  constraint learnings_content_potential_range
    check (content_potential is null or (content_potential between 1 and 5)),
  constraint learnings_priority_allowed
    check (priority in ('low', 'medium', 'high')),
  constraint learnings_status_allowed
    check (status in ('inbox', 'structured', 'content_ready', 'published', 'archived', 'error'))
);

-- ---------------------------------------------------------------------
-- Indexes utiles (idempotents)
-- ---------------------------------------------------------------------
create index if not exists learnings_status_idx
  on learning_hub.learnings (status);

create index if not exists learnings_project_idx
  on learning_hub.learnings (project);

create index if not exists learnings_created_at_desc_idx
  on learning_hub.learnings (created_at desc);

-- telegram_message_id : la contrainte UNIQUE crée DÉJÀ un index B-tree utilisé
-- pour les lookups de déduplication. On n'ajoute donc pas d'index explicite
-- (ce serait un index dupliqué, signalé par get_advisors).

-- Recherche par thème (tableau) — GIN pour les opérateurs de tableau.
create index if not exists learnings_themes_gin_idx
  on learning_hub.learnings using gin (themes);

-- ---------------------------------------------------------------------
-- Fonction + trigger : maintenir updated_at à jour
-- ---------------------------------------------------------------------
create or replace function learning_hub.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on learning_hub.learnings;
create trigger set_updated_at
  before update on learning_hub.learnings
  for each row
  execute function learning_hub.set_updated_at();

-- ---------------------------------------------------------------------
-- Commentaires (documentation inline, idempotents)
-- ---------------------------------------------------------------------
comment on schema learning_hub is
  'Knowledge Hub MVP — source de vérité des apprentissages (DKM / OptiAI).';
comment on table learning_hub.learnings is
  'Apprentissages capturés (Knowledge Scout / Telegram), structurés par IA puis exploités.';
comment on column learning_hub.learnings.raw_content is
  'Message brut capturé. Jamais écrasé par le traitement IA.';
comment on column learning_hub.learnings.status is
  'Cycle de vie : inbox -> structured -> content_ready -> published -> archived (ou error).';
comment on column learning_hub.learnings.structured_with_prompt_version is
  'Version du prompt IA ayant produit les champs structurés (traçabilité).';
