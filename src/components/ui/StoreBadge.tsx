// Shared App Store / Google Play badge.
//
// Used by the home hero and the /invite page so the two render an identical
// control. Uses the official artwork rather than a drawn approximation: both
// stores require their badge to appear unmodified.
//
// Behaviour is device-aware. On a phone the badge is an ordinary link straight
// to the store. On a desktop, where that link would open a store page the
// visitor cannot install from, it instead opens a QR code to scan with their
// phone.

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlatform } from '../../lib/platform';

export const APP_STORE_URL = 'https://apps.apple.com/app/id6786386711';
export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.siena.wellness';


function QrModal({
  platform,
  onClose,
}: {
  platform: 'ios' | 'android';
  onClose: () => void;
}) {
  const isIOS = platform === 'ios';
  const storeName = isIOS ? 'App Store' : 'Google Play';
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape to dismiss, and lock background scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Scan to download Siena on the ${storeName}`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue/60 backdrop-blur-sm px-5 py-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-white border border-gray-200 shadow-xl p-7 text-center"
      >
        <p className="text-[11px] font-semibold text-gray-500 tracking-[0.12em] uppercase mb-2">
          {storeName}
        </p>
        <h2 className="text-[20px] font-bold text-brand-blue mb-5">
          Scan to download on your phone
        </h2>

        <div className="rounded-2xl border-2 border-brand-green bg-brand-green/5 p-4 inline-block">
          <img
            src={isIOS ? '/badges/qr-app-store.png' : '/badges/qr-google-play.png'}
            alt={`QR code linking to Siena on the ${storeName}`}
            width={2000}
            height={2000}
            className="w-52 h-52 block"
          />
        </div>

        <p className="mt-5 text-[13px] text-gray-500 leading-relaxed">
          Point your phone's camera at the code, then open the link to install
          Siena from the {storeName}.
        </p>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="mt-6 w-full min-h-[48px] rounded-xl border border-gray-300 text-brand-blue
                     font-semibold text-[15px] hover:bg-gray-50 transition-colors duration-200
                     cursor-pointer focus-visible:outline focus-visible:outline-2
                     focus-visible:outline-offset-2 focus-visible:outline-brand-green"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function StoreBadge({
  href,
  platform,
  className = '',
}: {
  href: string;
  platform: 'ios' | 'android';
  className?: string;
}) {
  const isIOS = platform === 'ios';
  const isDesktop = usePlatform() === 'desktop';
  const [qrOpen, setQrOpen] = useState(false);

  const label = isIOS
    ? 'Download Siena on the App Store'
    : 'Get Siena on Google Play';

  // Both source images are 849x283, so a fixed height with width:auto keeps
  // the 3:1 ratio and aligns a pair. Explicit width/height reserve space.
  const art = (
    <img
      src={isIOS ? '/badges/app-store.png' : '/badges/google-play.png'}
      alt={label}
      width={849}
      height={283}
      loading="lazy"
      decoding="async"
      className="h-[56px] w-auto"
    />
  );

  const shared = `inline-block rounded-xl focus-visible:outline focus-visible:outline-2
                  focus-visible:outline-offset-4 focus-visible:outline-brand-green
                  hover:opacity-85 transition-opacity duration-200 cursor-pointer
                  motion-reduce:transition-none ${className}`;

  const onClose = useCallback(() => setQrOpen(false), []);

  if (isDesktop) {
    return (
      <>
        <button
          type="button"
          onClick={() => setQrOpen(true)}
          aria-haspopup="dialog"
          aria-label={`${label} — show QR code to scan with your phone`}
          className={shared}
        >
          {art}
        </button>
        {qrOpen && <QrModal platform={platform} onClose={onClose} />}
      </>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={shared}>
      {art}
    </a>
  );
}
