// src/lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Deliberately does NOT throw when the variables are absent.
//
// The website is static and mounts no auth providers, so nothing on it should
// reach Supabase at all. This module survives only as a dependency of the
// unrouted former web-app components. Throwing at import time meant a missing
// env var took the whole site down, including the legal pages, so the build
// could not be made env-free. Placeholders keep createClient happy; any call
// through this client would fail at request time, which is the correct
// outcome for a surface that should not be making requests.
if (!supabaseUrl || !supabaseAnonKey) {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  console.warn(
    `[supabase] Missing ${missing.join(', ')}. The website does not use a ` +
      'backend; accounts live in the Siena mobile app.',
  );
}

/** Avoid blowing up if window/localStorage aren’t available */
const safeStorage: Storage | undefined =
  typeof window !== 'undefined' && window?.localStorage
    ? window.localStorage
    : undefined;

/** Masked console helper (dev only) */
const dev = import.meta.env.DEV;
const mask = (s?: string) => (s ? `${s.slice(0, 6)}…${s.slice(-4)}` : 'undefined');

if (dev) {
  // Don’t log the full anon key; keep it masked
  console.log('Supabase config ✅', {
    urlPresent: !!supabaseUrl,
    anonKeyMasked: mask(supabaseAnonKey),
  });
}

/** Optional fetch wrapper: logs minimal details in dev, never secrets */
const wrappedFetch: typeof fetch = async (url, options = {}) => {
  if (dev) {
    const method = (options as RequestInit)?.method || 'GET';
    const hasAuth =
      !!(options as RequestInit)?.headers &&
      !!(options as Record<string, any>).headers?.Authorization;
    console.log('🌐 Supabase fetch', { url: String(url), method, hasAuth });
  }

  try {
    const res = await fetch(url, options as RequestInit);
    return res;
  } catch (error: any) {
    if (dev) {
      console.error('❌ Network error calling Supabase', {
        url: String(url),
        message: error?.message,
      });
    }
    throw error;
  }
};

/** Create the browser client */
// Placeholders so createClient never receives undefined now that the guard
// above warns instead of throwing. These are unreachable hosts on purpose.
export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? 'https://unconfigured.invalid',
  supabaseAnonKey ?? 'unconfigured',
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Use localStorage only if it exists; otherwise fall back to memory storage.
    storage: safeStorage,
    debug: dev,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
      'Content-Type': 'application/json',
    },
  },
  fetch: wrappedFetch,
});

/** Smoke-test the connection (dev only) without spamming production logs */
if (dev) {
  supabase.auth
    .getSession()
    .then(({ error }) => {
      if (error) {
        console.error('Supabase connection test failed:', error);
      } else {
        console.log('✅ Supabase connection successful');
      }
    })
    .catch((error) => {
      console.error('❌ Supabase connection test error:', error);
    });
}

/* ------------------------------
   Convenience helpers (optional)
   ------------------------------ */

/** Get the current user (null if not logged in) */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

/** Load the public profile (display_name + emoji) for the logged-in user */
export async function getMyPublicProfile() {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, avatar_emoji')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return null;
  return data ?? null;
}
