import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  LogOut,
  Star,
  Check,
  X,
  Zap,
  Award,
  Gem,
  BadgePercent,
  Shield,
} from "lucide-react";

// IMPORTANT: this path is correct relative to this file:
import Button from "../ui/Button";

// If your app provides these hooks via context, import them.
// The code below defensively handles their absence.
import { useUser } from "../../context/UserContext";
// (Removed useSubscription to avoid crashes if provider is missing)

type PeriodKey = "monthly" | "yearly";

const MONTHLY = { plus: 9.99, premium: 14.99 };
const YEARLY = { plus: 83.92, premium: 125.92 };

const BASIC_FEATURES = [
  "AI Therapy Companion",
  "Daily Affirmations",
  "Basic Card Decks (Individual)",
  "Journal",
  "Mood Tracker",
  "Quizzes",
  "Emotion Wheel",
];

const PLUS_UNIQUE_FEATURES = [
  "Guided Meditations",
  "SMART Goals",
  "Values Clarification",
  "Insights & Analytics",
  "Therapy Session Tracking",
  "Life Balance Wheel",
  "Medication Management",
  "Sleep Tracker",
];

const PREMIUM_UNIQUE_FEATURES = [
  "Couples Card Decks",
  "Exercises for Couples",
  "Love Radar",
  "Couples Meditations",
  "Intimacy Builders Challenge",
  "Conflict Repair Rituals",
  "Shared Values (Couples)",
  "Couple's Bucket List",
  "Personalized Recommendations",
];

const FEATURE_COMPARISON = [
  {
    category: "Core Features",
    features: [
      { name: "AI Therapy Companion", basic: true, plus: true, premium: true },
      { name: "Daily Affirmations", basic: true, plus: true, premium: true },
      { name: "Journal", basic: true, plus: true, premium: true },
      { name: "Mood Tracker", basic: true, plus: true, premium: true },
      { name: "Emotion Wheel", basic: true, plus: true, premium: true },
      { name: "Quizzes", basic: true, plus: true, premium: true },
    ],
  },
  {
    category: "Card Decks",
    features: [
      { name: "Individual Reflection Cards", basic: true, plus: true, premium: true },
      { name: "Couples Card Decks", basic: false, plus: false, premium: true },
      { name: "Family Card Decks", basic: false, plus: false, premium: true },
    ],
  },
  {
    category: "Wellness Tools",
    features: [
      { name: "Guided Meditations", basic: false, plus: true, premium: true },
      { name: "SMART Goals", basic: false, plus: true, premium: true },
      { name: "Values Clarification", basic: false, plus: true, premium: true },
      { name: "Therapy Session Tracking", basic: false, plus: true, premium: true },
      { name: "Life Balance Wheel", basic: false, plus: true, premium: true },
      { name: "Love Radar", basic: false, plus: false, premium: true },
      { name: "Medication Management", basic: false, plus: true, premium: true },
      { name: "Sleep Tracker", basic: false, plus: true, premium: true },
      { name: "Intimacy Builders Challenge", basic: false, plus: false, premium: true },
      { name: "Conflict Repair Rituals", basic: false, plus: false, premium: true },
      { name: "Shared Values (Couples)", basic: false, plus: false, premium: true },
      { name: "Couple's Bucket List", basic: false, plus: false, premium: true },
    ],
  },
  {
    category: "Insights",
    features: [
      { name: "Basic Progress Tracking", basic: true, plus: true, premium: true },
      { name: "Advanced Analytics", basic: false, plus: true, premium: true },
      { name: "Personalized Recommendations", basic: false, plus: false, premium: true },
    ],
  },
  {
    category: "Support",
    features: [{ name: "Email Support", basic: true, plus: true, premium: true }],
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<PeriodKey>("yearly");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeatureComparison, setShowFeatureComparison] = useState(true);

  // If the provider is missing, useUser() should still return something (your impl may).
  // We hard-guard every access just in case.
  let authState: any = { status: "unauthenticated", user: undefined };
  let signOut = async () => {};
  try {
    const u = useUser();
    authState = u?.authState ?? authState;
    signOut = u?.signOut ?? signOut;
  } catch {
    // No provider — stay in unauthenticated safe mode.
  }

  // Safe default to avoid crashes if a plan isn’t available
  const currentPlan: "basic" | "plus" | "premium" =
    (authState?.plan as any) || "basic";

  const navigate = useNavigate();

  const priceFor = (plan: "plus" | "premium") =>
    billingPeriod === "monthly" ? MONTHLY[plan] : YEARLY[plan];

  const suffix = useMemo(
    () => (billingPeriod === "monthly" ? "/month" : "/year"),
    [billingPeriod]
  );

  const crossedOutAnnual = (plan: "plus" | "premium") =>
    `$${(MONTHLY[plan] * 12).toFixed(2)}/yr`;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleSubscribe = async (plan: "plus" | "premium") => {
    try {
      setIsLoading(true);
      setError(null);

      const isPlusToPremiumUpgrade = currentPlan === "plus" && plan === "premium";

      // Guard envs; if missing, fall back to a no-op that navigates to login
      const edgeUrl = import.meta.env.VITE_SUPABASE_URL;
      const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!edgeUrl || !anon) {
        // Don’t crash the page in prod builds if envs are missing.
        navigate("/login");
        return;
      }

      const response = await fetch(`${edgeUrl}/functions/v1/create-checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${anon}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: authState?.user?.id,
          email: authState?.user?.email,
          plan,
          quantity: 1,
          isUpgrade: isPlusToPremiumUpgrade,
          billingPeriod,
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");
      const { url } = await response.json();
      if (url) window.location.href = url;
      else throw new Error("No checkout URL received");
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Failed to start checkout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#021E3C] to-[#03274B]">
      {/* bg blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-[#01B1AF]/5 blur-3xl" />
        <div className="absolute top-[30%] right-[10%] w-80 h-80 rounded-full bg-[#7b5595]/5 blur-3xl" />
        <div className="absolute bottom-[20%] left-[20%] w-72 h-72 rounded-full bg-[#0068aa]/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-2 border-[#01B1AF]/30 text-[#01B1AF] hover:bg-[#01B1AF]/10 transition-all"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="flex items-center space-x-2 border-white/20 text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>

        {/* welcome strip */}
        {authState?.status === "authenticated" && (
          <div className="mb-16 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-[#01B1AF]/10 to-[#01B1AF]/5 backdrop-blur-sm p-8 rounded-2xl border border-[#01B1AF]/20 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-[#01B1AF]/20 p-3 rounded-full mr-3">
                  <Zap className="h-6 w-6 text-[#01B1AF]" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Your Current Plan:{" "}
                  {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                </h2>
              </div>
              <p className="text-gray-300 mb-6 text-lg">
                {currentPlan === "basic"
                  ? "Upgrade to unlock more features and enhance your experience."
                  : currentPlan === "plus"
                  ? "You have access to Plus features. Upgrade to Premium for couples features."
                  : "You have access to all Premium features."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="bg-[#01B1AF] hover:bg-[#01B1AF]/90 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border border-brand-green/30 hover:border-brand-green/50"
                  onClick={() => navigate("/dashboard")}
                >
                  Continue Using Siena
                </Button>
                {currentPlan !== "premium" && (
                  <Button
                    variant="outline"
                    className="border-[#01B1AF]/30 text-[#01B1AF] hover:bg-[#01B1AF]/10 px-8 py-3 rounded-xl text-lg font-semibold transition-all"
                    onClick={() =>
                      document
                        .getElementById("pricing-plans")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    View Upgrade Options
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            {authState?.status === "authenticated"
              ? "Upgrade Your Experience"
              : "Choose Your Wellness Journey"}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {authState?.status === "authenticated"
              ? "Unlock additional features to enhance your mental wellness journey"
              : "Select the plan that best fits your needs and unlock powerful tools for your mental wellness journey"}
          </p>
        </div>

        {/* billing toggle */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="inline-flex rounded-full bg-white/10 p-1 backdrop-blur-sm">
            <button
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                backgroundColor:
                  billingPeriod === "monthly" ? "#FFA600" : "#7b5595",
                color: billingPeriod === "monthly" ? "#021E3C" : "#ffffff",
                boxShadow:
                  billingPeriod === "monthly"
                    ? "0 0 0 2px rgba(0,0,0,0.1)"
                    : "none",
              }}
              onClick={() => setBillingPeriod("monthly")}
              aria-pressed={billingPeriod === "monthly"}
            >
              Monthly
            </button>

            <button
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1"
              style={{
                backgroundColor:
                  billingPeriod === "yearly" ? "#B1E006" : "transparent",
                color: billingPeriod === "yearly" ? "#021E3C" : "#ffffff",
                boxShadow:
                  billingPeriod === "yearly"
                    ? "0 0 0 2px rgba(0,0,0,0.1)"
                    : "none",
              }}
              onClick={() => setBillingPeriod("yearly")}
              aria-pressed={billingPeriod === "yearly"}
            >
              Yearly <BadgePercent className="w-4 h-4" />
              <span
                className="font-bold"
                style={{
                  color: billingPeriod === "yearly" ? "#021E3C" : "#ffffff",
                }}
              >
                Save 30%
              </span>
            </button>
          </div>
        </div>

        {/* headers */}
        <div
          id="pricing-plans"
          className="hidden md:grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-4 items-stretch"
        >
          {["Basic", "Plus", "Premium"].map((plan, i) => (
            <div
              key={i}
              className={`text-center py-3 rounded-t-2xl font-bold text-lg ${
                plan === "Basic"
                  ? "bg-gray-800 text-white"
                  : plan === "Plus"
                  ? "bg-[#01B1AF] text-white"
                  : "bg-[#FFA600] text-black"
              }`}
            >
              {plan}
            </div>
          ))}
        </div>

        {/* cards (equal height) */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {/* Basic */}
          <div className="group relative rounded-2xl overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:shadow-[#01B1AF]/30">
            <div className="md:hidden text-center py-3 font-bold text-lg bg-gray-800 text-white rounded-t-2xl">
              Basic
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#01B1AF] to-[#018A88] opacity-95" />
            <div className="relative p-8 flex flex-col h-full">
              <div className="min-h-[160px]">
                <div className="flex items-center mb-2">
                  <div className="bg-white/30 p-3 rounded-full mr-4 shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-baseline mb-2">
                  <span className="text-6xl font-bold text-white">Free</span>
                </div>
                <p className="text-white/90 text-lg font-medium">
                  Essential tools for your wellness journey. Start free and explore core features.
                </p>
              </div>

              <Button
                className="mt-6 w-full py-4 rounded-xl text-lg font-semibold bg-white text-[#01B1AF] hover:shadow-xl hover:bg-gray-50 border-2 border-transparent"
                onClick={() =>
                  navigate(
                    authState?.status === "unauthenticated"
                      ? "/register"
                      : "/dashboard"
                  )
                }
              >
                {authState?.status === "authenticated"
                  ? "Go to Dashboard"
                  : "Start Free"}
              </Button>

              <div className="flex-grow mt-8">
                <ul className="space-y-4">
                  {BASIC_FEATURES.map((f, idx) => (
                    <li key={idx} className="flex items-center text-lg">
                      <div className="bg-white/30 p-2 rounded-full mr-4 flex-shrink-0 shadow-sm">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-white font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Plus */}
          <div className="group relative rounded-2xl overflow-visible h-full transition-transform duration-300 hover:scale-[1.02] shadow-2xl">
            <div className="absolute -top-5 right-3 z-30 pointer-events-none">
              <div className="bg-[#01B1AF] text-white px-4 py-1 text-xs font-bold rounded-full shadow-lg">
                MOST POPULAR
              </div>
            </div>

            <div className="md:hidden text-center py-3 font-bold text-lg bg-[#01B1AF] text-white rounded-t-2xl">
              Plus
            </div>

            <div className="absolute inset-0 p-[3px] rounded-2xl bg-gradient-to-br from-[#01B1AF] via-[#01B1AF]/80 to-[#01B1AF]/60 z-0" />
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl z-0" />

            <div className="relative p-8 flex flex-col h-full z-10">
              <div className="min-h-[160px]">
                <div className="flex items-center mb-2">
                  <div className="bg-[#01B1AF]/20 p-3 rounded-full mr-4 shadow-lg">
                    <Award className="h-6 w-6 text-[#01B1AF]" />
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-6xl font-bold text-gray-900">
                      ${priceFor("plus").toFixed(2)}
                    </span>
                    <span className="text-gray-600 ml-2 text-xl font-medium">{billingPeriod === "monthly" ? "/month" : "/year"}</span>
                  </div>
                </div>
                {billingPeriod === "yearly" ? (
                  <div className="mb-2">
                    <span className="text-sm text-gray-500 line-through">
                      {crossedOutAnnual("plus")}
                    </span>
                    <span
                      className="ml-2 inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#B1E006", color: "#021E3C" }}
                    >
                      Save 30%
                    </span>
                  </div>
                ) : (
                  <div className="h-6" />
                )}
                <p className="text-gray-700 text-lg font-medium">
                  Enhanced tools for deeper self-discovery
                </p>
              </div>

              <Button
                className="mt-6 w-full py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-[#01B1AF] to-[#018A88] text-white hover:shadow-xl hover:from-[#018A88] hover:to-[#01B1AF] transition-all duration-300 shadow-lg border-2 border-transparent"
                disabled={isLoading}
                onClick={() => handleSubscribe("plus")}
              >
                {isLoading ? "Processing..." : "Subscribe to Plus"}
              </Button>

              <div className="flex-grow mt-8">
                <ul className="space-y-4">
                  <li className="flex items-center text-lg">
                    <div className="bg-gray-200 p-2 rounded-full mr-4 flex-shrink-0 shadow-sm">
                      <Check className="h-5 w-5 text-gray-500" />
                    </div>
                    <span className="font-medium text-gray-600 italic">Everything in Basic</span>
                  </li>
                  {PLUS_UNIQUE_FEATURES.map((f, idx) => (
                    <li key={idx} className="flex items-center text-lg">
                      <div className="bg-[#01B1AF]/20 p-2 rounded-full mr-4 flex-shrink-0 shadow-sm">
                        <Check className="h-5 w-5 text-[#01B1AF]" />
                      </div>
                      <span className="font-medium text-gray-900">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Premium */}
          <div className="group relative rounded-2xl overflow-visible h-full transition-transform duration-300 hover:scale-[1.02]">
            <div className="absolute -top-5 right-3 z-30 pointer-events-none">
              <div className="bg-[#FFA600] text-black px-4 py-1 text-xs font-bold rounded-full shadow-lg">
                DESIGNED FOR COUPLES
              </div>
            </div>

            <div className="md:hidden text-center py-3 font-bold text-lg bg-[#FFA600] text-black rounded-t-2xl">
              Premium
            </div>

            <div className="absolute inset-0 p-[2px] rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 z-0" />
            <div className="absolute inset-[2px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl z-0" />

            <div className="relative p-8 flex flex-col h-full z-10">
              <div className="min-h-[160px]">
                <div className="flex items-center mb-2">
                  <div className="bg-yellow-500/20 p-3 rounded-full mr-4 shadow-lg">
                    <Gem className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-6xl font-bold text-white">
                      ${priceFor("premium").toFixed(2)}
                    </span>
                    <span className="text-gray-300 ml-2 text-xl font-medium">{billingPeriod === "monthly" ? "/month" : "/year"}</span>
                  </div>
                </div>
                {billingPeriod === "yearly" ? (
                  <div className="mb-2">
                    <span className="text-sm text-gray-400 line-through">
                      {crossedOutAnnual("premium")}
                    </span>
                    <span
                      className="ml-2 inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#B1E006", color: "#021E3C" }}
                    >
                      Save 30%
                    </span>
                  </div>
                ) : (
                  <div className="h-6" />
                )}
                <p className="text-gray-200 text-lg font-medium">
                  Access a complete toolkit for couples wellness and deepen your connection.
                </p>
              </div>

              <Button
                className="mt-6 w-full py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:shadow-xl hover:from-yellow-500 hover:to-yellow-400 border-transparent"
                disabled={isLoading}
                onClick={() => handleSubscribe("premium")}
              >
                {isLoading
                  ? "Processing..."
                  : currentPlan === "plus"
                  ? "Upgrade to Premium"
                  : "Subscribe to Premium"}
              </Button>

              <div className="flex-grow mt-8">
                <ul className="space-y-4">
                  <li className="flex items-center text-lg">
                    <div className="bg-gray-700 p-2 rounded-full mr-4 flex-shrink-0 shadow-sm">
                      <Check className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="font-medium text-gray-400 italic">Everything in Plus</span>
                  </li>
                  {PREMIUM_UNIQUE_FEATURES.map((f, idx) => (
                    <li key={idx} className="flex items-center text-lg">
                      <div className="bg-yellow-500/20 p-2 rounded-full mr-4 flex-shrink-0 shadow-sm">
                        <Check className="h-5 w-5 text-yellow-400" />
                      </div>
                      <span className="font-medium text-yellow-100">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-xl bg-red-500/10 p-6 max-w-md mx-auto border border-red-500/20 shadow-lg">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* comparison toggle */}
        <div className="mt-16 text-center">
          <button
            onClick={() => setShowFeatureComparison(!showFeatureComparison)}
            className="text-brand-green hover:text-brand-green/80 inline-flex items-center bg-white/5 px-6 py-3 rounded-full transition-all hover:bg-white/10"
          >
            {showFeatureComparison ? "Hide" : "Show"} detailed feature comparison
            <ArrowRight
              className={`ml-2 h-4 w-4 transition-transform ${
                showFeatureComparison ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* comparison (restored) */}
        {showFeatureComparison && (
          <div className="mt-12 bg-[#0A1A36] rounded-2xl overflow-hidden border border-white/10 p-4 md:p-8 shadow-xl max-w-6xl mx-auto">
            <h3 className="text-2xl font-semibold text-white mb-8 text-center">
              Feature Comparison
            </h3>

            {/* mobile */}
            <div className="block md:hidden">
              {FEATURE_COMPARISON.map((category, ci) => (
                <div key={`cat-m-${ci}`} className="mb-8">
                  <h4 className="bg-[#01B1AF]/5 py-2 px-4 text-white font-semibold text-base mb-4 rounded">
                    {category.category}
                  </h4>
                  {category.features.map((f, fi) => (
                    <div key={`f-m-${ci}-${fi}`} className="border-b border-white/5 py-4 px-2">
                      <p className="text-gray-300 font-medium mb-3">{f.name}</p>
                      <div className="flex justify-between">
                        <PlanDot label="Basic" active={f.basic} color="green" />
                        <PlanDot label="Plus" active={f.plus} color="teal" />
                        <PlanDot label="Premium" active={f.premium} color="yellow" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-[#03274B]/50">
                    <th className="text-left py-5 px-6 text-white text-lg font-medium">Feature</th>
                    <th className="text-center py-5 px-6 text-white text-lg font-medium">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 text-sm">Basic</span>
                        <span className="text-xl">Free</span>
                      </div>
                    </th>
                    <th className="text-center py-5 px-6 text-white text-lg font-medium">
                      <div className="flex flex-col items-center">
                        <span className="text-[#01B1AF] text-sm">Plus</span>
                        <span className="text-xl">$9.99/mo</span>
                      </div>
                    </th>
                    <th className="text-center py-5 px-6 text-white text-lg font-medium">
                      <div className="flex flex-col items-center">
                        <span className="text-yellow-400 text-sm">Premium</span>
                        <span className="text-xl">$14.99/mo</span>
                      </div>
                    </th>
                  </tr>
                </thead>

                {FEATURE_COMPARISON.map((category, ci) => (
                  <tbody key={`cat-${ci}`}>
                    <tr className="bg-[#01B1AF]/5">
                      <td colSpan={4} className="py-4 px-6 text-white font-semibold text-base">
                        {category.category}
                      </td>
                    </tr>

                    {category.features.map((f, fi) => (
                      <tr key={`f-${ci}-${fi}`} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6 text-gray-300">{f.name}</td>
                        <td className="py-4 px-6 text-center"><Dot active={f.basic} color="green" /></td>
                        <td className="py-4 px-6 text-center"><Dot active={f.plus} color="teal" /></td>
                        <td className="py-4 px-6 text-center"><Dot active={f.premium} color="yellow" /></td>
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
          </div>
        )}

        {/* footer */}
        <div className="mt-16 text-center border-t border-white/10 pt-12">
          <p className="text-gray-400 mb-2">
            Have questions about our plans?{" "}
            <a
              href="mailto:support@siena.com"
              className="text-brand-green hover:underline transition-colors"
            >
              Contact our support team
            </a>
          </p>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Siena. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

/* helpers */

function Dot({ active, color }: { active: boolean; color: "green" | "teal" | "yellow" }) {
  const classes =
    color === "green"
      ? "text-green-500 bg-green-500/10"
      : color === "teal"
      ? "text-[#01B1AF] bg-[#01B1AF]/10"
      : "text-yellow-500 bg-yellow-500/10";
  return (
    <div className={`p-2 rounded-full mx-auto w-10 h-10 flex items-center justify-center ${classes}`}>
      {active ? <Check className="h-5 w-5" /> : <X className="h-5 w-5 text-gray-500" />}
    </div>
  );
}

function PlanDot({
  label,
  active,
  color,
}: {
  label: string;
  active: boolean;
  color: "green" | "teal" | "yellow";
}) {
  const colorClass =
    color === "green"
      ? "text-green-500 bg-green-500/10"
      : color === "teal"
      ? "text-[#01B1AF] bg-[#01B1AF]/10"
      : "text-yellow-500 bg-yellow-500/10";
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-400 mb-1">{label}</span>
      <div className={`p-1.5 rounded-full w-8 h-8 flex items-center justify-center ${colorClass}`}>
        {active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 text-gray-500" />}
      </div>
    </div>
  );
}
