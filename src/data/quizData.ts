export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    id: string;
    text: string;
    type: string;
  }[];
}

export type QuizDescriptions = Record<string, string>;
export type QuizData = {
  title: string;
  questions: QuizQuestion[];
  descriptions: QuizDescriptions;
};

import {
  LOVE_LANGUAGE_QUESTIONS,
  LOVE_LANGUAGE_DESCRIPTIONS,
  ATTACHMENT_STYLE_QUESTIONS,
  ATTACHMENT_STYLE_DESCRIPTIONS,
  CONFLICT_STYLE_QUESTIONS,
  CONFLICT_STYLE_DESCRIPTIONS,
  COMMUNICATION_STYLE_QUESTIONS,
  COMMUNICATION_STYLE_DESCRIPTIONS,
  EMOTIONAL_INTELLIGENCE_QUESTIONS,
  EMOTIONAL_INTELLIGENCE_DESCRIPTIONS,
  RED_FLAG_AWARENESS_QUESTIONS,
  RED_FLAG_AWARENESS_DESCRIPTIONS,
  EMOTIONAL_REGULATION_QUESTIONS,
  EMOTIONAL_REGULATION_DESCRIPTIONS,
  RELATIONSHIP_READINESS_QUESTIONS,
  RELATIONSHIP_READINESS_DESCRIPTIONS,
  SELF_ESTEEM_QUESTIONS,
  SELF_ESTEEM_DESCRIPTIONS,
  BIG_FIVE_QUESTIONS,
  BIG_FIVE_DESCRIPTIONS,
  BOUNDARY_STYLE_QUESTIONS,
  BOUNDARY_STYLE_DESCRIPTIONS,
  VALUES_CLARIFICATION_QUESTIONS,
  VALUES_CLARIFICATION_DESCRIPTIONS
} from './quizQuestions';

export const ALL_QUIZZES: Record<string, QuizData> = {
  love: {
    title: 'Love Language Quiz',
    questions: LOVE_LANGUAGE_QUESTIONS,
    descriptions: LOVE_LANGUAGE_DESCRIPTIONS,
  },
  attachment: {
    title: 'Attachment Style Quiz',
    questions: ATTACHMENT_STYLE_QUESTIONS,
    descriptions: ATTACHMENT_STYLE_DESCRIPTIONS,
  },
  conflict: {
    title: 'Conflict Style Quiz',
    questions: CONFLICT_STYLE_QUESTIONS,
    descriptions: CONFLICT_STYLE_DESCRIPTIONS,
  },
  communication: {
    title: 'Communication Style Quiz',
    questions: COMMUNICATION_STYLE_QUESTIONS,
    descriptions: COMMUNICATION_STYLE_DESCRIPTIONS,
  },
  emotionalIntelligence: {
    title: 'Emotional Intelligence Quiz',
    questions: EMOTIONAL_INTELLIGENCE_QUESTIONS,
    descriptions: EMOTIONAL_INTELLIGENCE_DESCRIPTIONS,
  },
  redFlags: {
    title: 'Red Flag Awareness Quiz',
    questions: RED_FLAG_AWARENESS_QUESTIONS,
    descriptions: RED_FLAG_AWARENESS_DESCRIPTIONS,
  },
  emotionalRegulation: {
    title: 'Emotional Regulation Quiz',
    questions: EMOTIONAL_REGULATION_QUESTIONS,
    descriptions: EMOTIONAL_REGULATION_DESCRIPTIONS,
  },
  relationshipReadiness: {
    title: 'Relationship Readiness Quiz',
    questions: RELATIONSHIP_READINESS_QUESTIONS,
    descriptions: RELATIONSHIP_READINESS_DESCRIPTIONS,
  },
  selfEsteem: {
    title: 'Self-Esteem Quiz',
    questions: SELF_ESTEEM_QUESTIONS,
    descriptions: SELF_ESTEEM_DESCRIPTIONS,
  },
  boundary: {
  title: 'Boundary Style Quiz',
  questions: BOUNDARY_STYLE_QUESTIONS,
  descriptions: BOUNDARY_STYLE_DESCRIPTIONS,
  },
  bigFive: {
  title: 'Big Five Personality Quiz',
  questions: BIG_FIVE_QUESTIONS,
  descriptions: BIG_FIVE_DESCRIPTIONS,
  },
  values: {
    title: 'Values Clarification Quiz',
    questions: VALUES_CLARIFICATION_QUESTIONS,
    descriptions: VALUES_CLARIFICATION_DESCRIPTIONS,
  }
};
