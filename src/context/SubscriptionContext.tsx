import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { SubscriptionPlan, PlanFeature } from '../types';
import { supabase } from '../lib/supabase';

interface SubscriptionContextType {
  currentPlan: SubscriptionPlan;
  isLoading: boolean;
  hasAccess: (featureId: string) => boolean;
  planFeatures: PlanFeature[];
  upgradeToPlan: (plan: SubscriptionPlan) => Promise<void>;
}

const defaultFeatures: PlanFeature[] = [
  {
    id: 'ai-therapist',
    name: 'AI Therapist',
    description: 'Chat with Siena, your AI therapy companion',
    access: { basic: true, plus: true, premium: true }
  },
  {
    id: 'journal',
    name: 'Journal',
    description: 'Record your thoughts and reflections',
    access: { basic: true, plus: true, premium: true }
  },
  {
    id: 'mood-tracker',
    name: 'Mood Tracker',
    description: 'Track your daily moods and emotions',
    access: { basic: true, plus: true, premium: true }
  },
  {
    id: 'affirmations',
    name: 'Daily Affirmations',
    description: 'Access daily affirmations for emotional well-being',
    access: { basic: true, plus: true, premium: true }
  },
  {
    id: 'basic-cards',
    name: 'Basic Card Decks',
    description: 'Access to individual reflection cards',
    access: { basic: true, plus: true, premium: true }
  },
  {
    id: 'basic-quizzes',
    name: 'Quizzes',
    description: 'Access to fundamental assessment quizzes',
    access: { basic: true, plus: true, premium: true }
  },
  {
    id: 'emotion-wheel',
    name: 'Emotion Wheel',
    description: 'Interactive emotion exploration tool',
    access: { basic: true, plus: true, premium: true }
  },
  {
    id: 'basic-exercises',
    name: 'Basic Exercises',
    description: 'Access to individual therapeutic exercises',
    access: { basic: false, plus: true, premium: true }
  },
  // Plus features
  {
    id: 'meditations',
    name: 'Guided Meditations',
    description: 'Access to guided meditation audio sessions',
    access: { basic: false, plus: true, premium: true }
  },
  {
    id: 'goals',
    name: 'SMART Goals',
    description: 'Set and track personal development goals',
    access: { basic: false, plus: true, premium: true }
  },
  {
    id: 'insights',
    name: 'Insights & Analytics',
    description: 'View detailed analytics and progress insights',
    access: { basic: false, plus: true, premium: true }
  },
  {
    id: 'therapy-sessions',
    name: 'Therapy Session Tracking',
    description: 'Log and track your therapy sessions',
    access: { basic: false, plus: true, premium: true }
  },
  {
    id: 'life-balance',
    name: 'Life Balance Wheel',
    description: 'Track and visualize life balance areas',
    access: { basic: false, plus: true, premium: true }
  },
  {
    id: 'medication-management',
    name: 'Medication Management',
    description: 'Track medications and set reminders',
    access: { basic: false, plus: true, premium: true }
  },
  {
    id: 'sleep-tracker',
    name: 'Sleep Tracker',
    description: 'Monitor sleep patterns and quality',
    access: { basic: false, plus: true, premium: true }
  },
  {
    id: 'values-clarification',
    name: 'Values Clarification',
    description: 'Interactive values board for self-discovery',
    access: { basic: false, plus: true, premium: true }
  },
  {
    id: 'dating-tracker',
    name: 'Dating Tracker',
    description: 'Track and analyze your dating experiences',
    access: { basic: false, plus: true, premium: true }
  },
  // Premium features
  {
    id: 'couples-cards',
    name: 'Couples Card Decks',
    description: 'Access to relationship-focused card decks',
    access: { basic: false, plus: false, premium: true }
  },
  {
    id: 'internal-world',
    name: 'Internal World',
    description: 'Couples internal world sharing and reconnection exercises',
    access: { basic: false, plus: false, premium: true }
  },
  {
    id: 'couples-exercises',
    name: 'Couples Exercises',
    description: 'Access to relationship-focused therapeutic exercises',
    access: { basic: false, plus: false, premium: true }
  },
  {
    id: 'love-radar',
    name: 'Love Radar',
    description: 'Track and improve relationship intimacy',
    access: { basic: false, plus: false, premium: true }
  },
  {
    id: 'couples-meditations',
    name: 'Couples Meditations',
    description: 'Guided meditations designed for couples',
    access: { basic: false, plus: false, premium: true }
  },
  {
    id: 'priority-support',
    name: 'Priority Support',
    description: 'Get faster responses to your support requests',
    access: { basic: false, plus: false, premium: true }
  },
  {
    id: 'live-check-in',
    name: 'Live Check-In',
    description: 'Real-time emotional awareness tool for couples',
    access: { basic: false, plus: false, premium: true }
  },
  {
    id: 'couple-activity-tracker',
    name: 'Couple Activity Tracker',
    description: 'Track and analyze relationship activities and patterns',
    access: { basic: false, plus: false, premium: true }
  },
  {
  id: 'couple-shared-values',
  name: 'Shared Values (Couples)',
  description: 'One shared values board for the couple (owner can enable partner editing)',
  access: { basic: false, plus: false, premium: true }
},
  // in src/context/SubscriptionContext.tsx (defaultFeatures array)
{
  id: 'couples-bucket-list',
  name: 'Couples Bucket List',
  description: 'Plan and track shared dreams and experiences',
  access: { basic: false, plus: false, premium: true }
},
{
  id: 'bucket-list',
  name: 'Bucket List',
  description: 'Personal bucket list tracker',
  access: { basic: false, plus: true, premium: true }
},

];

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { userData } = useUser();
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>('basic');
  const [isLoading, setIsLoading] = useState(true);
  const [planFeatures] = useState<PlanFeature[]>(defaultFeatures);

 useEffect(() => {
  if (!userData) return;

  let determinedPlan: SubscriptionPlan = 'basic';

  if (userData.subscription_tier) {
    determinedPlan = userData.subscription_tier as SubscriptionPlan;
  } else if (userData.subscription_status === 'active') {
    determinedPlan = userData.personal_client ? 'premium' : 'plus';
  }

  setCurrentPlan(determinedPlan);
  setIsLoading(false); // ✅ Only once plan is fully determined
}, [userData]);

useEffect(() => {
  console.log('👤 userData:', userData);
  console.log('📦 currentPlan:', currentPlan);
  console.log('🕓 isLoading:', isLoading);
}, [userData, currentPlan, isLoading]);

const hasAccess = (featureId: string): boolean => {
  const feature = planFeatures.find(f => f.id === featureId);
  if (!feature) return false;

  return feature.access[currentPlan];
};

  const upgradeToPlan = async (plan: SubscriptionPlan): Promise<void> => {
    try {
      if (plan === 'basic') return; // No need to upgrade to basic
      
      // For demo purposes, we'll just update the user's subscription status
      // In a real app, this would redirect to a payment page
      
      if (plan === 'plus') {
        // Redirect to checkout for Plus plan
        window.location.href = '/pricing';
      } else if (plan === 'premium') {
        // Redirect to checkout for Premium plan
        window.location.href = '/pricing';
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      throw error;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        currentPlan,
        isLoading,
        hasAccess,
        planFeatures,
        upgradeToPlan
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}