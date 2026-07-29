import { ReactNode } from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import BlurredFeatureView from './BlurredFeatureView';

interface FeatureAccessGuardProps {
  featureId: string;
  children: ReactNode;
  showBlurred?: boolean;
}

export default function FeatureAccessGuard({ 
  featureId, 
  children, 
  showBlurred = true 
}: FeatureAccessGuardProps) {
  const { hasAccess, currentPlan } = useSubscription();
  
  const hasFeatureAccess = hasAccess(featureId);
  
  if (hasFeatureAccess) {
    return <>{children}</>;
  }
  
  if (showBlurred) {
    return (
      <BlurredFeatureView featureId={featureId} currentPlan={currentPlan}>
        {children}
      </BlurredFeatureView>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-[#021E3C] rounded-lg text-center">
      <div className="bg-[#03274B] p-4 rounded-full mb-6">
        <div className="h-12 w-12 text-brand-green">🔒</div>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-3">
        Feature Requires an Upgrade
      </h2>
      
      <p className="text-gray-300 mb-6 max-w-md">
        This feature is available with our {currentPlan === 'basic' ? 'Plus' : 'Premium'} plan.
        Upgrade now to unlock this and other premium features.
      </p>
      
      <button 
        onClick={() => window.location.href = '/pricing'}
        className="bg-[#01B1AF] text-white px-6 py-3 rounded-lg hover:bg-[#018A88] transition-colors"
      >
        Upgrade Now
      </button>
    </div>
  );
}