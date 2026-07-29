// deno-lint-ignore-file no-explicit-any
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

/* --------------------------- C O R S  /  H E A D E R S --------------------------- */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/* -------------------------- M E N T A L  H E A L T H  P O L I C Y -------------------------- */
const MH_POLICY = `
You are a supportive wellness companion for Siena. You MAY discuss mental health topics
(e.g., feeling depressed, anxious, stressed) and offer psychoeducation and self-help
techniques rooted in CBT, mindfulness, behavioral activation, values work, and brief
solution-focused skills. You are NOT a clinician: do not diagnose, prescribe, or claim to treat.

Crisis protocol (only if the user expresses imminent self-harm, intent to harm others, or
inability to remain safe — e.g., “I want to kill myself”, “I plan to overdose”, “I will hurt someone”):
- Brief empathy first.
- Ask directly if they are in immediate danger and if they have a plan.
- Encourage contacting local emergency services or crisis resources and provide them.
- Keep language simple, warm, and safety-focused.

If the user mentions depression/anxiety WITHOUT imminent-danger signals:
- DO NOT refuse.
- Validate their experience.
- Offer 2–4 concrete coping strategies or a short exercise (e.g., behavioral activation,
  thought record, grounding, paced breathing, values-aligned micro-step).
- Ask 1–2 gentle clarifying questions to personalize the support.
- Invite them to consider speaking with a professional for comprehensive care.
- Keep tone down-to-earth, non-judgmental, and practical.
`;

/* -------------------------------- F R A M E W O R K S -------------------------------- */
const THERAPEUTIC_FRAMEWORKS = `
Key Therapeutic Frameworks to draw from:

1) Cognitive Behavioral Therapy (CBT)
- Identify cognitive distortions; use thought-challenging; encourage behavioral activation;
  Socratic questioning; focus on here-and-now specifics.

2) Psychodynamic Lens
- Explore recurring themes, relationship patterns, defenses, and how past experiences might color the present.

3) Family Systems
- Consider roles, boundaries, cycles, and communication patterns in close relationships.

4) Solution-Focused (SFBT)
- Highlight exceptions/strengths; scaling questions; concrete next steps and small wins.

5) Mindfulness-Based Approaches
- Present-moment awareness; non-judgment; brief breath/grounding practices; self-compassion.

Response Structure (non-rigid):
1) Validate & Acknowledge
2) Select 1–2 relevant frameworks
3) Offer 2–4 practical skills or a brief exercise (step-by-step)
4) Ask 1–2 clarifying questions
5) Invite optional professional support (non-urgent)
`;

/* ---------------------------- C R I S I S  D E T E C T O R ---------------------------- */
const CRISIS_RE = /\b(kill myself|suicide|end my life|take my life|overdose|jump off|hang myself|shoot myself|hurt myself|hurt (?:him|her|them|someone)|homicide|i (?:have|got) a plan|i bought a (?:gun|rope|pills))\b/i;

/* ------------------------------- T Y P E S ------------------------------- */
interface ChatMessage {
  role: 'assistant' | 'user' | 'system' | 'tool';
  content: string;
}

/* -------------------------------- E D G E  H A N D L E R -------------------------------- */
Deno.serve(async (req) => {
  console.log('🚀 Chat function called', req.method);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

  try {
    /* --------- Env --------- */
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiKey   = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase configuration');
    if (!openaiKey) throw new Error('Missing OpenAI API key - set OPENAI_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    /* --------- Auth --------- */
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing auth token');

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) throw new Error('Invalid auth token');
    console.log('✅ User', user.id);

    /* --------- Parse body --------- */
    let payload: any;
    try {
      payload = await req.json();
    } catch {
      throw new Error('Invalid request body - must be JSON');
    }
    const { messages } = payload as { messages: ChatMessage[] };
    if (!Array.isArray(messages)) throw new Error('Invalid messages format - must be an array');

    /* --------- Rate limiting (best effort) --------- */
    try {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('chat_history')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('created_at', hourAgo);
      if (count && count > 50) throw new Error('Rate limit exceeded. Please try again later.');
      console.log('✅ RL ok, msgs last hour:', count || 0);
    } catch (e) {
      console.warn('⚠️ Rate limit check issue:', e);
    }

    /* --------- Safety steering --------- */
    const lastUserText = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
    const crisis = CRISIS_RE.test(lastUserText);

    const steeringMessage: ChatMessage = {
      role: 'system',
      content: crisis
        ? 'User may be in crisis. Follow the crisis protocol exactly—focus on safety, ask about immediate danger/plan, provide crisis resources.'
        : 'User is NOT in immediate danger. Provide supportive, skills-based guidance; do not refuse.'
    };

    /* --------- System prompt assembly (policy first) --------- */
    const systemBlock = `${MH_POLICY}\n\n${THERAPEUTIC_FRAMEWORKS}`;
    const systemMsg = messages.find(m => m.role === 'system');
    if (systemMsg) {
      systemMsg.content = `${systemBlock}\n\n${systemMsg.content}`;
    } else {
      messages.unshift({ role: 'system', content: systemBlock });
    }
    messages.unshift(steeringMessage);

    /* --------- OpenAI call --------- */
    console.log('🤖 Calling OpenAI…');
    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',          // modern, fast, cost-effective
        messages,
        temperature: 0.7,
        max_tokens: 700,
      }),
    });

    if (!openaiResp.ok) {
      const body = await openaiResp.text();
      console.error('❌ OpenAI error', openaiResp.status, openaiResp.statusText, body.slice(0, 400));
      if (openaiResp.status === 401) throw new Error('OpenAI API key is invalid or expired');
      if (openaiResp.status === 429) throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      if (openaiResp.status >= 500) throw new Error('OpenAI service is temporarily unavailable');
      throw new Error(`OpenAI API error: ${openaiResp.status} ${openaiResp.statusText}`);
    }

    const completion = await openaiResp.json();
    const aiMessage: ChatMessage | undefined = completion.choices?.[0]?.message;
    if (!aiMessage) throw new Error('No response from OpenAI');

    /* --------- Persist history (best effort) --------- */
    try {
      const { error: insErr } = await supabase
        .from('chat_history')
        .insert({
          user_id: user.id,
          messages: [...messages, aiMessage],
          is_crisis: crisis,
        });
      if (insErr) console.warn('⚠️ chat_history insert error', insErr);
    } catch (e) {
      console.warn('⚠️ chat_history insert threw', e);
    }

    /* --------- Done --------- */
    return new Response(JSON.stringify(aiMessage), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: any) {
    console.error('💥 Chat function error:', err);

    let status = 500;
    let msg = 'An unexpected error occurred';

    const txt = String(err?.message ?? err);
    if (txt.includes('OpenAI API key')) { status = 503; msg = 'AI service configuration error. Please contact support.'; }
    else if (txt.includes('rate limit')) { status = 429; msg = txt; }
    else if (txt.includes('auth'))      { status = 401; msg = 'Authentication failed. Please try logging in again.'; }
    else if (txt.includes('Invalid request body')) { status = 400; msg = txt; }

    return new Response(JSON.stringify({ error: msg, details: txt }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
