import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      // Trigger the password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err) {
      console.error('❌ Forgot password failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to send password reset email: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto h-16 w-auto">
            <img
              src="https://static.wixstatic.com/media/4e16d8_dc475d28cdc04d859ca8abd0e4dba17f~mv2.png"
              alt="Siena"
              className="h-full w-auto mx-auto"
            />
          </div>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to your email address. Please check your inbox.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="mx-auto h-16 w-auto">
            <img
              src="https://static.wixstatic.com/media/4e16d8_dc475d28cdc04d859ca8abd0e4dba17f~mv2.png"
              alt="Siena"
              className="h-full w-auto mx-auto"
            />
          </div>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-sm text-red-600 mb-6">{error}</p>
          </div>
          <Button 
            onClick={() => setError('')} 
            className="w-full"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Main Forgot Password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto h-16 w-auto">
            <img
              src="https://static.wixstatic.com/media/4e16d8_dc475d28cdc04d859ca8abd0e4dba17f~mv2.png"
              alt="Siena"
              className="h-full w-auto mx-auto"
            />
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
            Forgot Password?
          </h2>
          <p className="mt-1 text-center text-sm text-gray-600">
            Enter your email address below, and we'll send you a reset link.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full rounded-md border-0 py-1.5 pl-8 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Sending email...' : 'Send Reset Link'}
          </Button>
        </form>
      </div>
    </div>
  );
}
