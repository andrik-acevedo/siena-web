import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import FloatingAffirmationOrbs from "./FloatingAffirmationOrbs";

type Props = {
  open: boolean;
  onClose: () => void;
  count?: number;
};

export default function FullscreenOrbsOverlay({ open, onClose, count = 28 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  // Hint visibility + timers
  const [showHint, setShowHint] = useState(false);
  const hideHintTimer = useRef<number | null>(null);
  const inactivityTimer = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  // ————— Fullscreen change => close if user hits ESC or leaves FS
  useEffect(() => {
    function onFsChange() {
      const isFs =
        document.fullscreenElement === containerRef.current ||
        // @ts-ignore (old Safari)
        document.webkitFullscreenElement === containerRef.current;
      if (!isFs) onClose();
    }
    document.addEventListener("fullscreenchange", onFsChange);
    // @ts-ignore
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      // @ts-ignore
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, [onClose]);

  // ————— Request / exit Fullscreen + lock scrolling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    async function goFs() {
      try {
        if (el.requestFullscreen) await el.requestFullscreen();
        // @ts-ignore
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      } catch {/* fallback – overlay still covers the app */}
      finally {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
      }
    }
    async function exitFs() {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        // @ts-ignore
        else if (document.webkitFullscreenElement) document.webkitExitFullscreen?.();
      } finally {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
    }

    if (open) goFs();
    else exitFs();

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [open]);

  // ————— Hints: show on open, hide after 6s, resurface after inactivity
  useEffect(() => {
    if (!open) return;

    function clearTimers() {
      if (hideHintTimer.current) {
        window.clearTimeout(hideHintTimer.current);
        hideHintTimer.current = null;
      }
      if (inactivityTimer.current) {
        window.clearTimeout(inactivityTimer.current);
        inactivityTimer.current = null;
      }
    }

    function showAndAutoHide(duration = 6000) {
      setShowHint(true);
      if (hideHintTimer.current) window.clearTimeout(hideHintTimer.current);
      hideHintTimer.current = window.setTimeout(() => setShowHint(false), duration);
    }

    function scheduleInactivityHint() {
      if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
      // If no interaction for 25s, gently show hint for 5s
      inactivityTimer.current = window.setTimeout(() => {
        showAndAutoHide(5000);
      }, 25000);
    }

    // initial show
    showAndAutoHide(6000);
    scheduleInactivityHint();

    const el = containerRef.current!;
    function onInteract(ev: Event) {
      // Any interaction hides hint (if visible) and restarts inactivity countdown
      setShowHint(false);
      scheduleInactivityHint();

      // If pointer is near the top-right corner (close area), reshow briefly
      if (ev instanceof PointerEvent) {
        const rect = el.getBoundingClientRect();
        const nearTop = ev.clientY - rect.top < 120;
        const nearRight = rect.right - ev.clientX < 160;
        if (nearTop && nearRight) {
          showAndAutoHide(2500);
        }
      }
    }

    // ESC key should always close (handled by FS change), but also counts as activity
    function onKeydown() {
      onInteract(new Event("keydown"));
    }

    window.addEventListener("pointerdown", onInteract);
    window.addEventListener("pointermove", onInteract);
    window.addEventListener("keydown", onKeydown);

    return () => {
      clearTimers();
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("pointermove", onInteract);
      window.removeEventListener("keydown", onKeydown);
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] bg-white"
      style={{ touchAction: "none" }}
    >
      {/* Interactive, solid orbs */}
      <FloatingAffirmationOrbs
        running
        count={count}
        sizeRange={[140, 320]}
        speedRange={[22, 36]}
        enableScatter
        enableDrag
        // Double-click anywhere to close
        onBackgroundDoubleClick={onClose}
        className="w-full h-full"
      />

      {/* Close button – persistent and obvious */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-lg bg-[#018a88] text-white px-4 py-2 shadow-md hover:bg-[#017570] transition"
        aria-label="Exit screensaver"
      >
        <X className="h-4 w-4" />
        <span className="text-sm font-semibold">Close</span>
      </button>

      {/* Instruction hint (subtle, fades in/out) */}
      <div
        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-6
                    rounded-xl px-4 py-2 text-sm font-medium
                    text-white/90 shadow-md backdrop-blur-sm
                    transition-opacity duration-500
                    ${showHint ? "opacity-100" : "opacity-0"}
                  `}
        // brand-tinted pill
        style={{
          background:
            "linear-gradient(135deg, rgba(1,177,175,0.85), rgba(1,138,136,0.85))",
        }}
        aria-live="polite"
      >
        <span className="hidden sm:inline">
          Click to scatter • Drag orbs to move • Double-click or press <kbd className="px-1 bg-white/20 rounded">ESC</kbd> to exit
        </span>
        <span className="sm:hidden">
          Tap to scatter • Drag orbs to move • Tap <strong>Close</strong> to exit
        </span>
      </div>
    </div>,
    document.body
  );
}
