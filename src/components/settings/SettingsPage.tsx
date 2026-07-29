import React, { useState, useEffect } from 'react';
import {
  Bell, Lock, User, Shield, Mail, AlertCircle, Star, Users, Copy, Check, MessageSquare,
} from 'lucide-react';
import Button from '../ui/Button';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { supabase } from '../../lib/supabase';
import { sendInviteSMS, isPhoneNumber } from '../../lib/messaging';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DisplayNameSettings from './DisplayNameSettings';
import AvatarSettings from './AvatarSettings';
import PartnerSection from './PartnerSection'; // ✅ NEW

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}
type InvitedUser = { id: string; first_name: string | null; last_name: string | null; email: string | null; created_at: string; };
type MinimalProfile = { id: string; email: string | null; display_name: string | null };

export default function SettingsPage() {
  const { userData, updateUserData } = useUser();
  const { currentPlan } = useSubscription();

  const [isLoading, setIsLoading] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedInviteCode, setCopiedInviteCode] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [loadingInvitedUsers, setLoadingInvitedUsers] = useState(false);
  const [inviteTarget, setInviteTarget] = useState('');

  // --- Linked-with banner (RPC-backed) ---
  const [myInviter, setMyInviter] = useState<MinimalProfile | null>(null);
  const [loadingInviter, setLoadingInviter] = useState(false);

  const loadMyInviter = async () => {
    if (!userData?.invited_by) {
      setMyInviter(null);
      return;
    }
    setLoadingInviter(true);
    const { data, error } = await supabase.rpc('get_my_inviter');
    setLoadingInviter(false);
    if (error) {
      console.error('get_my_inviter error', error);
      setMyInviter(null);
      return;
    }
    setMyInviter((data && data[0]) || null);
  };

  useEffect(() => {
    if (userData?.invited_by) loadMyInviter();
    else setMyInviter(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.invited_by]);

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: 'exercise_reminders', title: 'Exercise Reminders', description: 'Get notified about your scheduled exercises and activities', enabled: true },
    { id: 'mood_tracking', title: 'Mood Tracking', description: 'Daily reminders to track your mood and emotional state', enabled: true },
    { id: 'affirmations', title: 'Daily Affirmations', description: 'Receive your personalized daily affirmations', enabled: true },
    { id: 'session_updates', title: 'Session Updates', description: 'Updates about your upcoming therapy sessions', enabled: true },
  ]);

  const toggleNotification = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)));
  };

  const handleInputChange = (field: string, value: string) => {
    updateUserData({ [field]: value });
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period.')) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to cancel subscription');
      }

      const { message, cancelAt } = await response.json();
      setSuccessMessage(`${message}. Your subscription will remain active until ${new Date(cancelAt).toLocaleDateString()}.`);
      updateUserData({ subscription_status: 'canceling' });
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getAccountStatusMessage = (ud: any) => {
    if (!ud) return 'Loading account status...';

    const isPersonalClient = Boolean(ud.personal_client);

    if (isPersonalClient) {
      const daysLeft = calculateDaysRemaining(ud.trial_expiration);
      return `Personal Client Access - ${daysLeft || 0} days remaining (expires ${new Date(ud.trial_expiration).toLocaleDateString()})`;
    }

    if (ud.subscription_status === 'active' && !isPersonalClient) {
      if (ud.trial_end) {
        const trialDaysLeft = calculateDaysRemaining(ud.trial_end);
        if (trialDaysLeft && trialDaysLeft > 0) {
          return `Trial Period - ${trialDaysLeft} days remaining until ${new Date(ud.trial_end).toLocaleDateString()}`;
        }
      }
      const nextBillingDate = ud.trial_end ? new Date(ud.trial_end) : new Date();
      nextBillingDate.setDate(nextBillingDate.getDate() + 30);
      const daysUntilBilling = calculateDaysRemaining(nextBillingDate.toISOString());
      return `Active Paid Subscription - Next billing in ${daysUntilBilling || 0} days (${nextBillingDate.toLocaleDateString()})`;
    }

    return 'No active subscription';
  };

  const getPlanBadge = () => {
    switch (currentPlan) {
      case 'premium':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-black">Premium</span>;
      case 'plus':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#01B1AF] text-white">Plus</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500 text-white">Basic</span>;
    }
  };

  const copyInviteLink = async () => {
    if (!userData?.invite_code) return;
    const inviteLink = `${window.location.origin}/invite?code=${userData.invite_code}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedInviteCode(true);
      setTimeout(() => setCopiedInviteCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy invite link:', err);
      setError('Failed to copy invite link');
    }
  };

  const sendEmailOrSmsInvite = async () => {
    if (!inviteTarget.trim()) {
      setError('Please enter an email address or phone number');
      return;
    }
    if (!userData?.invite_code) {
      setError('No invite code available');
      return;
    }

    setIsSendingInvite(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const target = inviteTarget.trim();
      const isPhone = isPhoneNumber(target);

      if (isPhone) {
        const smsResult = await sendInviteSMS(target, userData.invite_code);
        if (smsResult.success) {
          setSuccessMessage(`✅ SMS invite sent to ${target}!`);
          toast.success(`SMS invite sent to ${target}!`);
        } else {
          setError(`❌ Failed to send SMS: ${smsResult.error || 'Unknown error'}`);
          toast.error('Failed to send SMS invite');
        }
      } else {
        const response = await fetch('/.netlify/functions/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target, inviteCode: userData.invite_code }),
        });

        if (!response.ok) {
          setError('❌ Failed to send email invite. Please try again or share your invite link manually.');
        } else {
          setSuccessMessage(`✅ Email invite sent to ${target}!`);
          toast.success(`Email invite sent to ${target}!`);
        }
      }

      setInviteTarget('');
      loadInvitedUsers();
    } catch (err) {
      console.error('Error processing invite:', err);
      setError(err instanceof Error ? err.message : 'Failed to process invite');
      toast.error('Failed to process invite');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const loadInvitedUsers = async () => {
    if (!userData?.id) return;

    setLoadingInvitedUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, created_at')
        .eq('invited_by', userData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitedUsers(data || []);
    } catch (err) {
      console.error('Error loading invited users:', err);
      setError('Failed to load invited users');
    } finally {
      setLoadingInvitedUsers(false);
    }
  };

  const disconnectInvitedUser = async (targetUserId: string, userEmail: string | null) => {
    if (!confirm(`Are you sure you want to disconnect ${userEmail ?? 'this user'}? They will lose premium access and be downgraded to basic.`)) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/disconnect-invited-user`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to disconnect user');
      }

      setSuccessMessage(result.message);
      toast.success(`Successfully disconnected ${userEmail ?? 'user'}`);
      loadInvitedUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to disconnect user';
      setError(msg);
      toast.error(msg);
    }
  };

  useEffect(() => {
    if (userData?.can_invite) loadInvitedUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.can_invite, userData?.id]);

  // ---- SAVE CHANGES (email/phone/timezone -> profiles only) ----
  const handleSaveAll = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error('No authenticated user');

      const email = (userData?.email || '').trim().toLowerCase();
      const phone = (userData?.phone || '').trim() || null;
      const timezone = userData?.timezone || 'America/New_York';

      const updates: Record<string, any> = { timezone };
      if (email) updates.email = email;
      if (phone !== undefined) updates.phone = phone;

      const { error: profErr } = await supabase.from('profiles').update(updates).eq('id', uid);
      if (profErr) throw profErr;

      updateUserData(updates);
      toast.success('Settings saved');
      setSuccessMessage('Settings saved');
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Failed to save settings');
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const publicHandle = userData?.display_name || 'Member';
  const publicEmoji = userData?.avatar_emoji || '🌿';
  const avatarUrl = (userData as any)?.avatar_url || null;
  const isPremium = currentPlan === 'premium';
  const canShowInvite = isPremium && userData?.can_invite && !userData?.invited_by;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-[#01B1AF]">Settings</h1>
        <p className="mt-1 text-sm text-white">Manage your account settings and preferences</p>
      </div>

      {/* Summary card with avatar + handle */}
      <div className="bg-[#021E3C] p-6 rounded-lg border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={publicHandle} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl leading-none">{publicEmoji}</span>
              )}
            </div>
            <div>
              <div className="text-white text-sm opacity-70">Your public handle</div>
              <div className="text-white text-lg font-semibold">{publicHandle}</div>
            </div>
          </div>
          <a href="#handle-settings">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Edit Handle
            </Button>
          </a>
        </div>
      </div>

      {/* Plan banner */}
      <div className="bg-[#021E3C] p-6 rounded-lg border border-[#01B1AF]/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-white">
                Your Plan: {currentPlan?.charAt(0).toUpperCase() + currentPlan?.slice(1)}
              </h2>
              {getPlanBadge()}
            </div>
            <p className="text-gray-300 mt-2">{getAccountStatusMessage(userData)}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/pricing">
              <Button className="w-full md:w-auto">
                <Star className="h-4 w-4 mr-2" />
                {currentPlan === 'basic' ? 'Upgrade Plan' : 'Manage Subscription'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ✅ ALWAYS show Partner section for Premium (invitee or inviter) */}
      <PartnerSection
        onOpenInviteBlock={() => {
          document.querySelector('#invite-users')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onDisconnect={(id, email) => disconnectInvitedUser(id, email)}
      />

      {/* Avatar & Handle settings */}
      <AvatarSettings />
      <div id="handle-settings">
        <DisplayNameSettings />
      </div>

      {/* Invite Users (Premium inviters only) */}
      {canShowInvite && (
        <section id="invite-users" className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-brand-green" />
              Invite Users
              <span className="ml-auto text-sm text-gray-500 font-normal">
                {invitedUsers.length} / 1 invites used
              </span>
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              As a premium user, you can invite up to 1 user to join with premium access.
            </p>

            <div className="mt-6 space-y-6">
              {/* Email/SMS Invite Field */}
              <div className="mt-6">
                <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700">
                  Invite by Email or SMS
                </label>
                <div className="mt-2 flex space-x-2">
                  <input
                    type="text"
                    id="inviteEmail"
                    value={inviteTarget}
                    onChange={(e) => setInviteTarget(e.target.value)}
                    placeholder="email@example.com or +1234567890"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                    disabled={invitedUsers.length >= 1}
                  />
                  <Button
                    onClick={sendEmailOrSmsInvite}
                    className="bg-brand-green text-white flex items-center space-x-1"
                    disabled={isSendingInvite || !inviteTarget.trim() || invitedUsers.length >= 1}
                  >
                    {isSendingInvite ? (
                      'Sending...'
                    ) : (
                      <>
                        {isPhoneNumber(inviteTarget) ? (
                          <MessageSquare className="h-4 w-4" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                        <span>{isPhoneNumber(inviteTarget) ? 'Send SMS' : 'Send Email'}</span>
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyInviteLink} className="flex items-center space-x-1">
                    {copiedInviteCode ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </Button>
                </div>

                {inviteTarget && (
                  <p className="mt-1 text-xs text-gray-500">
                    {isPhoneNumber(inviteTarget)
                      ? '📱 Phone number detected - will send SMS invite'
                      : '📧 Email detected - will send email invite'}
                  </p>
                )}

                {invitedUsers.length >= 1 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      You’ve reached the maximum of 1 invited user. Disconnect the current user to invite someone else.
                    </p>
                  </div>
                )}

                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                {successMessage && <p className="mt-2 text-sm text-green-600">{successMessage}</p>}
              </div>

              {/* Invited Users List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Invited Users</h3>
                  <Button variant="outline" size="sm" onClick={loadInvitedUsers} disabled={loadingInvitedUsers}>
                    {loadingInvitedUsers ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>

                {invitedUsers.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No users invited yet</p>
                    <p className="text-xs mt-1">Share your invite link to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitedUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {(user.first_name ?? '') + ' ' + (user.last_name ?? '')}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => disconnectInvitedUser(user.id, user.email)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Profile / Notifications / Security / Account */}
      <section className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-brand-green" />
            Profile Settings
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                value={userData?.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={userData?.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm text-gray-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">Time Zone</label>
              <select
                id="timezone"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-green focus:ring-brand-green sm:text-sm text-gray-900"
                value={userData?.timezone || 'America/New_York'}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-brand-green" />
            Notification Preferences
          </h2>

          <div className="mt-6 space-y-4">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-center justify-between py-4 border-t border-gray-200 first:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-sm text-gray-500">{n.description}</p>
                </div>
                <button
                  onClick={() => toggleNotification(n.id)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${n.enabled ? 'bg-brand-green' : 'bg-gray-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${n.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-brand-green" />
            Security Settings
          </h2>

          <div className="mt-6 space-y-4">
            <div>
              <Button variant="outline" className="w-full sm:w-auto">
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="mt-1 text-sm text-gray-500">Add an extra layer of security to your account</p>
              <div className="mt-4">
                <Button variant="outline" className="w-full sm:w-auto">
                  Enable Two-Factor Authentication
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-brand-green" />
              Account Management
            </h2>
            {userData?.subscription_status === 'active' && (
              <div className="text-sm text-green-600 font-medium">Active Subscription</div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}

            <div className="rounded-md bg-yellow-50 p-4">
              <div className="ml-0">
                <h3 className="text-sm font-medium text-yellow-800">Account Status</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{getAccountStatusMessage(userData)}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              {userData?.subscription_status === 'active' && (
                <Button
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={handleCancelSubscription}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Cancel Subscription'}
                </Button>
              )}

              <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                Deactivate Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end space-x-4 pt-6">
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button onClick={handleSaveAll} disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>

      <div className="text-center py-6 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          Need help? Contact us at{' '}
          <a
            href="mailto:support@hellosiena.com"
            className="text-[#01B1AF] hover:text-[#019896] underline"
          >
            support@hellosiena.com
          </a>
        </p>
      </div>
    </div>
  );
}
