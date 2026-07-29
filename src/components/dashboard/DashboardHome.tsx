import { useState, useEffect, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { supabase } from '../../lib/supabase';
import {
  Sun, Smile, Coffee, ThumbsUp, Meh, HelpCircle, Brain, Bed, Search, AlertCircle,
  Frown, Angry, CloudRain, Star, CloudOff, HeartCrack, Heart, PartyPopper, ArrowUp, ArrowDown,
  Headphones, BookOpen, Gift, Target, Trophy, Sparkles, Pill, MessageSquare, Clock, Calendar, Edit, FileText,
  Play, Pause, Square, Users, X
} from 'lucide-react';
import Button from '../ui/Button';
import { Link, useNavigate } from 'react-router-dom';

import EnhancedCalendar from '../mood/EnhancedCalendar';
import { MOODS } from '../mood/mood.constants';
import {
  formatDate, 
  startOfWeekSun as startOfWeek,
  endOfWeekSun as endOfWeek,
  startOfYear,
  endOfYear,
  subDays,
  getMoodStats,
} from '../mood/mood.utils';

export default function DashboardHome() {
  // ---------- state / refs ----------
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [moodEntries, setMoodEntries] = useState<Array<{date:string; mood:string}>>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const { userData } = useUser();
  const { currentPlan, hasAccess } = useSubscription();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  // ---------- effects ----------
  useEffect(() => {
    loadMoods();

    // init audio
    const audio = new Audio('https://static.wixstatic.com/mp3/4e16d8_65e41d47c8494041881ae090c682c72a.mp3');
    audio.loop = true;
    const onReady = () => setAudioLoaded(true);
    audio.addEventListener('canplaythrough', onReady);
    audioRef.current = audio;

    return () => {
      audio.removeEventListener('canplaythrough', onReady);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [userData?.id, hasAccess]);

  useEffect(() => {
    const hasShownWelcome = localStorage.getItem('premium_welcome_shown');
    if (currentPlan === 'premium' && !hasShownWelcome) {
      setShowWelcomeModal(true);
      localStorage.setItem('premium_welcome_shown', 'true');
    }
  }, [currentPlan]);

  useEffect(() => {
    const existing = moodEntries.find(e => e.date === formatDate(selectedDate, 'yyyy-MM-dd'));
    setSelectedMood(existing?.mood ?? null);
  }, [selectedDate, moodEntries]);

  // ---------- data loaders ----------
  const loadMoods = async () => {
    if (!userData?.id) return;
    try {
      const { data, error } = await supabase
        .from('moods')
        .select('date, mood')
        .eq('user_id', userData.id);
      if (error) throw error;
      setMoodEntries((data ?? []).map(e => ({ date: e.date as string, mood: e.mood as string })));
    } catch (err) {
      console.error('Error loading moods:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- handlers ----------
  const handleDateChange = (date: Date) => setSelectedDate(date);

  const handleMoodSelect = async (mood: string) => {
    if (!userData?.id) return;
    const dateStr = formatDate(selectedDate, 'yyyy-MM-dd');

    try {
      const { data: existingMood } = await supabase
        .from('moods')
        .select('id')
        .eq('user_id', userData.id)
        .eq('date', dateStr)
        .maybeSingle();

      // deselect if same mood clicked
      if (selectedMood === mood) {
        if (existingMood) await supabase.from('moods').delete().eq('id', existingMood.id);
        setMoodEntries(prev => prev.filter(e => e.date !== dateStr));
        setSelectedMood(null);
        return;
      }

      if (existingMood) {
        await supabase.from('moods').update({ mood }).eq('id', existingMood.id);
      } else {
        await supabase.from('moods').insert([{ user_id: userData.id, date: dateStr, mood }]);
      }

      setMoodEntries(prev => {
        const without = prev.filter(e => e.date !== dateStr);
        return [...without, { date: dateStr, mood }];
      });
      setSelectedMood(mood);
    } catch (err) {
      console.error('Error saving mood:', err);
    }
  };

  const handleGroundNow = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleStopAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  };

  // ---------- stats (shared util) ----------
const now = new Date();
const weekStats  = getMoodStats(moodEntries, startOfWeek(now), endOfWeek(now)); // Sun–Sat
const monthStats = getMoodStats(moodEntries, subDays(now, 29), now);            // last 30 days
const yearStats  = getMoodStats(moodEntries, startOfYear(now), endOfYear(now)); // Jan 1–Dec 31

  // ---------- render ----------
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">Welcome {userData?.first_name || 'Guest'}</h1>
      </div>

      <div className="w-full bg-[#FFFFFF] rounded-lg overflow-hidden -mt-8 md:-mt-6">
        <Link to="/dashboard/chat" className="block hover:opacity-95 transition-opacity">
          <img
            src="https://static.wixstatic.com/media/4e16d8_6fe30142759a478681d2122380bb22b6~mv2.png"
            alt="Meet Siena - Your AI Therapy Companion"
            className="w-full h-auto"
          />
        </Link>
      </div>

      {/* Six main sections */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link to="/dashboard/cards" className="block">
          <div className="bg-gradient-to-br from-[#0068aa] to-[#004d7f] p-4 rounded-2xl shadow-sm border border-[#0068aa]/20 hover:bg-[#0068aa]/90 transition-all h-full transform hover:scale-105">
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[100px]">
              <div className="flex-shrink-0">
                <img
                  src="https://static.wixstatic.com/media/4e16d8_81baaf44b0da4d838db1a6628fabc9f9~mv2.png"
                  alt="Card Deck"
                  className="h-6 w-6 object-contain mb-2"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <h2 className="text-base font-medium text-white">Explore Card Decks</h2>
            </div>
          </div>
        </Link>

        <Link to="/dashboard/affirmations" className="block">
          <div className="bg-gradient-to-br from-[#00789f] to-[#005a77] p-4 rounded-2xl shadow-sm border border-[#00789f]/20 hover:bg-[#00789f]/90 transition-all h-full transform hover:scale-105">
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[100px]">
              <Sparkles className="h-6 w-6 text-white mb-2" />
              <h2 className="text-base font-medium text-white">Daily Affirmations</h2>
            </div>
          </div>
        </Link>

        <Link to="/dashboard/meditations" className="block">
          <div className="bg-gradient-to-br from-[#008792] to-[#006a70] p-4 rounded-2xl shadow-sm border border-[#008792]/20 hover:bg-[#008792]/90 transition-all h-full transform hover:scale-105">
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[100px]">
              <Headphones className="h-6 w-6 text-white mb-2" />
              <div>
                <h2 className="text-base font-medium text-white">Guided Meditations</h2>
                {!hasAccess('meditations') && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white mt-1 inline-block">
                    Plus Plan
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>

        <Link to="/dashboard/exercises" className="block">
          <div className="bg-gradient-to-br from-[#7b5595] to-[#5d4070] p-4 rounded-2xl shadow-sm border border-[#7b5595]/20 hover:bg-[#7b5595]/90 transition-all h-full transform hover:scale-105">
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[100px]">
              <BookOpen className="h-6 w-6 text-white mb-2" />
              <h2 className="text-base font-medium text-white">Therapeutic Exercises</h2>
            </div>
          </div>
        </Link>


        <Link to="/dashboard/goals" className="block">
          <div className="bg-gradient-to-br from-[#B1E006] to-[#6C8300] p-4 rounded-2xl shadow-sm border border-[#01B1AF]/20 hover:bg-[#01B1AF]/90 transition-all h-full transform hover:scale-105">
            <div className="flex flex-col items-center justify-center text-center h-full min-h-[100px]">
              <Trophy className="h-6 w-6 text-white mb-2" />
              <div>
                <h2 className="text-base font-medium text-white">Goals</h2>
                {!hasAccess('goals') && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white mt-1 inline-block">
                    Plus Plan
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>


        <div className="bg-gradient-to-br from-[#ea697c] to-[#b8455c] p-4 rounded-2xl shadow-sm border border-[#ea697c]/20 hover:bg-[#ea697c]/90 transition-all h-full transform hover:scale-105">
          <div className="flex flex-col items-center justify-center text-center h-full min-h-[100px]">
            <div className="flex flex-col items-center">
              <Brain className="h-6 w-6 text-white mb-2" />
              <h2 className="text-base font-medium text-white mb-2">Ground Now</h2>
            </div>
            <div className="flex space-x-2">
              {isPlaying ? (
                <button
                  onClick={handleGroundNow}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  disabled={!audioLoaded}
                >
                  <Pause className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleGroundNow}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  disabled={!audioLoaded}
                >
                  <Play className="h-4 w-4" />
                </button>
              )}
              {isPlaying && (
                <button
                  onClick={handleStopAudio}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <Square className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mood selector + calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#021E3C] to-[#03274b] rounded-2xl p-6 h-[450px] flex flex-col">
          <h3 className="text-lg font-medium text-white mb-2">
            How are you feeling on {formatDate(selectedDate, 'MMMM d, yyyy')}?
          </h3>
          <p className="text-sm text-white/70 mb-4">Click a mood to select it, or click again to deselect</p>
          <div className="grid grid-cols-5 gap-2 flex-grow overflow-y-auto">
            {MOODS.map(({ value, icon: Icon, label, color }) => (
              <button
                key={value}
                onClick={() => handleMoodSelect(value)}
                className={`flex flex-col items-center p-2 rounded-md border transition-all text-[10px] ${
                  selectedMood === value ? 'border-[#01B1AF] bg-[#01B1AF]/10' : 'border-gray-700 hover:border-[#01B1AF]/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${color} mb-1`} />
                <span className="text-white text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="h-[450px] flex flex-col">
          <EnhancedCalendar
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            moodEntries={moodEntries}
            currentViewDate={currentViewDate}
            setCurrentViewDate={setCurrentViewDate}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-white" />
            <h3 className="text-lg font-medium text-white">This Week (Sun-Sat)</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-white">Positive</span><span className="text-white font-medium">{weekStats.positive}%</span></div>
            <div className="flex justify-between"><span className="text-white">Neutral</span><span className="text-white font-medium">{weekStats.neutral}%</span></div>
            <div className="flex justify-between"><span className="text-white">Negative</span><span className="text-white font-medium">{weekStats.negative}%</span></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#008792] to-[#006a70] rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="h-5 w-5 text-white" />
            <h3 className="text-lg font-medium text-white">Last 30 Days</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-white">Positive</span><span className="text-white font-medium">{monthStats.positive}%</span></div>
            <div className="flex justify-between"><span className="text-white">Neutral</span><span className="text-white font-medium">{monthStats.neutral}%</span></div>
            <div className="flex justify-between"><span className="text-white">Negative</span><span className="text-white font-medium">{monthStats.negative}%</span></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#00789f] to-[#005a77] rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-white" />
            <h3 className="text-lg font-medium text-white">This Year</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-white">Positive</span><span className="text-white font-medium">{yearStats.positive}%</span></div>
            <div className="flex justify-between"><span className="text-white">Neutral</span><span className="text-white font-medium">{yearStats.neutral}%</span></div>
            <div className="flex justify-between"><span className="text-white">Negative</span><span className="text-white font-medium">{yearStats.negative}%</span></div>
          </div>
        </div>
      </div>

      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-fade-in">
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#01B1AF] to-[#018a88] rounded-full mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Premium!</h2>
              <p className="text-gray-600">You now have access to all couples features</p>
            </div>

            <div className="bg-gradient-to-br from-[#01B1AF]/10 to-[#018a88]/10 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-[#01B1AF] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Invite Your Partner</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    To use couples features like Love Radar, Couples Meditations, and Intimacy Builders, invite your partner to join you.
                  </p>
                  <p className="text-sm text-gray-700 font-medium">
                    Go to Settings → Partner Connection to send an invitation
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => {
                  setShowWelcomeModal(false);
                  navigate('/settings');
                }}
                className="w-full bg-gradient-to-r from-[#01B1AF] to-[#018a88] text-white hover:shadow-lg transition-all"
              >
                Go to Settings
              </Button>
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
