import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';
import { useEffect } from 'react';

const formatContent = (content: string) => {
  return content.split('\n').map((line, index) => {
    // ⭐ NEW: Render Image if Markdown Syntax Detected ⭐
    if (line.match(/^!\[.*\]\(.*\)$/)) {
      const altText = line.match(/^!\[(.*?)\]/)?.[1];
      const imageUrl = line.match(/\((.*?)\)/)?.[1];
      return (
        <div key={index} className="my-6 flex justify-center">
          <img
            src={imageUrl}
            alt={altText || 'Exercise image'}
            className="max-w-3xl w-full rounded-lg shadow-md"
          />
        </div>
      );
    }
    // Main heading (H1)
    if (line.match(/^(Setting Healthy Boundaries|Active Listening Skills|Rebuilding Trust|Understanding Anxiety|Deep Breathing Exercise)$/)) {
      return (
        <h1 key={index} className="text-2xl font-bold text-[#2c3e50] mb-5">{line}</h1>
      );
    }
    
    // H2 headings with numbers
    if (line.match(/^\d+\.\s/)) {
      return (
        <h2 key={index} className="text-xl font-semibold text-[#34495e] mt-8 mb-3">{line}</h2>
      );
    }

    // Activity blocks
    if (line.match(/^(Activity:|Reflection Question:|Practice:|Note:)/)) {
      return (
        <div key={index} className="bg-[#e8f4f8] p-4 border-l-4 border-[#3498db] mb-5">
          <p className="m-0">
            <strong className="text-[#3498db]">{line.split(':')[0]}:</strong>
            {line.split(':').slice(1).join(':')}
          </p>
        </div>
      );
    }

    // Timer blocks
    if (line.startsWith('Timer:')) {
      return (
        <div key={index} className="bg-[#e8f4f8] p-4 border-l-4 border-[#3498db] mb-5 text-center">
          <p className="text-xl font-bold text-[#3498db]">{line.split(':')[1].trim()}</p>
        </div>
      );
    }

    // Dialogue section
    if (line === 'Scenario:') {
      return (
        <div key={index} className="bg-[#f4f4f4] p-4 border-l-4 border-[#7f8c8d] mb-5">
          <p className="m-0">
            <strong className="text-[#7f8c8d]">Scenario:</strong>
            {line.includes('work') ? 
              " You need to set a boundary about not working late on weekends." :
              line.includes('friend') ? " You broke a promise to a friend, and they are upset." :
              line.includes('anxiety') ? " You're experiencing anxiety before a presentation." :
              " A friend is sharing their stress about work."}
          </p>
        </div>
      );
    }

    // Dialogue lines
    if (line.match(/^(You:|Colleague\/Boss:|Friend:|Inner Voice:|Supportive Response:)/)) {
      return (
        <div key={index} className="bg-[#f4f4f4] p-4 border-l-4 border-[#7f8c8d] mb-5">
          <p className="m-0">
            <strong className="text-[#7f8c8d]">{line.split(':')[0]}:</strong>
            {line.split(':').slice(1).join(':')}
          </p>
        </div>
      );
    }

    // Example text
    if (line.startsWith('Example:')) {
      return (
        <p key={index} className="italic text-[#555] mt-3 mb-5">{line}</p>
      );
    }

   // List items with strong tags
if (line.match(/^- [^:]+:/)) {
  const [label, content] = line.substring(2).split(':');
  return (
    <li key={index} className="mb-2 ml-5">
      <strong className="text-[#34495e]">{label}:</strong>
      <span className="text-[#333]">{content}</span>
    </li>
  );
    }

    // Regular list items
    if (line.startsWith('- ')) {
  return (
    <li key={index} className="mb-2 ml-5 text-[#333]">{line.substring(2)}</li>
  );
    }

    // Empty lines
    if (line.trim() === '') {
      return <div key={index} className="h-4" />;
    }

    // Regular paragraphs
    return (
      <p key={index} className="text-base text-[#333] mb-4">
        {line.replace(/^"|"$/g, '')}
      </p>
    );
  });
};

const SAMPLE_EXERCISES = {
'1': {
  id: '1',
  title: 'Understanding Anxiety: Calming the False Alarm',
  type: 'anxiety',
  content: `![Grounding Exercise Image](https://static.wixstatic.com/media/4e16d8_e4526b95174e4a5f909afca70145cf9d~mv2.png)

Understanding Anxiety: Calming the False Alarm

"Anxiety is like a smoke alarm that's too sensitive. It goes off not just when there's a fire — but when you're simply making toast."

Anxiety is not weakness. It's your body's alarm system doing exactly what it was designed to do: protect you. But sometimes that system gets stuck on high alert — firing off warnings even when the situation doesn't call for it.

Anxiety doesn't need to be silenced. It needs to be understood.

1. The Story: Maya's Alarm System  
Maya often felt a rush of panic before her weekly staff meetings. Her heart would race, her breath would shorten, and her stomach clenched into knots.  
Her mind looped through the same anxious thoughts:  
> "What if I say something dumb?"  
> "What if they realize I don't belong here?"  

Logically, she knew these thoughts weren't true — but anxiety doesn't respond to logic. It responds to danger.

The problem was, Maya's alarm system couldn't tell the difference between real threat and imagined threat. It treated the meeting like a bear attack.

What helped Maya wasn't "thinking positively" or telling herself to relax — it was learning to signal back to her brain that she was actually safe.

2. The Exercise: Grounding With Your Senses

When anxiety takes over, your mind races into the future:  
- "What if something goes wrong?"  
- "What if I can't handle it?"  

Grounding brings you back to the one place you can control: **right now.**

🌿 Try This Grounding Exercise (5-4-3-2-1):
- **5 things you can see**  
- **4 things you can feel (touch)**  
- **3 things you can hear**  
- **2 things you can smell**  
- **1 thing you can taste**

Take a slow breath. If it feels good, place your hand on your chest as you breathe.

Reflection Question:  
What did you notice about your body or thoughts after trying this? Did anything shift, even slightly?

3. Why This Works  
Anxiety pulls your focus toward imagined threats.  
Grounding anchors you back to your real environment, helping your nervous system calm down.

It's like telling your alarm system: "Hey, we're okay. There's no fire here."

4. Try This Challenge  
Practice this exercise once a day for the next week — even if you're not feeling anxious. The more you train your body and mind to access calm, the easier it becomes to find that calm when you need it.

Remember: The goal isn't to get rid of anxiety. The goal is to learn how to turn down the volume when it gets too loud.`
},
'2': {
  id: '2',
  title: 'The Calming Breath: The 4-4-4 Box Breathing Technique',
  type: 'anxiety',
  content: `![Box Breathing Infographic](https://static.wixstatic.com/media/4e16d8_f939aaaa7fa14086b8ded2972896f689~mv2.png)

The Calming Breath: The 4-4-4 Box Breathing Technique

Imagine your heart racing before an important meeting. Your chest feels tight. Your thoughts spiral into worst-case scenarios.

In those moments, it helps to have a reliable tool — a way to signal your body and mind:  
_"You're okay. You're safe. You've got this."_

1. Why It's Called Box Breathing
The name "Box Breathing" comes from the even pacing of the breath — like tracing the four equal sides of a box.  
The **4-4-4 pattern** refers to the timing of each phase:
- 4 counts to inhale
- 4 counts to hold
- 4 counts to exhale
- 4 counts to hold

This rhythm activates your body's relaxation response and helps regulate your nervous system.

2. How to Practice Box Breathing

Find a comfortable seated position with your feet flat on the ground.  
Relax your shoulders and place one hand gently on your belly.

🌿 **Follow These Steps:**
- **Inhale** slowly through your nose for 4 counts.  
- **Hold** your breath for 4 counts.  
- **Exhale** slowly through your mouth for 4 counts.  
- **Hold** again for 4 counts.

Repeat this cycle **4 times**.

Practice:
As you breathe, imagine drawing the sides of a box in your mind — one line for each phase of the breath.

Reflection Question:
How does your body feel after completing the 4 cycles?  
Did your heart rate slow or your mind quiet, even slightly?

3. Why This Works
Box breathing helps shift your body out of "fight or flight" mode and into "rest and digest."  
It reduces anxiety by balancing your oxygen and carbon dioxide levels, calming the mind, and centering your attention.

4. Try This Challenge
Practice box breathing once a day for the next week — especially during moments of stress or overwhelm.

Activity:
Write down three situations in your daily life where you could use this calming breath.
Example: "Before meetings, after difficult conversations, when I feel anxious at night."

Remember:
The goal is not perfection but creating small moments of calm.  
Each breath is an opportunity to return to center and care for yourself.

Next Steps:
- Commit to practicing box breathing daily for one week.
- Reflect on how it impacts your stress levels.
- Celebrate your effort to build this new calming habit.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
'3': {
  id: '3',
  title: 'Building Self-Esteem: Strengthening Your Inner Voice',
  type: 'self-esteem',
  content: `![Self-Compassion Letter Visual](https://static.wixstatic.com/media/4e16d8_baa47fe80988434cb0b5b5b17bf74d76~mv2.png)

Building Self-Esteem: Strengthening Your Inner Voice

“I can’t do anything right.”  
“That was so stupid of me.”  
“Why even bother?”

If these thoughts sound familiar, you're not alone. Self-esteem isn’t about constant confidence — it’s about how you speak to yourself, especially in hard moments.

1. Understanding Self-Esteem
Self-esteem is the way you view and value yourself. Healthy self-esteem allows you to:
- Face challenges with resilience.
- Set and maintain healthy boundaries.
- Treat yourself with compassion, not criticism.

Reflection Question:
How do you typically talk to yourself when things go wrong? Is your inner voice kind or harsh?

2. The Story: Liam’s Inner Critic  
Liam struggled with self-doubt. After small mistakes, his inner voice was brutal:  
> "You're such a failure. Why can’t you get it right?"  
But in therapy, he was asked one question that changed everything:  
> "Would you talk to your best friend that way?"  

The answer, of course, was no. This realization became the starting point for changing how he spoke to himself.

3. The Exercise: The Self-Compassion Letter

🌿 Write a letter to yourself as if you were writing to a close friend going through the same struggle you're facing right now.

Use these prompts:
- What would you say to remind them of their strengths?
- How would you comfort them?
- How would you reframe the situation with kindness and encouragement?

**Important:** Avoid judging yourself. Focus on understanding, patience, and support — just as you would for someone you love.

Activity:
Write your self-compassion letter. Afterward, reflect:
- How did it feel to write these words to yourself?
- What emotions came up?
- Did your perspective shift, even slightly?

4. Why This Works
We are often much harsher on ourselves than we are on others. This exercise helps interrupt that pattern by engaging the part of your brain that knows how to be supportive and kind.

Self-compassion is not about excuses — it's about creating the safety and support you need to grow.

5. Try This Challenge
For the next week, when you catch yourself in negative self-talk, pause and ask:  
> "Would I say this to a good friend?"

Activity:
Write down three self-supportive phrases you can use when your inner critic gets loud.
Example:  
- "I'm doing my best, and that’s enough."  
- "Mistakes are part of learning."  
- "This moment is hard, but it doesn’t define me."

Remember:
Building self-esteem isn’t about being perfect — it’s about practicing kindness toward yourself. Every small shift in your inner voice is progress.

Next Steps:
- Re-read your self-compassion letter when you’re feeling self-critical.
- Add new supportive phrases as they come to you.
- Reflect weekly on how your inner dialogue is evolving.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
'5': {
  id: '5',
  title: 'Active Listening Skills: The Power of Being Fully Present',
  type: 'communication',
  content: `![Active Listening Visual](https://static.wixstatic.com/media/4e16d8_c6f67453a20c41ef84cf1c986653ffa3~mv2.png)

Active Listening Skills: The Power of Being Fully Present

Think back to a time when you were sharing something important — and the person you were talking to was half-scrolling on their phone, nodding absentmindedly.  
How did that feel?

Now imagine the opposite: someone fully engaged, making eye contact, listening without interrupting, responding thoughtfully.

That’s the power of **active listening** — and it’s one of the most underrated relationship skills we have.

1. What Is Active Listening?
Active listening is more than hearing words. It's the practice of being fully present, showing the speaker that they are heard, understood, and valued.

It involves three key steps:
- **Attention:** Giving your full focus to the speaker.
- **Reflection:** Paraphrasing or summarizing what you heard to confirm understanding.
- **Validation:** Acknowledging feelings and showing empathy.

Reflection Question:
In your recent conversations, do you tend to listen to understand — or listen to respond?

2. The Story: Jamie’s Missed Connection  
Jamie often found themselves jumping in with advice before their partner could finish speaking.  
One day, their partner said:  
> "I don’t always need you to fix it. I just need to know you’re hearing me."  

That moment was a wake-up call. Jamie realized that advice, even well-intentioned, was getting in the way of connection. What their partner truly needed was **presence.**

3. The Exercise: Reflective Listening Practice

Choose a partner (friend, family member, or colleague). One of you will be the **speaker**, the other the **listener**.

🌿 **Speaker:** Share a recent experience or feeling (it could be about your day or something on your mind).

🌿 **Listener:** Follow these steps:
- Make eye contact and give your full attention.
- Reflect back what you hear without interpreting or judging.
- Use phrases like:
  - "What I’m hearing is..."
  - "It sounds like you’re feeling..."
  - "Let me know if I understood that right."

🌿 After a few minutes, **switch roles.**

Activity:
After completing the exercise, discuss:
- How did it feel to be listened to in this way?
- How did it feel to listen without offering advice or solutions?
- What was most challenging about the process?

4. Why This Works
Active listening slows down the conversation and creates space for real understanding.  
It helps reduce defensiveness, prevents misunderstandings, and strengthens emotional connection.

Listening well is not about fixing — it’s about making space for the other person’s experience.

5. Try This Challenge
Practice active listening once per day this week in a meaningful conversation.

Activity:
Write down two phrases you can use to practice active listening.
Example:  
- "Can you tell me more about how that felt for you?"  
- "What I’m hearing is that this has been really hard for you."

Remember:
Active listening isn’t about saying the perfect thing — it’s about **showing up with presence and curiosity.**  
Each intentional moment of listening helps build trust and connection.

Next Steps:
- Schedule a check-in with someone important to you.
- Practice these listening skills without rushing to fix or explain.
- Notice how this changes the quality of your conversations.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
'6': {
  id: '6',
  title: 'Rebuilding Trust: Taking Steps Toward Repair',
  type: 'trust',
  content: `![Rebuilding Trust Visual](https://static.wixstatic.com/media/4e16d8_ca583b1f3241423997bffe9ebe7c4348~mv2.png)

Rebuilding Trust: Taking Steps Toward Repair

Trust is fragile. It takes time to build — and moments to break. But it can also be rebuilt when both people are willing to do the work.

1. Understanding Trust Repair
When trust is broken, it’s not just about apologizing. It’s about consistent actions that rebuild safety, reliability, and care over time.

Trust grows when we:
- Acknowledge the hurt.
- Take responsibility.
- Demonstrate change.
- Stay patient.

Reflection Question:
Think of a relationship where trust has been damaged. What feelings arise when you think about repair — hope, fear, anger, guilt?

2. The Story: Carlos and Mia  
Carlos had made promises to be on time, but after several late arrivals and forgotten plans, Mia stopped believing his words.  
“I’m sorry” no longer felt meaningful to her. What she needed was consistency — not just words.

With guidance, Carlos shifted from apologizing to **action**:
> "This matters to me. I’m going to start setting reminders, and I’ll confirm plans the day before. I know it takes time to rebuild trust, and I’m committed."

3. The Exercise: Trust Repair Commitment

Choose a relationship where trust has been strained. Use the following structure to begin the repair process:

🌿 **Step 1: Acknowledge the Hurt**
- Name what happened clearly and honestly.
- Acknowledge the impact it had on the other person.

🌿 **Step 2: Apologize with Accountability**
- Offer a genuine apology without excuses.
- Focus on their experience, not your intent.

🌿 **Step 3: Commit to Change**
- Name the specific actions you will take to prevent the issue from happening again.
- Ask, "What would help rebuild trust between us?"

🌿 **Step 4: Be Patient and Consistent**
- Understand that rebuilding trust takes time.
- Stay steady and reliable in your actions, even when trust isn’t immediately restored.

Practice Dialogue Example:

You: "I know I’ve let you down by not following through on my promises. I see how that’s made you feel unsupported. I’m truly sorry — not just for the action, but for how it’s affected our trust. I’d like to work on rebuilding this with you. Would you be open to sharing what you need from me moving forward?"

Activity:
Write your own version of a trust repair commitment for a situation in your life. Focus on:
- Acknowledging what happened.
- Taking accountability.
- Outlining one or two specific steps you will commit to.

4. Why This Works
When we focus on action, not just apology, we show that trust matters to us.  
Repair happens through **follow-through**, not perfection.

Trust is rebuilt through many small, consistent moments that demonstrate care and integrity.

5. Try This Challenge
Choose one relationship where trust could be strengthened.  
Commit to one consistent behavior that builds reliability.

Activity:
Write down the specific action you will practice this week to rebuild or reinforce trust.
Example: "I will follow through on plans I make. I will check in twice per week to stay connected."

Remember:
Rebuilding trust is not about erasing the past — it’s about creating a different future through steady, intentional choices.

Next Steps:
- Continue practicing your trust repair commitments.
- Reflect weekly on your actions and their impact.
- Stay open to feedback and be patient with the process.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
'7': {
  id: '7',
  title: 'Building an Emotional Connection: Creating Space for Deeper Bonding',
  type: 'intimacy',
  content: `![Emotional Connection Visual](https://static.wixstatic.com/media/4e16d8_62a63e1f05164a6995f980eaeff77331~mv2.png)

Building an Emotional Connection: Creating Space for Deeper Bonding

Emotional connection is what turns a relationship from functional to fulfilling. It’s the invisible thread that helps both people feel understood, safe, and valued.

1. What Is Emotional Connection?
It’s not about fixing problems — it’s about showing up with curiosity, empathy, and presence.

Core elements of emotional connection:
- **Presence:** Being fully engaged and attentive.
- **Empathy:** Feeling with, not for, your partner.
- **Validation:** Accepting their experience as real and meaningful.
- **Vulnerability:** Sharing openly, even when it feels uncomfortable.

Reflection Question:
When was the last time you truly felt emotionally connected with someone? What helped create that moment?

2. The Story: Maya and Jordan’s Disconnect  
Maya often felt alone, even sitting next to her partner Jordan. When she shared her feelings, Jordan would quickly jump into advice-giving.  
One day she said:  
> "I’m not looking for solutions right now. I just need you with me."  
That conversation marked the beginning of learning how to **listen for connection, not correction.**

3. The Exercise: The Connection Check-In

🌿 Find a quiet space. Sit facing each other. Agree that this is **listening time**, not problem-solving time.

Each person takes turns completing these prompts:

- "One thing I’ve appreciated about you lately is..."
- "Something I’ve been feeling but haven’t shared is..."
- "Right now, one thing I need more of is..."
- "I feel most connected to you when..."

Rules:
- The listener may only reflect back what they hear (not offer advice or opinions).
- Switch roles after each person shares.

Activity:
After your check-in, reflect together:
- What was it like to share and listen this way?
- Did you learn something new about each other?
- What helped you feel most connected?

4. Why This Works
Sharing vulnerably and listening with presence creates safety. It invites openness and helps both partners feel seen and supported.

The goal is not to agree on everything — it’s to **stay engaged** with each other’s emotional world.

5. Try This Challenge
Schedule one 10-minute Connection Check-In each week.  
Stay curious, not corrective.

Activity:
Write down one intention you have for your next check-in.
Example: "I will focus on reflecting what I hear without jumping in to fix."

Remember:
Emotional connection is nurtured through small, intentional moments. Every honest share and thoughtful listen helps weave a stronger bond.

Next Steps:
- Commit to weekly check-ins.
- Practice using these prompts regularly.
- Celebrate the moments where you feel heard and connected.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},  
'8': {
  id: '8',
  title: 'Managing Conflict: Practicing the Imago Dialogue',
  type: 'communication',
  content: `![Imago Dialogue Visual](https://static.wixstatic.com/media/4e16d8_ef92f0306ba74d21a64e02d5e5455597~mv2.png)

Managing Conflict: Practicing the Imago Dialogue

Conflict is inevitable — but disconnection doesn’t have to be.

The Imago Dialogue provides a structured way for couples (or any relationship) to handle disagreements with respect, safety, and curiosity.

1. Understanding the Imago Dialogue
The goal is not to “win” the argument. The goal is to **understand** each other.

The three core roles:
- **Sender:** Shares their feelings without blame.
- **Receiver:** Listens, mirrors, validates, and empathizes.
- **Observer:** Stays mindful and watches the process unfold.

Reflection Question:
How do you usually handle conflict? What would shift if the focus was on understanding, not defending?

2. The Exercise: Practicing the Imago Dialogue Structure

🌿 **Step 1: Mirroring**
- Sender speaks using "I feel..." or "I experience..."
- Receiver reflects back: "What I hear you saying is..."  
- Ask: "Did I get that right? Is there more?"

🌿 **Step 2: Validation**
- Receiver acknowledges: "It makes sense you’d feel that way because…"

🌿 **Step 3: Empathy**
- Receiver offers: "I imagine you might be feeling… That must be hard."

Timer: 15-20 minutes (switch roles halfway)

Activity:
Choose a minor disagreement to practice. Use the dialogue structure above. Reflect on how it feels to communicate this way.

3. Why This Works
The Imago Dialogue slows down reactive conversations.  
It helps both people feel **seen, heard, and valued** — even in the middle of conflict.

4. Common Pitfalls to Avoid
- Jumping into advice or defense mode.
- Using "You always..." or "You never..."
- Skipping validation and empathy.

Practice:
Notice one of your go-to reactions during conflict. Write down how you could respond differently using the Imago Dialogue.

5. Next Steps:
- Schedule a weekly 20-minute check-in using this format.
- Practice during small disagreements before applying it to bigger issues.
- Celebrate moments of successful connection during conflict.

Remember:
Repair happens when we replace judgment with curiosity, and defense with empathy.

Activity:
Write down three reminders you want to keep in mind next time you enter a challenging conversation. Example: "Pause before responding," "Mirror back first," "Lead with curiosity, not blame."`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
'9': {
  id: '9',
  title: 'Improving Family Communication: The Family Meeting Guide',
  type: 'family-dynamics',
  content: `![Family Communication Visual](https://static.wixstatic.com/media/4e16d8_c570339f3ade40dfa26eaed8d998af05~mv2.png)

Improving Family Communication: The Family Meeting Guide

Healthy communication is the foundation of a connected, resilient family. The Family Meeting creates space for each member to feel heard and valued.

1. Why Family Meetings Matter
Family meetings promote:
- **Openness:** Everyone gets a voice.
- **Problem-Solving:** Issues are addressed collaboratively.
- **Connection:** Time to share appreciations, challenges, and plans.

Reflection Question:
How does communication typically happen in your family? What would improve the sense of understanding and respect?

2. The Family Meeting Structure

🌿 **Step 1: Check-In (Go Around the Circle)**
- "How is everyone feeling today?"
- Encourage honesty, no problem-solving yet.

🌿 **Step 2: Discussion Topic**
- Choose one topic (examples: screen time, chores, upcoming plans).
- Use "I" statements, avoid blame.
- Example: "I feel overwhelmed when I’m the only one cleaning."

🌿 **Step 3: Brainstorm Solutions**
- Invite ideas from everyone.
- Focus on finding solutions, not criticizing.
- Agree on action steps together.

🌿 **Step 4: Appreciations**
- End with each person sharing one thing they appreciate about another.
- Example: "I appreciate you helping with dinner last night."

Activity:
Plan your first family meeting.
- Write down the time, place, and topic.
- Prepare your check-in and closing appreciations.

3. Communication Guidelines for Success
- Listen fully before responding.
- Avoid interrupting.
- Stay curious, not critical.
- Focus on solutions, not blame.

Practice:
Post these guidelines somewhere visible. Review them together at the start of each meeting.

4. Common Pitfalls to Avoid
- Turning meetings into lectures.
- Ignoring input from younger family members.
- Overloading with too many topics at once.
- Forgetting to close with appreciation.

Activity:
Notice one area where your family communication breaks down. Write down how a meeting might help address this.

5. Next Steps:
- Commit to weekly or biweekly meetings.
- Rotate who leads the meeting.
- Keep topics focused and manageable.
- Celebrate improvements, even small ones.

Remember:
The goal isn’t perfect harmony — it’s consistent, honest, and respectful conversation.

Activity:
Schedule your next three family meetings and list the first topics you’d like to explore.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
'10': {
  id: '10',
  title: 'Positive Parenting Strategies',
  type: 'parenting',
  content: `Positive Parenting Strategies

![Positive Parenting Image](https://static.wixstatic.com/media/4e16d8_155542539e724914a425517afbc93c15~mv2.png)

1. What Is Positive Parenting?
Positive parenting focuses on building strong, respectful, and emotionally safe relationships with your child. It combines clear boundaries with empathy and encouragement, supporting a child’s development and well-being.

Reflection Question:
Think of a recent challenging parenting moment. How did you respond? How might a positive parenting approach have looked different?

2. The 4 Pillars of Positive Parenting
- **Connection Before Correction:** Prioritize emotional connection before addressing behavior.
- **Clarity:** Set clear, age-appropriate boundaries and expectations.
- **Consistency:** Follow through calmly and reliably.
- **Compassion:** Validate your child’s feelings while guiding their behavior.

Activity:
Pick one pillar to focus on this week. Write down specific ways you’ll practice it.

3. The 3-Step Positive Discipline Model

Step 1: Connect
- Kneel down, make eye contact
- Validate their feelings
- Use a calm tone

Step 2: Guide
- Clearly state the expectation
- Offer two acceptable choices
- Use positive language (what to do, not just what *not* to do)

Step 3: Reinforce
- Praise effort, not perfection
- Celebrate cooperation
- Reflect on the outcome with the child

Practice Dialogue Example:

Parent: "I know you’re upset about leaving the playground. That makes sense—it’s fun here."
Child: "I don’t want to leave!"
Parent: "It’s hard to stop when you’re having fun. You can choose to walk to the car, or I can carry you. Which would you prefer?"

4. Common Pitfalls to Avoid
- **Yelling or threats:** These increase fear, not learning.
- **Inconsistency:** Confuses children and weakens trust.
- **Ignoring emotions:** Misses opportunities for connection.

Activity:
Reflect on which of these you fall into most. Choose one alternative response to try.

Example: Instead of “Because I said so,” say, “I understand you’re upset, and we can talk more after you calm down.”

5. Creating Your Parenting Agreement
Create a short list of “parenting promises” you’ll commit to.

Example:
- I will connect first before correcting.
- I will be clear and kind with my boundaries.
- I will pause and breathe before reacting.
- I will celebrate small efforts, not just big wins.

Activity:
Write your own 3-5 item parenting agreement. Put it somewhere visible for daily reference.

6. Next Steps
- Choose one pillar or practice to implement this week
- Journal one success story at the end of each day
- Discuss this approach with your partner or co-parent
- Revisit your agreement weekly to adjust or add

Remember:
Positive parenting isn’t about being perfect—it’s about being intentional. Every moment is a chance to grow your connection and help your child thrive.

Activity:
Set a reminder to check in with yourself each day: “Did I connect before I corrected today?”`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
'11': {
  id: '11',
  title: 'Strengthening Sibling Relationships',
  type: 'family-dynamics',
  content: `Strengthening Sibling Relationships

![Sibling Relationships Image](https://static.wixstatic.com/media/4e16d8_86c18f561ef24878ba855be950228ff7~mv2.png)

1. Why Sibling Relationships Matter
Sibling bonds can be a source of lifelong connection—or conflict. Healthy sibling dynamics teach empathy, cooperation, and respect.

Reflection Question:
Think about your sibling relationships or those between your children. What strengths do you notice? Where are there patterns of conflict?

2. Principles for Encouraging Positive Sibling Dynamics
- **Fairness, Not Equality:** Focus on meeting individual needs, not making everything the same.
- **Empathy Building:** Encourage siblings to consider each other’s feelings.
- **Modeling Healthy Conflict Resolution:** Show how to work through disagreements respectfully.
- **Celebrate Cooperation:** Acknowledge and praise teamwork and kindness.

Activity:
Choose one principle to focus on this week. Write down how you’ll apply it.

3. The Sibling Conflict Resolution Guide

Step 1: Pause and Calm
- Stop the interaction if emotions are high.
- Guide each child to take a few deep breaths.

Step 2: Share Perspectives
- Let each sibling express how they feel and what they needed.
- Use “I” statements like “I felt…” or “I needed…”

Step 3: Problem-Solve Together
- Ask: “What can we do to fix this?”
- Encourage the siblings to suggest solutions together.

Step 4: Repair and Reconnect
- End with a positive gesture like a handshake, high-five, or sharing something kind.

Practice Dialogue Example:

Sibling 1: "I felt upset when you grabbed my game without asking."
Sibling 2: "I didn’t realize it was so important to you. I’m sorry."
Parent: "Thanks for sharing. How can you make this better?"
Sibling 1: "Next time, ask first."
Sibling 2: "Okay, I will."

4. Common Pitfalls to Avoid
- Taking sides (“Who started it?”)
- Comparing siblings (“Why can’t you be more like…?”)
- Ignoring emotions or dismissing conflict
- Over-rescuing without letting them problem-solve

Activity:
Write down one common challenge between siblings and how you might apply this conflict resolution guide.

5. Building a Sibling Connection Agreement
Encourage siblings to create an agreement together:
- We will ask before borrowing each other’s things.
- We will use kind words.
- We will work together to solve problems.
- We will share appreciations regularly.

Activity:
Help the siblings write and decorate their agreement. Post it in a shared space.

6. Next Steps:
- Schedule one sibling bonding activity this week (shared project, game, or outing).
- Encourage daily check-ins between siblings (“What went well today?”).
- Celebrate positive moments and progress, not just conflict resolution.

Remember:
The goal isn’t to avoid all conflict—but to give siblings the tools to manage it with respect and empathy.

Activity:
Choose three strategies from this exercise to focus on over the next month. Write down how you’ll implement them and reflect weekly on your progress.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},

'12': {
  id: '12',
  title: 'Supporting Family Mental Health',
  type: 'family-dynamics',
  content: `Supporting Family Mental Health

![Family Mental Health Image](https://static.wixstatic.com/media/4e16d8_4a198ecf3cb44715834d1a3754ac9432~mv2.png)

1. Why Mental Health Conversations Matter
Mental health affects the well-being of every family member. Open conversations create safety, reduce stigma, and encourage healthy coping.

Reflection Question:
How does your family currently talk about mental health? What feels supportive, and where is there room to grow?

2. Key Principles for Supporting Mental Health
- **Empathy:** Listen without judgment.
- **Openness:** Create safe spaces for honest sharing.
- **Reduce Stigma:** Normalize mental health conversations.
- **Encourage Help-Seeking:** Support professional help when needed.
- **Model Coping Strategies:** Demonstrate healthy emotional regulation.

Activity:
Pick one principle to focus on this week. Write down specific ways to apply it in your family interactions.

3. The Mental Health Family Check-In

Step 1: Set the Scene
- Choose a calm, comfortable time.
- Agree that this is a safe, judgment-free space.

Step 2: Ask Open-Ended Questions
- “How have you been feeling lately?”
- “What’s been challenging for you this week?”
- “Is there anything you need more of from the family?”

Step 3: Listen, Validate, and Support
- Reflect feelings back: “It sounds like that’s been really hard for you.”
- Avoid fixing or dismissing.
- Ask: “How can we support you?”

Practice Dialogue Example:

Parent: "I noticed you seemed quieter lately. How are you feeling?"
Teen: "I don’t know, just kind of overwhelmed."
Parent: "Thank you for sharing that. I’m here for you. Would it help to talk more or maybe find some ways to ease that stress together?"

4. Common Pitfalls to Avoid
- Jumping to solutions instead of listening.
- Minimizing feelings (“It’s not that bad.”)
- Avoiding the topic altogether.
- Assuming what’s helpful instead of asking.

Activity:
Notice which pitfall you tend to fall into most. Write down one alternative approach you can try.

5. Create Your Family Mental Health Agreement
Outline shared commitments like:
- We will listen without judgment.
- We will respect when someone needs space.
- We will encourage asking for help when needed.
- We will check in regularly with one another.

Activity:
Sit down as a family and write your own agreement together.

6. Next Steps
- Choose one check-in question to ask your family this week.
- Reflect on how your family responds.
- Schedule regular mental health check-ins (weekly or biweekly).
- Discuss adding professional support if concerns continue.

Remember:
The goal is not to fix every problem—it’s to build safety and support through open dialogue.

Activity:
Write down three ways you can encourage positive mental health conversations in your family and practice one this week.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
'13': {
  id: '13',
  title: 'Managing Depression',
  type: 'mental-health',
  content: `Managing Depression

![Managing Depression Image](https://static.wixstatic.com/media/4e16d8_04bd743d05b54143936e642d5fb849d2~mv2.png)

1. Understanding Depression
Depression affects how we feel, think, and handle daily activities. It's not about weakness—it's about biology, environment, and experience. Managing depression means recognizing the signs and taking small steps toward care.

Reflection Question:
How does depression show up for you? What small actions have helped you feel even slightly better in the past?

2. Core Strategies for Managing Depression
- **Recognize Triggers:** Identify what makes symptoms worse.
- **Routine and Structure:** Small, consistent habits build stability.
- **Movement:** Gentle exercise like walking or stretching.
- **Mindful Awareness:** Observe thoughts and emotions without judgment.
- **Social Connection:** Reach out to a supportive person.

Activity:
Write down one strategy that feels most doable right now and why it resonates with you.

3. Building a Self-Care Plan

Step 1: Identify Your Comfort Actions
- What activities feel soothing? (E.g., warm shower, listening to music, sunlight)

Step 2: Choose Daily Habits
- One small action each day (5-minute walk, hydration, morning check-in)

Step 3: Support System
- Who can you talk to if you’re feeling low?
- Do you have access to professional resources?

Practice Example:

"I feel stuck today. I'll start by stepping outside for 5 minutes. I can text my friend afterward just to check in."

4. Small Action Exercise: The 5-Minute Rule
When motivation feels low, commit to just five minutes of an activity:
- Journaling.
- Doing one chore.
- Stretching.
- Sitting outside.

Often starting is the hardest part—the 5-minute rule helps reduce that barrier.

Activity:
Write down three low-pressure activities you can try when feeling down.

5. Common Pitfalls to Avoid
- Isolating: Reach out even if it's brief.
- Self-criticism: Replace "I’m failing" with "I’m doing my best today."
- Overloading: Focus on one thing at a time.

Activity:
Identify one negative self-talk pattern you tend to experience. Write down a kinder, alternative thought.

6. Creating a "Mood Support Plan"
- My early signs of feeling low are…
- One small action I can take is…
- My go-to support person is…
- I will remind myself that…

Example:  
"Early sign: Staying in bed all day. Action: Step outside for fresh air. Support: Text my sister. Reminder: I deserve care, even on hard days."

7. Next Steps
- Choose one self-care action for the next week.
- Keep a brief daily reflection on what helped or what felt challenging.
- Consider connecting with a therapist if symptoms persist or worsen.

Remember:
Progress is about small, consistent steps. Depression isn't a sign of failure—it’s a challenge that deserves compassion and care.

Activity:
Write down three self-care goals for the month. Focus on small steps, not perfection.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
'14': {
  id: '14',    
  title: 'Progressive Muscle Relaxation: Releasing Tension from the Body',
  type: 'stress-management',
  content: `![Progressive Muscle Relaxation Image](https://static.wixstatic.com/media/4e16d8_7968eb3645ed4fd5a62bd9146771dd61~mv2.png)

Progressive Muscle Relaxation: Releasing Tension from the Body

1. Why This Matters  
Stress often lives in the body as muscle tension — clenched jaws, tight shoulders, or restless legs.  
Progressive muscle relaxation (PMR) helps you release that tension step by step, creating a calmer mind by first calming the body.

Reflection Question:  
Where in your body do you tend to carry stress (shoulders, back, stomach, jaw)? How does it show up?

2. The Exercise: Step-by-Step Tension Release

🌿 **Step 1: Find a Quiet Space**  
Sit or lie down somewhere comfortable. Close your eyes if you like.

🌿 **Step 2: Focus on One Muscle Group at a Time**  
- Start with your hands: clench your fists tightly for **5 seconds**.  
- Then release fully and notice the contrast.  

🌿 **Step 3: Move Through the Body**  
Work your way upward or downward:  
- Arms, shoulders, face, chest, stomach, legs, feet.  
At each stage: **tense for 5 seconds, release, and notice the shift.**

Activity:  
As you release each area, imagine stress draining away like sand slipping through your fingers.

3. Reframing Stress Through Awareness

🌿 **Step 4: Combine With Breath**  
As you release tension, exhale slowly and imagine breathing out stress.  
On the inhale, imagine breathing in calm.

Example:  
- **Tense:** Shoulders tight with stress.  
- **Release:** Shoulders soften, stress melts down the back.

4. Why This Works  
Stress isn’t only a mental load — it’s physical too. By intentionally tensing and releasing, you teach your body the difference between stress and relaxation.  
Over time, your body learns to let go more quickly when stress appears.

5. Try This Challenge  
Pick one muscle group you notice often tense (like your jaw or shoulders).  
This week, each time you catch it tightening, practice a quick **tense-and-release reset**.

Next Steps:  
- Use PMR before bed to improve sleep.  
- Try a full-body session after a long workday.  
- Pair PMR with mindfulness, journaling, or stretching for deeper calm.

Remember:  
Your body holds the story of your stress — and it can also hold the solution.  
Releasing tension in the body frees the mind to return to balance.`
},  
'15': {
  id: '15',
  title: 'The Power of Gratitude',
  type: 'mental-health',
  content: `![Gratitude Exercise Image](https://static.wixstatic.com/media/4e16d8_a4b101358cfa4403af08c22647cb73f5~mv2.png)

The Power of Gratitude

1. Why Gratitude Matters  
Practicing gratitude can improve mood, strengthen relationships, and boost overall mental health. It shifts focus from what's lacking to what's appreciated.

Reflection Question:  
What is one small thing you’re grateful for today, and why?

2. Daily Gratitude Practice  
Create a simple daily ritual to acknowledge the good in your life.  
- Start or end your day by listing 3 things you're grateful for.  
- Be specific — focus on moments, people, or qualities that stood out.

Activity:  
Write today’s three gratitude items.  
Example: "A warm cup of coffee, a smile from a coworker, the sound of rain outside."

3. Gratitude Letter  
Write a letter to someone who has positively impacted your life.  
- Explain what they did and how it made a difference.  
- You don’t have to send it — the act of writing is powerful.

Activity:  
Write a short letter or message to someone you’re thankful for.

4. Gratitude Reframe  
When faced with a challenge, look for something in the experience to appreciate. This doesn’t dismiss pain — it adds a layer of meaning.

Example: "This tough conversation helped me learn how to speak up for myself."

Practice:  
Think of a recent challenge. Write down one small thing you can be grateful for in that situation.

5. Cultivating a Gratitude Mindset  
- Keep a gratitude journal  
- Share one good thing daily with a partner or friend  
- Use visual reminders (e.g., sticky notes, phone wallpaper)

Activity:  
Create your own "Gratitude Cue" — something to prompt you to pause and reflect on something positive each day. Example: Every time you see your keys or pour water.

Remember:  
Gratitude doesn’t mean ignoring problems — it’s a tool for resilience. Even in the smallest things, there’s something worth noticing.

Next Steps:  
- Start a 7-day gratitude challenge  
- Reflect on changes in your mindset and mood  
- Invite others in your home or workplace to join you`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
'16': {
  id: '16',
  title: 'SMART Goal Setting: Moving from Ideas to Action',
  type: 'goal-setting',
  content: `![SMART Goal Infographic](https://static.wixstatic.com/media/4e16d8_69030d51005d4857996d9be98d206102~mv2.png)

SMART Goal Setting: Moving from Ideas to Action

"Goals without a plan are just wishes."  
— Antoine de Saint-Exupéry

We all have hopes for how we’d like to feel, grow, or change. But vague intentions like *“I want to feel better”* or *“I should exercise more”* often stay as thoughts without becoming action.

SMART goals help bridge that gap.

SMART stands for:
- **S**pecific: Clear and well-defined.
- **M**easurable: Trackable — how will you know you’re making progress?
- **A**chievable: Realistic given your current circumstances.
- **R**elevant: Personally meaningful to you right now.
- **T**ime-bound: Attached to a clear time frame.

1. The Exercise: Creating Your SMART Goal

Choose one goal that feels meaningful to you right now.  
Break it down using the SMART framework:

| SMART Step      | Your Response                                        |
|-----------------|------------------------------------------------------|
| **Specific:**   | What exactly do you want to accomplish?               |
| **Measurable:** | How will you track progress or know when it's done?  |
| **Achievable:** | Is this realistic for you this week?                 |
| **Relevant:**   | Why does this matter to you at this time?            |
| **Time-bound:** | When will you complete this by?                      |

2. Example:

> **Vague Goal:** “I want to meditate more.”  
> **SMART Goal:** “I will practice a 10-minute guided meditation three times this week on Monday, Wednesday, and Friday mornings.”

3. Reflection Questions:

- How confident do you feel about achieving this goal (0–10 scale)?
- What small adjustments could make this feel even more doable?
- What might get in the way, and how could you plan for that?

4. Challenge:

Choose **one SMART goal** for the week ahead.  
Write it down. Place it somewhere visible.  
Check in with yourself at the end of the week:
- Did you meet your goal?
- What worked well? What might you adjust next time?

5. Why This Works:

The power of SMART goals isn't about perfection — it's about **clarity** and **actionable steps**.  
Every small move toward your goal is progress worth celebrating.

Remember: The goal isn’t about doing it perfectly. It’s about moving with intention and focus, one step at a time.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
'17': {
  id: '17',
  title: 'Values Clarification: Discover What Truly Matters to You',
  type: 'self-exploration',
  content: `![Values Clarification Image](https://static.wixstatic.com/media/4e16d8_d7e3031a6bcd4dd788f1f29f8241cd2b~mv2.png)

Values Clarification: Discover What Truly Matters to You

1. Why Knowing Your Values Matters  
Values are your internal compass — they guide your decisions, shape your goals, and help you live with integrity.  
When your actions align with your values, you feel more fulfilled and grounded. When they don't, life can feel out of sync or empty.

Reflection Question:  
What are the qualities or principles that make life feel meaningful to you?

2. The Exercise: Values Inventory

🌿 **Step 1: Review Common Values**  
Here are some examples of values (but feel free to add your own):  
- Authenticity  
- Compassion  
- Creativity  
- Family  
- Growth  
- Integrity  
- Joy  
- Learning  
- Love  
- Purpose  
- Resilience  
- Spirituality  

Activity:  
Write down **5 values** that resonate most with you.  
Then, narrow it down to your **top 3 core values.**

Reflection Prompt:  
Why did you choose these? What do these values mean to you personally?

3. Applying Your Values

🌿 **Step 2: Values in Action**  
For each of your top 3 values, answer:  
- How am I already living this value?  
- Where do I feel out of alignment with this value?  
- What is one small action I could take to honor this value more fully?

Example:  
- **Value:** Connection  
- **Action:** Schedule a weekly call with a close friend.

4. Why This Works  
Clarifying your values helps you make choices that feel authentic and empowering.  
It reduces internal conflict and increases motivation because you're acting in alignment with what truly matters to you.

5. Try This Challenge  
Choose **one action this week** that aligns with one of your core values.  
At the end of the week, reflect:  
- How did it feel to prioritize this value?  
- Did anything shift for you emotionally or mentally?

Next Steps:  
- Revisit your values regularly (they may evolve over time).  
- Check in with yourself: "Is this choice aligned with my core values?"  
- Use your values as a grounding tool when making tough decisions.

Remember:  
Values are not goals. They are ongoing directions — like stars you navigate by, not destinations you arrive at.  
The journey is about moving toward what matters most to you, one step at a time.`
},
'18': {
  id: '18',
  title: 'Thought Reframing: Challenging Negative Thinking',
  type: 'cognitive-skills',
  content: `![Thought Reframing Image](https://static.wixstatic.com/media/4e16d8_851ba7578b3944bb830e12b689d8e13a~mv2.png)

Thought Reframing: Challenging Negative Thinking

1. Why Thought Reframing Matters  
Our thoughts shape how we feel and act. But not all thoughts are true or helpful.  
Sometimes, we get stuck in patterns of **catastrophizing**, **all-or-nothing thinking**, or **self-criticism.**  
Reframing helps you step back, examine these thoughts, and create healthier ways of viewing situations.

Reflection Question:  
What is one recurring negative thought you’ve noticed lately?

2. The Exercise: The Reframing Process

🌿 **Step 1: Identify the Negative Thought**  
Example:  
> "I always mess things up."

🌿 **Step 2: Examine the Evidence**  
Ask yourself:  
- What facts support this thought?  
- What facts contradict it?

🌿 **Step 3: Find a More Balanced Thought**  
Example:  
> "I sometimes make mistakes, but I also have many successes. Mistakes are part of learning."

Activity:  
Write down one negative thought you’ve been struggling with.  
Go through these three steps to reframe it.

3. Common Cognitive Distortions to Watch For:  
- **All-or-Nothing Thinking:** “If I’m not perfect, I’m a failure.”  
- **Catastrophizing:** “This is the worst thing that could happen.”  
- **Mind Reading:** “They must think I’m incompetent.”  
- **Overgeneralization:** “I failed once, so I’ll always fail.”  
- **Labeling:** “I’m such a loser.”  
- **Should Statements:** “I should always be calm.”

Challenge:  
Which distortion shows up most often for you?

4. Why This Works  
Thought reframing reduces emotional reactivity and helps build resilience.  
It encourages **self-compassion** and allows space for growth rather than judgment.

5. Try This Challenge  
For the next week, notice when negative thoughts pop up.  
Pause and ask yourself:  
> "What’s another way I could look at this?"  
Write down at least **one reframe per day.**

Remember:  
The goal is not to "think positively" but to think **realistically and compassionately.**  
Balanced thoughts create space for hope, flexibility, and action.

Next Steps:  
- Keep a “Thought Reframe Journal.”  
- Reflect on how shifting your thoughts impacts your mood and choices.  
- Celebrate each time you catch and reframe a distorted thought — awareness is progress!
`
},
'33': {
  id: '33',
  title: 'Self-Compassion Check-In: Meeting Yourself with Kindness',
  type: 'self-exploration',
  content: `![Self-Compassion Exercise Image](https://static.wixstatic.com/media/4e16d8_fbd9f8ea23ac4b40a7b5fc2147d0cd51~mv2.png)

Self-Compassion Check-In: Meeting Yourself with Kindness

1. Why Self-Compassion Matters  
We often offer kindness and understanding to others — yet speak to ourselves with harsh criticism.  
Self-compassion is the practice of treating yourself like you would a good friend: with warmth, patience, and care.  
It supports emotional resilience, reduces shame, and fosters personal growth.

Reflection Question:  
How do you typically speak to yourself when you’re struggling? Is your inner voice kind, or critical?

2. The Exercise: Self-Compassion Check-In

🌿 **Step 1: Notice the Struggle**  
Bring to mind a recent moment when you felt upset, stressed, or disappointed in yourself.  
Pause and gently ask:  
- "What am I feeling right now?"  
- "What do I need most in this moment?"

🌿 **Step 2: Name the Experience Without Judgment**  
Practice saying to yourself:  
- "This is a moment of struggle."  
- "Struggles are part of being human."  
- "I am not alone in this experience."

🌿 **Step 3: Offer Kind Words to Yourself**  
Choose one of the following (or create your own):  
- "I’m doing the best I can."  
- "It’s okay to feel this way."  
- "I deserve kindness, especially right now."

Activity:  
Write a short compassionate letter to yourself as if you were writing to a close friend going through the same struggle.

Reflection Prompt:  
What shifts when you approach your experience with compassion instead of judgment?

3. Why This Works  
Self-criticism activates the brain’s threat system, while self-compassion engages the care system, which promotes calm, healing, and connection.  
This helps you stay grounded and emotionally regulated during hard moments.

4. Try This Challenge  
For the next 7 days, take one minute each evening to check in:  
- Did I face any difficult moments today?  
- Did I respond with compassion, or criticism?  
- How can I offer myself kindness next time?

Next Steps:  
- Keep your self-compassion letter somewhere accessible.  
- Re-read it whenever your inner critic gets loud.  
- Remind yourself: Growth happens through care, not cruelty.

Remember:  
Self-compassion is not about letting yourself off the hook. It’s about staying on your own side as you learn, grow, and face life’s challenges.`
},
'20': {
  id: '20',
  title: 'Reframing Negative Thoughts: Shift Your Inner Dialogue',
  type: 'cognitive-skills',
  content: `![Reframing Thoughts Image](https://static.wixstatic.com/media/4e16d8_07b6027870e847659078f92558f4ebdd~mv2.pngg)

Reframing Negative Thoughts: Shift Your Inner Dialogue

1. Why This Matters  
Our thoughts shape how we feel and behave. But sometimes, these thoughts are distorted or overly negative — leading to anxiety, low mood, or self-criticism.  
Reframing doesn't mean "just think positive." It means **challenging unhelpful thoughts** and finding a more balanced, realistic way to view the situation.

Reflection Question:  
What’s one negative thought that tends to show up for you?

2. The Exercise: Thought Reframe Worksheet

🌿 **Step 1: Notice the Negative Thought**  
Example: "I always mess things up."

🌿 **Step 2: Identify the Distortion**  
Some common thinking traps:  
- All-or-nothing thinking ("always," "never")  
- Catastrophizing (assuming the worst)  
- Personalizing (blaming yourself for everything)  
- Mind reading ("they must think I'm incompetent")  
- Should statements ("I should be better at this")

🌿 **Step 3: Ask Yourself:**  
- What evidence supports this thought?  
- What evidence goes against it?  
- Is there another way to view this situation?  
- What would I say to a friend who had this thought?

🌿 **Step 4: Reframe the Thought**  
Original: "I always mess things up."  
Reframe: "Sometimes things don't go as planned, but I learn and improve each time."

3. Why This Works  
Catching and reframing negative thoughts interrupts the automatic cycle of anxiety or self-doubt.  
It builds emotional resilience by helping you respond to challenges with curiosity instead of judgment.

4. Try This Challenge  
For the next week, write down one negative thought each day.  
Use the reframe steps to challenge it and write your new, more balanced thought.  
Notice how this affects your mood or stress levels.

5. Next Steps  
- Keep a "thought journal" to track patterns over time.  
- Practice pausing when negative thoughts arise: "Is this thought 100% true?"  
- Get familiar with your common thinking traps and build your reframe skills.

Remember:  
Changing your thoughts is a skill — it takes practice and patience.  
The goal isn’t to eliminate negative thoughts but to learn how to hold them more lightly and respond with compassion.`
},
'21': {
  id: '21',
  title: 'Self-Compassion Break: Being Kind to Yourself in Difficult Moments',
  type: 'self-compassion',
  content: `![Self-Compassion Visual](https://static.wixstatic.com/media/4e16d8_0d0e570a6ea344cba1128b95dad0612a~mv2.png)

Self-Compassion Break: Being Kind to Yourself in Difficult Moments

1. Why Self-Compassion Matters  
When you're struggling, it's easy to fall into self-criticism.  
But research shows that kindness toward yourself — especially during hard times — builds emotional resilience and reduces anxiety, depression, and shame.  
Self-compassion is not self-pity. It's choosing to treat yourself with the same care you’d offer a loved one.

Reflection Question:  
How do you usually respond to yourself when things go wrong? What might shift if you responded with compassion instead?

2. The Exercise: The Self-Compassion Break

🌿 **Step 1: Notice the Moment of Struggle**  
Pause. Recognize you're having a hard time right now.  
Say to yourself (silently or out loud):  
- "This is a moment of difficulty."  
- "Struggle is part of being human."

🌿 **Step 2: Offer Kindness Instead of Criticism**  
Ask yourself:  
- "What do I need right now?"  
- "How can I care for myself in this moment?"

🌿 **Step 3: Place Your Hand on Your Heart**  
Take a few slow breaths. Gently place your hand on your chest as a physical gesture of kindness.

🌿 Suggested Affirmations:  
- "May I be kind to myself."  
- "May I give myself the compassion I need."  
- "I am doing the best I can."

Reflection Prompt:  
After trying this, how did your body and mind respond?  
What was it like to offer yourself care instead of criticism?

3. Why This Works  
Self-compassion interrupts the cycle of self-judgment.  
It helps calm the nervous system, reduce reactivity, and create space for healing and growth.

4. Try This Challenge  
Practice a **Self-Compassion Break** once a day for the next week — even for just 30 seconds.  
Notice when your inner critic shows up, and gently replace it with one compassionate phrase.

Next Steps:  
- Write down 2-3 self-compassion phrases that resonate with you.  
- Post them somewhere visible (mirror, phone wallpaper, journal).  
- Revisit them often, especially during moments of struggle.

Remember:  
Self-compassion is not weakness — it’s a brave choice to meet yourself with understanding.  
You deserve the same kindness you give to others.`
},
'22': {
  id: '22',
  title: 'Coping Skills Toolbox: Building Your Personalized Toolkit for Stressful Moments',
  type: 'coping-skills',
  content: `![Coping Skills Toolbox Image](https://static.wixstatic.com/media/4e16d8_0d0e570a6ea344cba1128b95dad0612a~mv2.png)

Coping Skills Toolbox: Building Your Personalized Toolkit for Stressful Moments

1. Why a Coping Toolbox Matters  
When stress hits, it’s easy to forget the tools you already know.  
A Coping Toolbox is your go-to list of strategies to help you regulate, refocus, and take care of yourself in hard moments.

Reflection Question:  
When you're overwhelmed, what healthy strategies help you feel even a little better?

2. The Exercise: Create Your Coping Toolbox

🌿 **Step 1: List Your Coping Strategies by Category**

- **Body-Based:** (e.g., deep breathing, yoga, going for a walk, stretching)
- **Mind-Based:** (e.g., journaling, gratitude list, reframing thoughts)
- **Soothing Activities:** (e.g., listening to music, taking a bath, aromatherapy)
- **Connection-Based:** (e.g., calling a friend, reaching out to a support person)
- **Creative Outlets:** (e.g., drawing, cooking, dancing, playing an instrument)
- **Distraction Tools:** (e.g., watching a favorite show, reading, puzzles)

Activity:  
Fill out your toolbox with at least **2-3 strategies** in each category.

Reflection Prompt:  
Which strategies feel the most accessible to you right now?  
Are there any tools you'd like to explore or learn more about?

3. Why This Works  
Having a written plan reduces decision fatigue in tough moments.  
It reminds you that you have options and puts self-care at your fingertips when you need it most.

4. Try This Challenge  
Pick **one tool from your list** to practice daily this week — even if you’re not feeling stressed.  
Building these habits during calm times makes them easier to access under pressure.

Next Steps:  
- Post your Coping Toolbox somewhere visible or keep it on your phone.  
- Continue to add new strategies as you discover what works for you.  
- Reflect weekly: Which tools were helpful? Which didn’t feel effective? What would you like to try next?

Remember:  
There’s no “perfect” way to cope — your toolbox is unique to you.  
The goal is not to erase discomfort but to offer yourself care, support, and grounding when life feels hard.`
},
'23': {
  id: '23',    
  title: 'Emotion Identification: Name It to Tame It',
  type: 'emotional-awareness',
  content: `![Emotion Identification Image](https://static.wixstatic.com/media/4e16d8_da6b4d27daf4452899207480239e3cdf~mv2.png)

Emotion Identification: Name It to Tame It

1. Why Naming Your Emotions Helps  
Emotions are powerful messengers. When we can't name what we’re feeling, those emotions often show up as overwhelm, irritability, or disconnection.  
Research shows that **naming an emotion reduces its intensity** — giving your brain a chance to process, not just react.

Reflection Question:  
How do you usually respond when you're feeling upset or overwhelmed? Do you notice your first instinct is to shut down, lash out, or avoid?

2. The Exercise: Name It to Tame It

🌿 **Step 1: Slow Down and Tune In**  
Pause and ask yourself:  
- What am I feeling right now?  
- Where do I feel it in my body?  
- What triggered this feeling?

🌿 **Step 2: Use the Emotion Wheel**  
Refer to an Emotion Wheel or list of feelings. Instead of broad labels like "good" or "bad," try more precise words:  
- Joyful, Peaceful, Grateful  
- Anxious, Lonely, Frustrated  
- Embarrassed, Disappointed, Hopeful

Example:  
Instead of saying “I’m stressed,” notice if what you're really feeling is **“overwhelmed,” “pressured,” or “worried.”**

3. Why This Works  
When you label an emotion clearly, the emotional part of your brain (amygdala) calms down — and your thinking brain (prefrontal cortex) becomes more engaged.  
This creates space for better choices, problem-solving, and self-compassion.

4. Try This Challenge  
Pause once per day this week and write down:  
- **One emotion you're feeling**  
- **Where you feel it in your body**  
- **What triggered it**

Activity Example:  
- Emotion: Frustrated  
- Body: Tightness in shoulders  
- Trigger: A last-minute work deadline

Reflection Prompt:  
What changed (if anything) after naming this emotion? Did it feel lighter, more manageable, or clearer?

5. Next Steps:  
- Keep a daily or weekly "Emotion Log."  
- Use your emotion words as a way to communicate more clearly with others.  
- Practice saying: “I’m noticing I feel ___ right now.”

Remember:  
**You can't process what you can't name.** Naming your emotions is not weakness — it's the first step toward emotional regulation and resilience.`
},
'24': {
  id: '24',    
  title: 'Circle of Control: Letting Go of What You Can’t Change',
  type: 'stress-management',
  content: `![Circle of Control Image](https://static.wixstatic.com/media/4e16d8_d432ff3dee1e4aaeaaa24378acb29c45~mv2.png)

Circle of Control: Letting Go of What You Can’t Change

1. Why This Matters  
Anxiety often comes from focusing on things outside of your control.  
Learning to separate what's **within your control** from what isn't can lower stress, reduce overwhelm, and improve emotional well-being.

Reflection Question:  
What situations or worries have been occupying your mind lately? Which of these are truly within your control?

2. The Exercise: Drawing Your Circle

🌿 **Step 1: Make Two Lists**  
- Write down everything that’s stressing you out right now.  
- Now sort those items into two categories:  
  - **Within My Control:** Things I can directly influence (e.g., my reactions, my choices, my self-care).  
  - **Outside My Control:** Things I can’t control (e.g., other people’s choices, the past, world events).

🌿 **Step 2: Visualize Your Circle**  
Draw a big circle on paper.  
- Inside the circle, write the things **within your control**.  
- Outside the circle, list the things **outside your control**.

Activity:  
Notice where most of your energy has been going — toward the inside of the circle, or the outside?

3. Reframing Focus

🌿 **Step 3: Shift Your Energy**  
For each item outside your control, ask yourself:  
- "What *can* I do about how this affects me?"  
- "How can I redirect my focus toward what’s within my power?"

Example:  
- **Not in control:** Whether a coworker responds kindly.  
- **In control:** How I communicate my needs, set boundaries, and care for my emotions.

4. Why This Works  
By focusing on what you *can* control, you empower yourself.  
It helps reduce feelings of helplessness and encourages active coping instead of rumination.

5. Try This Challenge  
Choose one worry that’s been outside your control.  
This week, practice **releasing your grip on that worry** and intentionally redirect your energy toward an action *within your control.*

Next Steps:  
- Revisit your Circle of Control whenever you feel overwhelmed.  
- Use it as a tool to ground yourself during stressful situations.  
- Remind yourself: "I focus on what I can do, not what I can't control."

Remember:  
Letting go doesn’t mean giving up — it means wisely choosing where to place your effort and care.  
It’s about recognizing your power while releasing the burdens that were never yours to carry.`
},
'25': {
  id: '25',  
  title: 'Relationship Check-In: Strengthening Connection Through Reflection',
  type: 'relationships',
  content: `![Relationship Check-In Image](https://static.wixstatic.com/media/4e16d8_9c76dfdae65c4326b6a5e07bc38a0b80~mv2.png)

Relationship Check-In: Strengthening Connection Through Reflection

1. Why Relationship Check-Ins Matter  
Healthy relationships thrive on consistent care, open communication, and shared reflection.  
A regular check-in creates space for both people to feel heard, appreciated, and connected — outside of conflict or crisis moments.

Reflection Question:  
When was the last time you intentionally checked in on the health of your relationship?

2. The Exercise: The Weekly Relationship Check-In

🌿 **Step 1: Create the Space**  
- Choose a quiet, comfortable time without distractions.  
- Set the intention: This is about listening, not fixing.  
- Agree to take turns speaking and listening.

🌿 **Step 2: Use These Prompts Together:**  
- One thing I appreciated about you this week was…  
- One challenge I felt this week was…  
- One thing I’d like more of from you is…  
- One thing I could do differently to support you is…  
- Something I’m grateful for in our relationship is…

Activity:  
Write down each partner’s responses (if comfortable). Reflect together:  
- What did you learn about each other through this conversation?  
- How did it feel to share and listen?

3. Why This Works  
This structured dialogue encourages honest sharing while reducing defensiveness.  
It builds emotional safety by allowing both people to express needs, appreciation, and concerns with care.

4. Try This Challenge  
Commit to practicing this check-in **once per week** for the next month.  
Each time, swap roles of who shares first.  
Notice if anything shifts in your emotional connection, conflict patterns, or sense of teamwork.

Next Steps:  
- Add your check-in time to the calendar as a recurring event.  
- Keep the tone curious and supportive, not critical.  
- Celebrate even the small wins in your communication.

Remember:  
The strength of a relationship isn’t measured by the absence of problems — it’s built on how you show up for each other through reflection, care, and commitment to growth.`
},
'26': {
  id: '26', 
  title: 'The Stress-Reducing Conversation: Support Without Solving',
  type: 'communication',
  content: `![Stress-Reducing Conversation Image](https://static.wixstatic.com/media/4e16d8_9ad5fdf89a854c06a67bcd3d8f20e13f~mv2.png)

The Stress-Reducing Conversation: Support Without Solving

1. Why This Matters  
Stress from work, family, or life often spills into our relationships — not because of the relationship, but because we all carry outside stressors.  
The **Stress-Reducing Conversation** is designed to help partners talk about these external stressors, feel heard, and receive support — without trying to "fix" the problem.

Reflection Question:  
When you’re stressed, do you prefer advice or just someone to listen?

2. The Exercise: How to Have a Stress-Reducing Conversation

🌿 **Step 1: Choose a Calm Time**  
Pick a time when you're both available and not distracted.

🌿 **Step 2: Take Turns Sharing**  
- One partner shares something stressful (from work, family, life — not the relationship).  
- The other partner listens with empathy and curiosity.

🌿 **Step 3: Listener Role (Not Problem Solver!)**  
The listener should:  
- Ask open-ended questions ("How did that feel for you?")  
- Reflect feelings back ("Sounds like that was really frustrating.")  
- Validate ("That makes sense why you'd feel that way.")  
- Avoid giving advice unless invited to do so.

🌿 **Step 4: Switch Roles**  
After one person feels heard, swap roles so both partners get a turn.

Activity:  
Try practicing this conversation **3 times this week.**  
Each time, focus on these phrases:  
- "Tell me more about what that was like for you."  
- "How can I best support you right now?"  
- "That sounds really hard — I appreciate you sharing it with me."

3. Why This Works  
When couples make space for each other’s outside stress, they build trust, intimacy, and emotional connection.  
It lowers tension, prevents outside stress from damaging the relationship, and helps partners feel like a team.

4. Common Pitfalls to Avoid  
- Jumping into advice too quickly.  
- Saying "Don't worry about it" or minimizing feelings.  
- Turning the conversation back onto your own stress before your partner feels heard.

5. Try This Challenge  
Schedule a **10-minute stress-reducing conversation** at least twice this week.  
At the end of each, reflect together:  
- Did you feel heard?  
- What helped you feel most supported?  
- Anything you'd like to improve next time?

Remember:  
Sometimes the best support is not advice — it’s simply being fully present, listening without judgment, and holding space for your partner’s experience.`
}, 
'27': {
  id: '27', 
  title: 'The Love Map Check-In: Deepening Your Knowledge of Each Other',
  type: 'relationships',
  content: `![Love Map Image](https://static.wixstatic.com/media/4e16d8_16ce60c254904b45a6b58c76af53ffd9~mv2.png)

The Love Map Check-In: Deepening Your Knowledge of Each Other

1. What Are Love Maps?  
A "Love Map" is the mental space you hold for your partner’s inner world — their hopes, worries, memories, dreams, and everyday details.  
The Gottman Institute found that strong relationships are built on knowing and updating these Love Maps over time.

Reflection Question:  
How well do you feel you know your partner’s world right now? When was the last time you really checked in?

2. The Exercise: Love Map Questions

🌿 **Step 1: Take Turns Asking and Answering These Questions:**  
- What is your partner’s favorite way to relax?  
- Who is someone your partner feels close to?  
- What has been stressing your partner out lately?  
- What is your partner currently looking forward to?  
- What are your partner’s biggest life dreams?  
- Who has been especially supportive in your partner’s life?  
- What are three things that make your partner feel loved?  
- What is one of your partner’s favorite childhood memories?  
- What is your partner’s favorite meal, song, or movie right now?

Activity:  
Write down any new insights or reminders you gathered during this check-in.

3. Why This Works  
Life changes fast — and so do our inner worlds.  
When partners stay curious and tuned in to each other’s lives, the relationship grows stronger, safer, and more connected.

4. Try This Challenge  
Schedule a **10-minute Love Map Check-In** at least once a week.  
Mix up the questions. Stay curious. Focus on listening, not fixing.

Reflection Prompt:  
After this check-in, how connected do you feel to your partner? Did anything surprise you?

5. Next Steps:  
- Keep a shared journal of your Love Map discoveries.  
- Add new questions or create your own based on what matters most to your relationship.  
- Revisit these questions during times of stress or disconnection as a way to rebuild closeness.

Remember:  
Love Maps are living documents — they’re meant to be updated and explored regularly.  
Stay curious about each other, even (and especially) when life gets busy.`
},
'28': {
  id: '28', 
  title: 'ACT: The Choice Point – Moving Toward or Away from What Matters',
  type: 'values',
  content: `![Choice Point Visual](https://static.wixstatic.com/media/4e16d8_dad0c5d27ec44e3687328aeb8405dc1a~mv2.png)

ACT: The Choice Point – Moving Toward or Away from What Matters

1. Why This Exercise Matters  
Life constantly presents us with **choice points** — moments where we can either move **toward** the life we want, guided by our values, or **away** from it, driven by avoidance, fear, or discomfort.  
This exercise helps you pause and notice: *Are my actions bringing me closer to what really matters?*

Reflection Question:  
Think about a recent challenge or stressful moment. Did your reaction move you toward the person you want to be, or away from it?

2. The Structure of the Choice Point Exercise

🌿 **Step 1: Identify a Situation**  
Choose a specific recent moment when you felt stressed, upset, or stuck.

🌿 **Step 2: Name the 'Away Moves'**  
List the reactions, urges, or behaviors that pulled you **away** from your values (e.g., shutting down, blaming, avoiding, lashing out).

🌿 **Step 3: Connect with Your Values**  
Pause and ask:  
- What kind of person do I want to be in situations like this?  
- What do I stand for?  
- What truly matters to me here?

🌿 **Step 4: Define 'Toward Moves'**  
List actions that could bring you **closer** to your values (e.g., speaking honestly, staying open, showing patience, taking a mindful breath).

🌿 **Step 5: Create a Plan for Next Time**  
When a similar challenge arises again, how might you choose a **toward move** instead of an away move?

Activity Prompt:  
Write down one "away move" you've noticed lately and what a "toward move" might look like in that situation.  
Commit to practicing this awareness the next time you're at a choice point.

3. Why This Works  
When we react on autopilot, we often act against what really matters to us.  
By noticing these key moments, we can interrupt the cycle and choose actions that align with our deepest values — even when it's uncomfortable.

4. Try This Challenge  
Pick one area of your life (relationships, work, self-care) and keep track of your **choice points** for the next week.  
Notice when you’re leaning toward avoidance and when you’re choosing alignment.

Remember:  
Every moment is a chance to **notice the choice point** and move closer to the life you want to build.

Next Steps:  
- Reflect on how often "away moves" show up in your day.  
- Celebrate small steps toward your values — even if imperfect.  
- Consider journaling about these moments to strengthen your awareness.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist'
},  
'29': {
  id: '29',
  title: 'The Intimacy Inventory: Exploring Your Needs and Boundaries',
  type: 'intimacy',
  content: `![Intimacy Inventory Visual](https://static.wixstatic.com/media/4e16d8_beeb9c77440148c9ae9c65ac49c4ccc3~mv2.png)

The Intimacy Inventory: Exploring Your Needs and Boundaries

1. Why This Exercise Matters  
Intimacy isn’t just about physical closeness — it includes emotional, sexual, intellectual, spiritual, and recreational connection.  
The Intimacy Inventory helps partners explore and express their desires, hesitations, and needs across different areas — creating space for honesty, curiosity, and safety.

Reflection Question:  
What helps you feel most connected in your relationship — and what sometimes gets in the way?

2. The Exercise: The Intimacy Inventory

🌿 **Step 1: Set the Space**  
- Choose a time when you’re both calm and open.  
- Remind each other that this is about curiosity, not criticism.  
- Agree to listen without defensiveness.

🌿 **Step 2: Use the Inventory Together**  
Take turns exploring each item in the inventory below. For each, share if it feels like:  
- ✅ **“I want more of this”**  
- 🤔 **“I’m unsure / open to discussion”**  
- 🚫 **“This is a boundary for me”**

Inventory Items:  
- Holding hands or cuddling  
- Sharing feelings without judgment  
- Playful teasing or humor  
- Long conversations  
- Deep eye contact  
- Kissing  
- Trying something new in bed  
- Saying “I love you”  
- Talking about fantasies  
- Praying or meditating together  
- Exploring new experiences together  
- Spending uninterrupted time alone  
- Making time for physical touch  
- Sharing dreams or life goals  
- Listening deeply when one of us is struggling

Activity:  
As you share, keep the goal in mind: **to understand each other better, not to pressure or persuade.**

🌿 Use these questions to deepen the conversation:  
- “What makes this feel safe or unsafe for you?”  
- “What do you need to feel more open here?”  
- “What helps you feel desired or close?”

3. Why This Works  
Most couples assume they understand each other’s needs — until they pause to actually ask.  
This inventory makes the implicit **explicit** — allowing space for negotiation, reassurance, and discovery.

4. Try This Challenge  
Choose **two things from the ‘I want more of this’ list** and plan ways to explore them together this week.  
Then, reflect together:  
- What worked well?  
- What felt surprising or vulnerable?

5. Next Steps  
- Revisit your Intimacy Inventory every few months.  
- Use it after major life transitions (parenthood, moves, illness, etc.)  
- Celebrate progress — and honor your boundaries.

Remember:  
Intimacy isn’t about doing everything the same way — it’s about understanding, respecting, and co-creating a connection that feels safe and alive for both partners.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
'30': {
  id: '30',
  title: 'Repair After Rupture: A Scripted Guide to Reconnection',
  description: 'Use structured language and co-regulation tools to de-escalate conflict, take ownership, and foster emotional safety after a rupture.',
  category: 'couples',
  subcategory: 'conflict',
  type: 'conflict',
  content: `![Repair After Rupture Visual](https://static.wixstatic.com/media/4e16d8_15d8bc319c3c4c7e8a00ec579c7f1df6~mv2.png)

Repair After Rupture: A Scripted Guide to Reconnection

---

**1. Why This Exercise Matters**  
Even the strongest relationships encounter moments of disconnection — a sharp word, a missed cue, a conflict that spirals.  
What matters more than the rupture is how couples repair.  
This guided process teaches co-regulation, accountability, and safe re-entry after conflict.

**Reflection Prompt:**  
What typically happens in your relationship after conflict?  
Do you shut down, escalate, avoid, or try to reconnect too quickly?

---

**2. The Repair Process**

🌀 *Step 1: Pause and Regulate*  
Before engaging in repair, both partners must return to emotional baseline.  
Use any of the following:  
- Take 10+ minutes apart to breathe or ground  
- Go for a walk  
- Use an agreed-upon cool-down signal  
- Use a calming phrase: “Let’s come back when we’re calmer. I love you.”

🌀 *Step 2: Invite Repair*  
Once calm, use this simple invitation:  
> “Can we talk about what happened earlier? I want to reconnect.”

🌀 *Step 3: Use the Repair Script*

**Partner A (who is initiating):**  
- “When [event] happened, I felt [emotion].”  
- “I realize I may have [impact/behavior].”  
- “I wasn’t trying to hurt you. I was feeling [internal experience].”  
- “Here’s what I wish I had done instead…”  
- “I care about us. I want to work through this with you.”

**Partner B (listening/responding):**  
- “Thank you for sharing that.”  
- “It helps to hear what was going on for you.”  
- “Here’s how I felt in that moment…”  
- “What I needed was…”  
- “Let’s find a way forward.”

🌀 *Step 4: Validate and Close with Connection*  
- Reflect back what you heard.  
- Validate the emotions, even if the behavior was hard to receive.  
- Reaffirm the relationship:
> “We’re okay. I’m still here with you.”

---

**3. Why This Works**  
Structured language lowers reactivity.  
When couples are guided toward ownership, curiosity, and validation, the nervous system feels safe — and true repair becomes possible.

---

**4. Try This Challenge:**  
Next time conflict arises, agree to use the 4-step repair model:
- Regulate → Invite → Script → Reconnect  
Notice what changes in the tone of your conflict — and how quickly you feel safe again.

---

**5. Maintain the Practice**  
Healthy relationships are not conflict-free — they’re repair-rich.  
The more you practice this, the faster you recover and the stronger your bond becomes.
`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
'31': {
  id: '31',
  title: 'Behavioral Activation: Rediscovering Joy',
  description: 'Learn how to lift mood and reduce stress by scheduling activities that bring meaning and pleasure.',
  category: 'adults',
  subcategory: 'behavioral-skills',
  type: 'behavioral-skills',
  content: `![Behavioral Activation Image](https://static.wixstatic.com/media/4e16d8_2cfb91f269554497a107c6551a3c1402~mv2.png)

Behavioral Activation: Rediscovering Joy

When stress or depression take hold, it’s common to withdraw from the very activities that keep us feeling balanced and connected. Behavioral activation is about re-engaging with small, meaningful actions that help restore energy, joy, and purpose.

1. Why This Matters  
Avoidance feeds stress and low mood, while action can break the cycle. Even small steps can improve motivation, strengthen relationships, and create positive momentum.

Reflection Question:  
What’s one activity you used to enjoy but haven’t done in a while?

2. The Exercise: Plan, Do, Reflect  

🌿 **Step 1: Make a List**  
Write down activities that bring you:  
- **Pleasure** (fun, enjoyable, relaxing).  
- **Mastery** (a sense of accomplishment or progress).  

🌿 **Step 2: Choose One Small Step**  
Pick one activity from your list that feels doable this week. Keep it realistic — a 10-minute walk, calling a friend, or cooking a meal.  

🌿 **Step 3: Schedule It**  
Put it in your calendar or set a reminder, treating it like a real appointment.  

🌿 **Step 4: Reflect**  
After completing the activity, jot down how you felt before, during, and after. Notice any shifts in mood, energy, or outlook.  

3. Example  
- **Before:** “I don’t feel like going for a walk.”  
- **During:** “It’s not so bad once I’m moving.”  
- **After:** “I feel a little lighter and more clear-headed.”  

4. Why This Works  
Positive action often comes *before* motivation. By building small successes, you reinforce a cycle of engagement, purpose, and emotional well-being.  

5. Try This Challenge  
Schedule **two activities** this week — one for pleasure and one for mastery. Track how each one affects your mood and motivation.  

Remember:  
You don’t need to feel motivated before taking action. Action itself creates the spark that brings joy and energy back into your life.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},
'32': {
  id: '32',
  title: 'Dealing with Ambivalence: Finding Clarity in Mixed Feelings',
  description: 'Learn strategies to work through conflicting thoughts and emotions when facing important decisions.',
  category: 'adults',
  subcategory: 'decision-making',
  type: 'decision-making',
  content: `![Ambivalence Image](https://static.wixstatic.com/media/4e16d8_0377ae483fdd47b680197474ace533b1~mv2.png)

Dealing with Ambivalence: Finding Clarity in Mixed Feelings

Ambivalence is when you feel pulled in two directions at once — wanting change but fearing it, or valuing two competing paths. It can feel paralyzing, but working through ambivalence helps you make choices that align with your deeper values.

1. Why This Matters  
Ambivalence is a natural part of decision-making, especially with meaningful choices. Instead of forcing quick answers, exploring both sides openly creates clarity and self-compassion.

Reflection Question:  
Think of a decision you’ve been wrestling with. What are the two sides of your inner conflict?

2. The Exercise: Exploring Both Sides  

🌿 **Step 1: Name the Decision**  
Write down the choice you feel torn about. Keep it simple (e.g., “Should I stay in this job or leave?”).  

🌿 **Step 2: Make Two Columns**  
- Column A: “Reasons For”  
- Column B: “Reasons Against”  

List every thought, feeling, or value on each side — without judgment.  

🌿 **Step 3: Dig Deeper**  
For each reason, ask yourself:  
- What value or fear does this represent?  
- Is this about long-term growth, or short-term comfort?  
- Am I influenced by outside expectations, or my own needs?  

🌿 **Step 4: Reflect on Balance**  
Notice if one column feels heavier, more values-driven, or aligned with your future self.  

3. Example  
- **Decision:** “Should I move to a new city?”  
- **Reasons For:** More opportunities, adventure, personal growth.  
- **Reasons Against:** Fear of loneliness, financial stress, leaving family behind.  
- **Reflection:** Growth and values weigh more strongly, but I need support to manage fear.  

4. Why This Works  
Instead of treating ambivalence as a problem, this exercise reframes it as information. Your mixed feelings point to values, fears, and needs that deserve attention. Working with ambivalence creates clarity instead of avoidance.  

5. Try This Challenge  
Choose one decision you feel stuck on. Spend 10 minutes journaling both sides, then highlight the reasons that reflect your deepest values. Share your reflections with a trusted friend, therapist, or mentor.  

Remember:  
Ambivalence doesn’t mean you’re weak — it means the decision matters. By exploring both sides, you give yourself the chance to move forward with greater clarity and self-trust.`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  therapistId: 'sample-therapist',
},  
};

export default function ExerciseView() {
  const { id } = useParams();
  const exercise = SAMPLE_EXERCISES[id] || SAMPLE_EXERCISES['13'];
  const { userData } = useUser();

  useEffect(() => {
    // Record the exercise view in Supabase when the component mounts
    const recordExerciseView = async () => {
      if (!userData?.id || !id) return;
      
      try {
        // First check if this view already exists in the database
        const { data } = await supabase
          .from('exercise_views')
          .select('*')
          .eq('user_id', userData.id)
          .eq('exercise_id', id);
        
        // Only insert if no matching record exists
        if (!data || data.length === 0) {
          await supabase.from('exercise_views').insert({
            user_id: userData.id,
            exercise_id: id,
          });
          console.log('Exercise view recorded');
        } else {
          console.log('Exercise view already exists, not recording duplicate');
        }
      } catch (error) {
        console.error('Error recording exercise view:', error);
      }
    };
    
    recordExerciseView();
  }, [id, userData?.id]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/dashboard/exercises"
          className="inline-flex items-center text-sm text-[#01B1AF] hover:text-[#01B1AF]"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Exercises
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">
          {formatContent(exercise.content)}
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Take your time with this exercise. Your responses are private and only visible to you.
            </p>
            <Link to="/dashboard/exercises">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Exercises
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}