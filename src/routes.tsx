// src/routes.tsx
//
// The website is a static informational site. It routes five things:
// the homepage, the three legal documents, and the /invite landing page.
//
// The former web app (auth, dashboard, affiliate, admin) is NOT routed. Those
// components still exist under src/components/ but nothing imports them from
// here, so the bundler tree-shakes them out along with their Supabase calls.
// Accounts and user content live in the Siena mobile app, on a different
// Supabase project.
//
// Deliberately gone from this file:
//   - ProtectedRoute / PublicRoute. Both read the auth context and rendered a
//     spinner while it initialized, which gated every route on Supabase
//     resolving. /privacy is the URL registered with App Store Connect and has
//     to render on first paint, unconditionally.
//   - Every auth, dashboard, affiliate and admin route.
//
// The catch-all sends unknown paths to the homepage. It previously pointed at
// /login, which no longer exists and would have looped.

import { Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import LoginForm from './components/auth/LoginForm';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';
import AffiliateTermsPage from './components/legal/AffiliateTermsPage';
import InvitePage from './components/invite/InvitePage';
import DownloadPage from './components/download/DownloadPage';

export default function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow">
        <Routes>
          {/* Homepage. Still the existing LoginForm component, which carries
              the hero and pricing content as well as the sign-in and sign-up
              forms. With no auth provider mounted those forms are inert; the
              page is due to be replaced by a real landing page. */}
          <Route path="/" element={<LoginForm />} />

          {/* Legal. Not wrapped in any guard: static text, no data access. */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/affiliate-terms" element={<AffiliateTermsPage />} />

          {/* Partner invite landing page. Reads ?code=, shows it, links to the
              app stores. Makes no backend call. */}
          <Route path="/invite" element={<InvitePage />} />

          {/* Smart download link. Detects the device and sends mobile straight
              to its store; desktop gets QR codes instead. */}
          <Route path="/download" element={<DownloadPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
