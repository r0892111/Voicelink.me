-- Phase 4 migration: entity_memory cache table.
-- Per-Teamleader-user lookup index that VLAgent populates at signup
-- ("pre-warm") and during normal operation (after each successful list
-- lookup). Makes fuzzy entity resolution land on real CRM rows from
-- request 1, with no per-request prompt-token cost.
--
-- Replaces the SQLite-only ~/.vlagent/memory.db backend that ships with
-- the agent today; SQLite stays available as a dev fallback via
-- VLAGENT_MEMORY_BACKEND=sqlite. Staging+prod use this Postgres backend.
--
-- See POLICY_UPDATES.md for the privacy / DPA / retention copy that
-- needs to ship before this table receives live customer data.

CREATE TABLE IF NOT EXISTS entity_memory (
    teamleader_id  text        NOT NULL,
    search_term    text        NOT NULL,
    canonical_name text        NOT NULL,
    entity_id      text        NOT NULL,
    entity_type    text        NOT NULL,
    hit_count      integer     NOT NULL DEFAULT 1 CHECK (hit_count > 0),
    last_seen      timestamptz NOT NULL DEFAULT now(),
    created_at     timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (teamleader_id, search_term)
);

-- Fuzzy candidate lookup is "all rows for (teamleader_id, entity_type)
-- ordered by hit_count desc"; covered by this composite index.
CREATE INDEX IF NOT EXISTS idx_entity_memory_type_hits
    ON entity_memory (teamleader_id, entity_type, hit_count DESC);

-- Idempotent upsert + hit_count increment. Called via PostgREST RPC from
-- VLAgent's PostgresMemory.remember(). SECURITY DEFINER so callers don't
-- need direct INSERT privileges on entity_memory.
CREATE OR REPLACE FUNCTION public.remember_entity_memory(
    p_teamleader_id  text,
    p_search_term    text,
    p_canonical_name text,
    p_entity_id      text,
    p_entity_type    text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO entity_memory (
        teamleader_id, search_term, canonical_name, entity_id, entity_type,
        hit_count, last_seen
    )
    VALUES (
        p_teamleader_id, p_search_term, p_canonical_name, p_entity_id, p_entity_type,
        1, now()
    )
    ON CONFLICT (teamleader_id, search_term) DO UPDATE SET
        canonical_name = EXCLUDED.canonical_name,
        entity_id      = EXCLUDED.entity_id,
        entity_type    = EXCLUDED.entity_type,
        hit_count      = entity_memory.hit_count + 1,
        last_seen      = now();
END;
$$;

-- Service role only — VLAgent backend writes via SUPABASE_KEY (service_role).
-- Frontend never touches this table directly; users read their own rows
-- via PostgREST under the RLS policy below.
GRANT EXECUTE ON FUNCTION public.remember_entity_memory(text, text, text, text, text)
    TO service_role;

-- ── RLS ─────────────────────────────────────────────────────────────────────
-- Users see their own rows. Service role bypasses (writes happen here).
-- An invited member doesn't share their admin's entity memory: each user
-- has their own teamleader_id and their own indexed entities.

ALTER TABLE entity_memory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS entity_memory_read_own ON entity_memory;
CREATE POLICY entity_memory_read_own ON entity_memory
    FOR SELECT TO authenticated
    USING (
        teamleader_id IN (
            SELECT teamleader_id FROM teamleader_users
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
    );
