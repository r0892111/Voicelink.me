import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TEAMLEADER_TOKEN_URL = 'https://app.teamleader.eu/oauth2/access_token'
const TEAMLEADER_CLIENT_ID = Deno.env.get('TEAMLEADER_CLIENT_ID')
const TEAMLEADER_CLIENT_SECRET = Deno.env.get('TEAMLEADER_CLIENT_SECRET')

interface TokenRecord {
  user_id: string
  refresh_token: string
  access_token: string
  expires_at: string | null
  consecutive_failures: number
}

interface RefreshResult {
  user_id: string
  success: boolean
  error?: string
  expires_at?: string | null
  http_status?: number | null
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function updateWithRetry(
  supabase: ReturnType<typeof createClient>,
  user_id: string,
  patch: Record<string, unknown>,
): Promise<string | null> {
  const backoffs = [100, 300, 900]
  let lastErr: string | null = null
  for (let i = 0; i < 3; i++) {
    const { error } = await supabase
      .from('oauth_tokens')
      .update(patch)
      .eq('user_id', user_id)
      .eq('provider', 'teamleader')
    if (!error) return null
    lastErr = error.message
    console.error(`[refresh-tokens] db update try ${i + 1}/3 user=${user_id}: ${lastErr}`)
    if (i < 2) await sleep(backoffs[i])
  }
  return lastErr
}

// New structure: the Twilio-direct VLAgent runtime reads tokens from
// teamleader_users.{access_token,refresh_token,token_expires_at}. Mirror the
// freshly-rotated token there so that read path stays fresh. Best-effort by
// design: a failure here must NEVER affect the oauth_tokens source-of-truth
// write, so all errors are swallowed and logged. Joins on user_id
// (oauth_tokens.user_id == teamleader_users.user_id).
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

async function refreshTeamleaderToken(
  tokenData: TokenRecord,
  supabase: ReturnType<typeof createClient>,
): Promise<RefreshResult> {
  const { user_id, consecutive_failures: prevFailures } = tokenData
  const attemptedAt = new Date().toISOString()

  if (!tokenData.refresh_token) {
    const errMsg = 'No refresh token available'
    console.error(`[refresh-tokens] user=${user_id} skip: ${errMsg}`)
    await updateWithRetry(supabase, user_id, {
      last_refresh_attempt_at: attemptedAt,
      last_refresh_error: errMsg,
      consecutive_failures: prevFailures + 1,
      last_refresh_http_status: null,
    })
    return { user_id, success: false, error: errMsg, http_status: null }
  }

  let tlStatus: number | null = null
  let tlBody: Record<string, unknown> = {}
  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenData.refresh_token,
      client_id: TEAMLEADER_CLIENT_ID!,
      client_secret: TEAMLEADER_CLIENT_SECRET!,
    })
    const resp = await fetch(TEAMLEADER_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })
    tlStatus = resp.status
    tlBody = await resp.json().catch(() => ({}))

    if (!resp.ok) {
      const errMsg = `Teamleader API error: ${tlStatus} - ${JSON.stringify(tlBody)}`
      console.error(`[refresh-tokens] user=${user_id} TL ${tlStatus}: ${JSON.stringify(tlBody)}`)
      await updateWithRetry(supabase, user_id, {
        last_refresh_attempt_at: attemptedAt,
        last_refresh_error: errMsg,
        consecutive_failures: prevFailures + 1,
        last_refresh_http_status: tlStatus,
      })
      return { user_id, success: false, error: errMsg, http_status: tlStatus }
    }
  } catch (err) {
    const errMsg = `Teamleader request threw: ${(err as Error).message}`
    console.error(`[refresh-tokens] user=${user_id} fetch threw: ${errMsg}`)
    await updateWithRetry(supabase, user_id, {
      last_refresh_attempt_at: attemptedAt,
      last_refresh_error: errMsg,
      consecutive_failures: prevFailures + 1,
      last_refresh_http_status: null,
    })
    return { user_id, success: false, error: errMsg, http_status: null }
  }

  const newAccess = tlBody.access_token as string
  const newRefresh = (tlBody.refresh_token as string) || tokenData.refresh_token
  const expiresIn = tlBody.expires_in as number | undefined
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null

  const dbErr = await updateWithRetry(supabase, user_id, {
    access_token: newAccess,
    refresh_token: newRefresh,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
    last_refresh_attempt_at: attemptedAt,
    last_refresh_error: null,
    consecutive_failures: 0,
    last_refresh_http_status: tlStatus,
  })

  if (dbErr) {
    console.error(
      `[refresh-tokens] CRITICAL token-loss for user=${user_id}: ` +
      `TL returned new tokens but DB write failed after retries. ` +
      `db_error="${dbErr}" expires_at=${expiresAt} ` +
      `access_token_len=${newAccess?.length ?? 0} refresh_token_len=${newRefresh?.length ?? 0}`
    )
    await updateWithRetry(supabase, user_id, {
      last_refresh_attempt_at: attemptedAt,
      last_refresh_error: `Token-loss: TL succeeded, DB write failed. ${dbErr}`,
      consecutive_failures: prevFailures + 1,
      last_refresh_http_status: tlStatus,
    })
    return {
      user_id,
      success: false,
      error: `DB write failed after TL success: ${dbErr}`,
      http_status: tlStatus,
    }
  }

  // Mirror to the new structure (teamleader_users). Best-effort, never fatal.
  await mirrorToTeamleaderUsers(supabase, user_id, {
    access_token: newAccess,
    refresh_token: newRefresh,
    token_expires_at: expiresAt,
  })

  console.log(`[refresh-tokens] user=${user_id} ok status=${tlStatus} expires_at=${expiresAt}`)
  return { user_id, success: true, expires_at: expiresAt, http_status: tlStatus }
}

serve(async (req) => {
  try {
    if (!TEAMLEADER_CLIENT_ID || !TEAMLEADER_CLIENT_SECRET) {
      console.error('[refresh-tokens] missing TEAMLEADER_CLIENT_ID/SECRET env')
      return new Response(
        JSON.stringify({ error: 'Teamleader credentials not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Optional single-user scope for safe verification: POST {"only_user_id": "<uuid>"}.
    // No body (the scheduled pg_cron invocation) refreshes all Teamleader tokens.
    let onlyUserId: string | null = null
    try {
      const body = await req.json()
      onlyUserId = (body?.only_user_id as string) ?? null
    } catch (_) {
      // no/invalid body — full batch
    }

    const t0 = Date.now()
    let query = supabase
      .from('oauth_tokens')
      .select('user_id, refresh_token, access_token, expires_at, consecutive_failures')
      .eq('provider', 'teamleader')
    if (onlyUserId) query = query.eq('user_id', onlyUserId)
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
        JSON.stringify({
          success: true, message: 'No Teamleader tokens found to refresh',
          total: 0, refreshed: 0, failed: 0, results: [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[refresh-tokens] starting batch n=${allTokens.length}${onlyUserId ? ` (only_user_id=${onlyUserId})` : ''}`)
    const results = await Promise.all(
      allTokens.map(t => refreshTeamleaderToken(t as TokenRecord, supabase))
    )
    const refreshed = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    console.log(
      `[refresh-tokens] batch done in ${Date.now() - t0}ms ` +
      `total=${allTokens.length} ok=${refreshed} fail=${failed}`
    )

    return new Response(
      JSON.stringify({
        success: true,
        message: `Refreshed ${refreshed} of ${allTokens.length} Teamleader token(s)`,
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
