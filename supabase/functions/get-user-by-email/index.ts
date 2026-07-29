import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Validate request method
    if (req.method !== "POST") {
      throw new Error("Method not allowed");
    }

    // Get and validate environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    // Parse request body
    const body = await req.json().catch(() => null);
    if (!body?.email) {
      throw new Error("Email is required");
    }

    const email = body.email.trim().toLowerCase();

    // Query users
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      throw error;
    }

    // Check if user exists
    const userExists = data.users.some(user => 
      user.email?.toLowerCase() === email
    );

    return new Response(
      JSON.stringify({ exists: userExists }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error("Error:", error.message);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error"
      }),
      {
        status: error.status || 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});