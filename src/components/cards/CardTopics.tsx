// src/components/cards/CardTopics.tsx
import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft, Library, Heart, Brain, Shield, Sparkles, Key, Infinity, Moon,
  MessageCircle, Users, Home, Flame, Puzzle, Info, ChevronDown, ChevronUp,
  CheckCircle2, Lightbulb, Banknote, Briefcase, Lock, CalendarCheck2, Compass, Telescope, HeartCrack, HeartPulse
} from 'lucide-react';

import { DECK_DESCRIPTIONS } from '../../data/cards';
import { DeckType } from '../../types';
import { useSubscription } from '../../context/SubscriptionContext';
import OrnateCardBorder from './OrnateCardBorder';
import { TOPIC_COLORS } from './cardColors';
import FeatureAccessGuard from '../subscription/FeatureAccessGuard';

const CATEGORY_ICONS = {
  // Individual topics
  'emotional-awareness': Brain,
  'self-worth': Shield,
  'healing': Heart,
  'patterns': Puzzle,
  'attachment': Users,
  'inner-critic': MessageCircle,
  'vulnerability': Heart,
  'boundaries-assertiveness': Shield,
  'emotional-regulation': Brain,
  'life-transitions-growth': Infinity,
  'relationships-compatibility': Heart,
  'self-discovery-growth': Sparkles, // fixed (removed stray quote)

  // Couples topics
  'emotional-intimacy': Heart,
  'communication': MessageCircle,
  'conflict': Shield,
  'love-languages': Sparkles,
  'trust': Key,
  'physical-intimacy': Flame,
  'relationship-needs': Brain,
  'relationship-boundaries': Shield,
  'family': Home,
  'sexual-intimacy': Moon,
  'romantic-play': Sparkles,
  'resentments': Heart,
  // add to CATEGORY_ICONS map
'breakup-closure': HeartCrack,
'money-and-finances': Banknote,
'future-vision': Telescope,
'career-and-ambition': Briefcase,
'tech-and-privacy': Lock,
'rituals-and-routines': CalendarCheck2,
'adventure-and-play': Compass,
'desire-alignment': Sparkles, // sexy but tasteful
  'health-wellbeing': HeartPulse

} as const;

export default function CardTopics() {
  const { deckType = 'individual' } = useParams<{ deckType: DeckType }>();
  const { hasAccess, currentPlan } = useSubscription();
  const deck = DECK_DESCRIPTIONS[deckType];
  const [showTips, setShowTips] = useState(false);

  if (deckType === 'couples' && !hasAccess('couples-cards')) {
    return (
      <FeatureAccessGuard featureId="couples-cards" currentPlan={currentPlan}>
        <CardTopicsContent deckType={deckType} />
      </FeatureAccessGuard>
    );
  }

  return <CardTopicsContent deckType={deckType} />;
}

function CardTopicsContent({ deckType }: { deckType: DeckType }) {
  const deck = DECK_DESCRIPTIONS[deckType];
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Back to Decks */}
      <div className="mb-6">
        <Link
          to="/dashboard/cards"
          className="inline-flex items-center text-sm hover:underline"
          style={{ color: '#01B1AF' }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Decks
        </Link>
      </div>

      {/* Header */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] pt-12 px-8 pb-10 mb-10">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="pr-3">
              <h1 className="text-4xl font-bold text-white mb-2">
                {deckType === 'individual' ? 'Self-Reflection Cards' : 'Couples Connection Deck'}
              </h1>
              <p className="text-lg text-white/80">
                {deckType === 'individual'
                  ? 'Explore different areas of self-awareness and personal growth'
                  : 'Strengthen your relationship through meaningful conversation and connection'}
              </p>
            </div>

            <button
              onClick={() => setShowTips(v => !v)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-white/15 text-white border border-white/30 hover:bg-white/25 transition-colors"
              aria-expanded={showTips}
              aria-controls="topics-green-tips"
            >
              <Info className="h-4 w-4" />
              <span className="font-medium">Tips</span>
              {showTips ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div
        id="topics-green-tips"
        className={`transition-all duration-300 ease-in-out overflow-hidden ${showTips ? 'max-h-[2000px] mb-10' : 'max-h-0 mb-0'}`}
      >
        <div className="bg-gradient-to-b from-[#01B1AF] to-[#018a88] rounded-xl p-5 md:p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white/10 border border-white/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-white" />
                <h3 className="text-white font-semibold">Using This Deck Effectively</h3>
              </div>
              {deckType === 'individual' ? (
                <ul className="text-white/90 space-y-2 text-sm leading-relaxed">
                  <li>• Choose the topic that feels <span className="font-medium">most alive</span> right now.</li>
                  <li>• Time box 10–15 min with one intention.</li>
                  <li>• Pull 2–4 cards. Ask: <em>“What else might be true?”</em></li>
                  <li>• Close with one tiny action + one appreciation.</li>
                </ul>
              ) : (
                <ul className="text-white/90 space-y-2 text-sm leading-relaxed">
                  <li>• Agree on speaker/listener; switch after each card.</li>
                  <li>• Listener mirrors: <em>“What I hear is…”</em></li>
                  <li>• Pause for 3 breaths if tension rises.</li>
                  <li>• End with appreciation + one small commitment.</li>
                </ul>
              )}
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-white" />
                <h3 className="text-white font-semibold">Examples & Best Practices</h3>
              </div>
              {deckType === 'individual' ? (
                <div className="text-white/90 text-sm space-y-3 leading-relaxed">
                  <p><span className="font-semibold">Example:</span> Choose “Self-Worth” → draw 3 cards → jot notes → pick one 24-hour action.</p>
                  <ul className="space-y-2">
                    <li>• Skip prompts that don’t land; depth over breadth.</li>
                    <li>• Revisit monthly to notice momentum.</li>
                  </ul>
                </div>
              ) : (
                <div className="text-white/90 text-sm space-y-3 leading-relaxed">
                  <p><span className="font-semibold">Example:</span> Choose “Communication” → A shares, B mirrors → switch → appreciation + commitment.</p>
                  <ul className="space-y-2">
                    <li>• If defensive, ask for a pause: <em>“Help me understand.”</em></li>
                    <li>• Keep it warm and short; save solutions for later.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Topic Cards Grid */}
      {/* Center items and add extra vertical gap so rotated backs never crowd next row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 sm:gap-y-14 place-items-center">
        {deck.categories.map((category) => {
          const Icon = (CATEGORY_ICONS as any)[category.id] || Library;
          const gradientColor =
            TOPIC_COLORS[category.id] ?? 'from-[#01B1AF] to-[#018a88]'; // fallback to brand green

          return (
            <Link
              key={category.id}
              to={`/dashboard/cards/${deckType}/topic/${category.id}`}
              className="relative group block w-[268px] h-[368px] mx-auto"
            >
              {/* Back Card (peeks top/left) */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradientColor} rounded-2xl
                            transform rotate-[1.5deg]
                            group-hover:rotate-[6deg]
                            transition-transform duration-300 ease-out
                            flex items-center justify-center`}
                style={{ zIndex: 0 }}
              >
                <OrnateCardBorder className="text-white opacity-40" />
              </div>

              {/* Main Card (offset to reveal back card) */}
              <div
                className={`absolute right-2 bottom-2
                            bg-white rounded-2xl shadow-md border border-gray-200
                            overflow-hidden flex flex-col justify-between p-6
                            transition-transform transition-shadow duration-300 ease-out
                            group-hover:-translate-y-1 group-hover:shadow-2xl`}
                style={{ zIndex: 1, width: '260px', height: '360px' }}
              >
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${gradientColor} mb-5`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>

                <div className="mt-6 inline-flex items-center text-brand-green group-hover:underline text-sm font-semibold justify-center">
                  Explore Cards
                  <ArrowLeft className="h-4 w-4 ml-1 transform rotate-180 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
