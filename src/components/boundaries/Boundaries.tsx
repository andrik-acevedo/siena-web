import React, { useMemo, useState, useEffect } from "react";
import BoundaryGuide from "./BoundaryGuide";

import {
  BOUNDARY_AREAS,
  RELATIONSHIP_CIRCLES,
  FEELINGS,
  getSituationSuggestions,
  COMMON_NEEDS,
  CLOSERS_BY_FIRMNESS,
  FIRMNESS_LABELS,
  type BoundaryArea,
  type RelationshipCircle,
  type Firmness,
} from "./suggestionData";

// ---- styles -----------------------------------------------------------------
const card =
  "rounded-xl border border-slate-200 bg-white shadow-sm md:shadow p-4 md:p-5";
const sectionTitle =
  "flex items-center gap-2 text-slate-800 font-semibold text-lg md:text-xl";
const pillBase =
  "relative inline-flex select-none items-center justify-between rounded-xl px-4 py-2 text-white font-semibold transition";
const selectBox =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-9 text-slate-800 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20";
const buttonOutline =
  "inline-flex items-center justify-center rounded-lg border border-emerald-600 text-emerald-700 px-3 py-1.5 font-medium hover:bg-emerald-50 transition";
const buttonPrimary =
  "inline-flex items-center justify-center rounded-lg bg-emerald-600 text-white px-4 py-2 font-semibold hover:bg-emerald-700 transition";
const badge =
  "inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600";
const brandGradient =
  "bg-gradient-to-r from-[#01B1AF] via-[#039d9b] to-[#018a88]";

// firmness label chips
const firmnessColors: Record<Firmness, string> = {
  1: "bg-emerald-50 text-emerald-700",
  2: "bg-blue-50 text-blue-700",
  3: "bg-violet-50 text-violet-700",
  4: "bg-amber-50 text-amber-800",
  5: "bg-rose-50 text-rose-700",
};

// --- Openers (dropdown presets) ---------------------------------------------
const OPENER_PRESETS = [
  "This matters to my well-being; can I share a boundary?",
  "I want to be clear so we can be consistent.",
  "Let’s align on something important to me.",
  "I’m sharing this because I care about our relationship.",
  "I want this to go well for both of us, so I need to be direct.",
];

// --- Consequences library ----------------------------------------------------
const CONSEQ_GENERAL: Record<Firmness, string[]> = {
  1: [
    "If it’s hard in the moment, let’s take a short break and try again.",
    "If this feels tense, let’s pause and reset later today.",
    "If we slip, let’s check in after a quick breather.",
    "If emotions spike, let’s table it and come back with fresh heads.",
    "If this starts to feel off, can we park it and revisit soon?",
  ],
  2: [
    "If it slips, let’s pause and reset together.",
    "If we miss this, I’ll step away for a bit and try again later.",
    "If it’s not possible now, let’s schedule a time to retry.",
    "If we drift from this, I’ll take a break and follow up later.",
    "If it gets heated, I’ll pause the conversation and return after a reset.",
  ],
  3: [
    "If this isn’t respected, I’ll take a break from the conversation and return later.",
    "If this keeps happening, I’ll step away to reset and we can try again later.",
    "If it isn’t honored, I’ll excuse myself from the chat for a bit.",
    "If this repeats, I’ll pause and follow up in writing.",
    "If we can’t do this now, I’ll step back and revisit when we’re both ready.",
  ],
  4: [
    "If this can’t happen, I’ll step away and we can revisit when we’re ready.",
    "If it isn’t honored, I’ll end the conversation and plan a time to try again.",
    "If the boundary is crossed, I’ll leave and follow up in writing.",
    "If this repeats, I’ll limit contact around this topic for a while.",
    "If it continues, I’ll remove myself and propose a new approach later.",
  ],
  5: [
    "If this continues, I’ll remove myself from the situation.",
    "If this repeats, I won’t be available for this conversation.",
    "If the boundary isn’t respected, I’ll disengage and protect my time/space.",
    "If this persists, I’ll block access on this channel for now.",
    "If the behavior continues, I’ll step away from in-person plans for a while.",
  ],
};

const CONSEQ_BY_AREA: Partial<Record<BoundaryArea, string[]>> = {
  Time: [
    "If plans move last-minute again, I’ll decline and propose another day.",
    "If replies come during my off hours, I’ll answer next business day.",
  ],
  Physical: [
    "If touch starts without asking, I’ll step back and end the interaction.",
    "If proximity feels too close, I’ll move away and reconnect later.",
  ],
  Conversational: [
    "If the topic goes there again, I’ll end the chat and revisit when it’s calmer.",
    "If advice keeps coming without consent, I’ll pause the conversation.",
  ],
  Relationship: [
    "If privacy lines are crossed again, I’ll take distance for a bit.",
    "If boundaries are criticized, I’ll disengage from the discussion.",
  ],
  Personal: [
    "If I’m pressed to share beyond comfort, I’ll change the topic or step away.",
  ],
  Financial: [
    "If I’m asked to spend beyond my limit, I’ll decline and step back from the plan.",
  ],
  Content: [
    "If I’m posted without consent, I’ll ask for removal and disengage from sharing.",
  ],
  Digital: [
    "If pings arrive across multiple apps, I’ll mute and reply in one place later.",
    "If location/read receipts are expected, I’ll turn them off and set reply windows.",
  ],
};

function lovingConsequence(firmness: Firmness) {
  switch (firmness) {
    case 1: return CONSEQ_GENERAL[1][0];
    case 2: return CONSEQ_GENERAL[2][0];
    case 3: return CONSEQ_GENERAL[3][0];
    case 4: return CONSEQ_GENERAL[4][0];
    case 5:
    default: return CONSEQ_GENERAL[5][0];
  }
}

function consequenceChoices(firmness: Firmness, area?: BoundaryArea): string[] {
  const base = CONSEQ_GENERAL[firmness] || [];
  const extra = (area && CONSEQ_BY_AREA[area]) ? CONSEQ_BY_AREA[area] : [];
  return Array.from(new Set([...base, ...extra])).slice(0, 7);
}

// ---- local “AI” helpers (fallbacks) -----------------------------------------
type Check = { ok: boolean; text: string };

function buildChecks(text: string): Check[] {
  const checks: Check[] = [
    { ok: /I need/i.test(text), text: "Names a clear need (e.g., “I need …”)" },
    { ok: /I will|I won’t|I will no longer|I’ll\s+(pause|step|remove|excuse|end)/i.test(text), text: "States your action if it isn’t met" },
    { ok: !/you always|you never/i.test(text), text: "Avoids absolutes (“always/never”)" },
    { ok: text.trim().split(/\s+/).length >= 12, text: "Has enough detail to be specific" },
    { ok: text.length <= 360, text: "Stays concise (under ~2–3 sentences)" },
  ];
  return checks;
}
function headlineTip(text: string): string {
  if (!text.trim()) return "Draft a boundary to see suggestions.";
  if (/you always|you never/i.test(text)) return "Swap absolutes for specifics (no “always/never”).";
  if (!/I need/i.test(text)) return "Add a short need (“I need …”) so it’s clear what protects you.";
  if (!/I will|I won’t|I will no longer|I’ll\s+(pause|step|remove|excuse|end)/i.test(text))
    return "Add your action if the need isn’t met (“I will …”).";
  return "Looks clear and kind. You’re ready to share it.";
}

/** Build three DISTINCT polished options (no dupes) */
function synthesizePolished({
  opener,
  situation,
  feelingLabel,
  needText,
  firmness,
  closer,
  consequence,
}: {
  opener: string;
  situation: string;
  feelingLabel?: string;
  needText: string;
  firmness: Firmness;
  closer: string;
  consequence: string;
}) {
  const cleanNeed = needText.replace(/^I need\s*/i, "").trim();
  const whenPart = situation ? `When ${situation.trim()},` : "";
  const feelPart = feelingLabel ? ` I’m feeling ${feelingLabel}.` : "";
  const needPart = cleanNeed ? ` I need ${cleanNeed}.` : "";
  const consq = consequence || lovingConsequence(firmness);
  const closerPart = closer ? ` ${closer}` : "";

  const v1 = [
    opener ? `${opener.trim()} ` : "",
    whenPart,
    feelPart,
    needPart,
    ` ${consq}${closerPart}`,
  ].join("").replace(/\s+/g, " ").trim();

  const v2 = [
    whenPart,
    needPart,
    ` ${consq}${closerPart}`,
    opener ? ` ${opener.trim()}` : "",
  ].join("").replace(/\s+/g, " ").trim();

  const v3 = [
    needPart.replace(/^ I need/, "I need"),
    whenPart ? ` ${whenPart.toLowerCase()}` : "",
    ` ${consq}${closerPart}`,
  ].join("").replace(/\s+/g, " ").trim();

  const options = Array.from(new Set([v1, v2, v3])).filter(Boolean).slice(0, 3);

  const openers = OPENER_PRESETS.slice(0, 3);

  return { options, openers };
}

// ---- component --------------------------------------------------------------
type Entry = {
  id: string;
  createdAt: string;
  area: BoundaryArea;
  circle: RelationshipCircle;
  feelings: string[];
  firmness: Firmness;
  situation: string;
  need: string;
  opener: string;
  closer: string;
  consequence: string;
  statement: string;
};

export default function Boundaries() {
  const [showTips, setShowTips] = useState(false);

  // feelings
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);

  // core selectors
  const [area, setArea] = useState<BoundaryArea>("Time");
  const [circle, setCircle] = useState<RelationshipCircle>("Partner");

  // text inputs
  const [situation, setSituation] = useState("");
  const [needPreset, setNeedPreset] = useState("");
  const [needCustom, setNeedCustom] = useState("");

  // opener (dropdown + custom)
  const [openerPreset, setOpenerPreset] = useState(OPENER_PRESETS[0]);
  const [openerCustom, setOpenerCustom] = useState("");

  // firmness + closers
  const [firmness, setFirmness] = useState<Firmness>(3);
  const defaultClosers = CLOSERS_BY_FIRMNESS[firmness];
  const [closerPreset, setCloserPreset] = useState(defaultClosers[0]);
  const [closerCustom, setCloserCustom] = useState("");

  // consequences
  const [consqPreset, setConsqPreset] = useState(consequenceChoices(3, "Time")[0]);
  const [consqCustom, setConsqCustom] = useState("");

  // AI results
  const [aiOptions, setAiOptions] = useState<string[]>([]);
  const [aiOpeners, setAiOpeners] = useState<string[]>([]); // kept (not rendered)
  const [aiBullets, setAiBullets] = useState<string[]>([]);
  const [aiHint, setAiHint] = useState<string>("");

  // toast (non-blocking)
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // entries (local list)
  const [entries, setEntries] = useState<Entry[]>([]);

  // recompute presets when firmness/area changes
  useEffect(() => {
    setCloserPreset(CLOSERS_BY_FIRMNESS[firmness][0]);
    setCloserCustom("");
    const cc = consequenceChoices(firmness, area);
    setConsqPreset(cc[0]);
    setConsqCustom("");
  }, [firmness, area]);

  // active lists
  const activeNeeds = COMMON_NEEDS[area] ?? [];
  const suggestions = useMemo(
    () => getSituationSuggestions(area, circle),
    [area, circle]
  );

  const toggleFeeling = (key: string) =>
    setSelectedFeelings((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const useSuggestion = (text: string) => setSituation(text);

  // compose final preview
  const opener = (openerCustom || openerPreset || "").trim();
  const finalNeed = (needCustom || needPreset || "").trim();
  const finalCloser = (closerCustom || closerPreset || "").trim();
  const finalConsq = (consqCustom || consqPreset || "").trim();
  const firmLabel = FIRMNESS_LABELS[firmness];
  const feelingLabel = selectedFeelings.length
    ? FEELINGS.find((f) => f.key === selectedFeelings[0])?.label
    : undefined;

  const preview = useMemo(() => {
    const parts: string[] = [];
    if (opener) parts.push(opener);
    if (situation.trim()) parts.push(`When ${situation.trim()}.`);
    if (finalNeed) parts.push(`I need ${finalNeed.replace(/^I need\s*/i, "")}.`);

    if (firmness === 1) parts.push("If it’s okay with you, could we try this?");
    if (firmness === 2) parts.push("I’d prefer we do this going forward.");
    if (firmness === 3) parts.push("I need us to follow this consistently.");
    if (firmness === 4) parts.push("If this can’t happen, I’ll pause and revisit later.");
    if (firmness === 5) parts.push("If this continues, I won’t be available for this.");

    if (finalConsq) parts.push(finalConsq);
    if (finalCloser) parts.push(finalCloser);
    return parts.join(" ");
  }, [opener, situation, finalNeed, firmness, finalConsq, finalCloser]);

  const checks = buildChecks(preview);
  const tip = headlineTip(preview);

  // actions: copy/insert
  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(
      () => setToast("Copied to clipboard."),
      () => setToast("Couldn’t copy. Use ⌘/Ctrl+C.")
    );
  }
  function handleInsert(text: string) {
    navigator.clipboard.writeText(text).then(
      () => setToast("Inserted! The option was copied to your clipboard."),
      () => setToast("Couldn’t copy. Use ⌘/Ctrl+C.")
    );
  }

  // AI improve (server + graceful fallback)
  async function handleImproveWithAI() {
    const payload = {
      opener,
      situation,
      feeling: feelingLabel,
      need: finalNeed,
      firmness,
      closer: finalCloser,
      consequence: finalConsq,
      area,
      circle,
    };

    let gotRemote = false;

    try {
      const res = await fetch("/api/ai/boundary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          options?: string[];
          openers?: string[];
          bullets?: string[];
        };
        if (json?.options?.length) {
          const enriched = Array.from(
            new Set(
              json.options.map((o) =>
                /I’ll|I will|I won’t|remove myself|step away|pause|excuse|end the conversation|limit contact/i.test(
                  o
                )
                  ? o
                  : `${o.trim()} ${finalConsq || lovingConsequence(firmness)}`.trim()
              )
            )
          ).slice(0, 3);
          setAiOptions(enriched);
          setAiOpeners(json.openers?.slice(0, 5) || []);
          setAiBullets(json.bullets?.slice(0, 5) || []);
          gotRemote = true;
        }
      }
    } catch {}

    if (!gotRemote) {
      const { options, openers: localOpeners } = synthesizePolished({
        opener,
        situation,
        feelingLabel,
        needText: finalNeed,
        firmness,
        closer: finalCloser,
        consequence: finalConsq,
      });
      setAiOptions(options);
      setAiOpeners(localOpeners);
      setAiBullets([]);
    }

    const missingNeed = !/I need/i.test(preview);
    setAiHint(
      missingNeed
        ? 'Include a need (e.g., “I need phone-free dinners.”).'
        : "Pick a polished option."
    );
  }

  // save (local list for now)
  function onSave() {
    const entry: Entry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      area,
      circle,
      feelings: selectedFeelings.slice(),
      firmness,
      situation,
      need: finalNeed,
      opener,
      closer: finalCloser,
      consequence: finalConsq,
      statement: preview,
    };
    setEntries((prev) => [entry, ...prev]);

    // light reset (keep area/circle/feelings)
    setSituation("");
    setNeedPreset("");
    setNeedCustom("");
    setOpenerCustom("");
    setCloserCustom("");
    setConsqCustom("");
    setAiOptions([]);
    setAiOpeners([]);
    setAiBullets([]);
    setAiHint("");
    setToast("Saved to list below.");
  }

  // UI helpers
  const feelingChip = (key: string, label: string, from: string, to: string) => {
    const active = selectedFeelings.includes(key);
    return (
      <button
        key={key}
        type="button"
        onClick={() => toggleFeeling(key)}
        style={{ backgroundImage: `linear-gradient(90deg, ${from}, ${to})` }}
        className={`${pillBase} min-w-[240px]`}
      >
        <span className="text-white">{label}</span>
        <span
          className={`ml-3 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/70 ${active ? "bg-white/90 text-emerald-700" : "bg-transparent text-white/80"}`}
        >
          {active ? "✓" : ""}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className={`rounded-2xl ${brandGradient} p-6 md:p-8 text-white mb-6`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Boundary Builder</h1>
            <p className="mt-1 text-white/90">
              Create and communicate healthy boundaries with clarity and compassion.
            </p>
          </div>
          <button
            className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20"
            onClick={() => setShowTips(true)}
          >
            Tips
          </button>
        </div>
      </div>

      {/* 1. Feelings */}
      <section className={`${card} mb-6`}>
        <div className={sectionTitle}>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-sm">
            1
          </span>
          My Feelings
          <span className="ml-2 text-sm text-slate-500 font-normal">
            (optional, included in your communication)
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {FEELINGS.slice(0, 6).map((f) => feelingChip(f.key, f.label, f.from, f.to))}
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {FEELINGS.slice(6).map((f) => feelingChip(f.key, f.label, f.from, f.to))}
        </div>

        {selectedFeelings.length > 0 && (
          <div className="mt-3">
            <span className={badge}>Selected: {selectedFeelings.length}</span>
          </div>
        )}
      </section>

      {/* 2. Situation */}
      <section className={`${card} mb-6`}>
        <div className={sectionTitle}>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white text-sm">
            2
          </span>
          The Situation
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Boundary Area
            </label>
            <div className="relative">
              <select
                className={selectBox}
                value={area}
                onChange={(e) => setArea(e.target.value as BoundaryArea)}
              >
                {BOUNDARY_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                ▼
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Relationship Circle
            </label>
            <div className="relative">
              <select
                className={selectBox}
                value={circle}
                onChange={(e) => setCircle(e.target.value as RelationshipCircle)}
              >
                {RELATIONSHIP_CIRCLES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                ▼
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Describe the situation or behavior
          </label>
          <textarea
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            rows={3}
            placeholder="e.g., my partner overspent without checking with me…"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
          />
        </div>

        {/* suggestions */}
        <div className="mt-4">
          <div className="mb-2 text-xs font-medium text-slate-500">
            Suggestions reflect <span className="underline">{area}</span> ×{" "}
            <span className="underline">{circle}</span>
          </div>
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 overflow-hidden">
            {suggestions.map((s, idx) => (
              <li key={idx} className="flex items-start justify-between gap-4 p-3">
                <span className="text-slate-700">{s}</span>
                <button className={buttonOutline} onClick={() => useSuggestion(s)}>
                  Use
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Need */}
      <section className={`${card} mb-6`}>
        <div className={sectionTitle}>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-white text-sm">
            3
          </span>
          My Need (short)
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Pick a common need
            </label>
            <div className="relative">
              <select
                className={selectBox}
                value={needPreset}
                onChange={(e) => setNeedPreset(e.target.value)}
              >
                <option value="">Pick a need…</option>
                {activeNeeds.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                ▼
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Or type your own
            </label>
            <input
              className={selectBox}
              placeholder={`e.g., "agree before purchases over $200."`}
              value={needCustom}
              onChange={(e) => setNeedCustom(e.target.value)}
            />
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          <strong>Need</strong> = what keeps you safe/well.{" "}
          <strong>Boundary</strong> (next) = what you’ll do to protect that need.
        </p>
      </section>

      {/* 4. Communication */}
      <section className={`${card} mb-6`}>
        <div className={sectionTitle}>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-sm">
            4
          </span>
          My Communication
        </div>

        {/* firmness */}
        <div className="mt-3 grid grid-cols-5 gap-3">
          {(Object.keys(FIRMNESS_LABELS) as (keyof typeof FIRMNESS_LABELS)[]).map(
            (lvl) => {
              const lv = Number(lvl) as Firmness;
              const active = firmness === lv;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFirmness(lv)}
                  className={`rounded-xl border px-3 py-2 text-center text-sm font-semibold transition ${
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="text-base">{lv}</div>
                  <div className="mt-0.5 opacity-80">{FIRMNESS_LABELS[lv]}</div>
                </button>
              );
            }
          )}
        </div>

        {/* opener + closer + consequence */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Opener */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              My opener (first sentence)
            </label>
            <div className="grid gap-2">
              <div className="relative">
                <select
                  className={selectBox}
                  value={openerPreset}
                  onChange={(e) => setOpenerPreset(e.target.value)}
                >
                  {OPENER_PRESETS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  ▼
                </span>
              </div>
              <input
                className={selectBox}
                placeholder={`Or type your own opener…`}
                value={openerCustom}
                onChange={(e) => setOpenerCustom(e.target.value)}
              />
            </div>
          </div>

          {/* Closer */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Closing line (fits firmness)
            </label>
            <div className="grid grid-cols-1 gap-2">
              <div className="relative">
                <select
                  className={selectBox}
                  value={closerPreset}
                  onChange={(e) => setCloserPreset(e.target.value)}
                >
                  {CLOSERS_BY_FIRMNESS[firmness].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  ▼
                </span>
              </div>
              <input
                className={selectBox}
                placeholder="Or type your own closer…"
                value={closerCustom}
                onChange={(e) => setCloserCustom(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Consequence */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Consequence (what you’ll do if the need isn’t met)
            </label>
            <div className="grid gap-2">
              <div className="relative">
                <select
                  className={selectBox}
                  value={consqPreset}
                  onChange={(e) => setConsqPreset(e.target.value)}
                >
                  {consequenceChoices(firmness, area).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  ▼
                </span>
              </div>
              <input
                className={selectBox}
                placeholder="Or type your own consequence..."
                value={consqCustom}
                onChange={(e) => setConsqCustom(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* live preview with colored, numbered chips */}
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {selectedFeelings.length > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">1</span>
                Feelings:
                <strong className="text-emerald-900 ml-1">
                  {selectedFeelings
                    .map((k) => FEELINGS.find((f) => f.key === k)?.label || k)
                    .join(", ")}
                </strong>
              </span>
            )}
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${firmnessColors[firmness]}`}>
              {firmLabel}
            </span>
          </div>

          <p className="text-slate-900 leading-relaxed">
            {opener && <><strong>{opener.trim()}</strong>{" "}</>}
            {situation && (
              <>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white text-[10px] mr-1 align-baseline">2</span>
                <span className="font-semibold">When</span>{" "}
                <span className="font-medium">{situation.trim()}</span>.{" "}
              </>
            )}
            {finalNeed && (
              <>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-white text-[10px] mr-1 align-baseline">3</span>
                <span className="font-semibold">I need</span>{" "}
                <span className="font-medium">
                  {finalNeed.replace(/^I need\s*/i, "")}
                </span>
                .{" "}
              </>
            )}
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] mr-1 align-baseline">4</span>
            <span className="font-semibold">
              {firmness === 1
                ? "If it’s okay with you,"
                : firmness === 2
                ? "I’d prefer"
                : firmness === 3
                ? "I need"
                : firmness === 4
                ? "I will"
                : "I will no longer tolerate"}
            </span>{" "}
            {firmness === 1
              ? "could we try this?"
              : firmness === 2
              ? "we do this going forward."
              : firmness === 3
              ? "us to follow this consistently."
              : firmness === 4
              ? "pause and revisit later if this can’t happen."
              : "this if it continues."}{" "}
            {finalConsq && (
              <>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] mr-1 align-baseline">5</span>
                <strong>{finalConsq}</strong>{" "}
              </>
            )}
            {finalCloser && (
              <>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-white text-[10px] mr-1 align-baseline">6</span>
                <strong>{finalCloser}</strong>
              </>
            )}
          </p>
        </div>

        {/* Feedback + AI */}
        <div className="mt-3 grid gap-3">
          <div className="text-sm font-semibold text-slate-700">Feedback</div>
          <div className="text-sm text-slate-700">{tip}</div>
          <ul className="mt-1 grid gap-1">
            {checks.map((c, i) => (
              <li key={i} className="text-sm text-slate-700">
                <span className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${c.ok ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                  {c.ok ? "✓" : "•"}
                </span>
                {c.text}
              </li>
            ))}
          </ul>

          {/* AI tips/feedback (green, same theme) */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-sm font-semibold text-emerald-900">AI tips</div>
            <ul className="mt-1 list-disc pl-5 text-sm text-emerald-900">
              {aiBullets.length > 0 ? (
                aiBullets.map((b, i) => <li key={i}>{b}</li>)
              ) : (
                <li>{aiHint || 'Click "Improve with AI" to get polished sentences.'}</li>
              )}
            </ul>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-600 text-emerald-700 px-3 py-1.5 font-medium hover:bg-emerald-50 transition"
              onClick={handleImproveWithAI}
            >
              ✨ Improve with AI
            </button>
          </div>

          {aiOptions.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="px-3 py-2 border-b text-slate-800 font-semibold">
                Polished options (pick one):
              </div>
              <ul className="divide-y">
                {aiOptions.map((opt, i) => (
                  <li key={i} className="p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <p className="text-slate-800 md:pr-4">{opt}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                        onClick={() => handleCopy(opt)}
                      >
                        📋 Copy
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-3 py-1.5 font-semibold hover:bg-emerald-700"
                        onClick={() => handleInsert(opt)}
                      >
                        Insert
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {/* (Removed) Openers (tap to use) block */}
            </div>
          )}
        </div>
      </section>

      {/* actions */}
      <div className="mb-6 flex items-center justify-end gap-3">
        <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button className={buttonPrimary} onClick={onSave}>
          Save Boundary
        </button>
      </div>

      {/* entries list */}
      {entries.length > 0 && (
        <section className={`${card} mb-20`}>
          <div className={sectionTitle}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-white text-sm">
              ✓
            </span>
            My Boundaries
          </div>

          <div className="mt-3 grid gap-3">
            {entries.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-slate-200 bg-white p-3 md:p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">{new Date(e.createdAt).toLocaleString()}</span>
                  <span className={badge}>{e.area}</span>
                  <span className={badge}>{e.circle}</span>
                  <span className={badge}>{FIRMNESS_LABELS[e.firmness]}</span>
                  {e.feelings.length > 0 && (
                    <span className={badge}>
                      {e.feelings
                        .map((k) => FEELINGS.find((f) => f.key === k)?.label || k)
                        .join(", ")}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-slate-800">{e.statement}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* tips modal */}
      {showTips && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setShowTips(false)} />
          <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold text-slate-800">Tips</h3>
              <button
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                onClick={() => setShowTips(false)}
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-4">
              <BoundaryGuide />
            </div>
            <div className="flex justify-end border-t p-3">
              <button className={buttonPrimary} onClick={() => setShowTips(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-xl bg-slate-900 text-white px-4 py-2 shadow-lg ring-1 ring-black/10">
          {toast}
        </div>
      )}
    </div>
  );
}
