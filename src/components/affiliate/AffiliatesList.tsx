import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

type AffiliateRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  referral_code: string | null;
  commission_rate: number | null;
  stripe_account_id: string | null;
  is_active: boolean | null;

  // status fields from webhook
  details_submitted?: boolean | null;
  charges_enabled?: boolean | null;
  payouts_enabled?: boolean | null;
  is_payout_ready?: boolean | null;
  stripe_requirements_due?: any | null;
  stripe_requirements_past_due?: any | null;
  stripe_disabled_reason?: string | null;
  last_stripe_sync?: string | null;

  // linkage
  application_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type AppRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: 'pending'|'approved'|'rejected';
};

const PAGE_SIZE = 25;

const Badge = ({ ok, label }: { ok?: boolean | null; label: string }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      ok ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
    }`}
    title={label}
  >
    {label}: {ok ? 'Yes' : 'No'}
  </span>
);

export default function AffiliatesList() {
  const [rows, setRows] = useState<AffiliateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterNotReady, setFilterNotReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const fetchAffiliates = useCallback(async () => {
    setLoading(true);
    try {
      // Basic list; we’ll filter client-side for search + not-ready badge to keep SQL simple.
      const { data, error } = await supabase
        .from('affiliates')
        .select(`
          id,email,first_name,last_name,referral_code,commission_rate,stripe_account_id,is_active,
          details_submitted,charges_enabled,payouts_enabled,is_payout_ready,
          stripe_requirements_due,stripe_requirements_past_due,stripe_disabled_reason,
          application_id,last_stripe_sync,updated_at,created_at
        `)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (error) throw error;
      setRows((data as AffiliateRow[]) || []);
    } catch (e: any) {
      console.error(e);
      toast.error(`Failed to load affiliates: ${e?.message ?? 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);

  const filtered = useMemo(() => {
    let out = rows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(r =>
        (r.email || '').toLowerCase().includes(q) ||
        (r.first_name || '').toLowerCase().includes(q) ||
        (r.last_name || '').toLowerCase().includes(q) ||
        (r.referral_code || '').toLowerCase().includes(q)
      );
    }
    if (filterNotReady) {
      out = out.filter(r => !(r.payouts_enabled && r.details_submitted));
    }
    return out;
  }, [rows, search, filterNotReady]);

  const nextPage = () => setPage(p => p + 1);
  const prevPage = () => setPage(p => Math.max(0, p - 1));

  const prettyCommission = (n: number | null | undefined) =>
    n != null ? `${Math.round((n > 1 ? n : n * 100))}%` : '—';

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied!');
    } catch {
      toast.error('Copy failed');
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await fetchAffiliates();
      toast.success('Refreshed');
    } finally {
      setRefreshing(false);
    }
  };

  // Resend onboarding: try using affiliate.application_id; if missing, locate application by email
  const resendOnboarding = async (row: AffiliateRow) => {
    setResendingId(row.id);
    try {
      let applicationId = row.application_id || null;
      if (!applicationId) {
        const { data: app, error: appErr } = await supabase
          .from('affiliate_applications')
          .select('id')
          .eq('email', row.email)
          .order('created_at', { ascending: false })
          .maybeSingle();
        if (appErr) throw appErr;
        applicationId = (app as AppRow | null)?.id ?? null;
      }

      if (!applicationId) {
        toast.error('No application found for this affiliate email.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('approve-affiliate', {
        body: { applicationId, action: 'approve' } // function is idempotent; will reuse account and email link
      });
      if (error) throw new Error(error.message || 'Failed to resend onboarding');
      if (data?.success) {
        toast.success('Onboarding link sent.');
      } else {
        throw new Error(data?.error || 'Failed to regenerate link');
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to resend onboarding');
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Affiliates</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={refreshing}
              className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            <Link
              to="/admin/affiliate-applications"
              className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              View Applications
            </Link>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md shadow mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-1/2 border rounded-md px-3 py-2"
              placeholder="Search by name, email, or referral code"
            />
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="rounded"
                checked={filterNotReady}
                onChange={e => setFilterNotReady(e.target.checked)}
              />
              Show only NOT payout-ready
            </label>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-md shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Affiliate</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Referral</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Stripe</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No affiliates found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const fullName = [r.first_name, r.last_name].filter(Boolean).join(' ') || '—';
                  return (
                    <tr key={r.id}>
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium text-gray-900">{fullName}</div>
                        <div className="text-gray-600">{r.email}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Created: {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="text-gray-900">
                          Code:{' '}
                          {r.referral_code ? (
                            <button
                              className="underline underline-offset-2 text-indigo-600"
                              onClick={() => copy(r.referral_code!)}
                              title="Copy referral code"
                            >
                              {r.referral_code}
                            </button>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </div>
                        <div className="text-gray-700">
                          Commission: {prettyCommission(r.commission_rate)}
                        </div>
                        <div className="text-gray-700">
                          Active: {r.is_active ? 'Yes' : 'No'}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="text-gray-700">
                          Account:{' '}
                          {r.stripe_account_id ? (
                            <a
                              className="text-indigo-600 underline"
                              target="_blank"
                              rel="noopener noreferrer"
                              href={`https://dashboard.stripe.com/connect/accounts/${r.stripe_account_id}`}
                            >
                              {r.stripe_account_id}
                            </a>
                          ) : (
                            <span className="text-gray-500">Not created</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Last sync: {r.last_stripe_sync ? new Date(r.last_stripe_sync).toLocaleString() : '—'}
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1">
                          <Badge ok={r.details_submitted} label="Details Submitted" />
                          <Badge ok={r.payouts_enabled} label="Payouts Enabled" />
                          <Badge ok={r.charges_enabled} label="Charges Enabled" />
                          <Badge ok={r.is_payout_ready} label="Payout Ready" />
                        </div>
                        {Array.isArray(r.stripe_requirements_past_due) && r.stripe_requirements_past_due.length > 0 && (
                          <div className="mt-2 text-xs text-red-700">
                            Past due:
                            <ul className="list-disc ml-4">
                              {(r.stripe_requirements_past_due as string[]).slice(0, 3).map((k, idx) => (
                                <li key={idx} className="break-words">{k}</li>
                              ))}
                              {r.stripe_requirements_past_due.length > 3 && <li>…</li>}
                            </ul>
                          </div>
                        )}
                        {r.stripe_disabled_reason && (
                          <div className="mt-2 text-xs text-amber-700">
                            Disabled: {r.stripe_disabled_reason}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col items-end gap-2">
                          <Link
                            to={`/admin/review-affiliate?app_id=${encodeURIComponent(r.application_id || '')}`}
                            className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50"
                            onClick={(e) => {
                              if (!r.application_id) {
                                e.preventDefault();
                                toast.error('No linked application id on this affiliate.');
                              }
                            }}
                          >
                            Review
                          </Link>

                          <button
                            onClick={() => resendOnboarding(r)}
                            disabled={resendingId === r.id}
                            className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                            title="Resend Stripe onboarding email"
                          >
                            {resendingId === r.id ? 'Sending…' : 'Resend onboarding'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={prevPage}
            disabled={page === 0}
            className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Prev
          </button>
          <div className="text-gray-600 text-sm">Page {page + 1}</div>
          <button
            onClick={nextPage}
            className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
