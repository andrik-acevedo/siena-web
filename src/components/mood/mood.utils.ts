// src/components/mood/mood.utils.ts
import { MOODS } from './mood.constants';

type Triple = { positive: number; neutral: number; negative: number };

export const formatDate = (date: Date, fmt: string) => {
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  if (fmt === 'MMMM yyyy') return `${months[date.getMonth()]} ${date.getFullYear()}`;
  if (fmt === 'MMMM d, yyyy') return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  if (fmt === 'yyyy-MM-dd') {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return date.toDateString();
};

// Parse "YYYY-MM-DD" as a local date (no timezone drift)
export const parseDateOnly = (ymd: string) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isWithinInclusive = (date: Date, start: Date, end: Date) =>
  date.getTime() >= start.getTime() && date.getTime() <= end.getTime();

// —— Sunday-based week helpers ——
export const startOfWeekSun = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay(); // Sun=0
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const endOfWeekSun = (date: Date) => {
  const start = startOfWeekSun(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const startOfYear = (date: Date) => {
  const d = new Date(date.getFullYear(), 0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfYear = (date: Date) => {
  const d = new Date(date.getFullYear(), 11, 31);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const subDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
};

// Quick lookup for mood type
const MOOD_TYPE_BY_VALUE = Object.fromEntries(
  MOODS.map(m => [m.value, m.type as 'positive' | 'neutral' | 'negative'])
);

// Unified stats (percentages), Sunday-week aware via the range you pass in
export const getMoodStats = (
  entries: { date: string; mood: string }[],
  start: Date,
  end: Date
): Triple => {
  const period = entries.filter(e => {
    const d = parseDateOnly(e.date);
    return isWithinInclusive(d, start, end) || isSameDay(d, start) || isSameDay(d, end);
  });

  const total = period.length;
  if (!total) return { positive: 0, neutral: 0, negative: 0 };

  const counts = period.reduce<Triple>((acc, e) => {
    const t = MOOD_TYPE_BY_VALUE[e.mood];
    if (t) (acc as any)[t] += 1;
    return acc;
  }, { positive: 0, neutral: 0, negative: 0 });

  return {
    positive: Math.round((counts.positive / total) * 100),
    neutral:  Math.round((counts.neutral  / total) * 100),
    negative: Math.round((counts.negative / total) * 100),
  };
};
