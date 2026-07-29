// src/components/insights/InsightsPage.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useSubscription } from "../../context/SubscriptionContext";
import { supabase } from "../../lib/supabase";
import FeatureAccessGuard from "../subscription/FeatureAccessGuard";
import PaywallGate from "../subscription/PaywallGate";

import MoodHeatmapCalendar from "./MoodHeatmapCalendar";
import EnhancedMoodTrends from "./EnhancedMoodTrends";

import { Pie, Line, Radar } from "react-chartjs-2";
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfYear,
  isWithinInterval,
  subMonths,
  eachDayOfInterval,
} from "date-fns";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

import {
  Brain,
  Heart,
  Trophy,
  ArrowRight,
  Bed,
  Pill,
  FileText,
  Star,
  Target,
  CheckCircle2,
  Calendar,
  Users,
  BookOpen,
  ListChecks,
} from "lucide-react";

import { toast } from "react-hot-toast";
import { getQuizResults, formatTypeLabel as formatQuizTypeLabel } from "../../utils/quizUtils";
import { ALL_QUIZZES } from "../../data/quizData";
import { trackActivity } from "../../utils/trackActivity";

/* ==== Couple trends card (self-contained) ==== */
import CoupleTrendsCard from "../../components/couples/CoupleTrendsCard";
import HabitTrendsCard from "../habits/HabitTrendsCard";

/** Use inviter as the shared owner so both partners see the same board */
function getEffectiveOwnerId(user?: { id?: string; invited_by?: string | null } | null) {
  if (!user?.id) return null;
  return (user.invited_by as string) || (user.id as string);
}


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend
);

type Habit = {
  id: string;
  user_id: string;
  name: string;
  target_value?: number | null;
  target_unit?: string | null;
  frequency: "daily" | "weekly" | "monthly";
  is_active: boolean;
  color: string;
  created_at: string;
};

type HabitLog = {
  id: string;
  habit_id: string;
  log_date: string;
  completed: boolean;
  value?: number | null;
  created_at: string;
};

const initialChartState = {
  labels: [] as string[],
  datasets: [
    {
      label: "",
      data: [] as number[],
      backgroundColor: [] as string[],
      borderColor: [] as string[],
      fill: true,
    },
  ],
};

const typeColorMap = {
  positive: "#01B1AF",
  neutral: "#FFA600",
  negative: "#E03B3B",
};

const FEATURE_LABELS: Record<string, string> = {
  journal: "Journal Entries",
  mood: "Mood Tracking",
  exercise: "Exercises",
  goals: "Goals",
  balance_checkin: "Life Balance",
  love_radar: "Love Radar",
  values_quiz: "Values Quiz",
  attachment_quiz: "Attachment Quiz",
  love_quiz: "Love Language Quiz",
  insights_page: "Insights Page",
  insights_page_view: "Insights Page Views",
};
const FEATURE_ALIASES: Record<string, string> = {
  insights_page_view: "insights_page",
  insights: "insights_page",
};

// Pastel gradients for bucket preview tiles (light, readable on dark text)
const BUCKET_SOFT = [
  { bg: "bg-[#4A7BA7]/10", border: "border-[#4A7BA7]/30" },
  { bg: "bg-[#C17481]/10", border: "border-[#C17481]/30" },
  { bg: "bg-[#D4A574]/10", border: "border-[#D4A574]/30" },
  { bg: "bg-[#8FA677]/10", border: "border-[#8FA677]/30" },
  { bg: "bg-[#4A4A72]/10", border: "border-[#4A4A72]/30" },
  { bg: "bg-[#3A6B7C]/10", border: "border-[#3A6B7C]/30" },
  { bg: "bg-[#5A8A8C]/10", border: "border-[#5A8A8C]/30" },
  { bg: "bg-[#C89B9B]/10", border: "border-[#C89B9B]/30" },
];




export default function InsightsPage() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPlusOrPremium = hasAccess("insights");

  if (!isPlusOrPremium) {
    return (
      <FeatureAccessGuard featureId="insights" currentPlan={currentPlan}>
        <InsightsPageContent />
      </FeatureAccessGuard>
    );
  }

  return <InsightsPageContent />;
}

function InsightsPageContent() {
  const navigate = useNavigate();
  const { userData } = useUser();

  // ⬇️ add these
  const { hasAccess, currentPlan } = useSubscription();
  const couplesUnlocked = currentPlan === "premium";


  // ===== NEW: raw series for charts that need per-row data =====
  const [rawMoods, setRawMoods] = useState<Array<{ mood: string; date: string }>>([]);
  const [rawExercises, setRawExercises] = useState<Array<{ created_at: string }>>([]);

  // charts
  const [moodData, setMoodData] = useState<any>(initialChartState);
  const [activityData, setActivityData] = useState<any>(initialChartState);
  const [exerciseData, setExerciseData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: "Exercises",
        data: [],
        borderColor: "#021E3C",
        backgroundColor: "rgba(2, 30, 60, 0.1)",
        fill: true,
      },
    ],
  });
  const [moodTimeData, setMoodTimeData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: "Positive",
        data: [],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Neutral",
        data: [],
        borderColor: "#94a3b8",
        backgroundColor: "rgba(148, 163, 184, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Negative",
        data: [],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  });
  const [moodTimeframe, setMoodTimeframe] = useState<"week" | "month" | "3months">("week");

  // stats & cards
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [balanceEntries, setBalanceEntries] = useState<any[]>([]);
  const [intimacyEntries, setIntimacyEntries] = useState<any[]>([]);
  const [selectedCurrent, setSelectedCurrent] = useState<any>(null);
  const [selectedComparison, setSelectedComparison] = useState<any>(null);
  const [selectedIntimacyCurrent, setSelectedIntimacyCurrent] = useState<any>(null);
  const [selectedIntimacyComparison, setSelectedIntimacyComparison] = useState<any>(null);
  const [nextSessionDate, setNextSessionDate] = useState<string | null>(null);
  const [lastJournalEntry, setLastJournalEntry] = useState<any>(null);
  const [attachmentStyle, setAttachmentStyle] = useState<string | null>(null);
  const [loveLanguage, setLoveLanguage] = useState<string | null>(null);
  const [conflictStyle, setConflictStyle] = useState<string | null>(null);
  const [communicationStyle, setCommunicationStyle] = useState<string | null>(null);
  const [selfEsteem, setSelfEsteem] = useState<string | null>(null);
  const [emotionalIntelligence, setEmotionalIntelligence] = useState<string | null>(null);
  const [emotionalRegulation, setEmotionalRegulation] = useState<string | null>(null);
  const [redFlagAwareness, setRedFlagAwareness] = useState<string | null>(null);
  const [relationshipReadiness, setRelationshipReadiness] = useState<string | null>(null);
  const [personality, setPersonality] = useState<string | null>(null);
  const [coreValues, setCoreValues] = useState<string[]>([]);
  const [datingEntryCount, setDatingEntryCount] = useState<number>(0);
  const [lastDateEntry, setLastDateEntry] = useState<any>(null);
  const [cardCompletionCount, setCardCompletionCount] = useState<number>(0);
  const [lastCardView, setLastCardView] = useState<any>(null);
  const [topGoals, setTopGoals] = useState<any[]>([]);
  const [bucketListItems, setBucketListItems] = useState<any[]>([]);
  const [sharedBucketListItems, setSharedBucketListItems] = useState<any[]>([]);
  const [sharedValues, setSharedValues] = useState<string[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [medicationData, setMedicationData] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [moodRange, setMoodRange] = useState<"all" | "week" | "month" | "quarter" | "year">("all");
  const [yearStats, setYearStats] = useState<{ positive: number; neutral: number; negative: number }>({
    positive: 0,
    neutral: 0,
    negative: 0,
  });
  const [internalWorldEntries, setInternalWorldEntries] = useState<any[]>([]);
  const [reconnectionExercises, setReconnectionExercises] = useState<any[]>([]);
  const [expandedInternalWorld, setExpandedInternalWorld] = useState<boolean>(false);

  // habits snapshot
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs7d, setHabitLogs7d] = useState<HabitLog[]>([]);
  const [habitCompletionRate, setHabitCompletionRate] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Refs
  const pieChartRef = useRef<any>(null);
  const barChartRef = useRef<any>(null);
  const lineChartRef = useRef<any>(null);
  const moodLineChartRef = useRef<any>(null);
  const radarChartRef = useRef<any>(null);
  const intimacyRadarChartRef = useRef<any>(null);

  // Pie chart data
  const pieChartData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        data: [yearStats.positive, yearStats.neutral, yearStats.negative],
        backgroundColor: [typeColorMap.positive, typeColorMap.neutral, typeColorMap.negative],
        borderWidth: 0,
      },
    ],
  };

  const hasYearMoodData =
    (yearStats.positive || 0) + (yearStats.neutral || 0) + (yearStats.negative || 0) > 0;

  useEffect(() => {
    if (!userData?.id) return;

    trackActivity(userData.id, "insights_page", "view").catch((e) =>
      console.error("trackActivity failed:", e)
    );

    loadData();

    return () => {
      pieChartRef.current?.destroy?.();
      barChartRef.current?.destroy?.();
      lineChartRef.current?.destroy?.();
      moodLineChartRef.current?.destroy?.();
      radarChartRef.current?.destroy?.();
      intimacyRadarChartRef.current?.destroy?.();
    };
  }, [userData?.id]);

  useEffect(() => {
    if (userData?.id) loadMoodTimeData(moodTimeframe);
  }, [userData?.id, moodTimeframe]);

  const loadData = async () => {
    if (!userData?.id) return;

    try {
      const [
        { data: moods },
        { data: activities, error: activitiesErr },
        { data: exercises },
        { data: sessions },
        { data: balance },
        { data: intimacy },
        { data: nextSession },
        { data: lastJournal },
        { data: goals },
        { data: sleep },
        { data: medications },
        { data: journal },
        { data: internalWorld },
        { data: reconnection },
        { data: habitsData },
        { data: bucketList },
        { data: sharedBucketList },
      ] = await Promise.all([
        supabase.from("moods").select("mood, date").eq("user_id", userData.id).order("date"),
        supabase
          .from("user_activity")
          .select("feature_type, action_type, user_id, created_at")
          .eq("user_id", userData.id),
        supabase.from("exercise_views").select("created_at").eq("user_id", userData.id),
        supabase.from("therapy_sessions").select("id").eq("user_id", userData.id),
        supabase
          .from("life_balance_history")
          .select("id, date, scores")
          .eq("user_id", userData.id)
          .order("date"),
        supabase
          .from("intimacy_wheel_history")
          .select("id, date, scores")
          .eq("user_id", userData.id)
          .order("date"),
        supabase
          .from("therapy_sessions")
          .select("date, next_session")
          .eq("user_id", userData.id)
          .order("date", { ascending: false })
          .limit(1),
        supabase
          .from("journal_entries")
          .select("id, title, created_at")
          .eq("user_id", userData.id)
          .order("created_at", { ascending: false })
          .limit(1),
        supabase
          .from("smart_goals")
          .select("id, title, status, target_date")
          .eq("user_id", userData.id)
          .eq("status", "in_progress")
          .order("target_date", { ascending: true })
          .limit(3),
        supabase
          .from("sleep_entries")
          .select("*")
          .eq("user_id", userData.id)
          .order("date", { ascending: false })
          .limit(5),
        supabase.from("medications").select("*").eq("user_id", userData.id).order("name"),
        supabase
          .from("journal_entries")
          .select("id, title, created_at, mood")
          .eq("user_id", userData.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("internal_world_entries")
          .select("*")
          .eq("user_id", userData.id)
          .order("entry_date", { ascending: false })
          .limit(5),
        supabase
          .from("reconnection_exercises")
          .select("*")
          .eq("premium_user_id", userData.id)
          .order("entry_date", { ascending: false })
          .limit(3),
        supabase
          .from("habits")
          .select("*")
          .eq("user_id", userData.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          // Individual Bucket preview: a few “not started / pending” ideas
  .from("individual_bucket_items")
  .select("id, title, category, status, created_at")
  .eq("user_id", userData.id)
  .in("status", ["not_started", "pending"])
  .order("created_at", { ascending: true })
  .limit(6),
        // Shared Bucket preview: show owner’s “not started” items (same owner logic as Shared page)
(() => {
  const ownerId = getEffectiveOwnerId(userData);
  if (!ownerId) return { data: [], error: null } as any;
  return supabase
    .from("couple_bucket_items")
    .select("id, title, category, status, created_at")
    .eq("owner_user_id", ownerId)
    .eq("status", "not_started")
    .order("created_at", { ascending: true })
    .limit(6);
})(),
      ]);

      if (activitiesErr) {
        console.error("Feature activity fetch error:", activitiesErr);
        toast.error("Could not load feature activity");
      }

      // ====== keep raw rows for the heatmap/trends ======
      setRawMoods((moods || []) as Array<{ mood: string; date: string }>);
      setRawExercises((exercises || []) as Array<{ created_at: string }>);

      // derived & counters
      const filtered = getFilteredMoodsByRange(moodRange, moods || []);
      setMoodData(processMoodData(filtered));
      setActivityData(processActivityData(activities || []));
      setExerciseData(processExerciseData(exercises || []));

      setSessionCount(sessions?.length || 0);
      setBalanceEntries(balance || []);
      setIntimacyEntries(intimacy || []);
      setNextSessionDate(nextSession?.[0]?.next_session || null);
      setLastJournalEntry(lastJournal?.[0] || null);
      setTopGoals(goals || []);
      setBucketListItems(bucketList || []);
      setSharedBucketListItems(sharedBucketList || []);
      setSleepData(sleep || []);
      setMedicationData(medications || []);
      setJournalEntries(journal || []);
      setInternalWorldEntries(internalWorld || []);
      setReconnectionExercises(reconnection || []);
      setYearStats(calculateYearStats(moods || []));

      if (balance?.length) setSelectedCurrent(balance[balance.length - 1]);
      if (intimacy?.length) setSelectedIntimacyCurrent(intimacy[intimacy.length - 1]);

      // quizzes
      try {
        const quizRows = await getQuizResults(userData.id);
        console.log("📊 Quiz rows retrieved:", quizRows);
        console.log("📊 Number of quiz results:", quizRows.length);

        if (quizRows.length > 0) {
          console.log("📊 Quiz IDs found:", quizRows.map((r: any) => r.quiz_id));
          quizRows.forEach((row: any) => {
            console.log(`📊 Quiz ${row.quiz_id}:`, {
              dominantType: row.dominantType,
              answers: row.answers
            });
          });
        }

        const attachment = getLatestResultLabel(quizRows as any, "attachment");
        console.log("📊 Attachment result:", attachment);
        if (attachment) setAttachmentStyle(attachment);

        const love = getLatestResultLabel(quizRows as any, "love");
        console.log("📊 Love language result:", love);
        if (love) setLoveLanguage(love);

        const conflict = getLatestResultLabel(quizRows as any, "conflict");
        if (conflict) setConflictStyle(conflict);

        const communication = getLatestResultLabel(quizRows as any, "communication");
        if (communication) setCommunicationStyle(communication);

        const esteem = getLatestResultLabel(quizRows as any, "selfEsteem");
        if (esteem) setSelfEsteem(esteem);

        const ei = getLatestResultLabel(quizRows as any, "emotionalIntelligence");
        if (ei) setEmotionalIntelligence(ei);

        const regulation = getLatestResultLabel(quizRows as any, "emotionalRegulation");
        if (regulation) setEmotionalRegulation(regulation);

        const redFlag = getLatestResultLabel(quizRows as any, "redFlags");
        if (redFlag) setRedFlagAwareness(redFlag);

        const readiness = getLatestResultLabel(quizRows as any, "relationshipReadiness");
        if (readiness) setRelationshipReadiness(readiness);

        const personalityType = getLatestResultLabel(quizRows as any, "bigFive");
        if (personalityType) setPersonality(personalityType);
      } catch (e) {
        console.error("Quiz results read failed:", e);
      }

      // core values from values_board
      try {
        const { data: valuesData } = await supabase
          .from('values_board')
          .select('columns')
          .eq('user_id', userData.id)
          .maybeSingle();

        if (valuesData?.columns) {
          const coreValuesIds = (valuesData.columns as any)['Core Values'] || [];
          const coreValuesNames = coreValuesIds.map((id: string) => {
            const parts = id.split('-');
            return parts.slice(1).join('-');
          });
          setCoreValues(coreValuesNames);
        }
      } catch (e) {
        console.error("Core values read failed:", e);
      }

      // shared values from couple_values_board
      try {
        const { data: coupleValuesData } = await supabase
          .from('couple_values_board')
          .select('columns, owner_user_id')
          .eq('owner_user_id', userData.id)
          .maybeSingle();

        if (coupleValuesData?.columns) {
          const sharedValuesIds = (coupleValuesData.columns as any)['Core Values'] || [];
          const sharedValuesNames = sharedValuesIds.map((id: string) => {
            const parts = id.split('-');
            return parts.slice(1).join('-');
          });
          setSharedValues(sharedValuesNames);
        }
      } catch (e) {
        console.error("Shared values read failed:", e);
      }

      // dating tracker stats
      try {
        const { data: dateEntries, count } = await supabase
          .from('date_entries')
          .select('*', { count: 'exact' })
          .eq('user_id', userData.id)
          .order('date', { ascending: false })
          .limit(1);

        setDatingEntryCount(count || 0);
        if (dateEntries && dateEntries.length > 0) {
          setLastDateEntry(dateEntries[0]);
        }
      } catch (e) {
        console.error("Dating tracker read failed:", e);
      }

      // card deck completions
      try {
        const { data: cardViews, count } = await supabase
          .from('card_views')
          .select('*', { count: 'exact' })
          .eq('user_id', userData.id)
          .order('viewed_at', { ascending: false })
          .limit(1);

        setCardCompletionCount(count || 0);
        if (cardViews && cardViews.length > 0) {
          setLastCardView(cardViews[0]);
        }
      } catch (e) {
        console.error("Card views read failed:", e);
      }

      // mood time chart
      loadMoodTimeData("week");

      // habits snapshot + completion (last 7 days)
      setHabits((habitsData || []) as Habit[]);

      const habitIds = (habitsData || []).map((h: Habit) => h.id);
      if (habitIds.length) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);
        const startISO = format(start, "yyyy-MM-dd");
        const endISO = format(end, "yyyy-MM-dd");

        const { data: logs } = await supabase
          .from("habit_logs")
          .select("*")
          .in("habit_id", habitIds)
          .gte("log_date", startISO)
          .lte("log_date", endISO);

        const logsArr = (logs || []) as HabitLog[];
        setHabitLogs7d(logsArr);

        const totalPossible = habitIds.length * 7;
        const completed = logsArr.filter((l) => l.completed).length;
        setHabitCompletionRate(
          totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : null
        );
      } else {
        setHabitLogs7d([]);
        setHabitCompletionRate(null);
      }
    } catch (e) {
      console.error("Error loading insights:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoodTimeData = async (timeframe: "week" | "month" | "3months") => {
    if (!userData?.id) return;
    try {
      const { data: moods, error } = await supabase
        .from("moods")
        .select("mood, date")
        .eq("user_id", userData.id)
        .order("date");

      if (error) throw error;

      setMoodTimeData(processMoodTimeData(moods || [], timeframe));
    } catch (e) {
      console.error("Error loading mood time data:", e);
    }
  };

  const calculateSleepDuration = (sleepTime?: string, wakeTime?: string) => {
    if (!sleepTime || !wakeTime) return "N/A";
    const sleep = new Date(`2000-01-01T${sleepTime}:00`);
    let wake = new Date(`2000-01-01T${wakeTime}:00`);
    if (wake < sleep) wake.setDate(wake.getDate() + 1);
    const diffMs = wake.getTime() - sleep.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  const getAverageSleepQuality = () => {
    if (!sleepData.length) return "N/A";
    const sum = sleepData.reduce((acc, entry) => acc + entry.quality, 0);
    return (sum / sleepData.length).toFixed(1);
  };

  const getAverageSleepDuration = () => {
    if (!sleepData.length) return "N/A";
    let totalMinutes = 0;
    sleepData.forEach((entry) => {
      if (!entry.sleep_time || !entry.wake_time) return;

      const sleepTimeStr = entry.sleep_time.includes(':') ? entry.sleep_time : `${entry.sleep_time}:00`;
      const wakeTimeStr = entry.wake_time.includes(':') ? entry.wake_time : `${entry.wake_time}:00`;

      const sleep = new Date(`2000-01-01T${sleepTimeStr}`);
      let wake = new Date(`2000-01-01T${wakeTimeStr}`);

      if (isNaN(sleep.getTime()) || isNaN(wake.getTime())) return;

      if (wake < sleep) wake.setDate(wake.getDate() + 1);
      const diffMs = wake.getTime() - sleep.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      totalMinutes += diffMins;
    });

    if (totalMinutes === 0) return "N/A";

    const avgMinutes = Math.round(totalMinutes / sleepData.length);
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const calculateYearStats = (moods: any[]) => {
    const now = new Date();
    const yearStart = startOfYear(now);

    const yearMoods = moods.filter((entry) => {
      const date = new Date(entry.date);
      return isWithinInterval(date, { start: yearStart, end: now });
    });

    const moodTypes: Record<string, string[]> = {
      positive: [
        "happy",
        "excited",
        "relaxed",
        "confident",
        "blessed",
        "loved",
        "adored",
        "celebratory",
        "playful",
        "trusting",
      ],
      neutral: ["neutral", "curious", "thinking", "tired", "blah", "skeptical"],
      negative: ["sad", "angry", "anxious", "frustrated", "depressed", "disappointed", "insecure"],
    };

    return yearMoods.reduce(
      (acc: any, { mood }) => {
        let category = "neutral";
        for (const [type, moodsList] of Object.entries(moodTypes)) {
          if (moodsList.includes(mood)) {
            category = type;
            break;
          }
        }
        acc[category]++;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );
  };

  const getFilteredMoodsByRange = (range: string, moods: any[]) => {
    const now = new Date();
    let start: Date | undefined;

    switch (range) {
      case "week":
        start = startOfWeek(now);
        break;
      case "month":
        start = subMonths(now, 1);
        break;
      case "quarter":
        start = subMonths(now, 3);
        break;
      case "year":
        start = startOfYear(now);
        break;
      default:
        return moods;
    }

    return moods.filter((entry) => {
      const date = new Date(entry.date);
      return isWithinInterval(date, { start: start!, end: now });
    });
  };

  const processMoodData = (moods: any[]) => {
    if (!moods.length) return initialChartState;

    const counts = moods.reduce((acc: any, { mood }) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(counts),
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: ["#22c55e", "#3b82f6", "#ef4444", "#FFA600", "#8b5cf6"],
        },
      ],
    };
  };

  const processActivityData = (activities: Array<{ feature_type: string }>) => {
    if (!activities?.length) return initialChartState;

    const countsByKey = activities.reduce<Record<string, number>>((acc, { feature_type }) => {
      const raw = (feature_type || "").trim();
      const canonical = FEATURE_ALIASES[raw] ?? raw;
      acc[canonical] = (acc[canonical] || 0) + 1;
      return acc;
    }, {});

    const sorted = Object.entries(countsByKey).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([key]) => FEATURE_LABELS[key] ?? key);
    const data = sorted.map(([, count]) => count);

    return {
      labels,
      datasets: [
        {
          label: "Feature Usage",
          data,
          backgroundColor: "#01B1AF",
        },
      ],
    };
  };

  const processExerciseData = (exercises: any[]) => {
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split("T")[0];
      })
      .reverse();

    const counts = exercises.reduce((acc: any, { created_at }) => {
      const date = new Date(created_at).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: last7Days,
      datasets: [
        {
          label: "Exercises",
          data: last7Days.map((d) => counts[d] || 0),
          borderColor: "#021E3C",
          backgroundColor: "rgba(2, 30, 60, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const processMoodTimeData = (moods: any[], timeframe: "week" | "month" | "3months") => {
    if (!moods.length) {
      return {
        labels: [],
        datasets: [
          {
            label: "Positive",
            data: [],
            borderColor: "#22c55e",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            fill: true,
            tension: 0.4,
          },
          {
            label: "Neutral",
            data: [],
            borderColor: "#94a3b8",
            backgroundColor: "rgba(148, 163, 184, 0.1)",
            fill: true,
            tension: 0.4,
          },
          {
            label: "Negative",
            data: [],
            borderColor: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      };
    }

    const now = new Date();
    let startDate: Date, endDate: Date, dateFormat: string, interval: Date[];

    if (timeframe === "week") {
      startDate = startOfWeek(now);
      endDate = endOfWeek(now);
      dateFormat = "EEE";
      interval = eachDayOfInterval({ start: startDate, end: endDate });
    } else if (timeframe === "month") {
      startDate = subMonths(now, 1);
      endDate = now;
      dateFormat = "MMM d";
      interval = eachDayOfInterval({ start: startDate, end: endDate }).filter((_, i) => i % 3 === 0);
    } else {
      startDate = subMonths(now, 3);
      endDate = now;
      dateFormat = "MMM d";
      interval = eachDayOfInterval({ start: startDate, end: endDate }).filter((_, i) => i % 7 === 0);
    }

    const moodTypes: Record<string, string[]> = {
      positive: [
        "happy",
        "excited",
        "relaxed",
        "confident",
        "blessed",
        "loved",
        "adored",
        "celebratory",
        "playful",
        "trusting",
      ],
      neutral: ["neutral", "curious", "thinking", "tired", "blah", "skeptical"],
      negative: ["sad", "angry", "anxious", "frustrated", "depressed", "disappointed", "insecure"],
    };

    const categorized = moods.map((entry) => {
      let category = "neutral";
      for (const [type, list] of Object.entries(moodTypes)) {
        if (list.includes(entry.mood)) {
          category = type;
          break;
        }
      }
      return { ...entry, category };
    });

    const moodCounts: Record<string, { positive: number; neutral: number; negative: number }> = {};
    interval.forEach((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      moodCounts[dateStr] = { positive: 0, neutral: 0, negative: 0 };
    });

    categorized.forEach(({ date, category }) => {
      if (moodCounts[date]) {
        (moodCounts as any)[date][category]++;
      }
    });

    const labels = interval.map((date) => format(date, dateFormat));
    const datasets = [
      {
        label: "Positive",
        data: interval.map((date) => (moodCounts as any)[format(date, "yyyy-MM-dd")].positive),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Neutral",
        data: interval.map((date) => (moodCounts as any)[format(date, "yyyy-MM-dd")].neutral),
        borderColor: "#94a3b8",
        backgroundColor: "rgba(148, 163, 184, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Negative",
        data: interval.map((date) => (moodCounts as any)[format(date, "yyyy-MM-dd")].negative),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ];

    return { labels, datasets };
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        pointLabels: { display: true, color: "#fff", font: { size: 12 } },
        grid: { display: true, color: "#444", circular: true },
        ticks: { display: true, color: "#aaa", backdropColor: "transparent", stepSize: 2 },
        suggestedMin: 0,
        suggestedMax: 10,
        angleLines: { display: true, color: "#444" },
      },
      y: {
        display: true,
        ticks: { color: "#fff", font: { size: 12 } },
        grid: { color: "#333", drawBorder: false },
      },
      x: {
        display: true,
        ticks: { color: "#fff", font: { size: 12 } },
        grid: { color: "#333", drawBorder: false },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: { color: "#fff", font: { size: 12 }, usePointStyle: true },
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#444",
        borderWidth: 1,
      },
    },
  };

  const pieChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: { color: "#374151", font: { size: 12 }, boxWidth: 12, padding: 8 },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
  };

  const radarOptions: any = {
    ...chartOptions,
    scales: {
      r: {
        ...chartOptions.scales.r,
        min: 0,
        max: 10,
        ticks: { stepSize: 2, display: true, color: "#aaa", backdropColor: "transparent" },
      },
    },
  };

  const radarOptionsWhiteBg: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        pointLabels: { display: true, color: "#374151", font: { size: 12 } },
        grid: { display: true, color: "#e5e7eb", circular: true },
        ticks: { display: true, color: "#6b7280", backdropColor: "transparent", stepSize: 2 },
        suggestedMin: 0,
        suggestedMax: 10,
        min: 0,
        max: 10,
        angleLines: { display: true, color: "#e5e7eb" },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: { color: "#374151", font: { size: 12 }, usePointStyle: true },
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#444",
        borderWidth: 1,
      },
    },
  };

  const createRadarChartData = () => {
    if (!selectedCurrent?.scores?.length) return initialChartState;

    const labels = selectedCurrent.scores.map((s: any) => s.id);
    const currentScores = selectedCurrent.scores.map((s: any) => s.score);
    const comparisonScores = selectedComparison?.scores?.map((s: any) => s.score) || [];

    return {
      labels,
      datasets: [
        {
          label: "Current Check-in",
          data: currentScores,
          backgroundColor: "rgba(1, 177, 175, 0.4)",
          borderColor: "rgba(1, 177, 175, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(1, 177, 175, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(1, 177, 175, 1)",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        selectedComparison && {
          label: `Compared to ${format(parseISO(selectedComparison.date), "MMM d, yyyy")}`,
          data: comparisonScores,
          backgroundColor: "rgba(156, 163, 175, 0.2)",
          borderColor: "rgba(107, 114, 128, 1)",
          borderWidth: 2,
          borderDash: [5, 5],
          pointBackgroundColor: "rgba(107, 114, 128, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(107, 114, 128, 1)",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ].filter(Boolean),
    };
  };

  const createIntimacyRadarChartData = () => {
    if (!selectedIntimacyCurrent?.scores?.length) return initialChartState;

    const labels = selectedIntimacyCurrent.scores.map((s: any) => s.id);
    const currentScores = selectedIntimacyCurrent.scores.map((s: any) => s.score);
    const comparisonScores = selectedIntimacyComparison?.scores?.map((s: any) => s.score) || [];

    return {
      labels,
      datasets: [
        {
          label: "Current Check-in",
          data: currentScores,
          backgroundColor: "rgba(236, 72, 153, 0.4)",
          borderColor: "rgba(236, 72, 153, 1)",
          borderWidth: 2,
          pointBackgroundColor: "rgba(236, 72, 153, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(236, 72, 153, 1)",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        selectedIntimacyComparison && {
          label: `Compared to ${format(parseISO(selectedIntimacyComparison.date), "MMM d, yyyy")}`,
          data: comparisonScores,
          backgroundColor: "rgba(156, 163, 175, 0.2)",
          borderColor: "rgba(107, 114, 128, 1)",
          borderWidth: 2,
          borderDash: [5, 5],
          pointBackgroundColor: "rgba(107, 114, 128, 1)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(107, 114, 128, 1)",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ].filter(Boolean),
    };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // === QUIZ HELPERS ===
  function deriveDominantSlugFromAnswers(answers: any, slug: string): string | null {
    if (!answers) return null;

    // Preferred: new shape { items, summary }
    if (answers?.summary?.kind === 'typology' && answers.summary.dominant) {
      return answers.summary.dominant as string;
    }
    if (answers?.summary?.kind === 'bigFive' && answers.summary.dominant) {
      return answers.summary.dominant as string;
    }

    // Back-compat: older shape { result: "<slug>" }
    if (!Array.isArray(answers) && typeof answers === "object" && "result" in answers) {
      return (answers as any).result as string;
    }

    if (Array.isArray(answers)) {
      if (slug !== "bigFive") return null;
      const q = ALL_QUIZZES.bigFive.questions as any[];
      const totals: Record<string, number> = {};
      answers.forEach((ans: any, idx: number) => {
        const opts = q[idx]?.options;
        const picked = opts?.find((o: any) => Number(o.id) === Number(ans.selectedAnswer));
        if (!picked) return;
        const [trait, maybeReverse] = String(picked.type).split(":");
        const isReverse = maybeReverse === "reverse";
        const v = Number(ans.selectedAnswer);
        const score = isNaN(v) ? 0 : v;
        totals[trait] = (totals[trait] || 0) + (isReverse ? 7 - score : score);
      });
      return Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    }

    const values = Object.values(answers) as Array<{ type: string; value: number }>;
    if (slug === "bigFive") {
      const totals: Record<string, number> = {};
      values.forEach((a) => {
        const [trait, maybeReverse] = String(a.type).split(":");
        const isReverse = maybeReverse === "reverse";
        const v = Number(a.value);
        const score = isNaN(v) ? 0 : v;
        totals[trait] = (totals[trait] || 0) + (isReverse ? 7 - score : score);
      });
      return Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    } else {
      const counts: Record<string, number> = {};
      values.forEach((a) => {
        counts[a.type] = (counts[a.type] || 0) + 1;
      });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    }
  }

  function getLatestResultLabel(rows: Array<{ quiz_id: string; answers: any }>, slug: string): string | null {
    if (!rows?.length) return null;
    const row = rows.find((r) => r.quiz_id === slug);
    if (!row) return null;
    const labelSlug = deriveDominantSlugFromAnswers(row.answers, slug);
    return labelSlug ? formatQuizTypeLabel(labelSlug) : null;
  }

  // ============ UI ============
  // ==== Self-Knowledge cards (for uniform rendering) ====
const selfKnowledgeItems: Array<{
  key: string;
  label: string;
  value: string | null;
  route: string;
  border: string; // tailwind color classes already used in your file
}> = [
  { key: "attachmentStyle", label: "Attachment Style", value: attachmentStyle, route: "/dashboard/quizzes/attachment", border: "border-[#4A7BA7]/30 bg-[#4A7BA7]/10" },
  { key: "loveLanguage", label: "Love Language", value: loveLanguage, route: "/dashboard/quizzes/love", border: "border-[#C17481]/30 bg-[#C17481]/10" },
  { key: "conflictStyle", label: "Conflict Style", value: conflictStyle, route: "/dashboard/quizzes/conflict", border: "border-[#D4A574]/30 bg-[#D4A574]/10" },
  { key: "communicationStyle", label: "Communication Style", value: communicationStyle, route: "/dashboard/quizzes/communication", border: "border-[#8FA677]/30 bg-[#8FA677]/10" },
  { key: "selfEsteem", label: "Self-Esteem", value: selfEsteem, route: "/dashboard/quizzes/selfEsteem", border: "border-[#4A4A72]/30 bg-[#4A4A72]/10" },
  { key: "emotionalIntelligence", label: "Emotional Intelligence", value: emotionalIntelligence, route: "/dashboard/quizzes/emotionalIntelligence", border: "border-[#3A6B7C]/30 bg-[#3A6B7C]/10" },
  { key: "emotionalRegulation", label: "Emotional Regulation", value: emotionalRegulation, route: "/dashboard/quizzes/emotionalRegulation", border: "border-[#5A8A8C]/30 bg-[#5A8A8C]/10" },
  { key: "redFlagAwareness", label: "Red Flag Awareness", value: redFlagAwareness, route: "/dashboard/quizzes/redFlags", border: "border-[#C17481]/30 bg-[#C17481]/10" },
  { key: "relationshipReadiness", label: "Relationship Readiness", value: relationshipReadiness, route: "/dashboard/quizzes/relationshipReadiness", border: "border-[#C89B9B]/30 bg-[#C89B9B]/10" },
  { key: "personality", label: "Personality", value: personality, route: "/dashboard/quizzes/bigFive", border: "border-[#4A7BA7]/30 bg-[#4A7BA7]/10" },
];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">Insights & Analytics</h1>
          <p className="text-lg text-white/80">Track your emotional and behavioral progress over time</p>
        </div>
      </div>

      {/* ====== TOP: Left column (pie + heatmap stacked), Right column (trends) ====== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left stack */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Emotional Landscape */}
          <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
            <div className="bg-gradient-to-br from-[#0068aa] to-[#004d7f] p-4">
              <div className="flex items-center mb-1">
                <Brain className="h-6 w-6 text-white mr-3" />
                <h2 className="text-xl font-semibold text-white">Emotional Landscape</h2>
              </div>
              <p className="text-sm text-white/80">Track the frequency of your moods over time.</p>
            </div>
            <div className="p-6">
            <div style={{ height: "260px" }}>
              {hasYearMoodData ? (
                <Pie data={pieChartData} options={pieChartOptions} />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-white/60 text-sm">No mood data yet.</p>
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#01B1AF]/10 rounded-md p-2 border border-[#01B1AF]/20">
                <p className="text-[11px] text-gray-600">Positive</p>
                <p className="text-base font-semibold text-gray-900">{yearStats.positive}</p>
              </div>
              <div className="bg-[#FFA600]/10 rounded-md p-2 border border-[#FFA600]/20">
                <p className="text-[11px] text-gray-600">Neutral</p>
                <p className="text-base font-semibold text-gray-900">{yearStats.neutral}</p>
              </div>
              <div className="bg-[#E03B3B]/10 rounded-md p-2 border border-[#E03B3B]/20">
                <p className="text-[11px] text-gray-600">Negative</p>
                <p className="text-base font-semibold text-gray-900">{yearStats.negative}</p>
              </div>
            </div>
            </div>
          </div>

          {/* Heatmap (now gets RAW mood rows) */}
          <MoodHeatmapCalendar moods={rawMoods} />
        </div>

        {/* Right: Mood Trends (needs RAW mood & exercise rows) */}
        <div className="md:col-span-8">
          <EnhancedMoodTrends moods={rawMoods} sleepData={sleepData} exerciseData={rawExercises} />
        </div>
      </div>

      {/* ===== Sessions & Journal side by side ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
          <div className="bg-gradient-to-br from-[#00789f] to-[#005a77] p-4">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-white mr-2" />
              <h2 className="text-lg font-semibold text-white">Session Insights</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <p className="text-gray-900">
                Sessions: <span className="text-[#01B1AF] font-semibold">{sessionCount}</span>
              </p>
              <p className="text-gray-900">
                Next Session:{" "}
                <span className="text-[#01B1AF] font-semibold">
                  {nextSessionDate ? formatDate(nextSessionDate) : "None scheduled"}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
          <div className="bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] p-4">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-white mr-2" />
              <h2 className="text-lg font-semibold text-white">Journal Entries</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <p className="text-gray-900">
                Last Entry:{" "}
                <span className="text-[#01B1AF] font-semibold">
                  {lastJournalEntry ? formatDate(lastJournalEntry.created_at) : "No entries"}
                </span>
              </p>
              {lastJournalEntry && <p className="text-gray-600 text-sm mt-2">"{lastJournalEntry.title}"</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Dating Tracker & Card Decks side by side ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
          <div className="bg-gradient-to-br from-[#ea697c] to-[#b8455c] p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="h-5 w-5 text-white mr-2" />
              <h2 className="text-lg font-semibold text-white">Dating Tracker</h2>
            </div>
            <button onClick={() => navigate("/dashboard/dating")} className="text-xs text-white/80 hover:text-white flex items-center">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <p className="text-gray-900">
                Total Dates: <span className="text-[#01B1AF] font-semibold">{datingEntryCount}</span>
              </p>
              {lastDateEntry && (
                <>
                  <p className="text-gray-900">
                    Last Date: <span className="text-[#01B1AF] font-semibold">{formatDate(lastDateEntry.date)}</span>
                  </p>
                  <p className="text-gray-600 text-sm">With {lastDateEntry.person_name}</p>
                </>
              )}
              {datingEntryCount === 0 && (
                <p className="text-gray-600 text-sm">No dates tracked yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
          <div className="bg-gradient-to-br from-[#FFA600] to-[#B36B00] p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-white mr-2" />
              <h2 className="text-lg font-semibold text-white">Card Decks</h2>
            </div>
            <button onClick={() => navigate("/dashboard/cards")} className="text-xs text-white/80 hover:text-white flex items-center">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <p className="text-gray-900">
                Cards Completed: <span className="text-[#01B1AF] font-semibold">{cardCompletionCount}</span>
              </p>
              {lastCardView && (
                <>
                  <p className="text-gray-900">
                    Last Card: <span className="text-[#01B1AF] font-semibold">{formatDate(lastCardView.viewed_at)}</span>
                  </p>
                  <p className="text-gray-600 text-sm capitalize">{lastCardView.deck_type || 'Individual'} deck</p>
                </>
              )}
              {cardCompletionCount === 0 && (
                <p className="text-gray-600 text-sm">No cards completed yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Self-Knowledge & Core Values side by side ===== */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

  {/* Self-Knowledge */}
  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md flex flex-col h-full">
    <div className="bg-gradient-to-br from-[#0068aa] to-[#004d7f] p-4">
      <div className="flex items-center">
        <Brain className="h-5 w-5 text-white mr-2" />
        <h2 className="text-lg font-semibold text-white">Self-Knowledge</h2>
      </div>
    </div>

    <div className="p-6 flex-1">
      {/* Uniform 2 columns x 5 items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {selfKnowledgeItems.map((item) => (
          <div
            key={item.key}
            className={`rounded-lg px-3 py-2 border ${item.border} h-[60px] flex items-center`}
          >
            {item.value ? (
              <div className="w-full">
                <p className="text-gray-600 text-[11px] leading-4 mb-1 truncate">{item.label}:</p>
                <p className="text-gray-900 font-medium text-[13px] leading-4 line-clamp-1">
                  {item.value}
                </p>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between">
                <p className="text-gray-900 text-[12px] leading-4 truncate">{item.label}</p>
                <button
                  onClick={() => navigate(item.route)}
                  className="text-[#01B1AF] text-[12px] leading-4 hover:underline flex items-center flex-shrink-0"
                >
                  Start <ArrowRight className="h-3 w-3 ml-1" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Core Values */}
  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md flex flex-col h-full">
    <div className="bg-gradient-to-br from-[#F27C7C] to-[#E03B3B] p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Target className="h-5 w-5 text-white mr-2" />
        <h2 className="text-lg font-semibold text-white">Core Values</h2>
      </div>
      <button
        onClick={() => navigate("/dashboard/values")}
        className="text-xs text-white/80 hover:text-white flex items-center"
      >
        View All <ArrowRight className="h-3 w-3 ml-1" />
      </button>
    </div>

    <div className="p-6 flex-1">
      {coreValues.length > 0 ? (
        // Force 10 slots; 1–5 left, 6–10 right; exact same tile height as Self-Knowledge
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Left column (1–5) */}
          <div className="space-y-3">
            {[0,1,2,3,4].map((idx) => {
              const value = coreValues[idx] ?? null;
              return (
                <div
                  key={`cv-left-${idx}`}
                  className={`rounded-lg px-3 py-2 h-[60px] flex items-center justify-between border ${
                    value ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center min-w-0">
                    <span className={`font-bold mr-3 ${
                      value ? "text-[#E03B3B]" : "text-gray-400"
                    }`}>#{idx + 1}</span>
                    <span className={`font-medium text-[13px] leading-4 truncate ${
                      value ? "text-gray-900" : "text-gray-400"
                    }`}>{value ?? "—"}</span>
                  </div>
                  {!value && (
                    <button
                      onClick={() => navigate("/dashboard/values")}
                      className="text-xs text-[#01B1AF] hover:underline flex-shrink-0"
                    >
                      Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right column (6–10) */}
          <div className="space-y-3">
            {[5,6,7,8,9].map((idx) => {
              const value = coreValues[idx] ?? null;
              return (
                <div
                  key={`cv-right-${idx}`}
                  className={`rounded-lg px-3 py-2 h-[60px] flex items-center justify-between border ${
                    value ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center min-w-0">
                    <span className={`font-bold mr-3 ${
                      value ? "text-[#E03B3B]" : "text-gray-400"
                    }`}>#{idx + 1}</span>
                    <span className={`font-medium text-[13px] leading-4 truncate ${
                      value ? "text-gray-900" : "text-gray-400"
                    }`}>{value ?? "—"}</span>
                  </div>
                  {!value && (
                    <button
                      onClick={() => navigate("/dashboard/values")}
                      className="text-xs text-[#01B1AF] hover:underline flex-shrink-0"
                    >
                      Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Empty state unchanged
        <div className="text-center py-4">
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <Target className="h-8 w-8 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 text-sm mb-3">Discover what matters most to you</p>
            <button
              onClick={() => navigate("/dashboard/quizzes/values")}
              className="text-[#01B1AF] hover:text-[#018a88] text-sm flex items-center justify-center mx-auto bg-[#01B1AF]/10 hover:bg-[#01B1AF]/20 px-4 py-2 rounded-lg transition-colors"
            >
              Take Values Quiz <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
</div>


{/* Life Balance & Love Radar */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Life Balance Radar */}
  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
    <div className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Brain className="h-5 w-5 text-white mr-2" />
        <h2 className="text-lg font-semibold text-white">Life Balance</h2>
      </div>
      <button
        onClick={() => navigate("/dashboard/balance")}
        className="text-xs text-white/80 hover:text-white flex items-center"
      >
        Check-in <ArrowRight className="h-3 w-3 ml-1" />
      </button>
    </div>

    <div className="p-6">
      {balanceEntries.length > 0 ? (
        <div>
          <div style={{ height: 300 }}>
            <Radar data={createRadarChartData()} options={radarOptionsWhiteBg} />
          </div>

          <div className="mt-4 flex gap-2">
            <select
              className="flex-1 bg-gray-50 text-gray-900 text-sm px-3 py-2 rounded border border-gray-300"
              value={selectedCurrent?.id || ""}
              onChange={(e) => {
                const entry = balanceEntries.find((b) => b.id === e.target.value);
                setSelectedCurrent(entry || null);
              }}
            >
              <option value="">Select current</option>
              {balanceEntries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {formatDate(entry.date)}
                </option>
              ))}
            </select>

            <select
              className="flex-1 bg-gray-50 text-gray-900 text-sm px-3 py-2 rounded border border-gray-300"
              value={selectedComparison?.id || ""}
              onChange={(e) => {
                const entry = balanceEntries.find((b) => b.id === e.target.value);
                setSelectedComparison(entry || null);
              }}
            >
              <option value="">Compare to...</option>
              {balanceEntries
                .filter((e) => e.id !== selectedCurrent?.id)
                .map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {formatDate(entry.date)}
                  </option>
                ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Brain className="h-8 w-8 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 text-sm mb-3">
            Track your life balance across key areas
          </p>
          <button
            onClick={() => navigate("/dashboard/balance")}
            className="text-[#01B1AF] text-sm bg-[#01B1AF]/10 hover:bg-[#01B1AF]/20 px-4 py-2 rounded-lg transition-colors"
          >
            Start Balance Check-in
          </button>
        </div>
      )}
    </div>
  </div>

  {/* Love Radar (header visible, body gated) */}
  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
    {/* Header stays visible */}
    <div className="bg-gradient-to-br from-[#e88584] to-[#8e4f63] p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Heart className="h-5 w-5 text-white mr-2" />
        <h2 className="text-lg font-semibold text-white">Love Radar</h2>
      </div>
      <button
        onClick={() => navigate("/dashboard/love-radar")}
        className="text-xs text-white/80 hover:text-white flex items-center"
      >
        Check-in <ArrowRight className="h-3 w-3 ml-1" />
      </button>
    </div>

    {/* Body is gated (use showLockedAsBlur={false} to hide instead of blur if you want) */}
    <PaywallGate featureId="love-radar" title="Love Radar">
      <div className="p-6">
        {intimacyEntries.length > 0 ? (
          <div>
            <div style={{ height: 300 }}>
              <Radar data={createIntimacyRadarChartData()} options={radarOptionsWhiteBg} />
            </div>

            <div className="mt-4 flex gap-2">
              <select
                className="flex-1 bg-gray-50 text-gray-900 text-sm px-3 py-2 rounded border border-gray-300"
                value={selectedIntimacyCurrent?.id || ""}
                onChange={(e) => {
                  const entry = intimacyEntries.find((i) => i.id === e.target.value);
                  setSelectedIntimacyCurrent(entry || null);
                }}
              >
                <option value="">Select current</option>
                {intimacyEntries.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {formatDate(entry.date)}
                  </option>
                ))}
              </select>

              <select
                className="flex-1 bg-gray-50 text-gray-900 text-sm px-3 py-2 rounded border border-gray-300"
                value={selectedIntimacyComparison?.id || ""}
                onChange={(e) => {
                  const entry = intimacyEntries.find((i) => i.id === e.target.value);
                  setSelectedIntimacyComparison(entry || null);
                }}
              >
                <option value="">Compare to...</option>
                {intimacyEntries
                  .filter((e) => e.id !== selectedIntimacyCurrent?.id)
                  .map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {formatDate(entry.date)}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="h-8 w-8 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 text-sm mb-3">
              Track intimacy dimensions in your relationship
            </p>
            <button
              onClick={() => navigate("/dashboard/love-radar")}
              className="text-[#e88584] text-sm bg-[#e88584]/10 hover:bg-[#e88584]/20 px-4 py-2 rounded-lg transition-colors"
            >
              Start Love Radar Check-in
            </button>
          </div>
        )}
      </div>
    </PaywallGate>
  </div>
</div>


{/* Sleep & Wellness Aids */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Sleep Tracking */}
  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
    <div className="bg-gradient-to-br from-[#4a5568] to-[#2d3748] p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Bed className="h-5 w-5 text-white mr-2" />
        <h2 className="text-lg font-semibold text-white">Sleep Tracking</h2>
      </div>
      <button
        onClick={() => navigate("/dashboard/sleep")}
        className="text-xs text-white/80 hover:text-white flex items-center"
      >
        Manage <ArrowRight className="h-3 w-3 ml-1" />
      </button>
    </div>

    <div className="p-6">
      {sleepData.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600">Avg Quality</p>
              <p className="text-lg font-semibold text-gray-900">
                {getAverageSleepQuality()}/10
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="text-xs text-gray-600">Avg Duration</p>
              <p className="text-lg font-semibold text-gray-900">
                {getAverageSleepDuration()}
              </p>
            </div>
          </div>

          <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
            <p className="text-xs text-gray-600 mb-2">Recent Entries</p>
            <p className="text-sm text-gray-900">{sleepData.length} sleep logs tracked</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Bed className="h-8 w-8 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 text-sm mb-3">Track your sleep patterns and quality</p>
          <button
            onClick={() => navigate("/dashboard/sleep")}
            className="text-[#01B1AF] text-sm bg-[#01B1AF]/10 hover:bg-[#01B1AF]/20 px-4 py-2 rounded-lg transition-colors"
          >
            Log Sleep
          </button>
        </div>
      )}
    </div>
  </div>

  {/* Wellness Aids (Medications) */}
  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
    <div className="bg-gradient-to-br from-[#6366f1] to-[#4f46e5] p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Pill className="h-5 w-5 text-white mr-2" />
        <h2 className="text-lg font-semibold text-white">Wellness Aids</h2>
      </div>
      <button
        onClick={() => navigate("/dashboard/medications")}
        className="text-xs text-white/80 hover:text-white flex items-center"
      >
        Manage <ArrowRight className="h-3 w-3 ml-1" />
      </button>
    </div>

    <div className="p-6">
      {medicationData.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <p className="text-xs text-gray-600">Total Wellness Aids</p>
            <p className="text-lg font-semibold text-gray-900">{medicationData.length}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-600">Current Wellness Aids</p>
            {medicationData.slice(0, 3).map((med) => (
              <div key={med.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900">{med.name}</p>
                <p className="text-xs text-gray-600 mt-1">{med.dosage}</p>
              </div>
            ))}
            {medicationData.length > 3 && (
              <p className="text-xs text-gray-600 mt-2">
                + {medicationData.length - 3} more
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Pill className="h-8 w-8 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 text-sm mb-3">Track medications and supplements</p>
          <button
            onClick={() => navigate("/dashboard/medications")}
            className="text-[#01B1AF] text-sm bg-[#01B1AF]/10 hover:bg-[#01B1AF]/20 px-4 py-2 rounded-lg transition-colors"
          >
            Add Medication
          </button>
        </div>
      )}
    </div>
  </div>
</div>

{/* Goals & More Habits */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Goals */}
  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
    <div className="bg-gradient-to-br from-[#7b5595] to-[#5d4070] p-4">
      <div className="flex items-center">
        <Trophy className="h-5 w-5 text-white mr-2" />
        <h2 className="text-lg font-semibold text-white">Current Goals</h2>
      </div>
    </div>

    <div className="p-6">
      {topGoals.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {topGoals.slice(0, 10).map((goal) => (
            <div key={goal.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                {goal.title}
              </h3>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600">
                  Target: {formatDate(goal.target_date)}
                </p>
                <span className="inline-block text-xs px-2 py-1 bg-[#01B1AF]/10 text-[#01B1AF] rounded font-medium">
                  {goal.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-600">No active goals found</p>
          <button
            onClick={() => navigate("/dashboard/goals")}
            className="text-[#01B1AF] text-sm mt-2 hover:underline flex items-center justify-center mx-auto"
          >
            Set a goal <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  </div>

  {/* More Habits */}
  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
    <div className="bg-gradient-to-br from-[#0068aa] to-[#004d7f] p-4 flex items-center justify-between">
      <div className="flex items-center">
        <CheckCircle2 className="h-5 w-5 text-white mr-2" />
        <h2 className="text-white text-lg font-semibold">More Habits</h2>
      </div>
      <button
        onClick={() => navigate("/dashboard/habits")}
        className="text-xs text-white/80 hover:text-white flex items-center"
      >
        Manage <ArrowRight className="h-3 w-3 ml-1" />
      </button>
    </div>

    <div className="p-6">
      {habits.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-xs text-gray-600">Active Habits</p>
              <p className="text-lg font-semibold text-gray-900">{habits.length}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600">7-Day Completion</p>
              <p className="text-lg font-semibold text-gray-900">
                {habitCompletionRate === null ? "—" : `${habitCompletionRate}%`}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-gray-600">Recently Tracked</p>
            {habits.slice(0, 4).map((h) => (
              <div
                key={h.id}
                className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full bg-gradient-to-br ${h.color}`} />
                  <span className="text-sm font-medium text-gray-900">{h.name}</span>
                </div>
                <span className="text-xs text-gray-600 capitalize">{h.frequency}</span>
              </div>
            ))}
          </div>

          {habitLogs7d.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="h-4 w-4" />
              Logged {habitLogs7d.filter((l) => l.completed).length} times over the last 7 days
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <CheckCircle2 className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">No habits yet</p>
          <button
            onClick={() => navigate("/dashboard/habits")}
            className="text-[#01B1AF] text-sm mt-2 hover:underline"
          >
            Create your first habit
          </button>
        </div>
      )}
    </div>
  </div>
</div>

{/* Bucket List & Shared Bucket List */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
  {/* Bucket List */}
  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
    <div className="bg-gradient-to-br from-[#FFA600] to-[#B36B00] p-4 flex items-center justify-between">
      <div className="flex items-center">
        <ListChecks className="h-5 w-5 text-white mr-2" />
        <h2 className="text-white text-lg font-semibold">Bucket List</h2>
      </div>
      <button
        onClick={() => navigate("/dashboard/bucket-list")}
        className="text-xs text-white/80 hover:text-white flex items-center"
      >
        View All <ArrowRight className="h-3 w-3 ml-1" />
      </button>
    </div>

    <div className="p-6">

    {bucketListItems.length > 0 ? (
  <>
    <p className="text-sm text-gray-600 mb-3">
      You’ve got a few ideas not started yet — pick one to get momentum. 🚀
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {bucketListItems.slice(0, 6).map((item, i) => (
        <div
          key={item.id}
        className={`rounded-lg p-3 shadow-sm border
  ${BUCKET_SOFT[i % BUCKET_SOFT.length].bg}
  ${BUCKET_SOFT[i % BUCKET_SOFT.length].border}`}
        >
          <p className="text-[13px] font-medium text-gray-900 leading-snug line-clamp-2">
            {item.title || "Untitled"}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded 
                             bg-white/70 text-gray-700 border border-white">
              Not started
            </span>
            {item.category && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-white/70 text-gray-700 border border-white">
                {item.category}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>

    <div className="pt-2">
      <button
        onClick={() => navigate("/dashboard/bucket-list")}
        className="text-[#01B1AF] text-sm hover:underline"
      >
        Choose one to begin →
      </button>
    </div>
  </>
) : (


      
        <div className="text-center py-6">
          <ListChecks className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 font-medium">Not started</p>
          <p className="text-gray-500 text-sm mt-1">
            Pick one thing you’ve always wanted to do — small is perfect. Let’s make it real.
          </p>
          <button
            onClick={() => navigate("/dashboard/bucket-list")}
            className="text-[#01B1AF] text-sm mt-3 hover:underline"
          >
            Add your first item
          </button>
        </div>
      )}
    </div>
  </div>

  {/* Shared Bucket List */}
  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
    <div className="bg-gradient-to-br from-[#F27C7C] to-[#E03B3B] p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Users className="h-5 w-5 text-white mr-2" />
        <h2 className="text-white text-lg font-semibold">Shared Bucket List</h2>
      </div>
      <button
        onClick={() => navigate("/dashboard/shared-bucket-list")}
        className="text-xs text-white/80 hover:text-white flex items-center"
      >
        View All <ArrowRight className="h-3 w-3 ml-1" />
      </button>
    </div>

    <PaywallGate featureId="couples-bucket-list" title="Shared Bucket List">
      <div className="p-6">

        {sharedBucketListItems.length > 0 ? (
  <>
    <p className="text-sm text-gray-600 mb-3">
      A few shared ideas are still not started — pick one and plan it together. 💬
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {sharedBucketListItems.slice(0, 6).map((item, i) => (
        <div
          key={item.id}
          className={`rounded-lg p-3 shadow-sm border
  ${BUCKET_SOFT[i % BUCKET_SOFT.length].bg}
  ${BUCKET_SOFT[i % BUCKET_SOFT.length].border}`}

        >
          <p className="text-[13px] font-medium text-gray-900 leading-snug line-clamp-2">
            {item.title || "Untitled"}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded 
                             bg-white/70 text-gray-700 border border-white">
              Not started
            </span>
            {item.category && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-white/70 text-gray-700 border border-white">
                {item.category}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>

    <div className="pt-2">
      <button
        onClick={() => navigate("/dashboard/shared-bucket-list")}
        className="text-[#01B1AF] text-sm hover:underline"
      >
        Choose one to plan together →
      </button>
    </div>
  </>
) : (


        
          <div className="text-center py-6">
            <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 font-medium">Not started</p>
            <p className="text-gray-500 text-sm mt-1">
              Pick one fun thing to do together this month. Invite your partner to add one too.
            </p>
            <button
              onClick={() => navigate("/dashboard/shared-bucket-list")}
              className="text-[#01B1AF] text-sm mt-3 hover:underline"
            >
              Create your first shared item
            </button>
          </div>
        )}
      </div>
    </PaywallGate>
  </div>
</div> {/* closes the 2-card grid */}

{/* Habit & Couple Trends */}
<HabitTrendsCard className="mt-8" title="Personal Habit Trends" />

{/* Couples Activity Trends (lines) */}
{couplesUnlocked ? (
  // Premium: show the full trends card
  <CoupleTrendsCard className="mt-8" title="Couples Activity Trends" />
) : (
  // Basic/Plus: show it behind the gate (dimmed preview optional)
  <PaywallGate featureId="couples-activity" title="Couples Activity">
    {/* Optional: show a blurred/disabled preview instead of an empty gate */}
    <div className="mt-8">
      <CoupleTrendsCard className="opacity-40 pointer-events-none select-none" title="Couples Activity Trends" />
    </div>
  </PaywallGate>
)}


{/* Internal World */}
<div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
  <div className="bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] p-4 flex items-center justify-between">
    <div className="flex items-center">
      <Heart className="h-5 w-5 text-white mr-2" />
      <h2 className="text-white text-lg font-semibold">Internal World Insights</h2>
    </div>
    <button
      onClick={() => navigate("/dashboard/internal-world")}
      className="text-xs text-white/80 hover:text-white flex items-center"
    >
      View All <ArrowRight className="h-3 w-3 ml-1" />
    </button>
  </div>

  <PaywallGate featureId="internal-world" title="Internal World Insights">
    <div className="p-6">
      {(internalWorldEntries.length > 0 || reconnectionExercises.length > 0) ? (
        <div className="space-y-6">
          {internalWorldEntries.length > 0 && (
            <div>
              <h3 className="text-gray-900 font-medium mb-3">Recent Entries</h3>
              <div className="space-y-4">
                {internalWorldEntries.slice(0, 3).map((entry, index) => {
                  const isCurrentWeek = index === 0;
                  const weekStart = format(startOfWeek(parseISO(entry.entry_date)), "MMM d, yyyy");
                  return (
                    <div key={entry.id} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-gray-900 font-medium">Week of {weekStart}</h4>
                        <span className="text-gray-600 text-sm">
                          {format(parseISO(entry.entry_date), "MMM d, yyyy")}
                        </span>
                      </div>

                      {isCurrentWeek && expandedInternalWorld ? (
                        <div className="space-y-4 text-sm">
                          <div>
                            <p className="text-gray-600 mb-1">Feelings about partner:</p>
                            <p className="text-gray-900">{entry.feelings_about_partner}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Relationship thoughts:</p>
                            <p className="text-gray-900">{entry.thoughts_about_relationship}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Thoughts about life:</p>
                            <p className="text-gray-900">{entry.thoughts_about_life}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1">Feelings about life:</p>
                            <p className="text-gray-900">{entry.feelings_about_life}</p>
                          </div>
                          <div className="pt-2">
                            <button
                              onClick={() => setExpandedInternalWorld(false)}
                              className="text-gray-600 hover:text-gray-900 text-sm underline"
                            >
                              Show less
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 mb-1">Feelings about partner:</p>
                              <p className="text-gray-900">
                                {entry.feelings_about_partner?.length > 100
                                  ? `${entry.feelings_about_partner.substring(0, 100)}...`
                                  : entry.feelings_about_partner}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-1">Relationship thoughts:</p>
                              <p className="text-gray-900">
                                {entry.thoughts_about_relationship?.length > 100
                                  ? `${entry.thoughts_about_relationship.substring(0, 100)}...`
                                  : entry.thoughts_about_relationship}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex justify-between items-center">
                            {isCurrentWeek ? (
                              <button
                                onClick={() => setExpandedInternalWorld(true)}
                                className="text-gray-600 hover:text-gray-900 text-sm underline"
                              >
                                Show full details
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  navigate("/dashboard/internal-world", {
                                    state: {
                                      selectedWeek: startOfWeek(parseISO(entry.entry_date)),
                                      viewMode: "history",
                                    },
                                  })
                                }
                                className="text-gray-600 hover:text-gray-900 text-sm underline"
                              >
                                View this week
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {reconnectionExercises.length > 0 && (
            <div>
              <h3 className="text-gray-900 font-medium mb-3">Recent Reconnection Exercises</h3>
              <div className="space-y-4">
                {reconnectionExercises.slice(0, 3).map((exercise) => (
                  <div key={exercise.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-gray-900 font-medium">
                        Week of {format(parseISO(exercise.entry_date), "MMM d, yyyy")}
                      </h4>
                      <span className="text-gray-600 text-sm">
                        {format(parseISO(exercise.entry_date), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">Generated insights for deeper connection</p>
                    <div className="text-sm">
                      <p className="text-gray-900">
                        💡 What Your Partner Might Be Navigating:{" "}
                        {exercise.partner_a_summary?.substring(0, 100)}...
                      </p>
                      <div className="mt-2">
                        <button
                          onClick={() =>
                            navigate("/dashboard/internal-world", {
                              state: {
                                selectedWeek: startOfWeek(parseISO(exercise.entry_date)),
                                viewMode: "exercise",
                                exerciseId: exercise.id,
                              },
                            })
                          }
                          className="text-gray-600 hover:text-gray-900 text-sm underline"
                        >
                          View full exercise
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
              <p className="text-xs text-gray-600">Total Entries</p>
              <p className="text-lg font-semibold text-gray-900">{internalWorldEntries.length}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="text-xs text-gray-600">Reconnection Exercises</p>
              <p className="text-lg font-semibold text-gray-900">{reconnectionExercises.length}</p>
            </div>
            {internalWorldEntries.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600">Latest Entry</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(internalWorldEntries[0]?.entry_date)}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <Heart className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">No internal world entries found</p>
          <button
            onClick={() => navigate("/dashboard/internal-world")}
            className="text-[#01B1AF] text-sm mt-2 hover:underline"
          >
            Start sharing your internal world
          </button>
        </div>
      )}
    </div>
  </PaywallGate>
</div>

{/* Shared Values */}
<div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md flex flex-col h-full">
  <div className="bg-gradient-to-br from-[#7b5595] to-[#5d4070] p-4 flex items-center justify-between">
    <div className="flex items-center">
      <Users className="h-5 w-5 text-white mr-2" />
      <h2 className="text-lg font-semibold text-white">Shared Values</h2>
    </div>
    <button
      onClick={() => navigate("/dashboard/shared-values")}
      className="text-xs text-white/80 hover:text-white flex items-center"
    >
      View All <ArrowRight className="h-3 w-3 ml-1" />
    </button>
  </div>

  <div className="p-6 flex-1">
    {sharedValues.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Left column (1–5) */}
        <div className="space-y-3">
          {[0,1,2,3,4].map((idx) => {
            const value = sharedValues[idx] ?? null;
            return (
              <div
                key={`sv-left-${idx}`}
                className={`rounded-lg px-3 py-2 h-[60px] flex items-center justify-between border ${
                  value ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center min-w-0">
                  <span className={`font-bold mr-3 ${
                    value ? "text-[#7b5595]" : "text-gray-400"
                  }`}>#{idx + 1}</span>
                  <span className={`font-medium text-[13px] leading-4 truncate ${
                    value ? "text-gray-900" : "text-gray-400"
                  }`}>{value ?? "—"}</span>
                </div>
                {!value && (
                  <button
                    onClick={() => navigate("/dashboard/shared-values")}
                    className="text-xs text-[#01B1AF] hover:underline flex-shrink-0"
                  >
                    Add
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right column (6–10) */}
        <div className="space-y-3">
          {[5,6,7,8,9].map((idx) => {
            const value = sharedValues[idx] ?? null;
            return (
              <div
                key={`sv-right-${idx}`}
                className={`rounded-lg px-3 py-2 h-[60px] flex items-center justify-between border ${
                  value ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center min-w-0">
                  <span className={`font-bold mr-3 ${
                    value ? "text-[#7b5595]" : "text-gray-400"
                  }`}>#{idx + 1}</span>
                  <span className={`font-medium text-[13px] leading-4 truncate ${
                    value ? "text-gray-900" : "text-gray-400"
                  }`}>{value ?? "—"}</span>
                </div>
                {!value && (
                  <button
                    onClick={() => navigate("/dashboard/shared-values")}
                    className="text-xs text-[#01B1AF] hover:underline flex-shrink-0"
                  >
                    Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ) : (
      <div className="text-center py-4">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <Users className="h-8 w-8 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 text-sm mb-3">Start building shared values with your partner</p>
          <button
            onClick={() => navigate("/dashboard/shared-values")}
            className="text-[#01B1AF] hover:text-[#018a88] text-sm flex items-center justify-center mx-auto bg-[#01B1AF]/10 hover:bg-[#01B1AF]/20 px-4 py-2 rounded-lg transition-colors"
          >
            Get Started <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    )}
  </div>
</div>
      
</div>
);
}
