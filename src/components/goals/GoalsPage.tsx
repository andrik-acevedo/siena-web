import { useState, useEffect, Fragment } from 'react';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';
import { useLocation } from 'react-router-dom';
import {
  Target, Calendar, CheckCircle2, XCircle, Clock, Loader2, ChevronDown, ChevronUp,
  Brain, Heart, Shield, Sparkles, HelpCircle, Ruler
} from 'lucide-react';
import { motion } from 'framer-motion';
import SmartPill from './SmartPill';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';

interface SmartGoal {
  id: string;
  title: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  time_bound: string;
  target_date: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
}

const PILL_GRADIENTS = [
  'from-[#0068aa] to-[#004d7f]',   // S
  'from-[#FFA600] to-[#B36B00]',   // M
  'from-[#B1E006] to-[#6C8300]',   // A
  'from-[#F27C7C] to-[#E03B3B]',   // R
  'from-[#7b5595] to-[#5d4070]',   // T (purple)
];
const ACCENTS = ['#0068aa', '#FFA600', '#B1E006', '#F27C7C', '#7b5595'];

const SmartGuide = () => (
  <div className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] rounded-lg p-4 md:p-6 space-y-4 text-white text-sm">
    <div className="flex items-center space-x-4 mb-4">
      <Target className="h-8 w-8 text-white" />
      <h2 className="text-xl font-semibold text-white">Understanding SMART Goals</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="space-y-4">
        <GuideRow icon={Brain} title="Specific" text="Clear and unambiguous. What exactly do you want to achieve?" />
        <GuideRow icon={Ruler} title="Measurable" text="Define concrete criteria for measuring progress and success." />
        <GuideRow icon={Shield} title="Achievable" text="Realistic and attainable with current resources and constraints." />
        <GuideRow icon={Heart} title="Relevant" text="Aligned with your values and long-term objectives." />
        <GuideRow icon={Clock} title="Time-bound" text="Set a clear deadline or timeframe for achievement." />
      </div>

      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Example SMART Goal</h3>
        <div className="space-y-4">
          <div>
            <div className="text-white font-medium mb-1">Instead of:</div>
            <div className="text-white/80">"I want to exercise more"</div>
          </div>
          <div>
            <div className="text-white font-medium mb-1">SMART Version:</div>
            <div className="text-white">
              "I will attend three 45-minute yoga classes per week at my local studio, starting next Monday,
              for the next 3 months to improve my flexibility and reduce stress."
            </div>
          </div>
          <div className="pt-4 border-t border-white/30 text-sm text-white/80 space-y-1">
            <div className="flex items-center space-x-2"><Sparkles className="h-4 w-4" /><span>Specific: 3×/week yoga</span></div>
            <div className="flex items-center space-x-2"><Ruler className="h-4 w-4" /><span>Measurable: class count</span></div>
            <div className="flex items-center space-x-2"><Shield className="h-4 w-4" /><span>Achievable: local studio</span></div>
            <div className="flex items-center space-x-2"><Heart className="h-4 w-4" /><span>Relevant: flexibility & stress</span></div>
            <div className="flex items-center space-x-2"><Clock className="h-4 w-4" /><span>Time-bound: starts Monday, 3 months</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function GuideRow({icon:Icon,title,text}:{icon:any;title:string;text:string}) {
  return (
    <div className="flex items-start space-x-3">
      <Icon className="h-6 w-6 text-white mt-1" />
      <div>
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <p className="text-white/80">{text}</p>
      </div>
    </div>
  );
}

type Key = 'specific' | 'measurable' | 'achievable' | 'relevant' | 'time_bound';
const META: Array<{key:Key; letter:string; title:string; helper:string; icon:any; sample?:string;}> = [
  { key:'specific',   letter:'S', title:'Specific',   helper:'What exactly will you accomplish?',        icon:Brain, sample:'e.g., “Publish 1 blog post per week.”' },
  { key:'measurable', letter:'M', title:'Measurable', helper:'How will you track progress/success?',     icon:Ruler, sample:'e.g., “Word count, publish dates.”' },
  { key:'achievable', letter:'A', title:'Achievable', helper:'Is this realistic? What resources?',       icon:Shield, sample:'e.g., “2 hrs every Tue/Thu.”' },
  { key:'relevant',   letter:'R', title:'Relevant',   helper:'Why does this matter to you now?',         icon:Heart,  sample:'e.g., “Grow audience, portfolio.”' },
  { key:'time_bound', letter:'T', title:'Time',       helper:'What’s the timeline or deadline?',         icon:Clock,  sample:'e.g., “For the next 12 weeks.”' },
];

export default function GoalsPage() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPlusOrPremium = hasAccess('goals');

  if (!isPlusOrPremium) {
    return (
      <FeatureAccessGuard featureId="goals" currentPlan={currentPlan}>
        <GoalsPageContent />
      </FeatureAccessGuard>
    );
  }

  return <GoalsPageContent />;
}

function GoalsPageContent() {
  const [goals, setGoals] = useState<SmartGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const { userData } = useUser();
  const location = useLocation();

  const blank = { title:'', specific:'', measurable:'', achievable:'', relevant:'', time_bound:'', target_date:'' };
  const [newGoal, setNewGoal] = useState({ ...blank });

  useEffect(() => { loadGoals(); }, [userData?.id]);
  useEffect(() => {
    if (location.state && (location.state as any).prefillGoal) {
      setNewGoal((location.state as any).prefillGoal);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  async function loadGoals() {
    try {
      const { data, error } = await supabase.from('smart_goals').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setGoals(data || []);
    } catch (e:any) { setError(e.message ?? 'Failed to load goals'); }
    finally { setIsLoading(false); }
  }

  async function handleSubmit(e:React.FormEvent) {
    e.preventDefault();
    const fields = ['title','specific','measurable','achievable','relevant','time_bound','target_date'] as const;
    for (const f of fields) {
      if (!newGoal[f].trim()) { setError(`Please fill in the ${f.replace('_',' ')} field`); return; }
    }
    try {
      const { error } = await supabase.from('smart_goals').insert([{ ...newGoal, user_id: userData?.id, status:'in_progress' }]);
      if (error) throw error;
      setNewGoal({ ...blank });
      loadGoals();
    } catch (e:any) { setError(e.message ?? 'Failed to save goal'); }
  }

  async function updateGoalStatus(id:string, status:'completed'|'abandoned') {
    try {
      const { error } = await supabase.from('smart_goals').update({ status }).eq('id', id);
      if (error) throw error;
      setGoals(g => g.map(x => x.id === id ? { ...x, status } : x));
    } catch (e:any) { setError(e.message ?? 'Failed to update goal status'); }
  }

  async function deleteGoal(id:string) {
    if (!confirm('Delete this goal?')) return;
    try {
      const { error } = await supabase.from('smart_goals').delete().eq('id', id);
      if (error) throw error;
      setGoals(g => g.filter(x => x.id !== id));
    } catch (e:any) { setError(e.message ?? 'Failed to delete goal'); }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 text-brand-green animate-spin" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">SMART Goals</h1>
              <p className="text-base text-white/80">Design your goal with a clear structure.</p>
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
          {showGuide && <SmartGuide />}
        </div>
      </div>

      {error && <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Goal Title</label>
            <input
              id="title"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder="What do you want to achieve?"
              className="mt-1 block w-full rounded-xl border-0 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#01B1AF] px-4 py-3 sm:text-sm"
            />
          </div>

          {/* Five centered, equal-height pills */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 items-stretch">
            {META.map((m, idx) => (
              <motion.div
                key={m.key}
                className="flex justify-center items-stretch"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <SmartPill
                  letter={m.letter}
                  title={m.title}
                  helper={m.helper}
                  sample={m.sample}
                  icon={m.icon}
                  gradientClass={PILL_GRADIENTS[idx]}
                  accentHex={ACCENTS[idx]}
                  value={(newGoal as any)[m.key]}
                  onChange={(v) => setNewGoal({ ...newGoal, [m.key]: v })}
                  onNext={() => {}}
                />
              </motion.div>
            ))}
          </div>

          {/* Target date + actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label htmlFor="target_date" className="block text-sm font-medium text-gray-700">
                Target Date
              </label>
              <input
                type="date"
                id="target_date"
                value={newGoal.target_date}
                onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                className="mt-1 block w-full rounded-xl border-0 bg-gray-50 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#01B1AF] px-4 py-3 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setNewGoal({ ...blank })}
              >
                Clear
              </Button>
              <Button type="submit" className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white">
                Create Goal
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-lg">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-white">Ready to set your first goal?</h3>
          <p className="mt-1 text-sm text-gray-300">Use the guide above to create a SMART goal.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-gray-100 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                  <div className="flex items-center space-x-3 mt-1 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(goal.target_date).toLocaleDateString()}
                    </div>
                    <div className={`text-sm ${
                      goal.status === 'completed' ? 'text-green-600'
                      : goal.status === 'abandoned' ? 'text-red-600'
                      : 'text-[#01B1AF]'}`}>
                      Status: {goal.status.replace('_',' ')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {expandedGoal === goal.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>

              {expandedGoal === goal.id && (
                <div className="mt-4 space-y-4 border-t border-gray-300 pt-4">
                  <Detail label="Specific"   value={goal.specific} />
                  <Detail label="Measurable" value={goal.measurable} />
                  <Detail label="Achievable" value={goal.achievable} />
                  <Detail label="Relevant"   value={goal.relevant} />
                  <Detail label="Time-bound" value={goal.time_bound} />

                  <div className="flex items-center justify-end space-x-3 pt-4">
                    {goal.status === 'in_progress' && (
                      <Fragment>
                        <Button
                          variant="outline"
                          onClick={() => updateGoalStatus(goal.id,'completed')}
                          className="text-green-600 border-green-600 hover:bg-green-600/10"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => updateGoalStatus(goal.id,'abandoned')}
                          className="text-red-600 border-red-600 hover:bg-red-600/10"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Abandon
                        </Button>
                      </Fragment>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-600 border-red-600 hover:bg-red-600/10"
                    >
                      Delete
                    </Button>
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

function Detail({label, value}:{label:string; value:string}) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700">{label}</h4>
      <p className="mt-1 text-gray-900">{value}</p>
    </div>
  );
}
