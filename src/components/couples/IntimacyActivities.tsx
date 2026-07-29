import { useEffect, useMemo, useState } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, HelpCircle, Plus, Edit, Trash2, X } from 'lucide-react';

import { useUser } from '../../context/UserContext';
import Button from '../ui/Button';

import CalendarGrid from '../habits/CalendarGrid';
import { DEFAULT_COUPLE_TYPES } from '../../lib/coupleActivityDefaults';

// ===== TYPES =====
type ViewRange = 'week' | 'month' | 'quarter';

type ActivityType = {
  id: string;
  owner_user_id: string;
  name: string;
  color: string;           // hex color like "#0068aa"
  track_intensity: boolean;
  sort_index?: number;
  created_at?: string;
};

type ActivityLog = {
  id: string;
  owner_user_id: string;
  activity_type_id: string;
  activity_date: string;       // YYYY-MM-DD
  count?: number | null;
  intensity?: number | null; 
  notes?: string | null;
  created_by_user_id: string;
  created_at?: string;
};

type ShareSettings = {
  owner_user_id: string;
  share_with_partner: boolean;
};

// ===== GRADIENT SWATCHES =====
const GRADIENTS = [
  'from-[#e88584] to-[#8e4f63]',
  'from-[#0068aa] to-[#004d7f]',
  'from-[#FFA600] to-[#B36B00]',
  'from-[#B1E006] to-[#6C8300]',
  'from-[#F27C7C] to-[#E03B3B]',
  'from-[#080B42] to-[#6A51A6]',
  'from-[#00789f] to-[#005a77]',
  'from-[#ea697c] to-[#b8455c]',
  'from-[#008792] to-[#006a70]',
  'from-[#7b5595] to-[#5d4070]',
];

function GradientSwatches({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
      {GRADIENTS.map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => onChange(g)}
          className={`w-9 h-9 rounded-lg bg-gradient-to-br ${g} border-2 transition-all ${
            value === g ? 'border-gray-900 scale-110' : 'border-gray-300 hover:scale-105'
          }`}
          aria-label="Choose color"
        />
      ))}
    </div>
  );
}

// ===== API (implement these in src/lib/coupleActivityApi.ts) =====
import {
  listTypes,
  upsertType,
  updateActivityType,
  deleteActivityType,
  listLogs,
  upsertLog,
  deleteActivityLog,
  getCoupleSettings,
  updateCoupleSettings,
  getEffectiveOwnerId,
} from '../../lib/coupleActivityApi';

// ========= PAGE =========
export default function CoupleActivityTracker() {
  const { userData } = useUser();
  const ownerId = getEffectiveOwnerId(userData);

  const [view, setView] = useState<ViewRange>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [types, setTypes] = useState<ActivityType[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // sharing
  const [shareSettings, setShareSettingsState] = useState<ShareSettings | null>(null);
  const [showTips, setShowTips] = useState(false);

  // add/edit form
  const [isEditing, setIsEditing] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; color: string; track_intensity: boolean }>({
    name: '',
    color: GRADIENTS[1],
    track_intensity: true,
  });

  const dateRange = useMemo(() => {
    if (view === 'week') return { start: startOfWeek(currentDate, { weekStartsOn: 0 }), end: endOfWeek(currentDate, { weekStartsOn: 0 }) };
    if (view === 'month') return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    return { start: startOfQuarter(currentDate), end: endOfQuarter(currentDate) };
  }, [view, currentDate]);

  // Load types and seed defaults if needed
  useEffect(() => {
    if (!ownerId) return;
    (async () => {
      try {
        setLoading(true);
        const existingTypes = await listTypes(ownerId);
        
        // If no types exist, seed with defaults
        if (existingTypes.length === 0) {
          console.log('No activity types found, seeding defaults...');
          const seededTypes: ActivityType[] = [];
          
          for (let i = 0; i < DEFAULT_COUPLE_TYPES.length; i++) {
            const preset = DEFAULT_COUPLE_TYPES[i];
            try {
              const saved = await upsertType({
                owner_user_id: ownerId,
                name: preset.name,
                color: preset.color,
                track_intensity: preset.track_intensity,
              });
              seededTypes.push(saved);
              console.log(`Seeded activity type: ${preset.name}`);
            } catch (seedError) {
              console.error(`Failed to seed ${preset.name}:`, seedError);
            }
          }
          setTypes(seededTypes);
        } else {
          setTypes(existingTypes.sort((a, b) => (a.sort_index || 0) - (b.sort_index || 0)));
        }
        
        const s = await getCoupleSettings(ownerId);
        setShareSettingsState(s ?? { owner_user_id: ownerId, share_with_partner: false });
      } catch (e: any) {
        console.error('Error loading activity types:', e);
        setError(e?.message ?? 'Failed to load activity types');
      } finally {
        setLoading(false);
      }
    })();
  }, [ownerId]);

  // Load logs for current date range
  useEffect(() => {
    if (!ownerId || types.length === 0) return;
    (async () => {
      try {
        const startISO = format(dateRange.start, 'yyyy-MM-dd');
        const endISO = format(dateRange.end, 'yyyy-MM-dd');
        const data = await listLogs(ownerId, startISO, endISO);
        setLogs(data);
      } catch (e: any) {
        console.error('Error loading logs:', e);
        setError(e?.message ?? 'Failed to load activity logs');
      }
    })();
  }, [ownerId, dateRange.start, dateRange.end, types.length]);

  const formatDateRange = () => {
    if (view === 'week') return `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`;
    if (view === 'month') return format(currentDate, 'MMMM yyyy');
    return `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${currentDate.getFullYear()}`;
  };

  const navigateDate = (dir: 'prev' | 'next') => {
    const d = new Date(currentDate);
    if (view === 'week') dir === 'prev' ? d.setDate(d.getDate() - 7) : d.setDate(d.getDate() + 7);
    if (view === 'month') dir === 'prev' ? d.setMonth(d.getMonth() - 1) : d.setMonth(d.getMonth() + 1);
    if (view === 'quarter') dir === 'prev' ? d.setMonth(d.getMonth() - 3) : d.setMonth(d.getMonth() + 3);
    setCurrentDate(d);
  };

  // ===== Add / Edit type =====
  const beginCreate = () => {
    setEditingTypeId(null);
    setForm({ name: '', color: GRADIENTS[1], track_intensity: true });
    setIsEditing(true);
  };

  const beginEdit = (t: ActivityType) => {
    setEditingTypeId(t.id);
    setForm({ name: t.name, color: t.color, track_intensity: t.track_intensity });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingTypeId(null);
    setForm({ name: '', color: GRADIENTS[1], track_intensity: true });
  };

  const saveType = async () => {
    if (!ownerId || !form.name.trim()) {
      setError('Activity name is required');
      return;
    }
    
    try {
      console.log('Saving activity type:', form);
      let saved;
      
      if (editingTypeId) {
        // Update existing activity type
        saved = await updateActivityType(editingTypeId, {
          name: form.name.trim(),
          color: form.color,
          track_intensity: form.track_intensity,
        });
        console.log('Updated activity type:', saved);
      } else {
        // Create new activity type
        saved = await upsertType({
          owner_user_id: ownerId,
          name: form.name.trim(),
          color: form.color,
          track_intensity: form.track_intensity,
        });
        console.log('Created activity type:', saved);
      }
      
      const next = editingTypeId
        ? types.map(t => (t.id === saved.id ? saved : t))
        : [saved, ...types].sort((a, b) => (a.sort_index || 0) - (b.sort_index || 0));
      
      setTypes(next);
      cancelEdit();
      setError(null);
    } catch (e: any) {
      console.error('Error saving activity type:', e);
      setError(e?.message ?? 'Failed to save activity type');
    }
  };

  const removeType = async (id: string) => {
    if (!confirm('Delete this activity type? Existing logs will remain.')) return;
    try {
      await deleteActivityType(id);
      setTypes(types.filter(t => t.id !== id));
    } catch (e: any) {
      console.error('Error deleting activity type:', e);
      setError(e?.message ?? 'Failed to delete activity type');
    }
  };

  // ===== Logging =====
  const marksForDate = (dateISO: string) => {
    const dayLogs = logs.filter(l => l.activity_date === dateISO);
    const items = dayLogs.map(log => {
      const t = types.find(tt => tt.id === log.activity_type_id);
      const hasIntensity = t?.track_intensity && (log.intensity ?? 0) > 0;
      return {
        habitId: log.activity_type_id,
        completed: hasIntensity || !t?.track_intensity,
        partial: t?.track_intensity && !hasIntensity,
        color: `linear-gradient(135deg, ${t?.color || '#01B1AF'}, ${t?.color || '#018a88'})`,
        name: t?.name ?? 'Activity',
      };
    });
    return items;
  };

  const toggleLog = async (type: ActivityType, dateISO: string) => {
    if (!ownerId || !userData?.id) return;
    
    const existing = logs.find(l => l.activity_type_id === type.id && l.activity_date === dateISO);
    
    try {
      if (!existing) {
        // Create new log
        const saved = await upsertLog({
          owner_user_id: ownerId,
          activity_type_id: type.id,
          activity_date: dateISO,
          count: 1,
          intensity: type.track_intensity ? 3 : null,
          notes: null,
          created_by_user_id: userData.id,
        });
        setLogs([saved, ...logs]);
      } else {
        // If intensity allowed, cycle through values; otherwise delete
        if (type.track_intensity) {
          const currentIntensity = existing.intensity || 0;
          const nextIntensity = currentIntensity >= 5 ? 0 : currentIntensity + 1;
          
          if (nextIntensity === 0) {
            // Delete the log
            await deleteActivityLog(existing.id);
            setLogs(logs.filter(l => l.id !== existing.id));
          } else {
            // Update intensity
            const saved = await upsertLog({
              owner_user_id: ownerId,
              activity_type_id: type.id,
              activity_date: dateISO,
              count: existing.count || 1,
              intensity: nextIntensity,
              notes: existing.notes,
              created_by_user_id: userData.id,
            });
            setLogs(logs.map(l => (l.id === saved.id ? saved : l)));
          }
        } else {
          // Simple toggle - delete the log
          await deleteActivityLog(existing.id);
          setLogs(logs.filter(l => l.id !== existing.id));
        }
      }
    } catch (e: any) {
      console.error('Error toggling log:', e);
      setError(e?.message ?? 'Failed to update activity log');
    }
  };

  // ===== Share toggle =====
  const toggleShare = async () => {
    if (!ownerId) return;
    try {
      const next = await updateCoupleSettings(ownerId, { share_enabled: !shareSettings?.share_with_partner });
      setShareSettingsState({ owner_user_id: ownerId, share_with_partner: next.share_enabled });
    } catch (e: any) {
      console.error('Error updating sharing:', e);
      setError(e?.message ?? 'Failed to update sharing');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* HERO */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Couple Activity Tracker</h1>
            <p className="text-base text-white/80">Track and understand your relationship activities and patterns</p>
          </div>
          <button
            onClick={() => setShowTips(v => !v)}
            className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">Tips</span>
            {showTips ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
          </button>
        </div>

        {showTips && (
          <div className="mt-6 bg-white/10 rounded-lg p-4 text-white/90 text-sm">
            • Keep 5–7 activity types • Use intensity for nuanced events (e.g., conflict) • Turn on sharing to let your partner view.
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Calendar Controls + Calendar */}
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-medium text-gray-900">Activity Calendar</h3>
          <div className="flex items-center space-x-2">
            <Button variant={view === 'week' ? 'primary' : 'outline'} size="sm" onClick={() => setView('week')}>Week</Button>
            <Button variant={view === 'month' ? 'primary' : 'outline'} size="sm" onClick={() => setView('month')}>Month</Button>
            <Button variant={view === 'quarter' ? 'primary' : 'outline'} size="sm" onClick={() => setView('quarter')}>Quarter</Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigateDate('prev')}
            className="p-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
            aria-label="Previous period"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">{formatDateRange()}</h2>
            {selectedDate && (
              <div className="text-xs text-gray-600 flex items-center justify-center">
                Tracking for {format(selectedDate, 'MMM d, yyyy')}
              </div>
            )}
          </div>
          <button
            onClick={() => navigateDate('next')}
            className="p-1.5 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
            aria-label="Next period"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <CalendarGrid
            currentDate={currentDate}
            view={view}
            marks={marksForDate}
            onCellClick={(iso) => {
              const [y, m, d] = iso.split('-').map(Number);
              setSelectedDate(new Date(y, m - 1, d));
            }}
          />
        </div>
      </div>

      {/* Types + Add/Edit */}
      <div className="bg-gray-100 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Activity Types ({types.length})</h3>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!shareSettings?.share_with_partner}
                onChange={toggleShare}
                className="h-4 w-4 rounded border-gray-300 text-[#01B1AF] focus:ring-[#01B1AF]"
              />
              Share with partner
            </label>
            <Button onClick={beginCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Type
            </Button>
          </div>
        </div>

        {isEditing && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-900 font-medium">{editingTypeId ? 'Edit Activity Type' : 'Add Activity Type'}</div>
              <button className="text-gray-400 hover:text-gray-600" onClick={cancelEdit}><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#01B1AF]"
                  placeholder="e.g., Date Night"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.track_intensity}
                    onChange={(e) => setForm({ ...form, track_intensity: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-[#01B1AF] focus:ring-[#01B1AF]"
                  />
                  Track intensity
                </label>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <GradientSwatches value={form.color} onChange={(c) => setForm({ ...form, color: c })} />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
              <Button onClick={saveType} disabled={!form.name.trim()}>
                {editingTypeId ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        )}

        {/* Type list */}
        {types.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">No activity types yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map(t => {
              const logCount = logs.filter(l => l.activity_type_id === t.id).length;
              return (
                <div key={t.id} className={`bg-gradient-to-br ${t.color} rounded-lg p-4 text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs opacity-80 mt-1">
                        {t.track_intensity ? 'Intensity enabled' : 'No intensity'} • {logCount} logs
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1 rounded bg-white/20 hover:bg-white/30"
                        onClick={() => beginEdit(t)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 rounded bg-white/20 hover:bg-white/30"
                        onClick={() => removeType(t.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quick log for selected date */}
                  {selectedDate && (
                    <div className="mt-4 pt-3 border-t border-white/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/80">{format(selectedDate, 'MMM d')}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const iso = format(selectedDate, 'yyyy-MM-dd');
                              toggleLog(t, iso);
                            }}
                            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
                          >
                            {(() => {
                              const iso = format(selectedDate, 'yyyy-MM-dd');
                              const log = logs.find(l => l.activity_type_id === t.id && l.activity_date === iso);
                              if (!log) return 'Log';
                              if (t.track_intensity) return `${log.intensity || 0}/5`;
                              return 'Logged';
                            })()}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}