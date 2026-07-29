import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface AffiliateApplication {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profession: string;
  license_number?: string;
  license_state?: string;
  years_experience: string;
  practice_name?: string;
  practice_address?: string;
  practice_website?: string;
  estimated_referrals: string;
  referral_experience?: string;
  why_interested: string;
  additional_info?: string;
  status: 'pending'|'approved'|'rejected';
  created_at: string;
  // Enhanced fields
  business_type?: string;
  tax_id_type?: string;
  date_of_birth?: string;
  business_ein?: string;
  bank_account_exists?: boolean;
}

type AffiliateRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  referral_code: string | null;
  commission_rate: number | null;
  stripe_account_id: string | null;
  is_active: boolean | null;

  // NEW (populated by your Stripe Connect webhook)
  payouts_enabled?: boolean | null;
  details_submitted?: boolean | null;
  charges_enabled?: boolean | null;
};

export default function ReviewApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<AffiliateApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<'approve'|'reject'|'resend'|null>(null);
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [affiliate, setAffiliate] = useState<AffiliateRow | null>(null);

  const appId = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('app_id') || id || '';
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        if (!appId) return;
        const { data, error } = await supabase
          .from('affiliate_applications')
          .select('*')
          .eq('id', appId)
          .single();
        if (error) throw error;
        setApp(data as AffiliateApplication);
      } catch (err: any) {
        console.error(err);
        toast.error(`Failed to load application: ${err?.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [appId]);

  // Load the affiliate row by email so we can show status
  useEffect(() => {
    (async () => {
      if (!app?.email) return;
      const { data } = await supabase
        .from('affiliates')
        .select('id,email,first_name,last_name,referral_code,commission_rate,stripe_account_id,is_active,payouts_enabled,details_submitted,charges_enabled')
        .eq('email', app.email)
        .maybeSingle();
      setAffiliate((data as AffiliateRow) || null);
    })();
  }, [app?.email, app?.status]);

  const approve = async () => {
    if (!app) return;
    setActioning('approve');
    try {
      // Call your Supabase Edge Function directly
      const { data, error } = await supabase.functions.invoke('approve-affiliate', {
        body: {
          applicationId: app.id,
          action: 'approve'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to approve application');
      }

      if (data?.success) {
        setOnboardingUrl(data.onboardingUrl);
        setShowOnboardingModal(true);
        setApp(prev => (prev ? { ...prev, status: 'approved' } : prev));
        
        // Refresh affiliate data
        const { data: refreshedAffiliate } = await supabase
          .from('affiliates')
          .select('id,email,first_name,last_name,referral_code,commission_rate,stripe_account_id,is_active,payouts_enabled,details_submitted,charges_enabled')
          .eq('email', app.email)
          .maybeSingle();
        setAffiliate((refreshedAffiliate as AffiliateRow) || null);
        
        toast.success('Application approved! Stripe onboarding link created.');
      } else {
        throw new Error(data?.error || 'Approval failed');
      }
    } catch (err: any) {
      console.error('Approval error:', err);
      toast.error(err?.message || 'Failed to approve application');
    } finally {
      setActioning(null);
    }
  };

  const resendOnboarding = async () => {
    if (!app) return;
    setActioning('resend');
    try {
      // Call the approve function again - it will reuse existing affiliate record
      const { data, error } = await supabase.functions.invoke('approve-affiliate', {
        body: {
          applicationId: app.id,
          action: 'approve'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to resend onboarding');
      }

      if (data?.success) {
        setOnboardingUrl(data.onboardingUrl);
        setShowOnboardingModal(true);
        toast.success('Onboarding link regenerated.');
      } else {
        throw new Error(data?.error || 'Failed to regenerate onboarding link');
      }
    } catch (err: any) {
      console.error('Resend error:', err);
      toast.error(err?.message || 'Failed to resend onboarding');
    } finally {
      setActioning(null);
    }
  };

  const reject = async () => {
    if (!app) return;
    setActioning('reject');
    try {
      const { data, error } = await supabase.functions.invoke('approve-affiliate', {
        body: {
          applicationId: app.id,
          action: 'reject',
          rejectionReason: 'Application does not meet our requirements'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to reject application');
      }

      if (data?.success) {
        setApp(prev => (prev ? { ...prev, status: 'rejected' } : prev));
        toast.success('Application rejected');
      } else {
        throw new Error(data?.error || 'Rejection failed');
      }
    } catch (err: any) {
      console.error('Rejection error:', err);
      toast.error(err?.message || 'Failed to reject application');
    } finally {
      setActioning(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h2>
          <button
            onClick={() => navigate('/admin')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Back to Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Review Affiliate Application
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  app.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : app.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="px-6 py-6">
            {/* Admin actions */}
            <div className="mb-6 flex flex-wrap gap-3">
              {app.status === 'pending' ? (
                <>
                  <button
                    onClick={approve}
                    disabled={actioning === 'approve'}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {actioning === 'approve' ? 'Approving…' : 'Approve'}
                  </button>
                  <button
                    onClick={reject}
                    disabled={actioning === 'reject'}
                    className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {actioning === 'reject' ? 'Rejecting…' : 'Reject'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={resendOnboarding}
                    disabled={actioning === 'resend'}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {actioning === 'resend' ? 'Sending…' : 'Resend Stripe onboarding'}
                  </button>
                </>
              )}
            </div>

            {/* Affiliate summary */}
            <div className="mb-8 rounded-md border p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Affiliate Summary</h3>
              {affiliate ? (
                <div className="text-sm text-gray-700 space-y-1">
                  <div><span className="font-medium">ID:</span> {affiliate.id}</div>
                  <div>
                    <span className="font-medium">Referral Code:</span>{" "}
                    {affiliate.referral_code || <span className="text-red-600">— missing —</span>}
                  </div>
                  <div>
                    <span className="font-medium">Commission Rate:</span>{" "}
                    {affiliate.commission_rate != null
                      ? `${Math.round((affiliate.commission_rate > 1 ? affiliate.commission_rate : affiliate.commission_rate * 100))}%`
                      : '—'}
                  </div>
                  <div><span className="font-medium">Active:</span> {affiliate.is_active ? 'Yes' : 'No'}</div>
                  <div>
                    <span className="font-medium">Stripe Account:</span>{" "}
                    {affiliate.stripe_account_id || <span className="text-gray-500">Not created yet</span>}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No affiliate row yet.</div>
              )}
            </div>

            {/* Stripe status panel (live from webhook flags) */}
            {affiliate && (
              <div className="mb-8 rounded-md border p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Stripe Onboarding Status</h3>
                <div className="text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Account ID:</span>{" "}
                    {affiliate.stripe_account_id || <span className="text-gray-500">—</span>}
                  </div>
                  <div>
                    <span className="font-medium">Details Submitted:</span>{" "}
                    {affiliate.details_submitted ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="font-medium">Payouts Enabled:</span>{" "}
                    {affiliate.payouts_enabled ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="font-medium">Charges Enabled:</span>{" "}
                    {affiliate.charges_enabled ? "Yes" : "No"}
                  </div>
                </div>

                {!affiliate.payouts_enabled && (
                  <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                    Stripe payouts aren’t enabled yet. Ask the affiliate to finish onboarding
                    using their latest link (or click “Resend Stripe onboarding” above).
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Payment Information Section */}
            {(app.business_type || app.tax_id_type || app.business_ein || app.date_of_birth) && (
              <div className="mb-8 rounded-md border p-4 bg-blue-50">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">Payment Information (For Stripe Pre-population)</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  {app.business_type && <div><span className="font-medium">Business Type:</span> {app.business_type}</div>}
                  {app.tax_id_type && <div><span className="font-medium">Tax ID Type:</span> {app.tax_id_type.toUpperCase()}</div>}
                  {app.business_ein && <div><span className="font-medium">EIN:</span> {app.business_ein}</div>}
                  {app.date_of_birth && <div><span className="font-medium">Date of Birth:</span> {app.date_of_birth}</div>}
                  {app.bank_account_exists !== undefined && (
                    <div><span className="font-medium">Has US Bank Account:</span> {app.bank_account_exists ? 'Yes' : 'No'}</div>
                  )}
                </div>
              </div>
            )}

            {/* Applicant details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">{app.first_name} {app.last_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{app.email}</dd>
                  </div>
                  {app.phone && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="text-sm text-gray-900">{app.phone}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Profession</dt>
                    <dd className="text-sm text-gray-900">{app.profession}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Years of Experience</dt>
                    <dd className="text-sm text-gray-900">{app.years_experience}</dd>
                  </div>
                  {app.license_number && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">License Number</dt>
                      <dd className="text-sm text-gray-900">{app.license_number}</dd>
                    </div>
                  )}
                  {app.license_state && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">License State</dt>
                      <dd className="text-sm text-gray-900">{app.license_state}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Practice Information</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {app.practice_name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Practice Name</dt>
                    <dd className="text-sm text-gray-900">{app.practice_name}</dd>
                  </div>
                )}
                {app.practice_address && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Practice Address</dt>
                    <dd className="text-sm text-gray-900">{app.practice_address}</dd>
                  </div>
                )}
                {app.practice_website && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Website</dt>
                    <dd className="text-sm text-gray-900">
                      <a href={app.practice_website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                        {app.practice_website}
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estimated Monthly Referrals</dt>
                  <dd className="text-sm text-gray-900">{app.estimated_referrals}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Application Details</h3>
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-2">Why are you interested in becoming an affiliate?</dt>
                  <dd className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{app.why_interested}</dd>
                </div>
                {app.referral_experience && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-2">Previous Referral Experience</dt>
                    <dd className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{app.referral_experience}</dd>
                  </div>
                )}
                {app.additional_info && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-2">Additional Information</dt>
                    <dd className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{app.additional_info}</dd>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showOnboardingModal && onboardingUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Onboarding Link Created</h3>
              <p className="text-sm text-gray-600 mb-4">
                The affiliate onboarding link has been created. The affiliate can use this link to complete their Stripe setup.
              </p>
              <div className="bg-gray-50 p-3 rounded mb-4">
                <code className="text-xs break-all">{onboardingUrl}</code>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowOnboardingModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
                <a
                  href={onboardingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-center"
                >
                  View Link
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
