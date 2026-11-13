import React, { useMemo, useState } from 'react';
import {
  COHORT_YEARS,
  DIAGNOSTIC_ITEMS,
  NATIONAL_DIAGNOSTICS,
  WORKBOOK_AUDIT_FINDINGS,
  type RegionAttritionRecord,
} from '../data/attritionData';
import { computeYearStats } from '../utils/analytics';

interface StatisticalAuditViewProps {
  regions: RegionAttritionRecord[];
}

export const StatisticalAuditView: React.FC<StatisticalAuditViewProps> = ({ regions }) => {
  const [showRawWorkbookFormat, setShowRawWorkbookFormat] = useState(false);

  const statsByYear = useMemo(
    () => COHORT_YEARS.map((yr) => computeYearStats(regions, yr)!),
    [regions]
  );

  // Raw workbook values exact from screenshot 4 (image_ce4d661c.png)
  const rawWorkbookCells: Record<string, Record<number, string>> = {
    count: { 2022: '17', 2023: '1800.00%', 2024: '1700.00%', 2025: '1700.00%' },
    mean: {
      2022: '0.49923529411764705',
      2023: '37.69%',
      2024: '27.75%',
      2025: '30.33%',
    },
    median: { 2022: '0.476', 2023: '34.37%', 2024: '27.13%', 2025: '30.32%' },
    stdDev: {
      2022: '0.13320920079510495',
      2023: '16.63%',
      2024: '8.48%',
      2025: '6.15%',
    },
    min: { 2022: '0.363', 2023: '11.34%', 2024: '8.02%', 2025: '17.65%' },
    max: { 2022: '0.934', 2023: '95.56%', 2024: '38.44%', 2025: '39.83%' },
    range: {
      2022: '0.5710000000000001',
      2023: '84.22%',
      2024: '30.42%',
      2025: '22.18%',
    },
  };

  const formatShortRegion = (name: string) =>
    name === 'Bangsamoro Autonomous Region in Muslim Mindanao' ? 'BARMM' : name;

  const statRows = [
    {
      key: 'count',
      label: 'Count (regions with data)',
      note: 'Number of regions with source data (excludes blank N/A cells).',
      renderValue: (idx: number) => `${statsByYear[idx].count} of 18`,
    },
    {
      key: 'mean',
      label: 'Mean (unweighted)',
      note: 'Unweighted summary across available regions; distinct from national cohort rate.',
      renderValue: (idx: number) => `${statsByYear[idx].mean.toFixed(2)}%`,
    },
    {
      key: 'median',
      label: 'Median',
      note: 'Regional distribution midpoint statistic.',
      renderValue: (idx: number) => `${statsByYear[idx].median.toFixed(2)}%`,
    },
    {
      key: 'stdDev',
      label: 'Standard deviation (sample)',
      note: 'Sample dispersion (n − 1) across reported regions.',
      renderValue: (idx: number) => `${statsByYear[idx].stdDevSample.toFixed(2)}%`,
    },
    {
      key: 'min',
      label: 'Minimum',
      note: 'Lowest observed regional attrition rate in cohort year.',
      renderValue: (idx: number) => (
        <div>
          <div>{statsByYear[idx].min.toFixed(2)}%</div>
          <div className="text-[11px] font-sans font-normal text-slate-500">
            {formatShortRegion(statsByYear[idx].minRegion)}
          </div>
        </div>
      ),
    },
    {
      key: 'max',
      label: 'Maximum',
      note: 'Highest observed regional attrition rate in cohort year.',
      renderValue: (idx: number) => (
        <div>
          <div>{statsByYear[idx].max.toFixed(2)}%</div>
          <div className="text-[11px] font-sans font-normal text-slate-500">
            {formatShortRegion(statsByYear[idx].maxRegion)}
          </div>
        </div>
      ),
    },
    {
      key: 'range',
      label: 'Range (Max − Min)',
      note: 'Spread between highest and lowest reporting region.',
      renderValue: (idx: number) => `${statsByYear[idx].range.toFixed(2)} pp`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Descriptive Analysis Matrix */}
      <section
        aria-labelledby="descriptive-stats-heading"
        className="bg-white border border-[#E7E2F1] rounded-lg overflow-hidden"
      >
        <div className="p-5 sm:p-6 border-b border-[#E7E2F1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 id="descriptive-stats-heading" className="text-base font-semibold text-slate-900">
              Descriptive Analysis — Regional Attrition (2022–2025)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Unweighted regional summaries computed directly from the 18-region cleaned dataset. 2025 rates range from 17.65% (CALABARZON) to 39.83% (Davao Region).
            </p>
          </div>

          <div
            className="inline-flex items-center p-0.5 bg-[#F5F2FA] border border-[#E7E2F1] rounded-md self-start"
            role="group"
            aria-label="Toggle normalized vs raw spreadsheet formatting"
          >
            <button
              type="button"
              onClick={() => setShowRawWorkbookFormat(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !showRawWorkbookFormat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Normalized Format
            </button>
            <button
              type="button"
              onClick={() => setShowRawWorkbookFormat(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showRawWorkbookFormat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raw Workbook Cells
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#5B21B6] text-white">
                <th className="px-3.5 py-3 text-left font-medium">Statistic</th>
                {COHORT_YEARS.map((yr) => (
                  <th key={yr} className="px-3.5 py-3 text-right font-medium font-mono">
                    {yr}
                  </th>
                ))}
                <th className="px-3.5 py-3 text-left font-medium">Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {statRows.map((row) => (
                <tr key={row.key} className="hover:bg-slate-50">
                  <td className="px-3.5 py-3 font-medium text-slate-900 whitespace-nowrap align-top">
                    {row.label}
                  </td>
                  {COHORT_YEARS.map((yr, idx) => (
                    <td
                      key={yr}
                      className="px-3.5 py-3 text-right font-mono tabular-nums text-slate-900 whitespace-nowrap align-top"
                    >
                      {showRawWorkbookFormat
                        ? rawWorkbookCells[row.key][yr]
                        : row.renderValue(idx)}
                    </td>
                  ))}
                  <td className="px-3.5 py-3 text-slate-600 min-w-[220px] align-top">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Diagnostic Analysis — Time Series */}
      <section
        aria-labelledby="diagnostic-ts-heading"
        className="bg-white border border-[#E7E2F1] rounded-lg overflow-hidden"
      >
        <div className="p-5 sm:p-6 border-b border-[#E7E2F1]">
          <h2 id="diagnostic-ts-heading" className="text-base font-semibold text-slate-900">
            Diagnostic Analysis — National Time Series
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Descriptive national change only; no causal claims are made.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#5B21B6] text-white">
                <th className="px-4 py-3 text-left font-medium">Diagnostic Item</th>
                <th className="px-4 py-3 text-right font-medium">Result</th>
                <th className="px-4 py-3 text-left font-medium">Unit</th>
                <th className="px-4 py-3 text-left font-medium">Interpretation / Limitation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {DIAGNOSTIC_ITEMS.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF8FD]">
                  <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                    {item.item}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                    {showRawWorkbookFormat ? item.rawWorkbookValue : item.formattedValue}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.unit}</td>
                  <td className="px-4 py-3 text-slate-600 min-w-[260px]">
                    <div>{item.interpretation}</div>
                    {item.auditFlag && (
                      <div className="mt-1 text-amber-800 font-medium">
                        Audit Note: {item.auditFlag}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-5 sm:p-6 bg-[#FAF8FD] border-t border-[#E7E2F1] grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Diagnostic Conclusion</h3>
            <p className="text-slate-700 leading-relaxed">{NATIONAL_DIAGNOSTICS.conclusion}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Measure Definition &amp; Limitation</h3>
            <p className="text-slate-700 leading-relaxed">
              {NATIONAL_DIAGNOSTICS.measureDefinitionAndLimitation}
            </p>
          </div>
        </div>
      </section>

      {/* Workbook Data Quality & Audit Log */}
      <section
        aria-labelledby="audit-findings-heading"
        className="bg-white border border-[#E7E2F1] rounded-lg p-5 sm:p-6"
      >
        <h2 id="audit-findings-heading" className="text-base font-semibold text-slate-900">
          Source Workbook Reconciliation &amp; Data Integrity Notes
        </h2>
        <p className="text-xs text-slate-600 mt-0.5 mb-4">
          Transparent documentation of spreadsheet formatting artifacts and reconciliation against the 18 regional records.
        </p>

        <div className="divide-y divide-slate-200 border border-[#E7E2F1] rounded-md">
          {WORKBOOK_AUDIT_FINDINGS.map((finding) => (
            <div
              key={finding.id}
              className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs"
            >
              <div className="lg:col-span-3 font-semibold text-slate-900">{finding.area}</div>
              <div className="lg:col-span-4 text-slate-600">
                <span className="font-medium text-slate-800">Workbook Cell State: </span>
                {finding.sourceBehavior}
              </div>
              <div className="lg:col-span-5 text-slate-700">
                <span className="font-medium text-[#5B21B6]">Dashboard Handling: </span>
                {finding.dashboardHandling}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
