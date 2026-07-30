// Internal counsel-review notes, keyed by legal document section id.
//
// SEPARATE MODULE ON PURPOSE. These notes record open legal questions about
// our own documents ("confirm SCCs are actually in place", "confirm the cap is
// enforceable"). They must never reach a public bundle: they are internal
// assessments of our own risk and would be discoverable if shipped.
//
// LegalDocumentView imports this only behind the LEGAL_REVIEW_MODE constant.
// Because that constant is a literal `false` in public builds, the branch is
// dead-code-eliminated and this module is tree-shaken out. Verify that before
// any public deploy — see reviewMode.ts.

export const COUNSEL_NOTES: Record<string, string> = {
  'ai-features-openai':
    'PRIORITY REVIEW. This section is the basis of Siena\'s App Store 5.1.1(i) response and describes transfers of special-category data to a US processor. Confirm: (a) the description of what is sent is complete; (b) the retention statement matches OpenAI\'s current standard API terms; (c) consent is the correct lawful basis for these transfers and is validly obtained; (d) whether a signed DPA with OpenAI should be obtained, since we currently rely on standard API terms only.',
  'subprocessors':
    'Confirm that a data-processing agreement is actually executed with each provider listed, and correct the table where one is not. Prior policy text asserted that DPAs were in place with all processors; that assertion has been removed pending verification. Also confirm the transactional email provider is Resend, which was inferred from configuration.',
  'legal-bases':
    'PRIORITY REVIEW. Entire section is a legal position and has not been settled by counsel. In particular: (a) confirm consent is the correct and validly obtained Article 9(2)(a) basis for transmitting special-category data to OpenAI, and that the consent flow meets the "explicit" standard; (b) confirm the mobile AI consent gate satisfies this and decide what is required on the website, which currently has no equivalent AI consent step; (c) confirm the legitimate-interests balancing for security and product improvement; (d) confirm whether a DPIA is required given the scale and sensitivity of the assessment data.',
  'retention':
    'Confirm the stated periods are operationally accurate and achievable, particularly the 30-day deletion window and the 90-day backup overwrite, and confirm any minimum retention required for tax or payment records.',
  'your-rights':
    'Confirm the response timeframes and the identity-verification approach meet GDPR, UK GDPR, CCPA/CPRA and the other US state regimes named. Confirm we can operationally deliver data portability in a usable format.',
  'international':
    'PRIORITY REVIEW. Confirm that Standard Contractual Clauses are actually in place with each relevant processor, in particular OpenAI, given we are on standard API terms rather than a negotiated DPA. If SCCs are not in place, this section must be rewritten before it is relied on.',
  'subscriptions':
    'Confirm the auto-renewal and refund terms comply with Apple App Store and Google Play requirements, and with EU/UK consumer withdrawal rights and applicable US state auto-renewal statutes.',
  'your-content':
    'PRIORITY REVIEW. This licence grant is what authorises Siena to transmit user content to OpenAI. The prior website Terms contained no content licence at all, so there was no contractual basis for that transmission. Confirm the scope is sufficient for the actual data flows described in the Privacy Policy and no broader than necessary.',
  'ai-content':
    'PRIORITY REVIEW. Supports the App Store 5.1.1(i) response. Confirm the disclaimer is adequate given Siena operates in a mental-health-adjacent context, and that the retention statement matches OpenAI\'s current standard API terms.',
  'couples':
    'Consider whether additional protective language is warranted given the coercive-control and intimate-partner-violence risk surface of shared couples features and live transcript sharing.',
  'warranties':
    'Confirm the disclaimer and its capitalisation meet conspicuousness requirements in the relevant jurisdictions, and that the consumer-law carve-out is adequate for EU/UK users.',
  'liability':
    'PRIORITY REVIEW. Ported from the mobile Terms and not independently reviewed. Confirm the cap is enforceable in Florida and in the consumer jurisdictions where Siena operates, and that it is appropriate given the mental-health-adjacent context.',
  'arbitration':
    'PRIORITY REVIEW. Ported verbatim in substance from the mobile Terms and not independently reviewed. Confirm enforceability, the adequacy of the 30-day opt-out mechanism, whether the class waiver survives in the relevant jurisdictions, and whether the mass-arbitration risk warrants a batching provision. Note that until now the website and the app bound users to materially different dispute terms; this section aligns them.',
  'governing-law':
    'Confirm the Florida choice of law and Miami-Dade venue hold up against mandatory consumer-protection rules in the EU, UK and other jurisdictions where Siena is distributed.',
  'apple':
    'Confirm this satisfies the current Apple Developer Program Licence Agreement Schedule 1 requirements for end-user licence terms.',
};
