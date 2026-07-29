// src/components/quizzes/QuizList.tsx
import { useState, useEffect } from 'react';
import {
  Heart,
  Users,
  Brain,
  Target,
  Mic,
  Star,
  AlertCircle,
  Smile,
  Eye,
  Shield,
  CalendarHeart,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import TileCard, { GRADIENT_COLORS } from '../ui/TileCard';
import { useUser } from '../../context/UserContext';
import { getQuizResults, formatTypeLabel as formatQuizTypeLabel } from '../../utils/quizUtils';
import { ALL_QUIZZES } from '../../data/quizData';

const quizzes = [
  { id: 'love', title: 'Love Language Quiz', description: 'Discover how you most naturally give and receive love.', icon: <Heart className="h-6 w-6 text-white" /> },
  { id: 'attachment', title: 'Attachment Style Quiz', description: 'Explore how your attachment style shapes emotional connection.', icon: <Users className="h-6 w-6 text-white" /> },
  { id: 'conflict', title: 'Conflict Style Quiz', description: 'Understand your default way of handling conflict.', icon: <Brain className="h-6 w-6 text-white" /> },
  { id: 'values', title: 'Values Clarification Quiz', description: 'Uncover your core life values and guiding principles.', icon: <Target className="h-6 w-6 text-white" /> },
  { id: 'communication', title: 'Communication Style Quiz', description: 'Find out how you express yourself and handle conversations.', icon: <Mic className="h-6 w-6 text-white" /> },
  { id: 'selfEsteem', title: 'Self-Esteem Quiz', description: 'Gauge the stability and strength of your self-esteem.', icon: <Star className="h-6 w-6 text-white" /> },
  { id: 'emotionalIntelligence', title: 'Emotional Intelligence Quiz', description: 'Measure your emotional insight and interpersonal awareness.', icon: <Smile className="h-6 w-6 text-white" /> },
  { id: 'redFlags', title: 'Red Flag Awareness Quiz', description: 'Learn how well you detect warning signs in relationships.', icon: <AlertCircle className="h-6 w-6 text-white" /> },
  { id: 'emotionalRegulation', title: 'Emotional Regulation Quiz', description: 'Identify your strategies for handling emotional distress.', icon: <Eye className="h-6 w-6 text-white" /> },
  { id: 'boundary', title: 'Boundary Style Quiz', description: 'Discover if your boundaries are rigid, porous, or healthy.', icon: <Shield className="h-6 w-6 text-white" /> },
  { id: 'bigFive', title: 'Big Five Personality Quiz', description: 'Gain insight into your personality traits using the Five Factor Model.', icon: <Brain className="h-6 w-6 text-white" /> },
  { id: 'relationshipReadiness', title: 'Relationship Readiness Quiz', description: 'Assess how emotionally prepared you are for a relationship.', icon: <CalendarHeart className="h-6 w-6 text-white" /> },
];

function QuizGuide() {
  return (
    <div className="mt-6 bg-gradient-to-br from-[#01B1AF] to-[#018a88] rounded-lg p-4 md:p-6 space-y-4 text-white text-sm">
      <div className="flex items-center space-x-4 mb-2 md:mb-4">
        <HelpCircle className="h-8 w-8 text-white" />
        <h2 className="text-xl font-semibold text-white">Tips for Using Quizzes</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Left: principles */}
        <div className="space-y-5">
          <div className="flex items-start space-x-3">
            <Brain className="h-6 w-6 text-white mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white">Treat results as signals, not labels</h3>
              <p className="text-white/80">
                Scores offer starting points for reflection. Use them to get curious, not to box yourself in.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Target className="h-6 w-6 text-white mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white">Make it actionable</h3>
              <p className="text-white/80">
                After each quiz, set one small, concrete practice for the week (e.g., a boundary phrase, a
                2-minute breathing routine).
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Sparkles className="h-6 w-6 text-white mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white">Retake over time</h3>
              <p className="text-white/80">
                Revisit a quiz after a month of practice to notice growth trends—not perfection.
              </p>
            </div>
          </div>
        </div>

        {/* Right: quick actions */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <div>
              <div className="text-white font-medium mb-1">Pick a focus</div>
              <ul className="text-white/80 space-y-2">
                <li>• Start with what matters now (conflict, self-esteem, values).</li>
                <li>• Save results you want to discuss in therapy or journaling.</li>
              </ul>
            </div>
            <div>
              <div className="text-white font-medium mb-1">Bridge to practice</div>
              <ul className="text-white/80 space-y-2">
                <li>• Ask Siena for a 3-step practice based on your result.</li>
                <li>• Add one action to your Goals or Habits pages.</li>
              </ul>
            </div>
            <div>
              <div className="text-white font-medium mb-1">Share wisely</div>
              <ul className="text-white/80 space-y-2">
                <li>• Share highlights with trusted people only—you control the story.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizList() {
  const [searchQuery] = useState(''); // kept for future use; UI removed
  const [quizResults, setQuizResults] = useState<Record<string, string>>({});
  const [showGuide, setShowGuide] = useState(false);
  const { userData } = useUser();

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!userData?.id) return;
    (async () => {
      try {
        const rows = await getQuizResults(userData.id); // sorted by completed_at desc
        const latest = new Map<string, any>();
        for (const row of rows) {
          if (!latest.has(row.quiz_id)) latest.set(row.quiz_id, row);
        }

        const results: Record<string, string> = {};
        for (const [slug, row] of latest.entries()) {
          const dominantSlug = deriveDominantSlugFromAnswers(row.answers, slug);
          if (dominantSlug) results[slug] = prettyLabel(dominantSlug);
        }
        setQuizResults(results);
      } catch (e) {
        console.error('❌ Error loading quiz results:', e);
      }
    })();
  }, [userData?.id]);

  // Make hyphen/underscore slugs look nice (quality-time → Quality Time)
  const prettyLabel = (slug: string) => formatQuizTypeLabel(slug.replace(/[-_]/g, ' '));

  // Pull the dominant result slug out of whatever answer shape we have
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
    if (!Array.isArray(answers) && typeof answers === 'object' && 'result' in answers) {
      return (answers as any).result as string;
    }

    // Fallbacks if only raw items/array exist
    const items = Array.isArray(answers?.items) ? answers.items : Array.isArray(answers) ? answers : null;
    if (!items) return null;

    if (slug === 'bigFive') {
      // Compute dominant Big Five trait from items that include { type, selectedAnswer }
      const totals: Record<string, number> = {};
      for (const it of items as any[]) {
        const t = it?.type as string | undefined;
        if (!t) continue;
        const [trait, maybeReverse] = String(t).split(':');
        const raw = Number(it?.selectedAnswer);
        if (!Number.isFinite(raw)) continue;
        const v = Math.max(1, Math.min(6, raw));
        const score = maybeReverse === 'reverse' ? 7 - v : v;
        totals[trait] = (totals[trait] || 0) + score;
      }
      const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
      return top?.[0] ?? null;
    } else {
      // Typology quizzes: majority vote by type
      const counts: Record<string, number> = {};
      for (const it of items as any[]) {
        const t = it?.type as string | undefined;
        if (!t) continue;
        counts[t] = (counts[t] || 0) + 1;
      }
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
      return top?.[0] ?? null;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header with Tips toggle */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
        <div className="relative z-10 flex items-start md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Assessments & Quizzes</h1>
            <p className="text-lg text-white/80">Explore and understand yourself better</p>
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

        {showGuide && <QuizGuide />}
      </div>

      {/* Search removed for now */}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz, index) => (
          <div key={quiz.id} className="relative group">
            <TileCard
              title={quiz.title}
              description={quiz.description}
              icon={quiz.icon}
              gradientColor={GRADIENT_COLORS[index % GRADIENT_COLORS.length]}
              to={`/dashboard/quizzes/${quiz.id}`}
              buttonText={quizResults[quiz.id] ? 'Retake Quiz' : 'Start Quiz'}
            />
            {quizResults[quiz.id] && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="bg-white/90 backdrop-blur rounded-lg shadow-lg border border-slate-200 px-3 py-2 max-w-[180px] text-center">
                  <div className="text-[10px] text-slate-500 font-medium mb-1 uppercase tracking-wide">Last Result</div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">{quizResults[quiz.id]}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12 bg-gray-100 rounded-2xl">
          <Brain className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No quizzes found</h3>
          <p className="mt-1 text-sm text-gray-600">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
