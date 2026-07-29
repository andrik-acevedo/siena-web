import { Card, CardTopic } from '../types';

export const DECK_DESCRIPTIONS = {
  individual: {
    title: "Reflection Deck",
    description: "A tool for self-exploration, emotional intelligence, and personal growth",
    categories: [
      {
        id: "emotional-awareness",
        title: "Emotional Awareness",
        description: "Develop your emotional landscape"
      },
      {
        id: "self-worth",
        title: "Self-Worth & Confidence",
        description: "Build authentic self-esteem and inner strength"
      },
      {
        id: "healing",
        title: "Healing Past Wounds",
        description: "Process and integrate past experiences"
      },
      {
        id: "patterns",
        title: "Breaking Patterns",
        description: "Identify and transform recurring life patterns"
      },
      {
        id: "attachment",
        title: "Attachment Styles",
        description: "Understand your attachment patterns"
      },
      {
        id: "inner-critic",
        title: "Inner Critic & Self-Talk",
        description: "Transform your internal dialogue"
      },
      {
        id: "vulnerability",
        title: "Vulnerability & Authenticity",
        description: "Embrace authentic self-expression"
      },
      {
        id: "boundaries-assertiveness",
        title: "Boundaries & Assertiveness",
        description: "Set healthy limits and communicate needs"
      },
      {
        id: "emotional-regulation",
        title: "Emotional Regulation",
        description: "Develop skills for emotional balance"
      },
      {
        id: "life-transitions-growth",
        title: "Life Transitions & Growth",
        description: "Navigate change with resilience"
      },
       {
        id: "relationships-compatibility",
        title: "Relationships & Compatibility",
        description: "Explore alignment and long-term fit in your relationships."
      },
        {
        id: "self-discovery-growth",
        title: "Self-Discovery & Growth",
        description: "Deeply explore the truths that shape your life."
      }
    ]
  },
  couples: {
  title: "Couples Connection Deck",
  description: "Strengthen your relationship through meaningful conversations",
  categories: [
    {
      id: "emotional-intimacy",
      title: "Emotional Intimacy",
      description: "Deepen your emotional connection"
    },
    {
      id: "communication",
      title: "Communication Styles",
      description: "Improve how you talk and listen to each other"
    },
    {
      id: "conflict",
      title: "Conflict Resolution",
      description: "Transform disagreements into understanding"
    },
    {
      id: "love-languages",
      title: "Love Languages",
      description: "Discover how to express and receive love"
    },
    {
      id: "trust",
      title: "Trust & Security",
      description: "Build a stronger foundation of trust"
    },
    {
      id: "physical-intimacy",
      title: "Physical Connection",
      description: "Explore physical and emotional closeness"
    },
    {
      id: "relationship-needs",
      title: "Relationship Needs",
      description: "Understand and meet each other's needs"
    },
    {
      id: "relationship-boundaries",
      title: "Relationship Boundaries",
      description: "Create healthy space and connection"
    },
    {
      id: "family",
      title: "Family & Background",
      description: "Explore how your past shapes your present"
    },
    {
      id: "sexual-intimacy",
      title: "Sensual Spark",
      description: "Explore desires, fantasies, and touch to deepen your sexual connection."
    },
    {
      id: "romantic-play",
      title: "Playful Passion",
      description: "Add flirtation, dares, and light-hearted erotic fun into your relationship."
    },
    {
      id: "resentments",
      title: "Healing & Growth",
      description: "Address unspoken issues and grow together"
    },

    // ---- NEW CATEGORIES ----
    {
      id: "breakup-closure",
      title: "Breakup & Closure",
      description: "Find language for endings, repair, and letting go."
    },
    {
      id: "money-and-finances",
      title: "Money & Finances",
      description: "Align budgets, beliefs, and day-to-day money habits."
    },
    {
      id: "future-vision",
      title: "Future Vision",
      description: "Dream, plan, and choose the next chapter together."
    },
    {
      id: "career-and-ambition",
      title: "Career & Ambition",
      description: "Balance work, goals, and support for each other."
    },
    {
      id: "tech-and-privacy",
      title: "Tech & Privacy",
      description: "Screens, social, transparency, and digital trust."
    },
    {
      id: "rituals-and-routines",
      title: "Rituals & Routines",
      description: "Small daily/weekly habits that keep love strong."
    },
    {
      id: "adventure-and-play",
      title: "Adventure & Play",
      description: "Novelty, trips, and bringing back the spark."
    },
    {
      id: "desire-alignment",
      title: "Desire Alignment",
      description: "Gentle, practical conversations about sex and turn-ons."
    },
    {
  id: "health-wellbeing",
  title: "Health & Wellbeing",
  description: "Care, stress, and lifestyle as a team."
}
    ]
  }
};
export const CARDS: Card[] = [
  {
    id: 1,
    question: "What emotion scares you the most, and why?",
    reflection: "Fear around certain emotions often points to past experiences or internalized beliefs. Consider why this emotion feels threatening. What does it represent to you? How might facing it change your relationship with yourself?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 2,
    question: "When did you first learn that some emotions were 'bad' or unacceptable?",
    reflection: "Our early environments shape emotional acceptance. Reflect on the messages you received about emotions growing up. How do these beliefs affect how you express or suppress emotions today?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 3,
    question: "Which emotion do you find easiest to express, and why?",
    reflection: "We often express emotions that feel safe or familiar. What does this ease tell you about your emotional conditioning or personality? How does this impact your relationships?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 4,
    question: "What is your emotional 'go-to' when you're under pressure?",
    reflection: "When under stress, we often fall back on habitual emotional responses. Identify your default. Is it anger, withdrawal, humor, or something else? How does this serve or limit you?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 5,
    question: "How does your body react to emotions you find uncomfortable?",
    reflection: "Emotions manifest physically as well as mentally. Where do you feel tension or ease? Notice what your body communicates during moments of emotional discomfort and consider responding with mindful compassion."
    ,
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 6,
    question: "What emotion feels the most misunderstood by others?",
    reflection: "Feeling misunderstood can deepen emotional isolation. Which emotion do you feel others misinterpret in you? What could help bridge that gap in understanding?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 7,
    question: "How do you react when someone dismisses your emotions?",
    reflection: "Emotional invalidation can trigger strong responses. Do you withdraw, defend, or overexplain? Explore how you learned to cope with emotional dismissal and how you'd like to respond moving forward.",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 8,
    question: "What emotion feels the most empowering to you, and why?",
    reflection: "Empowering emotions reflect our core values and strengths. Identify when you feel most powerful and grounded. How can you cultivate more of these moments in daily life?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 9,
    question: "What emotion do you avoid because it feels too vulnerable?",
    reflection: "Vulnerability often lies beneath emotions we avoid. Reflect on what this avoidance protects you from. What might happen if you allowed yourself to feel and express it more freely?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 10,
    question: "What emotions are easiest to fake, and why?",
    reflection: "Sometimes we perform emotions to fit social norms. Consider why you might mask your true feelings. What does this reveal about your inner emotional landscape and external pressures?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 11,
    question: "What emotion do you associate with strength, and which with weakness?",
    reflection: "We often categorize emotions as strong or weak based on cultural or personal beliefs. Examine these assumptions. How do they shape your emotional expression and acceptance?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 12,
    question: "What is the most complicated emotion you experience, and why?",
    reflection: "Complex emotions can arise from conflicting desires or fears. Identify an emotion that feels layered or confusing. What are the different parts contributing to it?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 13,
    question: "How does humor play a role in your emotional expression?",
    reflection: "Humor can connect or protect. Consider when you use humor: Is it to ease tension, deflect, or bond? How does humor serve or hinder your authentic emotional expression?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 14,
    question: "What is your first instinct when you feel emotionally exposed?",
    reflection: "Emotional exposure can trigger defensive reactions. Do you tend to retreat, attack, or seek connection? What does this pattern say about your emotional safety?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 15,
    question: "What emotions feel easier to process in solitude, and which require connection?",
    reflection: "Some emotions we navigate better alone, while others benefit from relational support. Identify which is which for you, and consider why these differences exist."
    ,
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 16,
    question: "How does your cultural background influence how you express emotions?",
    reflection: "Culture shapes emotional expression. Reflect on cultural values that influence which emotions feel acceptable or shameful. How do these beliefs shape your emotional world today?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 17,
    question: "What emotions feel hardest to describe with words?",
    reflection: "Some emotions are nuanced or beyond language. When words fail, how do you express these emotions? Through art, music, movement, or metaphor?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 18,
    question: "What emotion do you feel the least control over, and why?",
    reflection: "Losing control of emotions can be unsettling. Identify which emotions feel overpowering and explore why. What might help you develop more agency in these moments?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 19,
    question: "How do you recognize when you're emotionally disconnected?",
    reflection: "Disconnection can be subtle. Notice when you feel numb or disengaged. What thoughts or behaviors signal this, and what helps you reconnect with your emotional world?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
    id: 20,
    question: "What emotion do you feel most misunderstood about, and why?",
    reflection: "Feeling misunderstood can deepen isolation. Identify the emotions that others misinterpret. What would help others understand you better in these moments?",
    category: "emotional-awareness",
    deckType: "individual"
  },
  {
  id: 21,
  question: "What are three compliments you struggle to accept?",
  reflection: "Imposter syndrome and low self-worth often make it difficult to accept praise. Consider why these particular compliments feel challenging. Are they related to areas where you doubt yourself? Practice this self-affirmation exercise: State one of these compliments to yourself, then list three specific examples that support its truth.",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 22,
  question: "What would you do differently if you truly believed in yourself?",
  reflection: "Our self-doubt often acts as an invisible barrier, holding us back from pursuing our dreams and living authentically. Imagine yourself free from self-doubt: What would change in your relationships, career, or personal growth? Choose one small action you can take today as if you already had that confidence.",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 23,
  question: "What part of yourself do you need to stop apologizing for?",
  reflection: "We often apologize for aspects of ourselves that don't actually require apology. This habit can stem from past criticism or societal pressures. Identify one authentic part of yourself that you frequently downplay or apologize for. Practice embracing this aspect with compassion and understanding.",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 24,
  question: "What limiting belief about yourself do you need to let go of?",
  reflection: "Limiting beliefs often hold us back from reaching our full potential. Identify one belief that no longer serves you: Where did it come from? How can you replace it with a more empowering belief?",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 25,
  question: "What achievement are you most proud of?",
  reflection: "Celebrating our achievements boosts self-worth. Reflect on what makes this accomplishment meaningful: What challenges did you overcome? How did it shape your sense of self?",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 26,
  question: "What do you love most about yourself?",
  reflection: "Self-love is the foundation of self-worth. Reflect on your strengths, qualities, and values: What makes you unique? How can you nurture these aspects of yourself?",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 27,
  question: "What would you say to your younger self if you could?",
  reflection: "This reflection allows you to access both compassion for your past self and wisdom from your current perspective. What comfort, guidance, or reassurance would you offer? The qualities you wish to extend to your younger self are often exactly what your present self needs.",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 28,
  question: "What do you need to forgive yourself for?",
  reflection: "Self-forgiveness is a powerful step toward self-worth. Reflect on a past mistake or regret: What lesson did you learn? How can you release guilt and embrace self-compassion?",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 29,
  question: "What does self-acceptance mean to you?",
  reflection: "Self-acceptance is the foundation of self-worth. Reflect on what it means to fully accept yourself: How can you embrace your strengths and imperfections? What steps can you take toward greater self-acceptance?",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 30,
  question: "What would you do if you weren't afraid of failure?",
  reflection: "Fear of failure often limits our potential. Reflect on what you would pursue if failure weren't a concern: What dreams or goals would you chase? How can you reframe failure as a learning opportunity?",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 31,
  question: "What do you need to hear from yourself right now?",
  reflection: "Self-talk shapes our self-worth. Reflect on what you need to hear: Encouragement, reassurance, or validation? Practice speaking to yourself with kindness and compassion.",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 32,
  question: "What does confidence look like to you?",
  reflection: "Confidence is often misunderstood. Reflect on your definition: Is it about external validation or inner certainty? How can you cultivate authentic confidence?",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 33,
  question: "What would you attempt if you knew you couldn't fail?",
  reflection: "Fear of failure often limits our potential. Reflect on what you would pursue if failure weren't a concern: What dreams or goals would you chase? How can you reframe failure as a learning opportunity?",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 34,
  question: "What do you need to celebrate about yourself today?",
  reflection: "Celebrating small wins builds self-worth. Reflect on what you've accomplished, no matter how small: What progress have you made? How can you acknowledge and celebrate yourself?",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 35,
  question: "What do you need to let go of to feel more confident?",
  reflection: "Letting go of self-doubt, comparison, or past mistakes can free you to embrace confidence. Reflect on what's holding you back: What beliefs or habits no longer serve you?",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 36,
  question: "What does self-respect mean to you?",
  reflection: "Self-respect is the foundation of self-worth. Reflect on what it means to respect yourself: How do you honor your needs, values, and boundaries?",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 37,
  question: "What would you do if you truly valued yourself?",
  reflection: "Self-worth influences our choices and actions. Reflect on how valuing yourself would change your life: What boundaries would you set? What opportunities would you pursue?",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 38,
  question: "What belief about yourself would you like to change?",
  reflection: "Limiting beliefs can hinder self-worth. Identify one belief you hold about yourself that feels restrictive. What evidence exists that contradicts this belief, and how can you begin to challenge it?",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 39,
  question: "What does it mean to be 'enough' to you?",
  reflection: "The belief that you're enough is central to self-worth. Reflect on what 'enough' means in your life. How can you practice accepting your inherent worthiness today?",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 40,
  question: "What would you say to someone who feels unworthy?",
  reflection: "Sometimes, it's easier to offer compassion to others than to ourselves. Imagine a loved one struggling with self-worth. What would you tell them? How can you offer the same kindness to yourself?",
  category: "self-worth",
  deckType: "individual"
},
{
  id: 41,
  question: "How has your childhood shaped your current relationships?",
  reflection: "Our early experiences create templates for how we relate to others. Consider your attachment style: Do you tend to seek excessive closeness or maintain emotional distance? Understanding these patterns is the first step to healing. Notice one way your past influences your present relationships, then imagine how you'd like to respond differently.",
  category: "healing",
  deckType: "individual"
},
{
  id: 42,
  question: "What message from your past do you need to unlearn?",
  reflection: "We often carry outdated beliefs or 'rules' from our past that no longer serve us. These might be explicit messages we received or conclusions we drew to survive difficult situations. Identify one such belief and ask: Is this still true? What new truth would better support my growth?",
  category: "healing",
  deckType: "individual"
},
{
  id: 43,
  question: "What would you say to your younger self if you could?",
  reflection: "This reflection allows you to access both compassion for your past self and wisdom from your current perspective. What comfort, guidance, or reassurance would you offer? The qualities you wish to extend to your younger self are often exactly what your present self needs.",
  category: "healing",
  deckType: "individual"
},
{
  id: 44,
  question: "What past hurt still affects you today?",
  reflection: "Unresolved pain from the past often influences our present. Reflect on a specific hurt: How does it show up in your life today? What steps can you take to heal and move forward?",
  category: "healing",
  deckType: "individual"
},
{
  id: 45,
  question: "What do you need to forgive yourself for?",
  reflection: "Self-forgiveness is a powerful step toward healing. Reflect on a past mistake or regret: What lesson did you learn? How can you release guilt and embrace self-compassion?",
  category: "healing",
  deckType: "individual"
},
{
  id: 46,
  question: "What do you need to forgive others for?",
  reflection: "Holding onto resentment can keep us stuck in the past. Reflect on what you need to forgive: How has this hurt affected you? What would forgiveness feel like?",
  category: "healing",
  deckType: "individual"
},
{
  id: 47,
  question: "What childhood memory still brings up strong emotions?",
  reflection: "Childhood memories often hold clues to our present struggles. Reflect on a memory that still affects you: What emotions does it bring up? How can you process and integrate this experience?",
  category: "healing",
  deckType: "individual"
},
{
  id: 48,
  question: "What do you need to grieve from your past?",
  reflection: "Grieving is an essential part of healing. Reflect on what you need to grieve: A lost opportunity, a broken relationship, or unmet expectations? Allow yourself to feel and process this loss.",
  category: "healing",
  deckType: "individual"
},
{
  id: 49,
  question: "What do you need to reclaim from your past?",
  reflection: "Healing often involves reclaiming lost parts of ourselves. Reflect on what you need to reclaim: A sense of safety, joy, or self-expression? How can you nurture this part of yourself?",
  category: "healing",
  deckType: "individual"
},
{
  id: 50,
  question: "What do you need to let go of from your past?",
  reflection: "Letting go is a key part of healing. Reflect on what you need to release: A grudge, a belief, or a role you no longer need to play? How can you create space for new growth?",
  category: "healing",
  deckType: "individual"
},
{
  id: 51,
  question: "What do you need to honor from your past?",
  reflection: "Healing involves honoring our experiences, even the painful ones. Reflect on what you need to honor: A lesson learned, a strength gained, or a relationship that shaped you?",
  category: "healing",
  deckType: "individual"
},
{
  id: 52,
  question: "What do you need to protect yourself from in the future?",
  reflection: "Healing involves learning from the past to protect ourselves in the future. Reflect on what you need to guard against: Toxic relationships, self-doubt, or unhealthy patterns?",
  category: "healing",
  deckType: "individual"
},
{
  id: 53,
  question: "What do you need to embrace about your past?",
  reflection: "Healing involves embracing all parts of our story. Reflect on what you need to accept: A mistake, a loss, or a part of yourself you've rejected?",
  category: "healing",
  deckType: "individual"
},
{
  id: 54,
  question: "What do you need to celebrate about your past?",
  reflection: "Healing involves celebrating our resilience. Reflect on what you need to celebrate: A challenge you overcame, a lesson you learned, or a strength you developed?",
  category: "healing",
  deckType: "individual"
},
{
  id: 55,
  question: "What do you need to release to move forward?",
  reflection: "Healing involves releasing what no longer serves us. Reflect on what you need to let go of: A belief, a habit, or a relationship? How can you create space for new growth?",
  category: "healing",
  deckType: "individual"
},
{
  id: 56,
  question: "What do you need to forgive yourself for?",
  reflection: "Self-forgiveness is a powerful step toward healing. Reflect on a past mistake or regret: What lesson did you learn? How can you release guilt and embrace self-compassion?",
  category: "healing",
  deckType: "individual"
},
{
  id: 57,
  question: "What do you need to forgive others for?",
  reflection: "Holding onto resentment can keep us stuck in the past. Reflect on what you need to forgive: How has this hurt affected you? What would forgiveness feel like?",
  category: "healing",
  deckType: "individual"
},
{
  id: 58,
  question: "What do you need to grieve from your past?",
  reflection: "Grieving is an essential part of healing. Reflect on what you need to grieve: A lost opportunity, a broken relationship, or unmet expectations? Allow yourself to feel and process this loss.",
  category: "healing",
  deckType: "individual"
},
{
  id: 59,
  question: "What do you need to reclaim from your past?",
  reflection: "Healing often involves reclaiming lost parts of ourselves. Reflect on what you need to reclaim: A sense of safety, joy, or self-expression? How can you nurture this part of yourself?",
  category: "healing",
  deckType: "individual"
},
{
  id: 60,
  question: "What do you need to let go of from your past?",
  reflection: "Letting go is a key part of healing. Reflect on what you need to release: A grudge, a belief, or a role you no longer need to play? How can you create space for new growth?",
  category: "healing",
  deckType: "individual"
},
{
  id: 61,
  question: "What recurring situation keeps showing up in your life?",
  reflection: "Patterns often repeat until we learn their lesson. Think about a situation that seems to keep occurring: What's the common thread? What need or wound might this pattern be highlighting? Consider how you can respond differently next time to create a new outcome.",
  category: "patterns",
  deckType: "individual"
},
{
  id: 62,
  question: "What's your typical response to stress or conflict?",
  reflection: "Our automatic responses to stress often reflect learned patterns from childhood. Notice your default reaction: Do you tend to withdraw, become defensive, or try to control? Understanding these patterns is the first step to choosing new responses that better serve your current needs.",
  category: "patterns",
  deckType: "individual"
},
{
  id: 63,
  question: "What belief about yourself keeps you stuck?",
  reflection: "Core beliefs shape our patterns of behavior and relationship. Identify a limiting belief that influences your choices. Where did this belief come from? How might challenging this belief create space for new patterns to emerge?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 64,
  question: "What habit do you want to break, and why?",
  reflection: "Habits are often tied to deeper emotional needs or patterns. Reflect on a habit you'd like to change: What purpose does it serve? What healthier alternative could you replace it with?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 65,
  question: "What role do you often play in relationships?",
  reflection: "We often fall into familiar roles, such as the caretaker, the pleaser, or the rebel. Reflect on your default role: Does it serve you well? How might stepping out of this role create healthier dynamics?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 66,
  question: "What pattern from your family do you still carry?",
  reflection: "Family patterns often unconsciously shape our behavior. Reflect on a pattern you inherited: Is it helping or hindering you? How can you create a new pattern that aligns with your values?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 67,
  question: "What do you do when you feel overwhelmed?",
  reflection: "Our responses to overwhelm often reveal ingrained patterns. Reflect on your go-to coping mechanisms: Are they healthy or harmful? What new strategies could you try?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 68,
  question: "What pattern do you notice in your self-talk?",
  reflection: "Our inner dialogue often follows familiar patterns. Reflect on your self-talk: Is it kind and supportive, or critical and harsh? How can you shift it to be more empowering?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 69,
  question: "What do you do when you feel rejected?",
  reflection: "Rejection often triggers specific patterns of behavior. Reflect on your response: Do you withdraw, seek reassurance, or lash out? How can you respond in a way that honors your needs?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 70,
  question: "What pattern do you see in your romantic relationships?",
  reflection: "Romantic relationships often reveal recurring patterns. Reflect on your relationship history: What themes or dynamics keep showing up? How can you break the cycle?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 71,
  question: "What do you do when you feel unworthy?",
  reflection: "Feelings of unworthiness often trigger specific behaviors. Reflect on your response: Do you overcompensate, withdraw, or seek validation? How can you cultivate self-worth instead?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 72,
  question: "What pattern do you notice in your friendships?",
  reflection: "Friendships often reflect our relational patterns. Reflect on your friendships: Do you tend to take on a specific role or dynamic? How can you create more balanced relationships?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 73,
  question: "What do you do when you feel criticized?",
  reflection: "Criticism often triggers defensive or avoidant patterns. Reflect on your response: Do you shut down, argue, or internalize the criticism? How can you respond with curiosity and self-compassion?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 74,
  question: "What pattern do you notice in your work life?",
  reflection: "Work often reveals patterns around achievement, perfectionism, or people-pleasing. Reflect on your work habits: Are they serving you well? How can you create healthier boundaries?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 75,
  question: "What do you do when you feel lonely?",
  reflection: "Loneliness often triggers specific behaviors. Reflect on your response: Do you isolate yourself, seek distractions, or reach out to others? How can you meet your need for connection in a healthy way?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 76,
  question: "What pattern do you notice in your decision-making?",
  reflection: "Our decision-making often follows familiar patterns. Reflect on your process: Do you overthink, avoid decisions, or rush into them? How can you make choices that align with your values?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 77,
  question: "What do you do when you feel angry?",
  reflection: "Anger often triggers specific patterns of behavior. Reflect on your response: Do you suppress it, express it explosively, or channel it constructively? How can you respond to anger in a way that honors your feelings?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 78,
  question: "What pattern do you notice in your self-care habits?",
  reflection: "Self-care often reflects our deeper patterns around worthiness and boundaries. Reflect on your habits: Do you prioritize self-care, neglect it, or feel guilty about it? How can you create a more balanced approach?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 79,
  question: "What do you do when you feel anxious?",
  reflection: "Anxiety often triggers specific coping mechanisms. Reflect on your response: Do you avoid, overprepare, or seek reassurance? How can you respond to anxiety with self-compassion?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 80,
  question: "What pattern do you want to break most?",
  reflection: "Breaking patterns starts with awareness. Reflect on the pattern you most want to change: What triggers it? What steps can you take to create a new, healthier pattern?",
  category: "patterns",
  deckType: "individual"
},
{
  id: 81,
  question: "How do you typically react when someone gets too close?",
  reflection: "Our attachment style influences how we respond to intimacy. Notice your comfort level with emotional closeness: Do you tend to pull away or cling tighter? Understanding your attachment pattern can help you develop more secure ways of connecting.",
  category: "attachment",
  deckType: "individual"
},
{
  id: 82,
  question: "What fears come up for you in relationships?",
  reflection: "Attachment-related fears often stem from early experiences with caregivers. Reflect on your relationship anxieties: Fear of abandonment? Fear of being controlled? Recognizing these fears can help you respond to them with greater awareness and self-compassion.",
  category: "attachment",
  deckType: "individual"
},
{
  id: 83,
  question: "How do you handle separation from loved ones?",
  reflection: "Our response to separation often reveals our attachment style. Consider your typical reaction: Do you worry excessively? Shut down emotionally? Understanding these patterns can help you develop more secure attachment behaviors.",
  category: "attachment",
  deckType: "individual"
},
{
  id: 84,
  question: "What do you need to feel secure in a relationship?",
  reflection: "Security in relationships often depends on our attachment style. Reflect on what helps you feel safe: Consistent communication, physical closeness, or reassurance? Share these needs with your partner to build a stronger connection.",
  category: "attachment",
  deckType: "individual"
},
{
  id: 85,
  question: "How do you express love in relationships?",
  reflection: "Our attachment style influences how we express love. Reflect on your expression: Do you show love through words, actions, or touch? How does your expression align with your partner's needs?",
  category: "attachment",
  deckType: "individual"
},
{
  id: 86,
  question: "What do you do when you feel rejected by someone you care about?",
  reflection: "Rejection often triggers attachment-related behaviors. Reflect on your response: Do you withdraw, seek reassurance, or become defensive? How can you respond in a way that honors your needs?",
  category: "attachment",
  deckType: "individual"
},
{
  id: 87,
  question: "How do you handle conflict in relationships?",
  reflection: "Conflict often reveals our attachment patterns. Reflect on your response: Do you avoid conflict, become aggressive, or seek resolution? How can you approach conflict with greater security and understanding?",
  category: "attachment",
  deckType: "individual"
},
{
  id: 88,
  question: "What do you need from a partner to feel loved?",
  reflection: "Our attachment style shapes our needs in relationships. Reflect on what makes you feel loved: Words of affirmation, quality time, or physical touch? Share these needs with your partner to deepen your connection.",
  category: "attachment",
  deckType: "individual"
},
{
  id: 89,
  question: "How do you respond when someone disappoints you?",
  reflection: "Disappointment often triggers attachment-related reactions. Reflect on your response: Do you withdraw, become angry, or seek reassurance? How can you respond with greater self-awareness and compassion?",
  category: "attachment",
  deckType: "individual"
},
{
  id: 90,
  question: "What do you do when you feel insecure in a relationship?",
  reflection: "Insecurity often stems from attachment patterns. Reflect on your response: Do you seek reassurance, become clingy, or withdraw? How can you address your insecurities in a healthy way?",
  category: "attachment",
  deckType: "individual"
},
{
  id: 91,
  question: "How do you handle emotional intimacy?",
  reflection: "Emotional intimacy can be challenging depending on our attachment style. Reflect on your comfort level: Do you open up easily, or do you struggle to share your feelings? How can you create a safer space for intimacy?",
  category: "attachment",
  deckType: "individual"
},
{
  id: 92,
  question: "What do you do when you feel overwhelmed by a relationship?",
  reflection: "Overwhelm often triggers attachment-related behaviors. Reflect on your response: Do you pull away, become controlling, or seek reassurance? How can you respond in a way that honors your needs?",
  category: "attachment",
  deckType: "individual"
},
{
  id: 93,
  question: "How do you handle being alone?",
  reflection: "Our attachment style influences how we experience solitude. Reflect on your response: Do you feel comfortable being alone, or do you seek constant connection? How can you cultivate a healthier relationship with solitude?",
  category: "attachment",
  deckType: "individual"
},
{
  id: 94,
  question: "What do you do when you feel jealous in a relationship?",
  reflection: "Jealousy often stems from attachment-related fears. Reflect on your response: Do you become possessive, withdraw, or seek reassurance? How can you address jealousy in a healthy way?",
  category: "attachment",
  deckType: "individual"
},
{
  id: 95,
  question: "How do you handle vulnerability in relationships?",
  reflection: "Vulnerability is key to emotional intimacy, but it can be challenging depending on our attachment style. Reflect on your comfort level: Do you share openly, or do you struggle to be vulnerable? How can you create a safer space for vulnerability?",
  category: "attachment",
  deckType: "individual"
},
{
  id: 96,
  question: "What do you do when you feel neglected in a relationship?",
  reflection: "Neglect often triggers attachment-related behaviors. Reflect on your response: Do you withdraw, become demanding, or seek reassurance? How can you communicate your needs effectively?",
  category: "attachment",
  deckType: "individual"
},
{
  id: 97,
  question: "How do you handle trust in relationships?",
  reflection: "Trust is a cornerstone of secure attachment. Reflect on your ability to trust: Do you trust easily, or do you struggle with trust issues? How can you build trust in your relationships?",
  category: "attachment",
  deckType: "individual"
},
{
  id: 98,
  question: "What do you do when you feel overwhelmed by someone's emotions?",
  reflection: "Overwhelm often triggers attachment-related responses. Reflect on your reaction: Do you shut down, become defensive, or try to fix the situation? How can you respond with empathy and boundaries?",
  category: "attachment",
  deckType: "individual"
},
{
  id: 99,
  question: "How do you handle boundaries in relationships?",
  reflection: "Boundaries are essential for healthy attachment. Reflect on your ability to set and respect boundaries: Do you struggle with saying no, or do you enforce boundaries rigidly? How can you create healthier boundaries?",
  category: "attachment",
  deckType: "individual"
},
{
  id: 100,
  question: "What do you need to feel secure in yourself?",
  reflection: "Secure attachment starts with self-security. Reflect on what helps you feel grounded: Self-compassion, self-care, or self-awareness? How can you cultivate a stronger sense of self?",
  category: "attachment",
  deckType: "individual"
},
{
  id: 101,
  question: "What's the most common criticism you give yourself?",
  reflection: "The inner critic often echoes voices from our past. Pay attention to your self-talk: What's the tone? The specific words? Practice responding to this criticism with the compassion you'd offer a friend facing the same situation.",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 102,
  question: "When is your inner critic loudest?",
  reflection: "Our inner critic often becomes more vocal in specific situations. Notice what triggers harsh self-judgment: Is it comparison with others? Making mistakes? Understanding these patterns helps you prepare more self-compassionate responses.",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 103,
  question: "What would your inner ally say to counter your inner critic?",
  reflection: "Developing an inner ally voice can help balance self-criticism. Imagine a wise, compassionate part of yourself: What perspective would it offer? What words of encouragement or understanding would it share?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 104,
  question: "What do you need to forgive yourself for?",
  reflection: "Self-forgiveness is a powerful step toward silencing the inner critic. Reflect on a past mistake or regret: What lesson did you learn? How can you release guilt and embrace self-compassion?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 105,
  question: "What do you need to celebrate about yourself?",
  reflection: "The inner critic often focuses on flaws, ignoring achievements. Reflect on what you've accomplished, no matter how small: What progress have you made? How can you acknowledge and celebrate yourself?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 106,
  question: "What do you need to hear from yourself right now?",
  reflection: "Self-talk shapes our self-worth. Reflect on what you need to hear: Encouragement, reassurance, or validation? Practice speaking to yourself with kindness and compassion.",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 107,
  question: "What do you need to let go of to feel more confident?",
  reflection: "Letting go of self-doubt, comparison, or past mistakes can free you to embrace confidence. Reflect on what's holding you back: What beliefs or habits no longer serve you?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 108,
  question: "What do you need to believe about yourself?",
  reflection: "Our beliefs shape our self-worth. Reflect on a belief that would empower you: How can you cultivate this belief through daily practice?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 109,
  question: "What do you need to stop comparing yourself to?",
  reflection: "Comparison often fuels the inner critic. Reflect on what you compare yourself to: Others' achievements, appearances, or lifestyles? How can you focus on your unique journey instead?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 110,
  question: "What do you need to embrace about yourself?",
  reflection: "Self-acceptance is the foundation of self-worth. Reflect on what you need to accept: A flaw, a mistake, or a part of yourself you've rejected? How can you embrace it with compassion?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 111,
  question: "What do you need to release to feel more confident?",
  reflection: "Letting go of self-doubt, comparison, or past mistakes can free you to embrace confidence. Reflect on what's holding you back: What beliefs or habits no longer serve you?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 112,
  question: "What do you need to forgive yourself for?",
  reflection: "Self-forgiveness is a powerful step toward silencing the inner critic. Reflect on a past mistake or regret: What lesson did you learn? How can you release guilt and embrace self-compassion?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 113,
  question: "What do you need to celebrate about yourself?",
  reflection: "The inner critic often focuses on flaws, ignoring achievements. Reflect on what you've accomplished, no matter how small: What progress have you made? How can you acknowledge and celebrate yourself?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 114,
  question: "What do you need to hear from yourself right now?",
  reflection: "Self-talk shapes our self-worth. Reflect on what you need to hear: Encouragement, reassurance, or validation? Practice speaking to yourself with kindness and compassion.",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 115,
  question: "What do you need to let go of to feel more confident?",
  reflection: "Letting go of self-doubt, comparison, or past mistakes can free you to embrace confidence. Reflect on what's holding you back: What beliefs or habits no longer serve you?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 116,
  question: "What do you need to believe about yourself?",
  reflection: "Our beliefs shape our self-worth. Reflect on a belief that would empower you: How can you cultivate this belief through daily practice?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 117,
  question: "What do you need to stop comparing yourself to?",
  reflection: "Comparison often fuels the inner critic. Reflect on what you compare yourself to: Others' achievements, appearances, or lifestyles? How can you focus on your unique journey instead?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 118,
  question: "What do you need to embrace about yourself?",
  reflection: "Self-acceptance is the foundation of self-worth. Reflect on what you need to accept: A flaw, a mistake, or a part of yourself you've rejected? How can you embrace it with compassion?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 119,
  question: "What do you need to release to feel more confident?",
  reflection: "Letting go of self-doubt, comparison, or past mistakes can free you to embrace confidence. Reflect on what's holding you back: What beliefs or habits no longer serve you?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 120,
  question: "What do you need to forgive yourself for?",
  reflection: "Self-forgiveness is a powerful step toward silencing the inner critic. Reflect on a past mistake or regret: What lesson did you learn? How can you release guilt and embrace self-compassion?",
  category: "inner-critic",
  deckType: "individual"
},
{
  id: 121,
  question: "What part of yourself do you hide from others?",
  reflection: "We often hide aspects of ourselves we fear others won't accept. Consider what you keep hidden: Is it certain emotions? Past experiences? Desires? Reflect on what it would feel like to share these parts with someone you trust.",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 122,
  question: "When do you feel most authentically yourself?",
  reflection: "Authenticity often emerges in moments when we feel safe and accepted. Recall times when you felt truly yourself: What circumstances allowed this? What can you learn from these moments about creating more opportunities for authentic self-expression?",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 123,
  question: "What truth have you been afraid to acknowledge?",
  reflection: "Sometimes the deepest vulnerability lies in acknowledging truths we've been avoiding. What reality have you been reluctant to face? How might accepting this truth, even if difficult, lead to greater authenticity and growth?",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 124,
  question: "What vulnerability do you most admire in others but struggle to show yourself?",
  reflection: "Often, the qualities we admire in others reflect aspects of ourselves waiting to emerge. Consider why this particular form of vulnerability feels challenging: What fears or beliefs hold you back? How might showing this vulnerability actually strengthen your relationships and sense of authenticity?",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 125,
  question: "In what area of your life do you feel pressure to maintain a facade?",
  reflection: "Facades often develop as protection, but they can become barriers to genuine connection. Explore what this facade protects: What would it feel like to let others see behind it? Consider sharing a small piece of your authentic experience with someone you trust.",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 126,
  question: "What truth about yourself have you recently discovered that feels vulnerable to share?",
  reflection: "Self-discovery often brings both insight and vulnerability. Sit with this new understanding: How has it changed your self-perception? What support would you need to share this truth with others? Remember that vulnerability shared thoughtfully can deepen connections and foster personal growth.",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 127,
  question: "When do you feel most tempted to deflect vulnerability with humor or dismissal?",
  reflection: "Deflection often serves as a protective mechanism in moments of emotional exposure. Notice your patterns: What emotions or situations trigger this response? Practice staying present with uncomfortable feelings for a few moments longer before responding. This builds capacity for authentic expression.",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 128,
  question: "What aspect of your emotional world feels scariest to share with others?",
  reflection: "Deep emotional sharing requires both courage and discernment. Consider the nature of these emotions: Are they tied to past experiences? Current struggles? Future fears? Practice self-compassion as you explore these feelings, and remember that sharing emotional truth can create profound healing and connection.",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 129,
  question: "What do you need to feel safe enough to be vulnerable?",
  reflection: "Vulnerability requires a sense of safety. Reflect on what helps you feel secure: Trust, empathy, or non-judgment? How can you create or seek out environments that support your vulnerability?",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 130,
  question: "What would it feel like to let go of perfectionism?",
  reflection: "Perfectionism often blocks vulnerability and authenticity. Reflect on how perfectionism shows up in your life: What fears drive it? How might letting go of perfectionism free you to be more authentic?",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 131,
  question: "What do you need to forgive yourself for to embrace vulnerability?",
  reflection: "Self-forgiveness is a key step toward vulnerability. Reflect on what you need to forgive: A past mistake, a flaw, or a fear of judgment? How can you release guilt and embrace self-compassion?",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 132,
  question: "What do you need to celebrate about your authentic self?",
  reflection: "Authenticity is a strength worth celebrating. Reflect on what makes you unique: Your quirks, passions, or values? How can you honor and celebrate these aspects of yourself?",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 133,
  question: "What do you need to hear from yourself to embrace vulnerability?",
  reflection: "Self-talk shapes our ability to be vulnerable. Reflect on what you need to hear: Encouragement, reassurance, or validation? Practice speaking to yourself with kindness and compassion.",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 134,
  question: "What do you need to let go of to be more authentic?",
  reflection: "Letting go of fear, shame, or old beliefs can free you to embrace authenticity. Reflect on what's holding you back: What beliefs or habits no longer serve you?",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 135,
  question: "What do you need to believe about yourself to be more vulnerable?",
  reflection: "Our beliefs shape our ability to be vulnerable. Reflect on a belief that would empower you: How can you cultivate this belief through daily practice?",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 136,
  question: "What do you need to stop comparing yourself to to embrace authenticity?",
  reflection: "Comparison often blocks authenticity. Reflect on what you compare yourself to: Others' achievements, appearances, or lifestyles? How can you focus on your unique journey instead?",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 137,
  question: "What do you need to embrace about yourself to be more authentic?",
  reflection: "Self-acceptance is the foundation of authenticity. Reflect on what you need to accept: A flaw, a mistake, or a part of yourself you've rejected? How can you embrace it with compassion?",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 138,
  question: "What do you need to release to feel more authentic?",
  reflection: "Letting go of self-doubt, comparison, or past mistakes can free you to embrace authenticity. Reflect on what's holding you back: What beliefs or habits no longer serve you?",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 139,
  question: "What do you need to forgive yourself for to embrace authenticity?",
  reflection: "Self-forgiveness is a powerful step toward authenticity. Reflect on a past mistake or regret: What lesson did you learn? How can you release guilt and embrace self-compassion?",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 140,
  question: "What do you need to celebrate about your authentic self?",
  reflection: "Authenticity is a strength worth celebrating. Reflect on what makes you unique: Your quirks, passions, or values? How can you honor and celebrate these aspects of yourself?",
  category: "vulnerability",
  deckType: "individual"
},
{
  id: 141,
  question: "What is one boundary you struggle to set with others?",
  reflection: "Boundaries can be difficult when we fear conflict or rejection. Reflect on why this boundary feels challenging. What are the consequences of not setting it? Consider one small step you could take to assert this boundary with clarity and compassion.",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 142,
  question: "When was the last time you said 'yes' when you wanted to say 'no'?",
  reflection: "Saying 'yes' out of obligation can lead to resentment. Reflect on why you agreed in that situation: Was it to avoid discomfort, conflict, or guilt? How might you approach a similar situation differently next time?",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 143,
  question: "What physical or emotional signs indicate that your boundaries are being crossed?",
  reflection: "Our bodies and emotions often signal boundary violations. Reflect on common signs: Tightness, irritability, withdrawal? Learning to recognize these signals helps you respond and protect your well-being more effectively.",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 144,
  question: "How do you communicate your needs in close relationships?",
  reflection: "Assertive communication is key to healthy boundaries. Reflect on how you typically express your needs: Do you hint, avoid, or state them clearly? Consider practicing direct communication while maintaining respect and empathy.",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 145,
  question: "What fear holds you back from asserting yourself?",
  reflection: "Fear of rejection, conflict, or disappointing others can prevent us from being assertive. Identify the core fear that makes assertiveness difficult. How might you challenge this fear and express yourself more confidently?",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 146,
  question: "How do you respond when someone violates your boundaries?",
  reflection: "Reflect on your typical reactions: Do you ignore it, withdraw, or confront the issue? Consider how you can respond with calm assertiveness to protect your needs while maintaining respect.",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 147,
  question: "What boundary do you need to set for your own well-being?",
  reflection: "Boundaries protect your emotional, physical, and mental health. Identify one area where you're feeling depleted or taken advantage of. How might setting a clear boundary support your well-being?",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 148,
  question: "When do you feel guilty for setting boundaries?",
  reflection: "Guilt can arise when we fear we're being selfish. Reflect on why you feel guilty: What beliefs or expectations fuel this feeling? How can you remind yourself that healthy boundaries are an act of self-respect, not selfishness?",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 149,
  question: "How can you assert yourself without feeling aggressive?",
  reflection: "Assertiveness is about expressing your needs while respecting others. Reflect on the difference between assertiveness and aggression. How can you practice clear, kind communication that honors both your boundaries and your relationships?",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 150,
  question: "What belief about boundaries no longer serves you?",
  reflection: "Sometimes we carry limiting beliefs, such as 'Setting boundaries is rude' or 'I should always be available.' Identify one belief that holds you back and consider how it can be replaced with a healthier, more empowering perspective.",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 151,
  question: "What is one small boundary you can practice setting this week?",
  reflection: "Building boundary-setting skills starts small. Choose one area where you can practice saying 'no' or expressing a limit. Reflect on how it feels and what you learn from the experience.",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 152,
  question: "How do you protect your time and energy?",
  reflection: "Time and energy are valuable resources. Reflect on how you currently guard them. Where do you overcommit, and how can you reclaim space for rest and personal priorities?",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 153,
  question: "What does a healthy boundary look like in your closest relationship?",
  reflection: "Every relationship benefits from clear, respectful boundaries. Reflect on what boundary would strengthen trust, respect, or emotional safety. How can you express this boundary with care?",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 154,
  question: "When do you feel most empowered in asserting your needs?",
  reflection: "Think of a time when you communicated your needs confidently. What made it successful? What mindset or strategies helped you stay firm? Consider how you can replicate this in other areas.",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 155,
  question: "How do you differentiate between a healthy compromise and compromising yourself?",
  reflection: "Compromise is part of healthy relationships, but it shouldn't come at the cost of your well-being. Reflect on where you draw the line. How can you ensure compromises are mutual and respectful?",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 156,
  question: "How can you respond to pushback when you set a boundary?",
  reflection: "Not everyone will respond positively to boundaries. Reflect on how you handle resistance: Do you back down or stay firm? Practice calmly restating your boundary, knowing that your needs are valid.",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 157,
  question: "What boundary has improved your life the most?",
  reflection: "Positive boundary experiences remind us of their value. Reflect on one boundary that brought peace, clarity, or empowerment. How can this experience motivate you to set future boundaries?",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 158,
  question: "What do you need to say 'no' to more often?",
  reflection: "Saying 'no' can be a powerful form of self-care. Reflect on areas where you're overextending yourself. What would saying 'no' free up for you—more rest, creativity, or connection?",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 159,
  question: "How can you practice assertiveness in low-stakes situations?",
  reflection: "Building assertiveness is like building a muscle. Identify small, low-stakes opportunities to practice—like choosing a restaurant or voicing a preference. These moments strengthen confidence for bigger challenges.",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 160,
  question: "How do you feel when someone else sets a boundary with you?",
  reflection: "Our reaction to others' boundaries can reveal our own comfort with assertiveness. Reflect on your feelings when someone says 'no' to you. How can this awareness shape how you give and receive boundaries in healthier ways?",
  category: "boundaries-assertiveness",
  deckType: "individual"
},
{
  id: 161,
  question: "What emotion feels hardest for you to regulate, and why?",
  reflection: "Some emotions feel overwhelming due to past experiences, beliefs, or fears. Reflect on what makes this emotion challenging: Is it the intensity, unpredictability, or associated memories? Identifying triggers is the first step in learning to manage it more effectively.",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 162,
  question: "What is your first physical sign that you're becoming emotionally dysregulated?",
  reflection: "Emotions often show up in the body before we consciously notice them. Do you feel tightness, restlessness, or heat? Tuning into these early signs can help you take action before emotions escalate.",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 163,
  question: "What coping strategy helps you calm down when you're upset?",
  reflection: "Reflect on what has worked for you in the past—deep breathing, stepping outside, journaling? How can you incorporate these strategies more consistently to support emotional balance?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 164,
  question: "How do you typically respond to emotional overwhelm?",
  reflection: "Do you shut down, lash out, or try to distract yourself? Reflect on whether these responses serve you well. What might be a healthier or more effective approach?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 165,
  question: "What emotion do you tend to suppress, and how does it affect you?",
  reflection: "Suppressed emotions often manifest in other ways, such as tension or irritability. Consider the costs of suppressing this emotion. How might acknowledging and expressing it bring relief?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 166,
  question: "What thought patterns intensify difficult emotions for you?",
  reflection: "Thoughts can fuel emotional storms. Notice if you engage in catastrophizing, blaming, or all-or-nothing thinking. How can you challenge or reframe these thoughts to create emotional balance?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 167,
  question: "What self-soothing techniques help you feel grounded?",
  reflection: "Grounding techniques, like focusing on your breath or noticing physical sensations, can calm the nervous system. Which strategies work best for you, and how can you make them a regular practice?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 168,
  question: "How do you react to feeling vulnerable emotions like sadness or fear?",
  reflection: "Vulnerability can feel uncomfortable, but it's also a path to connection. Do you avoid, numb, or express these emotions? How might allowing yourself to feel them deepen your self-awareness?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 169,
  question: "How does your inner critic affect your emotional state?",
  reflection: "Negative self-talk can intensify difficult emotions. Reflect on how your inner critic shows up during emotional distress. What kinder, more supportive inner dialogue could you practice instead?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 170,
  question: "What daily habits support your emotional balance?",
  reflection: "Emotional regulation is strengthened by consistent habits like sleep, nutrition, and exercise. Which habits help you feel balanced, and which ones could you improve?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 171,
  question: "How can you create space between an emotion and your reaction?",
  reflection: "Pausing before reacting allows emotions to settle. Practice techniques like taking deep breaths or counting to ten. How might this create more thoughtful and effective responses?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 172,
  question: "What role does acceptance play in regulating your emotions?",
  reflection: "Sometimes we resist emotions, making them feel worse. How might accepting emotions—without judgment—help you feel more in control and less reactive?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 173,
  question: "How do you respond to emotions that feel 'unacceptable' or 'bad'?",
  reflection: "Emotions like jealousy or anger are natural but often judged harshly. How can you approach these emotions with curiosity and compassion rather than shame?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 174,
  question: "What is your favorite way to release pent-up emotions?",
  reflection: "Emotions need movement to be processed. Whether it's writing, crying, moving, or talking, reflect on which methods help you release emotions safely and constructively.",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 175,
  question: "How do you differentiate between reacting and responding?",
  reflection: "Reacting is immediate and emotional, while responding is thoughtful and intentional. Reflect on situations where you’ve reacted versus responded. How can you create more space to choose your responses?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 176,
  question: "What is one emotion you want to better understand?",
  reflection: "Sometimes emotions feel confusing or mysterious. Choose one emotion you often experience but don't fully understand. How does it show up in your body, thoughts, and behaviors? What could you learn by observing it without judgment?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 177,
  question: "What is one thought that helps you de-escalate strong emotions?",
  reflection: "Positive or grounding thoughts can help calm intense feelings. Reflect on a mantra, affirmation, or calming statement you can use when emotions feel overwhelming.",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 178,
  question: "How do you ensure you're not avoiding emotions by staying 'busy'?",
  reflection: "Distraction can sometimes become avoidance. Reflect on moments when you’ve used busyness to escape emotions. How can you create space to truly feel and process them?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 179,
  question: "What environment helps you feel emotionally safe to process difficult feelings?",
  reflection: "We need safe spaces to feel and process emotions. Reflect on where and with whom you feel most supported in expressing emotions. How can you create more of these environments?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 180,
  question: "What is one small thing you can do to soothe yourself during emotional distress?",
  reflection: "Soothing doesn't have to be grand. Simple acts like placing a hand on your heart, stepping outside, or repeating a comforting word can help. What is one accessible strategy you can practice today?",
  category: "emotional-regulation",
  deckType: "individual"
},
{
  id: 181,
  question: "How do you typically respond to change—do you resist it, embrace it, or something else?",
  reflection: "Our relationship with change often shapes our resilience. Reflect on how you’ve historically approached transitions. What fears or hopes influence your response, and how might you approach change with more curiosity and flexibility?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 182,
  question: "What is one life transition that shaped who you are today?",
  reflection: "Major changes, whether joyful or painful, often leave lasting impressions. Reflect on a pivotal moment in your life and how it shaped your identity, values, or worldview.",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 183,
  question: "What belief about yourself changed after a major life transition?",
  reflection: "Life changes often challenge or shift our self-perception. Reflect on one belief that transformed after a significant change. Was it empowering or limiting? How does it influence you today?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 184,
  question: "What coping strategies have helped you navigate difficult transitions?",
  reflection: "Change can be disorienting, but coping strategies provide grounding. Reflect on tools that have supported you—support networks, journaling, exercise, or mindfulness. Which strategies would you like to strengthen or develop?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 185,
  question: "What is one lesson you’ve learned from a challenging transition?",
  reflection: "Every transition holds potential for growth. Reflect on a past challenge and consider the wisdom it offered. How can you carry that lesson forward into future changes?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 186,
  question: "How do you tend to view uncertainty—threatening or full of possibility?",
  reflection: "Uncertainty is a natural part of change, but our mindset shapes how we approach it. Reflect on your default perspective. How might reframing uncertainty as an opportunity for growth change your experience?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 187,
  question: "What do you need to let go of to move forward in life?",
  reflection: "Transitions often require releasing old roles, expectations, or relationships. Reflect on what’s holding you back. What emotions arise when considering letting go, and how can you approach this with compassion?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 188,
  question: "How can you honor who you were while embracing who you are becoming?",
  reflection: "Growth often involves reconciling past and present identities. Reflect on how you can appreciate past experiences while welcoming change. What parts of you deserve acknowledgment as you move forward?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 189,
  question: "What does growth mean to you at this stage of your life?",
  reflection: "Growth looks different throughout life. Reflect on how you define growth right now—emotionally, professionally, or spiritually. What small steps can you take toward this vision?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 190,
  question: "How have your relationships changed during life transitions?",
  reflection: "Transitions can reshape relationships. Reflect on a shift you've experienced—who grew closer, who drifted away, and why? How can you nurture meaningful connections during future transitions?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 191,
  question: "What helps you stay grounded during times of change?",
  reflection: "Grounding practices provide stability when life feels uncertain. Reflect on what helps you feel rooted—rituals, conversations, routines. How can you lean into these practices more intentionally?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 192,
  question: "What strengths have you discovered through past challenges?",
  reflection: "Difficult transitions often reveal inner strength. Reflect on qualities like resilience, creativity, or determination that emerged during hardship. How can you draw on these strengths in future changes?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 193,
  question: "How do you handle feelings of loss during transitions?",
  reflection: "Loss is a natural part of change. Reflect on how you’ve processed feelings of grief or longing. How can you honor those emotions while also allowing room for new possibilities?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 194,
  question: "What new opportunities has change brought into your life?",
  reflection: "Not all change feels positive at first, but it can open doors. Reflect on transitions that eventually led to unexpected growth, connection, or insight. How can you stay open to possibility moving forward?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 195,
  question: "How do you balance holding onto routines while adapting to change?",
  reflection: "Routines offer stability, but flexibility is key during transitions. Reflect on how you maintain routines that nourish you while adapting to new circumstances. Where might more flexibility help?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 196,
  question: "What fears arise when you think about future changes?",
  reflection: "Fear is a natural reaction to the unknown. Reflect on specific fears and what they reveal about your needs or values. How might confronting these fears open pathways for growth?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 197,
  question: "How do you know when it's time to make a life change?",
  reflection: "Intuition, dissatisfaction, or external pressures often signal change. Reflect on how you’ve recognized these signals in the past. How can you tune into these cues more effectively now?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 198,
  question: "What are you most looking forward to in your next life chapter?",
  reflection: "Hope and excitement can be powerful motivators. Reflect on what excites you about future possibilities. How can you cultivate this hope, even amid uncertainty?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 199,
  question: "What advice would you give your future self about navigating change?",
  reflection: "Wisdom gained from past experiences can guide you forward. Write down one insight you'd offer your future self to help them navigate challenges with resilience and grace.",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 200,
  question: "What do you want to remember about this current phase of life?",
  reflection: "Every phase of life carries lessons worth remembering. Reflect on what makes this moment meaningful. How can you hold onto these insights as you transition into new experiences?",
  category: "life-transitions-growth",
  deckType: "individual"
},
{
  id: 201,
  question: "When do you feel most emotionally connected to me?",
  reflection: "Understanding when and how emotional connection occurs can deepen intimacy. Reflect on moments when you felt most seen, heard, and valued. How can you create more of these moments together?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 202,
  question: "What helps you feel safe opening up emotionally?",
  reflection: "Emotional safety is essential for intimacy. Reflect on what makes you feel safe when sharing vulnerable emotions. How can your partner support this space for openness?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 203,
  question: "What is one thing I do that helps you feel loved?",
  reflection: "Small actions often build emotional intimacy. Reflect on what gestures, words, or behaviors from your partner make you feel deeply loved and appreciated.",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 204,
  question: "How do you prefer to be comforted when you're upset?",
  reflection: "Comforting styles vary between individuals. Reflect on what helps you feel soothed and supported during emotional distress. Share these preferences with your partner to strengthen your connection.",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 205,
  question: "What emotions do you find hardest to share with me?",
  reflection: "Vulnerability can be challenging, especially around certain emotions. Reflect on what makes some emotions harder to express. How can your partner create more space for these feelings?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 206,
  question: "When do you feel most emotionally distant from me?",
  reflection: "Emotional distance can arise from stress, misunderstanding, or other dynamics. Reflect on when and why distance occurs. How can you work together to bridge this gap?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 207,
  question: "What’s a fear you’ve had about our relationship?",
  reflection: "Fears can shape our behaviors and perceptions. Reflect on a fear you’ve held, whether about intimacy, conflict, or long-term connection. How can sharing this fear create deeper understanding?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 208,
  question: "How do you show love when you're struggling emotionally?",
  reflection: "Emotional struggles can change how we express love. Reflect on how you tend to show or withhold affection during difficult times. How can you communicate your needs more openly?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 209,
  question: "How can we better support each other's emotional well-being?",
  reflection: "Emotional support looks different for each person. Reflect on what helps you feel nurtured and cared for. How can you offer this support to one another in meaningful ways?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 210,
  question: "What do you wish I understood better about your emotions?",
  reflection: "Misunderstandings can create emotional distance. Reflect on what feels misunderstood or overlooked. How can you invite your partner to understand these emotions more fully?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 211,
  question: "When do you feel most appreciated by me?",
  reflection: "Appreciation strengthens emotional connection. Reflect on how your partner makes you feel appreciated. How can you both practice more intentional appreciation?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 212,
  question: "What’s one emotional need I may not be aware of?",
  reflection: "Not all emotional needs are obvious. Reflect on one need that feels important but hasn’t been openly expressed. How can you communicate this need with kindness and clarity?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 213,
  question: "How do you express vulnerability in our relationship?",
  reflection: "Vulnerability is key to emotional intimacy. Reflect on how you share your fears, desires, and insecurities. How can you create more opportunities for vulnerability together?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 214,
  question: "What’s a meaningful memory that makes you feel close to me?",
  reflection: "Shared memories build intimacy. Reflect on a moment that strengthened your connection. How can you create more memories that deepen your bond?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 215,
  question: "How do you feel most supported during stressful times?",
  reflection: "Stress can challenge emotional intimacy. Reflect on what support feels most meaningful to you during tough times. How can your partner provide this support more intentionally?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 216,
  question: "What helps you feel seen and heard in our relationship?",
  reflection: "Feeling understood strengthens emotional bonds. Reflect on what helps you feel deeply seen and heard. How can your partner enhance these moments of connection?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 217,
  question: "What emotional risks have you taken in our relationship?",
  reflection: "Emotional risk-taking can foster intimacy. Reflect on moments when you’ve been vulnerable or courageous with your partner. How were these moments received, and how can you encourage more emotional risk-taking together?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 218,
  question: "What’s one emotion you’d like to share with me more often?",
  reflection: "Some emotions feel easier to share than others. Reflect on an emotion you’d like to express more openly. How can your partner help create space for this emotion to be welcomed?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 219,
  question: "How do you like to be reassured in moments of doubt?",
  reflection: "Doubt can create emotional distance. Reflect on the type of reassurance that feels most meaningful—words, actions, or presence. How can you communicate these needs to your partner?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 220,
  question: "What makes you feel emotionally safe in our relationship?",
  reflection: "Emotional safety encourages deeper connection. Reflect on what behaviors, words, or actions create safety for you. How can you and your partner nurture this sense of trust together?",
  category: "emotional-intimacy",
  deckType: "couples"
},
{
  id: 221,
  question: "How do you prefer to receive feedback from me?",
  reflection: "Understanding how your partner prefers to receive feedback can reduce misunderstandings. Reflect on the tone, timing, and approach that feel most constructive to you.",
  category: "communication",
  deckType: "couples"
},
{
  id: 222,
  question: "What helps you feel truly heard during a conversation?",
  reflection: "Being heard is fundamental to feeling valued. Reflect on the behaviors or responses that make you feel listened to. How can your partner better support this?",
  category: "communication",
  deckType: "couples"
},
{
  id: 223,
  question: "How do you express disagreement in our relationship?",
  reflection: "Disagreements are natural, but how they're communicated matters. Reflect on how you express differences and how it impacts your connection. How can you express disagreement in a way that feels respectful and productive?",
  category: "communication",
  deckType: "couples"
},
{
  id: 224,
  question: "What communication habit do you appreciate most in me?",
  reflection: "Positive reinforcement strengthens communication habits. Reflect on what you appreciate about your partner's way of communicating and how it supports your bond.",
  category: "communication",
  deckType: "couples"
},
{
  id: 225,
  question: "How can I better express appreciation for you?",
  reflection: "Appreciation strengthens emotional safety. Reflect on how you most like to be acknowledged. How can your partner express appreciation in ways that feel meaningful?",
  category: "communication",
  deckType: "couples"
},
{
  id: 226,
  question: "When do you feel most misunderstood by me?",
  reflection: "Misunderstandings can erode intimacy. Reflect on moments where you’ve felt misheard or misinterpreted. How can you clarify and deepen understanding in those moments?",
  category: "communication",
  deckType: "couples"
},
{
  id: 227,
  question: "What is one way I can be a better listener?",
  reflection: "Listening is a skill that nurtures connection. Reflect on how you prefer to be listened to—whether through eye contact, silence, or affirming words. How can your partner improve in this area?",
  category: "communication",
  deckType: "couples"
},
{
  id: 228,
  question: "How do you prefer to communicate when you're upset?",
  reflection: "Different people need different things when upset. Reflect on your ideal conditions for sharing frustration—whether it’s space, immediacy, or quiet. How can your partner honor these needs?",
  category: "communication",
  deckType: "couples"
},
{
  id: 229,
  question: "What’s one thing I do during conversations that makes you feel valued?",
  reflection: "Feeling valued during communication is essential. Reflect on behaviors or gestures from your partner that reinforce your importance. How can they do more of this?",
  category: "communication",
  deckType: "couples"
},
{
  id: 230,
  question: "What topics feel hardest for you to talk about with me?",
  reflection: "Challenging topics can create emotional distance. Reflect on why these subjects feel difficult and what would make it easier to approach them together.",
  category: "communication",
  deckType: "couples"
},
{
  id: 231,
  question: "How do you prefer to resolve misunderstandings?",
  reflection: "Resolution styles can differ. Reflect on what feels most effective to you—whether it's taking space, immediate dialogue, or written communication. How can your partner support this?",
  category: "communication",
  deckType: "couples"
},
{
  id: 232,
  question: "How do you feel when I interrupt you during conversations?",
  reflection: "Interruptions can signal disconnection. Reflect on how interruptions impact your willingness to share. How can your partner create more space for you to fully express yourself?",
  category: "communication",
  deckType: "couples"
},
{
  id: 233,
  question: "What helps you feel emotionally safe during difficult conversations?",
  reflection: "Difficult conversations can trigger defensiveness. Reflect on the conditions that help you stay open and receptive. How can you both create this safety?",
  category: "communication",
  deckType: "couples"
},
{
  id: 234,
  question: "How do you prefer to be approached when discussing a sensitive topic?",
  reflection: "Sensitive conversations require careful approach. Reflect on what timing, language, or setting helps you feel most open to discussing vulnerable topics.",
  category: "communication",
  deckType: "couples"
},
{
  id: 235,
  question: "What communication habit of mine is challenging for you?",
  reflection: "Understanding challenges allows for better growth. Reflect on one habit that may create tension and how your partner can adjust to improve communication.",
  category: "communication",
  deckType: "couples"
},
{
  id: 236,
  question: "How do you express that you need space during a conversation?",
  reflection: "Needing space is healthy, but how it's communicated matters. Reflect on how you express this need, and how your partner can respond in ways that feel respectful and supportive.",
  category: "communication",
  deckType: "couples"
},
{
  id: 237,
  question: "When do you feel most connected to me during our conversations?",
  reflection: "Connection happens in specific moments. Reflect on when you feel most engaged, understood, and valued in conversations. How can you create more of these moments?",
  category: "communication",
  deckType: "couples"
},
{
  id: 238,
  question: "How can I better support you when you're expressing difficult emotions?",
  reflection: "Expressing emotions is vulnerable. Reflect on what makes emotional sharing feel easier and safer for you. How can your partner hold that space with more care?",
  category: "communication",
  deckType: "couples"
},
{
  id: 239,
  question: "What is one thing you wish I would say to you more often?",
  reflection: "Words hold power in relationships. Reflect on the kinds of affirmations, reassurances, or validations that feel meaningful. How can your partner use words to strengthen connection?",
  category: "communication",
  deckType: "couples"
},
{
  id: 240,
  question: "How do you prefer to be approached when resolving conflict?",
  reflection: "Resolution styles can be as unique as individuals. Reflect on the approach that feels most respectful and effective to you. How can your partner honor this during conflict resolution?",
  category: "communication",
  deckType: "couples"
},
{
  id: 241,
  question: "How do you typically respond during conflict?",
  reflection: "Understanding your conflict style can lead to more productive resolutions. Reflect on whether you tend to withdraw, confront, or avoid. How can you adapt your response to foster healthier outcomes?",
  category: "conflict",
  deckType: "couples"
},
{
  id: 242,
  question: "What do you need from me during an argument?",
  reflection: "Needs can differ greatly in conflict. Reflect on whether you need space, reassurance, or validation. Communicating this can help your partner better support you.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 243,
  question: "What is one thing I do during conflict that helps you feel heard?",
  reflection: "Feeling heard is essential to resolving tension. Reflect on specific actions from your partner that validate your experience, and discuss how to encourage more of this behavior.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 244,
  question: "What is one thing I do during conflict that makes it harder to resolve?",
  reflection: "Identifying unhelpful patterns is key to better communication. Reflect on behaviors that escalate conflict and consider how they can be adjusted for more productive discussions.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 245,
  question: "How do you prefer to de-escalate during heated moments?",
  reflection: "Knowing what calms you can prevent conflicts from escalating. Reflect on strategies that help you regain calm, and share these with your partner.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 246,
  question: "What unresolved conflict still feels present between us?",
  reflection: "Unresolved conflicts can create distance. Reflect on any lingering tension and explore how to bring closure or understanding to the issue.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 247,
  question: "What would help you feel safer during difficult conversations?",
  reflection: "Emotional safety encourages open and honest dialogue. Reflect on what makes conversations feel safer for you and how your partner can support that need.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 248,
  question: "How can we approach conflict with curiosity rather than judgment?",
  reflection: "Curiosity fosters understanding, while judgment fuels division. Reflect on how to shift from defensiveness to curiosity during disagreements.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 249,
  question: "What signals show that you need space during an argument?",
  reflection: "Recognizing non-verbal or verbal signals can prevent unnecessary escalation. Reflect on how you communicate this need and how your partner can respond respectfully.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 250,
  question: "How do you feel after we resolve a conflict?",
  reflection: "Resolution can leave a range of feelings, from relief to lingering hurt. Reflect on how you process these emotions and what might make post-conflict conversations feel more healing.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 251,
  question: "What does 'fair fighting' mean to you?",
  reflection: "Healthy conflict involves mutual respect and boundaries. Reflect on what principles guide your approach to conflict and how these can be reinforced in the relationship.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 252,
  question: "How can I better support you in feeling safe to share your frustrations?",
  reflection: "Safety encourages open sharing. Reflect on what helps you feel secure when expressing frustration, and how your partner can contribute to that environment.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 253,
  question: "What are common misunderstandings we have during conflicts?",
  reflection: "Misunderstandings often fuel recurring arguments. Reflect on common points of confusion and how you can clarify your intentions more effectively.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 254,
  question: "What physical or emotional signs show that a conflict is escalating for you?",
  reflection: "Noticing early signs of escalation helps prevent conflict from spiraling. Reflect on these cues and how your partner can recognize and respond to them.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 255,
  question: "What does apology and repair look like for you after a disagreement?",
  reflection: "Repair is crucial for trust-building. Reflect on what makes an apology feel sincere and what helps you feel ready to move forward after conflict.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 256,
  question: "How can we better understand each other's emotional triggers?",
  reflection: "Triggers often stem from past experiences. Reflect on what typically activates strong reactions in you and how you can both respond with more compassion.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 257,
  question: "How do you prefer to cool down after an intense conflict?",
  reflection: "Cooling down is essential for perspective. Reflect on what helps you decompress, whether it’s space, writing, or quiet, and how your partner can support this process.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 258,
  question: "What boundaries could make our conflicts feel safer and more constructive?",
  reflection: "Boundaries can protect emotional safety during disagreements. Reflect on rules or agreements that would make conflict resolution feel safer and more productive.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 259,
  question: "How can we show love for each other, even during conflict?",
  reflection: "Conflict doesn’t have to erode connection. Reflect on ways you can stay connected, even when disagreeing, through touch, affirmations, or reminders of mutual care.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 260,
  question: "What past conflicts have made us stronger as a couple?",
  reflection: "Sometimes conflict leads to growth and deeper understanding. Reflect on which disagreements have helped you learn more about each other and strengthened your bond.",
  category: "conflict",
  deckType: "couples"
},
{
  id: 261,
  question: "What makes you feel most loved by me?",
  reflection: "Understanding your partner’s love language deepens emotional connection. Reflect on specific actions that help you feel truly loved and share them with your partner.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 262,
  question: "What is one small act I can do daily to show you love?",
  reflection: "Small, consistent actions build lasting love. Reflect on simple gestures that make you feel cared for and discuss how to integrate them into daily life.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 263,
  question: "How do you prefer to receive appreciation?",
  reflection: "Appreciation can be expressed in many ways—through words, actions, or touch. Reflect on the type of acknowledgment that feels most meaningful to you.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 264,
  question: "When do you feel most emotionally connected to me?",
  reflection: "Emotional connection is at the heart of love. Reflect on moments that foster connection and how these experiences can be cultivated more intentionally.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 265,
  question: "What love language feels least natural for you to express?",
  reflection: "We all have love languages that come less naturally. Reflect on which one feels most challenging and explore ways to develop comfort and authenticity in expressing it.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 266,
  question: "What is a simple way I can better align with your love language?",
  reflection: "Love is more fulfilling when expressed in a language your partner understands. Reflect on one simple change you can make to align more closely with their needs.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 267,
  question: "How do you express love when words feel difficult?",
  reflection: "Love can be shown through actions when words fall short. Reflect on alternative ways you express love and how your partner can recognize these efforts.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 268,
  question: "How can I make our quality time feel more meaningful?",
  reflection: "Quality time is about presence and connection. Reflect on what enhances your experience of quality time and share ways to create deeper engagement.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 269,
  question: "What is one way I can offer more acts of service for you?",
  reflection: "Acts of service can speak volumes. Reflect on tasks or gestures that feel especially loving, and discuss how these can become part of your daily rhythm.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 270,
  question: "What are some ways you enjoy receiving physical affection?",
  reflection: "Physical touch is a powerful form of love. Reflect on the types of touch that feel most comforting and meaningful, and share this with your partner.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 271,
  question: "How can I be more thoughtful with my words of affirmation?",
  reflection: "Words have power to uplift and reassure. Reflect on the types of affirmations that feel most sincere and how they can be shared more intentionally.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 272,
  question: "How can we make gift-giving more meaningful?",
  reflection: "Gifts are symbolic of care and thoughtfulness. Reflect on how gifts can be more personal and reflective of your partner’s unique preferences.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 273,
  question: "What is your favorite shared memory of us that made you feel deeply loved?",
  reflection: "Memories build emotional connection. Reflect on a moment that strengthened your bond and discuss how to create similar experiences in the future.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 274,
  question: "What is one way we can show love to each other during stressful times?",
  reflection: "Stress can strain connection, but love softens it. Reflect on how you prefer to receive love when under stress, and how you can show up for each other in these moments.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 275,
  question: "What love language feels most unfamiliar to you, and why?",
  reflection: "Exploring unfamiliar love languages can expand how you give and receive love. Reflect on why this language feels challenging and how you can grow in expressing it.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 276,
  question: "How do I show love in ways you might not always notice?",
  reflection: "Sometimes love is expressed subtly. Reflect on small actions your partner takes that show love, even if they go unspoken, and acknowledge them.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 277,
  question: "How can we align our love languages better during difficult conversations?",
  reflection: "During conflict, love languages can be forgotten. Reflect on how to integrate your love languages into challenging moments to maintain connection.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 278,
  question: "What does 'being seen' in love mean to you?",
  reflection: "Feeling seen is about feeling understood and valued. Reflect on how you feel most recognized in your relationship and share this with your partner.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 279,
  question: "What can I do to make our daily routines feel more loving?",
  reflection: "Daily habits can become expressions of love. Reflect on small ways to infuse routines with intentional care and thoughtfulness.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 280,
  question: "How can we ensure we’re speaking each other’s love language regularly?",
  reflection: "Consistency is key to feeling loved. Reflect on ways to integrate love languages into everyday life and ensure both partners feel consistently valued.",
  category: "love-languages",
  deckType: "couples"
},
{
  id: 281,
  question: "What helps you feel safe and secure in our relationship?",
  reflection: "Security is built through understanding and consistency. Reflect on the specific behaviors and actions that make you feel most secure, and share them with your partner.",
  category: "trust",
  deckType: "couples"
},
{
  id: 282,
  question: "What fears do you carry when it comes to trust?",
  reflection: "Trust can be influenced by past experiences. Reflect on any fears you have about trust and how these might show up in the relationship. Consider how these fears can be addressed together.",
  category: "trust",
  deckType: "couples"
},
{
  id: 283,
  question: "How do you define trust in a relationship?",
  reflection: "Trust means different things to different people. Reflect on your personal definition and discuss how it aligns with your partner’s view of trust.",
  category: "trust",
  deckType: "couples"
},
{
  id: 284,
  question: "What do I do that makes you feel most trusted?",
  reflection: "Feeling trusted can deepen connection. Reflect on moments when you felt most trusted by your partner and what made that experience meaningful.",
  category: "trust",
  deckType: "couples"
},
{
  id: 285,
  question: "How can we repair trust after it's been challenged?",
  reflection: "Trust can be rebuilt through intentional actions. Reflect on strategies that help restore trust and how you can both participate in the repair process.",
  category: "trust",
  deckType: "couples"
},
{
  id: 286,
  question: "What boundaries are important to maintaining trust between us?",
  reflection: "Boundaries create safety in relationships. Reflect on which boundaries are most important for building and maintaining trust.",
  category: "trust",
  deckType: "couples"
},
{
  id: 287,
  question: "How can we be more transparent with each other?",
  reflection: "Transparency fosters trust. Reflect on areas where greater openness could deepen connection and discuss ways to cultivate honesty and clarity.",
  category: "trust",
  deckType: "couples"
},
{
  id: 288,
  question: "What is one thing I can do to make you feel more secure with me?",
  reflection: "Security is built through consistent, loving actions. Reflect on a small gesture that could reinforce feelings of safety and trust in your relationship.",
  category: "trust",
  deckType: "couples"
},
{
  id: 289,
  question: "What assumptions about trust do you bring from your past?",
  reflection: "Our early experiences shape our expectations of trust. Reflect on what beliefs about trust you carry and how they influence your current relationship.",
  category: "trust",
  deckType: "couples"
},
{
  id: 290,
  question: "How do you like to be reassured when you're feeling uncertain?",
  reflection: "Reassurance can calm insecurities. Reflect on the types of reassurance that feel most supportive and discuss ways to offer this to each other.",
  category: "trust",
  deckType: "couples"
},
{
  id: 291,
  question: "How do you prefer we handle secrets or private matters?",
  reflection: "Discussing boundaries around privacy builds trust. Reflect on what feels respectful and safe when it comes to sharing or keeping information confidential.",
  category: "trust",
  deckType: "couples"
},
{
  id: 292,
  question: "What do you need from me when you're feeling vulnerable?",
  reflection: "Trust grows when we feel safe in vulnerability. Reflect on what kind of support feels most nurturing when you’re emotionally exposed.",
  category: "trust",
  deckType: "couples"
},
{
  id: 293,
  question: "How can we better hold space for each other's feelings?",
  reflection: "Holding space means offering presence without judgment. Reflect on how you can better support each other emotionally, especially during difficult times.",
  category: "trust",
  deckType: "couples"
},
{
  id: 294,
  question: "What makes you feel emotionally safe with me?",
  reflection: "Emotional safety is foundational to trust. Reflect on what helps you feel safe to express yourself and how your partner can nurture that space.",
  category: "trust",
  deckType: "couples"
},
{
  id: 295,
  question: "What are signs that trust is weakening in our relationship?",
  reflection: "Recognizing early signs of trust erosion is crucial. Reflect on the behaviors or feelings that indicate trust is being challenged and how to address them.",
  category: "trust",
  deckType: "couples"
},
{
  id: 296,
  question: "How can we hold each other accountable while maintaining trust?",
  reflection: "Accountability strengthens trust. Reflect on how to approach accountability with care, compassion, and clear communication.",
  category: "trust",
  deckType: "couples"
},
{
  id: 297,
  question: "What helps you rebuild trust after a disagreement?",
  reflection: "Disagreements can strain trust, but they also offer opportunities for growth. Reflect on the repair actions that help you feel safe and connected again.",
  category: "trust",
  deckType: "couples"
},
{
  id: 298,
  question: "How can we create rituals that strengthen trust?",
  reflection: "Shared rituals can deepen connection and security. Reflect on small, consistent practices that reinforce feelings of trust and closeness.",
  category: "trust",
  deckType: "couples"
},
{
  id: 299,
  question: "What does it mean to have my back in this relationship?",
  reflection: "Having each other’s back is about loyalty and support. Reflect on how you demonstrate this and how it contributes to your partner’s sense of trust.",
  category: "trust",
  deckType: "couples"
},
{
  id: 300,
  question: "How can we continue to grow our trust over time?",
  reflection: "Trust is not static; it evolves with the relationship. Reflect on ways you can intentionally nurture and deepen trust as your relationship grows.",
  category: "trust",
  deckType: "couples"
},
{
  id: 301,
  question: "What makes you feel most connected to me physically?",
  reflection: "Physical connection is about more than touch—it's about presence and intention. Reflect on the moments when you feel most physically connected and share what makes those moments meaningful.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 302,
  question: "How do you feel about physical affection in public versus private?",
  reflection: "Different people have different comfort levels with physical affection. Reflect on your preferences and discuss how you can align on expressing affection in different settings.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 303,
  question: "What physical gestures make you feel most loved?",
  reflection: "Small gestures of touch can build intimacy. Reflect on the physical actions that make you feel cherished and share how your partner can engage in those more often.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 304,
  question: "How do you communicate when you want physical closeness?",
  reflection: "Clear communication helps meet physical needs. Reflect on how you express a desire for closeness and how you can improve that communication with your partner.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 305,
  question: "How do you feel about initiating intimacy?",
  reflection: "Initiating intimacy can feel vulnerable. Reflect on your comfort level with initiating and discuss ways to make initiation feel safe and reciprocal.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 306,
  question: "What physical boundaries feel important to you?",
  reflection: "Boundaries are essential to safety and comfort. Reflect on your personal physical boundaries and share them with your partner for deeper understanding.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 307,
  question: "How does stress impact your desire for physical connection?",
  reflection: "Stress can influence physical intimacy. Reflect on how stress affects your connection and explore ways to nurture intimacy during difficult times.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 308,
  question: "What are some non-sexual ways you enjoy being close?",
  reflection: "Intimacy goes beyond sexuality. Reflect on non-sexual ways of being physically close—like cuddling, holding hands, or sharing a hug—and how these contribute to your bond.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 309,
  question: "How can we create more opportunities for physical closeness?",
  reflection: "Intimacy grows through intentional connection. Reflect on small daily practices that can enhance physical closeness, like morning hugs or goodnight kisses.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 310,
  question: "What helps you feel safe and relaxed in intimate moments?",
  reflection: "Safety is key to intimacy. Reflect on what helps you feel most comfortable during physical connection and discuss ways to nurture that space together.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 311,
  question: "How do you express love through physical touch?",
  reflection: "Everyone expresses love differently. Reflect on the types of touch that feel natural to you and how you can express love in ways that resonate with your partner.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 312,
  question: "How can we be more present during intimate moments?",
  reflection: "Presence deepens connection. Reflect on ways to bring more mindfulness to your physical closeness and reduce distractions that pull you away from each other.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 313,
  question: "What are your hopes and desires for our physical intimacy?",
  reflection: "Desires evolve over time. Reflect on your current hopes for physical connection and share them with your partner to strengthen understanding and intimacy.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 314,
  question: "How do you feel about trying new ways to connect physically?",
  reflection: "Novelty can bring excitement to physical connection. Reflect on your openness to exploring new ways to be close and what boundaries are important in that process.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 315,
  question: "What are small, everyday ways we can enhance physical intimacy?",
  reflection: "Physical connection is nurtured through consistent, small actions. Reflect on daily habits that could deepen intimacy, like longer hugs, hand-holding, or affectionate words.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 316,
  question: "How do you like to be comforted physically when you're upset?",
  reflection: "Comfort through touch can be deeply healing. Reflect on the types of physical comfort you find soothing and share how your partner can support you during tough moments.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 317,
  question: "What helps you feel desired by me?",
  reflection: "Feeling desired builds intimacy and confidence. Reflect on what makes you feel most wanted and share how your partner can express their desire for you.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 318,
  question: "How can we navigate differences in physical needs with care?",
  reflection: "Physical needs can vary. Reflect on how to approach these differences with empathy and open communication to ensure both partners feel valued and understood.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 319,
  question: "How do you know when I'm fully present with you physically?",
  reflection: "Being present deepens connection. Reflect on how you sense presence and discuss ways to ensure intimacy feels mutual and mindful.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 320,
  question: "What does physical intimacy mean to you beyond sex?",
  reflection: "Physical intimacy can be experienced in many forms. Reflect on the non-sexual ways you feel close and how you can cultivate these moments together.",
  category: "physical-intimacy",
  deckType: "couples"
},
{
  id: 321,
  question: "What do you need from me to feel loved and valued?",
  reflection: "Understanding each other's core needs is essential for a strong relationship. Reflect on the actions, words, and gestures that help you feel truly loved and appreciated.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 322,
  question: "How do you prefer to receive emotional support?",
  reflection: "Support can look different for everyone. Reflect on what makes you feel most supported—whether it's listening, advice, or physical comfort—and communicate this to your partner.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 323,
  question: "What does quality time look like for you?",
  reflection: "Quality time is about presence and connection. Reflect on the activities and moments that make you feel most connected and fulfilled with your partner.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 324,
  question: "How can I better meet your needs for connection?",
  reflection: "Connection needs can shift over time. Reflect on the ways you feel most connected and explore how your partner can nurture that bond.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 325,
  question: "What do you need to feel safe in our relationship?",
  reflection: "Emotional safety is the foundation of intimacy. Reflect on what creates a sense of safety for you and how your partner can help provide that environment.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 326,
  question: "How do you like to receive appreciation?",
  reflection: "Appreciation strengthens love. Reflect on how you prefer to be appreciated—through words, actions, or time—and share this with your partner.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 327,
  question: "What are your needs when you're feeling stressed?",
  reflection: "Stress can change our needs. Reflect on how you prefer to be supported during stressful times and how your partner can help you feel grounded.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 328,
  question: "How can I better support your personal goals and dreams?",
  reflection: "Supporting each other's growth is key to a healthy relationship. Reflect on your goals and how your partner can encourage you in pursuing them.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 329,
  question: "What small daily rituals help you feel connected?",
  reflection: "Small rituals can build deep intimacy. Reflect on simple daily practices, like morning coffee together or a bedtime check-in, that help you feel close.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 330,
  question: "What do you need when you're feeling disconnected from me?",
  reflection: "Disconnection happens in every relationship. Reflect on the signs of disconnection and what helps you feel reconnected to your partner.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 331,
  question: "What is one unmet need you've been hesitant to share?",
  reflection: "Unspoken needs can create distance. Reflect on a need you’ve been holding back and explore how to communicate it openly and vulnerably.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 332,
  question: "How do you prefer to be comforted when you're upset?",
  reflection: "Comfort can look different for everyone. Reflect on how you prefer to be soothed and supported during challenging times.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 333,
  question: "What does feeling 'heard' mean to you?",
  reflection: "Feeling truly heard can deepen connection. Reflect on what helps you feel genuinely listened to and how your partner can meet that need.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 334,
  question: "How can we better align our needs and expectations?",
  reflection: "Clarity around expectations strengthens relationships. Reflect on what expectations you hold and how you can communicate them more openly with your partner.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 335,
  question: "What do you need from me when you're feeling insecure?",
  reflection: "Insecurity can arise in any relationship. Reflect on the reassurance or support that helps you feel safe and secure with your partner.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 336,
  question: "How can I make you feel more seen in our relationship?",
  reflection: "Being seen is about feeling valued and understood. Reflect on the gestures, words, or moments that help you feel truly seen by your partner.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 337,
  question: "What boundaries help you feel safe and respected?",
  reflection: "Healthy boundaries nurture safety. Reflect on the personal boundaries that matter most to you and how your partner can honor them.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 338,
  question: "How can I show you love in ways that feel meaningful?",
  reflection: "Love is expressed and received differently by everyone. Reflect on what gestures make you feel most loved and appreciated in your relationship.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 339,
  question: "What kind of space or independence do you need in our relationship?",
  reflection: "Healthy relationships balance closeness and autonomy. Reflect on your need for personal space and how your partner can support that need.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 340,
  question: "How can I better understand and meet your emotional needs?",
  reflection: "Emotional needs evolve over time. Reflect on your current emotional needs and how your partner can show up for you in meaningful ways.",
  category: "relationship-needs",
  deckType: "couples"
},
{
  id: 341,
  question: "What boundaries help you feel safe in our relationship?",
  reflection: "Healthy boundaries create emotional safety. Reflect on the limits that help you feel secure and respected in the relationship.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 342,
  question: "How do you prefer to communicate when you need space?",
  reflection: "Communicating the need for space can be vulnerable. Reflect on how you'd like to express this need and how your partner can honor it.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 343,
  question: "What makes it difficult for you to set boundaries with me?",
  reflection: "Setting boundaries can be challenging, especially in close relationships. Reflect on any fears or concerns that make boundary-setting difficult for you.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 344,
  question: "How can we respect each other's individuality while staying connected?",
  reflection: "Balancing individuality and connection is key to a healthy relationship. Reflect on ways to nurture both your personal identity and your partnership.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 345,
  question: "How do you feel when I set a boundary with you?",
  reflection: "Boundaries can sometimes trigger emotional reactions. Reflect on how it feels when your partner sets a boundary and how you can respond with understanding.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 346,
  question: "What boundary would you like me to better understand or respect?",
  reflection: "Clear boundaries support healthy connection. Reflect on any boundary you'd like your partner to better acknowledge or honor.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 347,
  question: "How do you communicate when you feel a boundary has been crossed?",
  reflection: "Addressing boundary breaches with care can deepen trust. Reflect on how you'd like to express this and how your partner can respond supportively.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 348,
  question: "What physical boundaries are important to you in our relationship?",
  reflection: "Physical boundaries vary from person to person. Reflect on what helps you feel comfortable and safe in terms of touch, space, and intimacy.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 349,
  question: "How do you feel about privacy in our relationship?",
  reflection: "Privacy can be an important boundary for some. Reflect on what privacy means to you and how your partner can respect your personal space and autonomy.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 350,
  question: "How can we better communicate our boundaries without fear of conflict?",
  reflection: "Clear and compassionate communication is essential. Reflect on how you can express your boundaries in a way that invites understanding and connection.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 351,
  question: "What emotional boundaries help you feel safe and respected?",
  reflection: "Emotional boundaries protect our inner world. Reflect on what helps you feel emotionally safe and how your partner can honor these boundaries.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 352,
  question: "How can we support each other in setting boundaries with family or friends?",
  reflection: "External relationships can impact boundaries. Reflect on how you can support each other in maintaining healthy limits with others.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 353,
  question: "What boundary has been the most difficult for you to maintain?",
  reflection: "Some boundaries require more reinforcement than others. Reflect on why a particular boundary is difficult and what support you need to uphold it.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 354,
  question: "How do you navigate setting boundaries when emotions are high?",
  reflection: "Emotions can complicate boundary-setting. Reflect on strategies that help you stay grounded and communicate your needs calmly and clearly.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 355,
  question: "What boundary do you feel most proud of setting in our relationship?",
  reflection: "Setting healthy boundaries is an act of self-respect. Reflect on a boundary you’ve set that strengthened your relationship and why it mattered.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 356,
  question: "What boundary would help you feel more emotionally connected to me?",
  reflection: "Some boundaries foster deeper intimacy. Reflect on how setting or reinforcing a boundary might enhance emotional closeness with your partner.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 357,
  question: "How can I better recognize when you’re expressing a boundary?",
  reflection: "Sometimes boundaries are subtle. Reflect on how you express boundaries and what cues your partner can look for to respect your limits.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 358,
  question: "What boundary do you think would strengthen our relationship?",
  reflection: "Strong relationships are built on mutual respect. Reflect on any boundary that could improve trust, understanding, or connection between you.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 359,
  question: "How can we handle it if one of us feels a boundary has been overlooked?",
  reflection: "Misunderstandings can happen. Reflect on how you’d like to approach boundary concerns with curiosity and compassion, rather than defensiveness.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 360,
  question: "What does compromise look like when it comes to boundaries?",
  reflection: "Healthy relationships require negotiation. Reflect on how you can honor your boundaries while also considering your partner's needs and perspectives.",
  category: "relationship-boundaries",
  deckType: "couples"
},
{
  id: 361,
  question: "How did your family show love when you were growing up?",
  reflection: "Love is expressed in many ways. Reflect on how love was communicated in your childhood and how it influences how you give and receive love today.",
  category: "family",
  deckType: "couples"
},
{
  id: 362,
  question: "What did conflict resolution look like in your family?",
  reflection: "Our early experiences shape how we handle conflict. Reflect on how conflict was addressed in your family and how this impacts your approach today.",
  category: "family",
  deckType: "couples"
},
{
  id: 363,
  question: "What unspoken rules existed in your family growing up?",
  reflection: "Families often have implicit expectations. Reflect on what 'rules' you absorbed and how they might still influence your beliefs and behaviors.",
  category: "family",
  deckType: "couples"
},
{
  id: 364,
  question: "How did your family handle emotions like sadness or anger?",
  reflection: "Emotional expression is often shaped by family norms. Reflect on how emotions were handled in your family and how this affects your emotional comfort today.",
  category: "family",
  deckType: "couples"
},
{
  id: 365,
  question: "What family traditions were most meaningful to you?",
  reflection: "Traditions can provide comfort and connection. Reflect on traditions that shaped your sense of belonging and how they influence your current relationship.",
  category: "family",
  deckType: "couples"
},
{
  id: 366,
  question: "How has your upbringing shaped your expectations in relationships?",
  reflection: "Early experiences often shape our relational expectations. Reflect on what beliefs or assumptions about love, roles, or conflict you’ve carried into this relationship.",
  category: "family",
  deckType: "couples"
},
{
  id: 367,
  question: "What family dynamics do you fear repeating in our relationship?",
  reflection: "Fears often arise from patterns we've witnessed. Reflect on any dynamics you'd like to break free from and how we can consciously create healthier patterns together.",
  category: "family",
  deckType: "couples"
},
{
  id: 368,
  question: "What role did you play in your family growing up?",
  reflection: "Family roles shape identity. Reflect on whether you were the caretaker, the rebel, the peacemaker, etc., and how this role influences how you show up in relationships today.",
  category: "family",
  deckType: "couples"
},
{
  id: 369,
  question: "What is a positive lesson you learned from your family?",
  reflection: "While challenges shape us, positive lessons do too. Reflect on strengths or values from your family that you appreciate and bring into your relationships.",
  category: "family",
  deckType: "couples"
},
{
  id: 370,
  question: "What is a difficult lesson you had to unlearn from your family?",
  reflection: "Some lessons from childhood can hinder growth. Reflect on a belief or behavior you've worked to change and how it’s impacted your relationship.",
  category: "family",
  deckType: "couples"
},
{
  id: 371,
  question: "How did your family handle apologies and forgiveness?",
  reflection: "Apologies shape our understanding of repair. Reflect on how your family modeled (or didn’t model) forgiveness and how this affects how you handle conflict today.",
  category: "family",
  deckType: "couples"
},
{
  id: 372,
  question: "What family patterns have you noticed that you want to change?",
  reflection: "Recognizing patterns is the first step to changing them. Reflect on one pattern you’ve identified and how you can break the cycle in your current relationship.",
  category: "family",
  deckType: "couples"
},
{
  id: 373,
  question: "How does your family history affect how you give and receive support?",
  reflection: "Our comfort with giving or receiving support is shaped by past experiences. Reflect on how your family approached support and how it influences your relationship today.",
  category: "family",
  deckType: "couples"
},
{
  id: 374,
  question: "What did independence look like in your family growing up?",
  reflection: "Family dynamics shape our view of independence and dependence. Reflect on how these experiences influence your comfort with closeness and autonomy in relationships.",
  category: "family",
  deckType: "couples"
},
{
  id: 375,
  question: "How did your family view vulnerability?",
  reflection: "Vulnerability can be encouraged or discouraged in family dynamics. Reflect on how vulnerability was treated and how this shapes your comfort in sharing with your partner.",
  category: "family",
  deckType: "couples"
},
{
  id: 376,
  question: "What unspoken family values influence your beliefs today?",
  reflection: "Family values are often inherited unconsciously. Reflect on which values still guide your behavior and which ones you may want to redefine or release.",
  category: "family",
  deckType: "couples"
},
{
  id: 377,
  question: "How did your family handle success and achievement?",
  reflection: "Success can be defined differently across families. Reflect on how your family treated success and failure, and how this affects your self-worth today.",
  category: "family",
  deckType: "couples"
},
{
  id: 378,
  question: "What did love look like in your household?",
  reflection: "Love is shown in diverse ways. Reflect on how love was demonstrated in your family and how it has shaped your approach to love and relationships.",
  category: "family",
  deckType: "couples"
},
{
  id: 379,
  question: "How has your family shaped how you handle financial matters?",
  reflection: "Financial beliefs are often passed down. Reflect on how your family approached money and how it influences your financial decisions in your relationship.",
  category: "family",
  deckType: "couples"
},
{
  id: 380,
  question: "How can we support each other in navigating family influences?",
  reflection: "Families can continue to shape us long into adulthood. Reflect on how you can support each other in navigating family dynamics and creating your own shared values.",
  category: "family",
  deckType: "couples"
},
{
  id: 381,
  question: "What is an old wound in our relationship that still feels unresolved?",
  reflection: "Unspoken hurts can linger beneath the surface. Reflect on a past moment that still carries pain. How can we begin to address and heal it together?",
  category: "resentments",
  deckType: "couples"
},
{
  id: 382,
  question: "What do you need from me to feel supported in your personal growth?",
  reflection: "Growth is personal but also relational. Reflect on the kind of support that empowers you to evolve and how your partner can best show up for you.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 383,
  question: "How do you typically cope with feeling hurt in our relationship?",
  reflection: "Our coping strategies often shape how we heal. Reflect on your usual responses to hurt and how we can create a safer space for healing.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 384,
  question: "What personal healing journey are you on that I should know about?",
  reflection: "Sharing our healing processes fosters deeper intimacy. Reflect on any emotional or personal growth work you're engaging in and how your partner can support you.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 385,
  question: "What past conflict in our relationship taught you the most?",
  reflection: "Conflict can be a catalyst for growth. Reflect on a past disagreement that led to deeper understanding and what you learned from it.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 386,
  question: "How do you know when you’ve fully forgiven me?",
  reflection: "Forgiveness is a layered process. Reflect on how you recognize when forgiveness feels complete and what helps you move toward that resolution.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 387,
  question: "What fear holds you back from being fully vulnerable with me?",
  reflection: "Vulnerability can feel risky but is necessary for growth. Reflect on any fears that hinder openness and how we can create a safer space together.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 388,
  question: "What emotional wound are you still healing from?",
  reflection: "Healing is a lifelong process. Reflect on any lingering wounds and how your partner can offer compassion or support in your journey.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 389,
  question: "How can we better support each other's growth journeys?",
  reflection: "Growth is most sustainable when nurtured within relationships. Reflect on how we can cheerlead and challenge each other in healthy ways.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 390,
  question: "What part of yourself are you working to reclaim?",
  reflection: "Growth often means rediscovering parts of ourselves we've suppressed. Reflect on what you're reclaiming and how your partner can help support that process.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 391,
  question: "What is a fear about our relationship you haven't voiced yet?",
  reflection: "Unspoken fears can create distance. Reflect on any worries you've been holding back and how sharing them could foster deeper connection and understanding.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 392,
  question: "How do you prefer to receive reassurance when you're hurting?",
  reflection: "Knowing how to comfort one another strengthens connection. Reflect on what kind of reassurance feels most meaningful to you when you're struggling.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 393,
  question: "What do you need to forgive me for, even if you haven't said it yet?",
  reflection: "Sometimes we carry silent resentments. Reflect on any lingering hurts and consider how forgiveness might create space for deeper connection.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 394,
  question: "What does growth in our relationship look like to you?",
  reflection: "Growth can be defined in many ways. Reflect on how you'd like our relationship to evolve and how we can work toward that vision together.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 395,
  question: "What lesson have you learned from a difficult experience we've shared?",
  reflection: "Challenges can become sources of wisdom. Reflect on a shared hardship and the strength or understanding it has given you about us.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 396,
  question: "How do you handle feelings of disappointment in our relationship?",
  reflection: "Disappointments are natural, but how we manage them shapes our connection. Reflect on how you process disappointment and how we can better support each other in those moments.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 397,
  question: "What do you need to feel safe when we’re having difficult conversations?",
  reflection: "Safety fosters deeper honesty. Reflect on what helps you feel secure during tough discussions, and how we can create that space for each other.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 398,
  question: "How do you know when you've fully healed from a past hurt?",
  reflection: "Healing doesn't always have a clear endpoint. Reflect on how you gauge your healing process and what helps you know you've moved forward.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 399,
  question: "What is one way I can support your healing journey?",
  reflection: "Healing is personal but can be nurtured in partnership. Reflect on one tangible way your partner can support you as you heal and grow.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 400,
  question: "How can we celebrate growth in our relationship?",
  reflection: "Acknowledging progress reinforces it. Reflect on how we can recognize and celebrate the ways our relationship has grown and evolved together.",
  category: "resentments",
  deckType: "couples"
},
{
  id: 401,
  question: "What part of your body do you wish I explored more?",
  reflection: "Our bodies carry untapped pleasure. Exploring these areas can lead to deeper trust and sensual awareness.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 402,
  question: "What’s a turn-on you’ve been curious about but hesitant to share?",
  reflection: "Desire thrives in safety. Voicing curiosity can open new doors when it’s met with care and consent.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 403,
  question: "When do you feel most wanted by me?",
  reflection: "Feeling desired is powerful. Reflect on what behaviors or moments communicate that energy.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 404,
  question: "How do you like to be touched when you're aroused?",
  reflection: "Everyone has a unique language of touch. Exploring preferences builds confidence and connection.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 405,
  question: "What makes sex feel emotionally safe for you?",
  reflection: "Safety isn’t just physical—it’s emotional. Knowing what fosters this can increase intimacy and pleasure.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 406,
  question: "How do you feel about scheduling sex versus spontaneity?",
  reflection: "Intimacy lives in both ritual and spontaneity. Reflect on what creates excitement or pressure for you.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 407,
  question: "What's something you've fantasized about involving me?",
  reflection: "Sharing fantasies strengthens erotic bonds. Even if not acted on, they offer insight into desire.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 408,
  question: "What's one word that describes our sex life right now?",
  reflection: "Naming your experience gives clarity. Use it to reflect honestly—without blame or shame.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 409,
  question: "What role does sensuality play in your everyday life?",
  reflection: "Eroticism isn’t just in the bedroom. How you embody sensual energy influences how you show up.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 410,
  question: "What do you love most about our physical chemistry?",
  reflection: "Celebrate what works. Focusing on strengths can deepen passion and intimacy.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 411,
  question: "How do you feel after we make love?",
  reflection: "The afterglow holds emotional truths. Noticing post-sex emotions helps attune to each other’s needs.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 412,
  question: "If we had one uninterrupted night, what would you want us to do?",
  reflection: "Dreaming together nurtures erotic creativity. It can spark desires that get buried by routine.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 413,
  question: "How can I help you feel more confident in bed?",
  reflection: "Support and reassurance can shift performance pressure into mutual empowerment.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 414,
  question: "Do you enjoy giving or receiving more? Why?",
  reflection: "Roles in intimacy reflect comfort, trust, and balance. Exploring both can create erotic reciprocity.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 415,
  question: "What's your favorite memory of us being intimate?",
  reflection: "Memory fuels connection. Recalling a positive experience can reignite dormant desire.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 416,
  question: "What's one thing you'd like to try during foreplay?",
  reflection: "Foreplay is often where emotional and physical needs intersect. It's a space for co-creation.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 417,
  question: "What do you wish we talked about more when it comes to sex?",
  reflection: "Open conversations reduce shame. Start by identifying what feels left unsaid.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 418,
  question: "What does ‘good sex’ mean to you?",
  reflection: "Everyone defines this differently. Naming it can align expectations and deepen intimacy.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 419,
  question: "What makes you feel playful during intimacy?",
  reflection: "Play invites lightness and experimentation. Discovering what evokes that mood can increase pleasure.",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 420,
  question: "How do you want to feel after we’re intimate?",
  reflection: "The emotional residue of sex matters. Do you want to feel seen, relaxed, connected, powerful?",
  category: "sexual-intimacy",
  deckType: "couples"
},
{
  id: 421,
  question: "If we had a secret code word for 'take me now,' what would it be?",
  reflection: "Creating private language boosts erotic connection. Make it fun, flirty, and just yours.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 422,
  question: "What's a fantasy setting you'd love to explore with me?",
  reflection: "Imagination fuels desire. Whether it's a beach, balcony, or backseat—what excites you?",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 423,
  question: "If you could plan a 'naughty date night', what would it include?",
  reflection: "Let go of rules and dream up the ideal evening—what tone, textures, and play would light it up?",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 424,
  question: "What’s one thing you’d like to wake up to?",
  reflection: "Desire doesn’t sleep. Play with the idea of pleasure woven into your mornings.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 425,
  question: "What's your signature move when you're flirting with me?",
  reflection: "Confidence is sexy. Name your playful strengths and see how your partner responds.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 426,
  question: "What's a word or phrase I could whisper to drive you wild?",
  reflection: "Erotic language varies—some crave tenderness, others raw honesty. Discover your partner’s vibe.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 427,
  question: "What item of clothing do you love seeing me in?",
  reflection: "Attraction is visual and symbolic. Clothes often tell a story—what story excites you?",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 428,
  question: "If I blindfolded you, what would you want me to do next?",
  reflection: "Removing one sense can heighten others. Explore the boundaries of trust and anticipation.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 429,
  question: "What's the most spontaneous sexy moment we've had?",
  reflection: "Reflecting on spontaneity can reignite sparks and make room for more surprises.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 430,
  question: "What do you think is your most seductive trait?",
  reflection: "Confidence amplifies connection. Knowing what makes you sexy helps you embody it fully.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 431,
  question: "If we played truth or dare right now, what would you dare me to do?",
  reflection: "A little risk invites erotic fun. Choose dares that tease, tempt, or tenderly connect.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 432,
  question: "What's one thing I do that makes you feel wanted?",
  reflection: "Notice what your partner already does well—it can be a bridge to more joy.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 433,
  question: "If our sex life were a movie, what genre would it be?",
  reflection: "Humor and metaphor open space for honest talk. Use this to explore what’s true—and what’s next.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 434,
  question: "What sexy song do you wish we had a scene to?",
  reflection: "Music sets mood. Sharing songs can create erotic anticipation before touch even begins.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 435,
  question: "If we had to sneak in a quickie somewhere semi-public, where would you want it to be?",
  reflection: "Erotic risk can bring thrill and novelty. Talk boundaries and fantasies—even if only imaginary.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 436,
  question: "If I gave you a massage, where would you want me to start?",
  reflection: "Touch can be tender or erotic. Where and how you start sets the tone.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 437,
  question: "If we had a shared journal for sexy ideas, what would be your first entry?",
  reflection: "Creating erotic space together allows for play, creativity, and safe exploration.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 438,
  question: "What outfit would you want me to wear just for you?",
  reflection: "Dressing up (or down) adds ritual and intentionality to desire. Get playful with the visuals.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 439,
  question: "What’s something romantic I could do this week to turn you on?",
  reflection: "Eroticism often begins with emotional presence. Turn-on starts long before the bedroom.",
  category: "romantic-play",
  deckType: "couples"
},
{
  id: 440,
  question: "How do you want me to look at you when I’m turned on?",
  reflection: "Eye contact builds anticipation and intensity. Reflect on how visual intimacy affects you.",
  category: "romantic-play",
  deckType: "couples"
},
{
    id: 441,
    question: "If someone said you’re a lot like your partner, would you take it as a compliment?",
    reflection: "Consider what this comparison brings up. Do you admire their qualities, or would it feel uncomfortable to be seen as similar?",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 442,
    question: "Are you truly fulfilled in this relationship, or simply less lonely?",
    reflection: "Reflect on whether connection adds to your joy and growth, or if it mainly fills a void of being alone.",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 443,
    question: "Do you feel free to be fully yourself, or do you change to keep the peace?",
    reflection: "Notice whether you can express your true thoughts and feelings without fear of judgment or rejection.",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 444,
    question: "Do you love your partner as they are now, or mostly their potential?",
    reflection: "Ask yourself if you are in love with the present reality, or holding on to an imagined version of who they could be.",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 445,
    question: "Would you want your child to date someone like your partner?",
    reflection: "This question highlights whether their behaviors and values are ones you would wish for someone you deeply love.",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 446,
    question: "When conflict arises, do you leave stronger or more divided?",
    reflection: "Pay attention to whether disagreements help you grow together or create lasting distance between you.",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 447,
    question: "Does being with your partner expand your life, or shrink it?",
    reflection: "Reflect on whether this relationship opens new possibilities and freedom, or limits who you can be.",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 448,
    question: "Do you feel emotionally safe to share your deepest truths?",
    reflection: "Emotional safety is vital. Notice if you feel met with care when you reveal your fears, dreams, or struggles.",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 449,
    question: "If nothing changed for the next 10 years, would you still stay?",
    reflection: "Imagine the future exactly as today. Would that feel like love and commitment, or compromise and settling?",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 450,
    question: "Does this relationship align with your core values?",
    reflection: "Consider whether you’re compromising essential parts of yourself, or if your values are honored and shared.",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 451,
    question: "Do you and your partner celebrate each other’s wins?",
    reflection: "Notice whether you feel uplifted and supported when you succeed, or if your joy is met with silence or envy.",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 452,
    question: "Are your needs being voiced and respected in this relationship?",
    reflection: "Ask if your needs are heard with care, or dismissed and minimized, leaving you feeling unseen.",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 453,
    question: "Do you feel more energized or drained after spending time together?",
    reflection: "Energy is revealing. Reflect on whether your connection leaves you nourished or depleted.",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 454,
    question: "When you imagine your future, is your partner in it with you?",
    reflection: "Picture your dreams and goals. Do you see them standing beside you, or does the vision feel uncertain?",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 455,
    question: "Do you admire who your partner is outside the relationship?",
    reflection: "Think about how they show up in friendships, work, or family. Do you respect them as an individual?",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 456,
    question: "Do your conflicts repeat the same cycle, or do they evolve?",
    reflection: "Patterns matter. Ask yourself whether disagreements bring new understanding, or circle back endlessly.",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 457,
    question: "Do you trust your partner with your vulnerabilities?",
    reflection: "Trust is tested when you share your rawest parts. Do they handle them with care, or use them against you?",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 458,
    question: "Are you growing together, or simply coexisting?",
    reflection: "Growth can be shared or separate. Reflect on whether you both inspire evolution or live parallel lives.",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 459,
    question: "Does your partner make effort to understand your inner world?",
    reflection: "Love deepens when curiosity is present. Do they seek to know your thoughts and feelings, or stay distant?",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 460,
    question: "Would you choose your partner again today if you were single?",
    reflection: "Strip away history and obligation. Ask yourself if, knowing what you know now, you’d still say yes.",
    category: "relationships-compatibility",
    deckType: "individual"
  },
  {
    id: 461,
    question: "What truth about myself am I still avoiding?",
    reflection: "Avoidance keeps wounds alive. Facing what you resist often unlocks your next stage of growth.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 462,
    question: "If I stopped performing for others, what would change?",
    reflection: "Notice the masks you wear. What part of you is waiting to breathe without approval or applause?",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 463,
    question: "What am I most afraid people will see if they really know me?",
    reflection: "Fear of exposure points to shame. Explore whether this part of you needs hiding—or healing.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 464,
    question: "What am I holding onto that no longer fits who I am?",
    reflection: "Old identities and roles can weigh you down. Ask yourself what deserves releasing now.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 465,
    question: "What part of me have I silenced to feel safe?",
    reflection: "Safety often costs authenticity. Consider which voice, dream, or truth needs to return.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 466,
    question: "Where in my life am I betraying myself?",
    reflection: "Self-betrayal shows up in small compromises. Find the places where saying yes feels like a no.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 467,
    question: "What loss shaped me the most?",
    reflection: "Loss reveals values, resilience, and hidden wounds. Explore how it continues to define your path.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 468,
    question: "Who would I be if I stopped trying to be ‘good’?",
    reflection: "The pursuit of goodness can mask desire. What emerges if you let go of rules and performative virtue?",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 469,
    question: "What secret belief about myself feels too dangerous to say aloud?",
    reflection: "Secrets shape behavior. Naming them, even privately, begins the process of loosening their grip.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 470,
    question: "If failure didn’t exist, what would I pursue?",
    reflection: "Fear of failure narrows possibility. Imagine who you’d be if mistakes carried no shame.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 471,
    question: "When do I feel most alive in my body?",
    reflection: "Embodiment reveals truth. Pay attention to the sensations and contexts where you feel fully present.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 472,
    question: "What pattern keeps repeating in my relationships with others?",
    reflection: "Repetition is a teacher. Ask what wound or unmet need keeps pulling you into the same story.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 473,
    question: "What am I terrified will happen if I slow down?",
    reflection: "Busyness often hides fear. Explore what emerges when you release productivity as protection.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 474,
    question: "Where do I still crave permission?",
    reflection: "Notice whose approval you long for. Consider if the authority you’re waiting for might be your own.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 475,
    question: "What story about myself needs to be rewritten?",
    reflection: "Stories can trap or free us. Ask which narrative has expired and what truth could replace it.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 476,
    question: "What part of me do I judge the harshest?",
    reflection: "Self-criticism points to unmet needs. Explore what that part of you actually longs for.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 477,
    question: "If my younger self could see me now, what would they say?",
    reflection: "Your past self carries innocence and hope. Listen to whether they’d celebrate, grieve, or challenge you.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 478,
    question: "What am I afraid will happen if I let myself be fully loved?",
    reflection: "Love requires exposure. Ask if your fear is rejection, loss of control, or losing an old identity.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 479,
    question: "What am I secretly longing for but afraid to name?",
    reflection: "Unspoken longing shapes choices. Naming desire, even privately, is the first step to claiming it.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
    id: 480,
    question: "If I knew I couldn’t disappoint anyone, what would I choose?",
    reflection: "Fear of letting others down often keeps you small. Imagine a life built without that weight.",
    category: "self-discovery-growth",
    deckType: "individual"
  },
  {
  id: 481,
  question: "If we met as strangers today, would you still want to date me?",
  reflection: "This question invites you to see each other with fresh eyes. Reflect on what qualities draw you to your partner now and how your connection has grown since you first met.",
  category: "adventure-and-play",
  deckType: "couples"
},
{
  id: 482,
  question: "What do I smell like to you?",
  reflection: "Scent can be deeply personal and tied to memory. Reflect on the unique ways you perceive your partner, and how even small details like their scent make an imprint on you.",
  category: "playful",
  deckType: "couples"
},
{
  id: 483,
  question: "What's your favorite thing to see me wear? ('Nothing' doesn't count as an answer!)",
  reflection: "Appreciating your partner’s appearance can boost intimacy and confidence. Reflect on what outfits or styles you love on them and why it catches your eye.",
  category: "playful",
  deckType: "couples"
},
{
  id: 484,
  question: "What's the most ridiculous thing I've ever done that made you laugh?",
  reflection: "Shared laughter strengthens your bond. Reflect on a funny memory of your partner and why that moment still brings you joy together.",
  category: "playful",
  deckType: "couples"
},
{
  id: 485,
  question: "What's your favorite imperfection of mine?",
  reflection: "Loving someone includes embracing their quirks. Reflect on a 'flaw' or quirk in your partner that you find endearing, and what it reveals about your affection.",
  category: "playful",
  deckType: "couples"
},
{
  id: 486,
  question: "Did you secretly check out my social media before we started dating? If so, what stood out?",
  reflection: "Curiosity often accompanies early attraction. Reflect on your initial intrigue and what first impressions or details about your partner grabbed your attention.",
  category: "playful",
  deckType: "couples"
},
{
  id: 487,
  question: "How would you describe our first date in one word, and why?",
  reflection: "Summarizing a meaningful memory in one word can reveal what mattered most. Reflect on that first date from your perspective and share why you chose that description.",
  category: "playful",
  deckType: "couples"
},
{
  id: 488,
  question: "What's something I do that always makes you smile?",
  reflection: "Noticing the small everyday gestures can deepen appreciation. Reflect on a specific behavior or moment that reliably brings you joy and let your partner know why it matters.",
  category: "playful",
  deckType: "couples"
},
{
  id: 489,
  question: "If you could relive one funny or sweet moment we've shared, which would it be?",
  reflection: "Cherishing positive memories reinforces connection. Reflect on a moment with your partner that you treasure, and what makes it worth experiencing again.",
  category: "playful",
  deckType: "couples"
},
{
  id: 490,
  question: "If we had a theme song as a couple, what would it be?",
  reflection: "Music can capture the spirit of your relationship. Reflect on a song that you feel represents your journey or dynamic, and why it resonates with you both.",
  category: "playful",
  deckType: "couples"
},
{
  id: 491,
  question: "Which of our inside jokes is your favorite?",
  reflection: "Inside jokes are a language of intimacy. Reflect on a personal joke or funny memory that encapsulates your bond, and what it reveals about your connection.",
  category: "playful",
  deckType: "couples"
},
{
  id: 492,
  question: "What new nickname would you give me, and why?",
  reflection: "Nicknames can express love and personality. Reflect on a playful or affectionate name that fits your partner, and what it says about how you see them.",
  category: "playful",
  deckType: "couples"
},
{
  id: 493,
  question: "What fictional couple do you think we're most like?",
  reflection: "Comparing yourselves to a fictional couple can highlight how you view your dynamic. Reflect on which characters remind you of your relationship and what parallels you see.",
  category: "playful",
  deckType: "couples"
},
{
  id: 494,
  question: "If our love story was a book or movie, what would the title be?",
  reflection: "Imagining your story encourages creativity and insight. Reflect on a title that captures your journey together and discuss what it reveals about your relationship.",
  category: "playful",
  deckType: "couples"
},
{
  id: 495,
  question: "If we could double-date with any famous couple, who would you choose?",
  reflection: "Dream scenarios can spark fun conversations. Reflect on what you admire about another couple and how spending time with them could be enjoyable or inspiring for you both.",
  category: "playful",
  deckType: "couples"
},
{
  id: 496,
  question: "What was an assumption you made about me at the beginning that turned out to be wrong?",
  reflection: "Early impressions can be misleading. Reflect on how your view of your partner has evolved and what surprised you as you got to know the real them.",
  category: "playful",
  deckType: "couples"
},
{
  id: 497,
  question: "Which actor would play you and me in a movie about our life?",
  reflection: "Casting your story prompts you to see each other in a new light. Reflect on which actors capture your personalities or dynamic, and why those choices feel fitting.",
  category: "playful",
  deckType: "couples"
},
{
  id: 498,
  question: "If we swapped roles for a day, what's the first thing you'd do as me?",
  reflection: "Stepping into each other's shoes builds empathy and humor. Reflect on what you'd experience or learn by living a day as your partner, and share any surprises that come to mind.",
  category: "playful",
  deckType: "couples"
},
{
  id: 499,
  question: "Which of our dates so far has been your favorite, and why?",
  reflection: "Revisiting happy moments reinforces positive feelings. Reflect on a date or experience that stands out for you and discuss what made it so memorable and enjoyable.",
  category: "playful",
  deckType: "couples"
},
{
  id: 500,
  question: "What would be a fun couple's costume we could wear together?",
  reflection: "Playful creativity can bring you closer. Reflect on a duo costume idea that represents your partnership or shared interests, and enjoy the lighthearted connection it brings.",
  category: "playful",
  deckType: "couples"
},
{
  id: 501,
  question: "If our relationship ended tomorrow, what would you miss the most?",
  reflection: "Imagining loss can clarify value. Reflect on the aspects of your partner and relationship that you cherish deeply, highlighting what truly matters to you.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 502,
  question: "If this were our last conversation, what's the one thing you'd want me to remember?",
  reflection: "Focusing on final words reveals your core feelings. Reflect on the message or sentiment you'd want to leave with your partner, emphasizing the depth of your love or lessons learned.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 503,
  question: "When was the last time you considered ending our relationship, and what made you decide to stay?",
  reflection: "Moments of doubt can happen even in strong relationships. Reflect on what led to those thoughts and, importantly, what ultimately reinforced your commitment to continue.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 504,
  question: "What do you think could make you want to leave this relationship?",
  reflection: "Understanding potential deal-breakers creates transparency. Reflect on any circumstances or behaviors that would violate your core needs or values, and share them to build mutual awareness.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 505,
  question: "If you could go back to the beginning, would you still choose to be with me? Why or why not?",
  reflection: "Looking back tests your commitment in hindsight. Reflect on your journey together—both the joys and challenges—and discuss whether you'd make the same choices knowing what you know now.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 506,
  question: "Do you worry that I will eventually leave you? Why or why not?",
  reflection: "Fear of abandonment can exist even in loving relationships. Reflect on any insecurities you have about your partner's commitment, and explore the reassurance or conversations you might need.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 507,
  question: "Who do you think would have a harder time if we broke up, you or me?",
  reflection: "Perceptions of emotional resilience reveal how each partner experiences the relationship. Reflect on how you believe a separation would affect each of you and why.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 508,
  question: "What keeps you in this relationship during difficult times?",
  reflection: "Understanding why you stay reveals the relationship’s strengths. Reflect on the commitments, love, or hope that hold you together when things get tough.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 509,
  question: "If our relationship did end, what positive lesson would you take away from it?",
  reflection: "Every relationship teaches us something. Reflect on the personal growth or insights you've gained from this partnership that you would carry forward, even if it were to end.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 510,
  question: "Do you believe we will last as a couple? Why or why not?",
  reflection: "Assessing longevity brings underlying feelings to light. Reflect on the factors that give you confidence in your future together, as well as any concerns that need addressing.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 511,
  question: "Do you feel like we have been growing apart lately? Why or why not?",
  reflection: "Noticing distance early can prompt reconnection. Reflect on whether you sense any emotional gap forming, what might be causing it, and how you both could work to bridge it.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 512,
  question: "What do you feel is currently preventing our love from growing deeper?",
  reflection: "Identifying barriers helps you overcome them. Reflect on any unresolved issues, habits, or fears that might be stalling the progression of your intimacy or trust.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 513,
  question: "What do you think could come between us and how can we prevent it?",
  reflection: "Anticipating challenges can strengthen your bond. Reflect on potential threats to your relationship—whether external or internal—and discuss proactive steps to protect your connection.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 514,
  question: "If I ever cheated on you, what do you imagine would be the reason?",
  reflection: "This hypothetical scenario can be telling of unmet needs or fears. Reflect on what vulnerabilities or issues you suspect could lead to betrayal, emphasizing areas that might need attention now.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 515,
  question: "When have I deeply disappointed you, and how do you feel about it now?",
  reflection: "Acknowledging past hurt is essential for healing. Reflect on a time your partner let you down, how you processed the pain, and what was needed (or still is needed) to fully move forward.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 516,
  question: "Have you ever questioned if we're truly right for each other? When and why?",
  reflection: "Doubts can be an opportunity to learn. Reflect on moments you've second-guessed your compatibility and what those feelings reveal about areas of your relationship that might need growth or reassurance.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 517,
  question: "If I ever betrayed your trust, could you see yourself forgiving me? Why or why not?",
  reflection: "Contemplating forgiveness before a crisis can clarify your boundaries. Reflect on your capacity to heal from serious hurt and what it would take to rebuild trust if it were broken.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 518,
  question: "Is there anything you feel you've sacrificed or missed out on by being in our relationship?",
  reflection: "Partners often make compromises. Reflect on any opportunities or experiences you let go of for this relationship, and discuss whether you feel at peace with those choices or have lingering regrets.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 519,
  question: "What scares you most about the possibility of us breaking up?",
  reflection: "Voicing fears can bring you closer and provide reassurance. Reflect on what you dread losing—whether it's companionship, shared dreams, or a sense of self—and share these vulnerabilities with your partner.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 520,
  question: "If we did break up, could you imagine us staying friends? Why or why not?",
  reflection: "Considering life beyond a romance can be revealing. Reflect on whether the foundation of your connection is strong enough to remain in each other's lives platonically, and what that means about your bond.",
  category: "breakups",
  deckType: "couples"
},
{
  id: 521,
  question: "How do you feel about the role of pornography in our relationship?",
  reflection: "Open conversations about sexual media can build trust. Reflect on your comfort level with porn—how it affects your feelings, if at all—and set clear mutual understandings about boundaries and respect.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 522,
  question: "Do you ever find your mind drifting to someone else during sex, and how do you feel about that?",
  reflection: "It’s important to be honest about fantasies or distractions. Reflect on whether this happens, why it might, and how it makes you feel. This conversation can foster understanding and address any insecurities.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 523,
  question: "Have you ever faked an orgasm with me? If yes, why did you feel you had to?",
  reflection: "It takes courage to admit difficult truths. Reflect on the reasons behind faking pleasure—whether it’s to avoid hurting feelings or pressure—and discuss how you both can create a more open, satisfying sexual space.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 524,
  question: "Are you satisfied with how often we have sex, or do you wish it were different?",
  reflection: "Aligning libidos is a common challenge. Reflect on your current level of sexual frequency—if it meets your needs or leaves you wanting—and talk about how to find a balance that works for both of you.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 525,
  question: "What's a sexual fantasy or activity you've been curious to try with me?",
  reflection: "Sharing fantasies requires trust and openness. Reflect on something new that excites you, and feel encouraged to discuss it without fear of judgment, keeping communication and consent at the forefront.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 526,
  question: "What situations or feelings make you feel disconnected from me sexually?",
  reflection: "Understanding turn-offs or emotional barriers can improve intimacy. Reflect on moments when you feel distant or unengaged and explore together how to address those underlying issues.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 527,
  question: "Is there anything you seek from porn or solo sexual time that you feel is missing in our sex life?",
  reflection: "Our private sexual selves can highlight unmet needs. Reflect on what you gain from solo activities, and consider how you might share those needs or experiences with your partner to enhance mutual intimacy.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 528,
  question: "How do you feel about each of us masturbating when we're not together?",
  reflection: "Personal sexual autonomy is healthy, but it's important to understand each other’s comfort levels. Reflect on your feelings about solo pleasure in the context of your relationship and discuss any boundaries.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 529,
  question: "How do you feel about using toys or other accessories during sex?",
  reflection: "Enhancements can add new dimensions to intimacy. Reflect on your openness or reservations about incorporating toys or props, ensuring that any exploration feels comfortable and consensual for both partners.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 530,
  question: "What part of your sexuality do you still feel unsure or self-conscious about?",
  reflection: "We all have aspects of ourselves we’re learning to embrace. Reflect on any area of your sexuality that you find challenging or confusing, and consider sharing this vulnerability to build deeper understanding and acceptance.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 531,
  question: "What sexual boundaries do you want us to be mindful of?",
  reflection: "Setting clear limits is crucial for emotional and physical safety. Reflect on any lines you wouldn't want crossed or topics that trigger discomfort, and ensure you both respect each other’s comfort zones.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 532,
  question: "What's one thing I do in bed that you absolutely love?",
  reflection: "Focusing on positives reinforces intimacy. Reflect on a specific touch or behavior from your partner that brings you great pleasure, and let them know so they feel encouraged and appreciated.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 533,
  question: "Is there anything about our sex life that you'd like to change or improve?",
  reflection: "Continuous improvement keeps your connection strong. Reflect on any aspect of your sexual relationship that could be better—whether it's trying something new or adjusting something current—in the spirit of growing together.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 534,
  question: "Do you feel that we are equally satisfied in our sexual relationship?",
  reflection: "Equality in pleasure is key to intimacy. Reflect on whether you think both partners’ needs are being met, and discuss any imbalances to ensure neither of you feels neglected or overextended.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 535,
  question: "What's one insecurity you have during sex (if any) that I should know about?",
  reflection: "Sharing insecurities can foster support and reassurance. Reflect on a vulnerability you experience in intimate moments, and allow your partner to understand and comfort that aspect of you.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 536,
  question: "What does monogamy mean to you in our relationship?",
  reflection: "Defining commitment ensures mutual understanding. Reflect on your beliefs about being exclusive—why it matters to you, what it entails—and ensure both partners share similar expectations about fidelity and loyalty.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 537,
  question: "If we could be intimate anywhere in the world without consequences, where would you want it to be?",
  reflection: "Fantasizing together can ignite excitement. Reflect on a dream location or scenario that turns you on, and enjoy the thrill of exploring adventurous ideas safely through conversation.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 538,
  question: "How would you feel about role-playing or dressing up to spice up our sex life?",
  reflection: "Exploring roles and scenarios requires trust and openness. Reflect on your comfort level with acting out fantasies or using costumes, and communicate any intrigue or boundaries you have regarding this kind of play.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 539,
  question: "Do you think our sexual drives are well matched, or do we have different levels of desire?",
  reflection: "Differences in libido are common. Reflect on whether you feel in sync with your partner’s sexual energy, and if not, discuss how you both can empathize and adjust to meet each other’s needs halfway.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 540,
  question: "How would you feel about an open relationship or involving others in our sex life?",
  reflection: "This provocative question tests boundaries and values. Reflect on your stance regarding monogamy versus openness—what you truly desire and what would make you uncomfortable—so both partners clearly understand each other’s limits.",
  category: "sexual-honesty",
  deckType: "couples"
},
{
  id: 541,
  question: "Who in my family do you feel closest to, and why?",
  reflection: "Bonding with each other’s loved ones can enrich your relationship. Reflect on which of your partner’s family members you connect with and what qualities or experiences have fostered that closeness.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 542,
  question: "Is there anyone in my family you find difficult to interact with? What makes it challenging?",
  reflection: "Honest discussions about in-laws can prevent resentment. Reflect on the dynamics that make certain family interactions tough for you, and consider how empathy and communication might ease the tension.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 543,
  question: "What do you imagine my family says about us when we're not around?",
  reflection: "Considering outside perspectives can be revealing. Reflect on how you think your partner’s family perceives your relationship—whether with support, concern, or something in between—and what that means to you.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 544,
  question: "What do you think my friends say about our relationship when I'm not there?",
  reflection: "Friends often have insights (or gossip) about couples. Reflect on how you believe you two are viewed by your social circle, and what that feedback (real or imagined) says about your strengths or areas to work on.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 545,
  question: "How do you describe me to other people?",
  reflection: "The way we talk about our partners speaks volumes. Reflect on the words and stories you choose when telling others about your partner, and what those descriptions reveal about your admiration and challenges.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 546,
  question: "How do you describe us as a couple to others?",
  reflection: "This highlights your perspective on your partnership. Reflect on the narrative you share about your relationship—whether it’s fun-loving, resilient, passionate, etc.—and what that implies about your shared identity.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 547,
  question: "When have I embarrassed you in public or around others, and how did it make you feel?",
  reflection: "Even loving partners can unintentionally cause embarrassment. Reflect on a specific incident, how it affected you, and discuss it openly so you both can understand each other’s comfort levels in social settings.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 548,
  question: "Do you ever feel pressure from my family regarding our choices or lifestyle?",
  reflection: "Family expectations can influence a relationship. Reflect on any ways you feel judged or pressured by your partner’s family, and consider how as a couple you can set healthy boundaries or find reassurance together.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 549,
  question: "Do I act differently around my family than I do when it's just us? If so, how does that make you feel?",
  reflection: "Many people shift behavior with family. Reflect on any changes you notice in your partner’s demeanor or priorities around their family, and whether those changes concern you or seem understandable.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 550,
  question: "In what ways do my friends reflect who I am?",
  reflection: "Our friends can be a mirror of our values and interests. Reflect on what you observe about your partner’s character or tastes from the company they keep, and share how that insight affects your understanding of them.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 551,
  question: "Is there a friend of mine that you feel uneasy about or jealous of? Why?",
  reflection: "Feelings of unease or jealousy can point to deeper insecurities or red flags. Reflect on the source of your discomfort regarding any of your partner’s friends and communicate openly to build trust and set boundaries if needed.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 552,
  question: "How do you feel about the balance between time we spend with friends and family versus time we spend with each other?",
  reflection: "Time management reflects priorities. Reflect on whether you feel the social vs. private time in your relationship is well-balanced, and discuss any adjustments that could ensure you both feel valued and connected.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 553,
  question: "What have you learned about me from seeing me with my family?",
  reflection: "Observing your partner with their family can reveal new facets of them. Reflect on any insights or surprises you’ve gained by watching those interactions, and how it deepened (or complicated) your understanding of your partner.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 554,
  question: "How do you feel when I share details of our relationship with my friends or family?",
  reflection: "Privacy needs vary between couples. Reflect on your comfort level with how much of your relationship is discussed outside the two of you, and share any concerns about maintaining intimacy and trust.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 555,
  question: "What is one positive family value or tradition from either of our families that you'd like us to continue?",
  reflection: "Carrying forward meaningful traditions can create unity. Reflect on a value or ritual from your or your partner’s upbringing that you cherish, and discuss how incorporating it could enrich your own family culture together.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 556,
  question: "Is there any friend of mine you think I shouldn't rely on or confide in about our relationship? Why?",
  reflection: "Not all friends give healthy counsel. Reflect on whether you have reservations about someone in your partner’s circle influencing your relationship, and why you feel their involvement might be problematic.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 557,
  question: "How comfortable do you feel around my family, and how could I help you feel more at ease?",
  reflection: "Feeling accepted by in-laws matters. Reflect on your comfort level when you’re with your partner’s family and think of any support or assurances your partner could offer to help you feel more at home.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 558,
  question: "What boundaries with our families do you think are important for us to uphold?",
  reflection: "Maintaining couple privacy and independence is key. Reflect on any lines that need drawing with relatives (like respecting alone time or decision-making) and ensure you both agree on defending those limits together.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 559,
  question: "How do you feel about how we divide holidays or special occasions between our families?",
  reflection: "Navigating traditions can be sensitive. Reflect on your level of satisfaction with how you share time with each side during important events, and discuss any changes that could make those occasions more comfortable and fair.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 560,
  question: "What role do you believe our friends should play in supporting our relationship?",
  reflection: "Friends can either bolster or undermine a partnership. Reflect on how involved you think friends should be in giving advice, socializing with you as a couple, or helping you through tough times, aligning expectations on external support.",
  category: "family-friends",
  deckType: "couples"
},
{
  id: 561,
  question: "What kind of family do you hope to build with me?",
  reflection: "Discussing your vision of family sets a shared direction. Reflect on the life you imagine creating together—whether it involves children, pets, a particular home atmosphere, etc.—and align your dreams for the future.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 562,
  question: "If we had a daughter, what's a key piece of relationship advice you'd want her to hear?",
  reflection: "Imagining advising a child can reveal your core values. Reflect on the wisdom you’d pass to a daughter about love and partnership, which also highlights the principles you find important in our own relationship.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 563,
  question: "If we had a son, what's a key lesson about relationships you'd want him to learn?",
  reflection: "The lessons we'd give a son often mirror our hopes for respect and empathy. Reflect on what you’d want to teach a son about loving and being loved, revealing what you value in how people treat each other.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 564,
  question: "What does having children mean to you?",
  reflection: "People view parenthood differently—legacy, love, responsibility. Reflect on your personal interpretation of raising children and how it aligns with or differs from your partner’s perspective on family.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 565,
  question: "What's your biggest fear about becoming a parent?",
  reflection: "Acknowledge that parenthood comes with anxieties. Reflect on what scares you most—be it the responsibility, potential mistakes, or lifestyle changes—and share these vulnerabilities to support each other.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 566,
  question: "What excites you most about the idea of having children together?",
  reflection: "Focusing on positive anticipation can unite you. Reflect on the joys you imagine—like nurturing a life, sharing traditions, or seeing a mix of both of you in a child—and how that fuels your hope for the future.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 567,
  question: "How do you think having kids would change our relationship?",
  reflection: "Children bring new challenges and rewards. Reflect on ways you expect your dynamic might shift—perhaps less one-on-one time but deeper teamwork—and discuss how you’ll adapt and stay connected as partners.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 568,
  question: "What values or qualities would you most want to instill in our children?",
  reflection: "Shared parenting values create a united front. Reflect on the traits, beliefs, or ethics you feel are most important to pass on, and ensure you both agree on the core principles to teach by example.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 569,
  question: "What kind of parent do you hope to be?",
  reflection: "Articulating your parenting style can align expectations. Reflect on the kind of mom or dad you aspire to become—whether patient, playful, nurturing, or instructive—and discuss how you can support each other in those roles.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 570,
  question: "What kind of childhood experiences do you want our kids to have?",
  reflection: "Our own childhoods shape what we want (or don’t want) for our children. Reflect on the experiences—like travel, play, creativity, or community—that you believe would enrich our children’s lives.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 571,
  question: "How involved do you expect our extended family (grandparents, etc.) to be with our kids?",
  reflection: "Extended family can be a big part of a child’s world. Reflect on how much influence and time you’d like your relatives or in-laws to have in raising your children, aligning on boundaries and support.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 572,
  question: "How might our different upbringings influence how we raise our children?",
  reflection: "Each of you brings distinct family cultures and assumptions. Reflect on the parenting habits or approaches you’ve inherited from your own upbringing, and discuss where your styles might complement or clash.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 573,
  question: "Is there anything from your childhood you definitely want to recreate for our kids?",
  reflection: "Positive nostalgia can guide parenting. Reflect on a beloved tradition or experience from when you were young that you’d love to share with your children, explaining why it was meaningful to you.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 574,
  question: "Is there anything from your childhood you absolutely want to avoid when raising our kids?",
  reflection: "Recognizing past pains helps break cycles. Reflect on an aspect of your upbringing that you wouldn't want your children to go through, and how you envision doing things differently.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 575,
  question: "How important is it to you that we have children?",
  reflection: "Being on the same page about this is crucial. Reflect on your level of desire for parenthood or a child-free life, and share why it holds that importance (or lack thereof) for you.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 576,
  question: "How do you imagine we'll balance work and family if we become parents?",
  reflection: "Planning roles ahead can ease future stress. Reflect on your expectations for managing careers and parenting duties—whether one of you stays home, you both juggle jobs, etc.—and discuss how to support fairness and flexibility.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 577,
  question: "Do you have any concerns about how I might be as a parent?",
  reflection: "It’s important to address worries kindly and honestly. Reflect on any traits in your partner that give you pause when imagining them in a parenting role, and discuss these concerns openly and constructively.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 578,
  question: "In what ways do you think having children could strengthen us as a couple?",
  reflection: "Looking at potential positives can be reassuring. Reflect on how raising a child might bring you closer—perhaps through teamwork, deeper love, or new shared purpose—and recognize these potential benefits together.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 579,
  question: "What family traditions or new rituals would you like to establish when we have a family of our own?",
  reflection: "Creating your own traditions fosters unity. Reflect on special activities or celebrations you’d love to start with your future family, blending both partners’ backgrounds and new ideas to form your unique family culture.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 580,
  question: "If we decided not to have kids, what kind of life do you envision for us instead?",
  reflection: "It’s valuable to consider all paths. Reflect on the fulfilling life you’d want with your partner without children—focusing on career, travel, community, or each other—and ensure you both can see happiness in that possibility too.",
  category: "future-family",
  deckType: "couples"
},
{
  id: 581,
  question: "What does marriage mean to you, and is it something you envision for us?",
  reflection: "Marriage can symbolize different things—from a legal bond to a deep commitment. Reflect on your personal definition and significance of marriage, and share if and why you see it as part of your future together.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 582,
  question: "How do you feel about the fact that our bodies and appearances will change as we grow older together?",
  reflection: "Aging is natural, but discussing it can reveal concerns about attraction and care. Reflect on your feelings about growing older side by side, reassuring each other that love can deepen even as looks evolve.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 583,
  question: "Do you feel we're living up to the hopes and dreams we had when we first got together?",
  reflection: "Revisiting early expectations can show progress or drift. Reflect on the goals you set as a new couple, whether it’s in lifestyle, connection, or growth, and discuss how reality compares to those initial dreams.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 584,
  question: "Do you think we're settling for what we have now instead of striving for something more together?",
  reflection: "It’s important to distinguish contentment from complacency. Reflect on whether you feel truly fulfilled or if there are ambitions and improvements you’re holding back on, and explore how to pursue growth together.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 585,
  question: "Where do you realistically see us in ten years?",
  reflection: "Envisioning a future provides direction. Reflect on the life stage, environment, and achievements you picture for you as a couple a decade from now, and share those visions to ensure you’re working toward a compatible future.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 586,
  question: "What do you see as the next big step in our relationship?",
  reflection: "Anticipating the future keeps you aligned. Reflect on what milestone or change you feel is on the horizon—be it moving in, marriage, a joint project, etc.—and why that step feels like the right direction.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 587,
  question: "Do you feel we are actively growing together or just going through the motions lately?",
  reflection: "Healthy relationships evolve. Reflect on whether you sense ongoing personal and mutual growth or a plateau in your connection, and talk about ways to re-energize your bond if needed.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 588,
  question: "What do you ultimately want us to accomplish or build together in our life as a couple?",
  reflection: "Having shared goals strengthens unity. Reflect on the bigger picture of what you and your partner are working toward—such as a family, a home, a business, or a lifestyle—and how you can support each other in that mission.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 589,
  question: "Do you believe in the idea of soulmates or 'the one', and if so, do you feel I might be yours?",
  reflection: "This question dives into your romantic philosophy. Reflect on whether you see your partnership as destiny or choice, and express how that belief influences your commitment and appreciation for what you have together.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 590,
  question: "What is one thing about our relationship you hope never changes?",
  reflection: "Identifying cherished aspects highlights your strengths. Reflect on a quality in your dynamic—like your laughter, teamwork, or passion—that you want to preserve over the years, underscoring its importance to you.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 591,
  question: "What is one thing about our relationship you hope does change or improve as we grow?",
  reflection: "No relationship is perfect. Reflect on an aspect of your connection that could be better—whether communication, intimacy, or balance—and share your hope for how it might evolve as you both mature together.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 592,
  question: "How do you think our individual life goals fit together, and where might they conflict?",
  reflection: "Your personal dreams should ideally complement each other. Reflect on where your ambitions align (so you can encourage each other) and pinpoint any potential clashes that might need compromise or creativity to resolve.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 593,
  question: "What does a fulfilling life together look like to you?",
  reflection: "Understanding each other’s vision of a good life ensures unity. Reflect on the elements that mean 'success' or happiness to you as a couple—such as harmony, adventure, stability, or contribution—and compare notes with your partner.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 594,
  question: "What is a dream or goal we've talked about that you most want us to achieve?",
  reflection: "Shared dreams are motivational. Reflect on one aspiration you’ve discussed—be it traveling somewhere, starting a family, or a joint venture—that you deeply wish to fulfill, and why it matters so much to you.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 595,
  question: "Is there anything in our future plans you feel we've been procrastinating on or avoiding?",
  reflection: "Sometimes fear or comfort stalls progress. Reflect on whether there’s a decision or step (like moving, engagement, etc.) that’s been lingering, and explore together what’s holding you back and how to move forward.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 596,
  question: "What kind of legacy or example do you want our relationship to leave?",
  reflection: "Thinking long-term can clarify values. Reflect on how you’d like others—whether our children, friends, or community—to remember or be inspired by the way we loved and supported each other.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 597,
  question: "What big challenge do you foresee we might face in the future, and how could we prepare for it?",
  reflection: "Life will test you in various ways. Reflect on a potential difficulty (financial, health, etc.) you think could arise, and discuss strategies or pacts you can make now to handle it with resilience and unity.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 598,
  question: "Do you feel our relationship supports you in pursuing your personal dreams? Why or why not?",
  reflection: "A thriving partnership uplifts both individuals. Reflect on whether being together has expanded your sense of possibility or introduced limitations, and talk about how you can better champion each other’s aspirations.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 599,
  question: "Can you envision us living somewhere different in the future? If so, where and why?",
  reflection: "Location can shape lifestyle. Reflect on any desire you have to move or settle elsewhere as a couple, what that setting provides (opportunities, environment), and gauge if your partner shares similar inclinations.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 600,
  question: "What do you imagine our life will look like when we retire?",
  reflection: "Fast-forwarding to retirement can highlight shared goals for later years. Reflect on how you see your day-to-day when careers wind down—activities, environment, companionship—and ensure you both look forward to that chapter in harmony.",
  category: "life-building",
  deckType: "couples"
},
{
  id: 601,
  question: "When was the last time my spending or money habits frustrated you, and why?",
  reflection: "Money can be a sensitive topic that influences emotions. Reflect on a specific instance where finances caused friction, and discuss it calmly to better understand each other’s perspectives and values.",
  category: "finances",
  deckType: "couples"
},
{
  id: 602,
  question: "How do you feel about prenuptial agreements?",
  reflection: "Talking about prenups brings up trust and fairness regarding finances. Reflect on your stance—whether you see it as practical security or unnecessary pessimism—and share your reasoning openly.",
  category: "finances",
  deckType: "couples"
},
{
  id: 603,
  question: "Is there anything about my relationship with money that worries you?",
  reflection: "Partners often observe each other’s financial tendencies. Reflect on any spending, saving, or debt habits of your partner that give you concern, and discuss these kindly to improve mutual financial health.",
  category: "finances",
  deckType: "couples"
},
{
  id: 604,
  question: "Do you feel financially secure with me? Why or why not?",
  reflection: "Financial security is a cornerstone of long-term partnership. Reflect on whether you trust your partner’s financial decisions and stability, and explore what would increase your sense of security for the future.",
  category: "finances",
  deckType: "couples"
},
{
  id: 605,
  question: "Do you wish I earned more money? Why?",
  reflection: "This direct question can reveal underlying desires or pressures. Reflect on whether income affects your vision of your life together—from practical needs to lifestyle wants—and ensure the focus remains on teamwork, not blame.",
  category: "finances",
  deckType: "couples"
},
{
  id: 606,
  question: "Do you feel confident in my ability to provide for our future?",
  reflection: "Believing in each other’s capabilities is key. Reflect on your partner’s approach to career and money management, expressing any doubts or strong confidence you have in their ability to help build a solid future together.",
  category: "finances",
  deckType: "couples"
},
{
  id: 607,
  question: "In what ways do you think I waste money, if any?",
  reflection: "Habits that seem frivolous to one might be valued by another. Reflect on areas where you feel spending could be curbed or more intentional, and approach the topic without judgment to find mutual understanding and compromise.",
  category: "finances",
  deckType: "couples"
},
{
  id: 608,
  question: "How does money (or finances) cause tension in our relationship, if it does?",
  reflection: "Identifying stress points is the first step to resolving them. Reflect on any recurring financial disagreements or stressors between you, and discuss how you both might reduce conflict through budgeting, planning, or empathy.",
  category: "finances",
  deckType: "couples"
},
{
  id: 609,
  question: "What could we do to manage our finances better together?",
  reflection: "Teamwork in money matters can strengthen your bond. Reflect on practical steps—like budgeting, setting shared goals, or dividing financial responsibilities—that could improve your financial harmony and reduce stress.",
  category: "finances",
  deckType: "couples"
},
{
  id: 610,
  question: "What do you see as the biggest difference in how we handle money?",
  reflection: "Understanding style differences prevents judgment. Reflect on how each of you approaches spending and saving—perhaps one is more cautious, the other more spontaneous—and discuss how to balance those tendencies productively.",
  category: "finances",
  deckType: "couples"
},
{
  id: 611,
  question: "What financial goals would you like us to prioritize together?",
  reflection: "Setting mutual goals gives your financial life direction. Reflect on what you consider top priorities—be it buying a home, paying off debt, traveling, or saving for something—and ensure you both agree on a roadmap.",
  category: "finances",
  deckType: "couples"
},
{
  id: 612,
  question: "How do you think our upbringings around money affect our finances today?",
  reflection: "Our families shape our money attitudes. Reflect on the lessons or habits you each bring from childhood (maybe one learned frugality, the other generosity), and discuss how those backgrounds play out in your financial decisions now.",
  category: "finances",
  deckType: "couples"
},
{
  id: 613,
  question: "Would you describe each of us as a spender or a saver, and how does that impact our finances?",
  reflection: "Recognizing patterns can be illuminating. Reflect on your own and your partner’s natural tendencies with money and how these roles complement or challenge each other, so you can navigate differences with understanding.",
  category: "finances",
  deckType: "couples"
},
{
  id: 614,
  question: "What does financial security mean to you personally?",
  reflection: "Security can mean different things (a number in the bank, being debt-free, etc.). Reflect on what conditions or milestones make you feel safe and stable financially, and share them so you can work towards that sense of security together.",
  category: "finances",
  deckType: "couples"
},
{
  id: 615,
  question: "How do you feel about taking on debt, such as loans or mortgages, together?",
  reflection: "Debt can be a tool or a stressor. Reflect on your comfort level with borrowing money for goals (like a home, education) and ensure you both discuss limits and plans so that any shared debt feels manageable and agreed-upon.",
  category: "finances",
  deckType: "couples"
},
{
  id: 616,
  question: "If one of us suddenly earned significantly more or less than the other, how do you think it would change our relationship?",
  reflection: "Income changes can shift dynamics. Reflect on how a big financial change might impact issues like power balance, lifestyle, or stress, and talk about maintaining respect and teamwork regardless of who earns what.",
  category: "finances",
  deckType: "couples"
},
{
  id: 617,
  question: "Do we share similar priorities when it comes to spending versus saving money?",
  reflection: "Alignment on priorities prevents conflict. Reflect on whether you both agree on when to splurge and when to be frugal, and highlight any differences so you can negotiate a unified approach to financial decisions.",
  category: "finances",
  deckType: "couples"
},
{
  id: 618,
  question: "How comfortable do you feel talking about money with me?",
  reflection: "Openness about finances is crucial but not always easy. Reflect on your ease or discomfort during money conversations—whether you feel heard or anxious—and explore ways to make these discussions more transparent and less tense.",
  category: "finances",
  deckType: "couples"
},
{
  id: 619,
  question: "What's one lesson about money you'd want us to teach our future children (or the younger generation)?",
  reflection: "Agreeing on financial wisdom to pass down means you’re aligned in values. Reflect on the key money principle (responsibility, generosity, investing, etc.) you’d want to instill, revealing what financial habits you both most esteem.",
  category: "finances",
  deckType: "couples"
},
{
  id: 620,
  question: "What's a major purchase or investment you hope we can plan for together in the future?",
  reflection: "Looking forward financially can be motivating. Reflect on a significant goal—like a house, a business, a dream trip—that you aspire to achieve with your partner, and discuss how you might prepare and save for it side by side.",
  category: "finances",
  deckType: "couples"
},
{
  id: 621,
  question: "How do you feel about the work that I do?",
  reflection: "Showing interest in each other’s careers builds mutual respect. Reflect on what you appreciate or maybe struggle with regarding your partner’s job—whether it’s the impact it has on them, the time commitment, or your pride in their role.",
  category: "career",
  deckType: "couples"
},
{
  id: 622,
  question: "Are you proud to talk about my job when I'm not around, or do you feel hesitant? Why?",
  reflection: "Your partner’s work is a part of their identity. Reflect on how you portray their career to others—enthusiastically, modestly, or with concern—and what that says about your feelings toward their professional life.",
  category: "career",
  deckType: "couples"
},
{
  id: 623,
  question: "Do you ever feel like one of our careers is treated as more important than the other?",
  reflection: "Perceived imbalances can breed resentment. Reflect on whether you think one career often takes priority in decisions or daily life, and discuss how to ensure both of your professional paths feel equally respected and supported.",
  category: "career",
  deckType: "couples"
},
{
  id: 624,
  question: "If I got a dream job offer in another country, would you move with me?",
  reflection: "Major opportunities test commitment and flexibility. Reflect on your willingness to uproot for your partner’s career and what considerations (career, personal ties, mutual goals) would factor into such a life-changing decision.",
  category: "career",
  deckType: "couples"
},
{
  id: 625,
  question: "How would you feel if I decided to take a break from work or not work for a while?",
  reflection: "Career pauses (for education, burnout, or family) can affect both partners. Reflect on your emotional and practical reaction to the idea of your partner not working—how it might impact finances, roles at home, and your support for their well-being.",
  category: "career",
  deckType: "couples"
},
{
  id: 626,
  question: "How do you think our relationship would change if one of us became a stay-at-home parent?",
  reflection: "Shifting to a single income and new roles is significant. Reflect on potential changes in daily dynamics, financial pressure, and identity for both partners if one person focuses on home, and discuss how you'd navigate those shifts together.",
  category: "career",
  deckType: "couples"
},
{
  id: 627,
  question: "In our daily life, who do you think takes on more responsibilities like chores or planning, and does that feel fair to you?",
  reflection: "Balancing domestic and emotional labor is part of partnership. Reflect on how you perceive the division of tasks in light of both partners’ work schedules, and address any adjustments needed to keep things equitable and respectful.",
  category: "career",
  deckType: "couples"
},
{
  id: 628,
  question: "Do you think I'm pushing myself enough in my career, or do you feel I'm settling?",
  reflection: "Our partners see our potential and struggles clearly. Reflect on your honest impression of your partner’s ambition and fulfillment in their work, and discuss it with encouragement and understanding rather than pressure or judgment.",
  category: "career",
  deckType: "couples"
},
{
  id: 629,
  question: "Has being in this relationship influenced any of your career decisions or goals?",
  reflection: "Love and career often intertwine. Reflect on ways your partnership has impacted your professional path—choices made, opportunities passed or taken, new aspirations—and share how you feel about those influences.",
  category: "career",
  deckType: "couples"
},
{
  id: 630,
  question: "What could I do to better support your professional goals or dreams?",
  reflection: "Being each other’s cheerleader strengthens trust. Reflect on specific things you crave from your partner regarding your career—be it encouragement, practical help, patience during busy times—and guide them on how to uplift you.",
  category: "career",
  deckType: "couples"
},
{
  id: 631,
  question: "Do you think my work-life balance is healthy for our relationship?",
  reflection: "Work can encroach on personal life. Reflect on whether you feel the division between job and home is appropriate—for both you and your partner—and discuss any changes that could improve your quality time or stress levels.",
  category: "career",
  deckType: "couples"
},
{
  id: 632,
  question: "Have you ever felt you had to choose between our relationship and your career?",
  reflection: "Some choices can feel mutually exclusive. Reflect on any instance where you faced a conflict between professional opportunities and your life together, and talk about the decision process and feelings around that choice.",
  category: "career",
  deckType: "couples"
},
{
  id: 633,
  question: "Would you support me if I wanted to make a major career change or take a big risk professionally?",
  reflection: "Careers can evolve and sometimes leap into the unknown. Reflect on your readiness to stand by your partner through a dramatic change of direction—emotionally and perhaps financially—and what conversations you'd need to feel secure.",
  category: "career",
  deckType: "couples"
},
{
  id: 634,
  question: "What do you admire about how I approach my job or career?",
  reflection: "Recognizing each other’s strengths builds esteem. Reflect on the qualities—like work ethic, creativity, leadership, or compassion—that you value in your partner’s professional life, and let them know what makes you proud.",
  category: "career",
  deckType: "couples"
},
{
  id: 635,
  question: "Have you ever felt like my job was coming before you or our relationship? If so, when?",
  reflection: "Feeling second to work can hurt. Reflect on any times you’ve experienced this imbalance, what the circumstances were, and how it made you feel, so your partner can understand and address those moments.",
  category: "career",
  deckType: "couples"
},
{
  id: 636,
  question: "How important is it to you that both of us pursue careers, versus one of us focusing more on home or family?",
  reflection: "Expectations around roles can shape big decisions. Reflect on your ideals regarding dual careers or a single breadwinner model, and share how you envision dividing focus between professional life and family life.",
  category: "career",
  deckType: "couples"
},
{
  id: 637,
  question: "Do either of our career goals ever make you worry about our future together?",
  reflection: "Big ambitions or plans can have ripple effects. Reflect on whether any specific career aspirations (like a highly demanding job, long-term study, etc.) raise concerns about time, distance, or lifestyle, and explore those worries openly.",
  category: "career",
  deckType: "couples"
},
{
  id: 638,
  question: "Do you feel that our career choices support the lifestyle we want?",
  reflection: "It’s important to align work with personal values. Reflect on whether your combined careers are allowing the quality of life, location, and family plans you both desire, and discuss any adjustments or future changes that might be needed.",
  category: "career",
  deckType: "couples"
},
{
  id: 639,
  question: "How would you handle it if my job required me to be away from home a lot more than now?",
  reflection: "Hypothetical scenarios prepare you for challenges. Reflect on your emotional and practical strategies if faced with frequent separation due to work—like increased travel or long hours—and what assurances or plans you'd both need to cope well.",
  category: "career",
  deckType: "couples"
},
{
  id: 640,
  question: "Where do you see yourself professionally in five years, and how do you think that fits with our life together?",
  reflection: "Sharing five-year plans reveals alignment or divergence. Reflect on your career trajectory and aspirations in the mid-term, and discuss how that timeline meshes with shared goals like location, family, or lifestyle adjustments you both anticipate.",
  category: "career",
  deckType: "couples"
},
{
  id: 641,
  question: "Is there something you've been hesitant to tell me? What makes it hard to share?",
  reflection: "Creating a safe space for honesty is vital. Reflect on any feelings or thoughts you're holding back and examine the fear or concern behind it. Discussing this openly can deepen trust and understanding.",
  category: "communication",
  deckType: "couples"
},
{
  id: 642,
  question: "Is there a question you've wanted to ask me but felt afraid to?",
  reflection: "Unasked questions can signal areas of uncertainty or curiosity. Reflect on what makes the question intimidating—fear of the answer or conflict—and consider taking a risk by voicing it in a loving environment.",
  category: "communication",
  deckType: "couples"
},
{
  id: 643,
  question: "When was the last time I misunderstood you, and how did it make you feel?",
  reflection: "Miscommunication happens to everyone. Reflect on a recent instance where your message didn't land as intended, and express the feelings that resulted. This will help your partner learn how to listen or interpret you better.",
  category: "communication",
  deckType: "couples"
},
{
  id: 644,
  question: "Do you ever hold back your true feelings with me to avoid conflict?",
  reflection: "Peacekeeping at the cost of honesty can build resentment. Reflect on whether you censor yourself around sensitive topics, why you do it, and how you both might foster an atmosphere where honesty can be expressed gently.",
  category: "communication",
  deckType: "couples"
},
{
  id: 645,
  question: "Do you feel that I truly listen to you when you speak? Why or why not?",
  reflection: "Feeling heard is fundamental to intimacy. Reflect on your partner’s listening habits—do they show understanding and empathy or do you feel dismissed? Offer insight so you both can improve how you attend to each other.",
  category: "communication",
  deckType: "couples"
},
{
  id: 646,
  question: "What could I do to make you feel more heard and understood?",
  reflection: "Sometimes small changes in communication make a big difference. Reflect on specific actions—like making eye contact, not interrupting, or validating feelings—that would help you feel more acknowledged during talks.",
  category: "communication",
  deckType: "couples"
},
{
  id: 647,
  question: "How do you prefer to receive feedback or criticism from me?",
  reflection: "Everyone handles critique differently. Reflect on the timing, tone, or approach that makes it easier for you to accept constructive criticism (or difficult truths) so your partner can communicate more effectively and kindly.",
  category: "communication",
  deckType: "couples"
},
{
  id: 648,
  question: "How do you usually approach telling me something you think I won't want to hear?",
  reflection: "Your partner might not know your internal strategy. Reflect on whether you tend to sugarcoat, delay, or avoid tough conversations, and discuss if this approach is working or if you both prefer more direct honesty.",
  category: "communication",
  deckType: "couples"
},
{
  id: 649,
  question: "Do you feel like we can talk about anything? Why or why not?",
  reflection: "The range of topics you're comfortable with can highlight trust levels. Reflect on any subjects that feel off-limits or any lingering fear of judgment, and address how to broaden your comfort zone together.",
  category: "communication",
  deckType: "couples"
},
{
  id: 650,
  question: "What do I do during conversations that you appreciate?",
  reflection: "Acknowledging good habits reinforces them. Reflect on positive aspects of your partner’s communication style—maybe they ask great questions or show empathy—and let them know those efforts matter to you.",
  category: "communication",
  deckType: "couples"
},
{
  id: 651,
  question: "What do I do during conversations that frustrates you?",
  reflection: "Identifying irritating habits can lead to change. Reflect on something in your partner’s communication (interrupting, raising their voice, getting distracted, etc.) that bothers you, and kindly explain why adjusting it would help you feel better understood.",
  category: "communication",
  deckType: "couples"
},
{
  id: 652,
  question: "Is there any topic that feels uncomfortable or off-limits for you to discuss with me?",
  reflection: "Taboo areas can point to past wounds or fears. Reflect on subjects you avoid—money, sex, past relationships, etc.—and explore why. Sharing this helps your partner approach these topics with sensitivity or give you space.",
  category: "communication",
  deckType: "couples"
},
{
  id: 653,
  question: "How do you feel about the way we communicate when we argue?",
  reflection: "Conflict style greatly affects relationship health. Reflect on whether your arguments are productive or hurtful—do you feel heard, respected, and able to resolve issues?—and discuss ways to fight more fairly if needed.",
  category: "communication",
  deckType: "couples"
},
{
  id: 654,
  question: "What do you need from me during a conversation when you're upset?",
  reflection: "Everyone has unique needs when emotional. Reflect on what support looks like for you in heated moments—perhaps patience, a hug, or just listening—and guide your partner on how to best be there for you.",
  category: "communication",
  deckType: "couples"
},
{
  id: 655,
  question: "Do you feel you have enough space to speak your mind in our relationship conversations?",
  reflection: "Equity in voice is crucial. Reflect on whether you feel free to express opinions and make decisions, or if you often defer to your partner. Discuss how you both can ensure each person feels equally heard and respected.",
  category: "communication",
  deckType: "couples"
},
{
  id: 656,
  question: "How has our communication changed since we first met?",
  reflection: "Observing evolution can highlight improvements or backslides. Reflect on the shifts in how you talk with each other—maybe you’re more open now, or perhaps stress has introduced more tension—and use that insight to continue growing positively.",
  category: "communication",
  deckType: "couples"
},
{
  id: 657,
  question: "What do you find most comforting to hear from me when you're feeling anxious or down?",
  reflection: "Reassurance is personal. Reflect on specific words or affirmations from your partner that soothe you—whether it’s reassurance of love, 'we'll get through this,' or something else—and let them know what works best.",
  category: "communication",
  deckType: "couples"
},
{
  id: 658,
  question: "Do our texts or digital communications ever cause miscommunication or hurt feelings?",
  reflection: "In the digital age, tone can be lost in translation. Reflect on whether texting, social media, or emails have led to misunderstandings or upset, and discuss guidelines or signals (like emojis or calls) to keep your communication clear and kind.",
  category: "communication",
  deckType: "couples"
},
{
  id: 659,
  question: "How can we be better at communicating our needs and boundaries clearly?",
  reflection: "Proactive clarity prevents many conflicts. Reflect on where communication about needs (emotional, physical, etc.) or limits has fallen short, and strategize together on how to voice these things earlier and more directly, with assurance that honesty is welcome.",
  category: "communication",
  deckType: "couples"
},
{
  id: 660,
  question: "What communication habit have you seen in other couples that you wish we could adopt?",
  reflection: "Sometimes outside examples inspire us. Reflect on a positive communication trait—like always speaking respectfully, debriefing each day, or using humor to defuse tension—that you've noticed elsewhere and would like to integrate into your relationship.",
  category: "communication",
  deckType: "couples"
},
{
  id: 661,
  question: "What do you think is a core value that we both deeply share?",
  reflection: "Shared values are the bedrock of compatibility. Reflect on a fundamental belief or principle (like honesty, kindness, or ambition) that unites you and your partner, and recognize how it strengthens your bond.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 662,
  question: "What is a significant value or belief that we differ on, and how do we handle that difference?",
  reflection: "No two people agree on everything. Reflect on an important area where your views diverge—whether it's faith, politics, or lifestyle—and evaluate how you navigate that divergence with respect, compromise, or agreeing to disagree.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 663,
  question: "Why do you love me?",
  reflection: "It's powerful to hear why we are cherished. Reflect deeply on the qualities, moments, and even flaws that make you love your partner as you do, and articulate them to give a heartfelt affirmation of your feelings.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 664,
  question: "What has being in our relationship taught you about yourself?",
  reflection: "Relationships are mirrors for self-growth. Reflect on any self-discoveries—strengths, weaknesses, patterns—you've made through your partnership, and appreciate how being together has spurred personal development.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 665,
  question: "What do you feel is the biggest challenge we're facing in our relationship right now, and what do you think we can learn from it?",
  reflection: "Seeing challenges as lessons turns strain into growth. Reflect on the primary difficulty you see currently (big or small) and explore the insight or improvement it might be prompting for each of you and for your relationship.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 666,
  question: "What is a difficult experience we've shared that taught you something valuable?",
  reflection: "Often hardships hide wisdom. Reflect on a specific tough time you both endured—perhaps a big move, a loss, a breakup scare—and identify the silver lining or lesson it brought, enhancing your appreciation for your journey together.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 667,
  question: "When have you seen me at my most vulnerable, and what did it teach you about how to love me?",
  reflection: "Witnessing vulnerability can deepen intimacy. Reflect on a time your partner was really exposed or hurting, and what you learned about their needs in love and support during those moments that you can carry forward.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 668,
  question: "What pain or hurt do you see in me that you wish you could help heal?",
  reflection: "Empathy is a profound act of love. Reflect on any emotional wounds or insecurities you sense in your partner—whether from their past or present—and express your desire to support and comfort them in healing those hurts.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 669,
  question: "If you could give your younger self one piece of advice about relationships, what would it be?",
  reflection: "Hindsight reveals wisdom earned. Reflect on a key lesson about love or partnership you’ve learned over the years—the kind you wish younger you had known—and consider how that wisdom guides you in our relationship today.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 670,
  question: "What do you think is the most important lesson we've learned together as a couple?",
  reflection: "Collective growth is a marker of a strong partnership. Reflect on a major understanding or rule you and your partner have developed (maybe 'always communicate before bed' or 'teamwork through hardship') and acknowledge how it came to be.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 671,
  question: "How has our relationship changed the way you view love or commitment?",
  reflection: "Each love story reshapes our worldview. Reflect on any shifts in your beliefs about love, trust, or long-term commitment that directly result from being with your partner, highlighting how this relationship has influenced your mindset.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 672,
  question: "If our relationship had a guiding motto or principle, what do you think it should be?",
  reflection: "Distilling your bond into a phrase can be insightful. Reflect on a slogan or mantra that encapsulates your values or approach as a couple (for example, 'us against the world' or 'grow together'), and share why it feels apt.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 673,
  question: "What part of our relationship are you most grateful for?",
  reflection: "Gratitude brings positivity to the forefront. Reflect on an aspect of your partnership—be it unwavering support, laughter, sexual chemistry, or something else—that you deeply appreciate, and express why it enriches your life.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 674,
  question: "What is something about our journey as a couple that you hope you will always remember?",
  reflection: "Memories build the narrative of your love. Reflect on a meaningful chapter or turning point in your relationship that you never want to forget, and discuss how recalling it makes you feel and guides you moving forward.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 675,
  question: "How do you define a successful relationship, and do you feel we are on that path?",
  reflection: "Success in love can mean different things to different people. Reflect on the criteria that signify a thriving partnership for you (like mutual respect, adaptability, passion), and evaluate together how you measure up and where you can grow.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 676,
  question: "When you imagine us in old age, what do you hope our relationship will be like?",
  reflection: "Envisioning the far future can clarify present priorities. Reflect on the qualities—such as warmth, humor, resilience, or deep companionship—you want to characterize your relationship decades down the line, and consider how to cultivate them now.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 677,
  question: "What do you think we do especially well as a couple that others might learn from?",
  reflection: "Acknowledging your strengths reinforces them. Reflect on an area where you and your partner excel (like teamwork, conflict resolution, affection), and take pride in it while considering how to maintain that example.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 678,
  question: "What do you think is unique about our love story or the way we love each other?",
  reflection: "Every couple has its own fingerprint. Reflect on what sets your connection apart—unusual circumstances of meeting, a particular dynamic, or shared passions—and celebrate the individuality of your bond.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 679,
  question: "What's the best relationship advice you've ever received, and how does it apply to us (if at all)?",
  reflection: "Wise counsel can guide us, but we have to personalize it. Reflect on a piece of advice or insight about relationships that stuck with you, and examine how it relates to your life with your partner or if your experience challenges that advice.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 680,
  question: "What's one area of our relationship you want to continue growing and improving as we move forward?",
  reflection: "Healthy relationships are always evolving. Reflect on an aspect—communication, intimacy, trust, etc.—that you're committed to nurturing further, and discuss how both of you can actively contribute to that growth in the future.",
  category: "relationship-wisdom",
  deckType: "couples"
},
{
  id: 681,
  question: "When do screens make you feel most connected to me, and when do they make you feel far away?",
  reflection: "Tech can be a bridge or a barrier. Notice the contexts that help you feel closer (sweet texts, shared memes) versus the ones that create distance (scrolling during dinner), so you can be intentional together.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 682,
  question: "What are three phone-etiquette habits we want in our relationship?",
  reflection: "Co-create norms (like phones down at meals, eye contact when one is speaking, or answering texts within a set window). Shared expectations reduce friction and increase presence.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 683,
  question: "How do you feel about read receipts and typing indicators between us?",
  reflection: "Small UI features can carry big meanings. Clarify whether these signals soothe or stress you, and align on settings that support trust rather than anxiety.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 684,
  question: "Would you ever want to share phone passcodes? Why or why not?",
  reflection: "Access can symbolize safety or control. Discuss the value behind your preference (privacy, autonomy, transparency) and define respectful boundaries either way.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 685,
  question: "What are our boundaries around DM’s with exes or flirty acquaintances?",
  reflection: "Ambiguity breeds assumptions. Agree on what’s okay (friendly check-ins, group chats) and what crosses a line (late-night flirting), so both feel secure.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 686,
  question: "How do you want me to check in if I’m bothered by something I see online?",
  reflection: "Design a repair path: name the feeling, ask for context, and choose a calm time. Process > proof. This keeps you allies instead of adversaries.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 687,
  question: "What do you consider 'digital cheating'?",
  reflection: "Define the gray zones—secret chats, saved photos, private browsing. Naming the line together turns guesswork into clarity.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 688,
  question: "How do you feel about posting each other on social media?",
  reflection: "Visibility can feel validating or vulnerable. Share your comfort level and set consent rules for photos, captions, and tags.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 689,
  question: "Location sharing: comforting, creepy, or contextual?",
  reflection: "Safety and autonomy both matter. Explore scenarios where sharing helps (travel, late nights) versus when it feels invasive. Choose defaults and exceptions.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 690,
  question: "What are our 'no-phone' zones or times?",
  reflection: "Create tiny sanctuaries—bedtime, dates, meals, reunions. Protecting moments of presence strengthens intimacy without needing grand gestures.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 691,
  question: "How much news or doomscrolling feels healthy for us?",
  reflection: "Stress is contagious. Agree on guardrails (time limits, shared summaries, end-of-day cutoffs) to keep your nervous systems steady.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 692,
  question: "What’s our approach to saving and sharing private photos or videos?",
  reflection: "Discuss consent, storage, deletion, and security. Planning ahead honors desire and safety at the same time.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 693,
  question: "How do we handle friend requests from people one of us doesn’t trust?",
  reflection: "Trust your partner’s spidey sense. Create a 'listen first' rule and agree on what warrants a decline, mute, or boundary chat.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 694,
  question: "What’s a healthy way to react if one of us checks the other’s phone?",
  reflection: "If it happens, focus on the underlying anxiety rather than the device. Repair by naming fears, sharing context, and resetting agreements.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 695,
  question: "How should we handle algorithmic temptations (thirst traps, suggestive content)?",
  reflection: "You can’t control the feed, but you can control responses. Discuss hiding content, pausing, or narrating aloud to keep trust intact.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 696,
  question: "What’s our protocol for urgent texts during work or social time?",
  reflection: "Create a shared signal (e.g., '911' or a specific emoji) so true urgency jumps the queue without making every ping feel critical.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 697,
  question: "How do smart-home devices (mics, cams) affect your sense of privacy?",
  reflection: "Tech convenience can clash with comfort. Decide where devices are welcome, what’s muted, and who can access recordings.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 698,
  question: "What do you need from me when jealousy is triggered by something online?",
  reflection: "Ask for the specific medicine: reassurance, context, or a small boundary tweak. Precision care heals faster than defenses.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 699,
  question: "What shared digital rituals could bring us joy?",
  reflection: "Consider a nightly meme swap, photo-of-the-day, or a shared playlist. Tiny signals of 'I’m thinking of you' add up.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 700,
  question: "If our devices disappeared for a week, what parts of us would reappear?",
  reflection: "Imagine the space you’d regain—attention, patience, play. Let this vision guide one small change you’ll start this week.",
  category: "tech-and-privacy",
  deckType: "couples"
},
{
  id: 701,
  question: "What’s one five-minute ritual that would improve our day together?",
  reflection: "Small and consistent beats grand and rare. Think coffee check-ins, a forehead kiss, or a quick gratitude swap.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 702,
  question: "Morning people or night owls—how can our rhythms meet kindly?",
  reflection: "Design handoffs: quiet hours, who preps mornings, who closes nights, and one overlap moment for connection.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 703,
  question: "What weekly check-in format would we actually look forward to?",
  reflection: "Try a 20-minute structure: appreciations → logistics → feelings → one tiny improvement for next week.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 704,
  question: "Which chore most affects your mood if it’s undone?",
  reflection: "Name the 'keystone chore' for each person and prioritize those. The payoff in peace is outsized.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 705,
  question: "What’s a playful micro-ritual we can add to date nights?",
  reflection: "Maybe a two-song dance in the kitchen, a 'rose/thorn/bud' debrief, or swapping a surprise $5 treat.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 706,
  question: "What are our 'repair rituals' after conflict?",
  reflection: "Pre-agree on steps: time-out word, reconnection window, apology language, and a closing hug or walk.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 707,
  question: "How do we want to close our nights together?",
  reflection: "Screens off, lights dim, one affirmation, three breaths holding hands—design a gentle landing.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 708,
  question: "What food or movement routines make us feel most like a team?",
  reflection: "Batch-cook Sundays, mid-week stretch breaks, or a shared step goal. Make health a co-created habit.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 709,
  question: "What’s a monthly 'reset day' we’d love?",
  reflection: "Calendar it: clean, budget chat, schedule dates, set one home upgrade, and celebrate with takeout.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 710,
  question: "How do we ritualize appreciation so it isn’t forgotten?",
  reflection: "Try 'one thank-you per day' or a jar of notes you read on Sundays. Admiration is renewable fuel.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 711,
  question: "What’s our screen-free window each day?",
  reflection: "Presence needs protection. Even 20–60 minutes daily can shift the emotional climate of home.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 712,
  question: "Which holiday or seasonal traditions feel like 'us'?",
  reflection: "Invent your own—first-snow cocoa walk, summer sunrise breakfast, fall soup night with friends.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 713,
  question: "What’s a Sunday (or weekly) planning ritual that reduces our stress?",
  reflection: "Share calendars, budget glance, meals, rides, and one joy plan. 30 minutes saves 5 arguments.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 714,
  question: "How do we want to greet and part each day?",
  reflection: "Bookend moments matter. Eye contact, a real hug, and a custom phrase become anchors of safety.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 715,
  question: "What’s a quarterly 'mini-adventure' we can ritualize?",
  reflection: "Pick a rotating theme: nature, art, foodie, learn. Put it on the calendar now so novelty is guaranteed.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 716,
  question: "Which money touch-points keep us aligned without dragging us down?",
  reflection: "Try a 10-minute weekly snapshot and a deeper monthly review. Short, scheduled, judgment-free.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 717,
  question: "What intimacy ritual could we add that feels warm, not pressured?",
  reflection: "Consider non-sexual closeness (massage, shower, cuddle time) and let desire arise from connection.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 718,
  question: "How do we honor individuality inside our routines?",
  reflection: "Protect solo time and hobbies in the schedule. Autonomy makes togetherness sweeter, not threatened.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 719,
  question: "What 'finish line' each day tells us the workday is truly over?",
  reflection: "Change your state: walk, music, stretch, shower, or a shared snack. Rituals help your body switch modes.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 720,
  question: "If we kept only one ritual for the next year, which would you choose and why?",
  reflection: "Prioritizing reveals what nourishes you most. Let that practice be the spine while others flex around it.",
  category: "rituals-and-routines",
  deckType: "couples"
},
{
  id: 761,
  question: "What does feeling ‘well’ look like for you this month?",
  reflection: "Define concrete signs of wellbeing (sleep, mood, energy, connection) so you both know what you’re aiming to support.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 762,
  question: "When I’m stressed, what’s the most helpful thing you can do in the first five minutes?",
  reflection: "Make support actionable: touch, space, water, humor, or a quick plan. Agree on a go-to response.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 763,
  question: "Which habits of mine boost your wellbeing—and which quietly drain it?",
  reflection: "Name small behaviors (bedtime, phone use, tone) that shift the household climate more than you realize.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 764,
  question: "What’s one food or movement ritual we could add that would be easy and fun?",
  reflection: "Choose the smallest change with the highest joy-to-effort ratio to build momentum together.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 765,
  question: "How do you want me to respond when you skip a goal you set for yourself?",
  reflection: "Support > policing. Align on encouragement, curiosity, and resets without shame.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 766,
  question: "What’s a boundary around sleep that would help us both feel better?",
  reflection: "Protect sleep like medicine: lights, screens, noise, pets, bedtime, or separate wind-down routines.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 767,
  question: "Which appointments or checkups are we overdue for?",
  reflection: "Turn anxiety into action: list, schedule, and decide who books what so care doesn’t rely on memory.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 768,
  question: "How do we want to talk about body image with each other?",
  reflection: "Agree on language that is tender, consent-based, and focused on care—not criticism.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 769,
  question: "What’s a stress signal I show that you notice before I do?",
  reflection: "Early cues (sighs, scrolling, tone) allow gentle check-ins and prevent spirals.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 770,
  question: "What’s our plan for sick days—roles, comfort items, and decisions?",
  reflection: "Create a mini-protocol now: who calls, what foods, meds on hand, and rest expectations.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 771,
  question: "Which substances or habits deserve a reset for either of us?",
  reflection: "Name alcohol, caffeine, sugar, vaping, doom-scrolling, or work hours—and design a compassionate tweak.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 772,
  question: "How do we share tough news about health in a way that feels safe?",
  reflection: "Decide on timing, place, and tone. Safety is structure + softness.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 773,
  question: "What movement makes you feel most alive, and how can I join or cheer you on?",
  reflection: "Support can be companionship, logistics, or celebration—choose the form that actually motivates.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 774,
  question: "Where do we need clearer consent around touch when one of us is depleted?",
  reflection: "Align on signals for cuddle, massage, sexual touch, or ‘just hold my hand’ so care lands right.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 775,
  question: "What does a nourishing evening look like on a hard weekday?",
  reflection: "Design a default: simple dinner, 20-minute reset, screens rules, and a 10-minute connection check.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 776,
  question: "Which chores most affect our stress if they slip—and how do we safeguard them?",
  reflection: "Identify ‘linchpin’ tasks (dishes, trash, laundry) and assign owners, timers, or automations.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 777,
  question: "How do we want to handle mental-health dips (yours or mine)?",
  reflection: "Make a care map: signs, words that help, words to avoid, people to contact, and next steps.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 778,
  question: "What’s one tiny joy we could ritualize daily in under five minutes?",
  reflection: "Tea, a song, a stretch, a one-line gratitude—micro-rituals compound into emotional fitness.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 779,
  question: "Where do we overspend our energy—socially, digitally, or at work—and how can we budget it better?",
  reflection: "Energy is a currency. Decide what to cut, what to keep, and where to invest together.",
  category: "health-wellbeing",
  deckType: "couples"
},
{
  id: 780,
  question: "What would ‘care for the caregiver’ look like for us?",
  reflection: "If one person does more caretaking (kids, elders, deadlines), name resets, appreciation, and backup plans.",
  category: "health-wellbeing",
  deckType: "couples"
}  
];
