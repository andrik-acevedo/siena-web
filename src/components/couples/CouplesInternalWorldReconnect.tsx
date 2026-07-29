import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  User,
  Users,
  CheckCircle,
  Lock,
  Settings,
  Trash2,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Button from '../ui/Button';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { supabase } from '../../lib/supabase';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import { sendChatMessage } from '../../lib/openai';

interface InternalWorldEntry {
  id?: string;
  user_id: string;
  entry_date: string;
  feelings_about_partner: string;
  thoughts_about_relationship: string;
  thoughts_about_life: string;
  feelings_about_life: string;
  created_at?: string;
  updated_at?: string;
  partner_first_name?: string | null;
  partner_last_name?: string | null;
  partner_email?: string | null;
  partner_feelings_about_partner?: string | null;
  partner_thoughts_about_relationship?: string | null;
  partner_thoughts_about_life?: string | null;
  partner_feelings_about_life?: string | null;
  partner_user_id?: string | null;
}

interface ReconnectionExercise {
  id?: string;
  premium_user_id: string;
  entry_date: string;
  partner_a_summary: string;
  partner_b_summary: string;
  audio_url?: string;
  created_at?: string;
  updated_at?: string;
}

type PartnerInfo = {
  id: string;
  display_name?: string | null;
  avatar_emoji?: string | null;
};

export default function CouplesInternalWorldReconnect() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPremium = hasAccess('internal-world');

  if (!isPremium) {
    return (
      <FeatureAccessGuard featureId="internal-world" currentPlan={currentPlan}>
        <CouplesInternalWorldReconnectContent />
      </FeatureAccessGuard>
    );
  }

  return <CouplesInternalWorldReconnectContent />;
}

function CouplesInternalWorldReconnectContent() {
  // get user data + user loading flag
  const { userData, isLoading: isUserLoading } = useUser();
  // get subscription access + sub loading flag
  const { isLoading: isSubLoading, hasAccess } = useSubscription();
  const navigate = useNavigate();

  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [myEntry, setMyEntry] = useState<InternalWorldEntry | null>(null);
  const [partnerEntry, setPartnerEntry] = useState<InternalWorldEntry | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [reconnectionExercise, setReconnectionExercise] = useState<ReconnectionExercise | null>(null);

  const [isLoading, setIsLoading] = useState(true);       // data loading for this screen
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [premiumUserId, setPremiumUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    feelings_about_partner: '',
    thoughts_about_relationship: '',
    thoughts_about_life: '',
    feelings_about_life: '',
  });

  // Tips toggle (collapsed by default)
  const [showTips, setShowTips] = useState(false);

  // mount + readiness
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  const isReady = hasMounted && !isSubLoading && !isUserLoading && !!userData?.id;

  // Load week data
  useEffect(() => {
    if (!userData?.id) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id, currentWeek]);

  // Trigger generation when both entries exist and no exercise yet
  useEffect(() => {
    if (isLoading) return;

    if (myEntry && partnerEntry && premiumUserId && !reconnectionExercise && !isGenerating) {
      // Only auto-generate for the premium user
      if (!userData?.invited_by) {
        generateReconnectionExercise(premiumUserId, myEntry, partnerEntry);
      }
    }
  }, [
    isLoading,
    myEntry,
    partnerEntry,
    premiumUserId,
    reconnectionExercise,
    isGenerating,
    userData?.invited_by,
  ]);

  const fetchPublicProfile = async (uid: string): Promise<PartnerInfo | null> => {
    const { data, error } = await supabase
      .from('public_profiles')
      .select('user_id, display_name, avatar_emoji')
      .eq('user_id', uid)
      .maybeSingle();
    if (error) {
      console.warn('public_profiles fetch error', error);
      return { id: uid };
    }
    if (!data) return { id: uid };
    return { id: data.user_id, display_name: data.display_name, avatar_emoji: data.avatar_emoji };
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!userData?.id) return;

      const weekStart = format(currentWeek, 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(currentWeek), 'yyyy-MM-dd');

      let premiumUser: string;
      let partner: PartnerInfo | null = null;

      if (userData.invited_by) {
        // invited partner
        premiumUser = userData.invited_by;

        // my entry
        const { data: myEntries, error: myEntryError } = await supabase
          .from('internal_world_entries')
          .select('*')
          .eq('user_id', userData.id)
          .gte('entry_date', weekStart)
          .lte('entry_date', weekEnd)
          .order('entry_date', { ascending: false })
          .limit(1);
        if (myEntryError) throw myEntryError;

        if (myEntries?.length) {
          setMyEntry(myEntries[0]);
          setFormData({
            feelings_about_partner: myEntries[0].feelings_about_partner || '',
            thoughts_about_relationship: myEntries[0].thoughts_about_relationship || '',
            thoughts_about_life: myEntries[0].thoughts_about_life || '',
            feelings_about_life: myEntries[0].feelings_about_life || '',
          });
        } else {
          setMyEntry(null);
          setFormData({
            feelings_about_partner: '',
            thoughts_about_relationship: '',
            thoughts_about_life: '',
            feelings_about_life: '',
          });
        }

        // premium partner entry
        const { data: parentEntries, error: parentEntryError } = await supabase
          .from('internal_world_entries')
          .select('*')
          .eq('user_id', userData.invited_by)
          .gte('entry_date', weekStart)
          .lte('entry_date', weekEnd)
          .order('entry_date', { ascending: false })
          .limit(1);
        if (parentEntryError) throw parentEntryError;

        if (parentEntries?.length) {
          setPartnerEntry(parentEntries[0]);
        } else {
          setPartnerEntry(null);
        }

        // premium partner public profile
        partner = await fetchPublicProfile(userData.invited_by);
      } else {
        // premium user
        premiumUser = userData.id;

        // invited partner id (select only id from profiles; we won't show PII)
        const { data: invitedPartner, error: partnerError } = await supabase
          .from('profiles')
          .select('id')
          .eq('invited_by', userData.id)
          .limit(1);
        if (partnerError) throw partnerError;

        if (invitedPartner?.length) {
          const partnerId = invitedPartner[0].id as string;
          partner = await fetchPublicProfile(partnerId);

          // partner entry (if exists)
          const { data: partnerEntries, error: partnerEntryError } = await supabase
            .from('internal_world_entries')
            .select('*')
            .eq('user_id', partnerId)
            .gte('entry_date', weekStart)
            .lte('entry_date', weekEnd)
            .order('entry_date', { ascending: false })
            .limit(1);
          if (partnerEntryError) throw partnerEntryError;

          setPartnerEntry(partnerEntries?.length ? partnerEntries[0] : null);
        } else {
          partner = null;
          setPartnerEntry(null);
        }

        // my entry
        const { data: myEntries, error: myEntryError } = await supabase
          .from('internal_world_entries')
          .select('*')
          .eq('user_id', userData.id)
          .gte('entry_date', weekStart)
          .lte('entry_date', weekEnd)
          .order('entry_date', { ascending: false })
          .limit(1);
        if (myEntryError) throw myEntryError;

        if (myEntries?.length) {
          setMyEntry(myEntries[0]);
          setFormData({
            feelings_about_partner: myEntries[0].feelings_about_partner || '',
            thoughts_about_relationship: myEntries[0].thoughts_about_relationship || '',
            thoughts_about_life: myEntries[0].thoughts_about_life || '',
            feelings_about_life: myEntries[0].feelings_about_life || '',
          });
        } else {
          setMyEntry(null);
          setFormData({
            feelings_about_partner: '',
            thoughts_about_relationship: '',
            thoughts_about_life: '',
            feelings_about_life: '',
          });
        }
      }

      setPartnerInfo(partner);
      setPremiumUserId(premiumUser);

      // exercise for the exact week (by weekStart)
      const { data: exercises, error: exerciseError } = await supabase
        .from('reconnection_exercises')
        .select('*')
        .eq('premium_user_id', premiumUser)
        .eq('entry_date', format(currentWeek, 'yyyy-MM-dd'))
        .order('created_at', { ascending: false })
        .limit(1);
      if (exerciseError) throw exerciseError;

      setReconnectionExercise(exercises?.length ? exercises[0] : null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const entryDate = format(new Date(), 'yyyy-MM-dd');
      const entry: InternalWorldEntry = {
        user_id: userData!.id,
        entry_date: entryDate,
        feelings_about_partner: formData.feelings_about_partner,
        thoughts_about_relationship: formData.thoughts_about_relationship,
        thoughts_about_life: formData.thoughts_about_life,
        feelings_about_life: formData.feelings_about_life,
      };

      if (myEntry?.id) {
        const { error } = await supabase
          .from('internal_world_entries')
          .update(entry)
          .eq('id', myEntry.id);
        if (error) throw error;
        toast.success('Your entry has been updated');
      } else {
        const { data, error } = await supabase
          .from('internal_world_entries')
          .insert([entry])
          .select();
        if (error) throw error;
        if (data) setMyEntry(data[0]);
        toast.success('Your entry has been submitted');
      }

      loadData();
    } catch (err) {
      console.error('Error submitting entry:', err);
      setError('Failed to submit your entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateReconnectionExercise = async (
    premiumUserId: string,
    myEntry: InternalWorldEntry,
    partnerEntry: InternalWorldEntry
  ) => {
    setIsGenerating(true);
    try {
      const weekStart = format(currentWeek, 'yyyy-MM-dd');

      const generatePersonalizedInsight = async (
        forUser: InternalWorldEntry,
        aboutPartner: InternalWorldEntry,
        userName: string
      ) => {
        const prompt = `
You are a compassionate relationship support assistant helping couples process and reconnect using their weekly private journal reflections.

${userName}'s partner has submitted reflections in response to these 4 prompts:
1. How I've been feeling about my partner
2. What I've been telling myself about my partner or our relationship
3. What I've been telling myself about other parts of my life
4. How I've been feeling about other parts of my life

${userName}'s Partner's Reflections:
- feelings_about_partner: ${aboutPartner.feelings_about_partner}
- thoughts_about_relationship: ${aboutPartner.thoughts_about_relationship}
- thoughts_about_life: ${aboutPartner.thoughts_about_life}
- feelings_about_life: ${aboutPartner.feelings_about_life}

${userName}'s Own Reflections (for context only):
- feelings_about_partner: ${forUser.feelings_about_partner}
- thoughts_about_relationship: ${forUser.thoughts_about_relationship}
- thoughts_about_life: ${forUser.thoughts_about_life}
- feelings_about_life: ${forUser.feelings_about_life}

Create a personalized response for ${userName} that helps them understand their partner better and show up more empathetically. Focus on what their partner might be navigating emotionally, and provide ${userName} with specific guidance for connecting with compassion.

**Output format:**

💡 What Your Partner Might Be Navigating:
[Write 1 paragraph summarizing the partner's emotional or psychological state without quoting. Use warm, safe language.]

🧠 Things to Hold in Mind:
• [Tip for staying grounded or not taking things personally - tailored to ${userName}'s own reflections]
• [Tip for active listening or empathy - considering ${userName}'s current emotional state]
• [Tip for reducing defensiveness or showing up gently - based on ${userName}'s thoughts about the relationship]

💬 Try Saying:
• "[Gentle, connection-oriented phrase #1 - tailored to what the partner might need to hear]"
• "[Optional phrase #2 if appropriate]"

🧘‍♀️ Micro Practice:
[One short cue to support grounding or presence before engaging with partner - personalized for ${userName}]

## 🔒 IMPORTANT GUIDELINES:
- NEVER quote or summarize the partner's words directly
- DO NOT assign blame, diagnose, or make assumptions
- Always use neutral, emotionally safe language
- Tailor advice to ${userName}'s specific emotional state and relationship thoughts
- Focus on reconnection, self-awareness, and relational presence
- Consider how ${userName}'s own feelings might affect their ability to connect
        `;

        const messages = [
          {
            role: 'system' as const,
            content:
              'You are a compassionate couples therapist who helps partners understand each other better and reconnect.',
          },
          { role: 'user' as const, content: prompt },
        ];

        const response = await sendChatMessage(messages);
        return response.content;
      };

      const isCurrentUserPremium = !userData?.invited_by;
      let partnerAEntry: InternalWorldEntry;
      let partnerBEntry: InternalWorldEntry;
      let partnerAName: string;
      let partnerBName: string;

      if (isCurrentUserPremium) {
        partnerAEntry = myEntry;
        partnerBEntry = partnerEntry;
        partnerAName = userData?.first_name || 'Partner A';
        partnerBName = partnerInfo?.display_name || 'Partner B';
      } else {
        partnerAEntry = partnerEntry;
        partnerBEntry = myEntry;
        partnerAName = partnerInfo?.display_name || 'Your Partner';
        partnerBName = userData?.first_name || 'Partner B';
      }

      const [partnerAInsight, partnerBInsight] = await Promise.all([
        generatePersonalizedInsight(partnerAEntry, partnerBEntry, partnerAName),
        generatePersonalizedInsight(partnerBEntry, partnerAEntry, partnerBName),
      ]);

      const exercise: ReconnectionExercise = {
        premium_user_id: premiumUserId,
        entry_date: weekStart,
        partner_a_summary: partnerAInsight,
        partner_b_summary: partnerBInsight,
      };

      const { data, error } = await supabase
        .from('reconnection_exercises')
        .insert([exercise])
        .select();
      if (error) throw error;

      if (data?.length) {
        setReconnectionExercise(data[0]);
        toast.success('Reconnection exercise generated');
      }
    } catch (err) {
      console.error('Error generating reconnection exercise:', err);
      setError('Failed to generate reconnection exercise. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const navigateToWeek = (direction: 'prev' | 'next') => {
    const newWeek = direction === 'prev' ? addDays(currentWeek, -7) : addDays(currentWeek, 7);
    setCurrentWeek(startOfWeek(newWeek));
  };

  const clearCurrentWeekEntries = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all entries for this week? This will delete:\n- Your entry\n- Partner's entry\n- Generated reconnection exercise\n\nThis action cannot be undone."
      )
    ) {
      return;
    }

    setIsClearing(true);
    setError(null);

    try {
      const weekStart = format(currentWeek, 'yyyy-MM-dd');

      // my entry
      if (myEntry) {
        const { error: myEntryError } = await supabase
          .from('internal_world_entries')
          .delete()
          .eq('id', myEntry.id)
          .eq('user_id', userData!.id);
        if (myEntryError) throw myEntryError;
      }

      // partner entry (only if premium)
      if (partnerEntry && !userData?.invited_by && partnerInfo) {
        const { error: partnerEntryError } = await supabase
          .from('internal_world_entries')
          .delete()
          .eq('id', partnerEntry.id)
          .eq('user_id', partnerInfo.id);
        if (partnerEntryError) throw partnerEntryError;
      }

      // reconnection exercise (only if premium)
      if (reconnectionExercise && !userData?.invited_by && premiumUserId) {
        const { error: exerciseError } = await supabase
          .from('reconnection_exercises')
          .delete()
          .eq('id', reconnectionExercise.id)
          .eq('premium_user_id', premiumUserId)
          .eq('entry_date', weekStart);
        if (exerciseError) throw exerciseError;
      }

      setMyEntry(null);
      setPartnerEntry(null);
      setReconnectionExercise(null);
      setFormData({
        feelings_about_partner: '',
        thoughts_about_relationship: '',
        thoughts_about_life: '',
        feelings_about_life: '',
      });

      toast.success('Entries cleared successfully');
      loadData();
    } catch (err) {
      console.error('Error clearing entries:', err);
      setError('Failed to clear entries. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  // unified loading gate (prevents blank page)
  const showSpinner = isUserLoading || isSubLoading || isLoading;
  if (showSpinner) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-brand-green animate-spin" />
      </div>
    );
  }

  const weekStartFormatted = format(currentWeek, 'MMMM d');
  const weekEndFormatted = format(endOfWeek(currentWeek), 'MMMM d, yyyy');
  const isCurrentWeek =
    format(startOfWeek(new Date()), 'yyyy-MM-dd') === format(currentWeek, 'yyyy-MM-dd');

  const partnerLabel = `${partnerInfo?.avatar_emoji || '🙂'} ${partnerInfo?.display_name || 'Partner'}`;

  const bothEntriesSubmitted = !!myEntry && !!partnerEntry;
  const showReconnectionExercise = bothEntriesSubmitted && !!reconnectionExercise;

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-8">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-6">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="pr-3">
              <h1 className="text-4xl font-bold text-white mb-2">Couples Internal World</h1>
              <p className="text-lg text-white/80">
                A weekly journaling and reconnection experience for couples
              </p>
            </div>

            {/* Tips toggle pill (collapsed by default) */}
            <button
              onClick={() => setShowTips(v => !v)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-colors"
              aria-expanded={showTips}
              aria-controls="ciw-tips"
            >
              <Info className="h-4 w-4" />
              <span className="font-medium">Tips</span>
              {showTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Tips panel (green design) */}
      {showTips && (
        <div
          id="ciw-tips"
          className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#01B1AF] to-[#018a88] p-6 -mt-2"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: How this works */}
            <div className="bg-black/10 rounded-xl p-5 border border-white/10">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">🧭</span>
                How This Week Works
              </h3>
              <ul className="text-white/90 space-y-3">
                <li>• Fill the four prompts honestly. Write as if you’re the only one reading it.</li>
                <li>• When <b>both entries</b> are submitted, your <b>Reconnection Exercise</b> is generated.</li>
                <li>• If you’re the invited partner, you’ll still receive your own insight once both are in.</li>
                <li>• You can <b>Edit</b> your entry until your partner submits theirs.</li>
                <li>• Aim for kind, concrete language. Future-you is the audience.</li>
              </ul>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: '💞', label: 'Feelings about partner' },
                  { icon: '🧠', label: 'Stories about relationship' },
                  { icon: '🧩', label: 'Stories about life' },
                  { icon: '🌤️', label: 'Feelings about life' },
                ].map((it, i) => (
                  <div key={i} className="bg-white/10 rounded-lg p-3 border border-white/10">
                    <div className="text-white/90 text-sm">
                      <span className="mr-2">{it.icon}</span>
                      <span className="font-medium">{it.label}</span>
                    </div>
                    <p className="text-white/80 text-xs mt-1">
                      Keep it specific to this week (last 7 days).
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Prompts + example */}
            <div className="bg-black/10 rounded-xl p-5 border border-white/10">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15">✍️</span>
                Writing Prompts & Example
              </h3>

              <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                <p className="text-white/90 text-sm">
                  <span className="opacity-90">Example:</span> “This week I’ve felt <b>tender and a bit worn down</b>.
                  I notice the story, ‘we don’t have enough time together,’ and I felt <b>calmer</b> after our walk.”
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <p className="text-white font-medium mb-2">Helpful Prompts</p>
                  <ul className="text-white/90 text-sm space-y-2">
                    <li>• “What emotion shows up most when I think of my partner?”</li>
                    <li>• “What story am I telling myself about us?”</li>
                    <li>• “What else in life is coloring my mood?”</li>
                    <li>• “What would +1% better look like next week?”</li>
                  </ul>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <p className="text-white font-medium mb-2">When Reading Insights</p>
                  <ul className="text-white/90 text-sm space-y-2">
                    <li>• Receive with curiosity, not defense.</li>
                    <li>• Use <b>I-language</b> (“I notice…”, “I’m wanting…”).</li>
                    <li>• Plan one small reconnection moment (walk, hug, 10-minute chat).</li>
                    <li>• Don’t quote each other’s entries; focus on feelings & needs.</li>
                  </ul>
                </div>
              </div>

              <p className="text-white/80 text-xs mt-4">
                Tip: Consistency beats intensity—do this weekly and keep entries brief (5–7 minutes).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* If no partner and you are premium, SHOW invite card but DO NOT early return */}
      {!partnerInfo && !userData?.invited_by && (
        <div className="bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-lg p-8 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-brand-green/20 mb-6">
            <Users className="h-8 w-8 text-brand-green" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-3">Invite Your Partner</h2>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            To get started with the Internal World experience, invite your partner to join the platform.
          </p>
          <Link to="/settings">
            <Button className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white flex items-center mx-auto">
              <Settings className="h-4 w-4 mr-2" />
              Go to Settings to Invite Partner
            </Button>
          </Link>
        </div>
      )}

      {/* Errors */}
      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* Week nav */}
      <div className="flex items-center justify-between bg-gradient-to-br from-[#021E3C] to-[#03274B] p-4 rounded-lg">
        <Button
          variant="outline"
          onClick={() => navigateToWeek('prev')}
          className="border-white/20 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous Week
        </Button>

        <div className="text-center">
          <h2 className="text-lg font-medium text-white">
            Week of {weekStartFormatted} - {weekEndFormatted}
          </h2>
          {isCurrentWeek && (
            <span className="text-xs bg-brand-green/20 text-brand-green px-2 py-1 rounded-full">
              Current Week
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {(myEntry || partnerEntry || reconnectionExercise) && (
            <Button
              variant="outline"
              onClick={clearCurrentWeekEntries}
              disabled={isClearing}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              {isClearing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Week
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => navigateToWeek('next')}
            disabled={isCurrentWeek}
            className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
          >
            Next Week
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My entry */}
        <div className="bg-[#01B1AF] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-3">
                <User className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-medium text-white">My Internal World</h2>
            </div>
            {myEntry && (
              <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Submitted
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                How I've been feeling about my partner
              </label>
              <textarea
                value={formData.feelings_about_partner}
                onChange={(e) =>
                  setFormData({ ...formData, feelings_about_partner: e.target.value })
                }
                className="w-full p-3 bg-white text-black border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-brand-green"
                rows={3}
                placeholder="Share your feelings about your partner this week..."
                required
                disabled={isSubmitting || !!myEntry}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                What I've been telling myself about my partner or our relationship
              </label>
              <textarea
                value={formData.thoughts_about_relationship}
                onChange={(e) =>
                  setFormData({ ...formData, thoughts_about_relationship: e.target.value })
                }
                className="w-full p-3 bg-white text-black border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-brand-green"
                rows={3}
                placeholder="Share the thoughts or stories you've been telling yourself..."
                required
                disabled={isSubmitting || !!myEntry}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                What I've been telling myself about other parts of my life
              </label>
              <textarea
                value={formData.thoughts_about_life}
                onChange={(e) => setFormData({ ...formData, thoughts_about_life: e.target.value })}
                className="w-full p-3 bg-white text-black border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-brand-green"
                rows={3}
                placeholder="Share thoughts about work, friends, personal goals..."
                required
                disabled={isSubmitting || !!myEntry}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                How I've been feeling about other parts of my life
              </label>
              <textarea
                value={formData.feelings_about_life}
                onChange={(e) =>
                  setFormData({ ...formData, feelings_about_life: e.target.value })
                }
                className="w-full p-3 bg-white text-black border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-brand-green"
                rows={3}
                placeholder="Share your feelings about work, friends, personal goals..."
                required
                disabled={isSubmitting || !!myEntry}
              />
            </div>

            {!myEntry && (
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-white text-[#01B1AF] hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Entry'
                  )}
                </Button>
              </div>
            )}
          </form>

          {myEntry && !partnerEntry && (
            <div className="mt-6 bg-white/10 p-4 rounded-lg border border-white/20">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-white mr-2" />
                <h3 className="text-white font-medium">Entry Submitted</h3>
              </div>
              <p className="text-white/80 text-sm">
                Your entry has been saved. Waiting for {partnerInfo?.display_name || 'your partner'} to
                complete their entry.
              </p>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Edit your entry? This will unlock your fields.')) {
                      setMyEntry(null);
                    }
                  }}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Edit Entry
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Partner side */}
        <div className="bg-[#01B1AF] rounded-lg p-6">
          <div className="flex items-center mb-6">
            <div className="bg-white/20 p-2 rounded-full mr-3">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-medium text-white">
              {partnerLabel}'s Internal World
            </h2>
          </div>

          {!myEntry ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-white/10 p-6 rounded-full mb-4">
                <Lock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Complete Your Entry First</h3>
              <p className="text-white/80 max-w-md">
                You'll be able to see your partner's status after you've completed your own entry.
              </p>
            </div>
          ) : !partnerEntry ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-white/10 p-6 rounded-full mb-4">
                <AlertCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {partnerInfo ? `Waiting for ${partnerInfo.display_name || 'your partner'}` : 'Waiting for Partner'}
              </h3>
              <p className="text-white/80 max-w-md">
                Your partner hasn't completed their entry for this week yet. Once they submit, you'll be able to generate your reconnection exercise.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-white/20 p-6 rounded-full mb-4">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {partnerInfo?.display_name || 'Partner'} Has Completed Their Entry
              </h3>
              <p className="text-white/80 max-w-md">
                Both entries are in. Your reconnection exercise will be generated shortly.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reconnection Exercise */}
      {showReconnectionExercise && !isGenerating && (
        <div className="bg-gradient-to-br from-[#ea697c] to-[#b8455c] rounded-lg p-6">
          <div className="flex items-center mb-6">
            <div className="bg-white/20 p-2 rounded-full mr-3">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-medium text-white">Your Reconnection Exercise</h2>
          </div>

          <div className="space-y-8">
            <div className="bg-white/10 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">👤</span>
                <h3 className="text-white font-medium text-lg">Your Personal Insight</h3>
              </div>
              {(() => {
                const isCurrentUserPremium = !userData?.invited_by;
                const userInsight = isCurrentUserPremium
                  ? reconnectionExercise!.partner_a_summary
                  : reconnectionExercise!.partner_b_summary;

                if (!userInsight) return <span className="italic text-gray-200">No insight yet.</span>;

                const sections = {
                  navigating: userInsight.match(/💡 What Your Partner Might Be Navigating:\s*(.*?)(?=🧠|$)/s)?.[1]?.trim(),
                  thingsToHold: userInsight.match(/🧠 Things to Hold in Mind:\s*(.*?)(?=💬|$)/s)?.[1]?.trim(),
                  trySaying: userInsight.match(/💬 Try Saying:\s*(.*?)(?=🧘‍♀️|$)/s)?.[1]?.trim(),
                  microPractice: userInsight.match(/🧘‍♀️ Micro Practice:\s*(.*?)$/s)?.[1]?.trim(),
                };

                return (
                  <div className="space-y-6">
                    {sections.navigating && (
                      <div>
                        <h4 className="text-white font-medium mb-2 flex items-center">
                          <span className="mr-2">💡</span>
                          What Your Partner Might Be Navigating:
                        </h4>
                        <p className="text-white/90 leading-relaxed">{sections.navigating}</p>
                      </div>
                    )}

                    {sections.thingsToHold && (
                      <div>
                        <h4 className="text-white font-medium mb-2 flex items-center">
                          <span className="mr-2">🧠</span>
                          Things to Hold in Mind:
                        </h4>
                        <div className="text-white/90 leading-relaxed whitespace-pre-line">
                          {sections.thingsToHold}
                        </div>
                      </div>
                    )}

                    {sections.trySaying && (
                      <div>
                        <h4 className="text-white font-medium mb-2 flex items-center">
                          <span className="mr-2">💬</span>
                          Try Saying:
                        </h4>
                        <div className="text-white/90 leading-relaxed whitespace-pre-line">
                          {sections.trySaying}
                        </div>
                      </div>
                    )}

                    {sections.microPractice && (
                      <div>
                        <h4 className="text-white font-medium mb-2 flex items-center">
                          <span className="mr-2">🧘‍♀️</span>
                          Micro Practice:
                        </h4>
                        <p className="text-white/90 leading-relaxed">{sections.microPractice}</p>
                      </div>
                    )}

                    {!sections.navigating &&
                      !sections.thingsToHold &&
                      !sections.trySaying &&
                      !sections.microPractice && (
                        <div className="text-white/90 whitespace-pre-wrap">{userInsight}</div>
                      )}
                  </div>
                );
              })()}
            </div>

            {reconnectionExercise?.audio_url && (
              <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Audio Version</h3>
                <audio controls className="w-full" src={reconnectionExercise.audio_url}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual generation (useful for testing) */}
      {bothEntriesSubmitted && !reconnectionExercise && !isGenerating && (
        <div className="bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-lg p-6 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-brand-green/20 mb-6">
            <Heart className="h-8 w-8 text-brand-green" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Generate Reconnection Exercise</h3>
          <p className="text-gray-300 max-w-md mx-auto mb-4">
            Both entries are complete. Click below to generate your personalized reconnection exercise.
          </p>

          <Button
            onClick={() => generateReconnectionExercise(premiumUserId!, myEntry!, partnerEntry!)}
            className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white"
          >
            Generate Exercise
          </Button>
        </div>
      )}

      {/* Generating spinner */}
      {isGenerating && !reconnectionExercise && (
        <div className="bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-lg p-6 text-center">
          <Loader2 className="h-8 w-8 text-brand-green animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Generating Your Reconnection Exercise</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Our AI is carefully analyzing both of your entries to create a personalized reconnection experience.
            This may take a moment...
          </p>
        </div>
      )}
    </div>
  );
}
