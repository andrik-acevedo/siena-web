import { supabase } from './supabase';

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
  timestamp?: Date;
}

export async function sendChatMessage(messages: Message[]) {
  try {
    // Get user session for authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('Auth error:', authError);
      throw new Error('Authentication failed. Please try logging in again.');
    }
    
    if (!session?.access_token) {
      throw new Error('No active session. Please log in to continue.');
    }

    // Filter out timestamp property before sending
    const cleanMessages = messages.map(({ role, content }) => ({
      role,
      content
    }));

    console.log('🚀 Attempting chat request to Supabase Edge Function');
    console.log('📍 Using URL:', `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`);
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        messages: cleanMessages
      }),
    });
    
    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('❌ Chat API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500) // Limit log size
      });
      
      if (response.status === 404) {
        throw new Error('Chat service not found. Please contact support.');
      } else if (response.status === 401) {
        throw new Error('Authentication failed. Please try logging in again.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (response.status === 503) {
        throw new Error('AI service is temporarily unavailable. Please check your OpenAI API key configuration.');
      } else if (response.status === 500) {
        throw new Error('Chat service encountered an error. Please try again or contact support if the issue persists.');
      } else {
        throw new Error(`Chat service error: ${response.statusText}`);
      }
    }

    const aiResponse = await response.json();
    console.log('✅ Successful response received');

    if (!aiResponse) {
      throw new Error('No response received from AI therapist');
    }

    return aiResponse;
    
  } catch (error) {
    console.error('💥 Error in sendChatMessage:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
}

export async function getChatHistory() {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('Auth error:', authError);
      throw new Error('Authentication failed. Please try logging in again.');
    }
    
    if (!session?.user?.id) {
      throw new Error('No active session. Please log in to continue.');
    }

    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to fetch chat history. Please try again.');
    }

    return data || [];
  } catch (error) {
    console.error('Error getting chat history:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching chat history.');
  }
}