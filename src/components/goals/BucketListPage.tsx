import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, Plus, Info, ChevronDown, ChevronUp, Save, CheckCircle2,
  Calendar as CalendarIcon, X, Grip, Brain, Heart, Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';

/* ---------------- Types ---------------- */
type BucketStatus = 'not_started' | 'planning' | 'in_progress' | 'booked' | 'completed';

type BucketItem = {
  id: string;
  user_id: string;
  title: string | null;
  status: BucketStatus;
  category: string | null;
  priority: number | null;
  target_date: string | null;
  location: string | null;
  budget_estimate: number | null;
  emotional_meaning: string | null;
  description: string | null;
  completed_at?: string | null;
  color_index?: number | null;
  created_at: string;
  updated_at: string;
};

/* --------------- Constants -------------- */
const STATUS_ORDER: BucketStatus[] = ['not_started', 'planning', 'in_progress', 'booked', 'completed'];

const STATUS_META: Record<
  BucketStatus,
  { label: string; headGradient: string; countColor: string }
> = {
  not_started: {
    label: 'Not started',
    headGradient: 'from-[#e88584] to-[#8e4f63]',
    countColor: 'text-white/85',
  },
  planning: {
    label: 'Planning',
    headGradient: 'from-[#0068aa] to-[#004d7f]',
    countColor: 'text-white/85',
  },
  in_progress: {
    label: 'In progress',
    headGradient: 'from-[#FFA600] to-[#B36B00]',
    countColor: 'text-white/85',
  },
  booked: {
    label: 'Booked',
    headGradient: 'from-[#B1E006] to-[#6C8300]',
    countColor: 'text-white/85',
  },
  completed: {
    label: 'Completed',
    headGradient: 'from-[#01B1AF] to-[#018a88]',
    countColor: 'text-white/90',
  },
};

const emptyEditor = {
  id: '' as string,
  title: '',
  status: 'not_started' as BucketStatus,
  category: '',
  priority: 1,
  target_date: null as string | null,
  location: '',
  budget_estimate: null as number | null,
  emotional_meaning: '',
  description: '',
  completed_at: null as string | null,
  color_index: 0,
};

const GRADIENT_OPTIONS = [
  'from-[#e88584] to-[#8e4f63]',
  'from-[#0068aa] to-[#004d7f]',
  'from-[#FFA600] to-[#B36B00]',
  'from-[#B1E006] to-[#6C8300]',
  'from-[#F27C7C] to-[#E03B3B]',
  'from-[#080B42] to-[#6A51A6]',
  'from-[#00789f] to-[#005a77]',
  'from-[#ea697c] to-[#b8455c]',
  'from-[#008792] to-[#006a70]',
  'from-[#7b5595] to-[#5d4070]',
];

const CATEGORY_OPTIONS = [
  'Travel',
  'Adventure',
  'Personal Growth',
  'Career',
  'Health & Fitness',
  'Creative',
  'Social',
  'Learning',
  'Financial',
  'Family',
  'Other',
];

/* ---------------- Helpers ---------------- */
const fmtDate = (iso: string | null) => {
  if (!iso) return '';
  try {
    const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10));
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---------------- Component ---------------- */
export default function BucketListPage() {
  const { hasAccess, currentPlan } = useSubscription();
  const hasPlus = hasAccess('bucket-list');

  if (!hasPlus) {
    return (
      <FeatureAccessGuard featureId="bucket-list" currentPlan={currentPlan}>
        <BucketListPageContent />
      </FeatureAccessGuard>
    );
  }

  return <BucketListPageContent />;
}

function BucketListPageContent() {
  const { userData } = useUser();
  const ownerId = userData?.id ?? null;

  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showTips, setShowTips] = useState(false);

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BucketStatus>('all');

  const draggingId = useRef<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editor, setEditor] = useState(emptyEditor);
  const [saving, setSaving] = useState(false);

  /* ------------ Load ------------- */
  const loadItems = useCallback(async () => {
    if (!ownerId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('individual_bucket_items')
      .select(
        'id, user_id, title, status, category, priority, target_date, location, budget_estimate, emotional_meaning, description, completed_at, color_index, created_at, updated_at'
      )
      .eq('user_id', ownerId)
      .order('created_at', { ascending: true });

    if (!error) setItems((data ?? []) as BucketItem[]);
    setLoading(false);
  }, [ownerId]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  /* ---------- Derived ---------- */
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((it) => {
      if (statusFilter !== 'all' && it.status !== statusFilter) return false;
      if (!needle) return true;
      const hay = `${it.title ?? ''} ${it.location ?? ''} ${it.emotional_meaning ?? ''} ${it.description ?? ''}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [items, q, statusFilter]);

  const byStatus = useMemo(() => {
    const g: Record<BucketStatus, BucketItem[]> = {
      not_started: [],
      planning: [],
      in_progress: [],
      booked: [],
      completed: [],
    };
    for (const it of filtered) g[it.status].push(it);
    return g;
  }, [filtered]);

  /* ---------- Actions ---------- */
  const addItem = useCallback(async () => {
    if (!ownerId) return;
    const payload = {
      user_id: ownerId,
      title: 'New idea',
      status: 'not_started' as BucketStatus,
      category: null,
      priority: 1,
      target_date: null,
      location: null,
      budget_estimate: null,
      emotional_meaning: null,
      description: null,
      completed_at: null,
      color_index: 0,
    };
    const { data, error } = await supabase
      .from('individual_bucket_items')
      .insert([payload])
      .select(
        'id, user_id, title, status, category, priority, target_date, location, budget_estimate, emotional_meaning, description, completed_at, color_index, created_at, updated_at'
      )
      .single();
    if (error || !data) {
      console.error('Add item error:', error);
      alert(`Could not add: ${error?.message || 'Unknown error'}`);
      return;
    }
    const row = data as BucketItem;
    setItems((prev) => [...prev, row]);

    setEditor({
      id: row.id,
      title: row.title ?? '',
      status: row.status,
      category: row.category ?? '',
      priority: row.priority ?? 1,
      target_date: row.target_date,
      location: row.location ?? '',
      budget_estimate: row.budget_estimate,
      emotional_meaning: row.emotional_meaning ?? '',
      description: row.description ?? '',
      completed_at: row.completed_at ?? null,
      color_index: row.color_index ?? 0,
    });
    setDrawerOpen(true);
  }, [ownerId]);

  const openEditor = (row: BucketItem) => {
    setEditor({
      id: row.id,
      title: row.title ?? '',
      status: row.status,
      category: row.category ?? '',
      priority: row.priority ?? 1,
      target_date: row.target_date,
      location: row.location ?? '',
      budget_estimate: row.budget_estimate,
      emotional_meaning: row.emotional_meaning ?? '',
      description: row.description ?? '',
      completed_at: row.completed_at ?? null,
      color_index: row.color_index ?? 0,
    });
    setDrawerOpen(true);
  };

  const saveEditor = useCallback(async () => {
    if (!editor.id) return;
    if (!editor.title.trim()) {
      alert('Please add a title.');
      return;
    }
    const nextCompletedAt =
      editor.status === 'completed' ? (editor.completed_at || todayISO()) : null;

    setSaving(true);
    const { data, error } = await supabase
      .from('individual_bucket_items')
      .update({
        title: editor.title.trim(),
        status: editor.status,
        category: editor.category?.trim() || null,
        priority: editor.priority ?? null,
        target_date: editor.target_date,
        location: editor.location?.trim() || null,
        budget_estimate: editor.budget_estimate ?? null,
        emotional_meaning: editor.emotional_meaning?.trim() || null,
        description: editor.description?.trim() || null,
        completed_at: nextCompletedAt,
        color_index: editor.color_index ?? 0,
      } as any)
      .eq('id', editor.id)
      .select(
        'id, user_id, title, status, category, priority, target_date, location, budget_estimate, emotional_meaning, description, completed_at, color_index, created_at, updated_at'
      )
      .single();
    setSaving(false);
    if (error || !data) {
      alert('Could not save. Please try again.');
      return;
    }
    setItems((prev) => prev.map((it) => (it.id === data.id ? (data as BucketItem) : it)));
    setDrawerOpen(false);
  }, [editor]);

  const quickComplete = (row: BucketItem) => async () => {
    setItems((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'completed', completed_at: todayISO() } : r)));
    const { error, data } = await supabase
      .from('individual_bucket_items')
      .update({ status: 'completed', completed_at: todayISO() })
      .eq('id', row.id)
      .select(
        'id, user_id, title, status, category, priority, target_date, location, budget_estimate, emotional_meaning, description, completed_at, color_index, created_at, updated_at'
      )
      .single();
    if (error) {
      setItems((prev) => prev.map((r) => (r.id === row.id ? row : r)));
      alert('Could not mark completed. Please try again.');
      return;
    }
    if (data) {
      setItems((prev) => prev.map((r) => (r.id === row.id ? (data as BucketItem) : r)));
    }
  };

  const deleteItem = async () => {
    if (!editor.id) return;
    if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) return;

    setSaving(true);
    const { error } = await supabase
      .from('individual_bucket_items')
      .delete()
      .eq('id', editor.id)
      .eq('user_id', userData?.id || '');

    setSaving(false);
    if (error) {
      alert('Failed to delete. Please try again.');
      return;
    }

    setItems((prev) => prev.filter((r) => r.id !== editor.id));
    setDrawerOpen(false);
  };

  /* ------- Drag & Drop ------- */
  const onDragStart = (id: string) => (e: React.DragEvent) => {
    draggingId.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onDropToStatus = (toStatus: BucketStatus) => async (e: React.DragEvent) => {
    e.preventDefault();
    const id = draggingId.current;
    draggingId.current = null;
    if (!id) return;
    const row = items.find((r) => r.id === id);
    if (!row || row.status === toStatus) return;
    const optimistic = {
      ...row,
      status: toStatus,
      completed_at: toStatus === 'completed' ? todayISO() : null,
    };
    setItems((prev) => prev.map((r) => (r.id === id ? optimistic : r)));
    const { error, data } = await supabase
      .from('individual_bucket_items')
      .update({
        status: toStatus,
        completed_at: toStatus === 'completed' ? todayISO() : null,
      } as any)
      .eq('id', id)
      .select(
        'id, user_id, title, status, category, priority, target_date, location, budget_estimate, emotional_meaning, description, completed_at, color_index, created_at, updated_at'
      )
      .single();
    if (error) {
      setItems((prev) => prev.map((r) => (r.id === id ? row : r)));
      alert('Could not move item. Please try again.');
    } else if (data) {
      setItems((prev) => prev.map((r) => (r.id === id ? (data as BucketItem) : r)));
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="w-full">
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Bucket List</h1>
            <p className="text-base text-white/80">Dreams & experiences to create</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTips((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/15 text-white"
            >
              <Info className="h-4 w-4" />
              <span>Tips</span>
              {showTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {showTips && (
          <div className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] rounded-lg p-4 md:p-6 text-white text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-5">
                <div className="flex items-start space-x-3">
                  <Brain className="h-6 w-6 text-white mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-white">Start simple, refine later</h3>
                    <p className="text-white/80">
                      Add a quick title first (e.g., "Japan"). Drag it to a column that matches its stage. Fill in details when you're ready.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Heart className="h-6 w-6 text-white mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-white">Capture your why</h3>
                    <p className="text-white/80">
                      Use "Emotional meaning" to capture why this matters—connection, adventure, celebration. This keeps motivation high.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Sparkles className="h-6 w-6 text-white mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-white">Move ideas forward</h3>
                    <p className="text-white/80">
                      Track progress by moving items from <b>Not started → Planning → In progress → Booked → Completed</b>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
                <ul className="text-white/80 space-y-2">
                  <li>• Add a title, then <b>drag</b> it into a column</li>
                  <li>• Click a card to edit category, date, budget, and meaning</li>
                  <li>• Use priority (1–5) to sort what matters most right now</li>
                  <li>• Press <b>Cmd/Ctrl + S</b> in the editor to save quickly</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, location, or meaning…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]/40"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="w-full md:w-48 rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]/40"
        >
          <option value="all">All statuses</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
        <button
          onClick={() => void addItem()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#01B1AF] hover:bg-[#019894] text-white px-4 py-2"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-400">
          Loading…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {STATUS_ORDER.map((s) => {
            const meta = STATUS_META[s];
            const list = byStatus[s] ?? [];
            return (
              <div
                key={s}
                className="bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-2xl p-4 min-h-[800px] flex flex-col"
                onDragOver={onDragOver}
                onDrop={onDropToStatus(s)}
              >
                <div className={`bg-gradient-to-r ${meta.headGradient} rounded-xl p-4 mb-4 border-2 border-white`}>
                  <h3 className="text-white font-semibold text-center">{meta.label}</h3>
                  <p className={`text-xs text-center mt-1 ${meta.countColor}`}>
                    {list.length} item{list.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="space-y-3 flex-1">
                  {list.length === 0 ? (
                    <div className="text-xs text-white/70 px-1 py-2">No items</div>
                  ) : (
                    list.map((it) => (
                      <div
                        key={it.id}
                        draggable
                        onDragStart={onDragStart(it.id)}
                        className={`relative rounded-xl p-3 ring-2 ring-white/20 transition cursor-grab active:cursor-grabbing bg-gradient-to-br ${GRADIENT_OPTIONS[it.color_index ?? 0]}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5 text-white/60">
                            <Grip className="h-4 w-4" />
                          </div>

                          <button
                            onClick={() => openEditor(it)}
                            className="text-left flex-1 min-w-0"
                            title="Click to edit"
                          >
                            <div className="text-[13px] font-medium text-white break-words line-clamp-2">
                              {it.title || 'Untitled'}
                            </div>
                            <div className="mt-1 text-[11px] text-white/85 space-y-1">
                              {it.location && <div className="break-words line-clamp-1">{it.location}</div>}
                              <div className="flex flex-wrap items-center gap-1">
                                {it.target_date && (
                                  <span className="px-1.5 py-0.5 rounded bg-black/25 whitespace-nowrap">{fmtDate(it.target_date)}</span>
                                )}
                                {typeof it.priority === 'number' && (
                                  <span className="px-1.5 py-0.5 rounded bg-black/25 whitespace-nowrap">Priority {it.priority}</span>
                                )}
                                {it.status === 'completed' && it.completed_at && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-100 whitespace-nowrap">Done {fmtDate(it.completed_at)}</span>
                                )}
                              </div>
                            </div>
                          </button>

                          {it.status !== 'completed' && (
                            <button
                              onClick={quickComplete(it)}
                              className="ml-1 shrink-0 p-1 rounded hover:bg-black/20 text-emerald-200"
                              title="Mark completed"
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-gradient-to-br from-[#01B1AF] to-[#018a88] rounded-2xl shadow-2xl flex flex-col my-8">
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/20 shrink-0">
              <div className="font-semibold text-white text-lg">{editor.id ? 'Edit Item' : 'New Item'}</div>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm text-white font-medium mb-1">Title</label>
                <input
                  value={editor.title}
                  onChange={(e) => setEditor((x) => ({ ...x, title: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]/40"
                  placeholder="e.g., Japan trip"
                />
              </div>

              <div>
                <label className="block text-sm text-white font-medium mb-2">Card Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {GRADIENT_OPTIONS.map((grad, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditor((x) => ({ ...x, color_index: idx }))}
                      className={`h-12 rounded-lg bg-gradient-to-br ${grad} transition-all ${
                        editor.color_index === idx
                          ? 'ring-4 ring-white scale-105'
                          : 'ring-2 ring-white/30 hover:ring-white/60'
                      }`}
                      title={`Color ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white font-medium mb-1">Category</label>
                  <select
                    value={editor.category}
                    onChange={(e) => setEditor((x) => ({ ...x, category: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]/40"
                  >
                    <option value="">Select a category</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white font-medium mb-1">Priority (1–5)</label>
                  <select
                    value={editor.priority}
                    onChange={(e) => setEditor((x) => ({ ...x, priority: Number(e.target.value) || 1 }))}
                    className="w-full rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]/40"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white font-medium mb-1">Status</label>
                  <select
                    value={editor.status}
                    onChange={(e) => setEditor((x) => ({ ...x, status: e.target.value as BucketStatus }))}
                    className="w-full rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]/40"
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_META[s].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white font-medium mb-1">Target date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      type="date"
                      value={editor.target_date ?? ''}
                      onChange={(e) => setEditor((x) => ({ ...x, target_date: e.target.value || null }))}
                      className="w-full rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2 pr-9 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]/40"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white font-medium mb-1">Location</label>
                  <input
                    value={editor.location}
                    onChange={(e) => setEditor((x) => ({ ...x, location: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]/40"
                    placeholder="e.g., Japan"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white font-medium mb-1">Budget (est.)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={editor.budget_estimate ?? ''}
                    onChange={(e) =>
                      setEditor((x) => ({
                        ...x,
                        budget_estimate: e.target.value === '' ? null : Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]/40"
                    placeholder="e.g., 3000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white font-medium mb-1">Emotional meaning</label>
                <input
                  value={editor.emotional_meaning}
                  onChange={(e) => setEditor((x) => ({ ...x, emotional_meaning: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]/40"
                  placeholder="Adventure, reconnection, freedom…"
                />
              </div>

              <div>
                <label className="block text-sm text-white font-medium mb-1">Description</label>
                <textarea
                  value={editor.description}
                  onChange={(e) => setEditor((x) => ({ ...x, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]/40 resize-none"
                  placeholder="Details, steps, notes…"
                />
              </div>

              {editor.status === 'completed' && (
                <div>
                  <label className="block text-sm text-white font-medium mb-1">Completed on</label>
                  <input
                    type="date"
                    value={editor.completed_at ?? todayISO()}
                    onChange={(e) => setEditor((x) => ({ ...x, completed_at: e.target.value || todayISO() }))}
                    className="w-full rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]/40"
                  />
                </div>
              )}
            </div>

            <div className="mt-auto px-6 py-3 border-t border-white/20 flex items-center justify-between gap-3 shrink-0">
              {editor.id ? (
                <button
                  onClick={() => void deleteItem()}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500/90 hover:bg-red-600 px-4 py-2 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Delete
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={() => void saveEditor()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-white hover:bg-white/90 px-4 py-2 text-[#01B1AF] text-sm font-medium disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
