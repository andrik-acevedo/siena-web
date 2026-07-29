import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Pause, RotateCcw, Heart, Users,
  Timer as TimerIcon, Megaphone, Ear, Plus, Minus
} from 'lucide-react';
import Button from '../ui/Button';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { supabase } from '../../lib/supabase';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';

interface PartnerState {
  intensity: number;                 // 0–100
  emotion: string;                   // (hidden for now)
  partnerPerception: string;         // (hidden for now)
}

type Rating = { selfFeeling: string; partnerReported: string; overall: number };

// ---- Light UI palette ----
const CARD_BG = 'bg-gray-100';
const CARD_BORDER = 'border-gray-300';
const TEXT_PRIMARY = 'text-gray-900';
const TEXT_SECONDARY = 'text-gray-700';
const CHIP_BG = 'bg-gray-200';
const MUTED_LINE = 'bg-gray-400/50';

export default function CouplesLiveConvo() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPremium = hasAccess('live-check-in');

  if (!isPremium) {
    return (
      <FeatureAccessGuard featureId="live-check-in" currentPlan={currentPlan}>
        <CouplesLiveConvoContent />
      </FeatureAccessGuard>
    );
  }

  return <CouplesLiveConvoContent />;
}

function CouplesLiveConvoContent() {
  const { userData } = useUser();
  const navigate = useNavigate();

  // ---------------- Timer ----------------
  const [selectedDuration, setSelectedDuration] = useState(300);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const tickRef = useRef<number | null>(null);

  // ---------------- Roles ----------------
  const [speaker, setSpeaker] = useState<'A'|'B'>('A');

  // ---------------- Partner states ----------------
  const [partnerA, setPartnerA] = useState<PartnerState>({ intensity: 50, emotion: '', partnerPerception: '' });
  const [partnerB, setPartnerB] = useState<PartnerState>({ intensity: 50, emotion: '', partnerPerception: '' });

  // ---------------- Ratings ----------------
  const [ratingA, setRatingA] = useState<Rating>({ selfFeeling: '', partnerReported: '', overall: 3 });
  const [ratingB, setRatingB] = useState<Rating>({ selfFeeling: '', partnerReported: '', overall: 3 });
  const [saving, setSaving] = useState(false);

  // ---------------- Time-weighted avgs ----------------
  const twSumA = useRef(0);  const twTimeA = useRef(0);
  const twSumB = useRef(0);  const twTimeB = useRef(0);

  // ---------------- Alarm ----------------
  const beep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      o.start();
      setTimeout(() => {
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
        setTimeout(() => { o.stop(); ctx.close(); }, 200);
      }, 260);
    } catch {/* ignore */}
  }, []);

  // ---------------- Timer loop ----------------
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      tickRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setSessionComplete(true);
            beep();
            return 0;
          }
          twSumA.current += partnerA.intensity; twTimeA.current += 1;
          twSumB.current += partnerB.intensity; twTimeB.current += 1;
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
  }, [isTimerRunning, timeRemaining, partnerA.intensity, partnerB.intensity, beep]);

  // ---------------- Controls ----------------
  const startTimer = () => { setIsTimerRunning(true); setTimerStarted(true); setSessionComplete(false); };
  const pauseTimer = () => setIsTimerRunning(false);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeRemaining(selectedDuration);
    setTimerStarted(false);
    setSessionComplete(false);
    setPartnerA({ intensity: 50, emotion: '', partnerPerception: '' });
    setPartnerB({ intensity: 50, emotion: '', partnerPerception: '' });
    setRatingA({ selfFeeling: '', partnerReported: '', overall: 3 });
    setRatingB({ selfFeeling: '', partnerReported: '', overall: 3 });
    twSumA.current = twTimeA.current = twSumB.current = twTimeB.current = 0;
  };
  const handleDurationChange = (sec: number) => {
    setSelectedDuration(sec); setTimeRemaining(sec);
    setIsTimerRunning(false); setTimerStarted(false); setSessionComplete(false);
    twSumA.current = twTimeA.current = twSumB.current = twTimeB.current = 0;
  };

  // ---------------- Helpers ----------------
  const formatTime = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const zone = (x: number) =>
    x <= 40 ? { key: 'green',  color: 'bg-green-500',  text: 'text-green-600',  label: 'Calm' }
  : x <= 70 ? { key: 'yellow', color: 'bg-yellow-500', text: 'text-yellow-600', label: 'Moderate' }
            : { key: 'red',    color: 'bg-red-500',    text: 'text-red-600',    label: 'Intense' };

  const timeWeightedAvg = (sumRef: React.MutableRefObject<number>, timeRef: React.MutableRefObject<number>, fallback: number) =>
    timeRef.current > 0 ? Math.round(sumRef.current / timeRef.current) : fallback;

  const blockScrollHandlers = {
    onTouchStart: (e: React.TouchEvent) => e.stopPropagation(),
    onTouchMove:  (e: React.TouchEvent) => e.preventDefault(),
    onWheel:      (e: React.WheelEvent) => e.preventDefault(),
  } as const;

  // ---------------- UI parts ----------------
  const ThermometerScale = () => (
    <div className="h-40 w-9 flex flex-col justify-between items-end pr-1 select-none">
      {[100,75,50,25,0].map((n) => (
        <div key={n} className="relative flex items-center">
          <div className={`h-[1px] w-3 ${MUTED_LINE} mr-1`} />
          <div className="text-[11px] text-gray-600 tabular-nums">{n}</div>
        </div>
      ))}
    </div>
  );

  const Slider = ({ value, setValue, label }:{
    value:number; setValue:(n:number)=>void; label:string
  }) => {
    const z = zone(value);
    return (
      <div className="flex items-center gap-3">
        <ThermometerScale />
        <div className="flex flex-col items-center">
          <div className="text-center mb-1">
            <div className={`text-lg font-bold ${TEXT_PRIMARY}`}>{value}</div>
            <div className={`text-xs ${z.text}`}>{z.label}</div>
          </div>

          <div
            className="relative h-40 w-[70px] rounded-full bg-gray-200 overflow-hidden"
            style={{ touchAction: 'none' }}
            {...blockScrollHandlers}
          >
            <div className="absolute bottom-0 w-full h-[40%] bg-green-500/20" />
            <div className="absolute bottom-[40%] w-full h-[30%] bg-yellow-500/20" />
            <div className="absolute bottom-[70%] w-full h-[30%] bg-red-500/20" />
            <div className={`absolute bottom-0 w-full ${z.color}`} style={{ height: `${value}%` }} />
            <input
              type="range" min={0} max={100} step={5} value={value} aria-label={label}
              onChange={(e)=>setValue(parseInt(e.target.value,10))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ WebkitAppearance: 'slider-vertical', writingMode: 'bt-lr' as any, touchAction: 'none' }}
              {...blockScrollHandlers}
            />
          </div>

          <div className="flex items-center gap-3 mt-3">
            <button
              className={`px-4 py-2 rounded-xl ${CHIP_BG} ${TEXT_PRIMARY} border ${CARD_BORDER}`}
              onClick={()=>setValue(Math.max(0, value - 5))}
            >
              <Minus className="h-5 w-5" />
            </button>
            <button
              className={`px-4 py-2 rounded-xl ${CHIP_BG} ${TEXT_PRIMARY} border ${CARD_BORDER}`}
              onClick={()=>setValue(Math.min(100, value + 5))}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Self guidance
  const selfMessage = (myZone:'green'|'yellow'|'red', isSpeaker:boolean) => {
    if (myZone === 'green') return "You're doing great";
    if (myZone === 'yellow') return isSpeaker
      ? 'You’re activated. Breathe. Speak in shorter sentences. Ask for a brief pause.'
      : 'You’re activated. Slow cadence. Keep your voice soft. Long exhale.';
    return isSpeaker
      ? 'You’re overwhelmed. Stop and breathe. Request a break. Revisit later.'
      : 'You’re overwhelmed. Name it and breathe. Suggest a break.';
  };

  // Partner guidance
  const partnerMessage = (theirZone:'green'|'yellow'|'red') => {
    if (theirZone === 'green') return 'Your partner seems regulated.';
    if (theirZone === 'yellow') return 'Partner is activated. Slow down. Validate. Offer a pause.';
    return 'Partner is very upset. Validate, breathe together, and suggest a break to try later.';
  };

  const Guidance = ({
    meZone, partnerZone, role
  }: { meZone: ReturnType<typeof zone>; partnerZone: ReturnType<typeof zone>; role:'Speaker'|'Listener' }) => {
    const mine = selfMessage(meZone.key as 'green'|'yellow'|'red', role==='Speaker');
    const aboutPartner = partnerMessage(partnerZone.key as 'green'|'yellow'|'red');
    return (
      <div className="flex flex-col gap-3 w-full max-w-[300px]">
        <div className={`text-[13px] ${TEXT_PRIMARY} bg-[#0c4a4e]/10 border border-[#0c4a4e]/25 rounded-lg px-3 py-2`}>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-[#0ea5a8]">
            <span className="w-2 h-2 rounded-full bg-[#50e3e6]" /> For you
          </div>
          <div className="mt-1">{mine}</div>
        </div>
        <div className={`text-[13px] ${TEXT_PRIMARY} bg-[#312e81]/10 border border-[#312e81]/25 rounded-lg px-3 py-2`}>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-[#7c5ae6]">
            <span className="w-2 h-2 rounded-full bg-[#a78bfa]" /> About your partner
          </div>
          <div className="mt-1">{aboutPartner}</div>
        </div>
      </div>
    );
  };

  /** ---- Mobile-only arrows (face each other) ---- */
  const BottomArrow = ({ color }:{ color:string }) => (
    <div
      className="absolute left-1/2 -translate-x-1/2 md:hidden pointer-events-none"
      style={{
        bottom: -12,
        width: 0,
        height: 0,
        borderLeft: '12px solid transparent',
        borderRight: '12px solid transparent',
        borderTop: `12px solid ${color}`
      }}
    />
  );
  const TopArrow = ({ color }:{ color:string }) => (
    <div
      className="absolute left-1/2 -translate-x-1/2 md:hidden pointer-events-none"
      style={{
        top: -12,
        width: 0,
        height: 0,
        borderLeft: '12px solid transparent',
        borderRight: '12px solid transparent',
        borderBottom: `12px solid ${color}`
      }}
    />
  );

  const PartnerPane = ({
    who, state, setState, name, borderHex, showBottomArrow=false, showTopArrow=false
  }:{
    who:'A'|'B';
    state:PartnerState;
    setState:(s:PartnerState)=>void;
    name:string;
    borderHex:string;
    showBottomArrow?:boolean;
    showTopArrow?:boolean;
  }) => {
    const zMe = zone(state.intensity);
    const other = who === 'A' ? partnerB : partnerA;
    const zOther = zone(other.intensity);
    const isSpeaker = speaker === who;

    const listenerCue =
      (speaker !== who && (zOther.key === 'yellow' || zOther.key === 'red'))
        ? (zOther.key === 'red' ? 'ring-2 ring-red-400/70' : 'ring-2 ring-yellow-400/60')
        : 'ring-0';

    return (
      <div className="w-full">
        <div
          className={`relative rounded-2xl border-4 p-4 pb-6 ${CARD_BG} shadow-lg ${listenerCue}`}
          style={{ borderColor: borderHex }}
        >
          {showBottomArrow && <BottomArrow color={borderHex} />}
          {showTopArrow && <TopArrow color={borderHex} />}

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-white p-2 rounded-full border border-gray-200">
                <Users className="h-5 w-5 text-gray-700" />
              </div>
              <h2 className={`${TEXT_PRIMARY} font-semibold`}>{name}</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={()=>setSpeaker(who)}
                className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  isSpeaker ? 'bg-[#01B1AF] text-white' : `${CHIP_BG} ${TEXT_PRIMARY}`
                }`}
              >
                <Megaphone className="h-3.5 w-3.5" /> Speaker
              </button>
              <button
                onClick={()=>setSpeaker(who==='A'?'B':'A')}
                className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${CHIP_BG} ${TEXT_PRIMARY}`}
              >
                <Ear className="h-3.5 w-3.5" /> Listener
              </button>
            </div>
          </div>

          <div className="flex items-start justify-center gap-6">
            <Slider value={state.intensity} setValue={(n)=>setState({ ...state, intensity:n })} label={`${name} intensity`} />
            <Guidance meZone={zMe} partnerZone={zOther} role={isSpeaker ? 'Speaker' : 'Listener'} />
          </div>

          <div className="flex items-center justify-center gap-2 mt-3">
            <div className={`w-3 h-3 rounded-full ${zMe.color}`} />
            <span className="text-xs text-gray-700">{zMe.label}</span>
          </div>
        </div>
      </div>
    );
  };

  // ---------------- Render ----------------
  const timeWeightedAvgA = timeWeightedAvg(twSumA, twTimeA, partnerA.intensity);
  const timeWeightedAvgB = timeWeightedAvg(twSumB, twTimeB, partnerB.intensity);

  const timerOptions = [
    { value: 300,  label: '5m'  },
    { value: 600,  label: '10m' },
    { value: 900,  label: '15m' },
    { value: 1200, label: '20m' },
    { value: 1800, label: '30m' },
  ];

  const saveRatings = async () => {
    if (!userData?.id) return;
    setSaving(true);
    try {
      const rows = [
        {
          user_id: userData.id,
          partner_label: 'A',
          self_feeling: ratingA.selfFeeling,
          partner_reported_feeling: ratingA.partnerReported,
          overall_rating: ratingA.overall,
          intensity_avg: timeWeightedAvgA,
        },
        {
          user_id: userData.id,
          partner_label: 'B',
          self_feeling: ratingB.selfFeeling,
          partner_reported_feeling: ratingB.partnerReported,
          overall_rating: ratingB.overall,
          intensity_avg: timeWeightedAvgB,
        },
      ];
      const { error } = await supabase.from('couple_convo_logs').insert(rows);
      if (error) throw error;
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Hero */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-2">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">Couples Live Check-In</h1>
          <p className="text-lg text-white/90">Real-time emotional awareness and connection tool for couples</p>
        </div>
      </div>

      {/* Sticky timer */}
      <div className="sticky top-[64px] z-30">
        <div className={`${CARD_BG} ${TEXT_PRIMARY} rounded-xl border ${CARD_BORDER} p-3 sm:p-4 shadow`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <TimerIcon className="h-4 w-4" />
              <div className="px-3 py-1 rounded bg-white text-gray-900 font-mono text-sm min-w-[72px] text-center border border-gray-200">
                {formatTime(timeRemaining)}
              </div>
              {!timerStarted && (
                <div className={`flex items-center gap-1 ${CHIP_BG} rounded-lg p-1`}>
                  {timerOptions.map(o => (
                    <button
                      key={o.value}
                      onClick={()=>handleDurationChange(o.value)}
                      className={`px-2 py-1 rounded ${selectedDuration===o.value ? 'bg-[#01B1AF] text-white' : 'text-gray-800 hover:bg-white'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!timerStarted ? (
                <Button onClick={startTimer} className="bg-[#01B1AF] text-white"><Play className="h-4 w-4 mr-1" />Start</Button>
              ) : (
                <>
                  <Button onClick={isTimerRunning ? pauseTimer : startTimer} variant="outline" className="border-gray-300 text-gray-800">
                    {isTimerRunning ? <><Pause className="h-4 w-4 mr-1" />Pause</> : <><Play className="h-4 w-4 mr-1" />Resume</>}
                  </Button>
                  <Button onClick={resetTimer} variant="outline" className="border-gray-300 text-gray-800">
                    <RotateCcw className="h-4 w-4 mr-1" />Reset
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main module */}
      <div className="space-y-4">
        {/* --- Mobile (tight stack, no overlap) --- */}
        <div className="block md:hidden">
          <div className="flex flex-col gap-1">
            {/* TOP = Partner B (arrow DOWN) */}
            <div className="relative h-[360px] w-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="transform -rotate-90 scale-[0.99] origin-center w-[420px] max-w-[96vw]">
                  <PartnerPane
                    who="B"
                    state={partnerB}
                    setState={setPartnerB}
                    name="Partner B"
                    borderHex="#01B1AF"
                    showBottomArrow
                  />
                </div>
              </div>
            </div>

            {/* BOTTOM = Partner A (arrow UP) */}
            <div className="relative h-[360px] w-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="transform rotate-90 scale-[0.99] origin-center w-[420px] max-w-[96vw]">
                  <PartnerPane
                    who="A"
                    state={partnerA}
                    setState={setPartnerA}
                    name={userData?.first_name || 'Partner A'}
                    borderHex="#A3E635"
                    showTopArrow
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Desktop / Tablet --- */}
        <div className="hidden md:block">
          <div className="p-2">
            <div className="grid grid-cols-2 gap-4 items-stretch">
              <PartnerPane
                who="A"
                state={partnerA}
                setState={setPartnerA}
                name={userData?.first_name || 'Partner A'}
                borderHex="#A3E635"
              />
              <PartnerPane
                who="B"
                state={partnerB}
                setState={setPartnerB}
                name="Partner B"
                borderHex="#01B1AF"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#01B1AF] rounded-lg p-6">
        <h3 className="text-white font-bold text-center mb-4">Live Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[{n:userData?.first_name || 'Partner A', s:partnerA, avg:timeWeightedAvgA, r:'A'},
            {n:'Partner B', s:partnerB, avg:timeWeightedAvgB, r:'B'}].map(({n,s,avg,r})=>(
            <div key={r} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900">{n}</div>
                <div className="text-sm text-gray-600">{speaker===r ? 'Speaker' : 'Listener'}</div>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                Intensity: <b>{s.intensity}</b> (time-weighted avg: <b>{avg}</b>)
              </div>
            </div>
          ))}
        </div>

        {sessionComplete && (
          <div className="mt-6 bg-gradient-to-r from-[#01B1AF] to-[#ea697c] rounded-lg p-6 text-center">
            <div className="bg-white/20 p-3 rounded-full inline-block mb-3">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Check-In Complete</h3>
            <p className="text-white/90">Take a breath together and share what you noticed about yourselves and each other.</p>
          </div>
        )}
      </div>

      {/* Ratings & Log */}
      <div className="mt-2 bg-[#01B1AF] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">How did this conversation feel?</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Partner A */}
          <div className="bg-white/10 border border-white/20 rounded-lg p-4">
            <div className="font-medium mb-2 text-white">{userData?.first_name || 'Partner A'}</div>

            <label className="block text-sm text-white mb-1">How I felt</label>
            <textarea
              className="w-full rounded-md border border-gray-300 p-2 text-sm mb-3"
              rows={3}
              value={ratingA.selfFeeling}
              onChange={(e)=>setRatingA(r=>({ ...r, selfFeeling: e.target.value }))}
              placeholder="e.g., tense at first, calmer after pausing…"
            />

            <label className="block text-sm text-white mb-1">How my partner reported feeling</label>
            <textarea
              className="w-full rounded-md border border-gray-300 p-2 text-sm mb-3"
              rows={3}
              value={ratingA.partnerReported}
              onChange={(e)=>setRatingA(r=>({ ...r, partnerReported: e.target.value }))}
              placeholder="e.g., said they felt heard and less defensive…"
            />

            <label className="block text-sm text-white mb-1">Overall rating</label>
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map(n=>(
                <button
                  key={n}
                  type="button"
                  onClick={()=>setRatingA(r=>({ ...r, overall:n }))}
                  className={`px-3 py-1 rounded-md border ${ratingA.overall===n ? 'bg-white text-[#01B1AF] border-white' : 'bg-white/20 text-white border-white/30'}`}
                >
                  {n}
                </button>
              ))}
              <span className="text-xs text-white/70 ml-2">Time-weighted avg: {timeWeightedAvgA}</span>
            </div>
          </div>

          {/* Partner B */}
          <div className="bg-white/10 border border-white/20 rounded-lg p-4">
            <div className="font-medium mb-2 text-white">Partner B</div>

            <label className="block text-sm text-white mb-1">How I felt</label>
            <textarea
              className="w-full rounded-md border border-gray-300 p-2 text-sm mb-3"
              rows={3}
              value={ratingB.selfFeeling}
              onChange={(e)=>setRatingB(r=>({ ...r, selfFeeling: e.target.value }))}
            />

            <label className="block text-sm text-white mb-1">How my partner reported feeling</label>
            <textarea
              className="w-full rounded-md border border-gray-300 p-2 text-sm mb-3"
              rows={3}
              value={ratingB.partnerReported}
              onChange={(e)=>setRatingB(r=>({ ...r, partnerReported: e.target.value }))}
            />

            <label className="block text-sm text-white mb-1">Overall rating</label>
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map(n=>(
                <button
                  key={n}
                  type="button"
                  onClick={()=>setRatingB(r=>({ ...r, overall:n }))}
                  className={`px-3 py-1 rounded-md border ${ratingB.overall===n ? 'bg-white text-[#01B1AF] border-white' : 'bg-white/20 text-white border-white/30'}`}
                >
                  {n}
                </button>
              ))}
              <span className="text-xs text-white/70 ml-2">Time-weighted avg: {timeWeightedAvgB}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={saveRatings} disabled={saving} className="bg-white text-[#01B1AF] hover:bg-gray-100">
            {saving ? 'Saving…' : 'Save log'}
          </Button>
        </div>
      </div>
    </div>
  );
}
