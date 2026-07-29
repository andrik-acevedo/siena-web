import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const TERMS_VERSION = '2025-09-03';

export default function AffiliateTermsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from as string | undefined;

  const handleBack = () => {
    // 1) If a “from” route was provided via Link state, go there
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    // 2) If there’s a same-origin referrer or a usable history entry, go back
    const hasSameOriginReferrer =
      document.referrer && document.referrer.startsWith(window.location.origin);

    if (hasSameOriginReferrer || window.history.length > 1) {
      navigate(-1);
      return;
    }

    // 3) Hard fallback (choose your default)
    navigate('/affiliate', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#03274B] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-[#021E3C] rounded-lg p-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-sm hover:underline text-brand-green"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>

          {/* Optional: public-site canonical link */}
          <a
            href="https://hellosiena.com/affiliate-terms"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-brand-green hover:underline"
            title="Open on public site"
          >
            View on hellosiena.com
            <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </div>

        <h1 className="text-2xl font-bold text-white">Affiliate Program Terms &amp; Conditions</h1>
        <p className="text-gray-400 text-sm mt-1 mb-6">Version {TERMS_VERSION}</p>

        <div className="prose prose-invert max-w-none text-gray-200">
          <h2 className="text-white">1) Program Role &amp; Positioning</h2>
          <ul className="list-disc pl-5">
            <li>
              <strong>Siena</strong> is a self-guided wellness and relationship support tool. It can be used as an
              adjunct to therapy, but it is not a replacement for psychotherapy, medical advice, diagnosis, or treatment.
            </li>
            <li>
              Affiliates must present Siena as a <em>non-clinical, optional</em> resource. Siena is not a patient
              portal and does not create a clinician–patient relationship.
            </li>
          </ul>

          <h2 className="text-white">2) Ethical Promotion &amp; FTC Compliance</h2>
          <ul className="list-disc pl-5">
            <li>
              Affiliates agree to promote Siena truthfully and ethically, consistent with applicable advertising laws
              and professional standards (e.g., APA/ACA/NASW).
            </li>
            <li>
              Clear and conspicuous <strong>FTC disclosures</strong> are required whenever affiliate links or
              incentives are used (e.g., “I may earn a commission if you subscribe through my link.”).
            </li>
            <li>
              Do not make therapeutic claims, guarantees of outcomes, or imply Siena provides medical or
              psychotherapeutic treatment.
            </li>
          </ul>

          <h2 className="text-white">3) Privacy &amp; HIPAA</h2>
          <ul className="list-disc pl-5">
            <li>Siena is not a HIPAA-covered entity and is not a medical record system.</li>
            <li>
              Affiliates do not access user data within Siena unless users choose to share information outside the app.
              Do not request screenshots or private logs from users.
            </li>
            <li>
              For data practices, see our{' '}
              <Link to="/privacy" className="text-brand-green underline">
                Privacy Policy
              </Link>
              .
            </li>
          </ul>

          <h2 className="text-white">4) Branding &amp; Materials</h2>
          <ul className="list-disc pl-5">
            <li>
              Affiliates may use Siena-provided assets (logos, copy, images) as-is. Modifications or new claims require
              prior written approval.
            </li>
            <li>Do not create domains, ads, or profiles that could be confused with official Siena channels.</li>
          </ul>

          <h2 className="text-white">5) Commission, Payouts &amp; Taxes</h2>
          <ul className="list-disc pl-5">
            <li>Standard commission: <strong>25%</strong> on paid subscriptions attributed to your unique link.</li>
            <li>Minimum payout threshold: <strong>$10</strong>.</li>
            <li>New conversions carry a <strong>30-day holding period</strong> to reduce chargebacks/fraud.</li>
            <li>Payouts occur monthly. Affiliates are responsible for any required tax forms and reporting.</li>
          </ul>

          <h2 className="text-white">6) Restrictions</h2>
          <ul className="list-disc pl-5">
            <li>No paid-search bidding on “Siena,” “Hello Siena,” or confusingly similar terms.</li>
            <li>No spam, unsolicited messaging, or misleading promotional tactics.</li>
            <li>No claims that Siena is covered by insurance, HIPAA, or functions as a medical record system.</li>
          </ul>

          <h2 className="text-white">7) Separation From Care</h2>
          <ul className="list-disc pl-5">
            <li>Do not require or imply that clients must use Siena for treatment.</li>
            <li>
              If you are a licensed clinician, avoid tying Siena usage to your treatment plan in ways that could create
              a conflict of interest or fee-splitting concerns.
            </li>
            <li>
              Clinicians may share Siena without compensation if they prefer to avoid any perception of conflict of
              interest.
            </li>
          </ul>

          <h2 className="text-white">8) Term &amp; Termination</h2>
          <ul className="list-disc pl-5">
            <li>
              Siena may suspend or terminate affiliate participation for policy violations, misuse of brand assets,
              deceptive practices, or conduct that may harm Siena’s reputation.
            </li>
            <li>Upon termination, affiliates must discontinue use of Siena brand materials and links.</li>
          </ul>

          <h2 className="text-white">9) Liability</h2>
          <ul className="list-disc pl-5">
            <li>
              Your Life Consulting, LLC (Siena) operates the platform. Affiliates are not liable for app outcomes or
              user decisions.
            </li>
            <li>
              Use of Siena is governed by the{' '}
              <Link to="/terms-of-service" className="text-brand-green underline">
                Terms of Service
              </Link>
              .
            </li>
          </ul>

          <h2 className="text-white">10) Contact</h2>
          <p>
            Questions about the Affiliate Program? Email{' '}
            <a href="mailto:affiliates@hellosiena.com" className="text-brand-green underline">
              affiliates@hellosiena.com
            </a>
            .
          </p>
        </div>

        <div className="mt-8 text-xs text-gray-400">
          Last updated: {TERMS_VERSION}. These terms may be updated periodically; material changes will be noted by
          updating the version above.
        </div>
      </div>
    </div>
  );
}
