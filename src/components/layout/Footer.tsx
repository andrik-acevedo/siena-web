import { useState } from 'react';
import { Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <footer className="w-full mt-auto bg-[#03274B] border-t border-gray-200/10 px-2 sm:px-4 lg:px-8 lg:pl-72 z-10 relative">
      <div className="max-w-7xl mx-auto py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs sm:text-sm text-gray-300 text-center md:text-left">
            © {new Date().getFullYear()} Siena · All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6">
            <Link to="/privacy" className="text-xs sm:text-sm text-gray-300 hover:text-gray-100 whitespace-nowrap">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-xs sm:text-sm text-gray-300 hover:text-gray-100 whitespace-nowrap">
              Terms of Service
            </Link>
            <button
              onClick={() => setShowDisclaimer(true)}
              className="inline-flex items-center text-xs sm:text-sm text-gray-300 hover:text-gray-100 whitespace-nowrap"
            >
              <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Legal Disclaimer
            </button>
          </div>
        </div>
      </div>

      {showDisclaimer && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDisclaimer(false)}
            />
            <div className="relative transform overflow-hidden rounded-lg bg-[#03274B] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
              <div className="bg-[#03274B] px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-2xl font-semibold leading-6 text-white mb-1">
                    Siena — Legal Disclaimer
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Owned & operated by Your Life Consulting, LLC
                  </p>

                  <div className="mt-4 space-y-6 text-sm text-gray-300">
                    <section>
                      <h4 className="font-medium text-white mb-2">1) Purpose of Siena</h4>
                      <p>
                        Siena is a self-guided wellness and relationship support tool. It is designed to help
                        users reflect, build skills, and track progress through non-clinical features such as
                        journaling, mood tracking, and guided prompts. Siena is an adjunct to therapy—not a
                        replacement for professional care, treatment, or diagnosis.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-medium text-white mb-2">2) Not Medical or Therapeutic Advice</h4>
                      <p>
                        Content within Siena (including AI-generated reflections) is for informational and
                        educational purposes only. It does not constitute medical advice, psychotherapy, or a
                        treatment plan. Always seek the advice of a qualified clinician for questions regarding
                        a mental or physical health condition.
                      </p>
                      <p className="mt-2">
                        <span className="font-semibold text-white">Emergency/Crisis:</span> Siena is not intended for emergencies.
                        If you are in crisis or considering self-harm, call 911 (or your local emergency number)
                        or contact your nearest crisis resource immediately.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-medium text-white mb-2">3) Privacy & HIPAA</h4>
                      <p>
                        Siena is not a HIPAA-covered entity and is not a medical record system. Information you
                        enter into Siena is not considered Protected Health Information (PHI) under HIPAA.
                        We prioritize privacy-by-design: we limit what we collect, separate account details from
                        in-app content, and never sell your personal data.
                      </p>
                      <p className="mt-2">
                        For details on collection, use, and controls, please review our{' '}
                        <Link to="/privacy" className="text-brand-green hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </section>

                    <section>
                      <h4 className="font-medium text-white mb-2">4) Affiliates & Clinician Use</h4>
                      <p>
                        Clinicians and partners may recommend Siena as an optional, self-guided tool. Use of
                        Siena is voluntary and independent from clinical services. Siena is not a patient portal
                        and does not create a clinician–patient relationship. Affiliates do not supervise or
                        review user activity within Siena unless the user chooses to share it outside of the app.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-medium text-white mb-2">5) Data Security</h4>
                      <p>
                        We use reasonable administrative, technical, and physical safeguards to protect data.
                        However, no method of transmission or storage is completely secure, and we cannot
                        guarantee absolute security.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-medium text-white mb-2">6) Limitation of Liability</h4>
                      <p>
                        Your Life Consulting, LLC (Siena), its affiliates, and partners are not liable for any
                        losses or damages arising from use of Siena or reliance on content within it. Use is at
                        your own risk and subject to our{' '}
                        <Link to="/terms-of-service" className="text-brand-green hover:underline">
                          Terms of Service
                        </Link>
                        .
                      </p>
                    </section>

                    <section>
                      <h4 className="font-medium text-white mb-2">7) Eligibility & Access</h4>
                      <p>
                        Siena is intended for users aged 18+. We may modify features, pricing, or availability,
                        and may suspend or terminate accounts for violations of our Terms of Service.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-medium text-white mb-2">8) Branding & Ownership</h4>
                      <p>
                        Siena is a product of Your Life Consulting, LLC and is distinct from any clinical practice.
                        References to therapy or clinicians are for context only and do not imply Siena functions
                        as a clinical service or medical record system.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-medium text-white mb-2">9) Contact</h4>
                      <p>
                        Questions about this disclaimer or Siena? Email{' '}
                        <a href="mailto:support@hellosiena.com" className="text-brand-green hover:underline">
                          support@hellosiena.com
                        </a>
                        .
                      </p>
                    </section>
                  </div>
                </div>
              </div>

              <div className="bg-[#021E3C] px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-[#03274B] px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300/20 hover:bg-[#03274B]/80 sm:mt-0 sm:w-auto"
                  onClick={() => setShowDisclaimer(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
