/*
  # Add quiz tables with safety checks

  1. New Tables (if they don't exist)
    - `quizzes`
    - `quiz_questions`
    - `quiz_answers`

  2. Security
    - Enable RLS
    - Add policies for access control
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view all quizzes" ON quizzes;
    DROP POLICY IF EXISTS "Therapists can manage their quizzes" ON quizzes;
    DROP POLICY IF EXISTS "Users can view quiz questions" ON quiz_questions;
    DROP POLICY IF EXISTS "Users can manage their own answers" ON quiz_answers;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create quizzes table if it doesn't exist
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  subcategory text NOT NULL,
  type text NOT NULL,
  therapist_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz_questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text,
  explanation text,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create quiz_answers table if it doesn't exist
CREATE TABLE IF NOT EXISTS quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  answers jsonb NOT NULL,
  score integer,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
DO $$ 
BEGIN
    ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create policies
DO $$ 
BEGIN
    CREATE POLICY "Users can view all quizzes"
        ON quizzes
        FOR SELECT
        TO authenticated
        USING (true);

    CREATE POLICY "Therapists can manage their quizzes"
        ON quizzes
        FOR ALL
        TO authenticated
        USING (auth.uid() = therapist_id)
        WITH CHECK (auth.uid() = therapist_id);

    CREATE POLICY "Users can view quiz questions"
        ON quiz_questions
        FOR SELECT
        TO authenticated
        USING (true);

    CREATE POLICY "Users can manage their own answers"
        ON quiz_answers
        FOR ALL
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes if they don't exist
DO $$ 
BEGIN
    CREATE INDEX IF NOT EXISTS quizzes_category_idx ON quizzes(category);
    CREATE INDEX IF NOT EXISTS quizzes_type_idx ON quizzes(type);
    CREATE INDEX IF NOT EXISTS quiz_questions_quiz_id_idx ON quiz_questions(quiz_id);
    CREATE INDEX IF NOT EXISTS quiz_questions_order_idx ON quiz_questions(order_index);
    CREATE INDEX IF NOT EXISTS quiz_answers_user_id_idx ON quiz_answers(user_id);
    CREATE INDEX IF NOT EXISTS quiz_answers_quiz_id_idx ON quiz_answers(quiz_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create updated_at trigger if it doesn't exist
DO $$ 
BEGIN
    CREATE TRIGGER update_quizzes_updated_at
        BEFORE UPDATE ON quizzes
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;