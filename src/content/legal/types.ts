// Shared shape for Siena's legal documents.
//
// The website is the CANONICAL source for the Privacy Policy and Terms of
// Service. The mobile app mirrors these same section arrays so the two
// surfaces cannot drift. If you change text here, mirror it into
// sienamobile/constants/legalContent.ts in the same commit.

export type LegalBlock =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'table'; headers: string[]; rows: string[][] };

export interface LegalSection {
  /** Stable anchor id, used for the table of contents and deep links. */
  id: string;
  title: string;
  blocks: LegalBlock[];
  /**
   * When set, renders a visible COUNSEL REVIEW callout above the section and
   * lists the section in the review index at the top of the document.
   *
   * Use this for anything we are asserting as a legal position rather than
   * describing as an engineering fact: legal bases, special-category data
   * handling, arbitration, liability caps, jurisdictional claims.
   */
  counselReview?: string;
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  effective: string;
  /**
   * While true, the page renders a prominent DRAFT banner and states the
   * document is not yet in force. Flip to false only once counsel has
   * signed off and you intend the text to be binding.
   */
  draft: boolean;
  intro: LegalBlock[];
  sections: LegalSection[];
  closing?: string;
}
