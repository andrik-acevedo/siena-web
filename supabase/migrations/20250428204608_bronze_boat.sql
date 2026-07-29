/*
  # Add sample exercises data

  1. Changes
    - Insert initial set of therapeutic exercises
    - Categories: anxiety, self-esteem, boundaries, communication, trust, family dynamics
    - Types: adults, couples, families
*/

-- Insert sample exercises
INSERT INTO exercises (id, title, description, content, category, subcategory, type) VALUES
(
  'anxiety-management',
  'Understanding Anxiety',
  'Learn to identify and manage anxiety triggers and symptoms.',
  'Content about understanding and managing anxiety...',
  'adults',
  'mental-health',
  'anxiety'
),
(
  'deep-breathing',
  'Deep Breathing Exercise',
  'Learn effective breathing techniques for relaxation and stress relief.',
  'Content about deep breathing techniques...',
  'adults',
  'stress-management',
  'anxiety'
),
(
  'self-esteem-building',
  'Building Self-Esteem',
  'Exercises to improve self-worth and confidence.',
  'Content about building self-esteem...',
  'adults',
  'personal-growth',
  'self-esteem'
),
(
  'healthy-boundaries',
  'Setting Healthy Boundaries',
  'Learn to establish and maintain personal boundaries.',
  'Content about setting boundaries...',
  'adults',
  'relationships',
  'boundaries'
),
(
  'active-listening',
  'Active Listening Skills',
  'Develop better communication skills with your partner.',
  'Content about active listening...',
  'couples',
  'communication',
  'communication'
),
(
  'emotional-connection',
  'Emotional Connection',
  'Strengthen emotional bonds and intimacy.',
  'Content about emotional connection...',
  'couples',
  'intimacy',
  'intimacy'
),
(
  'conflict-management',
  'Managing Conflict',
  'Learn healthy ways to handle disagreements.',
  'Content about managing conflict...',
  'couples',
  'conflict-resolution',
  'communication'
),
(
  'rebuilding-trust',
  'Rebuilding Trust',
  'Exercises for healing and rebuilding trust in relationships.',
  'Content about rebuilding trust...',
  'couples',
  'trust',
  'trust'
),
(
  'family-communication',
  'Family Communication',
  'Tools and strategies for better family discussions.',
  'Content about family communication...',
  'families',
  'communication',
  'family-dynamics'
),
(
  'positive-parenting',
  'Positive Parenting',
  'Effective strategies for positive discipline and connection.',
  'Content about positive parenting...',
  'families',
  'parenting',
  'parenting'
),
(
  'sibling-relationships',
  'Sibling Relationships',
  'Managing sibling rivalry and building positive connections.',
  'Content about sibling relationships...',
  'families',
  'family-dynamics',
  'family-dynamics'
),
(
  'mental-health-support',
  'Supporting Mental Health',
  'Help family members cope with mental health challenges.',
  'Content about supporting mental health...',
  'families',
  'mental-health',
  'mental-health'
);