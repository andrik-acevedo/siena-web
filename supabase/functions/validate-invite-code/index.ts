import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { invite_code } = await req.json();

    if (!invite_code) {
      throw new Error("Missing invite code");
    }

    console.log(`Validating invite code: ${invite_code}`);

    // Check if the invite code exists in the invites table
    const { data: inviteData, error: inviteError } = await supabase
      .from("invites")
      .select("*")
      .eq("code", invite_code)
      .eq("status", "pending")
      .single();

    if (inviteError) {
      console.error("Invite lookup error:", inviteError);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "Invalid invite code or invite has expired" 
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200, // Return 200 even for invalid codes
        }
      );
    }

    // If we found a valid invite, get the inviter's information
    const { data: inviterData, error: inviterError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .eq("id", inviteData.invited_by || "00000000-0000-0000-0000-000000000000")
      .maybeSingle();

    if (inviterError) {
      console.error("Inviter lookup error:", inviterError);
      // We can still proceed even if we can't find the inviter
    }

    return new Response(
      JSON.stringify({
        valid: true,
        invite: inviteData,
        inviter: inviterData || null
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: error.message || "An unexpected error occurred" 
      }),
      {
        status: 200, // Return 200 even for errors to handle them gracefully in the UI
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});