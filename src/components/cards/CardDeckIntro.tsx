import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { DECK_DESCRIPTIONS } from '../../data/cards';
import { DeckType } from '../../types';
import { CardDeckIcon } from '../icons/CardDeckIcon';
import { useSubscription } from '../../context/SubscriptionContext';
import { Star } from 'lucide-react';
import Button from '../ui/Button';
import OrnateCardBorder from './OrnateCardBorder';
import { useState } from 'react';

const DECK_BACK_COLORS = {
  individual: 'from-[#00789f] to-[#005a77]', // deep blue gradient
  couples: 'from-[#ea697c] to-[#b8455c]',
  // Optional future decks:
  selfWorth: 'from-[#00789f] to-[#0068aa]',
  reflection: 'from-[#01B1AF] to-[#008792]',
};

export default function CardDeckIntro() {
  const { hasAccess, currentPlan } = useSubscription();
  const hasCouplesAccess = hasAccess('couples-cards');
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Therapeutic Card Decks</h1>
              <p className="text-base text-white/80">
                Choose a deck to begin your journey of reflection and growth
              </p>
            </div>

            {/* Collapsible Guide Button */}
            <button
              onClick={() => setShowGuide(!showGuide)}
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

          {/* Collapsible Guide */}
          {showGuide && (
            <div className="mt-6">
              <div className="bg-white/10 rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-[#01B1AF]/20 p-3 rounded-full mr-4 flex-shrink-0">
                        <span className="text-white font-bold text-lg">1</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          Choose a quiet time and space for reflection
                        </h3>
                        <p className="text-white/80">
                          Find a peaceful environment where you can focus without distractions.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-[#01B1AF]/20 p-3 rounded-full mr-4 flex-shrink-0">
                        <span className="text-white font-bold text-lg">2</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          Select a deck that matches your current needs
                        </h3>
                        <p className="text-white/80">
                          Choose individual cards for self-reflection or couples cards for relationship growth.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-[#01B1AF]/20 p-3 rounded-full mr-4 flex-shrink-0">
                        <span className="text-white font-bold text-lg">3</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          Take time to consider each prompt deeply
                        </h3>
                        <p className="text-white/80">
                          Don't rush through the cards. Allow yourself time to truly reflect on each question.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="bg-[#01B1AF]/20 p-3 rounded-full mr-4 flex-shrink-0">
                        <span className="text-white font-bold text-lg">4</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          Journal your insights and revisit cards that resonate
                        </h3>
                        <p className="text-white/80">
                          Write down your thoughts and return to meaningful cards for deeper exploration.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Getting the Most from Card Decks</h3>

                    <div className="space-y-4">
                      <div>
                        <div className="text-white font-medium mb-1">Reflection Practice</div>
                        <ul className="text-white/80 space-y-2 text-sm">
                          <li>• Set aside 10-15 minutes for each card session</li>
                          <li>• Read the question slowly and sit with it</li>
                          <li>• Notice your first reaction, then go deeper</li>
                        </ul>
                      </div>

                      <div>
                        <div className="text-white font-medium mb-1">Couples Practice</div>
                        <ul className="text-white/80 space-y-2 text-sm">
                          <li>• Take turns answering each question</li>
                          <li>• Listen without judgment or advice</li>
                          <li>• Ask follow-up questions with curiosity</li>
                        </ul>
                      </div>

                      <div>
                        <div className="text-white font-medium mb-1">Integration</div>
                        <ul className="text-white/80 space-y-2 text-sm">
                          <li>• Journal about insights after each session</li>
                          <li>• Revisit cards that brought up strong emotions</li>
                          <li>• Share discoveries with trusted friends or therapists</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decks Grid */}
      <div className="flex justify-center mb-12 mt-36"> {/* lowered the cards with mt-16 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          {(['individual', 'couples'] as DeckType[]).map((deckType) => {
            const isLocked = deckType === 'couples' && !hasCouplesAccess;

            return (
              <div key={deckType} className="relative group flex justify-center items-center">
                {/* Background Card */}
                <div
                  className={`absolute bg-gradient-to-br ${DECK_BACK_COLORS[deckType]} rounded-2xl transform rotate-2 scale-[1.02] group-hover:rotate-6 transition-all duration-300 ease-in-out flex items-center justify-center`}
                  style={{
                    zIndex: 0,
                    width: '348px',
                    height: '518px',
                    top: '-12px',
                    left: '-12px',
                  }}
                >
                  <OrnateCardBorder className="text-white opacity-40" />
                </div>

                {/* Main Card */}
                <div
                  className="relative bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex flex-col justify-between transition-all duration-300 ease-in-out group-hover:-translate-y-2 group-hover:scale-105 group-hover:shadow-2xl group-hover:ring-2 group-hover:ring-brand-green/40"
                  style={{
                    zIndex: 1,
                    width: '340px',
                    height: '510px',
                  }}
                >
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {DECK_DESCRIPTIONS[deckType].title}
                        {isLocked && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            PREMIUM
                          </span>
                        )}
                      </h2>
                      <p className="text-gray-600 mb-4 text-sm font-medium">
                        {DECK_DESCRIPTIONS[deckType].description}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {deckType === 'individual'
                          ? 'Explore different areas of self-awareness, emotional intelligence, and personal growth through engaging prompts and reflections.'
                          : 'Explore topics that deepen emotional connection, improve communication, and strengthen your relationship through meaningful conversation.'}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
                    {isLocked ? (
                      <Link to="/pricing">
                        <Button className="w-full py-4 text-base bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold">
                          <Star className="h-5 w-5 mr-2 fill-current" />
                          Upgrade to Premium
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`/dashboard/cards/${deckType}`}>
                        <Button className="w-full py-4 text-base transition-transform duration-200 hover:scale-105">
                          <img
                            src="https://static.wixstatic.com/media/4e16d8_81baaf44b0da4d838db1a6628fabc9f9~mv2.png"
                            alt="Card Deck"
                            className="h-6 w-6 mr-2 object-contain"
                          />
                          {deckType === 'individual' ? 'Explore Self-Reflection' : 'Explore Together'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
