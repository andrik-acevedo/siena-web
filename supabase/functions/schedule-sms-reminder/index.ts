// Updated schedule-sms-reminder function with fixes

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const { phoneNumber, message, scheduledTime, sessionId } = await req.json();

    if (!phoneNumber || !message || !scheduledTime) {
      throw new Error('Missing required parameters');
    }

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid or expired token');
    }

    // Check if it's time to send the reminder (within 5 minutes of scheduled time)
    const now = new Date();
    const reminderTime = new Date(scheduledTime);
    const timeDiff = reminderTime.getTime() - now.getTime();
    
    console.log(`Processing reminder for session ${sessionId}, scheduled for ${scheduledTime}`);
    console.log(`Time difference: ${Math.round(timeDiff / 60000)} minutes`);
    
    // If the reminder time is now or in the past (within 5 minutes), send immediately
    if (timeDiff <= 5 * 60 * 1000) { // 5 minutes in milliseconds
      console.log(`Sending immediate SMS reminder for session ${sessionId}`);
      
      try {
        // Call the existing Twilio function to send the SMS
        const response = await fetch(`${supabaseUrl}/functions/v1/send-twilio-message`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber,
            content: message
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to send SMS');
        }

        console.log(`SMS reminder sent successfully for session ${sessionId}`);
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'SMS reminder sent successfully',
            messageId: result.messageId
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );

      } catch (smsError) {
        console.error('Error sending SMS:', smsError);
        throw new Error(`Failed to send SMS: ${smsError.message}`);
      }
    } else {
      // Store the reminder in the database to be processed later
      // Fixed: Use correct field names and include user_id
      const { error: insertError } = await supabase
        .from('scheduled_reminders')
        .insert([{
          user_id: user.id,           // Fixed: Add user_id
          session_id: sessionId,
          phone_number: phoneNumber,
          message: message,
          scheduled_for: scheduledTime,  // Fixed: Use scheduled_for instead of scheduled_time
          sent: false,                   // Fixed: Use sent boolean instead of status
          created_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('Error storing reminder:', insertError);
        throw new Error(`Failed to schedule reminder: ${insertError.message}`);
      }

      console.log(`Reminder scheduled for session ${sessionId} at ${scheduledTime}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'SMS reminder scheduled successfully',
          scheduledFor: scheduledTime
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

  } catch (error) {
    console.error('Error scheduling SMS reminder:', error);
    
    return new Response(
      JSON.stringify({
        success: false,  // Fixed: Add success: false for consistency
        error: error.message || 'Failed to schedule SMS reminder'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});