-- Pipedrive & HubSpot OAuth: reshape pipedrive_users + add hubspot_users to the
-- teamleader_users pattern (linked to auth.users; tokens live in oauth_tokens).
-- The old standalone pipedrive_users (pipedrive_user_id bigint, inline tokens) is empty; drop it.
drop table if exists public.pipedrive_users cascade;

create table public.pipedrive_users (
  id uuid not null default gen_random_uuid(),
  user_id uuid,
  pipedrive_id text not null,
  user_info jsonb,
  api_domain text,
  whatsapp_number text,
  whatsapp_status text default 'not_set'::text,
  whatsapp_otp_code text,
  whatsapp_otp_expires_at timestamptz,
  whatsapp_otp_phone text,
  stripe_customer_id text,
  is_admin boolean default true,
  admin_user_id uuid,
  invited_by uuid,
  invitation_status text default 'accepted'::text,
  invited_at timestamptz,
  invitation_token text,
  invitation_expires_at timestamptz,
  is_test_user boolean not null default false,
  promo_end_date timestamptz,
  deleted_at timestamptz,
  env text not null default 'prod'::text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.hubspot_users (
  id uuid not null default gen_random_uuid(),
  user_id uuid,
  hubspot_user_id text not null,
  hub_id text,
  user_info jsonb,
  whatsapp_number text,
  whatsapp_status text default 'not_set'::text,
  whatsapp_otp_code text,
  whatsapp_otp_expires_at timestamptz,
  whatsapp_otp_phone text,
  stripe_customer_id text,
  is_admin boolean default true,
  admin_user_id uuid,
  invited_by uuid,
  invitation_status text default 'accepted'::text,
  invited_at timestamptz,
  invitation_token text,
  invitation_expires_at timestamptz,
  is_test_user boolean not null default false,
  promo_end_date timestamptz,
  deleted_at timestamptz,
  env text not null default 'prod'::text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- constraints (mirror teamleader_users)
alter table public.pipedrive_users add constraint pipedrive_users_pkey primary key (id);
alter table public.pipedrive_users add constraint pipedrive_users_pipedrive_id_key unique (pipedrive_id);
alter table public.pipedrive_users add constraint pipedrive_users_invitation_token_key unique (invitation_token);
alter table public.pipedrive_users add constraint pipedrive_users_whatsapp_status_check check ((whatsapp_status = any (array['not_set'::text,'pending'::text,'active'::text])));
alter table public.pipedrive_users add constraint pipedrive_users_env_check check ((env = any (array['dev'::text,'staging'::text,'prod'::text])));
alter table public.pipedrive_users add constraint pipedrive_users_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.hubspot_users add constraint hubspot_users_pkey primary key (id);
alter table public.hubspot_users add constraint hubspot_users_hubspot_user_id_key unique (hubspot_user_id);
alter table public.hubspot_users add constraint hubspot_users_invitation_token_key unique (invitation_token);
alter table public.hubspot_users add constraint hubspot_users_whatsapp_status_check check ((whatsapp_status = any (array['not_set'::text,'pending'::text,'active'::text])));
alter table public.hubspot_users add constraint hubspot_users_env_check check ((env = any (array['dev'::text,'staging'::text,'prod'::text])));
alter table public.hubspot_users add constraint hubspot_users_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;

-- indexes
create index idx_pipedrive_users_user_id on public.pipedrive_users using btree (user_id);
create index idx_pipedrive_users_pipedrive_id on public.pipedrive_users using btree (pipedrive_id);
create index idx_pipedrive_users_whatsapp_status on public.pipedrive_users using btree (whatsapp_status);
create index idx_pipedrive_users_whatsapp on public.pipedrive_users using btree (whatsapp_number) where (whatsapp_number is not null);
create index idx_pipedrive_users_admin_user_id on public.pipedrive_users using btree (admin_user_id) where (admin_user_id is not null);
create index idx_pipedrive_users_invitation_token on public.pipedrive_users using btree (invitation_token) where (invitation_token is not null);

create index idx_hubspot_users_user_id on public.hubspot_users using btree (user_id);
create index idx_hubspot_users_hubspot_user_id on public.hubspot_users using btree (hubspot_user_id);
create index idx_hubspot_users_whatsapp_status on public.hubspot_users using btree (whatsapp_status);
create index idx_hubspot_users_whatsapp on public.hubspot_users using btree (whatsapp_number) where (whatsapp_number is not null);
create index idx_hubspot_users_admin_user_id on public.hubspot_users using btree (admin_user_id) where (admin_user_id is not null);
create index idx_hubspot_users_invitation_token on public.hubspot_users using btree (invitation_token) where (invitation_token is not null);

-- updated_at triggers (reuse existing handle_updated_at())
create trigger pipedrive_users_updated_at before update on public.pipedrive_users for each row execute function handle_updated_at();
create trigger hubspot_users_updated_at before update on public.hubspot_users for each row execute function handle_updated_at();

-- RLS (mirror teamleader_users: own-row select/update/delete; backend uses service_role)
alter table public.pipedrive_users enable row level security;
create policy "Users can view their own Pipedrive data" on public.pipedrive_users for select to authenticated using (user_id = auth.uid());
create policy "Users delete own pipedrive row" on public.pipedrive_users for delete to authenticated using (user_id = auth.uid());
create policy "Users update own pipedrive row" on public.pipedrive_users for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.hubspot_users enable row level security;
create policy "Users can view their own HubSpot data" on public.hubspot_users for select to authenticated using (user_id = auth.uid());
create policy "Users delete own hubspot row" on public.hubspot_users for delete to authenticated using (user_id = auth.uid());
create policy "Users update own hubspot row" on public.hubspot_users for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

grant all on public.pipedrive_users to anon, authenticated, service_role;
grant all on public.hubspot_users to anon, authenticated, service_role;

-- Unified read view across CRM user tables (common columns only).
-- security_invoker so it respects each table's RLS for any non-service caller.
create view public.crm_users with (security_invoker = true) as
  select user_id, 'teamleader'::text as provider, teamleader_id as crm_user_id,
         stripe_customer_id, is_admin, admin_user_id, promo_end_date, deleted_at,
         is_test_user, invitation_status, invitation_token, user_info
    from public.teamleader_users
  union all
  select user_id, 'pipedrive'::text, pipedrive_id,
         stripe_customer_id, is_admin, admin_user_id, promo_end_date, deleted_at,
         is_test_user, invitation_status, invitation_token, user_info
    from public.pipedrive_users
  union all
  select user_id, 'hubspot'::text, hubspot_user_id,
         stripe_customer_id, is_admin, admin_user_id, promo_end_date, deleted_at,
         is_test_user, invitation_status, invitation_token, user_info
    from public.hubspot_users;

grant select on public.crm_users to anon, authenticated, service_role;

-- Generalize billing-customer resolution to all CRMs (was teamleader_users only).
create or replace function public.current_billing_customer()
 returns text language sql stable security definer set search_path to 'public'
as $function$
  with me as (
    select user_id, is_admin, admin_user_id, stripe_customer_id
    from crm_users
    where user_id = auth.uid() and deleted_at is null
    limit 1
  )
  select coalesce(
    (select stripe_customer_id from me where is_admin = true),
    (select admin.stripe_customer_id
       from me
       join crm_users admin
         on admin.user_id = me.admin_user_id
        and admin.is_admin = true
        and admin.deleted_at is null)
  );
$function$;
