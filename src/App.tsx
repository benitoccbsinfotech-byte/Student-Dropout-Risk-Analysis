import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Download,
  Menu,
  Table2,
  X,
  ArrowDownRight,
} from 'lucide-react';
import {
  NATIONAL_DIAGNOSTICS,
  REGIONAL_ATTRITION_DATA,
  type CohortYear,
  type IslandGroup,
  type RegionAttritionRecord,
} from './data/attritionData';
import { computeYearStats, generateRegionsCsv } from './utils/analytics';
import { OverviewCharts } from './components/OverviewCharts';
import { RegionalComparisonView } from './components/RegionalComparisonView';
import { StatisticalAuditView } from './components/StatisticalAuditView';
import { PolicyAndSourcesView } from './components/PolicyAndSourcesView';
import { RegionDetailDrawer } from './components/RegionDetailDrawer';
import educationalBackdrop from './assets/images/educational_campus_backdrop_1794578879842.jpg';

type DashboardTab = 'overview' | 'comparison' | 'audit' | 'policy';

const NAV_ITEMS: Array<{
  id: DashboardTab;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'overview',
    label: 'Overview & Trends',
    description: 'National trajectory & rankings',
    icon: BarChart3,
  },
  {
    id: 'comparison',
    label: 'Regional Dataset',
    description: '18 regions · Raw & cleaned grid',
    icon: Table2,
  },
  {
    id: 'audit',
    label: 'Statistical Audit',
    description: 'Descriptive & diagnostic stats',
    icon: ClipboardCheck,
  },
  {
    id: 'policy',
    label: 'Policy & Sources',
    description: 'Recommendations & citations',
    icon: BookOpen,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<CohortYear>(2025);
  const [selectedIsland, setSelectedIsland] = useState<'All' | IslandGroup>('All');
  const [inspectedRegion, setInspectedRegion] = useState<RegionAttritionRecord | null>(null);
  const [comparedCodes, setComparedCodes] = useState<string[]>([
    'Region XI',
    'Region IV-A',
    'NCR',
    'Region VII',
  ]);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [backdropError, setBackdropError] = useState(false);

  const stats2025 = useMemo(
    () => computeYearStats(REGIONAL_ATTRITION_DATA, 2025)!,
    []
  );

  const islandSummaries = useMemo(() => {
    const groups: IslandGroup[] = ['Luzon', 'Visayas', 'Mindanao'];
    return groups.map((group) => {
      const groupRegions = REGIONAL_ATTRITION_DATA.filter((r) => r.islandGroup === group);
      const valid2025 = groupRegions.filter((r) => r.rates[2025] !== null);
      const avg2025 =
        valid2025.reduce((acc, r) => acc + (r.rates[2025] ?? 0), 0) / valid2025.length;
      const highest = [...valid2025].sort(
        (a, b) => (b.rates[2025] ?? 0) - (a.rates[2025] ?? 0)
      )[0];
      return {
        group,
        totalRegions: groupRegions.length,
        reported2025: valid2025.length,
        avg2025,
        highest,
      };
    });
  }, []);

  const handleToggleCompare = (code: string) => {
    setComparedCodes((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, code];
    });
  };

  const handleExportCsv = () => {
    const csv = generateRegionsCsv(REGIONAL_ATTRITION_DATA);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edcom-ii-regional-cohort-attrition-2022-2025.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportMessage('CSV downloaded (18 regions)');
    window.setTimeout(() => setExportMessage(null), 3000);
  };

  const activeNavMeta = NAV_ITEMS.find((item) => item.id === activeTab)!;

  return (
    <div className="min-h-screen bg-[#FAF8FD] text-slate-900 flex">
      {/* Desktop Sidebar (256px) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-[#E7E2F1] z-30">
        <div className="h-14 px-5 flex items-center border-b border-[#E7E2F1]">
          <span className="font-display font-bold text-sm tracking-tight text-[#5B21B6] whitespace-nowrap">
            Student Dropout Risk
          </span>
        </div>

        <nav aria-label="Dashboard sections" className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B21B6] ${
                  isActive
                    ? 'bg-[#5B21B6] text-white'
                    : 'text-slate-700 hover:bg-[#F5F2FA] hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-500'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold whitespace-nowrap truncate">
                    {item.label}
                  </div>
                  <div
                    className={`text-[11px] truncate ${
                      isActive ? 'text-violet-100' : 'text-slate-500'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E7E2F1] text-[11px] text-slate-600 space-y-2">
          <div>
            <div className="font-semibold text-slate-800">Presented By</div>
            <div className="text-slate-700 mt-0.5">
              Franco, Benito, Guingona, &amp; Magsanay
            </div>
            <div className="text-slate-500">BS Information Technology - 2B</div>
          </div>
          <div className="pt-2 border-t border-[#E7E2F1] space-y-0.5">
            <div className="font-semibold text-slate-800">Dataset Scope</div>
            <div>EDCOM II Final Report (2026)</div>
            <div>Table 6, p.224 · OPRKM, CHED</div>
            <div className="font-mono text-slate-500 pt-0.5">
              18 Regions · Cohorts 2022–2025
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div
            className="fixed inset-0 bg-slate-900/35"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-white h-full border-r border-[#E7E2F1] flex flex-col">
            <div className="h-14 px-4 flex items-center justify-between border-b border-[#E7E2F1]">
              <span className="font-display font-bold text-sm text-[#5B21B6]">
                Student Dropout Risk
              </span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-md text-slate-600 hover:bg-[#F5F2FA] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileNavOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-left min-h-[44px] cursor-pointer ${
                      isActive
                        ? 'bg-[#5B21B6] text-white'
                        : 'text-slate-700 hover:bg-[#F5F2FA]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 relative bg-[#F5F1FB]">
        {/* Educational Campus & Academic Grid Background Layer */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 lg:left-64 z-0 overflow-hidden bg-[#F5F1FB]"
        >
          {!backdropError && (
            <img
              src={educationalBackdrop}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setBackdropError(true)}
              className="w-full h-full object-cover object-center opacity-[0.28] saturate-[0.8]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8FD]/72 via-[#F6F2FC]/80 to-[#F2ECFA]/88" />
          <div className="absolute inset-0 bg-academic-grid" />
        </div>

        {/* Top Bar Contract (single row, <= 56px tall) */}
        <header className="sticky top-0 z-20 h-14 bg-white/95 backdrop-blur-sm border-b border-[#E7E2F1] px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs min-w-0">
              <span className="font-semibold text-slate-900 truncate sm:hidden">
                {activeNavMeta.label}
              </span>
              <span className="font-semibold text-slate-900 whitespace-nowrap hidden sm:inline">
                Student Dropout Risk Analysis
              </span>
              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="text-slate-600 hidden sm:inline truncate">
                {activeNavMeta.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {exportMessage && (
              <span className="text-xs text-emerald-700 font-medium hidden sm:inline whitespace-nowrap">
                {exportMessage}
              </span>
            )}
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] text-xs font-medium bg-[#5B21B6] text-white rounded-md hover:bg-[#4C1D95] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B21B6]"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export CSV</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="relative z-10 flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* Page Intro Header */}
          <div className="relative overflow-hidden bg-white/95 border border-[#E7E2F1] rounded-lg p-5 sm:p-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            {!backdropError && (
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
                <img
                  src={educationalBackdrop}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center opacity-[0.22] saturate-[0.8]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(110deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.92) 55%, rgba(246,242,252,0.74) 100%)',
                  }}
                />
              </div>
            )}
            <div className="relative z-10 space-y-1.5 max-w-3xl">
              <div className="text-xs font-medium text-[#5B21B6]">
                Business Analytics · EDCOM II / CHED Cohort Data (2022–2025)
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-balance">
                {activeTab === 'overview' && 'Student Dropout Risk Analysis'}
                {activeTab === 'comparison' && 'Student Dropout Risk Analysis — Regional Dataset'}
                {activeTab === 'audit' && 'Student Dropout Risk Analysis — Statistical Audit'}
                {activeTab === 'policy' && 'Student Dropout Risk Analysis — Policy & Sources'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                {activeTab === 'overview' &&
                  'A Data-Driven Approach to Understanding Academic Persistence in Higher Education across 18 Philippine regions (EDCOM II Final Report 2026, Table 6, p.224).'}
                {activeTab === 'comparison' &&
                  'Inspect raw source provenance and cleaned rankings, sort by cohort year, and compare up to four regional trajectories.'}
                {activeTab === 'audit' &&
                  'Verified unweighted regional summaries, national time-series diagnostics, and workbook reconciliation notes.'}
                {activeTab === 'policy' &&
                  'Actionable policy guidance grounded in dataset scope alongside primary CHED and EDCOM II bibliographic citations.'}
              </p>
            </div>

            <div className="relative z-10 lg:text-right border-t lg:border-t-0 pt-3 lg:pt-0 border-[#E7E2F1] shrink-0">
              <div className="text-[11px] font-medium text-slate-600">Presented by</div>
              <div className="text-xs font-semibold text-slate-900 mt-0.5">
                Franco, Benito, Guingona, &amp; Magsanay
              </div>
              <div className="text-xs text-slate-700">
                BS Information Technology - 2B
              </div>
            </div>
          </div>

          {/* VIEW 1: OVERVIEW & TRENDS */}
          {activeTab === 'overview' && (
            <>
              {/* 4-Column Executive KPI Strip */}
              <section
                aria-label="Key attrition metrics"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
              >
                <div className="bg-white border border-[#E7E2F1] rounded-lg p-4 sm:p-5">
                  <div className="text-xs font-medium text-slate-500">
                    National Rate (2022 → 2025)
                  </div>
                  <div className="mt-2 flex items-baseline gap-2.5">
                    <span className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
                      {NATIONAL_DIAGNOSTICS.rate2025.toFixed(2)}%
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-xs font-mono font-semibold text-emerald-700 tabular-nums">
                      <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
                      {NATIONAL_DIAGNOSTICS.change2022To2025.toFixed(2)} pp
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1.5">
                    Down from <span className="font-mono tabular-nums">39.30%</span> in 2022 (descriptive change)
                  </div>
                </div>

                <div className="bg-white border border-[#E7E2F1] rounded-lg p-4 sm:p-5">
                  <div className="text-xs font-medium text-slate-500">
                    2025 Regional Mean (Unweighted)
                  </div>
                  <div className="mt-2 flex items-baseline gap-2.5">
                    <span className="text-2xl font-mono font-bold text-[#5B21B6] tabular-nums">
                      {stats2025.mean.toFixed(2)}%
                    </span>
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      Median {stats2025.median.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1.5">
                    <span className="font-mono tabular-nums">{stats2025.count}</span> regions reported · BARMM N/A
                  </div>
                </div>

                <div className="bg-white border border-[#E7E2F1] rounded-lg p-4 sm:p-5">
                  <div className="text-xs font-medium text-slate-500">
                    Highest 2025 Regional Rate
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-mono font-bold text-red-700 tabular-nums">
                      {NATIONAL_DIAGNOSTICS.highest2025Rate.toFixed(2)}%
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setInspectedRegion(
                          REGIONAL_ATTRITION_DATA.find((r) => r.code === 'Region XI') ?? null
                        )
                      }
                      className="text-xs font-medium text-[#5B21B6] hover:underline cursor-pointer whitespace-nowrap"
                    >
                      Inspect Region XI
                    </button>
                  </div>
                  <div className="text-xs text-slate-600 mt-1.5">
                    Davao Region (Rank #1 of 17 in 2025)
                  </div>
                </div>

                <div className="bg-white border border-[#E7E2F1] rounded-lg p-4 sm:p-5">
                  <div className="text-xs font-medium text-slate-500">
                    Lowest 2025 Regional Rate
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-mono font-bold text-emerald-700 tabular-nums">
                      {NATIONAL_DIAGNOSTICS.lowest2025Rate.toFixed(2)}%
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setInspectedRegion(
                          REGIONAL_ATTRITION_DATA.find((r) => r.code === 'Region IV-A') ?? null
                        )
                      }
                      className="text-xs font-medium text-[#5B21B6] hover:underline cursor-pointer whitespace-nowrap"
                    >
                      Inspect Region IV-A
                    </button>
                  </div>
                  <div className="text-xs text-slate-600 mt-1.5">
                    CALABARZON (Rank #17 of 17 in 2025)
                  </div>
                </div>
              </section>

              {/* Main Trajectory + Ranking Charts */}
              <OverviewCharts
                regions={REGIONAL_ATTRITION_DATA}
                selectedYear={selectedYear}
                onSelectYear={setSelectedYear}
                selectedIsland={selectedIsland}
                onSelectIsland={setSelectedIsland}
                activeRegionCode={inspectedRegion?.code ?? null}
                onSelectRegion={(region) => setInspectedRegion(region)}
              />

              {/* Island Group Summary & Methodological Notice */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white border border-[#E7E2F1] rounded-lg p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">
                        2025 Island Group Breakdown
                      </h2>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Click an island group to filter the ranking chart above.
                      </p>
                    </div>
                    {selectedIsland !== 'All' && (
                      <button
                        type="button"
                        onClick={() => setSelectedIsland('All')}
                        className="text-xs font-medium text-[#5B21B6] hover:underline cursor-pointer"
                      >
                        Show All Islands
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {islandSummaries.map((item) => {
                      const isActive = selectedIsland === item.group;
                      return (
                        <button
                          key={item.group}
                          type="button"
                          onClick={() =>
                            setSelectedIsland(isActive ? 'All' : item.group)
                          }
                          className={`text-left p-3.5 rounded-md border transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#5B21B6]/8 border-[#5B21B6]'
                              : 'bg-[#FAF8FD] border-[#E7E2F1] hover:bg-[#F3EFFB]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-900">
                              {item.group}
                            </span>
                            <span className="font-mono text-slate-500">
                              {item.reported2025}/{item.totalRegions} in 2025
                            </span>
                          </div>
                          <div className="text-xl font-mono font-bold text-slate-900 tabular-nums mt-2">
                            {item.avg2025.toFixed(2)}%
                          </div>
                          <div className="text-[11px] text-slate-600 mt-1 truncate">
                            Peak: {item.highest.name} ({item.highest.rates[2025]?.toFixed(2)}%)
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white border border-[#E7E2F1] rounded-lg p-5 sm:p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Methodological Scope &amp; Data Caveats
                    </h2>
                    <p className="text-xs text-slate-700 leading-relaxed mt-2">
                      {NATIONAL_DIAGNOSTICS.measureDefinitionAndLimitation}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                      Missing observations are preserved as blank N/A cells—BARMM has no published data for 2024–2025 (93.40% in 2022, 95.56% in 2023), and Negros Island Region (NIR) is N/A in 2022.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-[#E7E2F1] flex flex-wrap items-center gap-4 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('audit')}
                      className="font-medium text-[#5B21B6] hover:underline cursor-pointer"
                    >
                      View Statistical Audit →
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('policy')}
                      className="font-medium text-[#5B21B6] hover:underline cursor-pointer"
                    >
                      View Recommendations →
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* VIEW 2: REGIONAL DATASET & COMPARISON */}
          {activeTab === 'comparison' && (
            <RegionalComparisonView
              regions={REGIONAL_ATTRITION_DATA}
              comparedCodes={comparedCodes}
              onToggleCompare={handleToggleCompare}
              onClearCompare={() => setComparedCodes([])}
              onSelectRegion={(region) => setInspectedRegion(region)}
            />
          )}

          {/* VIEW 3: STATISTICAL AUDIT */}
          {activeTab === 'audit' && (
            <StatisticalAuditView regions={REGIONAL_ATTRITION_DATA} />
          )}

          {/* VIEW 4: POLICY & SOURCES */}
          {activeTab === 'policy' && <PolicyAndSourcesView />}

          <footer className="pt-4 border-t border-[#E7E2F1] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
            <div>
              Presented by Franco, Benito, Guingona, &amp; Magsanay · BS Information Technology - 2B
            </div>
            <div>
              Business Analytics · EDCOM II Final Report (2026), Table 6, p.224
            </div>
          </footer>
        </main>
      </div>

      {/* Region Detail Inspection Drawer */}
      <RegionDetailDrawer
        region={inspectedRegion}
        onClose={() => setInspectedRegion(null)}
        onToggleCompare={handleToggleCompare}
        isInComparison={
          inspectedRegion ? comparedCodes.includes(inspectedRegion.code) : false
        }
      />
    </div>
  );
}
