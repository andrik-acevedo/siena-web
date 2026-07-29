// functions/send-twilio-message/index.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Parse body (accept several key names)
    const ct = req.headers.get('content-type') || '';
    let payload: any = {};
    try {
      payload = ct.includes('application/json') ? await req.json() : JSON.parse(await req.text() || '{}');
    } catch { payload = {}; }

    const to   = (payload.phoneNumber ?? payload.to)?.toString();
    const body = (payload.content ?? payload.body ?? payload.message)?.toString();
    if (!to || !body) {
      return new Response(JSON.stringify({ error: 'Missing required parameters', received: Object.keys(payload) }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Env
    const accountSid   = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken    = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    if (!accountSid || !authToken || !twilioNumber) {
      throw new Error('Missing Twilio configuration (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)');
    }

    // POST to Twilio REST API
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const form = new URLSearchParams({ To: to, From: twilioNumber, Body: body });

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    const data = await resp.json();
    if (!resp.ok) {
      const msg = data.message || data.error_message || 'Twilio API error';
      return new Response(JSON.stringify({ success: false, error: msg, code: data.code, twilio: data }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, messageId: data.sid, status: data.status }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to send message' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
