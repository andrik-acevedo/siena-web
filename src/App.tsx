// The website is a static informational site: the homepage, the legal
// documents, and the /invite landing page. It is NOT the Siena app.
//
// Accounts and user content live in the Siena mobile app, on a different
// Supabase project. This site therefore mounts no auth/subscription providers
// and makes no network calls. The former web-app components are still in the
// repo but are no longer routed, so they tree-shake out of the bundle.
//
// Three things were deliberately removed here:
//   - UserProvider / SubscriptionProvider / MessageLimitProvider
//   - the authState 'initializing' spinner, which gated EVERY route on
//     Supabase resolving. That is why /privacy could hang: the URL Apple
//     checks must render on first paint, unconditionally.
//   - the testSupabaseConnection() effect, which queried `profiles` on boot.
//
// useUser() returns inert defaults when no provider is mounted (see
// UserContext), so the homepage and Header still render.

import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes.tsx';

function App() {
  return (
    <Router>
      <div className="relative z-0 min-h-screen w-full bg-[#FFFFFF] text-white overflow-x-hidden flex flex-col">
        <div className="flex-grow">
          <AppRoutes />
        </div>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
