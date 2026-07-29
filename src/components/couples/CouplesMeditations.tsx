// src/components/meditations/CouplesMeditations.tsx
import { useState, useEffect } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Clock,
  Info, ChevronDown, ChevronUp, Lightbulb, CheckCircle2
} from 'lucide-react';
import TileCard, { GRADIENT_COLORS } from '../ui/TileCard';
import BreathRings from '../breathing/BreathRings';
import { useSubscription } from '../../context/SubscriptionContext';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';

interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: number;
  audioUrl: string;
  category: 'connection' | 'intimacy';
}

const COUPLES_MEDITATIONS: Meditation[] = [
  { id: '3',  title: 'Couples Meditation', description: 'Build love and connection with your partner', duration: 540, audioUrl: 'https://static.wixstatic.com/mp3/4e16d8_82a67ed3b51a483eb3da304497ca1241.mp3', category: 'connection' },
  { id: '10', title: 'Sexy Meditation', description: 'Set a sexy mood', duration: 900, audioUrl: 'https://static.wixstatic.com/mp3/4e16d8_648bfb5a4c094e04858c89c06bbc4d5c.mp3', category: 'intimacy' },
  { id: '11', title: 'Emotional Grounding for Tough Days', description: 'Find stability together during challenging times', duration: 720, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_a1b1113e35144eaba89d8774c9a6589a.mp3', category: 'connection' },
  { id: '12', title: 'Exploring Fantasies in a Safe Space', description: 'Create a foundation for intimate conversations', duration: 840, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_09a1dbb727b049b8bdf7956892ccac39.mp3', category: 'intimacy' },
  { id: '13', title: 'Breath & Body Awareness as One', description: 'Synchronize your breath and energy together', duration: 600, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_dd8f716876df4107a5a56b4e6e424150.mp3', category: 'connection' },
  { id: '14', title: 'Deep Connection & Loving-Kindness', description: 'Cultivate compassion and love for each other', duration: 780, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_fd3fa12c1c994816b62dd12b14c2c596.mp3', category: 'connection' },
  { id: '15', title: 'Gratitude in Partnership', description: 'Appreciate the gifts your relationship brings', duration: 660, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_f485779130554b818b02f488fbd96abe.mp3', category: 'connection' },
  { id: '16', title: 'Asking for What you Need', description: 'Practice expressing desires and boundaries', duration: 720, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_1fd96dbfc6b44cc8a5bf1ec0d1214935.mp3', category: 'intimacy' },
  { id: '17', title: 'Evening Wind-Down Together', description: 'Relax and prepare for restful sleep as a couple', duration: 900, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_a09e59a2e1584095855fef57b7f6c0ea.mp3', category: 'connection' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Meditations' },
  { id: 'connection', label: 'Connection' },
  { id: 'intimacy', label: 'Intimacy' },
];

export default function CouplesMeditations() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPremium = hasAccess('couples-meditations');

  if (!isPremium) {
    return (
      <FeatureAccessGuard featureId="couples-meditations" currentPlan={currentPlan}>
        <CouplesMeditationsContent />
      </FeatureAccessGuard>
    );
  }

  return <CouplesMeditationsContent />;
}

function CouplesMeditationsContent() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [audio] = useState(new Audio());
  const [showTips, setShowTips] = useState(false); // collapsed by default

  // Breathing controls (single working dropdown beside Play/Pause)
  const [breathPreset, setBreathPreset] =
    useState<'4-7-8' | 'Box 4-4-4-4' | 'Calm 5-5-5'>('Calm 5-5-5');
  const [breathGradientIndex, setBreathGradientIndex] = useState<number>(7); // couples vibe: Watermelon→Berry Wine

  const filteredMeditations =
    selectedCategory === 'all'
      ? COUPLES_MEDITATIONS
      : COUPLES_MEDITATIONS.filter((m) => m.category === selectedCategory);

  useEffect(() => {
    audio.loop = true;
    return () => {
      audio.pause();
      audio.src = '';
      audio.loop = false;
    };
  }, [audio]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlay = (meditation: Meditation) => {
    if (playing === meditation.id) {
      audio.pause();
      setPlaying(null);
    } else {
      if (playing) audio.pause();
      audio.src = meditation.audioUrl;
      audio.muted = muted;
      audio.play();
      setPlaying(meditation.id);
    }
  };

  const toggleMute = () => {
    audio.muted = !muted;
    setMuted(!muted);
  };

  // Optional polish: pick ring gradient by selected category
  useEffect(() => {
    if (selectedCategory === 'connection') setBreathGradientIndex(7); // pink/berry
    else if (selectedCategory === 'intimacy') setBreathGradientIndex(4); // coral/crimson
    else setBreathGradientIndex(7);
  }, [selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* ===== Header (unchanged; only Tips on the right) ===== */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-6">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="pr-3">
              <h1 className="text-4xl font-bold text-white mb-2">Couples Meditations</h1>
              <p className="text-lg text-white/80">
                Strengthen your connection and intimacy with guided meditations for couples
              </p>
            </div>
            {/* Tips toggle only */}
            <button
              onClick={() => setShowTips((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-colors"
              aria-expanded={showTips}
              aria-controls="couples-meditations-tips"
            >
              <Info className="h-4 w-4" />
              <span className="font-medium">Tips</span>
              {showTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Tips (collapsible) ===== */}
      <div
        id="couples-meditations-tips"
        className={`transition-all duration-300 ease-in-out overflow-hidden ${showTips ? 'max-h-[2000px] mb-8' : 'max-h-0 mb-0'}`}
      >
        <div className="bg-gradient-to-b from-[#01B1AF] to-[#018a88] rounded-xl p-5 md:p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white/10 border border-white/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-white" />
                <h3 className="text-white font-semibold">Best Practices</h3>
              </div>
              <ul className="text-white/90 space-y-2 text-sm leading-relaxed">
                <li>• Pick a meditation that matches your current need — calming, sensual, or grounding.</li>
                <li>• Use headphones or a shared speaker to minimize distractions.</li>
                <li>• Set aside <span className="font-medium">10–20 minutes</span> without interruptions.</li>
                <li>• Focus on breathing together and gentle presence.</li>
              </ul>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <h3 className="text-white font-semibold">Tips for Couples</h3>
              </div>
              <div className="text-white/90 text-sm space-y-3 leading-relaxed">
                <p><span className="font-semibold">Connection Meditations:</span> Sync breathing, calm nervous systems, cultivate presence.</p>
                <p><span className="font-semibold">Intimacy Meditations:</span> Approach with playfulness and safety; check in before and after.</p>
                <p>After finishing, share one word or sentence about how you feel — no fixing, just listening.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Breathing panel (white) ===== */}
      <div className="mb-10 rounded-xl bg-white shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <button
            onClick={() => setPlaying((p) => {
              if (p) { audio.pause(); return null; }
              const first = filteredMeditations[0];
              if (first) {
                audio.src = first.audioUrl;
                audio.muted = muted;
                audio.play();
                return first.id;
              }
              return null;
            })}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-[#01B1AF] text-white hover:opacity-90"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? "Pause" : "Play"}
          </button>

          {/* Single working preset dropdown (visible dark text) */}
          <label htmlFor="breathPresetCouples" className="sr-only">Breathing preset</label>
          <select
            id="breathPresetCouples"
            value={breathPreset}
            onChange={(e) => setBreathPreset(e.target.value as any)}
            className="rounded-full border border-gray-300 px-3 py-2 text-sm text-[#03274B] bg-white"
          >
            <option value="4-7-8">4-7-8</option>
            <option value="Box 4-4-4-4">Box 4-4-4-4</option>
            <option value="Calm 5-5-5">Calm 5-5-5</option>
          </select>

          <div className="text-sm text-gray-600">
            Breathing is <span className="font-medium">{playing ? 'running' : 'paused'}</span>
          </div>
        </div>

        <div className="w-full flex items-center justify-center p-6">
          <BreathRings
            size={420}
            rings={4}
            minScale={0.58}
            maxScale={1.0}
            gradientIndex={breathGradientIndex}
            presetName={breathPreset}
            running={!!playing}
            blur
          />
        </div>
      </div>

      {/* ===== Category filter ===== */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-[#01B1AF] text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-[#01B1AF] hover:text-[#01B1AF]'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* ===== Meditations grid ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMeditations.map((meditation, index) => {
          const gradientColor = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
          const isPlaying = playing === meditation.id;

          return (
            <div
              key={meditation.id}
              className={`bg-gradient-to-br ${gradientColor} rounded-xl shadow-md transition-all transform hover:scale-105 hover:shadow-lg`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-medium text-white mb-2">{meditation.title}</h3>
                    <p className="text-white/80 mb-3">{meditation.description}</p>
                    <div className="flex items-center flex-wrap gap-2">
                      <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1">
                        <Clock className="h-4 w-4 text-white mr-1" />
                        <span className="text-sm font-medium text-white">
                          {formatDuration(meditation.duration)}
                        </span>
                      </div>
                      <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1">
                        <span className="text-sm font-medium text-white">{meditation.category}</span>
                      </div>
                      {isPlaying && (
                        <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1">
                          <span className="text-sm font-medium text-white">Breathing synced</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleMute}
                      className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                      aria-label={muted ? 'Unmute' : 'Mute'}
                    >
                      {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                    </button>
                    <button
                      onClick={() => handlePlay(meditation)}
                      className={`p-3 rounded-full transition-colors ${
                        isPlaying ? 'bg-white text-[#01B1AF]' : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
