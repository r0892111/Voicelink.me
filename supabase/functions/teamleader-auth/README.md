# teamleader-auth Edge Function

Handles OAuth callback for Teamleader: exchanges the authorization code for tokens, fetches user info, creates/links Supabase user, and returns a magic link for session.

## Required Secrets

Set these in Supabase Dashboard → Project Settings → Edge Functions → Secrets:

| Secret | Description |
|--------|-------------|
| `TEAMLEADER_CLIENT_ID` | From Teamleader Marketplace (same as `VITE_TEAMLEADER_CLIENT_ID`) |
| `TEAMLEADER_CLIENT_SECRET` | From Teamleader Marketplace (never expose client-side) |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically.

## Database

Requires these tables:

- `users` – `id`, `email`, `name`
- `teamleader_users` – `user_id`, `teamleader_id`, `user_info` (mapping; tokens in oauth_tokens)
- `oauth_tokens` – `user_id`, `provider`, `access_token`, `refresh_token`, `expires_at`

## Deploy

```bash
supabase functions deploy teamleader-auth --project-ref YOUR_PROJECT_REF
```

## Local testing

```bash
supabase functions serve teamleader-auth --env-file ./supabase/.env.local
```

Create `supabase/.env.local` with `TEAMLEADER_CLIENT_ID` and `TEAMLEADER_CLIENT_SECRET`.
