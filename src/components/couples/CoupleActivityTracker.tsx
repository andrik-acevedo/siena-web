import { useEffect, useMemo, useState } from 'react';
import {
  addMonths,
  addQuarters,
  addWeeks,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  X,
  Star,
} from 'lucide-react';

import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';

import ActivityCalendarGrid, { CoupleViewRange } from './ActivityCalendarGrid';

import { DEFAULT_COUPLE_TYPES } from '../../lib/coupleActivityDefaults';

import {
  CoupleActivityLog,
  CoupleActivityType,
  deleteActivityLog,
  getCoupleSettings,
  getEffectiveOwnerId,
  listLogs,
  listTypes,
  updateCoupleSettings,
  upsertLog,
  upsertType,
} from '../../lib/coupleActivityApi';

import CoupleTrendsCard from './CoupleTrendsCard';

type RangeKey = 'week' | 'month' | 'quarter' | 'year' | 'all';

export default function CoupleActivityTracker() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPremium = hasAccess('couple-activity-tracker');

  if (!isPremium) {
    return (
      <FeatureAccessGuard featureId="couple-activity-tracker" currentPlan={currentPlan}>
        <CoupleActivityTrackerContent />
      </FeatureAccessGuard>
    );
  }
  return <CoupleActivityTrackerContent />;
}

function CoupleActivityTrackerContent() {
  const { userData } = useUser();
  const ownerId = getEffectiveOwnerId(userData);
  const isInvitee = Boolean(userData?.invited_by);
  const canWrite = !isInvitee || Boolean(isInvitee); // writes are allowed by RLS only when sharing is ON; UI still shows buttons

  // calendar + range
  const [view, setView] = useState<CoupleViewRange>('month');
  const [rangeKey, setRangeKey] = useState<RangeKey>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // data
  const [types, setTypes] = useState<CoupleActivityType[]>([]);
  const [logs, setLogs] = useState<CoupleActivityLog[]>([]);

  // ui
  const [showTips, setShowTips] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // calendar chips
  const [calendarFilterIds, setCalendarFilterIds] = useState<string[]>([]);

  // modal
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [modalDateISO, setModalDateISO] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // share toggle (owner controls; invitee reads)
  const [shareWithPartner, setShareWithPartner] = useState<boolean>(false);

  // favorites (just UI)
  const [favoriteNames, setFavoriteNames] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('couple_favorites');
      if (raw) setFavoriteNames(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('couple_favorites', JSON.stringify(favoriteNames));
    } catch {}
  }, [favoriteNames]);

  /* ---------- Range helpers ---------- */
  const range = useMemo(() => {
    switch (rangeKey) {
      case 'week':
        return { start: startOfWeek(currentDate, { weekStartsOn: 0 }), end: endOfWeek(currentDate, { weekStartsOn: 0 }) };
      case 'month':
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
      case 'quarter':
        return { start: startOfQuarter(currentDate), end: endOfQuarter(currentDate) };
      case 'year':
        return { start: startOfYear(currentDate), end: endOfYear(currentDate) };
      case 'all': {
        const today = new Date();
        return { start: new Date(today.getFullYear() - 2, 0, 1), end: endOfYear(today) };
      }
      default:
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    }
  }, [currentDate, rangeKey]);

  const title = useMemo(() => {
    if (rangeKey === 'week') return `${format(range.start, 'MMM d')} – ${format(range.end, 'MMM d, yyyy')}`;
    if (rangeKey === 'year') return format(currentDate, 'yyyy');
    if (rangeKey === 'all') return 'All time';
    return format(currentDate, 'MMMM yyyy');
  }, [rangeKey, range.start, range.end, currentDate]);

  const goPrev = () => {
    if (rangeKey === 'week') setCurrentDate(d => addWeeks(d, -1));
    else if (rangeKey === 'month') setCurrentDate(d => addMonths(d, -1));
    else if (rangeKey === 'quarter') setCurrentDate(d => addQuarters(d, -1));
    else if (rangeKey === 'year') setCurrentDate(d => new Date(d.getFullYear() - 1, d.getMonth(), d.getDate()));
  };
  const goNext = () => {
    if (rangeKey === 'week') setCurrentDate(d => addWeeks(d, 1));
    else if (rangeKey === 'month') setCurrentDate(d => addMonths(d, 1));
    else if (rangeKey === 'quarter') setCurrentDate(d => addQuarters(d, 1));
    else if (rangeKey === 'year') setCurrentDate(d => new Date(d.getFullYear() + 1, d.getMonth(), d.getDate()));
  };

  /* ---------- Load data ---------- */
  const refreshData = async () => {
    if (!ownerId) return;
    try {
      const existingTypes = await listTypes(ownerId);

      if (existingTypes.length === 0) {
        const seeded: CoupleActivityType[] = [];
        for (const preset of DEFAULT_COUPLE_TYPES) {
          try {
            const newType = await upsertType({
              owner_user_id: ownerId,
              name: preset.name,
              color: preset.color,
              track_intensity: (preset as any).track_intensity, // safe ignore
            } as any);
            seeded.push(newType);
          } catch (err) {
            console.warn('Failed to seed type:', preset.name, err);
          }
        }
        setTypes(seeded.sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        setTypes(existingTypes.sort((a, b) => a.name.localeCompare(b.name)));
      }

      // fetch current sharing state (owner controls; invitee reads value)
      const settings = await getCoupleSettings(ownerId);
      setShareWithPartner(!!settings?.share_enabled);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err?.message ?? 'Failed to load data');
    }
  };

  const refreshLogs = async () => {
    if (!ownerId) return;
    try {
      const startISO = format(range.start, 'yyyy-MM-dd');
      const endISO = format(range.end, 'yyyy-MM-dd');
      const logsData = await listLogs(ownerId, startISO, endISO);
      setLogs(logsData);
    } catch (err: any) {
      console.error('Error loading logs:', err);
      setError(err?.message ?? 'Failed to load logs');
    }
  };

  // first load
  useEffect(() => {
    refreshData();
  }, [ownerId]);

  // reload logs when range changes — but block invitee until sharing is ON
  useEffect(() => {
    if (!ownerId) return;
    if (isInvitee && !shareWithPartner) {
      setLogs([]);
      return;
    }
    refreshLogs();
  }, [ownerId, range.start, range.end, isInvitee, shareWithPartner]);

  /* ---------- Counts for chips ---------- */
  const countsByType = useMemo(() => {
    const map = new Map<string, number>();
    logs.forEach(l => map.set(l.activity_type_id, (map.get(l.activity_type_id) ?? 0) + (l.count ?? 1)));
    return map;
  }, [logs]);

  /* ---------- Calendar dots ---------- */
  function marksForDate(iso: string) {
    const dayLogs = logs.filter(l => l.activity_date === iso);
    const items: Array<{ id: string; color: string; label: string }> = [];

    dayLogs.forEach(log => {
      const type = types.find(t => t.id === log.activity_type_id);
      if (type) {
        items.push({
          id: log.id,
          color: type.color,
          label: `${type.name}${log.intensity ? ` (${log.intensity}/5)` : ''}`,
        });
      }
    });

    return calendarFilterIds.length > 0
      ? items.filter(item => {
          const log = dayLogs.find(l => l.id === item.id);
          return log && calendarFilterIds.includes(log.activity_type_id);
        })
      : items;
  }

  /* ---------- Day click -> open modal ---------- */
  function onDayClick(iso: string) {
    setModalDateISO(iso);
    setShowActivityDropdown(true);
  }

  /* ---------- Ensure/create a type by name ---------- */
  async function ensureTypeByName(name: string): Promise<CoupleActivityType> {
    const trimmedName = name.trim();
    let existing =
      types.find(t => t.name === trimmedName) ||
      types.find(t => t.name.toLowerCase() === trimmedName.toLowerCase());
    if (existing) return existing;
    if (!ownerId) throw new Error('Missing owner id');

    let preset =
      DEFAULT_COUPLE_TYPES.find(p => p.name === trimmedName) ||
      DEFAULT_COUPLE_TYPES.find(p => p.name.toLowerCase() === trimmedName.toLowerCase());

    const newType = await upsertType({
      owner_user_id: ownerId,
      name: preset?.name ?? trimmedName,
      color: preset?.color ?? '#018a88',
    } as any);

    setTypes(prev => [...prev, newType].sort((a, b) => a.name.localeCompare(b.name)));
    return newType;
  }

  /* ---------- Add / Remove ---------- */
  async function addToDateByName(name: string) {
    if (!ownerId || !userData?.id || !modalDateISO) return;
    const trimmedName = name.trim();

    setAddingId(trimmedName);
    try {
      const type = await ensureTypeByName(trimmedName);
      const newLog = await upsertLog({
        owner_user_id: ownerId,
        activity_type_id: type.id,
        activity_date: modalDateISO,
        count: 1,
        intensity: 3,
        notes: null,
        created_by_user_id: userData.id,
      });

      setLogs(prev => {
        const filtered = prev.filter(l => !(l.activity_type_id === type.id && l.activity_date === modalDateISO));
        return [newLog, ...filtered];
      });

      setTimeout(() => refreshLogs(), 300);
      toast.success(`Added ${type.name}`);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to add activity');
    } finally {
      setAddingId(null);
    }
  }

  async function addNewAndLog() {
    const name = newCategoryName.trim();
    if (!name) return;
    await addToDateByName(name);
    setNewCategoryName('');
  }

  async function removeFromDateByName(name: string) {
    if (!modalDateISO) return;
    const type = types.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (!type) return;
    const existingLog = logs.find(l => l.activity_type_id === type.id && l.activity_date === modalDateISO);
    if (!existingLog) return;

    try {
      await deleteActivityLog(existingLog.id);
      setLogs(prev => prev.filter(l => l.id !== existingLog.id));
      toast.success(`Removed ${type.name}`);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to remove activity');
    }
  }

  /* ---------- Share toggle (owner only) ---------- */
  async function toggleShare() {
    if (!ownerId) return;
    if (isInvitee) return; // invitee can’t toggle
    try {
      const updated = await updateCoupleSettings(ownerId, { share_enabled: !shareWithPartner });
      setShareWithPartner(!!updated.share_enabled);
      toast.success(`Sharing ${updated.share_enabled ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update sharing');
    }
  }

  /* ---------- Modal list ---------- */
  const modalItems = useMemo(() => {
    const byName = new Map<string, { name: string; color: string }>();
    types.forEach(t => byName.set(t.name.toLowerCase(), { name: t.name, color: t.color }));
    DEFAULT_COUPLE_TYPES.forEach(p => {
      const key = p.name.toLowerCase();
      if (!byName.has(key)) byName.set(key, { name: p.name, color: p.color });
    });
    return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [types]);

  const formatDateRange = () => {
    if (view === 'week') return `${format(range.start, 'MMM d')} - ${format(range.end, 'MMM d, yyyy')}`;
    if (view === 'month') return format(currentDate, 'MMMM yyyy');
    if (view === 'quarter') return `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${currentDate.getFullYear()}`;
    return title;
  };

  if (!ownerId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">Unable to load couple activity tracker</p>
          <p className="text-red-600 text-sm mt-2">Please refresh the page or contact support</p>
        </div>
      </div>
    );
  }

  // Invitee cannot view until sharing is ON
  if (isInvitee && !shareWithPartner) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900">Sharing is off</h2>
          <p className="text-sm text-blue-800 mt-2">
            Your partner hasn’t enabled sharing for the Couple Activity Tracker yet.
            Once they toggle it on in <span className="font-medium">Settings → Partner</span>,
            you’ll be able to view and add activities here.
          </p>
        </div>
      </div>
    );
  }

  /* ========================   UI   ======================== */

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* HERO */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Couple Activity Tracker</h1>
            <p className="text-lg text-white/80">Track shared activities and spot patterns together</p>
          </div>
          <button
            onClick={() => setShowTips(s => !s)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white rounded-lg px-3 py-2 transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="text-white text-sm font-medium">Tips</span>
            {showTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
        {showTips && (
          <div className="mt-6">
            <div className="bg-white/10 rounded-lg p-4 md:p-6 space-y-4 text-white text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-6 w-6 text-white mt-1">📊</div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Track consistently</h3>
                      <p className="text-white/80">Log activities right after they happen for the most accurate patterns.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-6 w-6 text-white mt-1">🔍</div>
                    <div>
                      <h3 className="text-lg font-medium text-white">Use filters</h3>
                      <p className="text-white/80">Filter the calendar and trends chart to focus on specific activity types.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
                  <ul className="text-white/80 space-y-2">
                    <li>• Click any calendar day to add activities</li>
                    <li>• Use the trends chart to spot patterns over time</li>
                    <li>• Enable sharing to let your partner view and add activities</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-2">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* CALENDAR CARD */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={shareWithPartner}
                onChange={toggleShare}
                disabled={isInvitee}
                className="h-4 w-4 rounded border-gray-300 text-[#01B1AF] focus:ring-[#01B1AF]"
              />
              {isInvitee ? 'Sharing (owner controls this)' : 'Share with partner'}
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                className="px-2 py-1 rounded bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4 text-gray-700" />
              </button>
              <div className="text-sm font-medium text-gray-800 min-w-[140px] text-center">{formatDateRange()}</div>
              <button
                onClick={goNext}
                className="px-2 py-1 rounded bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4 text-gray-700" />
              </button>
            </div>

            <div className="flex gap-1 w-full sm:w-auto justify-center">
              {(['week', 'month', 'quarter'] as CoupleViewRange[]).map(v => (
                <button
                  key={v}
                  onClick={() => { setView(v); setRangeKey(v as any); }}
                  className={`px-3 py-1.5 text-xs rounded transition-colors flex-1 sm:flex-none ${
                    view === v ? 'bg-[#01B1AF] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {v[0].toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* calendar filter chips */}
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Filter calendar view:</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCalendarFilterIds([])}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                calendarFilterIds.length === 0 ? 'bg-[#01B1AF] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Activities
            </button>
            {types.map(type => {
              const isActive = calendarFilterIds.includes(type.id);
              const count = countsByType.get(type.id) ?? 0;
              return (
                <button
                  key={type.id}
                  onClick={() => setCalendarFilterIds(prev => isActive ? prev.filter(id => id !== type.id) : [...prev, type.id])}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    isActive ? 'text-white border-transparent' : 'text-gray-800 hover:bg-gray-50'
                  }`}
                  style={{ backgroundColor: isActive ? type.color : '#fff', borderColor: isActive ? 'transparent' : type.color }}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.8)' : type.color }} />
                    {type.name}
                    <span className={`ml-1 inline-flex items-center justify-center text[11px] w-5 h-5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <ActivityCalendarGrid
            currentDate={currentDate}
            view={view}
            marks={marksForDate}
            onCellClick={onDayClick}
          />
        </div>
      </div>

      {/* DATE MODAL */}
      {showActivityDropdown && modalDateISO && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Activities for {format(new Date(modalDateISO + 'T00:00:00'), 'MMMM d, yyyy')}
              </h3>
              <button
                onClick={() => { setShowActivityDropdown(false); setModalDateISO(null); setNewCategoryName(''); setAddingId(null); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* New category quick add */}
            <div className="mb-4 rounded-lg border border-gray-200 p-3 bg-gray-50">
              <div className="flex gap-2">
                <input
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !addingId && newCategoryName.trim() && addNewAndLog()}
                  placeholder="Create new category (e.g., 'Exercise Together')"
                  className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#01B1AF] focus:border-transparent"
                />
                <button
                  onClick={addNewAndLog}
                  disabled={!newCategoryName.trim() || !!addingId}
                  className="rounded bg-[#01B1AF] px-3 py-2 text-sm text-white hover:bg-[#018a88] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {addingId === newCategoryName.trim() ? 'Adding…' : 'Add & Log'}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">Create a new activity type and log it for this date. Both partners will see this category.</p>
            </div>

            {/* All categories (favorites first) */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <div className="text-sm font-medium text-gray-700 mb-2">Available Activities ({modalItems.length})</div>
              {modalItems
                .sort((a, b) => {
                  const fa = favoriteNames.includes(a.name);
                  const fb = favoriteNames.includes(b.name);
                  if (fa && !fb) return -1;
                  if (!fa && fb) return 1;
                  return a.name.localeCompare(b.name);
                })
                .map(item => {
                  const type = types.find(t => t.name.toLowerCase() === item.name.toLowerCase());
                  const isSelected = !!(type && logs.some(l => l.activity_type_id === type.id && l.activity_date === modalDateISO));
                  const fav = favoriteNames.includes(item.name);
                  const pending = addingId === item.name;

                  return (
                    <div key={item.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        <button
                          type="button"
                          onClick={() => setFavoriteNames(prev => fav ? prev.filter(n => n !== item.name) : [...prev, item.name])}
                          title={fav ? 'Unpin from favorites' : 'Pin to favorites'}
                          className="hover:bg-gray-100 rounded p-1 transition-colors"
                        >
                          <Star className={`h-4 w-4 ${fav ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <button
                            onClick={() => removeFromDateByName(item.name)}
                            className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => addToDateByName(item.name)}
                            disabled={pending}
                            className="rounded bg-[#01B1AF] px-3 py-1 text-xs text-white hover:bg-[#018a88] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                          >
                            {pending ? 'Adding…' : 'Add'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => { setShowActivityDropdown(false); setModalDateISO(null); setNewCategoryName(''); setAddingId(null); }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= Trends ================= */}
      <CoupleTrendsCard title="Trends" types={types} logs={logs} />
    </div>
  );
}
