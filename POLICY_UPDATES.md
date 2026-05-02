# Policy updates — pre-warm / entity-memory feature

Drafted 2026-05-01. Hand to legal/product before flipping the pre-warm
feature on. None of these are blockers for the engineering work but they
**must** ship before live customer data starts flowing through the new
processing path in production.

## What's new (in plain terms)

When a user finishes onboarding (or clicks "Sync now" in their dashboard),
VoiceLink reads a snapshot of their **most relevant Teamleader entities**
— companies (top 200 by recent activity), contacts (top 500), products
(all active), custom-field labels — and stores it in a per-user lookup
index on Voicelink Supabase. The index is used by the AI agent to match
voice-note mentions to existing CRM records faster and more accurately.
**No content is sent to any third party** beyond what already happens
(LLM calls to Anthropic for extraction, which already process voice-note
text but not the cached index directly).

## Documents that need an update

### 1. Privacy policy (`/privacy-policy` page)

Add a paragraph under "How we process your CRM data" (create the section
if it doesn't exist):

> When you connect a CRM account (Teamleader), VoiceLink periodically
> reads your **contacts, companies, products and custom-field
> definitions** and stores a per-user lookup index on our infrastructure
> in the EU (Supabase, eu-east-2). The index is used to recognise the
> entities you mention in voice notes and is **not shared with any third
> party**. The index is deleted automatically 30 days after you
> disconnect your CRM or close your account, and on demand when you
> exercise your right of erasure.

### 2. SaaS Agreement (`/saas-agreement`, both EN and NL PDFs)

In the **Data Processing Annex** ("Bijlage Verwerkersovereenkomst"):

- **Categories of personal data processed** — add:
  > Names, e-mail addresses, phone numbers and free-text fields (notes,
  > custom-field values) belonging to your CRM contacts, copied from the
  > customer's Teamleader account into a per-customer lookup index for
  > the duration of the active subscription plus a 30-day grace period
  > on disconnect.
- **Purpose of processing** — add:
  > To improve the accuracy and latency of voice-note → CRM operation
  > extraction by avoiding repeated CRM API lookups during a session.
- **Retention** — add a row:
  > **Cached CRM lookup index** — retained for the duration of the
  > active subscription plus 30 days after Teamleader disconnect or
  > account closure. Deleted on demand within 30 days of a verified
  > erasure request.

### 3. Sub-processor list

**No new sub-processor.** Voicelink Supabase (eu-east-2) already appears
on the list as the database for OAuth tokens and analytics; adding a new
table on the same database is an extension of an existing relationship,
not a new processor. Cross-check that Supabase is named in your published
sub-processor list — if not, that's a separate gap to fix today.

### 4. Cookie / consent banner

**No change.** The new processing is server-side. No browser cookies, no
fingerprints, no third-party trackers added.

### 5. Right-to-erasure procedure

Internal runbook update: the data-deletion script (whatever you use to
honour erasure requests) must now also run

```sql
DELETE FROM entity_memory WHERE teamleader_id = '<user>';
```

…in addition to whatever it already does for `analytics`,
`teamleader_users`, `oauth_tokens`. The migration that creates
`entity_memory` (`20260501000010_entity_memory.sql`, landing alongside
this doc) sets up the table.

### 6. Teamleader API terms — quick read needed

Teamleader's developer agreement (last reviewed: not by us) typically
allows caching API data for "operational purposes" within an
authenticated app, but may **prohibit redistribution or training of
third-party models on it**. Action: have someone read the latest version
and confirm:

- Caching lookup indexes is fine (almost certainly is)
- Sending CRM entity names to Anthropic (Claude API) for the
  voice-extraction step is fine — likely already covered by the existing
  VoiceLink terms

If Teamleader's terms have a clause forbidding either, that's a
hard-stop and the feature can't ship.

## Concrete changes you have to ship

| Doc | Status | Owner | Estimate |
|---|---|---|---|
| `/privacy-policy` page | Add the paragraph above | Product | 30 min copy + 30 min legal review |
| `/saas-agreement` PDFs (EN + NL) | Add Annex rows | Legal | 1–2 hours review |
| Sub-processor list | Verify Supabase listed | Product | 5 min |
| Internal erasure runbook | Add `DELETE FROM entity_memory …` | Eng / DPO | 10 min |
| Teamleader API terms read | Confirm caching is allowed | Legal / external | 30 min |

**Don't ship the feature in production until items 1, 2 and 5 are signed
off.** Items 3 and 4 are administrative; item 5 is the legal show-stopper
if it ever flips negative.

## What I (engineering) commit to do

- The `entity_memory` table is RLS-protected: users can only read their
  own rows (current `current_billing_customer()` helper extends to this).
  No anon access.
- Cache writes happen only via the service-role key from VLAgent backend.
  Frontend never touches `entity_memory` directly.
- A scheduled job (or manual trigger; v1 is manual) deletes
  `entity_memory` rows belonging to any `teamleader_users` row whose
  OAuth token has been revoked for >30 days.
- All pre-warm / sync events are logged to `logs.finitplatform.be` so
  you have an audit trail of when each user's index was last refreshed
  or wiped.

## Open questions for legal

1. Do we need to **notify existing customers** before flipping the
   feature on, or is "consent on next login" enough? Existing customers
   never agreed to this specific processing because it didn't exist.
2. **Children's data** — Teamleader is B2B-only, so it's unlikely any
   personal data of minors flows through. Still worth a sanity check.
3. **Cross-border transfers** — if any customer is non-EU and stores
   non-EU data in their Teamleader, the cached index also stays in
   eu-west-2 Supabase. Confirm this is acceptable under their local law
   (it's the same posture as today's analytics table).
