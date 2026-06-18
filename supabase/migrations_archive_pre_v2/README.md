# Pre-V2 migrations (archived 2026-06-18)

These 58 migrations are the schema history of the **original** Voicelink project
(`mffnzuklxjwoprdiviyr`, now decommissioned). They do **not** reflect the live database.

VoicelinkV2 (`esnvhuflobwjegnstalz`) and its persistent `dev` branch
(`fajuudxmqshwveokoqyh`) were rebuilt from a prod dump on 2026-06-16. The live migration
ledger on both is, in order:

1. `20260616121111_remote_schema`            — initial bootstrap (legacy multi-CRM schema; dropped by step 2)
2. `20260616205522_clone_prod_01_reset_public`
3. `20260616205644_clone_prod_02_tables`
4. `20260616205846_clone_prod_03_constraints_indexes`
5. `20260616210017_clone_prod_04_functions_triggers`
6. `20260616210114_clone_prod_05_rls_grants`
7. `20260617141058_rls_close_exposed_tables`

Files 2–7 are now the baseline in `supabase/migrations/` (byte-identical to the ledger).
`remote_schema` is intentionally NOT reintroduced as a runnable file: `clone_prod_01`
starts with `drop schema if exists public cascade` and rebuilds from scratch, so the
baseline is self-contained on a fresh Supabase branch (extensions + `auth` are provided
by the platform).

Kept for historical reference only. **Do not move these back into `supabase/migrations/`.**
