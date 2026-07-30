/// <reference types="vite/client" />

/**
 * Build-time constant, substituted by Vite's `define` (see vite.config.ts).
 *
 * Reference it DIRECTLY at each use site. Do not re-export it through another
 * module first: bundlers fold `if (false)` when the identifier is substituted
 * in place, but a cross-module re-export defeats that and the guarded code —
 * including the internal counsel-review notes — survives into the bundle.
 * This was tested; see src/content/legal/reviewMode.ts.
 */
declare const __LEGAL_REVIEW__: boolean;
