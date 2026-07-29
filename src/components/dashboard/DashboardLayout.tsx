// src/components/layout/DashboardLayout.tsx
import { useState, ReactNode, useEffect } from 'react';
import { Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Home as HomeIcon,
  BookOpen,
  Settings as SettingsIcon,
  Calendar,
  Heart,
  LogOut,
  ChevronDown,
  Armchair,
  Users,
  Headphones,
  BookMarked,
  Target,
  Trophy,
  Brain,
  BarChart,
  Pill,
  Bed,
  Sparkles,
  Star,
  MessageSquare,
  Flame,
  Shield,
  // new/changed icons
  Bot,
  Notebook,
  Gem,
  Activity,
  Disc,
  ShieldCheck,
  Dumbbell,
  Repeat,
  Scale,
  ClipboardList,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { supabase } from '../../lib/supabase';
import PageTransition from '../ui/PageTransition';
import OnboardingModal from '../onboarding/OnboardingModal';

// Small helper for card deck icon
const CardDeckIcon = ({ className = 'h-6 w-6', white = false }) => (
  <img
    src={
      white
        ? 'https://static.wixstatic.com/media/4e16d8_bd77c370458d4aff9ed3b4c89eebd191~mv2.png'
        : 'https://static.wixstatic.com/media/4e16d8_3d63683228c54028b01a23b5dd715ff8~mv2.png'
    }
    alt="Card Deck"
    className={className}
    style={{
      backgroundColor: 'transparent',
      filter: white ? 'brightness(0) invert(1)' : 'none',
      opacity: 0.9,
    }}
  />
);

/* ======================= User Menu ======================= */
function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { userData, signOut } = useUser();
  const { currentPlan } = useSubscription();

  const [isAffiliate, setIsAffiliate] = useState(false);
  const [affiliateLoading, setAffiliateLoading] = useState(true);

  const handle = userData?.display_name || 'Member';
  const emoji = userData?.avatar_emoji || '🌿';
  const avatarUrl = (userData as any)?.avatar_url || null;

  useEffect(() => {
    let cancelled = false;

    const checkAffiliateStatus = async () => {
      if (!userData?.email) {
        if (!cancelled) {
          setIsAffiliate(false);
          setAffiliateLoading(false);
        }
        return;
      }

      try {
        const { data: affiliate, error } = await supabase
          .from('affiliates')
          .select('id')
          .eq('email', userData.email)
          .eq('is_active', true)
          .maybeSingle();

        if (!cancelled) {
          setIsAffiliate(!error && !!affiliate);
          setAffiliateLoading(false);
        }
      } catch {
        if (!cancelled) {
          setIsAffiliate(false);
          setAffiliateLoading(false);
        }
      }
    };

    checkAffiliateStatus();
    return () => {
      cancelled = true;
    };
  }, [userData?.email]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getPlanBadgeColor = () => {
    switch (currentPlan) {
      case 'premium':
        return 'bg-[#FFA600] text-black';
      case 'plus':
        return 'bg-[#01B1AF] text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        {currentPlan !== 'premium' && (
          <Link to="/pricing">
            <button className="bg-yellow-500 text-black hover:bg-yellow-400 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1">
              <Star className="h-4 w-4" />
              <span>Upgrade</span>
            </button>
          </Link>
        )}

        <button onClick={() => setIsOpen((o) => !o)} className="flex items-center space-x-3 focus:outline-none">
          <div className="h-8 w-8 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
            {avatarUrl ? <img src={avatarUrl} alt={handle} className="h-full w-full object-cover" /> : <span className="text-lg leading-none">{emoji}</span>}
          </div>
          <div className="hidden md:flex md:items-center">
            <span className="text-sm font-medium text-gray-300">{handle}</span>
            <span className={`ml-2 text-xs px-2.5 py-0.5 rounded-full ${getPlanBadgeColor()}`}>
              {currentPlan === 'premium' ? 'Premium' : currentPlan === 'plus' ? 'Plus' : 'Basic'}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
          </div>
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                {avatarUrl ? <img src={avatarUrl} alt={handle} className="h-full w-full object-cover" /> : <span className="text-lg">{emoji}</span>}
              </div>
              <div className="leading-tight">
                <div className="text-sm font-medium text-gray-900">{handle}</div>
                <div className="text-xs text-gray-500">{currentPlan === 'premium' ? 'Premium' : currentPlan === 'plus' ? 'Plus' : 'Basic'} plan</div>
              </div>
            </div>

            {!affiliateLoading && isAffiliate && (
              <Link to="/affiliate" className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                <Users className="mr-3 h-4 w-4" />
                Affiliate Dashboard
              </Link>
            )}

            <Link to="/pricing" className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
              <Star className="mr-3 h-4 w-4" />
              Upgrade Plan
            </Link>

            <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* =================== Main Layout (updated) =================== */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['individual', 'couples']);
  const location = useLocation();
  const { userData } = useUser();
  const { hasAccess, planFeatures, isLoading: subLoading } = useSubscription();

  // onboarding modal
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (!userData?.id) return;
    // @ts-ignore
    const needsOnboarding = !userData.display_name || userData.onboarding_completed === false;
    setShowOnboarding(needsOnboarding);
  }, [userData?.id, userData?.display_name, userData?.onboarding_completed]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));
  };

  // Individual navigation (unchanged)
  const individualNavigation = [
    { name: 'AI Therapist', href: '/dashboard/chat', icon: Bot, featureId: 'ai-therapist' },
{ name: 'Affirmations', href: '/dashboard/affirmations', icon: Sparkles, featureId: 'affirmations' },
{ name: 'Card Deck', href: '/dashboard/cards', icon: (props: any) => <CardDeckIcon {...props} white />, featureId: 'basic-cards' },
{ name: 'Emotion Wheel', href: '/dashboard/emotion-wheel', icon: Disc, featureId: 'mood-tracker' },
{ name: 'Journal', href: '/dashboard/journal', icon: Notebook, featureId: 'journal' },
{ name: 'Mood Tracker', href: '/dashboard/mood', icon: Activity, featureId: 'mood-tracker' },
{ name: 'Quizzes', href: '/dashboard/quizzes', icon: ClipboardList, featureId: 'basic-quizzes' },
{ name: 'Boundary Builder', href: '/dashboard/boundaries', icon: ShieldCheck, featureId: 'dating-tracker' },
{ name: 'Bucket List', href: '/dashboard/bucket-list', icon: Target, featureId: 'bucket-list' },
{ name: 'Dating Tracker', href: '/dashboard/dating', icon: Heart, featureId: 'dating-tracker' },
{ name: 'Exercises', href: '/dashboard/exercises', icon: Dumbbell, featureId: 'basic-exercises' },
{ name: 'Goals', href: '/dashboard/goals', icon: Trophy, featureId: 'goals' },
{ name: 'Habits', href: '/dashboard/habits', icon: Repeat, featureId: 'goals' },
{ name: 'Life Balance', href: '/dashboard/balance', icon: Scale, featureId: 'life-balance' },
{ name: 'Meditations', href: '/dashboard/meditations', icon: Headphones, featureId: 'meditations' },
{ name: 'Sessions', href: '/dashboard/sessions', icon: Calendar, featureId: 'therapy-sessions' },
{ name: 'Sleep Tracker', href: '/dashboard/sleep', icon: Bed, featureId: 'sleep-tracker' },
{ name: 'Values', href: '/dashboard/values', icon: Gem, featureId: 'values-clarification' },    
{ name: 'Wellness Aids', href: '/dashboard/medications', icon: Pill, featureId: 'medication-management' },
    { name: 'Insights', href: '/dashboard/insights', icon: BarChart, featureId: 'insights' },
  ];

  // Couples navigation (added Shared Values link at bottom)
  const couplesNavigation = [
{ name: 'Activity Tracker', href: '/dashboard/couple-activity-tracker', icon: Activity, featureId: 'couple-activity-tracker' },
{ name: 'Conflict Repairs', href: '/dashboard/conflict-repair', icon: ShieldCheck, featureId: 'couples-cards' },
{ name: 'Couples Card Decks', href: '/dashboard/cards/couples', icon: (props: any) => <CardDeckIcon {...props} white />, featureId: 'couples-cards' },
{ name: 'Couples Exercises', href: '/dashboard/couples-exercises', icon: BookOpen, featureId: 'couples-exercises' },
{ name: 'Couples Meditations', href: '/dashboard/couples-meditations', icon: Headphones, featureId: 'couples-cards' },
{ name: 'Internal World', href: '/dashboard/internal-world', icon: Heart, featureId: 'internal-world' },
{ name: 'Intimacy Builders', href: '/dashboard/intimacy-builders', icon: Flame, featureId: 'couples-cards' },
{ name: 'Live Check-In', href: '/dashboard/live-convo', icon: MessageSquare, featureId: 'live-check-in' },
{ name: 'Love Radar', href: '/dashboard/love-radar', icon: Target, featureId: 'love-radar' },
{ name: 'Shared Bucket List', href: '/dashboard/couples-bucket-list', icon: Target, featureId: 'couples-bucket-list' },
{ name: 'Shared Values', href: '/dashboard/shared-values', icon: Gem, featureId: 'couple-shared-values' },
  ];

  // Other links
  const otherNavigation = [{ name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon, featureId: null }];

  // CLOSE sidebar on link click
  const handleNavigation = () => setSidebarOpen(false);

  // ***** NEW helper: only show badge if user LACKS access *****
  const lockLabel = (featureId?: string | null) => {
    if (!featureId) return null;
    const feat = planFeatures.find((f) => f.id === featureId);
    if (!feat) return null;
    if (hasAccess(featureId)) return null; // user already has access → no pill
    if (feat.access.plus) return 'Plus';
    if (feat.access.premium) return 'Premium';
    return null;
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div className={`fixed inset-0 z-50 bg-gray-900/80 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#021E3C] transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          borderRight: '6px solid transparent',
          borderImage: 'linear-gradient(to bottom, #021E3C 0%, #021E3C 5%, #B1E006 15%, #B1E006 100%) 1',
        }}
      >
        {/* Logo */}
        <div
          className="absolute top-0 left-0 right-0 bg-[#021E3C] p-4 z-10"
          style={{
            background:
              'linear-gradient(to bottom, #021E3C 0%, #021E3C 85%, rgba(2, 30, 60, 0.95) 92%, rgba(2, 30, 60, 0.8) 96%, rgba(2, 30, 60, 0.5) 100%)',
          }}
        >
          <Link to="/dashboard" className="flex items-center justify-center cursor-pointer" onClick={handleNavigation}>
            <img src="https://static.wixstatic.com/media/4e16d8_5f8f5d67d678410f8bb619c5f543db33~mv2.png" alt="Siena" className="h-12 w-auto object-contain" />
          </Link>
          <button className="lg:hidden absolute top-4 right-4" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Nav area */}
        <div className="pt-24 pb-4 px-4 h-full overflow-y-auto">
          <nav className="space-y-6">
            {/* Individual */}
            <div>
              <button
                onClick={() => toggleCategory('individual')}
                className="flex items-center justify-between w-full text-white mb-2 px-2 py-1 rounded hover:bg-white/5"
              >
                <span className="font-semibold text-sm uppercase tracking-wider text-gray-400">Individual</span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    expandedCategories.includes('individual') ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedCategories.includes('individual') && (
                <div className="space-y-1 pl-2">
                  {individualNavigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    const badge = item.featureId ? lockLabel(item.featureId) : null;

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center rounded-lg px-4 py-2 text-white transition-colors ${
                          isActive ? 'bg-[#01B1AF]' : 'hover:bg-white/10'
                        }`}
                        onClick={handleNavigation}
                      >
                        {typeof item.icon === 'function' ? (
                          <div className="mr-3">{item.icon({ className: 'h-5 w-5' })}</div>
                        ) : (
                          <item.icon className="mr-3 h-5 w-5" />
                        )}
                        <div className="flex items-center justify-between w-full">
                          <span>{item.name}</span>
                          {!subLoading && badge && (
                            <span className="text-xs bg-[#FFA600] text-black px-2 py-0.5 rounded-full ml-2">{badge}</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Couples */}
            <div>
              <button
                onClick={() => toggleCategory('couples')}
                className="flex items-center justify-between w-full text-white mb-2 px-2 py-1 rounded hover:bg-white/5"
              >
                <span className="font-semibold text-sm uppercase tracking-wider text-gray-400">Couples</span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    expandedCategories.includes('couples') ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedCategories.includes('couples') && (
                <div className="space-y-1 pl-2">
                  {couplesNavigation.map((item) => {
                    const isActive =
                      location.pathname === item.href ||
                      (item.href === '/dashboard/cards/couples' &&
                        location.pathname.startsWith('/dashboard/cards/couples'));
                    const badge = item.featureId ? lockLabel(item.featureId) : null;

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center rounded-lg px-4 py-2 text-white transition-colors ${
                          isActive ? 'bg-[#01B1AF]' : 'hover:bg-white/10'
                        }`}
                        onClick={handleNavigation}
                      >
                        {typeof item.icon === 'function' ? (
                          <div className="mr-3">{item.icon({ className: 'h-5 w-5' })}</div>
                        ) : (
                          <item.icon className="mr-3 h-5 w-5" />
                        )}
                        <div className="flex items-center justify-between w-full">
                          <span>{item.name}</span>
                          {!subLoading && badge && (
                            <span className="text-xs bg-[#FFA600] text-black px-2 py-0.5 rounded-full ml-2">{badge}</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Other */}
            <div className="pt-4 border-t border-gray-700/50">
              {otherNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center rounded-lg px-4 py-2 text-white transition-colors ${
                    location.pathname === item.href ? 'bg-[#01B1AF]' : 'hover:bg-white/10'
                  }`}
                  onClick={handleNavigation}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Top bar */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <div className="sticky top-0 z-40 bg-[#021E3C] shadow">
          <div className="flex h-16 items-center gap-x-4 px-4 sm:px-6 lg:px-8">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6 text-white" />
            </button>

            <div className="flex flex-1 items-center justify-between">
              <div className="flex flex-1 justify-center items-center">
                <span className="text-white text-lg font-bold tracking-wide">Heal • Evolve • Connect</span>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 py-10 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>

      {/* Onboarding modal */}
      {showOnboarding && (
        <OnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} onCompleted={() => setShowOnboarding(false)} />
      )}
    </>
  );
}
