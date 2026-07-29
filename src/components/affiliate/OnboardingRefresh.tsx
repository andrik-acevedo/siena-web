import { useEffect, useMemo, useState } from "react";

export default function OnboardingRefresh() {
  const [message] = useState(
    "Your Stripe onboarding link expired or was already used."
  );

  const params = new URLSearchParams(window.location.search);
  const emailParam = params.get("email") || "";

  // This hits your Netlify function GET, which will mint a fresh one-time Stripe link and redirect.
  const regenerateHref = useMemo(() => {
    const base =
      (import.meta as any)?.env?.VITE_PUBLIC_SITE_URL ||
      window.location.origin;
    const url = new URL("/.netlify/functions/create-affiliate-onboarding", base);
    if (emailParam) url.searchParams.set("email", emailParam);
    return url.toString();
  }, [emailParam]);

  useEffect(() => {
    // no-op; could auto-redirect if you want
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white border rounded-xl shadow p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Link expired</h1>
        <p className="text-gray-600">{message}</p>

        <div className="mt-6 space-y-3">
          <a
            href={regenerateHref}
            className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Generate new link
          </a>
          <a
            href={`mailto:support@hellosiena.com?subject=Need%20new%20affiliate%20onboarding%20link${
              emailParam ? `&body=My%20email%3A%20${encodeURIComponent(emailParam)}` : ""
            }`}
            className="inline-flex items-center px-4 py-2 rounded-md border text-emerald-700 border-emerald-300 hover:bg-emerald-50"
          >
            Email us for a fresh link
          </a>
          <div className="text-xs text-gray-500">
            Tip: your admin can resend the onboarding link from the Affiliate Admin screen.
          </div>
        </div>
      </div>
    </div>
  );
}
