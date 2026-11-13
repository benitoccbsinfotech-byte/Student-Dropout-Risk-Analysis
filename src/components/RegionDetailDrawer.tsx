import React from 'react';
import { X, ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import {
  COHORT_YEARS,
  NATIONAL_DIAGNOSTICS,
  type RegionAttritionRecord,
} from '../data/attritionData';
import {
  computeRegionChange,
  formatPercent,
  formatSignedPp,
} from '../utils/analytics';

interface RegionDetailDrawerProps {
  region: RegionAttritionRecord | null;
  onClose: () => void;
  onToggleCompare: (code: string) => void;
  isInComparison: boolean;
}

export const RegionDetailDrawer: React.FC<RegionDetailDrawerProps> = ({
  region,
  onClose,
  onToggleCompare,
  isInComparison,
}) => {
  if (!region) return null;

  const change22to25 = computeRegionChange(region, 2022, 2025);
  const rate2025 = region.rates[2025];
  const diffFromNational2025 =
    rate2025 !== null ? Number((rate2025 - NATIONAL_DIAGNOSTICS.rate2025).toFixed(2)) : null;

  // Sparkline coordinates
  const w = 320;
  const h = 110;
  const padX = 24;
  const padY = 18;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const points = COHORT_YEARS.map((yr, idx) => {
    const val = region.rates[yr];
    return {
      yr,
      val,
      x: padX + (idx / (COHORT_YEARS.length - 1)) * innerW,
      y: val !== null ? padY + innerH - (val / 100) * innerH : null,
    };
  });

  const segments: Array<typeof points> = [];
  let current: typeof points = [];
  for (const pt of points) {
    if (pt.val !== null) {
      current.push(pt);
    } else if (current.length > 0) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length > 0) segments.push(current);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="region-drawer-title"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative z-10 w-full max-w-md bg-white border-l border-slate-200 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="text-xs text-slate-500 font-medium">
                {region.code} · {region.islandGroup} · Source {region.sourceId}
              </div>
              <h2
                id="region-drawer-title"
                className="text-xl font-bold text-slate-900 mt-1"
              >
                {region.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${region.name} detail panel`}
              className="p-2 min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-md border border-[#E7E2F1] text-slate-600 hover:text-slate-900 hover:bg-[#FAF8FD] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B21B6]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-[#E7E2F1] rounded-md p-3.5 bg-[#FAF8FD]">
              <div className="text-xs text-slate-500">2025 Attrition Rate</div>
              <div className="text-2xl font-mono font-semibold text-slate-900 tabular-nums mt-1">
                {formatPercent(rate2025)}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {region.rank2025 !== null
                  ? `Rank #${region.rank2025} of 17 reported`
                  : 'Unranked (no 2025 source data)'}
              </div>
            </div>

            <div className="border border-[#E7E2F1] rounded-md p-3.5 bg-[#FAF8FD]">
              <div className="text-xs text-slate-500">2022 to 2025 Change</div>
              <div className="flex items-center gap-1.5 text-2xl font-mono font-semibold tabular-nums mt-1">
                {change22to25 === null ? (
                  <span className="text-slate-500 inline-flex items-center gap-1">
                    <Minus className="w-4 h-4" /> N/A
                  </span>
                ) : change22to25 < 0 ? (
                  <span className="text-emerald-700 inline-flex items-center gap-1">
                    <ArrowDownRight className="w-5 h-5" />
                    {formatSignedPp(change22to25)}
                  </span>
                ) : (
                  <span className="text-red-700 inline-flex items-center gap-1">
                    <ArrowUpRight className="w-5 h-5" />
                    {formatSignedPp(change22to25)}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {diffFromNational2025 !== null
                  ? `${formatSignedPp(diffFromNational2025)} vs. 2025 national (28.96%)`
                  : 'Incomplete endpoint pair'}
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <div className="border border-slate-200 rounded-md p-4">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span className="font-medium text-slate-900">Cohort Trajectory (0–100% scale)</span>
              <span className="font-mono">2022–2025</span>
            </div>
            <svg
              viewBox={`0 0 ${w} ${h}`}
              className="w-full h-auto block"
              role="img"
              aria-label={`Attrition trend for ${region.name} from 2022 to 2025`}
            >
              {[0, 50, 100].map((tick) => {
                const y = padY + innerH - (tick / 100) * innerH;
                return (
                  <line
                    key={tick}
                    x1={padX}
                    y1={y}
                    x2={w - padX}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray={tick === 50 ? '3 3' : undefined}
                  />
                );
              })}

              {segments.map((seg, i) => {
                if (seg.length < 2) return null;
                const d = seg
                  .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                  .join(' ');
                return (
                  <path
                    key={i}
                    d={d}
                    fill="none"
                    stroke="#5B21B6"
                    strokeWidth="2.5"
                  />
                );
              })}

              {points.map((pt) => (
                <g key={pt.yr}>
                  {pt.y !== null ? (
                    <>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4.5"
                        fill="#5B21B6"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 8}
                        textAnchor="middle"
                        className="fill-slate-800 text-[10px] font-mono tabular-nums font-medium"
                      >
                        {pt.val!.toFixed(1)}%
                      </text>
                    </>
                  ) : (
                    <text
                      x={pt.x}
                      y={padY + innerH / 2}
                      textAnchor="middle"
                      className="fill-amber-700 text-[10px] font-mono"
                    >
                      N/A
                    </text>
                  )}
                  <text
                    x={pt.x}
                    y={h - 2}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px] font-mono"
                  >
                    {pt.yr}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Exact Annual Figures Table */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 mb-2">
              Observed Cohort Rates
            </h3>
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="text-left font-medium px-3 py-2">Cohort Year</th>
                    <th className="text-right font-medium px-3 py-2">Attrition Rate</th>
                    <th className="text-right font-medium px-3 py-2">Data Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {COHORT_YEARS.map((yr) => {
                    const val = region.rates[yr];
                    return (
                      <tr key={yr}>
                        <td className="px-3 py-2 font-mono text-slate-800">{yr}</td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums font-medium text-slate-900">
                          {val !== null ? `${val.toFixed(2)}%` : '—'}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-600">
                          {val !== null ? 'Reported (Table 6)' : 'Blank / Source N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Provenance & Validation Notes */}
          <div className="border-t border-slate-200 pt-4 space-y-2 text-xs text-slate-600">
            <div>
              <span className="font-medium text-slate-800">Source:</span> {region.sourceTable}
            </div>
            <div>
              <span className="font-medium text-slate-800">Data Level:</span> {region.dataLevel}
            </div>
            <div>
              <span className="font-medium text-slate-800">Cleaned Validation Status:</span>{' '}
              {region.cleanedValidationStatus}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-5 mt-6 border-t border-slate-200 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggleCompare(region.code)}
            className={`flex-1 py-2.5 px-4 text-xs font-medium rounded-md border transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B21B6] ${
              isInComparison
                ? 'bg-[#F5F2FA] border-[#D8CEEC] text-[#4C1D95] hover:bg-[#ECE5F8]'
                : 'bg-[#5B21B6] border-[#5B21B6] text-white hover:bg-[#4C1D95]'
            }`}
          >
            {isInComparison ? 'Remove from Comparison' : 'Add to Comparison Chart'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 whitespace-nowrap cursor-pointer"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
};
