// src/components/exercises/ExerciseList.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Brain,
  Heart,
  Home,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Button from '../ui/Button';
import { ExerciseCategory } from '../../types';
import { SAMPLE_EXERCISES, CATEGORY_COLORS } from '../../data/exercises';
import { useSubscription } from '../../context/SubscriptionContext';
import TileCard, { GRADIENT_COLORS } from '../ui/TileCard';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';

const CATEGORY_ICONS = {
  adults: Brain,
  couples: Heart,
  families: Home,
};

const TYPE_COLORS = {
  anxiety: 'bg-blue-100 text-blue-800',
  depression: 'bg-purple-100 text-purple-800',
  trauma: 'bg-red-100 text-red-800',
  'self-esteem': 'bg-green-100 text-green-800',
  boundaries: 'bg-teal-100 text-teal-800',
  communication: 'bg-indigo-100 text-indigo-800',
  trust: 'bg-rose-100 text-rose-800',
  intimacy: 'bg-pink-100 text-pink-800',
  'family-dynamics': 'bg-orange-100 text-orange-800',
  parenting: 'bg-amber-100 text-amber-800',
  'mental-health': 'bg-cyan-100 text-cyan-800',
};

function ExercisesGuide() {
  return (
    <div className="mt-6 bg-gradient-to-br from-[#01B1AF] to-[#018a88] rounded-lg p-4 md:p-6 space-y-4 text-white text-sm">
      <div className="flex items-center space-x-4 mb-2 md:mb-4">
        <HelpCircle className="h-8 w-8 text-white" />
        <h2 className="text-xl font-semibold text-white">Tips for Using Wellness Exercises</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <div>
            <div className="text-white font-medium mb-1">Start small (2–5 min)</div>
            <p className="text-white/80">
              Pick one exercise and try a single micro-step today. Consistency beats intensity.
            </p>
          </div>
          <div>
            <div className="text-white font-medium mb-1">Pair it with context</div>
            <p className="text-white/80">
              Link breathing or grounding to moments you already do daily (e.g., after brushing teeth).
            </p>
          </div>
          <div>
            <div className="text-white font-medium mb-1">Reflect briefly</div>
            <p className="text-white/80">
              After finishing, note one sentence in Journal about what helped (or didn’t).
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="bg-white/10 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
          <ul className="text-white/80 space-y-2">
            <li>• Feeling keyed up? Try “Calming Breath” or a grounding scan.</li>
            <li>• Tough convo ahead? Do a 60-sec box breathing before you start.</li>
            <li>• Building confidence? Choose a self-esteem or self-talk reframe.</li>
            <li>• Weekly review: turn helpful practices into a tiny Habit or Goal.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ExerciseList() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPlusOrPremium = hasAccess('basic-exercises');

  if (!isPlusOrPremium) {
    return (
      <FeatureAccessGuard featureId="basic-exercises" currentPlan={currentPlan}>
        <ExerciseListContent />
      </FeatureAccessGuard>
    );
  }

  return <ExerciseListContent />;
}

function ExerciseListContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all');
  const [showGuide, setShowGuide] = useState(false);
  const { hasAccess, currentPlan } = useSubscription();

  // Filter exercises based on subscription plan
  const accessibleExercises = SAMPLE_EXERCISES.filter((exercise) => {
    // Basic users can only access 'adults' category
    if (currentPlan === 'basic' && exercise.category !== 'adults') return false;
    // Plus users can access 'adults' only
    if (currentPlan === 'plus' && exercise.category !== 'adults') return false;
    // Premium: all categories
    return true;
  });

  const filteredExercises = accessibleExercises.filter((exercise) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (exercise.title.toLowerCase().includes(searchLower) ||
        exercise.description.toLowerCase().includes(searchLower)) &&
      (selectedCategory === 'all' || exercise.category === selectedCategory) &&
      // Only show 'adults' category exercises in this list
      exercise.category === 'adults'
    );
  });

  return (
    <div className="space-y-6">
      {/* Header with Tips toggle; title updated */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
        <div className="relative z-10 flex items-start md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Wellness Exercises</h1>
            <p className="text-lg text-white/80">
              Explore evidence-based exercises for your mental wellness journey
            </p>
          </div>
          <button
            onClick={() => setShowGuide((s) => !s)}
            className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">Tips</span>
            {showGuide ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
          </button>
        </div>

        {showGuide && <ExercisesGuide />}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green sm:text-sm sm:leading-6"
          />
        </div>

        <div className="flex gap-2">
          <Button variant={selectedCategory === 'all' ? 'primary' : 'outline'} onClick={() => setSelectedCategory('all')}>
            <Sparkles className="h-5 w-5 mr-2" />
            All
          </Button>

          {Object.entries(CATEGORY_ICONS).map(([category, Icon]) => {
            // Only show 'adults' category in this list
            if (category !== 'adults') return null;

            const isAccessible =
              category === 'adults' ||
              (category === 'couples' && hasAccess('couples-cards')) ||
              (category === 'families' && hasAccess('advanced-exercises'));

            if (!isAccessible) return null;

            return (
              <Button
                key={category}
                variant={selectedCategory === category ? 'primary' : 'outline'}
                onClick={() => setSelectedCategory(category as ExerciseCategory)}
                style={{
                  backgroundColor: selectedCategory === category ? CATEGORY_COLORS[category as ExerciseCategory] : 'transparent',
                  borderColor: selectedCategory !== category ? CATEGORY_COLORS[category as ExerciseCategory] : 'transparent',
                }}
              >
                <Icon className="h-5 w-5 mr-2" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise, index) => {
          const Icon = CATEGORY_ICONS[exercise.category] || BookOpen;
          const typeLabel = exercise.type
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          const gradientColor = GRADIENT_COLORS[index % GRADIENT_COLORS.length];

          return (
            <TileCard
              key={exercise.id}
              title={exercise.title}
              description={exercise.description}
              icon={<Icon className="h-6 w-6 text-white" />}
              tag={typeLabel}
              date={new Date(exercise.createdAt).toLocaleDateString()}
              gradientColor={gradientColor}
              to={`/dashboard/exercises/${exercise.id}`}
              buttonText="View Exercise"
            />
          );
        })}

        {filteredExercises.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-2xl">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-white">No exercises found</h3>
            <p className="mt-1 text-sm text-gray-300">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
