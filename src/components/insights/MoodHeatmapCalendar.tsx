import { useMemo } from "react";
import { eachDayOfInterval, endOfWeek, subWeeks, format, parseISO, startOfWeek } from "date-fns";

type MoodRow = { mood: string; date: string; intensity?: number };

const POS = new Set(["happy","excited","relaxed","confident","blessed","loved","adored","celebratory","playful","trusting"]);
const NEG = new Set(["sad","angry","anxious","frustrated","depressed","disappointed","insecure"]);

function polarity(m: string) {
  if (POS.has(m)) return 1;
  if (NEG.has(m)) return -1;
  return 0;
}

// brand-ish gradient red→gray→green
function colorFor(v: number) {
  const t = (v + 1) / 2; // 0..1
  const red = [224, 59, 59], gray = [120, 148, 170], green = [1, 177, 175];
  const a = t < 0.5 ? red : gray;
  const b = t < 0.5 ? gray : green;
  const tt = t < 0.5 ? t * 2 : (t - 0.5) * 2;
  const mix = (i: number) => Math.round(a[i] + (b[i] - a[i]) * tt);
  return `rgb(${mix(0)}, ${mix(1)}, ${mix(2)})`;
}

export default function MoodHeatmapCalendar({
  moods,
  cell = 26,     // 👈 make bigger to fill height (was ~20–24 before)
  weeks = 12,    // usually keep at 12
}: { moods: MoodRow[]; cell?: number; weeks?: number }) {
  const { cells, streak, avg7d, bestWeekLabel } = useMemo(() => {
    const end = endOfWeek(new Date());
    const start = subWeeks(end, weeks - 1);
    const days = eachDayOfInterval({ start, end });

    const byDate = new Map<string, number[]>();
    moods.forEach((r) => {
      const key = format(parseISO(r.date), "yyyy-MM-dd");
      const weight = polarity(r.mood) * (r.intensity ? Math.max(0.5, Math.min(1, r.intensity / 10)) : 1);
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key)!.push(weight);
    });

    const cells = days.map((d) => {
      const key = format(d, "yyyy-MM-dd");
      const arr = byDate.get(key) || [];
      const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      return { date: d, avg };
    });

    // KPIs
    // current positive/neutral streak (>= 0)
    let streak = 0;
    for (let i = cells.length - 1; i >= 0; i--) {
      if (cells[i].avg >= 0) streak++;
      else break;
    }

    // 7-day average mood index
    const last7 = cells.slice(-7).map(c => c.avg);
    const avg7d = last7.length ? (last7.reduce((a,b)=>a+b,0) / last7.length) : 0;

    // best week label by average
    const weekBuckets: Record<string, number[]> = {};
    cells.forEach((c) => {
      const wk = format(startOfWeek(c.date), "MMM d");
      (weekBuckets[wk] ||= []).push(c.avg);
    });
    let bestWeekLabel = "—";
    let bestWeekAvg = -Infinity;
    Object.entries(weekBuckets).forEach(([wk, arr]) => {
      const a = arr.reduce((s,v)=>s+v,0)/arr.length;
      if (a > bestWeekAvg) { bestWeekAvg = a; bestWeekLabel = wk; }
    });

    return { cells, streak, avg7d, bestWeekLabel };
  }, [moods, weeks]);

  // split into columns (weeks)
  const cols: typeof cells[] = Array.from({ length: weeks }, () => []);
  cells.forEach((c, idx) => cols[Math.floor(idx / 7)].push(c));

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-md">
      <div className="p-4" style={{ background: '#080B42' }}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-semibold text-white">Mood Heatmap</h2>
          <span className="text-xs text-white/80">Last {weeks} weeks</span>
        </div>
        <p className="text-sm text-white/80">Green = positive · Gray = neutral · Red = negative</p>
      </div>
      <div className="p-6">

      <div className="flex gap-1">
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((cellObj, ri) => (
              <div
                key={ri}
                className="rounded-sm"
                title={`${format(cellObj.date, "EEE, MMM d")}: ${cellObj.avg.toFixed(2)}`}
                style={{ width: cell, height: cell, backgroundColor: colorFor(cellObj.avg) }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Footer KPIs */}
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="bg-green-50 rounded-md p-2 border border-green-200">
          <p className="text-[11px] text-gray-600">Current Streak</p>
          <p className="text-base font-semibold text-gray-900">{streak} day{streak === 1 ? "" : "s"}</p>
        </div>
        <div className="bg-blue-50 rounded-md p-2 border border-blue-200">
          <p className="text-[11px] text-gray-600">7-day Avg</p>
          <p className="text-base font-semibold text-gray-900">{avg7d.toFixed(2)}</p>
        </div>
        <div className="bg-purple-50 rounded-md p-2 border border-purple-200">
          <p className="text-[11px] text-gray-600">Best Week</p>
          <p className="text-base font-semibold text-gray-900">{bestWeekLabel}</p>
        </div>
      </div>
      </div>
    </div>
  );
}
