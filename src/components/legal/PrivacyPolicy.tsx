// The website is the CANONICAL source for Siena's Privacy Policy: this is the
// URL registered with App Store Connect. The text lives in
// src/content/legal/privacyPolicy.ts so the mobile app can mirror it verbatim.
//
// Do not edit policy wording in this file — edit the content module.

import LegalDocumentView from './LegalDocumentView';
import { PRIVACY_POLICY } from '../../content/legal/privacyPolicy';

export default function PrivacyPolicy() {
  return <LegalDocumentView doc={PRIVACY_POLICY} />;
}
