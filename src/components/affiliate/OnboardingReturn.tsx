import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function OnboardingReturn() {
  const navigate = useNavigate();
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);

  const params = new URLSearchParams(window.location.search);
  const emailParam = params.get("email");   // passed by the function (optional)
  const accountParam = params.get("account"); // also optional

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email ?? null;
      setSignedInEmail(email);

      // If they're signed in as the same email that onboarded in Stripe, just go to the dashboard.
      if (
        email &&
        emailParam &&
        email.toLowerCase() === emailParam.toLowerCase()
      ) {
        navigate("/affiliate", { replace: true });
      }
    })();
  }, [emailParam, navigate]);

  const signOutAndLogin = async () => {
    await supabase.auth.signOut();
    const returnTo = encodeURIComponent("/affiliate");
    window.location.href = `/login?returnTo=${returnTo}`;
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white border rounded-xl shadow p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">All set! 🎉</h1>
        <p className="text-gray-600">
          If you finished Stripe’s onboarding, you can close this tab.
          We’ll mark your account payout-ready shortly.
        </p>

        {emailParam && (
          <p className="text-xs text-gray-500 mt-3">
            Stripe Account: <code>{accountParam || "—"}</code> • Email:{" "}
            <code>{emailParam}</code>
          </p>
        )}

        {/* If someone else is signed in in this browser, guide them to switch */}
        {signedInEmail && emailParam && signedInEmail.toLowerCase() !== emailParam.toLowerCase() && (
          <div className="mt-4 p-3 rounded bg-yellow-50 text-yellow-800 text-sm">
            You’re signed in as <strong>{signedInEmail}</strong>, but the
            onboarding link was for <strong>{emailParam}</strong>. You can still
            continue, or sign out and switch accounts.
          </div>
        )}

        <div className="mt-6 space-x-3">
          <Link
            to="/affiliate"
            className="inline-flex items-center px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Go to Affiliate Home
          </Link>
          {signedInEmail && emailParam && signedInEmail.toLowerCase() !== emailParam.toLowerCase() && (
            <button
              onClick={signOutAndLogin}
              className="inline-flex items-center px-4 py-2 rounded-md border text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              Sign out & switch
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
