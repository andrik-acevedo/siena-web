import { supabase } from './supabase';

export interface Affiliate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  referral_code: string;
  commission_rate: number;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface AffiliateReferral {
  id: string;
  affiliate_id: string;
  user_id: string;
  referral_code: string;
  signup_date: string;
  conversion_date?: string;
  payment_amount?: number;
  commission_amount?: number;
  status: 'pending' | 'converted' | 'paid';
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AffiliateStats {
  total_referrals: number;
  pending_referrals: number;
  converted_referrals: number;
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  conversion_rate: number;
}

/**
 * Get affiliate by referral code
 */
export async function getAffiliateByCode(code: string): Promise<Affiliate | null> {
  try {
    const { data, error } = await supabase
      .from('affiliates')
      .select('id, first_name, last_name, email, referral_code, commission_rate, is_active, is_approved, created_at, updated_at')
      .eq('referral_code', code)
      .eq('is_active', true)
      .eq('is_approved', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No affiliate found
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting affiliate by code:', error);
    return null;
  }
}

/**
 * Track a new referral signup
 */
export async function trackReferralSignup(
  affiliateId: string,
  userId: string,
  referralCode: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('affiliate_referrals')
      .insert([{
        affiliate_id: affiliateId,
        user_id: userId,
        referral_code: referralCode,
        status: 'pending'
      }]);

    if (error) throw error;

    // Also update the user's profile with the referral code
    await supabase
      .from('profiles')
      .update({ referral_code: referralCode })
      .eq('id', userId);

  } catch (error) {
    console.error('Error tracking referral signup:', error);
    throw error;
  }
}

/**
 * Track a conversion (trial to paid)
 */
export async function trackReferralConversion(
  userId: string,
  paymentAmount: number,
  stripeSubscriptionId?: string
): Promise<void> {
  try {
    // Get the referral record for this user
    const { data: referrals, error: referralError } = await supabase
      .from('affiliate_referrals')
      .select(`
        *,
        affiliates!inner(commission_rate)
      `)
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (referralError) {
      console.error('Error fetching referral:', referralError);
      return;
    }

    if (!referrals || referrals.length === 0) {
      console.log('No pending referral found for user:', userId);
      return;
    }

    const referral = referrals[0];

    // Calculate commission
    const commissionRate = referral.affiliates.commission_rate;
    const commissionAmount = paymentAmount * commissionRate;

    // Update the referral record
    const { error: updateError } = await supabase
      .from('affiliate_referrals')
      .update({
        status: 'converted',
        conversion_date: new Date().toISOString(),
        payment_amount: paymentAmount,
        commission_amount: commissionAmount,
        stripe_subscription_id: stripeSubscriptionId
      })
      .eq('id', referral.id);

    if (updateError) throw updateError;

    console.log(`Tracked conversion for user ${userId}: $${paymentAmount} payment, $${commissionAmount} commission`);
  } catch (error) {
    console.error('Error tracking referral conversion:', error);
    console.log('Continuing without affiliate tracking...');
  }
}

/**
 * Get affiliate statistics
 */
export async function getAffiliateStats(affiliateEmail: string): Promise<AffiliateStats> {
  try {
    // Get affiliate ID
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('id')
      .eq('email', affiliateEmail)
      .single();

    if (affiliateError) throw affiliateError;

    // Get referral statistics
    const { data: referrals, error: referralsError } = await supabase
      .from('affiliate_referrals')
      .select('*')
      .eq('affiliate_id', affiliate.id);

    if (referralsError) throw referralsError;

    const totalReferrals = referrals.length;
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
    const convertedReferrals = referrals.filter(r => r.status === 'converted' || r.status === 'paid').length;
    
    const totalEarnings = referrals
      .filter(r => r.commission_amount)
      .reduce((sum, r) => sum + (r.commission_amount || 0), 0);
    
    const pendingEarnings = referrals
      .filter(r => r.status === 'converted' && r.commission_amount)
      .reduce((sum, r) => sum + (r.commission_amount || 0), 0);
    
    const paidEarnings = referrals
      .filter(r => r.status === 'paid' && r.commission_amount)
      .reduce((sum, r) => sum + (r.commission_amount || 0), 0);

    const conversionRate = totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0;

    return {
      total_referrals: totalReferrals,
      pending_referrals: pendingReferrals,
      converted_referrals: convertedReferrals,
      total_earnings: totalEarnings,
      pending_earnings: pendingEarnings,
      paid_earnings: paidEarnings,
      conversion_rate: conversionRate
    };
  } catch (error) {
    console.error('Error getting affiliate stats:', error);
    throw error;
  }
}

/**
 * Get affiliate referrals with user details
 */
export async function getAffiliateReferrals(affiliateEmail: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('affiliate_referrals')
      .select(`
        *,
        profiles!inner(first_name, last_name, email, subscription_status, subscription_tier),
        affiliates!inner(email)
      `)
      .eq('affiliates.email', affiliateEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting affiliate referrals:', error);
    throw error;
  }
}

/**
 * Mark commissions as paid
 */
export async function markCommissionsAsPaid(referralIds: string[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('affiliate_referrals')
      .update({ status: 'paid' })
      .in('id', referralIds);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking commissions as paid:', error);
    throw error;
  }
}