import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MOODS } from './mood.constants';
import { formatDate } from './mood.utils';

type MoodEntry = { date: string; mood: string };

type Props = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  moodEntries: MoodEntry[];
  currentViewDate: Date;
  setCurrentViewDate: (date: Date) => void;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const EnhancedCalendar: React.FC<Props> = ({
  selectedDate,
  onDateChange,
  moodEntries,
  currentViewDate,
  setCurrentViewDate,
}) => {
  const currentMonth = currentViewDate.getMonth();
  const currentYear = currentViewDate.getFullYear();

  // Build a 6x7 grid (always 42 days), starting on Sunday
  const firstOfMonth = new Date(currentYear, currentMonth, 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - firstOfMonth.getDay()); // Sun=0

  const days: Date[] = [];
  const cursor = new Date(gridStart);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const getMoodData = (date: Date) => {
    const entry = moodEntries.find(e => e.date === formatDate(date, 'yyyy-MM-dd'));
    if (!entry) return null;

    const mood = MOODS.find(m => m.value === entry.mood);
    if (!mood) return null;

    let cornerColor: string | null = null;
    switch (mood.type) {
      case 'positive':
        cornerColor = 'bg-green-500';
        break;
      case 'negative':
        cornerColor = 'bg-red-500';
        break;
      case 'neutral':
        cornerColor = 'bg-gray-400';
        break;
    }

    return { mood, cornerColor };
  };

  const navigateMonth = (delta: number) => {
    const d = new Date(currentViewDate);
    d.setMonth(d.getMonth() + delta);
    setCurrentViewDate(d);
  };

  const navigateYear = (delta: number) => {
    const d = new Date(currentViewDate);
    d.setFullYear(d.getFullYear() + delta);
    setCurrentViewDate(d);
  };

  return (
    <div className="bg-white rounded-lg p-4 h-full flex flex-col border border-brand-green">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateYear(-1)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title="Previous year"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title="Previous month"
          >
            ←
          </button>
        </div>

        <h3 className="text-lg font-semibold text-gray-800">
          {months[currentViewDate.getMonth()]} {currentViewDate.getFullYear()}
        </h3>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title="Next month"
          >
            →
          </button>
          <button
            onClick={() => navigateYear(1)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title="Next year"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {days.map((day, idx) => {
          const inMonth = day.getMonth() === currentMonth;
          const selected = isSameDay(day, selectedDate);
          const today = isSameDay(day, new Date());
          const moodData = getMoodData(day);

          const IconComp = moodData?.mood.icon as React.ComponentType<{ className?: string }>;

          return (
            <button
              key={idx}
              onClick={() => onDateChange(day)}
              className={[
                'relative h-12 w-full rounded-lg text-sm font-medium transition-all flex flex-col items-center justify-center',
                inMonth ? 'text-gray-900' : 'text-gray-400',
                selected ? 'bg-brand-green text-white' : 'hover:bg-gray-100',
                today && !selected ? 'bg-blue-100 text-blue-600' : '',
              ].join(' ')}
            >
              <span className="text-xs mb-1">{day.getDate()}</span>

              <div className="flex justify-center">
                {moodData && IconComp && (
                  <IconComp className={`h-3 w-3 ${moodData.mood.color}`} />
                )}
              </div>

              {moodData?.cornerColor && (
                <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${moodData.cornerColor}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EnhancedCalendar;
