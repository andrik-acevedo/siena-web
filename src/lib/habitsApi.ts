// src/lib/habitsApi.ts
import { supabase } from './supabase';
import { Habit, HabitLog, HabitPreset } from '../types/habits';

export async function listHabits(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Habit[];
}

export async function createHabit(
  data: Omit<Habit, 'id' | 'created_at'>
): Promise<Habit> {
  // NOTE: data may (optionally) include:
  // sms_reminder, reminder_time, reminder_dow, reminder_dom
  const { data: habit, error } = await supabase
    .from('habits')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return habit as Habit;
}

export async function updateHabit(
  id: string,
  data: Partial<Habit>
): Promise<Habit> {
  // Accepts partial updates, including SMS fields
  const { data: habit, error } = await supabase
    .from('habits')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return habit as Habit;
}

export async function toggleHabitActive(
  id: string,
  is_active: boolean
): Promise<void> {
  const { error } = await supabase
    .from('habits')
    .update({ is_active })
    .eq('id', id);

  if (error) throw error;
}

export async function listHabitLogs(
  habitId: string,
  startISO: string,
  endISO: string
): Promise<HabitLog[]> {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .gte('log_date', startISO)
    .lte('log_date', endISO)
    .order('log_date', { ascending: true });

  if (error) throw error;
  return (data || []) as HabitLog[];
}

export async function upsertHabitLog(
  habitId: string,
  dateISO: string,
  completed: boolean,
  value?: number
): Promise<HabitLog> {
  const logData = {
    habit_id: habitId,
    log_date: dateISO,
    completed,
    value: value ?? null,
  };

  const { data, error } = await supabase
    .from('habit_logs')
    .upsert(logData, { onConflict: 'habit_id,log_date' })
    .select()
    .single();

  if (error) throw error;
  return data as HabitLog;
}

export async function copyPresetToUser(
  userId: string,
  preset: HabitPreset
): Promise<Habit> {
  // Provide safe defaults for new SMS fields
  const habitData: Omit<Habit, 'id' | 'created_at'> = {
    user_id: userId,
    name: preset.name,
    target_value: preset.target_value ?? null,
    target_unit: preset.target_unit ?? null,
    frequency: preset.frequency,
    is_active: true,
    color: preset.color,
    // SMS defaults
    sms_reminder: false,
    reminder_time: null,
    reminder_dow: null,
    reminder_dom: null,
  };

  return createHabit(habitData);
}

export const HABIT_PRESETS: HabitPreset[] = [
  { name: 'Read for 30 min', target_value: 30, target_unit: 'min', frequency: 'daily', color: 'from-[#0068aa] to-[#004d7f]' },
  { name: 'Exercise', frequency: 'daily', color: 'from-[#F27C7C] to-[#E03B3B]' },
  { name: 'Walk', target_value: 30, target_unit: 'min', frequency: 'daily', color: 'from-[#B1E006] to-[#6C8300]' },
  { name: 'Run', target_value: 20, target_unit: 'min', frequency: 'daily', color: 'from-[#FFA600] to-[#B36B00]' },
  { name: 'Drink water', target_value: 2, target_unit: 'L', frequency: 'daily', color: 'from-[#00789f] to-[#005a77]' },
  { name: 'Steps', target_value: 10000, target_unit: 'steps', frequency: 'daily', color: 'from-[#008792] to-[#006a70]' },
  { name: 'No snacks', frequency: 'daily', color: 'from-[#e88584] to-[#8e4f63]' },
  { name: 'Eat healthy', frequency: 'daily', color: 'from-[#B1E006] to-[#6C8300]' },
  { name: 'Journal', frequency: 'daily', color: 'from-[#7b5595] to-[#5d4070]' },
  { name: 'Meditate', target_value: 10, target_unit: 'min', frequency: 'daily', color: 'from-[#080B42] to-[#6A51A6]' },
  { name: 'Yoga', target_value: 20, target_unit: 'min', frequency: 'daily', color: 'from-[#ea697c] to-[#b8455c]' },
  { name: 'Learn a new language', target_value: 15, target_unit: 'min', frequency: 'daily', color: 'from-[#0068aa] to-[#004d7f]' },
  { name: 'Play guitar', target_value: 15, target_unit: 'min', frequency: 'daily', color: 'from-[#FFA600] to-[#B36B00]' },
  { name: 'Save money', frequency: 'weekly', color: 'from-[#B1E006] to-[#6C8300]' },
  { name: 'Special Moment with Partner', frequency: 'weekly', color: 'from-[#ea697c] to-[#b8455c]' },
  { name: 'No Arguments', frequency: 'weekly', color: 'from-[#00789f] to-[#005a77]' },
  { name: 'Date night', frequency: 'monthly', color: 'from-[#ea697c] to-[#b8455c]' },
  { name: 'Intimacy', frequency: 'monthly', color: 'from-[#F27C7C] to-[#E03B3B]' },
];

// --- ADD THESE HELPERS (keep the rest of your file unchanged) ---

/** Create a basic habit quickly (used by the day modal "Create & Log") */
export async function createQuickHabit(userId: string, name: string, color = 'from-[#01B1AF] to-[#018a88]'): Promise<Habit> {
  const payload: Omit<Habit, 'id' | 'created_at'> = {
    user_id: userId,
    name,
    target_value: null,
    target_unit: null,
    frequency: 'daily',
    is_active: true,
    color,
    sms_reminder: false,
    reminder_time: null,
    reminder_dow: null,
    reminder_dom: null,
  };
  const { data, error } = await supabase.from('habits').insert(payload).select().single();
  if (error) throw error;
  return data as Habit;
}

/** Fetch logs for many habits in one go (faster than per-habit calls) */
export async function listHabitLogsBulk(
  habitIds: string[],
  startISO: string,
  endISO: string
): Promise<HabitLog[]> {
  if (habitIds.length === 0) return [];
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .in('habit_id', habitIds)
    .gte('log_date', startISO)
    .lte('log_date', endISO)
    .order('log_date', { ascending: true });
  if (error) throw error;
  return (data || []) as HabitLog[];
}
