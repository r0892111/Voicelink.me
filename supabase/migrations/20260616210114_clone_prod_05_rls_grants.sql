-- enable RLS (match old prod; pipedrive_users/service_leads/user_instructions stay disabled)
alter table public.affiliates enable row level security;
alter table public.analytics enable row level security;
alter table public.credit_packs enable row level security;
alter table public.credit_topups enable row level security;
alter table public.entity_memory enable row level security;
alter table public.feedback enable row level security;
alter table public.finit_intake_sessions enable row level security;
alter table public.oauth_tokens enable row level security;
alter table public.plan_limits enable row level security;
alter table public.platform_admins enable row level security;
alter table public.stripe_subscriptions enable row level security;
alter table public.teamleader_users enable row level security;
alter table public.test_signups enable row level security;
alter table public.test_users enable row level security;
alter table public.users enable row level security;

-- policies
create policy analytics_read_own on public.analytics for select to authenticated
  using (user_id in ( select teamleader_users.teamleader_id from teamleader_users where ((teamleader_users.user_id = auth.uid()) and (teamleader_users.deleted_at is null))));
create policy credit_packs_read_active on public.credit_packs for select to anon, authenticated using (active = true);
create policy credit_topups_read_own on public.credit_topups for select to authenticated using (customer_id = current_billing_customer());
create policy entity_memory_read_own on public.entity_memory for select to authenticated
  using (teamleader_id in ( select teamleader_users.teamleader_id from teamleader_users where ((teamleader_users.user_id = auth.uid()) and (teamleader_users.deleted_at is null))));
create policy "Users delete own oauth tokens" on public.oauth_tokens for delete to authenticated using ((auth.uid())::text = user_id);
create policy plan_limits_read on public.plan_limits for select to anon, authenticated using (true);
create policy stripe_subscriptions_read_own on public.stripe_subscriptions for select to authenticated using (customer_id = current_billing_customer());
create policy "Users can view their own TeamLeader data" on public.teamleader_users for select to authenticated using (user_id = auth.uid());
create policy "Users delete own teamleader row" on public.teamleader_users for delete to authenticated using (user_id = auth.uid());
create policy "Users update own language" on public.teamleader_users for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Anyone can insert test signups" on public.test_signups for insert to anon, authenticated with check (true);
create policy "Only authenticated users can view test signups" on public.test_signups for select to authenticated using (true);
create policy "Users update own test_users row" on public.test_users for update to authenticated using (tl_user_id = (auth.uid())::text) with check (true);
create policy test_users_read_own on public.test_users for select to authenticated using (tl_user_id = (auth.uid())::text);
create policy "Users can insert own data" on public.users for insert to authenticated with check (auth.uid() = id);
create policy "Users can read own data" on public.users for select to authenticated using (auth.uid() = id);
create policy "Users can update own data" on public.users for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- standard Supabase grants (RLS gates row access; service_role bypasses RLS)
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;
