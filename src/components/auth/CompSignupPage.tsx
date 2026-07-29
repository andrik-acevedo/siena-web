// src/components/auth/CompSignupPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';

export default function CompSignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [smsOptIn,  setSmsOptIn]  = useState(false);
  const [compCode,  setCompCode]  = useState<string>('');
  const [error,     setError]     = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const REDEEM_ENDPOINT = import.meta.env.VITE_REDEEM_COMP_URL as string;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('code') ?? '';
    setCompCode(c);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Require a complimentary code for this page
      if (!compCode.trim()) {
        throw new Error('A complimentary code is required to sign up from this page.');
      }

      // Optional pre-check (safe to keep; ignored if fn not present)
      try {
        const resp = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-by-email`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email.trim().toLowerCase() }),
          }
        );
        if (resp.ok) {
          const { exists, error: checkError } = await resp.json();
          if (checkError) throw new Error(checkError);
          if (exists) throw new Error('This email is already registered');
        }
      } catch { /* ignore pre-check errors */ }

      // 1) Auth signup
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });
      if (signUpError) throw signUpError;
      if (!user) throw new Error('No user returned from signup');

      // 2) Create profile as BASIC (enum: basic | plus | premium)
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: smsOptIn ? phone : null,
        timezone: 'America/New_York',
        subscription_status: 'active',
        personal_client: true,
        subscription_tier: 'basic',                // ✅ enum value (NOT "free")
        subscription_tier_updated_at: new Date().toISOString(),
        trial_expiration: null
      }]);
      if (profileError) throw profileError;

      // 3) Redeem the comp code (upgrades to plus/premium)
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr) throw sessionErr;
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error('Missing session token after signup');

      if (!REDEEM_ENDPOINT) throw new Error('Missing VITE_REDEEM_COMP_URL env var');

      const redeemResp = await fetch(REDEEM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ code: compCode.trim() }),
      });
      if (!redeemResp.ok) {
        const txt = await redeemResp.text();
        throw new Error(txt || 'Failed to redeem complimentary code');
      }

      // 4) Continue
      navigate('/terms');
    } catch (err: any) {
      console.error('Comp signup error:', err);
      setError(err?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img
            src="https://static.wixstatic.com/media/4e16d8_2bc53abfd032465b84ad153b2ebcff3a~mv2.png"
            alt="Siena"
            className="mx-auto h-24 w-auto sm:h-32"
          />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Complimentary Access
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your complimentary code to create your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-6 rounded-lg shadow-md">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="sr-only">First name</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    required
                    className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green sm:text-sm sm:leading-6"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="sr-only">Last name</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    required
                    className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green sm:text-sm sm:leading-6"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green sm:text-sm sm:leading-6"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green sm:text-sm sm:leading-6"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="sr-only">Phone number</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green sm:text-sm sm:leading-6"
                  placeholder="Phone number (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="smsOptIn"
                type="checkbox"
                checked={smsOptIn}
                onChange={(e) => setSmsOptIn(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green mt-1"
              />
              <label htmlFor="smsOptIn" className="ml-2 block text-sm text-gray-600">
                I agree to receive account-related text messages from Siena.
              </label>
            </div>

            {/* Code (required) */}
            <div>
              <label htmlFor="compCode" className="sr-only">Complimentary code</label>
              <input
                id="compCode"
                type="text"
                required
                className="block w-full rounded-md border-0 py-1.5 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green sm:text-sm sm:leading-6"
                placeholder="Complimentary code (required)"
                value={compCode}
                onChange={(e) => setCompCode(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">If you received a special link, your code is auto-filled.</p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Account…' : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  );
}
