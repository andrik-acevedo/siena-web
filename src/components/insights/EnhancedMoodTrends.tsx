import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  subMonths,
  eachDayOfInterval,
} from "date-fns";
import { Clock, TrendingUp, AlertCircle } from "lucide-react";

// -------- Types --------
type MoodEntry = { mood: string; date: string };
type ViewMode = "trajectory" | "frequency" | "intensity" | "variance";
type Timeframe = "week" | "month" | "3months";
type Props = {
  moods: MoodEntry[];
  sleepData?: Array<{ date: string; quality: number }>;
  exerciseData?: Array<{ created_at: string }>;
};

// -------- Constants --------
const MOOD_TYPES: Record<string, string[]> = {
  positive: [
    "happy",
    "excited",
    "relaxed",
    "confident",
    "blessed",
    "loved",
    "adored",
    "celebratory",
    "playful",
    "trusting",
  ],
  neutral: ["neutral", "curious", "thinking", "tired", "blah", "skeptical"],
  negative: ["sad", "angry", "anxious", "frustrated", "depressed", "disappointed", "insecure"],
};

const MOOD_INTENSITY: Record<string, number> = {
  happy: 0.8,
  excited: 0.9,
  relaxed: 0.7,
  confident: 0.8,
  blessed: 0.9,
  loved: 0.9,
  adored: 1.0,
  celebratory: 1.0,
  playful: 0.8,
  trusting: 0.7,
  neutral: 0.5,
  curious: 0.6,
  thinking: 0.5,
  tired: 0.4,
  blah: 0.3,
  skeptical: 0.4,
  sad: 0.2,
  angry: 0.1,
  anxious: 0.2,
  frustrated: 0.3,
  depressed: 0.1,
  disappointed: 0.2,
  insecure: 0.2,
};

// -------- Helpers --------
function categorizeMood(mood: string): "positive" | "neutral" | "negative" {
  for (const [category, moods] of Object.entries(MOOD_TYPES)) {
    if (moods.includes(mood)) return category as any;
  }
  return "neutral";
}
function moodPolarity(mood: string) {
  const cat = categorizeMood(mood);
  if (cat === "positive") return 1;
  if (cat === "negative") return -1;
  return 0;
}
function calculateRollingAverage(data: number[], windowSize: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const s = Math.max(0, i - Math.floor(windowSize / 2));
    const e = Math.min(data.length, i + Math.ceil(windowSize / 2));
    const win = data.slice(s, e);
    out.push(win.reduce((a, b) => a + b, 0) / win.length);
  }
  return out;
}
function detectSignificantShifts(data: number[], threshold = 0.35) {
  const shifts: Array<{ index: number; change: number }> = [];
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    if (Math.abs(change) >= threshold) shifts.push({ index: i, change });
  }
  return shifts;
}

// -------- Component --------
export default function EnhancedMoodTrends({
  moods,
  sleepData = [],
  exerciseData = [],
}: Props) {
  const [timeframe, setTimeframe] = useState<Timeframe>("month");
  const [viewMode, setViewMode] = useState<ViewMode>("trajectory"); // default: simple trend
  const [showRollingAvg, setShowRollingAvg] = useState(true);
  const [showSleepCorrelation, setShowSleepCorrelation] = useState(false);
  const [showExerciseCorrelation, setShowExerciseCorrelation] = useState(false);

  const chartData = useMemo(() => {
    if (!moods.length) return { labels: [], datasets: [], annotations: [] as any[] };

    const now = new Date();
    let startDate: Date, endDate: Date, dateFormat: string, interval: Date[];

    if (timeframe === "week") {
      startDate = startOfWeek(now);
      endDate = endOfWeek(now);
      dateFormat = "EEE";
      interval = eachDayOfInterval({ start: startDate, end: endDate });
    } else if (timeframe === "month") {
      startDate = subMonths(now, 1);
      endDate = now;
      dateFormat = "MMM d";
      interval = eachDayOfInterval({ start: startDate, end: endDate });
    } else {
      startDate = subMonths(now, 3);
      endDate = now;
      dateFormat = "MMM d";
      interval = eachDayOfInterval({ start: startDate, end: endDate });
    }

    const labels = interval.map((d) => format(d, dateFormat));
    const datasets: any[] = [];
    const annotations: Array<{ index: number; change: number; label: string }> = [];

    // ---------- NEW: Mood Trajectory (−1..+1) ----------
    if (viewMode === "trajectory") {
      const byDay: Record<string, number[]> = {};
      interval.forEach((d) => (byDay[format(d, "yyyy-MM-dd")] = []));
      moods.forEach(({ mood, date }) => {
        if (byDay[date]) {
          const weight = Math.max(0.5, Math.min(1, (MOOD_INTENSITY[mood] ?? 0.5)));
          byDay[date].push(moodPolarity(mood) * weight);
        }
      });

      const index = interval.map((d) => {
        const key = format(d, "yyyy-MM-dd");
        const arr = byDay[key] || [];
        return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; // −1..+1
      });

      datasets.push({
        label: "Mood Index",
        data: index,
        borderColor: "#01B1AF",
        backgroundColor: "rgba(1,177,175,0.15)",
        tension: 0.35,
        fill: true,
        pointRadius: 0,
        borderWidth: 3,
      });

      if (showRollingAvg && index.length > 3) {
        const windowSize = Math.min(7, Math.max(3, Math.floor(index.length / 4)));
        const avg = calculateRollingAverage(index, windowSize);
        datasets.push({
          label: `${windowSize}-day avg`,
          data: avg,
          borderColor: "#ffffff",
          backgroundColor: "transparent",
          borderDash: [6, 6],
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          borderWidth: 2,
        });
      }

      detectSignificantShifts(index, 0.35).forEach((s) =>
        annotations.push({ ...s, label: s.change > 0 ? "↑ Positive shift" : "↓ Negative shift" })
      );
    }

    // ---------- Existing modes intact ----------
    if (viewMode === "frequency") {
      const moodCounts: Record<
        string,
        { positive: number; neutral: number; negative: number }
      > = {};
      interval.forEach((d) => (moodCounts[format(d, "yyyy-MM-dd")] = { positive: 0, neutral: 0, negative: 0 }));
      moods.forEach(({ mood, date }) => {
        if (moodCounts[date]) {
          const cat = categorizeMood(mood);
          (moodCounts[date] as any)[cat]++;
        }
      });
      const pos = interval.map((d) => moodCounts[format(d, "yyyy-MM-dd")].positive);
      const neu = interval.map((d) => moodCounts[format(d, "yyyy-MM-dd")].neutral);
      const neg = interval.map((d) => moodCounts[format(d, "yyyy-MM-dd")].negative);
      datasets.push(
        {
          label: "Positive",
          data: pos,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,0.1)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        },
        {
          label: "Neutral",
          data: neu,
          borderColor: "#94a3b8",
          backgroundColor: "rgba(148,163,184,0.1)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        },
        {
          label: "Negative",
          data: neg,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239,68,68,0.1)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        }
      );
      if (showRollingAvg && pos.length > 3) {
        const windowSize = Math.min(7, Math.floor(pos.length / 3));
        const avgPositive = calculateRollingAverage(pos, windowSize);
        datasets.push({
          label: "Positive (rolling avg)",
          data: avgPositive,
          borderColor: "#16a34a",
          backgroundColor: "transparent",
          borderWidth: 3,
          borderDash: [5, 5],
          tension: 0.4,
          fill: false,
          pointRadius: 0,
        });
      }
    }

    if (viewMode === "intensity") {
      const byDate: Record<string, number[]> = {};
      interval.forEach((d) => (byDate[format(d, "yyyy-MM-dd")] = []));
      moods.forEach(({ mood, date }) => {
        if (byDate[date]) byDate[date].push(MOOD_INTENSITY[mood] ?? 0.5);
      });
      const avgIntensity = interval.map((d) => {
        const arr = byDate[format(d, "yyyy-MM-dd")];
        return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      });
      datasets.push({
        label: "Mood Intensity (0–1)",
        data: avgIntensity,
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.15)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
      });
      if (showRollingAvg && avgIntensity.length > 3) {
        const windowSize = Math.min(7, Math.floor(avgIntensity.length / 3));
        const rollingAvg = calculateRollingAverage(avgIntensity, windowSize);
        datasets.push({
          label: "7-day Rolling Average",
          data: rollingAvg,
          borderColor: "#fbbf24",
          backgroundColor: "transparent",
          borderWidth: 3,
          borderDash: [5, 5],
          tension: 0.4,
          fill: false,
          pointRadius: 0,
        });
      }
      detectSignificantShifts(avgIntensity).forEach((s) =>
        annotations.push({ ...s, label: s.change > 0 ? "↑ Positive shift" : "↓ Negative shift" })
      );
    }

    if (viewMode === "variance") {
      const byDate: Record<string, number[]> = {};
      interval.forEach((d) => (byDate[format(d, "yyyy-MM-dd")] = []));
      moods.forEach(({ mood, date }) => {
        if (byDate[date]) byDate[date].push(MOOD_INTENSITY[mood] ?? 0.5);
      });
      const variability = interval.map((d) => {
        const arr = byDate[format(d, "yyyy-MM-dd")];
        if (arr.length < 2) return 0;
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const variance = arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / arr.length;
        return Math.sqrt(variance);
      });
      datasets.push({
        label: "Mood Variability",
        data: variability,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245,158,11,0.15)",
        fill: true,
        tension: 0.4,
        borderWidth: 3,
      });
    }

    // Optional overlays (sleep/exercise)
    if (showSleepCorrelation && sleepData.length > 0) {
      const sleepByDate: Record<string, number> = {};
      sleepData.forEach((e) => (sleepByDate[e.date] = e.quality / 5));
      const series = interval.map((d) => sleepByDate[format(d, "yyyy-MM-dd")] ?? null);
      datasets.push({
        label: "Sleep Quality",
        data: series,
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6,182,212,0.05)",
        borderWidth: 2,
        borderDash: [3, 3],
        tension: 0.4,
        fill: false,
        yAxisID: "y1",
      });
    }
    if (showExerciseCorrelation && exerciseData.length > 0) {
      const byDate: Record<string, number> = {};
      exerciseData.forEach((e) => {
        const d = format(parseISO(e.created_at), "yyyy-MM-dd");
        byDate[d] = (byDate[d] || 0) + 1;
      });
      const series = interval.map((d) => byDate[format(d, "yyyy-MM-dd")] ?? 0);
      datasets.push({
        label: "Exercise Count",
        data: series,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245,158,11,0.05)",
        borderWidth: 2,
        borderDash: [3, 3],
        tension: 0.4,
        fill: false,
        yAxisID: "y1",
      });
    }

    return { labels, datasets, annotations };
  }, [moods, timeframe, viewMode, showRollingAvg, showSleepCorrelation, showExerciseCorrelation, sleepData, exerciseData]);

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    scales: {
      y: {
        display: true,
        min: viewMode === "trajectory" ? -1 : undefined,
        max: viewMode === "trajectory" ? 1 : undefined,
        beginAtZero: viewMode !== "trajectory",
        ticks: { color: "#fff", font: { size: 11 } },
        grid: { color: "rgba(255,255,255,0.1)", drawBorder: false },
        title: {
          display: true,
          text:
            viewMode === "trajectory"
              ? "Mood Index (−1 to +1)"
              : viewMode === "frequency"
              ? "Count"
              : viewMode === "intensity"
              ? "Intensity (0–1)"
              : "Variability",
          color: "#fff",
        },
      },
      y1: {
        display: showSleepCorrelation || showExerciseCorrelation,
        position: "right",
        beginAtZero: true,
        ticks: { color: "#fff", font: { size: 11 } },
        grid: { display: false },
        title: { display: true, text: "Correlation", color: "#fff" },
      },
      x: {
        display: true,
        ticks: { color: "#fff", font: { size: 11 }, maxRotation: 0 },
        grid: { color: "rgba(255,255,255,0.1)", drawBorder: false },
      },
    },
    plugins: {
      legend: { display: true, position: "top", labels: { color: "#fff", font: { size: 11 }, usePointStyle: true, padding: 10 } },
      tooltip: { enabled: true, backgroundColor: "rgba(0,0,0,0.9)", titleColor: "#fff", bodyColor: "#fff", borderColor: "#444", borderWidth: 1, padding: 12 },
    },
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
      <div className="bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-white mr-3" />
            <h2 className="text-xl font-semibold text-white">Mood Trends</h2>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setTimeframe("week")} className={`px-2 py-1 text-xs rounded ${timeframe==="week"?"bg-white/20":"bg-white/10 hover:bg-white/15"}`}>Week</button>
            <button onClick={() => setTimeframe("month")} className={`px-2 py-1 text-xs rounded ${timeframe==="month"?"bg-white/20":"bg-white/10 hover:bg-white/15"}`}>Month</button>
            <button onClick={() => setTimeframe("3months")} className={`px-2 py-1 text-xs rounded ${timeframe==="3months"?"bg-white/20":"bg-white/10 hover:bg-white/15"}`}>3M</button>
          </div>
        </div>
      </div>
      <div className="p-6">

      <div className="mb-3 space-y-2">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-600">View:</span>
          <button onClick={() => setViewMode("trajectory")} className={`px-2 py-1 text-xs rounded ${viewMode==="trajectory"?"bg-[#7c3aed]/20 text-[#7c3aed]":"bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>Trend</button>
          <button onClick={() => setViewMode("frequency")} className={`px-2 py-1 text-xs rounded ${viewMode==="frequency"?"bg-[#7c3aed]/20 text-[#7c3aed]":"bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>Frequency</button>
          <button onClick={() => setViewMode("intensity")} className={`px-2 py-1 text-xs rounded ${viewMode==="intensity"?"bg-[#7c3aed]/20 text-[#7c3aed]":"bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>Intensity</button>
          <button onClick={() => setViewMode("variance")} className={`px-2 py-1 text-xs rounded ${viewMode==="variance"?"bg-[#7c3aed]/20 text-[#7c3aed]":"bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>Variance</button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <label className="flex items-center gap-1 text-xs cursor-pointer">
            <input type="checkbox" checked={showRollingAvg} onChange={(e)=>setShowRollingAvg(e.target.checked)} className="rounded" />
            <span className="text-gray-700">{viewMode === "trajectory" ? "7-day avg" : "Rolling avg"}</span>
          </label>
          {sleepData.length > 0 && (
            <label className="flex items-center gap-1 text-xs cursor-pointer">
              <input type="checkbox" checked={showSleepCorrelation} onChange={(e)=>setShowSleepCorrelation(e.target.checked)} className="rounded" />
              <span className="text-gray-700">Sleep</span>
            </label>
          )}
          {exerciseData.length > 0 && (
            <label className="flex items-center gap-1 text-xs cursor-pointer">
              <input type="checkbox" checked={showExerciseCorrelation} onChange={(e)=>setShowExerciseCorrelation(e.target.checked)} className="rounded" />
              <span className="text-gray-700">Exercise</span>
            </label>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        {viewMode === "trajectory" && "Simple Mood Index (−1 to +1). Up = improving trend; down = worsening."}
        {viewMode === "frequency" && "Track how often you experience different mood types."}
        {viewMode === "intensity" && "Monitor overall positivity (0–1)."}
        {viewMode === "variance" && "See how stable or fluctuating your moods are each day."}
      </p>

      <div style={{ height: 592 }}>
        {chartData.labels.length ? <Line data={chartData} options={chartOptions} /> : (
          <div className="h-full w-full flex items-center justify-center">
            <p className="text-gray-500 text-sm">No moods in this timeframe.</p>
          </div>
        )}
      </div>

      {chartData.annotations.length > 0 && (
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <TrendingUp className="h-3 w-3" />
            <span className="font-medium">Notable Shifts:</span>
          </div>
          {chartData.annotations.slice(0, 3).map((a, i) => (
            <div key={i} className="flex items-start gap-2 text-xs bg-gray-50 rounded px-2 py-1 border border-gray-200 text-gray-700">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span>{a.label} on {chartData.labels[a.index]}{a.change>0 ? " — consider what went well!" : " — reflect on what changed."}</span>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
