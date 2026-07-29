// src/context/UserContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SubscriptionPlan } from '../types';
import { isAdminEmail } from '../lib/adminConfig';

// =====================
// Types
// =====================
interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  timezone: string;
  terms_agreed_at: string | null;
  subscription_status: string;
  subscription_tier?: SubscriptionPlan;
  subscription_tier_updated_at?: string;
  role: string;
  personal_client: boolean;
  trial_expiration: string | null;

  // Multi-user invite fields
  invite_code?: string;
  invited_by?: string | null;
  invited_users_count?: number;
  can_invite?: boolean;

  // Wellness identity & onboarding
  display_name?: string | null;
  avatar_emoji?: string | null;
  focus_area?: string | null;
  goal?: string | null;
  onboarding_completed?: boolean;
}

interface AuthState {
  status: 'initializing' | 'authenticated' | 'unauthenticated';
  user: UserData | null;
  error: Error | null;
}

type SignUpOptions = {
  phone?: string;
  sms_opt_in?: boolean; // we intentionally DO NOT write a non-existent column
  referralCode?: string; // optional explicit code
};

interface UserContextType {
  authState: AuthState;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, opts?: SignUpOptions) => Promise<{ user: any }>;
  signOut: () => Promise<void>;
  userData: UserData | null;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  acceptTerms: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const initialAuthState: AuthState = {
  status: 'initializing',
  user: null,
  error: null,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// =====================
// Retry helpers
// =====================
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, delay));
      return retryOperation(operation, retries - 1, delay);
    }
    throw error;
  }
}

// =====================
// Referral helpers
// =====================

/**
 * Read referral code, prioritizing explicit option then localStorage.
 * We DO NOT clear localStorage here (so you can inspect). You can clear
 * it client-side after successful signup if you want.
 */
function getReferralCodeFromContext(opts?: SignUpOptions): string | null {
  const explicit = opts?.referralCode?.trim();
  if (explicit) return explicit;
  try {
    const fromStorage = localStorage.getItem('referral_code');
    return fromStorage ? fromStorage.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Given a referral code, look up the affiliate (id + email).
 * Returns null if not found or inactive.
 */
async function resolveAffiliateForReferralCode(referralCode: string) {
  const { data, error } = await supabase
    .from('affiliates')
    .select('id, email, is_active, is_approved')
    .eq('referral_code', referralCode)
    .maybeSingle();

  if (error || !data) return null;
  if (data.is_active !== true || data.is_approved !== true) return null;
  return { affiliate_id: data.id as string, affiliate_email: data.email as string };
}

/**
 * Create an initial PENDING referral row so the Stripe webhook can later convert it.
 * If a row already exists for this user (same affiliate), we skip inserting.
 */
async function createPendingReferralRow(args: {
  user_id: string;
  affiliate_id: string;
  referral_code: string;
}) {
  const { user_id, affiliate_id, referral_code } = args;

  // Check if a referral row already exists for the user
  const { data: existing, error: checkErr } = await supabase
    .from('affiliate_referrals')
    .select('id, affiliate_id, status')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!checkErr && existing && existing.length > 0) {
    // If there's already a row with an affiliate or already converted, do nothing.
    const row = existing[0];
    if (row.affiliate_id || row.status === 'converted') return;
  }

  // Insert a pending row; we do not set amounts—Stripe webhook will.
  await supabase.from('affiliate_referrals').insert([
    {
      affiliate_id,
      user_id,
      referral_code,
      status: 'pending',
      signup_date: new Date().toISOString(),
    },
  ]);
}

/**
 * Optional: persist referral info to the user's profile
 * (purely informational/troubleshooting).
 */
async function stampProfileReferralTrail(args: {
  user_id: string;
  referral_code: string;
  affiliate_email: string;
}) {
  const { user_id, referral_code, affiliate_email } = args;
  await supabase
    .from('profiles')
    .update({
      referral_code,
      referred_by_email: affiliate_email, // column exists in your schema screenshots
    })
    .eq('id', user_id);
}

// =====================
// Invite helper (unchanged)
// =====================

// Reads an invite code stored in localStorage (e.g., when user visited /invite?code=XYZ)
// and links the current user to the inviter by setting profiles.invited_by.
async function applyInviteIfPresent(currentUserId: string) {
  if (!currentUserId) return;

  // If already linked, nothing to do
  const { data: me } = await supabase
    .from('profiles')
    .select('invited_by')
    .eq('id', currentUserId)
    .single();
  if (me?.invited_by) return;

  const code = (() => {
    try {
      return localStorage.getItem('invite_code');
    } catch {
      return null;
    }
  })();

  if (!code) return;

  // Find inviter by invite_code
  const { data: inviter, error: inviterErr } = await supabase
    .from('profiles')
    .select('id, invited_users_count')
    .eq('invite_code', code)
    .single();
  if (inviterErr || !inviter?.id) return;

  // Link account
  const { error: updErr } = await supabase
    .from('profiles')
    .update({ invited_by: inviter.id })
    .eq('id', currentUserId);
  if (updErr) return;

  // Optional: increment inviter's count
  await supabase
    .from('profiles')
    .update({ invited_users_count: (inviter.invited_users_count ?? 0) + 1 })
    .eq('id', inviter.id);

  // Clear code so we don't re-apply
  try {
    localStorage.removeItem('invite_code');
  } catch {
    /* ignore */
  }
}

// =====================
// Provider
// =====================
function UserProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loadUserProfile = useCallback(
    async (userId: string): Promise<UserData | null> => {
      try {
        const result = await retryOperation(async () => {
          return await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        });

        if (result.error) throw result.error;
        if (!result.data) return null;

        const row = result.data;

        const user: UserData = {
          id: row.id,
          first_name: row.first_name || '',
          last_name: row.last_name || '',
          email: row.email,
          phone: row.phone ?? null,
          timezone: row.timezone || 'America/New_York',
          terms_agreed_at: row.terms_agreed_at ?? null,
          subscription_status: row.subscription_status || 'inactive',
          subscription_tier: row.subscription_tier || 'basic',
          subscription_tier_updated_at: row.subscription_tier_updated_at ?? undefined,
          role: row.role || 'user',
          personal_client: Boolean(row.personal_client),
          trial_expiration: row.trial_expiration ?? null,

          invite_code: row.invite_code,
          invited_by: row.invited_by ?? null,
          invited_users_count: row.invited_users_count ?? 0,
          can_invite: Boolean(row.can_invite),

          display_name: row.display_name ?? null,
          avatar_emoji: row.avatar_emoji ?? null,
          focus_area: row.focus_area ?? null,
          goal: row.goal ?? null,
          onboarding_completed: Boolean(row.onboarding_completed),
        };

        return user;
      } catch (err: any) {
        const msg = err?.message || String(err);
        if (msg === 'Failed to fetch') {
          throw new Error(
            'Network error: Unable to connect to Supabase. Check your internet connection and Supabase configuration.'
          );
        } else if (msg.includes('CORS')) {
          throw new Error('CORS error: Add your app origin to Supabase CORS settings.');
        } else if (msg.includes('Invalid API key')) {
          throw new Error('Authentication error: Invalid Supabase API key.');
        } else if (msg.includes('JWT')) {
          throw new Error('Authentication error: Invalid or expired session.');
        } else if (msg.includes('permission denied')) {
          throw new Error('Permission error: Unable to access user profile.');
        }
        throw new Error(`Failed to load user profile: ${msg}`);
      }
    },
    []
  );

  // Initialize auth
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Skip on reset-password route
        if (window.location.pathname === '/reset-password') {
          setAuthState({ status: 'unauthenticated', user: null, error: null });
          return;
        }

        const {
          data: { session },
          error: sessionError,
        } = await retryOperation(() => supabase.auth.getSession());

        if (sessionError) {
          if (
            sessionError.message?.includes('Invalid Refresh Token') ||
            sessionError.message?.includes('Refresh Token Not Found')
          ) {
            await supabase.auth.signOut();
            setAuthState({ status: 'unauthenticated', user: null, error: null });
            return;
          }
          throw sessionError;
        }

        if (session?.user) {
          try {
            const profile = await loadUserProfile(session.user.id);
            if (profile) {
              setAuthState({ status: 'authenticated', user: profile, error: null });

              // Try invite linkage then refresh
              await applyInviteIfPresent(profile.id);
              const refreshed = await loadUserProfile(profile.id);
              if (refreshed) {
                setAuthState({ status: 'authenticated', user: refreshed, error: null });
              }
            } else {
              await supabase.auth.signOut();
              setAuthState({ status: 'unauthenticated', user: null, error: null });
            }
          } catch (e: any) {
            setAuthState({
              status: 'unauthenticated',
              user: null,
              error: e instanceof Error ? e : new Error('Failed to load profile'),
            });
          }
        } else {
          setAuthState({ status: 'unauthenticated', user: null, error: null });
        }
      } catch (error: any) {
        setAuthState({
          status: 'unauthenticated',
          user: null,
          error: error instanceof Error ? error : new Error('Authentication failed'),
        });
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (window.location.pathname === '/reset-password') return;

      if (event === 'SIGNED_IN' && session?.user) {
        loadUserProfile(session.user.id)
          .then(async (profile) => {
            if (profile) {
              setAuthState({ status: 'authenticated', user: profile, error: null });

              // Also try when user signs in from a fresh tab
              await applyInviteIfPresent(profile.id);
              const refreshed = await loadUserProfile(profile.id);
              if (refreshed) {
                setAuthState({ status: 'authenticated', user: refreshed, error: null });
              }
            }
          })
          .catch((error) => {
            setAuthState({
              status: 'unauthenticated',
              user: null,
              error: error instanceof Error ? error : new Error('Failed to load profile'),
            });
          });
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setAuthState({ status: 'unauthenticated', user: null, error: null });
        if (window.location.pathname !== '/reset-password') {
          navigate('/login');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, loadUserProfile]);

  // =====================
  // Public API
  // =====================
  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await retryOperation(() =>
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
      );
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const {
          data: { user },
          error,
        } = await retryOperation(() =>
          supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: password.trim(),
          })
        );
        if (error) throw error;
        if (!user) throw new Error('No user returned from sign in');
        // Profile load handled by onAuthStateChange
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Sign in failed'),
        }));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string, opts: SignUpOptions = {}) => {
      setIsLoading(true);
      try {
        // 1) Create auth user
        const {
          data: { user },
          error,
        } = await retryOperation(() =>
          supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password: password.trim(),
          })
        );
        if (error) throw error;
        if (!user) throw new Error('No user returned from signup');

        // 2) Prepare profile payload (WRITE ONLY COLUMNS THAT EXIST)
        const role = isAdminEmail(email.trim().toLowerCase()) ? 'admin' : 'user';
        const profilePayload: Record<string, any> = {
          id: user.id,
          first_name: '',
          last_name: '',
          email: email.trim().toLowerCase(),
          phone: opts.phone ? String(opts.phone).trim() : null,
          timezone: 'America/New_York',
          subscription_status: 'active',
          subscription_tier: 'basic',
          subscription_tier_updated_at: new Date().toISOString(),
          role,
          display_name: null,
          avatar_emoji: null,
          onboarding_completed: false,
        };

        // 3) Capture referral (from opts or localStorage) and resolve affiliate
        const referralCode = getReferralCodeFromContext(opts);
        let resolvedAffiliate:
          | { affiliate_id: string; affiliate_email: string }
          | null = null;

        if (referralCode) {
          resolvedAffiliate = await resolveAffiliateForReferralCode(referralCode);
          if (resolvedAffiliate) {
            // Stamp these extra, optional columns if present in your schema
            profilePayload.referral_code = referralCode;
            profilePayload.referred_by_email = resolvedAffiliate.affiliate_email;
          }
        }

        // 4) Insert profile
        const { error: profileError } = await retryOperation(() =>
          supabase.from('profiles').insert([profilePayload])
        );
        if (profileError) throw profileError;

        // 5) If affiliate resolved, create PENDING referral row (so webhook can convert)
        if (resolvedAffiliate) {
          await createPendingReferralRow({
            user_id: user.id,
            affiliate_id: resolvedAffiliate.affiliate_id,
            referral_code: referralCode!,
          });
        }

        // 6) Optional: also stamp referral trail after insert (safe)
        if (resolvedAffiliate && referralCode) {
          await stampProfileReferralTrail({
            user_id: user.id,
            referral_code: referralCode,
            affiliate_email: resolvedAffiliate.affiliate_email,
          });
        }

        // 7) Sign them in to establish a session (listener will load profile)
        const { error: signInError } = await retryOperation(() =>
          supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: password.trim(),
          })
        );
        if (signInError) throw signInError;

        return { user };
      } catch (error) {
        setAuthState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Sign up failed'),
        }));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await retryOperation(() => supabase.auth.signOut());
      if (error) throw error;
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Sign out failed'),
      }));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserData = useCallback(
    async (data: Partial<UserData>) => {
      if (!authState.user?.id) {
        throw new Error('No authenticated user');
      }
      try {
        const { error } = await retryOperation(() =>
          supabase.from('profiles').update(data).eq('id', authState.user!.id)
        );
        if (error) throw error;

        // Merge locally
        setAuthState((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, ...data } : prev.user,
        }));
      } catch (error) {
        console.error('Error updating user data:', error);
        throw error;
      }
    },
    [authState.user?.id]
  );

  const acceptTerms = useCallback(async () => {
    if (!authState.user?.id) {
      throw new Error('No authenticated user');
    }
    try {
      const ts = new Date().toISOString();
      const { error } = await retryOperation(() =>
        supabase.from('profiles').update({ terms_agreed_at: ts }).eq('id', authState.user!.id)
      );
      if (error) throw error;

      setAuthState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, terms_agreed_at: ts } : prev.user,
      }));
    } catch (error) {
      console.error('Error updating terms agreement:', error);
      throw error;
    }
  }, [authState.user?.id]);

  return (
    <UserContext.Provider
      value={{
        authState,
        isLoading,
        signIn,
        signUp,
        signOut,
        acceptTerms,
        resetPassword,
        userData: authState.user,
        updateUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}

export { UserProvider, useUser };
