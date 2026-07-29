import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Server, Globe } from 'lucide-react';

// Bump this by hand whenever the policy text changes. Do NOT derive it from
// the current date: that made the page claim it had been revised today, every
// day, and left users with no way to tell when the terms actually changed.
const LAST_UPDATED = 'July 29, 2026';

export default function PrivacyPolicy() {
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
            <Shield className="h-8 w-8 text-brand-green mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Last Updated: {LAST_UPDATED}
          </p>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p>
              Siena, owned and operated by Your Life Consulting, LLC, is designed as a
              self-guided wellness and relationship support tool. It is not a medical
              or mental health provider and does not replace therapy or professional
              care. We take your privacy seriously. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you use our
              platform. Please read this Privacy Policy carefully. If you do not agree
              with the terms, please do not access or use the application.
            </p>

            <div className="my-8 space-y-6">
              {/* Information We Collect */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'information'
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('information')}
                >
                  <div className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    <span>Information We Collect</span>
                  </div>
                  <span>{activeSection === 'information' ? '−' : '+'}</span>
                </button>
                {activeSection === 'information' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Personal Information
                    </h3>
                    <p className="mb-4">
                      We may collect personal information that you voluntarily provide
                      when registering, subscribing, or contacting us. The personal
                      information we collect may include:
                    </p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Name</li>
                      <li>Email address</li>
                      <li>Phone number</li>
                      <li>Password</li>
                      <li>Contact preferences</li>
                      <li>Payment information</li>
                    </ul>

                    <h3 className="font-medium text-gray-900 mb-2">
                      Wellness Information
                    </h3>
                    <p className="mb-4">
                      When using Siena, you may choose to input self-reflection or
                      wellness-related content, such as:
                    </p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Journal entries</li>
                      <li>Mood tracking data</li>
                      <li>Responses to assessments and quizzes</li>
                      <li>Goals and progress information</li>
                      <li>Reflections or notes you enter</li>
                      <li>Conversations with the AI companion</li>
                    </ul>
                    <p className="text-sm text-gray-600 italic">
                      Important: This information is for your personal use only and is
                      not considered part of any medical record. Siena does not provide
                      therapy, diagnosis, or medical treatment.
                    </p>
                  </div>
                )}
              </div>

              {/* How We Use Your Information */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'usage'
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('usage')}
                >
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    <span>How We Use Your Information</span>
                  </div>
                  <span>{activeSection === 'usage' ? '−' : '+'}</span>
                </button>
                {activeSection === 'usage' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p className="mb-4">
                      We use the information we collect for the following purposes:
                    </p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Provide, operate, and maintain Siena</li>
                      <li>Personalize and improve your experience</li>
                      <li>Develop new features and tools</li>
                      <li>
                        Communicate with you about updates, support, and account-related
                        matters
                      </li>
                      <li>Process transactions securely</li>
                      <li>Detect and prevent misuse or fraud</li>
                      <li>
                        Respond to inquiries and improve customer support services
                      </li>
                    </ul>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Wellness Data Usage
                    </h3>
                    <p>
                      Your self-inputted data is used to provide you with personalized
                      insights and reflections. We may use anonymized, aggregated data
                      to improve Siena. We do not sell your personal information.
                    </p>
                  </div>
                )}
              </div>

              {/* Data Security */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'security'
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('security')}
                >
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    <span>Data Security</span>
                  </div>
                  <span>{activeSection === 'security' ? '−' : '+'}</span>
                </button>
                {activeSection === 'security' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p className="mb-4">
                      We implement reasonable administrative, technical, and physical
                      safeguards to protect your information. However, no method of
                      transmission or storage is 100% secure, and we cannot guarantee
                      absolute security.
                    </p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Encryption in transit and at rest</li>
                      <li>Access controls and authentication</li>
                      <li>Monitoring for suspicious activity</li>
                      <li>Regular system updates</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Data Sharing and Disclosure */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'sharing'
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('sharing')}
                >
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    <span>Data Sharing and Disclosure</span>
                  </div>
                  <span>{activeSection === 'sharing' ? '−' : '+'}</span>
                </button>
                {activeSection === 'sharing' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p className="mb-4">We may share information in limited cases:</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>
                        <strong>Service Providers:</strong> For hosting, analytics,
                        payment processing, and AI processing.
                      </li>
                      <li>
                        <strong>Legal Obligations:</strong> When required to comply with
                        law or protect rights/safety.
                      </li>
                      <li>
                        <strong>Business Transfers:</strong> If Siena is acquired,
                        merged, or sold.
                      </li>
                      <li>
                        <strong>With Your Consent:</strong> In any other situation you
                        explicitly agree to.
                      </li>
                    </ul>
                    <p className="mb-4">
                      <strong>Note:</strong> We never sell your journals, moods, or
                      personal reflections, and we never share them with advertisers or
                      data brokers. We do share content with our AI provider where a
                      feature requires it: when you use an AI feature such as chat or a
                      written reflection, the content you provide for that feature is
                      sent to OpenAI, which processes it to return a response and does
                      not use it to train its models.
                    </p>
                  </div>
                )}
              </div>

              {/* Your Rights */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'rights'
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('rights')}
                >
                  <div className="flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    <span>Your Rights</span>
                  </div>
                  <span>{activeSection === 'rights' ? '−' : '+'}</span>
                </button>
                {activeSection === 'rights' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p className="mb-4">
                      Depending on your location, you may have rights such as:
                    </p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Access to your data</li>
                      <li>Request correction or deletion</li>
                      <li>Restrict or object to processing</li>
                      <li>Request portability of your data</li>
                    </ul>
                    <p className="mb-4">
                      To exercise these rights, please contact us at:
                      support@hellosiena.com
                    </p>
                  </div>
                )}
              </div>

              {/* Children's Privacy */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'children'
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('children')}
                >
                  <span>Children's Privacy</span>
                  <span>{activeSection === 'children' ? '−' : '+'}</span>
                </button>
                {activeSection === 'children' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p className="mb-4">
                      Siena is not intended for individuals under 18. We do not
                      knowingly collect personal information from children under 18. If
                      we become aware that such information has been collected, we will
                      delete it promptly.
                    </p>
                  </div>
                )}
              </div>

              {/* Changes */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'changes'
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('changes')}
                >
                  <span>Changes to This Privacy Policy</span>
                  <span>{activeSection === 'changes' ? '−' : '+'}</span>
                </button>
                {activeSection === 'changes' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p>
                      We may update this Privacy Policy from time to time. Updates will
                      be posted on this page with the revised date at the top. Please
                      review periodically for changes.
                    </p>
                  </div>
                )}
              </div>

              {/* Contact */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-4 text-left font-medium ${
                    activeSection === 'contact'
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'bg-white text-gray-900'
                  }`}
                  onClick={() => toggleSection('contact')}
                >
                  <span>Contact Us</span>
                  <span>{activeSection === 'contact' ? '−' : '+'}</span>
                </button>
                {activeSection === 'contact' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p>
                      If you have questions or suggestions about this Privacy Policy:
                    </p>
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
                By using Siena, you acknowledge that you have read and understood this
                Privacy Policy. Siena is a wellness companion and is not a substitute
                for therapy or medical treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
