import { useState, useEffect, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { supabase } from '../../lib/supabase';
import {
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Heart,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Clock,
  Check,
  X,
  AlertCircle,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Clock as ClockIcon,
  MessageCircle,
  Meh,
  Coffee,
  Users,
  Star,
  Flag,
  BarChart,
  HelpCircle,
  Sparkles,
  Grip,
  Pause,
  Palette,
  Brain,
  Target,
} from 'lucide-react';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';
import DatingGuide from './DatingGuide';

/**
 * ── Run once in Supabase (SQL) ────────────────────────────────────────────────
 * alter table public.date_entries
 * add column if not exists status text
 *   check (status in ('sparks','first_dates','getting_to_know','exclusive','pause_or_let_go'))
 *   default 'sparks';
 *
 * alter table public.date_entries
 * add column if not exists color_index int default 0;
 *
 * update public.date_entries
 * set status = coalesce(status,'sparks'), color_index = coalesce(color_index,0)
 * where status is null or color_index is null;
 * ─────────────────────────────────────────────────────────────────────────────
 */

type DatingStatus =
  | 'sparks'
  | 'first_dates'
  | 'getting_to_know'
  | 'exclusive'
  | 'pause_or_let_go';

interface DateEntry {
  id: string;
  user_id: string;
  person_name: string;
  date_number: number;
  how_met: string;
  date_type: string;
  mood_before: string;
  mood_after: string;
  energy_before: number;
  energy_after: number;
  connection_rating: number;
  red_flags?: string[];
  green_flags?: string[];
  reflection?: string;
  future_questions?: string;
  date: string;
  status?: DatingStatus;
  color_index?: number;
  created_at?: string;
  updated_at?: string;
}

/* ---------- UI constants ---------- */

const GRADIENT_OPTIONS = [
  // default teal first
  'from-[#01B1AF] to-[#018a88]',
  'from-[#e88584] to-[#8e4f63]',
  'from-[#0068aa] to-[#004d7f]',
  'from-[#FFA600] to-[#B36B00]',
  'from-[#B1E006] to-[#6C8300]',
  'from-[#F27C7C] to-[#E03B3B]',
  'from-[#080B42] to-[#6A51A6]',
  'from-[#00789f] to-[#005a77]',
  'from-[#ea697c] to-[#b8455c]',
  'from-[#008792] to-[#006a70]',
  'from-[#7b5595] to-[#5d4070]',
] as const;
const DEFAULT_GRADIENT_INDEX = 0;

const HOW_MET_OPTIONS = [
  { value: 'app', label: 'Online App' },
  { value: 'friend', label: 'Friend' },
  { value: 'work', label: 'Work' },
  { value: 'in-person', label: 'In-Person' },
  { value: 'other', label: 'Other' },
];

const DATE_TYPE_OPTIONS = [
  { value: 'coffee', label: 'Coffee' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'walk', label: 'Walk' },
  { value: 'call', label: 'Call' },
  { value: 'video', label: 'Video' },
  { value: 'other', label: 'Other' },
];

const MOODS = [
  { value: 'adored', label: 'Adored', color: 'text-red-400', icon: Heart },
  { value: 'angry', label: 'Angry', color: 'text-red-600', icon: AlertCircle },
  { value: 'anxious', label: 'Anxious', color: 'text-gray-500', icon: Clock },
  { value: 'blah', label: 'Blah', color: 'text-gray-400', icon: X },
  { value: 'blessed', label: 'Blessed', color: 'text-yellow-600', icon: CheckCircle },
  { value: 'celebratory', label: 'Celebratory', color: 'text-purple-500', icon: Check },
  { value: 'confident', label: 'Confident', color: 'text-yellow-600', icon: Check },
  { value: 'curious', label: 'Curious', color: 'text-blue-400', icon: MessageCircle },
  { value: 'depressed', label: 'Depressed', color: 'text-blue-700', icon: X },
  { value: 'disappointed', label: 'Disappointed', color: 'text-orange-700', icon: X },
  { value: 'excited', label: 'Excited', color: 'text-pink-500', icon: Check },
  { value: 'flirty', label: 'Flirty', color: 'text-pink-400', icon: Heart },
  { value: 'frustrated', label: 'Frustrated', color: 'text-orange-600', icon: X },
  { value: 'happy', label: 'Happy', color: 'text-yellow-500', icon: Check },
  { value: 'insecure', label: 'Insecure', color: 'text-gray-600', icon: X },
  { value: 'loved', label: 'Loved', color: 'text-red-500', icon: Heart },
  { value: 'neutral', label: 'Neutral', color: 'text-gray-500', icon: ClockIcon },
  { value: 'playful', label: 'Playful', color: 'text-purple-400', icon: Check },
  { value: 'relaxed', label: 'Relaxed', color: 'text-green-500', icon: Check },
  { value: 'sad', label: 'Sad', color: 'text-blue-600', icon: X },
  { value: 'skeptical', label: 'Skeptical', color: 'text-orange-500', icon: X },
  { value: 'thinking', label: 'Thinking', color: 'text-indigo-500', icon: MessageCircle },
  { value: 'tired', label: 'Tired', color: 'text-gray-600', icon: X },
  { value: 'trusting', label: 'Trusting', color: 'text-blue-500', icon: Check },
].sort((a, b) => a.label.localeCompare(b.label));

const RED_FLAG_OPTIONS = [
  'Disrespectful to staff',
  'Only talks about themselves',
  'Rude or condescending',
  'Inconsistent communication',
  'Dismisses your feelings',
  'Pressures you',
  'Negative about exes',
  'Substance abuse',
  'Controlling behavior',
  'Dishonesty',
];

const GREEN_FLAG_OPTIONS = [
  'Good listener',
  'Respectful of boundaries',
  'Consistent communication',
  'Shows genuine interest',
  'Emotionally available',
  'Shares similar values',
  'Respects your opinions',
  'Punctual',
  'Honest and transparent',
  'Makes you feel comfortable',
];

const STATUS_COLUMNS: { status: DatingStatus; label: string; gradient: string; icon: any }[] = [
  { status: 'sparks', label: 'Sparks', gradient: 'from-[#7b5595] to-[#5d4070]', icon: Sparkles },
  { status: 'first_dates', label: 'First Dates', gradient: 'from-[#B1E006] to-[#6C8300]', icon: Coffee },
  { status: 'getting_to_know', label: 'Getting to Know', gradient: 'from-[#FFA600] to-[#B36B00]', icon: MessageCircle },
  { status: 'exclusive', label: 'Committed', gradient: 'from-[#F27C7C] to-[#E03B3B]', icon: Heart },
  { status: 'pause_or_let_go', label: 'Pause or Let Go', gradient: 'from-[#6B7280] to-[#4B5563]', icon: Pause },
];

/* ---------- Component ---------- */

export default function DatingTracker() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPlusOrPremium = hasAccess('dating-tracker');
  if (!isPlusOrPremium) {
    return (
      <FeatureAccessGuard featureId="dating-tracker" currentPlan={currentPlan}>
        <DatingTrackerContent />
      </FeatureAccessGuard>
    );
  }
  return <DatingTrackerContent />;
}

function DatingTrackerContent() {
  const { userData } = useUser();

  const [dateEntries, setDateEntries] = useState<DateEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'entries' | 'insights' | 'goals'>('entries');
  const [showGuide, setShowGuide] = useState(false);

  const [editingPerson, setEditingPerson] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);

  const [compact, setCompact] = useState(true); // compact list view

  // desktop drag
  const draggingPersonRef = useRef<string | null>(null);
  // mobile drag
  const draggingRef = useRef<{ name: string; ghost?: HTMLElement } | null>(null);

  const [newEntry, setNewEntry] = useState({
    person_name: '',
    date_number: 1,
    how_met: 'app',
    date_type: 'coffee',
    mood_before: 'neutral',
    mood_after: 'neutral',
    energy_before: 5,
    energy_after: 5,
    connection_rating: 5,
    red_flags: [] as string[],
    green_flags: [] as string[],
    reflection: '',
    future_questions: '',
    date: new Date().toISOString().split('T')[0],
    status: 'sparks' as DatingStatus,
  });

  /* ----- data ----- */
  useEffect(() => {
    loadDateEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id]);

  const loadDateEntries = async () => {
    if (!userData?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('date_entries')
        .select('*')
        .eq('user_id', userData.id)
        .order('date', { ascending: false });
      if (error) throw error;
      setDateEntries(
        (data || []).map((d) => ({
          ...d,
          color_index: Number.isInteger(d.color_index) ? d.color_index : DEFAULT_GRADIENT_INDEX,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load date entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.id) return;
    try {
      const lastForPerson = dateEntries.find(
        (d) => d.person_name.toLowerCase() === newEntry.person_name.toLowerCase()
      );
      const color_index = Number.isInteger(lastForPerson?.color_index)
        ? (lastForPerson!.color_index as number)
        : DEFAULT_GRADIENT_INDEX;

      const entryData: Partial<DateEntry> = {
        user_id: userData.id,
        person_name: newEntry.person_name,
        date_number: newEntry.date_number,
        how_met: newEntry.how_met,
        date_type: newEntry.date_type,
        mood_before: newEntry.mood_before,
        mood_after: newEntry.mood_after,
        energy_before: newEntry.energy_before,
        energy_after: newEntry.energy_after,
        connection_rating: newEntry.connection_rating,
        red_flags: newEntry.red_flags,
        green_flags: newEntry.green_flags,
        reflection: newEntry.reflection,
        future_questions: newEntry.future_questions,
        date: newEntry.date,
        status: newEntry.status ?? 'sparks',
        color_index,
      };

      const { error } = await supabase.from('date_entries').insert([entryData]);
      if (error) throw error;

      toast.success('Date entry saved successfully');
      setIsCreating(false);
      setEditingPerson(null);
      setNewEntry({
        person_name: '',
        date_number: 1,
        how_met: 'app',
        date_type: 'coffee',
        mood_before: 'neutral',
        mood_after: 'neutral',
        energy_before: 5,
        energy_after: 5,
        connection_rating: 5,
        red_flags: [],
        green_flags: [],
        reflection: '',
        future_questions: '',
        date: new Date().toISOString().split('T')[0],
        status: 'sparks',
      });
      loadDateEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save date entry');
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Delete this date entry?')) return;
    try {
      const { error } = await supabase
        .from('date_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', userData?.id || '');
      if (error) throw error;
      setDateEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success('Date entry deleted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete date entry');
    }
  };

  /* ----- flags ----- */
  const handleFlagToggle = (flagType: 'red_flags' | 'green_flags', flag: string) => {
    const curr = newEntry[flagType] || [];
    setNewEntry({
      ...newEntry,
      [flagType]: curr.includes(flag) ? curr.filter((f) => f !== flag) : [...curr, flag],
    });
  };

  /* ----- status & color ----- */
  const updateEntryStatus = async (entryId: string, newStatus: DatingStatus) => {
    try {
      const { error } = await supabase.from('date_entries').update({ status: newStatus }).eq('id', entryId);
      if (error) throw error;
      setDateEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, status: newStatus } : e)));
    } catch (err) {
      console.warn(err);
    }
  };

  const updatePersonColor = async (personName: string, colorIndex: number) => {
    try {
      const ids = dateEntries
        .filter((e) => e.person_name.toLowerCase() === personName.toLowerCase())
        .map((e) => e.id);
      if (!ids.length) return;

      const { error } = await supabase.from('date_entries').update({ color_index: colorIndex }).in('id', ids);
      if (error) throw error;

      setDateEntries((prev) =>
        prev.map((e) =>
          e.person_name.toLowerCase() === personName.toLowerCase() ? { ...e, color_index: colorIndex } : e
        )
      );
      setColorPickerOpen(null);
      toast.success('Color updated');
    } catch (err) {
      setDateEntries((prev) =>
        prev.map((e) =>
          e.person_name.toLowerCase() === personName.toLowerCase() ? { ...e, color_index: colorIndex } : e
        )
      );
      setColorPickerOpen(null);
      toast.error('Color saved locally. Run the SQL migration to persist.');
    }
  };

  /* ----- drag: desktop ----- */
  const onDragStart = (personName: string) => (e: React.DragEvent) => {
    draggingPersonRef.current = personName;
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onDropToStatus = (toStatus: DatingStatus) => async (e: React.DragEvent) => {
    e.preventDefault();
    const personName = draggingPersonRef.current;
    draggingPersonRef.current = null;
    if (!personName) return;
    const entries = dateEntries.filter((d) => d.person_name.toLowerCase() === personName.toLowerCase());
    for (const entry of entries) if (entry.status !== toStatus) await updateEntryStatus(entry.id, toStatus);
  };

  /* ----- drag: mobile (pointer fallback) ----- */
  const startPointerDrag = (name: string) => (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.buttons !== 1) return;
    draggingRef.current = { name };
    const ghost = document.createElement('div');
    ghost.className =
      'fixed z-[9999] px-2 py-1 text-xs rounded bg-black/70 text-white pointer-events-none';
    ghost.textContent = name;
    document.body.appendChild(ghost);
    draggingRef.current.ghost = ghost;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const movePointerDrag = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const g = draggingRef.current.ghost!;
    g.style.left = `${e.clientX + 10}px`;
    g.style.top = `${e.clientY + 10}px`;
  };
  const endPointerDrag = async (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const { name, ghost } = draggingRef.current;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const col = el?.closest?.('[data-status-col="true"][data-status]') as HTMLElement | null;
    const toStatus = (col?.dataset?.status || '') as DatingStatus;
    if (toStatus && name) {
      const entries = dateEntries.filter((d) => d.person_name.toLowerCase() === name.toLowerCase());
      for (const entry of entries) if (entry.status !== toStatus) await updateEntryStatus(entry.id, toStatus);
    }
    ghost?.remove();
    draggingRef.current = null;
  };

  /* ----- helpers ----- */
  const getEntriesByPerson = () => {
    const map: Record<string, DateEntry[]> = {};
    dateEntries.forEach((e) => {
      const k = e.person_name.toLowerCase();
      (map[k] = map[k] || []).push(e);
    });
    return map;
  };
  const getLatestEntryPerPerson = () => {
    const byPerson = getEntriesByPerson();
    const latest: DateEntry[] = [];
    Object.values(byPerson).forEach((list) => {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      latest.push(list[0]);
    });
    return latest;
  };
  const getMostCommon = (items: string[]) => {
    const c: Record<string, number> = {};
    items.forEach((i) => (c[i] = (c[i] || 0) + 1));
    return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  };
  const getTopItems = (items: string[], limit: number) => {
    const c: Record<string, number> = {};
    items.forEach((i) => (c[i] = (c[i] || 0) + 1));
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, limit);
  };
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return 0;
    const recent = values.slice(0, Math.min(5, values.length));
    const sum = recent.reduce((a, b) => a + b, 0);
    return sum > 0 ? 1 : sum < 0 ? -1 : 0;
  };
  const getReadableOption = (value: string, options: { value: string; label: string }[]) =>
    options.find((o) => o.value === value)?.label || value;

  /* ---------- UI sections ---------- */

  const handlePersonClick = (personName: string) => {
    const personEntries = dateEntries
      .filter((e) => e.person_name.toLowerCase() === personName.toLowerCase())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (!personEntries.length) return;

    const latest = personEntries[0];
    setNewEntry({
      person_name: latest.person_name,
      date_number: personEntries.length + 1,
      how_met: latest.how_met,
      date_type: latest.date_type,
      mood_before: 'neutral',
      mood_after: 'neutral',
      energy_before: 5,
      energy_after: 5,
      connection_rating: 5,
      red_flags: [],
      green_flags: [],
      reflection: '',
      future_questions: '',
      date: new Date().toISOString().split('T')[0],
      status: latest.status || 'sparks',
    });
    setEditingPerson(personName);
    setSelectedPerson(personName);
    setIsCreating(true);
    setTimeout(() => {
      document.getElementById('date-entry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const renderProgressionTracker = () => {
    const byPerson = getEntriesByPerson();
    const latestEntries = getLatestEntryPerPerson();

    const byStatus: Record<DatingStatus, DateEntry[]> = {
      sparks: [],
      first_dates: [],
      getting_to_know: [],
      exclusive: [],
      pause_or_let_go: [],
    };
    latestEntries.forEach((e) => byStatus[(e.status || 'sparks') as DatingStatus].push(e));

    return (
      <div className="mb-8">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Connection Progression</h2>
            <p className="text-sm text-gray-600 mt-1">
              Click a name to log a new date, or drag to move between stages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setIsCreating(true);
                setEditingPerson(null);
                setSelectedPerson(null);
                setNewEntry({
                  person_name: '',
                  date_number: 1,
                  how_met: 'app',
                  date_type: 'coffee',
                  mood_before: 'neutral',
                  mood_after: 'neutral',
                  energy_before: 5,
                  energy_after: 5,
                  connection_rating: 5,
                  red_flags: [],
                  green_flags: [],
                  reflection: '',
                  future_questions: '',
                  date: new Date().toISOString().split('T')[0],
                  status: 'sparks',
                });
                setTimeout(() => {
                  document.getElementById('date-entry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="bg-[#00A896] hover:bg-[#008c7a] flex-shrink-0"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Date
            </Button>

            {/* Make sure text is never white-on-white */}
            <button
              onClick={() => setCompact((v) => !v)}
              className="text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              title="Toggle compact view"
            >
              {compact ? 'Comfort view' : 'Compact view'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {STATUS_COLUMNS.map((col) => {
            const Icon = col.icon;
            const list = [...byStatus[col.status]].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            return (
              <div
                key={col.status}
                data-status-col="true"
                data-status={col.status}
                className="bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-2xl p-4 min-h-[800px] flex flex-col w-full"
                onDragOver={onDragOver}
                onDrop={onDropToStatus(col.status)}
              >
                <div className={`bg-gradient-to-r ${col.gradient} rounded-xl p-4 mb-4 border-2 border-white`}>
                  <div className="flex items-center gap-2 justify-center">
                    <Icon className="h-4 w-4 text-white flex-shrink-0" />
                    <h3 className="text-sm font-semibold text-white text-center whitespace-nowrap">{col.label}</h3>
                  </div>
                  <p className="text-xs text-center mt-1 text-white/85">
                    {list.length} {list.length === 1 ? 'person' : 'people'}
                  </p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {list.map((entry) => {
                    const personEntries = byPerson[entry.person_name.toLowerCase()] || [];
                    const totalDates = personEntries.length;
                    personEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    const lastDate = personEntries[0];
                    const dateTypeLabel =
                      DATE_TYPE_OPTIONS.find((opt) => opt.value === lastDate.date_type)?.label || lastDate.date_type;
                    const colorIndex = Number.isInteger(entry.color_index)
                      ? (entry.color_index as number)
                      : DEFAULT_GRADIENT_INDEX;

                    return (
                      <div key={entry.id} className="relative group">
                        <div
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            onDragStart(entry.person_name)(e);
                          }}
                          onPointerDown={startPointerDrag(entry.person_name)}
                          onPointerMove={movePointerDrag}
                          onPointerUp={endPointerDrag}
                          onPointerCancel={endPointerDrag}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (!target.closest('.color-picker-btn') && !target.closest('.grip-handle')) {
                              handlePersonClick(entry.person_name);
                            }
                          }}
                          className={`rounded-lg ${compact ? 'p-2' : 'p-3'} cursor-grab active:cursor-grabbing transition-all ring-2 ring-white/20 hover:ring-white/40 bg-gradient-to-br ${GRADIENT_OPTIONS[colorIndex]}`}
                        >
                          <div className={`flex items-start justify-between gap-2 ${compact ? 'mb-1' : 'mb-2'}`}>
                            <Grip className={`grip-handle ${compact ? 'h-3 w-3' : 'h-4 w-4'} text-white/60 mt-0.5`} />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setColorPickerOpen(colorPickerOpen === entry.person_name ? null : entry.person_name);
                              }}
                              className="color-picker-btn p-1 hover:bg-white/20 rounded transition"
                            >
                              <Palette className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-white/80`} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className={`font-medium text-white truncate ${compact ? 'text-xs' : 'text-sm'}`}>
                                {entry.person_name}
                              </p>
                              {!compact && (
                                <p className="text-xs text-white/70 mt-0.5">
                                  {totalDates} {totalDates === 1 ? 'date' : 'dates'}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              {!compact ? (
                                <>
                                  <p className="text-[10px] text-white/60">
                                    {new Date(lastDate.date).toLocaleDateString()}
                                  </p>
                                  <p className="text-[10px] text-white/60">{dateTypeLabel}</p>
                                </>
                              ) : (
                                <p className="text-[10px] text-white/80">{totalDates}×</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {colorPickerOpen === entry.person_name && (
                          <div className="absolute top-0 right-0 mt-12 z-50 bg-white rounded-lg shadow-xl p-3 border border-gray-200">
                            <p className="text-xs font-medium text-gray-700 mb-2">Choose Color</p>
                            <div className="grid grid-cols-5 gap-2">
                              {GRADIENT_OPTIONS.map((grad, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updatePersonColor(entry.person_name, idx);
                                  }}
                                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${grad} ${
                                    colorIndex === idx ? 'ring-2 ring-blue-500 ring-offset-2' : 'ring-1 ring-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {list.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-xs text-white/50">No one here yet</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPreviousDatesInfo = () => {
    if (!selectedPerson) return null;

    const personEntries = dateEntries
      .filter((e) => e.person_name.toLowerCase() === selectedPerson.toLowerCase())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (!personEntries.length) return null;

    return (
      <div className="bg-white rounded-lg p-4 md:p-5 mb-6 border border-[#00A896]">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">
          Previous Dates with {selectedPerson}
        </h3>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {personEntries.map((entry, index) => {
            const dateTypeLabel =
              DATE_TYPE_OPTIONS.find((opt) => opt.value === entry.date_type)?.label || entry.date_type;
            const howMetLabel = HOW_MET_OPTIONS.find((opt) => opt.value === entry.how_met)?.label || entry.how_met;
            const moodBefore = MOODS.find((m) => m.value === entry.mood_before);
            const moodAfter = MOODS.find((m) => m.value === entry.mood_after);
            const MoodBeforeIcon = moodBefore?.icon || Clock;
            const MoodAfterIcon = moodAfter?.icon || Check;

            return (
              <div key={entry.id} className="bg-gray-50 rounded-md p-3 md:p-4 border border-gray-200">
                {/* Two-column layout: left content, right stats */}
                <div className="grid grid-cols-12 gap-3">
                  {/* LEFT */}
                  <div className="col-span-12 lg:col-span-8">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold text-gray-900">{entry.person_name}</h4>
                        <span className="text-[#00A896] font-medium text-sm">
                          Date #{personEntries.length - index}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                        aria-label="Delete date entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coffee className="h-4 w-4" />
                        <span>{dateTypeLabel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{howMetLabel}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-600">Mood:</span>
                        <MoodBeforeIcon className={`h-4 w-4 ${moodBefore?.color}`} />
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <MoodAfterIcon className={`h-4 w-4 ${moodAfter?.color}`} />
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-600">Connection:</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.round(entry.connection_rating / 2)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="space-y-2">
                        {entry.reflection && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Reflection</p>
                            <p className="text-sm text-gray-700">{entry.reflection}</p>
                          </div>
                        )}
                        {entry.future_questions && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Questions for Next Time</p>
                            <p className="text-sm text-gray-700">{entry.future_questions}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {entry.green_flags?.length ? (
                          <div>
                            <p className="text-sm font-medium text-green-700">Green Flags</p>
                            <div className="flex flex-wrap gap-1.5">
                              {entry.green_flags.map((flag, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded"
                                >
                                  <Flag className="h-3 w-3" />
                                  {flag}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        {entry.red_flags?.length ? (
                          <div>
                            <p className="text-sm font-medium text-red-700">Red Flags</p>
                            <div className="flex flex-wrap gap-1.5">
                              {entry.red_flags.map((flag, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded"
                                >
                                  <AlertCircle className="h-3 w-3" />
                                  {flag}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: compact stats */}
                  <div className="col-span-12 lg:col-span-4">
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 bg-white rounded-md p-3 border border-gray-200">
                      <div className="text-center">
                        <p className="text-[11px] text-gray-500">Energy Before</p>
                        <p className="text-base font-semibold text-gray-900">{entry.energy_before}/10</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] text-gray-500">Energy After</p>
                        <p className="text-base font-semibold text-gray-900">{entry.energy_after}/10</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] text-gray-500">Mood Before</p>
                        <p className="text-sm font-medium text-gray-900">{moodBefore?.label}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] text-gray-500">Mood After</p>
                        <p className="text-sm font-medium text-gray-900">{moodAfter?.label}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDateEntryForm = () => (
    <>
      {renderPreviousDatesInfo()}
      <div id="date-entry-form" className="bg-gray-100 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingPerson ? `Log New Date with ${editingPerson}` : 'Log a New Date'}
          </h2>
          {editingPerson && (
            <button
              type="button"
              onClick={() => {
                setEditingPerson(null);
                setSelectedPerson(null);
                setNewEntry({
                  person_name: '',
                  date_number: 1,
                  how_met: 'app',
                  date_type: 'coffee',
                  mood_before: 'neutral',
                  mood_after: 'neutral',
                  energy_before: 5,
                  energy_after: 5,
                  connection_rating: 5,
                  red_flags: [],
                  green_flags: [],
                  reflection: '',
                  future_questions: '',
                  date: new Date().toISOString().split('T')[0],
                  status: 'sparks',
                });
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Person's Name</label>
              <input
                type="text"
                value={newEntry.person_name}
                onChange={(e) => setNewEntry({ ...newEntry, person_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-0 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700"># of Dates with this Person</label>
              <input
                type="number"
                min="1"
                value={newEntry.date_number}
                onChange={(e) => setNewEntry({ ...newEntry, date_number: parseInt(e.target.value || '1', 10) })}
                className="mt-1 block w-full rounded-md border-0 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">How You Met</label>
              <select
                value={newEntry.how_met}
                onChange={(e) => setNewEntry({ ...newEntry, how_met: e.target.value })}
                className="mt-1 block w-full rounded-md border-0 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                required
              >
                {HOW_MET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date Type</label>
              <select
                value={newEntry.date_type}
                onChange={(e) => setNewEntry({ ...newEntry, date_type: e.target.value })}
                className="mt-1 block w-full rounded-md border-0 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                required
              >
                {DATE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-0 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Moods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mood Before Date</label>
              <div className="grid grid-cols-4 gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={`before-${mood.value}`}
                    type="button"
                    onClick={() => setNewEntry({ ...newEntry, mood_before: mood.value })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-sm shadow-sm transition-all
                      ${newEntry.mood_before === mood.value ? 'bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white border-brand-green' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}
                  >
                    <mood.icon
                      className={`h-4 w-4 mb-1 ${newEntry.mood_before === mood.value ? 'text-white' : mood.color}`}
                    />
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mood After Date</label>
              <div className="grid grid-cols-4 gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={`after-${mood.value}`}
                    type="button"
                    onClick={() => setNewEntry({ ...newEntry, mood_after: mood.value })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-sm shadow-sm transition-all
                      ${newEntry.mood_after === mood.value ? 'bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white border-brand-green' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}
                  >
                    <mood.icon
                      className={`h-4 w-4 mb-1 ${newEntry.mood_after === mood.value ? 'text-white' : mood.color}`}
                    />
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Energy + connection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Energy Level Before (0-10)</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={newEntry.energy_before}
                  onChange={(e) => setNewEntry({ ...newEntry, energy_before: parseInt(e.target.value, 10) })}
                  className="flex-1 accent-[#B1E006]"
                  style={{
                    background: `linear-gradient(to right, #B1E006 0%, #B1E006 ${
                      (newEntry.energy_before / 10) * 100
                    }%, #ffffff ${(newEntry.energy_before / 10) * 100}%, #ffffff 100%)`,
                    borderRadius: '9999px',
                    height: '8px',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                  }}
                />
                <span className="text-gray-900 font-medium">{newEntry.energy_before}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Energy Level After (0-10)</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={newEntry.energy_after}
                  onChange={(e) => setNewEntry({ ...newEntry, energy_after: parseInt(e.target.value, 10) })}
                  className="flex-1 accent-[#0068aa]"
                  style={{
                    background: `linear-gradient(to right, #0068aa 0%, #0068aa ${
                      (newEntry.energy_after / 10) * 100
                    }%, #ffffff ${(newEntry.energy_after / 10) * 100}%, #ffffff 100%)`,
                    borderRadius: '9999px',
                    height: '8px',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                  }}
                />
                <span className="text-gray-900 font-medium">{newEntry.energy_after}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Connection Rating (1-10)</label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="10"
                value={newEntry.connection_rating}
                onChange={(e) => setNewEntry({ ...newEntry, connection_rating: parseInt(e.target.value, 10) })}
                className="flex-1 accent-[#ea697c]"
                style={{
                  background: `linear-gradient(to right, #ea697c 0%, #ea697c ${
                    ((newEntry.connection_rating - 1) / 9) * 100
                  }%, #ffffff ${((newEntry.connection_rating - 1) / 9) * 100}%, #ffffff 100%)`,
                  borderRadius: '9999px',
                  height: '8px',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                }}
              />
              <span className="text-gray-900 font-medium">{newEntry.connection_rating}</span>
            </div>
          </div>

          {/* Flags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Red Flags Noticed</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {RED_FLAG_OPTIONS.map((flag) => (
                <button
                  key={flag}
                  type="button"
                  onClick={() => handleFlagToggle('red_flags', flag)}
                  className={`text-xs p-2 rounded-lg border font-medium ${
                    newEntry.red_flags?.includes(flag)
                      ? 'bg-[#E03B3B] border-[#E03B3B] text-white'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Green Flags Noticed</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {GREEN_FLAG_OPTIONS.map((flag) => (
                <button
                  key={flag}
                  type="button"
                  onClick={() => handleFlagToggle('green_flags', flag)}
                  className={`text-xs p-2 rounded-lg border font-medium ${
                    newEntry.green_flags?.includes(flag)
                      ? 'bg-[#B1E006] border-[#B1E006] text-white'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {flag}
                </button>
              ))}
            </div>
          </div>

          {/* Journaling */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Reflection / Journal Entry</label>
            <textarea
              value={newEntry.reflection || ''}
              onChange={(e) => setNewEntry({ ...newEntry, reflection: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-0 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
              placeholder="How did the date go? What did you learn? How did you feel?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Questions to Ask Next Time</label>
            <textarea
              value={newEntry.future_questions || ''}
              onChange={(e) => setNewEntry({ ...newEntry, future_questions: e.target.value })}
              rows={2}
              className="mt-1 block w-full rounded-md border-0 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
              placeholder="What would you like to ask or discuss next time?"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsCreating(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white">
              Save Date Entry
            </Button>
          </div>
        </form>
      </div>
    </>
  );

  /* ----- insights/goals (unchanged) ----- */

  const renderDateInsights = () => {
    if (!dateEntries.length) {
      return (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <BarChart className="mx-auto h-12 w-12 text-gray-500" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No insights available yet</h3>
          <p className="mt-1 text-sm text-gray-600">Log your first date to start seeing insights.</p>
        </div>
      );
    }
    const totalDates = dateEntries.length;
    const uniquePeople = new Set(dateEntries.map((e) => e.person_name)).size;
    const avgConnectionRating = dateEntries.reduce((s, e) => s + e.connection_rating, 0) / totalDates;
    const mostCommonDateType = getMostCommon(dateEntries.map((e) => e.date_type));
    const mostCommonHowMet = getMostCommon(dateEntries.map((e) => e.how_met));
    const moodImproved = dateEntries.filter(
      (e) => MOODS.findIndex((m) => m.value === e.mood_after) > MOODS.findIndex((m) => m.value === e.mood_before)
    ).length;
    const moodPercentage = Math.round((moodImproved / totalDates) * 100);
    const energyImproved = dateEntries.filter((e) => e.energy_after > e.energy_before).length;
    const energyPercentage = Math.round((energyImproved / totalDates) * 100);
    const topRedFlags = getTopItems(dateEntries.flatMap((e) => e.red_flags || []), 3);
    const topGreenFlags = getTopItems(dateEntries.flatMap((e) => e.green_flags || []), 3);
    const energyTrend = calculateTrend(dateEntries.map((e) => e.energy_after - e.energy_before));
    const connectionTrend = calculateTrend(dateEntries.map((e) => e.connection_rating));

    return (
      <div className="space-y-6">
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Dating Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">Total Dates</div>
              <div className="text-2xl font-semibold text-gray-900">{totalDates}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">Unique People</div>
              <div className="text-2xl font-semibold text-gray-900">{uniquePeople}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">Avg. Connection</div>
              <div className="text-2xl font-semibold text-gray-900 flex items-center">
                {avgConnectionRating.toFixed(1)}/10
                {connectionTrend > 0 && <ArrowUp className="h-4 w-4 text-green-500 ml-1" />}
                {connectionTrend < 0 && <ArrowDown className="h-4 w-4 text-red-500 ml-1" />}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">Most Common</div>
              <div className="text-xl font-semibold text-gray-900 capitalize">
                {getReadableOption(mostCommonDateType, DATE_TYPE_OPTIONS)} dates
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Emotional Impact</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Mood Improved</span>
                  <span className="text-gray-900">{moodPercentage}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-2.5 border border-gray-200">
                  <div className="bg-brand-green h-2.5 rounded-full" style={{ width: `${moodPercentage}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Energy Increased</span>
                  <span className="text-gray-900">{energyPercentage}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-2.5 border border-gray-200">
                  <div className="bg-brand-green h-2.5 rounded-full" style={{ width: `${energyPercentage}%` }}></div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-700 text-sm">
                {moodPercentage > 50
                  ? 'Your mood tends to improve after dates. This is a positive sign!'
                  : "Your mood often doesn't improve after dates. Consider what might be causing this."}
              </p>
              <p className="text-gray-700 text-sm mt-2">
                {energyTrend > 0 ? 'Your energy levels are trending upward after recent dates.' : 'Your energy levels have been decreasing after recent dates.'}
              </p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Flags & Patterns</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-2">Top Red Flags</h4>
                <div className="space-y-2">
                  {topRedFlags.length ? (
                    topRedFlags.map(([flag, count]) => (
                      <div key={flag} className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">{flag}</span>
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">{count}x</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm">No red flags recorded yet</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-green-600 mb-2">Top Green Flags</h4>
                <div className="space-y-2">
                  {topGreenFlags.length ? (
                    topGreenFlags.map(([flag, count]) => (
                      <div key={flag} className="flex justify-between items-center">
                        <span className="text-gray-700 text-sm">{flag}</span>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">{count}x</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm">No green flags recorded yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Dating Summary</h3>
          <div className="space-y-4 text-gray-700">
            <p>
              You've been on {totalDates} date{totalDates !== 1 ? 's' : ''} with {uniquePeople} different{' '}
              {uniquePeople !== 1 ? 'people' : 'person'}. Most commonly, you meet people via{' '}
              <span className="text-brand-green capitalize">
                {getReadableOption(mostCommonHowMet, HOW_MET_OPTIONS)}
              </span>{' '}
              and go on{' '}
              <span className="text-brand-green capitalize">
                {getReadableOption(mostCommonDateType, DATE_TYPE_OPTIONS)}
              </span>{' '}
              dates.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderDateGoals = () => (
    <div className="bg-gray-100 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Your Dating Goals</h3>
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-gray-900 font-medium mb-2">Be more authentic on first dates</h4>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-900">40%</span>
          </div>
          <div className="w-full bg-white rounded-full h-2.5 border border-gray-200">
            <div className="bg-brand-green h-2.5 rounded-full" style={{ width: '40%' }}></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-gray-900 font-medium mb-2">Ask one values-based question on every date</h4>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-900">60%</span>
          </div>
          <div className="w-full bg-white rounded-full h-2.5 border border-gray-200">
            <div className="bg-brand-green h-2.5 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-gray-900 font-medium mb-2">Pause before texting back</h4>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-900">25%</span>
          </div>
          <div className="w-full bg-white rounded-full h-2.5 border border-gray-200">
            <div className="bg-brand-green h-2.5 rounded-full" style={{ width: '25%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ----- page ----- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dating Tracker</h1>
              <p className="text-base text-white/80">Track your dating journey and gain insights</p>
            </div>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">Tips</span>
              {showGuide ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
            </button>
          </div>

          {showGuide && (
            <div className="mt-6">
              <div className="bg-white/10 rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Brain className="h-6 w-6 text-white mt-1" />
                      <div>
                        <h3 className="text-lg font-medium text-white">Self-Awareness</h3>
                        <p className="text-white/80">
                          Track your emotional responses and energy levels to identify patterns in your dating experiences.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Target className="h-6 w-6 text-white mt-1" />
                      <div>
                        <h3 className="text-lg font-medium text-white">Red & Green Flags</h3>
                        <p className="text-white/80">Learn to recognize warning signs and positive indicators in potential partners.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Dating Tracker Benefits</h3>
                    <DatingGuide />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'entries'
              ? 'text-brand-green border-b-2 border-brand-green'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('entries')}
        >
          Date Entries
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'insights'
              ? 'text-brand-green border-b-2 border-brand-green'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('insights')}
        >
          Insights
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm ${
            activeTab === 'goals'
              ? 'text-brand-green border-b-2 border-brand-green'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('goals')}
        >
          Goals
        </button>
      </div>

      {activeTab === 'entries' ? (
        <>
          {dateEntries.length > 0 && renderProgressionTracker()}

          {/* NEW: Always render form panel when isCreating is true */}
          {isCreating && (
            <>
              {renderDateEntryForm()}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingPerson(null);
                    setSelectedPerson(null);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {dateEntries.length === 0 && !isCreating ? (
            <div className="text-center py-12 bg-gray-100 rounded-lg">
              <Heart className="mx-auto h-12 w-12 text-gray-500" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No date entries yet</h3>
              <p className="mt-1 text-sm text-gray-600">Start tracking your dating journey by logging your first date.</p>
            </div>
          ) : null}
        </>
      ) : activeTab === 'insights' ? (
        renderDateInsights()
      ) : (
        renderDateGoals()
      )}
    </div>
  );
}
