/*
  # Add exercise content

  1. Changes
    - Add exercise content for each record
    - Keep all other fields unchanged
*/

DO $$ 
BEGIN
  -- Insert exercises only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = '1') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type, therapist_id, created_at, updated_at) VALUES
    ('1', 'Understanding Anxiety: Calming the False Alarm', 'Learn how anxiety works and practice grounding techniques to calm the mind and body.', 'Content for understanding anxiety and calming techniques...', 'adults', 'anxiety', 'anxiety', NULL, TIMESTAMP '2025-04-27 00:39:23.916227', TIMESTAMP '2025-04-27 00:39:23.916227');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = '2') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type, therapist_id, created_at, updated_at) VALUES
    ('2', 'The Calming Breath: The 4-4-4 Box Breathing Technique', 'Practice box breathing to reduce anxiety and activate your body''s relaxation response.', 'Content for box breathing technique...', 'adults', 'anxiety', 'anxiety', NULL, TIMESTAMP '2025-04-27 00:39:23.916227', TIMESTAMP '2025-04-27 00:39:23.916227');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = '3') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type, therapist_id, created_at, updated_at) VALUES
    ('3', 'Building Self-Esteem: Strengthening Your Inner Voice', 'Explore strategies for improving self-esteem through compassionate self-talk.', 'Content for building self-esteem...', 'adults', 'self-esteem', 'self-esteem', NULL, TIMESTAMP '2025-04-27 00:39:23.916227', TIMESTAMP '2025-04-27 00:39:23.916227');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = '5') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type, therapist_id, created_at, updated_at) VALUES
    ('5', 'Active Listening Skills: The Power of Being Fully Present', 'Develop your active listening skills to improve communication and deepen relationships.', 'Content for active listening skills...', 'adults', 'communication', 'communication', NULL, TIMESTAMP '2025-04-27 00:39:23.916227', TIMESTAMP '2025-04-27 00:39:23.916227');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = '6') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type, therapist_id, created_at, updated_at) VALUES
    ('6', 'Rebuilding Trust: Taking Steps Toward Repair', 'Learn structured steps to repair trust through accountability and consistent actions.', 'Content for rebuilding trust...', 'adults', 'trust', 'trust', NULL, TIMESTAMP '2025-04-27 00:39:23.916227', TIMESTAMP '2025-04-27 00:39:23.916227');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = '7') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type, therapist_id, created_at, updated_at) VALUES
    ('7', 'Building an Emotional Connection: Creating Space for Deeper Bonding', 'Enhance emotional connection through intentional check-ins and reflective listening.', 'Content for building emotional connection...', 'adults', 'intimacy', 'intimacy', NULL, TIMESTAMP '2025-04-27 00:39:23.916227', TIMESTAMP '2025-04-27 00:39:23.916227');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = '8') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type, therapist_id, created_at, updated_at) VALUES
    ('8', 'Managing Conflict: Practicing the Imago Dialogue', 'Use the Imago Dialogue structure to manage conflict with empathy and understanding.', 'Content for managing conflict...', 'adults', 'communication', 'communication', NULL, TIMESTAMP '2025-04-27 00:39:23.916227', TIMESTAMP '2025-04-27 00:39:23.916227');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = '9') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type, therapist_id, created_at, updated_at) VALUES
    ('9', 'Improving Family Communication: The Family Meeting Guide', 'Facilitate open, respectful family conversations through structured family meetings.', 'Content for family communication...', 'adults', 'family-dynamics', 'family-dynamics', NULL, TIMESTAMP '2025-04-27 00:39:23.916227', TIMESTAMP '2025-04-27 00:39:23.916227');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = '10') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type, therapist_id, created_at, updated_at) VALUES
    ('10', 'Positive Parenting Strategies', 'Strengthen parenting through connection-based strategies and clear, compassionate guidance.', 'Content for positive parenting...', 'adults', 'parenting', 'parenting', NULL, TIMESTAMP '2025-04-27 00:39:23.916227', TIMESTAMP '2025-04-27 00:39:23.916227');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = '11') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type, therapist_id, created_at, updated_at) VALUES
    ('11', 'Strengthening Sibling Relationships', 'Support healthy sibling bonds through conflict resolution and cooperative strategies.', 'Content for sibling relationships...', 'adults', 'family-dynamics', 'family-dynamics', NULL, TIMESTAMP '2025-04-27 00:39:23.916227', TIMESTAMP '2025-04-27 00:39:23.916227');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = '12') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type, therapist_id, created_at, updated_at) VALUES
    ('12', 'Supporting Family Mental Health', 'Encourage open mental health conversations and build emotional safety within the family.', 'Content for family mental health...', 'adults', 'family-dynamics', 'family-dynamics', NULL, TIMESTAMP '2025-04-27 00:39:23.916227', TIMESTAMP '2025-04-27 00:39:23.916227');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = '13') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type, therapist_id, created_at, updated_at) VALUES
    ('13', 'Managing Depression', 'Explore effective strategies to manage depression and build a personalized self-care plan.', 'Content for managing depression...', 'adults', 'mental-health', 'mental-health', NULL, TIMESTAMP '2025-04-27 00:39:23.916227', TIMESTAMP '2025-04-27 00:39:23.916227');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = '14') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type, therapist_id, created_at, updated_at) VALUES
    ('14', 'Stress Management', 'Learn effective strategies to manage and reduce daily stress.', 'Content for stress management...', 'adults', 'mental-health', 'mental-health', NULL, TIMESTAMP '2025-04-27 00:39:23.916227', TIMESTAMP '2025-04-27 00:39:23.916227');
  END IF;

END $$;