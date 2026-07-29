import React from "react";

type SmartPillProps = {
  letter: string; // S / M / A / R / T
  title: string;  // Specific, Measurable, ...
  helper: string; // Description line in the circle
  sample?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradientClass: string; // e.g., "from-[#0068aa] to-[#004d7f]"
  accentHex: string;     // e.g., "#0068aa"
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  onNext?: () => void;   // Cmd/Ctrl + Enter
};

export default function SmartPill({
  letter,
  title,
  helper,
  sample,
  icon: Icon,
  gradientClass,
  accentHex,
  value,
  onChange,
  rows = 4,
  onNext,
}: SmartPillProps) {
  return (
    <div
      className={[
        "relative flex flex-col h-full w-full max-w-[360px] mx-auto rounded-[32px] p-6 pt-8 text-white",
        "bg-gradient-to-b shadow-sm",
        gradientClass,
      ].join(" ")}
    >
      {/* Top section grows to align all pills; everything centered */}
      <div className="flex-1 flex flex-col items-center">
        {/* Inner circle */}
        <div className="relative w-60 h-60 rounded-full bg-white/15 ring-1 ring-white/20 grid place-items-center">
          {/* SMART letter badge (larger) */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white text-gray-900 text-sm font-extrabold shadow ring-1 ring-black/10">
              {letter}
            </span>
          </div>

          {/* Icon + texts */}
          <div className="flex flex-col items-center text-center px-4">
            <div className="h-20 w-20 rounded-full flex items-center justify-center bg-white/70 ring-1 ring-black/10 mb-3">
              <Icon className="w-12 h-12 text-black" />
            </div>
            <div className="text-lg font-semibold tracking-wide">{title}</div>
            <div className="text-[13px] opacity-90 mt-1 leading-snug max-w-[200px]">
              {helper}
            </div>
          </div>
        </div>

        {/* Sample line (kept centered, fixed min height to keep columns equal) */}
        {sample && (
          <div className="mt-6 text-center text-sm font-medium opacity-95 min-h-[40px] px-4">
            {sample}
          </div>
        )}
      </div>

      {/* Input block at the bottom — WIDER + LESS PADDING
          -mx-6 cancels the pill's p-6 so the textarea can span wider.
          px-2 reintroduces a tiny gutter so it doesn’t touch the rounded edge. */}
      <div className="mt-6 -mx-6 px-2">
        <textarea
          rows={rows}
          placeholder={helper}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onNext?.();
          }}
          className="w-full rounded-xl bg-white text-gray-900 placeholder:text-gray-400 px-3 py-2 text-sm shadow-sm ring-1 ring-inset ring-black/5 focus:outline-none"
          style={{ borderWidth: 4, borderColor: accentHex }}
        />
        <div className="pt-1 text-[10px] text-white/80 text-center">
          Tip: ⌘/Ctrl + Enter to jump to next
        </div>
      </div>
    </div>
  );
}
