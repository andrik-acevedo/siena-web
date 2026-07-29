export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    id: string;
    text: string;
    type: string;
  }[];
}

export type LoveLanguageType = 
  | 'physical-touch'
  | 'words-of-affirmation'
  | 'acts-of-service'
  | 'quality-time'
  | 'receiving-gifts';

export const LOVE_LANGUAGE_DESCRIPTIONS: Record<LoveLanguageType, string> = {
  'physical-touch': 'You feel most loved through physical affection like hugs, kisses, and gentle touches. Physical presence and accessibility are crucial to you.',
  'words-of-affirmation': 'You value verbal acknowledgments of affection, including frequent "I love you\'s," compliments, words of appreciation, and verbal encouragement.',
  'acts-of-service': 'You feel loved when people do things for you. Actions speak louder than words to you.',
  'quality-time': 'You feel most loved when people spend quality time with you and give you their undivided attention.',
  'receiving-gifts': 'You feel most loved when people give you gifts that show that they were thinking about you.'
};

export const LOVE_LANGUAGE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What makes you feel most appreciated in a relationship?",
    options: [
      { id: "a", text: "When my partner gives me their undivided attention", type: "quality-time" },
      { id: "b", text: "When my partner gives me unexpected gifts", type: "receiving-gifts" },
      { id: "c", text: "When my partner helps me with tasks without being asked", type: "acts-of-service" },
      { id: "d", text: "When my partner tells me how much they appreciate me", type: "words-of-affirmation" },
      { id: "e", text: "When my partner shows physical affection", type: "physical-touch" }
    ]
  },
  {
    id: 2,
    question: "Which gesture would mean the most to you?",
    options: [
      { id: "a", text: "A heartfelt letter expressing their feelings", type: "words-of-affirmation" },
      { id: "b", text: "A long hug after a tough day", type: "physical-touch" },
      { id: "c", text: "Taking care of a task you've been dreading", type: "acts-of-service" },
      { id: "d", text: "A thoughtful, personalized gift", type: "receiving-gifts" },
      { id: "e", text: "An uninterrupted conversation about your day", type: "quality-time" }
    ]
  },
  {
    id: 3,
    question: "What would hurt your feelings the most?",
    options: [
      { id: "a", text: "Your partner forgetting to get you a birthday gift", type: "receiving-gifts" },
      { id: "b", text: "Your partner being distracted when you're talking", type: "quality-time" },
      { id: "c", text: "Your partner rarely offering physical affection", type: "physical-touch" },
      { id: "d", text: "Your partner rarely saying 'I love you'", type: "words-of-affirmation" },
      { id: "e", text: "Your partner rarely helping with daily tasks", type: "acts-of-service" }
    ]
  },
  {
    id: 4,
    question: "What do you wish your partner would do more often?",
    options: [
      { id: "a", text: "Help around the house without being asked", type: "acts-of-service" },
      { id: "b", text: "Plan special dates just for us", type: "quality-time" },
      { id: "c", text: "Give me compliments and words of encouragement", type: "words-of-affirmation" },
      { id: "d", text: "Surprise me with meaningful gifts", type: "receiving-gifts" },
      { id: "e", text: "Hold my hand or show physical affection", type: "physical-touch" }
    ]
  },
  {
    id: 5,
    question: "How do you prefer to show love to others?",
    options: [
      { id: "a", text: "Giving them my full attention and time", type: "quality-time" },
      { id: "b", text: "Offering words of encouragement and praise", type: "words-of-affirmation" },
      { id: "c", text: "Finding the perfect gift for them", type: "receiving-gifts" },
      { id: "d", text: "Helping them with their responsibilities", type: "acts-of-service" },
      { id: "e", text: "Giving hugs and physical affection", type: "physical-touch" }
    ]
  },
  {
    id: 6,
    question: "What makes you feel most connected to someone?",
    options: [
      { id: "a", text: "Physical closeness and touch", type: "physical-touch" },
      { id: "b", text: "Deep, meaningful conversations", type: "quality-time" },
      { id: "c", text: "Receiving thoughtful presents", type: "receiving-gifts" },
      { id: "d", text: "When they help me accomplish tasks", type: "acts-of-service" },
      { id: "e", text: "Hearing them express their feelings", type: "words-of-affirmation" }
    ]
  },
  {
    id: 7,
    question: "What's your ideal way to spend time with someone?",
    options: [
      { id: "a", text: "Shopping for gifts together", type: "receiving-gifts" },
      { id: "b", text: "Cuddling and being physically close", type: "physical-touch" },
      { id: "c", text: "Having a heart-to-heart talk", type: "words-of-affirmation" },
      { id: "d", text: "Working on a project together", type: "acts-of-service" },
      { id: "e", text: "Doing an activity with full attention", type: "quality-time" }
    ]
  },
  {
    id: 8,
    question: "What makes you feel most secure in a relationship?",
    options: [
      { id: "a", text: "Regular verbal affirmation of love", type: "words-of-affirmation" },
      { id: "b", text: "Consistent physical affection", type: "physical-touch" },
      { id: "c", text: "Receiving meaningful gifts", type: "receiving-gifts" },
      { id: "d", text: "Having their undivided attention", type: "quality-time" },
      { id: "e", text: "Them taking care of important tasks", type: "acts-of-service" }
    ]
  },
  {
    id: 9,
    question: "What's the best way someone can show they're thinking of you?",
    options: [
      { id: "a", text: "Sending a caring message", type: "words-of-affirmation" },
      { id: "b", text: "Getting me a thoughtful gift", type: "receiving-gifts" },
      { id: "c", text: "Making time to see me", type: "quality-time" },
      { id: "d", text: "Doing something helpful", type: "acts-of-service" },
      { id: "e", text: "Giving me a hug or kiss", type: "physical-touch" }
    ]
  },
  {
    id: 10,
    question: "What makes you feel most loved after a difficult day?",
    options: [
      { id: "a", text: "A surprise gift to cheer me up", type: "receiving-gifts" },
      { id: "b", text: "Words of understanding and support", type: "words-of-affirmation" },
      { id: "c", text: "Physical comfort like a hug", type: "physical-touch" },
      { id: "d", text: "Someone taking care of my responsibilities", type: "acts-of-service" },
      { id: "e", text: "Someone sitting with me and listening", type: "quality-time" }
    ]
  }
];

export type AttachmentStyleType =
  | 'secure'
  | 'anxious'
  | 'avoidant'
  | 'fearful-avoidant';

export const ATTACHMENT_STYLE_DESCRIPTIONS: Record<AttachmentStyleType, string> = {
  secure: 'You are comfortable with intimacy and autonomy. You trust others and find it easy to depend on people and have them depend on you.',
  anxious: 'You crave closeness and often worry about your relationships. You may fear abandonment and seek reassurance from others.',
  avoidant: 'You value independence and often pull away when things get too close. You may have trouble trusting or depending on others.',
  'fearful-avoidant': 'You desire connection but fear getting hurt. You may swing between wanting closeness and pushing people away.'
};

export const ATTACHMENT_STYLE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "How do you feel when your partner wants to spend a lot of time together?",
    options: [
      { id: 'a', text: "I enjoy it and feel connected.", type: 'secure' },
      { id: 'b', text: "I worry they might not truly enjoy it as much as I do.", type: 'anxious' },
      { id: 'c', text: "I feel smothered and want some space.", type: 'avoidant' },
      { id: 'd', text: "I want it but then feel overwhelmed when it happens.", type: 'fearful-avoidant' }
    ]
  },
  {
    id: 2,
    question: "When conflict arises, how do you typically react?",
    options: [
      { id: 'a', text: "I try to talk it through calmly.", type: 'secure' },
      { id: 'b', text: "I get upset and fear losing the relationship.", type: 'anxious' },
      { id: 'c', text: "I shut down or try to avoid the issue.", type: 'avoidant' },
      { id: 'd', text: "I get angry but also afraid of being left.", type: 'fearful-avoidant' }
    ]
  },
  {
    id: 3,
    question: "How do you feel about relying on others emotionally?",
    options: [
      { id: 'a', text: "I'm comfortable doing so and letting others rely on me.", type: 'secure' },
      { id: 'b', text: "I do it often but worry I might be too much.", type: 'anxious' },
      { id: 'c', text: "I prefer not to depend on anyone.", type: 'avoidant' },
      { id: 'd', text: "I want to, but I'm afraid of getting hurt.", type: 'fearful-avoidant' }
    ]
  },
  {
    id: 4,
    question: "How do you typically feel when you start to get close to someone romantically?",
    options: [
      { id: 'a', text: "It feels natural and fulfilling.", type: 'secure' },
      { id: 'b', text: "I get nervous that I'll mess it up.", type: 'anxious' },
      { id: 'c', text: "I question whether I should continue.", type: 'avoidant' },
      { id: 'd', text: "I want it but worry I'll be rejected.", type: 'fearful-avoidant' }
    ]
  },
  {
    id: 5,
    question: "What best describes your view on commitment?",
    options: [
      { id: 'a', text: "I value and seek long-term commitment.", type: 'secure' },
      { id: 'b', text: "I commit easily but often feel anxious.", type: 'anxious' },
      { id: 'c', text: "Commitment makes me feel trapped.", type: 'avoidant' },
      { id: 'd', text: "I want commitment but am scared of being vulnerable.", type: 'fearful-avoidant' }
    ]
  },
  {
    id: 6,
    question: "How do you feel when your partner is emotionally unavailable?",
    options: [
      { id: 'a', text: "I try to support them and stay calm.", type: 'secure' },
      { id: 'b', text: "I feel panicked and seek their reassurance.", type: 'anxious' },
      { id: 'c', text: "I back off and feel like pulling away.", type: 'avoidant' },
      { id: 'd', text: "I feel conflicted between reaching out and shutting down.", type: 'fearful-avoidant' }
    ]
  },
  {
    id: 7,
    question: "What best describes your trust in others?",
    options: [
      { id: 'a', text: "I generally trust people until given a reason not to.", type: 'secure' },
      { id: 'b', text: "I want to trust but often expect disappointment.", type: 'anxious' },
      { id: 'c', text: "I assume people will let me down.", type: 'avoidant' },
      { id: 'd', text: "I hope for trust but struggle with fear and doubt.", type: 'fearful-avoidant' }
    ]
  },
  {
    id: 8,
    question: "When your partner pulls away emotionally, what do you tend to do?",
    options: [
      { id: 'a', text: "Give them space and remain emotionally available.", type: 'secure' },
      { id: 'b', text: "Try harder to get closer and feel anxious.", type: 'anxious' },
      { id: 'c', text: "Withdraw even more.", type: 'avoidant' },
      { id: 'd', text: "Feel torn between pursuing and avoiding them.", type: 'fearful-avoidant' }
    ]
  },
  {
    id: 9,
    question: "How do you handle feeling vulnerable with someone?",
    options: [
      { id: 'a', text: "I feel okay being vulnerable and open.", type: 'secure' },
      { id: 'b', text: "I'm afraid they'll use it against me.", type: 'anxious' },
      { id: 'c', text: "I avoid showing vulnerability.", type: 'avoidant' },
      { id: 'd', text: "I want to be vulnerable but fear being hurt.", type: 'fearful-avoidant' }
    ]
  },
  {
    id: 10,
    question: "How do you feel about needing reassurance in a relationship?",
    options: [
      { id: 'a', text: "I sometimes need it, and that feels normal.", type: 'secure' },
      { id: 'b', text: "I need it often and worry when I don't get it.", type: 'anxious' },
      { id: 'c', text: "I think I shouldn't need it and avoid asking.", type: 'avoidant' },
      { id: 'd', text: "I want it but don't know how to ask.", type: 'fearful-avoidant' }
    ]
  }
];

export type ConflictStyleType =
  | 'avoidant'
  | 'competitive'
  | 'accommodating'
  | 'collaborative'
  | 'compromising';

export const CONFLICT_STYLE_DESCRIPTIONS: Record<ConflictStyleType, string> = {
  'avoidant': 'You tend to withdraw from conflict situations, hoping they will resolve themselves. While this can temporarily reduce tension, it may leave important issues unaddressed.',
  'competitive': 'You approach conflict with a strong drive to achieve your goals. While this can be effective in emergencies, it may strain relationships if used too often.',
  'accommodating': 'You prioritize maintaining harmony and often put others\' needs before your own. While this promotes good relationships, it may lead to your needs being overlooked.',
  'collaborative': 'You seek solutions that fully satisfy everyone\'s concerns. This approach leads to win-win outcomes but requires time and energy from all parties.',
  'compromising': 'You look for middle-ground solutions where everyone gets some of what they want. This is practical but may not always address deeper needs.'
};

export const CONFLICT_STYLE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "When disagreement arises, what is your instinctive reaction?",
    options: [
      { id: 'a', text: "Avoid the discussion and hope it blows over", type: 'avoidant' },
      { id: 'b', text: "Stand your ground and argue your point", type: 'competitive' },
      { id: 'c', text: "Let the other person have their way to end the tension", type: 'accommodating' },
      { id: 'd', text: "Explore solutions that work for both of you", type: 'collaborative' },
      { id: 'e', text: "Look for a compromise that satisfies both a little", type: 'compromising' },
    ]
  },
  {
    id: 2,
    question: "How do you feel after a conflict with a loved one?",
    options: [
      { id: 'a', text: "Relieved it's over, even if unresolved", type: 'avoidant' },
      { id: 'b', text: "Victorious, if your point was heard", type: 'competitive' },
      { id: 'c', text: "Guilty, even if you let them win", type: 'accommodating' },
      { id: 'd', text: "Curious about what each of you learned", type: 'collaborative' },
      { id: 'e', text: "Neutral, you both gave a little", type: 'compromising' },
    ]
  },
  {
    id: 3,
    question: "How do you typically express your needs in a disagreement?",
    options: [
      { id: 'a', text: "I tend to stay quiet or pull away", type: 'avoidant' },
      { id: 'b', text: "I make sure my point is clear and direct", type: 'competitive' },
      { id: 'c', text: "I minimize my needs so we don't argue", type: 'accommodating' },
      { id: 'd', text: "I talk it through and invite their perspective", type: 'collaborative' },
      { id: 'e', text: "I offer solutions where we both give something up", type: 'compromising' },
    ]
  },
  {
    id: 4,
    question: "What do you most want to avoid during conflict?",
    options: [
      { id: 'a', text: "Any tension or discomfort", type: 'avoidant' },
      { id: 'b', text: "Being seen as weak or wrong", type: 'competitive' },
      { id: 'c', text: "Hurting the other person's feelings", type: 'accommodating' },
      { id: 'd', text: "Unfair outcomes where no one's heard", type: 'collaborative' },
      { id: 'e', text: "Reaching a total impasse", type: 'compromising' },
    ]
  },
  {
    id: 5,
    question: "Which statement resonates most with how you navigate conflict?",
    options: [
      { id: 'a', text: "Conflict is uncomfortable and best avoided", type: 'avoidant' },
      { id: 'b', text: "It's important to assert my views clearly", type: 'competitive' },
      { id: 'c', text: "I'd rather be agreeable than start an argument", type: 'accommodating' },
      { id: 'd', text: "We all deserve a voice in the resolution", type: 'collaborative' },
      { id: 'e', text: "We should aim for a fair middle ground", type: 'compromising' },
    ]
  },
  {
    id: 6,
    question: "What's your usual strategy when there's tension and no immediate solution?",
    options: [
      { id: 'a', text: "Put off the conversation until things calm down", type: 'avoidant' },
      { id: 'b', text: "Insist on continuing the discussion until it's resolved", type: 'competitive' },
      { id: 'c', text: "Apologize quickly, even if you're unsure it's your fault", type: 'accommodating' },
      { id: 'd', text: "Acknowledge the tension and suggest brainstorming together", type: 'collaborative' },
      { id: 'e', text: "Offer to meet in the middle so both sides can move on", type: 'compromising' },
    ]
  },
  {
    id: 7,
    question: "How do you handle disagreement when emotions are running high?",
    options: [
      { id: 'a', text: "Stay silent and hope it blows over", type: 'avoidant' },
      { id: 'b', text: "Double down to prove your point", type: 'competitive' },
      { id: 'c', text: "Back off to keep things peaceful", type: 'accommodating' },
      { id: 'd', text: "Pause the conversation and revisit it when calmer", type: 'collaborative' },
      { id: 'e', text: "Suggest a temporary truce while both sides reflect", type: 'compromising' },
    ]
  },
  {
    id: 8,
    question: "In your opinion, what is the best way to repair after a fight?",
    options: [
      { id: 'a', text: "Avoid bringing it up again", type: 'avoidant' },
      { id: 'b', text: "Clarify why your approach was right", type: 'competitive' },
      { id: 'c', text: "Say sorry and move on, regardless of who was at fault", type: 'accommodating' },
      { id: 'd', text: "Talk through what happened and how both of you felt", type: 'collaborative' },
      { id: 'e', text: "Agree to disagree and reset expectations", type: 'compromising' },
    ]
  },
  {
    id: 9,
    question: "How do you feel when someone disagrees with your ideas?",
    options: [
      { id: 'a', text: "I tend to withdraw or not engage further", type: 'avoidant' },
      { id: 'b', text: "I become more forceful in defending my view", type: 'competitive' },
      { id: 'c', text: "I usually let them take the lead", type: 'accommodating' },
      { id: 'd', text: "I ask questions to better understand their side", type: 'collaborative' },
      { id: 'e', text: "I try to adjust my idea so it includes parts of theirs", type: 'compromising' },
    ]
  },
  {
    id: 10,
    question: "What role does fairness play in your approach to conflict?",
    options: [
      { id: 'a', text: "I avoid the conflict regardless of fairness", type: 'avoidant' },
      { id: 'b', text: "Fairness means getting what I deserve", type: 'competitive' },
      { id: 'c', text: "Fairness is less important than keeping the peace", type: 'accommodating' },
      { id: 'd', text: "Fairness is about hearing and honoring both voices", type: 'collaborative' },
      { id: 'e', text: "Fairness lies in both sides giving something up", type: 'compromising' },
    ]
  }
];

export type CommunicationStyleType =
  | 'assertive'
  | 'passive'
  | 'aggressive'
  | 'passive-aggressive';

export const COMMUNICATION_STYLE_DESCRIPTIONS: Record<CommunicationStyleType, string> = {
  'assertive': 'You express your needs and feelings clearly while respecting others. You maintain healthy boundaries and communicate directly but kindly.',
  'passive': 'You tend to avoid expressing your needs and feelings to avoid conflict. You may struggle with setting boundaries and standing up for yourself.',
  'aggressive': 'You express your needs forcefully and may come across as intimidating. While you get your point across, you might damage relationships.',
  'passive-aggressive': 'You struggle to express needs directly and may use indirect methods like sarcasm or withdrawal. This can lead to misunderstandings.'
};

export const COMMUNICATION_STYLE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "When you disagree with someone, how do you typically express it?",
    options: [
      { id: 'a', text: "I clearly state my position while considering their view", type: 'assertive' },
      { id: 'b', text: "I usually keep my disagreement to myself", type: 'passive' },
      { id: 'c', text: "I strongly express my opinion and why I'm right", type: 'aggressive' },
      { id: 'd', text: "I might make subtle comments or withdraw", type: 'passive-aggressive' }
    ]
  },
  {
    id: 2,
    question: "How do you handle it when someone upsets you?",
    options: [
      { id: 'a', text: "I address the issue directly with them", type: 'assertive' },
      { id: 'b', text: "I try to let it go and avoid confrontation", type: 'passive' },
      { id: 'c', text: "I immediately let them know they've upset me", type: 'aggressive' },
      { id: 'd', text: "I might act nice but distance myself", type: 'passive-aggressive' }
    ]
  },
  {
    id: 3,
    question: "When setting boundaries, you typically:",
    options: [
      { id: 'a', text: "Clearly state your limits while being respectful", type: 'assertive' },
      { id: 'b', text: "Find it difficult to say no or set limits", type: 'passive' },
      { id: 'c', text: "Firmly establish rules and expectations", type: 'aggressive' },
      { id: 'd', text: "Set boundaries indirectly or through hints", type: 'passive-aggressive' }
    ]
  },
  {
    id: 4,
    question: "In group discussions, you tend to:",
    options: [
      { id: 'a', text: "Share your views while encouraging others to speak", type: 'assertive' },
      { id: 'b', text: "Listen more than speak, even if you have ideas", type: 'passive' },
      { id: 'c', text: "Dominate the conversation with your opinions", type: 'aggressive' },
      { id: 'd', text: "Participate minimally and maybe criticize later", type: 'passive-aggressive' }
    ]
  },
  {
    id: 5,
    question: "When asking for what you need, you usually:",
    options: [
      { id: 'a', text: "Express your needs clearly and directly", type: 'assertive' },
      { id: 'b', text: "Wait for others to notice what you need", type: 'passive' },
      { id: 'c', text: "Demand what you need forcefully", type: 'aggressive' },
      { id: 'd', text: "Drop hints and hope they understand", type: 'passive-aggressive' }
    ]
  },
  {
    id: 6,
    question: "When someone criticizes you, you tend to:",
    options: [
      { id: 'a', text: "Listen and respond thoughtfully", type: 'assertive' },
      { id: 'b', text: "Accept it without defending yourself", type: 'passive' },
      { id: 'c', text: "Strongly defend yourself or counter-criticize", type: 'aggressive' },
      { id: 'd', text: "Appear to accept it but resent it internally", type: 'passive-aggressive' }
    ]
  },
  {
    id: 7,
    question: "In conflict situations, you typically:",
    options: [
      { id: 'a', text: "Address issues directly while staying calm", type: 'assertive' },
      { id: 'b', text: "Try to keep peace by agreeing or staying quiet", type: 'passive' },
      { id: 'c', text: "Push to resolve things your way quickly", type: 'aggressive' },
      { id: 'd', text: "Avoid direct conflict but show displeasure indirectly", type: 'passive-aggressive' }
    ]
  },
  {
    id: 8,
    question: "When expressing emotions, you tend to:",
    options: [
      { id: 'a', text: "Share feelings openly while staying composed", type: 'assertive' },
      { id: 'b', text: "Keep feelings to yourself to avoid burdening others", type: 'passive' },
      { id: 'c', text: "Express emotions intensely and immediately", type: 'aggressive' },
      { id: 'd', text: "Show emotions indirectly through behavior", type: 'passive-aggressive' }
    ]
  },
  {
    id: 9,
    question: "When someone misunderstands you, you usually:",
    options: [
      { id: 'a', text: "Explain your perspective clearly and calmly", type: 'assertive' },
      { id: 'b', text: "Let it go to avoid making things awkward", type: 'passive' },
      { id: 'c', text: "Correct them immediately and firmly", type: 'aggressive' },
      { id: 'd', text: "Make subtle comments about their misunderstanding", type: 'passive-aggressive' }
    ]
  },
  {
    id: 10,
    question: "When working on a team, you tend to:",
    options: [
      { id: 'a', text: "Contribute ideas while valuing others' input", type: 'assertive' },
      { id: 'b', text: "Go along with what others want", type: 'passive' },
      { id: 'c', text: "Take charge and direct others", type: 'aggressive' },
      { id: 'd', text: "Participate minimally while judging others' work", type: 'passive-aggressive' }
    ]
  }
];

export type EmotionalIntelligenceType = 
  | 'self-aware'
  | 'emotion-regulator'
  | 'empathetic'
  | 'relationship-builder';

export const EMOTIONAL_INTELLIGENCE_DESCRIPTIONS: Record<EmotionalIntelligenceType, string> = {
  'self-aware': 'You have a strong understanding of your own emotions and their impact. You recognize your triggers and emotional patterns.',
  'emotion-regulator': 'You excel at managing your emotional responses and staying balanced under pressure. You can calm yourself effectively.',
  'empathetic': 'You naturally tune into others\' emotions and perspectives. You understand and share others\' feelings.',
  'relationship-builder': 'You create and maintain strong emotional connections. You navigate social situations with ease and build trust.'
};

export const EMOTIONAL_INTELLIGENCE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "When you experience strong emotions, what do you usually do first?",
    options: [
      { id: 'a', text: "Pause and reflect on what I'm feeling", type: 'self-aware' },
      { id:  'b', text: "Try to calm myself down immediately",  type: 'emotion-regulator'  },
      { id: 'c', text: "Think about how my emotions affect others", type: 'empathetic' },
      { id: 'd', text: "Reach out to someone I trust to connect", type: 'relationship-builder' }
    ]
  },
  {
    id: 2,
    question: "How easy is it for you to identify your emotions?",
    options: [
      { id: 'a', text: "Very easy—I usually know exactly what I'm feeling", type: 'self-aware' },
      { id: 'b', text: "I can tell when I'm upset, even if it takes a minute", type: 'emotion-regulator' },
      { id: 'c', text: "I notice my emotions more when I see how they affect others", type: 'empathetic' },
      { id: 'd', text: "I realize my emotions when I talk about them with someone", type: 'relationship-builder' }
    ]
  },
  {
    id: 3,
    question: "During conflicts, you are most likely to:",
    options: [
      { id: 'a', text: "Reflect on what triggered me", type: 'self-aware' },
      { id: 'b', text: "Try to stay calm and manage the situation", type: 'emotion-regulator' },
      { id: 'c', text: "Focus on understanding the other person's feelings", type: 'empathetic' },
      { id: 'd', text: "Work toward repairing the relationship quickly", type: 'relationship-builder' }
    ]
  },
  {
    id: 4,
    question: "When you're feeling overwhelmed, you tend to:",
    options: [
      { id: 'a', text: "Analyze why I feel that way", type: 'self-aware' },
      { id: 'b', text: "Use techniques like deep breathing or taking a walk", type: 'emotion-regulator' },
      { id: 'c', text: "Talk it through with someone empathetic", type: 'relationship-builder' },
      { id: 'd', text: "Consider how my feelings might affect my relationships", type: 'empathetic' }
    ]
  },
  {
    id: 5,
    question: "When you notice a friend is upset, you:",
    options: [
      { id: 'a', text: "Ask myself why their feelings are impacting me", type: 'self-aware' },
      { id: 'b', text: "Stay composed so I can support them", type: 'emotion-regulator' },
      { id: 'c', text: "Offer empathy and a listening ear", type: 'empathetic' },
      { id: 'd', text: "Take action to make them feel better", type: 'relationship-builder' }
    ]
  },
  {
    id: 6,
    question: "How do you view mistakes you make in emotional situations?",
    options: [
      { id: 'a', text: "Opportunities to learn about myself", type: 'self-aware' },
      { id: 'b', text: "Chances to practice emotional resilience", type: 'emotion-regulator' },
      { id: 'c', text: "Moments to better understand others", type: 'empathetic' },
      { id: 'd', text: "A reminder to strengthen my connections", type: 'relationship-builder' }
    ]
  },
  {
    id: 7,
    question: "Your strength in relationships is:",
    options: [
      { id: 'a', text: "Being aware of my own emotional needs", type: 'self-aware' },
      { id: 'b', text: "Staying composed even during tough times", type: 'emotion-regulator' },
      { id: 'c', text: "Deeply understanding others' feelings", type: 'empathetic' },
      { id: 'd', text: "Building trust and closeness easily", type: 'relationship-builder' }
    ]
  },
  {
    id: 8,
    question: "When you make an emotional decision, you:",
    options: [
      { id: 'a', text: "First reflect on my own feelings", type: 'self-aware' },
      { id: 'b', text: "Pause to make sure my emotions are balanced", type: 'emotion-regulator' },
      { id: 'c', text: "Consider how others might be impacted", type: 'empathetic' },
      { id: 'd', text: "Talk it over with someone I trust", type: 'relationship-builder' }
    ]
  },
  {
    id: 9,
    question: "In a group setting, you are more likely to:",
    options: [
      { id: 'a', text: "Monitor my own emotional reactions", type: 'self-aware' },
      { id: 'b', text: "Stay level-headed and regulate the vibe", type: 'emotion-regulator' },
      { id: 'c', text: "Pick up on subtle emotional cues from others", type: 'empathetic' },
      { id: 'd', text: "Create opportunities for everyone to connect", type: 'relationship-builder' }
    ]
  },
  {
    id: 10,
    question: "When facing emotional setbacks, your priority is to:",
    options: [
      { id: 'a', text: "Understand what triggered me", type: 'self-aware' },
      { id: 'b', text: "Manage my emotions so I can move forward", type: 'emotion-regulator' },
      { id: 'c', text: "Seek support and offer understanding to others", type: 'empathetic' },
      { id: 'd', text: "Maintain strong and supportive relationships", type: 'relationship-builder' }
    ]
  }
];

export type EmotionalRegulationType =
  | 'awareness'
  | 'acceptance'
  | 'strategies'
  | 'engagement';

export const EMOTIONAL_REGULATION_DESCRIPTIONS: Record<EmotionalRegulationType, string> = {
  'awareness': 'You excel at recognizing and understanding your emotional states. This awareness is the foundation for effective emotional regulation.',
  'acceptance': 'You have a healthy relationship with your emotions, accepting them without judgment while maintaining the ability to manage them.',
  'strategies': 'You have developed effective tools and techniques for managing your emotions in various situations.',
  'engagement': 'You actively engage with your emotions in a balanced way, neither avoiding nor becoming overwhelmed by them.'
};

export const EMOTIONAL_REGULATION_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "When you experience intense emotions, what's your typical response?",
    options: [
      { id: 'a', text: "Notice and identify the emotion immediately", type: 'awareness' },
      { id: 'b', text: "Allow myself to feel without judgment", type: 'acceptance' },
      { id: 'c', text: "Use specific techniques to manage the feeling", type: 'strategies' },
      { id: 'd', text: "Process the emotion while staying functional", type: 'engagement' }
    ]
  },
  {
    id: 2,
    question: "How do you handle stress in challenging situations?",
    options: [
      { id: 'a', text: "Recognize my stress signals early", type: 'awareness' },
      { id: 'b', text: "Accept that stress is a normal response", type: 'acceptance' },
      { id: 'c', text: "Apply stress-management techniques", type: 'strategies' },
      { id: 'd', text: "Stay present while managing the stress", type: 'engagement' }
    ]
  },
  {
    id: 3,
    question: "When faced with difficult emotions, you typically:",
    options: [
      { id: 'a', text: "Identify what triggered the emotion", type: 'awareness' },
      { id: 'b', text: "Acknowledge the emotion without trying to change it", type: 'acceptance' },
      { id: 'c', text: "Use specific coping strategies", type: 'strategies' },
      { id: 'd', text: "Work through the emotion actively", type: 'engagement' }
    ]
  },
  {
    id: 4,
    question: "Your approach to emotional self-care usually involves:",
    options: [
      { id: 'a', text: "Regular emotional check-ins", type: 'awareness' },
      { id: 'b', text: "Being kind to yourself when upset", type: 'acceptance' },
      { id: 'c', text: "Having a toolkit of calming techniques", type: 'strategies' },
      { id: 'd', text: "Actively maintaining emotional balance", type: 'engagement' }
    ]
  },
  {
    id: 5,
    question: "When you're feeling overwhelmed, you tend to:",
    options: [
      { id: 'a', text: "Notice the signs of overwhelm early", type: 'awareness' },
      { id: 'b', text: "Accept that it's okay to feel this way", type: 'acceptance' },
      { id: 'c', text: "Use specific grounding techniques", type: 'strategies' },
      { id: 'd', text: "Stay present while working through it", type: 'engagement' }
    ]
  },
  {
    id: 6,
    question: "How do you handle unexpected emotional reactions?",
    options: [
      { id: 'a', text: "Quickly identify what I'm feeling", type: 'awareness' },
      { id: 'b', text: "Allow the reaction without self-criticism", type: 'acceptance' },
      { id: 'c', text: "Apply learned coping methods", type: 'strategies' },
      { id: 'd', text: "Process the emotion while staying present", type: 'engagement' }
    ]
  },
  {
    id: 7,
    question: "Your emotional growth focuses mainly on:",
    options: [
      { id: 'a', text: "Better understanding my emotional patterns", type: 'awareness' },
      { id: 'b', text: "Being more accepting of all emotions", type: 'acceptance' },
      { id: 'c', text: "Learning new management techniques", type: 'strategies' },
      { id: 'd', text: "Maintaining healthy emotional engagement", type: 'engagement' }
    ]
  },
  {
    id: 8,
    question: "When dealing with negative emotions, you usually:",
    options: [
      { id: 'a', text: "Recognize them as they arise", type: 'awareness' },
      { id: 'b', text: "Accept them as part of the experience", type: 'acceptance' },
      { id: 'c', text: "Use specific regulation techniques", type: 'strategies' },
      { id: 'd', text: "Process them while staying functional", type: 'engagement' }
    ]
  },
  {
    id: 9,
    question: "Your emotional regulation strength lies in:",
    options: [
      { id: 'a', text: "Quickly identifying emotional states", type: 'awareness' },
      { id: 'b', text: "Being non-judgmental about feelings", type: 'acceptance' },
      { id: 'c', text: "Having effective coping strategies", type: 'strategies' },
      { id: 'd', text: "Maintaining emotional balance", type: 'engagement' }
    ]
  },
  {
    id: 10,
    question: "When emotions are running high, you tend to:",
    options: [
      { id: 'a', text: "Notice the intensity and its effects", type: 'awareness' },
      { id: 'b', text: "Accept the intensity without resistance", type: 'acceptance' },
      { id: 'c', text: "Use practiced calming techniques", type: 'strategies' },
      { id: 'd', text: "Stay engaged while managing intensity", type: 'engagement' }
    ]
  }
];

export type RedFlagAwarenessType =
  | 'high-awareness'
  | 'moderate-awareness'
  | 'developing-awareness'
  | 'limited-awareness';

export const RED_FLAG_AWARENESS_DESCRIPTIONS: Record<RedFlagAwarenessType, string> = {
  'high-awareness': 'You have a strong ability to recognize relationship red flags and understand their significance. You prioritize your well-being and maintain healthy boundaries.',
  'moderate-awareness': 'You can identify many relationship red flags but might occasionally doubt your judgment. You\'re developing stronger boundaries and trust in your instincts.',
  'developing-awareness': 'You\'re learning to recognize relationship red flags but may sometimes overlook them. You\'re working on building confidence in your perceptions.',
  'limited-awareness': 'You might struggle to identify relationship red flags or tend to minimize their importance. Building awareness and trust in your instincts would be beneficial.'
};

export const RED_FLAG_AWARENESS_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "How do you typically react when someone repeatedly cancels plans last minute?",
    options: [
      { id: 'a', text: "Recognize it as potentially problematic behavior and address it", type: 'high-awareness' },
      { id: 'b', text: "Feel concerned but unsure if I should say something", type: 'moderate-awareness' },
      { id: 'c', text: "Make excuses for their behavior", type: 'developing-awareness' },
      { id: 'd', text: "Don't see it as an issue", type: 'limited-awareness' }
    ]
  },
  {
    id: 2,
    question: "What's your response when someone tries to rush a relationship?",
    options: [
      { id: 'a', text: "Set clear boundaries and maintain my preferred pace", type: 'high-awareness' },
      { id: 'b', text: "Feel uncomfortable but might go along with it", type: 'moderate-awareness' },
      { id: 'c', text: "Get caught up in the excitement despite some concerns", type: 'developing-awareness' },
      { id: 'd', text: "See it as a sign of strong connection", type: 'limited-awareness' }
    ]
  },
  {
    id: 3,
    question: "How do you handle someone who frequently criticizes you?",
    options: [
      { id: 'a', text: "Recognize it as potentially toxic and address or distance myself", type: 'high-awareness' },
      { id: 'b', text: "Feel hurt but unsure how to respond", type: 'moderate-awareness' },
      { id: 'c', text: "Try to change myself to avoid criticism", type: 'developing-awareness' },
      { id: 'd', text: "Accept it as normal relationship behavior", type: 'limited-awareness' }
    ]
  },
  {
    id: 4,
    question: "What's your reaction when someone doesn't respect your boundaries?",
    options: [
      { id: 'a', text: "Firmly reinforce boundaries and consider it a red flag", type: 'high-awareness' },
      { id: 'b', text: "Feel uncomfortable but struggle to enforce boundaries", type: 'moderate-awareness' },
      { id: 'c', text: "Question if my boundaries are reasonable", type: 'developing-awareness' },
      { id: 'd', text: "Adjust my boundaries to match their preferences", type: 'limited-awareness' }
    ]
  },
  {
    id: 5,
    question: "How do you respond to someone who's inconsistent in their communication?",
    options: [
      { id: 'a', text: "Address the pattern and set clear expectations", type: 'high-awareness' },
      { id: 'b', text: "Notice it but hesitate to bring it up", type: 'moderate-awareness' },
      { id: 'c', text: "Focus on the positive moments when they do communicate", type: 'developing-awareness' },
      { id: 'd', text: "Accept inconsistent communication as normal", type: 'limited-awareness' }
    ]
  },
  {
    id: 6,
    question: "What do you do when someone tries to isolate you from friends or family?",
    options: [
      { id: 'a', text: "Recognize it as controlling behavior and take action", type: 'high-awareness' },
      { id: 'b', text: "Feel uneasy but try to balance both relationships", type: 'moderate-awareness' },
      { id: 'c', text: "Gradually spend less time with others to avoid conflict", type: 'developing-awareness' },
      { id: 'd', text: "See it as a sign of their commitment to the relationship", type: 'limited-awareness' }
    ]
  },
  {
    id: 7,
    question: "How do you handle someone who's possessive or jealous?",
    options: [
      { id: 'a', text: "See it as a serious red flag and address it directly", type: 'high-awareness' },
      { id: 'b', text: "Feel concerned but try to reassure them", type: 'moderate-awareness' },
      { id: 'c', text: "Modify my behavior to avoid triggering their jealousy", type: 'developing-awareness' },
      { id: 'd', text: "View it as a sign of love and caring", type: 'limited-awareness' }
    ]
  },
  {
    id: 8,
    question: "What's your response when someone constantly checks your phone or social media?",
    options: [
      { id: 'a', text: "Recognize it as controlling and set firm boundaries", type: 'high-awareness' },
      { id: 'b', text: "Feel uncomfortable but unsure how to address it", type: 'moderate-awareness' },
      { id: 'c', text: "Share passwords to prove I have nothing to hide", type: 'developing-awareness' },
      { id: 'd', text: "See it as normal in a close relationship", type: 'limited-awareness' }
    ]
  },
  {
    id: 9,
    question: "How do you handle someone who makes all decisions without consulting you?",
    options: [
      { id: 'a', text: "Address the behavior and insist on equal partnership", type: 'high-awareness' },
      { id: 'b', text: "Feel frustrated but struggle to speak up", type: 'moderate-awareness' },
      { id: 'c', text: "Go along with their decisions to keep peace", type: 'developing-awareness' },
      { id: 'd', text: "Accept their judgment as probably better than mine", type: 'limited-awareness' }
    ]
  },
  {
    id: 10,
    question: "What do you do when someone pressures you to do things you're not comfortable with?",
    options: [
      { id: 'a', text: "Maintain my boundaries and see it as a serious concern", type: 'high-awareness' },
      { id: 'b', text: "Feel conflicted but try to resist the pressure", type: 'moderate-awareness' },
      { id: 'c', text: "Eventually give in to keep them happy", type: 'developing-awareness' },
      { id: 'd', text: "Question if I'm being too rigid or difficult", type: 'limited-awareness' }
    ]
  }
];

export type BoundaryStyleType = 'rigid' | 'porous' | 'healthy';

export const BOUNDARY_STYLE_DESCRIPTIONS: Record<BoundaryStyleType, string> = {
  rigid: 'You tend to keep strong emotional walls up and may struggle to let others in. This can protect you from harm, but also isolate you from deeper connection.',
  porous: 'You may find it hard to say no or feel responsible for others\' feelings. This can lead to emotional exhaustion, resentment, or feeling taken for granted.',
  healthy: 'You express your needs while respecting others\'. You\'re able to say no without guilt and allow closeness without losing yourself in the process.'
};

export const BOUNDARY_STYLE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "When someone asks you to do something that overwhelms your schedule, you usually...",
    options: [
      { id: "a", text: "Say yes, even if it costs your own well-being", type: "porous" },
      { id: "b", text: "Say no without explanation, and avoid further discussion", type: "rigid" },
      { id: "c", text: "Evaluate your bandwidth and communicate your limits kindly", type: "healthy" }
    ]
  },
  {
    id: 2,
    question: "How do you react when someone expresses strong emotions around you?",
    options: [
      { id: "a", text: "You try to manage or fix their feelings", type: "porous" },
      { id: "b", text: "You shut down or avoid the person altogether", type: "rigid" },
      { id: "c", text: "You offer empathy while keeping emotional separation", type: "healthy" }
    ]
  },
  {
    id: 3,
    question: "When you're upset with someone, how do you usually handle it?",
    options: [
      { id: "a", text: "You keep it inside to avoid confrontation", type: "porous" },
      { id: "b", text: "You withdraw and give them the cold shoulder", type: "rigid" },
      { id: "c", text: "You express your feelings directly and respectfully", type: "healthy" }
    ]
  },
  {
    id: 4,
    question: "How do you feel when someone gets physically or emotionally close to you?",
    options: [
      { id: "a", text: "It's uncomfortable—you prefer distance and control", type: "rigid" },
      { id: "b", text: "You allow it even if it feels intrusive", type: "porous" },
      { id: "c", text: "You allow closeness while tuning into your comfort level", type: "healthy" }
    ]
  },
  {
    id: 5,
    question: "When someone crosses a line with you, how do you respond?",
    options: [
      { id: "a", text: "You feel violated but don't speak up", type: "porous" },
      { id: "b", text: "You cut them off or avoid them entirely", type: "rigid" },
      { id: "c", text: "You address it clearly and assertively", type: "healthy" }
    ]
  },
  {
    id: 6,
    question: "In your closest relationships, how much of yourself do you typically reveal?",
    options: [
      { id: "a", text: "Very little—it feels too risky", type: "rigid" },
      { id: "b", text: "A lot—even if the other person hasn't earned that trust", type: "porous" },
      { id: "c", text: "Just enough based on trust and safety", type: "healthy" }
    ]
  },
  {
    id: 7,
    question: "When others are upset with you, how do you typically feel?",
    options: [
      { id: "a", text: "Devastated—you fear rejection or conflict", type: "porous" },
      { id: "b", text: "Indifferent—it's their problem, not yours", type: "rigid" },
      { id: "c", text: "Concerned, but able to reflect without losing yourself", type: "healthy" }
    ]
  },
  {
    id: 8,
    question: "What's your relationship to asking for help?",
    options: [
      { id: "a", text: "You avoid it—don't want to appear weak", type: "rigid" },
      { id: "b", text: "You often over-rely on others to solve things", type: "porous" },
      { id: "c", text: "You ask when needed and feel okay giving and receiving support", type: "healthy" }
    ]
  },
  {
    id: 9,
    question: "When you're invited to something you don't want to attend, you...",
    options: [
      { id: "a", text: "Go anyway—you feel guilty saying no", type: "porous" },
      { id: "b", text: "Decline without consideration for the other person's feelings", type: "rigid" },
      { id: "c", text: "Politely decline and prioritize your own needs", type: "healthy" }
    ]
  },
  {
    id: 10,
    question: "What's your biggest fear around setting boundaries?",
    options: [
      { id: "a", text: "That I'll be rejected or seen as selfish", type: "porous" },
      { id: "b", text: "That I'll lose control or be seen as vulnerable", type: "rigid" },
      { id: "c", text: "That it'll be hard—but worth it to protect myself", type: "healthy" }
    ]
  }
];

export type RelationshipReadinessType =
  | 'very-ready'
  | 'mostly-ready'
  | 'somewhat-ready'
  | 'not-ready';

export const RELATIONSHIP_READINESS_DESCRIPTIONS: Record<RelationshipReadinessType, string> = {
  'very-ready': 'You demonstrate strong emotional awareness, clear boundaries, and healthy relationship skills. You\'re well-prepared for a committed relationship.',
  'mostly-ready': 'You have good relationship skills and self-awareness, with some areas for growth. You\'re generally prepared for a relationship while continuing to develop.',
  'somewhat-ready': 'You\'re developing important relationship skills but may benefit from more self-work. Consider focusing on personal growth before pursuing a serious relationship.',
  'not-ready': 'You may need to focus on personal development and healing before entering a relationship. Take time to build self-awareness and healthy relationship skills.'
};

export const RELATIONSHIP_READINESS_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "How do you feel about being single?",
    options: [
      { id: 'a', text: "Content and using the time for self-growth", type: 'very-ready' },
      { id: 'b', text: "Generally okay but sometimes lonely", type: 'mostly-ready' },
      { id: 'c', text: "Anxious to find someone", type: 'somewhat-ready' },
      { id: 'd', text: "Desperate to be in a relationship", type: 'not-ready' }
    ]
  },
  {
    id: 2,
    question: "How do you handle your emotional needs?",
    options: [
      { id: 'a', text: "I can meet most of my emotional needs independently", type: 'very-ready' },
      { id: 'b', text: "I manage well but sometimes need support", type: 'mostly-ready' },
      { id: 'c', text: "I often rely on others for emotional support", type: 'somewhat-ready' },
      { id: 'd', text: "I struggle to handle my emotions alone", type: 'not-ready' }
    ]
  },
  {
    id: 3,
    question: "How do you feel about your past relationships?",
    options: [
      { id: 'a', text: "I've learned and grown from them", type: 'very-ready' },
      { id: 'b', text: "I've mostly processed them but have some concerns", type: 'mostly-ready' },
      { id: 'c', text: "I'm still working through some issues", type: 'somewhat-ready' },
      { id: 'd', text: "I'm still very affected by past hurts", type: 'not-ready' }
    ]
  },
  {
    id: 4,
    question: "What's your approach to personal boundaries?",
    options: [
      { id: 'a', text: "I have clear boundaries and maintain them consistently", type: 'very-ready' },
      { id: 'b', text: "I usually maintain good boundaries", type: 'mostly-ready' },
      { id: 'c', text: "I'm working on setting better boundaries", type: 'somewhat-ready' },
      { id: 'd', text: "I struggle with setting or keeping boundaries", type: 'not-ready' }
    ]
  },
  {
    id: 5,
    question: "How do you handle conflict?",
    options: [
      { id: 'a', text: "I address it directly and constructively", type: 'very-ready' },
      { id: 'b', text: "I usually manage it well but sometimes struggle", type: 'mostly-ready' },
      { id: 'c', text: "I try to avoid it or get very emotional", type: 'somewhat-ready' },
      { id: 'd', text: "I often react poorly or shut down", type: 'not-ready' }
    ]
  },
  {
    id: 6,
    question: "How do you view compromise in relationships?",
    options: [
      { id: 'a', text: "I can balance my needs with others' needs", type: 'very-ready' },
      { id: 'b', text: "I usually find fair middle ground", type: 'mostly-ready' },
      { id: 'c', text: "I tend to give in too much or too little", type: 'somewhat-ready' },
      { id: 'd', text: "I struggle with finding balance", type: 'not-ready' }
    ]
  },
  {
    id: 7,
    question: "How do you handle independence in relationships?",
    options: [
      { id: 'a', text: "I maintain a healthy balance of togetherness and independence", type: 'very-ready' },
      { id: 'b', text: "I generally balance it well with occasional struggles", type: 'mostly-ready' },
      { id: 'c', text: "I tend to become too dependent or too distant", type: 'somewhat-ready' },
      { id: 'd', text: "I struggle with finding the right balance", type: 'not-ready' }
    ]
  },
  {
    id: 8,
    question: "How do you communicate your needs?",
    options: [
      { id: 'a', text: "I express them clearly and respectfully", type: 'very-ready' },
      { id: 'b', text: "I usually communicate them well", type: 'mostly-ready' },
      { id: 'c', text: "I sometimes struggle to express them", type: 'somewhat-ready' },
      { id: 'd', text: "I have difficulty expressing my needs", type: 'not-ready' }
    ]
  },
  {
    id: 9,
    question: "How do you handle trust in relationships?",
    options: [
      { id: 'a', text: "I trust appropriately while maintaining healthy boundaries", type: 'very-ready' },
      { id: 'b', text: "I generally trust but sometimes have doubts", type: 'mostly-ready' },
      { id: 'c', text: "I struggle with trust issues", type: 'somewhat-ready' },
      { id: 'd', text: "I have significant trust issues", type: 'not-ready' }
    ]
  },
  {
    id: 10,
    question: "What are your expectations in a relationship?",
    options: [
      { id: 'a', text: "Realistic and balanced", type: 'very-ready' },
      { id: 'b', text: "Mostly realistic with some idealistic elements", type: 'mostly-ready' },
      { id: 'c', text: "Sometimes unrealistic or unclear", type: 'somewhat-ready' },
      { id: 'd', text: "Often unrealistic or excessive", type: 'not-ready' }
    ]
  }
];

export const BIG_FIVE_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "I see myself as someone who is reserved.",
    options: [
      { id: '1', text: 'Strongly Disagree', type: 'extraversion:reverse' },
      { id: '2', text: 'Disagree', type: 'extraversion:reverse' },
      { id: '3', text: 'Slightly Disagree', type: 'extraversion:reverse' },
      { id: '4', text: 'Slightly Agree', type: 'extraversion:reverse' },
      { id: '5', text: 'Agree', type: 'extraversion:reverse' },
      { id: '6', text: 'Strongly Agree', type: 'extraversion:reverse' },
    ],
  },
  {
    id: 2,
    question: "I see myself as someone who is generally trusting.",
    options: [
      { id: '1', text: 'Strongly Disagree', type: 'agreeableness' },
      { id: '2', text: 'Disagree', type: 'agreeableness' },
      { id: '3', text: 'Slightly Disagree', type: 'agreeableness' },
      { id: '4', text: 'Slightly Agree', type: 'agreeableness' },
      { id: '5', text: 'Agree', type: 'agreeableness' },
      { id: '6', text: 'Strongly Agree', type: 'agreeableness' },
    ],
  },
  {
    id: 3,
    question: "I see myself as someone who tends to be lazy.",
    options: [
      { id: '1', text: 'Strongly Disagree', type: 'conscientiousness:reverse' },
      { id: '2', text: 'Disagree', type: 'conscientiousness:reverse' },
      { id: '3', text: 'Slightly Disagree', type: 'conscientiousness:reverse' },
      { id: '4', text: 'Slightly Agree', type: 'conscientiousness:reverse' },
      { id: '5', text: 'Agree', type: 'conscientiousness:reverse' },
      { id: '6', text: 'Strongly Agree', type: 'conscientiousness:reverse' },
    ],
  },
  {
    id: 4,
    question: "I see myself as someone who is relaxed, handles stress well.",
    options: [
      { id: '1', text: 'Strongly Disagree', type: 'neuroticism:reverse' },
      { id: '2', text: 'Disagree', type: 'neuroticism:reverse' },
      { id: '3', text: 'Slightly Disagree', type: 'neuroticism:reverse' },
      { id: '4', text: 'Slightly Agree', type: 'neuroticism:reverse' },
      { id: '5', text: 'Agree', type: 'neuroticism:reverse' },
      { id: '6', text: 'Strongly Agree', type: 'neuroticism:reverse' },
    ],
  },
  {
    id: 5,
    question: "I see myself as someone who has few artistic interests.",
    options: [
      { id: '1', text: 'Strongly Disagree', type: 'openness:reverse' },
      { id: '2', text: 'Disagree', type: 'openness:reverse' },
      { id: '3', text: 'Slightly Disagree', type: 'openness:reverse' },
      { id: '4', text: 'Slightly Agree', type: 'openness:reverse' },
      { id: '5', text: 'Agree', type: 'openness:reverse' },
      { id: '6', text: 'Strongly Agree', type: 'openness:reverse' },
    ],
  },
  {
    id: 6,
    question: "I see myself as someone who is outgoing, sociable.",
    options: [
      { id: '1', text: 'Strongly Disagree', type: 'extraversion' },
      { id: '2', text: 'Disagree', type: 'extraversion' },
      { id: '3', text: 'Slightly Disagree', type: 'extraversion' },
      { id: '4', text: 'Slightly Agree', type: 'extraversion' },
      { id: '5', text: 'Agree', type: 'extraversion' },
      { id: '6', text: 'Strongly Agree', type: 'extraversion' },
    ],
  },
  {
    id: 7,
    question: "I see myself as someone who tends to find fault with others.",
    options: [
      { id: '1', text: 'Strongly Disagree', type: 'agreeableness:reverse' },
      { id: '2', text: 'Disagree', type: 'agreeableness:reverse' },
      { id: '3', text: 'Slightly Disagree', type: 'agreeableness:reverse' },
      { id: '4', text: 'Slightly Agree', type: 'agreeableness:reverse' },
      { id: '5', text: 'Agree', type: 'agreeableness:reverse' },
      { id: '6', text: 'Strongly Agree', type: 'agreeableness:reverse' },
    ],
  },
  {
    id: 8,
    question: "I see myself as someone who does a thorough job.",
    options: [
      { id: '1', text: 'Strongly Disagree', type: 'conscientiousness' },
      { id: '2', text: 'Disagree', type: 'conscientiousness' },
      { id: '3', text: 'Slightly Disagree', type: 'conscientiousness' },
      { id: '4', text: 'Slightly Agree', type: 'conscientiousness' },
      { id: '5', text: 'Agree', type: 'conscientiousness' },
      { id: '6', text: 'Strongly Agree', type: 'conscientiousness' },
    ],
  },
  {
    id: 9,
    question: "I see myself as someone who gets nervous easily.",
    options: [
      { id: '1', text: 'Strongly Disagree', type: 'neuroticism' },
      { id: '2', text: 'Disagree', type: 'neuroticism' },
      { id: '3', text: 'Slightly Disagree', type: 'neuroticism' },
      { id: '4', text: 'Slightly Agree', type: 'neuroticism' },
      { id: '5', text: 'Agree', type: 'neuroticism' },
      { id: '6', text: 'Strongly Agree', type: 'neuroticism' },
    ],
  },
  {
    id: 10,
    question: "I see myself as someone who has an active imagination.",
    options: [
      { id: '1', text: 'Strongly Disagree', type: 'openness' },
      { id: '2', text: 'Disagree', type: 'openness' },
      { id: '3', text: 'Slightly Disagree', type: 'openness' },
      { id: '4', text: 'Slightly Agree', type: 'openness' },
      { id: '5', text: 'Agree', type: 'openness' },
      { id: '6', text: 'Strongly Agree', type: 'openness' },
    ],
  }
];

export const BIG_FIVE_DESCRIPTIONS: Record<string, string> = {
  extraversion: 'Reflects sociability, assertiveness, and a tendency to seek stimulation in the company of others.',
  agreeableness: 'Reflects compassion, cooperation, and a concern for social harmony.',
  conscientiousness: 'Reflects organization, dependability, and a preference for planned behavior.',
  neuroticism: 'Reflects emotional instability, anxiety, and moodiness.',
  openness: 'Reflects imagination, creativity, and openness to new experiences.'
};

export type SelfEsteemType =
  | 'strong'
  | 'developing'
  | 'fluctuating'
  | 'challenged';

export const SELF_ESTEEM_DESCRIPTIONS: Record<SelfEsteemType, string> = {
  'strong': 'You have a solid sense of self-worth and generally maintain positive self-regard even in challenging situations. You recognize your value while remaining humble and open to growth.',
  'developing': 'You are building a healthier relationship with yourself and making progress in recognizing your worth. While you sometimes doubt yourself, you\'re learning to appreciate your strengths.',
  'fluctuating': 'Your self-esteem tends to vary based on external circumstances or others\' opinions. You\'re working on developing a more stable sense of self-worth.',
  'challenged': 'You often struggle with self-doubt and may have difficulty recognizing your worth. Working with a therapist could help you build a stronger foundation of self-esteem.'
};

export const SELF_ESTEEM_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "How do you typically handle criticism?",
    options: [
      { id: 'a', text: "Consider it objectively and learn from valid points", type: 'strong' },
      { id: 'b', text: "Try to learn from it but sometimes take it personally", type: 'developing' },
      { id: 'c', text: "Take it very personally at first but eventually recover", type: 'fluctuating' },
      { id: 'd', text: "Feel devastated and question my whole worth", type: 'challenged' }
    ]
  },
  {
    id: 2,
    question: "When you look in the mirror, what's your typical reaction?",
    options: [
      { id: 'a', text: "Generally accept and appreciate what I see", type: 'strong' },
      { id: 'b', text: "Notice both good points and flaws", type: 'developing' },
      { id: 'c', text: "My reaction varies greatly day to day", type: 'fluctuating' },
      { id: 'd', text: "Usually focus on what I don't like", type: 'challenged' }
    ]
  },
  {
    id: 3,
    question: "How do you feel about trying new things?",
    options: [
      { id: 'a', text: "Excited to learn, even if I might fail at first", type: 'strong' },
      { id: 'b', text: "Nervous but willing to give it a try", type: 'developing' },
      { id: 'c', text: "Confident some days, very hesitant others", type: 'fluctuating' },
      { id: 'd', text: "Afraid of failing or looking foolish", type: 'challenged' }
    ]
  },
  {
    id: 4,
    question: "When someone compliments you, how do you typically respond?",
    options: [
      { id: 'a', text: "Accept it graciously and believe it", type: 'strong' },
      { id: 'b', text: "Thank them while feeling slightly uncomfortable", type: 'developing' },
      { id: 'c', text: "Sometimes believe it, other times doubt it", type: 'fluctuating' },
      { id: 'd', text: "Dismiss it or feel it's not genuine", type: 'challenged' }
    ]
  },
  {
    id: 5,
    question: "How do you handle making mistakes?",
    options: [
      { id: 'a', text: "See them as learning opportunities and move forward", type: 'strong' },
      { id: 'b', text: "Try to learn from them but feel some shame", type: 'developing' },
      { id: 'c', text: "Sometimes cope well, other times feel very down", type: 'fluctuating' },
      { id: 'd', text: "Feel deeply ashamed and dwell on them", type: 'challenged' }
    ]
  },
  {
    id: 6,
    question: "How do you feel about your achievements?",
    options: [
      { id: 'a', text: "Proud of them while staying humble", type: 'strong' },
      { id: 'b', text: "Somewhat proud but tend to downplay them", type: 'developing' },
      { id: 'c', text: "Sometimes proud, other times feel they're not enough", type: 'fluctuating' },
      { id: 'd', text: "Rarely feel satisfied with them", type: 'challenged' }
    ]
  },
  {
    id: 7,
    question: "When facing a challenge, what's your typical thought process?",
    options: [
      { id: 'a', text: "I believe in my ability to handle it", type: 'strong' },
      { id: 'b', text: "I'm nervous but know I can try my best", type: 'developing' },
      { id: 'c', text: "My confidence varies depending on the day", type: 'fluctuating' },
      { id: 'd', text: "I usually doubt my ability to cope", type: 'challenged' }
    ]
  },
  {
    id: 8,
    question: "How do you feel about asking for help?",
    options: [
      { id: 'a', text: "See it as a normal part of growth and learning", type: 'strong' },
      { id: 'b', text: "Sometimes uncomfortable but willing to do it", type: 'developing' },
      { id: 'c', text: "Varies between comfortable and very hesitant", type: 'fluctuating' },
      { id: 'd', text: "Very difficult, feel like I should handle everything alone", type: 'challenged' }
    ]
  },
  {
    id: 9,
    question: "How do you handle social situations?",
    options: [
      { id: 'a', text: "Generally comfortable being myself", type: 'strong' },
      { id: 'b', text: "Somewhat anxious but managing better", type: 'developing' },
      { id: 'c', text: "Confidence varies greatly by situation", type: 'fluctuating' },
      { id: 'd', text: "Often feel inadequate or out of place", type: 'challenged' }
    ]
  },
  {
    id: 10,
    question: "When setting personal goals, you typically:",
    options: [
      { id: 'a', text: "Set challenging but achievable goals", type: 'strong' },
      { id: 'b', text: "Set moderate goals with some hesitation", type: 'developing' },
      { id: 'c', text: "Alternate between very high and very low goals", type: 'fluctuating' },
      { id: 'd', text: "Avoid setting goals to prevent disappointment", type: 'challenged' }
    ]
  }
];

export type ValuesType =
  | 'achievement'
  | 'relationships'
  | 'autonomy'
  | 'security'
  | 'growth';

export const VALUES_CLARIFICATION_DESCRIPTIONS: Record<ValuesType, string> = {
  'achievement': 'You are driven by accomplishment and success. You value setting and reaching goals, and derive satisfaction from tangible results and recognition.',
  'relationships': 'You prioritize meaningful connections with others. You value deep bonds, mutual understanding, and investing in relationships.',
  'autonomy': 'You value independence and self-direction. You appreciate having the freedom to make your own choices and chart your own course.',
  'security': 'You prioritize stability and predictability. You value creating a secure foundation and maintaining reliable structures in your life.',
  'growth': 'You are motivated by personal development and learning. You value experiences that challenge you and opportunities for self-improvement.'
};

export const VALUES_CLARIFICATION_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What matters most to you in your career?",
    options: [
      { id: 'a', text: "Reaching high levels of success", type: 'achievement' },
      { id: 'b', text: "Working with great people", type: 'relationships' },
      { id: 'c', text: "Being my own boss", type: 'autonomy' },
      { id: 'd', text: "Having a stable, secure position", type: 'security' },
      { id: 'e', text: "Continuous learning and development", type: 'growth' }
    ]
  },
  {
    id: 2,
    question: "How do you prefer to spend your free time?",
    options: [
      { id: 'a', text: "Working on personal projects and goals", type: 'achievement' },
      { id: 'b', text: "Spending time with friends and family", type: 'relationships' },
      { id: 'c', text: "Pursuing independent interests", type: 'autonomy' },
      { id: 'd', text: "Maintaining routines and habits", type: 'security' },
      { id: 'e', text: "Learning new skills or hobbies", type: 'growth' }
    ]
  },
  {
    id: 3,
    question: "What's most important to you in decision-making?",
    options: [
      { id: 'a', text: "Choosing options that lead to success", type: 'achievement' },
      { id: 'b', text: "Considering impact on relationships", type: 'relationships' },
      { id: 'c', text: "Maintaining personal freedom", type: 'autonomy' },
      { id: 'd', text: "Minimizing risks and uncertainty", type: 'security' },
      { id: 'e', text: "Creating opportunities for growth", type: 'growth' }
    ]
  },
  {
    id: 4,
    question: "What motivates you most?",
    options: [
      { id: 'a', text: "Recognition and accomplishment", type: 'achievement' },
      { id: 'b', text: "Connecting with others", type: 'relationships' },
      { id: 'c', text: "Personal freedom and choice", type: 'autonomy' },
      { id: 'd', text: "Stability and predictability", type: 'security' },
      { id: 'e', text: "Learning and self-improvement", type: 'growth' }
    ]
  },
  {
    id: 5,
    question: "What's your ideal living situation?",
    options: [
      { id: 'a', text: "A prestigious neighborhood", type: 'achievement' },
      { id: 'b', text: "Close to family and friends", type: 'relationships' },
      { id: 'c', text: "Living independently", type: 'autonomy' },
      { id: 'd', text: "A stable, secure environment", type: 'security' },
      { id: 'e', text: "Somewhere offering new experiences", type: 'growth' }
    ]
  },
  {
    id: 6,
    question: "What's most important in your relationships?",
    options: [
      { id: 'a', text: "Supporting each other's goals", type: 'achievement' },
      { id: 'b', text: "Deep emotional connection", type: 'relationships' },
      { id: 'c', text: "Respecting personal space", type: 'autonomy' },
      { id: 'd', text: "Reliability and consistency", type: 'security' },
      { id: 'e', text: "Growing together", type: 'growth' }
    ]
  },
  {
    id: 7,
    question: "What do you value most in your daily routine?",
    options: [
      { id: 'a', text: "Making progress on goals", type: 'achievement' },
      { id: 'b', text: "Quality time with others", type: 'relationships' },
      { id: 'c', text: "Flexibility and freedom", type: 'autonomy' },
      { id: 'd', text: "Structure and organization", type: 'security' },
      { id: 'e', text: "Opportunities to learn", type: 'growth' }
    ]
  },
  {
    id: 8,
    question: "What's your approach to challenges?",
    options: [
      { id: 'a', text: "Seeing them as opportunities to succeed", type: 'achievement' },
      { id: 'b', text: "Seeking support from others", type: 'relationships' },
      { id: 'c', text: "Finding my own solutions", type: 'autonomy' },
      { id: 'd', text: "Following proven methods", type: 'security' },
      { id: 'e', text: "Viewing them as learning experiences", type: 'growth' }
    ]
  },
  {
    id: 9,
    question: "What's most important in your workspace?",
    options: [
      { id: 'a', text: "Tools for high performance", type: 'achievement' },
      { id: 'b', text: "Opportunities for collaboration", type: 'relationships' },
      { id: 'c', text: "Freedom to work my way", type: 'autonomy' },
      { id: 'd', text: "Clear structure and guidelines", type: 'security' },
      { id: 'e', text: "Resources for development", type: 'growth' }
    ]
  },
  {
    id: 10,
    question: "What's your ideal future?",
    options: [
      { id: 'a', text: "Achieving significant success", type: 'achievement' },
      { id: 'b', text: "Rich in meaningful relationships", type: 'relationships' },
      { id: 'c', text: "Complete personal freedom", type: 'autonomy' },
      { id: 'd', text: "Stable and secure", type: 'security' },
      { id: 'e', text: "Continuous personal evolution", type: 'growth' }
    ]
  }
];