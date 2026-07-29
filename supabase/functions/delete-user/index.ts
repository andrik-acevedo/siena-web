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

    // Get authorization header to verify the requesting user is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Verify the requesting user is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Invalid authorization token");
    }

    // Check if requesting user is admin
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminError || adminProfile?.role !== 'admin') {
      throw new Error("Admin access required");
    }

    // Parse request body
    const { userId } = await req.json();

    if (!userId) {
      throw new Error("Missing userId parameter");
    }

    console.log(`Admin ${user.email} requesting deletion of user ${userId}`);

    // Get user info before deletion for logging
    const { data: userToDelete, error: userError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(`User not found: ${userError.message}`);
    }

    // Delete user data in correct order (respecting foreign key constraints)
    const deletionSteps = [
      // Delete user activity logs
      { table: 'user_activity', column: 'user_id' },
      
      // Delete card views
      { table: 'card_views', column: 'user_id' },
      
      // Delete exercise views  
      { table: 'exercise_views', column: 'user_id' },
      
      // Delete quiz answers
      { table: 'quiz_answers', column: 'user_id' },
      
      // Delete chat history
      { table: 'chat_history', column: 'user_id' },
      
      // Delete daily message usage
      { table: 'daily_message_usage', column: 'user_id' },
      
      // Delete mood entries
      { table: 'moods', column: 'user_id' },
      
      // Delete sleep entries
      { table: 'sleep_entries', column: 'user_id' },
      
      // Delete medication logs (before medications)
      { table: 'medication_logs', column: 'user_id' },
      
      // Delete medications
      { table: 'medications', column: 'user_id' },
      
      // Delete date entries
      { table: 'date_entries', column: 'user_id' },
      
      // Delete boundaries
      { table: 'boundaries', column: 'user_id' },
      
      // Delete therapy sessions
      { table: 'therapy_sessions', column: 'user_id' },
      
      // Delete therapeutic homework
      { table: 'therapeutic_homework', column: 'user_id' },
      
      // Delete journal entries
      { table: 'journal_entries', column: 'user_id' },
      
      // Delete smart goals
      { table: 'smart_goals', column: 'user_id' },
      
      // Delete life balance history
      { table: 'life_balance_history', column: 'user_id' },
      
      // Delete intimacy wheel history
      { table: 'intimacy_wheel_history', column: 'user_id' },
      
      // Delete intimacy challenge entries
      { table: 'intimacy_challenge_entries', column: 'user_id' },
      
      // Delete internal world entries
      { table: 'internal_world_entries', column: 'user_id' },
      
      // Delete reconnection exercises (if user is premium)
      { table: 'reconnection_exercises', column: 'premium_user_id' },
      
      // Delete personal reconnection exercises
      { table: 'personal_reconnection_exercises', column: 'user_id' },
    ];

    let deletedRecords = 0;

    // Execute deletions
    for (const step of deletionSteps) {
      try {
        const { count, error } = await supabase
          .from(step.table)
          .delete()
          .eq(step.column, userId);

        if (error) {
          console.error(`Error deleting from ${step.table}:`, error);
          // Continue with other deletions even if one fails
        } else {
          console.log(`Deleted ${count || 0} records from ${step.table}`);
          deletedRecords += count || 0;
        }
      } catch (err) {
        console.error(`Failed to delete from ${step.table}:`, err);
        // Continue with other deletions
      }
    }

    // Delete from profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      throw new Error(`Failed to delete profile: ${profileError.message}`);
    }

    // Delete the auth user (this will cascade to related auth tables)
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      // Profile is already deleted, so we'll consider this a partial success
    }

    console.log(`Successfully deleted user ${userToDelete.email} (${userId})`);
    console.log(`Total records deleted: ${deletedRecords}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully deleted user ${userToDelete.email}`,
        deletedRecords,
        userInfo: {
          email: userToDelete.email,
          name: `${userToDelete.first_name} ${userToDelete.last_name}`
        }
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("Error deleting user:", error);
    
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