import { useEffect, useState } from 'react';
import { Users, X, Plus, RefreshCw, Crown, Share2, ExternalLink } from 'lucide-react';
import Button from '../ui/Button';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { getEffectiveOwnerId, getCoupleSettings, updateCoupleSettings } from '../../lib/coupleActivityApi';
import toast from 'react-hot-toast';

type MinimalProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url?: string | null;
};

export default function PartnerSection({
  onOpenInviteBlock,
  onDisconnect,
}: {
  onOpenInviteBlock?: () => void;
  onDisconnect?: (userId: string, email: string | null) => void;
}) {
  const { userData } = useUser();
  const { currentPlan } = useSubscription();

  const [loading, setLoading] = useState(false);
  const [partner, setPartner] = useState<MinimalProfile | null>(null);
  const [shareEnabled, setShareEnabled] = useState<boolean>(false);
  const [toggling, setToggling] = useState(false);

  const isPremium = currentPlan === 'premium';
  const isInvitee = Boolean(userData?.invited_by);
  const canInvite = Boolean(userData?.can_invite) && !userData?.invited_by;

  const ownerId = getEffectiveOwnerId(userData);

  const load = async () => {
    setLoading(true);
    try {
      if (!isPremium) {
        setPartner(null);
        return;
      }

      // partner identity
      if (isInvitee) {
        const { data, error } = await supabase.rpc('get_my_inviter');
        if (!error && data && data[0]) setPartner(data[0]);
        else setPartner(null);
      } else if (canInvite) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, display_name, avatar_url')
          .eq('invited_by', userData!.id)
          .limit(1)
          .maybeSingle();
        if (!error) setPartner(data || null);
      } else {
        setPartner(null);
      }

      // couple settings (share toggle)
      if (ownerId) {
        const s = await getCoupleSettings(ownerId);
        setShareEnabled(!!s.share_enabled);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to load partner data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id, userData?.invited_by, userData?.can_invite, currentPlan]);

  const toggleShare = async () => {
    if (!ownerId) return;
    setToggling(true);
    try {
      const updated = await updateCoupleSettings(ownerId, { share_enabled: !shareEnabled });
      setShareEnabled(!!updated.share_enabled);
      toast.success(`Sharing ${updated.share_enabled ? 'enabled' : 'disabled'}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to update sharing');
    } finally {
      setToggling(false);
    }
  };

  return (
    <section className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-[#01B1AF]" />
            Partner
          </h2>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>

        {!isPremium ? (
          <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <p className="text-sm text-gray-600">
              Partner linking is a{' '}
              <span className="inline-flex items-center gap-1 font-medium text-yellow-700">
                <Crown className="h-4 w-4" /> Premium
              </span>{' '}
              feature.
            </p>
            <Link to="/pricing">
              <Button className="mt-3">Upgrade to Premium</Button>
            </Link>
          </div>
        ) : partner ? (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                  {partner.avatar_url ? (
                    <img
                      src={partner.avatar_url}
                      alt={partner.display_name || partner.email || 'Partner'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">🌿</span>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">
                    {isInvitee ? 'Linked with' : 'Your invited partner'}
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {partner.display_name || partner.email || '—'}
                  </div>
                </div>
              </div>

              {!isInvitee && onDisconnect && (
                <Button
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => onDisconnect(partner.id, partner.email)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              )}
            </div>

            {/* Share toggle + open tracker */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border border-gray-200 p-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-[#01B1AF] focus:ring-[#01B1AF]"
                  checked={shareEnabled}
                  onChange={toggleShare}
                  disabled={isInvitee || toggling}
                />
                <span className="inline-flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  Share Couple Activity
                </span>
                {isInvitee && (
                  <span className="ml-2 text-xs text-gray-500">(owner controls this)</span>
                )}
              </label>

              <Link to="/couple">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Tracker
                </Button>
              </Link>
            </div>

            {!shareEnabled && isInvitee && (
              <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                Your partner hasn’t enabled sharing yet. You’ll be able to view the tracker once they turn it on.
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <p className="text-sm text-gray-600">
              {isInvitee
                ? 'You were invited to Premium. No partner to manage here.'
                : 'No partner linked yet.'}
            </p>
            {!isInvitee && canInvite && (
              <Button className="mt-3" onClick={onOpenInviteBlock}>
                <Plus className="h-4 w-4 mr-2" />
                Invite Partner
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
