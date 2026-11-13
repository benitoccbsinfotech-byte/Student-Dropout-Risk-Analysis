import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import {
  NATIONAL_DIAGNOSTICS,
  RECOMMENDATIONS,
  SOURCE_REFERENCES,
} from '../data/attritionData';

export const PolicyAndSourcesView: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(RECOMMENDATIONS[0].id);

  return (
    <div className="space-y-6">
      {/* Evidence-Based Recommendations */}
      <section
        aria-labelledby="recommendations-heading"
        className="bg-white border border-[#E7E2F1] rounded-lg overflow-hidden"
      >
        <div className="p-5 sm:p-6 border-b border-[#E7E2F1]">
          <h2 id="recommendations-heading" className="text-base font-semibold text-slate-900">
            Evidence-Based Recommendations
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Recommendations reflect the scope and limitations of the published regional cohort data.
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {RECOMMENDATIONS.map((rec, index) => {
            const isExpanded = expandedId === rec.id;
            return (
              <div key={rec.id} className="bg-white">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                  aria-expanded={isExpanded}
                  className="w-full px-5 sm:px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#FAF8FD] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#5B21B6]"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500 font-mono">
                      0{index + 1} · {rec.linkedMetrics.join(' · ')}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {rec.recommendation}
                    </div>
                  </div>
                  <span className="p-1.5 rounded border border-[#E7E2F1] text-slate-500 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                    )}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-5 pt-2 bg-[#FAF8FD] border-t border-[#F0ECF7] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">Evidence</div>
                      <p className="text-slate-700 leading-relaxed">{rec.evidence}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">Proposed Action</div>
                      <p className="text-slate-700 leading-relaxed">{rec.proposedAction}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">Expected Benefit</div>
                      <p className="text-slate-700 leading-relaxed">{rec.expectedBenefit}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">Resources</div>
                      <p className="text-slate-700 leading-relaxed">{rec.resources}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-amber-900 mb-1">Implementation Risk</div>
                      <p className="text-slate-700 leading-relaxed">{rec.implementationRisk}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Source References */}
      <section
        aria-labelledby="sources-heading"
        className="bg-white border border-[#E7E2F1] rounded-lg overflow-hidden"
      >
        <div className="p-5 sm:p-6 border-b border-[#E7E2F1]">
          <h2 id="sources-heading" className="text-base font-semibold text-slate-900">
            Source References
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Primary report and supporting official statistics reference.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#5B21B6] text-white">
                <th className="px-4 py-3 text-left font-medium">Source ID</th>
                <th className="px-4 py-3 text-left font-medium">Agency / Author</th>
                <th className="px-4 py-3 text-left font-medium">Document / Dataset</th>
                <th className="px-4 py-3 text-left font-medium">Year / Data Period</th>
                <th className="px-4 py-3 text-left font-medium">Variables Supported</th>
                <th className="px-4 py-3 text-left font-medium">How Used / Limitation</th>
                <th className="px-4 py-3 text-left font-medium">Reference Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {SOURCE_REFERENCES.map((src) => (
                <tr key={src.id} className="hover:bg-[#FAF8FD]">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                    {src.id}
                  </td>
                  <td className="px-4 py-3 text-slate-800 min-w-[200px]">{src.agency}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 min-w-[220px]">
                    {src.document}
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{src.period}</td>
                  <td className="px-4 py-3 text-slate-700 min-w-[160px]">
                    {src.variablesSupported}
                  </td>
                  <td className="px-4 py-3 text-slate-600 min-w-[260px]">
                    {src.howUsedLimitation}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#5B21B6] font-medium hover:underline"
                    >
                      Open Source
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-5 sm:p-6 bg-[#FAF8FD] border-t border-[#E7E2F1] text-xs text-slate-700">
          <span className="font-semibold text-slate-900">Methodological Scope Reminder: </span>
          {NATIONAL_DIAGNOSTICS.measureDefinitionAndLimitation}
        </div>
      </section>
    </div>
  );
};
