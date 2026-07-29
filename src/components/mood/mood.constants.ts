import {
  Sun, Smile, Coffee, ThumbsUp, Meh, HelpCircle, Brain, Bed, Search,
  AlertCircle, Frown, Angry, CloudRain, Star, CloudOff, HeartCrack, Heart,
  PartyPopper, AlertTriangle
} from 'lucide-react';

export type MoodType = 'positive' | 'neutral' | 'negative';

export const MOODS = [
  { value: 'adored',       icon: Heart,        label: 'Adored',       color: 'text-red-600',     type: 'positive' },
  { value: 'angry',        icon: Angry,        label: 'Angry',        color: 'text-red-600',     type: 'negative' },
  { value: 'anxious',      icon: CloudRain,    label: 'Anxious',      color: 'text-gray-500',    type: 'negative' },
  { value: 'blah',         icon: Meh,          label: 'Blah',         color: 'text-gray-400',    type: 'neutral'  },
  { value: 'blessed',      icon: Sun,          label: 'Blessed',      color: 'text-yellow-600',  type: 'positive' },
  { value: 'celebratory',  icon: PartyPopper,  label: 'Celebratory',  color: 'text-purple-500',  type: 'positive' },
  { value: 'confident',    icon: Star,         label: 'Confident',    color: 'text-yellow-600',  type: 'positive' },
  { value: 'curious',      icon: Search,       label: 'Curious',      color: 'text-blue-400',    type: 'neutral'  },
  { value: 'depressed',    icon: CloudOff,     label: 'Depressed',    color: 'text-blue-700',    type: 'negative' },
  { value: 'disappointed', icon: Frown,        label: 'Disappointed', color: 'text-orange-700',  type: 'negative' },
  { value: 'excited',      icon: PartyPopper,  label: 'Excited',      color: 'text-pink-500',    type: 'positive' },
  { value: 'flirty',       icon: Heart,        label: 'Flirty',       color: 'text-pink-400',    type: 'positive' },
  { value: 'frustrated',   icon: AlertCircle,  label: 'Frustrated',   color: 'text-orange-600',  type: 'negative' },
  { value: 'happy',        icon: Sun,          label: 'Happy',        color: 'text-yellow-500',  type: 'positive' },
  { value: 'insecure',     icon: Frown,        label: 'Insecure',     color: 'text-gray-600',    type: 'negative' },
  { value: 'loved',        icon: Heart,        label: 'Loved',        color: 'text-red-500',     type: 'positive' },
  { value: 'neutral',      icon: Meh,          label: 'Neutral',      color: 'text-gray-500',    type: 'neutral'  },
  { value: 'overwhelmed',  icon: AlertTriangle,label: 'Overwhelmed',  color: 'text-amber-600',   type: 'negative' },
  { value: 'playful',      icon: PartyPopper,  label: 'Playful',      color: 'text-purple-400',  type: 'positive' },
  { value: 'relaxed',      icon: Coffee,       label: 'Relaxed',      color: 'text-green-500',   type: 'positive' },
  { value: 'sad',          icon: HeartCrack,   label: 'Sad',          color: 'text-blue-600',    type: 'negative' },
  { value: 'skeptical',    icon: HelpCircle,   label: 'Skeptical',    color: 'text-orange-500',  type: 'neutral'  },
  { value: 'thinking',     icon: Brain,        label: 'Thinking',     color: 'text-indigo-500',  type: 'neutral'  },
  { value: 'tired',        icon: Bed,          label: 'Tired',        color: 'text-gray-600',    type: 'neutral'  },
  { value: 'trusting',     icon: ThumbsUp,     label: 'Trusting',     color: 'text-blue-500',    type: 'positive' }
];

// Alphabetized labels for UI dropdowns, but keep their slug value
export const MOODS_ALPHABETICAL = [...MOODS].sort((a,b) => a.label.localeCompare(b.label));

// Quick lookup
export const MOOD_BY_VALUE = Object.fromEntries(MOODS.map(m => [m.value, m]));
