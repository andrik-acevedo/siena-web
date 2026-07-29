// process-scheduled-reminders (drop-in replacement for the core query + update logic)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Missing Supabase env");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const now = new Date();

    // 1) Find all not-yet-sent reminders at or before NOW
    const { data: reminders, error: fetchError } = await supabase
      .from('scheduled_reminders')
      .select('*')
      .eq('sent', false)
      .lte('scheduled_for', now.toISOString())
      .limit(200);

    if (fetchError) throw new Error(`Fetch failed: ${fetchError.message}`);

    if (!reminders?.length) {
      return new Response(JSON.stringify({ success: true, message: 'No due reminders', processed: 0 }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let ok = 0, fail = 0;

    for (const r of reminders) {
      try {
        // Optional: idempotency guard (mark as "sending")
        const { data: locked, error: lockErr } = await supabase
          .from('scheduled_reminders')
          .update({ sending_started_at: new Date().toISOString() })
          .eq('id', r.id)
          .eq('sent', false)
          .select('id')
          .single();

        // If another worker already grabbed it, skip
        if (lockErr || !locked) continue;

        const resp = await fetch(`${supabaseUrl}/functions/v1/send-twilio-message`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber: r.phone_number, content: r.message }),
        });

        const result = await resp.json();

        if (resp.ok && result.success) {
          await supabase
            .from('scheduled_reminders')
            .update({
              sent: true,
              sent_at: new Date().toISOString(),
              message_id: result.messageId,
              error_message: null
            })
            .eq('id', r.id);
          ok++;
        } else {
          await supabase
            .from('scheduled_reminders')
            .update({ error_message: result.error || 'Unknown error' })
            .eq('id', r.id);
          fail++;
        }
      } catch (e: any) {
        await supabase
          .from('scheduled_reminders')
          .update({ error_message: e.message || 'Unhandled error' })
          .eq('id', r.id);
        fail++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${reminders.length} reminders`,
      processed: reminders.length, successful: ok, failed: fail,
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Processing failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
