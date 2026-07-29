// src/components/couples/LoveRadar.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';
import Button from '../ui/Button';
import { Info, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  getCoupleRadarSettings,
  updateCoupleRadarSettings,
  getIntimacyHistory,
  insertIntimacyEntry,
  deleteIntimacyEntry,
  getLatestIntimacyEntry,
  getPartnerLatestIntimacy,
  subscribeUserLatest,
  subscribePartnerLatest,
  localYYYYMMDD,
  type Score,
} from '../../lib/coupleRadarApi';

import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/** ───────────────── Visual constants ──────────────── */
const MAIN_SOLID = '#021E3C';
const AMBER = '#FFA600';
const GREEN = '#16a34a';

const PALETTE = {
  yellow:  { card: 'from-[#FFA600] to-[#B36B00]', base: '#FFA600' }, // Emotional
  green:   { card: 'from-[#B1E006] to-[#6C8300]', base: '#B1E006' }, // Mental
  violet:  { card: 'from-[#080B42] to-[#6A51A6]', base: '#6A51A6' }, // Spiritual
  ocean:   { card: 'from-[#00789f] to-[#005a77]', base: '#00789F' }, // Physical
  red:     { card: 'from-[#F27C7C] to-[#E03B3B]', base: '#E03B3B' }, // Sexual
  deepblu: { card: 'from-[#0068aa] to-[#004d7f]', base: '#0068AA' }, // Energetic
};

type Cat = {
  id: string; name: string; icon: string; cardGrad: string; baseHex: string;
};

const CATEGORIES: Cat[] = [
  { id: 'emotional', name: 'Emotional Intimacy', icon: '💞', cardGrad: PALETTE.yellow.card, baseHex: PALETTE.yellow.base },
  { id: 'mental',    name: 'Mental Intimacy',    icon: '🧠', cardGrad: PALETTE.green.card,  baseHex: PALETTE.green.base  },
  { id: 'spiritual', name: 'Spiritual Intimacy', icon: '🌿', cardGrad: PALETTE.violet.card, baseHex: PALETTE.violet.base },
  { id: 'physical',  name: 'Physical Intimacy',  icon: '🧍', cardGrad: PALETTE.ocean.card,  baseHex: PALETTE.ocean.base  },
  { id: 'sexual',    name: 'Sexual Intimacy',    icon: '🔥', cardGrad: PALETTE.red.card,    baseHex: PALETTE.red.base    },
  { id: 'energetic', name: 'Energetic Intimacy', icon: '⚡', cardGrad: PALETTE.deepblu.card,baseHex: PALETTE.deepblu.base },
];

// Render order around the radar
const CHART_ORDER: Array<Cat['id']> = ['sexual','spiritual','energetic','physical','mental','emotional'];
const ORDERED = CHART_ORDER.map(id => CATEGORIES.find(c => c.id === id)!);

/** ───────────── Utilities ───────────── */
const toScoresArray = (scores: Score[]) => ORDERED.map(c => scores.find(s => s.id === c.id)?.score ?? 0);

function LoveRadarInner() {
  const { userData } = useUser();
  const userId = userData?.id;
  const navigate = useNavigate();

  const [scores, setScores] = useState<Score[]>(ORDERED.map(c => ({ id: c.id, score: 5 })));
  const [history, setHistory] = useState<any[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  // Sharing & partner overlay
  const [shareEnabled, setShareEnabled] = useState(false);
  const [partnerLatest, setPartnerLatest] = useState<any | null>(null);

  // Compare with previous self
  const [selectedComparison, setSelectedComparison] = useState<any | null>(null);
  const [compareEnabled, setCompareEnabled] = useState(false);

  // Latest self
  const [latestSelf, setLatestSelf] = useState<any | null>(null);

  /** Load settings + histories */
  useEffect(() => {
    if (!userId) return;

    (async () => {
      // SETTINGS
      const s = await getCoupleRadarSettings(userId);
      setShareEnabled(Boolean(s?.share_enabled));

      // HISTORY (self)
      const h = await getIntimacyHistory(userId);
      setHistory(h);
      if (h.length) {
        setScores(h[0].scores);
        setLatestSelf(h[0]);
        if (h.length > 1) {
          setSelectedComparison(h[1]);
          setCompareEnabled(true);
        }
      }

      // PARTNER overlay (only if sharing is ON for both sides by RLS)
      if (s?.share_enabled) {
        const p = await getPartnerLatestIntimacy(userId);
        setPartnerLatest(p);
      } else {
        setPartnerLatest(null);
      }
    })();
  }, [userId]);

  /** Realtime: my latest */
  useEffect(() => {
    if (!userId) return;
    return subscribeUserLatest(userId, async (row) => {
      if (row) {
        setLatestSelf(row);
        setScores(row.scores);
        // refresh history quietly (top few entries)
        const h = await getIntimacyHistory(userId);
        setHistory(h);
        if (h.length > 1) setSelectedComparison(h[1]);
      }
    });
  }, [userId]);

  /** Realtime: partner latest */
  useEffect(() => {
    if (!userId) return;
    if (!shareEnabled) return; // if I turned it off, drop the overlay
    let cleanup: (() => void) | undefined;
    (async () => {
      cleanup = await subscribePartnerLatest(userId, (row) => {
        setPartnerLatest(row);
      });
    })();
    return () => { cleanup?.(); };
  }, [userId, shareEnabled]);

  /** Toggle sharing */
  const toggleSharing = async () => {
    if (!userId) return;
    const next = !shareEnabled;
    try {
      await updateCoupleRadarSettings(userId, { share_enabled: next });
      setShareEnabled(next);
      if (next) {
        const p = await getPartnerLatestIntimacy(userId);
        setPartnerLatest(p);
        toast.success('Sharing ON');
      } else {
        setPartnerLatest(null);
        toast('Sharing OFF', { icon: '🔒' });
      }
    } catch {
      toast.error('Failed to update sharing');
    }
  };

  /** Save current */
  const save = async () => {
    if (!userId) return;
    try {
      const saved = await insertIntimacyEntry(userId, scores);
      toast.success(`Saved (${localYYYYMMDD()})`);
      // refresh lists
      const h = await getIntimacyHistory(userId);
      setHistory(h);
      setLatestSelf(saved);
      if (h.length > 1) {
        setSelectedComparison(h[1]);
        setCompareEnabled(true);
      }
    } catch (e) {
      toast.error('Save failed');
      console.error(e);
    }
  };

  /** Delete an entry */
  const handleDelete = async (entryId: string) => {
    if (!userId) return;
    try {
      await deleteIntimacyEntry(userId, entryId);
      const h = await getIntimacyHistory(userId);
      setHistory(h);
      setLatestSelf(h[0] ?? null);
      setScores(h[0]?.scores ?? ORDERED.map(c => ({ id: c.id, score: 5 })));
      setSelectedComparison(h[1] ?? null);
      setCompareEnabled(Boolean(h[1]));
      toast.success('Entry deleted');
    } catch (e) {
      toast.error('Delete failed');
      console.error(e);
    }
  };

  /** Chart data */
  const currentData = toScoresArray(scores);
  const previousData = selectedComparison ? toScoresArray(selectedComparison.scores) : [];
  const partnerData  = shareEnabled && partnerLatest ? toScoresArray(partnerLatest.scores) : [];

  const chartData = useMemo(() => ({
    labels: ORDERED.map(c => c.name.toUpperCase()),
    datasets: [
      {
        label: 'Current',
        data: currentData,
        backgroundColor: 'rgba(0,0,0,0)',
        borderColor: MAIN_SOLID,
        borderWidth: 2.6,
        pointBackgroundColor: ORDERED.map(c => c.baseHex),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.25,
        fill: false,
      },
      ...(selectedComparison && compareEnabled ? [{
        label: `Previous (${selectedComparison.date})`,
        data: previousData,
        backgroundColor: 'rgba(0,0,0,0)',
        borderColor: AMBER,
        borderWidth: 2,
        borderDash: [6, 6],
        pointBackgroundColor: AMBER,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 3.5,
        pointHoverRadius: 5,
        tension: 0.25,
        fill: false,
      }] : []),
      ...(shareEnabled && partnerLatest ? [{
        label: `Partner (${partnerLatest.date})`,
        data: partnerData,
        backgroundColor: 'rgba(0,0,0,0)',
        borderColor: GREEN,
        borderWidth: 2,
        borderDash: [4, 4],
        pointBackgroundColor: GREEN,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 3.5,
        pointHoverRadius: 5,
        tension: 0.25,
        fill: false,
      }] : []),
    ],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [JSON.stringify(currentData), compareEnabled, selectedComparison?.date, shareEnabled, partnerLatest?.date]);

  const chartOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(2,30,60,0.95)',
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.92)',
        titleFont: { weight: '700', size: 13 },
        bodyFont: { size: 12 },
        padding: 10,
        displayColors: false
      }
    },
    elements: { line: { borderJoinStyle: 'round' }, point: { hitRadius: 12 } },
    scales: {
      r: {
        min: 0, max: 10,
        ticks: { display: true, stepSize: 2, showLabelBackdrop: false, color: 'rgba(2,30,60,0.45)', font: { size: 10 } },
        grid: { circular: true, color: 'rgba(2,30,60,0.12)' },
        angleLines: { color: 'rgba(2,30,60,0.10)', lineWidth: 1 },
        pointLabels: { color: MAIN_SOLID, font: { size: 12, weight: '700' }, padding: 6 }
      }
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-8">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Love Radar Check-In</h1>
            <p className="text-white/80">Rate your intimacy across six dimensions. Compare with your past—and, if sharing is on, with your partner.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowGuide(s => !s)}
              className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 transition-colors"
            >
              <Info size={16} className="text-white" />
              <span className="text-white text-sm font-medium">Tips</span>
              {showGuide ? <ChevronUp size={16} className="text-white" /> : <ChevronDown size={16} className="text-white" />}
            </button>

            <button
              onClick={toggleSharing}
              className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 transition-colors"
              title="Toggle partner sharing"
            >
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${shareEnabled ? 'bg-emerald-400' : 'bg-gray-300'}`} />
              <span className="text-white text-sm font-medium">{shareEnabled ? 'Sharing ON' : 'Share my radar'}</span>
            </button>
          </div>
        </div>

        {showGuide && (
          <div className="mt-4 bg-white/10 rounded-lg p-4 text-white/90">
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Use sliders to rate 0–10 across each dimension.</li>
              <li>Turn on <b>Sharing</b> to see your partner’s latest (green dashed line). It hides automatically when sharing is off.</li>
              <li>Use the dropdown to compare with a previous check-in (amber dashed line).</li>
            </ul>
          </div>
        )}
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => {
          const score = scores.find(s => s.id === cat.id)?.score ?? 5;
          return (
            <div key={cat.id} className={`bg-gradient-to-br ${cat.cardGrad} p-6 rounded-xl shadow-md`}>
              <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl">{cat.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-white mb-1">{cat.name}</h3>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-white mb-1">
                  <span>Rate 0–10</span>
                  <span className="font-medium">{score}/10</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={score}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setScores(prev => prev.map(s => s.id === cat.id ? { ...s, score: val } : s));
                  }}
                  className="w-full"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white" onClick={save}>
          Save & Generate Insights
        </Button>
      </div>

      {/* Chart */}
      <div className="relative mt-8 rounded-2xl p-6 bg-white border border-gray-200 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">Future Readiness Dashboard</p>
            <h2 className="text-2xl font-semibold" style={{ color: MAIN_SOLID }}>Connection Trend Analysis</h2>
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm" style={{ color: MAIN_SOLID }}>
              <input
                type="checkbox"
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                checked={compareEnabled}
                onChange={(e) => setCompareEnabled(e.target.checked)}
                disabled={!history[1]}
              />
              <span>Compare previous check-in</span>
            </label>
            <select
              className="bg-white border border-slate-300 text-sm px-3 py-2 rounded-lg disabled:opacity-50"
              onChange={(e) => {
                const val = e.target.value;
                const found = history.find(h => h.date === val);
                setSelectedComparison(found ?? null);
                setCompareEnabled(Boolean(found));
              }}
              value={selectedComparison?.date || ''}
              disabled={history.length <= 1}
              style={{ color: MAIN_SOLID }}
            >
              <option value="">Choose previous…</option>
              {history.slice(1).map((entry) => (
                <option key={entry.id ?? entry.date} value={entry.date}>
                  {entry.date}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-[460px] w-full">
          <Radar data={chartData} options={chartOptions} />
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: MAIN_SOLID }} />
            <span className="text-slate-700 text-sm">Current</span>
          </div>
          {compareEnabled && selectedComparison && (
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: AMBER }} />
              <span className="text-slate-700 text-sm">Previous ({selectedComparison.date})</span>
            </div>
          )}
          {shareEnabled && partnerLatest && (
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: GREEN }} />
              <span className="text-slate-700 text-sm">Partner ({partnerLatest.date})</span>
            </div>
          )}
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="mt-8 rounded-2xl p-6 bg-gray-100">
        <h2 className="text-2xl font-semibold mb-6" style={{ color: MAIN_SOLID }}>
          Insights & Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const score = scores.find((s) => s.id === cat.id)?.score ?? 5;
            return (
              <div
                key={cat.id}
                className={`bg-gradient-to-br ${cat.cardGrad} p-5 rounded-xl shadow-md`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <h3 className="text-white font-semibold text-base">{cat.name}</h3>
                </div>
                <div className="text-white text-sm mb-1">You scored {score}/10</div>
                <p className="text-sm text-white/90 mt-2">
                  {score >= 8
                    ? `Strong connection! Keep nurturing this area with regular practice.`
                    : score >= 5
                    ? `There's room for growth. Try adding simple rituals to strengthen this connection.`
                    : `This area needs focused attention. Start with small, consistent efforts.`}
                </p>
                <div className="mt-4 pt-3 border-t border-white/20">
                  <button
                    onClick={() => navigate(`/dashboard/intimacy-builders/${cat.id}`)}
                    className="inline-flex items-center text-white hover:text-white/80 text-sm font-medium"
                  >
                    <ArrowRight className="h-4 w-4 mr-1" />
                    View 30-Day Challenge
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Previous list */}
      <div className="mt-8 rounded-2xl p-6 bg-white border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold" style={{ color: MAIN_SOLID }}>
            Previous Check-ins
          </h2>
        </div>

        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={entry.id ?? entry.date}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium" style={{ color: MAIN_SOLID }}>
                {entry.date}
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1.5 text-sm font-medium text-teal-600 border-2 border-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
                  onClick={() => {
                    setScores(entry.scores);
                    setLatestSelf(entry);
                  }}
                >
                  View
                </button>
                {entry.id && (
                  <button
                    onClick={() => handleDelete(entry.id!)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}

          {history.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No check-ins yet. Complete your first assessment above!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Subscription-gated wrapper (unchanged) */
export default function LoveRadar() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPremium = hasAccess('love-radar');

  if (!isPremium) {
    return (
      <FeatureAccessGuard featureId="love-radar" currentPlan={currentPlan}>
        <LoveRadarInner />
      </FeatureAccessGuard>
    );
  }
  return <LoveRadarInner />;
}
