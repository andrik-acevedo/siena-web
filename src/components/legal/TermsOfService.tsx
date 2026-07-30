// The website is the CANONICAL source for Siena's Terms of Service. The text
// lives in src/content/legal/termsOfService.ts so the mobile app can mirror it
// verbatim.
//
// Do not edit terms wording in this file — edit the content module.

import LegalDocumentView from './LegalDocumentView';
import { TERMS_OF_SERVICE } from '../../content/legal/termsOfService';

export default function TermsOfService() {
  return <LegalDocumentView doc={TERMS_OF_SERVICE} />;
}
