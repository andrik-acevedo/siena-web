// Shared shape for Siena's legal documents.
//
// The website is the CANONICAL source for the Privacy Policy and Terms of
// Service. The mobile app mirrors these same content modules byte-for-byte so
// the two surfaces cannot drift. If you change text here, copy the changed
// file into sienamobile/constants/legal/ in the same commit; scripts/check-legal-sync.sh
// verifies the two are identical.
//
// Internal counsel-review notes are NOT part of this shape. They live in
// counselNotes.ts, keyed by section id, so they can be kept out of public
// bundles. See reviewMode.ts.

export type LegalBlock =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'table'; headers: string[]; rows: string[][] };

export interface LegalSection {
  /** Stable anchor id. Also the key used to look up any counsel-review note. */
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  effective: string;
  intro: LegalBlock[];
  sections: LegalSection[];
  closing?: string;
}
