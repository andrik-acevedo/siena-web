/**
 * Legal-document review scaffolding: how it is switched, and why it matters.
 *
 * There is no boolean to edit in this file. The switch is the Vite build-time
 * define `__LEGAL_REVIEW__` (see vite.config.ts), referenced directly by
 * LegalDocumentView:
 *
 *     npm run dev  /  npm run build      → clean public text (default)
 *     LEGAL_REVIEW=1 npm run build       → counsel version
 *
 * Clean text = the policy exactly as users and the App Review reviewer see it.
 * Counsel version = the same text plus the DRAFT banner, the review index, and
 * the 15 per-section callouts from counselNotes.ts.
 *
 * WHY IT IS A DEFINE, AND WHY IT IS REFERENCED DIRECTLY
 *
 * counselNotes.ts records open questions about our own legal positions
 * ("confirm SCCs are actually in place", "confirm the cap is enforceable").
 * Those are internal risk assessments and must never reach a public bundle.
 *
 * Two approaches were tried and measured against the minified output:
 *
 *   1. `export const LEGAL_REVIEW_MODE = false` guarding the notes.
 *      FAILED — the notes were still present in the bundle.
 *   2. A build-time define re-exported through this module as a const.
 *      ALSO FAILED — the cross-module hop defeated the constant folding.
 *
 * What works is referencing `__LEGAL_REVIEW__` directly at the use site, so
 * the branch folds to `if (false)` before tree-shaking runs. Keep it that way.
 *
 * Verify before any public deploy:
 *     npm run build && grep -ri "SCCs\|PRIORITY REVIEW" dist/    # expect no hits
 */
export {};
