// src/components/life-balance/LifeBalanceWheel.tsx
import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { supabase } from '../../lib/supabase';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';
import { Bell, Trash2, CalendarIcon, Link as LinkIcon, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../ui/Button';
import { Radar } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
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

/* =================== Palette & Helpers =================== */
const MAIN_SOLID = '#021E3C';
const AMBER      = '#FFA600';

const hexToRGBA = (hex: string, a = 1) => {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const v = parseInt(n, 16);
  const r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
  return `rgba(${r},${g},${b},${a})`;
};
const blendHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.replace('#',''),16), pb = parseInt(b.replace('#',''),16);
  const ar=(pa>>16)&255, ag=(pa>>8)&255, ab=pa&255;
  const br=(pb>>16)&255, bg=(pb>>8)&255, bb=pb&255;
  const r=Math.round(ar+(br-ar)*t), g=Math.round(ag+(bg-ag)*t), b2=Math.round(ab+(bb-ab)*t);
  return `#${[r,g,b2].map(x=>x.toString(16).padStart(2,'0')).join('')}`;
};

/** Gradients from your list + base color for each axis/point */
const CATEGORIES = [
  { id: 'health',        name: 'Physical Health',       icon: '🏃', cardGrad: 'from-[#0068aa] to-[#004d7f]', baseHex: '#0068AA' }, // blue
  { id: 'career',        name: 'Career & Work',         icon: '💼', cardGrad: 'from-[#008792] to-[#006a70]', baseHex: '#008792' }, // teal
  { id: 'relationships', name: 'Relationships',         icon: '❤️', cardGrad: 'from-[#ea697c] to-[#b8455c]', baseHex: '#EA697C' }, // pink
  { id: 'growth',        name: 'Personal Growth',       icon: '🌱', cardGrad: 'from-[#e88584] to-[#8e4f63]', baseHex: '#E88584' }, // rose (wrap)
  { id: 'finance',       name: 'Financial Wellbeing',   icon: '💰', cardGrad: 'from-[#7b5595] to-[#5d4070]', baseHex: '#7B5595' }, // purple
  { id: 'recreation',    name: 'Recreation & Fun',      icon: '🎉', cardGrad: 'from-[#F27C7C] to-[#E03B3B]', baseHex: '#F27C7C' }, // red
  { id: 'environment',   name: 'Environment',           icon: '🌿', cardGrad: 'from-[#B1E006] to-[#6C8300]', baseHex: '#B1E006' }, // green
  { id: 'spirituality',  name: 'Spirituality',          icon: '✨', cardGrad: 'from-[#FFA600] to-[#B36B00]', baseHex: '#FFA600' }, // yellow
] as const;

/** Clockwise rainbow: Red → Pink → Purple → Blue → Teal → Green → Yellow → Rose */
const CHART_ORDER: Array<typeof CATEGORIES[number]['id']> = [
  'recreation',    // red
  'relationships', // pink
  'finance',       // purple
  'health',        // blue
  'career',        // teal
  'environment',   // green  ← this axis must be GREEN
  'spirituality',  // yellow
  'growth',        // rose (wrap)
];
const ORDERED = CHART_ORDER.map(id => CATEGORIES.find(c => c.id === id)!);

const smoothRadialFill = {
  id: 'lb_smoothRadialFill',
  beforeDatasetsDraw(chart: any) {
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;
    const scale = chart.scales.r;
    if (!scale) return;

    const { ctx } = chart;
    const cx = scale.xCenter, cy = scale.yCenter, n = ORDERED.length, R = scale.drawingArea;
    const pts = meta.data.map((pt: any) => pt.getProps(['x','y'], true));

    ctx.save();
    ctx.beginPath();
    pts.forEach((p: any, i: number) => (i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y)));
    ctx.closePath();
    ctx.clip();

    if (typeof (ctx as any).createConicGradient === 'function') {
      const startAngle = -Math.PI/2;
      const conic = (ctx as any).createConicGradient(startAngle, cx, cy);

      for (let i=0; i<n; i++){
        const offset = i / n;
        const nextOffset = (i + 1) / n;
        const midOffset = (offset + nextOffset) / 2;

        const color = ORDERED[i].baseHex;
        const nextColor = ORDERED[(i+1)%n].baseHex;
        const midColor = blendHex(color, nextColor, 0.5);

        conic.addColorStop(offset, hexToRGBA(color, 1));
        conic.addColorStop(midOffset, hexToRGBA(midColor, 1));
      }
      conic.addColorStop(1, hexToRGBA(ORDERED[0].baseHex, 1));

      ctx.fillStyle = conic;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'destination-in';
      const radialMask = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      radialMask.addColorStop(0, 'rgba(0,0,0,0)');
      radialMask.addColorStop(0.3, 'rgba(0,0,0,0.2)');
      radialMask.addColorStop(0.7, 'rgba(0,0,0,0.5)');
      radialMask.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = radialMask;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
};

// Outline glow
const outlineGlow = {
  id: 'lb_outlineGlow',
  afterDatasetsDraw(chart: any) {
    const { ctx } = chart;
    chart.data.datasets.forEach((_: any, i: number) => {
      const meta = chart.getDatasetMeta(i);
      if (!meta?.dataset) return;
      ctx.save();
      ctx.shadowColor = i === 0 ? 'rgba(2,30,60,0.22)' : 'rgba(255,165,0,0.25)';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2;
      ctx.strokeStyle = i === 0 ? MAIN_SOLID : 'rgba(255,165,0,0.9)';
      ctx.beginPath();
      // @ts-ignore
      meta.dataset._children?.forEach((pt: any, idx: number) => {
        const { x, y } = pt.getProps(['x','y'], true);
        if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });
  }
};

ChartJS.register(smoothRadialFill as any, outlineGlow as any);

/* =================== Component =================== */
export default function LifeBalanceWheel() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPlusOrPremium = hasAccess('life-balance');

  if (!isPlusOrPremium) {
    return (
      <FeatureAccessGuard featureId="life-balance" currentPlan={currentPlan}>
        <LifeBalanceWheelContent />
      </FeatureAccessGuard>
    );
  }
  return <LifeBalanceWheelContent />;
}

function LifeBalanceWheelContent() {
  const { userData } = useUser();
  const [scores, setScores] = useState(CATEGORIES.map(c => ({ id: c.id, score: 5 })));
  const [history, setHistory] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<boolean | null>(null);
  const [selectedComparison, setSelectedComparison] = useState<any | null>(null);
  const [compareEnabled, setCompareEnabled] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
    const st: any = location.state;
    if (st?.showResults && st?.scores) {
      setShowResults(true);
      setScores(st.scores);
    }
  }, [userData?.id, location.state]);

  const loadHistory = async () => {
    if (!userData?.id) return;
    try {
      const { data, error } = await supabase
        .from('life_balance_history')
        .select('*')
        .eq('user_id', userData.id)
        .order('date', { ascending: false });

      if (error) throw error;

      setHistory(data || []);
      if (data?.length > 0) {
        setShowResults(true);
        setScores(data[0].scores);
      }
      if (data?.length > 1) { setSelectedComparison(data[1]); setCompareEnabled(true); }

      const last = data?.[0]?.date;
      if (last) setLastPrompt(new Date().getTime() - new Date(last).getTime() > 90 * 86400000);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load balance history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this check-in?')) return;
    try {
      const { error } = await supabase
        .from('life_balance_history')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userData.id);
      if (error) throw error;

      const updated = history.filter(entry => entry.id !== entryId);
      setHistory(updated);
      setSelectedComparison(updated.length > 1 ? updated[1] : null);
      setCompareEnabled(updated.length > 1);
      toast.success('Entry deleted');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Delete failed');
    }
  };

  const saveCurrentScores = async () => {
    if (!userData?.id) return;
    const entry = { user_id: userData.id, date: new Date().toISOString().split('T')[0], scores };
    await supabase.from('life_balance_history').insert([entry]);
    const updatedHistory = [entry, ...history];
    setHistory(updatedHistory);
    setSelectedComparison(updatedHistory[1] || null);
    setCompareEnabled(!!updatedHistory[1]);
    setShowResults(true);
  };

  const getInsightText = (name: string, score: number) => {
    const base = `You scored ${score}/10 in ${name}.`;
    if (score < 4) return `${base} This area may need focused attention. Pick one micro-action to try this week.`;
    if (score < 7) return `${base} There’s room for growth. Add a simple weekly habit to support this area.`;
    return `${base} Solid! Keep a small ritual to maintain your momentum.`;
  };

  /* --------- Chart data (ORDERED) ---------- */
  const currentData = ORDERED.map(c => scores.find(s => s.id === c.id)?.score || 0);
  const compareData = selectedComparison
    ? ORDERED.map(c => selectedComparison.scores.find((s: any) => s.id === c.id)?.score || 0)
    : [];

  const chartData = {
    labels: ORDERED.map(c => c.name.toUpperCase()),
    datasets: [
      {
        label: 'Current',
        data: currentData,
        backgroundColor: 'rgba(0,0,0,0)', // fill via plugin
        borderColor: MAIN_SOLID,
        borderWidth: 2.4,
        pointBackgroundColor: ORDERED.map(c => c.baseHex),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.25,
        fill: false,
      },
      ...(compareEnabled && selectedComparison ? [{
        label: `Compared (${new Date(selectedComparison.date).toLocaleDateString()})`,
        data: compareData,
        backgroundColor: 'rgba(0,0,0,0)',
        borderColor: AMBER,
        borderWidth: 2,
        borderDash: [6,6],
        pointBackgroundColor: AMBER,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.25,
        fill: false,
      }] : [])
    ]
  };

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
        grid: {
          circular: true,
          color: (ctx: any) => ((ctx.index ?? 0) === 5 ? 'rgba(2,30,60,0.22)' : 'rgba(2,30,60,0.10)'),
          lineWidth: (ctx: any) => ((ctx.index ?? 0) === 5 ? 1.4 : 1),
        },
        angleLines: { color: 'rgba(2,30,60,0.10)', lineWidth: 1 },
        pointLabels: { color: MAIN_SOLID, font: { size: 12, weight: '700' }, padding: 6 }
      }
    },
  };

  // Shared color for selects/options (Chrome/Safari/iOS dark mode safe)
  const selectTextColor = '#0f172a'; // slate-900

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-8">
      {/* Header + Tips toggle */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Life Balance Check-In</h1>
              <p className="text-base text-white/80">
                Rate each area from 1–10 based on how supported you feel right now. Save to see your wheel and insights.
              </p>
            </div>
            <button
              onClick={() => setShowGuide(s => !s)}
              className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">Tips</span>
              {showGuide ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
            </button>
          </div>
          {showGuide && (
            <div className="bg-white/10 rounded-lg p-6">
              <div className="flex items-start space-x-3 mb-4">
                <HelpCircle className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Understanding Life Balance</h3>
                  <div className="space-y-2 text-white/90 text-sm">
                    <p><strong>Physical Health:</strong> Your body's wellbeing - exercise, nutrition, sleep, and energy levels.</p>
                    <p><strong>Career & Work:</strong> Professional satisfaction, growth opportunities, and work-life integration.</p>
                    <p><strong>Relationships:</strong> Connection quality with family, friends, and romantic partners.</p>
                    <p><strong>Personal Growth:</strong> Learning, self-awareness, and evolving as a person.</p>
                    <p><strong>Financial Wellbeing:</strong> Financial security, planning, and relationship with money.</p>
                    <p><strong>Recreation & Fun:</strong> Hobbies, leisure activities, and joy in daily life.</p>
                    <p><strong>Environment:</strong> Your living space, community, and surroundings.</p>
                    <p><strong>Spirituality:</strong> Purpose, meaning, values, and inner peace.</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/20 pt-4">
                <h4 className="text-base font-semibold text-white mb-2">How to Use This Tool</h4>
                <p className="text-white/90 text-sm leading-relaxed">
                  Rate each dimension honestly based on how you feel right now. A balanced wheel doesn't mean all 10s -
                  it means being aware of where you are and making intentional choices. After saving, you'll see your
                  wheel visualization and personalized insights for growth.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {lastPrompt && (
        <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 text-yellow-200 rounded-lg">
          <Bell className="inline mr-2 w-4 h-4" />
          It’s been a while since your last check-in. Ready to review how things are going?
        </div>
      )}

      {/* Sliders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map(cat => (
          <div key={cat.id} className={`bg-gradient-to-br ${cat.cardGrad} rounded-lg p-4 shadow-md`}>
            <div className="flex items-start mb-2">
              <div className="text-2xl mr-2">{cat.icon}</div>
              <h3 className="text-base font-medium text-white">{cat.name}</h3>
            </div>
            <div>
              <div className="flex justify-between text-white text-sm mb-1">
                <span>Rate 1–10</span>
                <span>{scores.find(s => s.id === cat.id)?.score}/10</span>
              </div>
              <input
                type="range" min="0" max="10"
                value={scores.find(s => s.id === cat.id)?.score ?? 5}
                onChange={e => setScores(scores.map(s => s.id === cat.id ? { ...s, score: +e.target.value } : s))}
                className="w-full"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Button className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white" onClick={saveCurrentScores}>
          Save & Generate Insights
        </Button>
      </div>

      {showResults && (
        <>
          {/* Chart Card */}
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">Alignment Snapshot</p>
                <h2 className="text-2xl font-semibold" style={{ color: MAIN_SOLID }}>Balance Wheel</h2>
              </div>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    checked={compareEnabled}
                    onChange={(e) => setCompareEnabled(e.target.checked)}
                    disabled={!selectedComparison}
                  />
                  <span className="text-black">Compare previous check-in</span>
                </label>

                {/* >>> Updated select to force visible text in Chrome/Safari/dark mode <<< */}
                <select
                  className="
                    bg-white border border-gray-300 text-sm px-3 py-2 rounded-lg disabled:opacity-50
                    text-slate-900
                    [&>option]:text-slate-900
                    focus:outline-none focus:ring-2 focus:ring-teal-500
                  "
                  onChange={(e) => {
                    const selected = history.find(h => h.date === e.target.value);
                    setSelectedComparison(selected || null);
                    setCompareEnabled(!!selected);
                  }}
                  value={selectedComparison?.date || ''}
                  disabled={history.length <= 1}
                  style={{
                    color: selectTextColor,
                    WebkitTextFillColor: selectTextColor, // webkit quirk (also affects Chrome w/ forced dark mode)
                  }}
                >
                  {/* Visible placeholder when nothing selected */}
                  <option
                    value=""
                    style={{ color: '#64748b' }} // slate-500
                  >
                    Choose previous…
                  </option>
                  {history.slice(1).map((entry, idx) => (
                    <option
                      key={idx}
                      value={entry.date}
                      style={{ color: selectTextColor }}
                    >
                      {new Date(entry.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-[460px] w-full">
              <Radar data={chartData as any} options={chartOptions} />
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
                  <span className="text-slate-700 text-sm">
                    Compared ({new Date(selectedComparison.date).toLocaleDateString()})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-gray-100 p-6 rounded-lg space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Insights & Recommendations</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {scores.map(s => {
                const cat = CATEGORIES.find(c => c.id === s.id)!;
                return (
                  <div key={s.id} className={`bg-gradient-to-br ${cat.cardGrad} p-4 rounded-lg`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">{cat.icon}</span>
                      <h3 className="text-white font-medium">{cat.name}</h3>
                    </div>
                    <p className="text-sm text-white/90 mt-2">{getInsightText(cat.name, s.score)}</p>
                    <div className="mt-4 pt-2 border-t border-white/20">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/balance/activities/${cat.id}`, {
                            state: { insights: true, categoryScore: s.score, scores }
                          })
                        }
                        className="inline-flex items-center text-white hover:text-white/80 text-sm"
                      >
                        <LinkIcon className="h-3 w-3 mr-1" />
                        View Activities
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* History */}
      <div className="space-y-2">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-lg shadow-sm"
          >
            <div className="flex items-center space-x-4">
              <CalendarIcon className="h-5 w-5 text-brand-green" />
              <span className="text-gray-800 font-medium">
                {new Date(entry.date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setScores(entry.scores);
                  setShowResults(true);
                }}
                className="text-brand-green border-brand-green hover:bg-brand-green/10"
              >
                View Insights
              </Button>
              <button
                onClick={() => handleDelete(entry.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"
                title="Delete check-in"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}
