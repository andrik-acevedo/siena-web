// src/components/medications/MedicationManagement.tsx
import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { supabase } from '../../lib/supabase';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';
import {
  Pill,
  Trash2,
  Clock,
  Calendar,
  Bell,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Edit,
  X,
  Brain,
  Heart,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import Button from '../ui/Button';
import { format, addDays, isAfter, isBefore, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

interface WellnessAid {
  id: string;
  name: string;
  dosage: string;
  frequency: string;        // 'daily' | 'twice_daily' | 'three_times_daily' | 'four_times_daily' | 'weekly' | 'as_needed' | 'other'
  time_of_day: string;      // 'morning' | 'afternoon' | 'evening' | 'bedtime' | 'with_food' | 'multiple'
  start_date: string;       // yyyy-MM-dd
  end_date?: string;
  notes?: string;
  refill_date?: string;     // yyyy-MM-dd
  refill_reminder: boolean;
  created_at: string;
  updated_at: string;
}

interface WellnessAidLog {
  id: string;
  medication_id: string;
  date: string;       // yyyy-MM-dd
  time: string;       // HH:mm:ss
  taken: boolean;
  notes?: string;
  created_at: string;
}

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'twice_daily', label: 'Twice Daily' },
  { value: 'three_times_daily', label: 'Three Times Daily' },
  { value: 'four_times_daily', label: 'Four Times Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As Needed' },
  { value: 'other', label: 'Other' }
];

const TIME_OF_DAY = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'bedtime', label: 'Bedtime' },
  { value: 'with_food', label: 'With Food' },
  { value: 'multiple', label: 'Multiple Times' }
];

const WellnessAidsGuide = () => (
  <div className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] rounded-lg p-4 md:p-6 space-y-4 text-white text-sm">
    <div className="flex items-center space-x-4 mb-4">
      <Pill className="h-8 w-8 text-white" />
      <h2 className="text-xl font-semibold text-white">Wellness Aids Tracking Guide</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Brain className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Consistency</h3>
            <p className="text-white/80">Regular tracking of supplements and wellness aids helps you maintain healthy routines and notice patterns.</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Heart className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Tracking</h3>
            <p className="text-white/80">Monitoring your wellness aids helps identify what works best for your routine and wellbeing.</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Sparkles className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Reminders</h3>
            <p className="text-white/80">Setting up reminders helps you maintain consistent wellness routines.</p>
          </div>
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Best Practices</h3>

        <div className="space-y-4">
          <div>
            <div className="text-white font-medium mb-1">Organization</div>
            <ul className="text-white/80 space-y-2">
              <li>• Keep a complete list of all supplements and wellness aids</li>
              <li>• Store items properly according to their instructions</li>
              <li>• Use organizers for multiple vitamins and supplements</li>
            </ul>
          </div>

          <div>
            <div className="text-white font-medium mb-1">Awareness</div>
            <ul className="text-white/80 space-y-2">
              <li>• Keep track of how different supplements affect you</li>
              <li>• Note any changes in energy, mood, or wellbeing</li>
              <li>• Research new additions to your wellness routine</li>
            </ul>
          </div>

          <div>
            <div className="text-white font-medium mb-1">Planning</div>
            <ul className="text-white/80 space-y-2">
              <li>• Set restock reminders before running out</li>
              <li>• Plan ahead for travel or schedule changes</li>
              <li>• Maintain consistent timing for best results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ---------------------- SMS helpers ----------------------

/** Convert common US phone formats to E.164, or return null if invalid. */
function normalizeE164(p?: string | null): string | null {
  if (!p) return null;
  const digits = p.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (p.startsWith('+')) return p;
  return null;
}

/** Default clock times for time_of_day buckets */
const TIME_OF_DAY_DEFAULTS: Record<string, string> = {
  morning: '08:00',
  afternoon: '13:00',
  evening: '18:00',
  bedtime: '22:00',
  with_food: '12:00',
  multiple: '09:00'
};

/** Given frequency and time_of_day, return one or more HH:mm dose slots */
function doseSlotsFor(aid: WellnessAid): string[] {
  const t = TIME_OF_DAY_DEFAULTS[aid.time_of_day] || '09:00';
  switch (aid.frequency) {
    case 'daily':
      return [t];
    case 'twice_daily':
      return ['08:00', '20:00'];
    case 'three_times_daily':
      return ['08:00', '13:00', '18:00'];
    case 'four_times_daily':
      return ['08:00', '12:00', '16:00', '20:00'];
    case 'weekly':
      return [t];
    default:
      // as_needed / other -> do not auto-schedule
      return [];
  }
}

function toLocalISO(date: Date) {
  // format as local ISO without timezone conversion; keep as .toISOString() for backend scheduling
  return date.toISOString();
}

/** Build the next 1–2 upcoming dose datetimes (<= 36h out) respecting start/end range & weekly cadence */
function nextDoseDateTimes(aid: WellnessAid): Date[] {
  const now = new Date();
  const start = parseISO(aid.start_date);
  const end = aid.end_date ? parseISO(aid.end_date) : null;

  // If not in active window, nothing to schedule
  if (isAfter(start, now)) {
    // schedule on start day
  }
  if (end && isBefore(end, now)) return [];

  const slots = doseSlotsFor(aid);
  if (slots.length === 0) return [];

  const results: Date[] = [];
  const windowEnd = new Date(now.getTime() + 36 * 60 * 60 * 1000); // 36h window

  // Helper to create Date for yyyy-MM-dd + HH:mm
  const mk = (d: Date, hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m, 0, 0);
    return dt;
  };

  // For weekly, align to weekday of start_date
  const anchorDow = parseISO(aid.start_date).getDay();

  // Try today and tomorrow for daily/multi; for weekly, find the next anchor weekday
  if (aid.frequency === 'weekly') {
    // find the next date with same weekday as anchorDow
    let d = new Date();
    for (let i = 0; i < 14; i++) {
      if (d.getDay() === anchorDow) break;
      d = addDays(d, 1);
    }
    slots.forEach((s) => {
      const dt = mk(d, s);
      if (dt > now && dt <= windowEnd) results.push(dt);
      // if it's beyond window, we still want at least one reminder in the future
      if (results.length === 0 && dt > now) results.push(dt);
    });
  } else {
    // daily / multi-times-per-day
    [0, 1].forEach((offset) => {
      const d = addDays(new Date(), offset);
      slots.forEach((s) => {
        const dt = mk(d, s);
        // respect start/end window
        if (isAfter(parseISO(aid.start_date), dt)) return;
        if (aid.end_date && isAfter(dt, parseISO(aid.end_date))) return;
        if (dt > now && dt <= windowEnd) results.push(dt);
      });
    });
  }

  // Deduplicate & sort
  const uniq = Array.from(new Set(results.map((x) => x.getTime()))).map((t) => new Date(t));
  uniq.sort((a, b) => a.getTime() - b.getTime());
  return uniq.slice(0, 4); // cap a few events
}

async function scheduleSMS({
  to,
  message,
  scheduledTime,
  wellnessAidId,
  kind
}: {
  to: string;
  message: string;
  scheduledTime: string;
  wellnessAidId: string;
  kind: 'dose' | 'refill' | 'confirm';
}) {
  const { data, error } = await supabase.functions.invoke('schedule-sms-reminder', {
    body: { phoneNumber: to, message, scheduledTime, wellnessAidId, kind }
  });
  if (error) throw new Error(error.message || 'schedule-sms-reminder failed');
  if (!data?.success) throw new Error(data?.error || 'Twilio send failed');
  return data;
}

/** Schedule next dose reminder(s) for the wellness aid */
async function scheduleDoseReminders(aid: WellnessAid, userPhone?: string | null) {
  const to = normalizeE164(userPhone);
  if (!to) return; // silently skip if no valid phone

  const upcoming = nextDoseDateTimes(aid);
  const minLeadMs = 5 * 60 * 1000; // skip anything within 5 minutes
  const now = Date.now();

  let scheduled = 0;
  for (const dt of upcoming) {
    if (dt.getTime() - now < minLeadMs) continue;

    const message = `💊 Reminder: ${aid.name} (${aid.dosage}) ${format(dt, 'h:mm a')} today. Reply STOP to opt out.`;
    await scheduleSMS({
      to,
      message,
      scheduledTime: toLocalISO(dt),
      wellnessAidId: aid.id,
      kind: 'dose'
    });
    scheduled++;
  }

  if (scheduled > 0) {
    toast.success(`Scheduled ${scheduled} reminder${scheduled > 1 ? 's' : ''} for ${aid.name}`);
  }
}

/** Schedule restock reminders (7 days before & on the day) if enabled */
async function scheduleRestockReminders(aid: WellnessAid, userPhone?: string | null) {
  if (!aid.refill_reminder || !aid.refill_date) return;

  const to = normalizeE164(userPhone);
  if (!to) return;

  const target = parseISO(aid.refill_date);
  const morning = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 10, 0, 0, 0);

  const dayOf = morning(target);
  const sevenBefore = morning(addDays(target, -7));

  const plan = [sevenBefore, dayOf]
    .filter((d) => d.getTime() - Date.now() > 5 * 60 * 1000) // >5min in future
    .slice(0, 2);

  let scheduled = 0;
  for (const dt of plan) {
    const when = format(dt, 'MMM d, yyyy');
    const message = `💊 Restock Reminder: ${aid.name} is due by ${format(target, 'MMM d, yyyy')}. (Scheduled: ${when})`;
    await scheduleSMS({
      to,
      message,
      scheduledTime: toLocalISO(dt),
      wellnessAidId: aid.id,
      kind: 'refill'
    });
    scheduled++;
  }

  if (scheduled > 0) {
    toast.success(`Restock reminder${scheduled > 1 ? 's' : ''} set for ${aid.name}`);
  }
}

/** Optional: send a one-off confirmation text after save */
async function sendWellnessAidConfirmation(aid: WellnessAid, userPhone?: string | null) {
  const to = normalizeE164(userPhone);
  if (!to) return;

  const msg =
    `💊 Saved "${aid.name}" (${aid.dosage}). ` +
    (aid.frequency === 'as_needed' || aid.frequency === 'other'
      ? `Logging enabled.`
      : `Reminders will be sent around your scheduled times.`);

  const scheduledTime = new Date(Date.now() + 60 * 1000);
  await scheduleSMS({
    to,
    message: msg,
    scheduledTime: toLocalISO(scheduledTime),
    wellnessAidId: aid.id,
    kind: 'confirm'
  });
}

// ---------------------- Component ----------------------

export default function WellnessAidsManagement() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPlusOrPremium = hasAccess('medication-management');

  if (!isPlusOrPremium) {
    return (
      <FeatureAccessGuard featureId="medication-management" currentPlan={currentPlan}>
        <WellnessAidsManagementContent />
      </FeatureAccessGuard>
    );
  }

  return <WellnessAidsManagementContent />;
}

function WellnessAidsManagementContent() {
  const { userData } = useUser();
  const [wellnessAids, setWellnessAids] = useState<WellnessAid[]>([]);
  const [wellnessAidLogs, setWellnessAidLogs] = useState<WellnessAidLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [expandedWellnessAid, setExpandedWellnessAid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReminders, setShowReminders] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  const [newWellnessAid, setNewWellnessAid] = useState<Partial<WellnessAid>>({
    name: '',
    dosage: '',
    frequency: 'daily',
    time_of_day: 'morning',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    refill_reminder: true
  });

  useEffect(() => {
    if (userData?.id) {
      loadWellnessAids();
      loadWellnessAidLogs();
    }
  }, [userData?.id]);

  const loadWellnessAids = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userData.id)
        .order('name');

      if (error) throw error;
      setWellnessAids(data || []);
    } catch (err) {
      console.error('Error loading wellness aids:', err);
      setError('Failed to load wellness aids');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWellnessAidLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', userData.id)
        .order('date', { ascending: false })
        .order('time', { ascending: false })
        .limit(100);

      if (error) throw error;
      setWellnessAidLogs(data || []);
    } catch (err) {
      console.error('Error loading wellness aid logs:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.id) return;

    try {
      setError(null);

      if (isEditing) {
        const { data, error } = await supabase
          .from('medications')
          .update({
            ...newWellnessAid,
            updated_at: new Date().toISOString()
          })
          .eq('id', isEditing)
          .eq('user_id', userData.id)
          .select()
          .single();

        if (error) throw error;
        toast.success('Wellness aid updated successfully');

        // Replace in state
        setWellnessAids((prev) => prev.map((m) => (m.id === isEditing ? (data as WellnessAid) : m)));

        // Schedule SMS (dose + restock) and send confirmation
        if (data) {
          await sendWellnessAidConfirmation(data as WellnessAid, userData?.phone);
          await scheduleDoseReminders(data as WellnessAid, userData?.phone);
          await scheduleRestockReminders(data as WellnessAid, userData?.phone);
        }
      } else {
        const { data, error } = await supabase
          .from('medications')
          .insert([
            {
              ...newWellnessAid,
              user_id: userData.id
            }
          ])
          .select()
          .single();

        if (error) throw error;
        toast.success('Wellness aid added successfully');

        if (data) {
          // Prepend to list
          setWellnessAids((prev) => [data as WellnessAid, ...prev]);

          // Schedule SMS (dose + restock) and send confirmation
          await sendWellnessAidConfirmation(data as WellnessAid, userData?.phone);
          await scheduleDoseReminders(data as WellnessAid, userData?.phone);
          await scheduleRestockReminders(data as WellnessAid, userData?.phone);
        }
      }

      // reset form (form stays visible)
      setIsEditing(null);
      setNewWellnessAid({
        name: '',
        dosage: '',
        frequency: 'daily',
        time_of_day: 'morning',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        refill_reminder: true
      });
      loadWellnessAids();
    } catch (err: any) {
      console.error('Error saving wellness aid:', err);
      setError(err.message || 'Failed to save wellness aid');
      toast.error('Failed to save wellness aid');
    }
  };

  const handleEdit = (wellnessAid: WellnessAid) => {
    setNewWellnessAid({
      name: wellnessAid.name,
      dosage: wellnessAid.dosage,
      frequency: wellnessAid.frequency,
      time_of_day: wellnessAid.time_of_day,
      start_date: wellnessAid.start_date,
      end_date: wellnessAid.end_date || '',
      notes: wellnessAid.notes || '',
      refill_date: wellnessAid.refill_date || '',
      refill_reminder: wellnessAid.refill_reminder
    });
    setIsEditing(wellnessAid.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wellness aid?')) return;

    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.id);

      if (error) throw error;
      setWellnessAids(wellnessAids.filter((aid) => aid.id !== id));
      toast.success('Wellness aid deleted successfully');
    } catch (err) {
      console.error('Error deleting wellness aid:', err);
      setError('Failed to delete wellness aid');
    }
  };

  const logWellnessAid = async (wellnessAidId: string, taken: boolean) => {
    try {
      const { error } = await supabase.from('medication_logs').insert([
        {
          medication_id: wellnessAidId,
          user_id: userData.id,
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm:ss'),
          taken
        }
      ]);

      if (error) throw error;
      loadWellnessAidLogs();
      toast.success(taken ? 'Wellness aid marked as taken' : 'Wellness aid skipped');
    } catch (err) {
      console.error('Error logging wellness aid:', err);
      setError('Failed to log wellness aid');
    }
  };

  const getWellnessAidStatus = (wellnessAid: WellnessAid) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const logs = wellnessAidLogs.filter((log) => log.medication_id === wellnessAid.id && log.date === today);

    if (logs.length === 0) return 'pending';
    const taken = logs.some((log) => log.taken);
    return taken ? 'taken' : 'skipped';
  };

  const needsRestock = (wellnessAid: WellnessAid) => {
    if (!wellnessAid.refill_date) return false;

    const restockDate = parseISO(wellnessAid.refill_date);
    const today = new Date();
    const sevenDaysFromNow = addDays(today, 7);

    return isBefore(restockDate, sevenDaysFromNow);
  };

  const isActive = (wellnessAid: WellnessAid) => {
    const today = new Date();
    const startDate = parseISO(wellnessAid.start_date);

    if (isAfter(startDate, today)) return false;

    if (wellnessAid.end_date) {
      const endDate = parseISO(wellnessAid.end_date);
      if (isBefore(endDate, today)) return false;
    }

    return true;
  };

  const getLastTaken = (wellnessAidId: string) => {
    const logs = wellnessAidLogs
      .filter((log) => log.medication_id === wellnessAidId && log.taken)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return logs.length > 0 ? logs[0] : null;
  };

  const renderWellnessAidForm = () => (
    <div className="bg-[#01B1AF] p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-4">{isEditing ? 'Edit Wellness Aid' : 'Add New Wellness Aid'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white">Supplement, Vitamin, or Wellness Aid Name</label>
            <input
              type="text"
              value={newWellnessAid.name || ''}
              onChange={(e) => setNewWellnessAid({ ...newWellnessAid, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">Dosage</label>
            <input
              type="text"
              value={newWellnessAid.dosage || ''}
              onChange={(e) => setNewWellnessAid({ ...newWellnessAid, dosage: e.target.value })}
              className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
              required
              placeholder="e.g., 1000mg, 2 capsules, 1 scoop"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">Frequency</label>
            <select
              value={newWellnessAid.frequency || 'daily'}
              onChange={(e) => setNewWellnessAid({ ...newWellnessAid, frequency: e.target.value })}
              className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
              required
            >
              {FREQUENCIES.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white">Time of Day</label>
            <select
              value={newWellnessAid.time_of_day || 'morning'}
              onChange={(e) => setNewWellnessAid({ ...newWellnessAid, time_of_day: e.target.value })}
              className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
              required
            >
              {TIME_OF_DAY.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white">Start Date</label>
            <input
              type="date"
              value={newWellnessAid.start_date || format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setNewWellnessAid({ ...newWellnessAid, start_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">End Date (Optional)</label>
            <input
              type="date"
              value={newWellnessAid.end_date || ''}
              onChange={(e) => setNewWellnessAid({ ...newWellnessAid, end_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white">Next Restock Date (Optional)</label>
            <input
              type="date"
              value={newWellnessAid.refill_date || ''}
              onChange={(e) => setNewWellnessAid({ ...newWellnessAid, refill_date: e.target.value })}
              className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
            />
          </div>

          <div className="flex items-center h-full">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!newWellnessAid.refill_reminder}
                onChange={(e) => setNewWellnessAid({ ...newWellnessAid, refill_reminder: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
              />
              <span className="text-sm text-white">Enable restock reminders</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white">Notes (Optional)</label>
          <textarea
            value={newWellnessAid.notes || ''}
            onChange={(e) => setNewWellnessAid({ ...newWellnessAid, notes: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
            placeholder="Special instructions, effects to watch for, etc."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(null);
              setNewWellnessAid({
                name: '',
                dosage: '',
                frequency: 'daily',
                time_of_day: 'morning',
                start_date: format(new Date(), 'yyyy-MM-dd'),
                refill_reminder: true
              });
            }}
            type="button"
          >
            Clear
          </Button>
          <Button type="submit" className="bg-white text-[#01B1AF] hover:bg-gray-100">
            {isEditing ? 'Update Wellness Aid' : 'Add Wellness Aid'}
          </Button>
        </div>
      </form>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Wellness Aids</h1>
              <p className="text-base text-white/80">Track your supplements, vitamins, and wellness aids</p>
              <div className="mt-3 bg-white/10 border border-white/20 rounded-lg p-3">
                <p className="text-white/90 text-sm">
                  <strong>Note:</strong> This feature is for personal wellness feedback or tracking only and is not intended for storing medical records.
                </p>
              </div>
            </div>

            {/* Collapsible Guide Button */}
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">Tips</span>
              {showGuide ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
            </button>
          </div>

          {/* Collapsible Guide */}
          {showGuide && <WellnessAidsGuide />}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Form is always visible; no "Add Medication" button */}
      {renderWellnessAidForm()}

      {/* Empty state or list */}
      {wellnessAids.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <Pill className="mx-auto h-12 w-12 text-gray-500" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No wellness aids added yet</h3>
          <p className="mt-1 text-sm text-gray-600">Add your first supplement or wellness aid to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {showReminders && (
            <div className="bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-brand-green" />
                  Wellness Aid Reminders
                </h2>
                <button onClick={() => setShowReminders(false)} className="text-gray-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {wellnessAids.filter((aid) => isActive(aid) && getWellnessAidStatus(aid) === 'pending').length === 0 ? (
                  <p className="text-gray-300">No pending wellness aids for today.</p>
                ) : (
                  wellnessAids
                    .filter((aid) => isActive(aid) && getWellnessAidStatus(aid) === 'pending')
                    .map((aid) => (
                      <div key={aid.id} className="bg-[#03274B] rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">
                            {aid.name} ({aid.dosage})
                          </h3>
                          <p className="text-gray-300 text-sm">
                            {TIME_OF_DAY.find((t) => t.value === aid.time_of_day)?.label} -{' '}
                            {FREQUENCIES.find((f) => f.value === aid.frequency)?.label}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => logWellnessAid(aid.id, true)}
                            className="bg-brand-green text-white p-2 rounded-full hover:bg-brand-green/80"
                            title="Mark as taken"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => logWellnessAid(aid.id, false)}
                            className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-500/80"
                            title="Skip today"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))
                )}

                {wellnessAids.filter((aid) => needsRestock(aid)).length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-white font-medium mb-2">Restock Reminders</h3>
                    {wellnessAids
                      .filter((aid) => needsRestock(aid))
                      .map((aid) => (
                        <div key={`restock-${aid.id}`} className="bg-yellow-900/20 border-l-4 border-yellow-500 p-3 rounded-lg mb-2">
                          <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                            <div>
                              <p className="text-white">{aid.name} needs restock</p>
                              <p className="text-gray-300 text-sm">Restock by: {format(parseISO(aid.refill_date!), 'MMM d, yyyy')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {wellnessAids.map((wellnessAid) => (
            <div key={wellnessAid.id} className="bg-gray-100 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">{wellnessAid.name}</h3>
                    <span className="ml-2 text-gray-700">({wellnessAid.dosage})</span>

                    {getWellnessAidStatus(wellnessAid) === 'taken' && (
                      <span className="ml-3 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Taken
                      </span>
                    )}

                    {getWellnessAidStatus(wellnessAid) === 'skipped' && (
                      <span className="ml-3 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        <X className="h-3 w-3 mr-1" />
                        Skipped
                      </span>
                    )}

                    {!isActive(wellnessAid) && (
                      <span className="ml-3 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600 space-x-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {FREQUENCIES.find((f) => f.value === wellnessAid.frequency)?.label}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {TIME_OF_DAY.find((t) => t.value === wellnessAid.time_of_day)?.label}
                    </div>
                    {wellnessAid.refill_date && (
                      <div className={`flex items-center ${needsRestock(wellnessAid) ? 'text-yellow-500' : ''}`}>
                        <Bell className="h-4 w-4 mr-1" />
                        Restock: {format(parseISO(wellnessAid.refill_date), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isActive(wellnessAid) && getWellnessAidStatus(wellnessAid) === 'pending' && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => logWellnessAid(wellnessAid.id, true)}
                        className="bg-brand-green text-white p-2 rounded-full hover:bg-brand-green/80"
                        title="Mark as taken"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => logWellnessAid(wellnessAid.id, false)}
                        className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-500/80"
                        title="Skip today"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => handleEdit(wellnessAid)}
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                    title="Edit wellness aid"
                  >
                    <Edit className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(wellnessAid.id)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    title="Delete wellness aid"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => setExpandedWellnessAid(expandedWellnessAid === wellnessAid.id ? null : wellnessAid.id)}
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {expandedWellnessAid === wellnessAid.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {expandedWellnessAid === wellnessAid.id && (
                <div className="mt-4 space-y-4 border-t border-gray-300 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Start Date</h4>
                      <p className="mt-1 text-gray-900">{format(parseISO(wellnessAid.start_date), 'MMMM d, yyyy')}</p>
                    </div>

                    {wellnessAid.end_date && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">End Date</h4>
                        <p className="mt-1 text-gray-900">{format(parseISO(wellnessAid.end_date), 'MMMM d, yyyy')}</p>
                      </div>
                    )}
                  </div>

                  {wellnessAid.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                      <p className="mt-1 text-gray-900 whitespace-pre-wrap">{wellnessAid.notes}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Recent History</h4>
                    <div className="mt-2 space-y-2">
                      {wellnessAidLogs
                        .filter((log) => log.medication_id === wellnessAid.id)
                        .slice(0, 5)
                        .map((log) => (
                          <div key={log.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                              {log.taken ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                              ) : (
                                <X className="h-4 w-4 text-gray-600 mr-2" />
                              )}
                              <span className="text-gray-900">
                                {format(parseISO(log.date), 'MMM d, yyyy')} at {log.time.substring(0, 5)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-600">{log.taken ? 'Taken' : 'Skipped'}</span>
                          </div>
                        ))}

                      {wellnessAidLogs.filter((log) => log.medication_id === wellnessAid.id).length === 0 && (
                        <p className="text-gray-600 text-sm">No history recorded yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
