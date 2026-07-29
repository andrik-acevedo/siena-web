// src/components/journal/JournalPage.tsx
import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';
import {
  Book,
  Calendar as CalendarIcon,
  Trash2,
  Loader2,
  Brain,
  Heart,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Paintbrush,
  PlusCircle,
  NotebookPen,
  Grid,
  Ruler,
  Layers,
  Star,
  Type,
} from 'lucide-react';
import Button from '../ui/Button';
import { MOODS, MOOD_BY_VALUE } from '../mood/mood.constants';
import { formatDate as formatYMD } from '../mood/mood.utils';

/* =========================
   Types
   ========================= */
type JournalThemeId = 'classic' | 'spiral' | 'moleskine' | 'parchment';
type ThemeStrength = 'subtle' | 'medium' | 'bold';
type TintId = 'none' | 'solid' | 'g2' | 'g6' | 'g7' | 'g9';
type FontFamily = 'serif' | 'sans' | 'mono';

type NotebookPrefs = {
  themeId: JournalThemeId;
  tintId: TintId;
  fontFamily: FontFamily;
  strength: ThemeStrength;
  showChrome: boolean;
};

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string | null;
  created_at: string;
  bookmarked?: boolean;
  // new:
  notebook?: string | null;
  category?: string | null;
  style?: NotebookPrefs | null; // snapshot of the entry's look
}

/* =========================
   Helpers (LS)
   ========================= */
const NB_KEY = (uid: string | undefined, notebook: string) =>
  `journal:notebook:${uid ?? 'anon'}:${(notebook || 'Default').toLowerCase()}`;

function readPrefs(key: string): NotebookPrefs | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as NotebookPrefs) : null;
  } catch {
    return null;
  }
}
function writePrefs(key: string, prefs: NotebookPrefs) {
  try {
    localStorage.setItem(key, JSON.stringify(prefs));
  } catch {}
}

/* =========================
   THEMES
   ========================= */
const ruledPaper = (op: number): React.CSSProperties => ({
  backgroundImage: `
    linear-gradient(white, white),
    repeating-linear-gradient(0deg, rgba(16,24,40,${op}) 0, rgba(16,24,40,${op}) 1px, transparent 1px, transparent 28px),
    linear-gradient(90deg, rgba(220,38,38,${Math.min(0.35, op + 0.1)}) 0, rgba(220,38,38,${Math.min(0.35, op + 0.1)}) 1px, transparent 1px)
  `,
  backgroundSize: '100% 100%, 100% 29px, 64px 100%',
  backgroundPosition: '0 0, 0 36px, 48px 0',
});

const parchmentPaper = (strength: ThemeStrength): React.CSSProperties => {
  const vig = strength === 'bold' ? 0.22 : strength === 'medium' ? 0.14 : 0.1;
  return {
    backgroundImage: `
      radial-gradient(ellipse at 30% 20%, rgba(255,255,255,${0.6 + vig}) 0, rgba(255,255,255,0) 40%),
      radial-gradient(ellipse at 70% 80%, rgba(255,255,255,${0.45 + vig}) 0, rgba(255,255,255,0) 40%),
      linear-gradient(180deg, #f2e3c4, #e6d2a9)
    `,
    filter: 'saturate(0.95) contrast(1.02)',
  };
};

const spiralColumn =
  'before:absolute before:left-0 before:top-0 before:h-full before:w-10 ' +
  "before:bg-[radial-gradient(circle_at_50%_12px,rgba(0,0,0,0.35)_0_6px,transparent_7px)] " +
  'before:bg-[length:20px_40px] before:content-[""] before:pointer-events-none';

const THEMES: Record<
  JournalThemeId,
  {
    id: JournalThemeId;
    name: string;
    paper: (strength: ThemeStrength) => React.CSSProperties;
    frameClass: string;
    pageClass: string;
    textClass: string;
  }
> = {
  classic: {
    id: 'classic',
    name: 'Classic Ruled',
    paper: (s) => ruledPaper(s === 'bold' ? 0.18 : s === 'medium' ? 0.12 : 0.08),
    frameClass: 'relative shadow-xl ring-1 ring-black/5 rounded-xl',
    pageClass: 'rounded-xl p-6 md:p-8',
    textClass: 'text-black',
  },
  spiral: {
    id: 'spiral',
    name: 'Spiral',
    paper: (s) => ruledPaper(s === 'bold' ? 0.2 : s === 'medium' ? 0.14 : 0.1),
    frameClass: `relative shadow-2xl ring-1 ring-black/10 rounded-r-xl ${spiralColumn}
                 after:absolute after:top-0 after:left-10 after:h-full after:w-px after:bg-black/10 after:content-['']`,
    pageClass: 'rounded-r-xl pl-14 pr-6 py-6 md:pl-16 md:pr-8 md:py-8',
    textClass: 'text-black',
  },
  moleskine: {
    id: 'moleskine',
    name: 'Moleskine',
    paper: () => ({ background: 'linear-gradient(0deg, #fffbf0, #fff7e6)' }),
    frameClass: 'relative shadow-2xl ring-1 ring-black/20 rounded-xl bg-[#0f172a]/5',
    pageClass: 'rounded-xl p-6 md:p-8',
    textClass: 'text-black',
  },
  parchment: {
    id: 'parchment',
    name: 'Parchment',
    paper: (s) => parchmentPaper(s),
    frameClass: 'relative shadow-2xl ring-1 ring-black/10 rounded-xl',
    pageClass: 'rounded-xl p-6 md:p-8',
    textClass: 'text-black',
  },
};

/* =========================
   COLOR / GRADIENT TINTS
   ========================= */
const BRAND_SOLID = '#01B1AF'; // brand green/teal

const TINTS: Record<TintId, { id: TintId; name: string; class?: string; solid?: string }> = {
  none: { id: 'none', name: 'None' },
  solid: { id: 'solid', name: 'Main Solid', solid: BRAND_SOLID },
  g2: { id: 'g2', name: 'Gold', class: 'from-[#FFA600] to-[#B36B00]' },
  g6: { id: 'g6', name: 'Ocean→Aqua', class: 'from-[#00789f] to-[#005a77]' },
  g7: { id: 'g7', name: 'Berry', class: 'from-[#ea697c] to-[#b8455c]' },
  g9: { id: 'g9', name: 'Lavender→Plum', class: 'from-[#7b5595] to-[#5d4070]' },
};

function tintPropsFor(id: TintId): { tintClass?: string; tintStyle?: React.CSSProperties } {
  const t = TINTS[id];
  if (!t) return {};
  if (t.solid) return { tintStyle: { backgroundColor: t.solid } };
  if (t.class) return { tintClass: `bg-gradient-to-br ${t.class}` };
  return {};
}

/* =========================
   Notebook wrapper
   ========================= */
function NotebookPage({
  themeId,
  strength = 'medium',
  showChrome = true,
  tintClass,
  tintStyle,
  children,
}: {
  themeId: JournalThemeId;
  strength?: ThemeStrength;
  showChrome?: boolean;
  tintClass?: string;
  tintStyle?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const t = THEMES[themeId];
  return (
    <div
      className={`${showChrome ? t.frameClass : ''} overflow-hidden transition-colors`}
      style={{ boxShadow: showChrome ? '0 10px 30px rgba(0,0,0,0.15)' : undefined }}
    >
      <div
        className={t.pageClass}
        style={{
          ...t.paper(strength),
          position: 'relative',
          boxShadow: showChrome ? 'inset -10px 0 30px rgba(0,0,0,0.04)' : undefined,
        }}
      >
        {(tintClass || tintStyle) && (
          <div
            className={['absolute inset-0 rounded-xl pointer-events-none', tintClass ? tintClass : ''].join(' ')}
            style={{ ...(tintStyle || {}), opacity: 1, zIndex: 5 }}
            aria-hidden
          />
        )}
        {showChrome && (
          <div
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)', zIndex: 6 }}
            aria-hidden
          />
        )}
        <div className={`${t.textClass} relative z-10`}>{children}</div>
      </div>
    </div>
  );
}

/* ===============
   Journaling Guide
   =============== */
const JournalGuide = () => (
  <div className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] rounded-lg p-4 md:p-6 space-y-4 text-white text-sm">
    <div className="flex items-center space-x-4 mb-4">
      <Book className="h-8 w-8 text-white" />
      <h2 className="text-xl font-semibold text-white">Journaling Guide</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Brain className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Self-Reflection</h3>
            <p className="text-white/80">Explore your thoughts, feelings, and experiences without judgment.</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Heart className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Emotional Awareness</h3>
            <p className="text-white/80">Track your moods and understand your emotional patterns.</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Sparkles className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Growth & Insights</h3>
            <p className="text-white/80">Document your progress and celebrate small wins.</p>
          </div>
        </div>
      </div>
      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Journal Prompts</h3>
        <ul className="text-white/80 space-y-2">
          <li>• What's on my mind today?</li>
          <li>• What did I learn or overcome?</li>
          <li>• What am I grateful for?</li>
          <li>• What small step can I take next?</li>
        </ul>
      </div>
    </div>
  </div>
);

/* ==========
   Page Code
   ========== */
const MOODS_ALPHABETICAL = [...MOODS].sort((a, b) => a.label.localeCompare(b.label));
const brandTeal = '#01B1AF';

function Dot({
  selected,
  children,
  title,
  onClick,
}: {
  selected?: boolean;
  children: React.ReactNode;
  title?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        'relative h-7 w-7 rounded-full overflow-hidden ring-2 transition shadow',
        selected ? 'ring-white ring-offset-2 ring-offset-white/10' : 'ring-white/60 hover:ring-white',
      ].join(' ')}
      aria-pressed={selected}
    >
      {children}
      {selected && <span className="absolute inset-0 rounded-full ring-2 ring-white/70 pointer-events-none" />}
    </button>
  );
}

export default function JournalPage() {
  const { userData } = useUser();
  const uid = userData?.id;

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isWriting, setIsWriting] = useState(true);
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: '', bookmarked: false });

  // NEW: independent category + notebook (category does not affect theme)
  const [category, setCategory] = useState<string>('');
  const [notebook, setNotebook] = useState<string>('Default');

  const [showGuide, setShowGuide] = useState(false);
  const [collapsedEntries, setCollapsedEntries] = useState<Record<string, boolean>>({});

  // Notebook preferences (current editor look)
  const [themeId, setThemeId] = useState<JournalThemeId>('classic');
  const [strength, setStrength] = useState<ThemeStrength>('medium');
  const [showChrome, setShowChrome] = useState<boolean>(true);
  const [tintId, setTintId] = useState<TintId>('solid'); // default = brand green
  const [fontFamily, setFontFamily] = useState<FontFamily>('serif');

  // derive field class
  const fontClass = `font-${fontFamily}`;
  const fieldClass =
    `mt-1 block w-full rounded-md border-0 bg-white text-black shadow-sm ` +
    `ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-500 px-4 py-3 text-lg ${fontClass} leading-relaxed`;

  // Load entries
  useEffect(() => {
    loadEntries();
  }, [uid]);

  // Load notebook prefs from LS whenever uid or notebook changes
  useEffect(() => {
    const key = NB_KEY(uid, notebook);
    const saved = readPrefs(key);
    if (saved) {
      setThemeId(saved.themeId);
      setTintId(saved.tintId);
      setFontFamily(saved.fontFamily);
      setStrength(saved.strength);
      setShowChrome(saved.showChrome);
    } else {
      // Keep sensible defaults (brand green solid), but write them so this notebook persists
      const defaults: NotebookPrefs = {
        themeId: 'classic',
        tintId: 'solid',
        fontFamily: 'serif',
        strength: 'medium',
        showChrome: true,
      };
      writePrefs(key, defaults);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, notebook]);

  // Persist notebook prefs when any look control changes
  useEffect(() => {
    const key = NB_KEY(uid, notebook);
    const prefs: NotebookPrefs = { themeId, tintId, fontFamily, strength, showChrome };
    writePrefs(key, prefs);
  }, [uid, notebook, themeId, tintId, fontFamily, strength, showChrome]);

  async function loadEntries() {
    if (!uid) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const rows = (data || []) as JournalEntry[];
      setEntries(rows);

      const collapsed: Record<string, boolean> = {};
      rows.forEach((e) => (collapsed[e.id] = true));
      setCollapsedEntries(collapsed);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load journal entries');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid || !newEntry.title.trim() || !newEntry.content.trim()) return;

    const prefsSnapshot: NotebookPrefs = {
      themeId,
      tintId,
      fontFamily,
      strength,
      showChrome,
    };

    try {
      const { data: created, error: insErr } = await supabase
        .from('journal_entries')
        .insert([
          {
            title: newEntry.title.trim(),
            content: newEntry.content.trim(),
            mood: newEntry.mood ? newEntry.mood.trim() : null,
            bookmarked: newEntry.bookmarked,
            user_id: uid,
            notebook: notebook || 'Default',
            category: category || null,
            style: prefsSnapshot, // snapshot
          },
        ])
        .select()
        .single();
      if (insErr) throw insErr;

      // Also log mood to moods table
      if (newEntry.mood) {
        const dateStr = formatYMD(new Date(created.created_at), 'yyyy-MM-dd');
        const { data: existing } = await supabase
          .from('moods')
          .select('id')
          .eq('user_id', uid)
          .eq('date', dateStr)
          .maybeSingle();
        if (existing) {
          await supabase.from('moods').update({ mood: newEntry.mood }).eq('id', existing.id);
        } else {
          await supabase.from('moods').insert([{ user_id: uid, date: dateStr, mood: newEntry.mood }]);
        }
      }

      setNewEntry({ title: '', content: '', mood: '', bookmarked: false });
      setCategory('');
      await loadEntries();
      setIsWriting(false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to save journal entry');
    }
  }

  async function toggleBookmark(id: string, currentBookmarked: boolean) {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({ bookmarked: !currentBookmarked })
        .eq('id', id);
      if (error) throw error;
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, bookmarked: !currentBookmarked } : e)));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to update bookmark');
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm('Delete this entry?')) return;
    try {
      const { error: delErr } = await supabase.from('journal_entries').delete().eq('id', id);
      if (delErr) throw delErr;
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setCollapsedEntries((prev) => {
        const m = { ...prev };
        delete m[id];
        return m;
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to delete journal entry');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-brand-green animate-spin" />
      </div>
    );
  }

  // Dots for pattern selection
  const patternDots = (Object.values(THEMES) as any[]).map((t: any) => (
    <Dot key={t.id} selected={themeId === t.id} onClick={() => setThemeId(t.id)} title={t.name}>
      <div className="absolute inset-0 rounded-full" style={{ ...t.paper('medium'), backgroundClip: 'padding-box' }} />
      <div className="absolute inset-0 rounded-full ring-1 ring-black/10" />
      <div className="absolute inset-0 grid place-items-center">
        {t.id === 'classic' || t.id === 'moleskine' ? (
          <Ruler className="h-3.5 w-3.5 opacity-70" />
        ) : t.id === 'spiral' ? (
          <NotebookPen className="h-3.5 w-3.5 opacity-70" />
        ) : t.id === 'parchment' ? (
          <Layers className="h-3.5 w-3.5 opacity-70" />
        ) : (
          <Grid className="h-3.5 w-3.5 opacity-70" />
        )}
      </div>
    </Dot>
  ));

  // Dots for tint selection
  const tintDots = Object.values(TINTS).map((t) => (
    <Dot key={t.id} selected={tintId === t.id} onClick={() => setTintId(t.id)} title={t.name}>
      {t.id === 'none' ? (
        <div className="absolute inset-0 rounded-full bg-white/60">
          <div className="absolute left-1/2 top-1/2 h-6 w-0.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black/40" />
        </div>
      ) : t.solid ? (
        <div className="absolute inset-0 rounded-full" style={{ backgroundColor: t.solid }} />
      ) : (
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${t.class}`} />
      )}
      <div className="absolute inset-0 rounded-full ring-1 ring-black/10" />
    </Dot>
  ));

  const { tintClass, tintStyle } = tintPropsFor(tintId);

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Header band */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-6 md:p-8 mb-12">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Personal Journal</h1>
              <p className="text-base text-white/80">A safe space for your thoughts and reflections</p>
            </div>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="ml-4 flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2 hover:bg-white/15 transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">Tips</span>
              {showGuide ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* Notebook name (per-notebook prefs persist) */}
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <span className="text-white text-xs opacity-90">Notebook</span>
              <input
                value={notebook}
                onChange={(e) => setNotebook(e.target.value || 'Default')}
                className="bg-transparent border border-white/30 text-white text-sm rounded px-2 py-1 placeholder:text-white/60"
                placeholder="Default"
              />
            </div>

            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <span className="text-white text-xs opacity-90 mr-1">Pattern</span>
              <div className="flex gap-2">{patternDots}</div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Paintbrush className="h-4 w-4 text-white" />
              <span className="text-white text-xs opacity-90">Color</span>
              <div className="flex gap-2">{tintDots}</div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <Type className="h-4 w-4 text-white" />
              <span className="text-white text-xs opacity-90">Font</span>
              {(['serif', 'sans', 'mono'] as const).map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => setFontFamily(font)}
                  className={[
                    'h-6 px-2 rounded-full text-[11px] border transition',
                    fontFamily === font ? 'bg-white text-[#0b1220] border-white' : 'text-white/80 border-white/40 hover:border-white/70',
                  ].join(' ')}
                >
                  {font === 'serif' ? 'S' : font === 'sans' ? 'A' : 'M'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <span className="text-white text-xs opacity-90">Strength</span>
              {(['subtle', 'medium', 'bold'] as ThemeStrength[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setStrength(lvl)}
                  className={[
                    'h-6 px-2 rounded-full text-[11px] border transition',
                    strength === lvl ? 'bg-white text-[#0b1220] border-white' : 'text-white/80 border-white/40 hover:border-white/70',
                  ].join(' ')}
                >
                  {lvl[0].toUpperCase()}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 cursor-pointer">
              <input type="checkbox" checked={showChrome} onChange={(e) => setShowChrome(e.target.checked)} className="accent-white" />
              <span className="text-white text-sm">Chrome</span>
            </label>
          </div>

          {showGuide && (
            <div className="mt-6">
              <JournalGuide />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Compose */}
      {isWriting ? (
        <NotebookPage themeId={themeId} strength={strength} showChrome={showChrome} {...tintPropsFor(tintId)}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-black opacity-80">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  className={fieldClass}
                  placeholder="Give your entry a title"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-black opacity-80">
                  Category (optional)
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">Select a category...</option>
                  <option value="Personal Reflections">Personal Reflections</option>
                  <option value="Gratitude">Gratitude</option>
                  <option value="Goals & Dreams">Goals & Dreams</option>
                  <option value="Daily Life">Daily Life</option>
                  <option value="Relationships">Relationships</option>
                  <option value="Work & Career">Work & Career</option>
                  <option value="Mental Health">Mental Health</option>
                  <option value="Self-Care">Self-Care</option>
                  <option value="Creativity">Creativity</option>
                  <option value="Travel & Adventure">Travel & Adventure</option>
                  <option value="Learning & Growth">Learning & Growth</option>
                  <option value="Challenges">Challenges</option>
                  <option value="Victories">Victories</option>
                  <option value="Spiritual Journey">Spiritual Journey</option>
                  <option value="Random Thoughts">Random Thoughts</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="mood" className="block text-sm font-medium text-black opacity-80">
                  Mood (optional)
                </label>
                <div className="flex gap-2">
                  <select
                    aria-label="Select a mood"
                    className={`${fieldClass} flex-1`}
                    value=""
                    onChange={(e) => {
                      const slug = e.target.value;
                      if (!slug) return;
                      setNewEntry((p) => ({ ...p, mood: slug }));
                    }}
                  >
                    <option value="">Popular…</option>
                    {MOODS_ALPHABETICAL.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    id="mood"
                    value={newEntry.mood}
                    onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                    className={`${fieldClass} flex-1`}
                    placeholder="Or type your own mood"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-black opacity-80">
                Your thoughts
              </label>
              <textarea
                id="content"
                rows={15}
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                className={fieldClass}
                placeholder="Write your thoughts here..."
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsWriting(false)} type="button">
                Hide editor
              </Button>
              <Button type="submit" className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white">
                Save Entry
              </Button>
            </div>
          </form>
        </NotebookPage>
      ) : (
        <div className="flex justify-end">
          <Button onClick={() => setIsWriting(true)} className="flex items-center gap-2 bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white">
            <PlusCircle className="h-4 w-4" />
            New Entry
          </Button>
        </div>
      )}

      {/* Expand/Collapse all entries */}
      {entries.length > 0 && (
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => {
              const allExpanded = entries.every((e) => !collapsedEntries[e.id]);
              setCollapsedEntries(() => {
                const m: Record<string, boolean> = {};
                entries.forEach((e) => (m[e.id] = allExpanded));
                return m;
              });
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm transition"
          >
            <Book className="h-4 w-4" />
            <span className="text-black/90">
              {entries.every((e) => !collapsedEntries[e.id]) ? 'Collapse all entries' : 'Expand all entries'}
            </span>
          </button>
        </div>
      )}

      {/* Entries list */}
      {entries.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-[#01B1AF] to-[#03274B] rounded-lg">
          <Book className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-white">Ready to start journaling?</h3>
          <p className="mt-1 text-sm text-gray-300">Use the prompts above to begin your journaling practice.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => {
            // Prefer the entry’s saved style; otherwise fallback to the prefs saved for that entry’s notebook; finally current view prefs
            const fallbackPrefs =
              readPrefs(NB_KEY(uid, entry.notebook || 'Default')) ||
              ({ themeId, tintId, fontFamily, strength, showChrome } as NotebookPrefs);

            const entryPrefs = (entry.style || fallbackPrefs) as NotebookPrefs;
            const { tintClass: eTintClass, tintStyle: eTintStyle } = tintPropsFor(entryPrefs.tintId);

            const entryCollapsed = collapsedEntries[entry.id] ?? true;
            const moodLabel =
              entry.mood && MOOD_BY_VALUE[entry.mood]?.label ? MOOD_BY_VALUE[entry.mood].label : entry.mood || '';
            const previewText =
              entry.content.length > 150 ? entry.content.substring(0, 150) + '...' : entry.content;

            return (
              <NotebookPage
                key={entry.id}
                themeId={entryPrefs.themeId}
                strength={entryPrefs.strength}
                showChrome={entryPrefs.showChrome}
                tintClass={eTintClass}
                tintStyle={eTintStyle}
              >
                <div className={`relative ${`font-${entryPrefs.fontFamily}`}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium">{entry.title}</h3>

                        {/* optional category chip (doesn't change theme) */}
                        {entry.category ? (
                          <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-white/40 border border-black/10">
                            {entry.category}
                          </span>
                        ) : null}

                        <button
                          onClick={() => toggleBookmark(entry.id, entry.bookmarked || false)}
                          className={`transition-all duration-200 ${
                            entry.bookmarked ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-300 hover:text-yellow-400'
                          } cursor-pointer`}
                          title={entry.bookmarked ? 'Remove bookmark' : 'Bookmark entry'}
                        >
                          <Star className="h-5 w-5" fill={entry.bookmarked ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center text-sm opacity-80">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(entry.created_at).toLocaleDateString()}
                        </div>
                        {moodLabel && (
                          <div className="text-sm" style={{ color: brandTeal }}>
                            Mood: {moodLabel}
                          </div>
                        )}
                        {entry.notebook ? (
                          <div className="text-sm opacity-80">Notebook: {entry.notebook}</div>
                        ) : null}
                      </div>
                    </div>
                    <button onClick={() => deleteEntry(entry.id)} className="opacity-70 hover:opacity-100 transition" title="Delete entry">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {entryCollapsed ? (
                    <div>
                      <p className="whitespace-pre-wrap leading-7 text-sm opacity-80 mb-3">{previewText}</p>
                      <button
                        type="button"
                        onClick={() => setCollapsedEntries((prev) => ({ ...prev, [entry.id]: false }))}
                        className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-white/10 hover:bg-white/15 transition"
                      >
                        <ChevronDown className="h-4 w-4" />
                        Read full entry
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        onClick={() => setCollapsedEntries((prev) => ({ ...prev, [entry.id]: true }))}
                        className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm bg-white/10 hover:bg-white/15 transition mb-4"
                      >
                        <ChevronUp className="h-4 w-4" />
                        Collapse entry
                      </button>
                      <p className="whitespace-pre-wrap leading-7">{entry.content}</p>
                    </div>
                  )}
                </div>
              </NotebookPage>
            );
          })}
        </div>
      )}
    </div>
  );
}
