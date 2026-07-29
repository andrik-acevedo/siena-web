// src/components/values/ValuesPage.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Brain, Heart, Target, Globe, Sparkles, RotateCcw, Download, Smartphone,
  ChevronsLeftRight, ArrowUp, ArrowDown, HelpCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';

/* ---------------- Types ---------------- */
interface Value { id: string; name: string; category: string; }
type ColumnKey = 'Available Values' | 'Important' | 'Very Important' | 'Core Values';
type Columns   = Record<ColumnKey, Value[]>;
type PersistIds     = Record<ColumnKey, string[]>;
type PersistPayload = { columns: PersistIds; updated_at: string };
type DZ = { toColumn: ColumnKey; index: number };

/* --------------- Constants -------------- */
const CORE_LIMIT = 10;
const LOCAL_PREFIX = 'values_board_v4';

const VALUES_DATA = {
  'Personal Growth & Self-Expression': [
    'Achievement','Adventure','Authenticity','Balance','Challenge','Creativity',
    'Curiosity','Freedom','Growth','Independence','Innovation','Knowledge',
    'Learning','Mastery','Open-mindedness','Passion','Self-acceptance',
    'Self-discipline','Spirituality','Wisdom'
  ],
  'Relationships & Connection': [
    'Belonging','Care','Collaboration','Compassion','Empathy','Family',
    'Friendship','Generosity','Gratitude','Honesty','Intimacy','Kindness',
    'Loyalty','Love','Respect','Responsibility','Service','Support',
    'Trust','Understanding'
  ],
  'Work & Achievement': [
    'Ambition','Authority','Competence','Contribution','Dependability',
    'Efficiency','Excellence','Influence','Leadership','Professionalism',
    'Recognition','Reliability','Reputation','Responsibility','Security',
    'Status','Success','Wealth','Work–life balance'
  ],
  'Community & Social Impact': [
    'Altruism','Citizenship','Community','Diversity','Equality',
    'Environmentalism','Fairness','Generosity','Global awareness','Justice',
    'Philanthropy','Responsibility','Social change','Sustainability','Volunteering'
  ],
  'Lifestyle & Well-Being': [
    'Abundance','Aesthetics','Comfort','Health','Joy','Peace','Pleasure',
    'Safety','Simplicity','Stability','Tradition','Vitality','Wellness'
  ]
} as const;

const CATEGORY_ICONS = {
  'Personal Growth & Self-Expression': Sparkles,
  'Relationships & Connection': Heart,
  'Work & Achievement': Target,
  'Community & Social Impact': Globe,
  'Lifestyle & Well-Being': Brain
} as const;

const CATEGORY_COLORS = {
  'Personal Growth & Self-Expression': 'from-[#B1E006] to-[#6C8300]',
  'Relationships & Connection': 'from-[#ea697c] to-[#b8455c]',
  'Work & Achievement': 'from-[#0068aa] to-[#004d7f]',
  'Community & Social Impact': 'from-[#008792] to-[#006a70]',
  'Lifestyle & Well-Being': 'from-[#7b5595] to-[#5d4070]'
} as const;

/* --------------- Catalog ---------------- */
const CATALOG: Record<string, Value> = Object.entries(VALUES_DATA).reduce((acc, [category, vals]) => {
  (vals as string[]).forEach((name) => {
    const id = `${category}-${name}`;
    acc[id] = { id, name, category };
  });
  return acc;
}, {} as Record<string, Value>);
const ALL_VALUES = Object.values(CATALOG);

/* --------------- Helpers ---------------- */
const nowISO = () => new Date().toISOString();

const colsToIds = (cols: Columns): PersistIds => ({
  'Available Values': cols['Available Values'].map(v => v.id),
  'Important':       cols['Important'].map(v => v.id),
  'Very Important':  cols['Very Important'].map(v => v.id),
  'Core Values':     cols['Core Values'].map(v => v.id),
});

const idsToCols = (obj: PersistIds): Columns => ({
  'Available Values': obj['Available Values'].map(id => CATALOG[id]).filter(Boolean),
  'Important':        obj['Important'].map(id => CATALOG[id]).filter(Boolean),
  'Very Important':   obj['Very Important'].map(id => CATALOG[id]).filter(Boolean),
  'Core Values':      obj['Core Values'].map(id => CATALOG[id]).filter(Boolean),
});

const sanitize = (cols: Columns): Columns => {
  const uniq = (arr: Value[]) => {
    const seen = new Set<string>();
    return arr.filter(v => (seen.has(v.id) ? false : (seen.add(v.id), true)));
  };
  const core = uniq(cols['Core Values']).slice(0, CORE_LIMIT);
  const very = uniq(cols['Very Important']).filter(v => !core.find(c => c.id === v.id));
  const imp  = uniq(cols['Important']).filter(v =>
    !core.find(c => c.id === v.id) && !very.find(c => c.id === v.id)
  );
  const assigned = new Set([...core, ...very, ...imp].map(v => v.id));
  const avail = ALL_VALUES.filter(v => !assigned.has(v.id));
  return { 'Available Values': avail, 'Important': imp, 'Very Important': very, 'Core Values': core };
};

const deepEqualIds = (a: Columns, b: Columns) =>
  JSON.stringify(colsToIds(a)) === JSON.stringify(colsToIds(b));

const getColumnColor = (column: ColumnKey): string => {
  switch (column) {
    case 'Available Values': return 'from-[#374151] to-[#4B5563]';
    case 'Important':        return 'from-[#FFA600] to-[#B36B00]';
    case 'Very Important':   return 'from-[#ea697c] to-[#b8455c]';
    case 'Core Values':      return 'from-[#01B1AF] to-[#018a88]';
  }
};
const getCardGradient = (category: string) =>
  CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ?? 'from-gray-500 to-gray-600';

const setTO  = (fn: () => void, ms: number): number =>
  (typeof window !== 'undefined' ? window.setTimeout(fn, ms) : (0 as unknown as number));
const clrTO  = (id?: number | null) => { if (typeof window !== 'undefined' && typeof id === 'number') window.clearTimeout(id); };

/* Save the provided columns snapshot immediately (no debounce) */
async function saveNow(userId: string, userKey: string, cols: Columns) {
  const clean = sanitize(cols);
  const payload = {
    user_id: userId,
    columns: colsToIds(clean),
    updated_at: nowISO(),
  };

  try {
    localStorage.setItem(userKey, JSON.stringify({ columns: payload.columns, updated_at: payload.updated_at }));
  } catch {}

  await supabase.from('values_board').upsert(payload, { onConflict: 'user_id' });
}

/* --------------- Component --------------- */
export default function ValuesPage() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPlusOrPremium = hasAccess('values-clarification');

  if (!isPlusOrPremium) {
    return (
      <FeatureAccessGuard featureId="values-clarification" currentPlan={currentPlan}>
        <ValuesPageContent />
      </FeatureAccessGuard>
    );
  }

  return <ValuesPageContent />;
}

function ValuesPageContent() {
  const { authState, userData } = useUser();
  const isAuthed = authState.status === 'authenticated';
  const userId   = isAuthed ? userData?.id ?? null : null;

  if (authState.status === 'initializing') {
    return <div className="p-6 text-white/80">Loading your session…</div>;
  }
  if (!isAuthed || !userId) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-semibold mb-2">Please sign in to use Values</h1>
        <p className="text-white/70 mb-4">Sign in so we can save and sync your board across devices.</p>
        <a href="/login" className="inline-block bg-[#01B1AF] hover:bg-[#019894] text-white px-4 py-2 rounded-lg">
          Sign in
        </a>
      </div>
    );
  }

  const [isMobile, setIsMobile] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [coreLimitHit, setCoreLimitHit] = useState(false);
  const [debug, setDebug] = useState(false);

  const [touchStart, setTouchStart] = useState<{x:number;y:number}|null>(null);
  const [touchEnd,   setTouchEnd]   = useState<{x:number;y:number}|null>(null);
  const [swipingCard, setSwipingCard] = useState<string|null>(null);

  const [draggedCard, setDraggedCard] = useState<Value | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<ColumnKey | ''>('');
  const [draggedFromIndex, setDraggedFromIndex] = useState<number | null>(null);
  const [activeDZ, setActiveDZ] = useState<DZ | null>(null);

  const initialColumns: Columns = useMemo(() => sanitize({
    'Available Values': ALL_VALUES,
    'Important': [], 'Very Important': [], 'Core Values': [],
  }), []);

  const [columns, setColumns] = useState<Columns>(initialColumns);
  const [loaded, setLoaded]   = useState(false);
  const saveTimer = useRef<number | null>(null);

  const userKey  = `${LOCAL_PREFIX}_${userId}`;
  const anonKey  = `${LOCAL_PREFIX}_anon`;

  /* responsive + debug */
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    check();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', check);
      setDebug(new URLSearchParams(window.location.search).get('debug') === '1');
      return () => window.removeEventListener('resize', check);
    }
  }, []);

  /* Global dragover/drop (Safari/Chrome fix) */
  useEffect(() => {
    const allowDrag = (e: DragEvent) => {
      if (draggedCard) {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'move';
        }
      }
    };

    document.addEventListener('dragover', allowDrag);
    document.addEventListener('drop', (e) => e.preventDefault());
    
    return () => {
      document.removeEventListener('dragover', allowDrag);
      document.removeEventListener('drop', (e) => e.preventDefault());
    };
  }, [draggedCard]);

  /* cleanup old key (from earlier versions) */
  useEffect(() => { try { localStorage.removeItem('values_board_v2'); } catch {} }, []);

  /* ----------- LOAD (server-first) ----------- */
  useEffect(() => {
    let cancelled = false;

    const readLocal = (key: string): PersistPayload | null => {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
    };
    const writeLocal = (key: string, payload: PersistPayload) => {
      try { localStorage.setItem(key, JSON.stringify(payload)); } catch {}
    };

    const load = async () => {
      // try server for this user
      const { data, error } = await supabase
        .from('values_board')
        .select('columns, updated_at')
        .eq('user_id', userId!)
        .maybeSingle();

      if (!cancelled && !error && data?.columns) {
        const serverCols = sanitize(idsToCols(data.columns as PersistIds));
        setColumns(serverCols);
        writeLocal(userKey, { columns: colsToIds(serverCols), updated_at: data.updated_at as string });
        try { localStorage.removeItem(anonKey); } catch {}
        setLoaded(true);
        return;
      }

      // fallback to local (per-user)
      const localUser = readLocal(userKey);
      if (!cancelled && localUser) {
        const localCols = sanitize(idsToCols(localUser.columns));
        setColumns(localCols);
        setLoaded(true);

        // create server row if missing
        const payload = { user_id: userId!, columns: colsToIds(localCols), updated_at: nowISO() };
        await supabase.from('values_board').upsert(payload, { onConflict: 'user_id' });
        writeLocal(userKey, { columns: payload.columns, updated_at: payload.updated_at });
        try { localStorage.removeItem(anonKey); } catch {}
        return;
      }

      // default: empty UI; DO NOT upsert yet (avoid writing empty arrays)
      if (!cancelled) {
        setColumns(initialColumns);
        setLoaded(true);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [userId, userKey, initialColumns, anonKey]);

  /* ----------- SAVE (debounced backup) ----------- */
  useEffect(() => {
    if (!loaded) return;

    const clean = sanitize(columns);
    const payload: PersistPayload = { columns: colsToIds(clean), updated_at: nowISO() };

    try { localStorage.setItem(userKey, JSON.stringify(payload)); } catch {}

    clrTO(saveTimer.current);
    saveTimer.current = setTO(() => {
      void supabase
        .from('values_board')
        .upsert({ user_id: userId!, columns: payload.columns, updated_at: payload.updated_at }, { onConflict: 'user_id' });
    }, 600);

    return () => { clrTO(saveTimer.current); };
  }, [columns, loaded, userId, userKey]);

  /* --------- FLUSH on hide/unload --------- */
  useEffect(() => {
    if (!loaded) return;
    const flush = () => {
      const clean = sanitize(columns);
      const p = { user_id: userId!, columns: colsToIds(clean), updated_at: nowISO() };
      void supabase.from('values_board').upsert(p, { onConflict: 'user_id' });
      try { localStorage.setItem(userKey, JSON.stringify({ columns: p.columns, updated_at: p.updated_at })); } catch {}
    };
    const onVis = () => { if (document.visibilityState === 'hidden') flush(); };
    const onUnload = () => { flush(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [loaded, columns, userId, userKey]);

  /* ---------------- Realtime ---------------- */
  useEffect(() => {
    const channel = supabase.channel(`values_board_user_${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'values_board', filter: `user_id=eq.${userId}` },
        (payload) => {
          const next = (payload.new ?? payload.record)?.columns as PersistIds | undefined;
          if (!next) return;
          const serverCols = sanitize(idsToCols(next));
          setColumns(prev => (deepEqualIds(prev, serverCols) ? prev : serverCols));
          try { localStorage.setItem(userKey, JSON.stringify({ columns: colsToIds(serverCols), updated_at: nowISO() })); } catch {}
        }
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [userId, userKey]);

  /* ----------------- Moves ----------------- */
  const moveCard = (cardId: string, toColumn: ColumnKey, insertIndex?: number) => {
    setColumns(prev => {
      const removeFromAll: Columns = {
        'Available Values': prev['Available Values'].filter(v => v.id !== cardId),
        'Important':       prev['Important'].filter(v => v.id !== cardId),
        'Very Important':  prev['Very Important'].filter(v => v.id !== cardId),
        'Core Values':     prev['Core Values'].filter(v => v.id !== cardId),
      };

      if (
        toColumn === 'Core Values' &&
        prev['Core Values'].findIndex(v => v.id === cardId) === -1 &&
        prev['Core Values'].length >= CORE_LIMIT
      ) {
        setCoreLimitHit(true);
        setTO(() => setCoreLimitHit(false), 1500);
        return prev;
      }

      const card = CATALOG[cardId];
      if (!card) return prev;

      const target = [...removeFromAll[toColumn]];
      if (typeof insertIndex === 'number') {
        target.splice(Math.max(0, Math.min(insertIndex, target.length)), 0, card);
      } else {
        target.push(card);
      }

      // compute NEXT and save immediately
      const next = sanitize({ ...removeFromAll, [toColumn]: target });
      void saveNow(userId!, userKey, next);
      return next;
    });
  };

  // Enhanced drag handlers (Safari/Chrome compatible)
  const handleDragStart = (e: React.DragEvent, card: Value, fromColumn: ColumnKey, fromIndex: number) => {
    setDraggedCard(card); 
    setDraggedFrom(fromColumn); 
    setDraggedFromIndex(fromIndex);
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.id);
    
    // Optional: set minimal drag image for Safari
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 50;
      e.dataTransfer.setDragImage(canvas, 25, 25);
    } catch {}
  };

  const handleDragEnd = () => {
    setDraggedCard(null); 
    setDraggedFrom(''); 
    setDraggedFromIndex(null);
    setActiveDZ(null);
  };

  // Enhanced drop handler with multiple fallbacks
  const handleDropAtIndex = (toColumn: ColumnKey, toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    
    let id: string | null = null;
    
    // Try multiple ways to get the card ID (Safari/Chrome compatibility)
    try {
      id = e.dataTransfer.getData('text/plain');
    } catch {}
    
    if (!id && draggedCard) {
      id = draggedCard.id;
    }
    
    if (!id) return;

    const same = draggedFrom === toColumn && draggedFromIndex !== null;
    const adjusted = same && draggedFromIndex! < toIndex ? toIndex - 1 : toIndex;
    moveCard(id, toColumn, adjusted);
    handleDragEnd();
  };

  /* --- compute next column, skipping Core when full --- */
  const getNextColumn = (current: ColumnKey): ColumnKey => {
    const order: ColumnKey[] = ['Available Values', 'Important', 'Very Important', 'Core Values'];
    let idx = (order.indexOf(current) + 1) % order.length;
    let next = order[idx];
    const coreIsFull = columns['Core Values'].length >= CORE_LIMIT;

    if (next === 'Core Values' && coreIsFull && current !== 'Core Values') {
      // Skip Core and wrap to the following column when Core is full
      idx = (idx + 1) % order.length;
      next = order[idx];
    }
    return next;
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    const t = e.touches[0]; setTouchStart({ x: t.clientX, y: t.clientY }); setSwipingCard(id);
  };
  const handleTouchMove  = (e: React.TouchEvent) => {
    if (!touchStart) return; const t = e.touches[0]; setTouchEnd({ x: t.clientX, y: t.clientY });
  };
  const handleTouchEnd   = (value: Value, currentColumn: ColumnKey) => {
    if (!touchStart || !touchEnd || !swipingCard) { setTouchStart(null); setTouchEnd(null); setSwipingCard(null); return; }
    const dx = touchEnd.x - touchStart.x; const dy = touchEnd.y - touchStart.y; const MIN = 50;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > MIN) {
      const next = getNextColumn(currentColumn);
      const coreIsFull = columns['Core Values'].length >= CORE_LIMIT;
      if (next === 'Core Values' && coreIsFull && currentColumn !== 'Core Values') {
        // just in case (shouldn't hit because getNextColumn already skips)
        setCoreLimitHit(true); setTO(() => setCoreLimitHit(false), 1500);
      } else {
        moveCard(value.id, next);
      }
    }
    setTouchStart(null); setTouchEnd(null); setSwipingCard(null);
  };

  const nudgeCore = (index: number, dir: -1 | 1) => {
    setColumns(prev => {
      const arr = [...prev['Core Values']];
      const to = Math.max(0, Math.min(arr.length - 1, index + dir));
      if (to === index) return prev;
      const [item] = arr.splice(index, 1); arr.splice(to, 0, item);
      const next = sanitize({ ...prev, ['Core Values']: arr });
      void saveNow(userId!, userKey, next);
      return next;
    });
  };

  const resetBoard = () => {
    setColumns(prev => {
      const next = initialColumns;
      void saveNow(userId!, userKey, next);
      return next;
    });
  };

  const exportValues = () => {
    const core = columns['Core Values'].map((v, i) => `${i + 1}. ${v.name}`).join('\n');
    const very = columns['Very Important'].map(v => `• ${v.name}`).join('\n');
    const imp  = columns['Important'].map(v => `• ${v.name}`).join('\n');
    const txt  = `My Personal Values

Core Values (Top Priority):
${core}

Very Important:
${very}

Important:
${imp}`;
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'my-values.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  const coreCount = columns['Core Values'].length;

  const getSwipeDirection = (_value: Value, current: ColumnKey) => {
    const order: ColumnKey[] = ['Available Values', 'Important', 'Very Important', 'Core Values'];
    const next = order[(order.indexOf(current) + 1) % order.length];
    const nextIsCore = next === 'Core Values';
    const coreHasRoom = coreCount < CORE_LIMIT || current === 'Core Values';
    const canSwipeRight = !nextIsCore || coreHasRoom;
    return { canSwipeLeft: canSwipeRight, canSwipeRight };
  };

  const getBadge = (col: ColumnKey) => {
    switch (col) {
      case 'Available Values': return { text: 'Available', classes: 'bg-gray-600/30 text-gray-100 ring-1 ring-white/10' };
      case 'Important':        return { text: 'Important', classes: 'bg-yellow-400/20 text-yellow-200 ring-1 ring-yellow-300/30' };
      case 'Very Important':   return { text: 'Very Important', classes: 'bg-orange-400/20 text-orange-200 ring-1 ring-orange-300/30' };
      case 'Core Values':      return { text: 'Core', classes: 'bg-white text-[#01B1AF] font-semibold ring-2 ring-[#01B1AF]/60 shadow-sm' };
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="w-full px-2 sm:px-3">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] pt-6 px-6 pb-2 mb-2">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Values Board</h1>
              <p className="text-base text-white/80">Organize your values by importance using our interactive board</p>
            </div>
            <button onClick={() => setShowGuide(!showGuide)} className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 transition-colors">
              <HelpCircle className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">Tips</span>
              {showGuide ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
            </button>
          </div>

          {showGuide && (
            <div className="mt-6">
              <div className="bg-white/10 rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Target className="h-6 w-6 text-white mt-1" />
                      <div>
                        <h3 className="text-lg font-medium text-white">Drag & Sort</h3>
                        <p className="text-white/80">{isMobile ? 'Swipe or drag values to categorize by importance.' : 'Drag values between columns. Drop between cards for precise placement.'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Heart className="h-6 w-6 text-white mt-1" />
                      <div>
                        <h3 className="text-lg font-medium text-white">Prioritize</h3>
                        <p className="text-white/80">Move your most important values to "Core Values" (limit of 10).</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Download className="h-6 w-6 text-white mt-1" />
                      <div>
                        <h3 className="text-lg font-medium text-white">Export</h3>
                        <p className="text-white/80">Save your organized values list to reference when making life choices.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Values in Action</h3>
                    <ul className="text-white/80 space-y-2 text-sm">
                      <li>• Use your core values to guide major decisions</li>
                      <li>• Ask which option aligns with your values</li>
                      <li>• Review and update over time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile info + limit banner */}
      {isMobile && (
        <>
          <div className="bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-2xl p-4 mb-3 md:hidden">
            <div className="flex items-center mb-3">
              <Smartphone className="h-5 w-5 text-[#01B1AF] mr-2" />
              <h2 className="text-white font-medium">Mobile Mode: Swipe to cycle</h2>
            </div>
            <div className="text-white/70 text-sm space-y-1">
              <p>• Swipe horizontally to move a value to the next level. It wraps after Core back to Available.</p>
              <p>• Core Values max is 10. If full, swipes skip Core.</p>
            </div>

            {columns['Core Values'].length >= CORE_LIMIT && (
              <div className="mt-3 rounded-lg bg-white/10 text-white px-3 py-2 text-sm text-center">
                Core Values full: {columns['Core Values'].length}/{CORE_LIMIT}. Demote one to add another.
              </div>
            )}
          </div>

          {coreLimitHit && (
            <div className="mb-4 rounded-lg bg-red-500/15 border border-red-400/30 text-red-200 px-3 py-2 text-sm text-center md:hidden" aria-live="polite">
              Core Values limit reached (10).
            </div>
          )}
        </>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={resetBoard} className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm">
          <RotateCcw className="h-4 w-4" /><span className="text-sm">Reset Board</span>
        </button>
      </div>

      {/* Layout */}
      {isMobile ? (
        <div className="space-y-6">
          {Object.entries(VALUES_DATA).map(([categoryName, values]) => {
            const Icon = CATEGORY_ICONS[categoryName as keyof typeof CATEGORY_ICONS];
            const catGrad = CATEGORY_COLORS[categoryName as keyof typeof CATEGORY_COLORS];

            return (
              <div key={categoryName} className={`bg-gradient-to-br ${catGrad} rounded-2xl p-4`}>
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 p-2 rounded-lg mr-3"><Icon className="h-5 w-5 text-white" /></div>
                  <h3 className="text-white font-semibold">{categoryName}</h3>
                </div>

                <div className="space-y-3">
                  {(values as string[]).map(valueName => {
                    const id = `${categoryName}-${valueName}`;
                    const valueObj = CATALOG[id];

                    let current: ColumnKey = 'Available Values';
                    if (columns['Core Values'].some(v => v.id === id)) current = 'Core Values';
                    else if (columns['Very Important'].some(v => v.id === id)) current = 'Very Important';
                    else if (columns['Important'].some(v => v.id === id)) current = 'Important';

                    const assigned = current !== 'Available Values';
                    const { canSwipeRight } = getSwipeDirection(valueObj, current);
                    const gradient = getColumnColor(assigned ? current : 'Available Values');
                    const badge = assigned ? getBadge(current) : { text: 'Available', classes: 'bg-white/5 text-white/60 ring-1 ring-white/10' };

                    return (
                      <div
                        key={id}
                        className={`relative bg-gradient-to-r ${gradient} rounded-lg p-4 select-none ${swipingCard === id ? 'scale-105 shadow-lg' : ''} transition-all duration-200`}
                        onTouchStart={(e) => { const t = e.touches[0]; setTouchStart({ x: t.clientX, y: t.clientY }); setSwipingCard(id); }}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={() => handleTouchEnd(valueObj, current)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm mb-1">{valueObj.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${badge.classes}`}>{badge.text}</span>
                          </div>
                          {canSwipeRight && (
                            <div className="flex items-center ml-4 text-white/80 bg-black/20 px-2 py-1 rounded-full">
                              <ChevronsLeftRight className="h-4 w-4 mr-1" />
                              <span className="text-xs">Swipe to advance</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-center mt-3 space-x-1">
                          <div className={`w-2 h-2 rounded-full ${current === 'Important' ? 'bg-yellow-300' : 'bg-white/30'}`} />
                          <div className={`w-2 h-2 rounded-full ${current === 'Very Important' ? 'bg-orange-300' : 'bg-white/30'}`} />
                          <div className={`w-2 h-2 rounded-full ${current === 'Core Values' ? 'bg-white ring-2 ring-[#01B1AF]' : 'bg-white/30'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Mobile summary */}
          <div className="bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Your Values Summary</h3>
            {(Object.entries(columns) as [ColumnKey, Value[]][])
              .filter(([name]) => name !== 'Available Values')
              .map(([name, values]) => {
                if (values.length === 0) return null;
                const gradient = getColumnColor(name);
                return (
                  <div key={name} className="mb-6 last:mb-0">
                    <div className={`bg-gradient-to-r ${gradient} rounded-lg p-3 mb-3 border-2 border-white`}>
                      <h4 className="text-white font-bold text-center">{name} ({name === 'Core Values' ? `${values.length}/${CORE_LIMIT}` : values.length})</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2 min-h-[60px]">
                      {values.map((v, i) => {
                        const Icon = CATEGORY_ICONS[v.category as keyof typeof CATEGORY_ICONS];
                        return (
                          <div
                            key={v.id}
                            className={`bg-gradient-to-r ${getCardGradient(v.category)} rounded-lg p-3 flex items-center space-x-3 ${swipingCard === v.id ? 'scale-105 shadow-lg' : ''} transition-all duration-200`}
                            onTouchStart={(e) => handleTouchStart(e, v.id)}
                            onTouchMove={(e) => handleTouchMove(e)}
                            onTouchEnd={(e) => handleTouchEnd(v, name)}
                          >
                            <div className="bg-white/20 p-1.5 rounded-lg flex-shrink-0"><Icon className="h-3 w-3 text-white" /></div>
                            <div className="flex-1">
                              <span className="text-white font-medium text-sm">{v.name}</span>
                              {name === 'Core Values' && <span className="ml-2 text-white/60 text-xs">#{i + 1}</span>}
                            </div>
                            {name === 'Core Values' && (
                              <div className="flex items-center gap-1">
                                <button aria-label="Move up" onClick={() => nudgeCore(i, -1)} className="p-1 rounded bg-black/20 hover:bg-black/30 text-white"><ArrowUp className="h-3 w-3" /></button>
                                <button aria-label="Move down" onClick={() => nudgeCore(i, 1)} className="p-1 rounded bg-black/20 hover:bg-black/30 text-white"><ArrowDown className="h-3 w-3" /></button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        // Desktop columns with minimal-gap drop zones
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {(Object.entries(columns) as [ColumnKey, Value[]][]).map(([name, cards]) => {
            const gradient = getColumnColor(name);
            const isCore = name === 'Core Values';

            const renderDropZone = (index: number) => {
              const active = activeDZ && activeDZ.toColumn === name && activeDZ.index === index;
              return (
                <div
                  key={`dz-${name}-${index}`}
                  onDragEnter={(e) => { 
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveDZ({ toColumn: name, index }); 
                  }}
                  onDragOver={(e) => { 
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer) {
                      e.dataTransfer.dropEffect = 'move';
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    let id: string | null = null;
                    try {
                      id = e.dataTransfer.getData('text/plain');
                    } catch {}
                    if (!id && draggedCard) {
                      id = draggedCard.id;
                    }
                    
                    if (!id) return;

                    const same = draggedFrom === name && draggedFromIndex !== null;
                    const adjusted = same && draggedFromIndex! < index ? index - 1 : index;
                    moveCard(id, name, adjusted);
                    handleDragEnd();
                  }}
                  className="py-2 px-1 relative"
                  style={{ 
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    pointerEvents: 'all',
                    zIndex: 20
                  }}
                >
                  <div className={`h-1 rounded transition-all duration-150 ${active ? 'bg-[#01B1AF] scale-y-200' : 'bg-white/5'}`} />
                </div>
              );
            };

            return (
              <div key={name} className="bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-2xl p-4"
                   onDragOver={(e)=>{ 
                     // Only handle if not over a drop zone
                     if (!(e.target as HTMLElement).className.includes('rounded transition-all')) {
                       e.preventDefault();
                       if (e.dataTransfer) {
                         e.dataTransfer.dropEffect = 'move';
                       }
                     }
                   }}
                   onDrop={(e)=>{ 
                     // Fallback: only if not dropped on a drop zone
                     if (!(e.target as HTMLElement).className.includes('rounded transition-all')) {
                       e.preventDefault();
                       
                       let id: string | null = null;
                       try {
                         id = e.dataTransfer.getData('text/plain');
                       } catch {}
                       if (!id && draggedCard) {
                         id = draggedCard.id;
                       }
                       
                       if (id) { 
                         moveCard(id, name); 
                         handleDragEnd(); 
                       }
                     }
                   }}>
                <div className={`bg-gradient-to-r ${gradient} rounded-xl p-4 mb-4`}>
                  <h3 className="text-white font-semibold text-center">{name}</h3>
                  <p className={`text-white/80 text-xs text-center mt-1 ${isCore && coreLimitHit ? 'text-red-300 animate-pulse' : ''}`}>
                    {isCore ? `${cards.length}/${CORE_LIMIT} values` : `${cards.length} value${cards.length !== 1 ? 's' : ''}`}
                  </p>
                  {isCore && coreLimitHit && <div className="mt-2 text-[11px] text-red-300 text-center" aria-live="polite">You've reached 10 Core Values.</div>}
                </div>

                <div className="space-y-0 min-h-[200px] relative">
                  {/* top drop zone */}
                  {renderDropZone(0)}

                  {cards.map((card, idx) => {
                    const Icon = CATEGORY_ICONS[card.category as keyof typeof CATEGORY_ICONS];
                    return (
                      <div key={card.id} className="relative">
                        <div
                          draggable
                          onDragStart={(e)=>handleDragStart(e, card, name, idx)}
                          onDragOver={(e)=>{ 
                            e.preventDefault();
                            if (e.dataTransfer) {
                              e.dataTransfer.dropEffect = 'move';
                            }
                          }}
                          onDragEnd={handleDragEnd}
                          onTouchStart={(e) => handleTouchStart(e, card.id)}
                          onTouchMove={(e) => handleTouchMove(e)}
                          onTouchEnd={(e) => handleTouchEnd(card, name)}
                          className={`relative bg-gradient-to-br ${getCardGradient(card.category)} rounded-xl p-3 cursor-move hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl ${isCore ? 'ring-2 ring-[#01B1AF]/70' : ''} ${swipingCard === card.id ? 'scale-105' : ''}`}
                          style={{ 
                            WebkitUserDrag: 'element' as any,
                            pointerEvents: 'auto',
                            zIndex: 10
                          }}
                        >
                          <div className="relative z-10 flex items-start space-x-2">
                            <div className="bg-white/20 p-1.5 rounded-lg flex-shrink-0 mt-0.5"><Icon className="h-3 w-3 text-white" /></div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-gray-100 font-medium text-sm leading-tight mb-1">{card.name}</h4>
                              <p className="text-gray-200/70 text-xs truncate">{card.category}</p>
                            </div>
                            {isCore && <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-white text-[#01B1AF] font-semibold ring-2 ring-[#01B1AF]/60">Core</span>}
                          </div>
                        </div>

                        {/* drop zone AFTER this card */}
                        {renderDropZone(idx + 1)}
                      </div>
                    );
                  })}
                </div>

                {/* empty-column hint drop area */}
                {cards.length === 0 && (
                  <div
                    onDragOver={(e)=>{ 
                      e.preventDefault(); 
                      if (e.dataTransfer) {
                        e.dataTransfer.dropEffect = 'move';
                      }
                    }}
                    onDrop={(e)=>{ 
                      e.preventDefault(); 
                      
                      let id: string | null = null;
                      try {
                        id = e.dataTransfer.getData('text/plain');
                      } catch {}
                      if (!id && draggedCard) {
                        id = draggedCard.id;
                      }
                      
                      if (id) { 
                        moveCard(id, name, 0); 
                        handleDragEnd(); 
                      }
                    }}
                    className="mt-2 rounded-lg border border-dashed border-white/20 text-white/60 text-sm text-center py-6"
                  >
                    Drag here to add
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Desktop summary */}
      {coreCount > 0 && !isMobile && (
        <div className="mt-8 bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Your Core Values Summary</h3>
          <div className="bg-[#01B1AF]/10 rounded-lg p-4 border border-[#01B1AF]/20">
            <p className="text-white/80 text-sm mb-3">
              <strong>Your top {Math.min(3, coreCount)} core values:</strong> {columns['Core Values'].slice(0,3).map(v=>v.name).join(', ')}
            </p>
            <p className="text-white/70 text-xs">These values should guide your most important decisions.</p>
          </div>
        </div>
      )}

      {/* Export */}
      <div className="mt-8 flex justify-center">
        <button onClick={exportValues} disabled={coreCount === 0}
          className="flex items-center space-x-2 bg-[#01B1AF] hover:bg-[#01B1AF]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg text-base font-medium transition-colors">
          <Download className="h-5 w-5" /><span>Export Values</span>
        </button>
      </div>

      {/* Debug overlay (?debug=1) */}
      {debug && (
        <div className="fixed bottom-2 right-2 z-50 max-w-sm text-xs p-3 rounded bg-black/80 text-white space-y-1">
          <div><b>User:</b> {userId}</div>
          <div><b>SB URL:</b> {(supabase as any).supabaseUrl ?? 'n/a'}</div>
          <div><b>Columns:</b> {JSON.stringify(colsToIds(columns))}</div>
        </div>
      )}
    </div>
  );
}
