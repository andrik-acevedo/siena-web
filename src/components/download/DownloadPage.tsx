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

  // Desktop: nowhere useful to redirect to, so offer the badges. Clicking one
  // opens its QR, which is the fastest route from a desktop to an install.
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 py-14">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-7 sm:p-9 text-center">
          <h1 className="text-[26px] leading-tight font-bold text-brand-blue mb-3">
            Get Siena on your phone
          </h1>
          <p className="text-[15px] text-gray-600 leading-relaxed mb-7">
            Siena is a mobile app. Choose a store below to show a QR code, then
            scan it with your phone's camera to install.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <StoreBadge href={APP_STORE_URL} platform="ios" />
            <StoreBadge href={PLAY_STORE_URL} platform="android" />
          </div>
        </div>

        <p className="mt-7 text-[12px] text-gray-400 text-center leading-relaxed">
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
