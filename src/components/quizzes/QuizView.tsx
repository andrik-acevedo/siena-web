// src/components/quizzes/QuizView.tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import { ALL_QUIZZES } from '../../data/quizData';
import { formatTypeLabel } from '../../utils/quizUtils';
import { useUser } from '../../context/UserContext';
import { toast } from 'react-hot-toast';
import { saveQuizResults as saveResultsToDb } from '../../utils/quizUtils';

// --- Local answer model ---
// We keep both the option's type (e.g. 'quality-time', 'extraversion:reverse')
// and the selectedId as a string ('a'..'e' for typologies, '1'..'6' for Big Five).
// Only Big Five needs the numeric value.
type LocalAnswer = { type: string; selectedId: string; value?: number };

export default function QuizView() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, LocalAnswer>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const { userData } = useUser();
  const quiz = id ? ALL_QUIZZES[id] : null;
  const isBigFive = id === 'bigFive';

  // Guard: missing quiz or malformed questions
  if (!quiz?.questions?.[currentQuestion] || !quiz.questions[currentQuestion]?.options) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-300">This quiz is currently missing questions or options.</p>
        <Button variant="outline" onClick={() => navigate('/dashboard/quizzes')} className="mt-4">
          Back to Quizzes
        </Button>
      </div>
    );
  }

  // ---------- Helpers (scoring & summaries) ----------

  // For typology-style quizzes (love, attachment, boundaries, etc.)
  function tallyTypesFromAnswers(arr: LocalAnswer[]) {
    const counts: Record<string, number> = {};
    for (const a of arr) {
      if (!a?.type) continue;
      counts[a.type] = (counts[a.type] || 0) + 1;
    }
    const total = arr.length || 0;
    const percentages: Record<string, number> = {};
    Object.entries(counts).forEach(([k, v]) => {
      percentages[k] = total ? Math.round((v / total) * 100) : 0;
    });
    // deterministic tie-break: highest count, then alphabetical
    const dominant =
      Object.keys(counts).length > 0
        ? Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0]
        : Object.keys(quiz!.descriptions)[0];
    return { counts, percentages, dominant, total };
  }

  // For Big Five (uses option.type like 'extraversion' or 'extraversion:reverse')
  function calculateBigFiveScoresFromTypes(arr: LocalAnswer[]) {
    type Trait = 'openness' | 'extraversion' | 'agreeableness' | 'conscientiousness' | 'neuroticism';

    const traits: Trait[] = ['openness', 'extraversion', 'agreeableness', 'conscientiousness', 'neuroticism'];
    const raw: Record<Trait, number> = {
      openness: 0,
      extraversion: 0,
      agreeableness: 0,
      conscientiousness: 0,
      neuroticism: 0
    };
    const itemCounts: Record<Trait, number> = {
      openness: 0,
      extraversion: 0,
      agreeableness: 0,
      conscientiousness: 0,
      neuroticism: 0
    };

    for (const a of arr) {
      if (!a?.type) continue;
      const [trait, maybeReverse] = String(a.type).split(':') as [Trait, 'reverse' | undefined];
      if (!traits.includes(trait)) continue;

      // Prefer numeric `value` (we pass it for Big Five), fallback to parsing selectedId
      let v = typeof a.value === 'number' ? a.value : parseInt(a.selectedId, 10);
      if (!Number.isFinite(v)) continue;

      // Clamp to [1..6] just in case
      if (v < 1) v = 1;
      if (v > 6) v = 6;

      const scored = maybeReverse === 'reverse' ? 7 - v : v;
      raw[trait] += scored;
      itemCounts[trait] += 1;
    }

    // Normalize each trait to 0..100 based on how many items fed that trait
    const normalized: Record<Trait, number> = { ...raw };
    traits.forEach((t) => {
      const count = itemCounts[t];
      if (count === 0) {
        normalized[t] = 0;
      } else {
        const min = count * 1;
        const max = count * 6;
        normalized[t] = Math.round(((raw[t] - min) / (max - min)) * 100);
      }
    });

    const dominant =
      traits
        .map((t) => [t, normalized[t]] as const)
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'openness';

    return { raw, normalized, itemCounts, dominant };
  }

  const toArray = () => Object.values(answers);

  // ---------- Save flow ----------

  const persistResults = async (finalAnswers: Record<number, LocalAnswer>) => {
    if (!userData?.id || !id || !quiz) return;
    setIsSaving(true);
    try {
      const arr = Object.entries(finalAnswers);

      // Raw items for audit/history (compatible with your existing DB shape)
      const items = arr.map(([qid, a]) => {
        // For typologies, we store a harmless 1 for selectedAnswer (not used downstream)
        const selectedAnswer =
          typeof a.value === 'number' && Number.isFinite(a.value)
            ? a.value
            : Number.isFinite(parseInt(a.selectedId, 10))
            ? parseInt(a.selectedId, 10)
            : 1;

        return {
          questionId: String(qid),
          selectedAnswer,
          isCorrect: false, // personality quizzes aren’t “right/wrong”
          timeSpent: 0,
          type: a.type,
          selectedId: a.selectedId
        };
      });

      // Summary: typology vs Big Five
      let summary:
        | { kind: 'typology'; dominant: string; percentages: Record<string, number>; counts: Record<string, number> }
        | {
            kind: 'bigFive';
            dominant: string;
            bigFive: {
              raw: Record<string, number>;
              normalized: Record<string, number>;
              itemCounts: Record<string, number>;
            };
          };

      if (isBigFive) {
        const big = calculateBigFiveScoresFromTypes(toArray());
        summary = {
          kind: 'bigFive',
          dominant: big.dominant,
          bigFive: {
            raw: big.raw,
            normalized: big.normalized,
            itemCounts: big.itemCounts
          }
        };
      } else {
        const tallied = tallyTypesFromAnswers(toArray());
        summary = {
          kind: 'typology',
          dominant: tallied.dominant,
          percentages: tallied.percentages,
          counts: tallied.counts
        };
      }

      await saveResultsToDb({
        userId: userData.id,
        quizId: id, // slug; utils maps to UUID internally
        score: 0,
        totalQuestions: quiz.questions.length,
        percentage: 0, // unused for typologies
        totalTime: 0,
        answers: { items, summary } as any
      });

      toast.success('Quiz completed successfully!');
    } catch (err) {
      console.error('Error saving quiz results:', err);
      toast.error('Failed to save quiz results');
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- UI actions ----------

  const handleAnswer = async (type: string, selectedId: string, value?: number) => {
    const qid = quiz!.questions[currentQuestion].id;
    const newAnswers = { ...answers, [qid]: { type, selectedId, value } };
    setAnswers(newAnswers);

    if (currentQuestion < quiz!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await persistResults(newAnswers);
      setShowResults(true);
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  // ---------- Render ----------

  const question = quiz.questions[currentQuestion];

  if (showResults) {
    const arr = toArray();

    const resultData = isBigFive
      ? calculateBigFiveScoresFromTypes(arr)
      : tallyTypesFromAnswers(arr);

    const dominantType = isBigFive ? resultData.dominant : resultData.dominant;

    const types = Object.keys(quiz.descriptions); // keys are the canonical labels to show

    const getResultPercentage = (typeKey: string) => {
      if (isBigFive) {
        // 0..100 normalized value for the trait
        // typeKey should be one of the Big Five keys in your descriptions
        // (extraversion, agreeableness, conscientiousness, neuroticism, openness)
        // @ts-ignore – safe at runtime because keys match your descriptions
        return resultData.normalized?.[typeKey] ?? 0;
      } else {
        // % share of picks for that type
        // @ts-ignore – safe at runtime
        return resultData.percentages?.[typeKey] ?? 0;
      }
    };

    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-[#021E3C] rounded-xl p-8 space-y-6">
          <h2 className="text-2xl font-bold text-white text-center">
            Your {quiz.title} Results
          </h2>

          <div className="space-y-6">
            <div className="bg-brand-green/10 rounded-lg p-6 border border-brand-green">
              <h3 className="text-xl font-semibold text-white mb-2">
                {isBigFive ? 'Primary Trait' : 'Primary Type'}
              </h3>
              <p className="text-lg text-brand-green mb-4">
                {formatTypeLabel(dominantType)}
              </p>
              <p className="text-gray-300">
                {/* For Big Five the description sentence is already trait-focused */}
                {/* For typologies, your descriptions map matches the type keys */}
                {/* @ts-ignore */}
                {isBigFive
                  ? `${formatTypeLabel(dominantType)} reflects ${quiz.descriptions[dominantType]}`
                  : // @ts-ignore
                    quiz.descriptions[dominantType]}
              </p>
            </div>

            <div className="space-y-4">
              {types.map((type) => (
                <div key={type} className="bg-white/5 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white">{formatTypeLabel(type)}</span>
                    <span className="text-brand-green font-semibold">
                      {getResultPercentage(type)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-brand-green h-2 rounded-full"
                      style={{ width: `${getResultPercentage(type)}%` }}
                    />
                  </div>
                  {/* Optional helper copy under each bar */}
                  {/* <p className="text-white/60 text-sm mt-2">{quiz.descriptions[type]}</p> */}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center space-x-4 pt-6">
            <Button variant="outline" onClick={() => navigate('/dashboard/quizzes')}>
              Back to Quizzes
            </Button>
            <Button onClick={handleRetake}>Retake Quiz</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-[#021E3C] rounded-xl p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">{quiz.title}</h2>
            <span className="text-brand-green">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-brand-green h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg text-white">{question.question}</h3>
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() =>
                  handleAnswer(
                    option.type,
                    option.id,                                      // keep string id
                    isBigFive ? parseInt(option.id, 10) : undefined // only Big Five needs number
                  )
                }
                disabled={isSaving}
                className="w-full text-left p-4 rounded-lg bg-white/5 hover:bg-brand-green/10 border border-gray-700 hover:border-brand-green/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-white">{option.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/quizzes')}
            className="text-brand-green border-brand-green hover:bg-brand-green/10"
            disabled={isSaving}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit Quiz
          </Button>
          {currentQuestion > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setCurrentQuestion(currentQuestion - 1);
                setAnswers((prev) => {
                  const newAnswers = { ...prev };
                  delete newAnswers[quiz.questions[currentQuestion].id];
                  return newAnswers;
                });
              }}
              disabled={isSaving}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
        </div>

        {isSaving && (
          <div className="mt-4 text-center">
            <p className="text-white/70 text-sm">Saving your results...</p>
          </div>
        )}
      </div>
    </div>
  );
}
