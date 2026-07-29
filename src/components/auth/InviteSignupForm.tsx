import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Mail, User, Users, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import TermsAgreement from './TermsAgreement';
import { supabase } from '../../lib/supabase';
import { generateUniqueHandle } from '../../lib/handle';

type InviterInfo = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
} | null;

export default function InviteSignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [validatingInvite, setValidatingInvite] = useState(true);

  const [inviteCode, setInviteCode] = useState('');
  const [inviterInfo, setInviterInfo] = useState<InviterInfo>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Grab invite code from URL and validate
  useEffect(() => {
    const inviteParam = searchParams.get('invite') || searchParams.get('code');
    if (inviteParam) {
      setInviteCode(inviteParam);
      validateInviteCode(inviteParam);
    } else {
      setError('No invite code provided. Please use a valid invite link.');
      setValidatingInvite(false);
    }
  }, [searchParams]);

  const validateInviteCode = async (code: string) => {
    try {
      const { data, error } = await supabase.rpc('validate_invite_code', {
        invite_code_param: code,
      });

      if (error) {
        setError('Failed to validate invite code. Please try again.');
        setValidatingInvite(false);
        return;
      }

      if (!data?.valid) {
        setError(data?.error || 'Invalid invite code');
        setValidatingInvite(false);
        return;
      }

      setInviterInfo(data.inviter as InviterInfo);
      setValidatingInvite(false);
    } catch (err) {
      console.error('Error validating invite code:', err);
      setError('Failed to validate invite code. Please try again.');
      setValidatingInvite(false);
    }
  };

  // Step 1: basic form submit just shows the Terms component
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowTerms(true);
  };

  // Step 2: after user accepts terms, create auth user + profile (with unique handle)
  const handleAcceptTerms = async () => {
    setIsLoading(true);
    setError('');

    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // 1) Create auth user
      const {
        data: { user },
        error: signUpError,
      } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      if (signUpError) throw signUpError;
      if (!user) throw new Error('No user returned from signup');

      // 2) Generate a unique handle and insert profile
      // try a couple of times in case of a rare race on the unique index
      let lastInsertError: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const handle = await generateUniqueHandle(supabase);

          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: user.id,
              first_name: firstName,
              last_name: lastName,
              email: email.trim().toLowerCase(),
              // the **public** handle
              display_name: handle,
              // sensible defaults
              timezone: 'America/New_York',
              // invited users inherit premium from inviter
              subscription_status: 'active',
              subscription_tier: 'premium',
              subscription_tier_updated_at: new Date().toISOString(),
              invited_by: inviterInfo?.id ?? null,
              can_invite: false,
              terms_agreed_at: new Date().toISOString(),
            },
          ]);

          if (profileError) {
            // If unique-constraint on display_name, loop to try a new one
            const msg = String(profileError.message || '');
            if (msg.toLowerCase().includes('unique') && msg.toLowerCase().includes('display_name')) {
              lastInsertError = profileError;
              continue;
            }
            throw profileError;
          }

          // success, break loop
          lastInsertError = null;
          break;
        } catch (e) {
          lastInsertError = e;
        }
      }
      if (lastInsertError) throw lastInsertError;

      // 3) Sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      if (signInError) throw signInError;

      // 4) Go to app
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';
      const msg = String(err?.message || '').toLowerCase();

      if (msg.includes('already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (msg.includes('valid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (msg.includes('at least 6 characters')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (msg.includes('maximum limit')) {
        errorMessage = 'This invite code has reached its maximum limit of users.';
      } else if (msg.includes('display_name') && msg.includes('unique')) {
        errorMessage = 'Handle conflict — please try again.';
      }

      setError(errorMessage);
      setShowTerms(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineTerms = () => setShowTerms(false);

  // --- UI ---

  if (validatingInvite) {
    return (
      <div className="min-h-screen bg-gray-50 nav-padding flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto"></div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Validating Invite</h2>
            <p className="mt-1 text-sm text-gray-600">Please wait while we validate your invite code...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !inviterInfo) {
    return (
      <div className="min-h-screen bg-gray-50 nav-padding flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Invalid Invite</h2>
            <div className="rounded-md bg-red-50 p-3 mt-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="mt-6">
              <Link to="/register">
                <Button className="w-full">Go to Regular Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showTerms) {
    return <TermsAgreement onAccept={handleAcceptTerms} onDecline={handleDeclineTerms} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 nav-padding flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-brand-green to-brand-green/80 shadow-lg">
            <Users className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">You're Invited!</h2>
          <p className="mt-2 text-base text-gray-600">
            {inviterInfo?.first_name} {inviterInfo?.last_name} has invited you to join Siena with premium access
          </p>
        </div>

        {/* Premium banner */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 text-yellow-600 mr-3" />
            <span className="text-base font-semibold text-yellow-800">Premium Access Included</span>
          </div>
          <p className="text-sm text-yellow-700 mt-2">You'll get full access to all premium features at no cost</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="block w-full rounded-lg border-0 py-3 pl-10 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green text-base"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full rounded-lg border-0 py-3 pl-10 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green text-base"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    className="block w-full rounded-lg border-0 py-3 pl-10 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green text-base"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full py-3 text-base font-semibold bg-gradient-to-r from-brand-green to-brand-green/80 hover:from-brand-green/80 hover:to-brand-green text-white shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Premium Account'}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-brand-green hover:text-brand-green/80 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center space-y-6 pb-8">
          <p className="text-sm text-gray-500">Made With Love By</p>
          <a
            href="https://www.lovediscovery.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition-opacity hover:opacity-80"
          >
            <img
              src="https://static.wixstatic.com/media/4e16d8_8af33c507e234f049d3c90dd7c1d41e3~mv2.png"
              alt="Siena"
              className="h-8 w-auto mx-auto"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
