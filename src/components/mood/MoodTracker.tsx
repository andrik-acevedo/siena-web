// src/components/mood/MoodTracker.tsx
import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, BarChart, HelpCircle, Brain, Heart, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';

import EnhancedCalendar from './EnhancedCalendar';
import { MOODS } from './mood.constants';
import {
  startOfWeekSun as startOfWeek,
  endOfWeekSun as endOfWeek,
  startOfYear,
  endOfYear,
  subDays,
  getMoodStats,
  formatDate,
} from '../mood/mood.utils';

function MoodGuide() {
  return (
    <div className="mt-6 bg-gradient-to-br from-[#01B1AF] to-[#018a88] rounded-lg p-4 md:p-6 space-y-4 text-white text-sm">
      <div className="flex items-center space-x-4 mb-2 md:mb-4">
        <HelpCircle className="h-8 w-8 text-white" />
        <h2 className="text-xl font-semibold text-white">Tips for Tracking Your Mood</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Left: principles */}
        <div className="space-y-5">
          <div className="flex items-start space-x-3">
            <Brain className="h-6 w-6 text-white mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white">Name it to tame it</h3>
              <p className="text-white/80">
                Labeling emotions helps regulate them. Pick the closest mood—even if it isn’t perfect. Patterns
                emerge over time.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Heart className="h-6 w-6 text-white mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white">Capture context</h3>
              <p className="text-white/80">
                If a mood felt strong, jot a quick note elsewhere (e.g., Sleep/Journal) about triggers,
                body sensations, or what helped.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Sparkles className="h-6 w-6 text-white mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white">Small, consistent check-ins</h3>
              <p className="text-white/80">
                One tag a day is enough. You’re building awareness—not a perfect record.
              </p>
            </div>
          </div>
        </div>

        {/* Right: quick actions */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <div>
              <div className="text-white font-medium mb-1">Daily rhythm</div>
              <ul className="text-white/80 space-y-2">
                <li>• Pick a mood each evening (takes 5 seconds).</li>
                <li>• If you skip a day, just continue—no backfilling needed.</li>
              </ul>
            </div>
            <div>
              <div className="text-white font-medium mb-1">When stuck</div>
              <ul className="text-white/80 space-y-2">
                <li>• Choose “Neutral” and add more detail tomorrow.</li>
                <li>• Ask Siena for a 60-second grounding if emotions spike.</li>
              </ul>
            </div>
            <div>
              <div className="text-white font-medium mb-1">Review & learn</div>
              <ul className="text-white/80 space-y-2">
                <li>• Check “Last 30 Days” weekly to spot trends.</li>
                <li>• Turn insights into a tiny Habit or Goal.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MoodTracker() {
  const { userData } = useUser();

  // Calendar + mood state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [moodEntries, setMoodEntries] = useState<Array<{ date: string; mood: string }>>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!userData?.id) return;

    const load = async () => {
      const { data, error } = await supabase
        .from('moods')
        .select('date, mood')
        .eq('user_id', userData.id);

      if (error) {
        console.error('Error loading moods:', error);
        return;
      }
      setMoodEntries((data ?? []).map((e) => ({ date: e.date as string, mood: e.mood as string })));
    };

    load();
  }, [userData?.id]);

  // Keep selectedMood in sync with the currently selected day
  useEffect(() => {
    const existing = moodEntries.find((e) => e.date === formatDate(selectedDate, 'yyyy-MM-dd'));
    setSelectedMood(existing?.mood ?? null);
  }, [selectedDate, moodEntries]);

  // Update mood in Supabase (same logic as Dashboard)
  const handleMoodSelect = async (mood: string) => {
    if (!userData?.id) return;
    const dateStr = formatDate(selectedDate, 'yyyy-MM-dd');

    try {
      const { data: existing } = await supabase
        .from('moods')
        .select('id')
        .eq('user_id', userData.id)
        .eq('date', dateStr)
        .maybeSingle();

      // deselect if clicking the same mood
      if (selectedMood === mood) {
        if (existing) await supabase.from('moods').delete().eq('id', existing.id);
        setMoodEntries((prev) => prev.filter((e) => e.date !== dateStr));
        setSelectedMood(null);
        return;
      }

      if (existing) {
        await supabase.from('moods').update({ mood }).eq('id', existing.id);
      } else {
        await supabase.from('moods').insert([{ user_id: userData.id, date: dateStr, mood }]);
      }

      setMoodEntries((prev) => {
        const without = prev.filter((e) => e.date !== dateStr);
        return [...without, { date: dateStr, mood }];
      });
      setSelectedMood(mood);
    } catch (err) {
      console.error('Error saving mood:', err);
    }
  };

  // Stats (uses the shared utils; weeks start on Sunday)
  const now = new Date();
  const weekStats = getMoodStats(moodEntries, startOfWeek(now), endOfWeek(now)); // Sun–Sat
  const monthStats = getMoodStats(moodEntries, subDays(now, 29), now); // last 30 days
  const yearStats = getMoodStats(moodEntries, startOfYear(now), endOfYear(now)); // Jan 1–Dec 31

  // Mood wheel (unchanged)
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAngle, setLastAngle] = useState(0);
  const wheelRef = useRef<HTMLImageElement>(null);

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header with Tips toggle */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
        <div className="relative z-10 flex items-start md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Mood Tracker</h1>
            <p className="text-lg text-white/80">Track and understand your emotional patterns</p>
          </div>
          <button
            onClick={() => setShowGuide((s) => !s)}
            className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">Tips</span>
            {showGuide ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
          </button>
        </div>

        {showGuide && <MoodGuide />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar (shared) */}
        <div className="border-[5px] border-[#01B1AF]/20 rounded-2xl p-6 shadow-sm h-[450px]">
          <EnhancedCalendar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            moodEntries={moodEntries}
            currentViewDate={currentViewDate}
            setCurrentViewDate={setCurrentViewDate}
          />
        </div>

        {/* Mood selector */}
        <div className="bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-2xl p-6 h-[450px] flex flex-col">
          <h3 className="text-lg font-medium text-white mb-2">
            How are you feeling on {formatDate(selectedDate, 'MMMM d, yyyy')}?
          </h3>
          <p className="text-sm text-white/70 mb-4">Click a mood to select it, or click again to deselect</p>
          <div className="grid grid-cols-5 gap-2 flex-grow overflow-y-auto">
            {MOODS.map(({ value, icon: Icon, label, color }) => (
              <button
                key={value}
                onClick={() => handleMoodSelect(value)}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                  selectedMood === value
                    ? 'border-[#01B1AF] bg-[#01B1AF]/10'
                    : 'border-gray-700 hover:border-[#01B1AF]/60'
                }`}
              >
                <Icon className={`h-6 w-6 ${color}`} />
                <span className="text-xs text-white mt-2">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-white" />
            <h3 className="text-lg font-medium text-white">This Week (Sun–Sat)</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white">Positive</span>
              <span className="text-white font-medium">{weekStats.positive}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Neutral</span>
              <span className="text-white font-medium">{weekStats.neutral}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Negative</span>
              <span className="text-white font-medium">{weekStats.negative}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#008792] to-[#006a70] rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart className="h-5 w-5 text-white" />
            <h3 className="text-lg font-medium text-white">Last 30 Days</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white">Positive</span>
              <span className="text-white font-medium">{monthStats.positive}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Neutral</span>
              <span className="text-white font-medium">{monthStats.neutral}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Negative</span>
              <span className="text-white font-medium">{monthStats.negative}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#00789f] to-[#005a77] rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-white" />
            <h3 className="text-lg font-medium text-white">This Year</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white">Positive</span>
              <span className="text-white font-medium">{yearStats.positive}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Neutral</span>
              <span className="text-white font-medium">{yearStats.neutral}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white">Negative</span>
              <span className="text-white font-medium">{yearStats.negative}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
