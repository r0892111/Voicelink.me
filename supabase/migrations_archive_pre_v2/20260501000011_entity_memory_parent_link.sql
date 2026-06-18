-- Add parent linkage to entity_memory so resolver can disambiguate
-- co-extracted name pairs ("Marc at Delta") without an extra TL API call.
--
-- Contacts → company.id; deals → company.id (or lead contact.id, whichever
-- the pre-warm code populates). Pure data enrichment: rows that don't have
-- a parent leave both columns NULL; resolver only uses them when present.

ALTER TABLE entity_memory
    ADD COLUMN IF NOT EXISTS parent_entity_id   text,
    ADD COLUMN IF NOT EXISTS parent_entity_type text;

CREATE INDEX IF NOT EXISTS idx_entity_memory_parent
    ON entity_memory (teamleader_id, entity_type, parent_entity_id)
    WHERE parent_entity_id IS NOT NULL;

-- Update the upsert RPC so pre-warm and the agent's incremental writes can
-- both populate the parent fields. Existing callers passing only the 5-arg
-- shape stay working — the new arguments default to NULL, and we keep the
-- old function signature for backward compatibility.

CREATE OR REPLACE FUNCTION public.remember_entity_memory(
    p_teamleader_id      text,
    p_search_term        text,
    p_canonical_name     text,
    p_entity_id          text,
    p_entity_type        text,
    p_parent_entity_id   text DEFAULT NULL,
    p_parent_entity_type text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO entity_memory (
        teamleader_id, search_term, canonical_name, entity_id, entity_type,
        parent_entity_id, parent_entity_type, hit_count, last_seen
    )
    VALUES (
        p_teamleader_id, p_search_term, p_canonical_name, p_entity_id, p_entity_type,
        p_parent_entity_id, p_parent_entity_type, 1, now()
    )
    ON CONFLICT (teamleader_id, search_term) DO UPDATE SET
        canonical_name     = EXCLUDED.canonical_name,
        entity_id          = EXCLUDED.entity_id,
        entity_type        = EXCLUDED.entity_type,
        parent_entity_id   = COALESCE(EXCLUDED.parent_entity_id,   entity_memory.parent_entity_id),
        parent_entity_type = COALESCE(EXCLUDED.parent_entity_type, entity_memory.parent_entity_type),
        hit_count          = entity_memory.hit_count + 1,
        last_seen          = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.remember_entity_memory(text, text, text, text, text, text, text)
    TO service_role;
