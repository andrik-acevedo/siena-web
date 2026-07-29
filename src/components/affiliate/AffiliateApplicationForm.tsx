// src/components/affiliate/AffiliateApplicationForm.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Building,
  FileText,
  Award,
  Users,
  CheckCircle,
  ArrowLeft,
  Send,
  ShieldAlert,
  BadgeCheck,
  Home,
  LayoutDashboard,
  CreditCard,
} from 'lucide-react';
import Button from '../ui/Button';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profession: string;
  practiceName: string;
  practiceAddress: string;
  practiceWebsite: string;
  referralExperience: string; // moved to Additional section
  whyInterested: string;
  additionalInfo: string;
  agreeToTerms: boolean;
  agreeToCommission: boolean;
  agreeToFtc: boolean;
  // Enhanced fields for Stripe onboarding
  bankAccountExists: boolean;
  taxIdType: 'ssn' | 'ein' | '';
  businessType: 'individual' | 'company' | '';
  dateOfBirth: string;      // required for any Individual
  businessEin: string;      // required for Company
}

interface ApplicationRow {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  profession: string | null;

  // Legacy/optional columns kept in the table (we simply don't write to them)
  license_number?: string | null;
  license_state?: string | null;
  years_experience?: string | null;
  estimated_referrals?: string | null;

  practice_name: string | null;
  practice_address: string | null;
  practice_website: string | null;
  referral_experience: string | null;
  why_interested: string | null;
  additional_info: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
  terms_accepted?: boolean | null;
  terms_accepted_at?: string | null;
  terms_version?: string | null;
  // Enhanced fields
  bank_account_exists?: boolean | null;
  tax_id_type?: string | null;
  business_type?: string | null;
  date_of_birth?: string | null;
  business_ein?: string | null;
  terms_accepted_user_agent?: string | null;

  // Optional: prior agreement fields (if you add them later)
  agreed_terms?: boolean | null;
  agreed_commission?: boolean | null;
  agreed_ftc?: boolean | null;
  agreed_terms_version?: string | null;
  agreed_terms_at?: string | null;
  agreed_user_agent?: string | null;
}

const PROFESSION_OPTIONS = [
  { value: 'therapist', label: 'Licensed Therapist (LMFT, LCSW, LPC, etc.)' },
  { value: 'psychologist', label: 'Psychologist (PhD, PsyD)' },
  { value: 'psychiatrist', label: 'Psychiatrist (MD)' },
  { value: 'physician', label: 'Physician (MD, DO)' },
  { value: 'nurse-practitioner', label: 'Nurse Practitioner' },
  { value: 'wellness-coach', label: 'Wellness Coach' },
  { value: 'life-coach', label: 'Life Coach' },
  { value: 'counselor', label: 'Licensed Counselor' },
  { value: 'social-worker', label: 'Licensed Social Worker' },
  { value: 'other-healthcare', label: 'Other Healthcare Provider' },
  { value: 'human-resources', label: 'Human Resources' },
  { value: 'office-manager', label: 'Office-manager' },
  { value: 'other-referral', label: 'Other Referral Source' }
];

// Bump this whenever you materially change the Affiliate Terms
const TERMS_VERSION = '2025-09-03';

export default function AffiliateApplicationForm() {
  const navigate = useNavigate();
  const { userData } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingApplication, setExistingApplication] = useState<ApplicationRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<ApplicationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profession: '',
    practiceName: '',
    practiceAddress: '',
    practiceWebsite: '',
    referralExperience: '',
    whyInterested: '',
    additionalInfo: '',
    agreeToTerms: false,
    agreeToCommission: false,
    agreeToFtc: false,
    // Enhanced fields
    bankAccountExists: false,
    taxIdType: '',
    businessType: '',
    dateOfBirth: '',
    businessEin: ''
  });

  const [acceptanceChecked, setAcceptanceChecked] = useState(false);
  const [acceptanceSubmitting, setAcceptanceSubmitting] = useState(false);

  // enforce reading terms (scroll to end)
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const termsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (userData?.id) {
      checkExistingApplication();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id]);

  const checkExistingApplication = async () => {
    if (!userData?.id) {
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('affiliate_applications')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116') {
          // table not created yet
        } else {
          throw error;
        }
      }

      if (data && data.length > 0) {
        const app = data[0] as ApplicationRow;
        setExistingApplication(app);
        setFormData({
          firstName: app.first_name ?? '',
          lastName: app.last_name ?? '',
          email: app.email ?? '',
          phone: app.phone ?? '',
          profession: app.profession ?? '',
          practiceName: app.practice_name ?? '',
          practiceAddress: app.practice_address ?? '',
          practiceWebsite: app.practice_website ?? '',
          referralExperience: app.referral_experience ?? '',
          whyInterested: app.why_interested ?? '',
          additionalInfo: app.additional_info ?? '',
          // core checkboxes as pre-agreed if existing (we keep your prior behavior)
          agreeToTerms: true,
          agreeToCommission: true,
          agreeToFtc: false,
          // Enhanced fields
          bankAccountExists: app.bank_account_exists ?? false,
          taxIdType: (app.tax_id_type as 'ssn' | 'ein') ?? '',
          businessType: (app.business_type as 'individual' | 'company') ?? '',
          dateOfBirth: app.date_of_birth ?? '',
          businessEin: app.business_ein ?? ''
        });
      }
    } catch (error) {
      console.error('checkExistingApplication error', error);
      toast.error('Failed to load existing application data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ApplicationData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value as any }));
  };

  // Validation updated: removed yearsExperience & estimatedReferrals
  const validateForm = (): string | null => {
    const required: (keyof ApplicationData)[] = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'profession',
      'whyInterested',
      'businessType'
    ];

    for (const field of required) {
      const v = formData[field];
      if (!v || (typeof v === 'string' && v.trim() === '')) {
        const label = String(field).replace(/([A-Z])/g, ' $1').toLowerCase();
        return `Please fill in the ${label} field`;
      }
    }

    if (!formData.agreeToTerms) return 'Please agree to the terms and conditions';
    if (!formData.agreeToCommission) return 'Please agree to the commission structure';
    if (!formData.agreeToFtc) return 'Please agree to provide FTC disclosures when sharing your affiliate link';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address';

    // Business-type specifics
    if (formData.businessType === 'individual') {
      if (!formData.taxIdType) return 'Please select a tax ID type for an individual account';
      if (!formData.dateOfBirth) return 'Date of birth is required for individual accounts';
    } else if (formData.businessType === 'company') {
      if (formData.taxIdType !== 'ein') return 'Company/LLC/Corporation accounts must use EIN';
      const ein = formData.businessEin.trim();
      if (!ein) return 'EIN is required for company accounts';
      const einRegex = /^\d{2}-\d{7}$/;
      if (!einRegex.test(ein)) return 'EIN format must be XX-XXXXXXX';
    }

    return null;
  };

  const normalizeUrl = (url: string): string => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
    return trimmed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData?.id) {
      toast.error('Please log in to submit an application');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const applicationData = {
        user_id: userData.id,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        profession: formData.profession,
        // Removed legacy fields (we’ll leave them NULL in DB): license_number, license_state, years_experience, estimated_referrals
        practice_name: formData.practiceName.trim() || null,
        practice_address: formData.practiceAddress.trim() || null,
        practice_website: normalizeUrl(formData.practiceWebsite) || null,
        referral_experience: formData.referralExperience.trim() || null,
        why_interested: formData.whyInterested.trim(),
        additional_info: formData.additionalInfo.trim() || null,
        status: 'pending' as const,
        // Enhanced fields (sanitized)
        bank_account_exists: !!formData.bankAccountExists,
        tax_id_type: formData.taxIdType || null,
        business_type: formData.businessType || null,
        date_of_birth:
          formData.businessType === 'individual'
            ? (formData.dateOfBirth || null)
            : null,
        business_ein:
          formData.businessType === 'company'
            ? (formData.businessEin.trim() || null)
            : null
      };

      const { data: saved, error: upsertErr } = existingApplication
        ? await supabase
            .from('affiliate_applications')
            .update(applicationData)
            .eq('id', existingApplication.id)
            .select()
            .single()
        : await supabase
            .from('affiliate_applications')
            .insert([applicationData])
            .select()
            .single();

      if (upsertErr) {
        console.error('Supabase upsert error:', upsertErr);
        throw upsertErr;
      }

      if (!existingApplication && saved) {
        try {
          const res = await fetch('/.netlify/functions/send-affiliate-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ application: saved })
          });

          let json: any = null;
          try {
            json = await res.json();
          } catch {
            /* ignore parse error */
          }

          if (res.ok && json?.success) {
            toast.success("Application submitted successfully! We'll review it and will let you know as soon as we can.");
          } else {
            console.error('notify failed', { status: res.status, json });
            toast.success('Application submitted. (Email notification may have failed.)');
          }
        } catch (err) {
          console.error('notify threw', err);
          toast.success('Application submitted. (Email notification may have failed.)');
        }
      } else {
        toast.success(existingApplication ? 'Application updated successfully!' : 'Application submitted successfully!');
      }

      setSubmitted(true);
      setExistingApplication(saved ?? existingApplication);
    } catch (error: any) {
      console.error('submit error', error);
      if (error?.message?.includes('duplicate key')) {
        toast.error('An application with this email already exists.');
      } else if (error?.message?.includes('not authenticated')) {
        toast.error('Please log in to submit an application.');
      } else if (error?.message?.includes('relation') && error.message?.includes('does not exist')) {
        toast.error('The affiliate applications system is not set up yet.');
      } else if (error?.code === 'PGRST116') {
        toast.error('The affiliate applications table does not exist. Please contact support.');
      } else {
        toast.error(`Failed to submit application: ${error?.message || 'Please try again.'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const acceptAffiliateTerms = async () => {
    if (!existingApplication) return;
    if (!acceptanceChecked) {
      toast.error('Please check the box to confirm you agree to the Affiliate Terms & Conditions.');
      return;
    }
    if (!scrolledToEnd) {
      toast.error('Please scroll to the bottom of the Affiliate Terms before accepting.');
      return;
    }

    setAcceptanceSubmitting(true);
    try {
      const payload: Partial<ApplicationRow> = {
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        terms_version: TERMS_VERSION,
        terms_accepted_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 255) : null
      };

      const { data, error } = await supabase
        .from('affiliate_applications')
        .update(payload)
        .eq('id', existingApplication.id)
        .select()
        .single();

      if (error) {
        console.warn('terms acceptance persist error (continuing anyway):', error);
      } else if (data) {
        setExistingApplication(prev => (prev ? { ...prev, ...data } : prev));
      }

      toast.success('Thanks! Affiliate Terms accepted.');
      navigate('/affiliate');
    } catch (err) {
      console.error('acceptAffiliateTerms error', err);
      toast.error('Could not record acceptance. Please try again.');
    } finally {
      setAcceptanceSubmitting(false);
    }
  };

  const onTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setScrolledToEnd(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#03274B] flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-green"></div>
      </div>
    );
  }

  // Submitted confirmation
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#03274B] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#021E3C] rounded-lg p-8 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-brand-green/20 mb-6">
            <CheckCircle className="h-8 w-8 text-brand-green" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-3">Application Submitted!</h2>
          <p className="text-gray-300 mb-6">
            Your affiliate application has been submitted to our team. We'll review your application and get back to you within 2-3 business days.
          </p>
          {existingApplication && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <p className="text-yellow-300 text-sm">
                Status: {existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1)}
              </p>
            </div>
          )}
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => navigate('/affiliate')}
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Back to Affiliate Dashboard
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Back to Siena Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Approved → Terms gate
  if (existingApplication && existingApplication.status !== 'rejected') {
    if (existingApplication.status === 'approved') {
      const alreadyAccepted = !!existingApplication.terms_accepted;
      return (
        <div className="min-h-screen bg-[#03274B] py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center gap-6">
              <Link to="/dashboard" className="inline-flex items-center text-sm hover:underline text-brand-green">
                <Home className="h-4 w-4 mr-1" /> Back to Siena Dashboard
              </Link>
              <Link to="/affiliate" className="inline-flex items-center text-sm hover:underline text-brand-green">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Affiliate Dashboard
              </Link>
            </div>

            <div className="bg-[#021E3C] rounded-lg p-8">
              <div className="flex items-center gap-3 mb-2">
                <BadgeCheck className="h-7 w-7 text-brand-green" />
                <h1 className="text-2xl font-bold text-white">Affiliate Approval</h1>
              </div>
              <p className="text-gray-300 mb-6">
                Congratulations — your application has been approved! Before accessing your referral tools, please review and accept the Affiliate Terms &amp; Conditions.
              </p>

              <div className="bg-[#03274B] border border-white/10 rounded-lg">
                <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-brand-green" />
                  <h2 className="text-white font-semibold">Affiliate Terms &amp; Conditions</h2>
                </div>

                <div
                  ref={termsRef}
                  onScroll={onTermsScroll}
                  className="p-6 max-h-[420px] overflow-y-auto text-gray-300 text-sm leading-relaxed space-y-5"
                >
                  {/* Terms content (unchanged) */}
                  <section>
                    <h3 className="text-white font-medium mb-2">1) Program Role &amp; Positioning</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Siena</strong> is a self-guided wellness and relationship support tool. It can be used as an adjunct to therapy but it is not a replacement for professional care or medical treatment.
                      </li>
                      <li>
                        Affiliates must present Siena as a non-clinical, optional resource. Siena is not a patient portal and does not create a clinician–patient relationship.
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-white font-medium mb-2">2) Ethical Promotion &amp; FTC Compliance</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Affiliates agree to promote Siena truthfully and ethically, in compliance with applicable advertising laws and professional standards.</li>
                      <li>
                        Clear and conspicuous <strong>FTC disclosures</strong> are required when affiliate links or incentives are present (e.g., "I may earn a commission if you subscribe through my link.").
                      </li>
                      <li>Affiliates will not make therapeutic claims, guarantees of outcomes, or imply Siena provides medical or psychotherapeutic treatment.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-white font-medium mb-2">3) Privacy &amp; HIPAA</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Siena is not a HIPAA-covered entity and is not a medical record system.</li>
                      <li>Affiliates do not access user data within Siena unless users choose to share information outside the app. Do not request screenshots or private logs from users.</li>
                      <li>
                        Refer users to the <Link to="/privacy" className="text-brand-green underline">Privacy Policy</Link> for details on data practices.
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-white font-medium mb-2">4) Branding &amp; Materials</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Affiliates may use Siena-provided assets (logos, copy, images) as-is. Modifications or new claims require written approval.</li>
                      <li>Do not create domains, ads, or profiles that could be confused with official Siena channels.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-white font-medium mb-2">5) Commission, Payouts &amp; Taxes</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Standard commission: <strong>25%</strong> on paid subscriptions attributed to your unique link.</li>
                      <li>Minimum payout threshold: <strong>$25</strong>. New conversions are subject to a <strong>30-day holding period</strong>.</li>
                      <li>Payouts occur monthly. Affiliates are responsible for any required tax forms and reporting.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-white font-medium mb-2">6) Restrictions</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>No paid search bidding on "Siena," "Hello Siena," or confusingly similar terms.</li>
                      <li>No spam, unsolicited messages, or misleading promotional tactics.</li>
                      <li>No claims that Siena is covered by insurance, HIPAA, or functions as a medical record system.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-white font-medium mb-2">7) Termination</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Siena may suspend or terminate affiliate participation for policy violations, misuse of brand assets, deceptive practices, or conduct that may harm Siena's reputation.
                      </li>
                      <li>Upon termination, affiliates must discontinue use of Siena brand materials and links.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-white font-medium mb-2">8) Liability</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Your Life Consulting, LLC (Siena) is responsible for operating the platform. Affiliates are not liable for app outcomes or user decisions. Use of Siena is governed by the{' '}
                        <Link to="/terms-of-service" className="text-brand-green underline">Terms of Service</Link>.
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-white font-medium mb-2">9) Contact</h3>
                    <p>
                      Questions about the Affiliate Program? Email{' '}
                      <a href="mailto:affiliates@hellosiena.com" className="text-brand-green underline">affiliates@hellosiena.com</a>.
                    </p>
                  </section>
                </div>

                <div className="px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-gray-600 text-brand-green focus:ring-brand-green focus:ring-2 mt-0.5"
                      checked={alreadyAccepted || acceptanceChecked}
                      onChange={(e) => setAcceptanceChecked(e.target.checked)}
                      disabled={alreadyAccepted}
                    />
                    <span className="text-gray-300 text-sm">
                      I have read and agree to the Affiliate Terms &amp; Conditions (version {TERMS_VERSION}).
                    </span>
                  </label>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/affiliate')}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      {alreadyAccepted ? 'Go to Affiliate Dashboard' : 'Cancel'}
                    </Button>
                    <Button
                      onClick={alreadyAccepted ? () => navigate('/affiliate') : acceptAffiliateTerms}
                      disabled={!alreadyAccepted && (!acceptanceChecked || !scrolledToEnd || acceptanceSubmitting)}
                      className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {alreadyAccepted ? 'Continue' : acceptanceSubmitting ? 'Saving...' : 'Accept & Continue'}
                    </Button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                Please scroll through the full terms above. The accept button will enable once you've reached the end.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Pending status
    return (
      <div className="min-h-screen bg-[#03274B] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 flex items-center gap-6">
            <Link to="/dashboard" className="inline-flex items-center text-sm hover:underline text-brand-green">
              <Home className="h-4 w-4 mr-1" /> Back to Siena Dashboard
            </Link>
            <Link to="/affiliate" className="inline-flex items-center text-sm hover:underline text-brand-green">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Affiliate Dashboard
            </Link>
          </div>

          <div className="bg-[#021E3C] rounded-lg p-8 text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-brand-green/20 mb-6">
              <FileText className="h-8 w-8 text-brand-green" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Application Status</h1>

            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 ${
                existingApplication.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : existingApplication.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1)}
            </div>

            <p className="text-gray-300 mb-6">
              {existingApplication.status === 'pending'
                ? "Your affiliate application is currently under review. We'll notify you once a decision has been made."
                : 'Your affiliate application was not approved at this time.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dashboard">
                <Button className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white">
                  <LayoutDashboard className="h-4 w-4 mr-2" /> Back to Siena Dashboard
                </Button>
              </Link>
              <Link to="/affiliate">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Back to Affiliate Dashboard
                </Button>
              </Link>
              {existingApplication.status === 'pending' && (
                <Button
                  onClick={() => {
                    setExistingApplication(null);
                    setSubmitted(false);
                  }}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Edit Application
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // New or rejected → full application form
  return (
    <div className="min-h-screen bg-[#03274B] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/affiliate')}
            className="inline-flex items-center text-sm hover:underline text-brand-green"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Affiliate Dashboard
          </button>
        </div>

        <div className="bg-[#021E3C] rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-brand-green/20 mb-4">
              <Users className="h-8 w-8 text-brand-green" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Affiliate Program Application</h1>
            <p className="text-gray-300">Join our network of healthcare professionals and wellness providers</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-brand-green" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="Your first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="Your last name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="(123) 456-7890"
                    required
                  />
                </div>
              </div>
            </section>

            {/* Professional Information */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-brand-green" /> Professional Information
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Profession *</label>
                  <select
                    value={formData.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    required
                  >
                    <option value="">Select your profession</option>
                    {PROFESSION_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Practice/Organization Information */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-brand-green" /> Practice Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Practice/Organization Name</label>
                  <input
                    type="text"
                    value={formData.practiceName}
                    onChange={(e) => handleInputChange('practiceName', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="Your practice or organization name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Practice Address</label>
                  <textarea
                    value={formData.practiceAddress}
                    onChange={(e) => handleInputChange('practiceAddress', e.target.value)}
                    rows={2}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="Street address, city, state, zip"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Practice Website</label>
                  <input
                    type="text"
                    value={formData.practiceWebsite}
                    onChange={(e) => handleInputChange('practiceWebsite', e.target.value)}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="mywebsite.com or www.mywebsite.com"
                  />
                  <p className="mt-1 text-xs text-gray-400">We'll automatically add https:// if needed</p>
                </div>
              </div>
            </section>

            {/* Payment Information */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-brand-green" /> Payment Information
              </h2>
              <div className="bg-[#03274B] p-6 rounded-lg space-y-4">
                <p className="text-gray-300 text-sm mb-4">
                  This information helps us streamline your payment setup process with Stripe.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Business Type *</label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      required
                    >
                      <option value="">Select business type</option>
                      <option value="individual">Individual (sole proprietor)</option>
                      <option value="company">Company/LLC/Corporation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Tax ID Type {formData.businessType === 'individual' ? '*' : ''}</label>
                    <select
                      value={formData.taxIdType}
                      onChange={(e) => handleInputChange('taxIdType', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    >
                      <option value="">Select tax ID type</option>
                      <option value="ssn">SSN (Social Security Number)</option>
                      <option value="ein">EIN (Employer Identification Number)</option>
                    </select>
                  </div>
                </div>

                {formData.businessType === 'individual' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-400">Required for individual/sole proprietor accounts</p>
                  </div>
                )}

                {formData.businessType === 'company' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">EIN *</label>
                    <input
                      type="text"
                      value={formData.businessEin}
                      onChange={(e) => handleInputChange('businessEin', e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                      placeholder="12-3456789"
                      pattern="\d{2}-\d{7}"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-400">Format: XX-XXXXXXX</p>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.bankAccountExists}
                    onChange={(e) => handleInputChange('bankAccountExists', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-600 text-brand-green focus:ring-brand-green focus:ring-2"
                  />
                  <span className="text-gray-300 text-sm">I have a US bank account for receiving payments</span>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-300 text-xs">
                    <strong>Privacy Note:</strong> This information is only used to pre-populate your Stripe payment setup and speed up the onboarding process. We never store sensitive tax or banking information.
                  </p>
                </div>
              </div>
            </section>

            {/* Additional Information (now includes Previous Referral Experience) */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-brand-green" /> Additional Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Why are you interested in our affiliate program? *
                  </label>
                  <textarea
                    value={formData.whyInterested}
                    onChange={(e) => handleInputChange('whyInterested', e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="Tell us about your interest in Siena and how you see it benefiting your clients"
                    required
                  />
                </div>

                {/* moved from the old Referral section */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Previous Referral Experience</label>
                  <textarea
                    value={formData.referralExperience}
                    onChange={(e) => handleInputChange('referralExperience', e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="Describe your experience with referral programs or partnerships"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Additional Information</label>
                  <textarea
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    placeholder="Any additional information you'd like to share"
                  />
                </div>
              </div>
            </section>

            {/* Program Information */}
            <section className="bg-[#03274B] p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Program Details</h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="font-medium text-white mb-2">Commission Structure</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• 25% commission on all paid subscriptions</li>
                    <li>• Monthly payouts for converted referrals</li>
                    <li>• Minimum payout threshold: $25</li>
                    <li>• 30-day holding period for new conversions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">What We Provide</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Personalized referral link and tracking</li>
                    <li>• Marketing materials and resources</li>
                    <li>• Real-time dashboard with analytics</li>
                    <li>• Dedicated affiliate support</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">Requirements</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Qualified wellness provider</li>
                    <li>• Commitment to ethical referral practices</li>
                    <li>• Alignment with our mission and values</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Agreements */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Agreements</h2>
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    className="h-5 w-5 rounded border-gray-600 text-brand-green focus:ring-brand-green focus:ring-2 mt-0.5"
                    required
                  />
                  <span className="text-gray-300 text-sm">
                    I agree to the{' '}
                    <a
                      href="https://hellosiena.com/affiliate-terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-green underline"
                    >
                      Affiliate Program Terms &amp; Conditions
                    </a>
                    , including ethical referral practices and compliance with all applicable laws and regulations. *
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToCommission}
                    onChange={(e) => handleInputChange('agreeToCommission', e.target.checked)}
                    className="h-5 w-5 rounded border-gray-600 text-brand-green focus:ring-brand-green focus:ring-2 mt-0.5"
                    required
                  />
                  <span className="text-gray-300 text-sm">
                    I understand and agree to the commission structure outlined above. *
                  </span>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToFtc}
                    onChange={(e) => handleInputChange('agreeToFtc', e.target.checked)}
                    className="h-5 w-5 rounded border-gray-600 text-brand-green focus:ring-brand-green focus:ring-2 mt-0.5"
                    required
                  />
                  <span className="text-gray-300 text-sm">
                    I will provide clear FTC disclosure when sharing my affiliate link (e.g., "I may earn a commission if you subscribe through my link.") *
                  </span>
                </label>
              </div>
            </section>

            {/* Submit */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-600">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/affiliate')}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {existingApplication ? 'Update Application' : 'Submit Application'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
