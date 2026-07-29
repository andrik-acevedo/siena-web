import { useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';

// Keep the app-wide view type here (type-only import)
import type { ViewRange as HabitViewRange } from '../../types/habits';

// Import only the component + MarkItem from CalendarGrid
import HabitCalendarGrid, { MarkItem } from './CalendarGrid';

import {
  Plus, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Target, Calendar as CalendarIcon, BarChart, Trash2, Edit,
  ToggleLeft, ToggleRight, Loader2, X, HelpCircle, Star
} from 'lucide-react';
import Button from '../ui/Button';

// ❗️Do NOT import ViewRange again here.
// Remove `ViewRange as HabitViewRange` from this line.
import { Habit, HabitLog, Frequency } from '../../types/habits';

import {
  listHabits, createHabit, updateHabit, toggleHabitActive,
  listHabitLogs, upsertHabitLog, copyPresetToUser, HABIT_PRESETS
} from '../../lib/habitsApi';

import HabitStreaksCard from './StreaksCard';
import HabitTrendsCard from './HabitTrendsCard';

import {
  format, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfQuarter, endOfQuarter
} from 'date-fns';
import toast from 'react-hot-toast';


/* ================= Colors ================= */
const GRADIENT_COLORS = [
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
];

/* ================= SMS helpers ================= */
function normalizeE164(p?: string | null): string | null {
  if (!p) return null;
  const d = p.replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  if (p.startsWith('+')) return p;
  return null;
}

function nextHabitOccurrence(from: Date, habit: Habit): Date | null {
  const time = habit.reminder_time || '09:00';
  const [hh, mm] = time.split(':').map(Number);
  const base = new Date(from);
  base.setSeconds(0, 0);

  if (habit.frequency === 'daily') {
    const t = new Date(base);
    t.setHours(hh ?? 9, mm ?? 0, 0, 0);
    if (t <= new Date()) t.setDate(t.getDate() + 1);
    return t;
  }
  if (habit.frequency === 'weekly') {
    const dow = typeof habit.reminder_dow === 'number' ? habit.reminder_dow : 1;
    const t = new Date(base);
    t.setHours(hh ?? 9, mm ?? 0, 0, 0);
    const delta = (7 + dow - t.getDay()) % 7;
    if (delta === 0 && t <= new Date()) t.setDate(t.getDate() + 7);
    else t.setDate(t.getDate() + delta);
    return t;
  }
  if (habit.frequency === 'monthly') {
    const dom = habit.reminder_dom ?? 1;
    const t = new Date(base.getFullYear(), base.getMonth(), dom, hh ?? 9, mm ?? 0, 0, 0);
    if (t <= new Date()) t.setMonth(t.getMonth() + 1);
    return t;
  }
  return null;
}

function generateUpcomingRuns(habit: Habit, count = 5): Date[] {
  const runs: Date[] = [];
  let cursor = nextHabitOccurrence(new Date(), habit);
  if (!cursor) return runs;
  for (let i = 0; i < count; i++) {
    runs.push(new Date(cursor));
    if (habit.frequency === 'daily') cursor.setDate(cursor.getDate() + 1);
    else if (habit.frequency === 'weekly') cursor.setDate(cursor.getDate() + 7);
    else if (habit.frequency === 'monthly') cursor.setMonth(cursor.getMonth() + 1);
  }
  return runs;
}

function habitMessage(habit: Habit) {
  return `🧭 Siena Habit: “${habit.name}” — it’s time. You’ve got this! Reply STOP to opt out.`;
}

async function scheduleHabitReminders(habit: Habit, phone: string, n = 5) {
  const runs = generateUpcomingRuns(habit, n);
  for (const dt of runs) {
    const { data, error } = await supabase.functions.invoke('schedule-sms-reminder', {
      body: { phoneNumber: phone, message: habitMessage(habit), scheduledTime: dt.toISOString(), habitId: habit.id }
    });
    if (error) throw new Error(error.message || 'Failed scheduling habit reminder');
    if (!data?.success) throw new Error(data?.error || 'Scheduling failed');
  }
}
async function cancelHabitReminders(habitId: string) {
  try { await supabase.functions.invoke('cancel-scheduled-reminders', { body: { habitId } }); } catch {}
}

/* ================= Merge helpers ================= */
function normalizeName(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}
type MergedGroup = {
  key: string;
  name: string;
  color: string;
  ids: string[];
  mergedCount: number;
};
function buildMergedGroups(habits: Habit[]): MergedGroup[] {
  const map = new Map<string, MergedGroup>();
  for (const h of habits) {
    const key = normalizeName(h.name);
    const ex = map.get(key);
    if (!ex) map.set(key, { key, name: h.name, color: h.color, ids: [h.id], mergedCount: 1 });
    else { ex.ids.push(h.id); ex.mergedCount += 1; }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/* ================= Component ================= */
export default function HabitTracker() {
  const { userData } = useUser();

  // data
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<Map<string, HabitLog[]>>(new Map());

  // ui
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // calendar + range
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<HabitViewRange>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // chips
  const [selectedHabitFilters, setSelectedHabitFilters] = useState<string[]>([]);

  // day modal
  const [showDayModal, setShowDayModal] = useState(false);
  const [modalDateISO, setModalDateISO] = useState<string | null>(null);

  // favorites for modal ordering
  const [favoriteNames, setFavoriteNames] = useState<string[]>([]);
  useEffect(() => { try { const r = localStorage.getItem('habit_favorites'); if (r) setFavoriteNames(JSON.parse(r)); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem('habit_favorites', JSON.stringify(favoriteNames)); } catch {} }, [favoriteNames]);

  // form
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'daily' as Frequency,
    target_value: undefined as number | undefined,
    target_unit: '',
    color: GRADIENT_COLORS[0],
    sms_reminder: false,
    reminder_time: '09:00',
    reminder_dow: 1,
    reminder_dom: 1
  });

  // ===== NEW: mobile detection + modal focus/scroll handling =====
  const [isMobile, setIsMobile] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    check();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', check, { passive: true });
      return () => window.removeEventListener('resize', check as any);
    }
  }, []);

  // When the day modal opens on mobile, scroll to top and lock background scroll; focus the modal.
  useEffect(() => {
    if (showDayModal && isMobile) {
      // Scroll to top so modal is immediately visible on small screens (address bar/keyboard safe).
      try { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); } catch { window.scrollTo(0, 0); }
      // Lock background scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Focus modal after paint
      const t = setTimeout(() => { modalRef.current?.focus(); }, 0);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = prev;
      };
    }
    // When modal closes (or not mobile), ensure body scroll is restored.
    return () => { document.body.style.overflow = ''; };
  }, [showDayModal, isMobile]);

  /* ---------------- Loaders ---------------- */
  const getDateRange = () => {
    switch (view) {
      case 'week': return { start: startOfWeek(currentDate, { weekStartsOn: 0 }), end: endOfWeek(currentDate, { weekStartsOn: 0 }) };
      case 'month': return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
      case 'quarter': return { start: startOfQuarter(currentDate), end: endOfQuarter(currentDate) };
      default: return { start: new Date(), end: new Date() };
    }
  };

  useEffect(() => { if (userData?.id) loadHabits(); }, [userData?.id]);
  useEffect(() => { if (habits.length > 0) loadHabitLogs(); }, [habits, currentDate, view]);

  async function loadHabits() {
    try {
      const data = await listHabits(userData!.id);
      setHabits(data);
    } catch (err) {
      console.error('Error loading habits:', err);
      setError('Failed to load habits');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadHabitLogs() {
    try {
      const { start, end } = getDateRange();
      const logsMap = new Map<string, HabitLog[]>();
      for (const habit of habits) {
        const logs = await listHabitLogs(habit.id, format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
        logsMap.set(habit.id, logs);
      }
      setHabitLogs(logsMap);
    } catch (err) {
      console.error('Error loading habit logs:', err);
      setError('Failed to load habit logs');
    }
  }

  /* ---------------- Calendar nav ---------------- */
  const navigateDate = (dir: 'prev' | 'next') => {
    const d = new Date(currentDate);
    if (view === 'week') dir === 'prev' ? d.setDate(d.getDate() - 7) : d.setDate(d.getDate() + 7);
    if (view === 'month') dir === 'prev' ? d.setMonth(d.getMonth() - 1) : d.setMonth(d.getMonth() + 1);
    if (view === 'quarter') dir === 'prev' ? d.setMonth(d.getMonth() - 3) : d.setMonth(d.getMonth() + 3);
    setCurrentDate(d);
  };

  /* ---------------- CRUD actions ---------------- */
  const handleCreateHabit = async () => {
    try {
      const habit = await createHabit({
        user_id: userData!.id,
        name: formData.name,
        frequency: formData.frequency,
        target_value: formData.target_value,
        target_unit: formData.target_unit,
        color: formData.color,
        is_active: true,
        sms_reminder: formData.sms_reminder,
        reminder_time: formData.reminder_time,
        reminder_dow: formData.frequency === 'weekly' ? formData.reminder_dow : null,
        reminder_dom: formData.frequency === 'monthly' ? formData.reminder_dom : null
      });

      setHabits([habit, ...habits]);
      setIsCreating(false);
      setFormData({
        name: '', frequency: 'daily', target_value: undefined, target_unit: '',
        color: GRADIENT_COLORS[0], sms_reminder: false, reminder_time: '09:00', reminder_dow: 1, reminder_dom: 1
      });
      toast.success('Habit created successfully');

      if (habit.sms_reminder) {
        const to = normalizeE164(userData?.phone);
        if (to) {
          try { await scheduleHabitReminders(habit, to, 5); toast.success('SMS reminders scheduled'); }
          catch (e: any) { toast.error(`Failed to schedule SMS: ${e.message ?? e}`); }
        } else {
          toast('Add a phone number to receive habit texts');
        }
      }
    } catch (err) {
      console.error('Error creating habit:', err);
      setError('Failed to create habit');
      toast.error('Failed to create habit');
    }
  };

  const handleUpdateHabit = async () => {
    if (!editingHabit) return;
    try {
      const habit = await updateHabit(editingHabit, {
        name: formData.name,
        frequency: formData.frequency,
        target_value: formData.target_value,
        target_unit: formData.target_unit,
        color: formData.color,
        sms_reminder: formData.sms_reminder,
        reminder_time: formData.reminder_time,
        reminder_dow: formData.frequency === 'weekly' ? formData.reminder_dow : null,
        reminder_dom: formData.frequency === 'monthly' ? formData.reminder_dom : null
      });

      setHabits(habits.map(h => h.id === editingHabit ? habit : h));
      setEditingHabit(null);
      setIsCreating(false);
      setFormData({
        name: '', frequency: 'daily', target_value: undefined, target_unit: '',
        color: GRADIENT_COLORS[0], sms_reminder: false, reminder_time: '09:00', reminder_dow: 1, reminder_dom: 1
      });
      toast.success('Habit updated successfully');

      if (habit.sms_reminder) {
        const to = normalizeE164(userData?.phone);
        if (to) {
          try { await scheduleHabitReminders(habit, to, 5); toast.success('SMS reminders (re)scheduled'); }
          catch (e: any) { toast.error(`Failed to schedule: ${e.message ?? e}`); }
        }
      } else {
        await cancelHabitReminders(habit.id);
      }
    } catch (err) {
      console.error('Error updating habit:', err);
      setError('Failed to update habit');
      toast.error('Failed to update habit');
    }
  };

  const handleToggleHabit = async (habitId: string, isActive: boolean) => {
    try {
      await toggleHabitActive(habitId, !isActive);
      setHabits(habits.map(h => h.id === habitId ? { ...h, is_active: !isActive } : h));
      toast.success(isActive ? 'Habit deactivated' : 'Habit activated');
    } catch (err) {
      console.error('Error toggling habit:', err);
      toast.error('Failed to update habit');
    }
  };

  /* ---------------- Day modal operations (merged-aware) ---------------- */
  const groups = useMemo(() => buildMergedGroups(habits), [habits]);

  function onCellClick(dateISO: string) {
    setSelectedDate(new Date(dateISO + 'T00:00:00'));
    setModalDateISO(dateISO);
    setShowDayModal(true);
    // (Optional safety) If already on mobile, nudge scroll immediately.
    if (isMobile) {
      try { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); } catch { window.scrollTo(0, 0); }
    }
  }

  function isGroupLogged(group: MergedGroup, dateISO: string) {
    return group.ids.some((id) => (habitLogs.get(id) || []).some((l) => l.log_date === dateISO && l.completed));
  }

  async function addForDay(group: MergedGroup, dateISO: string) {
    // Use group's primary (first) id to log
    const primary = group.ids[0];
    await upsertHabitLog(primary, dateISO, true);
    const prev = habitLogs.get(primary) || [];
    const next = prev.filter(l => l.log_date !== dateISO).concat({
      id: '', habit_id: primary, log_date: dateISO, completed: true, value: null, created_at: new Date().toISOString()
    } as any);
    const m = new Map(habitLogs); m.set(primary, next); setHabitLogs(m);
  }

  async function removeForDay(group: MergedGroup, dateISO: string) {
    // Remove from whichever id has a log
    for (const id of group.ids) {
      const logs = habitLogs.get(id) || [];
      if (logs.find((l) => l.log_date === dateISO && l.completed)) {
        // delete
        try {
          const { error } = await supabase.from('habit_logs').delete().eq('habit_id', id).eq('log_date', dateISO);
          if (error) throw error;
          const newMap = new Map(habitLogs);
          newMap.set(id, (newMap.get(id) || []).filter((l) => l.log_date !== dateISO));
          setHabitLogs(newMap);
        } catch (err) {
          toast.error('Failed to remove log');
        }
        break;
      }
    }
  }

  /* ---------------- Calendar marks (merged-aware) ---------------- */
  const markGetter = (dateISO: string): MarkItem[] => {
    const items: MarkItem[] = [];
    groups.forEach((g) => {
      const logged = isGroupLogged(g, dateISO);
      if (logged) items.push({ id: g.key, color: extractDotColor(g.color), label: g.name });
    });
    return items;
  };

  function extractDotColor(gradient: string) {
    // try to use the "to-[#hex]" if present, else brand green
    const m = gradient.match(/to-\[\#([0-9a-fA-F]{6})\]/);
    if (m) return `#${m[1]}`;
    const m2 = gradient.match(/from-\[\#([0-9a-fA-F]{6})\]/);
    if (m2) return `#${m2[1]}`;
    return '#01B1AF';
  }

  /* ---------------- Filters + counts ---------------- */
  const countsByGroup = useMemo(() => {
    const map = new Map<string, number>();
    groups.forEach((g) => {
      const days = new Set<string>();
      g.ids.forEach((id) => (habitLogs.get(id) || []).forEach((l) => { if (l.completed) days.add(l.log_date); }));
      map.set(g.key, days.size);
    });
    return map;
  }, [groups, habitLogs]);

  /* ---------------- Date range label ---------------- */
  const formatDateRange = () => {
    const { start, end } = getDateRange();
    if (view === 'week') return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    if (view === 'month') return format(currentDate, 'MMMM yyyy');
    if (view === 'quarter') return `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${currentDate.getFullYear()}`;
    return '';
  };

  /* ---------------- UI ---------------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* HERO */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-6">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Habit Tracker</h1>
              <p className="text-base text-white/80">Build and maintain healthy habits with visual progress tracking</p>
            </div>
            <button onClick={() => setShowGuide(s => !s)} className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 transition-colors">
              <HelpCircle className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">Tips</span>
              {showGuide ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
            </button>
          </div>

          {showGuide && (
            <div className="mt-4 bg-white/10 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/90 text-sm">
                <div className="flex items-start gap-2"><Target className="h-5 w-5 mt-0.5" /><div><div className="font-semibold">Consistency</div><div>Small, consistent actions compound into meaningful change.</div></div></div>
                <div className="flex items-start gap-2"><BarChart className="h-5 w-5 mt-0.5" /><div><div className="font-semibold">Track to improve</div><div>Visual feedback helps maintain motivation and spot patterns.</div></div></div>
                <div className="flex items-start gap-2"><CalendarIcon className="h-5 w-5 mt-0.5" /><div><div className="font-semibold">Stack smart</div><div>Attach new habits to existing routines for better success.</div></div></div>
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

      {/* ===== Calendar ===== */}
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-gray-900">Habit Calendar</h3>
          <div className="flex items-center space-x-2">
            <Button variant={view === 'week' ? 'primary' : 'outline'} size="sm" onClick={() => setView('week')}>Week</Button>
            <Button variant={view === 'month' ? 'primary' : 'outline'} size="sm" onClick={() => setView('month')}>Month</Button>
            <Button variant={view === 'quarter' ? 'primary' : 'outline'} size="sm" onClick={() => setView('quarter')}>Quarter</Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <button onClick={() => navigateDate('prev')} className="p-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-colors" aria-label="Previous period">
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">{formatDateRange()}</h2>
            {selectedDate && <div className="text-xs text-gray-600">Tracking for {format(selectedDate, 'MMM d, yyyy')}</div>}
          </div>
          <button onClick={() => navigateDate('next')} className="p-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-colors" aria-label="Next period">
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Filter chips (merged names) */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700">Filter by habits:</div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedHabitFilters([])} className="text-xs text-brand-green hover:underline">All</button>
              <button onClick={() => setSelectedHabitFilters(groups.map(g => g.key))} className="text-xs text-gray-600 hover:underline">None</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => {
              const active = selectedHabitFilters.length === 0 || selectedHabitFilters.includes(g.key);
              const count = countsByGroup.get(g.key) ?? 0;
              return (
                <button
                  key={g.key}
                  onClick={() =>
                    setSelectedHabitFilters(prev =>
                      prev.includes(g.key) ? prev.filter(k => k !== g.key) : [...prev, g.key]
                    )
                  }
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    active ? 'text-white border-transparent' : 'text-gray-800 hover:bg-gray-50'
                  }`}
                  style={{ backgroundColor: active ? extractDotColor(g.color) : '#fff', borderColor: active ? 'transparent' : extractDotColor(g.color) }}
                  title={g.mergedCount > 1 ? `${g.mergedCount} merged` : ''}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: active ? 'rgba(255,255,255,0.85)' : extractDotColor(g.color) }} />
                    {g.name}
                    {g.mergedCount > 1 && <span className={`ml-1 inline-flex items-center justify-center text-[10px] w-5 h-5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>{g.mergedCount}</span>}
                    <span className={`ml-1 inline-flex items-center justify-center text-[10px] w-5 h-5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>{count}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3">
            <HabitCalendarGrid
              currentDate={currentDate}
              view={view as HabitViewRange}
              marks={(iso) => {
                // apply filter (if any)
                const list = markGetter(iso);
                if (selectedHabitFilters.length === 0) return list;
                return list.filter((m) => selectedHabitFilters.includes(m.id));
              }}
              onCellClick={onCellClick}
            />
          </div>
        </div>

        <div className="flex justify-start mt-3">
          <Button onClick={() => setIsCreating(true)} className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white">
            <Plus className="h-5 w-5 mr-2" /> Add New Habit
          </Button>
        </div>
      </div>

      {/* ===== Trends Chart ===== */}
      <HabitTrendsCard 
        className="mb-6"
        title="Weekly Trends" 
      />

      {/* ===== Streaks ===== */}
      <HabitStreaksCard habits={habits} habitLogs={habitLogs} />

      {/* ===== Add/Edit Habit Form (kept robust, includes SMS) ===== */}
      {isCreating && (
        <div className="bg-gray-100 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{editingHabit ? 'Edit Habit' : 'Add New Habit'}</h3>
            <button
              onClick={() => { setIsCreating(false); setEditingHabit(null); setFormData({
                name: '', frequency: 'daily', target_value: undefined, target_unit: '',
                color: GRADIENT_COLORS[0], sms_reminder: false, reminder_time: '09:00', reminder_dow: 1, reminder_dom: 1
              }); }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cancel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Presets */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Choose a preset or create custom</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {HABIT_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => setFormData({
                    name: preset.name,
                    frequency: preset.frequency,
                    target_value: preset.target_value,
                    target_unit: preset.target_unit || '',
                    color: preset.color,
                    sms_reminder: false,
                    reminder_time: '09:00',
                    reminder_dow: 1,
                    reminder_dom: 1
                  })}
                  className={`p-3 rounded-lg border text-left transition-all bg-gradient-to-br ${preset.color} text-white hover:scale-105`}
                >
                  <div className="font-medium text-sm mb-1">{preset.name}</div>
                  <div className="text-xs opacity-80">
                    {preset.target_value ? `${preset.target_value} ${preset.target_unit}` : ''} {preset.frequency}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]"
                placeholder="e.g., Morning meditation"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Frequency })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Value (Optional)</label>
                <input
                  type="number"
                  value={formData.target_value || ''}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]"
                  placeholder="e.g., 30"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit (Optional)</label>
                <input
                  type="text"
                  value={formData.target_unit}
                  onChange={(e) => setFormData({ ...formData, target_unit: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]"
                  placeholder="e.g., minutes, pages"
                />
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {GRADIENT_COLORS.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} border-2 transition-all ${formData.color === color ? 'border-gray-900 scale-110' : 'border-gray-300 hover:scale-105'}`}
                  />
                ))}
              </div>
            </div>

            {/* SMS prefs */}
            <div className="pt-2 border-t border-gray-200">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.sms_reminder}
                  onChange={(e) => setFormData({ ...formData, sms_reminder: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-[#01B1AF] focus:ring-[#01B1AF]"
                />
                <span className="text-sm text-gray-700">Text me a reminder for this habit</span>
              </label>

              {formData.sms_reminder && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={formData.reminder_time}
                      onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]"
                    />
                  </div>

                  {formData.frequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                      <select
                        value={formData.reminder_dow}
                        onChange={(e) => setFormData({ ...formData, reminder_dow: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]"
                      >
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (<option key={d} value={i}>{d}</option>))}
                      </select>
                    </div>
                  )}

                  {formData.frequency === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
                      <input
                        type="number"
                        min={1}
                        max={28}
                        value={formData.reminder_dom}
                        onChange={(e) => setFormData({ ...formData, reminder_dom: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]"
                      />
                      <p className="text-xs text-gray-500 mt-1">Use 1–28 to avoid month-end gaps</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsCreating(false); setEditingHabit(null); setFormData({
                  name: '', frequency: 'daily', target_value: undefined, target_unit: '',
                  color: GRADIENT_COLORS[0], sms_reminder: false, reminder_time: '09:00', reminder_dow: 1, reminder_dom: 1
                }); }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingHabit ? handleUpdateHabit : handleCreateHabit}
                disabled={!formData.name.trim()}
                className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white"
              >
                {editingHabit ? 'Update Habit' : 'Create Habit'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Day modal ===== */}
      {showDayModal && modalDateISO && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            ref={modalRef}
            tabIndex={-1}
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Habits for {format(new Date(modalDateISO + 'T00:00:00'), 'MMMM d, yyyy')}
              </h3>
              <button onClick={() => { setShowDayModal(false); setModalDateISO(null); }} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* create new + log immediately */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Create new habit (e.g., 'Stretch 5 min')"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              />
              <Button
                onClick={async () => {
                  if (!formData.name.trim()) return;
                  // create & log on that day
                  const habit = await createHabit({
                    user_id: userData!.id,
                    name: formData.name.trim(),
                    frequency: 'daily',
                    color: GRADIENT_COLORS[0],
                    is_active: true,
                    target_unit: '',
                    target_value: null,
                    sms_reminder: false,
                    reminder_time: '09:00',
                    reminder_dow: null,
                    reminder_dom: null
                  } as any);
                  setHabits([habit, ...habits]);
                  await upsertHabitLog(habit.id, modalDateISO, true);
                  const prev = habitLogs.get(habit.id) || [];
                  const next = prev.filter(l => l.log_date !== modalDateISO).concat({
                    id: '', habit_id: habit.id, log_date: modalDateISO, completed: true, value: null, created_at: new Date().toISOString()
                  } as any);
                  const m = new Map(habitLogs); m.set(habit.id, next); setHabitLogs(m);
                  setFormData((p) => ({ ...p, name: '' }));
                }}
                className="bg-[#01B1AF] text-white"
              >
                Add & Log
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              <div className="text-sm font-medium text-gray-700 mb-2">Available Habits ({groups.length})</div>
              {groups
                .slice()
                .sort((a, b) => {
                  const fa = favoriteNames.includes(a.name);
                  const fb = favoriteNames.includes(b.name);
                  if (fa && !fb) return -1;
                  if (!fa && fb) return 1;
                  return a.name.localeCompare(b.name);
                })
                .map((g) => {
                  const logged = isGroupLogged(g, modalDateISO);
                  const fav = favoriteNames.includes(g.name);
                  return (
                    <div key={g.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: extractDotColor(g.color) }} />
                        <span className="text-sm font-medium text-gray-900">{g.name}</span>
                        {g.mergedCount > 1 && (
                          <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{g.mergedCount} merged</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setFavoriteNames(prev => fav ? prev.filter(n => n !== g.name) : [...prev, g.name])}
                          title={fav ? 'Unpin from favorites' : 'Pin to favorites'}
                          className="hover:bg-gray-100 rounded p-1 transition-colors"
                        >
                          <Star className={`h-4 w-4 ${fav ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {logged ? (
                          <button onClick={() => removeForDay(g, modalDateISO)} className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600 transition-colors">
                            Remove
                          </button>
                        ) : (
                          <button onClick={() => addForDay(g, modalDateISO)} className="rounded bg-[#01B1AF] px-3 py-1 text-xs text-white hover:bg-[#018a88] transition-colors">
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => { setShowDayModal(false); setModalDateISO(null); }} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
