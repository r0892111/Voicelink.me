-- PRIMARY KEY / UNIQUE / CHECK (non-FK) first
alter table public.affiliates add constraint affiliates_pkey primary key (id);
alter table public.affiliates add constraint affiliates_auth_user_id_key unique (auth_user_id);
alter table public.affiliates add constraint affiliates_ref_code_key unique (ref_code);
alter table public.affiliates add constraint affiliates_ref_code_check check ((ref_code ~ '^[a-z0-9-]{2,32}$'::text));
alter table public.affiliates add constraint affiliates_status_check check ((status = any (array['active'::text, 'paused'::text, 'terminated'::text])));
alter table public.affiliates add constraint affiliates_commission_rate_check check (((commission_rate >= (0)::numeric) and (commission_rate <= (1)::numeric)));

alter table public.analytics add constraint analytics_pkey primary key (user_id);

alter table public.credit_packs add constraint credit_packs_pkey primary key (voicelink_key);
alter table public.credit_packs add constraint credit_packs_stripe_price_id_key unique (stripe_price_id);
alter table public.credit_packs add constraint credit_packs_amount_cents_check check ((amount_cents > 0));
alter table public.credit_packs add constraint credit_packs_credits_check check ((credits > 0));

alter table public.credit_topups add constraint credit_topups_pkey primary key (id);
alter table public.credit_topups add constraint credit_topups_stripe_payment_id_key unique (stripe_payment_id);
alter table public.credit_topups add constraint credit_topups_credits_added_check check ((credits_added > 0));

alter table public.entity_memory add constraint entity_memory_pkey primary key (teamleader_id, search_term);
alter table public.entity_memory add constraint entity_memory_hit_count_check check ((hit_count > 0));

alter table public.feedback add constraint feedback_pkey primary key (id);

alter table public.finit_intake_sessions add constraint finit_intake_sessions_pkey primary key (id);
alter table public.finit_intake_sessions add constraint finit_intake_sessions_token_key unique (token);
alter table public.finit_intake_sessions add constraint finit_intake_sessions_maturity_score_check check (((maturity_score >= 0) and (maturity_score <= 100)));
alter table public.finit_intake_sessions add constraint finit_intake_sessions_flavor_check check ((flavor = any (array['lead_magnet'::text, 'paying_client'::text])));
alter table public.finit_intake_sessions add constraint finit_intake_sessions_language_check check ((language = any (array['nl'::text, 'fr'::text, 'en'::text])));
alter table public.finit_intake_sessions add constraint finit_intake_sessions_maturity_confidence_check check ((maturity_confidence = any (array['low'::text, 'medium'::text, 'high'::text])));

alter table public.oauth_tokens add constraint oauth_tokens_pkey primary key (id);
alter table public.oauth_tokens add constraint oauth_tokens_user_provider_unique unique (user_id, provider);

alter table public.pipedrive_users add constraint pipedrive_users_pkey primary key (pipedrive_user_id);
alter table public.pipedrive_users add constraint pipedrive_users_env_check check ((env = any (array['dev'::text, 'staging'::text, 'prod'::text])));

alter table public.plan_limits add constraint plan_limits_pkey primary key (voicelink_key);
alter table public.plan_limits add constraint plan_limits_stripe_price_id_unique unique (stripe_price_id);
alter table public.plan_limits add constraint plan_limits_credits_per_seat_check check ((credits_per_seat >= 0));
alter table public.plan_limits add constraint plan_limits_refresh_policy_check check ((refresh_policy = any (array['once'::text, 'monthly'::text])));
alter table public.plan_limits add constraint plan_limits_max_seats_check check (((max_seats is null) or (max_seats >= 1)));

alter table public.platform_admins add constraint platform_admins_pkey primary key (user_id);

alter table public.service_leads add constraint service_leads_pkey primary key (id);

alter table public.stripe_subscriptions add constraint stripe_subscriptions_pkey primary key (subscription_id);
alter table public.stripe_subscriptions add constraint stripe_subscriptions_quantity_check check ((quantity >= 1));

alter table public.teamleader_users add constraint teamleader_users_pkey primary key (id);
alter table public.teamleader_users add constraint teamleader_users_teamleader_id_key unique (teamleader_id);
alter table public.teamleader_users add constraint teamleader_users_invitation_token_key unique (invitation_token);
alter table public.teamleader_users add constraint teamleader_users_whatsapp_status_check check ((whatsapp_status = any (array['not_set'::text, 'pending'::text, 'active'::text])));
alter table public.teamleader_users add constraint teamleader_users_entity_sync_status_check check (((entity_sync_status is null) or (entity_sync_status = any (array['pending'::text, 'in_progress'::text, 'completed'::text, 'failed'::text]))));
alter table public.teamleader_users add constraint teamleader_users_projects_version_check check (((projects_version is null) or (projects_version = any (array['projects-v1'::text, 'projects-v2'::text]))));
alter table public.teamleader_users add constraint teamleader_users_ref_source_check check ((ref_source = any (array['link'::text, 'manual'::text])));
alter table public.teamleader_users add constraint teamleader_users_env_check check ((env = any (array['dev'::text, 'staging'::text, 'prod'::text])));
alter table public.teamleader_users add constraint teamleader_users_language_check check ((language = any (array['nl'::text, 'en'::text, 'fr'::text, 'de'::text])));

alter table public.test_signups add constraint test_signups_pkey primary key (id);
alter table public.test_signups add constraint test_signups_email_key unique (email);
alter table public.test_signups add constraint test_signups_crm_platform_check check ((crm_platform = any (array['teamleader'::text, 'pipedrive'::text, 'odoo'::text])));
alter table public.test_signups add constraint test_signups_status_check check ((status = any (array['pending'::text, 'contacted'::text, 'onboarded'::text])));

alter table public.test_users add constraint test_users_pkey primary key (id);
alter table public.test_users add constraint test_users_phone_key unique (phone);
alter table public.test_users add constraint test_users_user_id_key unique (user_id);
alter table public.test_users add constraint test_users_whatsapp_status_check check ((whatsapp_status = any (array['not_set'::text, 'pending'::text, 'active'::text])));

alter table public.user_instructions add constraint user_instructions_pkey primary key (id);

alter table public.users add constraint users_pkey primary key (id);
alter table public.users add constraint users_email_key unique (email);

-- FOREIGN KEYS (after all PK/unique exist)
alter table public.affiliates add constraint affiliates_auth_user_id_fkey foreign key (auth_user_id) references auth.users(id) on delete set null;
alter table public.analytics add constraint analytics_user_id_fkey foreign key (user_id) references public.teamleader_users(teamleader_id) on update cascade on delete restrict not valid;
alter table public.credit_topups add constraint credit_topups_voicelink_key_fkey foreign key (voicelink_key) references public.credit_packs(voicelink_key) on update cascade;
alter table public.platform_admins add constraint platform_admins_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
alter table public.stripe_subscriptions add constraint stripe_subscriptions_voicelink_key_fkey foreign key (voicelink_key) references public.plan_limits(voicelink_key) on update cascade;
alter table public.teamleader_users add constraint teamleader_users_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
alter table public.users add constraint users_id_fkey foreign key (id) references auth.users(id) on delete cascade;

-- NON-CONSTRAINT INDEXES
create index idx_analytics_credits_used on public.analytics using btree (credits_used desc);
create index idx_analytics_last_activity on public.analytics using btree (last_activity desc);
create index idx_credit_topups_customer on public.credit_topups using btree (customer_id, status);
create index idx_credit_topups_purchased_at on public.credit_topups using btree (purchased_at desc);
create index idx_entity_memory_parent on public.entity_memory using btree (teamleader_id, entity_type, parent_entity_id) where (parent_entity_id is not null);
create index idx_entity_memory_type_hits on public.entity_memory using btree (teamleader_id, entity_type, hit_count desc);
create index idx_feedback_created on public.feedback using btree (created_at desc);
create index idx_feedback_env on public.feedback using btree (environment);
create index idx_feedback_status on public.feedback using btree (status);
create index idx_feedback_teamleader on public.feedback using btree (teamleader_id);
create index idx_finit_intake_sessions_email on public.finit_intake_sessions using btree (email);
create index idx_finit_intake_sessions_expires_at on public.finit_intake_sessions using btree (expires_at) where (completed_at is null);
create index idx_finit_intake_sessions_token on public.finit_intake_sessions using btree (token);
create index idx_oauth_tokens_user_provider on public.oauth_tokens using btree (user_id, provider);
create index idx_pipedrive_users_env on public.pipedrive_users using btree (env);
create index idx_pipedrive_users_whatsapp on public.pipedrive_users using btree (whatsapp_number) where (whatsapp_number is not null);
create index idx_stripe_subscriptions_customer on public.stripe_subscriptions using btree (customer_id);
create index idx_stripe_subscriptions_status on public.stripe_subscriptions using btree (status);
create index idx_teamleader_users_env on public.teamleader_users using btree (env);
create index idx_teamleader_users_erasure_due_at on public.teamleader_users using btree (erasure_due_at) where (erasure_due_at is not null);
create index idx_teamleader_users_ref_code on public.teamleader_users using btree (ref_code) where (ref_code is not null);
create index idx_teamleader_users_teamleader_id on public.teamleader_users using btree (teamleader_id);
create index idx_teamleader_users_user_id on public.teamleader_users using btree (user_id);
create index idx_teamleader_users_whatsapp on public.teamleader_users using btree (whatsapp_number) where (whatsapp_number is not null);
create index idx_teamleader_users_whatsapp_status on public.teamleader_users using btree (whatsapp_status);
create index idx_tl_users_admin_user_id on public.teamleader_users using btree (admin_user_id) where (admin_user_id is not null);
create index idx_tl_users_invitation_token on public.teamleader_users using btree (invitation_token) where (invitation_token is not null);
create index idx_test_users_phone on public.test_users using btree (phone);
create index idx_user_instructions_active on public.user_instructions using btree (teamleader_id, active);
