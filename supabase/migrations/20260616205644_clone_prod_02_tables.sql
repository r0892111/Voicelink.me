create table public.affiliates (
  id uuid not null default gen_random_uuid(),
  ref_code text not null,
  company_name text not null,
  contact_name text,
  contact_email text not null,
  status text not null default 'active'::text,
  commission_rate numeric not null default 0.20,
  auth_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.analytics (
  user_id text not null,
  messages_sent integer not null default 0,
  input_tokens_spent bigint not null default 0,
  output_tokens_spent bigint not null default 0,
  total_cost numeric(12,6) not null default 0,
  sonnet_cost numeric(12,6) not null default 0,
  haiku_cost numeric(12,6) not null default 0,
  consolidation_cost numeric(12,6) not null default 0,
  last_activity timestamptz not null default now(),
  avg_message_length numeric(8,1) not null default 0,
  created_at timestamptz not null default now(),
  environment text not null default 'dev'::text,
  credits_used numeric generated always as (((input_tokens_spent)::numeric / (300)::numeric)) stored
);

create table public.credit_packs (
  voicelink_key text not null,
  name text not null,
  credits integer not null,
  amount_cents integer not null,
  currency text not null default 'eur'::text,
  stripe_price_id text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.credit_topups (
  id bigint not null default nextval('public.credit_topups_id_seq'::regclass),
  customer_id text not null,
  teamleader_id text,
  stripe_payment_id text not null,
  voicelink_key text not null,
  credits_added integer not null,
  amount_cents integer not null,
  currency text not null default 'eur'::text,
  status text not null,
  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.entity_memory (
  teamleader_id text not null,
  search_term text not null,
  canonical_name text not null,
  entity_id text not null,
  entity_type text not null,
  hit_count integer not null default 1,
  last_seen timestamptz not null default now(),
  created_at timestamptz not null default now(),
  parent_entity_id text,
  parent_entity_type text
);

create table public.feedback (
  id bigint not null default nextval('public.feedback_id_seq'::regclass),
  issue_title text not null,
  issue_type text not null default 'Other'::text,
  user_prompt text not null default ''::text,
  bot_response text not null default ''::text,
  what_went_wrong text not null default ''::text,
  environment text not null default 'staging'::text,
  status text not null default 'Reported'::text,
  created_at timestamptz not null default now(),
  teamleader_id text
);

create table public.finit_intake_sessions (
  id uuid not null default gen_random_uuid(),
  token text not null,
  flavor text not null,
  client_slug text,
  email text not null,
  language text not null default 'nl'::text,
  sector text,
  maturity_score smallint,
  maturity_confidence text,
  personalization_json jsonb,
  state_json jsonb not null default '{}'::jsonb,
  goal_status_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  completed_at timestamptz,
  expires_at timestamptz not null default (now() + '14 days'::interval),
  migrated_to_client_slug text,
  migrated_at timestamptz,
  minted_by text,
  first_name text,
  last_name text,
  company_name text,
  company_website text,
  role text,
  phone text,
  mini_report_subject text,
  mini_report_html text,
  mini_report_text text,
  error_message text
);

create table public.oauth_tokens (
  id uuid not null default gen_random_uuid(),
  user_id text not null,
  provider text not null default 'teamleader'::text,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_refresh_attempt_at timestamptz,
  last_refresh_error text,
  consecutive_failures integer not null default 0,
  last_refresh_http_status integer
);

create table public.pipedrive_users (
  pipedrive_user_id bigint not null,
  company_id bigint,
  whatsapp_number text,
  access_token text not null,
  refresh_token text not null,
  expires_at_unix double precision,
  api_domain text,
  scopes text,
  env text not null default 'prod'::text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plan_limits (
  voicelink_key text not null,
  tier_key text not null,
  tier_name text not null,
  credits_per_seat integer not null,
  refresh_policy text not null,
  max_seats integer,
  has_auto_topup boolean not null default false,
  is_trial boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  stripe_price_id text not null
);

create table public.platform_admins (
  user_id uuid not null,
  created_at timestamptz not null default now()
);

create table public.service_leads (
  id uuid not null default gen_random_uuid(),
  naam text not null,
  bedrijf text not null,
  telefoonnummer text not null,
  email text not null,
  source text not null default 'worksmarter_service'::text,
  created_at timestamptz default now()
);

create table public.stripe_subscriptions (
  subscription_id text not null,
  customer_id text not null,
  price_id text,
  voicelink_key text,
  status text not null,
  quantity integer not null default 1,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teamleader_users (
  id uuid not null default gen_random_uuid(),
  user_id uuid,
  teamleader_id text not null,
  user_info jsonb,
  trial_started_tracked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  whatsapp_number text,
  whatsapp_status text default 'not_set'::text,
  whatsapp_otp_code text,
  whatsapp_otp_expires_at timestamptz,
  whatsapp_otp_phone text,
  stripe_customer_id text,
  is_test_user boolean not null default false,
  phone text,
  is_admin boolean default true,
  admin_user_id uuid,
  invited_by uuid,
  invitation_status text default 'accepted'::text,
  invited_at timestamptz,
  invitation_token text,
  invitation_expires_at timestamptz,
  entity_sync_status text,
  entity_sync_started_at timestamptz,
  entity_sync_completed_at timestamptz,
  entity_sync_companies integer,
  entity_sync_contacts integer,
  entity_sync_products integer,
  entity_sync_aliases_written integer,
  entity_sync_error text,
  language text not null default 'nl'::text,
  language_locked boolean not null default false,
  entity_sync_deal_pipelines integer,
  entity_sync_deal_phases integer,
  entity_sync_tax_rates integer,
  entity_sync_work_types integer,
  projects_version text,
  projects_version_checked_at timestamptz,
  promo_end_date timestamptz,
  env text not null default 'prod'::text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  erasure_due_at timestamptz,
  ref_code text,
  ref_attributed_at timestamptz,
  ref_source text
);

create table public.test_signups (
  id uuid not null default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  crm_platform text not null,
  status text default 'pending'::text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.test_users (
  id uuid not null default gen_random_uuid(),
  user_id text not null default (gen_random_uuid())::text,
  phone text not null,
  whatsapp_number text,
  whatsapp_status text not null default 'not_set'::text,
  whatsapp_otp_code text,
  whatsapp_otp_expires_at timestamptz,
  whatsapp_otp_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  tl_user_id text
);

create table public.user_instructions (
  id uuid not null default gen_random_uuid(),
  teamleader_id text not null,
  instruction text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid not null,
  name text not null,
  email text not null,
  webhook text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- wire sequence ownership
alter sequence public.credit_topups_id_seq owned by public.credit_topups.id;
alter sequence public.feedback_id_seq owned by public.feedback.id;
