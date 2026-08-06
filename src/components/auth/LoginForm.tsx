// src/components/auth/LoginForm.tsx
// ---------------------------------------------------------------------------
// Full, aligned, and accessible Login + Marketing + Pricing page
// With seamless “create account → auto-checkout” flow for paid plans.
// Hardened against non-string inputs (fixes `.trim is not a function`).
// ---------------------------------------------------------------------------

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BadgePercent,
  BarChart,
  BookOpen,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  Headphones,
  Heart,
  Info,
  Lock,
  Mail,
  Menu,
  MessageCircle,
  MessageSquare,
  Phone,
  Shield,
  Sparkles,
  Target,
} from 'lucide-react';
import Button from '../ui/Button';
import { generateUniqueHandle } from '../../lib/handle';

// ---------------------------------------------------------------------------
// Inert web-app shims
// ---------------------------------------------------------------------------
//
// This component is the homepage, and it is the only routed thing that used to
// reach the backend. Importing lib/supabase (directly, or transitively via
// UserContext and affiliateService) pulled the whole supabase-js library into
// the static site's bundle and constructed a client at page load. The site is
// meant to make no network requests at all: accounts and user content live in
// the Siena mobile app, on a different Supabase project.
//
// The sign-in, sign-up and checkout handlers below are unreachable in any
// useful sense now that no auth provider is mounted. These shims keep their
// code shape intact so the page renders identically, while guaranteeing
// nothing can reach the network. The homepage is due to be replaced by a real
// landing page; delete these along with it.

const WEB_APP_DISABLED =
  'The Siena web app is not available. Please use the Siena mobile app.';

const supabase: any = {
  auth: {
    getUser: async () => {
      throw new Error(WEB_APP_DISABLED);
    },
  },
  from: () => {
    throw new Error(WEB_APP_DISABLED);
  },
};

const useUser = () => ({
  signIn: async (_email: string, _password: string): Promise<void> => {
    throw new Error(WEB_APP_DISABLED);
  },
  signUp: async (_email: string, _password: string, _opts?: unknown): Promise<{ user: any }> => {
    throw new Error(WEB_APP_DISABLED);
  },
});

const EDGE_BASE = '';
const getAffiliateByCode = async (_code: string): Promise<any> => null;
const trackReferralSignup = async (_args: unknown): Promise<void> => {};


// ---------------------------------------------------------------------------
// Types and pricing constants
// ---------------------------------------------------------------------------

type PlanKey = 'plus' | 'premium';
type PeriodKey = 'monthly' | 'yearly';

const MONTHLY_PRICES: Record<PlanKey, number> = { plus: 9.99, premium: 14.99 };
const YEARLY_PRICES: Record<PlanKey, number> = { plus: 83.92, premium: 125.92 };

// ---------------------------------------------------------------------------
// Visual constants
// ---------------------------------------------------------------------------

/** gradient border accents used in the features grid */
const GRADIENT_BORDERS = [
  'from-[#e88584] to-[#8e4f63]',
  'from-[#0068aa] to-[#004d7f]',
  'from-[#FFA600] to-[#B36B00]',
  'from-[#B1E006] to-[#6C8300]',
  'from-[#F27C7C] to-[#E03B3B]',
  'from-[#080B42] to-[#6A51A6]',
  'from-[#00789f] to-[#005a77]',
  'from-[#ea697c] to-[#b8455c]',
  'from-[#008792] to-[#006a70]',
  'from-[#7b5595] to-[#5d4070]',
  'from-[#0068aa] to-[#004d7f]',
] as const;

const __emojiPool = [
  '🌿','🌊','✨','🌙','☀️','🦋','🌸','🍃','🪷','🌼','🍀','🌻','🌟','🔥','🌈','🫶','💫','🧘','🪴','🌤️'
];
const randomEmoji = () => __emojiPool[Math.floor(Math.random() * __emojiPool.length)];

// ---------------------------------------------------------------------------
// Marketing features shown above pricing
// ---------------------------------------------------------------------------

const marketingFeatures = [
  { icon: <Brain className="h-5 w-5 text-brand-green" />, title: 'AI Therapist', description: '24/7 support from Siena, your personal AI therapy companion' },
  { icon: <MessageSquare className="h-5 w-5 text-brand-green" />, title: 'Conversational Cards', description: 'Guided reflection exercises for personal growth' },
  { icon: <Shield className="h-5 w-5 text-brand-green" />, title: 'Quizzes and Assessments', description: 'Get to know yourself' },
  { icon: <Brain className="h-5 w-5 text-brand-green" />, title: 'Emotion Wheel', description: 'Interactive emotion exploration and understanding' },
  { icon: <Headphones className="h-5 w-5 text-brand-green" />, title: 'Guided Meditations', description: 'Calming audio sessions for mindfulness and relaxation' },
  { icon: <BookOpen className="h-5 w-5 text-brand-green" />, title: 'Wellness Exercises', description: 'Evidence-based activities for mental wellness' },
  { icon: <Target className="h-5 w-5 text-brand-green" />, title: 'Goal Setting', description: 'Track progress with SMART goals and reminders' },
  { icon: <Target className="h-5 w-5 text-brand-green" />, title: 'Values Clarification', description: 'Discover and organize your core values' },
  { icon: <BarChart className="h-5 w-5 text-brand-green" />, title: 'Insights & Analytics', description: 'Visualize your emotional patterns and progress' },
  { icon: <MessageSquare className="h-5 w-5 text-brand-green" />, title: 'Live Check-In', description: 'Real-time emotional awareness for couples' },
  { icon: <Shield className="h-5 w-5 text-brand-green" />, title: 'Boundary Builder', description: 'Set and practice healthy boundaries with guided prompts' },
  { icon: <CheckSquare className="h-5 w-5 text-brand-green" />, title: 'Habits', description: 'Build positive routines with a habit tracker and streaks' },
  { icon: <Heart className="h-5 w-5 text-brand-green" />, title: 'Intimacy Builder', description: 'Strengthen connection with 30-day intimacy challenges' },
  { icon: <Calendar className="h-5 w-5 text-brand-green" />, title: 'Track Your Sessions', description: 'Track, reflect, and gain insights into your wellness' },
  { icon: <MessageCircle className="h-5 w-5 text-brand-green" />, title: 'SMS Text Reminders', description: 'Receive important text reminders to help you stay on track' },
  { icon: <BarChart className="h-5 w-5 text-brand-green" />, title: 'Couple Activity Tracker', description: 'Track and analyze relationship activities over time' },
];

// ---------------------------------------------------------------------------
// Pricing card config used in both the Login page and Pricing area
// ---------------------------------------------------------------------------

type LoginPlanCard = {
  name: 'Basic' | 'Plus' | 'Premium';
  price: string;
  period: string;
  description: string;
  features: string[];
  headerClass: string;
  buttonText: string;
  buttonClass: string;
  popular?: boolean;     // green “MOST POPULAR” ribbon
  couplesTag?: boolean;  // yellow “DESIGNED FOR COUPLES” ribbon
};

const LOGIN_PRICING_PLANS: LoginPlanCard[] = [
  {
    name: 'Basic',
    price: 'Free',
    period: '',
    description: 'Essential tools for your wellness journey',
    features: [
      'AI Therapy Companion',
      'Affirmations',
      'Emotion Wheel',
      'Basic Card Decks (Individual)',
      'Journal',
      'Mood Tracker',
      'Basic Quizzes',
    ],
    headerClass: 'bg-gray-800 text-white',
    buttonText: 'Start Free',
    buttonClass: 'bg-gray-900 text-white hover:bg-gray-800',
  },
  {
    name: 'Plus',
    price: '$9.99',
    period: '/month',
    description: 'Enhanced tools for deeper self-discovery',
    features: [
      'Everything in Basic',
      'Guided Meditations',
      'Boundary Builder',
      'SMART Goals Tracker',
      'Habits Tracker',
      'Bucket List Tracker',
      'Sleep Tracker',
      'Dating Tracker',
      'Wellness Session Tracker',
      'Values Clarification',
      'Life Balance Metrics',
      'Wellness Aids Management',
      'Insights & Analytics',
    ],
    headerClass: 'bg-[#01B1AF] text-white',
    buttonText: 'Start Now',
    buttonClass: 'bg-[#01B1AF] hover:bg-[#018A88] text-white',
    popular: true,
  },
  {
    name: 'Premium',
    price: '$14.99',
    period: '/month',
    description: 'Access a complete toolkit for couples wellness',
    features: [
      'Everything in Plus',
      'Activity Tracker',
      'Couples Card Decks',
      'Exercises for Couples',
      'Love Radar',
      'Internal World',
      'Couples Meditations',
      'Intimacy Builders Challenge',
      'Conflict Repair Rituals',
      'Personalized Recommendations',
      'Live Check-In',
    ],
    headerClass: 'bg-[#FFA600] text-black',
    buttonText: 'Start Now',
    buttonClass: 'bg-[#FFA600] hover:bg-[#FFC642] text-black',
    couplesTag: true,
  },
];

// ---------------------------------------------------------------------------
// Helpers (inputs/checkbox/row) + SAFE TRIM
// ---------------------------------------------------------------------------

const safeTrim = (v: unknown): string =>
  (typeof v === 'string' ? v : String(v ?? '')).trim();

type TextInputProps = {
  id: string;
  type?: string;
  label: string;
  value: any; // allow non-string sources safely
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  Icon?: React.ComponentType<any>;
  isDark?: boolean;
  required?: boolean;
  minLength?: number;
};

function TextInput({
  id,
  type = 'text',
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  Icon,
  isDark = false,
  required,
  minLength,
}: TextInputProps) {
  const base =
    'w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2';
  const light =
    'bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-[#01B1AF]';
  const dark =
    'bg-white/5 border border-white/20 text-white placeholder-white/50 focus:ring-[#01B1AF]';

  return (
    <div>
      <label htmlFor={id} className={`block text-sm mb-1 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={typeof value === 'string' ? value : String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-label={label}
          required={required}
          minLength={minLength}
          className={`${base} ${isDark ? dark : light}`}
        />
        {Icon && <Icon className={`absolute right-3 top-3.5 h-5 w-5 ${isDark ? 'text-white/50' : 'text-gray-400'}`} />}
      </div>
    </div>
  );
}

type CheckboxProps = {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  isDark?: boolean;
  className?: string;
};

function CheckboxRow({ id, checked, onChange, label, isDark = false, className = '' }: CheckboxProps) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`h-4 w-4 ${isDark ? 'mt-1 rounded border-white/30 bg-white/10 text-[#01B1AF] focus:ring-[#01B1AF]' : 'rounded border-gray-300 text-[#01B1AF] focus:ring-[#01B1AF]'}`}
        aria-checked={checked}
      />
      <label htmlFor={id} className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
        {label}
      </label>
    </div>
  );
}

function Divider({ className = '' }: { className?: string }) {
  return <div className={`h-px w-full bg-black/[0.06] ${className}`} role="separator" />;
}

function FeatureItem({
  text,
  accent = 'brand',
  dim = false,
  large = false,
}: {
  text: string;
  accent?: 'brand' | 'white' | 'yellow' | 'gray';
  dim?: boolean;
  large?: boolean;
}) {
  const chip =
    accent === 'brand'
      ? 'bg-brand-green/10 text-brand-green'
      : accent === 'white'
      ? 'bg-white/30 text-white'
      : accent === 'yellow'
      ? 'bg-yellow-500/20 text-yellow-400'
      : 'bg-gray-200 text-gray-500';
  return (
    <li className={`flex items-center ${large ? 'text-lg' : 'text-sm'}`}>
      <div className={`p-1.5 rounded-full mr-3 flex-shrink-0 ${chip}`}>
        <Check className={`h-4 w-4 ${accent === 'white' ? 'text-white' : ''}`} />
      </div>
      <span className={`${dim ? 'italic text-gray-600' : 'text-gray-800'} ${accent === 'white' ? '!text-white' : ''}`}>
        {text}
      </span>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Profile helper on first login
// ---------------------------------------------------------------------------

async function ensurePublicProfileWithHandle() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_emoji')
    .eq('id', user.id)
    .maybeSingle();

  if (existing?.display_name) return;

  const handle = await generateUniqueHandle(supabase);
  const emojiChoice = existing?.avatar_emoji ?? randomEmoji();

  if (!existing) {
    await supabase.from('profiles').insert({
      id: user.id,
      display_name: handle,
      avatar_emoji: emojiChoice,
    });
  } else {
    await supabase
      .from('profiles')
      .update({ display_name: handle, avatar_emoji: emojiChoice })
      .eq('id', user.id);
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<PeriodKey>('yearly');

  // -------- Sign In state --------
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // -------- Sign Up state --------
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpPhone, setSignUpPhone] = useState<string>('');
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') ?? undefined;

  const { signIn, signUp } = useUser();

  // focus management
  const signUpErrorRef = useRef<HTMLDivElement | null>(null);
  const signInErrorRef = useRef<HTMLDivElement | null>(null);

  // Persist incoming affiliate code immediately so we can recover it after login
  useEffect(() => {
    if (referralCode) sessionStorage.setItem('pending_referral_code', String(referralCode));
  }, [referralCode]);

  // Resume-checkout-after-sign-in effect removed.
  //
  // It called supabase.auth.getUser() on mount, which was the last network
  // request the homepage made. The web app is no longer routed and there is no
  // web signup or checkout, so there is no pending plan intent to resume.
  // Restore this only if web auth returns.

  // Pricing helpers
  const displayPrice = (plan: PlanKey) =>
    `$${(billingPeriod === 'monthly' ? MONTHLY_PRICES[plan] : YEARLY_PRICES[plan]).toFixed(2)}`;
  const periodSuffix = billingPeriod === 'monthly' ? '/month' : '/year';
  const crossedOutYear = (plan: PlanKey) => `$${(MONTHLY_PRICES[plan] * 12).toFixed(2)}/yr`;

  // ---------- AUTH FLOWS ----------
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSignInError(null);
    setSignInLoading(true);
    try {
      await signIn(safeTrim(signInEmail), safeTrim(signInPassword));
      await ensurePublicProfileWithHandle();

      // If there was intent to buy, begin checkout now.
      const wantedPlan = sessionStorage.getItem('pending_plan') as PlanKey | null;
      const wantedPeriod = sessionStorage.getItem('pending_billing_period') as PeriodKey | null;
      if (wantedPlan && wantedPeriod) {
        sessionStorage.removeItem('pending_plan');
        if (wantedPeriod !== billingPeriod) setBillingPeriod(wantedPeriod);
        await beginCheckout(wantedPlan);
        return;
      }

      navigate('/dashboard');
    } catch (err: any) {
      const msg =
        err?.message?.includes('Invalid login credentials')
          ? 'Invalid email or password. Please check and try again.'
          : err?.message ?? 'Unable to sign in.';
      setSignInError(msg);
      setTimeout(() => signInErrorRef.current?.focus(), 0);
    } finally {
      setSignInLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setSignUpError(null);
    if (!acceptTerms) {
      setSignUpError('Please accept the Terms of Service to continue.');
      setTimeout(() => signUpErrorRef.current?.focus(), 0);
      return;
    }
    setSignUpLoading(true);
    try {
      await signUp(safeTrim(signUpEmail), safeTrim(signUpPassword), {
        phone: safeTrim(signUpPhone) || undefined,
        sms_opt_in: Boolean(smsOptIn),
      });

      await ensurePublicProfileWithHandle();

      // Affiliate attribution
      const code = sessionStorage.getItem('pending_referral_code') ?? referralCode ?? undefined;
      if (code) {
        try {
          const affiliate = await getAffiliateByCode(String(code));
          if (affiliate?.id) {
            await trackReferralSignup({
              referral_code: String(code),
              affiliate_id: affiliate.id,
              email: safeTrim(signUpEmail),
            });
          }
        } catch {
          /* ignore affiliate errors */
        }
      }

      // Auto-continue to checkout if there was intent
      const wantedPlan = sessionStorage.getItem('pending_plan') as PlanKey | null;
      const wantedPeriod = sessionStorage.getItem('pending_billing_period') as PeriodKey | null;

      if (wantedPlan && wantedPeriod) {
        if (wantedPeriod !== billingPeriod) setBillingPeriod(wantedPeriod);
        sessionStorage.removeItem('pending_plan');
        await beginCheckout(wantedPlan);
        return;
      }

      navigate('/dashboard');
    } catch (err: any) {
      setSignUpError(err?.message ?? 'Unable to create your account.');
      setTimeout(() => signUpErrorRef.current?.focus(), 0);
    } finally {
      setSignUpLoading(false);
    }
  }

  // ---------- CHECKOUT ----------
  async function beginCheckout(plan: PlanKey) {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Use saved referral if present
      const code = sessionStorage.getItem('pending_referral_code') ?? referralCode ?? undefined;

      // If not logged in, store intent and guide to sign-up
      if (!user) {
        sessionStorage.setItem('pending_plan', plan);
        sessionStorage.setItem('pending_billing_period', billingPeriod);
        if (code) sessionStorage.setItem('pending_referral_code', String(code));
        if (signUpEmail) sessionStorage.setItem('pending_email', safeTrim(signUpEmail));

        document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' });
        alert('Create your free account first. We’ll take you to checkout right after.');
        return;
      }

      // Authenticated → create checkout
      //
      // EDGE_BASE replaces import.meta.env.VITE_SUPABASE_URL here. Vite inlines
      // that variable at build time, which left the old Supabase project's URL
      // embedded in the static site's bundle even though this path is dead: the
      // supabase shim above throws before execution reaches it. There is no web
      // checkout; subscriptions are purchased in the mobile app.
      const resp = await fetch(
        `${EDGE_BASE}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan,
            billingPeriod,
            email: user.email,
            userId: user.id,
            referralCode: code ? String(code) : undefined,
          }),
        }
      );
      if (!resp.ok) throw new Error('Failed to create checkout session');
      const { url } = await resp.json();
      if (!url) throw new Error('No checkout URL returned');
      window.location.href = url;
    } catch (e) {
      console.error('checkout error', e);
      alert('Unable to start checkout right now. Please try again.');
    }
  }

  // compute plan cards with correct prices for toggle
  const planCards = useMemo(() => {
    return LOGIN_PRICING_PLANS.map((p) => {
      if (p.name === 'Plus') {
        return {
          ...p,
          price: displayPrice('plus'),
          period: periodSuffix,
        };
      }
      if (p.name === 'Premium') {
        return {
          ...p,
          price: displayPrice('premium'),
          period: periodSuffix,
        };
      }
      return p;
    });
  }, [billingPeriod]);

  const gradientFor = (idx: number) => GRADIENT_BORDERS[idx % GRADIENT_BORDERS.length];

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 bg-[#021E3C] z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-white text-lg sm:text-xl font-bold tracking-wide">
              Heal • Evolve • Connect
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</a>
            <Link to="/login" className="text-white/80 hover:text-white transition-colors">Log-In</Link>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4 px-2">
            <a href="#features" className="block text-white text-base hover:text-[#01B1AF]">Features</a>
            <a href="#pricing" className="block text-white text-base hover:text-[#01B1AF]">Pricing</a>
            <Link to="/login" className="block text-white text-base hover:text-[#01B1AF]">Log-In</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <div className="relative pt-20 md:pt-32 pb-12 md:pb-20 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-6 md:mb-8">
            <img
              src="https://static.wixstatic.com/media/4e16d8_2bc53abfd032465b84ad153b2ebcff3a~mv2.png"
              alt="Siena Logo"
              className="mx-auto h-48 md:h-64 w-auto mb-8 md:mb-16 object-contain max-w-full"
            />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-black leading-tight">
            Your Path to <span className="text-brand-green">Wellness</span> <br className="hidden md:block" />
            Begins Here
          </h1>

          <p className="text-lg md:text-xl text-gray-900 max-w-3xl mx-auto mb-8 md:mb-12 px-4">
            You don't have to do this alone. Siena brings you structured guidance, mindfulness, and therapeutic tools—all in one place.
          </p>

          <div className="flex justify-center mb-8 md:mb-16">
            <Button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-brand-green text-white px-6 md:px-8 py-4 md:py-5 text-base md:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* FEATURES GRID */}
      <section id="features" aria-label="Key features" className="py-20 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Everything You Need for Mental Wellness
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Discover a comprehensive suite of tools designed to support your mental health journey
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketingFeatures.map((feature, index) => (
              <div
                key={index}
                className={`rounded-2xl p-[1.5px] bg-gradient-to-br ${gradientFor(index)} shadow-[0_1px_0_rgba(0,0,0,0.02)]`}
              >
                <div className="bg-white rounded-2xl p-6 h-full">
                  <div className="bg-brand-green/10 p-3 rounded-2xl inline-block mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-6">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50" aria-label="App preview video">
        <div className="max-w-7xl mx-auto px-6">
          <div
            className="relative rounded-[28px] p-[2.5px] bg-gradient-to-r from-[#e88584] via-[#0068aa] via-[#FFA600] via-[#B1E006] to-[#ea697c]"
          >
            <div className="rounded-[26px] overflow-hidden bg-black">
              <div className="relative w-full">
                <div className="aspect-video w-full">
                  <video
                    src="https://video.wixstatic.com/video/4e16d8_84364cfb6bc54aa98c0ef045dc4a246f/1080p/mp4/file.mp4"
                    className="w-full h-full object-contain bg-black"
                    controls
                    playsInline
                    preload="metadata"
                  />
                </div>
              </div>
            </div>
          </div>
          <style>{`
            @media (min-width: 1024px) { .aspect-video { height: 720px; } }
            @media (min-width: 768px) and (max-width: 1023.98px) { .aspect-video { height: 600px; } }
          `}</style>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 bg-white text-gray-900" aria-label="Pricing plans">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Wellness Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the plan that best fits your needs and unlock powerful tools for your mental wellness journey.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-2 mb-12">
            <div className="inline-flex rounded-full bg-gray-100 p-1 shadow-inner">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${billingPeriod === 'monthly' ? 'text-white shadow' : 'text-gray-700'}`}
                style={{ backgroundColor: billingPeriod === 'monthly' ? '#e88584' : 'transparent' }}
                onClick={() => setBillingPeriod('monthly')}
                aria-pressed={billingPeriod === 'monthly'}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1 ${billingPeriod === 'yearly' ? 'shadow' : 'text-gray-700'}`}
                style={{
                  backgroundColor: billingPeriod === 'yearly' ? '#B1E006' : 'transparent',
                  color: billingPeriod === 'yearly' ? '#021E3C' : undefined,
                }}
                onClick={() => setBillingPeriod('yearly')}
                aria-pressed={billingPeriod === 'yearly'}
              >
                Yearly
                <BadgePercent className="w-4 h-4" />
                <span className="font-bold" style={{ color: billingPeriod === 'yearly' ? '#021E3C' : undefined }}>
                  Save 30%
                </span>
              </button>
            </div>
          </div>

          {/* Plan Headers */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-4 items-stretch">
            {planCards.map((plan, index) => (
              <div
                key={`header-${index}`}
                className={`text-center py-3 rounded-t-xl font-bold text-lg ${plan.headerClass}`}
              >
                {plan.name}
              </div>
            ))}
          </div>

          {/* Pricing Cards — equal height with aligned CTA row */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {planCards.map((plan, index) => {
              const isBasic = plan.name === 'Basic';
              const isPlus = plan.name === 'Plus';
              const isPremium = plan.name === 'Premium';

              return (
                <div
                  key={index}
                  className={`relative rounded-3xl overflow-visible h-full ${plan.popular ? 'shadow-2xl' : 'shadow-lg'} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border bg-white`}
                >
                  {/* Mobile header color strip */}
                  <div className={`md:hidden text-center py-3 font-bold text-lg ${plan.headerClass}`}>
                    {plan.name}
                  </div>

                  {/* Ribbons */}
                  {plan.popular && (
                    <div className="absolute -top-4 right-0 bg-[#B1E006] text-[#021E3C] px-4 py-1.5 text-sm font-semibold rounded-bl-2xl rounded-tr-2xl shadow-md pointer-events-none z-40">
                      MOST POPULAR
                    </div>
                  )}
                  {plan.couplesTag && (
                    <div className="absolute -top-4 right-0 bg-[#FFA600] text-black px-4 py-1.5 text-sm font-semibold rounded-bl-2xl rounded-tr-2xl shadow-md pointer-events-none z-40">
                      DESIGNED FOR COUPLES
                    </div>
                  )}

                  <div className="p-8 flex flex-col h-full">
                    {/* Normalized header block */}
                    <div className="min-h-[170px] md:min-h-[190px]">
                      <div className="flex items-baseline mb-1">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        {plan.period && <span className="text-gray-600 ml-1">{plan.period}</span>}
                      </div>

                      {billingPeriod === 'yearly' && (isPlus || isPremium) && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-500 line-through">
                            {isPlus ? crossedOutYear('plus') : crossedOutYear('premium')}
                          </span>
                          <span className="ml-2 inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#B1E006', color: '#021E3C' }}>
                            Save 30%
                          </span>
                        </div>
                      )}

                      <p className="text-gray-600">{plan.description}</p>
                    </div>

                    {/* CTA */}
                    <Button
                      onClick={() => {
                        if (isBasic) {
                          document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' });
                        } else if (isPlus) {
                          beginCheckout('plus');
                        } else if (isPremium) {
                          beginCheckout('premium');
                        }
                      }}
                      className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 group ${plan.buttonClass}`}
                    >
                      <span className="flex items-center justify-center">
                        {plan.buttonText}
                        <ArrowRight className="ml-2 h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </Button>

                    <div className="flex-1">
                      <ul className="space-y-4 mt-6">
                        {plan.features.map((feat, idx) => (
                          <FeatureItem key={idx} text={feat} />
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SIGN-UP / SIGN-IN */}
      <section id="login" className="py-20 bg-gradient-to-b from-white to-gray-50 text-gray-900" aria-label="Create account or sign in">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* --- SIGN UP CARD --- */}
            <div className="bg-gradient-to-br from-[#03274b] to-[#021E3C] rounded-3xl p-10 border border-white/10 shadow-2xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">Create your account</h2>
              <p className="text-gray-300 mb-6">
                Start free with Basic. You can upgrade anytime to Plus or Premium.
              </p>

              {referralCode && (
                <div className="mb-4" aria-live="polite">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-green/20 text-brand-green">
                    Referred by: {referralCode}
                  </span>
                </div>
              )}

              {signUpError && (
                <div
                  ref={signUpErrorRef}
                  tabIndex={-1}
                  className="mb-4 rounded-xl bg-red-500/10 p-4 border border-red-500/30"
                  aria-live="assertive"
                >
                  <p className="text-sm text-red-300">{signUpError}</p>
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-5">
                <TextInput
                  id="signup_email"
                  type="email"
                  label="Email"
                  value={signUpEmail}
                  onChange={setSignUpEmail}
                  placeholder="you@example.com"
                  autoComplete="email"
                  Icon={Mail}
                  isDark
                  required
                />
                <TextInput
                  id="signup_password"
                  type="password"
                  label="Password"
                  value={signUpPassword}
                  onChange={setSignUpPassword}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  Icon={Lock}
                  isDark
                  required
                  minLength={8}
                />
                <p className="text-xs text-white/60 -mt-1">Min 8 characters. Use a mix of letters & numbers.</p>

                <TextInput
                  id="signup_phone"
                  type="tel"
                  label="Phone (optional, for SMS reminders)"
                  value={signUpPhone}
                  onChange={setSignUpPhone}
                  placeholder="(555) 123-4567"
                  autoComplete="tel"
                  Icon={Phone}
                  isDark
                />

                <CheckboxRow
                  id="sms_opt_in"
                  checked={smsOptIn}
                  onChange={setSmsOptIn}
                  isDark
                  label={<>I agree to receive SMS reminders (optional). Message &amp; data rates may apply.</>}
                />

                <CheckboxRow
                  id="accept_terms"
                  checked={acceptTerms}
                  onChange={setAcceptTerms}
                  isDark
                  className="-mt-1"
                  label={
                    <>
                      I agree to the{' '}
                      <Link to="/terms" className="text-brand-green underline underline-offset-2">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-brand-green underline underline-offset-2">
                        Privacy Policy
                      </Link>.
                    </>
                  }
                />

                <Button
                  type="submit"
                  disabled={signUpLoading}
                  className="w-full py-3 rounded-xl bg-[#01B1AF] hover:bg-[#018A88] text-white font-semibold transition-all"
                >
                  {signUpLoading ? 'Creating your account…' : 'Create Account'}
                </Button>

                <div className="text-center text-sm text-white/70">
                  Already have an account?{' '}
                  <a
                    href="#signin"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('signin')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-brand-green hover:underline"
                  >
                    Sign in
                  </a>
                </div>
              </form>

              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/pricing')}
                  className="border-white/30 text-white hover:bg-white/10 py-3 rounded-xl transition-all duration-300"
                >
                  Prefer to compare plans? Go to Pricing
                </Button>
              </div>

              <Divider className="my-8 opacity-20" />

              <div className="flex items-start gap-3 text-white/80">
                <Info className="h-5 w-5 mt-0.5 text-brand-green" />
                <p className="text-sm leading-6">
                  Pro tip: You can upgrade or cancel anytime from your account dashboard.
                  Yearly plans save 30% and include the same features as monthly billing for each tier.
                </p>
              </div>
            </div>

            {/* --- SIGN IN CARD --- */}
            <div id="signin" className="bg-white rounded-3xl p-10 border border-gray-200 shadow-xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Welcome back</h2>
              <p className="text-gray-600 mb-6">Sign in to continue your journey.</p>

              {signInError && (
                <div
                  ref={signInErrorRef}
                  tabIndex={-1}
                  className="mb-4 rounded-xl bg-red-50 p-4 border border-red-200"
                  aria-live="assertive"
                >
                  <p className="text-sm text-red-700">{signInError}</p>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-5">
                <TextInput
                  id="signin_email"
                  type="email"
                  label="Email"
                  value={signInEmail}
                  onChange={setSignInEmail}
                  placeholder="you@example.com"
                  autoComplete="email"
                  Icon={Mail}
                />
                <div>
                  <TextInput
                    id="signin_password"
                    type="password"
                    label="Password"
                    value={signInPassword}
                    onChange={setSignInPassword}
                    placeholder="Your password"
                    autoComplete="current-password"
                    Icon={Lock}
                    required
                  />
                  <div className="text-right mt-2">
                    <Link to="/forgot-password" className="text-sm text-[#01B1AF] hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={signInLoading}
                  className="w-full py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-all"
                >
                  {signInLoading ? 'Signing you in…' : 'Sign In'}
                </Button>

                <div className="text-center text-sm text-gray-600">
                  New to Siena?{' '}
                  <a
                    href="#login"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[#01B1AF] hover:underline"
                  >
                    Create an account
                  </a>
                </div>

                <div className="mt-8">
                  <div className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-[#01B1AF]" />
                      <p className="text-sm text-gray-700">
                        Want more tools? Upgrade anytime to <strong>Plus</strong> or <strong>Premium</strong> from your dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-label="Frequently asked questions" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Questions, answered.</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-[#01B1AF]" />
                <h4 className="font-semibold text-gray-900">Can I switch plans later?</h4>
              </div>
              <p className="text-gray-600 text-sm leading-6">
                Yes. Start free, then upgrade to Plus or Premium at any time. If you choose yearly, you save 30% vs monthly.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-[#01B1AF]" />
                <h4 className="font-semibold text-gray-900">Is my data secure?</h4>
              </div>
              <p className="text-gray-600 text-sm leading-6">
                We use industry-standard security and never sell your data. You control your information from within Settings.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-[#01B1AF]" />
                <h4 className="font-semibold text-gray-900">What’s included in Free?</h4>
              </div>
              <p className="text-gray-600 text-sm leading-6">
                Free includes the AI Companion, Affirmations, Emotion Wheel, Basic Individual Decks, Journal, Mood Tracker, and Basic Quizzes.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="h-5 w-5 text-[#01B1AF]" />
                <h4 className="font-semibold text-gray-900">Who is Premium for?</h4>
              </div>
              <p className="text-gray-600 text-sm leading-6">
                Premium is designed for couples and families—it unlocks couples decks, Love Radar, conflict repair tools, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white text-[#021E3C] py-16 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div>
            <img
              src="https://static.wixstatic.com/media/4e16d8_2bc53abfd032465b84ad153b2ebcff3a~mv2.png"
              alt="Siena"
              className="h-20 mb-4"
            />
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">About</h4>
            <p className="text-sm text-[#021E3C]/80">
              Siena is committed to empowering individuals and couples with innovative tools for emotional growth.
              The Siena app was made with love by Licensed Psychotherapists.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Subscribe</h4>
            <form className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded-md bg-white border border-gray-300 placeholder-gray-500 text-[#021E3C] focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#01B1AF] hover:bg-[#019e9d] text-white px-4 py-2 rounded-md transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
}
// ---------------------------------------------------------------------------
// End of file
// ---------------------------------------------------------------------------
