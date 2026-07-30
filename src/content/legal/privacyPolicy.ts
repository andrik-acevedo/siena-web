// CANONICAL Siena Privacy Policy.
//
// This text is written to be accurate to how the product ACTUALLY behaves,
// verified against the codebase (mobile edge functions, web edge functions,
// and client call sites) rather than against prior policy text.
//
// Ground truth this document encodes:
//   - 12 mobile edge functions and 2 web edge functions call OpenAI.
//   - OpenAI is used for text generation, audio transcription (Whisper),
//     image generation (gpt-image-1), and automated moderation.
//   - Siena is on OpenAI's STANDARD API terms. There is no Zero Data
//     Retention agreement and no bespoke DPA. Retention language must
//     therefore say: not used for training, retained up to 30 days for
//     abuse monitoring. NEVER claim zero retention or "our agreement".
//
// Open legal questions about this document live in counselNotes.ts, keyed by
// section id, and surface only when LEGAL_REVIEW_MODE is on.

import type { LegalDocument } from './types';

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy Policy',
  lastUpdated: 'July 30, 2026',
  effective: 'July 30, 2026',

  intro: [
    {
      kind: 'p',
      text: 'Siena, owned and operated by Your Life Consulting, LLC ("Siena," "we," "us," or "our"), is a self-guided wellness and relationship support tool. Siena is not a medical or mental health provider and does not replace therapy, diagnosis, or professional care.',
    },
    {
      kind: 'p',
      text: 'This Privacy Policy explains what information we collect, how we use it, who we share it with, how long we keep it, and the rights you have. It covers the Siena mobile apps and the Siena website, which share a single account and a single backend.',
    },
    {
      kind: 'p',
      text: 'Siena uses a third-party artificial intelligence provider, OpenAI, to power several features. Because that involves sending content you write to a company outside Siena, we describe it in detail in the "AI Features and OpenAI" section below rather than burying it in a general list of service providers. If you read only one section of this policy, read that one.',
    },
  ],

  sections: [
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'information-we-collect',
      title: '1. Information We Collect',
      blocks: [
        { kind: 'h', text: 'Account information' },
        {
          kind: 'p',
          text: 'When you create an account or use Siena, we collect information you provide directly:',
        },
        {
          kind: 'ul',
          items: [
            'Name and display name',
            'Email address',
            'Password (stored in hashed form; we never see your plaintext password)',
            'Phone number (optional; required if you use SMS reminders)',
            'Profile photo or selected avatar',
            'Date of birth, where required to verify that you are 18 or older',
            'Partner relationship link, when you connect with a partner using an invite code',
            'Communication and notification preferences',
          ],
        },

        { kind: 'h', text: 'Wellness content you create' },
        {
          kind: 'p',
          text: 'When you use Siena\'s tools you may voluntarily enter self-reflective content, including:',
        },
        {
          kind: 'ul',
          items: [
            'Journal entries, including title, body, mood and category',
            'Mood tracking entries and notes',
            'Responses to quizzes, assessments, exercises and check-ins',
            'Goals, habits, values, commitments and progress data',
            'Card-deck reflections, affirmations and breathing logs',
            'Sleep, dating and activity tracker entries',
            'Pulse questions and answers',
            'Couples quiz answers and Internal World entries',
            'Intimacy challenge progress',
            'Wellness Sessions log entries (appointments you attend elsewhere)',
            'Conversations with AI-powered features',
          ],
        },

        { kind: 'h', text: 'Self-provided profile context' },
        {
          kind: 'p',
          text: 'Siena\'s assessments can be tailored using optional context you choose to provide about yourself. Every one of these fields is optional and each offers a "prefer not to say" option. They include age range, gender identity, sexual orientation, relationship status, race or ethnicity, faith tradition, political lean, parental status, a free-text description of yourself in your own words, and a set of self-chosen personal symbols (a colour, element, creature, place and a word).',
        },
        {
          kind: 'p',
          text: 'Several of these are treated as sensitive or special-category information under privacy law. Where you provide them, they are sent to OpenAI as part of generating your assessment report. See "AI Features and OpenAI" and "Legal Bases for Processing" below.',
        },

        { kind: 'h', text: 'Voice and audio' },
        {
          kind: 'p',
          text: 'The Live Check-In feature records your conversation through your device microphone in short segments so it can be transcribed and analysed for tone. Recording only happens while a Live Check-In session is active and you have granted microphone permission.',
        },
        {
          kind: 'ul',
          items: [
            'Each recorded segment is uploaded to Siena\'s server and passed to OpenAI for transcription.',
            'Each segment is deleted from your device as soon as it has been transcribed.',
            'Siena does not store the audio or the resulting transcript on its servers.',
            'In the two-device (remote) version of Live Check-In, the transcript is displayed as captions on your screen and sent live to your linked partner\'s device.',
            'What is saved from a session is limited to your ratings, intensity values, and counts of detected tone shifts. The transcript is not saved.',
          ],
        },

        { kind: 'h', text: 'Health-adjacent information' },
        {
          kind: 'p',
          text: 'If you use the medication management feature on the Siena website, we collect the medication names, dosages, schedules and reminder settings you enter, and your phone number if you enable SMS reminders. Siena is not a medical record system and this information is not Protected Health Information under HIPAA. See "HIPAA" below.',
        },

        { kind: 'h', text: 'Payment information' },
        {
          kind: 'p',
          text: 'If you subscribe to a paid plan, payment is processed by the Apple App Store, Google Play, or Stripe. We receive a record of the transaction, such as plan, status and renewal date. We do not collect or store full payment card numbers, CVV codes, or bank account details on our servers.',
        },

        { kind: 'h', text: 'Information collected automatically' },
        {
          kind: 'ul',
          items: [
            'Device type, operating system and app version',
            'Approximate location derived from IP address, used for fraud prevention and regional content',
            'Crash logs and error reports',
            'Push notification token, so we can deliver notifications you have enabled',
            'Aggregated, de-identified usage analytics, such as which features are used most',
          ],
        },
        {
          kind: 'p',
          text: 'We do not use cross-site advertising trackers, social-media pixels, or device identifiers sold to ad networks.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      id: 'ai-features-openai',
      title: '2. AI Features and OpenAI',
      blocks: [
        {
          kind: 'p',
          text: 'Siena uses OpenAI, a third-party artificial intelligence provider, to power its AI features. When you use one of those features, the content that feature needs is transmitted over an encrypted connection to OpenAI, which processes it and returns a result. OpenAI is the only third-party AI provider Siena uses.',
        },

        { kind: 'h', text: 'What OpenAI is used for' },
        {
          kind: 'table',
          headers: ['Feature', 'What is sent to OpenAI', 'Purpose'],
          rows: [
            [
              'Siena chat / AI guide',
              'Your messages and the conversation history in that thread',
              'Generate a reply',
            ],
            [
              'Journal reflections',
              'The journal entry you ask to reflect on, including its title, mood, category and full text',
              'Generate a written reflection',
            ],
            [
              'Quiz, Pulse and Internal World reflections',
              'Your answers and, for couples features, your linked partner\'s answers and both partners\' first names or display names',
              'Generate a shared reflection',
            ],
            [
              'Assessment reports',
              'Your assessment answers and computed scores, your first name or display name, and any self-provided profile context you chose to give (see below)',
              'Generate your written report',
            ],
            [
              'Joint couples reports',
              'Both partners\' couples assessment scores, names, and stated life and relationship states',
              'Generate a joint report',
            ],
            [
              'Personal symbol images',
              'Your self-chosen personal symbols and assessment archetype',
              'Generate an abstract image',
            ],
            [
              'Commitment check-ins',
              'Your commitment title, your stated motivation, your goal summary, and recent messages in that thread',
              'Generate a scheduled check-in message',
            ],
            [
              'Live Check-In',
              'Recorded audio segments of your conversation, and the resulting transcript text',
              'Transcribe speech and classify tone',
            ],
            [
              'Safety and moderation',
              'Text you enter into AI features',
              'Automatically classify content for self-harm and other safety signals',
            ],
          ],
        },

        { kind: 'h', text: 'Sensitive and special-category information' },
        {
          kind: 'p',
          text: 'We want to be explicit about this rather than leave it implied. If you complete an assessment and have chosen to provide optional profile context, the information sent to OpenAI to generate your report can include your gender identity, sexual orientation, race or ethnicity, faith tradition, political lean, relationship and parental status, and anything you wrote in the free-text field about yourself. It also includes your assessment scores, which can cover adverse childhood experiences, sexuality and body image, substance use and dependency, mood and anxiety indicators, and, for couples assessments, indicators relating to coercive control and physical safety. Your first name or display name is sent alongside this so the report can address you by name.',
        },
        {
          kind: 'p',
          text: 'This means the information sent to OpenAI is not anonymous. Earlier versions of our materials described it as anonymised, which was inaccurate, and we have corrected that.',
        },
        {
          kind: 'p',
          text: 'You are never required to provide this optional context. Assessments work without it, and every field can be left blank or set to "prefer not to say".',
        },

        { kind: 'h', text: 'How long OpenAI keeps it, and what they may do with it' },
        {
          kind: 'p',
          text: 'Siena uses OpenAI under OpenAI\'s standard API terms. Under those terms:',
        },
        {
          kind: 'ul',
          items: [
            'Content sent through the API is not used to train OpenAI\'s models.',
            'Content sent through the API may be retained by OpenAI for up to 30 days for abuse and misuse monitoring, and is then deleted.',
            'Siena does not hold a Zero Data Retention agreement with OpenAI. We do not claim that content is deleted immediately or that it is never retained.',
          ],
        },
        {
          kind: 'p',
          text: 'OpenAI processes this information in the United States. See "International Data Transfers" below.',
        },

        { kind: 'h', text: 'Your control over AI features' },
        {
          kind: 'p',
          text: 'In the Siena mobile app, AI features are gated behind a separate consent step. You are asked to agree before any content is sent to OpenAI, you can decline, and you can withdraw that consent at any time from your profile settings. Declining does not prevent you from using the rest of the app; the AI features simply do not run.',
        },
        { kind: 'h', text: 'Automated safety checks' },
        {
          kind: 'p',
          text: 'Text you write in Siena chat, AI guide threads, and journal entries is automatically checked for signs of self-harm, so that crisis resources can be shown to you. This happens in two layers: a keyword check that runs entirely on your device and sends nothing anywhere, and, only if you have consented to AI features, an automated classification performed by OpenAI.',
        },
        {
          kind: 'p',
          text: 'If a check indicates possible risk, Siena displays a screen of crisis resources and records that the event occurred. That record contains only the feature it occurred in, which layer was triggered, and the category returned. It does not contain the text you wrote. Conversations with Siena chat additionally carry a flag noting that the conversation triggered a check.',
        },
        {
          kind: 'p',
          text: 'These checks are automated only. No person at Siena monitors your account or your content, no one is alerted, and emergency services are not contacted. The checks are not a clinical risk assessment, they can miss signs of risk, and they are not a substitute for emergency services.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      id: 'how-we-use',
      title: '3. How We Use Your Information',
      blocks: [
        { kind: 'p', text: 'We use the information we collect to:' },
        {
          kind: 'ul',
          items: [
            'Provide, operate, secure and maintain Siena',
            'Personalise your experience based on your inputs and preferences',
            'Generate AI-assisted reflections, reports, images and recommendations, as described above',
            'Transcribe voice input where you use a feature that requires it',
            'Enable partner-linked features between you and the one partner you have explicitly linked',
            'Send notifications and reminders you have enabled, including SMS reminders where you have provided a phone number and opted in',
            'Process subscriptions and prevent fraudulent transactions',
            'Automatically classify content for safety signals so crisis resources can be surfaced',
            'Investigate and prevent abuse, security incidents and violations of our Terms',
            'Comply with applicable law and respond to lawful requests',
            'Improve Siena through aggregated, de-identified analytics',
          ],
        },
        { kind: 'h', text: 'What we do not do' },
        {
          kind: 'ul',
          items: [
            'We do not sell your personal information.',
            'We do not share your wellness content with advertisers or data brokers.',
            'Your content is not used to train OpenAI\'s models, or any other third party\'s models.',
            'We do not access your linked partner\'s private, non-shared content, and they cannot access yours.',
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      id: 'subprocessors',
      title: '4. Service Providers We Share Information With',
      blocks: [
        {
          kind: 'p',
          text: 'We rely on the following providers to operate Siena. Each receives only what it needs for its function.',
        },
        {
          kind: 'table',
          headers: ['Provider', 'Function', 'What it receives'],
          rows: [
            [
              'OpenAI',
              'AI text generation, voice transcription, image generation, automated moderation',
              'The content described in the AI Features section, including names and self-provided profile context',
            ],
            [
              'Supabase',
              'Database, authentication, file storage, server functions',
              'All account and wellness content; this is Siena\'s primary backend',
            ],
            [
              'Apple App Store / Google Play',
              'Mobile subscription billing',
              'Purchase and subscription records',
            ],
            ['Stripe', 'Website subscription billing', 'Payment and subscription records'],
            [
              'RevenueCat',
              'Subscription state management',
              'Purchase receipts and a user identifier',
            ],
            [
              'Expo / EAS',
              'App builds, over-the-air updates, push token delivery',
              'Device and push token information',
            ],
            [
              'Apple APNs / Google FCM',
              'Push notification delivery',
              'Push tokens and notification content, which for scheduled check-ins may include AI-generated text referring to your goals',
            ],
            ['Sentry', 'Crash and error reporting', 'Crash stacks, device model, OS version'],
            [
              'Twilio',
              'SMS delivery for website medication reminders',
              'Your phone number and the reminder message content',
            ],
            [
              'Email provider (Resend)',
              'Transactional email',
              'Your email address and message content for account, security and billing email',
            ],
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      id: 'sharing',
      title: '5. Sharing and Disclosure',
      blocks: [
        { kind: 'p', text: 'We share information only in these cases:' },
        { kind: 'h', text: 'With your linked partner' },
        {
          kind: 'p',
          text: 'Content you create inside shared couples features is visible to the one partner you have explicitly linked with. This includes couples quizzes, Pulse, Internal World entries, intimacy challenges, shared bucket lists, shared activity tracker, shared values board and Love Radar. In the two-device Live Check-In, your live transcript is sent to your partner\'s device while the session runs.',
        },
        {
          kind: 'p',
          text: 'Solo content, such as your private journal and individual mood entries, is never shared with your partner.',
        },
        { kind: 'h', text: 'Other cases' },
        {
          kind: 'ul',
          items: [
            'Service providers: the providers listed above, only for the purposes described.',
            'Legal obligations: when required by law, subpoena or court order, or to protect the rights, property or safety of Siena, our users, or the public.',
            'Business transfers: if Siena or a portion of its assets is acquired, merged or sold, information may transfer to the successor entity. We will provide notice and any continuing protections.',
            'With your consent: in any other case, only with your explicit, informed consent.',
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      id: 'legal-bases',
      title: '6. Legal Bases for Processing (EEA / UK)',
      blocks: [
        {
          kind: 'p',
          text: 'If you are in the European Economic Area or the United Kingdom, we process your information on the following bases:',
        },
        {
          kind: 'ul',
          items: [
            'Performance of a contract: to provide the Siena service you have signed up for, including your account, your content and your subscription.',
            'Consent: for AI features that send your content to OpenAI, for optional profile context you choose to provide, for marketing email, and for optional notifications. You may withdraw consent at any time.',
            'Explicit consent for special-category data: where you provide information revealing gender identity, sexual orientation, racial or ethnic origin, religious belief, political opinion, or information concerning health or sex life, and where that information is transmitted to OpenAI to generate your report.',
            'Legitimate interests: to secure the service, prevent fraud and abuse, and improve Siena using aggregated, de-identified data, balanced against your rights and freedoms.',
            'Legal obligation: to comply with tax, accounting and other legal requirements.',
          ],
        },
        {
          kind: 'p',
          text: 'You can withdraw consent for AI features at any time in the app without losing access to the rest of Siena. Withdrawing consent does not affect processing that already took place while consent was in force.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      id: 'security',
      title: '7. Data Security',
      blocks: [
        {
          kind: 'p',
          text: 'We use reasonable administrative, technical and physical safeguards to protect your information, including:',
        },
        {
          kind: 'ul',
          items: [
            'Encryption in transit (TLS 1.2 or higher)',
            'Encryption at rest for stored data',
            'Row-level security policies restricting each user\'s data to that user, and to their linked partner where a feature is explicitly shared',
            'Secure authentication tokens with refresh',
            'Limited internal access on a need-to-know basis',
            'Monitoring for suspicious activity and regular review of security practices and dependencies',
          ],
        },
        {
          kind: 'p',
          text: 'No system is perfectly secure and we cannot guarantee absolute security.',
        },
        { kind: 'h', text: 'Breach notification' },
        {
          kind: 'p',
          text: 'If we become aware of a personal data breach affecting you, we will notify you and the relevant supervisory authority as required by applicable law, and without undue delay.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      id: 'retention',
      title: '8. Data Retention and Deletion',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Active accounts: we retain your information for as long as your account is open.',
            'Account deletion: when you delete your account, we remove your personal information and wellness content from our active systems within 30 days. Some records may persist briefly in encrypted backups, for up to 90 days, before being overwritten.',
            'Voice recordings: audio segments are deleted from your device as soon as they are transcribed and are not stored on our servers at any point.',
            'Content sent to OpenAI: retained by OpenAI for up to 30 days under its standard API terms, then deleted, as described above.',
            'Legal holds: we may retain certain records longer where required by law, for example payment records for tax purposes.',
            'De-identified analytics: aggregated data that cannot be linked back to you may be retained indefinitely.',
          ],
        },
        {
          kind: 'p',
          text: 'To delete your account, use the account-deletion option in the app or contact support@hellosiena.com.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      id: 'your-rights',
      title: '9. Your Rights and Choices',
      blocks: [
        { kind: 'h', text: 'Everyone' },
        {
          kind: 'ul',
          items: [
            'Access the personal information we hold about you',
            'Request correction of inaccurate information',
            'Request deletion of your account and data',
            'Export your data in a portable format',
            'Opt out of marketing communications',
            'Withdraw consent for AI features at any time',
          ],
        },
        { kind: 'h', text: 'EEA / UK (GDPR)' },
        {
          kind: 'ul',
          items: [
            'Restrict or object to specific processing',
            'Withdraw consent at any time, without affecting prior processing',
            'Lodge a complaint with your data protection authority',
          ],
        },
        { kind: 'h', text: 'California (CCPA / CPRA)' },
        {
          kind: 'ul',
          items: [
            'Know what categories of personal information are collected, the purposes, and the categories of third parties they are disclosed to',
            'Request deletion and correction',
            'Opt out of the sale or sharing of personal information. Siena does not sell personal information and does not share it for cross-context behavioural advertising.',
            'Limit the use and disclosure of sensitive personal information. Siena uses sensitive personal information only to provide the features you request, including generating your assessment report, and not to infer characteristics about you for any other purpose.',
            'Non-discrimination for exercising your rights',
          ],
        },
        { kind: 'h', text: 'Other US states' },
        {
          kind: 'p',
          text: 'Residents of Virginia, Colorado, Connecticut, Utah, Texas and other states with comprehensive privacy laws have similar rights of access, correction, deletion and opt-out.',
        },
        {
          kind: 'p',
          text: 'To exercise any of these rights, email support@hellosiena.com from the email address on your Siena account. We verify identity before fulfilling sensitive requests and respond within the timeframes required by applicable law.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      id: 'international',
      title: '10. International Data Transfers',
      blocks: [
        {
          kind: 'p',
          text: 'Siena is operated from the United States. If you use Siena from outside the United States, your information will be transferred to, stored and processed in the United States, and in other countries where our service providers operate. This includes the content sent to OpenAI.',
        },
        {
          kind: 'p',
          text: 'For users in the European Economic Area, the United Kingdom or Switzerland, where required we rely on Standard Contractual Clauses approved by the European Commission and equivalent safeguards.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      id: 'children',
      title: '11. Children\'s Privacy',
      blocks: [
        {
          kind: 'p',
          text: 'Siena is intended for adults aged 18 and older. We do not knowingly collect personal information from anyone under 18. If you believe a minor has provided information to Siena, contact support@hellosiena.com and we will delete the account and associated data promptly. We do not target advertising to anyone.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      id: 'notifications',
      title: '12. Notifications and Communications',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Push notifications: for partner events, reminders you set, and important account messages. Scheduled AI check-in messages are generated by OpenAI and delivered as push notifications, which means their text passes through Apple or Google push infrastructure. You can disable push notifications at any time in your device settings or in Siena.',
            'SMS: only if you provide a phone number and enable SMS reminders, for example for medication reminders on the website. Delivered via Twilio. You can disable these at any time.',
            'Email: account, security and billing email cannot be disabled while your account is active. We do not send marketing email without your separate, explicit consent.',
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      id: 'hipaa',
      title: '13. HIPAA',
      blocks: [
        {
          kind: 'p',
          text: 'Siena is not a HIPAA-covered entity and is not a business associate of one. Information you enter into Siena, including medication entries and Wellness Sessions logs, is not Protected Health Information under HIPAA and Siena is not a medical record system, electronic health record, or patient portal. Do not use Siena to store or transmit information you intend to be treated as PHI.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      id: 'cookies',
      title: '14. Cookies and Tracking',
      blocks: [
        {
          kind: 'p',
          text: 'The Siena mobile apps do not use cookies. The Siena website uses only essential cookies needed to operate the site, such as authentication and security. We do not embed third-party advertising trackers, social-media pixels, or cross-site behavioural advertising tools on either surface, and we will request consent for any non-essential cookies where required by law.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      id: 'changes',
      title: '15. Changes to This Policy',
      blocks: [
        {
          kind: 'p',
          text: 'We may update this Privacy Policy to reflect changes in our practices, technology or legal requirements. When we make material changes we will update the "Last updated" date at the top of this policy and, where appropriate, provide additional notice such as an in-app alert or email. We encourage you to review it periodically.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────
    {
      id: 'contact',
      title: '16. Contact Us',
      blocks: [
        {
          kind: 'p',
          text: 'Questions or requests about this Privacy Policy or your personal information:',
        },
        {
          kind: 'ul',
          items: [
            'Email: support@hellosiena.com',
            'Mail: Your Life Consulting, LLC, Miami, FL, United States',
          ],
        },
        {
          kind: 'p',
          text: 'We aim to respond within 30 days, or sooner where required by applicable law.',
        },
      ],
    },
  ],

  closing:
    'By using Siena, you acknowledge that you have read and understood this Privacy Policy. Siena is a wellness companion and is not a substitute for therapy, diagnosis or medical treatment. If you are in crisis, contact 988 (US), 911, or your local emergency services.',
};
