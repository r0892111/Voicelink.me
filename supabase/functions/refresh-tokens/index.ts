import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { refreshProviderToken } from '../_shared/crm/refresh.ts'

interface TokenRecord {
  user_id: string
  provider: string
  refresh_token: string
  access_token: string
  expires_at: string | null
  consecutive_failures: number
}

interface RefreshResult {
  user_id: string
  provider: string
  success: boolean
  error?: string
  expires_at?: string | null
  http_status?: number | null
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function updateWithRetry(
  supabase: ReturnType<typeof createClient>,
  user_id: string,
  provider: string,
  patch: Record<string, unknown>,
): Promise<string | null> {
  const backoffs = [100, 300, 900]
  let lastErr: string | null = null
  for (let i = 0; i < 3; i++) {
    const { error } = await supabase
      .from('oauth_tokens')
      .update(patch)
      .eq('user_id', user_id)
      .eq('provider', provider)
    if (!error) return null
    lastErr = error.message
    console.error(`[refresh-tokens] db update try ${i + 1}/3 user=${user_id} provider=${provider}: ${lastErr}`)
    if (i < 2) await sleep(backoffs[i])
  }
  return lastErr
}

// Teamleader-only: the Twilio-direct VLAgent runtime reads tokens from
// teamleader_users.{access_token,refresh_token,token_expires_at}. Mirror the
// freshly-rotated token there. Pipedrive/HubSpot store tokens only in
// oauth_tokens (no inline columns), so this is skipped for them. Best-effort.
async function mirrorToTeamleaderUsers(
  supabase: ReturnType<typeof createClient>,
  user_id: string,
  patch: { access_token: string; refresh_token: string; token_expires_at: string | null },
): Promise<void> {
  try {
    const { error } = await supabase
      .from('teamleader_users')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('user_id', user_id)
    if (error) console.error(`[refresh-tokens] teamleader_users mirror failed user=${user_id}: ${error.message}`)
    else console.log(`[refresh-tokens] teamleader_users mirror ok user=${user_id}`)
  } catch (e) {
    console.error(`[refresh-tokens] teamleader_users mirror threw user=${user_id}: ${(e as Error).message}`)
  }
}

async function refreshOne(
  tokenData: TokenRecord,
  supabase: ReturnType<typeof createClient>,
): Promise<RefreshResult> {
  const { user_id, provider, consecutive_failures: prevFailures } = tokenData
  const attemptedAt = new Date().toISOString()

  if (!tokenData.refresh_token) {
    const errMsg = 'No refresh token available'
    console.error(`[refresh-tokens] user=${user_id} provider=${provider} skip: ${errMsg}`)
    await updateWithRetry(supabase, user_id, provider, {
      last_refresh_attempt_at: attemptedAt,
      last_refresh_error: errMsg,
      consecutive_failures: prevFailures + 1,
      last_refresh_http_status: null,
    })
    return { user_id, provider, success: false, error: errMsg, http_status: null }
  }

  let status: number | null = null
  let body: Record<string, unknown> = {}
  try {
    const res = await refreshProviderToken(provider, tokenData.refresh_token)
    status = res.status
    body = res.body
    if (!res.ok) {
      const errMsg = `${provider} token endpoint error: ${status} - ${JSON.stringify(body)}`
      console.error(`[refresh-tokens] user=${user_id} provider=${provider} ${status}: ${JSON.stringify(body)}`)
      await updateWithRetry(supabase, user_id, provider, {
        last_refresh_attempt_at: attemptedAt,
        last_refresh_error: errMsg,
        consecutive_failures: prevFailures + 1,
        last_refresh_http_status: status,
      })
      return { user_id, provider, success: false, error: errMsg, http_status: status }
    }
  } catch (err) {
    // Includes "credentials not configured" for a provider whose secrets are unset.
    const errMsg = `${provider} refresh threw: ${(err as Error).message}`
    console.error(`[refresh-tokens] user=${user_id} provider=${provider} threw: ${errMsg}`)
    await updateWithRetry(supabase, user_id, provider, {
      last_refresh_attempt_at: attemptedAt,
      last_refresh_error: errMsg,
      consecutive_failures: prevFailures + 1,
      last_refresh_http_status: null,
    })
    return { user_id, provider, success: false, error: errMsg, http_status: null }
  }

  const newAccess = body.access_token as string
  const newRefresh = (body.refresh_token as string) || tokenData.refresh_token
  const expiresIn = body.expires_in as number | undefined
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null

  const dbErr = await updateWithRetry(supabase, user_id, provider, {
    access_token: newAccess,
    refresh_token: newRefresh,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
    last_refresh_attempt_at: attemptedAt,
    last_refresh_error: null,
    consecutive_failures: 0,
    last_refresh_http_status: status,
  })

  if (dbErr) {
    console.error(
      `[refresh-tokens] CRITICAL token-loss for user=${user_id} provider=${provider}: ` +
      `endpoint returned new tokens but DB write failed after retries. db_error="${dbErr}"`
    )
    await updateWithRetry(supabase, user_id, provider, {
      last_refresh_attempt_at: attemptedAt,
      last_refresh_error: `Token-loss: refresh succeeded, DB write failed. ${dbErr}`,
      consecutive_failures: prevFailures + 1,
      last_refresh_http_status: status,
    })
    return { user_id, provider, success: false, error: `DB write failed after refresh: ${dbErr}`, http_status: status }
  }

  // Mirror to teamleader_users for the VLAgent read path (teamleader only).
  if (provider === 'teamleader') {
    await mirrorToTeamleaderUsers(supabase, user_id, {
      access_token: newAccess,
      refresh_token: newRefresh,
      token_expires_at: expiresAt,
    })
  }

  console.log(`[refresh-tokens] user=${user_id} provider=${provider} ok status=${status} expires_at=${expiresAt}`)
  return { user_id, provider, success: true, expires_at: expiresAt, http_status: status }
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Optional scope for safe verification: POST {"only_user_id": "<uuid>"} and/or
    // {"only_provider": "pipedrive"}. No body (scheduled pg_cron) refreshes all.
    let onlyUserId: string | null = null
    let onlyProvider: string | null = null
    try {
      const reqBody = await req.json()
      onlyUserId = (reqBody?.only_user_id as string) ?? null
      onlyProvider = (reqBody?.only_provider as string) ?? null
    } catch (_) {
      // no/invalid body — full batch
    }

    const t0 = Date.now()
    let query = supabase
      .from('oauth_tokens')
      .select('user_id, provider, refresh_token, access_token, expires_at, consecutive_failures')
    if (onlyUserId) query = query.eq('user_id', onlyUserId)
    if (onlyProvider) query = query.eq('provider', onlyProvider)
    const { data: allTokens, error: fetchError } = await query

    if (fetchError) {
      console.error(`[refresh-tokens] fetch tokens failed: ${fetchError.message}`)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tokens', details: fetchError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!allTokens || allTokens.length === 0) {
      console.log('[refresh-tokens] no tokens to refresh')
      return new Response(
        JSON.stringify({ success: true, message: 'No CRM tokens found to refresh', total: 0, refreshed: 0, failed: 0, results: [] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[refresh-tokens] starting batch n=${allTokens.length}${onlyUserId ? ` (only_user_id=${onlyUserId})` : ''}${onlyProvider ? ` (only_provider=${onlyProvider})` : ''}`)
    const results = await Promise.all(
      allTokens.map(t => refreshOne(t as TokenRecord, supabase))
    )
    const refreshed = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    console.log(`[refresh-tokens] batch done in ${Date.now() - t0}ms total=${allTokens.length} ok=${refreshed} fail=${failed}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Refreshed ${refreshed} of ${allTokens.length} CRM token(s)`,
        total: allTokens.length, refreshed, failed, results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error(`[refresh-tokens] outer threw: ${(error as Error).message}`)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
