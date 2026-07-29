import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { Habit, HabitLog } from '../../types/habits';

type MergedGroup = {
  key: string;            // normalized name
  name: string;           // display (first seen)
  color: string;          // color from primary
  ids: string[];          // all habit ids sharing this normalized name
  mergedCount: number;
};

function normalizeName(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

function buildMergedGroups(habits: Habit[]): MergedGroup[] {
  const map = new Map<string, MergedGroup>();
  for (const h of habits) {
    const key = normalizeName(h.name);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { key, name: h.name, color: h.color, ids: [h.id], mergedCount: 1 });
    } else {
      existing.ids.push(h.id);
      existing.mergedCount += 1;
      // keep earliest color/name
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function computeStreakStats(hitDatesISO: string[]) {
  // hitDatesISO: unique yyyy-MM-dd strings (across all merged IDs)
  const dates = Array.from(new Set(hitDatesISO)).map(parseISO).sort((a, b) => a.getTime() - b.getTime());
  if (dates.length === 0) return { current: 0, best: 0, progressPct: 0 };

  // Find the most recent consecutive run (anchor at the last hit, not necessarily today)
  let current = 1;
  for (let i = dates.length - 1; i > 0; i--) {
    const gap = differenceInCalendarDays(dates[i], dates[i - 1]);
    if (gap === 1) current += 1;
    else break;
  }

  // Best streak over the last ~300 days
  let best = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const gap = differenceInCalendarDays(dates[i], dates[i - 1]);
    if (gap === 1) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }

  const progressPct = Math.min(100, Math.round((dates.length / 30) * 100)); // tiny progress bar flavor
  return { current, best, progressPct };
}

type Props = {
  habits: Habit[];
  // Logs map: habitId -> HabitLog[]
  habitLogs: Map<string, HabitLog[]>;
};

export default function HabitStreaksCard({ habits, habitLogs }: Props) {
  const groups = buildMergedGroups(habits);

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium text-gray-900">Streaks</h3>
        <div className="text-xs text-gray-500">Merged by name (case-insensitive)</div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No habits yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {groups.map((g) => {
            // Gather all hit dates across the group's habit IDs
            const hits: string[] = [];
            g.ids.forEach((id) => {
              (habitLogs.get(id) || []).forEach((l) => {
                if (l.completed) hits.push(l.log_date);
              });
            });
            const { current, best, progressPct } = computeStreakStats(hits);

            return (
              <div key={g.key} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                    <div className="text-sm font-medium text-gray-900">{g.name}</div>
                  </div>
                  {g.mergedCount > 1 && (
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                      {g.mergedCount} merged
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-gray-50 p-3">
                    <div className="text-[10px] text-gray-500 uppercase">Current</div>
                    <div className="text-xl font-semibold text-gray-900">{current}</div>
                    <div className="text-[10px] text-gray-500">day streak</div>
                  </div>
                  <div className="rounded-md bg-gray-50 p-3">
                    <div className="text-[10px] text-gray-500 uppercase">Best</div>
                    <div className="text-xl font-semibold text-gray-900">{best}</div>
                    <div className="text-[10px] text-gray-500">days</div>
                  </div>
                  <div className="rounded-md bg-gray-50 p-3">
                    <div className="text-[10px] text-gray-500 uppercase">30d</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {Math.min(30, new Set(hits).size)}
                    </div>
                    <div className="text-[10px] text-gray-500">days hit</div>
                  </div>
                </div>

                <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#01B1AF]"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
