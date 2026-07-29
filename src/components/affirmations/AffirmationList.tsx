// src/components/affirmations/AffirmationList.tsx
import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Maximize2,
} from "lucide-react";
import { GRADIENT_COLORS } from "../ui/TileCard";
import FloatingAffirmationOrbs from "./FloatingAffirmationOrbs";
import FullscreenOrbsOverlay from "./FullscreenOrbsOverlay";

interface Affirmation {
  id: string;
  text: string;
  audioUrl: string;
  category: string;
}

const AFFIRMATIONS: Affirmation[] = [
  { id: "1",  text: "Self-Worth and Inner Peace",  audioUrl: "https://static.wixstatic.com/mp3/4e16d8_cfb49bfd788b4d42a415beb3c82abb7b.mp3", category: "self-worth" },
  { id: "2",  text: "Confidence and Courage",      audioUrl: "https://static.wixstatic.com/mp3/4e16d8_7bb14a6f4ced4a61a5eb3264e9a8202a.mp3", category: "confidence" },
  { id: "3",  text: "Success and Abundance",       audioUrl: "https://static.wixstatic.com/mp3/4e16d8_df38463c0d004d45b09d73394c73019e.mp3", category: "success" },
  { id: "4",  text: "Gratitude and Positivity",    audioUrl: "https://static.wixstatic.com/mp3/4e16d8_b573760b3124426b86e64a8b8de3fe92.mp3", category: "gratitude" },
  { id: "5",  text: "Relationship and Connection", audioUrl: "https://static.wixstatic.com/mp3/4e16d8_9f8d73d3bca1482ebf1f1abe8dc83e3b.mp3", category: "relationships" },
  { id: "6",  text: "Healing Couples",             audioUrl: "https://static.wixstatic.com/mp3/4e16d8_d25a3244c3ab4e349f5e4e9d6fa06ecd.mp3", category: "couples" },
  { id: "7",  text: "Emotional Regulation",        audioUrl: "https://static.wixstatic.com/mp3/4e16d8_eb605e314a48453998796f569d3512ec.mp3", category: "self" },
  { id: "8",  text: "Purpose",                     audioUrl: "https://static.wixstatic.com/mp3/4e16d8_e0d185b80f944abe911367eeac49f036.mp3", category: "self" },
  { id: "9",  text: "Boundaries and Protection",   audioUrl: "https://static.wixstatic.com/mp3/4e16d8_4a7966a3016943ca8500abc2d259ba36.mp3", category: "self" },
  { id: "10", text: "Letting Go",                  audioUrl: "https://static.wixstatic.com/mp3/4e16d8_50c2093258d74b3c8ce37629f9dc0908.mp3", category: "self" },
  { id: "11", text: "Healing",                     audioUrl: "https://static.wixstatic.com/mp3/4e16d8_50c2093258d74b3c8ce37629f9dc0908.mp3", category: "self" },
  { id: "12", text: "Sensuality",        audioUrl: "https://static.wixstatic.com/mp3/4e16d8_a1da53219c3e42e28e3cd1f8e43fa279.mp3", category: "self" },
];

const CATEGORIES = [
  "all",
  "self-worth",
  "confidence",
  "success",
  "gratitude",
  "relationships",
  "couples",
];

export default function AffirmationList() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [audio] = useState(new Audio());
  const [showGuide, setShowGuide] = useState(false);

  // Fullscreen screensaver (true fullscreen via FullscreenOrbsOverlay)
  const [screensaver, setScreensaver] = useState(false);

  const filteredAffirmations =
    selectedCategory === "all"
      ? AFFIRMATIONS
      : AFFIRMATIONS.filter((a) => a.category === selectedCategory);

  useEffect(() => {
    audio.loop = true;
    return () => {
      audio.pause();
      audio.loop = false;
    };
  }, [audio]);

  useEffect(() => {
    if (playing && !filteredAffirmations.some((a) => a.id === playing)) {
      audio.pause();
      setPlaying(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const handlePlay = (affirmation: Affirmation) => {
    if (playing === affirmation.id) {
      audio.pause();
      setPlaying(null);
    } else {
      if (playing) audio.pause();
      audio.src = affirmation.audioUrl;
      audio.muted = muted;
      audio.play();
      setPlaying(affirmation.id);
    }
  };

  const toggleMute = () => {
    audio.muted = !muted;
    setMuted(!muted);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-6">
        <div className="relative z-10 flex items-start md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Daily Affirmations</h1>
            <p className="text-lg text-white/80">
              Transform your mindset with powerful daily affirmations
            </p>
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
      </div>

      {/* Orbs panel with Screensaver trigger */}
      <div className="relative h-[360px] rounded-2xl bg-white border border-gray-100 shadow-sm mb-12 overflow-hidden">
        <FloatingAffirmationOrbs
          count={20}
          sizeRange={[90, 220]}
          speedRange={[24, 36]}
          className="w-full h-full"
          enableScatter
          enableDrag
        />
        <button
          onClick={() => setScreensaver(true)}
          className="absolute top-4 right-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 text-[#018a88] text-sm shadow-md hover:bg-white transition"
        >
          <Maximize2 className="h-4 w-4" />
          <span className="font-semibold">Screensaver</span>
        </button>
      </div>

      {/* Category chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category
                ? "bg-[#01B1AF] text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:border-[#01B1AF] hover:text-[#01B1AF]"
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAffirmations.map((affirmation, index) => {
          const gradientColor = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
          const isPlaying = playing === affirmation.id;

          return (
            <div
              key={affirmation.id}
              className={`bg-gradient-to-br ${gradientColor} rounded-xl shadow-md transition-all transform hover:scale-105 hover:shadow-lg h-[200px]`}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-white mb-2">{affirmation.text}</h3>
                  <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1">
                    <span className="text-sm font-medium text-white">{affirmation.category}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4">
                  <button
                    onClick={toggleMute}
                    aria-label={muted ? "Unmute" : "Mute"}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                  >
                    {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </button>
                  <button
                    onClick={() => handlePlay(affirmation)}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className={`p-3 rounded-full transition-colors ${
                      isPlaying ? "bg-white text-[#01B1AF]" : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* TRUE FULLSCREEN overlay (uses Fullscreen API, white background, with hints) */}
      <FullscreenOrbsOverlay open={screensaver} onClose={() => setScreensaver(false)} />
    </div>
  );
}
