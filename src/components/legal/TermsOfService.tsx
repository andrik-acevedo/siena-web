import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle, Scale, Clock, HelpCircle, Shield } from 'lucide-react';

// Bump this by hand whenever the terms text changes. Do NOT derive it from the
// current date: that made the page claim it had been revised today, every day,
// and left users with no way to tell when the terms actually changed.
const LAST_UPDATED = 'July 29, 2026';

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm hover:underline text-brand-green"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center mb-6">
            <FileText className="h-8 w-8 text-brand-green mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Last Updated: {LAST_UPDATED}
          </p>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              Welcome to Siena, a self-guided wellness and relationship support tool owned and operated by Your Life Consulting, LLC. 
              These Terms of Service (“Terms”) outline your legal rights and responsibilities. 
              By accessing or using Siena, you agree to comply with and be bound by these Terms. 
              If you do not agree, please do not use the platform.
            </p>

            <div className="my-8 space-y-6">
              {/* Agreement to Terms */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'agreement' ? 'bg-brand-green/10 text-brand-green' : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('agreement')}
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    <span>Agreement to Terms</span>
                  </div>
                  <span>{activeSection === 'agreement' ? '−' : '+'}</span>
                </button>
                {activeSection === 'agreement' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p>
                      By using Siena, you agree to these Terms and our Privacy Policy. 
                      We may revise these Terms at any time by updating this page. 
                      Your continued use of the platform following changes means you accept the revised Terms.
                    </p>
                  </div>
                )}
              </div>

              {/* Account Registration */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'account' ? 'bg-brand-green/10 text-brand-green' : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('account')}
                >
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    <span>Account Registration and Security</span>
                  </div>
                  <span>{activeSection === 'account' ? '−' : '+'}</span>
                </button>
                {activeSection === 'account' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p>
                      To use certain features, you may need to register for an account. 
                      You agree to provide accurate information and keep it current. 
                      You are responsible for safeguarding your password and for all activity under your account. 
                      Siena reserves the right to suspend or terminate accounts that violate these Terms.
                    </p>
                  </div>
                )}
              </div>

              {/* Subscription and Billing */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'subscription' ? 'bg-brand-green/10 text-brand-green' : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('subscription')}
                >
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>Subscription and Billing</span>
                  </div>
                  <span>{activeSection === 'subscription' ? '−' : '+'}</span>
                </button>
                {activeSection === 'subscription' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <h3 className="font-medium">Plans & Billing</h3>
                    <p>
                      Siena may offer free or paid plans. Subscriptions automatically renew unless canceled before the billing date. 
                      By subscribing, you authorize recurring charges to your payment method. 
                      No refunds are issued for partial billing periods.
                    </p>
                  </div>
                )}
              </div>

              {/* Acceptable Use */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'acceptable' ? 'bg-brand-green/10 text-brand-green' : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('acceptable')}
                >
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <span>Acceptable Use</span>
                  </div>
                  <span>{activeSection === 'acceptable' ? '−' : '+'}</span>
                </button>
                {activeSection === 'acceptable' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p>
                      You agree not to misuse Siena, including by:
                    </p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Breaking applicable laws or regulations</li>
                      <li>Impersonating others or misrepresenting affiliation</li>
                      <li>Uploading harmful, infringing, or inappropriate content</li>
                      <li>Interfering with others’ use of the platform</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Intellectual Property */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'intellectual' ? 'bg-brand-green/10 text-brand-green' : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('intellectual')}
                >
                  <span>Intellectual Property</span>
                  <span>{activeSection === 'intellectual' ? '−' : '+'}</span>
                </button>
                {activeSection === 'intellectual' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p>
                      Siena and its content are owned by Your Life Consulting, LLC or licensed providers. 
                      You may use Siena for personal, non-commercial purposes only. 
                      Copying, reselling, or redistributing content without permission is prohibited.
                    </p>
                  </div>
                )}
              </div>

              {/* Disclaimer of Warranties */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'disclaimer' ? 'bg-brand-green/10 text-brand-green' : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('disclaimer')}
                >
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    <span>Disclaimer of Warranties</span>
                  </div>
                  <span>{activeSection === 'disclaimer' ? '−' : '+'}</span>
                </button>
                {activeSection === 'disclaimer' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p>
                      Siena is provided “as is” without warranties of any kind. 
                      We do not guarantee uninterrupted or error-free operation, or that the platform will meet your expectations.
                    </p>
                    <h3 className="font-medium">Not a Substitute for Professional Care</h3>
                    <p>
                      Siena is a wellness companion tool, not therapy or medical care. 
                      Always seek guidance from licensed providers for medical or mental health conditions. 
                      The AI features are for self-reflection and education only.
                    </p>
                    <p className="font-medium text-red-600">
                      Siena is not intended for emergencies. If you are in crisis, call 911 or local emergency services.
                    </p>
                  </div>
                )}
              </div>

              {/* Limitation of Liability */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'liability' ? 'bg-brand-green/10 text-brand-green' : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('liability')}
                >
                  <div className="flex items-center">
                    <Scale className="h-5 w-5 mr-2" />
                    <span>Limitation of Liability</span>
                  </div>
                  <span>{activeSection === 'liability' ? '−' : '+'}</span>
                </button>
                {activeSection === 'liability' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p>
                      Siena and its owners, affiliates, and partners are not liable for damages 
                      arising from your use of the platform. Your use of Siena is at your own risk.
                    </p>
                  </div>
                )}
              </div>

              {/* Indemnification */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'indemnification' ? 'bg-brand-green/10 text-brand-green' : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('indemnification')}
                >
                  <span>Indemnification</span>
                  <span>{activeSection === 'indemnification' ? '−' : '+'}</span>
                </button>
                {activeSection === 'indemnification' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p>
                      You agree to indemnify and hold harmless Siena, Your Life Consulting, LLC, and affiliates 
                      from claims or damages resulting from your violation of these Terms or misuse of the platform.
                    </p>
                  </div>
                )}
              </div>

              {/* HIPAA and Privacy */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'hipaa' ? 'bg-brand-green/10 text-brand-green' : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('hipaa')}
                >
                  <span>HIPAA and Privacy</span>
                  <span>{activeSection === 'hipaa' ? '−' : '+'}</span>
                </button>
                {activeSection === 'hipaa' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p>
                      Siena is not a HIPAA-covered entity. Information you enter is not protected health information (PHI) under HIPAA. 
                      Siena should not be used as a medical record system. 
                      Please see our <Link to="/privacy" className="text-brand-green underline">Privacy Policy</Link> for details.
                    </p>
                  </div>
                )}
              </div>

              {/* Governing Law */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'governing' ? 'bg-brand-green/10 text-brand-green' : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('governing')}
                >
                  <span>Governing Law</span>
                  <span>{activeSection === 'governing' ? '−' : '+'}</span>
                </button>
                {activeSection === 'governing' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p>
                      These Terms are governed by the laws of the State of Florida. 
                      Any disputes will be handled exclusively in Miami-Dade County, Florida.
                    </p>
                  </div>
                )}
              </div>

              {/* Termination */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'termination' ? 'bg-brand-green/10 text-brand-green' : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('termination')}
                >
                  <span>Termination</span>
                  <span>{activeSection === 'termination' ? '−' : '+'}</span>
                </button>
                {activeSection === 'termination' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p>
                      We may suspend or terminate your access to Siena at any time for violation of these Terms. 
                      You may request account deletion at any time.
                    </p>
                  </div>
                )}
              </div>

              {/* Contact Us */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'contact' ? 'bg-brand-green/10 text-brand-green' : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('contact')}
                >
                  <span>Contact Us</span>
                  <span>{activeSection === 'contact' ? '−' : '+'}</span>
                </button>
                {activeSection === 'contact' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p>If you have questions about these Terms:</p>
                    <p className="mb-2">
                      <strong>Email:</strong> support@hellosiena.com
                    </p>
                    <p className="mb-2">
                      <strong>Address:</strong> Your Life Consulting, LLC · Miami, FL
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                By using Siena, you acknowledge that you have read and understood these Terms of Service. 
                Siena is a wellness companion and is not a substitute for therapy or medical treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
