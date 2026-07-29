import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { X, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { Habit, HabitLog } from '../../types/habits';
import { createQuickHabit, upsertHabitLog } from '../../lib/habitsApi';

type Props = {
  userId: string;
  dateISO: string;
  habits: Habit[];                 // all user habits
  logsForDay: HabitLog[];          // logs only for dateISO
  onClose: () => void;
  onAdded: (log: HabitLog) => void;
  onRemoved: (habitId: string) => void;
  onHabitCreated: (habit: Habit) => void;
};

export default function HabitDayModal({
  userId,
  dateISO,
  habits,
  logsForDay,
  onClose,
  onAdded,
  onRemoved,
  onHabitCreated,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('habit_favorites') || '[]'); } catch { return []; }
  });

  function toggleFav(id: string) {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem('habit_favorites', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const selectedIds = useMemo(
    () => new Set(logsForDay.filter(l => l.completed).map(l => l.habit_id)),
    [logsForDay]
  );

  const sorted = useMemo(() => {
    const arr = [...habits];
    arr.sort((a, b) => {
      const fa = favorites.includes(a.id);
      const fb = favorites.includes(b.id);
      if (fa && !fb) return -1;
      if (!fa && fb) return 1;
      return a.name.localeCompare(b.name);
    });
    return arr;
  }, [habits, favorites]);

  async function add(habit: Habit) {
    try {
      const log = await upsertHabitLog(habit.id, dateISO, true);
      onAdded(log);
      toast.success(`Marked "${habit.name}"`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to add');
    }
  }

  async function remove(habit: Habit) {
    try {
      const log = await upsertHabitLog(habit.id, dateISO, false);
      onRemoved(habit.id);
      toast.success(`Removed "${habit.name}"`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to remove');
    }
  }

  async function createAndLog() {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const habit = await createQuickHabit(userId, name);
      onHabitCreated(habit);
      const log = await upsertHabitLog(habit.id, dateISO, true);
      onAdded(log);
      setNewName('');
      toast.success(`Created & marked "${habit.name}"`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to create');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Activities for {format(new Date(dateISO + 'T00:00:00'), 'MMMM d, yyyy')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* quick create */}
        <div className="mb-4 border rounded-lg p-3 bg-gray-50">
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createAndLog()}
              placeholder="Create new habit (e.g., “Stretch 5 min”)"
              className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#01B1AF] focus:border-transparent"
            />
            <button
              onClick={createAndLog}
              disabled={!newName.trim() || creating}
              className="rounded bg-[#01B1AF] px-3 py-2 text-sm text-white hover:bg-[#018a88] disabled:opacity-60"
            >
              {creating ? 'Adding…' : 'Add & Log'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">Creates the habit and marks it for this day.</p>
        </div>

        {/* list */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Available Habits ({sorted.length})
          </div>
          {sorted.map(h => {
            const active = selectedIds.has(h.id);
            // pull a solid color from gradient like your CalendarGrid does
            const m = h.color.match(/from-\[(#[0-9a-fA-F]+)\]/);
            const solid = m ? m[1] : '#01B1AF';
            const fav = favorites.includes(h.id);

            return (
              <div key={h.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: solid }} />
                  <span className="text-sm font-medium text-gray-900">{h.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleFav(h.id)}
                    title={fav ? 'Unpin from favorites' : 'Pin to favorites'}
                    className="hover:bg-gray-100 rounded p-1 transition-colors"
                  >
                    <Star className={`h-4 w-4 ${fav ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`} />
                  </button>
                </div>
                <div>
                  {active ? (
                    <button
                      onClick={() => remove(h)}
                      className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => add(h)}
                      className="rounded bg-[#01B1AF] px-3 py-1 text-xs text-white hover:bg-[#018a88]"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
