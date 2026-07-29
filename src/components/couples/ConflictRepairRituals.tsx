// src/components/couples/ConflictRepairRituals.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Info,
  Pause,
  Play,
  RefreshCw,
  Save,
  Share2,
  SwitchCamera,
  PartyPopper,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "../../context/SubscriptionContext";
import { useUser } from "../../context/UserContext";
import { supabase } from "../../lib/supabase";
import FeatureAccessGuard from "../subscription/FeatureAccessGuard";

/* =========================
   Color palette (design preserved)
========================= */
const GRADIENTS = [
  "from-[#e88584] to-[#8e4f63]",   // 0 Rose Blush → Dusty Plum
  "from-[#0068aa] to-[#004d7f]",   // 1 Deep Sky Blue → Midnight Blue
  "from-[#FFA600] to-[#B36B00]",   // 2 Amber Gold → Bronze Spice
  "from-[#B1E006] to-[#6C8300]",   // 3 Lime Zest → Olive Moss
  "from-[#F27C7C] to-[#E03B3B]",   // 4 Coral Rose → Crimson Flame
  "from-[#080B42] to-[#6A51A6]",   // 5 Navy Twilight → Royal Violet
  "from-[#00789f] to-[#005a77]",   // 6 Ocean Teal → Deep Aquamarine
  "from-[#ea697c] to-[#b8455c]",   // 7 Watermelon Pink → Berry Wine
  "from-[#008792] to-[#006a70]",   // 8 Sea Foam Teal → Forest Blue
  "from-[#7b5595] to-[#5d4070]",   // 9 Lavender Grape → Plum Smoke
  "from-[#0068aa] to-[#004d7f]",   // 10 Deep Sky Blue → Midnight Blue (dup)
  "from-[#01B1AF] to-[#018a88]",   // 11 Teal header + buttons
] as const;

/* =========================
   Presets
========================= */
const FEELINGS = ["angry", "anxious", "disappointed", "frustrated", "hurt", "lonely", "overwhelmed", "sad", "scared"];

const EVENTS = [
  "the phone stayed out during dinner",
  "voices were raised last night",
  "plans were cancelled",
  "a text didn’t get a reply",
  "my idea was dismissed in front of others",
  "we were running late and things got tense",
];

const NEEDS = ["reassurance", "connection", "respect", "calm", "to feel included", "clarity", "kindness", "space", "teamwork"];

type Role = "A_speaker" | "B_speaker";

/* =========================
   Local UI helpers
========================= */
function classNames(...s: (string | false | undefined)[]) {
  return s.filter(Boolean).join(" ");
}

const RolePill: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white border border-white/30">
    {label}
  </span>
);

const ColorDots: React.FC<{ onPick: (i: number) => void; options?: number[] }> = ({ onPick, options = [11, 0, 8, 6, 1, 2, 3] }) => (
  <div className="flex items-center gap-1">
    {options.map((i) => (
      <button
        key={i}
        onClick={() => onPick(i)}
        className="h-4 w-4 rounded-full border border-white/60 ring-1 ring-white/20"
        style={{
          background:
            i === 11 ? "#01B1AF" :
            i === 0 ? "#8e4f63" :
            i === 8 ? "#008792" :
            i === 6 ? "#00789f" :
            i === 1 ? "#0068aa" :
            i === 2 ? "#FFA600" : "#B1E006",
        }}
        aria-label="Change color"
        title="Change color"
      />
    ))}
  </div>
);

/* Reusable shell with gradient header */
const CardShell: React.FC<{ title: string; gradientIndex: number; right?: React.ReactNode; children: React.ReactNode }> = ({ title, gradientIndex, right, children }) => (
  <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50">
    <div className={classNames("bg-gradient-to-r px-4 py-3 flex items-center justify-between", GRADIENTS[gradientIndex])}>
      <h3 className="text-white font-semibold">{title}</h3>
      {right}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const Chip: React.FC<{ active?: boolean; onClick?: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={classNames(
      "px-3 py-1 rounded-full text-sm border transition-colors",
      active ? "bg-[#01B1AF] text-white border-[#01B1AF]" : "bg-white text-gray-800 border-gray-300 hover:border-[#01B1AF]"
    )}
  >
    {children}
  </button>
);

/* =========================
   MAIN COMPONENT
========================= */
export default function ConflictRepairRituals() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPremium = hasAccess("couples-cards");

  if (!isPremium) {
    return (
      <FeatureAccessGuard featureId="couples-cards" currentPlan={currentPlan}>
        <ConflictRepairRitualsContent />
      </FeatureAccessGuard>
    );
  }

  return <ConflictRepairRitualsContent />;
}

function ConflictRepairRitualsContent() {
  const navigate = useNavigate();
  const { userData } = useUser();

  // Steps:
  // 1 Breathing
  // 2 Prep side-by-side
  // 3 Role + Dialogue
  // 4 Continue Dialogue
  // 5 Ownership
  // 6 Sincere Apology (simple)
  // 7 Commitments
  // 8 Finish
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1);
  const totalSteps = 8;

  // Color themes
  const [themeA, setThemeA] = useState<number>(11); // teal
  const [themeB, setThemeB] = useState<number>(0);  // rose→plum

  // Tips flyout (header)
  const [showTips, setShowTips] = useState<boolean>(false);

  // --------- Step 1: Breathing ----------
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [breathRem, setBreathRem] = useState(120);
  const breathRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://static.wixstatic.com/mp3/4e16d8_65e41d47c8494041881ae090c682c72a.mp3");
    audioRef.current.loop = true;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying && breathRem > 0) {
      breathRef.current = window.setInterval(() => setBreathRem((s) => (s > 0 ? s - 1 : 0)), 1000);
    }
    return () => {
      if (breathRef.current) window.clearInterval(breathRef.current);
    };
  }, [isPlaying, breathRem]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // --------- Step 2: Prep ----------
  type Prep = {
    feeling: string;
    feelingCustom: string;
    event: string;
    eventCustom: string;
    need: string;
    needCustom: string;
  };
  const [prepA, setPrepA] = useState<Prep>({ feeling: "", feelingCustom: "", event: "", eventCustom: "", need: "", needCustom: "" });
  const [prepB, setPrepB] = useState<Prep>({ feeling: "", feelingCustom: "", event: "", eventCustom: "", need: "", needCustom: "" });

  const statement = (p: Prep) => {
    const f = p.feeling || p.feelingCustom.trim();
    const e = p.event || p.eventCustom.trim();
    if (!f || !e) return "";
    return `When ${e}, I felt ${f}.`;
    };
  const readyPrep = useMemo(() => !!statement(prepA) && !!statement(prepB), [prepA, prepB]);

  // --------- Step 3/4: Dialogue ----------
  const [currentRole, setCurrentRole] = useState<Role>("A_speaker");
  const [agreed, setAgreed] = useState(false);

  const [len, setLen] = useState<30 | 60 | 120>(60);
  const [rem, setRem] = useState<number>(60);
  const [running, setRunning] = useState(false);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    if (running && rem > 0) {
      tRef.current = window.setInterval(() => setRem((s) => s - 1), 1000);
    }
    return () => {
      if (tRef.current) window.clearInterval(tRef.current);
    };
  }, [running, rem]);

  useEffect(() => {
    setRunning(false);
    setRem(len);
  }, [len, currentRole]);

  const swapRoles = () => setCurrentRole((r) => (r === "A_speaker" ? "B_speaker" : "A_speaker"));

  // --------- Step 5: Ownership ----------
  type OwnIt = { regret: string; own: string };
  const [ownA, setOwnA] = useState<OwnIt>({ regret: "", own: "" });
  const [ownB, setOwnB] = useState<OwnIt>({ regret: "", own: "" });
  const readyOwn = useMemo(() => !!ownA.regret && !!ownA.own && !!ownB.regret && !!ownB.own, [ownA, ownB]);

  // --------- Step 6: Sincere Apology (simple; BLANK by default) ----------
  type SimpleApology = { apology: string; impact: string };
  const [apolA, setApolA] = useState<SimpleApology>({ apology: "", impact: "" });
  const [apolB, setApolB] = useState<SimpleApology>({ apology: "", impact: "" });
  // (No prefill effect so these render blank.)

  // --------- Step 7: Commitments ----------
  const [commitA, setCommitA] = useState({ appreciation: "", gesture: "" });
  const [commitB, setCommitB] = useState({ appreciation: "", gesture: "" });

  // --------- Final: Save to Journal ----------
  const [saving, setSaving] = useState(false);
  async function handleSaveToJournal() {
    if (!userData?.id) {
      alert("You need to be signed in to save to your journal.");
      return;
    }
    setSaving(true);
    try {
      // Step 2: capture feelings/concerns/needs/statements
      const feelA = prepA.feeling || prepA.feelingCustom || "";
      const eventA = prepA.event || prepA.eventCustom || "";
      const needA  = prepA.need || prepA.needCustom || "";
      const stmtA  = statement(prepA);

      const feelB = prepB.feeling || prepB.feelingCustom || "";
      const eventB = prepB.event || prepB.eventCustom || "";
      const needB  = prepB.need || prepB.needCustom || "";
      const stmtB  = statement(prepB);

      const title = `Conflict Repair Ritual — ${new Date().toLocaleString()}`;

      const md = [
        `### Conflict Repair Ritual`,
        ``,
        `**Partner A — Prep (Feelings & Concerns)**`,
        `- Feeling: ${feelA || "—"}`,
        `- Concern (event): ${eventA || "—"}`,
        `- Need: ${needA || "—"}`,
        `- Statement: ${stmtA || "—"}`,
        ``,
        `**Partner A — Ownership**`,
        `- Regret: ${ownA.regret || "—"}`,
        `- Ownership: ${ownA.own || "—"}`,
        ``,
        `**Partner A — Sincere Apology**`,
        `- Apology: ${apolA.apology || "—"}`,
        `- Imagined Feelings: ${apolA.impact || "—"}`,
        ``,
        `**Partner B — Prep (Feelings & Concerns)**`,
        `- Feeling: ${feelB || "—"}`,
        `- Concern (event): ${eventB || "—"}`,
        `- Need: ${needB || "—"}`,
        `- Statement: ${stmtB || "—"}`,
        ``,
        `**Partner B — Ownership**`,
        `- Regret: ${ownB.regret || "—"}`,
        `- Ownership: ${ownB.own || "—"}`,
        ``,
        `**Partner B — Sincere Apology**`,
        `- Apology: ${apolB.apology || "—"}`,
        `- Imagined Feelings: ${apolB.impact || "—"}`,
        ``,
        `**Commitments**`,
        `- A Appreciation: ${commitA.appreciation || "—"}`,
        `- A Commitment: ${commitA.gesture || "—"}`,
        `- B Appreciation: ${commitB.appreciation || "—"}`,
        `- B Commitment: ${commitB.gesture || "—"}`,
      ].join("\n");

      const { error } = await supabase.from("journal_entries").insert([
        { user_id: userData.id, title, content: md, mood: null, bookmarked: false },
      ]);

      if (error) throw error;
      alert("Saved to Journal");
    } catch (e) {
      console.error(e);
      alert("Could not save to Journal.");
    } finally {
      setSaving(false);
    }
  }

  /* =========================
     RENDER (design preserved)
  ========================== */
  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-8">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-1">Conflict Repair Rituals</h1>
              <p className="text-white/80">Step {step} of {totalSteps}</p>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTips((s) => !s)}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-white/15 text-white border border-white/30 backdrop-blur-sm hover:bg-white/25 transition"
              >
                <Info className="h-4 w-4" />
                <span>Tips</span>
                {showTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        {showTips && <div className="mt-6"><TipsFlyout /></div>}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-500 text-sm">Progress</span>
          <span className="text-gray-500 text-sm">{step}/{totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div className="bg-brand-green h-full rounded-full transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
      </div>

      {/* ===== Step 1: Breathing ===== */}
      {step === 1 && (
        <div className="space-y-6">
          <CardShell title="Step 1 • Breathe & Reset" gradientIndex={11}>
            <div className="space-y-4">
              <p className="text-gray-800">Take two minutes to shift from reactivity to receptivity together.</p>
              <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-brand-green" />
                    <span className="text-xl font-semibold text-gray-800">{fmt(breathRem)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!audioRef.current) return;
                        if (isPlaying) audioRef.current.pause();
                        else audioRef.current.play();
                        setIsPlaying((p) => !p);
                      }}
                      className="p-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200"
                      title={isPlaying ? "Pause audio" : "Play audio"}
                    >
                      {isPlaying ? <Pause className="h-5 w-5 text-gray-700" /> : <Play className="h-5 w-5 text-gray-700" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!audioRef.current) return;
                        audioRef.current.muted = !isMuted;
                        setIsMuted((p) => !p);
                      }}
                      className="p-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none">
                          <path d="M9 9L5 13H2V11H4.586L8 7.586V4H10V8.586L14 12.586V4H16V16.586L18 18.586L16.586 20L14 17.414V20H12V15.414L9 12.414V9Z" fill="currentColor"/>
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none">
                          <path d="M10 4V8.586L6.586 12H3V10H5.414L9 6.414V4H10Z" fill="currentColor"/>
                          <path d="M12 4H14V20H12V4ZM16 7.414L19.293 10.707L18 12L16 10L16 7.414Z" fill="currentColor"/>
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBreathRem(120);
                        setIsPlaying(false);
                        audioRef.current?.pause();
                        if (audioRef.current) audioRef.current.currentTime = 0;
                      }}
                      className="p-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200"
                      title="Reset"
                    >
                      <RefreshCw className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">Breathe in for 4 • hold 4 • out for 6. Keep attention on the breath, not the problem.</p>
              </div>
            </div>
          </CardShell>

          <div className="flex justify-between">
            <div />
            <Button onClick={() => setStep(2)} className="bg-gradient-to-r from-[#01B1AF] to-[#018a88] text-white">
              Next
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ===== Step 2: Prep ===== */}
      {step === 2 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardShell title="You" gradientIndex={themeA} right={<ColorDots onPick={setThemeA} />}>
              <PrepFields value={prepA} onChange={setPrepA} feelings={FEELINGS} events={EVENTS} needs={NEEDS} />
              <StatementPreview text={statement(prepA)} />
            </CardShell>
            <CardShell title="Your Partner" gradientIndex={themeB} right={<ColorDots onPick={setThemeB} />}>
              <PrepFields value={prepB} onChange={setPrepB} feelings={FEELINGS} events={EVENTS} needs={NEEDS} />
              <StatementPreview text={statement(prepB)} />
            </CardShell>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(1)} className="border-gray-300 text-gray-800 hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!readyPrep} className="bg-gradient-to-r from-[#01B1AF] to-[#018a88] text-white disabled:opacity-60">
              Next: Choose Roles
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </>
      )}

      {/* ===== Step 3: Role + Dialogue ===== */}
      {step === 3 && (
        <>
          <RoleRow
            themeA={themeA}
            themeB={themeB}
            currentRole={currentRole}
            titleLeft={currentRole === "A_speaker" ? "Speaker • You" : "Speaker • Your Partner"}
            titleRight={currentRole === "A_speaker" ? "Listener • Your Partner" : "Listener • You"}
            leftContent={
              <SpeakerPanel
                script={currentRole === "A_speaker" ? statement(prepA) : statement(prepB)}
                len={len}
                setLen={setLen}
                rem={rem}
                setRem={setRem}
                running={running}
                setRunning={setRunning}
                tips={["Positive communication", "Monitor emotions", "Avoid “you” or placing blame.", "Respond to mirroring statements from the listener."]}
              />
            }
            rightContent={
              <ListenerPanel
                blocks={[
                  { title: "Active Listening", items: ["Curiosity over correction", "Breathe / Monitor emotions", "Request a pause if feeling attacked."] },
                  { title: "Mirroring", items: ['“What I hear you saying is…”', '“Did I get that right?”', '“Is there more?”'] },
                ]}
              />
            }
          />

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(2)} className="border-gray-300 text-gray-800 hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>

            <div className="flex gap-3">
              <Button variant="solid" onClick={swapRoles} className="bg-gradient-to-r from-[#01B1AF] to-[#018a88] text-white">
                <SwitchCamera className="h-5 w-5 mr-2" />
                Switch Roles (flip sides)
              </Button>

              {!agreed && (
                <Button onClick={() => setAgreed(true)} className="bg-gradient-to-r from-[#B1E006] to-[#6C8300] text-white">
                  We Agree to These Roles
                  <CheckCircle className="h-5 w-5 ml-2" />
                </Button>
              )}

              <Button onClick={() => setStep(4)} disabled={!agreed} className="bg-gradient-to-r from-[#01B1AF] to-[#018a88] text-white disabled:opacity-60">
                Continue Dialogue
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ===== Step 4: Continue Dialogue ===== */}
      {step === 4 && (
        <>
          <RoleRow
            themeA={themeA}
            themeB={themeB}
            currentRole={currentRole}
            titleLeft={currentRole === "A_speaker" ? "Speaker • You" : "Speaker • Your Partner"}
            titleRight={currentRole === "A_speaker" ? "Listener • Your Partner" : "Listener • You"}
            leftContent={<TipsList title="Speaker Tips (Continue)" items={["Continue positivity", "Monitor emotions", "Allow partner to process"]} />}
            rightContent={
              <div className="grid grid-cols-1 gap-3">
                <GuideBlock title="Validate" lines={['“That makes sense because…”', '“Does it feel like I’m hearing you?”', 'If not: “I want to understand your perspective.”']} />
                <GuideBlock title="Empathize" lines={['“I imagine you felt…”', '“Does that sound right?”', '“Is there more?”']} />
              </div>
            }
          />

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(3)} className="border-gray-300 text-gray-800 hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <Button onClick={() => setStep(5)} className="bg-gradient-to-r from-[#01B1AF] to-[#018a88] text-white">
              Continue
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </>
      )}

      {/* ===== Step 5: Ownership ===== */}
      {step === 5 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardShell title="Partner A — Ownership" gradientIndex={themeA}>
              <OwnItFields value={ownA} onChange={setOwnA} />
            </CardShell>
            <CardShell title="Partner B — Ownership" gradientIndex={themeB}>
              <OwnItFields value={ownB} onChange={setOwnB} />
            </CardShell>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(4)} className="border-gray-300 text-gray-800 hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <Button onClick={() => setStep(6)} disabled={!readyOwn} className="bg-gradient-to-r from-[#01B1AF] to-[#018a88] text-white disabled:opacity-60">
              Continue to Apologies
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </>
      )}

      {/* ===== Step 6: Sincere Apology (simple) ===== */}
      {step === 6 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardShell title="Partner A — Sincere Apology" gradientIndex={themeA}>
              <SimpleApologyFields value={apolA} onChange={setApolA} />
            </CardShell>
            <CardShell title="Partner B — Sincere Apology" gradientIndex={themeB}>
              <SimpleApologyFields value={apolB} onChange={setApolB} />
            </CardShell>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(5)} className="border-gray-300 text-gray-800 hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <Button onClick={() => setStep(7)} className="bg-gradient-to-r from-[#01B1AF] to-[#018a88] text-white">
              Continue to Commitments
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </>
      )}

      {/* ===== Step 7: Commitments ===== */}
      {step === 7 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardShell title="Partner A — Reconnect & Reaffirm" gradientIndex={themeA}>
              <CommitFields value={commitA} onChange={setCommitA} />
            </CardShell>
            <CardShell title="Partner B — Reconnect & Reaffirm" gradientIndex={themeB}>
              <CommitFields value={commitB} onChange={setCommitB} />
            </CardShell>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(6)} className="border-gray-300 text-gray-800 hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <Button onClick={() => setStep(8)} className="bg-gradient-to-r from-[#01B1AF] to-[#018a88] text-white">
              Finish
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </>
      )}

      {/* ===== Step 8: Completed ===== */}
      {step === 8 && (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="bg-brand-green/20 p-6 rounded-full">
              <PartyPopper className="h-16 w-16 text-brand-green" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900">Ritual Complete</h2>
          <p className="text-lg text-gray-700">You’ve taken a meaningful step toward healing.</p>

          <div className="bg-gray-100 p-6 rounded-xl border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Commitments</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm">Partner A</p>
                <p className="text-gray-800 mt-1"><span className="font-medium">Appreciation: </span>{commitA.appreciation || "—"}</p>
                <p className="text-gray-800"><span className="font-medium">Commitment: </span>{commitA.gesture || "—"}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm">Partner B</p>
                <p className="text-gray-800 mt-1"><span className="font-medium">Appreciation: </span>{commitB.appreciation || "—"}</p>
                <p className="text-gray-800"><span className="font-medium">Commitment: </span>{commitB.gesture || "—"}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button onClick={() => navigate("/dashboard")} className="bg-gradient-to-r from-[#01B1AF] to-[#018a88] text-white">
                Return to Dashboard
              </Button>
            </div>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <button className="flex items-center text-brand-green hover:text-brand-green/80 transition-colors">
              <Share2 className="h-5 w-5 mr-2" />
              Share This Experience
            </button>
            <button
              onClick={handleSaveToJournal}
              disabled={saving}
              className="flex items-center text-brand-green hover:text-brand-green/80 transition-colors disabled:opacity-60"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? "Saving…" : "Save to Journal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   Subcomponents
========================= */

function PrepFields({
  value,
  onChange,
  feelings,
  events,
  needs,
}: {
  value: {
    feeling: string;
    feelingCustom: string;
    event: string;
    eventCustom: string;
    need: string;
    needCustom: string;
  };
  onChange: (v: any) => void;
  feelings: string[];
  events: string[];
  needs: string[];
}) {
  return (
    <div className="space-y-4">
      {/* Feeling */}
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-2">Pick a feeling</p>
        <div className="flex flex-wrap gap-2">
          {feelings.map((f) => (
            <Chip key={f} active={value.feeling === f} onClick={() => onChange({ ...value, feeling: f, feelingCustom: "" })}>
              {f}
            </Chip>
          ))}
          <input
            type="text"
            placeholder="custom"
            value={value.feelingCustom}
            onChange={(e) => onChange({ ...value, feeling: "", feelingCustom: e.target.value })}
            className="px-3 py-1 rounded-full text-sm bg-white border border-gray-300 text-gray-900"
          />
        </div>
      </div>

      {/* Event */}
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-2">What was the event?</p>
        <div className="flex flex-wrap gap-2">
          {events.map((ev) => (
            <Chip key={ev} active={value.event === ev} onClick={() => onChange({ ...value, event: ev, eventCustom: "" })}>
              {ev}
            </Chip>
          ))}
        </div>
        <input
          type="text"
          placeholder="or type your own…"
          value={value.eventCustom}
          onChange={(e) => onChange({ ...value, event: "", eventCustom: e.target.value })}
          className="mt-2 w-full p-3 bg-white text-black border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-brand-green"
        />
      </div>

      {/* Need */}
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-2">What did you need? (for your awareness)</p>
        <div className="flex flex-wrap gap-2">
          {needs.map((n) => (
            <Chip key={n} active={value.need === n} onClick={() => onChange({ ...value, need: n, needCustom: "" })}>
              {n}
            </Chip>
          ))}
          <input
            type="text"
            placeholder="custom"
            value={value.needCustom}
            onChange={(e) => onChange({ ...value, need: "", needCustom: e.target.value })}
            className="px-3 py-1 rounded-full text-sm bg-white border border-gray-300 text-gray-900"
          />
        </div>
      </div>
    </div>
  );
}

function StatementPreview({ text }: { text: string }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4">
      <p className="text-gray-700 text-sm mb-1">Your statement</p>
      <p className="text-gray-900">{text || <span className="text-gray-400">—</span>}</p>
    </div>
  );
}

function GuideBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200">
      <p className="font-semibold text-gray-900 mb-1">{title}</p>
      <ul className="text-sm text-gray-700 space-y-1">
        {lines.map((l, i) => (
          <li key={i}>• {l}</li>
        ))}
      </ul>
    </div>
  );
}

function TipsList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <p className="font-semibold text-gray-900 mb-2">{title}</p>
      <ul className="text-sm text-gray-700 space-y-1">
        {items.map((i, idx) => (
          <li key={idx}>• {i}</li>
        ))}
      </ul>
    </div>
  );
}

/* Speaker/Listener layout row */
function RoleRow({
  themeA,
  themeB,
  currentRole,
  titleLeft,
  titleRight,
  leftContent,
  rightContent,
}: {
  themeA: number;
  themeB: number;
  currentRole: Role;
  titleLeft: string;
  titleRight: string;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}) {
  const leftGrad = currentRole === "A_speaker" ? themeA : themeB;
  const rightGrad = currentRole === "A_speaker" ? themeB : themeA;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all">
      <CardShell title={titleLeft} gradientIndex={leftGrad}>
        {leftContent}
      </CardShell>
      <CardShell title={titleRight} gradientIndex={rightGrad}>
        {rightContent}
      </CardShell>
    </div>
  );
}

/* Speaker panel */
function SpeakerPanel({
  script,
  len,
  setLen,
  rem,
  setRem,
  running,
  setRunning,
  tips,
}: {
  script: string;
  len: 30 | 60 | 120;
  setLen: (v: 30 | 60 | 120) => void;
  rem: number;
  setRem: (v: number) => void;
  running: boolean;
  setRunning: (v: boolean | ((p: boolean) => boolean)) => void;
  tips: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-gray-700 text-sm mb-1">Script</p>
        <p className="text-gray-900 text-lg">{script || "—"}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-brand-green" />
          <span className="text-xl font-semibold text-gray-800">
            {Math.floor(rem / 60)}:{String(rem % 60).padStart(2, "0")}
          </span>
          <select
            value={len}
            onChange={(e) => setLen(Number(e.target.value) as 30 | 60 | 120)}
            className="ml-2 bg-white text-gray-900 border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={30}>30s</option>
            <option value={60}>1m</option>
            <option value={120}>2m</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRunning((p) => !p)}
            className="p-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200"
            title={running ? "Pause" : "Start Timer to Begin"}
          >
            {running ? <Pause className="h-5 w-5 text-gray-700" /> : <Play className="h-5 w-5 text-[#008792]" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setRem(len);
            }}
            className="p-2 rounded-full bg-white hover:bg-gray-50 border border-gray-200"
            title="Reset"
          >
            <RefreshCw className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      <TipsList title="Speaker Tips" items={tips} />
    </div>
  );
}

/* Listener panel */
function ListenerPanel({ blocks }: { blocks: { title: string; items: string[] }[] }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {blocks.map((b, idx) => (
        <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">{b.title}</p>
          <ul className="text-sm text-gray-700 space-y-1">
            {b.items.map((it, i) => (
              <li key={i}>• {it}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* Ownership fields */
function OwnItFields({ value, onChange }: { value: { regret: string; own: string }; onChange: (v: { regret: string; own: string }) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-800 font-medium mb-2">What do you regret doing or saying?</label>
        <textarea
          value={value.regret}
          onChange={(e) => onChange({ ...value, regret: e.target.value })}
          className="w-full p-3 bg-white text-black border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-brand-green"
          rows={3}
          placeholder="I regret..."
        />
      </div>

      <div>
        <label className="block text-gray-800 font-medium mb-2">What can you take ownership of without defending yourself?</label>
        <textarea
          value={value.own}
          onChange={(e) => onChange({ ...value, own: e.target.value })}
          className="w-full p-3 bg-white text-black border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-brand-green"
          rows={3}
          placeholder="I take ownership of..."
        />
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-gray-700 mb-2">Optional template:</p>
        <p className="text-gray-800">“I see how my <b>[action]</b> hurt you. That wasn't my intention. I'm sorry.”</p>
      </div>
    </div>
  );
}

/* Simple Apology fields (BLANK by default) */
function SimpleApologyFields({ value, onChange }: { value: { apology: string; impact: string }; onChange: (v: { apology: string; impact: string }) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-800 font-medium mb-2">What do you want to sincerely apologize for?</label>
        <textarea
          value={value.apology}
          onChange={(e) => onChange({ ...value, apology: e.target.value })}
          className="w-full p-3 bg-white text-black border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-brand-green"
          rows={3}
          placeholder="I’m sorry for…"
        />
      </div>

      <div>
        <label className="block text-gray-800 font-medium mb-2">How do you imagine your partner felt?</label>
        <textarea
          value={value.impact}
          onChange={(e) => onChange({ ...value, impact: e.target.value })}
          className="w-full p-3 bg-white text-black border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-brand-green"
          rows={3}
          placeholder="I imagine you felt…"
        />
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-gray-700 mb-2">Optional template:</p>
        <p className="text-gray-800">“I see how my <b>[action]</b> hurt you. That wasn’t my intention. I’m sorry.”</p>
      </div>
    </div>
  );
}

/* Commitments / Reconnection */
function CommitFields({ value, onChange }: { value: { appreciation: string; gesture: string }; onChange: (v: { appreciation: string; gesture: string }) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-800 font-medium mb-2">Share an appreciation for your partner</label>
        <textarea
          value={value.appreciation}
          onChange={(e) => onChange({ ...value, appreciation: e.target.value })}
          className="w-full p-3 bg-white text-black border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-brand-green"
          rows={3}
          placeholder="I appreciate..."
        />
      </div>

      <div>
        <label className="block text-gray-800 font-medium mb-2">Commit to one small gesture in the next 24 hours</label>
        <textarea
          value={value.gesture}
          onChange={(e) => onChange({ ...value, gesture: e.target.value })}
          className="w-full p-3 bg-white text-black border border-gray-300 rounded-lg placeholder:text-gray-400 focus:ring-2 focus:ring-brand-green"
          rows={3}
          placeholder="I will..."
        />
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="text-gray-700 mb-2">Optional reconnection:</p>
        <p className="text-gray-800">Hold hands or hug for 30 seconds.</p>
      </div>
    </div>
  );
}

/* =========================
   Tips Flyout
========================= */
function TipsFlyout() {
  return (
    <div className="rounded-xl overflow-hidden border border-white/25 shadow-lg">
      <div className="bg-gradient-to-br from-[#01B1AF]/90 to-[#018a88]/90 p-4">
        <div className="bg-white/5 rounded-xl p-4 md:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column – bullets */}
            <div className="bg-white/5 rounded-lg border border-white/15 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-white" />
                <p className="text-white font-semibold">Understanding the Ritual</p>
              </div>
              <ul className="text-white/90 text-sm space-y-2">
                <li>• Start with <b>2 minutes of breathing</b> to downshift together.</li>
                <li>• Prep: choose <b>one event</b> and <b>one core feeling</b>. Use <b>I-language</b>.</li>
                <li>• <b>Speaker</b>: aim to be <b>heard</b>, not right.</li>
                <li>• <b>Listener</b>: Active Listening → Mirroring → Validation → Empathy.</li>
                <li>• Each partner completes <b>Ownership</b> before <b>Apology</b>.</li>
                <li>• Apology: responsibility + remorse; keep it simple and sincere.</li>
                <li>• Reconnect: appreciation + one <b>24-hour commitment</b>.</li>
              </ul>
            </div>

            {/* Right column – helper */}
            <div className="bg-white/5 rounded-lg border border-white/15 p-4">
              <p className="text-white font-semibold mb-2">Apology Helper</p>
              <div className="bg-white/10 rounded-lg p-3 mb-3">
                <ul className="text-white/90 text-sm space-y-1">
                  <li>• Name the action (no deflection)</li>
                  <li>• Acknowledge the feeling you imagine they had</li>
                  <li>• Say “I’m sorry” directly</li>
                </ul>
              </div>

              <p className="text-white font-semibold mb-2">Example</p>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/90 text-sm">
                  “I see how my <b>[action]</b> affected you. I imagine you felt <b>[feeling]</b>. I’m sorry.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
