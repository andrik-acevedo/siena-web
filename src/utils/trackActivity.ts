import { supabase } from '../lib/supabase';

/**
 * Log a feature usage event.
 * Schema expected:
 *   user_id (text/uuid)  NOT NULL
 *   feature_type (text)  NOT NULL
 *   action_type (text)   NOT NULL  <-- required by your DB
 *   created_at (timestamptz)
 */
export async function trackActivity(
  userId: string,
  feature_type: string,
  action_type: string = 'view' // sensible default
) {
  if (!userId) return;

  const { error } = await supabase
    .from('user_activity')
    .insert([
      {
        user_id: userId,
        feature_type,
        action_type, // 👈 supply it
        created_at: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error('❌ trackActivity insert error:', error.message);
  } else {
    console.log('✅ Activity logged:', { feature_type, action_type });
  }
}
