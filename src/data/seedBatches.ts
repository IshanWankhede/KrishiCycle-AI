import { Batch, BatchProcessStep, BatchReadingEntry, SoilInput } from '../types';
import { CROPS_CATALOG } from './crops';
import { BATCH_STEPS, buildDemoTrial, evaluateQualityStatus, getStepIndex, getSupplementationAdvice } from '../services/batchService';
import { calculateFertilizerRecipe, toSoilInputShape } from '../services/recipeService';

/**
 * Demo batches for the seeded farmer (Balasaheb Patil, Wagholi, Pune).
 * Everything here is "Demo data" and is labelled as such in the UI.
 */

const buildSeedBatch = (args: {
  id: string;
  code: string;
  cropId: string;
  soil: SoilInput;
  status: BatchProcessStep;
  createdAt: string;
  completedAt?: string;
}): Batch => {
  const crop = CROPS_CATALOG.find((c) => c.id === args.cropId)!;
  const recipe = calculateFertilizerRecipe(crop, toSoilInputShape(args.soil));
  recipe.id = `RCP-${crop.id.replace('crop_', '').slice(0, 3).toUpperCase()}-DEMO`;
  recipe.createdAt = args.createdAt;

  const statusIdx = getStepIndex(args.status);
  const start = new Date(args.createdAt).getTime();
  const events = BATCH_STEPS.filter((_, i) => i < statusIdx).map((s, i) => ({
    id: `ev_${args.id}_${s.step}`,
    step: s.step,
    title: `${s.title.replace(/^\d+\.\s*/, '')} completed`,
    completed: true,
    completedAt: new Date(start + (i + 1) * 36 * 3600 * 1000).toISOString(),
    notes: 'Demo data',
  }));

  const readings: BatchReadingEntry[] = [
    { id: `${args.id}_r1`, at: new Date(start + 2 * 86400000).toISOString(), tempC: 38, moisturePercent: 55, source: 'Simulated' },
    { id: `${args.id}_r2`, at: new Date(start + 5 * 86400000).toISOString(), tempC: 56, moisturePercent: 58, source: 'Simulated' },
    { id: `${args.id}_r3`, at: new Date(start + 9 * 86400000).toISOString(), tempC: 63, moisturePercent: 53, source: 'Simulated' },
    { id: `${args.id}_r4`, at: new Date(start + 14 * 86400000).toISOString(), tempC: 60, moisturePercent: 51, source: 'Simulated' },
  ];
  const last = readings[readings.length - 1];

  return {
    id: args.id,
    batchCode: args.code,
    userName: 'Balasaheb Patil',
    userLocation: 'Wagholi, Pune',
    cropId: crop.id,
    cropName: crop.nameEn,
    recipe,
    soilInput: args.soil,
    status: args.status,
    progressPercent: BATCH_STEPS[statusIdx].progress,
    totalEstimatedDays: 28,
    createdAt: args.createdAt,
    completedAt: args.completedAt,
    materialsCollected: recipe.materials.map((m) => ({
      materialId: m.materialId,
      collectedKg: m.quantityKg,
      requiredKg: m.quantityKg,
      isCollected: true,
    })),
    events,
    readings,
    latestReadings: { temperatureC: last.tempC, moisturePercent: last.moisturePercent, lastUpdated: last.at, source: 'Simulated' },
    isListedOnMarketplace: false,
    qrCodeValue: `demo-passport:${args.code}`,
  };
};

const tomatoSoil: SoilInput = {
  soilType: 'Black Cotton',
  ph: 7.2,
  n: 'Medium',
  p: 'Medium',
  k: 'High',
  organicCarbon: 'Medium',
  landAreaM2: 10117,
  targetQuantityKg: 300,
  season: 'Kharif (Monsoon)',
};

const spinachSoil: SoilInput = {
  soilType: 'Clay',
  ph: 6.8,
  n: 'Low',
  p: 'Medium',
  k: 'Medium',
  organicCarbon: 'Medium',
  landAreaM2: 2000,
  targetQuantityKg: 150,
  season: 'Rabi (Winter)',
};

const buildReadyTomatoBatch = (): Batch => {
  const base = buildSeedBatch({
    id: 'batch_demo_tomato',
    code: 'KC-TOM-2026-001',
    cropId: 'crop_tomato',
    soil: tomatoSoil,
    status: 'READY',
    createdAt: '2026-09-01T09:30:00.000Z',
    completedAt: '2026-09-29T16:00:00.000Z',
  });

  const values = { nitrogen: 2.4, phosphorus: 1.6, potassium: 3.1, ph: 6.9 };
  const quality = evaluateQualityStatus({
    testMethod: 'Kit-measured by me',
    ...values,
    heavyMetalsDeclaredOk: true,
    weedSeedsViable: false,
  });

  return {
    ...base,
    testRecord: {
      id: 'test_demo_tomato',
      batchId: base.id,
      testedAt: '2026-09-27',
      testMethod: 'Kit-measured by me',
      nitrogenPercent: values.nitrogen,
      phosphorusPercent: values.phosphorus,
      potassiumPercent: values.potassium,
      ph: values.ph,
      organicCarbonPercent: 17.5,
      moisturePercent: 22,
      cnRatio: 14.2,
      heavyMetalsDeclaredOk: true,
      weedSeedsViable: false,
      qualityStatus: quality.status,
      reportNumber: undefined,
      testedBy: 'Portable NPK kit (demo entry)',
      supplementationSuggested: getSupplementationAdvice(values.nitrogen, values.phosphorus, values.potassium, values.ph),
    },
    growthTrial: { ...buildDemoTrial(base), id: 'trial_demo_tomato', startDate: '2026-09-29' },
    isListedOnMarketplace: true,
    listingId: 'lst_org_01',
    latestReadings: {
      temperatureC: 29,
      moisturePercent: 24,
      lastUpdated: '2026-09-28T09:00:00.000Z',
      source: 'Simulated',
    },
  };
};

export const SEEDED_BATCHES: Batch[] = [
  buildReadyTomatoBatch(),
  buildSeedBatch({
    id: 'batch_spinach_active',
    code: 'KC-SPI-2026-001',
    cropId: 'crop_spinach',
    soil: spinachSoil,
    status: 'ACTIVE_COMPOSTING',
    createdAt: '2026-10-06T10:00:00.000Z',
  }),
];
