// src/components/sessions/SessionsPage.tsx
import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { supabase } from '../../lib/supabase';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Brain,
  Heart,
  MessageSquare,
  Sparkles,
  Clock,
  Sun,
  Coffee,
  ThumbsUp,
  Meh,
  HelpCircle,
  Bed,
  Search,
  AlertCircle,
  Frown,
  Angry,
  CloudRain,
  Star,
  CloudOff,
  HeartCrack,
  PartyPopper,
  BookOpen,
  CheckSquare,
  XSquare,
  Edit
} from 'lucide-react';
import Button from '../ui/Button';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

interface TherapySession {
  id: string;
  user_id: string;
  date: string;                 // yyyy-MM-dd
  time: string;                 // HH:mm
  duration_minutes?: number;
  type: string;
  therapist_name?: string;
  notes?: string;
  takeaways: string;
  goals?: string;
  next_session: string | null;       // yyyy-MM-dd
  next_session_time?: string | null; // HH:mm
  mood?: string;
  created_at: string;
  updated_at: string;
  sms_reminder?: boolean | null;
}

interface TherapeuticHomework {
  id: string;
  user_id: string;
  title: string;
  description: string;
  assigned_date: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
  created_at: string;
  updated_at: string;
}

const MOODS = [
  { value: 'adored', label: 'Adored', color: 'text-red-400', icon: Heart },
  { value: 'angry', label: 'Angry', color: 'text-red-600', icon: Angry },
  { value: 'anxious', label: 'Anxious', color: 'text-gray-500', icon: CloudRain },
  { value: 'blah', label: 'Blah', color: 'text-gray-400', icon: Meh },
  { value: 'blessed', label: 'Blessed', color: 'text-yellow-600', icon: Sun },
  { value: 'celebratory', label: 'Celebratory', color: 'text-purple-500', icon: PartyPopper },
  { value: 'confident', label: 'Confident', color: 'text-yellow-600', icon: Star },
  { value: 'curious', label: 'Curious', color: 'text-blue-400', icon: Search },
  { value: 'depressed', label: 'Depressed', color: 'text-blue-700', icon: CloudOff },
  { value: 'disappointed', label: 'Disappointed', color: 'text-orange-700', icon: Frown },
  { value: 'excited', label: 'Excited', color: 'text-pink-500', icon: PartyPopper },
  { value: 'flirty', label: 'Flirty', color: 'text-pink-400', icon: Heart },
  { value: 'frustrated', label: 'Frustrated', color: 'text-orange-600', icon: AlertCircle },
  { value: 'happy', label: 'Happy', color: 'text-yellow-500', icon: Sun },
  { value: 'insecure', label: 'Insecure', color: 'text-gray-600', icon: Frown },
  { value: 'loved', label: 'Loved', color: 'text-red-500', icon: Heart },
  { value: 'neutral', label: 'Neutral', color: 'text-gray-500', icon: Meh },
  { value: 'playful', label: 'Playful', color: 'text-purple-400', icon: PartyPopper },
  { value: 'relaxed', label: 'Relaxed', color: 'text-green-500', icon: Coffee },
  { value: 'sad', label: 'Sad', color: 'text-blue-600', icon: HeartCrack },
  { value: 'skeptical', label: 'Skeptical', color: 'text-orange-500', icon: HelpCircle },
  { value: 'thinking', label: 'Thinking', color: 'text-indigo-500', icon: Brain },
  { value: 'tired', label: 'Tired', color: 'text-gray-600', icon: Bed },
  { value: 'trusting', label: 'Trusting', color: 'text-blue-500', icon: ThumbsUp }
].sort((a, b) => a.label.localeCompare(b.label));

const SESSION_TYPES = [
  { value: 'in-person', label: 'In-Person' },
  { value: 'video', label: 'Video Call' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'group', label: 'Group Session' },
  { value: 'other', label: 'Other' }
];

/** Convert common US phone formats to E.164, or return null if invalid. */
function normalizeE164(p?: string | null): string | null {
  if (!p) return null;
  const digits = p.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (p.startsWith('+')) return p;
  return null;
}

const SessionGuide = () => (
  <div className="bg-gradient-to-br from-[#008792] to-[#006a70] rounded-lg p-4 md:p-6 space-y-4 text-white text-sm">
    <div className="flex items-center space-x-4 mb-4">
      <CalendarIcon className="h-8 w-8 text-white" />
      <h2 className="text-xl font-semibold text-white">Understanding Therapy Sessions</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Brain className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Reflection</h3>
            <p className="text-white/80">Take time to process insights and breakthroughs from your session.</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Heart className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Emotional Awareness</h3>
            <p className="text-white/80">Notice how you felt during and after your session.</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <MessageSquare className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Key Takeaways</h3>
            <p className="text-white/80">Document important insights and action steps from your session.</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Sparkles className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Growth Tracking</h3>
            <p className="text-white/80">Monitor your progress and therapeutic journey over time.</p>
          </div>
        </div>
      </div>

      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Session Reflection Tips</h3>
        <div className="space-y-4">
          <div>
            <div className="text-white font-medium mb-1">Before Your Session</div>
            <ul className="text-white/80 space-y-2">
              <li>• Note topics you want to discuss</li>
              <li>• Review previous session notes</li>
              <li>• Set an intention for the session</li>
            </ul>
          </div>
          <div>
            <div className="text-white font-medium mb-1">After Your Session</div>
            <ul className="text-white/80 space-y-2">
              <li>• Write down key insights</li>
              <li>• Note any homework assignments</li>
              <li>• Schedule your next appointment</li>
            </ul>
          </div>
          <div>
            <div className="text-white font-medium mb-1">Between Sessions</div>
            <ul className="text-white/80 space-y-2">
              <li>• Practice new skills or insights</li>
              <li>• Journal about your progress</li>
              <li>• Notice patterns in thoughts/feelings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function SessionsPage() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPlusOrPremium = hasAccess('therapy-sessions');

  if (!isPlusOrPremium) {
    return (
      <FeatureAccessGuard featureId="therapy-sessions" currentPlan={currentPlan}>
        <SessionsPageContent />
      </FeatureAccessGuard>
    );
  }

  return <SessionsPageContent />;
}

function SessionsPageContent() {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [homework, setHomework] = useState<TherapeuticHomework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(true);
  const [isCreatingHomework, setIsCreatingHomework] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [expandedHomework, setExpandedHomework] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'homework'>('sessions');
  const [editingHomework, setEditingHomework] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const { userData } = useUser();

  const [newSession, setNewSession] = useState<Partial<TherapySession>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    type: 'in-person',
    takeaways: '',
    mood: '',
    next_session: '',
    next_session_time: '09:00',
    sms_reminder: true
  });

  const [newHomework, setNewHomework] = useState<Partial<TherapeuticHomework>>({
    title: '',
    description: '',
    assigned_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    loadSessions();
    loadHomework();
  }, [userData?.id]);

  const loadSessions = async () => {
    if (!userData?.id) return;
    try {
      const { data, error } = await supabase
        .from('therapy_sessions')
        .select('*')
        .eq('user_id', userData.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHomework = async () => {
    if (!userData?.id) return;
    try {
      const { data, error } = await supabase
        .from('therapeutic_homework')
        .select('*')
        .eq('user_id', userData.id)
        .order('due_date', { ascending: true });

      if (error) throw error;

      const updatedHomework = (data || []).map(item => {
        const dueDate = new Date(item.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (item.status === 'pending' && dueDate < today) {
          return { ...item, status: 'overdue' };
        }
        return item;
      });

      setHomework(updatedHomework);
    } catch (err) {
      console.error('Error loading homework:', err);
      setError('Failed to load homework');
    }
  };

  // ---------------------- SMS helpers ----------------------

  const sendAppointmentSMSNow = async (session: TherapySession) => {
    try {
      const to = normalizeE164(userData?.phone);
      if (!to) throw new Error(`Invalid phone number on file: ${userData?.phone ?? '(none)'}`);

      const apptDate = session.next_session || session.date;
      const apptTime = session.next_session_time || session.time || '09:00';
      const appt = new Date(`${apptDate}T${apptTime}`);

      const message =
        `🩺 Appointment saved! Next session: ${format(appt, 'MMM d, yyyy')} at ${format(appt, 'h:mm a')}. ` +
        `Reply STOP to opt out.`;

      const scheduledTime = new Date(Date.now() + 60 * 1000).toISOString();

      console.log('[sendAppointmentSMSNow] invoking schedule-sms-reminder', { to, scheduledTime });
      const { data, error } = await supabase.functions.invoke('schedule-sms-reminder', {
        body: { phoneNumber: to, message, scheduledTime, sessionId: session.id }
      });

      if (error) throw new Error(error.message || 'schedule-sms-reminder failed');
      if (!data?.success) throw new Error(data?.error || 'Twilio send failed');

      console.log('[sendAppointmentSMSNow] result:', data);
      toast.success('Text confirmation sent ✅');
    } catch (e: any) {
      console.error('SMS send failed:', e);
      toast.error(`SMS failed: ${e.message ?? e}`);
    }
  };

  const scheduleTwoHourReminder = async (session: TherapySession) => {
    try {
      if (!session.sms_reminder) {
        console.log('[scheduleTwoHourReminder] sms_reminder disabled');
        return;
      }
      if (!session.next_session || !session.next_session_time) {
        console.log('[scheduleTwoHourReminder] missing next_session/next_session_time');
        return;
      }

      const to = normalizeE164(userData?.phone);
      if (!to) throw new Error(`Invalid phone number on file: ${userData?.phone ?? '(none)'}`);

      const apptAt = new Date(`${session.next_session}T${session.next_session_time}`);
      if (isNaN(apptAt.getTime())) throw new Error('Invalid next session date/time');

      const desired = new Date(apptAt.getTime() - 2 * 60 * 60 * 1000);
      const nowPlus5m = new Date(Date.now() + 5 * 60 * 1000);

      if (desired <= nowPlus5m) {
        console.log('[scheduleTwoHourReminder] target too soon or past; skipping insert', { desired });
        toast('Skipped 2-hour schedule (appointment too soon)');
        return;
      }

      const message =
        `🩺 Siena Reminder: You have an upcoming wellness session: ${format(apptAt, 'MMM d, yyyy')} at ${format(apptAt, 'h:mm a')} (in ~2 hours).`;

      console.log('[scheduleTwoHourReminder] invoking schedule-sms-reminder', {
        to, scheduledTime: desired.toISOString(), sessionId: session.id
      });
      const { data, error } = await supabase.functions.invoke('schedule-sms-reminder', {
        body: {
          phoneNumber: to,
          message,
          scheduledTime: desired.toISOString(),
          sessionId: session.id
        }
      });

      if (error) throw new Error(error.message || 'Failed to schedule reminder');
      if (!data?.success) throw new Error(data?.error || 'Failed to schedule reminder');

      console.log('[scheduleTwoHourReminder] result:', data);
      toast.success(`2-hour reminder scheduled for ${format(desired, 'MMM d, yyyy h:mm a')}`);
    } catch (e: any) {
      console.error('Schedule 2h reminder failed:', e);
      toast.error(`Failed to schedule 2-hour reminder: ${e.message ?? e}`);
    }
  };

  // ---------------------- Handlers ----------------------

  const handleSubmitSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.id) return;

    try {
      setError(null);

      if (!newSession.date) return setError('Please select a date');
      if (!newSession.time) return setError('Please select a time');
      if (!newSession.type) return setError('Please select a session type');
      if (!newSession.takeaways || newSession.takeaways.trim() === '')
        return setError('Please enter session takeaways');

      const sessionToSave = { ...newSession, user_id: userData.id };

      const { data, error } = await supabase
        .from('therapy_sessions')
        .insert([sessionToSave])
        .select();

      if (error) throw error;

      toast.success('Session saved successfully');
      setIsCreating(false);
      setNewSession({
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        type: 'in-person',
        takeaways: '',
        mood: '',
        next_session: '',
        next_session_time: '09:00',
        sms_reminder: true
      });

      if (data && data.length > 0) {
        const saved = data[0] as TherapySession;
        setSessions([saved, ...sessions]);

        if (saved.sms_reminder && userData?.phone) {
          await sendAppointmentSMSNow(saved);
        }

        if (saved.next_session && saved.next_session_time) {
          await scheduleTwoHourReminder(saved);
        }
      } else {
        loadSessions();
      }
    } catch (err: any) {
      console.error('Error saving session:', err);
      setError(err.message || 'Failed to save session');
      toast.error('Failed to save session');
    }
  };

  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.id) return;

    try {
      setError(null);

      if (!newHomework.title || newHomework.title.trim() === '') return setError('Please enter a title');
      if (!newHomework.description || newHomework.description.trim() === '') return setError('Please enter a description');
      if (!newHomework.assigned_date) return setError('Please select an assigned date');
      if (!newHomework.due_date) return setError('Please select a due date');

      const homeworkToSave = { ...newHomework, user_id: userData.id };

      if (editingHomework) {
        const { data, error } = await supabase
          .from('therapeutic_homework')
          .update(homeworkToSave)
          .eq('id', editingHomework)
          .select();

        if (error) throw error;
        toast.success('Homework updated successfully');
        if (data && data.length > 0) {
          setHomework(homework.map(item => item.id === editingHomework ? data[0] : item));
        } else {
          loadHomework();
        }
      } else {
        const { data, error } = await supabase
          .from('therapeutic_homework')
          .insert([homeworkToSave])
          .select();

        if (error) throw error;
        toast.success('Homework added successfully');
        if (data && data.length > 0) {
          setHomework([...homework, data[0]]);
        } else {
          loadHomework();
        }
      }

      setIsCreatingHomework(false);
      setEditingHomework(null);
      setNewHomework({
        title: '',
        description: '',
        assigned_date: format(new Date(), 'yyyy-MM-dd'),
        due_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        status: 'pending',
        notes: ''
      });
    } catch (err: any) {
      console.error('Error saving homework:', err);
      setError(err.message || 'Failed to save homework');
      toast.error('Failed to save homework');
    }
  };

  const deleteSession = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      const { error } = await supabase
        .from('therapy_sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', userData?.id);
      if (error) throw error;
      setSessions(sessions.filter(s => s.id !== id));
      toast.success('Session deleted');
    } catch (err: any) {
      console.error('Error deleting session:', err);
      setError(err.message || 'Failed to delete session');
      toast.error('Failed to delete session');
    }
  };

  const updateHomeworkStatus = async (id: string, status: 'pending' | 'completed' | 'overdue') => {
    try {
      const { error } = await supabase
        .from('therapeutic_homework')
        .update({ status })
        .eq('id', id)
        .eq('user_id', userData?.id);
      if (error) throw error;
      setHomework(homework.map(h => h.id === id ? { ...h, status } : h));
      toast.success(`Homework marked as ${status}`);
    } catch (err: any) {
      console.error('Error updating homework status:', err);
      setError(err.message || 'Failed to update homework status');
      toast.error('Failed to update status');
    }
  };

  const editHomework = (homework: TherapeuticHomework) => {
    setNewHomework({
      title: homework.title,
      description: homework.description,
      assigned_date: homework.assigned_date,
      due_date: homework.due_date,
      status: homework.status,
      notes: homework.notes || ''
    });
    setEditingHomework(homework.id);
    setIsCreatingHomework(true);
    setActiveTab('homework');
  };

  const deleteHomework = async (id: string) => {
    if (!confirm('Are you sure you want to delete this homework?')) return;
    try {
      const { error } = await supabase
        .from('therapeutic_homework')
        .delete()
        .eq('id', id)
        .eq('user_id', userData?.id);
      if (error) throw error;
      setHomework(homework.filter(h => h.id !== id));
      toast.success('Homework deleted');
    } catch (err: any) {
      console.error('Error deleting homework:', err);
      setError(err.message || 'Failed to delete homework');
      toast.error('Failed to delete homework');
    }
  };

  // ---------------------- UI ----------------------

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
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-white mb-2">Wellness Sessions</h1>
            <p className="text-base text-white/80 mb-3">Track your wellness journey and progress</p>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 bg-white/10 border border-white/20 rounded-lg p-3">
                <p className="text-white/90 text-sm">
                  <strong>Note:</strong> This feature is for personal wellness feedback or tracking only and is not intended for storing medical records.
                </p>
              </div>
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 transition-colors whitespace-nowrap"
              >
                <HelpCircle className="h-4 w-4 text-white" />
                <span className="text-white text-sm font-medium">Tips</span>
                {showGuide ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
              </button>
            </div>
          </div>
          {showGuide && (
            <div className="mt-6">
              <div className="bg-white/10 rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Brain className="h-6 w-6 text-white mt-1" />
                      <div>
                        <h3 className="text-lg font-medium text-white">Reflection</h3>
                        <p className="text-white/80">Take time to process insights and breakthroughs from your session.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Heart className="h-6 w-6 text-white mt-1" />
                      <div>
                        <h3 className="text-lg font-medium text-white">Emotional Awareness</h3>
                        <p className="text-white/80">Notice how you felt during and after your session.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="h-6 w-6 text-white mt-1" />
                      <div>
                        <h3 className="text-lg font-medium text-white">Key Takeaways</h3>
                        <p className="text-white/80">Document important insights and action steps from your session.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Sparkles className="h-6 w-6 text-white mt-1" />
                      <div>
                        <h3 className="text-lg font-medium text-white">Growth Tracking</h3>
                        <p className="text-white/80">Monitor your progress and therapeutic journey over time.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Session Reflection Tips</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-white font-medium mb-1">Before Your Session</div>
                        <ul className="text-white/80 space-y-2 text-sm">
                          <li>• Note topics you want to discuss</li>
                          <li>• Review previous session notes</li>
                          <li>• Set an intention for the session</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-white font-medium mb-1">After Your Session</div>
                        <ul className="text-white/80 space-y-2 text-sm">
                          <li>• Write down key insights</li>
                          <li>• Note any homework assignments</li>
                          <li>• Schedule your next appointment</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-white font-medium mb-1">Between Sessions</div>
                        <ul className="text-white/80 space-y-2 text-sm">
                          <li>• Practice new skills or insights</li>
                          <li>• Journal about your progress</li>
                          <li>• Notice patterns in thoughts/feelings</li>
                        </ul>
                      </div>
                    </div>
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
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'sessions' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setActiveTab('sessions')}
        >
          Sessions
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'homework' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setActiveTab('homework')}
        >
          Wellness Homework
        </button>
      </div>

      {activeTab === 'sessions' ? (
        <>
          {isCreating && (
            <div className="bg-[#01B1AF] rounded-lg p-6">
              <form onSubmit={handleSubmitSession} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white">Date</label>
                    <input
                      type="date"
                      value={newSession.date}
                      onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white">Time</label>
                    <input
                      type="time"
                      value={newSession.time}
                      onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                      className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white">Session Type</label>
                    <select
                      value={newSession.type}
                      onChange={(e) => setNewSession({ ...newSession, type: e.target.value })}
                      className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                      required
                    >
                      {SESSION_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white">Next Session Date (Optional)</label>
                    <input
                      type="date"
                      value={newSession.next_session || ''}
                      onChange={(e) => setNewSession({ ...newSession, next_session: e.target.value })}
                      className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white">Provider's Name (Optional)</label>
                    <input
                      type="text"
                      value={newSession.therapist_name || ''}
                      onChange={(e) => setNewSession({ ...newSession, therapist_name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white">Next Session Time (Optional)</label>
                    <input
                      type="time"
                      value={newSession.next_session_time || ''}
                      onChange={(e) => setNewSession({ ...newSession, next_session_time: e.target.value })}
                      className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                    />
                    <div>
                      <label className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          checked={newSession.sms_reminder ?? true}
                          onChange={(e) =>
                            setNewSession((prev) => ({ ...prev, sms_reminder: e.target.checked }))
                          }
                          className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                        />
                        <span className="text-sm text-white">
                          Text me a confirmation now and a reminder <strong>2 hours before</strong> my next appointment
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white">Key Takeaways</label>
                  <textarea
                    value={newSession.takeaways || ''}
                    onChange={(e) => setNewSession({ ...newSession, takeaways: e.target.value })}
                    rows={5}
                    className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                    placeholder="What were your main insights or learnings?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Mood</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {MOODS.map(({ value, label, color, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setNewSession({ ...newSession, mood: value })}
                        className={`flex items-center justify-center px-3 py-2 rounded-lg border text-sm shadow-sm transition-all
                          ${newSession.mood === value ? 'bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white border-brand-green' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}`}
                      >
                        <Icon className={`h-4 w-4 mr-2 ${newSession.mood === value ? 'text-white' : color}`} />
                        <span className={newSession.mood === value ? 'text-white' : 'text-gray-700'}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {newSession.next_session && newSession.next_session_time && userData?.phone && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSession.sms_reminder || false}
                        onChange={(e) => setNewSession({ ...newSession, sms_reminder: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                      />
                      <span className="text-sm text-white">
                        Send SMS reminder <strong>2 hours before</strong> to {userData.phone}
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" className="bg-white text-[#01B1AF] hover:bg-gray-100">
                    Save Session
                  </Button>
                </div>
              </form>
            </div>
          )}

          {sessions.length === 0 ? (
            <div className="text-center py-12 bg-gray-100 rounded-lg">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-500" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No sessions logged yet</h3>
              <p className="mt-1 text-sm text-gray-600">Start tracking your wellness journey by logging your first session.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const MoodIcon = session.mood ? MOODS.find(m => m.value === session.mood)?.icon : null;
                return (
                  <div key={session.id} className="bg-gray-100 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{format(parseISO(session.date), 'MMMM d, yyyy')}</h3>
                          <span className="ml-3 text-gray-600">at {session.time}</span>
                          <div className="text-sm text-brand-green ml-4">
                            {SESSION_TYPES.find(t => t.value === session.type)?.label || session.type}
                          </div>
                        </div>

                        {session.next_session && (
                          <div className="mt-2 flex items-center text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Next session: {format(parseISO(session.next_session), 'MMMM d, yyyy')}
                            {session.next_session_time && <span className="ml-1">at {session.next_session_time}</span>}
                            {session.sms_reminder && (
                              <span className="ml-2 text-xs bg-brand-green/20 text-brand-green px-2 py-1 rounded-full">
                                SMS Reminder Set
                              </span>
                            )}
                          </div>
                        )}

                        {session.mood && MoodIcon && (
                          <div className="mt-2 flex items-center text-sm">
                            <MoodIcon className={`h-4 w-4 mr-1 ${MOODS.find(m => m.value === session.mood)?.color || 'text-gray-400'}`} />
                            <span className="text-gray-700">
                              Mood: {MOODS.find(m => m.value === session.mood)?.label || session.mood}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => deleteSession(session.id)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                          className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          {expandedSession === session.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {expandedSession === session.id && (
                      <div className="mt-4 space-y-4 border-t border-gray-300 pt-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Key Takeaways</h4>
                          <p className="mt-1 text-gray-900 whitespace-pre-wrap">{session.takeaways}</p>
                        </div>
                        {session.therapist_name && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Provider</h4>
                            <p className="mt-1 text-gray-900">{session.therapist_name}</p>
                          </div>
                        )}
                        {session.notes && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                            <p className="mt-1 text-gray-900 whitespace-pre-wrap">{session.notes}</p>
                          </div>
                        )}
                        <div className="pt-4">
                          <Button
                            onClick={() => {
                              setNewHomework({
                                title: '',
                                description: '',
                                assigned_date: session.date,
                                due_date: session.next_session || format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
                                status: 'pending',
                                notes: ''
                              });
                              setIsCreatingHomework(true);
                              setActiveTab('homework');
                            }}
                            variant="outline"
                            className="text-brand-green border-brand-green hover:bg-brand-green/10"
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            Add Homework from this Session
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-center mt-6">
            <Button onClick={() => setIsCreatingHomework(true)} className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white">
              <Plus className="h-5 w-5 mr-2" />
              Add New Homework
            </Button>
          </div>

          {isCreatingHomework && (
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {editingHomework ? 'Edit Homework' : 'Add New Homework'}
              </h3>

              <form onSubmit={handleSubmitHomework} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newHomework.title}
                    onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                    placeholder="e.g., Practice mindfulness meditation"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={newHomework.description}
                    onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                    placeholder="Detailed instructions for the homework assignment"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assigned Date</label>
                    <input
                      type="date"
                      value={newHomework.assigned_date}
                      onChange={(e) => setNewHomework({ ...newHomework, assigned_date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input
                      type="date"
                      value={newHomework.due_date}
                      onChange={(e) => setNewHomework({ ...newHomework, due_date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={newHomework.status}
                    onChange={(e) => setNewHomework({ ...newHomework, status: e.target.value as 'pending' | 'completed' | 'overdue' })}
                    className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                  <textarea
                    value={newHomework.notes || ''}
                    onChange={(e) => setNewHomework({ ...newHomework, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-green px-4 py-3 sm:text-sm"
                    placeholder="Additional notes or reflections"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreatingHomework(false);
                      setEditingHomework(null);
                      setNewHomework({
                        title: '',
                        description: '',
                        assigned_date: format(new Date(), 'yyyy-MM-dd'),
                        due_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
                        status: 'pending',
                        notes: ''
                      });
                    }}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white">
                    {editingHomework ? 'Update Homework' : 'Save Homework'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {homework.length === 0 && !isCreatingHomework ? (
            <div className="text-center py-12 bg-gray-100 rounded-lg">
              <BookOpen className="mx-auto h-12 w-12 text-gray-500" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No homework assignments yet</h3>
              <p className="mt-1 text-sm text-gray-600">Add your first wellness homework assignment to track your progress.</p>
            </div>
          ) : homework.length > 0 && !isCreatingHomework ? (
            <div className="space-y-4">
              {/* Homework filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className={`text-sm ${homework.some(h => h.status === 'pending') ? 'border-yellow-500 text-yellow-500' : 'border-gray-600 text-gray-400'}`}
                  onClick={() => {
                    const pendingItems = homework.filter(h => h.status === 'pending');
                    if (pendingItems.length > 0) {
                      setHomework([...pendingItems, ...homework.filter(h => h.status !== 'pending')]);
                    }
                  }}
                >
                  Pending First
                </Button>
                <Button
                  variant="outline"
                  className={`text-sm ${homework.some(h => h.status === 'overdue') ? 'border-red-500 text-red-500' : 'border-gray-600 text-gray-400'}`}
                  onClick={() => {
                    const overdueItems = homework.filter(h => h.status === 'overdue');
                    if (overdueItems.length > 0) {
                      setHomework([...overdueItems, ...homework.filter(h => h.status !== 'overdue')]);
                    }
                  }}
                >
                  Overdue First
                </Button>
                <Button
                  variant="outline"
                  className="text-sm border-gray-600 text-gray-400"
                  onClick={() => {
                    setHomework([...homework].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()));
                  }}
                >
                  Due Date (Earliest)
                </Button>
              </div>

              {/* Homework list */}
              {homework.map((item) => {
                const isPending = item.status === 'pending';
                const isCompleted = item.status === 'completed';
                const isOverdue = item.status === 'overdue';

                const statusColor = isPending
                  ? 'text-yellow-500 bg-yellow-500/10'
                  : isCompleted
                    ? 'text-green-500 bg-green-500/10'
                    : 'text-red-500 bg-red-500/10';

                const StatusIcon = isPending ? Clock : isCompleted ? CheckSquare : XSquare;

                return (
                  <div
                    key={item.id}
                    className={`bg-gray-100 rounded-lg p-6 ${
                      isOverdue ? 'border-l-4 border-red-500' :
                      isPending ? 'border-l-4 border-yellow-500' :
                      'border-l-4 border-green-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                          <div className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            <div className="flex items-center">
                              <StatusIcon className="h-3 w-3 mr-1" />
                              <span>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Assigned: {format(new Date(item.assigned_date), 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Due: {format(new Date(item.due_date), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => editHomework(item)}
                          className="text-gray-500 hover:text-brand-green transition-colors"
                          title="Edit homework"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteHomework(item.id)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                          title="Delete homework"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setExpandedHomework(expandedHomework === item.id ? null : item.id)}
                          className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          {expandedHomework === item.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {expandedHomework === item.id && (
                      <div className="mt-4 space-y-4 border-t border-gray-300 pt-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Description</h4>
                          <p className="mt-1 text-gray-900 whitespace-pre-wrap">{item.description}</p>
                        </div>
                        {item.notes && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                            <p className="mt-1 text-gray-900 whitespace-pre-wrap">{item.notes}</p>
                          </div>
                        )}
                        <div className="pt-4 flex flex-wrap gap-2">
                          {!isCompleted && (
                            <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={() => updateHomeworkStatus(item.id, 'completed')}>
                              <CheckSquare className="h-4 w-4 mr-2" />
                              Mark as Completed
                            </Button>
                          )}
                          {isCompleted && (
                            <Button
                              variant="outline"
                              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                              onClick={() => updateHomeworkStatus(item.id, 'pending')}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Mark as Pending
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}