import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";

// Gradients set (matches your palette)
const GRADIENTS = [
  'from-[#e88584] to-[#8e4f63]',   // 0
  'from-[#0068aa] to-[#004d7f]',   // 1
  'from-[#FFA600] to-[#B36B00]',   // 2
  'from-[#B1E006] to-[#6C8300]',   // 3
  'from-[#F27C7C] to-[#E03B3B]',   // 4
  'from-[#080B42] to-[#6A51A6]',   // 5
  'from-[#00789f] to-[#005a77]',   // 6
  'from-[#ea697c] to-[#b8455c]',   // 7
  'from-[#008792] to-[#006a70]',   // 8
  'from-[#7b5595] to-[#5d4070]',   // 9
] as const;

type Phase = { label: "Inhale" | "Hold" | "Exhale"; seconds: number };

const PRESETS: Record<string, Phase[]> = {
  "4-7-8": [
    { label: "Inhale", seconds: 4 },
    { label: "Hold",   seconds: 7 },
    { label: "Exhale", seconds: 8 },
  ],
  "Box 4-4-4-4": [
    { label: "Inhale", seconds: 4 },
    { label: "Hold",   seconds: 4 },
    { label: "Exhale", seconds: 4 },
    { label: "Hold",   seconds: 4 },
  ],
  "Calm 5-5-5": [
    { label: "Inhale", seconds: 5 },
    { label: "Hold",   seconds: 5 },
    { label: "Exhale", seconds: 5 },
  ],
};

interface BreathRingsProps {
  size?: number;
  rings?: number;
  minScale?: number;
  maxScale?: number;
  gradientIndex?: number;
  presetName?: keyof typeof PRESETS;
  blur?: boolean;
  running?: boolean; // ⬅ added so parent can start/stop (synced to audio)
}

export default function BreathRings({
  size = 480,
  rings = 4,
  minScale = 0.58,
  maxScale = 1.0,
  gradientIndex = 6,
  presetName = "4-7-8",
  blur = true,
  running = true,
}: BreathRingsProps) {
  const phases = PRESETS[presetName];
  const total = useMemo(
    () => phases.reduce((s, p) => s + p.seconds, 0),
    [phases]
  );

  // ----- Build animation keyframes -----
  const { times, scaleKF, opacityKF } = useMemo(() => {
    const cum: number[] = [0];
    phases.reduce((acc, p) => {
      acc += p.seconds;
      cum.push(acc);
      return acc;
    }, 0);
    const times = cum.map(t => t / total);

    const sMin = minScale, sMax = maxScale;
    const scaleKF: number[] = new Array(times.length).fill(sMax);
    // Start at min
    scaleKF[0] = sMin;

    // Find first indexes of each label
    const iIn = phases.findIndex(p => p.label === "Inhale");
    const iHold = phases.findIndex(p => p.label === "Hold");
    const iEx = phases.findIndex(p => p.label === "Exhale");

    // Ramp up during inhale
    if (iIn !== -1) {
      scaleKF[iIn] = sMin;
      scaleKF[iIn + 1] = sMax;
    }
    // Hold stays at max if present
    if (iHold !== -1) {
      scaleKF[iHold] = sMax;
      scaleKF[iHold + 1] = sMax;
    }
    // Ramp down during exhale - start at max, end at min
    if (iEx !== -1) {
      scaleKF[iEx] = sMax;
      scaleKF[iEx + 1] = sMin;
    }
    // Ensure we end at min for loop continuity
    scaleKF[scaleKF.length - 1] = sMin;

    const opacityKF = scaleKF.map(v => 0.35 + (v - sMin) / (sMax - sMin) * 0.55);
    return { times, scaleKF, opacityKF };
  }, [phases, total, minScale, maxScale]);

  // ----- Phase label ticker (fix for "stuck on Inhale") -----
  const [phaseIdx, setPhaseIdx] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // clear any existing timers
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!running) return;

    // Start a looping scheduler that hops phase → phase using timeouts
    let idx = 0;
    const hop = () => {
      setPhaseIdx(idx);
      const ms = phases[idx].seconds * 1000;
      timerRef.current = window.setTimeout(() => {
        idx = (idx + 1) % phases.length;
        hop();
      }, ms) as unknown as number;
    };

    hop();

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phases, running]);

  const baseSize = size;
  const ringThickness = Math.max(12, Math.floor(size * 0.035));
  const gradient = GRADIENTS[(gradientIndex % GRADIENTS.length + GRADIENTS.length) % GRADIENTS.length];

  return (
    <div className="w-full">
      <div
        className="relative mx-auto select-none"
        style={{ width: baseSize, height: baseSize }}
      >
        {/* Rings */}
        {Array.from({ length: rings }).map((_, i) => {
          const shrink = 1 - i * (0.12 / Math.max(1, rings - 1));
          const delay = (i * (total / rings)) * 0.15;

          return (
            <motion.div
              key={i}
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient}`}
              style={{
                width: baseSize * shrink,
                height: baseSize * shrink,
                left: (baseSize - baseSize * shrink) / 2,
                top: (baseSize - baseSize * shrink) / 2,
                boxShadow: `inset 0 0 0 ${ringThickness}px rgba(0,0,0,0.08)`,
                filter: blur ? "blur(0.3px)" : undefined,
              }}
              animate={running ? { scale: scaleKF, opacity: opacityKF } : {}}
              transition={
                running
                  ? { duration: total, repeat: Infinity, ease: "easeInOut", times, delay }
                  : undefined
              }
            />
          );
        })}

        {/* Soft core */}
        <div
          className={`absolute rounded-full bg-gradient-to-br ${GRADIENTS[5]} opacity-90`}
          style={{
            width: baseSize * 0.36,
            height: baseSize * 0.36,
            left: baseSize * 0.32,
            top: baseSize * 0.32,
            filter: blur ? "blur(0.5px)" : undefined,
          }}
        />

        {/* Phase chip */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="px-4 py-1 rounded-full bg-white/80 text-[#03274B] font-semibold tracking-wide shadow-sm">
            {phases[phaseIdx]?.label ?? "Inhale"}
          </span>
        </div>
      </div>
    </div>
  );
}
