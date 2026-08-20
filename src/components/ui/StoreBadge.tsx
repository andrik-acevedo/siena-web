// Shared App Store / Google Play badge.
//
// Extracted from the home page so the landing page and the invite page render
// an identical control. Uses the official artwork rather than a drawn
// approximation: both stores require their badge to appear unmodified.
//
// Both source images are 849x283, so a fixed height with width:auto preserves
// the 3:1 ratio and keeps a pair of badges aligned. Explicit width/height
// reserve space so nothing shifts as they load.

export const APP_STORE_URL = 'https://apps.apple.com/app/id6786386711';
export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.siena.wellness';

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
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block rounded-xl focus-visible:outline focus-visible:outline-2
                  focus-visible:outline-offset-4 focus-visible:outline-brand-green
                  hover:opacity-85 transition-opacity duration-200 cursor-pointer
                  motion-reduce:transition-none ${className}`}
    >
      <img
        src={isIOS ? '/badges/app-store.png' : '/badges/google-play.png'}
        alt={isIOS ? 'Download Siena on the App Store' : 'Get Siena on Google Play'}
        width={849}
        height={283}
        loading="lazy"
        decoding="async"
        className="h-[56px] w-auto"
      />
    </a>
  );
}
