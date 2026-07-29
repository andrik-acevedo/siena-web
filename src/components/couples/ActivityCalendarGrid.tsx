import {
  eachDayOfInterval,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  format,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from 'date-fns';

export type CoupleViewRange = 'week' | 'month' | 'quarter' | 'year';

interface CalendarGridProps {
  currentDate: Date;
  view: CoupleViewRange;
  marks: (dateISO: string) => Array<{ id: string; color: string; label: string }>;
  onCellClick: (dateISO: string) => void;
}

export default function ActivityCalendarGrid({
  currentDate,
  view,
  marks,
  onCellClick,
}: CalendarGridProps) {
  const buildSections = () => {
    if (view === 'week') {
      const s = startOfWeek(currentDate, { weekStartsOn: 0 });
      const e = endOfWeek(currentDate, { weekStartsOn: 0 });
      return [{ label: `${format(s, 'MMM d')} – ${format(e, 'MMM d')}`, days: eachDayOfInterval({ start: s, end: e }) }];
    }
    if (view === 'month') {
      const s = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
      const e = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
      return [{ label: format(currentDate, 'MMMM yyyy'), days: eachDayOfInterval({ start: s, end: e }) }];
    }
    if (view === 'quarter') {
      const qStart = startOfQuarter(currentDate);
      return [0, 1, 2].map((off) => {
        const m = new Date(qStart.getFullYear(), qStart.getMonth() + off, 1);
        const s = startOfWeek(startOfMonth(m), { weekStartsOn: 0 });
        const e = endOfWeek(endOfMonth(m), { weekStartsOn: 0 });
        return { label: format(m, 'MMM yyyy'), days: eachDayOfInterval({ start: s, end: e }) };
      });
    }
    const yStart = startOfYear(currentDate);
    return Array.from({ length: 12 }).map((_, i) => {
      const m = new Date(yStart.getFullYear(), i, 1);
      const s = startOfWeek(startOfMonth(m), { weekStartsOn: 0 });
      const e = endOfWeek(endOfMonth(m), { weekStartsOn: 0 });
      return { label: format(m, 'MMM yyyy'), days: eachDayOfInterval({ start: s, end: e }) };
    });
  };

  const sections = buildSections();
  const todayISO = format(new Date(), 'yyyy-MM-dd');

  const DayCell = ({ d }: { d: Date }) => {
    const iso = format(d, 'yyyy-MM-dd');
    const items = marks(iso);
    const isToday = iso === todayISO;
    const faded = view === 'month' && d.getMonth() !== currentDate.getMonth();

    return (
      <button
        onClick={() => onCellClick(iso)}
        className={`relative h-12 w-full rounded-md text-sm transition-colors
          ${isToday ? 'bg-blue-100 ring-2 ring-blue-300' : 'hover:bg-gray-100'}
          ${faded ? 'text-gray-400' : 'text-gray-900'}
        `}
        aria-label={`${format(d, 'MMM d, yyyy')} — ${items.length} activities`}
      >
        <div className="flex h-full w-full flex-col items-center justify-center">
          <span className="text-xs font-medium">{d.getDate()}</span>
          {items.length > 0 && (
            <div className="mt-1 flex max-w-full flex-wrap justify-center gap-1">
              {items.slice(0, 6).map((it) => (
                <span
                  key={it.id}
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: it.color }}
                  title={it.label}
                />
              ))}
              {items.length > 6 && <span className="text-[10px] text-gray-500">+{items.length - 6}</span>}
            </div>
          )}
        </div>
      </button>
    );
  };

  const Grid = ({ days }: { days: Date[] }) => (
    <>
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => (
          <DayCell key={d.toISOString()} d={d} />
        ))}
      </div>
    </>
  );

  if (view === 'week' || view === 'month') {
    return (
      <div className="space-y-2">
        <Grid days={sections[0].days} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sections.map((s) => (
        <div key={s.label} className="space-y-2">
          <div className="text-center text-sm font-medium text-gray-700">{s.label}</div>
          <Grid days={s.days} />
        </div>
      ))}
    </div>
  );
}