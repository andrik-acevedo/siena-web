import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';
import { CARDS, DECK_DESCRIPTIONS } from '../../data/cards';
import { DeckType } from '../../types';

// ---------- Local ornate border (unchanged) ----------
const OrnateCardBorder = ({ className = "text-white", style = {} }) => (
  <div className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} style={style}>
    <div className="absolute top-2 left-2 w-20 h-20 border-l-4 border-t-4 border-current opacity-70 rounded-tl-lg" />
    <div className="absolute top-2 right-2 w-20 h-20 border-r-4 border-t-4 border-current opacity-70 rounded-tr-lg" />
    <div className="absolute bottom-2 left-2 w-20 h-20 border-l-4 border-b-4 border-current opacity-70 rounded-bl-lg" />
    <div className="absolute bottom-2 right-2 w-20 h-20 border-r-4 border-b-4 border-current opacity-70 rounded-br-lg" />
    <div className="absolute top-6 left-16 right-16 h-px bg-current opacity-50" />
    <div className="absolute bottom-6 left-16 right-16 h-px bg-current opacity-50" />
    <div className="absolute left-6 top-16 bottom-16 w-px bg-current opacity-50" />
    <div className="absolute right-6 top-16 bottom-16 w-px bg-current opacity-50" />
    {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map(pos => (
      <div key={pos} className={`absolute ${pos} w-3 h-3 rounded-full bg-current opacity-70`} />
    ))}
  </div>
);

// ---------- Topic gradients (existing + new) ----------
const TOPIC_COLORS: Record<string, string> = {
  // Individual Topics
  'emotional-awareness': 'from-[#e88584] to-[#8e4f63]',
  'self-worth': 'from-[#B1E006] to-[#6C8300]',
  'healing': 'from-[#008792] to-[#006a70]',
  'patterns': 'from-[#00789f] to-[#005a77]',
  'attachment': 'from-[#0068aa] to-[#004d7f]',
  'inner-critic': 'from-[#7b5595] to-[#5d4070]',
  'vulnerability': 'from-[#FFA600] to-[#B36B00]',
  'boundaries-assertiveness': 'from-[#ea697c] to-[#b8455c]',
  'emotional-regulation': 'from-[#e88584] to-[#8e4f63]',
  'life-transitions-growth': 'from-[#B1E006] to-[#6C8300]',
  'relationships-compatibility': 'from-[#0068aa] to-[#004d7f]',
  'self-discovery-growth': 'from-[#FFA600] to-[#B36B00]',

  // Couples Topics (existing)
  'emotional-intimacy': 'from-[#e88584] to-[#8e4f63]',
  'communication': 'from-[#B1E006] to-[#6C8300]',
  'conflict': 'from-[#008792] to-[#006a70]',
  'love-languages': 'from-[#00789f] to-[#005a77]',
  'trust': 'from-[#0068aa] to-[#004d7f]',
  'physical-intimacy': 'from-[#7b5595] to-[#5d4070]',
  'relationship-needs': 'from-[#FFA600] to-[#B36B00]',
  'relationship-boundaries': 'from-[#ea697c] to-[#b8455c]',
  'family': 'from-[#e88584] to-[#8e4f63]',
  'sexual-intimacy': 'from-[#B1E006] to-[#6C8300]',
  'romantic-play': 'from-[#008792] to-[#006a70]',
  'resentments': 'from-[#00789f] to-[#005a77]',

  // New Couples Topics (tiles you added)
  'breakup-closure':      'from-[#C44569] to-[#7A2440]', // deep rose → plum
  'money-and-finances':   'from-[#3FB67A] to-[#177A52]', // mint → deep green
  'future-vision':        'from-[#5BA3FF] to-[#2A62B8]', // sky → royal blue
  'career-and-ambition':  'from-[#FF9F43] to-[#B86B1C]', // amber → bronze
  'tech-and-privacy':     'from-[#e88584] to-[#8e4f63]', // indigo → deep indigo
  'rituals-and-routines': 'from-[#9BDB5A] to-[#5E8E26]', // fresh green → olive
  'adventure-and-play':   'from-[#FF6F61] to-[#C24A3A]', // coral → terracotta
  'desire-alignment':     'from-[#008792] to-[#006a70]', // 
'health-wellbeing': 'from-[#00789f] to-[#005a77]',
};

// Deck header gradients
const GRADIENT_COLORS = {
  individual: 'from-[#01B1AF] to-[#018a88]',
  couples: 'from-[#ea697c] to-[#b8455c]',
};

// ---------- Category normalization so old data shows under new tiles ----------
const normalizeCategory = (slug: string): string => {
  // map old slugs to new tile IDs
  const map: Record<string, string> = {
    // old → new
    'playful': 'adventure-and-play',
    'breakups': 'breakup-closure',
    'finances': 'money-and-finances',
    'life-building': 'future-vision',
    'career': 'career-and-ambition',
    'sexual-honesty': 'desire-alignment',
    'family-friends': 'family',
    'future-family': 'family',
  };
  return map[slug] ?? slug;
};

export default function CardDeck() {
  const { deckType = 'individual', topicId } = useParams<{ deckType: DeckType; topicId: string }>();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { userData } = useUser();
  const { hasAccess } = useSubscription();

  // Redirect to pricing if trying to access couples deck without premium
  if (deckType === 'couples' && !hasAccess('couples-cards')) {
    return <Navigate to="/pricing" replace />;
  }

  // Use normalization so existing cards (old categories) match new topic tiles
  const deckCards = CARDS
    .filter((card) => card.deckType === deckType)
    .filter((card) => normalizeCategory(card.category) === topicId);

  const deckInfo = DECK_DESCRIPTIONS[deckType];
  const topic = deckInfo.categories.find((cat) => cat.id === topicId);
  const gradientColor = GRADIENT_COLORS[deckType];
  const topicGradient = TOPIC_COLORS[topicId ?? ''] || gradientColor;
  const fromColor =
    topicGradient.match(/from-\[(#[0-9a-fA-F]+)\]/)?.[1] || '#01B1AF';

  const logCardView = async (cardId: number) => {
    if (!userData?.id) return;
    try {
      await supabase.from('card_views').insert({
        user_id: userData.id,
        card_id: cardId.toString(),
        deck_type: deckType,
      });
    } catch (error) {
      console.error('Error logging card view:', error);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < deckCards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex((prev) => prev + 1), 400);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex((prev) => prev - 1), 400);
    }
  };

  const handleReset = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    if (deckCards.length > 0) logCardView(deckCards[0].id);
  };

  const currentCard = deckCards[currentCardIndex];

  if (!currentCard || !topic) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No cards found for this topic.</p>
        <Link
          to={`/dashboard/cards/${deckType}`}
          className="text-brand-blue hover:underline"
        >
          Return to topics
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-12">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            {deckType === 'individual' ? 'Self-Reflection Cards' : 'Couples Connection Deck'}
          </h1>
          <p className="text-lg text-white/80">
            {deckType === 'individual'
              ? 'Explore your inner world through thoughtful reflection'
              : 'Deepen your connection through meaningful conversation'}
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <Link
          to={`/dashboard/cards/${deckType}`}
          className="inline-flex items-center text-sm text-brand-green hover:text-brand-green/80"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Topics
        </Link>
        <div className="text-sm text-brand-green">
          Card {currentCardIndex + 1} of {deckCards.length}
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-green">{topic.title}</h1>
        <p className="text-white">{topic.description}</p>
      </div>

      <div
        className="relative mx-auto w-[360px] h-[480px] md:w-[400px] md:h-[530px] cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front of card */}
          <div className="absolute inset-0 backface-hidden z-10">
            <div className="w-full h-full bg-white rounded-2xl shadow-xl p-6">
              <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
                <OrnateCardBorder style={{ color: fromColor }} />
                <div className="relative z-10 max-w-[180px]">
                  <div className="mb-6">
                    <div
                      className={`w-10 h-10 mx-auto mb-3 rounded-full bg-gradient-to-br ${topicGradient} flex items-center justify-center`}
                    >
                      <img
                        src="https://static.wixstatic.com/media/4e16d8_81baaf44b0da4d838db1a6628fabc9f9~mv2.png"
                        alt="Card Deck Icon"
                        className="h-6 w-6 object-contain"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    </div>
                  </div>
                  <h2 className="text-xl font-medium text-gray-900 mb-3">
                    {currentCard.question}
                  </h2>
                  <p className="text-lg text-gray-600">Click card to reveal reflection</p>
                </div>
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 z-20">
            <div className={`w-full h-full bg-gradient-to-br ${topicGradient} rounded-2xl shadow-xl p-6`}>
              <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
                <OrnateCardBorder className="text-white" />
                <div className="relative z-10 w-full h-full flex items-center justify-center px-8 py-6">
                  <p className="text-base text-white leading-relaxed text-center max-w-[260px] whitespace-pre-wrap">
                    {currentCard.reflection}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center space-x-4">
        <Button variant="outline" onClick={handlePrevious} disabled={currentCardIndex === 0}>
          <ArrowLeft className="h-5 w-5 mr-2" />
          Previous
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-5 w-5 mr-2" />
          Reset
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentCardIndex === deckCards.length - 1}
          className={`bg-gradient-to-br ${topicGradient} text-white hover:opacity-90`}
        >
          Next
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
