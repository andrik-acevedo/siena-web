import { useSubscription } from '../context/SubscriptionContext';
import FeatureAccessGuard from '../components/subscription/FeatureAccessGuard';
import HabitTracker from '../components/habits/HabitTracker';

export default function HabitsPage() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPlusOrPremium = hasAccess('goals');

  if (!isPlusOrPremium) {
    return (
      <FeatureAccessGuard featureId="goals" currentPlan={currentPlan}>
        <HabitTracker />
      </FeatureAccessGuard>
    );
  }

  return <HabitTracker />;
}