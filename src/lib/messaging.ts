export interface SendMessageOptions {
  phoneNumber: string;
  content: string;
}

export interface MessageResponse {
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
  code?: string;
  details?: string;
}

/**
 * Send SMS message using Twilio via Supabase Edge Function
 */
export async function sendSMS({ phoneNumber, content }: SendMessageOptions): Promise<MessageResponse> {
  try {
    console.log('📱 Sending SMS:', {
      phoneNumber,
      contentLength: content.length
    });

    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log('📱 Using formatted phone:', formattedPhone);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-twilio-message`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ phoneNumber: formattedPhone, content }),
      }
    );

    console.log('📱 Response status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('📱 Response data:', data);

    if (!response.ok) {
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        data
      });

      return {
        success: false,
        error: data.error || `Failed to send SMS: ${response.statusText}`,
        code: data.code,
        details: data.details
      };
    }

    console.log('Success response:', data);
    return {
      success: true,
      messageId: data.messageId,
      status: data.status
    };

  } catch (error) {
    console.error('📱 SMS sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS'
    };
  }
}

/**
 * Utility function to detect if a string is a phone number
 */
export function isPhoneNumber(input: string): boolean {
  // Remove all non-digit characters except + for international numbers
  const cleaned = input.replace(/[^\d+]/g, '');
  
  // Check for various phone number patterns:
  // - International: +1234567890 (11+ digits with +)
  // - US: 1234567890 (10 digits)
  // - US with country code: 11234567890 (11 digits starting with 1)
  const patterns = [
    /^\+\d{10,15}$/, // International format with +
    /^1?\d{10}$/,    // US format (10 digits or 11 with leading 1)
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Format phone number to E.164 format for Twilio
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  console.log('📞 Formatting phone number:', { original: phoneNumber, cleaned });
  
  // If it doesn't start with +, assume US number and add +1
  if (!cleaned.startsWith('+')) {
    // If it's 10 digits, add +1
    if (cleaned.length === 10) {
      cleaned = '+1' + cleaned;
    }
    // If it's 11 digits and starts with 1, add +
    else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      cleaned = '+' + cleaned;
    }
    // Otherwise add +1 assuming US
    else {
      cleaned = '+1' + cleaned;
    }
  }
  
  console.log('📞 Formatted phone number:', cleaned);
  return cleaned;
}

/**
 * Send invite message via SMS with pre-formatted content
 */
export async function sendInviteSMS(phoneNumber: string, inviteCode: string): Promise<MessageResponse> {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const inviteLink = `${window.location.origin}/invite?code=${inviteCode}`;
  
  const message = `🎉 You've been invited to join Siena!

Siena is a couples platform for internal world sharing that helps strengthen relationships through deeper understanding.

Click here to accept your invite:
${inviteLink}

Welcome to a new way of connecting with your partner! 💕`;

  return sendSMS({
    phoneNumber: formattedPhone,
    content: message
  });
} 