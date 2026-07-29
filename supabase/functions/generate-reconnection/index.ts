import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { Configuration, OpenAIApi } from "npm:openai@4.28.0";

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
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey || !openaiApiKey) {
      throw new Error("Missing environment variables");
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Invalid authorization token");
    }

    // Parse request body
    const { relationshipId, entryDate } = await req.json();

    if (!relationshipId || !entryDate) {
      throw new Error("Missing required parameters");
    }

    // Get entries for both partners
    const { data: entries, error: entriesError } = await supabase
      .from("internal_world_entries")
      .select("*")
      .eq("relationship_id", relationshipId)
      .eq("entry_date", entryDate);

    if (entriesError) {
      throw entriesError;
    }

    if (!entries || entries.length < 2) {
      throw new Error("Both partners must submit entries before generating a reconnection exercise");
    }

    // Determine which entry belongs to which partner
    const partnerAEntry = entries[0];
    const partnerBEntry = entries[1];

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: openaiApiKey,
    });
    const openai = new OpenAIApi(configuration);

    // Prepare the prompt
    const prompt = `
      I need to create a reconnection exercise for a couple based on their individual journal entries.
      
      Partner A's entries:
      - Feelings about partner: ${partnerAEntry.feelings_about_partner}
      - Thoughts about relationship: ${partnerAEntry.thoughts_about_relationship}
      - Thoughts about other parts of life: ${partnerAEntry.thoughts_about_life}
      - Feelings about other parts of life: ${partnerAEntry.feelings_about_life}
      
      Partner B's entries:
      - Feelings about partner: ${partnerBEntry.feelings_about_partner}
      - Thoughts about relationship: ${partnerBEntry.thoughts_about_relationship}
      - Thoughts about other parts of life: ${partnerBEntry.thoughts_about_life}
      - Feelings about other parts of life: ${partnerBEntry.feelings_about_life}
      
      Please create:
      1. A compassionate summary of Partner A's entries (2-3 sentences)
      2. A compassionate summary of Partner B's entries (2-3 sentences)
      3. Shared themes you notice between both partners (3-4 bullet points)
      4. A reconnection exercise with 2-3 specific prompts for them to discuss together
      5. A brief mindfulness moment they can practice together (1-2 paragraphs)
      
      Format your response as follows:
      
      PARTNER_A_SUMMARY: [summary]
      PARTNER_B_SUMMARY: [summary]
      SHARED_THEMES: [themes]
      RECONNECTION_PROMPTS: [prompts]
      MINDFULNESS_MOMENT: [mindfulness exercise]
    `;

    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a compassionate couples therapist who helps partners understand each other better and reconnect."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    const content = completion.data.choices[0]?.message?.content || "";

    // Parse the response
    const partnerASummary = content.match(/PARTNER_A_SUMMARY: ([\s\S]*?)(?=PARTNER_B_SUMMARY:)/)?.[1]?.trim() || "";
    const partnerBSummary = content.match(/PARTNER_B_SUMMARY: ([\s\S]*?)(?=SHARED_THEMES:)/)?.[1]?.trim() || "";
    const sharedThemes = content.match(/SHARED_THEMES: ([\s\S]*?)(?=RECONNECTION_PROMPTS:)/)?.[1]?.trim() || "";
    const reconnectionPrompts = content.match(/RECONNECTION_PROMPTS: ([\s\S]*?)(?=MINDFULNESS_MOMENT:)/)?.[1]?.trim() || "";
    const mindfulnessMoment = content.match(/MINDFULNESS_MOMENT: ([\s\S]*?)$/)?.[1]?.trim() || "";

    // Create the reconnection exercise
    const { data: exercise, error: exerciseError } = await supabase
      .from("reconnection_exercises")
      .insert([
        {
          relationship_id: relationshipId,
          entry_date: entryDate,
          partner_a_summary: partnerASummary,
          partner_b_summary: partnerBSummary,
          shared_themes: sharedThemes,
          reconnection_prompts: reconnectionPrompts,
          mindfulness_moment: mindfulnessMoment
        }
      ])
      .select();

    if (exerciseError) {
      throw exerciseError;
    }

    return new Response(
      JSON.stringify({ success: true, data: exercise[0] }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    
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