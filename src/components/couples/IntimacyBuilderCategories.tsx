import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Flame,
  Zap,
  MessageSquare,
  Brain,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import TileCard, { GRADIENT_COLORS } from '../ui/TileCard';
import { useSubscription } from '../../context/SubscriptionContext';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';

interface CategoryProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

export default function IntimacyBuilderCategories() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPremium = hasAccess('internal-world');

  if (!isPremium) {
    return (
      <FeatureAccessGuard featureId="internal-world" currentPlan={currentPlan}>
        <IntimacyBuilderCategoriesContent />
      </FeatureAccessGuard>
    );
  }

  return <IntimacyBuilderCategoriesContent />;
}

function IntimacyBuilderCategoriesContent() {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);

  const categories: CategoryProps[] = [
    {
      id: 'physical',
      name: 'Physical Intimacy',
      icon: <Heart className="h-6 w-6 text-white" />,
      description: 'Non-sexual touch and physical closeness that communicates care',
    },
    {
      id: 'sexual',
      name: 'Sexual Intimacy',
      icon: <Flame className="h-6 w-6 text-white" />,
      description: 'Pleasure, safety, and mutual desire in your sexual relationship',
    },
    {
      id: 'energetic',
      name: 'Energetic Intimacy',
      icon: <Zap className="h-6 w-6 text-white" />,
      description: 'The subtle but powerful connection of energy between partners',
    },
    {
      id: 'emotional',
      name: 'Emotional Intimacy',
      icon: <MessageSquare className="h-6 w-6 text-white" />,
      description: 'Sharing your inner world and feeling seen and accepted',
    },
    {
      id: 'intellectual',
      name: 'Intellectual Intimacy',
      icon: <Brain className="h-6 w-6 text-white" />,
      description: 'Connection through thoughts, ideas, and curiosity',
    },
    {
      id: 'spiritual',
      name: 'Spiritual Intimacy',
      icon: <Sparkles className="h-6 w-6 text-white" />,
      description: 'Shared meaning, values, and presence',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header banner + Tips toggle */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-6">
        <div className="relative z-10">
          <div className="flex items-start md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Intimacy Builders Challenge</h1>
              <p className="text-lg text-white/80">
                Choose a 30-day challenge to strengthen your connection
              </p>
            </div>

            <button
              onClick={() => setShowGuide((s) => !s)}
              className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">Tips</span>
              {showGuide ? (
                <ChevronUp className="h-4 w-4 text-white" />
              ) : (
                <ChevronDown className="h-4 w-4 text-white" />
              )}
            </button>
          </div>

          {/* Tips panel — TWO sections */}
          {showGuide && (
            <div className="mt-6">
              <div className="bg-white/10 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-medium text-white mb-3">How it works</h3>
                    <ul className="text-white/80 space-y-2 text-sm">
                      <li>• Pick one intimacy type to focus on for 30 days.</li>
                      <li>• You’ll get one small, actionable prompt each day.</li>
                      <li>• Do it together, reflect briefly, and mark it complete.</li>
                      <li>• Use reminders to stay consistent and track progress.</li>
                    </ul>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-medium text-white mb-3">Best practices</h3>
                    <ul className="text-white/80 space-y-2 text-sm">
                      <li>• Choose curiosity over perfection; scale prompts up or down.</li>
                      <li>• Prioritize consent and emotional safety every time.</li>
                      <li>• Share feelings, not fixes—validate before problem solving.</li>
                      <li>• Celebrate small wins; connection compounds over time.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <TileCard
            key={category.id}
            title={category.name}
            description={category.description}
            icon={category.icon}
            gradientColor={GRADIENT_COLORS[index % GRADIENT_COLORS.length]}
            to={`/dashboard/intimacy-builders/${category.id}`}
            buttonText="Start 30-Day Challenge"
          />
        ))}
      </div>
    </div>
  );
}
