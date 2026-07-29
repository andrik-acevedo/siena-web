// src/components/intimacy/IntimacyBuilders.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Heart,
  Clock,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Smile,
  Frown,
  Meh,
  Brain,
  Sparkles,
  Zap,
  MessageSquare,
  Flame,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Button from '../ui/Button';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { supabase } from '../../lib/supabase';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';
import { format, addDays, isSameDay } from 'date-fns';

/* =========================
   Types
========================= */

type IntimacyCategory =
  | 'physical'
  | 'sexual'
  | 'energetic'
  | 'emotional'
  | 'intellectual'
  | 'spiritual';

interface ChallengeEntry {
  id?: string;
  user_id: string;
  day: number;
  date: string;
  category: IntimacyCategory;
  prompt: string;
  reflection: string;
  shared_with_partner: boolean;
  reaction?: 'love' | 'good' | 'neutral' | 'difficult';
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ChallengeSession {
  id: string;
  user_id: string;
  category: IntimacyCategory;
  status: 'active' | 'completed' | 'abandoned';
  current_day: number;
  started_at: string;
  ended_at: string | null;
}

interface CategoryInfo {
  name: string;
  icon: () => React.ReactNode;
  description: string;
  color: string; // gradient for the colored category chip
}

/* =========================
   Category + Prompt helpers
========================= */

const CATEGORIES: Record<IntimacyCategory, CategoryInfo> = {
  physical: {
    name: 'Physical Intimacy',
    icon: () => <Heart className="h-6 w-6" />,
    description: 'Non-sexual touch and physical closeness that communicates care',
    color: 'from-pink-500 to-pink-700',
  },
  sexual: {
    name: 'Sexual Intimacy',
    icon: () => <Flame className="h-6 w-6" />,
    description: 'Pleasure, safety, and mutual desire in your sexual relationship',
    color: 'from-red-500 to-red-700',
  },
  energetic: {
    name: 'Energetic Intimacy',
    icon: () => <Zap className="h-6 w-6" />,
    description: 'Bonding through play, fun, and shared adventures',
    color: 'from-purple-500 to-purple-700',
  },
  emotional: {
    name: 'Emotional Intimacy',
    icon: () => <MessageSquare className="h-6 w-6" />,
    description: 'Sharing your inner world and feeling seen and accepted',
    color: 'from-blue-500 to-blue-700',
  },
  intellectual: {
    name: 'Intellectual Intimacy',
    icon: () => <Brain className="h-6 w-6" />,
    description: 'Connection through thoughts, ideas, and curiosity',
    color: 'from-green-500 to-green-700',
  },
  spiritual: {
    name: 'Spiritual Intimacy',
    icon: () => <Sparkles className="h-6 w-6" />,
    description: 'Shared meaning, values, and presence',
    color: 'from-yellow-500 to-yellow-700',
  },
};

const TOTAL_DAYS = 30;

/**
 * You likely already have long, curated prompt arrays.
 * If so, feel free to replace `getPromptForDay` with your own PROMPTS lookup.
 * This fallback keeps the file self-contained and compilable.
 */
const SEED_PROMPTS: Record<IntimacyCategory, string[]> = {
  emotional: [
    'Share one feeling word and one need from today.',
    'Do a 5-minute reflection swap: “What landed for me was…”',
    'Name a recent micro-moment of connection you appreciated.',
    'Practice validation: one shares, one reflects—then switch.',
    'Tell a childhood story you haven’t shared before.',
    'Offer a 60-second appreciation monologue.',
    'Do a “check-in” using only feeling words.',
    'Name a fear you’re willing to say out loud.',
    'Describe a moment this week you felt seen.',
    'Co-create a one-sentence repair intention.',
  ],
  sexual: [
    'Share one turn-on and one turn-off—no fixing, just listening.',
    'Create a playful pre-intimacy ritual (2 minutes).',
    'Name one boundary and one curiosity.',
    'Do a non-goal touch exchange for 3 minutes.',
    'Share one fantasy headline (no pressure to enact).',
    'Map a “yes/maybe/no” menu together.',
    'Practice feedback with kindness in one sentence.',
    'Explore breath + eye contact for 90 seconds.',
    'Plan a date that invites sensuality without pressure.',
    'Celebrate one thing your partner does that you love.',
  ],
  physical: [
    '30-second full-body hug—slow breath together.',
    '3-minute hand massage exchange.',
    'Walk while holding hands, noticing pace and rhythm.',
    'Sit back-to-back and sync your breathing for 3 minutes.',
    'Offer a forehead-to-forehead quiet moment.',
    'Do a 1-song slow dance in the kitchen.',
    'Try a gentle cuddle position new to you.',
    'Share how you like to be held when stressed.',
    'Plan a “movement date” (walk, stretch, or dance).',
    'Fall asleep touching toes or hands.',
  ],
  spiritual: [
    'Sit in silence together for 3 minutes, share a word.',
    'Name a value you’re living into this week.',
    'Recall a moment of awe and what it meant.',
    'Read a short passage/quote; share what resonates.',
    'Name a small way to align actions with values tomorrow.',
    'Write a 2-line gratitude to life and to each other.',
    'Take three breaths together before dinner.',
    'Share what “meaning” looked like today.',
    'Offer a blessing or well-wish for your partner.',
    'Name a tiny ritual you want to try this week.',
  ],
  intellectual: [
    'Bring one idea that fascinated you today and explore it.',
    'Ask a “why do we…?” question and follow the thread.',
    'Teach each other something in 2 minutes.',
    'Watch a short clip/read a paragraph; discuss a takeaway.',
    'Brainstorm a mini-project you’d enjoy together.',
    'Do a curiosity volley: five “tell me more about…”',
    'Debate kindly: switch sides halfway.',
    'Name a belief you’ve updated in the last year.',
    'Co-design a question jar for future nights.',
    'Share a book/article you want to explore together.',
  ],
  energetic: [
    'Hold eye contact for 90 seconds—notice and name sensations.',
    'Play a 2-minute improv “yes, and…” game.',
    'Plan a micro-adventure for the weekend.',
    'Match each other’s energy in body language for 1 minute.',
    'Do a silly dance and rate it out of 10.',
    'Try a playful challenge (push-up, balance, etc.).',
    'Surprise each other with a 10-second positive jolt.',
    'Name one activity that gives you both “spark.”',
    'Co-create a 5-song hype playlist.',
    'Pick a fun competition; keep it friendly.',
  ],
};

const promptFor = (cat: IntimacyCategory, day: number) => {
  const seeds = SEED_PROMPTS[cat];
  const idx = ((day - 1) % seeds.length + seeds.length) % seeds.length;
  return seeds[idx];
};

/* =========================
   Reminder helpers
========================= */

function normalizeE164(p?: string | null): string | null {
  if (!p) return null;
  const digits = p.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (p.startsWith('+')) return p;
  return null;
}

type ReminderSlot = 'morning' | 'afternoon' | 'evening' | 'night';

const TIME_SLOTS: Record<ReminderSlot, { h: number; m: number; label: string }> = {
  morning: { h: 8, m: 0, label: '8:00 AM' },
  afternoon: { h: 12, m: 0, label: '12:00 PM' },
  evening: { h: 18, m: 0, label: '6:00 PM' },
  night: { h: 21, m: 0, label: '9:00 PM' },
};

/* =========================
   Deep-link + fun message
========================= */

const CATEGORY_EMOJI: Record<IntimacyCategory, string> = {
  emotional: '💙',
  sexual: '🔥',
  physical: '🤝',
  energetic: '⚡️',
  intellectual: '🧠',
  spiritual: '✨',
};

const APP_BASE_URL =
  (import.meta as any)?.env?.VITE_APP_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

const buildDeepLink = (cat: IntimacyCategory, day: number) =>
  `${APP_BASE_URL}/dashboard/intimacy-builders/${cat}?day=${day}`;

const makeOneOffMessage = (cat: IntimacyCategory, day: number) => {
  const emoji = CATEGORY_EMOJI[cat];
  const shortLabel = CATEGORIES[cat].name.replace(' Intimacy', '');
  const link = buildDeepLink(cat, day);
  return `${emoji} Siena • ${shortLabel} Day ${day}\nOpen today’s exercise: ${link}`;
};

/* =========================
   Component
========================= */

export default function IntimacyBuilders() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPremium = hasAccess('internal-world');

  if (!isPremium) {
    return (
      <FeatureAccessGuard featureId="internal-world" currentPlan={currentPlan}>
        <IntimacyBuildersContent />
      </FeatureAccessGuard>
    );
  }

  return <IntimacyBuildersContent />;
}

function IntimacyBuildersContent() {
  const { userData } = useUser();
  const { hasAccess } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const { category } = useParams<{ category: IntimacyCategory }>();

  const currentCategory = (category || 'emotional') as IntimacyCategory;
  const categoryInfo = CATEGORIES[currentCategory];

  const [currentDay, setCurrentDay] = useState(1);
  const [entries, setEntries] = useState<ChallengeEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<ChallengeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reflection, setReflection] = useState('');
  const [shareWithPartner, setShareWithPartner] = useState(true);
  const [reaction, setReaction] =
    useState<'love' | 'good' | 'neutral' | 'difficult' | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const [reminderSlot, setReminderSlot] = useState<ReminderSlot>('morning');
  const [agreedDailyOptIn, setAgreedDailyOptIn] = useState(false);
  const [stopping, setStopping] = useState(false);

  // NEW: Tips toggle
  const [showGuide, setShowGuide] = useState(false);

  // NEW: One-active-session state
  const [activeSession, setActiveSession] = useState<ChallengeSession | null>(null);
  const [globalActiveSession, setGlobalActiveSession] = useState<ChallengeSession | null>(null);
  const [blockedByOtherCategory, setBlockedByOtherCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!hasAccess('couples-cards')) navigate('/pricing');
  }, [hasAccess, navigate]);

  /**
   * Load/check sessions to enforce ONE active challenge per user across categories.
   */
  useEffect(() => {
    const run = async () => {
      if (!userData?.id) return;

      // Any active session for this user?
      const { data: anyActive, error: anyErr } = await supabase
        .from('intimacy_challenge_sessions')
        .select('*')
        .eq('user_id', userData.id)
        .eq('status', 'active')
        .maybeSingle();

      if (anyErr) {
        console.error(anyErr);
        return;
      }
      setGlobalActiveSession(anyActive || null);

      // If an active session exists in a different category, block this one
      if (anyActive && anyActive.category !== currentCategory) {
        setBlockedByOtherCategory(anyActive.category);
        setActiveSession(null);
        return;
      } else {
        setBlockedByOtherCategory(null);
      }

      // Fetch or create session for THIS category
      const { data: existing, error: existErr } = await supabase
        .from('intimacy_challenge_sessions')
        .select('*')
        .eq('user_id', userData.id)
        .eq('category', currentCategory)
        .order('started_at', { ascending: false })
        .maybeSingle();

      if (existErr) {
        console.error(existErr);
        return;
      }

      if (existing) {
        setActiveSession(existing as ChallengeSession);
      } else {
        // Create new active session (DB unique partial index prevents >1 active)
        const { data: created, error: createErr } = await supabase
          .from('intimacy_challenge_sessions')
          .insert([{ user_id: userData.id, category: currentCategory, status: 'active', current_day: 1 }])
          .select()
          .single();

        if (createErr) {
          console.error(createErr);
          // Re-check any active to set block state accurately
          const { data: reAny } = await supabase
            .from('intimacy_challenge_sessions')
            .select('*')
            .eq('user_id', userData.id)
            .eq('status', 'active')
            .maybeSingle();
          if (reAny && reAny.category !== currentCategory) {
            setBlockedByOtherCategory(reAny.category);
          }
          return;
        }

        setActiveSession(created as ChallengeSession);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id, currentCategory]);

  /**
   * Load entries for this category (after session check).
   */
  useEffect(() => {
    if (!userData?.id || !currentCategory || blockedByOtherCategory) return;

    const loadChallengeData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('intimacy_challenge_entries')
          .select('*')
          .eq('user_id', userData.id)
          .eq('category', currentCategory)
          .order('day', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setEntries(data);

          const lastCompletedDay = Math.max(
            ...data.filter((entry) => entry.completed).map((entry) => entry.day),
            0
          );
          const nextDay = lastCompletedDay + 1;
          const dayToShow = nextDay > TOTAL_DAYS ? TOTAL_DAYS : nextDay;
          setCurrentDay(dayToShow);

          const existingEntry = data.find((entry) => entry.day === dayToShow);
          if (existingEntry) {
            setCurrentEntry(existingEntry);
            setReflection(existingEntry.reflection || '');
            setShareWithPartner(existingEntry.shared_with_partner);
            setReaction(existingEntry.reaction || null);
          } else if (dayToShow <= TOTAL_DAYS) {
            const newEntry = createEntryForDay(dayToShow);
            setCurrentEntry(newEntry);
          }
        } else {
          const newEntry = createEntryForDay(1);
          setCurrentEntry(newEntry);
          await saveEntry(newEntry);
          setEntries([newEntry]);
        }
      } catch (err) {
        console.error('Error loading challenge data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadChallengeData();
  }, [userData?.id, currentCategory, blockedByOtherCategory]);

  // Support deep link: ?day=7
  useEffect(() => {
    if (!entries.length) return;
    const qs = new URLSearchParams(location.search);
    const qDay = Number(qs.get('day'));
    if (qDay && qDay >= 1 && qDay <= TOTAL_DAYS) navigateToDay(qDay);
  }, [location.search, entries.length]);

  useEffect(() => {
    if (entries.length > 0 && !currentEntry) {
      navigateToDay(1);
    }
  }, [entries, currentEntry]);

  const createEntryForDay = (day: number): ChallengeEntry => {
    const prompt = promptFor(currentCategory, day);

    return {
      user_id: userData?.id || '',
      day,
      date: format(new Date(), 'yyyy-MM-dd'),
      category: currentCategory,
      prompt,
      reflection: '',
      shared_with_partner: true,
      completed: false,
    };
  };

  const saveEntry = async (entry: ChallengeEntry) => {
    if (!userData?.id) return;

    try {
      if (entry.id) {
        const { error } = await supabase
          .from('intimacy_challenge_entries')
          .update({
            reflection: entry.reflection,
            shared_with_partner: entry.shared_with_partner,
            reaction: entry.reaction,
            completed: entry.completed,
            updated_at: new Date().toISOString(),
          })
          .eq('id', entry.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('intimacy_challenge_entries')
          .insert([entry])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          entry.id = data[0].id;
        }
      }

      setEntries((prev) => {
        const existingIndex = prev.findIndex((e) => e.day === entry.day);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = entry;
          return updated;
        } else {
          return [...prev, entry];
        }
      });

      return entry;
    } catch (err) {
      console.error('Error saving entry:', err);
      throw err;
    }
  };

  const bumpSessionDay = async (toDay: number) => {
    if (!activeSession) return;
    const capped = Math.min(TOTAL_DAYS, Math.max(1, toDay));
    const payload: any = { current_day: capped, updated_at: new Date().toISOString() };

    // If finishing last day, mark completed and free them to start a new one.
    if ((capped >= TOTAL_DAYS && currentEntry?.completed) || toDay > TOTAL_DAYS) {
      payload.status = 'completed';
      payload.ended_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('intimacy_challenge_sessions')
      .update(payload)
      .eq('id', activeSession.id)
      .select()
      .single();

    if (!error && data) {
      setActiveSession(data as ChallengeSession);
      if ((data as ChallengeSession).status !== 'active') {
        setGlobalActiveSession(null);
      }
    }
  };

  const completeChallenge = async () => {
    if (!currentEntry) return;

    try {
      const updatedEntry = {
        ...currentEntry,
        reflection,
        shared_with_partner: shareWithPartner,
        reaction,
        completed: true,
      };

      await saveEntry(updatedEntry);
      setCurrentEntry(updatedEntry);

      // advance session day
      await bumpSessionDay(currentDay + 1);

      if (currentDay < TOTAL_DAYS) {
        const nextDay = currentDay + 1;
        const existingNextEntry = entries.find((entry) => entry.day === nextDay);

        if (!existingNextEntry) {
          const newEntry = createEntryForDay(nextDay);
          await saveEntry(newEntry);
          setEntries((prev) => [...prev, newEntry]);
        }
      }
    } catch (err) {
      console.error('Error completing challenge:', err);
    }
  };

  const navigateToDay = (day: number) => {
    if (day < 1 || day > TOTAL_DAYS) return;

    const entry = entries.find((e) => e.day === day);
    if (entry) {
      setCurrentDay(day);
      setCurrentEntry(entry);
      setReflection(entry.reflection || '');
      setShareWithPartner(entry.shared_with_partner);
      setReaction(entry.reaction || null);
    } else {
      const newEntry = createEntryForDay(day);
      setCurrentDay(day);
      setCurrentEntry(newEntry);
      setReflection('');
      setShareWithPartner(true);
      setReaction(null);
    }

    setShowHistory(false);
  };

  const calculateProgress = () => {
    const completedDays = entries.filter((entry) => entry.completed).length;
    return Math.round((completedDays / TOTAL_DAYS) * 100);
  };

  const getCurrentStreak = () => {
    const completedEntries = entries.filter((entry) => entry.completed);
    if (completedEntries.length === 0) return 0;

    completedEntries.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let streak = 1;
    let currentDate = new Date(
      completedEntries[completedEntries.length - 1].date
    );

    for (let i = completedEntries.length - 2; i >= 0; i--) {
      const entryDate = new Date(completedEntries[i].date);
      const expectedPreviousDate = addDays(currentDate, -1);

      if (isSameDay(entryDate, expectedPreviousDate)) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }

    return streak;
  };

  /* ============== One-off reminder: “tomorrow at …” ============== */
  const scheduleIntimacyReminder = async () => {
    try {
      const phoneRaw =
        (userData as any)?.phone ||
        (userData as any)?.phone_number ||
        (userData as any)?.profile?.phoneNumber;

      if (!phoneRaw) {
        alert('No phone number on file in your profile.');
        return;
      }

      const to = normalizeE164(String(phoneRaw));
      if (!to) {
        alert(`Invalid phone number: ${phoneRaw}`);
        return;
      }

      const slot = TIME_SLOTS[reminderSlot];
      const now = new Date();
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        slot.h,
        slot.m,
        0,
        0
      );

      const msg = makeOneOffMessage(currentCategory, currentDay);

      const { data, error } = await supabase.functions.invoke(
        'schedule-sms-reminder',
        {
          body: {
            phoneNumber: to,
            message: msg,
            scheduledTime: tomorrow.toISOString(),
            sessionId: null,
          },
        }
      );

      if (error) throw new Error(error.message || 'Failed to schedule reminder');
      if (!data?.success) throw new Error(data?.error || 'Failed to schedule reminder');

      alert(`Reminder scheduled for tomorrow at ${TIME_SLOTS[reminderSlot].label}.`);
    } catch (e: any) {
      console.error('Schedule reminder failed:', e);
      alert(`Failed to schedule reminder: ${e?.message ?? e}`);
    }
  };

  /* ============== 30-day opt-in (daily at chosen time) ============== */
  const startDailyThirtyReminders = async () => {
    try {
      if (!agreedDailyOptIn) {
        alert('Please agree to receive daily SMS first.');
        return;
      }

      const phoneRaw =
        (userData as any)?.phone ||
        (userData as any)?.phone_number ||
        (userData as any)?.profile?.phoneNumber;

      if (!phoneRaw) {
        alert('No phone number on file in your profile.');
        return;
      }

      const to = normalizeE164(String(phoneRaw));
      if (!to) {
        alert(`Invalid phone number: ${phoneRaw}`);
        return;
      }

      const slot = TIME_SLOTS[reminderSlot];
      const timeOfDay = `${String(slot.h).padStart(2, '0')}:${String(slot.m).padStart(2, '0')}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const message = makeOneOffMessage(currentCategory, currentDay);

      const { data, error } = await supabase.functions.invoke('schedule-sms-reminder', {
        body: {
          mode: 'daily30',
          userId: userData?.id,
          category: currentCategory,
          phoneNumber: to,
          message,
          timeOfDay,
          timezone,
        },
      });

      if (error) throw new Error(error.message || 'Failed to start daily reminders');
      if (!data?.success) throw new Error(data?.error || 'Failed to start daily reminders');

      alert(
        `Daily reminders scheduled at ${TIME_SLOTS[reminderSlot].label} for up to 30 days. Reply STOP to opt out anytime.`
      );
    } catch (e: any) {
      console.error('Start daily30 failed:', e);
      alert(`Failed to start daily reminders: ${e?.message ?? e}`);
    }
  };

  /* ============== Stop active daily reminders for this user+category ============== */
  const stopDailyReminders = async () => {
    try {
      setStopping(true);

      const { data: subs, error: subErr } = await supabase
        .from('reminder_subscriptions')
        .select('id, occurrences_sent')
        .eq('user_id', userData?.id)
        .eq('category', currentCategory)
        .eq('status', 'active');

      if (subErr) throw subErr;

      if (subs && subs.length) {
        const ids = subs.map((s: any) => s.id);

        const { error: updErr } = await supabase
          .from('reminder_subscriptions')
          .update({ status: 'stopped', updated_at: new Date().toISOString() })
          .in('id', ids);
        if (updErr) throw updErr;

        const { error: delErr } = await supabase
          .from('scheduled_reminders')
          .delete()
          .in('subscription_id', ids)
          .eq('status', 'pending');
        if (delErr) throw delErr;
      }

      alert('Daily reminders stopped for this category.');
    } catch (e: any) {
      console.error('Stop reminders failed:', e);
      alert(`Failed to stop reminders: ${e?.message ?? e}`);
    } finally {
      setStopping(false);
    }
  };

  /* ============== UI Short-circuits ============== */

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  // If they’re trying to open a different category while another is active, block with guidance
  if (blockedByOtherCategory) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-5">
          <h2 className="text-lg font-semibold text-yellow-900">You already have an active challenge</h2>
          <p className="text-yellow-800 mt-2">
            You’re currently working on the{' '}
            <span className="font-semibold">
              {CATEGORIES[blockedByOtherCategory as IntimacyCategory].name}
            </span>{' '}
            challenge. Please finish it or turn it off to begin a new one. Keeping one active challenge
            helps with focus and intentionality.
          </p>

          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => navigate(`/dashboard/intimacy-builders/${blockedByOtherCategory}`)}
              className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white"
            >
              Go to my active challenge
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Challenge complete
  if (currentDay > TOTAL_DAYS || (currentDay === TOTAL_DAYS && currentEntry?.completed)) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-4">Challenge Complete! 🎉</h1>
            <p className="text-lg text-white/80">
              Congratulations on completing the 30-Day Intimacy Builders Challenge!
            </p>
          </div>
        </div>

        <div className="text-center py-12">
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  /* ============== Main UI ============== */

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Category switcher — disabled if a different category is active */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {(Object.keys(CATEGORIES) as IntimacyCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => navigate(`/dashboard/intimacy-builders/${cat}`)}
            disabled={Boolean(globalActiveSession && globalActiveSession.category !== cat)}
            className={`px-4 py-2 rounded-lg font-medium border
              ${currentCategory === cat ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-gray-800 border-gray-300'}
              ${globalActiveSession && globalActiveSession.category !== cat ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {CATEGORIES[cat].name}
          </button>
        ))}
      </div>

      {/* Header banner with Tips toggle + Turn Off */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-6">
        <div className="relative z-10">
          <div className="flex items-start md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">30-Day Intimacy Builders</h1>
              <p className="text-lg text-white/80">Day {currentDay} of {TOTAL_DAYS}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowGuide((s) => !s)}
                className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 transition-colors"
              >
                <HelpCircle className="h-4 w-4 text-white" />
                <span className="text-white text-sm font-medium">Tips</span>
                {showGuide ? (
                  <ChevronUp className="h-4 w-4 text-white" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-white" />
                )}
              </button>

              <Button
                variant="outline"
                onClick={() => setShowHistory(true)}
                className="border-white/50 text-white hover:bg-white/10"
              >
                View History
              </Button>

              {/* Turn Off button */}
              <Button
                variant="outline"
                onClick={async () => {
                  if (!activeSession) return;
                  if (!confirm('Turn off this challenge? You can start a different one afterwards. Your past entries remain as history.')) return;
                  const { data, error } = await supabase
                    .from('intimacy_challenge_sessions')
                    .update({ status: 'abandoned', ended_at: new Date().toISOString() })
                    .eq('id', activeSession.id)
                    .select()
                    .single();
                  if (error) {
                    alert('Could not turn off the challenge.');
                    return;
                  }
                  setActiveSession(data as ChallengeSession);
                  setGlobalActiveSession(null);
                  alert('Challenge turned off. You can start a new one.');
                }}
                className="border-white/50 text-white hover:bg-white/10"
              >
                Turn Off
              </Button>
            </div>
          </div>

          {/* Tips panel — TWO sections */}
          {showGuide && (
            <div className="mt-6">
              <div className="bg-white/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-white mb-3">How it works</h3>
                  <ul className="text-white/80 space-y-2 text-sm">
                    <li>• Pick an intimacy type; you’ll get one prompt per day for 30 days.</li>
                    <li>• Do the activity, jot a reflection, and mark it complete.</li>
                    <li>• Use the History view anytime to revisit past days.</li>
                    <li>• Enable SMS reminders to keep momentum.</li>
                  </ul>
                </div>

                <div className="bg-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-white mb-3">Best practices</h3>
                  <ul className="text-white/80 space-y-2 text-sm">
                    <li>• Go slow and choose consent-first, judgment-free curiosity.</li>
                    <li>• If a prompt feels too big today, scale it down—not off.</li>
                    <li>• Share feelings, not fixes; validate what lands for each of you.</li>
                    <li>• Celebrate small wins—aim for connection, not perfection.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-brand-green" />
            <span className="text-gray-900">{calculateProgress()}% Complete</span>
          </div>
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-gray-900">{getCurrentStreak()} Day Streak</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-green h-full rounded-full transition-all duration-300"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Colored category chip */}
        <div className={`bg-gradient-to-r ${categoryInfo.color} p-6 rounded-xl`}>
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">{categoryInfo.icon()}</div>
            <div>
              <h2 className="text-xl font-bold text-white">{categoryInfo.name}</h2>
              <p className="text-white/80">{categoryInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Today's prompt */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Prompt</h3>
          <p className="text-xl text-gray-800 mb-6">{currentEntry?.prompt}</p>

          {!currentEntry?.completed ? (
            <div className="space-y-6">
              <div>
                <label className="block text-gray-800 mb-2">Reflect on today's experience</label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400"
                  rows={4}
                  placeholder="Share your thoughts and feelings about this experience..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="shareWithPartner"
                  checked={shareWithPartner}
                  onChange={(e) => setShareWithPartner(e.target.checked)}
                  className="h-4 w-4 text-brand-green rounded border-gray-300 focus:ring-brand-green"
                />
                <label htmlFor="shareWithPartner" className="text-gray-800">
                  Share with my partner
                </label>
              </div>

              <div>
                <p className="text-gray-800 mb-3">How did this activity feel?</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setReaction('love')}
                    className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                      reaction === 'love'
                        ? 'bg-brand-green/20 border border-brand-green'
                        : 'bg-gray-200 border border-gray-300'
                    }`}
                  >
                    <Heart
                      className={`h-6 w-6 ${
                        reaction === 'love' ? 'text-brand-green' : 'text-gray-600'
                      }`}
                    />
                    <span
                      className={`text-sm mt-1 ${
                        reaction === 'love' ? 'text-brand-green' : 'text-gray-600'
                      }`}
                    >
                      Loved it
                    </span>
                  </button>

                  <button
                    onClick={() => setReaction('good')}
                    className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                      reaction === 'good'
                        ? 'bg-brand-green/20 border border-brand-green'
                        : 'bg-gray-200 border border-gray-300'
                    }`}
                  >
                    <Smile
                      className={`h-6 w-6 ${
                        reaction === 'good' ? 'text-brand-green' : 'text-gray-600'
                      }`}
                    />
                    <span
                      className={`text-sm mt-1 ${
                        reaction === 'good' ? 'text-brand-green' : 'text-gray-600'
                      }`}
                    >
                      Good
                    </span>
                  </button>

                  <button
                    onClick={() => setReaction('neutral')}
                    className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                      reaction === 'neutral'
                        ? 'bg-brand-green/20 border border-brand-green'
                        : 'bg-gray-200 border border-gray-300 hover:bg-gray-300'
                    }`}
                  >
                    <Meh
                      className={`h-6 w-6 ${
                        reaction === 'neutral' ? 'text-brand-green' : 'text-gray-600'
                      }`}
                    />
                    <span
                      className={`text-sm mt-1 ${
                        reaction === 'neutral' ? 'text-brand-green' : 'text-gray-600'
                      }`}
                    >
                      Neutral
                    </span>
                  </button>

                  <button
                    onClick={() => setReaction('difficult')}
                    className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                      reaction === 'difficult'
                        ? 'bg-brand-green/20 border border-brand-green'
                        : 'bg-gray-200 border border-gray-300 hover:bg-gray-300'
                    }`}
                  >
                    <Frown
                      className={`h-6 w-6 ${
                        reaction === 'difficult' ? 'text-brand-green' : 'text-gray-600'
                      }`}
                    />
                    <span
                      className={`text-sm mt-1 ${
                        reaction === 'difficult' ? 'text-brand-green' : 'text-gray-600'
                      }`}
                    >
                      Difficult
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={async () => {
                    await completeChallenge();
                    if (currentDay < TOTAL_DAYS) navigateToDay(currentDay + 1);
                  }}
                  disabled={!reflection || !reaction}
                  className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Mark Day Complete
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h4 className="text-brand-green font-semibold mb-2">Your Reflection</h4>
                <p className="text-gray-800">{currentEntry?.reflection}</p>
              </div>

              {currentEntry?.reaction && (
                <div className="flex items-center space-x-2">
                  <p className="text-gray-600">Your reaction:</p>
                  {currentEntry.reaction === 'love' && <Heart className="h-5 w-5 text-brand-green" />}
                  {currentEntry.reaction === 'good' && <Smile className="h-5 w-5 text-brand-green" />}
                  {currentEntry.reaction === 'neutral' && <Meh className="h-5 w-5 text-brand-green" />}
                  {currentEntry.reaction === 'difficult' && <Frown className="h-5 w-5 text-brand-green" />}
                </div>
              )}

              <div className="flex justify-center pt-4">
                {currentDay < TOTAL_DAYS && (
                  <Button
                    onClick={() => navigateToDay(currentDay + 1)}
                    className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white"
                  >
                    Continue to Day {currentDay + 1}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Prev/Next */}
        <div className="flex justify-between">
          {currentDay > 1 ? (
            <Button
              variant="outline"
              onClick={() => navigateToDay(currentDay - 1)}
              className="border-gray-300 text-gray-800 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Previous Day
            </Button>
          ) : (
            <div />
          )}

          {currentDay < TOTAL_DAYS && currentEntry?.completed && (
            <Button
              onClick={() => navigateToDay(currentDay + 1)}
              className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white"
            >
              Next Day
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          )}
        </div>

        {/* Set a Reminder */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Set a Reminder</h3>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-brand-green" />
              <p className="text-gray-900">Send me a reminder tomorrow at</p>
            </div>

            <select
              value={reminderSlot}
              onChange={(e) => setReminderSlot(e.target.value as ReminderSlot)}
              className="bg-white text-gray-900 border border-gray-300 rounded p-2"
            >
              {Object.entries(TIME_SLOTS).map(([key, v]) => (
                <option key={key} value={key}>
                  {v.label}
                </option>
              ))}
            </select>

            <Button
              onClick={scheduleIntimacyReminder}
              className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white"
            >
              Schedule Reminder
            </Button>
          </div>

          <div className="my-6 border-t border-gray-200" />

          <div className="space-y-3">
            <p className="text-gray-900 font-medium">
              Or opt into daily texts for the next 30 days at {TIME_SLOTS[reminderSlot].label}:
            </p>

            <label className="flex items-center gap-2 text-gray-800">
              <input
                type="checkbox"
                className="h-4 w-4 text-brand-green rounded border-gray-300 focus:ring-brand-green"
                checked={agreedDailyOptIn}
                onChange={(e) => setAgreedDailyOptIn(e.target.checked)}
              />
              I agree to receive daily SMS reminders for this 30-day challenge. I can reply STOP to
              opt out anytime.
            </label>

            <div className="flex gap-3">
              <Button
                onClick={startDailyThirtyReminders}
                disabled={!agreedDailyOptIn}
                className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white disabled:opacity-60"
              >
                Start 30-day SMS reminders
              </Button>

              <Button
                variant="outline"
                onClick={stopDailyReminders}
                disabled={stopping}
                className="border-gray-300 text-gray-800 hover:bg-gray-100 disabled:opacity-60"
              >
                {stopping ? 'Stopping…' : 'Stop daily reminders'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
