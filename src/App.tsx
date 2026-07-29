import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { MessageLimitProvider } from './context/MessageLimitContext';
import AppRoutes from './routes.tsx';
import { Loader2 } from 'lucide-react';
import { useUser } from './context/UserContext';
import { useEffect } from 'react';
import { testSupabaseConnection } from './lib/supabase-test';
import { Toaster } from 'react-hot-toast'; // ⬅️ add this

function AppContent() {
  const { authState } = useUser();

  console.log('🔄 App render state:', {
    authStatus: authState.status,
    hasUser: !!authState.user,
    hasError: !!authState.error,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    async function testConnection() {
      const result = await testSupabaseConnection();
      if (result.success) {
        console.log('🔌 Supabase connection test: ✅ Connected');
      } else {
        console.log('🔌 Supabase connection test: ⚠️ Failed (may be normal during development)');
      }
    }
    testConnection();
  }, []);

  if (authState.status === 'initializing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
        <Loader2 className="h-8 w-8 text-brand-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative z-0 min-h-screen w-full bg-[#FFFFFF] text-white overflow-x-hidden flex flex-col">
      <div className="flex-grow">
        <AppRoutes />
      </div>

      {/* Toasts */}
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <UserProvider>
        <SubscriptionProvider>
          <MessageLimitProvider>
            <AppContent />
          </MessageLimitProvider>
        </SubscriptionProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
