import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import BreathRings from '../breathing/BreathRings';

type Props = {
  open: boolean;
  onClose: () => void;
  gradientIndex?: number;
  presetName?: '4-7-8' | 'Box 4-4-4-4' | 'Calm 5-5-5';
  running?: boolean;
};

export default function FullscreenBreathOverlay({
  open,
  onClose,
  gradientIndex = 6,
  presetName = 'Calm 5-5-5',
  running = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onFsChange() {
      const isFs =
        document.fullscreenElement === containerRef.current ||
        // @ts-ignore safari
        document.webkitFullscreenElement === containerRef.current;
      if (!isFs) onClose();
    }
    document.addEventListener('fullscreenchange', onFsChange);
    // @ts-ignore
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      // @ts-ignore
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, [onClose]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    async function goFs() {
      try {
        if (el.requestFullscreen) await el.requestFullscreen();
        // @ts-ignore
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      } catch {
        /* overlay still covers app */
      } finally {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      }
    }
    async function exitFs() {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        // @ts-ignore
        else if (document.webkitFullscreenElement) document.webkitExitFullscreen?.();
      } finally {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
    }

    if (open) goFs();
    else exitFs();

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [open]);

  const [vw, setVw] = useState<number>(() =>
    typeof window !== 'undefined' ? Math.min(window.innerWidth, window.innerHeight) : 1024
  );
  useEffect(() => {
    function onR() {
      setVw(Math.min(window.innerWidth, window.innerHeight));
    }
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);
  const size = useMemo(() => Math.round(Math.min(900, Math.max(260, vw * 0.8))), [vw]);

  if (!mounted || !open) return null;

  return createPortal(
    <div ref={containerRef} className="fixed inset-0 z-[10000] bg-white" style={{ touchAction: 'none' }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <BreathRings
          size={size}
          rings={5}
          minScale={0.55}
          maxScale={1.02}
          gradientIndex={gradientIndex}
          presetName={presetName}
          running={running}
          blur
        />
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-lg bg-[#018a88] text-white px-4 py-2 shadow-md hover:bg-[#017570] transition"
        aria-label="Exit fullscreen"
      >
        <X className="h-4 w-4" />
        <span className="text-sm font-semibold">Close</span>
      </button>

      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-6 rounded-xl px-4 py-2 text-sm font-medium text-white/90 shadow-md backdrop-blur-sm"
        style={{ background: 'linear-gradient(135deg, rgba(1,177,175,0.85), rgba(1,138,136,0.85))' }}
      >
        Tap <strong>Close</strong> or press <kbd className="px-1 bg-white/20 rounded">ESC</kbd> to exit
      </div>
    </div>,
    document.body
  );
}
