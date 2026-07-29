import { Exercise } from '../types';

export const CATEGORY_COLORS = {
  adults: '#008792',
  couples: '#00789f',
  families: '#0068aa',
};

export const SAMPLE_EXERCISES: Exercise[] = [
  {
    id: '1',
    title: 'Understanding Anxiety: Calming the False Alarm',
    description: 'Learn how anxiety works and practice grounding techniques to calm the mind and body.',
    category: 'adults',
    subcategory: 'anxiety',
    type: 'anxiety',
    content: `![Grounding Exercise Image](https://static.wixstatic.com/media/4e16d8_e4526b95174e4a5f909afca70145cf9d~mv2.png)

Understanding Anxiety: Calming the False Alarm

"Anxiety is like a smoke alarm that's too sensitive. It goes off not just when there's a fire — but when you're simply making toast."

(Exercise full content continues here...)
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    therapistId: 'sample-therapist',
  },
  {
    id: '2',
    title: 'The Calming Breath: The 4-4-4 Box Breathing Technique',
    description: 'Practice box breathing to reduce anxiety and activate your body\'s relaxation response.',
    category: 'adults',
    subcategory: 'anxiety',
    type: 'anxiety',
    content: `![Box Breathing Infographic](https://static.wixstatic.com/media/4e16d8_f939aaaa7fa14086b8ded2972896f689~mv2.png)

The Calming Breath: The 4-4-4 Box Breathing Technique

Imagine your heart racing before an important meeting. Your chest feels tight. Your thoughts spiral into worst-case scenarios.

(Exercise full content continues here...)
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    therapistId: 'sample-therapist',
  },
  {
    id: '3',
    title: 'Building Self-Esteem: Strengthening Your Inner Voice',
    description: 'Explore strategies for improving self-esteem through compassionate self-talk.',
    category: 'adults',
    subcategory: 'self-esteem',
    type: 'self-esteem',
    content: `![Self-Compassion Letter Visual](https://static.wixstatic.com/media/4e16d8_baa47fe80988434cb0b5b5b17bf74d76~mv2.png)

Building Self-Esteem: Strengthening Your Inner Voice

"I can't do anything right."  
"That was so stupid of me."  
"Why even bother?"

(Exercise full content continues here...)
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    therapistId: 'sample-therapist',
  },
  {
    id: '5',
    title: 'Active Listening Skills: The Power of Being Fully Present',
    description: 'Develop your active listening skills to improve communication and deepen relationships.',
    category: 'couples',
    subcategory: 'communication',
    type: 'communication',
    content: `![Active Listening Visual](https://static.wixstatic.com/media/4e16d8_c6f67453a20c41ef84cf1c986653ffa3~mv2.png)

Active Listening Skills: The Power of Being Fully Present

Think back to a time when you were sharing something important — and the person you were talking to was half-scrolling on their phone...
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    therapistId: 'sample-therapist',
  },
  {
    id: '6',
    title: 'Rebuilding Trust: Taking Steps Toward Repair',
    description: 'Learn structured steps to repair trust through accountability and consistent actions.',
    category: 'couples',
    subcategory: 'trust',
    type: 'trust',
    content: `![Rebuilding Trust Visual](https://static.wixstatic.com/media/4e16d8_ca583b1f3241423997bffe9ebe7c4348~mv2.png)

Rebuilding Trust: Taking Steps Toward Repair

Trust is fragile. It takes time to build — and moments to break. But it can also be rebuilt when both people are willing to do the work.

(Exercise full content continues here...)
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    therapistId: 'sample-therapist',
  },
  {
    id: '7',
    title: 'Building an Emotional Connection: Creating Space for Deeper Bonding',
    description: 'Enhance emotional connection through intentional check-ins and reflective listening.',
    category: 'couples',
    subcategory: 'intimacy',
    type: 'intimacy',
    content: `![Emotional Connection Visual](https://static.wixstatic.com/media/4e16d8_62a63e1f05164a6995f980eaeff77331~mv2.png)

Building an Emotional Connection: Creating Space for Deeper Bonding

Emotional connection is what turns a relationship from functional to fulfilling. It's the invisible thread that helps both people feel understood, safe, and valued.

(Exercise full content continues here...)
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    therapistId: 'sample-therapist',
  },
  {
    id: '8',
    title: 'Managing Conflict: Practicing the Imago Dialogue',
    description: 'Use the Imago Dialogue structure to manage conflict with empathy and understanding.',
    category: 'couples',
    subcategory: 'communication',
    type: 'communication',
    content: `![Imago Dialogue Visual](https://static.wixstatic.com/media/4e16d8_ef92f0306ba74d21a64e02d5e5455597~mv2.png)

Managing Conflict: Practicing the Imago Dialogue

Conflict is inevitable — but disconnection doesn't have to be.

(Exercise full content continues here...)
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    therapistId: 'sample-therapist',
  },
  {
    id: '9',
    title: 'Improving Family Communication: The Family Meeting Guide',
    description: 'Facilitate open, respectful family conversations through structured family meetings.',
    category: 'adults',
    subcategory: 'family-dynamics',
    type: 'family-dynamics',
    content: `![Family Communication Visual](https://static.wixstatic.com/media/4e16d8_c570339f3ade40dfa26eaed8d998af05~mv2.png)

Improving Family Communication: The Family Meeting Guide

Healthy communication is the foundation of a connected, resilient family. The Family Meeting creates space for each member to feel heard and valued.

`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    therapistId: 'sample-therapist',
  },
  {
    id: '10',
    title: 'Positive Parenting Strategies',
    description: 'Strengthen parenting through connection-based strategies and clear, compassionate guidance.',
    category: 'adults',
    subcategory: 'parenting',
    type: 'parenting',
    content: `![Positive Parenting Image](https://static.wixstatic.com/media/4e16d8_155542539e724914a425517afbc93c15~mv2.png)

Positive Parenting Strategies

Positive parenting focuses on building strong, respectful, and emotionally safe relationships with your child.

(Exercise full content continues here...)
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    therapistId: 'sample-therapist',
  },
  {
    id: '11',
    title: 'Strengthening Sibling Relationships',
    description: 'Support healthy sibling bonds through conflict resolution and cooperative strategies.',
    category: 'adults',
    subcategory: 'family-dynamics',
    type: 'family-dynamics',
    content: `![Sibling Relationships Image](https://static.wixstatic.com/media/4e16d8_86c18f561ef24878ba855be950228ff7~mv2.png)

Strengthening Sibling Relationships

Sibling bonds can be a source of lifelong connection—or conflict. Healthy sibling dynamics teach empathy, cooperation, and respect.

(Exercise full content continues here...)
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    therapistId: 'sample-therapist',
  },
{
  id: '12',
  title: 'Supporting Family Mental Health',
  description: 'Encourage open mental health conversations and build emotional safety within the family.',
  category: 'adults',
  subcategory: 'family-dynamics',
  type: 'family-dynamics',
  content: `![Family Mental Health Image](https://static.wixstatic.com/media/4e16d8_4a198ecf3cb44715834d1a3754ac9432~mv2.png)

Supporting Family Mental Health

Mental health affects the well-being of every family member. Open conversations create safety, reduce stigma, and encourage healthy coping.

(Exercise full content continues here...)
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
{
  id: '13',
  title: 'Managing Depression',
  description: 'Explore effective strategies to manage depression and build a personalized self-care plan.',
  category: 'adults',
  subcategory: 'mental-health',
  type: 'mental-health',
  content: `![Managing Depression Image](https://static.wixstatic.com/media/4e16d8_04bd743d05b54143936e642d5fb849d2~mv2.png)

Managing Depression

Depression affects how we feel, think, and handle daily activities. Managing depression means recognizing signs and taking small steps toward care.

(Exercise full content continues here...)
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
{
  id: '14',
  title: 'Progressive Muscle Relaxation: Releasing Tension from the Body',
  description: 'Relieve stress by tensing and releasing muscle groups to calm both body and mind.',
  category: 'adults',
  subcategory: 'stress-management',
  type: 'stress-management',
  content: `![Progressive Muscle Relaxation Image](https://static.wixstatic.com/media/4e16d8_a234c9a7c3d34be1a3fcb5f8a5e2f512~mv2.png)

Progressive Muscle Relaxation: Releasing Tension from the Body

"Stress often shows up as tight shoulders, a clenched jaw, or restlessness. By deliberately tensing and then releasing your muscles, you teach your body the difference between stress and relaxation."

(Exercise full content continues here...)
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},  
{
  id: '15',
  title: 'The Power of Gratitude',
  description: 'Discover the benefits of gratitude and learn practices to foster a more positive mindset.',
  category: 'adults',
  subcategory: 'mental-health',
  type: 'mental-health',
  content: `![Gratitude Exercise Image](https://static.wixstatic.com/media/4e16d8_a4b101358cfa4403af08c22647cb73f5~mv2.png)

The Power of Gratitude

Practicing gratitude can improve mood, strengthen relationships, and boost overall mental health.

(Exercise full content continues here...)
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
{
  id: '16',
  title: 'SMART Goal Setting: Moving from Ideas to Action',
  description: 'Break down goals into clear, actionable steps using the SMART framework.',
  category: 'adults',
  subcategory: 'goal-setting',
  type: 'goal-setting',
  content: `![SMART Goals Framework](https://static.wixstatic.com/media/4e16d8_155542539e724914a425517afbc93c15~mv2.png)

SMART Goal Setting: Moving from Ideas to Action

"A goal without a plan is just a wish." - Antoine de Saint-Exupéry

(Exercise full content continues here...)
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
{
  id: '17',
  title: 'Values Clarification: Discover What Truly Matters to You',
  description: 'Clarify your core values and learn how they can guide your decisions.',
  category: 'adults',
  subcategory: 'self-exploration',
  type: 'self-exploration',
  content: `![Values Clarification Image](https://static.wixstatic.com/media/4e16d8_d7e3031a6bcd4dd788f1f29f8241cd2b~mv2.png)

Values Clarification: Discover What Truly Matters to You

Values are your internal compass — they guide your decisions, shape your goals, and help you live with integrity.

(Exercise full content continues here...)
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
{
  id: '31',
  title: 'Thought Reframing: Challenging Negative Thinking',
  description: 'Learn to recognize unhelpful thoughts and replace them with more balanced perspectives.',
  category: 'adults',
  subcategory: 'cognitive-skills',
  type: 'cognitive-skills',
  content: `![Thought Reframing Image](https://static.wixstatic.com/media/4e16d8_07b6027870e847659078f92558f4ebdd~mv2.png)

Thought Reframing: Challenging Negative Thinking

Our thoughts shape how we feel and act. Sometimes, we get stuck in patterns of catastrophizing, all-or-nothing thinking, or self-criticism.

(Exercise full content continues here...)
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
{
  id: '20',
  title: 'Reframing Negative Thoughts: Shift Your Inner Dialogue',
  description: 'Practice techniques to shift negative thinking patterns toward self-compassion and balance.',
  category: 'adults',
  subcategory: 'cognitive-skills',
  type: 'cognitive-skills',
  content: `![Reframing Thoughts Image](https://static.wixstatic.com/media/4e16d8_851ba7578b3944bb830e12b689d8e13a~mv2.png)

Reframing Negative Thoughts: Shift Your Inner Dialogue

Our thoughts shape how we feel and behave. But sometimes, these thoughts are distorted or overly negative — leading to anxiety, low mood, or self-criticism.

`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
{
  id: '33',
  title: 'Self-Compassion Break: Being Kind to Yourself in Difficult Moments',
  description: 'Learn how to practice self-compassion and soothe your inner critic during challenging times.',
  category: 'adults',
  subcategory: 'self-compassion',
  type: 'self-compassion',
  content: `![Self-Compassion Visual](https://static.wixstatic.com/media/4e16d8_0d0e570a6ea344cba1128b95dad0612a~mv2.png)

Self-Compassion Break: Being Kind to Yourself in Difficult Moments

When you're struggling, it's easy to fall into self-criticism. But research shows that kindness toward yourself builds emotional resilience.

(Exercise full content continues here...)
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
{
  id: '22',
  title: 'Coping Skills Toolbox: Building Your Personalized Toolkit for Stressful Moments',
  description: 'Create a customized toolkit of coping strategies for stressful situations.',
  category: 'adults',
  subcategory: 'coping-skills',
  type: 'coping-skills',
  content: `![Coping Skills Toolbox Image](https://static.wixstatic.com/media/4e16d8_0d0e570a6ea344cba1128b95dad0612a~mv2.png)

Coping Skills Toolbox: Building Your Personalized Toolkit for Stressful Moments

When stress hits, it's easy to forget the tools you already know. A Coping Toolbox is your go-to list of strategies to regulate and refocus.

(Exercise full content continues here...)
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
{
  id: '23',
  title: 'Emotion Identification: Name It to Tame It',
  description: 'Improve emotional awareness by learning how to accurately identify your feelings.',
  category: 'adults',
  subcategory: 'emotional-awareness',
  type: 'emotional-awareness',
  content: `![Emotion Identification Image](https://static.wixstatic.com/media/4e16d8_da6b4d27daf4452899207480239e3cdf~mv2.png)

Emotion Identification: Name It to Tame It

Emotions are powerful messengers. When we can't name what we're feeling, emotions often show up as overwhelm or irritability.

(Exercise full content continues here...)
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
{
  id: '24',
  title: 'Circle of Control: Letting Go of What You Can\'t Change',
  description: 'Reduce anxiety and focus your energy on what\'s within your control.',
  category: 'adults',
  subcategory: 'stress-management',
  type: 'stress-management',
  content: `![Circle of Control Image](https://static.wixstatic.com/media/4e16d8_d432ff3dee1e4aaeaaa24378acb29c45~mv2.png)

Circle of Control: Letting Go of What You Can't Change

Anxiety often comes from focusing on things outside of your control. Learning to separate what you can and can't control lowers stress.

(Exercise full content continues here...)
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
{
  id: '25',
  title: 'Relationship Check-In: Strengthening Connection Through Reflection',
  description: 'Build stronger relationships through intentional weekly check-ins and shared reflection.',
  category: 'couples',
  subcategory: 'relationships',
  type: 'relationships',
  content: `![Relationship Check-In Image](https://static.wixstatic.com/media/4e16d8_9c76dfdae65c4326b6a5e07bc38a0b80~mv2.png)

Relationship Check-In: Strengthening Connection Through Reflection

Healthy relationships thrive on consistent care, open communication, and shared reflection.

`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
{
  id: '26',
  title: 'The Stress-Reducing Conversation: Support Without Solving',
  description: 'Foster connection and emotional support through Gottman\'s stress-reducing conversation technique.',
  category: 'couples',
  subcategory: 'communication',
  type: 'communication',
  content: `![Stress-Reducing Conversation Image](https://static.wixstatic.com/media/4e16d8_9ad5fdf89a854c06a67bcd3d8f20e13f~mv2.png)

The Stress-Reducing Conversation: Support Without Solving

Stress from work, family, or life often spills into our relationships. The Stress-Reducing Conversation helps couples talk about outside stressors with support and empathy.

(Exercise full content continues here...)
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
{
  id: '27',
  title: 'The Love Map Check-In: Deepening Your Knowledge of Each Other',
  description: 'Explore and refresh your understanding of your partner\'s inner world with Gottman Love Maps.',
  category: 'couples',
  subcategory: 'relationships',
  type: 'relationships',
  content: `![Love Map Image](https://static.wixstatic.com/media/4e16d8_16ce60c254904b45a6b58c76af53ffd9~mv2.png)

The Love Map Check-In: Deepening Your Knowledge of Each Other

A Love Map is the mental space you hold for your partner's inner world—their hopes, worries, dreams, and memories.

(Exercise full content continues here...)
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
{
  id: '28',
  title: 'ACT: The Choice Point – Moving Toward or Away from What Matters',
  description: 'Learn how to notice moments of choice and align your actions with your values.',
  category: 'adults',
  subcategory: 'values',
  type: 'values',
  content: `![Choice Point Visual](https://static.wixstatic.com/media/4e16d8_dad0c5d27ec44e3687328aeb8405dc1a~mv2.png)

ACT: The Choice Point – Moving Toward or Away from What Matters

Life constantly presents us with choice points—moments where we can move toward the life we want or away from it based on avoidance, fear, or discomfort.

`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},  
{
  id: '29',
  title: 'The Intimacy Inventory: Exploring Your Needs and Boundaries',
  description: 'Use this guided inventory to explore emotional, physical, and sexual intimacy with your partner through open dialogue, curiosity, and respect.',
  category: 'couples',
  subcategory: 'intimacy',
  type: 'intimacy',
  content: `![Intimacy Inventory Visual](https://static.wixstatic.com/media/4e16d8_beeb9c77440148c9ae9c65ac49c4ccc3~mv2.png)

The Intimacy Inventory: Exploring Your Needs and Boundaries

Discover what brings you closer — and where you need space — with this guided intimacy inventory built to foster honest, respectful connection.
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},   
  {
  id: '30',
  title: 'Repair After Rupture: A Scripted Guide to Reconnection',
  description: 'Use structured language and co-regulation tools to de-escalate conflict, take ownership, and foster emotional safety after a rupture.',
  category: 'couples',
  subcategory: 'conflict',
  type: 'conflict',
  content: `![Repair After Rupture Visual](https://static.wixstatic.com/media/4e16d8_15d8bc319c3c4c7e8a00ec579c7f1df6~mv2.png)

Repair After Rupture: A Scripted Guide to Reconnection

Learn to de-escalate, take ownership, and reconnect with structured scripts that restore trust after conflict.
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
}, 
{
  id: '31',
  title: 'Behavioral Activation: Rediscovering Joy',
  description: 'Lift mood and reduce stress by re-engaging in activities that bring meaning and pleasure.',
  category: 'adults',
  subcategory: 'behavioral-skills',
  type: 'behavioral-skills',
  content: `![Behavioral Activation Image](https://static.wixstatic.com/media/4e16d8_92d7d0481e7f40e9aa928d5a03d7a17f~mv2.png)

Behavioral Activation: Rediscovering Joy

"When stress or depression take hold, it’s common to withdraw from the very activities that keep us balanced. Re-engaging with small, meaningful actions helps restore energy, joy, and purpose."

(Exercise full content continues here...)
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
{
  id: '32',
  title: 'Dealing with Ambivalence: Finding Clarity in Mixed Feelings',
  description: 'Learn strategies to work through conflicting thoughts and emotions when facing important decisions.',
  category: 'adults',
  subcategory: 'decision-making',
  type: 'decision-making',
  content: `![Ambivalence Image](https://static.wixstatic.com/media/4e16d8_f2f80d86a3a94e7c9b43f1a0e8dd43c1~mv2.png)

Dealing with Ambivalence: Finding Clarity in Mixed Feelings

"Ambivalence is feeling pulled in two directions at once. By exploring both sides with openness, you can uncover values, reduce confusion, and move toward decisions that feel more aligned."

(Exercise full content continues here...)
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},  
];