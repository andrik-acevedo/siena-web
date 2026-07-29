// src/utils/quizUtils.ts
// Works with your current DB schema and adds clean summaries for each quiz.
// - Typology quizzes (love, attachment, boundaries, etc.): dominant type + percentages
// - Big Five: reverse-scored, normalized 0–100 per trait
// - Back-compat: respects { result: "<slug>" } if you store that, and only
//   computes summaries when the items contain enough info (e.g., `type`).

import { supabase } from '../lib/supabase';

/** -------------------- Types -------------------- **/

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number; // 1..6 for Big Five; for typologies we can store a harmless constant (e.g. 1)
  isCorrect: boolean;     // personality quizzes can leave this false
  timeSpent: number;      // ms
  // The following are commonly present in saved `answers.items`:
  // type?: string;         // e.g., 'quality-time' or 'extraversion:reverse'
  // selectedId?: string;   // raw option id (e.g., 'a'..'e' or '1'..'6')
}

export interface QuizResult {
  userId: string;
  quizId: string; // human slug (e.g., 'love', 'bigFive')
  score: number | null; // optional/unused for typologies
  totalQuestions: number;
  percentage: number;   // only meaningful if you store knowledge quizzes
  totalTime: number;    // ms
  answers: any;         // we store { items: QuizAnswer[], summary?: ..., result?: "<slug>" }
}

export interface SavedQuizResult {
  id: string;
  user_id: string;
  quiz_id: string;   // UUID in DB; mapped back to slug on read
  score: number | null;
  answers: any;
  completed_at: string;
  created_at: string;
  // Derived at read-time:
  // total_questions?: number;
  // percentage?: number;
  // total_time?: number;
  // dominantType?: string;
  // percentages?: Record<string, number>;
  // bigFive?: { raw: Record<string, number>; normalized: Record<string, number>; itemCounts: Record<string, number> };
}

/** -------------------- Quiz ID mapping -------------------- **/

const QUIZ_UUID_MAP: Record<string, string> = {
  love: '11111111-1111-1111-1111-111111111111',
  attachment: '22222222-2222-2222-2222-222222222222',
  conflict: '33333333-3333-3333-3333-333333333333',
  values: '44444444-4444-4444-4444-444444444444',
  communication: '55555555-5555-5555-5555-555555555555',
  selfEsteem: '66666666-6666-6666-6666-666666666666',
  emotionalIntelligence: '77777777-7777-7777-7777-777777777777',
  redFlags: '88888888-8888-8888-8888-888888888888',
  emotionalRegulation: '99999999-9999-9999-9999-999999999999',
  boundary: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  bigFive: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  relationshipReadiness: 'cccccccc-cccc-cccc-cccc-cccccccccccc'
};

const UUID_QUIZ_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(QUIZ_UUID_MAP).map(([name, uuid]) => [uuid, name])
);

/** -------------------- Formatting helper -------------------- **/

// Title-case helper used by QuizList/QuizView
export function formatTypeLabel(type: string): string {
  return type
    .replace(/([A-Z])/g, ' $1')  // camelCase -> camel Case
    .replace(/_/g, ' ')          // snake_case -> snake case
    .trim()
    .replace(/\b\w/g, (l) => l.toUpperCase()); // Title Case
}
export { formatTypeLabel as formatQuizTypeLabel };

/** -------------------- Internal helpers -------------------- **/

function toAnswerArray(ans: any): QuizAnswer[] {
  if (Array.isArray(ans)) return ans as QuizAnswer[];
  if (ans?.items && Array.isArray(ans.items)) return ans.items as QuizAnswer[];
  return [];
}

type BigFiveTrait = 'openness' | 'extraversion' | 'agreeableness' | 'conscientiousness' | 'neuroticism';

/**
 * Scores Big Five using the `type` string on each answer item, e.g. 'extraversion' or 'extraversion:reverse'.
 * Accepts either `selectedAnswer` (number) or `selectedId` ('1'..'6') within each item.
 */
export function calculateBigFiveScoresFromTypes(
  items: Array<{ type?: string; selectedAnswer?: number; selectedId?: string }>
): {
  raw: Record<BigFiveTrait, number>;
  normalized: Record<BigFiveTrait, number>;
  itemCounts: Record<BigFiveTrait, number>;
  dominant: BigFiveTrait;
} {
  const traits: BigFiveTrait[] = ['openness', 'extraversion', 'agreeableness', 'conscientiousness', 'neuroticism'];

  const raw: Record<BigFiveTrait, number> = {
    openness: 0,
    extraversion: 0,
    agreeableness: 0,
    conscientiousness: 0,
    neuroticism: 0
  };
  const itemCounts: Record<BigFiveTrait, number> = {
    openness: 0,
    extraversion: 0,
    agreeableness: 0,
    conscientiousness: 0,
    neuroticism: 0
  };

  for (const it of items) {
    if (!it?.type) continue;
    const [trait, maybeReverse] = String(it.type).split(':') as [BigFiveTrait, 'reverse' | undefined];
    if (!traits.includes(trait)) continue;

    let v =
      typeof it.selectedAnswer === 'number' && Number.isFinite(it.selectedAnswer)
        ? it.selectedAnswer
        : Number.parseInt(String((it as any).selectedId ?? ''), 10);
    if (!Number.isFinite(v)) continue;
    v = Math.max(1, Math.min(6, v));

    const scored = maybeReverse === 'reverse' ? 7 - v : v;
    raw[trait] += scored;
    itemCounts[trait] += 1;
  }

  const normalized: Record<BigFiveTrait, number> = { ...raw };
  traits.forEach((t) => {
    const n = itemCounts[t];
    if (n === 0) normalized[t] = 0;
    else {
      const min = n * 1;
      const max = n * 6;
      normalized[t] = Math.round(((raw[t] - min) / (max - min)) * 100);
    }
  });

  const dominant =
    traits
      .map((t) => [t, normalized[t]] as const)
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'openness';

  return { raw, normalized, itemCounts, dominant };
}

/** Back-compat helper that matches your old signature used in legacy code.
 *  answersByQid: { [questionId]: 1..6 }
 *  questions: QuizQuestion[] (we infer each question's trait from the first option.type)
 *  Returns normalized 0..100 per trait.
 */
export function calculateBigFiveScores(
  answersByQid: Record<number, number>,
  questions: Array<{ id: number; options: Array<{ id: string; type: string }> }>
): Record<BigFiveTrait, number> {
  const items: Array<{ type?: string; selectedAnswer?: number }> = [];
  for (const q of questions) {
    const v = answersByQid[q.id];
    if (typeof v !== 'number') continue;
    const typeForQuestion = q.options?.[0]?.type; // all options for a Big Five item share the same type string
    items.push({ type: typeForQuestion, selectedAnswer: v });
  }
  return calculateBigFiveScoresFromTypes(items).normalized;
}

/** Tallies type counts for typology quizzes and returns dominant + percentages */
export function tallyTypesFromAnswers(
  items: Array<{ type?: string }>
): { counts: Record<string, number>; percentages: Record<string, number>; dominant: string | null; total: number } {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const it of items) {
    if (!it?.type) continue;
    counts[it.type] = (counts[it.type] || 0) + 1;
    total += 1;
  }
  const percentages: Record<string, number> = {};
  Object.entries(counts).forEach(([k, v]) => (percentages[k] = total ? Math.round((v / total) * 100) : 0));
  const dominant =
    Object.keys(counts).length > 0
      ? Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0]
      : null;
  return { counts, percentages, dominant, total };
}

/** Convenience wrappers to match your older component imports (safe to keep) */
export const calculateDominantType = (answers: { [questionId: number]: { type: string; value: number } }): string => {
  const arr = Object.values(answers);
  const tallied = tallyTypesFromAnswers(arr);
  return tallied.dominant ?? '';
};

export const calculateTypePercentages = (
  answers: { [questionId: number]: { type: string; value: number } }
): Record<string, number> => {
  const arr = Object.values(answers);
  return tallyTypesFromAnswers(arr).percentages;
};

/** Build a stable summary object to store alongside raw items */
export function buildQuizPayload(
  quizSlug: string,
  rawAnswers: QuizAnswer[] | { items: QuizAnswer[] } | any
):
  | { kind: 'bigFive'; dominant: BigFiveTrait; bigFive: { raw: Record<string, number>; normalized: Record<string, number>; itemCounts: Record<string, number> } }
  | { kind: 'typology'; dominant: string | null; percentages: Record<string, number>; counts: Record<string, number> } {
  const items = toAnswerArray(rawAnswers);

  if (quizSlug === 'bigFive' && items.some((a: any) => !!a?.type)) {
    const bf = calculateBigFiveScoresFromTypes(items as any);
    return {
      kind: 'bigFive',
      dominant: bf.dominant,
      bigFive: { raw: bf.raw, normalized: bf.normalized, itemCounts: bf.itemCounts }
    };
  }

  if (items.some((a: any) => !!a?.type)) {
    const minimal = items.map((a: any) => ({ type: a.type }));
    const tally = tallyTypesFromAnswers(minimal);
    return { kind: 'typology', dominant: tally.dominant, percentages: tally.percentages, counts: tally.counts };
  }

  // Not enough info to compute a summary (e.g., items missing `type`)
  // Let the caller rely on `answers.result` if provided.
  return { kind: 'typology', dominant: null, percentages: {}, counts: {} };
}

/** -------------------- DB: Save / Read -------------------- **/

export const saveQuizResults = async (result: QuizResult): Promise<void> => {
  try {
    if (!result.userId || !result.quizId) {
      throw new Error('Missing required fields: userId and quizId are required');
    }

    const quizUuid = QUIZ_UUID_MAP[result.quizId];
    if (!quizUuid) {
      throw new Error(`Unknown quiz ID: ${result.quizId}. Available: ${Object.keys(QUIZ_UUID_MAP).join(', ')}`);
    }

    // Build a consistent envelope { items, summary? }. Only compute summary
    // if we actually have enough info on the items (e.g., they include `type`).
    const items = toAnswerArray(result.answers);
    const hasTypes = items.some((a: any) => !!a?.type);
    let answers: any;

    if (result.answers?.summary) {
      answers = result.answers;
    } else if (hasTypes) {
      answers = { items, summary: buildQuizPayload(result.quizId, items) };
    } else if (result.answers && typeof result.answers === 'object') {
      // Respect any existing minimal object like { result: "<slug>", items: [...] }
      answers = result.answers;
    } else {
      answers = { items };
    }

    const quizData = {
      user_id: result.userId,
      quiz_id: quizUuid,
      score: result.score ?? null,
      answers,
      completed_at: new Date().toISOString()
    };

    // ✅ One-call upsert (works because you have UNIQUE(user_id, quiz_id))
    const { error } = await supabase
      .from('quiz_answers')
      .upsert(quizData, { onConflict: 'user_id,quiz_id' });

    if (error) throw error;
  } catch (error) {
    console.error('❌ Error in saveQuizResults:', error);
    throw error;
  }
};

export const getQuizResults = async (userId: string): Promise<SavedQuizResult[]> => {
  try {
    const { data, error } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) throw error;

    const results = (data || []).map((row: any) => {
      const quizName = UUID_QUIZ_MAP[row.quiz_id] || row.quiz_id;

      const arr = toAnswerArray(row.answers);
      const totalQuestions = arr.length;
      const totalTime = arr.reduce((sum: number, a: QuizAnswer) => sum + (a.timeSpent || 0), 0);

      // Prefer stored summary if present; otherwise fall back to { result } if provided.
      const summary = row.answers?.summary;
      const resultSlug = row.answers?.result as string | undefined;

      let derived: any = {};
      if (summary?.kind === 'bigFive') {
        derived = { bigFive: summary.bigFive, dominantType: summary.dominant };
      } else if (summary?.kind === 'typology') {
        derived = { dominantType: summary.dominant ?? resultSlug, percentages: summary.percentages };
      } else if (resultSlug) {
        derived = { dominantType: resultSlug };
      } else {
        // Legacy fallback: compute % from isCorrect flags (for knowledge-type quizzes)
        const correct = arr.filter((a: QuizAnswer) => a.isCorrect).length;
        derived = { percentage: totalQuestions ? Math.round((correct / totalQuestions) * 100) : 0 };
      }

      return {
        ...row,
        quiz_id: quizName,
        total_questions: totalQuestions,
        total_time: totalTime,
        ...derived
      };
    });

    return results;
  } catch (error) {
    console.error('❌ Error in getQuizResults:', error);
    throw error;
  }
};

export const getQuizResult = async (userId: string, quizId: string): Promise<SavedQuizResult | null> => {
  try {
    const quizUuid = QUIZ_UUID_MAP[quizId];
    if (!quizUuid) {
      console.error('❌ Unknown quiz ID:', quizId);
      return null;
    }

    const { data, error } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_id', quizUuid)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const arr = toAnswerArray(data.answers);
    const totalQuestions = arr.length;
    const totalTime = arr.reduce((sum: number, a: QuizAnswer) => sum + (a.timeSpent || 0), 0);

    const summary = data.answers?.summary;
    const resultSlug = data.answers?.result as string | undefined;

    let derived: any = {};
    if (summary?.kind === 'bigFive') {
      derived = { bigFive: summary.bigFive, dominantType: summary.dominant };
    } else if (summary?.kind === 'typology') {
      derived = { dominantType: summary.dominant ?? resultSlug, percentages: summary.percentages };
    } else if (resultSlug) {
      derived = { dominantType: resultSlug };
    } else {
      const correct = arr.filter((a: QuizAnswer) => a.isCorrect).length;
      derived = { percentage: totalQuestions ? Math.round((correct / totalQuestions) * 100) : 0 };
    }

    return {
      ...data,
      quiz_id: UUID_QUIZ_MAP[data.quiz_id] || data.quiz_id,
      total_questions: totalQuestions,
      total_time: totalTime,
      ...derived
    } as SavedQuizResult;
  } catch (error) {
    console.error('❌ Error in getQuizResult:', error);
    throw error;
  }
};

/** -------------------- Aggregates -------------------- **/

export const calculateQuizStats = (results: SavedQuizResult[]) => {
  if (results.length === 0) {
    return { totalQuizzes: 0, averageScore: 0, bestScore: 0, totalTimeSpent: 0 };
  }

  let totalTimeMs = 0;
  const percentages: number[] = [];

  for (const r of results) {
    const arr = toAnswerArray(r.answers);
    totalTimeMs += arr.reduce((s: number, a: QuizAnswer) => s + (a.timeSpent || 0), 0);

    // Include in averages only for legacy/knowledge quizzes with % available
    const summary = r.answers?.summary;
    if (!summary && Array.isArray(arr) && arr.length > 0) {
      const correct = arr.filter((a: QuizAnswer) => a.isCorrect).length;
      percentages.push((correct / arr.length) * 100);
    }
  }

  const averageScore = percentages.length ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length) : 0;
  const bestScore = percentages.length ? Math.round(Math.max(...percentages)) : 0;

  return {
    totalQuizzes: results.length,
    averageScore,
    bestScore,
    totalTimeSpent: Math.round(totalTimeMs / 1000) // seconds
  };
};
