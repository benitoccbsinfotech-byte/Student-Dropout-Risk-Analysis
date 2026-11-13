import test from 'node:test';
import assert from 'node:assert/strict';
import { REGIONAL_ATTRITION_DATA, COHORT_YEARS } from '../data/attritionData';
import {
  computeRegionChange,
  computeYearStats,
  filterAndSortRegions,
  generateRegionsCsv,
} from './analytics';

test('dataset preserves all 18 regions and missing observation nulls', () => {
  assert.equal(REGIONAL_ATTRITION_DATA.length, 18);

  const barmm = REGIONAL_ATTRITION_DATA.find((r) => r.code === 'BARMM');
  assert.ok(barmm);
  assert.equal(barmm.rates[2022], 93.4);
  assert.equal(barmm.rates[2023], 95.56);
  assert.equal(barmm.rates[2024], null);
  assert.equal(barmm.rates[2025], null);
  assert.equal(barmm.rank2025, null);

  const nir = REGIONAL_ATTRITION_DATA.find((r) => r.code === 'NIR');
  assert.ok(nir);
  assert.equal(nir.rates[2022], null);
  assert.equal(nir.rates[2023], 34.68);
  assert.equal(nir.rates[2024], 15.85);
  assert.equal(nir.rates[2025], 29.05);
  assert.equal(nir.rank2025, 10);
});

test('descriptive statistics match the EDCOM II workbook across 2022–2025', () => {
  const s2022 = computeYearStats(REGIONAL_ATTRITION_DATA, 2022);
  assert.ok(s2022);
  assert.equal(s2022.count, 17);
  assert.ok(Math.abs(s2022.mean - 49.9235294) < 0.0001);
  assert.ok(Math.abs(s2022.median - 47.6) < 0.0001);
  assert.ok(Math.abs(s2022.stdDevSample - 13.32092) < 0.0001);
  assert.equal(s2022.min, 36.3);
  assert.equal(s2022.max, 93.4);
  assert.ok(Math.abs(s2022.range - 57.1) < 0.0001);

  const s2023 = computeYearStats(REGIONAL_ATTRITION_DATA, 2023);
  assert.ok(s2023);
  assert.equal(s2023.count, 18);
  assert.equal(Number(s2023.mean.toFixed(2)), 37.69);
  assert.equal(Number(s2023.median.toFixed(2)), 34.37);
  assert.equal(Number(s2023.stdDevSample.toFixed(2)), 16.63);
  assert.equal(s2023.min, 11.34);
  assert.equal(s2023.max, 95.56);
  assert.equal(Number(s2023.range.toFixed(2)), 84.22);

  const s2024 = computeYearStats(REGIONAL_ATTRITION_DATA, 2024);
  assert.ok(s2024);
  assert.equal(s2024.count, 17);
  assert.equal(Number(s2024.mean.toFixed(2)), 27.75);
  assert.equal(Number(s2024.median.toFixed(2)), 27.13);
  assert.equal(Number(s2024.stdDevSample.toFixed(2)), 8.48);
  assert.equal(s2024.min, 8.02);
  assert.equal(s2024.max, 38.44);
  assert.equal(Number(s2024.range.toFixed(2)), 30.42);

  const s2025 = computeYearStats(REGIONAL_ATTRITION_DATA, 2025);
  assert.ok(s2025);
  assert.equal(s2025.count, 17);
  assert.equal(Number(s2025.mean.toFixed(2)), 30.33);
  assert.equal(Number(s2025.median.toFixed(2)), 30.32);
  assert.equal(Number(s2025.stdDevSample.toFixed(2)), 6.15);
  assert.equal(s2025.min, 17.65);
  assert.equal(s2025.max, 39.83);
  assert.equal(Number(s2025.range.toFixed(2)), 22.18);
  assert.equal(s2025.maxRegion, 'Davao Region');
  assert.equal(s2025.minRegion, 'CALABARZON');
});

test('2025 ranks 1..17 align strictly descending with 2025 rates', () => {
  const ranked = REGIONAL_ATTRITION_DATA
    .filter((r) => r.rank2025 !== null)
    .sort((a, b) => (a.rank2025 ?? 99) - (b.rank2025 ?? 99));

  assert.equal(ranked.length, 17);
  assert.equal(ranked[0].name, 'Davao Region');
  assert.equal(ranked[0].rank2025, 1);
  assert.equal(ranked[16].name, 'CALABARZON');
  assert.equal(ranked[16].rank2025, 17);

  for (let i = 1; i < ranked.length; i++) {
    const prevRate = ranked[i - 1].rates[2025]!;
    const currRate = ranked[i].rates[2025]!;
    assert.ok(prevRate >= currRate, `Expected rank ${i} (${prevRate}) >= rank ${i + 1} (${currRate})`);
  }
});

test('filtering and sorting keeps null rates at the bottom', () => {
  const sortedAsc = filterAndSortRegions(REGIONAL_ATTRITION_DATA, {
    search: '',
    islandGroup: 'All',
    completeness: 'all',
    sortField: '2025',
    sortDirection: 'asc',
  });
  assert.equal(sortedAsc[0].name, 'CALABARZON');
  assert.equal(sortedAsc[sortedAsc.length - 1].code, 'BARMM');

  const sortedDesc = filterAndSortRegions(REGIONAL_ATTRITION_DATA, {
    search: '',
    islandGroup: 'All',
    completeness: 'all',
    sortField: '2025',
    sortDirection: 'desc',
  });
  assert.equal(sortedDesc[0].name, 'Davao Region');
  assert.equal(sortedDesc[sortedDesc.length - 1].code, 'BARMM');

  const incomplete = filterAndSortRegions(REGIONAL_ATTRITION_DATA, {
    search: '',
    islandGroup: 'All',
    completeness: 'incomplete',
    sortField: 'code',
    sortDirection: 'asc',
  });
  assert.deepEqual(
    incomplete.map((r) => r.code),
    ['BARMM', 'NIR']
  );
});

test('computeRegionChange returns null when either endpoint is missing', () => {
  const barmm = REGIONAL_ATTRITION_DATA.find((r) => r.code === 'BARMM')!;
  const calabarzon = REGIONAL_ATTRITION_DATA.find((r) => r.code === 'Region IV-A')!;
  assert.equal(computeRegionChange(barmm), null);
  assert.equal(computeRegionChange(calabarzon), -26.55);
});

test('CSV export preserves blank missing values rather than converting to zero', () => {
  const barmm = REGIONAL_ATTRITION_DATA.filter((r) => r.code === 'BARMM');
  const csv = generateRegionsCsv(barmm);
  const lines = csv.split('\n');
  assert.equal(lines.length, 2);
  // BARMM 2024, 2025, change, rank should all be empty cells (5 commas between 95.56% and S1)
  assert.ok(lines[1].includes('93.40%,95.56%,,,,,S1'));
  assert.equal(COHORT_YEARS.length, 4);
});
