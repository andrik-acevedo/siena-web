// CANONICAL Siena Terms of Service.
//
// Substantive sections were ported from the mobile app's Terms of Service,
// which was materially more complete than the website's, and then corrected
// for accuracy. In particular the AI section no longer claims a bespoke
// agreement with OpenAI: Siena is on OpenAI's standard API terms.
//
// Sections carrying `counselReview` are legal positions, not engineering
// descriptions, and must be reviewed before this document is relied on.
// The arbitration clause and liability cap in particular were ported from
// the mobile document and have not themselves been reviewed.

import type { LegalDocument } from './types';

export const TERMS_OF_SERVICE: LegalDocument = {
  title: 'Terms of Service',
  lastUpdated: 'July 30, 2026',
  effective: 'Not yet in force — pending legal review',
  draft: true,

  intro: [
    {
      kind: 'p',
      text: 'These Terms of Service (the "Terms") form a binding agreement between you and Your Life Consulting, LLC ("Siena," "we," "us," or "our") governing your access to and use of the Siena mobile applications, website, and related services (collectively, the "Service").',
    },
    {
      kind: 'p',
      text: 'By creating an account, downloading the app, or otherwise using the Service, you confirm that you are at least 18 years old and that you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not use the Service.',
    },
  ],

  sections: [
    {
      id: 'eligibility',
      title: '1. Eligibility',
      blocks: [
        { kind: 'p', text: 'To use the Service you must:' },
        {
          kind: 'ul',
          items: [
            'Be at least 18 years old',
            'Be capable of entering into a legally binding contract',
            'Not be barred from using the Service under the laws of your jurisdiction',
            'Not be on any U.S. Treasury Department list of Specially Designated Nationals or other applicable sanctions list',
          ],
        },
        {
          kind: 'p',
          text: 'Siena is intended for personal, non-commercial use.',
        },
      ],
    },

    {
      id: 'accounts',
      title: '2. Account Registration and Security',
      blocks: [
        {
          kind: 'p',
          text: 'You may need to register an account to access certain features. You agree to provide accurate information, keep it current, keep your credentials confidential, notify us immediately of unauthorised access, and take responsibility for activity under your account.',
        },
        {
          kind: 'p',
          text: 'You may have only one personal Siena account. You may not share credentials or transfer your account. We may suspend or terminate accounts that violate these Terms or present a security or fraud risk.',
        },
      ],
    },

    {
      id: 'subscriptions',
      title: '3. Subscriptions and Billing',
      counselReview:
        'Confirm the auto-renewal and refund terms comply with Apple App Store and Google Play requirements, and with EU/UK consumer withdrawal rights and applicable US state auto-renewal statutes.',
      blocks: [
        { kind: 'h', text: 'Purchases through the Apple App Store or Google Play' },
        {
          kind: 'ul',
          items: [
            'Payment is charged to your Apple ID or Google account at confirmation of purchase.',
            'Subscriptions renew automatically at the then-current rate unless cancelled at least 24 hours before the end of the current period.',
            'Your account is charged for renewal within 24 hours before the end of the current period.',
            'Manage and cancel subscriptions in your Apple ID or Google Play settings. Uninstalling the app does not cancel a subscription.',
            'Any unused portion of a free trial is forfeited when you purchase a subscription.',
            'Refunds, where available, are handled by Apple or Google under their policies. Siena cannot issue refunds for purchases made through the App Store or Google Play.',
          ],
        },
        { kind: 'h', text: 'Purchases through Stripe or another web processor' },
        {
          kind: 'ul',
          items: [
            'Subscriptions renew automatically unless cancelled before the renewal date.',
            'You authorise recurring charges to your selected payment method.',
            'You may cancel at any time in your account settings; cancellation takes effect at the end of the current paid period.',
            'We do not issue refunds for partial periods except where required by applicable law. Nothing in these Terms limits any statutory refund, cancellation or withdrawal right you have under the consumer law of your country of residence.',
          ],
        },
        {
          kind: 'p',
          text: 'We may change subscription pricing on notice. Price changes take effect at your next renewal after the notice period.',
        },
      ],
    },

    {
      id: 'license',
      title: '4. Licence to Use Siena',
      blocks: [
        {
          kind: 'p',
          text: 'Subject to your compliance with these Terms, Siena grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable licence to download, install and use the Service on devices you own or control, solely for personal, non-commercial use.',
        },
        { kind: 'p', text: 'This licence does not grant you the right to:' },
        {
          kind: 'ul',
          items: [
            'Modify, reverse-engineer, decompile or disassemble the app',
            'Distribute, sublicense, sell or rent the app',
            'Use the Service to build a competing product',
            'Remove proprietary notices',
            'Use automated means such as bots or scrapers to access the Service',
          ],
        },
      ],
    },

    {
      id: 'your-content',
      title: '5. Your Content',
      counselReview:
        'PRIORITY REVIEW. This licence grant is what authorises Siena to transmit user content to OpenAI. The prior website Terms contained no content licence at all, so there was no contractual basis for that transmission. Confirm the scope is sufficient for the actual data flows described in the Privacy Policy and no broader than necessary.',
      blocks: [
        {
          kind: 'p',
          text: 'You retain ownership of the content you create within Siena, including journal entries, mood logs, reflections, goals, commitments, quiz and assessment answers, voice input, and other wellness inputs ("Your Content").',
        },
        {
          kind: 'p',
          text: 'By submitting Your Content, you grant Siena a worldwide, non-exclusive, royalty-free licence to host, store, process, transmit, display and analyse Your Content solely for the purpose of providing and improving the Service to you, and to your linked partner where you have used a feature that is expressly shared with them.',
        },
        {
          kind: 'p',
          text: 'This licence expressly includes transmitting Your Content to our third-party AI provider, OpenAI, where you use a feature that requires it, as described in our Privacy Policy. In the mobile app this is additionally gated behind your separate consent to AI features.',
        },
        { kind: 'p', text: 'You represent and warrant that:' },
        {
          kind: 'ul',
          items: [
            'You own or have the rights to all content you submit',
            'Your Content does not violate any law or third-party right',
            'Your Content does not contain malicious code, harassment or illegal material',
            'Where you record another person\'s voice using Live Check-In, you have their knowledge and agreement to do so',
          ],
        },
        {
          kind: 'p',
          text: 'We do not sell Your Content. Your Content is not used to train OpenAI\'s models or any other third party\'s models. We do not share your solo content with your linked partner.',
        },
      ],
    },

    {
      id: 'ai-content',
      title: '6. AI Features and AI-Generated Content',
      counselReview:
        'PRIORITY REVIEW. Supports the App Store 5.1.1(i) response. Confirm the disclaimer is adequate given Siena operates in a mental-health-adjacent context, and that the retention statement matches OpenAI\'s current standard API terms.',
      blocks: [
        {
          kind: 'p',
          text: 'Siena uses a third-party artificial intelligence provider, OpenAI, to generate reflections, reports, summaries, discussion prompts and images, to transcribe voice input, and to run automated safety classification. Our Privacy Policy sets out exactly what is sent to OpenAI and why.',
        },
        { kind: 'p', text: 'You understand and agree that:' },
        {
          kind: 'ul',
          items: [
            'AI outputs are automatically generated and may be inaccurate, incomplete, biased, fabricated or out of date.',
            'AI features are for informational and educational purposes only. They do not constitute medical, psychological, legal, financial or other professional advice.',
            'AI does not assess clinical risk, does not detect emergencies, and is not monitored by a human.',
            'Siena reviews and refines the prompts behind AI features but does not separately verify each output.',
            'You should use your own judgement when reading AI-generated content and consult qualified professionals for important decisions.',
            'Siena is not responsible for actions you take based on AI-generated content.',
          ],
        },
        {
          kind: 'p',
          text: 'Siena uses OpenAI under OpenAI\'s standard API terms. Under those terms, content sent through the API is not used to train OpenAI\'s models, and may be retained by OpenAI for up to 30 days for abuse monitoring before deletion. Siena does not hold a Zero Data Retention agreement with OpenAI.',
        },
      ],
    },

    {
      id: 'acceptable-use',
      title: '7. Acceptable Use',
      blocks: [
        { kind: 'p', text: 'You agree not to use the Service to:' },
        {
          kind: 'ul',
          items: [
            'Violate any applicable law or regulation',
            'Impersonate another person or misrepresent your affiliation',
            'Upload or transmit content that is unlawful, harmful, threatening, harassing, defamatory, obscene or otherwise objectionable',
            'Infringe the intellectual property, privacy or publicity rights of others',
            'Record another person without their knowledge and agreement',
            'Distribute viruses, malware or other harmful code',
            'Attempt to gain unauthorised access to any portion of the Service',
            'Interfere with or disrupt the Service or other users\' experience',
            'Harass, abuse or harm another person, including a linked partner',
            'Scrape, harvest or collect information about other users',
          ],
        },
        {
          kind: 'p',
          text: 'Violation may result in immediate suspension or termination of your account.',
        },
      ],
    },

    {
      id: 'couples',
      title: '8. Partner-Linked Features',
      counselReview:
        'Consider whether additional protective language is warranted given the coercive-control and intimate-partner-violence risk surface of shared couples features and live transcript sharing.',
      blocks: [
        {
          kind: 'p',
          text: 'Siena includes optional features for two consenting adults who voluntarily link accounts. Content you create in a shared feature is visible to your linked partner, and in the two-device Live Check-In your live transcript is sent to their device while a session runs.',
        },
        {
          kind: 'p',
          text: 'Partner features are not couples therapy. Siena cannot detect, assess or address intimate partner violence, coercive control or abuse. Use of these features must be voluntary and free from pressure. If you are experiencing abuse, contact the resources listed in the Crisis Resources section below.',
        },
      ],
    },

    {
      id: 'ip',
      title: '9. Intellectual Property',
      blocks: [
        {
          kind: 'p',
          text: 'Siena, its name and logo, the user interface, content, features, audio, illustrations and all related intellectual property are owned by Your Life Consulting, LLC or its licensors and are protected by copyright, trademark and other laws. Except for Your Content and the limited licence granted to you above, no rights are granted to you under these Terms.',
        },
      ],
    },

    {
      id: 'third-party',
      title: '10. Third-Party Services',
      blocks: [
        {
          kind: 'p',
          text: 'The Service relies on third-party providers, including OpenAI, Supabase, Apple, Google, Stripe, RevenueCat, Expo, Sentry, Twilio and our email provider. Your use of those providers is governed by their own terms and privacy policies in addition to ours. Siena is not responsible for the practices of third parties and does not endorse third-party content.',
        },
      ],
    },

    {
      id: 'warranties',
      title: '11. Disclaimer of Warranties',
      counselReview:
        'Confirm the disclaimer and its capitalisation meet conspicuousness requirements in the relevant jurisdictions, and that the consumer-law carve-out is adequate for EU/UK users.',
      blocks: [
        {
          kind: 'p',
          text: 'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, SIENA AND ITS AFFILIATES, OFFICERS, EMPLOYEES AND LICENSORS DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.',
        },
        {
          kind: 'p',
          text: 'We do not warrant that the Service will be uninterrupted, secure or error-free. Siena is a wellness companion tool, not therapy or medical care. It is not designed to diagnose, treat, cure or prevent any disease or condition. Always consult qualified, licensed providers.',
        },
        {
          kind: 'p',
          text: 'Nothing in these Terms excludes or limits any warranty or right that cannot be excluded or limited under the law of your country of residence.',
        },
      ],
    },

    {
      id: 'crisis',
      title: '12. Crisis Resources',
      blocks: [
        {
          kind: 'p',
          text: 'SIENA IS NOT A CRISIS SERVICE and is not intended for use during a mental health emergency. Notifications, AI features and partner features are not monitored in real time by a human and cannot summon help.',
        },
        {
          kind: 'p',
          text: 'If you are in crisis, experiencing thoughts of self-harm or suicide, or in immediate danger, contact emergency services right away.',
        },
        { kind: 'h', text: 'United States' },
        {
          kind: 'ul',
          items: [
            '988 — Suicide & Crisis Lifeline (call or text)',
            '911 — Emergencies',
            'Text HOME to 741741 — Crisis Text Line',
            '1-800-662-4357 — SAMHSA helpline (substance use and mental health)',
            '1-800-799-7233 — National Domestic Violence Hotline',
            '1-800-422-4453 — Childhelp National Child Abuse Hotline',
          ],
        },
        { kind: 'h', text: 'International' },
        {
          kind: 'ul',
          items: [
            'United Kingdom: 111 (NHS); Samaritans 116 123',
            'Australia: 000; Lifeline 13 11 14',
            'Canada: 988',
            'Find a helpline by country: findahelpline.com',
          ],
        },
      ],
    },

    {
      id: 'liability',
      title: '13. Limitation of Liability',
      counselReview:
        'PRIORITY REVIEW. Ported from the mobile Terms and not independently reviewed. Confirm the cap is enforceable in Florida and in the consumer jurisdictions where Siena operates, and that it is appropriate given the mental-health-adjacent context.',
      blocks: [
        { kind: 'p', text: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW:' },
        {
          kind: 'ul',
          items: [
            'In no event shall Siena, Your Life Consulting, LLC, its affiliates, officers, directors, employees, agents or licensors be liable for any indirect, incidental, special, consequential, exemplary or punitive damages, including loss of profits, data, goodwill or other intangible losses, arising from or related to your use of the Service.',
            'Siena\'s total aggregate liability for any claim arising from or related to the Service shall not exceed the greater of (a) the amounts you paid to Siena in the 12 months preceding the claim, or (b) one hundred U.S. dollars ($100).',
            'These limitations apply regardless of the theory of liability and even if Siena has been advised of the possibility of damages.',
          ],
        },
        {
          kind: 'p',
          text: 'Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above may not apply to you. Nothing here limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited.',
        },
      ],
    },

    {
      id: 'indemnification',
      title: '14. Indemnification',
      blocks: [
        {
          kind: 'p',
          text: 'You agree to defend, indemnify and hold harmless Siena, Your Life Consulting, LLC, and its affiliates, officers, directors, employees and agents from any claims, liabilities, damages, losses, costs and expenses, including reasonable attorney fees, arising from your use or misuse of the Service, your violation of these Terms or our Privacy Policy, your violation of any law or third-party right, or Your Content.',
        },
      ],
    },

    {
      id: 'modifications',
      title: '15. Modifications to the Service and to These Terms',
      blocks: [
        {
          kind: 'p',
          text: 'We may add, modify, suspend or discontinue features, content or pricing at any time. Where a change materially reduces functionality you have paid for, we will make reasonable efforts to provide notice or a prorated refund as required by applicable law.',
        },
        {
          kind: 'p',
          text: 'We may revise these Terms. Material changes will be posted with an updated date and, where appropriate, additional notice. Your continued use after a revision takes effect constitutes acceptance.',
        },
      ],
    },

    {
      id: 'hipaa',
      title: '16. HIPAA and Health Privacy',
      blocks: [
        {
          kind: 'p',
          text: 'Siena is not a HIPAA-covered entity. Information you enter into Siena is not Protected Health Information under HIPAA, and Siena is not a medical record system, electronic health record or patient portal. Do not use Siena to store or transmit information you intend to be treated as PHI. If you are a licensed clinician, do not use Siena as a clinical tool with patients without an appropriate independent agreement.',
        },
      ],
    },

    {
      id: 'termination',
      title: '17. Termination',
      blocks: [
        {
          kind: 'p',
          text: 'You may delete your account at any time using the account-deletion option in the app or by emailing support@hellosiena.com. We may suspend or terminate your access at any time if we believe you have violated these Terms or applicable law, or if your account presents a security or fraud risk.',
        },
        {
          kind: 'p',
          text: 'Upon termination your right to use the Service ends immediately. Provisions that by their nature should survive termination, including ownership, disclaimers, limitations of liability, indemnification and dispute resolution, will survive.',
        },
      ],
    },

    {
      id: 'arbitration',
      title: '18. Dispute Resolution and Arbitration (US Users)',
      counselReview:
        'PRIORITY REVIEW. Ported verbatim in substance from the mobile Terms and not independently reviewed. Confirm enforceability, the adequacy of the 30-day opt-out mechanism, whether the class waiver survives in the relevant jurisdictions, and whether the mass-arbitration risk warrants a batching provision. Note that until now the website and the app bound users to materially different dispute terms; this section aligns them.',
      blocks: [
        {
          kind: 'p',
          text: 'PLEASE READ THIS SECTION CAREFULLY. IT REQUIRES YOU TO ARBITRATE DISPUTES AND LIMITS THE MANNER IN WHICH YOU CAN SEEK RELIEF.',
        },
        {
          kind: 'p',
          text: 'For users located in the United States, except where prohibited by law:',
        },
        {
          kind: 'ul',
          items: [
            'Informal resolution: before initiating arbitration, the parties will attempt to resolve any dispute informally by written notice to support@hellosiena.com describing the dispute, with at least 30 days for the other party to respond.',
            'Binding arbitration: any dispute that cannot be resolved informally shall be resolved by binding arbitration administered by the American Arbitration Association under its Consumer Arbitration Rules, in Miami-Dade County, Florida, or by video conference at the consumer\'s option.',
            'Class action waiver: you and Siena agree to bring claims only in an individual capacity and not as a plaintiff or class member in any purported class, collective or representative action.',
            'Exceptions: either party may bring an individual action in small-claims court, and either party may seek injunctive or equitable relief in court for intellectual property infringement.',
            'Opt-out: you may opt out of this arbitration agreement by emailing support@hellosiena.com within 30 days of first agreeing to these Terms, with the subject line "Arbitration Opt-Out."',
          ],
        },
      ],
    },

    {
      id: 'governing-law',
      title: '19. Governing Law and Venue',
      counselReview:
        'Confirm the Florida choice of law and Miami-Dade venue hold up against mandatory consumer-protection rules in the EU, UK and other jurisdictions where Siena is distributed.',
      blocks: [
        {
          kind: 'p',
          text: 'These Terms are governed by the laws of the State of Florida, without regard to conflict-of-laws principles, and applicable U.S. federal law. Except for matters subject to arbitration, any dispute shall be brought exclusively in the state or federal courts in Miami-Dade County, Florida, and you consent to their jurisdiction.',
        },
      ],
    },

    {
      id: 'international-users',
      title: '20. International Users',
      blocks: [
        {
          kind: 'p',
          text: 'Siena is operated from the United States. If you access the Service from outside the United States you are responsible for compliance with local law and you consent to the transfer of your information to the United States as described in our Privacy Policy. Mandatory consumer-protection laws of your country of residence apply where required and override conflicting provisions of these Terms to the extent required.',
        },
      ],
    },

    {
      id: 'apple',
      title: '21. Apple App Store Additional Terms',
      counselReview:
        'Confirm this satisfies the current Apple Developer Program Licence Agreement Schedule 1 requirements for end-user licence terms.',
      blocks: [
        {
          kind: 'p',
          text: 'If you downloaded Siena from the Apple App Store, the following additional terms apply:',
        },
        {
          kind: 'ul',
          items: [
            'These Terms are between you and Siena, not Apple. Apple has no obligation to provide maintenance or support for the Service.',
            'In the event of any failure to conform to any applicable warranty, you may notify Apple, which will refund the purchase price, if any. Apple has no further warranty obligation.',
            'Apple is not responsible for addressing any claims by you or any third party relating to the Service.',
            'Apple is not responsible for the investigation, defence, settlement or discharge of any third-party intellectual property infringement claim.',
            'Apple and its subsidiaries are third-party beneficiaries of these Terms and may enforce them against you.',
          ],
        },
      ],
    },

    {
      id: 'general',
      title: '22. Severability, Entire Agreement and Assignment',
      blocks: [
        {
          kind: 'p',
          text: 'If any provision of these Terms is found unenforceable, the remaining provisions remain in full force. Failure to enforce a provision is not a waiver of it.',
        },
        {
          kind: 'p',
          text: 'These Terms, together with the Privacy Policy and any terms expressly incorporated by reference, constitute the entire agreement between you and Siena regarding the Service and supersede all prior agreements on that subject.',
        },
        {
          kind: 'p',
          text: 'You may not assign these Terms without our prior written consent. We may assign them in connection with a merger, acquisition or sale of assets.',
        },
      ],
    },

    {
      id: 'contact',
      title: '23. Contact Us',
      blocks: [
        {
          kind: 'p',
          text: 'Questions about these Terms: support@hellosiena.com, or Your Life Consulting, LLC, Miami, FL, United States.',
        },
      ],
    },
  ],

  closing:
    'By using Siena, you acknowledge that you have read and understood these Terms of Service. Siena is a wellness companion and is not a substitute for therapy or medical treatment.',
};
