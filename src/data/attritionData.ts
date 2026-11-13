export type CohortYear = 2022 | 2023 | 2024 | 2025;
export type IslandGroup = 'Luzon' | 'Visayas' | 'Mindanao';

export interface RegionAttritionRecord {
  code: string;
  name: string;
  islandGroup: IslandGroup;
  rates: Record<CohortYear, number | null>;
  rank2025: number | null;
  sourceId: 'S1';
  sourceTable: string;
  dataLevel: string;
  rawValidationNote: string;
  cleanedValidationStatus: string;
}

export interface SourceReference {
  id: 'S1' | 'S2';
  agency: string;
  document: string;
  period: string;
  variablesSupported: string;
  url: string;
  howUsedLimitation: string;
}

export interface DiagnosticTimeSeriesItem {
  id: string;
  item: string;
  rawWorkbookValue: string;
  formattedValue: string;
  unit: string;
  interpretation: string;
  auditFlag?: string;
}

export interface RecommendationRecord {
  id: string;
  recommendation: string;
  evidence: string;
  proposedAction: string;
  expectedBenefit: string;
  resources: string;
  implementationRisk: string;
  linkedMetrics: string[];
}

export const COHORT_YEARS: CohortYear[] = [2022, 2023, 2024, 2025];

export const REGIONAL_ATTRITION_DATA: RegionAttritionRecord[] = [
  {
    code: 'Region I',
    name: 'Ilocos Region',
    islandGroup: 'Luzon',
    rates: { 2022: 48.50, 2023: 27.59, 2024: 20.26, 2025: 22.59 },
    rank2025: 16,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'Region II',
    name: 'Cagayan Valley',
    islandGroup: 'Luzon',
    rates: { 2022: 36.30, 2023: 11.34, 2024: 8.02, 2025: 24.80 },
    rank2025: 14,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'Region III',
    name: 'Central Luzon',
    islandGroup: 'Luzon',
    rates: { 2022: 41.00, 2023: 30.54, 2024: 22.15, 2025: 24.38 },
    rank2025: 15,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'Region IV-A',
    name: 'CALABARZON',
    islandGroup: 'Luzon',
    rates: { 2022: 44.20, 2023: 34.06, 2024: 24.00, 2025: 17.65 },
    rank2025: 17,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'Region V',
    name: 'Bicol Region',
    islandGroup: 'Luzon',
    rates: { 2022: 39.40, 2023: 25.54, 2024: 31.69, 2025: 27.52 },
    rank2025: 12,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'Region VI',
    name: 'Western Visayas',
    islandGroup: 'Visayas',
    rates: { 2022: 50.20, 2023: 33.45, 2024: 24.67, 2025: 26.93 },
    rank2025: 13,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'Region VII',
    name: 'Central Visayas',
    islandGroup: 'Visayas',
    rates: { 2022: 60.70, 2023: 42.15, 2024: 37.61, 2025: 27.74 },
    rank2025: 11,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'Region VIII',
    name: 'Eastern Visayas',
    islandGroup: 'Visayas',
    rates: { 2022: 47.60, 2023: 33.01, 2024: 36.89, 2025: 35.05 },
    rank2025: 5,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'Region IX',
    name: 'Zamboanga Peninsula',
    islandGroup: 'Mindanao',
    rates: { 2022: 59.50, 2023: 33.04, 2024: 38.44, 2025: 38.59 },
    rank2025: 2,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'Region X',
    name: 'Northern Mindanao',
    islandGroup: 'Mindanao',
    rates: { 2022: 46.30, 2023: 34.73, 2024: 23.67, 2025: 37.30 },
    rank2025: 3,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'Region XI',
    name: 'Davao Region',
    islandGroup: 'Mindanao',
    rates: { 2022: 46.30, 2023: 44.20, 2024: 26.64, 2025: 39.83 },
    rank2025: 1,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'Region XII',
    name: 'SOCCSKSARGEN',
    islandGroup: 'Mindanao',
    rates: { 2022: 51.20, 2023: 46.26, 2024: 38.04, 2025: 30.32 },
    rank2025: 9,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'NCR',
    name: 'National Capital Region',
    islandGroup: 'Luzon',
    rates: { 2022: 52.40, 2023: 32.69, 2024: 30.63, 2025: 30.70 },
    rank2025: 8,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'CAR',
    name: 'Cordillera Administrative Region',
    islandGroup: 'Luzon',
    rates: { 2022: 54.90, 2023: 47.56, 2024: 27.13, 2025: 32.05 },
    rank2025: 7,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'BARMM',
    name: 'Bangsamoro Autonomous Region in Muslim Mindanao',
    islandGroup: 'Mindanao',
    rates: { 2022: 93.40, 2023: 95.56, 2024: null, 2025: null },
    rank2025: null,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'Region XIII',
    name: 'Caraga',
    islandGroup: 'Mindanao',
    rates: { 2022: 38.90, 2023: 36.95, 2024: 35.27, 2025: 36.83 },
    rank2025: 4,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'Region IV-B',
    name: 'MIMAROPA',
    islandGroup: 'Luzon',
    rates: { 2022: 37.90, 2023: 35.02, 2024: 30.87, 2025: 34.33 },
    rank2025: 6,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
  {
    code: 'NIR',
    name: 'Negros Island Region',
    islandGroup: 'Visayas',
    rates: { 2022: null, 2023: 34.68, 2024: 15.85, 2025: 29.05 },
    rank2025: 10,
    sourceId: 'S1',
    sourceTable: 'EDCOM II Final Report (2026), Table 6, p.224',
    dataLevel: 'Regional cohort aggregate',
    rawValidationNote: '2022–2025 regional cohort rates; blank values preserve source N/A/No Data.',
    cleanedValidationStatus: 'Transcribed from EDCOM II Table 6; missing source values remain blank.',
  },
];

export const NATIONAL_DIAGNOSTICS = {
  rate2022: 39.30,
  rate2025: 28.96,
  change2022To2025: -10.34,
  reportedRegions2025InWorkbookNote: 16,
  actualRegionsWith2025Data: 17,
  highest2025Region: 'Davao Region',
  highest2025Rate: 39.83,
  lowest2025Region: 'CALABARZON',
  lowest2025Rate: 17.65,
  conclusion:
    'National cohort attrition was 39.3% in 2022 and 28.96% in 2025. This is a descriptive change; the workbook does not establish why it changed.',
  measureDefinitionAndLimitation:
    'CHED/EDCOM II computes cohort attrition as the percentage decrease in total enrollment between cohort year one and year four. Transfers, temporary stopping, and returns can affect the measure; it should not be called confirmed permanent dropout.',
};

export const DIAGNOSTIC_ITEMS: DiagnosticTimeSeriesItem[] = [
  {
    id: 'nat-2022',
    item: 'National attrition rate (2022)',
    rawWorkbookValue: '0.393',
    formattedValue: '39.30%',
    unit: 'Percent',
    interpretation: 'Reported national cohort rate.',
  },
  {
    id: 'nat-2025',
    item: 'National attrition rate (2025)',
    rawWorkbookValue: '0.2896',
    formattedValue: '28.96%',
    unit: 'Percent',
    interpretation: 'Reported national cohort rate; distinct from unweighted regional mean.',
  },
  {
    id: 'nat-change',
    item: 'Change, national 2022 to 2025',
    rawWorkbookValue: '-0.1034',
    formattedValue: '-10.34 pp',
    unit: 'Percentage points',
    interpretation: 'Descriptive decline; does not establish cause.',
  },
  {
    id: 'reg-count-2025',
    item: 'Regions with 2025 rates',
    rawWorkbookValue: '16',
    formattedValue: '17 observed (16 in narrative note)',
    unit: 'Regions',
    interpretation: 'BARMM has no data; NIR has a reported value.',
    auditFlag:
      'Source workbook lists 16 in this diagnostic cell and narrative note, while Cleaned Data and Descriptive Analysis COUNT() record 17 non-blank 2025 regions (ranks 1–17, excluding only BARMM).',
  },
  {
    id: 'high-2025',
    item: 'Highest 2025 regional rate',
    rawWorkbookValue: '0.3983',
    formattedValue: '39.83%',
    unit: 'Percent',
    interpretation: 'Davao Region.',
  },
  {
    id: 'low-2025',
    item: 'Lowest 2025 regional rate',
    rawWorkbookValue: '0.1765',
    formattedValue: '17.65%',
    unit: 'Percent',
    interpretation: 'CALABARZON.',
  },
];

export const SOURCE_REFERENCES: SourceReference[] = [
  {
    id: 'S1',
    agency: 'Second Congressional Commission on Education (EDCOM II); source data: OPRKM, CHED',
    document: 'Turning Point: A Decade of Necessary Reform (2026–2035), Final Report, Higher Education Table 6, p.224',
    period: 'Published 2026; cohorts 2022–2025',
    variablesSupported: 'Regional attrition rates by cohort',
    url: 'https://depeddipolog.com/wp-content/uploads/2026/03/EDCOM-II-Y03-for-web-012326_reduced.pdf',
    howUsedLimitation:
      'Primary source for 18 regional records. Table cites CPBRD (2024) for 2022 and OPRKM, CHED (2025) for 2023–2025. BARMM has no data in 2024–2025; NIR is N/A in 2022.',
  },
  {
    id: 'S2',
    agency: 'Commission on Higher Education (CHED)',
    document: 'CHED Statistics',
    period: 'Official statistics page',
    variablesSupported: 'Higher education context',
    url: 'https://legacy.ched.gov.ph/statistics/',
    howUsedLimitation:
      'Additional official statistics context. Attrition in S1 is year-one to year-four enrollment decline, not confirmed permanent dropout.',
  },
];

export const RECOMMENDATIONS: RecommendationRecord[] = [
  {
    id: 'rec-1',
    recommendation: 'Validate regional reporting',
    evidence:
      '2025 rate ranges from 17.65% in CALABARZON to 39.83% in Davao Region; BARMM has no 2024 or 2025 value.',
    proposedAction:
      'Review cohort definitions, reporting completeness, transfer patterns, and local context with CHED regional offices.',
    expectedBenefit: 'More reliable interpretation and targeted follow-up.',
    resources: 'Staff time for data validation and coordination.',
    implementationRisk: 'Avoid stigmatizing regions; rates may reflect data coverage or boundary issues.',
    linkedMetrics: ['CALABARZON: 17.65%', 'Davao Region: 39.83%', 'BARMM 2024–2025: N/A'],
  },
  {
    id: 'rec-2',
    recommendation: 'Measure actual completion pathways',
    evidence:
      'The source says year-one to year-four enrollment decline does not identify permanent dropout or its causes.',
    proposedAction:
      'Collect privacy-protected longitudinal records to distinguish transfers, stop-outs, returns, and completions.',
    expectedBenefit: 'Clearer retention measures and better support design.',
    resources: 'Data governance, secure storage, and analyst time.',
    implementationRisk: 'Privacy and consent risks; use appropriate safeguards.',
    linkedMetrics: ['Measure: Y1-to-Y4 enrollment delta', 'Unobserved: transfers & returns'],
  },
  {
    id: 'rec-3',
    recommendation: 'Improve publication completeness',
    evidence: 'Published 2025 regional rates cover 17 observed regions (16 cited in workbook text); BARMM lacks 2024–2025 values and NIR is N/A in 2022.',
    proposedAction: 'Publish comparable annual tables and explain missing values and regional boundary changes.',
    expectedBenefit: 'More consistent regional comparisons over time.',
    resources: 'CHED reporting and quality assurance capacity.',
    implementationRisk: 'Definitions or coverage changes may affect comparability.',
    linkedMetrics: ['2022 n=17 (NIR N/A)', '2023 n=18', '2024–2025 n=17 (BARMM N/A)'],
  },
  {
    id: 'rec-4',
    recommendation: 'Evaluate interventions carefully',
    evidence: 'National attrition fell from 39.3% to 28.96%, but the report does not establish a cause.',
    proposedAction:
      'Evaluate retention programs using comparable cohort outcomes and documented intervention timing.',
    expectedBenefit: 'Evidence about which programs are associated with improved persistence.',
    resources: 'Program monitoring and evaluation resources.',
    implementationRisk: 'Do not attribute trend changes to a program without a suitable evaluation design.',
    linkedMetrics: ['National 2022: 39.30%', 'National 2025: 28.96%', 'Delta: -10.34 pp'],
  },
];

export const WORKBOOK_AUDIT_FINDINGS = [
  {
    id: 'audit-1',
    area: '2022 Column Formatting (Descriptive Analysis)',
    sourceBehavior: 'Displayed raw decimal proportions (e.g. 0.49923529411764705, 0.476, 0.13320920079510495) instead of percentages.',
    dashboardHandling: 'Normalized to consistent percentage precision (49.92%, 47.60%, 13.32%) with exact raw float available on inspection.',
  },
  {
    id: 'audit-2',
    area: 'Count Row Percent Formatting (2023–2025)',
    sourceBehavior: 'Integer region counts in 2023–2025 were formatted with a % mask in Excel (1800.00%, 1700.00%, 1700.00%).',
    dashboardHandling: 'Decoded back to true integer region counts (18, 17, 17) while flagging the source formatting artifact.',
  },
  {
    id: 'audit-3',
    area: '2025 Region Count Discrepancy (16 vs 17)',
    sourceBehavior: 'Narrative notes cite "16 regions with data" while Cleaned Data ranks 1–17 and Descriptive Analysis COUNT() yields 17.',
    dashboardHandling: 'Computes exact statistics across all 17 non-blank 2025 regions (excluding only BARMM) and surfaces the narrative discrepancy explicitly.',
  },
  {
    id: 'audit-4',
    area: 'Missing Observation Preservation',
    sourceBehavior: 'BARMM (2024–2025) and NIR (2022) are blank N/A cells, explicitly not zero.',
    dashboardHandling: 'Missing cells remain null/blank in calculations, CSV exports, and chart breaks—never imputed as 0%.',
  },
];
