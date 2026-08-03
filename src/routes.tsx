// src/routes.tsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';

import { useUser } from './context/UserContext';
import { useSubscription } from './context/SubscriptionContext';

import LoginForm from './components/auth/LoginForm';
import AuthLogin from './components/auth/AuthLogin';
import RegisterForm from './components/auth/RegisterForm';
import InviteSignupForm from './components/auth/InviteSignupForm';
import InvitePage from './components/invite/InvitePage';
import PersonalClientSignup from './components/auth/PersonalClientSignup';
import CompSignupPage from './components/auth/CompSignupPage'; // ✅ NEW IMPORT
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import TermsAgreement from './components/auth/TermsAgreement';
import OptInPage from './components/auth/OptInPage';
import AffiliateApplicationsList from './components/affiliate/AffiliateApplicationsList';
import AffiliatesList from './components/affiliate/AffiliatesList';


import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './components/dashboard/DashboardHome';
import ExerciseList from './components/exercises/ExerciseList';
import CouplesExerciseList from './components/exercises/CouplesExerciseList';
import ExerciseForm from './components/exercises/ExerciseForm';
import ExerciseView from './components/exercises/ExerciseView';
import CardDeckIntro from './components/cards/CardDeckIntro';
import CardTopics from './components/cards/CardTopics';
import CardDeck from './components/cards/CardDeck';
import ValuesPage from './components/values/ValuesPage';
import AffirmationList from './components/affirmations/AffirmationList';
import MeditationList from './components/meditation/MeditationList';
import VirtualTherapist from './components/chat/VirtualTherapist';
import JournalPage from './components/journal/JournalPage';
import GoalsPage from './components/goals/GoalsPage';
import HabitsPage from './pages/HabitsPage';
import QuizList from './components/quizzes/QuizList';
import QuizView from './components/quizzes/QuizView';
import SessionsPage from './components/sessions/SessionsPage';
import MoodTracker from './components/mood/MoodTracker';
import EmotionWheel from './components/emotion-wheel/EmotionWheel';
import SettingsPage from './components/settings/SettingsPage';
import InsightsPage from './components/insights/InsightsPage';
import LifeBalanceWheel from './components/balance/LifeBalanceWheel';
import SuggestedActivities from './components/balance/SuggestedActivities';
import LoveRadar from './components/love-radar/LoveRadar';
import IntimacyActivities from './components/couples/IntimacyActivities';
import ConflictRepairRituals from './components/couples/ConflictRepairRituals';
import IntimacyBuilders from './components/couples/IntimacyBuilders';
import IntimacyBuilderCategories from './components/couples/IntimacyBuilderCategories';
import CouplesMeditations from './components/couples/CouplesMeditations';
import CouplesInternalWorldReconnect from './components/couples/CouplesInternalWorldReconnect';
import CouplesInternalWorldHistory from './components/couples/CouplesInternalWorldHistory';
import CouplesLiveConvo from './components/couples/CouplesLiveConvo';
import CoupleActivityTracker from './components/couples/CoupleActivityTracker';
import SharedValuesPage from './components/values/SharedValuesPage'; // ✅ NEW

import OnboardingReturn from './components/affiliate/OnboardingReturn';
import OnboardingRefresh from './components/affiliate/OnboardingRefresh';

import DatingTracker from './components/dating/DatingTracker';
import Boundaries from './components/boundaries/Boundaries';
import MedicationManagement from './components/medications/MedicationManagement';
import SleepTracker from './components/sleep/SleepTracker';
import SharedBucketListPage from './components/couples/SharedBucketListPage';
import BucketListPage from './components/goals/BucketListPage';

import AffiliateDashboard from './components/affiliate/AffiliateDashboard';
import AffiliateApplicationForm from './components/affiliate/AffiliateApplicationForm';
import ReviewApplicationPage from './components/affiliate/ReviewApplicationPage';

import AdminDashboard from './components/admin/AdminDashboard';
import MakeAdminPage from './components/admin/MakeAdminPage';

import PricingPage from './components/pricing/PricingPage';
import FeatureAccessGuard from './components/subscription/FeatureAccessGuard';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';
import AffiliateTermsPage from './components/legal/AffiliateTermsPage';

/* ----------------------- Protected & Public wrappers ----------------------- */

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authState } = useUser();
  const { currentPlan: _plan } = useSubscription();
  const location = useLocation();

  if (authState.status === 'initializing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (authState.status === 'unauthenticated') {
    if (!['/login', '/register', '/forgot-password', '/reset-password', '/'].includes(location.pathname)) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  if (authState.user && !authState.user.terms_agreed_at && location.pathname !== '/terms') {
    return <Navigate to="/terms" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { authState } = useUser();
  const location = useLocation();

  if (authState.status === 'initializing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  if (authState.status === 'authenticated' && ['/login', '/register', '/'].includes(location.pathname)) {
    const from = (location.state as any)?.from as Location | undefined;
    const to = from ? `${from.pathname}${from.search ?? ''}` : '/dashboard';
    return <Navigate to={to} replace />;
  }

  return <>{children}</>;
}

/* ----------------------- Main App Routes ----------------------- */

export default function AppRoutes() {
  const location = useLocation();

  const isPublicPage = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    // '/invite' is intentionally absent: the invite landing page is a
    // standalone full-screen page and renders its own layout. The signup form
    // that moved to /invite/signup keeps the shared header it always had.
    '/invite/signup',
    '/comp-signup',
    '/patient-signup', // ✅ treat as public for redirect
    '/',
    '/affiliate/onboarding/return',
    '/affiliate/onboarding/refresh',
  ].includes(location.pathname);

  const isPricingPage = location.pathname === '/pricing';
  const isLegalPage = ['/privacy', '/terms-of-service', '/affiliate-terms'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {(isPublicPage || isPricingPage || isLegalPage) && <Header />}
      <div className="flex-grow">
        <Routes>
          {/* Public / Auth */}
          <Route path="/" element={<PublicRoute><LoginForm /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><AuthLogin /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterForm /></PublicRoute>} />
          {/*
            /invite is the landing page for partner invites shared from the
            mobile app. Like the legal pages it is NOT wrapped in PublicRoute:
            it is static, collects nothing, and must render instantly rather
            than waiting on the auth context to initialize.

            The web signup form that previously lived here moved to
            /invite/signup and is still reachable. Older web-generated links
            pointing at /invite?code= still work: the landing page reads the
            same param, stores it, and offers the browser signup path.
          */}
          <Route path="/invite" element={<InvitePage />} />
          <Route path="/invite/signup" element={<PublicRoute><InviteSignupForm /></PublicRoute>} />

          {/* ✅ NEW: Comp signup page */}
          <Route path="/comp-signup" element={<PublicRoute><CompSignupPage /></PublicRoute>} />
          {/* ✅ Redirect old URL */}
          <Route path="/patient-signup" element={<Navigate to="/comp-signup" replace />} />

          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordForm /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPasswordForm /></PublicRoute>} />
          <Route path="/opt-in" element={<PublicRoute><OptInPage /></PublicRoute>} />

          {/* Stripe Connect onboarding redirects */}
          <Route path="/affiliate/onboarding/return" element={<PublicRoute><OnboardingReturn /></PublicRoute>} />
          <Route path="/affiliate/onboarding/refresh" element={<PublicRoute><OnboardingRefresh /></PublicRoute>} />

          {/*
            Legal & Pricing (public)

            /privacy and /terms-of-service are deliberately NOT wrapped in
            PublicRoute. PublicRoute renders a spinner while the auth context
            is initializing, which made these pages depend on Supabase being
            reachable — if it is slow or misconfigured, the privacy policy URL
            spins forever. That URL is the one registered with App Store
            Connect and the basis of our 5.1.1(i) response, so it has to
            render instantly and unconditionally.

            Both are pure static text with no auth, fetch or data dependency,
            so the wrapper bought nothing. PublicRoute's only other behaviour
            is redirecting authenticated users away from /login, /register and
            /, which never applied to these paths.
          */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/affiliate-terms" element={<PublicRoute><AffiliateTermsPage /></PublicRoute>} />
          <Route path="/pricing" element={<PublicRoute><PricingPage /></PublicRoute>} />

          {/* Terms (protected; users without agreement are redirected here) */}
          <Route path="/terms" element={<ProtectedRoute><TermsAgreement /></ProtectedRoute>} />

          {/* Dashboard (protected) */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route index element={<DashboardHome />} />

                    {/* Individual Tools */}
                    <Route path="chat" element={<VirtualTherapist />} />
                    <Route path="cards" element={<CardDeckIntro />} />
                    <Route path="cards/:deckType" element={<CardTopics />} />
                    <Route path="cards/:deckType/topic/:topicId" element={<CardDeck />} />
                    <Route path="affirmations" element={<AffirmationList />} />
                    <Route path="quizzes" element={<QuizList />} />
                    <Route path="quizzes/:id" element={<QuizView />} />
                    <Route path="journal" element={<JournalPage />} />
                    <Route path="values" element={<ValuesPage />} />
                    <Route path="mood" element={<MoodTracker />} />
                    <Route path="emotion-wheel" element={<EmotionWheel />} />
                    <Route path="dating" element={<DatingTracker />} />
                    <Route path="boundaries" element={<Boundaries />} />
                    <Route path="meditations" element={<MeditationList />} />
                    <Route path="exercises" element={<ExerciseList />} />
                    <Route path="exercises/:id" element={<ExerciseView />} />
                    <Route path="goals" element={<GoalsPage />} />
                    <Route path="habits" element={<HabitsPage />} />
                    <Route path="bucket-list" element={<BucketListPage />} />
                    <Route path="sessions" element={<SessionsPage />} />
                    <Route path="sleep" element={<SleepTracker />} />
                    <Route path="balance" element={<LifeBalanceWheel />} />
                    <Route path="balance/activities/:category" element={<SuggestedActivities />} />
                    <Route path="medications" element={<MedicationManagement />} />
                    <Route path="insights" element={<InsightsPage />} />
                    <Route path="settings" element={<SettingsPage />} />

                    {/* Couples Tools */}
                    <Route path="intimacy-builders" element={<IntimacyBuilderCategories />} />
                    <Route path="intimacy-builders/:category" element={<IntimacyBuilders />} />
                    <Route path="intimacy-activities/:category" element={<IntimacyActivities />} />
                    <Route path="conflict-repair" element={<ConflictRepairRituals />} />
                    <Route path="love-radar" element={<LoveRadar />} />
                    <Route path="internal-world" element={<CouplesInternalWorldReconnect />} />
                    <Route path="internal-world/history" element={<CouplesInternalWorldHistory />} />
                    <Route path="couples-bucket-list" element={<SharedBucketListPage />} />
                    <Route path="couples-exercises" element={<CouplesExerciseList />} />
                    <Route path="couples-meditations" element={<CouplesMeditations />} />
                    <Route path="live-convo" element={<CouplesLiveConvo />} />
                    <Route path="couple-activity-tracker" element={<CoupleActivityTracker />} />
                    {/* ✅ NEW */}
                    <Route path="shared-values" element={<SharedValuesPage />} />

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin / Affiliate */}
          <Route path="/admin-test" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/make-admin" element={<ProtectedRoute><MakeAdminPage /></ProtectedRoute>} />
          <Route path="/admin/affiliate-applications" element={<ProtectedRoute><AffiliateApplicationsList /></ProtectedRoute>} />
          <Route path="/admin/affiliates" element={<ProtectedRoute><AffiliatesList /></ProtectedRoute>} />
          <Route path="/admin/review-affiliate" element={<ProtectedRoute><ReviewApplicationPage /></ProtectedRoute>} /> {/* expects ?app_id=... */}
          <Route path="/affiliate" element={<ProtectedRoute><AffiliateDashboard /></ProtectedRoute>} />
          <Route path="/affiliate/apply" element={<PublicRoute><AffiliateApplicationForm /></PublicRoute>} />
          <Route path="/affiliate/admin" element={<ProtectedRoute><ReviewApplicationPage /></ProtectedRoute>} />

          {/* 404 → send to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
