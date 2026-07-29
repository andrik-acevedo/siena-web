import { useState, useEffect, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, Clock, HelpCircle, ChevronDown, ChevronUp, Maximize2, Brain, Heart, Sparkles, X } from 'lucide-react';
import { GRADIENT_COLORS } from '../ui/TileCard';
import BreathRings from '../breathing/BreathRings';
import FullscreenBreathOverlay from './FullscreenBreathOverlay';
import { useSubscription } from '../../context/SubscriptionContext';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';

interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: number;
  audioUrl: string;
  category: 'healing' | 'couples' | 'music' | 'binaural';
}

const MEDITATIONS: Meditation[] = [
  { id: '1',  title: 'Self-Worth', description: 'A gentle guided meditation focusing on self-worth', duration: 540, audioUrl: 'https://static.wixstatic.com/mp3/4e16d8_ba9bb74ada884f5a8b5841ee02978314.mp3', category: 'healing' },
  { id: '2',  title: 'Letting Go', description: 'A meditation designed to help you let go', duration: 540, audioUrl: 'https://static.wixstatic.com/mp3/4e16d8_d7192bc0208740c580fe3c2373611fd1.mp3', category: 'healing' },
  { id: '3',  title: 'Couples Meditation', description: 'Build love and connection with your partner', duration: 540, audioUrl: 'https://static.wixstatic.com/mp3/4e16d8_82a67ed3b51a483eb3da304497ca1241.mp3', category: 'couples' },
  { id: '4',  title: 'Emotional Regulation', description: 'A quick way to ground quickly', duration: 240, audioUrl: 'https://static.wixstatic.com/mp3/4e16d8_65e41d47c8494041881ae090c682c72a.mp3', category: 'healing' },
  { id: '5',  title: 'Relaxing Music', description: 'Music to southe your soul', duration: 540, audioUrl: 'https://static.wixstatic.com/mp3/4e16d8_1eaf921b285347faa78517cb480307c6.mp3', category: 'music' },
  { id: '6',  title: 'Deep Meditation', description: 'A meditation to help you enter a state of wholeness', duration: 660, audioUrl: 'https://static.wixstatic.com/mp3/4e16d8_ca98cf3e9f8548f88c0e446ea99760c6.mp3', category: 'music' },
  { id: '7',  title: 'Binaural Mediation - Focus', description: 'Binaural meditation for relaxed focus', duration: 900, audioUrl: 'https://static.wixstatic.com/mp3/4e16d8_b93d8e1e56414679b4abfdcdca83c27a.mp3', category: 'binaural' },
  { id: '8',  title: 'Binaural Meditation - Zen', description: 'Binaural zen meditation', duration: 600, audioUrl: 'https://static.wixstatic.com/mp3/4e16d8_5f15586c0f3c4a3a8c9f00c054f2bf06.mp3', category: 'binaural' },
  { id: '9',  title: 'Binaural Meditation - 3Mhz', description: 'Binaural 3Mhz meditation', duration: 540, audioUrl: 'https://static.wixstatic.com/mp3/4e16d8_b18e66fda67446b0bb9f76a1f2cfd20a.mp3', category: 'binaural' },
  { id: '10', title: 'Sexy Meditation', description: 'Set a sexy mood', duration: 900, audioUrl: 'https://static.wixstatic.com/mp3/4e16d8_648bfb5a4c094e04858c89c06bbc4d5c.mp3', category: 'couples' },
  { id: '11', title: 'Relaxation Waterfall Music', description: 'Relax under a soothing waterfall meditation', duration: 960, audioUrl: 'https://static.wixstatic.com/mp3/4e16d8_1eaf921b285347faa78517cb480307c6.mp3', category: 'music' },
  { id: '12', title: 'Evening Calm & Closure', description: 'Wind down and find peace at the end of your day', duration: 720, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_5692fcfa75b644fdb7242f67c7d67bd2.mp3', category: 'healing' },
  { id: '13', title: 'Daily Emotional Reset (Longer)', description: 'A deeper practice to reset your emotional state', duration: 900, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_0a5356586d6748ac899ed11440d86277.mp3', category: 'healing' },
  { id: '14', title: 'Self-Compassion During Uncertainty', description: 'Find kindness for yourself in difficult times', duration: 780, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_99b28223b9204800995e139cd8d01fcb.mp3', category: 'healing' },
  { id: '15', title: 'Trusting Again After Betrayal', description: 'Begin the healing journey after trust has been broken', duration: 840, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_471711c9f26745d182a96230ebebad13.mp3', category: 'healing' },
  { id: '16', title: 'Preparing for Hard Conversations', description: 'Center yourself before difficult discussions', duration: 660, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_d56168a5814b4ff8b8e1692bde1b43a5.mp3', category: 'healing' },
  { id: '17', title: 'Grounding in the Present Moment', description: 'Return to the here and now when feeling overwhelmed', duration: 600, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_e40086c4bdbf40cbb3239a1f838b4a0b.mp3', category: 'healing' },
  { id: '18', title: 'Healing After a Heartbreak', description: 'Find comfort and begin healing after loss', duration: 900, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_8995914fb1da4f318c222008c2f13977.mp3', category: 'healing' },
  { id: '19', title: 'Letting Go of Self Judgement', description: 'Release harsh self-criticism and find acceptance', duration: 720, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_02347d46626240faa1c8f60d41b22ace.mp3', category: 'healing' },
  { id: '20', title: 'Daily Emotional Reset', description: 'A quick practice to reset your emotional state', duration: 480, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_5db688159d0a440eab56121ba73e6ff7.mp3', category: 'healing' },
  { id: '21', title: 'Reconnecting with Your Needs', description: 'Tune into what you truly need right now', duration: 660, audioUrl: 'https://static.wixstatic.com/mp3/ab7951_4f5546d610654bbf9c55a70fb002b39c.mp3', category: 'healing' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Meditations' },
  { id: 'healing', label: 'Healing' },
  { id: 'couples', label: 'Couples' },
  { id: 'music', label: 'Music' },
  { id: 'binaural', label: 'Binaural' },
];

// responsive ring size based on viewport (keeps it centered nicely on mobile)
function useRingSize() {
  const [w, setW] = useState<number>(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));
  useEffect(() => {
    const onR = () => setW(window.innerWidth);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);
  // clamp: min 220px, max 420px, with padding accounted
  return Math.round(Math.min(420, Math.max(220, w - 64)));
}

function MeditationsGuide() {
  return (
    <div className="mt-6 bg-gradient-to-br from-[#01B1AF] to-[#018a88] rounded-lg p-4 md:p-6 space-y-4 text-white text-sm">
      <div className="flex items-center space-x-4 mb-2 md:mb-4">
        <HelpCircle className="h-8 w-8 text-white" />
        <h2 className="text-xl font-semibold text-white">How to Get the Most from Meditations</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-5">
          <div className="flex items-start space-x-3">
            <Brain className="h-6 w-6 text-white mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white">Set a simple intention</h3>
              <p className="text-white/80">Choose one focus (“calm my body”, “soften self-talk”) before you press play.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Heart className="h-6 w-6 text-white mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white">Let your body lead</h3>
              <p className="text-white/80">Breathe comfortably, drop your shoulders, and allow the guidance to land.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Sparkles className="h-6 w-6 text-white mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white">Short & consistent beats long & rare</h3>
              <p className="text-white/80">4–10 minutes daily changes more than a single long session each week.</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <div>
              <div className="text-white font-medium mb-1">Pick a category</div>
              <ul className="text-white/80 space-y-2">
                <li>• Healing for grounding, Couples for connection, Music/Binaural for ambiance.</li>
              </ul>
            </div>
            <div>
              <div className="text-white font-medium mb-1">During playback</div>
              <ul className="text-white/80 space-y-2">
                <li>• If distracted, kindly return to your breath—no problem.</li>
                <li>• Keep volume low enough to stay relaxed.</li>
              </ul>
            </div>
            <div>
              <div className="text-white font-medium mb-1">Afterward</div>
              <ul className="text-white/80 space-y-2">
                <li>• Note one sentence in Journal or set a tiny Habit (e.g., 2-minute box breathing).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MeditationList() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPlusOrPremium = hasAccess('meditations');

  if (!isPlusOrPremium) {
    return (
      <FeatureAccessGuard featureId="meditations" currentPlan={currentPlan}>
        <MeditationListContent />
      </FeatureAccessGuard>
    );
  }

  return <MeditationListContent />;
}

function MeditationListContent() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [audio] = useState(new Audio());
  const [showGuide, setShowGuide] = useState(false);

  // Fullscreen screensaver for BreathRings
  const [ringsScreensaver, setRingsScreensaver] = useState(false);

  // Breathing controls
  const [breathPreset, setBreathPreset] = useState<'4-7-8' | 'Box 4-4-4-4' | 'Calm 5-5-5'>('Calm 5-5-5');
  const [breathGradientIndex, setBreathGradientIndex] = useState<number>(6);
  const [showBreathingGuide, setShowBreathingGuide] = useState(false);

  const filteredMeditations =
    selectedCategory === 'all'
      ? MEDITATIONS
      : MEDITATIONS.filter((m) => m.category.toLowerCase() === selectedCategory);

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

  useEffect(() => {
    if (selectedCategory === 'healing') setBreathGradientIndex(8);
    else if (selectedCategory === 'couples') setBreathGradientIndex(7);
    else if (selectedCategory === 'music') setBreathGradientIndex(5);
    else if (selectedCategory === 'binaural') setBreathGradientIndex(1);
    else setBreathGradientIndex(6);
  }, [selectedCategory]);

  // responsive ring size (prevents overflow, keeps perfect centering on mobile)
  const ringSize = useRingSize();

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-6">
        <div className="relative z-10 flex items-start md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Guided Meditations</h1>
            <p className="text-lg text-white/80">Find peace and clarity with our collection of guided meditations</p>
          </div>

          <button
            onClick={() => setShowGuide((s) => !s)}
            className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">Tips</span>
            {showGuide ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
          </button>
        </div>

        {showGuide && <MeditationsGuide />}
      </div>

      {/* Breathing panel */}
      <div className="mb-10 rounded-xl bg-white shadow-sm border border-gray-100">
        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3 p-4">
          <button
            onClick={() =>
              setPlaying((p) => {
                if (p) {
                  audio.pause();
                  return null;
                }
                const first = filteredMeditations[0];
                if (first) {
                  audio.src = first.audioUrl;
                  audio.muted = muted;
                  audio.play();
                  return first.id;
                }
                return null;
              })
            }
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-[#01B1AF] text-white hover:opacity-90"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {playing ? 'Pause' : 'Play'}
          </button>

          <label htmlFor="breathPreset" className="sr-only">
            Breathing preset
          </label>
          <select
            id="breathPreset"
            value={breathPreset}
            onChange={(e) => setBreathPreset(e.target.value as any)}
            className="rounded-full border border-gray-300 px-3 py-2 text-sm text-[#03274B] bg-white"
          >
            <option value="4-7-8">4-7-8</option>
            <option value="Box 4-4-4-4">Box 4-4-4-4</option>
            <option value="Calm 5-5-5">Calm 5-5-5</option>
          </select>

          <button
            onClick={() => setShowBreathingGuide(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-300 bg-white text-[#03274B] hover:bg-gray-50 transition text-sm"
            aria-label="Breathing techniques guide"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="font-medium">Guide</span>
          </button>

          <div className="text-sm text-gray-600">
            Breathing is <span className="font-medium">{playing ? 'running' : 'paused'}</span>
          </div>

          {/* Fullscreen trigger (right-aligned on larger screens) */}
          <div className="ml-auto">
            <button
              onClick={() => setRingsScreensaver(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-[#018a88] border border-gray-200 text-sm shadow-sm hover:bg-gray-50 transition"
              aria-label="Fullscreen breathing"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="font-semibold">Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Rings (perfectly centered and responsive) */}
        <div className="w-full flex items-center justify-center p-6">
          <div className="mx-auto">
            <BreathRings
              size={ringSize}
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
      </div>

      {/* Category chips */}
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

      {/* Cards */}
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
                        <span className="text-sm font-medium text-white">{formatDuration(meditation.duration)}</span>
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

      {/* TRUE FULLSCREEN overlay for BreathRings */}
      <FullscreenBreathOverlay
        open={ringsScreensaver}
        onClose={() => setRingsScreensaver(false)}
        gradientIndex={breathGradientIndex}
        presetName={breathPreset}
        running={!!playing}
      />

      {/* Breathing Techniques Guide Modal */}
      {showBreathingGuide && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto" onClick={() => setShowBreathingGuide(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-[#01B1AF] to-[#018a88] px-6 py-4 flex items-center justify-between border-b border-white/20">
              <h2 className="text-2xl font-bold text-white">Breathing Techniques Guide</h2>
              <button
                onClick={() => setShowBreathingGuide(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
                aria-label="Close guide"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-[#e88584] to-[#8e4f63] rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">🌬️</div>
                  <h3 className="text-2xl font-bold">4–7–8 Breathing</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Best for:</h4>
                    <ul className="space-y-1 text-white/90">
                      <li>• Relaxation and sleep. This method slows heart rate and calms the nervous system.</li>
                      <li>• Reducing anxiety or rumination before bed or after a stressful moment.</li>
                      <li>• Deep parasympathetic activation. Great when you need to shift out of "fight or flight."</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">When to use:</h4>
                    <p className="text-white/90">At night, during panic or stress, or anytime you feel keyed up.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#0068aa] to-[#004d7f] rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">🟦</div>
                  <h3 className="text-2xl font-bold">Box Breathing (4-4-4-4)</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Best for:</h4>
                    <ul className="space-y-1 text-white/90">
                      <li>• Focus and composure. Used by athletes and the military to steady attention.</li>
                      <li>• Resetting between tasks, sessions, or calls.</li>
                      <li>• Balanced regulation. Equally stimulates and calms, keeping you centered.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">When to use:</h4>
                    <p className="text-white/90">Before meetings, during work breaks, or when needing grounding.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#B1E006] to-[#6C8300] rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">🌿</div>
                  <h3 className="text-2xl font-bold">Calm Breathing (5-5-5)</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Best for:</h4>
                    <ul className="space-y-1 text-white/90">
                      <li>• General calm and emotional regulation.</li>
                      <li>• Everyday mindfulness or meditation practice.</li>
                      <li>• Gentle nervous-system down-shift without feeling sleepy.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">When to use:</h4>
                    <p className="text-white/90">During daily routines, walking, or mindfulness exercises.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowBreathingGuide(false)}
                className="w-full bg-gradient-to-r from-[#01B1AF] to-[#018a88] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
