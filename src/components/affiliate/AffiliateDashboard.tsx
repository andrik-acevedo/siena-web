import { useEffect, useState, useMemo } from 'react';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';
import {
  Users,
  DollarSign,
  TrendingUp,
  Percent,
  Link as LinkIcon,
  CheckCircle,
  Copy,
  Share2,
  Target,
  AlertTriangle,
  Send,
  Mail,
  RefreshCw,
} from 'lucide-react';
import Button from '../ui/Button';

/* ----------------------------- Types ----------------------------- */
type AffiliateRow = {
  id: string;                 // affiliates.id (UUID)
  email: string;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  referral_code: string | null;     // e.g., "max-riv-vioe"
  commission_rate: number | null;   // either 0.25 or 25 depending on DB
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ReferralRow = {
  id: string;
  affiliate_id: string | null;
  user_id: string | null;
  referral_code: string | null;
  status: 'pending' | 'converted';
  payment_amount: number | null;       // USD decimal
  commission_amount: number | null;    // USD decimal
  conversion_date: string | null;
  created_at: string;
};

/* ---------------------------- Helpers ---------------------------- */

function siteOrigin() {
  const envBase = (import.meta as any)?.env?.VITE_PUBLIC_SITE_URL || '';
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return envBase.replace(/\/$/, '') || 'https://hellosiena.com';
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-')
    .slice(0, 20);
}

function shortId(id: string) {
  // stable short suffix from UUID
  return id.replace(/-/g, '').slice(0, 6);
}

/**
 * Create a unique referral code (best effort client-side).
 * Tries base forms and appends a short id suffix to ensure uniqueness.
 */
async function generateUniqueReferralCode(aff: AffiliateRow): Promise<string> {
  const baseName =
    aff.name ||
    [aff.first_name || '', aff.last_name || ''].filter(Boolean).join(' ') ||
    aff.email?.split('@')[0] ||
    'siena-aff';

  const base = slugify(baseName) || 'siena-aff';
  const candidates = [
    base,
    `${base}-${shortId(aff.id)}`,
    `${base}-${Math.random().toString(36).slice(2, 6)}`,
  ];

  for (const candidate of candidates) {
    const { data, error } = await supabase
      .from('affiliates')
      .select('id')
      .eq('referral_code', candidate)
      .maybeSingle();
    if (error) {
      // If we can't check, just use a suffix candidate
      return `${base}-${shortId(aff.id)}`;
    }
    if (!data || data.id === aff.id) return candidate;
  }
  return `${base}-${shortId(aff.id)}`;
}

/* ---------------------------- Component --------------------------- */
export default function AffiliateDashboard() {
  const { userData } = useUser();

  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const [affiliate, setAffiliate] = useState<AffiliateRow | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const [hasApplication, setHasApplication] = useState(false);
  const [applicationStatus, setApplicationStatus] =
    useState<'pending' | 'approved' | 'rejected' | null>(null);

  const [copied, setCopied] = useState(false);

  // newly added referral state + totals
  const [refs, setRefs] = useState<ReferralRow[]>([]);
  const [totals, setTotals] = useState({
    totalReferrals: 0,
    conversions: 0,
    conversionRate: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    const run = async () => {
      if (!userData?.email) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setFatalError(null);

      try {
        // 1) application (non-fatal if missing)
        const { data: apps } = await supabase
          .from('affiliate_applications')
          .select('status')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (apps && apps.length) {
          setHasApplication(true);
          setApplicationStatus(apps[0].status as any);
        }

        // 2) affiliate row (required to show dashboard)
        const { data: row, error } = await supabase
          .from('affiliates')
          .select('*')
          .eq('email', userData.email)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          if (error.message?.includes('does not exist')) {
            setFatalError('Affiliate system is being set up. Please contact support.');
          }
          setAffiliate(null);
          return;
        }

        if (!row) {
          setAffiliate(null);
          return;
        }

        const aff = row as AffiliateRow;
        setAffiliate(aff);

        // 2b) if missing referral_code, try to create one now (best-effort)
        if (!aff.referral_code) {
          setGeneratingCode(true);
          setGenError(null);
          try {
            const code = await generateUniqueReferralCode(aff);
            const defaultRate = aff.commission_rate ?? 0.25; // don’t overwrite if already set
            const { data: updated, error: uerr } = await supabase
              .from('affiliates')
              .update({
                referral_code: code,
                commission_rate: defaultRate,
              })
              .eq('id', aff.id)
              .select('*')
              .single();

            if (uerr) throw uerr;
            setAffiliate(updated as AffiliateRow);
          } catch (e: any) {
            console.error('referral_code generation failed:', e);
            setGenError('We could not generate your referral link automatically. Please contact support.');
          } finally {
            setGeneratingCode(false);
          }
        }

        // 3) fetch this affiliate's referrals
        const { data: rdata, error: rerr } = await supabase
          .from('affiliate_referrals')
          .select(
            'id,affiliate_id,user_id,referral_code,status,payment_amount,commission_amount,conversion_date,created_at'
          )
          .eq('affiliate_id', aff.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!rerr && rdata) {
          setRefs(rdata as ReferralRow[]);
          const totalReferrals = rdata.length;
          const conversions = rdata.filter((r) => r.status === 'converted').length;
          const totalEarnings = rdata.reduce(
            (sum, r) => sum + (Number(r.commission_amount) || 0),
            0
          );
          const conversionRate = totalReferrals
            ? Math.round((conversions / totalReferrals) * 100)
            : 0;

          setTotals({ totalReferrals, conversions, conversionRate, totalEarnings });
        }
      } catch (e) {
        console.error(e);
        setFatalError('Failed to load affiliate data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [userData?.email, userData?.id]);

  const fullName = [affiliate?.first_name, affiliate?.last_name].filter(Boolean).join(' ');
  const displayName = affiliate?.name ?? (fullName || 'Affiliate');

  // Normalize commission rate: if >1 treat as percent already; else fraction
  const normalizedRatePct = useMemo(() => {
    const raw = affiliate?.commission_rate ?? 0.25; // default to 25%
    return raw > 1 ? Math.round(raw) : Math.round(raw * 100);
  }, [affiliate?.commission_rate]);

  const code = affiliate?.referral_code || '';
  const referralLink = useMemo(() => {
    if (!code) return '';
    const base = siteOrigin();
    return `${base}/?ref=${code}`;  // Use root path instead of /login
  }, [code]);

  // ----- NEW: unified disclosure + share/copy text -----
  const disclosure = useMemo(
    () =>
      `Here’s my referral link. If you sign up through it, I may earn a small commission (at no extra cost to you). Thank you for supporting my work! You can also access Siena directly at https://www.hellosiena.com.`,
    []
  );

  const shareText = useMemo(() => {
    if (!referralLink) return '';
    return `${disclosure}\n\n${referralLink}`;
  }, [disclosure, referralLink]);

  const copyLink = async () => {
    if (!shareText) return;
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // Fallback for older browsers / environments
      const ta = document.createElement('textarea');
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shareLink = () => {
    if (!referralLink) return;
    if (navigator.share) {
      navigator.share({ title: 'Join Siena', text: shareText, url: referralLink });
    } else {
      void copyLink();
    }
  };

  const emailUs = () => {
    const subject = encodeURIComponent('Affiliate Program Application Request');
    const body = encodeURIComponent(
      `Hello,

I’m interested in the Siena's affiliate program.

Name: ${userData?.first_name || ''} ${userData?.last_name || ''}
Email: ${userData?.email || ''}

Thanks!`
    );
    window.location.href = `mailto:info@lovediscovery.org?subject=${subject}&body=${body}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-green" />
        </div>
      </div>
    );
  }

  if (fatalError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header />
        <Card className="text-center">
          <IconCircle>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </IconCircle>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">System Setup in Progress</h2>
          <p className="text-gray-600 mb-6">{fatalError}</p>
          <Button onClick={() => window.location.reload()} className="bg-brand-green text-white">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // not an affiliate yet
  if (!affiliate) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header />
        {hasApplication && (
          <div
            className={`mb-8 p-6 rounded-lg border ${
              applicationStatus === 'approved'
                ? 'bg-green-50 border-green-200'
                : applicationStatus === 'pending'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <p className="font-medium">
              Application status: {applicationStatus?.[0]?.toUpperCase() + applicationStatus?.slice(1)}
            </p>
            {applicationStatus === 'approved' && (
              <div className="mt-3">
                <Button onClick={() => window.location.reload()} className="bg-brand-green text-white">
                  Refresh Page
                </Button>
              </div>
            )}
          </div>
        )}

        <Card className="text-center">
          <IconCircle>
            <Users className="h-8 w-8 text-brand-green" />
          </IconCircle>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            {hasApplication ? 'Affiliate Program Status' : 'Join Our Professional Network'}
          </h2>
          {!hasApplication ? (
            <a
              href="/affiliate/apply"
              className="inline-block bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white px-8 py-4 rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              <Send className="h-5 w-5 mr-2 inline" />
              Apply to Join Program
            </a>
          ) : (
            <button onClick={emailUs} className="text-brand-green hover:underline inline-flex items-center">
              <Mail className="h-4 w-4 mr-1" /> Contact us
            </button>
          )}
        </Card>
      </div>
    );
  }

  // affiliate dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Header title={`Welcome back, ${displayName}`} subtitle="Affiliate Dashboard" />

      {/* Stats from referrals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Stat icon={<Users className="h-6 w-6 text-brand-green" />} label="Total Referrals" value={totals.totalReferrals} />
        <Stat icon={<TrendingUp className="h-6 w-6 text-green-600" />} label="Conversions" value={totals.conversions} />
        <Stat icon={<Percent className="h-6 w-6 text-yellow-600" />} label="Conversion Rate" value={`${totals.conversionRate}%`} />
        <Stat
          icon={<DollarSign className="h-6 w-6 text-purple-600" />}
          label="Total Earnings"
          value={`$${totals.totalEarnings.toFixed(2)}`}
        />
      </div>

      {/* Referral link */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <LinkIcon className="h-5 w-5 mr-2 text-brand-green" />
          Your Referral Link
        </h2>

        {!code ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded p-4 flex items-center justify-between">
            <div className="mr-4">
              {genError ? (
                <p className="text-sm">{genError}</p>
              ) : (
                <p className="text-sm">
                  {generatingCode ? 'Generating your referral link…' : 'Your referral link is being generated.'}
                </p>
              )}
            </div>
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
              className="border-yellow-400 text-yellow-700"
              disabled={generatingCode}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        ) : (
          <>
            {/* DISCLOSURE ABOVE THE LINK */}
            <p className="text-sm text-gray-700 mb-3">
              Here’s my referral link. If you sign up through it, I may earn a small commission (at no extra cost to you).
              Thank you for supporting my work! You can also access Siena directly at{' '}
              <a
                href="https://www.hellosiena.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-green underline"
              >
                www.hellosiena.com
              </a>.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <code className="text-sm text-gray-800 break-all">{referralLink}</code>
                <div className="flex space-x-2 ml-4">
                  <Button onClick={copyLink} size="sm" className="bg-brand-green text-white">
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy message
                      </>
                    )}
                  </Button>
                  <Button onClick={shareLink} size="sm" variant="outline" className="border-brand-green text-brand-green">
                    <Share2 className="h-4 w-4 mr-1" /> Share
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              You earn a {normalizedRatePct}% commission on paid plans purchased via your link.
            </p>
          </>
        )}
      </Card>

      {/* Recent Referrals */}
      <Card className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Referrals</h3>

        {refs.length === 0 ? (
          <div className="text-center py-10">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No referrals yet</p>
            <p className="text-sm text-gray-500 mt-2">Share your link to start earning commissions</p>
          </div>
        ) : (
          <div className="divide-y border rounded-lg">
            {refs.slice(0, 10).map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    {r.status === 'converted' ? 'Converted' : 'Pending'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Referred on {new Date(r.created_at).toLocaleString()}
                    {r.conversion_date && ` • Converted on ${new Date(r.conversion_date).toLocaleString()}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Commission</p>
                  <p className="text-lg font-semibold">
                    {r.status === 'converted' ? `$${(Number(r.commission_amount) || 0).toFixed(2)}` : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* -------------------------- tiny UI helpers -------------------------- */
function Header({
  title = 'Affiliate Program',
  subtitle = 'Professional referral program',
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
      <div className="relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{title}</h1>
        <p className="text-lg text-white/80">{subtitle}</p>
      </div>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${className}`}>{children}</div>;
}

function IconCircle({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 mb-6">{children}</div>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
