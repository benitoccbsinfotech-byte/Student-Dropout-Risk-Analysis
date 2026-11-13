import React, { useMemo, useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, RotateCcw } from 'lucide-react';
import {
  COHORT_YEARS,
  type IslandGroup,
  type RegionAttritionRecord,
} from '../data/attritionData';
import {
  computeRegionChange,
  filterAndSortRegions,
  formatPercent,
  formatSignedPp,
  type CompletenessFilter,
  type SortDirection,
  type SortField,
} from '../utils/analytics';

interface RegionalComparisonViewProps {
  regions: RegionAttritionRecord[];
  comparedCodes: string[];
  onToggleCompare: (code: string) => void;
  onClearCompare: () => void;
  onSelectRegion: (region: RegionAttritionRecord) => void;
}

const SERIES_COLORS = ['#5B21B6', '#A21CAF', '#0F766E', '#D97706'];

export const RegionalComparisonView: React.FC<RegionalComparisonViewProps> = ({
  regions,
  comparedCodes,
  onToggleCompare,
  onClearCompare,
  onSelectRegion,
}) => {
  const [search, setSearch] = useState('');
  const [islandGroup, setIslandGroup] = useState<'All' | IslandGroup>('All');
  const [completeness, setCompleteness] = useState<CompletenessFilter>('all');
  const [sortField, setSortField] = useState<SortField>('rank2025');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [tableMode, setTableMode] = useState<'cleaned' | 'raw'>('cleaned');

  const filteredRegions = useMemo(
    () =>
      filterAndSortRegions(regions, {
        search,
        islandGroup,
        completeness,
        sortField,
        sortDirection,
      }),
    [regions, search, islandGroup, completeness, sortField, sortDirection]
  );

  const comparedRegions = useMemo(
    () =>
      comparedCodes
        .map((code) => regions.find((r) => r.code === code))
        .filter((r): r is RegionAttritionRecord => Boolean(r)),
    [regions, comparedCodes]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'code' || field === 'name' || field === 'rank2025' ? 'asc' : 'desc');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setIslandGroup('All');
    setCompleteness('all');
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-white shrink-0" aria-hidden="true" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-white shrink-0" aria-hidden="true" />
    );
  };

  // Multi-region comparison SVG geometry
  const compW = 720;
  const compH = 220;
  const padL = 46;
  const padR = 24;
  const padT = 18;
  const padB = 30;
  const innerW = compW - padL - padR;
  const innerH = compH - padT - padB;
  const maxCompRate = useMemo(() => {
    const vals = comparedRegions.flatMap((r) =>
      COHORT_YEARS.map((y) => r.rates[y]).filter((v): v is number => v !== null)
    );
    const highest = vals.length > 0 ? Math.max(...vals) : 60;
    return highest > 65 ? 100 : 70;
  }, [comparedRegions]);

  const getCompX = (idx: number) =>
    padL + (idx / (COHORT_YEARS.length - 1)) * innerW;
  const getCompY = (val: number) =>
    padT + innerH - (val / maxCompRate) * innerH;

  return (
    <div className="space-y-6">
      {/* Multi-Region Trajectory Comparator */}
      <section
        aria-labelledby="comparator-heading"
        className="bg-white border border-[#E7E2F1] rounded-lg p-5 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 id="comparator-heading" className="text-base font-semibold text-slate-900">
              Multi-Region Trajectory Comparator ({comparedRegions.length}/4 selected)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Toggle checkboxes in the table below to compare up to 4 regions across 2022–2025. Missing observations break lines cleanly rather than dropping to zero.
            </p>
          </div>
          {comparedRegions.length > 0 && (
            <button
              type="button"
              onClick={onClearCompare}
              className="self-start px-3 py-2 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Clear Selection
            </button>
          )}
        </div>

        {comparedRegions.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-md py-8 px-4 text-center text-xs text-slate-600">
            Select up to 4 regions in the dataset table below to overlay their cohort attrition trajectories.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-8">
              <svg
                viewBox={`0 0 ${compW} ${compH}`}
                className="w-full h-auto block"
                role="img"
                aria-label={`Comparison line chart for ${comparedRegions.map((r) => r.name).join(', ')}`}
              >
                {(maxCompRate === 100 ? [0, 25, 50, 75, 100] : [0, 20, 40, 60]).map((tick) => {
                  const y = getCompY(tick);
                  return (
                    <g key={tick}>
                      <line
                        x1={padL}
                        y1={y}
                        x2={compW - padR}
                        y2={y}
                        stroke="#E2E8F0"
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

                {COHORT_YEARS.map((yr, idx) => (
                  <text
                    key={yr}
                    x={getCompX(idx)}
                    y={compH - 8}
                    textAnchor="middle"
                    className="fill-slate-600 text-[11px] font-mono tabular-nums"
                  >
                    {yr}
                  </text>
                ))}

                {comparedRegions.map((region, rIdx) => {
                  const color = SERIES_COLORS[rIdx % SERIES_COLORS.length];
                  const segments: Array<Array<{ idx: number; val: number }>> = [];
                  let current: Array<{ idx: number; val: number }> = [];
                  COHORT_YEARS.forEach((yr, idx) => {
                    const val = region.rates[yr];
                    if (val !== null) current.push({ idx, val });
                    else if (current.length > 0) {
                      segments.push(current);
                      current = [];
                    }
                  });
                  if (current.length > 0) segments.push(current);

                  return (
                    <g key={region.code}>
                      {segments.map((seg, sIdx) => {
                        if (seg.length < 2) return null;
                        const d = seg
                          .map(
                            (p, i) =>
                              `${i === 0 ? 'M' : 'L'} ${getCompX(p.idx).toFixed(1)} ${getCompY(p.val).toFixed(1)}`
                          )
                          .join(' ');
                        return (
                          <path
                            key={sIdx}
                            d={d}
                            fill="none"
                            stroke={color}
                            strokeWidth="2.5"
                          />
                        );
                      })}
                      {COHORT_YEARS.map((yr, idx) => {
                        const val = region.rates[yr];
                        if (val === null) return null;
                        return (
                          <circle
                            key={yr}
                            cx={getCompX(idx)}
                            cy={getCompY(val)}
                            r="4"
                            fill={color}
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="lg:col-span-4 divide-y divide-slate-200 border border-slate-200 rounded-md">
              {comparedRegions.map((region, rIdx) => {
                const color = SERIES_COLORS[rIdx % SERIES_COLORS.length];
                const change = computeRegionChange(region);
                return (
                  <div
                    key={region.code}
                    className="px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-1 rounded-xs shrink-0"
                          style={{ backgroundColor: color }}
                          aria-hidden="true"
                        />
                        <button
                          type="button"
                          onClick={() => onSelectRegion(region)}
                          className="font-semibold text-slate-900 hover:text-[#5B21B6] truncate text-left cursor-pointer"
                        >
                          {region.name}
                        </button>
                      </div>
                      <div className="text-slate-500 font-mono tabular-nums mt-0.5 pl-5">
                        2025: {formatPercent(region.rates[2025])} · Δ {formatSignedPp(change)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleCompare(region.code)}
                      aria-label={`Remove ${region.name} from comparison`}
                      className="text-slate-500 hover:text-slate-900 px-2 py-1 rounded border border-slate-200 text-[11px] shrink-0 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Main Interactive Regional Table */}
      <section
        aria-labelledby="regional-table-heading"
        className="bg-white border border-[#E7E2F1] rounded-lg overflow-hidden"
      >
        <div className="p-5 sm:p-6 border-b border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 id="regional-table-heading" className="text-base font-semibold text-slate-900">
                Regional Cohort Attrition Dataset ({filteredRegions.length} of {regions.length} regions)
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                EDCOM II Final Report (2026), Higher Education Table 6, p.224. Blank cells preserve source N/A or No Data—never zero.
              </p>
            </div>

            {/* Cleaned vs Raw Provenance Mode */}
            <div
              className="inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-md self-start"
              role="group"
              aria-label="Dataset view mode"
            >
              <button
                type="button"
                onClick={() => setTableMode('cleaned')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  tableMode === 'cleaned'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cleaned Analysis View
              </button>
              <button
                type="button"
                onClick={() => setTableMode('raw')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  tableMode === 'raw'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Raw Source Provenance
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <label htmlFor="region-search-input" className="sr-only">
                Search regions by code or name
              </label>
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="region-search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search region code or name (e.g. Davao, NCR)..."
                className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-[#E7E2F1] rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#5B21B6]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                className="inline-flex items-center p-0.5 bg-[#F5F2FA] border border-[#E7E2F1] rounded-md overflow-x-auto max-w-full"
                role="group"
                aria-label="Filter by island group"
              >
                {(['All', 'Luzon', 'Visayas', 'Mindanao'] as const).map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setIslandGroup(group)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      islandGroup === group
                        ? 'bg-[#5B21B6] text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>

              <div>
                <label htmlFor="completeness-select" className="sr-only">
                  Filter by data completeness
                </label>
                <select
                  id="completeness-select"
                  value={completeness}
                  onChange={(e) => setCompleteness(e.target.value as CompletenessFilter)}
                  className="h-10 px-3 text-xs font-medium bg-white border border-slate-200 rounded-md text-slate-800 cursor-pointer"
                >
                  <option value="all">All Records (18)</option>
                  <option value="complete">Complete 2022–2025 (16)</option>
                  <option value="incomplete">Missing Observations (2)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table or Empty State */}
        {filteredRegions.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm font-medium text-slate-900">
              No regions match your current search or filters.
            </p>
            <p className="text-xs text-slate-600">
              Clear your search query or reset the island and completeness filters to view all 18 official records.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md bg-[#5B21B6] text-white hover:bg-[#4C1D95] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#5B21B6] text-white">
                  <th className="px-2.5 py-3 text-left font-medium w-9">
                    <span className="sr-only">Compare</span>
                    Cmp
                  </th>
                  <th className="px-2.5 py-3 text-left font-medium whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSort('code')}
                      className="inline-flex items-center gap-1 font-medium text-white hover:text-slate-200 cursor-pointer"
                    >
                      Code
                      {renderSortIcon('code')}
                    </button>
                  </th>
                  <th className="px-2.5 py-3 text-left font-medium whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="inline-flex items-center gap-1 font-medium text-white hover:text-slate-200 cursor-pointer"
                    >
                      Region Name
                      {renderSortIcon('name')}
                    </button>
                  </th>
                  {COHORT_YEARS.map((yr) => {
                    const key = String(yr) as SortField;
                    return (
                      <th key={yr} className="px-2.5 py-3 text-right font-medium whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleSort(key)}
                          className="inline-flex items-center justify-end gap-1 font-medium text-white hover:text-slate-200 cursor-pointer ml-auto"
                        >
                          {yr}
                          {renderSortIcon(key)}
                        </button>
                      </th>
                    );
                  })}
                  {tableMode === 'cleaned' ? (
                    <>
                      <th className="px-2.5 py-3 text-right font-medium whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleSort('change22to25')}
                          className="inline-flex items-center justify-end gap-1 font-medium text-white hover:text-slate-200 cursor-pointer ml-auto"
                        >
                          22–25 Δ
                          {renderSortIcon('change22to25')}
                        </button>
                      </th>
                      <th className="px-2.5 py-3 text-right font-medium whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleSort('rank2025')}
                          className="inline-flex items-center justify-end gap-1 font-medium text-white hover:text-slate-200 cursor-pointer ml-auto"
                        >
                          2025 Rank
                          {renderSortIcon('rank2025')}
                        </button>
                      </th>
                      <th className="px-2.5 py-3 text-left font-medium whitespace-nowrap">
                        Source
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-2.5 py-3 text-left font-medium whitespace-nowrap">
                        Source / Table
                      </th>
                      <th className="px-2.5 py-3 text-left font-medium whitespace-nowrap">
                        Validation Note
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRegions.map((region) => {
                  const change = computeRegionChange(region);
                  const isCompared = comparedCodes.includes(region.code);
                  const disableCheckbox = !isCompared && comparedCodes.length >= 4;

                  return (
                    <tr
                      key={region.code}
                      className={`hover:bg-[#FAF8FD] transition-colors ${
                        isCompared ? 'bg-[#F5F2FA]/70' : 'bg-white'
                      }`}
                    >
                      <td className="px-2.5 py-2.5">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          disabled={disableCheckbox}
                          onChange={() => onToggleCompare(region.code)}
                          aria-label={`Select ${region.name} for multi-region comparison`}
                          className="w-4 h-4 rounded border-slate-300 accent-[#5B21B6] cursor-pointer disabled:opacity-40"
                        />
                      </td>
                      <td className="px-2.5 py-2.5 font-mono text-slate-700 whitespace-nowrap">
                        {region.code}
                      </td>
                      <td className="px-2.5 py-2.5 max-w-[260px]">
                        <div className="truncate">
                          <button
                            type="button"
                            onClick={() => onSelectRegion(region)}
                            className="font-medium text-slate-900 hover:text-[#5B21B6] hover:underline text-left cursor-pointer"
                            title={region.name}
                          >
                            {region.name}
                          </button>
                          <span className="text-slate-400 ml-1.5">· {region.islandGroup}</span>
                        </div>
                      </td>
                      {COHORT_YEARS.map((yr) => {
                        const val = region.rates[yr];
                        return (
                          <td
                            key={yr}
                            className={`px-2.5 py-2.5 text-right font-mono tabular-nums whitespace-nowrap ${
                              val === null
                                ? 'text-amber-700 bg-amber-50/40'
                                : 'text-slate-900'
                            }`}
                          >
                            {val !== null ? `${val.toFixed(2)}%` : '—'}
                          </td>
                        );
                      })}
                      {tableMode === 'cleaned' ? (
                        <>
                          <td
                            className={`px-2.5 py-2.5 text-right font-mono tabular-nums whitespace-nowrap font-medium ${
                              change === null
                                ? 'text-slate-400'
                                : change < 0
                                ? 'text-emerald-700'
                                : 'text-red-700'
                            }`}
                          >
                            {formatSignedPp(change)}
                          </td>
                          <td className="px-2.5 py-2.5 text-right font-mono tabular-nums text-slate-800 whitespace-nowrap">
                            {region.rank2025 !== null ? `#${region.rank2025}` : '—'}
                          </td>
                          <td className="px-2.5 py-2.5 text-slate-600 whitespace-nowrap">
                            {region.sourceId} · Cohort
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-2.5 py-2.5 text-slate-700 whitespace-nowrap">
                            {region.sourceTable}
                          </td>
                          <td className="px-2.5 py-2.5 text-slate-600 min-w-[240px]">
                            {region.rawValidationNote}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
