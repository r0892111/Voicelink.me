// ── get-usage-stats ───────────────────────────────────────────────────────────
// Returns cumulative VoiceLink usage (messages, cost, last activity) for the
// authenticated user, keyed by their teamleader_id in public.analytics.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface UsageRow {
  user_id: string;
  messages_sent: number | null;
  input_tokens_spent: number | null;
  output_tokens_spent: number | null;
  total_cost: string | null;
  sonnet_cost: string | null;
  haiku_cost: string | null;
  consolidation_cost: string | null;
  last_activity: string | null;
  avg_message_length: string | null;
  environment: string | null;
}

function json(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error: authError } =
      await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data: tl, error: tlError } = await supabase
      .from('teamleader_users')
      .select('teamleader_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (tlError) {
      return json({ success: false, error: tlError.message }, 500);
    }

    if (!tl?.teamleader_id) {
      return json({ success: true, usage: null });
    }

    const { data: rows, error: analyticsError } = await supabase
      .from('analytics')
      .select(
        'user_id, messages_sent, input_tokens_spent, output_tokens_spent, total_cost, sonnet_cost, haiku_cost, consolidation_cost, last_activity, avg_message_length, environment',
      )
      .eq('user_id', tl.teamleader_id);

    if (analyticsError) {
      return json({ success: false, error: analyticsError.message }, 500);
    }

    if (!rows || rows.length === 0) {
      return json({ success: true, usage: null });
    }

    // Sum across env rows (prod + dev). total_cost is numeric → arrives as string.
    const totals = (rows as UsageRow[]).reduce(
      (acc, r) => {
        acc.messages_sent += Number(r.messages_sent ?? 0);
        acc.input_tokens_spent += Number(r.input_tokens_spent ?? 0);
        acc.output_tokens_spent += Number(r.output_tokens_spent ?? 0);
        acc.total_cost += Number(r.total_cost ?? 0);
        acc.sonnet_cost += Number(r.sonnet_cost ?? 0);
        acc.haiku_cost += Number(r.haiku_cost ?? 0);
        acc.consolidation_cost += Number(r.consolidation_cost ?? 0);
        const lastActive = r.last_activity ? Date.parse(r.last_activity) : 0;
        if (lastActive && lastActive > acc._lastActiveMs) {
          acc._lastActiveMs = lastActive;
          acc.last_activity = r.last_activity;
        }
        // Weighted avg message length by message count.
        const avg = Number(r.avg_message_length ?? 0);
        const msgs = Number(r.messages_sent ?? 0);
        acc._avgWeighted += avg * msgs;
        return acc;
      },
      {
        messages_sent: 0,
        input_tokens_spent: 0,
        output_tokens_spent: 0,
        total_cost: 0,
        sonnet_cost: 0,
        haiku_cost: 0,
        consolidation_cost: 0,
        last_activity: null as string | null,
        _lastActiveMs: 0,
        _avgWeighted: 0,
      },
    );

    const avg_message_length =
      totals.messages_sent > 0 ? totals._avgWeighted / totals.messages_sent : 0;

    return json({
      success: true,
      usage: {
        messages_sent: totals.messages_sent,
        input_tokens_spent: totals.input_tokens_spent,
        output_tokens_spent: totals.output_tokens_spent,
        total_cost: totals.total_cost,
        sonnet_cost: totals.sonnet_cost,
        haiku_cost: totals.haiku_cost,
        consolidation_cost: totals.consolidation_cost,
        last_activity: totals.last_activity,
        avg_message_length,
        environments: rows.map((r) => r.environment).filter(Boolean),
      },
    });
  } catch (err) {
    return json(
      { success: false, error: err instanceof Error ? err.message : 'Unexpected error' },
      500,
    );
  }
});
