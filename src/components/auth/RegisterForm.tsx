// src/components/auth/RegisterForm.tsx
import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Lock, Mail, User, Phone } from 'lucide-react';
import Button from '../ui/Button';
import { useUser } from '../../context/UserContext';
import TermsAgreement from './TermsAgreement';
import { supabase } from '../../lib/supabase';
import { getAffiliateByCode, trackReferralSignup } from '../../lib/affiliateService';

type ValidAffiliate = {
  id: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  referral_code: string;
  is_active: boolean;
};

export default function RegisterForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp } = useUser();

  // form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(false);

  // ui state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // referral
  const referralCode = searchParams.get('ref') || '';
  const [refAffiliate, setRefAffiliate] = useState<ValidAffiliate | null>(null);
  const [refChecked, setRefChecked] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!referralCode) {
        setRefAffiliate(null);
        setRefChecked(true);
        return;
      }
      try {
        const aff = await getAffiliateByCode(referralCode);
        if (active && aff && aff.is_active) {
          setRefAffiliate(aff as ValidAffiliate);
          sessionStorage.setItem(
            'pending_ref',
            JSON.stringify({ referral_code: aff.referral_code, email: aff.email, affiliate_id: aff.id })
          );
        } else {
          setRefAffiliate(null);
          sessionStorage.removeItem('pending_ref');
        }
      } catch (e) {
        console.warn('Ref validation failed:', e);
        setRefAffiliate(null);
        sessionStorage.removeItem('pending_ref');
      } finally {
        setRefChecked(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [referralCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowTerms(true);
  };

  const handleAcceptTerms = async () => {
    setIsLoading(true);
    try {
      const [firstName, ...rest] = name.trim().split(/\s+/);
      const lastName = rest.join(' ');

      await signUp(email, password, firstName || '', lastName || '', smsOptIn);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not available after sign up');

      let pendingRef: { referral_code: string; email: string; affiliate_id?: string } | null = null;

      if (refAffiliate) {
        pendingRef = {
          referral_code: refAffiliate.referral_code,
          email: refAffiliate.email,
          affiliate_id: refAffiliate.id,
        };
      } else {
        try {
          const saved = sessionStorage.getItem('pending_ref');
          if (saved) pendingRef = JSON.parse(saved);
        } catch {
          // ignore
        }
      }

      const profileUpdate: Record<string, any> = {
        terms_agreed_at: new Date().toISOString(),
        phone: smsOptIn ? phone : null,
      };
      if (pendingRef) {
        profileUpdate.referral_code = pendingRef.referral_code;
        profileUpdate.referred_by_email = pendingRef.email;
      }

      await supabase.from('profiles').update(profileUpdate).eq('id', user.id);

      if (pendingRef) {
        try {
          await trackReferralSignup(pendingRef.affiliate_id || '', user.id, pendingRef.referral_code);
        } catch (insErr) {
          console.warn('Referral pending insert failed (continuing):', insErr);
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      let msg = 'Registration failed. Please try again.';
      const s = String(err?.message || '');
      if (s.includes('already registered')) msg = 'This email is already registered. Please sign in instead.';
      else if (s.includes('valid email')) msg = 'Please enter a valid email address.';
      else if (s.includes('at least 6 characters')) msg = 'Password must be at least 6 characters long.';
      setError(msg);
      setShowTerms(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineTerms = () => setShowTerms(false);

  if (showTerms) {
    return <TermsAgreement onAccept={handleAcceptTerms} onDecline={handleDeclineTerms} />;
  }

  const affiliateDisplayName = (() => {
    if (!refAffiliate) return referralCode || '';
    const full = [refAffiliate.first_name || '', refAffiliate.last_name || ''].filter(Boolean).join(' ');
    if (full) return full;
    return refAffiliate.name || referralCode;
  })();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <img
            src="https://static.wixstatic.com/media/4e16d8_2bc53abfd032465b84ad153b2ebcff3a~mv2.png"
            alt="Wellness Logo"
            className="h-12 w-auto mx-auto"
          />
          <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-1 text-center text-sm text-gray-600">
            Begin your wellness journey with Siena
          </p>

          {refChecked && referralCode && (
            <div className="mt-2 text-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-green/10 text-brand-green">
                Referred by: {affiliateDisplayName}
              </span>
            </div>
          )}
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Inputs unchanged */}
          <div className="space-y-3">
            <div>
              <label htmlFor="name" className="sr-only">
                Full name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full rounded-md border-0 py-1.5 pl-8 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green text-sm"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 pl-8 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="block w-full rounded-md border-0 py-1.5 pl-8 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="sr-only">
                Phone number
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="block w-full rounded-md border-0 py-1.5 pl-8 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green text-sm"
                  placeholder="Phone number (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="smsOptIn"
                name="smsOptIn"
                type="checkbox"
                checked={smsOptIn}
                onChange={(e) => setSmsOptIn(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green mt-1"
              />
              <label htmlFor="smsOptIn" className="ml-2 block text-sm text-gray-600">
                I agree to receive account-related text messages (e.g., signup confirmations, login links, reminders).
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              Continue
            </Button>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-brand-green hover:text-brand-green/80">
                Sign in
              </Link>
            </p>
          </div>
        </form>

        <div className="text-center space-y-6 mt-20">
          <p className="text-sm text-gray-500">Made With Love By Siena</p>
          <img
            src="https://static.wixstatic.com/media/4e16d8_2bc53abfd032465b84ad153b2ebcff3a~mv2.png"
            alt="Siena Wellness"
            className="h-8 w-auto mx-auto"
          />
        </div>
      </div>
    </div>
  );
}
