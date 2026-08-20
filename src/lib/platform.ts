// Single source of device detection for the site.
//
// Was duplicated in StoreBadge (desktop vs not) and InvitePage (three-way).
// /download needs the three-way answer too, so it lives here once.
//
// Primary signal is `(pointer: coarse)`, which asks what the input device
// actually is. Viewport width is deliberately not used: a narrow desktop
// window is still a desktop and a large tablet is still touch. User agent
// only distinguishes iOS from Android once we know it is touch, and acts as
// the fallback for browsers that do not report pointer type.

import { useEffect, useState } from 'react';

export type Platform = 'ios' | 'android' | 'desktop';

const COARSE = '(pointer: coarse)';

export function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'desktop';

  const ua = navigator.userAgent || '';
  const isAndroidUA = /Android/i.test(ua);
  // iPadOS 13+ reports as Macintosh, so treat a touch-capable Mac as iOS.
  const isIOSUA =
    /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document);

  let touch: boolean;
  if (window.matchMedia) {
    const mql = window.matchMedia(COARSE);
    // Only trust a positive result; some browsers report no match when they
    // simply do not implement the feature.
    touch = mql.media === COARSE ? mql.matches : isAndroidUA || isIOSUA;
  } else {
    touch = isAndroidUA || isIOSUA;
  }

  if (!touch) return 'desktop';
  if (isAndroidUA) return 'android';
  if (isIOSUA) return 'ios';
  // Touch device we cannot identify: Android is the safer default, since its
  // store page renders usefully on any device whereas the App Store does not.
  return 'android';
}

/** Reactive form. Re-reads on pointer change so a device with both inputs,
 *  or a browser whose query resolves late, is not stuck on its first answer. */
export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>(detectPlatform);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(COARSE);
    const onChange = () => setPlatform(detectPlatform());
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return platform;
}
