/*
  # Add sample therapeutic exercises

  1. Changes
    - Insert sample exercises if they don't already exist
    - Use DO block for safe insertion
    - Handle potential conflicts with existing records
*/

DO $$ 
BEGIN
  -- Insert exercises only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = 'anxiety-management') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type) VALUES
    ('anxiety-management', 'Understanding Anxiety', 'Learn to identify and manage anxiety triggers and symptoms.', 'Content about understanding and managing anxiety...', 'adults', 'mental-health', 'anxiety');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = 'deep-breathing') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type) VALUES
    ('deep-breathing', 'Deep Breathing Exercise', 'Learn effective breathing techniques for relaxation and stress relief.', 'Content about deep breathing techniques...', 'adults', 'stress-management', 'anxiety');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = 'self-esteem-building') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type) VALUES
    ('self-esteem-building', 'Building Self-Esteem', 'Exercises to improve self-worth and confidence.', 'Content about building self-esteem...', 'adults', 'personal-growth', 'self-esteem');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = 'healthy-boundaries') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type) VALUES
    ('healthy-boundaries', 'Setting Healthy Boundaries', 'Learn to establish and maintain personal boundaries.', 'Content about setting boundaries...', 'adults', 'relationships', 'boundaries');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = 'active-listening') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type) VALUES
    ('active-listening', 'Active Listening Skills', 'Develop better communication skills with your partner.', 'Content about active listening...', 'couples', 'communication', 'communication');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = 'emotional-connection') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type) VALUES
    ('emotional-connection', 'Emotional Connection', 'Strengthen emotional bonds and intimacy.', 'Content about emotional connection...', 'couples', 'intimacy', 'intimacy');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = 'conflict-management') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type) VALUES
    ('conflict-management', 'Managing Conflict', 'Learn healthy ways to handle disagreements.', 'Content about managing conflict...', 'couples', 'conflict-resolution', 'communication');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = 'rebuilding-trust') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type) VALUES
    ('rebuilding-trust', 'Rebuilding Trust', 'Exercises for healing and rebuilding trust in relationships.', 'Content about rebuilding trust...', 'couples', 'trust', 'trust');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = 'family-communication') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type) VALUES
    ('family-communication', 'Family Communication', 'Tools and strategies for better family discussions.', 'Content about family communication...', 'families', 'communication', 'family-dynamics');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = 'positive-parenting') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type) VALUES
    ('positive-parenting', 'Positive Parenting', 'Effective strategies for positive discipline and connection.', 'Content about positive parenting...', 'families', 'parenting', 'parenting');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = 'sibling-relationships') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type) VALUES
    ('sibling-relationships', 'Sibling Relationships', 'Managing sibling rivalry and building positive connections.', 'Content about sibling relationships...', 'families', 'family-dynamics', 'family-dynamics');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM exercises WHERE id = 'mental-health-support') THEN
    INSERT INTO exercises (id, title, description, content, category, subcategory, type) VALUES
    ('mental-health-support', 'Supporting Mental Health', 'Help family members cope with mental health challenges.', 'Content about supporting mental health...', 'families', 'mental-health', 'mental-health');
  END IF;
END $$;