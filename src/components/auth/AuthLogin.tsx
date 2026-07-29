// src/components/auth/AuthLogin.tsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { useUser } from '../../context/UserContext';

export default function AuthLogin() {
  const { signIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signIn(email, password);
      const from = (location.state as any)?.from;
      const to = from ? `${from.pathname}${from.search ?? ''}` : '/dashboard';
      navigate(to, { replace: true });
    } catch (err: any) {
      setError(
        err?.message?.includes('Invalid login credentials')
          ? 'Invalid email or password. Please try again.'
          : 'Sign-in failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <img
            src="https://static.wixstatic.com/media/4e16d8_2bc53abfd032465b84ad153b2ebcff3a~mv2.png"
            alt="Siena"
            className="mx-auto h-16 w-auto"
          />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600">Sign in to continue your Siena journey</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="sr-only">Email</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-3 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="sr-only">Password</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                className="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-3 text-gray-900 placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-green text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? 'Signing in…' : (
              <>
                Sign in <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-brand-green hover:underline">
            Forgot password?
          </Link>
          <Link to="/register" className="text-brand-green hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
