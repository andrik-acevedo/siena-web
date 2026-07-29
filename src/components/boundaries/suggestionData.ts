// -----------------------------------------------------------------------------
// suggestionData.ts
// Centralized options + unique, circle-aware situation suggestions
// -----------------------------------------------------------------------------

export type BoundaryArea =
  | "Time"
  | "Physical"
  | "Conversational"
  | "Relationship"
  | "Personal"
  | "Financial"
  | "Emotional"
  | "Expectation"
  | "Content"
  | "Digital";

export type RelationshipCircle =
  | "Self"
  | "Partner"
  | "Family"
  | "Friends"
  | "Coworkers"
  | "Acquaintances"
  | "Strangers";

export const BOUNDARY_AREAS: BoundaryArea[] = [
  "Time",
  "Physical",
  "Conversational",
  "Relationship",
  "Personal",
  "Financial",
  "Emotional",
  "Expectation",
  "Content",
  "Digital",
];

export const RELATIONSHIP_CIRCLES: RelationshipCircle[] = [
  "Self",
  "Partner",
  "Family",
  "Friends",
  "Coworkers",
  "Acquaintances",
  "Strangers",
];

// Feelings palette (12) – two full rows, used by UI and for live preview
export const FEELINGS: { key: string; label: string; from: string; to: string }[] = [
  { key: "anxious",        label: "Anxious",        from: "#E8A2A2", to: "#8A5661" },
  { key: "disrespected",   label: "Disrespected",   from: "#2B6AA6", to: "#164C84" },
  { key: "overwhelmed",    label: "Overwhelmed",    from: "#F0A22B", to: "#A56B19" },
  { key: "pressured",      label: "Pressured",      from: "#B9E452", to: "#5C8A1F" },
  { key: "frustrated",     label: "Frustrated",     from: "#F17B7B", to: "#C23B3B" },
  { key: "unheard",        label: "Unheard",        from: "#1B1B5E", to: "#6440AD" },
  { key: "unsafe",         label: "Unsafe",         from: "#176C88", to: "#184C63" },
  { key: "uncomfortable",  label: "Uncomfortable",  from: "#E37E8D", to: "#A54456" },
  { key: "angry",          label: "Angry",          from: "#0E7A7B", to: "#155E5F" },
  { key: "resentful",      label: "Resentful",      from: "#6E4797", to: "#4C2F6A" },
  { key: "exhausted",      label: "Exhausted",      from: "#E5A3A1", to: "#915A59" },
  { key: "violated",       label: "Violated",       from: "#2B68A4", to: "#1C4C7A" },
];

// -----------------------------------------------------------------------------
// Circle-aware suggestions
// Each area contains 7 distinct arrays (Self + 6 social circles), 5 items each.
// Language is tuned so the same area reads differently per circle.
// -----------------------------------------------------------------------------

type SuggestionBank = Record<BoundaryArea, Record<RelationshipCircle, string[]>>;

export const SUGGESTIONS: SuggestionBank = {
  Time: {
    Self: [
      "I booked back-to-back plans with no recovery time.",
      "I scrolled late and slept poorly.",
      "I skipped my workout to handle non-urgent things.",
      "I said yes to plans while I was already depleted.",
      "I worked through lunch and felt drained afterward.",
    ],
    Partner: [
      "We didn’t align on together vs. solo time this week.",
      "Texts came through constantly during my focus time.",
      "Evening plans shifted last-minute without checking in.",
      "Relationship talk kept happening during my work hours.",
      "Phone-free dinner time didn’t happen as agreed.",
    ],
    Family: [
      "Family calls came in repeatedly during work hours.",
      "A visit ran well past the time we agreed to end.",
      "I felt pressured to attend a last-minute family plan.",
      "Caretaking requests arrived without advance notice.",
      "Drop-ins happened without checking my availability.",
    ],
    Friends: [
      "Group chat expected immediate replies throughout the day.",
      "I felt pulled to stay out later than I had energy for.",
      "Plans moved last-minute in a way that derailed my day.",
      "I said yes to multiple hangs without buffer time.",
      "A catch-up overlapped something I’d already scheduled.",
    ],
    Coworkers: [
      "Non-urgent messages arrived late at night.",
      "Meetings were booked over my deep-work block.",
      "A deadline shifted without confirming my capacity.",
      "Back-to-back meetings left no time to reset.",
      "I was pinged repeatedly during my off hours.",
    ],
    Acquaintances: [
      "Networking asks came with immediate-response expectations.",
      "Coffee invites were set without checking my schedule.",
      "Follow-ups arrived daily despite my timeline.",
      "A social request landed the same day with pressure to attend.",
      "I was asked to ‘hop on a call now’ without notice.",
    ],
    Strangers: [
      "Cold calls came after 9pm.",
      "A service provider arrived outside the time window.",
      "Sales outreach kept pinging after I declined.",
      "A delivery attempted early without confirmation.",
      "Street solicitors pressed for time while I was rushing.",
    ],
  },

  Physical: {
    Self: [
      "I ignored signals to rest and kept pushing.",
      "Noise/sensory input felt overwhelming but I said nothing.",
      "I over-exerted in a workout despite discomfort.",
      "I didn’t protect alone time I need to decompress.",
      "I wore something that didn’t feel like me to please others.",
    ],
    Partner: [
      "Physical affection started without checking in.",
      "I needed personal space after conflict but it wasn’t respected.",
      "Closeness during sleep felt uncomfortable for me.",
      "My body changes/preferences weren’t acknowledged.",
      "Consent was assumed rather than confirmed.",
    ],
    Family: [
      "Relatives hugged me without asking when I wasn’t comfortable.",
      "Family entered my room/space without knocking.",
      "Comments about my body/clothes felt intrusive.",
      "I was touched for attention while I was busy.",
      "Seating/proximity felt too close and I froze instead of speaking.",
    ],
    Friends: [
      "A friend greeted with a hug when I preferred a wave.",
      "Borrowing personal items was assumed.",
      "I felt crowded during an intense conversation.",
      "There were jokes about my appearance or style.",
      "People sat very close while I needed more space.",
    ],
    Coworkers: [
      "Shoulder pats or casual touch happened at work.",
      "Desk space felt encroached on.",
      "A handshake lingered after I pulled back.",
      "People stood too close during a discussion.",
      "Coworkers reached across me without warning.",
    ],
    Acquaintances: [
      "A cheek-kiss greeting was expected and I wasn’t comfortable.",
      "People moved in very close to talk at an event.",
      "Someone tried to guide me physically in a crowd.",
      "A near-stranger picked up my belongings.",
      "I was pulled into photos without asking.",
    ],
    Strangers: [
      "A stranger brushed against me repeatedly in a line.",
      "Unwanted touch occurred in a crowded space.",
      "A medical tech proceeded without clear consent.",
      "Someone stood within my intimate space on transit.",
      "A street interaction ignored my physical boundaries.",
    ],
  },

  Conversational: {
    Self: [
      "I spiraled on a topic and stayed stuck there.",
      "I consumed debates online that spiked my stress.",
      "I over-shared when I actually needed privacy.",
      "I kept replaying an argument in my head.",
      "I stayed in a comment thread that felt toxic.",
    ],
    Partner: [
      "We discussed a heavy topic while exhausted.",
      "Advice was given without checking if I wanted it.",
      "We circled the same disagreement without a break.",
      "Tone felt sharp and I shut down.",
      "Private topics were raised in front of others.",
    ],
    Family: [
      "Politics came up even after I asked to avoid it.",
      "Gossip about relatives kept pulling me in.",
      "My life choices were questioned repeatedly.",
      "Long, charged talks happened late at night.",
      "Personal questions came rapid-fire without consent.",
    ],
    Friends: [
      "Group chat veered into toxic venting.",
      "I was pressed to share more than I wanted.",
      "Advice was offered when I needed listening.",
      "Debates got polarizing and I felt unsafe to speak.",
      "I was teased about a sensitive topic.",
    ],
    Coworkers: [
      "Work chat slid into rumors.",
      "Hot-button topics were raised in meetings.",
      "I was asked for personal details I didn’t want to share.",
      "Advice was delivered as critique, not help.",
      "A debate kept going after I opted out.",
    ],
    Acquaintances: [
      "Early questions felt too personal for our relationship.",
      "A social conversation turned confrontational.",
      "I was pressed for opinions I didn’t want to share.",
      "Someone pushed advice without context.",
      "I was pulled into private matters between others.",
    ],
    Strangers: [
      "A stranger asked intrusive questions.",
      "An online argument targeted me directly.",
      "A public debate got heated and I was pressured to engage.",
      "Street canvassing continued after I declined.",
      "Comments in a queue turned inflammatory.",
    ],
  },

  Relationship: {
    Self: [
      "I minimized my needs to keep the peace.",
      "I stayed in a dynamic that didn’t feel mutual.",
      "I ignored red flags to avoid loneliness.",
      "I over-functioned to prevent conflict.",
      "I struggled to say no to protect my values.",
    ],
    Partner: [
      "My boundaries were criticized.",
      "Privacy lines (devices/accounts) felt crossed.",
      "Social media interactions didn’t sit right with me.",
      "Friend time/hobbies were discouraged.",
      "Unspoken expectations led to tension.",
    ],
    Family: [
      "My choices were judged or compared.",
      "Family members weighed in on my relationship.",
      "I felt expected to mediate others’ conflict.",
      "Manipulative guilt showed up in requests.",
      "Personal news was shared without my consent.",
    ],
    Friends: [
      "Support felt one-sided over time.",
      "I was treated as the ‘therapist friend’.",
      "Plans were canceled repeatedly without accountability.",
      "My privacy wasn’t respected in the group.",
      "Trust was bent by sharing info I asked to keep private.",
    ],
    Coworkers: [
      "A coworker blurred lines outside work hours.",
      "Hierarchy dynamics were used in social settings.",
      "I was pushed to socialize after hours.",
      "Private feedback became public commentary.",
      "Friendliness turned into over-familiarity.",
    ],
    Acquaintances: [
      "Kindness was taken as an invitation for closeness.",
      "Repeated favors were requested too soon.",
      "I was added to group chats without asking.",
      "People made assumptions about our closeness.",
      "Contact frequency felt disproportionate to our connection.",
    ],
    Strangers: [
      "Unwanted flirting continued after I declined.",
      "Boundaries around personal info weren’t respected.",
      "A stranger pushed for my number/socials.",
      "Online messages escalated after no response.",
      "I felt pressured to engage beyond courtesy.",
    ],
  },

  Personal: {
    Self: [
      "I ignored my energy limits to meet others’ expectations.",
      "I said yes while wanting to say no.",
      "I apologized for needing rest.",
      "I hid my preferences to avoid conflict.",
      "I judged myself harshly for being human.",
    ],
    Partner: [
      "I felt pressure to share passwords/accounts.",
      "My alone time was minimized as ‘not important’.",
      "My values were nudged aside to keep harmony.",
      "I felt pushed to drop a personal habit I value.",
      "I was nudged to overshare beyond comfort.",
    ],
    Family: [
      "Unsolicited advice kept arriving.",
      "Comparisons to siblings re-opened old wounds.",
      "My independence was second-guessed.",
      "I was expected to explain private choices.",
      "Sarcasm targeted my preferences.",
    ],
    Friends: [
      "Saying no required long explanations.",
      "I felt responsible for others’ moods.",
      "My unpopular opinions were mocked.",
      "I was teased for not drinking/partying.",
      "I was pressed to reveal private details.",
    ],
    Coworkers: [
      "Personal topics were raised in public channels.",
      "Jokes crossed into my identity/preferences.",
      "I was expected to attend optional socials.",
      "I felt probed about life outside work.",
      "I was asked to share more than I wanted during retro.",
    ],
    Acquaintances: [
      "People asked favors beyond our relationship.",
      "Private questions came too soon.",
      "I was added to newsletters without consent.",
      "Photos of me were posted without asking.",
      "I was invited to events that assumed closeness.",
    ],
    Strangers: [
      "My personal data was requested at a kiosk.",
      "A survey pushed for private info.",
      "A vendor asked for unnecessary details.",
      "I was recorded/photographed without consent.",
      "An app requested invasive permissions.",
    ],
  },

  Financial: {
    Self: [
      "I stress-shopped to soothe and felt regret later.",
      "I avoided looking at my budget this month.",
      "I skipped saving toward a goal without deciding to.",
      "I compared my spending to others’ highlight reels.",
      "I made a purchase I hadn’t planned or budgeted.",
    ],
    Partner: [
      "A purchase over our limit happened without aligning.",
      "We didn’t review shared expenses before buying.",
      "Financial goals weren’t revisited before spending.",
      "Debt or subscriptions weren’t transparent.",
      "I felt pressured to spend to keep pace.",
    ],
    Family: [
      "Repeated money requests arrived without boundaries.",
      "A loan was assumed, not discussed.",
      "Comparisons of income/spending came up at gatherings.",
      "I felt pushed to co-sign or guarantee something.",
      "Gifts carried expectations I couldn’t meet.",
    ],
    Friends: [
      "Bills weren’t split fairly or on time.",
      "Plans exceeded my budget but that wasn’t considered.",
      "Pressure to ‘just join’ a pricey trip showed up.",
      "I was asked to spot repeatedly without clarity.",
      "My ‘no’ to chipping in was challenged.",
    ],
    Coworkers: [
      "Office collections felt constant and expected.",
      "Expense sharing lacked clear agreement.",
      "Salary/comp questions felt intrusive.",
      "Happy-hour costs were assumed by me.",
      "I felt pushed to buy into a team gift beyond budget.",
    ],
    Acquaintances: [
      "MLM/product pitches arrived via DMs.",
      "I was asked to ‘invest’ in a side-hustle.",
      "A fundraiser ask came with urgency and pressure.",
      "Discount codes were pitched as a favor to them.",
      "I felt nudged to purchase to maintain the connection.",
    ],
    Strangers: [
      "Donation asks were repeated after I declined.",
      "A street solicitation followed me down the block.",
      "A sales rep pushed for card details too soon.",
      "A scam-leaning pitch kept escalating.",
      "A vendor tried to lock me in without terms.",
    ],
  },

  Emotional: {
    Self: [
      "I reacted before naming what I felt.",
      "I took on others’ feelings as my own.",
      "I exposed myself to triggers I know overwhelm me.",
      "I avoided self-soothing and stayed activated.",
      "I berated myself for feeling anything at all.",
    ],
    Partner: [
      "I was expected to be available for processing anytime.",
      "My need for a pause was labeled as avoidance.",
      "I felt asked to fix what isn’t mine to fix.",
      "Emotions escalated and there wasn’t a reset.",
      "I shared more than I felt safe to share.",
    ],
    Family: [
      "Guilt was used to earn a ‘yes’.",
      "Relatives off-loaded without consent.",
      "I was cast as the peacemaker for everyone.",
      "My emotional limits were ignored.",
      "Old patterns were pushed when I set a limit.",
    ],
    Friends: [
      "Trauma-dumping happened without checking capacity.",
      "I felt punished for needing boundaries.",
      "My quiet was read as rejection.",
      "I absorbed pain that wasn’t mine to hold.",
      "I was asked to choose sides in a conflict.",
    ],
    Coworkers: [
      "Venting crossed into personal attacks.",
      "I was pulled into emotional labor at work.",
      "Feedback arrived with a harsh tone.",
      "Slack DMs assumed immediate empathy on demand.",
      "I was asked to disclose private stressors.",
    ],
    Acquaintances: [
      "A new contact shared very heavy details unprompted.",
      "I was asked to advise on deep issues too soon.",
      "People sought emotional validation I couldn’t offer.",
      "I felt guilted for having limits.",
      "I received long messages expecting instant responses.",
    ],
    Strangers: [
      "Online replies were emotionally charged at me.",
      "A service interaction turned personal and heated.",
      "A stranger demanded empathy I didn’t have capacity for.",
      "I was confronted publicly about a private topic.",
      "Boundary setting led to shaming remarks.",
    ],
  },

  Expectation: {
    Self: [
      "I set an unrealistic output for my day.",
      "I judged myself for not being ‘on’ all the time.",
      "I forgot to allow rest or flexibility.",
      "I expected perfection and froze.",
      "I tied my worth to productivity.",
    ],
    Partner: [
      "I expected them to read my mind.",
      "Timelines changed but weren’t discussed.",
      "Roles at home felt unclear.",
      "I hoped for a change without aligning on it.",
      "I held a silent scorecard and felt resentful.",
    ],
    Family: [
      "Traditions were assumed without asking me.",
      "Success was defined for me by others.",
      "I was expected to host or plan by default.",
      "Availability was assumed regardless of my life.",
      "I felt shamed for saying no.",
    ],
    Friends: [
      "Instant replies were expected.",
      "Attendance at every plan was assumed.",
      "Unclear expectations led to let-downs.",
      "I was tested for loyalty in ways I couldn’t meet.",
      "I felt pushed to perform ‘good friend’ duties.",
    ],
    Coworkers: [
      "Deadline assumptions were made without alignment.",
      "I was expected to deliver at someone else’s pace.",
      "Feedback assumed I was always available.",
      "Task ownership wasn’t clarified before urgency hit.",
      "Invisible labor was assumed as mine.",
    ],
    Acquaintances: [
      "New people expected quick closeness.",
      "I was assumed to be available for favors.",
      "Consistency was demanded beyond our relationship.",
      "Disappointment landed on me for their assumptions.",
      "I was nudged to ‘prove’ reliability.",
    ],
    Strangers: [
      "Politeness was expected even in unsafe settings.",
      "A service worker expected personal info.",
      "I was pushed to hurry for someone else’s timeline.",
      "Access to me was assumed without consent.",
      "Approval was demanded for their choices.",
    ],
  },

  Content: {
    Self: [
      "I kept consuming content that left me stressed.",
      "I scrolled news late at night and felt wired.",
      "I watched media that triggered past pain.",
      "I stayed in comment sections that upset me.",
      "I forgot to curate my feeds for wellbeing.",
    ],
    Partner: [
      "Private moments were posted without asking.",
      "DMs with others didn’t feel transparent.",
      "Comparison posts left me feeling small.",
      "Explicit content showed up and wasn’t discussed.",
      "My request to pause social media went unheard.",
    ],
    Family: [
      "Family group chats carried toxic commentary.",
      "Photos of me were shared without consent.",
      "Kids’ screen time wasn’t discussed beforehand.",
      "Private issues were posted publicly.",
      "I was tagged in things I didn’t endorse.",
    ],
    Friends: [
      "Photos/tags happened without checking with me.",
      "Group threads escalated into debates.",
      "I was pushed to engage in online drama.",
      "Private jokes were posted publicly.",
      "Sensitive topics were shared widely.",
    ],
    Coworkers: [
      "Work talk spilled onto my personal socials.",
      "Memes felt inappropriate for our relationship.",
      "I was pressed to connect on every platform.",
      "DMs arrived outside hours via social apps.",
      "Screenshots were shared without consent.",
    ],
    Acquaintances: [
      "Follow requests felt premature.",
      "I was added to broadcast lists without asking.",
      "Comments were made on old personal posts.",
      "I was tagged in promotional content.",
      "I was pushed to like/share frequently.",
    ],
    Strangers: [
      "Harassment showed up in comments.",
      "Spam tags appeared under my posts.",
      "My image/content was reused without credit.",
      "Trolling escalated after I disengaged.",
      "Location was requested in real time.",
    ],
  },

  Digital: {
    Self: [
      "Notifications stayed on and kept me on edge.",
      "I checked messages immediately out of habit.",
      "I used devices in bed and slept poorly.",
      "I kept location services on by default.",
      "I stayed logged in everywhere.",
    ],
    Partner: [
      "Read receipts/location sharing felt assumed.",
      "Devices stayed on during quality time.",
      "I felt pressure to reply instantly.",
      "I got multiple platforms pinging at once.",
      "Old messages were revisited in conflict.",
    ],
    Family: [
      "Family tracked my location without a conversation.",
      "Late-night group pings woke me up.",
      "I was added to multiple chat groups unasked.",
      "I was expected to respond on every app.",
      "Passwords or logins were requested casually.",
    ],
    Friends: [
      "Location sharing was expected to coordinate.",
      "Meme tagging was constant through the day.",
      "I felt pressure to be ‘always online’.",
      "I was added to voice chats without notice.",
      "Screenshots of our chats were shared.",
    ],
    Coworkers: [
      "Work apps pinged during personal time.",
      "Typing indicators created urgency for replies.",
      "I was pulled into ad-hoc calls without consent.",
      "My status was monitored for availability.",
      "Personal number was used for work matters.",
    ],
    Acquaintances: [
      "I was added to mass broadcasts.",
      "People voice-noted lengthy asks without checking.",
      "I received repeated follow requests across apps.",
      "I was invited to private servers I don’t use.",
      "Unsolicited files/links were sent to me.",
    ],
    Strangers: [
      "Spam calls/texts were relentless.",
      "Phishing links arrived via DMs.",
      "Bots scraped my info from profiles.",
      "Random airdrops popped up in public.",
      "Unknowns attempted video calls.",
    ],
  },
};

// Helper to get suggestions safely
export function getSituationSuggestions(
  area: BoundaryArea,
  circle: RelationshipCircle
): string[] {
  const a = (SUGGESTIONS[area] || SUGGESTIONS.Time) as Record<
    RelationshipCircle,
    string[]
  >;
  return a[circle] || a.Partner;
}

// A few common “needs” (users can also type their own)
export const COMMON_NEEDS: Record<BoundaryArea, string[]> = {
  Time: [
    "I need clear response-time expectations.",
    "I need protected focus time.",
    "I need phone-free meals/evenings.",
    "I need buffer time around plans.",
    "I need off-hours respected.",
  ],
  Physical: [
    "I need consent before physical contact.",
    "I need space respected.",
    "I need privacy for my belongings.",
    "I need comfort to be checked in on.",
    "I need noise/sensory limits honored.",
  ],
  Conversational: [
    "I need breaks during charged talks.",
    "I need consent before advice.",
    "I need some topics to be off-limits.",
    "I need tone to stay respectful.",
    "I need late-night talks to wait.",
  ],
  Relationship: [
    "I need my boundaries to be respected.",
    "I need privacy and autonomy.",
    "I need mutual time for friends/hobbies.",
    "I need clarity around expectations.",
    "I need social media choices discussed.",
  ],
  Personal: [
    "I need my ‘no’ to be accepted.",
    "I need time alone to recharge.",
    "I need my values respected.",
    "I need room for my preferences.",
    "I need to share at my own pace.",
  ],
  Financial: [
    "I need alignment on spending limits.",
    "I need transparency about money matters.",
    "I need to decline requests without guilt.",
    "I need fair and clear splitting.",
    "I need purchases planned in advance.",
  ],
  Emotional: [
    "I need space to process feelings.",
    "I need empathy without fixing.",
    "I need requests to avoid guilt.",
    "I need emotional labor to be limited at work.",
    "I need safety to share or pause.",
  ],
  Expectation: [
    "I need realistic timelines.",
    "I need roles clarified upfront.",
    "I need progress over perfection.",
    "I need to be asked, not assumed.",
    "I need feedback with consent and context.",
  ],
  Content: [
    "I need consent before posting me.",
    "I need private matters kept offline.",
    "I need tags and shares checked first.",
    "I need debate-heavy threads muted.",
    "I need social media breaks honored.",
  ],
  Digital: [
    "I need device-free time protected.",
    "I need off-app boundaries respected.",
    "I need location/read receipts optional.",
    "I need fewer ping channels.",
    "I need work apps off after hours.",
  ],
};
// -----------------------------------------------------------------------------
// Firmness & end-of-statement options
// -----------------------------------------------------------------------------

export type Firmness = 1 | 2 | 3 | 4 | 5;

export const FIRMNESS_LABELS: Record<Firmness, string> = {
  1: "Very gentle",
  2: "Preference",
  3: "Need",
  4: "Firm action",
  5: "Hard limit",
};

export const CLOSERS_BY_FIRMNESS: Record<Firmness, string[]> = {
  1: [
    "Is that okay with you?",
    "Would that work for you?",
    "Are you open to trying this?",
  ],
  2: [
    "Can we agree on this?",
    "Let’s stick with this going forward.",
    "Does this feel reasonable?",
  ],
  3: [
    "I really need this.",
    "Can we align on this today?",
    "I need us to honor this consistently.",
  ],
  4: [
    "If that can’t happen, I’ll take a pause and revisit later.",
    "If not possible, I’ll step away for now.",
    "Otherwise, I’ll need to pause here.",
  ],
  5: [
    "If this isn’t respected, I’ll disengage.",
    "If this continues, I won’t be available for this.",
    "If this repeats, I’ll remove myself from the situation.",
  ],
};

/** Get ending options for the UI dropdown next to the live preview. */
export function getClosingOptions(firmness: Firmness): string[] {
  return CLOSERS_BY_FIRMNESS[firmness] ?? CLOSERS_BY_FIRMNESS[3];
}

// -----------------------------------------------------------------------------
// Live preview builder (keeps your phrasing consistent with firmness)
// -----------------------------------------------------------------------------

/**
 * Build a single conversational sentence (or two) for the preview.
 * - If you pass `opener`, it’ll lead (e.g., “I care about us and want this to go well.”)
 * - For firmness 1–3, prefer `request` (e.g., “ask before physical touch”)
 * - For firmness 4–5, prefer `boundaryAction` (e.g., “pause the conversation and return later”)
 * - `backup` is optional and commonly used for 4–5
 * - `closer` is optional; if omitted, we pick a default based on firmness
 */
export function buildLivePreview(opts: {
  firmness: Firmness;
  opener?: string;
  request?: string;       // short ask: “ask before physical touch”
  boundaryAction?: string;// short action: “pause and return later”
  backup?: string;        // consequence/escalation line (optional)
  closer?: string;        // end-of-statement add-on (optional)
}) {
  const parts: string[] = [];
  if (opts.opener && opts.opener.trim()) parts.push(opts.opener.trim());

  const starter =
    opts.firmness === 1 ? "If it’s okay with you, " :
    opts.firmness === 2 ? "I’d prefer " :
    opts.firmness === 3 ? "I need " :
    opts.firmness === 4 ? "I will " :
    "I will no longer tolerate ";

  // Main request/action
  if (opts.firmness <= 3 && opts.request) {
    parts.push(`${starter}${opts.request.trim()}.`);
  } else if (opts.boundaryAction) {
    parts.push(`${starter}${opts.boundaryAction.trim()}.`);
  }

  // Optional backup/escalation (often for 4–5, allowed for 3)
  if (opts.backup && opts.backup.trim()) {
    parts.push(opts.backup.trim());
  }

  // Closer
  const closer =
    (opts.closer && opts.closer.trim()) ||
    (CLOSERS_BY_FIRMNESS[opts.firmness]?.[0] ?? "");
  if (closer) parts.push(closer);

  return parts.join(" ");
}

// -----------------------------------------------------------------------------
// AI feedback (short, actionable nudge for the user)
// -----------------------------------------------------------------------------

export function getAiFeedback(payload: {
  area: BoundaryArea;
  circle: RelationshipCircle;
  firmness: Firmness;
  requestOrAction?: string; // whatever you feed into the preview as the main ask/action
}) {
  const tips: string[] = [];

  // 1) Specificity
  if (!payload.requestOrAction || payload.requestOrAction.trim().length < 6) {
    tips.push("Make the request specific and observable (who/what/when).");
  }

  // 2) Tone guidance by firmness
  if (payload.firmness <= 2) {
    tips.push("Gentle works well—add one concrete example so it lands.");
  } else if (payload.firmness === 3) {
    tips.push("State why this matters to your well-being to increase clarity.");
  } else if (payload.firmness >= 4) {
    tips.push("For firm limits, keep consequences clear, calm, and enforceable.");
  }

  // 3) Context nudge by area
  if (payload.area === "Time" && payload.circle !== "Self") {
    tips.push("Offer a simple reschedule window to keep it collaborative.");
  }
  if (payload.area === "Physical" && payload.circle !== "Self") {
    tips.push("Consent phrasing helps: “Please check in before…” keeps it clear, not punitive.");
  }

  return tips.slice(0, 3);
}
