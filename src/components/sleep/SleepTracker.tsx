// src/components/sleep/SleepTracker.tsx
import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { supabase } from '../../lib/supabase';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';
import {
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  Bed,
  Loader2,
  ChevronDown,
  ChevronUp,
  Star,
  Brain,
  Heart,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import Button from '../ui/Button';
import { format, parseISO } from 'date-fns';

interface SleepEntry {
  id: string;
  user_id: string;
  date: string;         // yyyy-MM-dd
  sleep_time: string;   // HH:mm
  wake_time: string;    // HH:mm
  quality: number;      // 1-5
  notes: string | null;
  created_at: string;
}

/** Tips panel styled like JournalGuide (green gradient, white/10 cards) */
const SleepGuide = () => (
  <div className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] rounded-lg p-4 md:p-6 space-y-4 text-white text-sm">
    <div className="flex items-center space-x-4 mb-2 md:mb-4">
      <Bed className="h-8 w-8 text-white" />
      <h2 className="text-xl font-semibold text-white">Better Sleep Tips</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Left: concepts */}
      <div className="space-y-5">
        <div className="flex items-start space-x-3">
          <Brain className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Consistency builds sleep pressure</h3>
            <p className="text-white/80">
              Keep the same wake time daily (yes—weekends too). Anchor light exposure in the morning and
              avoid long naps (&gt;20–30 min). Your body loves predictable rhythms.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Heart className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Downshift your nervous system</h3>
            <p className="text-white/80">
              60–90 minutes before bed: dim lights, reduce screens, and choose calming activities
              (light stretch, bath, breathwork, or reading).
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Sparkles className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Optimize your environment</h3>
            <p className="text-white/80">
              Cool, dark, and quiet. Consider blackout curtains, eye mask, earplugs/white noise,
              and reserve the bed for sleep and intimacy (not work or scrolling).
            </p>
          </div>
        </div>
      </div>

      {/* Right: actionable lists */}
      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Actionable Checklist</h3>
        <div className="space-y-4">
          <div>
            <div className="text-white font-medium mb-1">Evening Wind-Down (pick 2–3)</div>
            <ul className="text-white/80 space-y-2">
              <li>• Set screens to warm/night mode after sunset</li>
              <li>• Light stretch or 5–10 min breathwork (4-7-8, box breathing)</li>
              <li>• Warm shower/bath 60–90 min before bed</li>
              <li>• Journal a quick “brain dump” to park tomorrow’s tasks</li>
            </ul>
          </div>

          <div>
            <div className="text-white font-medium mb-1">Morning Anchors</div>
            <ul className="text-white/80 space-y-2">
              <li>• Wake at the same time daily</li>
              <li>• 5–10 minutes of outdoor light within 1 hour of waking</li>
              <li>• Move your body (walk, mobility, gentle exercise)</li>
            </ul>
          </div>

          <div>
            <div className="text-white font-medium mb-1">If You Wake at Night</div>
            <ul className="text-white/80 space-y-2">
              <li>• If not sleepy after ~20 min, get up and read in dim light</li>
              <li>• Avoid clock-watching; keep lights low</li>
              <li>• Return to bed only when sleepy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <p className="text-white/80">
      Use “Notes” in each entry to track what you tried (e.g., wind-down routine, caffeine cutoff time,
      morning light). Over a couple of weeks, patterns will emerge.
    </p>
  </div>
);

export default function SleepTracker() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPlusOrPremium = hasAccess('sleep-tracker');

  if (!isPlusOrPremium) {
    return (
      <FeatureAccessGuard featureId="sleep-tracker" currentPlan={currentPlan}>
        <SleepTrackerContent />
      </FeatureAccessGuard>
    );
  }

  return <SleepTrackerContent />;
}

function SleepTrackerContent() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const { userData } = useUser();

  const [newEntry, setNewEntry] = useState<Partial<SleepEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    sleep_time: '22:00',
    wake_time: '06:00',
    quality: 3,
    notes: ''
  });

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id]);

  const loadEntries = async () => {
    if (!userData?.id) return;
    try {
      const { data, error } = await supabase
        .from('sleep_entries')
        .select('*')
        .eq('user_id', userData.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error('Error loading sleep entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sleep entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.id) return;

    try {
      const { error } = await supabase
        .from('sleep_entries')
        .insert([{ ...newEntry, user_id: userData.id }]);

      if (error) throw error;

      setNewEntry({
        date: format(new Date(), 'yyyy-MM-dd'),
        sleep_time: '22:00',
        wake_time: '06:00',
        quality: 3,
        notes: ''
      });
      await loadEntries();
    } catch (err) {
      console.error('Error saving sleep entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to save sleep entry');
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sleep entry?')) return;

    try {
      const { error } = await supabase
        .from('sleep_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', userData?.id || '');

      if (error) throw error;
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      console.error('Error deleting sleep entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete sleep entry');
    }
  };

  const calculateSleepDuration = (sleepTime: string | null | undefined, wakeTime: string | null | undefined) => {
    if (!sleepTime || !wakeTime || typeof sleepTime !== 'string' || typeof wakeTime !== 'string') {
      console.warn('Invalid sleep time values:', { sleepTime, wakeTime });
      return 'N/A';
    }

    const sleepFormatted = sleepTime.length === 5 ? `${sleepTime}:00` : sleepTime;
    const wakeFormatted = wakeTime.length === 5 ? `${wakeTime}:00` : wakeTime;

    const sleep = new Date(`2000-01-01T${sleepFormatted}`);
    let wake = new Date(`2000-01-01T${wakeFormatted}`);

    if (isNaN(sleep.getTime()) || isNaN(wake.getTime())) {
      console.warn('Invalid date parsing:', { sleepFormatted, wakeFormatted, sleepDate: sleep, wakeDate: wake });
      return 'N/A';
    }

    if (wake < sleep) wake.setDate(wake.getDate() + 1);
    const diffMs = wake.getTime() - sleep.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  const getQualityLabel = (quality: number) => {
    switch (quality) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Unknown';
    }
  };

  const getQualityColor = (quality: number) => {
    switch (quality) {
      case 1: return 'text-red-500';
      case 2: return 'text-orange-500';
      case 3: return 'text-yellow-500';
      case 4: return 'text-green-500';
      case 5: return 'text-brand-green';
      default: return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Header w/ collapsible tips (green gradient like Journal) */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sleep Tracker</h1>
            <p className="text-base text-white/80">Track your sleep patterns and quality</p>
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
        {showGuide && <SleepGuide />}
      </div>

      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Entry form (always visible) */}
      <div className="bg-[#01B1AF] rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Add Sleep Entry</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white">Date</label>
              <input
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Sleep Quality</label>
              <select
                value={newEntry.quality}
                onChange={(e) => setNewEntry({ ...newEntry, quality: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                required
              >
                <option value={1}>Poor</option>
                <option value={2}>Fair</option>
                <option value={3}>Good</option>
                <option value={4}>Very Good</option>
                <option value={5}>Excellent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Bedtime</label>
              <input
                type="time"
                value={newEntry.sleep_time}
                onChange={(e) => setNewEntry({ ...newEntry, sleep_time: e.target.value })}
                className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Wake Time</label>
              <input
                type="time"
                value={newEntry.wake_time}
                onChange={(e) => setNewEntry({ ...newEntry, wake_time: e.target.value })}
                className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white">Notes (Optional)</label>
            <textarea
              value={newEntry.notes || ''}
              onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
              placeholder="What impacted your sleep? (caffeine cutoff, wind-down, morning light, workout, stress, etc.)"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() =>
                setNewEntry({
                  date: format(new Date(), 'yyyy-MM-dd'),
                  sleep_time: '22:00',
                  wake_time: '06:00',
                  quality: 3,
                  notes: ''
                })
              }
              type="button"
            >
              Clear
            </Button>
            <Button type="submit" className="bg-white text-[#01B1AF] hover:bg-gray-100">
              Save Entry
            </Button>
          </div>
        </form>
      </div>

      {/* Entries list */}
      {entries.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <Bed className="mx-auto h-12 w-12 text-gray-500" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No sleep entries yet</h3>
          <p className="mt-1 text-sm text-gray-600">Start tracking your sleep by adding your first entry.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-gray-100 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-brand-green mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                      {format(parseISO(entry.date), 'MMMM d, yyyy')}
                    </h3>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4">
                    <div className="flex items-center text-gray-700">
                      <Clock className="h-4 w-4 mr-1 text-gray-600" />
                      <span>{entry.sleep_time} - {entry.wake_time}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Bed className="h-4 w-4 mr-1 text-gray-600" />
                      <span>{calculateSleepDuration(entry.sleep_time, entry.wake_time)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= entry.quality ? getQualityColor(entry.quality) : 'text-gray-400'}`}
                            fill={star <= entry.quality ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-700">{getQualityLabel(entry.quality)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                    title="Show notes"
                  >
                    {expandedEntry === entry.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {expandedEntry === entry.id && entry.notes && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">{entry.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
