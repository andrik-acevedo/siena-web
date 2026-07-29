import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, MessageSquare, Shield, Flame, Info, ChevronDown, ChevronUp, CheckCircle2, Lightbulb } from 'lucide-react';
import Button from '../ui/Button';
import { Exercise } from '../../types';
import { SAMPLE_EXERCISES } from '../../data/exercises';
import { useSubscription } from '../../context/SubscriptionContext';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';

// Gradient colors for exercise cards
const GRADIENT_COLORS = [
  'from-[#01B1AF] to-[#018a88]',
  'from-[#008792] to-[#006a70]',
  'from-[#00789f] to-[#005a77]',
  'from-[#0068aa] to-[#004d7f]',
  'from-[#7b5595] to-[#5d4070]',
  'from-[#ea697c] to-[#b8455c]'
];

export default function CouplesExerciseList() {
  const { hasAccess, currentPlan } = useSubscription();
  const isPremium = hasAccess('couples-exercises');

  if (!isPremium) {
    return (
      <FeatureAccessGuard featureId="couples-exercises" currentPlan={currentPlan}>
        <CouplesExerciseListContent />
      </FeatureAccessGuard>
    );
  }

  return <CouplesExerciseListContent />;
}

function CouplesExerciseListContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const navigate = useNavigate();
  const [showTips, setShowTips] = useState(false); // collapsed by default

  // Filter exercises to only show couples exercises
  useEffect(() => {
    const couplesExercises = SAMPLE_EXERCISES.filter((exercise) => {
      return (
        exercise.category === 'couples' &&
        (searchQuery === '' ||
          exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exercise.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

    setFilteredExercises(couplesExercises);
  }, [searchQuery]);

  // Map of type to icon
  const TYPE_ICONS = {
    communication: MessageSquare,
    trust: Shield,
    intimacy: Heart,
    'conflict-resolution': MessageSquare
  };

  // Map of type to color classes
  const TYPE_COLORS = {
    communication: 'bg-indigo-100 text-indigo-800',
    trust: 'bg-teal-100 text-teal-800',
    intimacy: 'bg-pink-100 text-pink-800',
    'conflict-resolution': 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-6">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="pr-3">
              <h1 className="text-4xl font-bold text-white mb-2">Couples Exercises</h1>
              <p className="text-lg text-white/80">Strengthen your relationship with exercises</p>
            </div>

            {/* Tips toggle pill — matches green design, collapsed by default */}
            <button
              onClick={() => setShowTips((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-colors"
              aria-expanded={showTips}
              aria-controls="couples-exercises-green-tips"
            >
              <Info className="h-4 w-4" />
              <span className="font-medium">Tips</span>
              {showTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* GREEN Tips: teal container with two inner panels — COLLAPSED by default */}
      <div
        id="couples-exercises-green-tips"
        className={`transition-all duration-300 ease-in-out overflow-hidden ${showTips ? 'max-h-[2000px] mb-8' : 'max-h-0 mb-0'}`}
      >
        <div className="bg-gradient-to-b from-[#01B1AF] to-[#018a88] rounded-xl p-5 md:p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left panel */}
            <div className="bg-white/10 border border-white/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-white" />
                <h3 className="text-white font-semibold">How to Use These Exercises</h3>
              </div>
              <ul className="text-white/90 space-y-2 text-sm leading-relaxed">
                <li>• Pick a focus that feels <span className="font-medium">most relevant</span> (communication, trust, intimacy, conflict).</li>
                <li>• Time-box: <span className="font-medium">15–25 minutes</span>, phones away, agree on speaker/listener turns.</li>
                <li>• Use “I” language; the listener mirrors: <span className="italic">“What I hear is… Did I get that?”</span></li>
                <li>• If tension rises, pause for 3 breaths. Curiosity over correction.</li>
                <li>• End with one appreciation and <span className="font-medium">one tiny next step</span> in the next 24 hours.</li>
              </ul>
            </div>

            {/* Right panel */}
            <div className="bg-white/10 border border-white/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <h3 className="text-white font-semibold">Sample Flows & Best Practices</h3>
              </div>
              <div className="text-white/90 text-sm space-y-3 leading-relaxed">
                <p className="opacity-90">
                  <span className="font-semibold">Example 1 (Communication):</span> Choose a light topic →
                  each partner answers one card while the other mirrors → switch → agree on a “next check-in” time.
                </p>
                <p className="opacity-90">
                  <span className="font-semibold">Example 2 (Trust/Repair):</span> Start with appreciation →
                  do one gentle repair exercise → close with a boundary or request stated kindly.
                </p>
                <ul className="space-y-2">
                  <li>• Keep answers short; depth beats breadth.</li>
                  <li>• If a card doesn’t fit, skip it. Protect the vibe.</li>
                  <li>• Celebrate wins; write one sentence in a shared note after each session.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search couples exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-green sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.length > 0 ? (
          filteredExercises.map((exercise, index) => {
            const Icon =
              TYPE_ICONS[exercise.type as keyof typeof TYPE_ICONS] || Heart;
            const typeColor =
              TYPE_COLORS[exercise.type as keyof typeof TYPE_COLORS] ||
              'bg-gray-100 text-gray-800';
            const gradientColor = GRADIENT_COLORS[index % GRADIENT_COLORS.length];

            return (
              <Link
                key={exercise.id}
                to={`/dashboard/exercises/${exercise.id}`}
                className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                <div className={`bg-gradient-to-br ${gradientColor} p-6 h-[320px] flex flex-col`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-white/20 p-3 rounded-full flex-shrink-0">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white line-clamp-1">
                        {exercise.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-white/80 text-sm mb-4 line-clamp-2">
                    {exercise.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${typeColor}`}>
                      {exercise.type
                        .split('-')
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </span>
                    <span className="text-xs text-white/70">
                      {new Date(exercise.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-auto">
                    <Button className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30">
                      View Exercise
                    </Button>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 bg-gradient-to-br from-[#021E3C] to-[#03274B] rounded-2xl">
            <Heart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-white">No couples exercises found</h3>
            <p className="mt-1 text-sm text-gray-300">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
