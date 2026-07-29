// lib/coupleActivityApi.ts
import { supabase } from './supabase';

/* ===================== Types ===================== */

export type CoupleActivityType = {
  id: string;
  owner_user_id: string;
  name: string;
  color: string;            // solid hex (used for dots/chips)
  created_at: string;
};

export type CoupleActivityLog = {
  id: string;
  owner_user_id: string;
  activity_type_id: string;
  activity_date: string; // yyyy-mm-dd
  count: number | null;
  intensity: number | null;
  notes: string | null;
  created_by_user_id: string | null;
  created_at: string;
};

export type CoupleSettings = {
  owner_user_id: string;
  /** canonical prop used in UI/code */
  share_enabled: boolean;
  /** table only has updated_at (no created_at in your screenshot) */
  updated_at: string | null;
};

/* ===================== Helpers ===================== */

/** Use inviter as the shared "owner", or self if not invited */
export function getEffectiveOwnerId(
  user?: { id?: string; invited_by?: string | null } | null
): string | null {
  if (!user?.id) return null;
  return (user.invited_by as string) || (user.id as string);
}

/* unwrap supabase error -> Error */
function throwIfError(e: any): asserts e is null {
  if (e) {
    console.error('Supabase error:', e);
    throw new Error(e?.message || e?.hint || 'Database request failed');
  }
}

/* ===================== Activity TYPES ===================== */

/** Manual upsert by (owner_user_id, name) so we don't require a unique index */
export async function upsertType(input: {
  owner_user_id: string;
  name: string;
  color: string;            // solid hex
}): Promise<CoupleActivityType> {
  try {
    const { data: found, error: selErr } = await supabase
      .from('couple_activity_types')
      .select('*')
      .eq('owner_user_id', input.owner_user_id)
      .eq('name', input.name)
      .maybeSingle();
    throwIfError(selErr);

    if (found) {
      const { data, error } = await supabase
        .from('couple_activity_types')
        .update({ color: input.color })
        .eq('id', found.id)
        .select()
        .single();
      throwIfError(error);
      return data as CoupleActivityType;
    }

    const { data, error } = await supabase
      .from('couple_activity_types')
      .insert(input)
      .select()
      .single();
    throwIfError(error);
    return data as CoupleActivityType;
  } catch (err) {
    console.error('Error in upsertType:', err, input);
    throw err;
  }
}

export async function listTypes(ownerUserId: string): Promise<CoupleActivityType[]> {
  try {
    const { data, error } = await supabase
      .from('couple_activity_types')
      .select('*')
      .eq('owner_user_id', ownerUserId)
      .order('name', { ascending: true });
    throwIfError(error);
    return (data ?? []) as CoupleActivityType[];
  } catch (err) {
    console.error('Error in listTypes:', err, ownerUserId);
    throw err;
  }
}

export async function updateActivityType(
  id: string,
  patch: Partial<Pick<CoupleActivityType, 'name' | 'color'>>
): Promise<CoupleActivityType> {
  try {
    const { data, error } = await supabase
      .from('couple_activity_types')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    throwIfError(error);
    return data as CoupleActivityType;
  } catch (err) {
    console.error('Error in updateActivityType:', err, id, patch);
    throw err;
  }
}

export async function deleteActivityType(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('couple_activity_types').delete().eq('id', id);
    throwIfError(error);
  } catch (err) {
    console.error('Error in deleteActivityType:', err, id);
    throw err;
  }
}

/* ===================== Activity LOGS ===================== */

/** Manual upsert by (owner_user_id, activity_type_id, activity_date) */
export async function upsertLog(input: {
  owner_user_id: string;
  activity_type_id: string;
  activity_date: string; // yyyy-mm-dd
  count?: number | null;
  intensity?: number | null;
  notes?: string | null;
  created_by_user_id: string;
}): Promise<CoupleActivityLog> {
  try {
    const { data: found, error: selErr } = await supabase
      .from('couple_activity_logs')
      .select('*')
      .eq('owner_user_id', input.owner_user_id)
      .eq('activity_type_id', input.activity_type_id)
      .eq('activity_date', input.activity_date)
      .maybeSingle();
    throwIfError(selErr);

    if (found) {
      const { data, error } = await supabase
        .from('couple_activity_logs')
        .update({
          count: input.count ?? found.count ?? 1,
          intensity: input.intensity ?? found.intensity ?? null,
          notes: input.notes ?? found.notes ?? null,
          created_by_user_id: input.created_by_user_id,
        })
        .eq('id', found.id)
        .select()
        .single();
      throwIfError(error);
      return data as CoupleActivityLog;
    }

    const { data, error } = await supabase
      .from('couple_activity_logs')
      .insert({
        owner_user_id: input.owner_user_id,
        activity_type_id: input.activity_type_id,
        activity_date: input.activity_date,
        count: input.count ?? 1,
        intensity: input.intensity ?? null,
        notes: input.notes ?? null,
        created_by_user_id: input.created_by_user_id,
      })
      .select()
      .single();
    throwIfError(error);
    return data as CoupleActivityLog;
  } catch (err) {
    console.error('Error in upsertLog:', err, input);
    throw err;
  }
}

export async function listLogs(
  ownerUserId: string,
  fromISO: string,
  toISO: string
): Promise<CoupleActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from('couple_activity_logs')
      .select('*')
      .eq('owner_user_id', ownerUserId)
      .gte('activity_date', fromISO)
      .lte('activity_date', toISO)
      .order('activity_date', { ascending: true });
    throwIfError(error);
    return (data ?? []) as CoupleActivityLog[];
  } catch (err) {
    console.error('Error in listLogs:', err, ownerUserId, fromISO, toISO);
    throw err;
  }
}

export async function deleteActivityLog(logId: string): Promise<void> {
  try {
    const { error } = await supabase.from('couple_activity_logs').delete().eq('id', logId);
    throwIfError(error);
  } catch (err) {
    console.error('Error in deleteActivityLog:', err, logId);
    throw err;
  }
}

/* ===================== SETTINGS (DB has share_with_partner) ===================== */
/* Map DB <-> UI:
 *   DB column: share_with_partner (bool)
 *   UI/code : share_enabled (bool)
 */

export async function getCoupleSettings(ownerUserId: string): Promise<CoupleSettings> {
  try {
    const { data, error } = await supabase
      .from('couple_activity_settings')
      .select('owner_user_id, share_with_partner, updated_at')
      .eq('owner_user_id', ownerUserId)
      .maybeSingle();
    throwIfError(error);

    // If no row, create one with defaults
    if (!data) {
      const ins = await supabase
        .from('couple_activity_settings')
        .insert({ owner_user_id: ownerUserId, share_with_partner: false })
        .select('owner_user_id, share_with_partner, updated_at')
        .single();
      throwIfError(ins.error);
      return {
        owner_user_id: ins.data!.owner_user_id,
        share_enabled: !!ins.data!.share_with_partner,
        updated_at: ins.data!.updated_at ?? null,
      };
    }

    return {
      owner_user_id: data.owner_user_id,
      share_enabled: !!data.share_with_partner,
      updated_at: data.updated_at ?? null,
    };
  } catch (err) {
    console.error('Error in getCoupleSettings:', err, ownerUserId);
    throw err;
  }
}

export async function updateCoupleSettings(
  ownerUserId: string,
  patch: Partial<Pick<CoupleSettings, 'share_enabled'>>
): Promise<CoupleSettings> {
  try {
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (typeof patch.share_enabled === 'boolean') {
      updatePayload.share_with_partner = patch.share_enabled;
    }

    const { data, error } = await supabase
      .from('couple_activity_settings')
      .upsert(
        { owner_user_id: ownerUserId, ...updatePayload },
        { onConflict: 'owner_user_id' }
      )
      .select('owner_user_id, share_with_partner, updated_at')
      .single();
    throwIfError(error);

    return {
      owner_user_id: data.owner_user_id,
      share_enabled: !!data.share_with_partner,
      updated_at: data.updated_at ?? null,
    };
  } catch (err) {
    console.error('Error in updateCoupleSettings:', err, ownerUserId, patch);
    throw err;
  }
}
