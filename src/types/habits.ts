export type Frequency = 'daily' | 'weekly' | 'monthly';
export type ViewRange = 'week' | 'month' | 'quarter';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  target_value?: number;
  target_unit?: string;
  frequency: Frequency;
  is_active: boolean;
  color: string;
  created_at: string;

  // ✅ Add these 4 fields for habit-level SMS reminders
  sms_reminder?: boolean | null;   // enable/disable per habit
  reminder_time?: string | null;   // 'HH:mm'
  reminder_dow?: number | null;    // 0..6 (Sun..Sat) for weekly habits
  reminder_dom?: number | null;    // 1..28 for monthly habits
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  value?: number;
  created_at: string;
}

export interface HabitPreset {
  name: string;
  target_value?: number;
  target_unit?: string;
  frequency: Frequency;
  color: string;
}

export interface SMSPreference {
  id: string;
  user_id: string;
  habit_id?: string;
  channel: string;
  enabled: boolean;
  send_time?: string;
  created_at: string;
}
