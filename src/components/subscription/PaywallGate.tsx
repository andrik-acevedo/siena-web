// src/components/subscription/PaywallGate.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "../../context/SubscriptionContext";

type Props = {
  featureId: string;
  title?: string;
  children: React.ReactNode;
  /** set to false to hide instead of blur/overlay */
  showLockedAsBlur?: boolean;
  className?: string; // optional extra classes on wrapper
};

export default function PaywallGate({
  featureId,
  title,
  children,
  showLockedAsBlur = true,
  className = "",
}: Props) {
  const { hasAccess, isLoading } = useSubscription();
  const navigate = useNavigate();

  if (isLoading) return <div className={`relative ${className}`} />;

  const unlocked = hasAccess(featureId);

  if (unlocked) {
    return <div className={className}>{children}</div>;
  }

  // If we want to completely hide locked widgets
  if (!showLockedAsBlur) return null;

  // Otherwise: keep layout, blur content, add overlay
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none opacity-60 blur-[2px] select-none">
        {children}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300/70 bg-white/70 backdrop-blur-sm p-4 text-center">
        <p className="text-sm text-gray-700 font-medium">
          {title || "This feature"} is a <span className="font-semibold">Premium</span> feature.
        </p>
        <button
          onClick={() => navigate(`/pricing?feature=${featureId}`)}
          className="mt-3 inline-flex items-center rounded-lg bg-[#01B1AF] px-4 py-2 text-white text-sm hover:bg-[#018a88] transition-colors"
        >
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
}
