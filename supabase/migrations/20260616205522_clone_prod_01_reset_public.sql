-- Reset public on the NEW project to clone old prod (Option A). Destructive: new project only.
drop schema if exists public cascade;
create schema public;

-- Standard Supabase public-schema grants
grant usage on schema public to postgres, anon, authenticated, service_role;
grant create on schema public to postgres, service_role;
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;

-- Enum types (from old prod)
create type public.stripe_order_status as enum ('pending','completed','canceled');
create type public.stripe_subscription_status as enum ('not_started','incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid','paused');

-- Sequences (owned columns wired up after table creation)
create sequence public.credit_topups_id_seq;
create sequence public.feedback_id_seq;
