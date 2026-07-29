import { useEffect, useMemo, useState } from 'react';
import {
  addMonths, addQuarters, addWeeks,
  eachDayOfInterval,
  endOfMonth, endOfQuarter, endOfWeek, endOfYear,
  format,
  startOfMonth, startOfQuarter, startOfWeek, startOfYear,
} from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useUser } from '../../context/UserContext';
import { listHabits, listHabitLogs } from '../../lib/habitsApi';

type RangeKey = 'week' | 'month' | 'quarter' | 'year' | 'all';

type MergedHabitGroup = {
  key: string;   // normalized name
  name: string;  // display name
  color: string; // solid color
  ids: string[]; // all habit IDs with this name
};

function normalizeName(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Extract solid hex color from gradient string or return hex directly
function extractSolidColor(gradient: string): string {
  const toMatch = gradient.match(/to-\[#([0-9a-fA-F]{6})\]/);
  if (toMatch) return `#${toMatch[1]}`;
  const fromMatch = gradient.match(/from-\[#([0-9a-fA-F]{6})\]/);
  if (fromMatch) return `#${fromMatch[1]}`;
  if (gradient.match(/^#[0-9a-fA-F]{6}$/)) return gradient;
  return '#01B1AF';
}

function buildMergedHabitGroups(habits: { id: string; name: string; color: string }[]): MergedHabitGroup[] {
  const map = new Map<string, MergedHabitGroup>();
  for (const h of habits) {
    const key = normalizeName(h.name);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { key, name: h.name, color: extractSolidColor((h as any).color || '#01B1AF'), ids: [h.id] });
    } else {
      existing.ids.push(h.id);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

// Trim trailing rows where every series is 0
function trimTrailingEmptyRows(rows: any[], keys: string[]) {
  let lastIdx = rows.length - 1;
  while (lastIdx >= 0) {
    const r = rows[lastIdx];
    const anyNonZero = keys.some(k => (r[k] ?? 0) !== 0);
    if (anyNonZero) break;
    lastIdx--;
  }
  return rows.slice(0, lastIdx + 1);
}

export default function HabitTrendsCard({ className = '', title = 'Trends' }: { className?: string; title?: string }) {
  const { userData } = useUser();
  const ownerId = userData?.id;

  const [rangeKey, setRangeKey] = useState<RangeKey>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [filterKeys, setFilterKeys] = useState<string[]>([]);

  const [types, setTypes] = useState<{ id: string; name: string; color: string }[]>([]);
  const [mergedGroups, setMergedGroups] = useState<MergedHabitGroup[]>([]);
  const [logs, setLogs] = useState<{ habit_id: string; log_date: string; completed: boolean }[]>([]);
  const [loading, setLoading] = useState(false);

  // mobile filter drawer
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Load habits
  useEffect(() => {
    if (!ownerId) return;
    (async () => {
      setLoading(true);
      try {
        const hs = await listHabits(ownerId);
        const habitTypes = hs.map(h => ({ id: h.id, name: h.name, color: (h as any).color || '#01B1AF' }));
        setTypes(habitTypes);
        setMergedGroups(buildMergedHabitGroups(habitTypes));
      } finally {
        setLoading(false);
      }
    })();
  }, [ownerId]);

  // Range helpers
  const range = useMemo(() => {
    switch (rangeKey) {
      case 'week':
        return { start: startOfWeek(currentDate, { weekStartsOn: 0 }), end: endOfWeek(currentDate, { weekStartsOn: 0 }) };
      case 'month':
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
      case 'quarter':
        return { start: startOfQuarter(currentDate), end: endOfQuarter(currentDate) };
      case 'year':
        return { start: startOfYear(currentDate), end: endOfYear(currentDate) };
      case 'all': {
        const today = new Date();
        return { start: new Date(today.getFullYear() - 2, 0, 1), end: endOfYear(today) };
      }
    }
  }, [currentDate, rangeKey]);

  const goPrev = () => {
    if (rangeKey === 'week') setCurrentDate(d => addWeeks(d, -1));
    else if (rangeKey === 'month') setCurrentDate(d => addMonths(d, -1));
    else if (rangeKey === 'quarter') setCurrentDate(d => addQuarters(d, -1));
    else if (rangeKey === 'year') setCurrentDate(d => new Date(d.getFullYear() - 1, d.getMonth(), d.getDate()));
  };
  const goNext = () => {
    if (rangeKey === 'week') setCurrentDate(d => addWeeks(d, 1));
    else if (rangeKey === 'month') setCurrentDate(d => addMonths(d, 1));
    else if (rangeKey === 'quarter') setCurrentDate(d => addQuarters(d, 1));
    else if (rangeKey === 'year') setCurrentDate(d => new Date(d.getFullYear() + 1, d.getMonth(), d.getDate()));
  };

  // Load logs for range
  useEffect(() => {
    if (!ownerId || types.length === 0) return;
    (async () => {
      setLoading(true);
      try {
        const startISO = format(range.start, 'yyyy-MM-dd');
        const endISO = format(range.end, 'yyyy-MM-dd');
        const all: { habit_id: string; log_date: string; completed: boolean }[] = [];
        for (const t of types) {
          const logs = await listHabitLogs(t.id, startISO, endISO);
          logs.forEach(l => all.push({ habit_id: t.id, log_date: l.log_date, completed: !!l.completed }));
        }
        setLogs(all);
      } finally {
        setLoading(false);
      }
    })();
  }, [ownerId, range.start, range.end, types]);

  // Build periods & chart rows
  const { chartData, seriesDefs } = useMemo(() => {
    const today = new Date();
    type Period = { label: string; start: Date; end: Date; isFuture: boolean };
    let periods: Period[] = [];

    if (rangeKey === 'week') {
      const days = eachDayOfInterval({ start: range.start, end: range.end });
      periods = days.map(d => ({ label: format(d, 'EEE'), start: d, end: d, isFuture: d > today }));
    } else if (rangeKey === 'month') {
      let current = startOfWeek(range.start, { weekStartsOn: 0 });
      let idx = 1;
      while (current <= range.end) {
        const wEnd = endOfWeek(current, { weekStartsOn: 0 });
        const end = wEnd > range.end ? range.end : wEnd;
        const isFuture = current > today;
        periods.push({ label: `Week ${idx}`, start: current, end, isFuture });
        current = addWeeks(current, 1);
        idx++;
      }
    } else if (rangeKey === 'quarter') {
      let m = startOfMonth(range.start);
      while (m <= range.end) {
        const mEnd = endOfMonth(m);
        periods.push({ label: format(m, 'MMM'), start: m, end: mEnd > range.end ? range.end : mEnd, isFuture: m > today });
        m = addMonths(m, 1);
      }
    } else if (rangeKey === 'year') {
      for (let q = 0; q < 4; q++) {
        const qStart = startOfQuarter(addQuarters(startOfYear(range.start), q));
        const qEnd = endOfQuarter(qStart);
        if (qStart <= range.end) periods.push({ label: `Q${q + 1}`, start: qStart, end: qEnd > range.end ? range.end : qEnd, isFuture: qStart > today });
      }
    } else {
      let y = startOfYear(range.start);
      while (y <= range.end) {
        const yEnd = endOfYear(y);
        periods.push({ label: format(y, 'yyyy'), start: y, end: yEnd > range.end ? range.end : yEnd, isFuture: y > today });
        y = new Date(y.getFullYear() + 1, 0, 1);
      }
    }

    // 1) remove future buckets entirely
    const periodsNow = periods.filter(p => !p.isFuture);

    // 2) pick active groups (merged by normalized name)
    const activeGroups = filterKeys.length > 0
      ? mergedGroups.filter(g => filterKeys.includes(g.key))
      : mergedGroups;

    const seriesMap = new Map<string, { name: string; color: string; values: number[] }>();
    activeGroups.forEach(g => seriesMap.set(g.key, { name: g.name, color: g.color, values: periodsNow.map(() => 0) }));

    // Aggregate across merged groups
    logs.forEach(l => {
      if (!l.completed) return;
      const group = mergedGroups.find(g => g.ids.includes(l.habit_id));
      if (!group) return;
      const idx = periodsNow.findIndex(p => {
        const d = new Date(l.log_date + 'T00:00:00');
        return d >= p.start && d <= p.end;
      });
      if (idx >= 0) {
        const s = seriesMap.get(group.key);
        if (s) s.values[idx] += 1;
      }
    });

    let rows = periodsNow.map((p, i) => {
      const row: Record<string, any> = { period: p.label };
      seriesMap.forEach(s => { row[s.name] = s.values[i] ?? 0; });
      return row;
    });

    const defs = Array.from(seriesMap.values()).map(s => ({ key: s.name, color: s.color }));

    // 3) trim trailing all-zero buckets (prevents “all-zero last bucket” dip)
    const dataKeys = defs.map(d => d.key);
    rows = trimTrailingEmptyRows(rows, dataKeys);

    return { chartData: rows, seriesDefs: defs };
  }, [filterKeys, logs, range.end, range.start, rangeKey, mergedGroups]);

  function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: '12px 14px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          minWidth: 260, maxWidth: 320,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8, color: '#111827' }}>{label}</div>
        <div style={{ display: 'grid', gap: 6 }}>
          {payload.sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0)).map((entry: any) => (
            <div key={entry.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ color: entry.color, fontWeight: 600 }}>{entry.name}</span>
              <span style={{ color: '#111827', fontWeight: 600 }}>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md ${className}`}>
      <div className="bg-gradient-to-br from-[#22c55e] to-[#16a34a] p-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>

      <div className="p-4">
        {/* Top controls */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2">
            {(['week', 'month', 'quarter', 'year', 'all'] as RangeKey[]).map(k => (
              <button
                key={k}
                onClick={() => setRangeKey(k)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  rangeKey === k ? 'bg-[#01B1AF] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {k[0].toUpperCase() + k.slice(1)}
              </button>
            ))}
            <div className="flex items-center gap-1 ml-2">
              <button onClick={goPrev} className="px-2 py-1 text-xs rounded bg-white border border-gray-200 hover:bg-gray-50 text-[#22c55e] hover:text-[#16a34a] font-bold">‹</button>
              <button onClick={goNext} className="px-2 py-1 text-xs rounded bg-white border border-gray-200 hover:bg-gray-50 text-[#22c55e] hover:text-[#16a34a] font-bold">›</button>
            </div>
          </div>

          {/* Mobile: open filters */}
          <button
            className="md:hidden px-2 py-1 text-xs rounded bg-white border border-gray-200 text-gray-700"
            onClick={() => setFiltersOpen(true)}
            aria-label="Open filters"
          >
            Filters
          </button>
        </div>

        {/* Filters – desktop inline */}
        <div className="mb-3 hidden md:block">
          <div className="text-sm font-medium text-gray-700 mb-2">Filter lines:</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterKeys([])}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filterKeys.length === 0 ? 'bg-[#01B1AF] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Habits
            </button>
            {mergedGroups.map(g => {
              const active = filterKeys.includes(g.key);
              return (
                <button
                  key={g.key}
                  onClick={() => setFilterKeys(prev => active ? prev.filter(k => k !== g.key) : [...prev, g.key])}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    active ? 'text-white border-transparent' : 'text-gray-800 hover:bg-gray-50'
                  }`}
                  style={{ backgroundColor: active ? g.color : '#fff', borderColor: active ? 'transparent' : g.color }}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: active ? 'rgba(255,255,255,0.85)' : g.color }} />
                    {g.name}
                    {g.ids.length > 1 && <span className="text-[10px] opacity-75">({g.ids.length})</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters – mobile drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 shadow-xl max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-900">Filter lines</div>
                <button
                  className="px-2 py-1 text-xs rounded bg-gray-100 border border-gray-200"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                >
                  Close ✕
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterKeys([])}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filterKeys.length === 0 ? 'bg-[#01B1AF] text-white' : 'bg-white border border-gray-200 text-gray-700'
                  }`}
                >
                  All Habits
                </button>
                {mergedGroups.map(g => {
                  const active = filterKeys.includes(g.key);
                  return (
                    <button
                      key={g.key}
                      onClick={() => setFilterKeys(prev => active ? prev.filter(k => k !== g.key) : [...prev, g.key])}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        active ? 'text-white border-transparent' : 'text-gray-800'
                      }`}
                      style={{ backgroundColor: active ? g.color : '#fff', borderColor: active ? 'transparent' : g.color }}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: active ? 'rgba(255,255,255,0.85)' : g.color }} />
                        {g.name}
                        {g.ids.length > 1 && <span className="text-[10px] opacity-75">({g.ids.length})</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 overflow-visible">
          <div className="h-80 md:h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">Loading…</div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="text-sm font-medium">Not enough data yet</div>
                  <div className="text-xs text-gray-400 mt-2">Add some habits to see trends here.</div>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ display: 'none' }} content={() => null} className="hidden md:block" />
                  {seriesDefs.map(s => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      stroke={s.color}
                      strokeWidth={2.5}
                      dot={{ fill: s.color, strokeWidth: 2, r: 3.5 }}
                      activeDot={{ r: 6, stroke: s.color, strokeWidth: 2 }}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Mobile legend */}
          <div className="mt-3 md:hidden">
            <div className="text-xs text-gray-600 mb-2">Tap a line to see details</div>
            <div className="flex flex-wrap gap-2">
              {seriesDefs.map(s => (
                <div key={s.key} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-700">{s.key}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
