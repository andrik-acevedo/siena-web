// src/components/auth/LoginForm.tsx
//
// The Siena home page. Despite the filename this is now a purely static
// marketing page for the mobile app: there is no web app and no web checkout,
// so it holds no auth, no Supabase client and no network calls of any kind.
// Everything a visitor can do here leads to the App Store or Google Play.
//
// Preserved deliberately: the hero logo, the "Your Path to Wellness Begins
// Here" headline and the surrounding copy, the product video, and the FAQ
// content. Only the presentation around them changed.

import { useEffect, useRef, useState } from 'react';
import {
  BarChart,
  BookOpen,
  Brain,
  Calendar,
  CheckSquare,
  Headphones,
  Heart,
  CheckCircle2,
  Menu,
  MessageCircle,
  MessageSquare,
  Shield,
  Sparkles,
  Target,
} from 'lucide-react';

const APP_STORE_URL = 'https://apps.apple.com/app/id6786386711';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.siena.wellness';

/**
 * Official App Store / Google Play badge.
 *
 * Uses the supplied artwork rather than a drawn approximation: both stores
 * require their badge to appear unmodified, so it is rendered as an image at a
 * fixed height with width:auto to preserve the 3:1 aspect ratio.
 *
 * The badge already contains the wording, so the <img> alt carries the action
 * for screen readers and the link needs no visible label.
 */
function StoreBadge({ href, platform }: { href: string; platform: 'ios' | 'android' }) {
  const isIOS = platform === 'ios';
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-xl focus-visible:outline focus-visible:outline-2
                 focus-visible:outline-offset-4 focus-visible:outline-brand-green
                 hover:opacity-85 transition-opacity duration-200 cursor-pointer
                 motion-reduce:transition-none"
    >
      <img
        src={isIOS ? '/badges/app-store.png' : '/badges/google-play.png'}
        alt={isIOS ? 'Download Siena on the App Store' : 'Get Siena on Google Play'}
        width={849}
        height={283}
        loading="lazy"
        decoding="async"
        className="h-[56px] w-auto"
      />
    </a>
  );
}

// Features are grouped the way the app is actually organised. Every entry maps
// to a real screen in the mobile app; nothing here is aspirational. "SMS Text
// Reminders" was removed because that feature only ever existed on the web.
const FEATURE_GROUPS = [
  {
    group: 'For You',
    items: [
      { icon: Brain, title: 'Siena AI Guide', description: '24/7 reflective support built on therapeutic frameworks' },
      { icon: BookOpen, title: 'Guided Journeys', description: 'Multi-step programs on anxiety, sleep, boundaries and more' },
      { icon: MessageSquare, title: 'Journal', description: 'Write, draw, or record a voice note, and add a photo' },
      { icon: Heart, title: 'Mood & Sleep Tracking', description: 'Log how you feel and how you slept, then see the pattern' },
      { icon: Headphones, title: 'Meditations & Breathing', description: 'Guided audio and paced breathing for the hard moments' },
      { icon: Sparkles, title: 'Affirmations & Echoes', description: 'A daily reflection worth carrying with you' },
      { icon: Target, title: 'Goals, Habits & Commitments', description: 'Set intentions and get AI check-ins that follow up' },
      { icon: Shield, title: 'Boundary Builder', description: 'Find the words, and practise saying them' },
    ],
  },
  {
    group: 'For Couples',
    items: [
      { icon: MessageCircle, title: 'Live Check-In', description: 'Real-time tone awareness during a hard conversation' },
      { icon: Heart, title: 'Pulse', description: 'A shared question each week, answered by you both' },
      { icon: CheckSquare, title: 'Couples Quizzes', description: 'Compare answers and see where you align' },
      { icon: Brain, title: 'Internal World', description: 'Share what is going on underneath, then reflect together' },
      { icon: BarChart, title: 'Love Radar', description: 'Six dimensions of intimacy, tracked over time' },
      { icon: Calendar, title: 'Date Roulette & Bucket List', description: 'Plan time together and keep a shared list' },
      { icon: Sparkles, title: 'Intimacy Builders', description: '30-day challenges for closeness and connection' },
      { icon: Target, title: 'Shared Values', description: 'Name what matters to you both, side by side' },
    ],
  },
  {
    group: 'Insight & Growth',
    items: [
      { icon: BarChart, title: 'Siena Assessment', description: 'A written report on personality, attachment and coping' },
      { icon: Brain, title: 'Emotion Wheel', description: 'Name the feeling more precisely than "fine"' },
      { icon: BookOpen, title: 'Conversational Cards', description: 'Prompts that open the conversations worth having' },
      { icon: Target, title: 'Values & Life Balance', description: 'Clarify what you care about and where the gaps are' },
      { icon: CheckSquare, title: 'Exercises & Quizzes', description: 'Therapist-built activities you can actually finish' },
      { icon: BarChart, title: 'Insights', description: 'Your patterns over time, in plain language' },
      { icon: Calendar, title: 'Wellness Sessions', description: 'Keep a private log of the appointments you attend' },
      { icon: Sparkles, title: 'Personal Mandala', description: 'A symbol generated from what you tell Siena about you' },
    ],
  },
];

// Informational only. Siena is bought inside the app, so these cards carry no
// purchase action; the only CTA on the page points at the stores.
const SUBSCRIPTION_PLANS = [
  { name: 'Premium Monthly', price: '$9.99', period: '/month', blurb: 'Full access to Siena, billed monthly.' },
  { name: 'Premium Yearly', price: '$99.99', period: '/year', blurb: 'Full access to Siena, billed once a year.', highlight: true },
];

const ASSESSMENT_PLANS = [
  { name: 'Individual Assessment', price: '$24.99', period: 'one-time', blurb: 'Your written report covering personality, attachment, regulation and coping.' },
  { name: 'Couples Assessment', price: '$39.99', period: 'one-time', blurb: 'A joint report for you and your partner, covering the whole relationship.' },
];

export default function LoginForm() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close the mobile menu on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="min-h-screen bg-white" ref={navRef}>
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

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8 md:mb-16">
          <StoreBadge href={APP_STORE_URL} platform="ios" />
          <StoreBadge href={PLAY_STORE_URL} platform="android" />
        </div>
      </div>
    </div>

      {/* FEATURES */}
      <section id="features" aria-label="Key features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            Everything You Need for Mental Wellness
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-14">
            Discover a comprehensive suite of tools designed to support your mental health journey
          </p>

          <div className="space-y-14">
            {FEATURE_GROUPS.map((group) => (
              <div key={group.group}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-green mb-6">
                  {group.group}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {group.items.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={feature.title}
                        className="rounded-2xl border border-gray-200 bg-white p-6 h-full shadow-sm
                                   hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
                                   motion-reduce:transform-none motion-reduce:transition-none"
                      >
                        <div className="bg-brand-green/10 p-3 rounded-2xl inline-flex mb-4">
                          <Icon className="h-5 w-5 text-brand-green" aria-hidden="true" />
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 mb-1.5">{feature.title}</h4>
                        <p className="text-gray-600 text-sm leading-6">{feature.description}</p>
                      </div>
                    );
                  })}
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

      {/* PRICING — informational only, no web checkout */}
      <section id="pricing" className="py-20 bg-gray-50 text-gray-900" aria-label="Pricing">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-3">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Wellness Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the plan that best fits your needs and unlock powerful tools for your mental wellness journey.
            </p>
          </div>
          <p className="text-center text-sm text-gray-500 mb-12">
            Plans are purchased inside the Siena app.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl bg-white p-8 border ${
                  plan.highlight ? 'border-brand-green shadow-lg' : 'border-gray-200 shadow-sm'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-8 rounded-full bg-brand-green px-3 py-1 text-xs font-semibold text-white">
                    Best value
                  </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-bold text-gray-900 tabular-nums">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <p className="text-gray-600 leading-relaxed">{plan.blurb}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ASSESSMENT_PLANS.map((plan) => (
              <div key={plan.name} className="rounded-2xl bg-white p-8 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-gray-900 tabular-nums">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-gray-600 leading-relaxed">{plan.blurb}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
            <StoreBadge href={APP_STORE_URL} platform="ios" />
            <StoreBadge href={PLAY_STORE_URL} platform="android" />
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

      {/* FINAL CTA */}
      <section className="py-20 bg-[#021E3C]" aria-label="Download Siena">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siena is available on iPhone and Android
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Download the app to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <StoreBadge href={APP_STORE_URL} platform="ios" />
            <StoreBadge href={PLAY_STORE_URL} platform="android" />
          </div>
        </div>
      </section>
    </div>
  );
}
