// hellosiena.com/download
//
// A single shareable link that sends each visitor to the right place: iOS to
// the App Store, Android to Google Play, desktop to a QR they can scan.
//
// The redirect uses location.replace rather than assign so /download does not
// land in history; pressing back from the store returns the visitor to
// wherever they came from instead of bouncing them forward again.

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import StoreBadge, { APP_STORE_URL, PLAY_STORE_URL } from '../ui/StoreBadge';
import { usePlatform } from '../../lib/platform';

export default function DownloadPage() {
  const platform = usePlatform();
  const storeUrl =
    platform === 'ios' ? APP_STORE_URL : platform === 'android' ? PLAY_STORE_URL : null;

  useEffect(() => {
    if (storeUrl) window.location.replace(storeUrl);
  }, [storeUrl]);

  // Mobile: the redirect is already in flight. Render a minimal holding state
  // rather than a full page, with a manual link in case it is slow or blocked.
  if (storeUrl) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[15px] text-gray-600 mb-4">Redirecting to the app…</p>
        <a
          href={storeUrl}
          className="text-brand-green font-semibold underline focus-visible:outline
                     focus-visible:outline-2 focus-visible:outline-offset-2
                     focus-visible:outline-brand-green rounded"
        >
          Continue to the {platform === 'ios' ? 'App Store' : 'Google Play'}
        </a>
      </div>
    );
  }

  // Desktop: nowhere useful to redirect to, so this is the whole experience.
  // Minimal single column: headline, one line of context, three benefits, one
  // CTA. The badges open a scannable QR on this platform, which is the fastest
  // route from a desktop to an install.
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg">
        <div className="rounded-3xl bg-white border border-gray-200 shadow-sm px-8 py-10 sm:px-12 sm:py-12 text-center">
          <img
            src="https://static.wixstatic.com/media/4e16d8_2bc53abfd032465b84ad153b2ebcff3a~mv2.png"
            alt="Siena"
            className="mx-auto h-24 w-auto object-contain mb-8"
          />

          <h1 className="text-[30px] leading-[1.15] font-bold text-brand-blue mb-3">
            Download the Siena app now
          </h1>
          <p className="text-[15px] text-gray-600 leading-relaxed max-w-sm mx-auto mb-9">
            Heal, Evolve, Connect. A wellness and relationship companion for
            individuals and couples, built by licensed therapists.
          </p>

          {/* Three benefits, no more. Each maps to what the app actually does. */}
          <ul className="text-left space-y-3.5 mb-10 max-w-xs mx-auto">
            {[
              'Guided journeys, journaling and daily tools',
              'Shared check-ins and quizzes for couples',
              'A written assessment of how you think and relate',
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green"
                />
                <span className="text-[14px] text-gray-700 leading-relaxed">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <StoreBadge href={APP_STORE_URL} platform="ios" />
            <StoreBadge href={PLAY_STORE_URL} platform="android" />
          </div>
          <p className="mt-4 text-[13px] text-gray-500 leading-relaxed">
            Choose a store to show a QR code, then scan it with your phone's camera.
          </p>
        </div>

        <p className="mt-7 text-[12px] text-gray-400 text-center leading-relaxed">
          Siena is a self-guided wellness tool and is not a substitute for
          therapy or medical care.{' '}
          <Link
            to="/"
            className="underline hover:text-gray-600 focus-visible:outline focus-visible:outline-2
                       focus-visible:outline-offset-2 focus-visible:outline-brand-green rounded"
          >
            Back to Siena
          </Link>
        </p>
      </div>
    </div>
  );
}
