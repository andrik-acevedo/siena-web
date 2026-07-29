// src/components/admin/AdminDashboard.tsx
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users,
  Search,
  ArrowUpDown,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import { getAffiliateStats } from '../../lib/affiliateService';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import { useUser } from '../../context/UserContext';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subscription_status: string;
  trial_start: string | null;
  trial_end: string | null;
  role: string;
  created_at: string;
}

interface AffiliateRow {
  id: string;
  name: string;
  email: string;
  custom_code: string;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

type SortDir = 'asc' | 'desc';

export default function AdminDashboard() {
  const { userData } = useUser();

  // ----- Admin gate (role) -----
  const isAdmin = useMemo(
    () => userData?.role === 'admin' || userData?.email === 'max@lovediscovery.org',
    [userData?.role, userData?.email]
  );

  // ----- State -----
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof User>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDir>('desc');

  const [activeTab, setActiveTab] = useState<'users' | 'affiliates'>('users');

  const [affiliateData, setAffiliateData] = useState<
    (AffiliateRow & {
      stats: {
        total_referrals: number;
        converted_referrals: number;
        total_earnings: number;
        conversion_rate: number;
      };
    })[]
  >([]);

  const [isCreatingAffiliate, setIsCreatingAffiliate] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<string | null>(null);
  const [newAffiliate, setNewAffiliate] = useState({
    name: '',
    email: '',
    custom_code: '',
    commission_rate: 0.1,
  });

  const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null);

  // ----- Effects -----
  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'affiliates') {
      loadAffiliateData();
    }
  }, [activeTab]);

  // ----- Loaders -----
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAffiliateData = async () => {
    try {
      const { data: affiliates, error } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const withStats = await Promise.all(
        (affiliates || []).map(async (row: AffiliateRow) => {
          try {
            const stats = await getAffiliateStats(row.email);
            return {
              ...row,
              stats: {
                total_referrals: stats.total_referrals ?? 0,
                converted_referrals: stats.converted_referrals ?? 0,
                total_earnings: stats.total_earnings ?? 0,
                conversion_rate: stats.conversion_rate ?? 0,
              },
            };
          } catch (e) {
            console.error(`Stats error for ${row.email}:`, e);
            return {
              ...row,
              stats: {
                total_referrals: 0,
                converted_referrals: 0,
                total_earnings: 0,
                conversion_rate: 0,
              },
            };
          }
        })
      );

      setAffiliateData(withStats);
    } catch (error) {
      console.error('Error loading affiliates:', error);
      toast.error('Failed to load affiliates');
    }
  };

  // ----- Affiliate CRUD -----
  const handleCreateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAffiliate) {
        const { error } = await supabase
          .from('affiliates')
          .update({
            name: newAffiliate.name,
            email: newAffiliate.email,
            custom_code: newAffiliate.custom_code,
            commission_rate: newAffiliate.commission_rate,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingAffiliate);

        if (error) throw error;
        toast.success('Affiliate updated');
      } else {
        const { error } = await supabase.from('affiliates').insert([
          {
            name: newAffiliate.name,
            email: newAffiliate.email,
            custom_code: newAffiliate.custom_code,
            commission_rate: newAffiliate.commission_rate,
            is_active: true,
          },
        ]);
        if (error) throw error;
        toast.success('Affiliate created');
      }

      setNewAffiliate({
        name: '',
        email: '',
        custom_code: '',
        commission_rate: 0.1,
      });
      setEditingAffiliate(null);
      setIsCreatingAffiliate(false);
      loadAffiliateData();
    } catch (error: any) {
      console.error('Error saving affiliate:', error);
      if (error?.code === '23505') {
        toast.error('Custom code or email already exists');
      } else {
        toast.error('Failed to save affiliate');
      }
    }
  };

  const handleEditAffiliate = (affiliate: AffiliateRow & any) => {
    setNewAffiliate({
      name: affiliate.name,
      email: affiliate.email,
      custom_code: affiliate.custom_code,
      commission_rate: affiliate.commission_rate,
    });
    setEditingAffiliate(affiliate.id);
    setIsCreatingAffiliate(true);
  };

  const handleDeleteAffiliate = async (id: string) => {
    if (!confirm('Delete this affiliate? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('affiliates').delete().eq('id', id);
      if (error) throw error;
      toast.success('Affiliate deleted');
      loadAffiliateData();
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete affiliate');
    }
  };

  const toggleAffiliateStatus = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ is_active: !current, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      toast.success(!current ? 'Affiliate activated' : 'Affiliate deactivated');
      loadAffiliateData();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update status');
    }
  };

  // ----- User deletion (Edge Function) -----
  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (
      !confirm(
        `Permanently delete user ${userEmail}? This will delete all their data.`
      )
    )
      return;

    setIsDeletingUser(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session');

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        }
      );

      const result = await resp.json();
      if (!resp.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete user');
      }

      toast.success(`Deleted ${userEmail}`);
      loadUsers();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to delete user');
    } finally {
      setIsDeletingUser(null);
    }
  };

  // ----- Sorting / Filtering -----
  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredUsers = users
    .filter((u) => {
      const q = searchTerm.toLowerCase();
      return (
        u.email.toLowerCase().includes(q) ||
        (u.first_name || '').toLowerCase().includes(q) ||
        (u.last_name || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const mod = sortDirection === 'asc' ? 1 : -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * mod;
      }
      return 0;
    });

  // ----- Loading -----
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
      </div>
    );
  }

  // ----- Access gate (visible, not blank) -----
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4">
        <div className="max-w-md w-full rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access denied</h2>
          <p className="text-gray-600">
            This dashboard is restricted to administrators.
          </p>
        </div>
      </div>
    );
  }

  // ----- UI -----
  return (
    <div className="space-y-6">
      {/* Debug (optional) */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-800">Debug</h3>
        <p className="text-sm text-blue-700">User ID: {userData?.id}</p>
        <p className="text-sm text-blue-700">Email: {userData?.email}</p>
        <p className="text-sm text-blue-700">Role: {userData?.role}</p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage users and monitor platform activity
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'users'
              ? 'text-brand-green border-b-2 border-brand-green'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'affiliates'
              ? 'text-brand-green border-b-2 border-brand-green'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('affiliates')}
        >
          Affiliate Management
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-brand-green" />
                <h2 className="text-lg font-medium text-gray-900">User Management</h2>
              </div>
              <div className="text-sm text-brand-green">Total Users: {filteredUsers.length}</div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <Th label="Name" onClick={() => handleSort('first_name')} />
                    <Th label="Email" onClick={() => handleSort('email')} />
                    <Th label="Status" onClick={() => handleSort('subscription_status')} />
                    <Th label="Trial" onClick={() => handleSort('trial_end')} />
                    <Th label="Role" onClick={() => handleSort('role')} />
                    <Th label="Joined" onClick={() => handleSort('created_at')} />
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {u.first_name} {u.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{u.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            u.subscription_status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : u.subscription_status === 'trial'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {u.subscription_status || 'none'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.trial_end ? (
                          <div>
                            <div className="text-sm text-gray-900">
                              {new Date(u.trial_end).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date() > new Date(u.trial_end)
                                ? 'Expired'
                                : `${Math.ceil(
                                    (new Date(u.trial_end).getTime() - Date.now()) /
                                      (1000 * 60 * 60 * 24)
                                  )} days left`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No trial</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          disabled={isDeletingUser === u.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Delete user"
                        >
                          {isDeletingUser === u.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-brand-green" />
                <h2 className="text-lg font-medium text-gray-900">Affiliate Management</h2>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-brand-green">
                  Total Affiliates: {affiliateData.length}
                </div>
                <Button onClick={() => setIsCreatingAffiliate(true)} className="bg-brand-green text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Affiliate
                </Button>
              </div>
            </div>

            {/* Create / Edit */}
            {isCreatingAffiliate && (
              <div className="mb-6 bg-gray-50 p-6 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingAffiliate ? 'Edit Affiliate' : 'Add New Affiliate'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsCreatingAffiliate(false);
                      setEditingAffiliate(null);
                      setNewAffiliate({
                        name: '',
                        email: '',
                        custom_code: '',
                        commission_rate: 0.1,
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateAffiliate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={newAffiliate.name}
                        onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={newAffiliate.email}
                        onChange={(e) => setNewAffiliate({ ...newAffiliate, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Custom Code</label>
                      <input
                        type="text"
                        value={newAffiliate.custom_code}
                        onChange={(e) =>
                          setNewAffiliate({ ...newAffiliate, custom_code: e.target.value.toLowerCase() })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
                        placeholder="e.g., mywebsite"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Used in referral URLs: <code className="font-mono">/register?ref=&lt;code&gt;</code>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Commission Rate</label>
                      <div className="mt-1 relative">
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          value={newAffiliate.commission_rate}
                          onChange={(e) =>
                            setNewAffiliate({ ...newAffiliate, commission_rate: parseFloat(e.target.value) })
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">
                            ({(newAffiliate.commission_rate * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreatingAffiliate(false);
                        setEditingAffiliate(null);
                        setNewAffiliate({
                          name: '',
                          email: '',
                          custom_code: '',
                          commission_rate: 0.1,
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-brand-green text-white">
                      {editingAffiliate ? 'Update Affiliate' : 'Create Affiliate'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Affiliate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {affiliateData.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{a.name}</div>
                          <div className="text-sm text-gray-500">{a.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-green/10 text-brand-green">
                          {a.custom_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(a.commission_rate * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {a.stats.total_referrals}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {a.stats.conversion_rate.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${a.stats.total_earnings.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            a.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {a.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditAffiliate(a)}
                            className="text-brand-green hover:text-brand-green/80"
                            title="Edit affiliate"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleAffiliateStatus(a.id, a.is_active)}
                            className={a.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                            title={a.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {a.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteAffiliate(a.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete affiliate"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {affiliateData.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No affiliates yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first affiliate partner.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setIsCreatingAffiliate(true)} className="bg-brand-green text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Affiliate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Small table header helper
function Th({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <th
      scope="col"
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    </th>
  );
}
