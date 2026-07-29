// src/lib/affiliateOnboarding.ts
type OnboardingResp = { url: string; accountId?: string };

// Reuse your helper to POST JSON and capture useful error info
async function postJSON(
  path: string,
  body: any
): Promise<{ ok: boolean; status: number; statusText: string; text: string; json?: any }> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text().catch(() => '');
  let json: any = undefined;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    /* not JSON */
  }
  return { ok: res.ok, status: res.status, statusText: res.statusText, text, json };
}

/**
 * Starts (or resumes) Stripe Express onboarding for an affiliate.
 * IMPORTANT: We intentionally do NOT pass refreshUrl/returnUrl here so the
 * serverless function uses its neutral defaults:
 *   - /affiliate/onboarding/refresh
 *   - /affiliate/onboarding/return
 */
export async function startAffiliateOnboarding(
  affiliateId: string, // kept for future use/logging
  email: string,
  existingStripeId?: string
): Promise<OnboardingResp> {
  const payload = {
    email,
    accountId: existingStripeId || undefined, // reuse Stripe account if we already have it
    sendEmail: true, // let the function optionally email the safe GET link
    // DO NOT pass refreshUrl/returnUrl so we get neutral pages regardless of who is signed in
  };

  const endpointsToTry = [
    '/.netlify/functions/create-affiliate-onboarding', // primary
    '/.netlify/functions/affiliate-onboarding',        // legacy/fallback
    '/api/affiliate-onboarding',                       // local proxy fallback
  ];

  for (const url of endpointsToTry) {
    const r = await postJSON(url, payload);

    if (r.status === 404) continue; // try next candidate

    if (!r.ok) {
      const detail = r.json?.error || r.text || '(no response body)';
      throw new Error(
        `Onboarding function error at ${url}: ${r.status} ${r.statusText} – ${detail}`
      );
    }

    const data = (r.json ?? {}) as OnboardingResp;
    if (!data?.url) {
      throw new Error(`Onboarding function at ${url} did not return a "url".`);
    }
    return data;
  }

  throw new Error(
    `Could not reach an onboarding endpoint. All tried paths returned 404.\n` +
      endpointsToTry.map((u) => ` - ${u}`).join('\n')
  );
}

/**
 * Optional helper if you ever want to generate a “safe” GET link
 * (e.g., to render a button that always mints a fresh Stripe URL).
 * You can email or render this URL: clicking it will 302 to Stripe.
 */
export function buildSafeOnboardingLink(email: string): string {
  const base =
    (import.meta as any)?.env?.VITE_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://hellosiena.com');
  const u = new URL('/.netlify/functions/create-affiliate-onboarding', base);
  u.searchParams.set('email', email);
  return u.toString();
}
