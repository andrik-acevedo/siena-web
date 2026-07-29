// src/components/emotion/EmotionWheel.tsx
import { useState, useEffect, useRef } from 'react';
import { Brain, Heart, Sparkles, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';

export default function EmotionWheel() {
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAngle, setLastAngle] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const wheelRef = useRef<HTMLImageElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const desktopContainerRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  const getAngleFromCenter = (clientX: number, clientY: number) => {
    const containerRef = isMobile ? mobileContainerRef : desktopContainerRef;
    if (!containerRef.current) return 0;

    const rect = containerRef.current.getBoundingClientRect();
    let cx: number, cy: number;

    // On mobile, the wheel center is at the TOP EDGE of the visible container
    if (isMobile) {
      cx = rect.left + rect.width / 2;
      cy = rect.top;
    } else {
      // On desktop, the wheel center is the center of the container
      cx = rect.left + rect.width / 2;
      cy = rect.top + rect.height / 2;
    }
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  };

  // Mouse drag
  const startDragMouse = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastAngle(getAngleFromCenter(e.clientX, e.clientY));
    e.preventDefault();
  };

  const moveMouse = (e: MouseEvent) => {
    if (!isDragging) return;
    const angle = getAngleFromCenter(e.clientX, e.clientY);
    let deltaAngle = angle - lastAngle;

    // Handle angle wrap-around
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;

    setWheelRotation((prev) => prev + deltaAngle);
    setLastAngle(angle);
  };

  const endMouse = () => setIsDragging(false);

  // Touch drag
  const startDragTouch = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setIsDragging(true);
    setLastAngle(getAngleFromCenter(t.clientX, t.clientY));
    e.preventDefault();
  };

  const moveTouch = (e: TouchEvent) => {
    if (!isDragging) return;
    const t = e.touches[0];
    const angle = getAngleFromCenter(t.clientX, t.clientY);
    let deltaAngle = angle - lastAngle;

    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;

    setWheelRotation((prev) => prev + deltaAngle);
    setLastAngle(angle);
    e.preventDefault();
  };

  const endTouch = () => setIsDragging(false);

  // Global listeners while dragging
  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener('mousemove', moveMouse);
    document.addEventListener('mouseup', endMouse);
    document.addEventListener('touchmove', moveTouch as any, { passive: false });
    document.addEventListener('touchend', endTouch);
    return () => {
      document.removeEventListener('mousemove', moveMouse);
      document.removeEventListener('mouseup', endMouse);
      document.removeEventListener('touchmove', moveTouch as any);
      document.removeEventListener('touchend', endTouch);
    };
  }, [isDragging, lastAngle, isMobile]);

  return (
    <div className="w-full px-2 sm:px-3">
      {/* Header with Tips toggle (standardized) */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-8">
        <div className="relative z-10 flex items-start md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Emotion Wheel</h1>
            <p className="text-base md:text-lg text-white/80">
              Explore and understand your emotions through interactive discovery
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

        {/* Collapsible Tips (same green block pattern as other pages) */}
        {showGuide && (
          <div className="mt-6">
            <div className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] rounded-lg p-4 md:p-6 text-white text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Principles */}
                <div className="space-y-5">
                  <div className="flex items-start space-x-3">
                    <Brain className="h-6 w-6 text-white mt-1" />
                    <div>
                      <h3 className="text-lg font-medium text-white">Name it to regulate it</h3>
                      <p className="text-white/80">
                        Pick the closest word—even if it’s not perfect. Language helps your nervous system settle.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Heart className="h-6 w-6 text-white mt-1" />
                    <div>
                      <h3 className="text-lg font-medium text-white">Include the body</h3>
                      <p className="text-white/80">
                        While exploring, scan for sensations (tight chest, fluttery stomach). Emotions live in the body.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Sparkles className="h-6 w-6 text-white mt-1" />
                    <div>
                      <h3 className="text-lg font-medium text-white">Be curious, not perfect</h3>
                      <p className="text-white/80">
                        Rotate slowly, pause on a category, and see what resonates. Awareness grows with repetition.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-white font-medium mb-1">Explore</div>
                      <ul className="text-white/80 space-y-2">
                        <li>• Drag to rotate the wheel and read related emotions.</li>
                        <li>• Pick one word that best fits your current state.</li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-white font-medium mb-1">Integrate</div>
                      <ul className="text-white/80 space-y-2">
                        <li>• Take 3 slow breaths while repeating the word.</li>
                        <li>• Jot a sentence in Journal or tag a Mood for today.</li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-white font-medium mb-1">When overwhelmed</div>
                      <ul className="text-white/80 space-y-2">
                        <li>• Choose “Neutral”, ground for 60 seconds, return later.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wheel: mobile shows only the BOTTOM half, scaled to full width */}
      <section className="bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-2xl p-2 sm:p-3 md:p-4">
        {/* MOBILE: only the BOTTOM half visible */}
        <div className="block sm:hidden">
          <div ref={mobileContainerRef} className="relative w-full aspect-square overflow-hidden rounded-xl">
            {/* CAMERA: positioned so only bottom half shows */}
            <div className="absolute left-1/2 -top-full w-[200%] h-[200%] -translate-x-1/2">
              {/* WHEEL: only rotates; stays centered inside camera */}
              <img
                ref={wheelRef}
                src="https://static.wixstatic.com/media/4e16d8_193e8825f63c4047ac211ddfbd00e877~mv2.png"
                alt="Emotion Wheel"
                className={`block select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  transform: `rotate(${wheelRotation}deg)`,
                  transformOrigin: '50% 50%',
                  transition: isDragging ? 'none' : 'transform 120ms ease-out',
                  touchAction: 'none',
                  willChange: 'transform',
                }}
                onMouseDown={startDragMouse}
                onTouchStart={startDragTouch}
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* TABLET/DESKTOP: full centered wheel */}
        <div
          ref={desktopContainerRef}
          className="relative hidden sm:flex items-center justify-center w-full aspect-square overflow-hidden rounded-xl"
        >
          <img
            ref={wheelRef}
            src="https://static.wixstatic.com/media/4e16d8_193e8825f63c4047ac211ddfbd00e877~mv2.png"
            alt="Emotion Wheel"
            className={`block select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              width: '100%',
              height: 'auto',
              transform: `rotate(${wheelRotation}deg)`,
              transformOrigin: '50% 50%',
              transition: isDragging ? 'none' : 'transform 120ms ease-out',
              touchAction: 'none',
              willChange: 'transform',
            }}
            onMouseDown={startDragMouse}
            onTouchStart={startDragTouch}
            draggable={false}
          />
        </div>

        <div className="mt-3 text-center">
          <p className="text-white/80 text-sm">
            Drag to rotate • Rotation: {wheelRotation.toFixed(0)}°
          </p>
        </div>
      </section>
    </div>
  );
}
