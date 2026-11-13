import React, { useMemo, useState } from 'react';
import {
  COHORT_YEARS,
  NATIONAL_DIAGNOSTICS,
  type CohortYear,
  type IslandGroup,
  type RegionAttritionRecord,
} from '../data/attritionData';
import { computeYearStats, formatPercent } from '../utils/analytics';

interface OverviewChartsProps {
  regions: RegionAttritionRecord[];
  selectedYear: CohortYear;
  onSelectYear: (year: CohortYear) => void;
  selectedIsland: 'All' | IslandGroup;
  onSelectIsland: (island: 'All' | IslandGroup) => void;
  activeRegionCode: string | null;
  onSelectRegion: (region: RegionAttritionRecord) => void;
}

export const OverviewCharts: React.FC<OverviewChartsProps> = ({
  regions,
  selectedYear,
  onSelectYear,
  selectedIsland,
  onSelectIsland,
  activeRegionCode,
  onSelectRegion,
}) => {
  const [hoveredYear, setHoveredYear] = useState<CohortYear | null>(null);
  const [showMinMaxBand, setShowMinMaxBand] = useState(true);

  const yearlyStats = useMemo(() => {
    return COHORT_YEARS.map((y) => computeYearStats(regions, y)!);
  }, [regions]);

  const activeRegion = useMemo(
    () => regions.find((r) => r.code === activeRegionCode) ?? null,
    [regions, activeRegionCode]
  );

  // Ranked bar chart data for selectedYear & selectedIsland
  const { rankedRegions, missingInYear } = useMemo(() => {
    const scoped =
      selectedIsland === 'All'
        ? regions
        : regions.filter((r) => r.islandGroup === selectedIsland);

    const withRate = scoped
      .filter((r) => r.rates[selectedYear] !== null)
      .sort((a, b) => (b.rates[selectedYear] ?? 0) - (a.rates[selectedYear] ?? 0));

    const missing = scoped.filter((r) => r.rates[selectedYear] === null);
    return { rankedRegions: withRate, missingInYear: missing };
  }, [regions, selectedYear, selectedIsland]);

  const selectedYearStats = useMemo(
    () => computeYearStats(regions, selectedYear),
    [regions, selectedYear]
  );

  // SVG dimensions for trajectory chart
  const chartW = 640;
  const chartH = 290;
  const padL = 48;
  const padR = 24;
  const padT = 22;
  const padB = 38;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;
  const maxY = 100;

  const getX = (yearIndex: number) =>
    padL + (yearIndex / (COHORT_YEARS.length - 1)) * innerW;
  const getY = (val: number) => padT + innerH - (val / maxY) * innerH;

  const meanPath = yearlyStats
    .map((s, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(s.mean).toFixed(1)}`)
    .join(' ');

  const medianPath = yearlyStats
    .map((s, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(s.median).toFixed(1)}`)
    .join(' ');

  const minMaxPolygonPoints = [
    ...yearlyStats.map((s, idx) => `${getX(idx).toFixed(1)},${getY(s.max).toFixed(1)}`),
    ...[...yearlyStats]
      .reverse()
      .map((s, idx) => {
        const origIdx = yearlyStats.length - 1 - idx;
        return `${getX(origIdx).toFixed(1)},${getY(s.min).toFixed(1)}`;
      }),
  ].join(' ');

  // Build active region SVG path with gap support (breaks line on null)
  const activeRegionSegments = useMemo(() => {
    if (!activeRegion) return [];
    const segments: Array<Array<{ idx: number; val: number }>> = [];
    let current: Array<{ idx: number; val: number }> = [];
    COHORT_YEARS.forEach((yr, idx) => {
      const val = activeRegion.rates[yr];
      if (val !== null) {
        current.push({ idx, val });
      } else if (current.length > 0) {
        segments.push(current);
        current = [];
      }
    });
    if (current.length > 0) segments.push(current);
    return segments;
  }, [activeRegion]);

  const maxBarScale = selectedYear === 2022 || selectedYear === 2023 ? 100 : 50;
  const focusedYear = hoveredYear ?? selectedYear;
  const focusedStats = yearlyStats.find((s) => s.year === focusedYear)!;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left 7 cols: Time Series Trajectory */}
      <section
        aria-labelledby="trajectory-chart-heading"
        className="xl:col-span-7 bg-white border border-[#E7E2F1] rounded-lg p-5 sm:p-6 flex flex-col justify-between"
      >
        <div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
            <div>
              <h2
                id="trajectory-chart-heading"
                className="text-base font-semibold text-slate-900 tracking-tight"
              >
                National vs. Regional Cohort Trajectory (2022–2025)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Reported national rate (2022 &amp; 2025 endpoints) compared with unweighted regional mean, median, and min–max spread.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowMinMaxBand((v) => !v)}
              className={`self-start px-3 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B21B6] ${
                showMinMaxBand
                  ? 'bg-[#F5F2FA] border-[#D8CEEC] text-[#4C1D95]'
                  : 'bg-white border-[#E7E2F1] text-slate-600 hover:bg-[#FAF8FD]'
              }`}
            >
              {showMinMaxBand ? 'Hide Min–Max Spread' : 'Show Min–Max Spread'}
            </button>
          </div>

          {/* Interactive SVG Line Chart */}
          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-auto block"
              role="img"
              aria-label="Line chart comparing national reported attrition rate and unweighted regional mean, median, and range from 2022 to 2025"
            >
              {/* Horizontal Y Gridlines */}
              {[0, 20, 40, 60, 80, 100].map((tick) => {
                const y = getY(tick);
                return (
                  <g key={tick}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={chartW - padR}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeWidth="1"
                    />
                    <text
                      x={padL - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-500 text-[11px] font-mono tabular-nums"
                    >
                      {tick}%
                    </text>
                  </g>
                );
              })}

              {/* Min-Max regional spread band */}
              {showMinMaxBand && (
                <polygon
                  points={minMaxPolygonPoints}
                  fill="#5B21B6"
                  fillOpacity="0.09"
                />
              )}

              {/* Active selected year vertical marker */}
              <line
                x1={getX(COHORT_YEARS.indexOf(focusedYear))}
                y1={padT}
                x2={getX(COHORT_YEARS.indexOf(focusedYear))}
                y2={chartH - padB}
                stroke="#A78BFA"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* National 2022 -> 2025 reference dashed line (only 2022 & 2025 reported in Diagnostic sheet) */}
              <line
                x1={getX(0)}
                y1={getY(NATIONAL_DIAGNOSTICS.rate2022)}
                x2={getX(3)}
                y2={getY(NATIONAL_DIAGNOSTICS.rate2025)}
                stroke="#A21CAF"
                strokeWidth="2.25"
                strokeDasharray="6 4"
              />

              {/* Regional Median line */}
              <path
                d={medianPath}
                fill="none"
                stroke="#64748B"
                strokeWidth="2"
                strokeDasharray="2 3"
              />

              {/* Unweighted Regional Mean line */}
              <path
                d={meanPath}
                fill="none"
                stroke="#5B21B6"
                strokeWidth="2.75"
              />

              {/* Highlighted Region line (if selected) */}
              {activeRegionSegments.map((seg, sIdx) => {
                if (seg.length === 1) {
                  return (
                    <circle
                      key={`single-${sIdx}`}
                      cx={getX(seg[0].idx)}
                      cy={getY(seg[0].val)}
                      r="5"
                      fill="#D97706"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  );
                }
                const d = seg
                  .map(
                    (pt, idx) =>
                      `${idx === 0 ? 'M' : 'L'} ${getX(pt.idx).toFixed(1)} ${getY(pt.val).toFixed(1)}`
                  )
                  .join(' ');
                return (
                  <g key={`seg-${sIdx}`}>
                    <path d={d} fill="none" stroke="#D97706" strokeWidth="2.5" />
                    {seg.map((pt) => (
                      <circle
                        key={pt.idx}
                        cx={getX(pt.idx)}
                        cy={getY(pt.val)}
                        r="4.5"
                        fill="#D97706"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                    ))}
                  </g>
                );
              })}

              {/* National endpoint dots (2022 and 2025) */}
              <circle
                cx={getX(0)}
                cy={getY(NATIONAL_DIAGNOSTICS.rate2022)}
                r="5"
                fill="#A21CAF"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />
              <circle
                cx={getX(3)}
                cy={getY(NATIONAL_DIAGNOSTICS.rate2025)}
                r="5"
                fill="#A21CAF"
                stroke="#FFFFFF"
                strokeWidth="1.5"
              />

              {/* Mean dots + interactive columns */}
              {yearlyStats.map((s, idx) => {
                const cx = getX(idx);
                const cy = getY(s.mean);
                const isFocused = s.year === focusedYear;
                return (
                  <g key={s.year}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isFocused ? 5.5 : 4}
                      fill="#5B21B6"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <text
                      x={cx}
                      y={chartH - 12}
                      textAnchor="middle"
                      className={`text-[12px] font-mono tabular-nums ${
                        isFocused ? 'fill-[#5B21B6] font-semibold' : 'fill-slate-600'
                      }`}
                    >
                      {s.year}
                    </text>
                    {/* Invisible wide hit column for hover/click */}
                    <rect
                      x={cx - 48}
                      y={padT}
                      width="96"
                      height={innerH + 28}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredYear(s.year)}
                      onMouseLeave={() => setHoveredYear(null)}
                      onClick={() => onSelectYear(s.year)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Legend + Active Year Readout Strip */}
        <div className="mt-4 pt-4 border-t border-[#E7E2F1] flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-700">
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#5B21B6] inline-block" aria-hidden="true" />
              Unweighted Regional Mean
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="w-4 h-0.5 border-t-2 border-dashed border-[#A21CAF] inline-block"
                aria-hidden="true"
              />
              Reported National Rate (2022 &amp; 2025)
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="w-4 h-0.5 border-t-2 border-dotted border-slate-500 inline-block"
                aria-hidden="true"
              />
              Regional Median
            </span>
            {activeRegion && (
              <span className="inline-flex items-center gap-2 font-medium text-amber-800">
                <span className="w-4 h-0.5 bg-amber-600 inline-block" aria-hidden="true" />
                {activeRegion.code} ({activeRegion.name})
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8FD] border border-[#E7E2F1] rounded-md px-3.5 py-2.5 text-xs">
            <div>
              <div className="text-slate-500">Cohort Year</div>
              <div className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5">
                {focusedStats.year} (n={focusedStats.count})
              </div>
            </div>
            <div>
              <div className="text-slate-500">Regional Mean</div>
              <div className="font-mono font-semibold text-[#5B21B6] tabular-nums mt-0.5">
                {focusedStats.mean.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-slate-500">Regional Median</div>
              <div className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5">
                {focusedStats.median.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-slate-500">Min – Max Range</div>
              <div className="font-mono font-semibold text-slate-900 tabular-nums mt-0.5">
                {focusedStats.min.toFixed(2)}% – {focusedStats.max.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right 5 cols: Ranked Regional Bar Chart for Selected Year */}
      <section
        aria-labelledby="ranking-chart-heading"
        className="xl:col-span-5 bg-white border border-[#E7E2F1] rounded-lg p-5 sm:p-6 flex flex-col"
      >
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2
                id="ranking-chart-heading"
                className="text-base font-semibold text-slate-900 tracking-tight"
              >
                {selectedYear} Regional Attrition Ranking
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Click any region bar to inspect its 2022–2025 trajectory and validation record.
              </p>
            </div>
          </div>

          {/* Year & Island Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div
              className="inline-flex items-center p-0.5 bg-[#F5F2FA] border border-[#E7E2F1] rounded-md"
              role="group"
              aria-label="Select cohort year"
            >
              {COHORT_YEARS.map((yr) => {
                const active = yr === selectedYear;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => onSelectYear(yr)}
                    className={`px-2.5 py-1.5 text-xs font-mono font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5B21B6] ${
                      active
                        ? 'bg-[#5B21B6] text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <label htmlFor="overview-island-filter" className="sr-only">
                Filter by island group
              </label>
              <select
                id="overview-island-filter"
                value={selectedIsland}
                onChange={(e) => onSelectIsland(e.target.value as 'All' | IslandGroup)}
                className="h-9 px-2.5 text-xs font-medium bg-white border border-[#E7E2F1] rounded-md text-slate-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5B21B6]"
              >
                <option value="All">All Islands (18)</option>
                <option value="Luzon">Luzon (8)</option>
                <option value="Visayas">Visayas (4)</option>
                <option value="Mindanao">Mindanao (6)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bars list */}
        <div className="flex-1 space-y-1 max-h-[390px] overflow-y-auto pr-1">
          {rankedRegions.map((region, idx) => {
            const val = region.rates[selectedYear]!;
            const widthPct = Math.min(100, (val / maxBarScale) * 100);
            const isSelected = region.code === activeRegionCode;
            const isHighest = selectedYearStats && val === selectedYearStats.max;
            const isLowest = selectedYearStats && val === selectedYearStats.min;

            let barColor = 'bg-[#5B21B6]';
            if (isHighest) barColor = 'bg-red-700';
            else if (isLowest) barColor = 'bg-emerald-700';
            else if (isSelected) barColor = 'bg-amber-600';

            return (
              <button
                key={region.code}
                type="button"
                onClick={() => onSelectRegion(region)}
                aria-label={`Inspect ${region.name} (${region.code}), ${selectedYear} attrition rate ${val.toFixed(2)}%`}
                className={`w-full text-left px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#5B21B6] ${
                  isSelected
                    ? 'bg-amber-50/70 border-amber-300'
                    : 'bg-white border-transparent hover:bg-[#FAF8FD] hover:border-[#E7E2F1]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs mb-1">
                  <span className="truncate font-medium text-slate-800">
                    <span className="font-mono text-slate-400 mr-1.5 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-slate-900">{region.name}</span>
                    <span className="text-slate-500 ml-1.5">· {region.code}</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums shrink-0">
                    {formatPercent(val)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-sm overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-200`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </button>
            );
          })}

          {missingInYear.length > 0 && (
            <div className="pt-2 mt-2 border-t border-slate-200 space-y-1.5">
              {missingInYear.map((region) => (
                <button
                  key={region.code}
                  type="button"
                  onClick={() => onSelectRegion(region)}
                  aria-label={`Inspect ${region.name} (${region.code}), no source data in ${selectedYear}`}
                  className="w-full text-left px-2.5 py-2 rounded-md border border-dashed border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 transition-colors cursor-pointer flex items-center justify-between gap-2 text-xs"
                >
                  <span className="truncate text-slate-600">
                    {region.name} · {region.code}
                  </span>
                  <span className="font-mono text-amber-800 font-medium shrink-0">
                    N/A (No {selectedYear} Data)
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
