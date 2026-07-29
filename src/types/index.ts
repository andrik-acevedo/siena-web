export type DeckType = 'individual' | 'couples';

export type CardCategory = 
  // Individual deck categories
  | 'emotional-awareness'
  | 'self-worth'
  | 'healing'
  | 'patterns'
  | 'attachment'
  | 'inner-critic'
  | 'vulnerability'
  | 'boundaries'
  | 'regulation'
  | 'transitions'
  | 'relationships-compatibility'
  
  // Couples deck categories
  | 'emotional-intimacy'
  | 'communication'
  | 'conflict'
  | 'love-languages'
  | 'trust'
  | 'physical-intimacy'
  | 'relationship-needs'
  | 'relationship-boundaries'
  | 'family'
  | 'resentments';

export interface Card {
  id: number;
  question: string;
  reflection: string;
  category: CardCategory;
  deckType: DeckType;
}

export type ExerciseCategory = 'adults' | 'couples' | 'families';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  content: string;
  category: ExerciseCategory;
  subcategory: string;
  type: string;
  therapistId: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPlan = 'basic' | 'plus' | 'premium';

export interface FeatureAccess {
  basic: boolean;
  plus: boolean;
  premium: boolean;
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  access: FeatureAccess;
}

// Conflict Repair Rituals Types
export interface ConflictRitualSession {
  id?: string;
  user_id: string;
  partner_id?: string;
  created_at?: string;
  updated_at?: string;
  status: 'in_progress' | 'completed';
  current_step: number;
  partner_a_ready: boolean;
  partner_b_ready: boolean;
  partner_a_reflections?: {
    story: string;
    feelings: string;
    needs: string;
    shareWithPartner: boolean;
  };
  partner_b_reflections?: {
    story: string;
    feelings: string;
    needs: string;
    shareWithPartner: boolean;
  };
  partner_a_apology?: {
    regret: string;
    ownership: string;
    shareWithPartner: boolean;
  };
  partner_b_apology?: {
    regret: string;
    ownership: string;
    shareWithPartner: boolean;
  };
  partner_a_reconnection?: {
    appreciation: string;
    gesture: string;
    shareWithPartner: boolean;
  };
  partner_b_reconnection?: {
    appreciation: string;
    gesture: string;
    shareWithPartner: boolean;
  };
  partner_a_heard?: boolean;
  partner_b_heard?: boolean;
}