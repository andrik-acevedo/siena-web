import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

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
    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    const envStatus = {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasOpenaiKey: !!openaiKey,
      openaiKeyPreview: openaiKey ? `${openaiKey.substring(0, 10)}...` : 'missing'
    };

    console.log('Environment check:', envStatus);

    if (!openaiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OpenAI API key not configured in Supabase Edge Functions',
          envStatus 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Test OpenAI API connection
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `OpenAI API test failed: ${testResponse.status} ${testResponse.statusText}`,
          details: errorText,
          envStatus
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const models = await testResponse.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OpenAI API connection successful',
        modelCount: models.data?.length || 0,
        envStatus
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Test function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error',
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});