# VoiceLink Supabase Database Schema

Current tables in the `public` schema (minimal setup for Teamleader auth):

---

## Core Tables

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, references auth.users |
| name | text | NOT NULL |
| email | text | UNIQUE, NOT NULL |
| webhook | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### `teamleader_users`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK (from divine_heart) |
| user_id | uuid | FK → auth.users |
| teamleader_id | text | UNIQUE, NOT NULL |
| access_token | text | |
| refresh_token | text | |
| token_expires_at | timestamptz | |
| user_info | jsonb | |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| deleted_at | timestamptz | |
| trial_started_tracked | boolean | Default false |
| auth_user_id | uuid | FK → auth.users (WhatsApp verification) |

---

### `pipedrive_users`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| pipedrive_user_id | text | UNIQUE, NOT NULL |
| access_token | text | |
| refresh_token | text | |
| token_expires_at | timestamptz | |
| user_info | jsonb | |
| api_domain | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| deleted_at | timestamptz | |
| trial_started_tracked | boolean | |
| auth_user_id | uuid | |

---

### `odoo_users`
Owned by VoiceLink (migration `029_odoo_users.sql`, portal parity copy `20260915120000_create_odoo_users.sql`); the portal only links `user_id` (odoo-connect) and the OTP / billing / language columns. RLS enabled with no policies: backend (service role) only — `access_token` never reaches a browser.

| Column | Type | Notes |
|--------|------|-------|
| odoo_user_id | text | PK — `host/db/uid`, one Odoo login on one database on one instance |
| api_domain | text | NOT NULL — instance base URL |
| odoo_db | text | NOT NULL |
| odoo_login | text | NOT NULL |
| odoo_uid | integer | |
| access_token | text | NOT NULL — the static Odoo API key (no OAuth, no refresh) |
| refresh_token | text | NOT NULL DEFAULT '' (parity with the generic token path) |
| expires_at_unix | double precision | when the tenant set an expiry on the key |
| odoo_version | text | |
| user_id | uuid | FK → auth.users, ON DELETE SET NULL — linked by odoo-connect |
| env | text | NOT NULL, 'dev' \| 'staging' \| 'prod' — one row per env |
| whatsapp_number | text | |
| whatsapp_status | text | NOT NULL DEFAULT 'pending' — 'pending' \| 'active' \| 'disabled'; VoiceLink routes 'active' only |
| whatsapp_otp_code | text | |
| whatsapp_otp_expires_at | timestamptz | |
| whatsapp_otp_phone | text | |
| stripe_customer_id | text | |
| is_admin | boolean | NOT NULL DEFAULT false |
| admin_user_id | uuid | |
| promo_end_date | timestamptz | |
| trial_started_tracked | boolean | NOT NULL DEFAULT false |
| language | text | |
| language_locked | boolean | NOT NULL DEFAULT false |
| is_test_user | boolean | since `20260916120001` |
| erasure_due_at | timestamptz | |
| deleted_at | timestamptz | |
| created_at | timestamptz | NOT NULL DEFAULT now() |
| updated_at | timestamptz | NOT NULL DEFAULT now() |
---

### `oauth_tokens`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | text | |
| provider | text | Default 'teamleader' |
| access_token | text | NOT NULL |
| refresh_token | text | |
| expires_at | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

## Stripe Tables

### `stripe_customers`
| Column | Type |
|--------|------|
| id | bigint (identity) |
| user_id | uuid | UNIQUE, FK → auth.users |
| customer_id | text | UNIQUE |
| created_at | timestamptz |
| updated_at | timestamptz |
| deleted_at | timestamptz |

### `stripe_subscriptions`
| Column | Type |
|--------|------|
| id | bigint (identity) |
| customer_id | text | UNIQUE |
| subscription_id | text |
| price_id | text |
| current_period_start | bigint |
| current_period_end | bigint |
| cancel_at_period_end | boolean |
| payment_method_brand | text |
| payment_method_last4 | text |
| status | stripe_subscription_status enum |
| created_at | timestamptz |
| updated_at | timestamptz |
| deleted_at | timestamptz |

### `stripe_orders`
| Column | Type |
|--------|------|
| id | bigint (identity) |
| checkout_session_id | text |
| payment_intent_id | text |
| customer_id | text |
| amount_subtotal | bigint |
| amount_total | bigint |
| currency | text |
| payment_status | text |
| status | stripe_order_status enum |
| created_at | timestamptz |
| updated_at | timestamptz |
| deleted_at | timestamptz |

---

## Other Tables

### `test_signups`
| Column | Type |
|--------|------|
| id | uuid |
| first_name | text |
| last_name | text |
| email | text | UNIQUE |
| phone | text |
| crm_platform | text | teamleader, pipedrive, odoo |
| status | text | pending, contacted, onboarded |
| created_at | timestamptz |
| updated_at | timestamptz |

### `whatsapp_verification_tokens`
| Column | Type |
|--------|------|
| id | uuid |
| auth_user_id | uuid |
| crm_user_id | text |
| otp_code | text |
| email | text |
| name | text |
| verified_at | timestamptz |
| created_at | timestamptz |

---

## Views

- **stripe_user_subscriptions** – User subscriptions via stripe_customers
- **stripe_user_orders** – User orders via stripe_customers
