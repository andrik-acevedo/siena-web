// src/components/affirmations/FloatingAffirmationOrbs.tsx
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

/** Brand gradient pairs (solid) */
const GRADS: [string, string][] = [
  ["#e88584", "#8e4f63"],
  ["#0068aa", "#004d7f"],
  ["#FFA600", "#B36B00"],
  ["#B1E006", "#6C8300"],
  ["#F27C7C", "#E03B3B"],
  ["#080B42", "#6A51A6"],
  ["#00789f", "#005a77"],
  ["#ea697c", "#b8455c"],
  ["#008792", "#006a70"],
  ["#7b5595", "#5d4070"],
];

type Props = {
  /** small speed boost when true (kept stable via ref so RAF doesn’t restart) */
  running?: boolean;
  count?: number;
  sizeRange?: [number, number];   // px
  speedRange?: [number, number];  // seconds per loop
  className?: string;

  // interactions
  enableScatter?: boolean;
  enableDrag?: boolean;
  onBackgroundDoubleClick?: () => void;
};

type OrbParam = {
  size: number;
  x0Pct: number;
  y0Pct: number;
  axRel: number; // relative to min(container w,h)
  ayRel: number;
  bxRel: number;
  byRel: number;
  phase: number;
  w1Base: number; // base angular velocity
  w2Ratio: number;
  grad: string;
};

const rand = (a: number, b: number) => Math.random() * (b - a) + a;

export default memo(function FloatingAffirmationOrbs({
  running = true,
  count = 15,
  sizeRange = [100, 220],
  speedRange = [20, 35],
  className = "",
  enableScatter = true,
  enableDrag = true,
  onBackgroundDoubleClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const orbRefs = useRef<HTMLSpanElement[]>([]);
  const [ready, setReady] = useState(false);

  // DO NOT recreate RAF when play/pause toggles – keep speed in a ref
  const speedBoostRef = useRef(1);
  useEffect(() => {
    speedBoostRef.current = running ? 1.1 : 1.0;
  }, [running]);

  // Stable params
  const params = useMemo<OrbParam[]>(() => {
    return Array.from({ length: count }).map((_, i) => {
      const size = rand(sizeRange[0], sizeRange[1]);

      // random loop duration -> angular velocity
      const period = rand(speedRange[0], speedRange[1]); // seconds
      const w1Base = (Math.PI * 2) / period;
      const w2Ratio = rand(1.3, 2.1);

      const x0Pct = rand(10, 90);
      const y0Pct = rand(10, 90);

      // Relative amplitudes -> later scaled by min(width, height)
      const axRel = rand(0.16, 0.32); // wider than before
      const ayRel = rand(0.12, 0.28);
      const bxRel = axRel * rand(0.18, 0.42);
      const byRel = ayRel * rand(0.18, 0.42);

      const phase = rand(0, Math.PI * 2);
      const [c1, c2] = GRADS[(i + Math.floor(rand(0, GRADS.length))) % GRADS.length];
      const grad = `radial-gradient(circle at 35% 35%, ${c1}, ${c2})`;

      return { size, x0Pct, y0Pct, axRel, ayRel, bxRel, byRel, phase, w1Base, w2Ratio, grad };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, sizeRange[0], sizeRange[1], speedRange[0], speedRange[1]]);

  // Physics buffers (no React state churn)
  const forcesRef = useRef<{ vx: number; vy: number }[]>([]);
  const posRef = useRef<{ x: number; y: number }[]>([]);
  const dragRef = useRef({
    idx: null as number | null,
    dx: 0,
    dy: 0,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    active: false,
  });

  // Pre-place once to avoid first-frame “jump”
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const minD = Math.max(1, Math.min(rect.width, rect.height));

    forcesRef.current = params.map(() => ({ vx: 0, vy: 0 }));
    posRef.current = params.map((p) => ({
      x: (p.x0Pct / 100) * rect.width,
      y: (p.y0Pct / 100) * rect.height,
    }));

    // draw a first frame at t=0
    params.forEach((p, i) => {
      const node = orbRefs.current[i];
      if (!node) return;

      const ax = p.axRel * minD;
      const ay = p.ayRel * minD;
      const bx = p.bxRel * minD;
      const by = p.byRel * minD;

      const baseX = (p.x0Pct / 100) * rect.width;
      const baseY = (p.y0Pct / 100) * rect.height;
      const dx = Math.cos(p.phase) * ax + Math.sin(p.phase * p.w2Ratio) * bx;
      const dy = Math.sin(p.phase) * ay + Math.cos(p.phase * p.w2Ratio) * by;

      const x = baseX + dx;
      const y = baseY + dy;

      posRef.current[i] = { x, y };
      node.style.transform = `translate3d(${x - p.size / 2}px, ${y - p.size / 2}px, 0)`;
    });

    // allow fade-in after pre-placement
    setReady(true);
  }, [params]);

  // RAF loop – note: DOES NOT depend on `running`, so no resets on play change
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId = 0;
    const t0 = performance.now();

    function frame(now: number) {
      const t = (now - t0) / 1000;
      const rect = el.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const minD = Math.max(1, Math.min(w, h));
      const boost = speedBoostRef.current;

      for (let i = 0; i < params.length; i++) {
        const node = orbRefs.current[i];
        const p = params[i];
        if (!node) continue;

        const w1 = p.w1Base * boost;
        const w2 = w1 * p.w2Ratio;

        const ax = p.axRel * minD;
        const ay = p.ayRel * minD;
        const bx = p.bxRel * minD;
        const by = p.byRel * minD;

        // Base anchor
        const baseX = (p.x0Pct / 100) * w;
        const baseY = (p.y0Pct / 100) * h;

        // Lissajous-ish target
        const dx = Math.cos(w1 * t + p.phase) * ax + Math.sin(w2 * t + p.phase * 0.7) * bx;
        const dy = Math.sin(w1 * t + p.phase) * ay + Math.cos(w2 * t + p.phase * 0.9) * by;
        const targetX = baseX + dx;
        const targetY = baseY + dy;

        let { x, y } = posRef.current[i];
        let { vx, vy } = forcesRef.current[i];

        if (enableDrag && dragRef.current.active && dragRef.current.idx === i) {
          x = dragRef.current.lastX - dragRef.current.dx;
          y = dragRef.current.lastY - dragRef.current.dy;
        } else {
          // Spring toward target + velocity + damping
          const spring = 0.06;
          const damping = 0.90;
          const maxStep = 30;

          vx += (targetX - x) * spring;
          vy += (targetY - y) * spring;

          vx *= damping;
          vy *= damping;

          x += Math.max(-maxStep, Math.min(maxStep, vx));
          y += Math.max(-maxStep, Math.min(maxStep, vy));
        }

        posRef.current[i] = { x, y };
        forcesRef.current[i] = { vx, vy };
        node.style.transform = `translate3d(${x - p.size / 2}px, ${y - p.size / 2}px, 0)`;
      }

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [params, enableDrag]);

  // Interactions: scatter wider, drag/flick, dblclick to close
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const pickOrb = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      for (let i = params.length - 1; i >= 0; i--) {
        const p = params[i];
        const pos = posRef.current[i];
        const dx = x - pos.x;
        const dy = y - pos.y;
        if (dx * dx + dy * dy <= (p.size * p.size) / 4) return i;
      }
      return null;
    };

    function scatterFrom(px: number, py: number) {
      const rect = el.getBoundingClientRect();
      const cx = px - rect.left;
      const cy = py - rect.top;

      for (let i = 0; i < params.length; i++) {
        const pos = posRef.current[i];
        const dx = pos.x - cx;
        const dy = pos.y - cy;
        const dist = Math.max(24, Math.hypot(dx, dy));

        // Wider, stronger disbursement: inverse-power falloff
        const power = 5000 / Math.pow(dist, 0.6); // was 2200/dist
        const jitter = rand(-0.5, 0.5);
        const nx = dx / dist, ny = dy / dist;
        const cos = Math.cos(jitter), sin = Math.sin(jitter);
        const jx = nx * cos - ny * sin;
        const jy = nx * sin + ny * cos;

        const f = forcesRef.current[i];
        f.vx += jx * power;
        f.vy += jy * power;
      }
    }

    let wasDrag = false;

    function onPointerDown(e: PointerEvent) {
      if (!enableDrag) return;
      el.setPointerCapture?.(e.pointerId);

      const idx = pickOrb(e.clientX, e.clientY);
      wasDrag = idx !== null;
      if (idx !== null) {
        const pos = posRef.current[idx];
        dragRef.current.active = true;
        dragRef.current.idx = idx;
        dragRef.current.dx = e.clientX - pos.x;
        dragRef.current.dy = e.clientY - pos.y;
        dragRef.current.lastX = e.clientX;
        dragRef.current.lastY = e.clientY;
        dragRef.current.lastT = performance.now();
      }
    }

    function onPointerMove(e: PointerEvent) {
      const d = dragRef.current;
      if (!d.active || d.idx === null) return;
      const now = performance.now();
      const dt = Math.max(1, now - d.lastT);

      // approximate velocity -> momentum on release
      const vx = ((e.clientX - d.lastX) / dt) * 16;
      const vy = ((e.clientY - d.lastY) / dt) * 16;
      forcesRef.current[d.idx] = { vx, vy };

      d.lastX = e.clientX;
      d.lastY = e.clientY;
      d.lastT = now;
    }

    function onPointerUp() {
      dragRef.current.active = false;
      dragRef.current.idx = null;
    }

    function onClick(e: MouseEvent) {
      if (!enableScatter) return;
      // Always scatter on click (even after a small drag) for fun,
      // but if you prefer: if (wasDrag) return;
      scatterFrom(e.clientX, e.clientY);
    }

    function onDblClick() {
      onBackgroundDoubleClick?.();
    }

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    el.addEventListener("click", onClick);
    el.addEventListener("dblclick", onDblClick);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("click", onClick);
      el.removeEventListener("dblclick", onDblClick);
    };
  }, [enableScatter, enableDrag, onBackgroundDoubleClick, params.length]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ touchAction: "none", opacity: ready ? 1 : 0, transition: "opacity 300ms ease" }}
    >
      {params.map((p, idx) => (
        <span
          key={`orb-${idx}`}
          ref={(n) => {
            if (n) orbRefs.current[idx] = n;
          }}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.grad,
            borderRadius: "9999px",
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
});
