// src/lib/coupleRadarApi.ts
import { supabase } from './supabase';

/** Types *************************************************************/

export type Score = { id: string; score: number };

export type HistoryRow = {
  id?: string;
  user_id: string;
  date: string;      // YYYY-MM-DD (local)
  scores: Score[];
  created_at?: string;
};

/** Date helpers ******************************************************/

// Local calendar date (prevents "yesterday" when you're behind UTC)
export function localYYYYMMDD(d = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** SETTINGS **********************************************************/

export async function getCoupleRadarSettings(user_id: string) {
  try {
    const { data, error } = await supabase
      .from('couple_radar_settings')
      .select('user_id, share_enabled, updated_at')
      .eq('user_id', user_id)
      .maybeSingle();

    if (error) throw error;

    // If no row, create a default OFF row so UI can proceed
    if (!data) {
      const { data: inserted, error: upErr } = await supabase
        .from('couple_radar_settings')
        .insert({ user_id, share_enabled: false })
        .select('user_id, share_enabled, updated_at')
        .maybeSingle();
      if (upErr) throw upErr;
      return inserted;
    }
    return data;
  } catch (e) {
    console.error('[Radar] getCoupleRadarSettings error', (e as any)?.message ?? e);
    return null;
  }
}

export async function updateCoupleRadarSettings(
  user_id: string,
  patch: { share_enabled?: boolean }
) {
  try {
    const { data, error } = await supabase
      .from('couple_radar_settings')
      .upsert({ user_id, ...patch }, { onConflict: 'user_id' })
      .select('user_id, share_enabled, updated_at')
      .maybeSingle();
    if (error) throw error;
    return data!;
  } catch (e) {
    console.error('[Radar] updateCoupleRadarSettings error', (e as any)?.message ?? e);
    throw e;
  }
}

/** HISTORY (self) ****************************************************/

export async function getIntimacyHistory(user_id: string): Promise<HistoryRow[]> {
  try {
    const { data, error } = await supabase
      .from('intimacy_wheel_history')
      .select('id, user_id, date, scores, created_at')
      .eq('user_id', user_id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false, nullsFirst: false });
    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.error('[Radar] getIntimacyHistory error', (e as any)?.message ?? e);
    return [];
  }
}

export async function getLatestIntimacyEntry(user_id: string): Promise<HistoryRow | null> {
  try {
    const { data, error } = await supabase
      .from('intimacy_wheel_history')
      .select('id, user_id, date, scores, created_at')
      .eq('user_id', user_id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ?? null;
  } catch (e) {
    console.error('[Radar] getLatestIntimacyEntry error', (e as any)?.message ?? e);
    return null;
  }
}

export async function insertIntimacyEntry(user_id: string, scores: Score[]): Promise<HistoryRow> {
  console.log('=== RADAR DIAGNOSTIC START ===');
  console.log('[Radar] Using database function to avoid RLS recursion');
  console.log('[Radar] Scores to save:', scores);
  
  try {
    // Use the database function which bypasses RLS issues
    const { data, error } = await supabase
      .rpc('upsert_intimacy_entry', { p_scores: scores })
      .single();

    console.log('[Radar] Function response:', { data, error });

    if (error) {
      console.error('[Radar] ❌ Function call failed:', JSON.stringify(error, null, 2));
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from upsert function');
    }

    console.log('[Radar] ✅ Successfully saved and retrieved record');
    console.log('=== RADAR DIAGNOSTIC END ===');
    return data as HistoryRow;

  } catch (e: any) {
    console.error('[Radar] ❌ insertIntimacyEntry error:', e?.message ?? e);
    console.error('[Radar] Full error object:', JSON.stringify(e, null, 2));
    console.log('=== RADAR DIAGNOSTIC END ===');
    throw e;
  }
}

export async function deleteIntimacyEntry(user_id: string, entryId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('intimacy_wheel_history')
      .delete()
      .eq('id', entryId)
      .eq('user_id', user_id);
    if (error) throw error;
  } catch (e) {
    console.error('[Radar] deleteIntimacyEntry error', (e as any)?.message ?? e);
    throw e;
  }
}

/** PARTNER overlay ****************************************************/
/**
 * Returns the partner's latest row when RLS allows it:
 * - Your partner relationship exists in public.profiles (inviter/invited_by)
 * - BOTH users have share_enabled = true in couple_radar_settings
 * - The partner has at least one entry
 * RLS policies on the table/view must implement that logic.
 */
export async function getPartnerLatestIntimacy(my_user_id: string): Promise<HistoryRow | null> {
  console.log('[Radar] 🔍 getPartnerLatestIntimacy called for user:', my_user_id);
  
  try {
    // Query the base table - RLS policies will handle permissions
    const { data, error } = await supabase
      .from('intimacy_wheel_history')
      .select('id, user_id, date, scores, created_at')
      .neq('user_id', my_user_id) // Not my own data
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('[Radar] Partner query result:', { data, error, hasData: !!data });

    if (error) {
      console.error('[Radar] ❌ getPartnerLatestIntimacy error:', error);
      return null;
    }

    if (data) {
      console.log('[Radar] ✅ Found partner data:', data.date);
    } else {
      console.log('[Radar] ⚠️ No partner data found (RLS may be blocking or partner has no entries)');
    }

    return data;
  } catch (e) {
    console.error('[Radar] ❌ getPartnerLatestIntimacy exception:', (e as any)?.message ?? e);
    return null;
  }
}

/** REALTIME subscriptions ********************************************/

export function subscribeUserLatest(user_id: string, cb: (row: HistoryRow | null) => void) {
  const channel = supabase
    .channel(`radar:self:${user_id}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'intimacy_wheel_history', filter: `user_id=eq.${user_id}` },
      async () => {
        const latest = await getLatestIntimacyEntry(user_id);
        cb(latest);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export function subscribePartnerLatest(my_user_id: string, cb: (row: HistoryRow | null) => void) {
  // listen to any partner change we are allowed to see; safest is to just refetch via helper on any table change
  const channel = supabase
    .channel(`radar:partner:${my_user_id}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'intimacy_wheel_history' },
      async () => {
        const latest = await getPartnerLatestIntimacy(my_user_id);
        cb(latest);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}