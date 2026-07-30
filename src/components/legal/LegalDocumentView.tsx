import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Scale } from 'lucide-react';
import type { LegalBlock, LegalDocument } from '../../content/legal/types';
import { COUNSEL_NOTES } from '../../content/legal/counselNotes';

/**
 * Renders a Siena legal document.
 *
 * Deliberate choices:
 *
 * 1. Everything is rendered expanded. The previous implementation put each
 *    section behind a collapsed accordion, so anyone opening the URL — an
 *    App Review reviewer included — saw only headings. For a document whose
 *    whole job is disclosure, that works against us.
 *
 * 2. Counsel-review flags render as visible callouts AND are collected into
 *    an index at the top, so a lawyer can find every open question quickly.
 *
 * 3. The draft banner is loud on purpose. It should be impossible to ship
 *    this as binding text by accident.
 */

function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case 'h':
      return <h3 className="font-semibold text-gray-900 mt-5 mb-2">{block.text}</h3>;
    case 'p':
      return <p className="mb-3 leading-relaxed">{block.text}</p>;
    case 'ul':
      return (
        <ul className="list-disc pl-5 mb-3 space-y-1.5">
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );
    case 'table':
      return (
        <div className="overflow-x-auto mb-4 -mx-1">
          <table className="min-w-full text-sm border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="text-left font-semibold text-gray-900 px-3 py-2 border-b border-gray-200 align-top"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 ? 'bg-gray-50' : 'bg-white'}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-3 py-2 border-b border-gray-100 align-top leading-relaxed"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

export default function LegalDocumentView({ doc }: { doc: LegalDocument }) {
  // In public builds __LEGAL_REVIEW__ is a literal false, so everything below
  // that depends on it — including the COUNSEL_NOTES import — is dropped by the
  // bundler. See reviewMode.ts before changing this to a runtime value.
  const flagged = __LEGAL_REVIEW__
    ? doc.sections.filter((s) => COUNSEL_NOTES[s.id])
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-sm hover:underline text-brand-green">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Siena
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{doc.title}</h1>
          <p className="text-gray-600 mb-6 text-sm">
            Last Updated: {doc.lastUpdated} · Effective: {doc.effective}
          </p>

          {__LEGAL_REVIEW__ && (
            <div className="mb-8 border-2 border-amber-400 bg-amber-50 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-900">
                  <p className="font-bold mb-1">DRAFT — NOT YET IN FORCE</p>
                  <p className="leading-relaxed">
                    This document has been rewritten to describe accurately how Siena
                    actually handles data, and is pending review by legal counsel. It is
                    not yet binding and should not be relied on. Sections marked{' '}
                    <span className="font-semibold">Counsel review required</span> contain
                    legal positions that have not been settled.
                  </p>
                </div>
              </div>
            </div>
          )}

          {flagged.length > 0 && (
            <div className="mb-8 border border-gray-300 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Scale className="h-4 w-4 text-gray-700 mr-2" />
                <p className="font-semibold text-gray-900 text-sm">
                  Counsel review index ({flagged.length} sections)
                </p>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                {flagged.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-brand-green hover:underline">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-gray-700 mb-8">
            {doc.intro.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </div>

          <nav className="mb-10 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="font-semibold text-gray-900 text-sm mb-2">Contents</p>
            <ol className="space-y-1 text-sm">
              {doc.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-brand-green hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="text-gray-700">
            {doc.sections.map((section) => (
              <section key={section.id} id={section.id} className="mb-10 scroll-mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                  {section.title}
                </h2>

                {__LEGAL_REVIEW__ && COUNSEL_NOTES[section.id] && (
                  <div className="mb-4 border-l-4 border-amber-400 bg-amber-50 p-3 rounded-r">
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">
                      Counsel review required
                    </p>
                    <p className="text-sm text-amber-900 leading-relaxed">
                      {COUNSEL_NOTES[section.id]}
                    </p>
                  </div>
                )}

                {section.blocks.map((b, i) => (
                  <Block key={i} block={b} />
                ))}
              </section>
            ))}
          </div>

          {doc.closing && (
            <div className="mt-10 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-500 text-sm leading-relaxed">{doc.closing}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
