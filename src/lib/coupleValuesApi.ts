// src/lib/coupleValuesApi.ts
import { supabase } from './supabase';
import { getEffectiveOwnerId } from './coupleActivityApi'; // reuse inviter-or-self helper

/* ===================== Types ===================== */

export type PersistIds = {
  'Available Values': string[];
  'Important': string[];
  'Very Important': string[];
  'Core Values': string[];
};

export type CoupleValuesSettings = {
  owner_user_id: string;
  share_enabled: boolean;
  updated_at: string; // timestamptz
};

export type CoupleValuesBoard = {
  owner_user_id: string;
  columns: PersistIds;
  updated_at: string; // timestamptz
};

/* ===================== Internals ===================== */

function throwIfError(e: any): asserts e is null {
  if (e) {
    // prefer PostgREST message/hint/details when present
    const msg =
      e?.message ||
      e?.hint ||
      e?.details ||
      (typeof e === 'string' ? e : 'Database request failed');
    // eslint-disable-next-line no-console
    console.error('Supabase error:', e);
    throw new Error(msg);
  }
}

/**
 * Some projects already have an older table called `shared_values_board`.
 * If you kept that name, create a *view* called `couple_values_board` that
 * selects from it. Then this file can always target `couple_values_board`.
 *
 *   create or replace view public.couple_values_board as
 *   select owner_user_id, columns, updated_at from public.shared_values_board;
 */

/* ===================== Settings ===================== */

/** Get settings; if row doesn't exist, return null (caller can decide defaults). */
export async function getCoupleValuesSettings(
  owner_user_id: string
): Promise<CoupleValuesSettings | null> {
  const { data, error } = await supabase
    .from('couple_values_settings')
    .select('owner_user_id, share_enabled, updated_at')
    .eq('owner_user_id', owner_user_id)
    .maybeSingle();
  throwIfError(error);
  return (data as CoupleValuesSettings) ?? null;
}

/** Upsert settings (owner controls). Returns the saved row. */
export async function updateCoupleValuesSettings(
  owner_user_id: string,
  patch: Partial<Pick<CoupleValuesSettings, 'share_enabled'>>
): Promise<CoupleValuesSettings> {
  const { data, error } = await supabase
    .from('couple_values_settings')
    .upsert(
      {
        owner_user_id,
        ...('share_enabled' in patch ? { share_enabled: !!patch.share_enabled } : {}),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'owner_user_id' }
    )
    .select('owner_user_id, share_enabled, updated_at')
    .single();
  throwIfError(error);
  return data as CoupleValuesSettings;
}

/** Convenience: ensure a settings row exists (default share_enabled=false). */
export async function ensureCoupleValuesSettings(
  owner_user_id: string
): Promise<CoupleValuesSettings> {
  const existing = await getCoupleValuesSettings(owner_user_id);
  if (existing) return existing;
  return updateCoupleValuesSettings(owner_user_id, { share_enabled: false });
}

/* ===================== Board ===================== */

/** Get the board for an owner; returns null if absent. */
export async function getCoupleValuesBoard(
  owner_user_id: string
): Promise<CoupleValuesBoard | null> {
  const { data, error } = await supabase
    .from('couple_values_board')
    .select('owner_user_id, columns, updated_at')
    .eq('owner_user_id', owner_user_id)
    .maybeSingle();
  throwIfError(error);
  return (data as CoupleValuesBoard) ?? null;
}

/** Upsert board for owner. */
export async function saveCoupleValuesBoard(
  owner_user_id: string,
  columns: PersistIds
): Promise<CoupleValuesBoard> {
  const { data, error } = await supabase
    .from('couple_values_board')
    .upsert(
      {
        owner_user_id,
        columns,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'owner_user_id' }
    )
    .select('owner_user_id, columns, updated_at')
    .single();
  throwIfError(error);
  return data as CoupleValuesBoard;
}

/**
 * Subscribe to realtime changes for an owner's board.
 * Returns an unsubscribe function you should invoke on unmount.
 */
export function subscribeCoupleValuesBoard(
  owner_user_id: string,
  onChange: (next: CoupleValuesBoard) => void
): () => void {
  const channel = supabase
    .channel(`couple_values_board_${owner_user_id}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'couple_values_board', filter: `owner_user_id=eq.${owner_user_id}` },
      (payload) => {
        const next = (payload.new ?? payload.record) as CoupleValuesBoard | undefined;
        if (next) onChange(next);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

/* ===================== Utilities / Re-exports ===================== */

/**
 * Re-export the "inviter-or-self" helper so pages can do:
 *   const ownerId = getEffectiveOwnerId(userData);
 */
export { getEffectiveOwnerId };

/**
 * Small helper for callers that need to derive the shared owner id
 * safely from a possibly-null user object.
 */
export function resolveOwnerId(user?: { id?: string; invited_by?: string | null } | null): string | null {
  try {
    return getEffectiveOwnerId(user);
  } catch {
    return null;
  }
}
