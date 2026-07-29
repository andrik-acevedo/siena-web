import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header to verify the requesting user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Verify the requesting user has permission (they should be the inviter)
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Invalid authorization token");
    }

    // Parse request body
    const { userId } = await req.json();

    if (!userId) {
      throw new Error("Missing userId parameter");
    }

    // Verify that the requesting user is the one who invited this user
    const { data: invitedUser, error: checkError } = await supabase
      .from('profiles')
      .select('invited_by, email')
      .eq('id', userId)
      .single();

    if (checkError) {
      throw new Error(`Failed to verify user: ${checkError.message}`);
    }

    if (invitedUser.invited_by !== user.id) {
      throw new Error("You can only disconnect users you have invited");
    }

    // Disconnect the invited user using service role privileges
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        invited_by: null,
        subscription_tier: 'basic',
        subscription_tier_updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (error) {
      throw new Error(`Failed to disconnect user: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully disconnected ${invitedUser.email}`,
        data: data[0]
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("Error disconnecting user:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unexpected error occurred" 
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});