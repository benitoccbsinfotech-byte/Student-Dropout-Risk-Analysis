import {
  COHORT_YEARS,
  type CohortYear,
  type IslandGroup,
  type RegionAttritionRecord,
} from '../data/attritionData';

export interface YearDescriptiveStats {
  year: CohortYear;
  count: number;
  missingCount: number;
  mean: number;
  median: number;
  stdDevSample: number;
  min: number;
  minRegion: string;
  max: number;
  maxRegion: string;
  range: number;
}

export type SortField =
  | 'code'
  | 'name'
  | '2022'
  | '2023'
  | '2024'
  | '2025'
  | 'change22to25'
  | 'rank2025';

export type SortDirection = 'asc' | 'desc';

export type CompletenessFilter = 'all' | 'complete' | 'incomplete';

export interface RegionFilterOptions {
  search: string;
  islandGroup: 'All' | IslandGroup;
  completeness: CompletenessFilter;
  sortField: SortField;
  sortDirection: SortDirection;
}

export function computeRegionChange(
  record: RegionAttritionRecord,
  fromYear: CohortYear = 2022,
  toYear: CohortYear = 2025
): number | null {
  const start = record.rates[fromYear];
  const end = record.rates[toYear];
  if (start === null || end === null) {
    return null;
  }
  return Number((end - start).toFixed(2));
}

export function hasMissingObservations(record: RegionAttritionRecord): boolean {
  return COHORT_YEARS.some((year) => record.rates[year] === null);
}

export function computeYearStats(
  records: RegionAttritionRecord[],
  year: CohortYear
): YearDescriptiveStats | null {
  const validEntries = records
    .map((r) => ({ name: r.name, value: r.rates[year] }))
    .filter((entry): entry is { name: string; value: number } => entry.value !== null);

  if (validEntries.length === 0) {
    return null;
  }

  const sorted = [...validEntries].sort((a, b) => a.value - b.value);
  const count = sorted.length;
  const missingCount = records.length - count;
  const sum = sorted.reduce((acc, item) => acc + item.value, 0);
  const mean = sum / count;

  const mid = Math.floor(count / 2);
  const median =
    count % 2 === 1
      ? sorted[mid].value
      : (sorted[mid - 1].value + sorted[mid].value) / 2;

  const variance =
    count > 1
      ? sorted.reduce((acc, item) => acc + (item.value - mean) ** 2, 0) / (count - 1)
      : 0;
  const stdDevSample = Math.sqrt(variance);

  const minEntry = sorted[0];
  const maxEntry = sorted[count - 1];
  const range = maxEntry.value - minEntry.value;

  return {
    year,
    count,
    missingCount,
    mean,
    median,
    stdDevSample,
    min: minEntry.value,
    minRegion: minEntry.name,
    max: maxEntry.value,
    maxRegion: maxEntry.name,
    range,
  };
}

export function formatPercent(value: number | null, decimals = 2): string {
  if (value === null) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

export function formatSignedPp(value: number | null, decimals = 2): string {
  if (value === null) return 'N/A';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)} pp`;
}

export function filterAndSortRegions(
  records: RegionAttritionRecord[],
  options: RegionFilterOptions
): RegionAttritionRecord[] {
  const query = options.search.trim().toLowerCase();

  const filtered = records.filter((record) => {
    if (options.islandGroup !== 'All' && record.islandGroup !== options.islandGroup) {
      return false;
    }

    const isIncomplete = hasMissingObservations(record);
    if (options.completeness === 'complete' && isIncomplete) {
      return false;
    }
    if (options.completeness === 'incomplete' && !isIncomplete) {
      return false;
    }

    if (query.length > 0) {
      const haystack = `${record.code} ${record.name} ${record.islandGroup}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }

    return true;
  });

  const dir = options.sortDirection === 'asc' ? 1 : -1;

  return [...filtered].sort((a, b) => {
    if (options.sortField === 'code') {
      return a.code.localeCompare(b.code) * dir;
    }
    if (options.sortField === 'name') {
      return a.name.localeCompare(b.name) * dir;
    }

    let valA: number | null = null;
    let valB: number | null = null;

    if (options.sortField === '2022') {
      valA = a.rates[2022];
      valB = b.rates[2022];
    } else if (options.sortField === '2023') {
      valA = a.rates[2023];
      valB = b.rates[2023];
    } else if (options.sortField === '2024') {
      valA = a.rates[2024];
      valB = b.rates[2024];
    } else if (options.sortField === '2025') {
      valA = a.rates[2025];
      valB = b.rates[2025];
    } else if (options.sortField === 'change22to25') {
      valA = computeRegionChange(a, 2022, 2025);
      valB = computeRegionChange(b, 2022, 2025);
    } else if (options.sortField === 'rank2025') {
      valA = a.rank2025;
      valB = b.rank2025;
    }

    // Keep null/blank observations at the bottom regardless of sort direction
    if (valA === null && valB === null) return a.name.localeCompare(b.name);
    if (valA === null) return 1;
    if (valB === null) return -1;

    if (valA === valB) return a.name.localeCompare(b.name);
    return (valA - valB) * dir;
  });
}

function escapeCsvCell(cell: string): string {
  if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

export function generateRegionsCsv(records: RegionAttritionRecord[]): string {
  const headers = [
    'Region Code',
    'Region Name',
    'Island Group',
    'Attrition Rate (2022, %)',
    'Attrition Rate (2023, %)',
    'Attrition Rate (2024, %)',
    'Attrition Rate (2025, %)',
    '2022-2025 Change (pp)',
    '2025 Attrition Rank',
    'Source ID',
    'Data Level',
    'Validation Status',
  ];

  const rows = records.map((record) => {
    const change = computeRegionChange(record, 2022, 2025);
    const cells = [
      record.code,
      record.name,
      record.islandGroup,
      record.rates[2022] !== null ? `${record.rates[2022].toFixed(2)}%` : '',
      record.rates[2023] !== null ? `${record.rates[2023].toFixed(2)}%` : '',
      record.rates[2024] !== null ? `${record.rates[2024].toFixed(2)}%` : '',
      record.rates[2025] !== null ? `${record.rates[2025].toFixed(2)}%` : '',
      change !== null ? change.toFixed(2) : '',
      record.rank2025 !== null ? String(record.rank2025) : '',
      record.sourceId,
      record.dataLevel,
      record.cleanedValidationStatus,
    ];
    return cells.map(escapeCsvCell).join(',');
  });

  return [headers.map(escapeCsvCell).join(','), ...rows].join('\n');
}
