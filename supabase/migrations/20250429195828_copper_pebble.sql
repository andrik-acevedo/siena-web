/*
  # Add sample quiz data

  1. Changes
    - Insert sample quizzes with proper UUID values
    - Insert sample questions for each quiz
    - Use gen_random_uuid() for IDs
*/

-- Insert sample quizzes
DO $$ 
DECLARE
  attachment_quiz_id uuid := gen_random_uuid();
  love_languages_quiz_id uuid := gen_random_uuid();
  relationship_patterns_quiz_id uuid := gen_random_uuid();
BEGIN

-- Insert quizzes
INSERT INTO quizzes (id, title, description, category, subcategory, type) VALUES
(
  attachment_quiz_id,
  'Attachment Style Assessment',
  'Understand your attachment style and how it influences your relationships',
  'relationships',
  'attachment',
  'assessment'
),
(
  love_languages_quiz_id,
  'Love Languages Quiz',
  'Discover your primary and secondary love languages',
  'relationships',
  'communication',
  'assessment'
),
(
  relationship_patterns_quiz_id,
  'Relationship Patterns Quiz',
  'Identify recurring patterns in your relationships',
  'relationships',
  'patterns',
  'assessment'
);

-- Insert sample questions for Attachment Style quiz
INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, order_index) VALUES
(
  attachment_quiz_id,
  'How do you typically react when your partner needs space?',
  '[
    {"id": "a", "text": "I get anxious and try to stay close"},
    {"id": "b", "text": "I feel relieved and enjoy my own space"},
    {"id": "c", "text": "I feel neutral and respect their needs"},
    {"id": "d", "text": "I feel abandoned and try to fix things"}
  ]',
  null,
  1
),
(
  attachment_quiz_id,
  'When conflicts arise in relationships, I tend to:',
  '[
    {"id": "a", "text": "Try to resolve things immediately"},
    {"id": "b", "text": "Need time to process alone"},
    {"id": "c", "text": "Stay engaged but calm"},
    {"id": "d", "text": "Feel overwhelmed with emotion"}
  ]',
  null,
  2
);

-- Insert sample questions for Love Languages quiz
INSERT INTO quiz_questions (quiz_id, question, options, correct_answer, order_index) VALUES
(
  love_languages_quiz_id,
  'What makes you feel most appreciated?',
  '[
    {"id": "a", "text": "Receiving thoughtful gifts"},
    {"id": "b", "text": "Quality time together"},
    {"id": "c", "text": "Physical touch and affection"},
    {"id": "d", "text": "Words of appreciation"},
    {"id": "e", "text": "Acts of service"}
  ]',
  null,
  1
),
(
  love_languages_quiz_id,
  'When you want to show someone you care, you typically:',
  '[
    {"id": "a", "text": "Buy or make them something special"},
    {"id": "b", "text": "Plan dedicated time together"},
    {"id": "c", "text": "Give hugs or physical affection"},
    {"id": "d", "text": "Tell them what you appreciate about them"},
    {"id": "e", "text": "Do something helpful for them"}
  ]',
  null,
  2
);

END $$;