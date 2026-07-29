import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Star, X } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { SubscriptionPlan } from '../../types';
import Button from '../ui/Button';

interface BlurredFeatureViewProps {
  featureId: string;
  currentPlan: SubscriptionPlan;
  children: ReactNode;
}

export default function BlurredFeatureView({ 
  featureId, 
  currentPlan, 
  children 
}: BlurredFeatureViewProps) {
  const navigate = useNavigate();
  const { planFeatures } = useSubscription();
  
  const feature = planFeatures.find(f => f.id === featureId);
  
  // Determine which plan is needed for this feature
  const requiredPlan: SubscriptionPlan = 
    feature?.access.plus ? 'plus' : 
    feature?.access.premium ? 'premium' : 'basic';
  
  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const handleClose = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>
      
      {/* Fixed overlay that covers the entire viewport */}
      <div
        className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-8 sm:pt-12 md:pt-16 overflow-y-auto"
        onClick={handleClose}
      >
        <div
          className="bg-[#021E3C] p-6 sm:p-8 rounded-lg shadow-2xl text-center max-w-md mx-4 border border-[#01B1AF]/20 relative mb-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="bg-[#03274B] p-4 rounded-full mb-6 mx-auto w-fit">
            <Lock className="h-8 w-8 text-[#01B1AF]" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-3">
            {feature ? feature.name : 'Premium Feature'}
          </h3>
          
          <p className="text-gray-300 mb-6">
            {feature ? feature.description : 'This feature'} is available with our{' '}
            <span className="text-[#01B1AF] font-semibold">
              {requiredPlan === 'plus' ? 'Plus' : 'Premium'}
            </span>{' '}
            plan.
          </p>
          
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-[#01B1AF] to-[#018A88] hover:from-[#018A88] hover:to-[#01B1AF] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg mb-3"
          >
            <Star className="h-5 w-5 mr-2" />
            Upgrade to {requiredPlan === 'plus' ? 'Plus' : 'Premium'}
          </Button>

          <button
            onClick={handleClose}
            className="w-full text-gray-400 hover:text-white transition-colors text-sm"
          >
            Continue with Basic Plan
          </button>
          
          <p className="text-gray-400 text-sm mt-4">
            Starting at ${requiredPlan === 'plus' ? '9.99' : '14.99'}/month
          </p>
        </div>
      </div>
    </div>
  );
} 