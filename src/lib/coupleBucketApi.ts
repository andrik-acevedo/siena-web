// src/lib/coupleBucketApi.ts
import { supabase } from './supabase';

export type BucketStatus = 'Not started' | 'Planning' | 'In Progress' | 'Completed';

export type BucketItem = {
  id: string;
  owner_user_id: string;
  title: string;
  description: string | null;
  emotional_meaning: string | null;
  category: string | null;
  priority: number | null;
  status: BucketStatus;
  target_date: string | null;      // ISO date
  location: string | null;
  budget_estimate: number | null;
  is_shared: boolean;
  created_by: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BucketSettings = {
  owner_user_id: string;
  share_enabled: boolean;
  updated_at: string;
};

export async function getBucketSettings(ownerId: string): Promise<BucketSettings | null> {
  const { data, error } = await supabase
    .from('couple_bucket_settings')
    .select('*')
    .eq('owner_user_id', ownerId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function updateBucketSettings(
  ownerId: string,
  patch: Partial<Pick<BucketSettings, 'share_enabled'>>
): Promise<BucketSettings> {
  const payload = { owner_user_id: ownerId, ...patch };
  const { data, error } = await supabase
    .from('couple_bucket_settings')
    .upsert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as BucketSettings;
}

export async function listBucketItems(ownerId: string, opts?: { status?: BucketStatus[] }) {
  let q = supabase
    .from('couple_bucket_items')
    .select('*')
    .eq('owner_user_id', ownerId)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  if (opts?.status?.length) q = q.in('status', opts.status);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as BucketItem[];
}

export async function upsertBucketItem(item: Partial<BucketItem>): Promise<BucketItem> {
  const { data, error } = await supabase
    .from('couple_bucket_items')
    .upsert(item, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) throw error;
  return data as BucketItem;
}

export async function deleteBucketItem(id: string): Promise<void> {
  const { error } = await supabase.from('couple_bucket_items').delete().eq('id', id);
  if (error) throw error;
}
