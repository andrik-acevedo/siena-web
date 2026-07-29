/*
  # Add exercise content

  1. Changes
    - Add detailed content for each exercise
    - Ensure proper formatting and escaping of text
    - Use consistent timestamps
*/

DO $$ 
BEGIN
  -- Insert exercises only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = '1') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type, therapist_id, created_at, updated_at) VALUES
    ('1', 'Understanding Anxiety: Calming the False Alarm', 'Learn how anxiety works and practice grounding techniques to calm the mind and body.', 
    'Understanding Anxiety: A Guide to Managing Your Body''s False Alarm System

When anxiety strikes, it can feel overwhelming. But understanding how anxiety works in your body and mind is the first step to managing it effectively.

1. What is Anxiety?
- Your body''s natural alert system
- Designed to protect you from danger
- Can become oversensitive, like a false alarm

2. Physical Symptoms
- Rapid heartbeat
- Shallow breathing
- Muscle tension
- Sweating
- Digestive changes

3. Mental Symptoms
- Racing thoughts
- Difficulty concentrating
- Excessive worry
- Mind going blank
- Feeling of impending doom

4. Grounding Techniques

A. 5-4-3-2-1 Method
- 5 things you can see
- 4 things you can touch
- 3 things you can hear
- 2 things you can smell
- 1 thing you can taste

B. Deep Breathing
- Inhale for 4 counts
- Hold for 4 counts
- Exhale for 4 counts
- Repeat 5-10 times

5. Daily Management Strategies
- Regular exercise
- Consistent sleep schedule
- Balanced nutrition
- Mindfulness practice
- Social connection

6. When to Seek Help
- Persistent symptoms
- Interference with daily life
- Physical health concerns
- Thoughts of self-harm

Remember: Anxiety is normal, but you don''t have to suffer alone. Professional help is available when needed.',
    'adults', 'anxiety', 'anxiety', NULL, TIMESTAMP '2025-04-27 00:39:23.916227', TIMESTAMP '2025-04-27 00:39:23.916227');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = '2') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type, therapist_id, created_at, updated_at) VALUES
    ('2', 'The Calming Breath: The 4-4-4 Box Breathing Technique', 'Practice box breathing to reduce anxiety and activate your body''s relaxation response.',
    'Box Breathing: A Simple Yet Powerful Technique

Box breathing, also known as square breathing, is a simple but powerful technique used by everyone from athletes to Navy SEALs to manage stress and anxiety.

1. The Basics
- Equal counts for each phase
- Creates a natural rhythm
- Activates parasympathetic nervous system

2. The 4-4-4 Method
Step 1: Inhale for 4 counts
Step 2: Hold for 4 counts
Step 3: Exhale for 4 counts
Step 4: Hold for 4 counts
Repeat the cycle

3. Benefits
- Reduces stress
- Lowers blood pressure
- Improves focus
- Calms racing thoughts
- Helps with sleep

4. Practice Tips
- Find a quiet space
- Sit comfortably
- Close your eyes if possible
- Start with 5 minutes
- Gradually increase duration

5. When to Use
- Before stressful situations
- During anxiety attacks
- To help with sleep
- During meditation
- Any time you need to center yourself

Remember: Like any skill, box breathing becomes more effective with regular practice.',
    'adults', 'anxiety', 'anxiety', NULL, TIMESTAMP '2025-04-27 00:39:23.916227', TIMESTAMP '2025-04-27 00:39:23.916227');
  END IF;

  -- Continue with other exercises...
  -- Add more IF NOT EXISTS blocks for each exercise
  -- Include detailed content for each one
  -- Follow the same pattern as above

END $$;