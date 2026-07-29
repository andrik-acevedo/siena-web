import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

type AppRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: 'pending'|'approved'|'rejected';
  created_at: string;
  business_type?: string | null;
  date_of_birth?: string | null;
};

const PAGE_SIZE = 25;

export default function AffiliateApplicationsList() {
  const [rows, setRows] = useState<AppRow[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('affiliate_applications')
        .select('id,email,first_name,last_name,status,created_at,business_type,date_of_birth')
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (error) throw error;
      setRows((data as AppRow[]) || []);
    } catch (e: any) {
      console.error(e);
      toast.error(`Failed to load applications: ${e?.message ?? 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const prettyStatus = (s: AppRow['status']) =>
    s === 'pending'
      ? 'bg-yellow-100 text-yellow-800'
      : s === 'approved'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Applications</h1>
          <Link to="/admin/affiliates" className="px-3 py-2 rounded-md bg-white border hover:bg-gray-50">
            View Affiliates
          </Link>
        </div>

        <div className="bg-white rounded-md shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Applicant</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">DOB</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading…</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No applications.</td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{r.first_name} {r.last_name}</div>
                      <div className="text-xs text-gray-400">Created: {new Date(r.created_at).toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3">{r.email}</td>
                    <td className="px-4 py-3">{r.business_type || '—'}</td>
                    <td className="px-4 py-3">{r.date_of_birth || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full ${prettyStatus(r.status)}`}>
                        {r.status[0].toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/review-affiliate?app_id=${encodeURIComponent(r.id)}`}
                        className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Prev
          </button>
          <div className="text-gray-600 text-sm">Page {page + 1}</div>
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
