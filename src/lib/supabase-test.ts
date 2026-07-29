import { supabase } from './supabase';

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.warn('Supabase connection test failed (this is normal during development):', err);
    return { success: false, error: 'Connection test failed - this may be normal during development' };
  }
}