import {
  Batch,
  BatchProcessStep,
  BatchReadingEntry,
  BatchTest,
  BatchTestMethod,
  Crop,
  EvidenceStatus,
  FertilizerRecipe,
  GrowthTrial,
  SoilInput,
  TestQualityStatus,
  TrialObservation,
} from '../types';

/**
 * batchService: the ONLY place batch status transitions are enforced.
 * Pure functions, no store access, no AI.
 */

export interface BatchStepMeta {
  step: BatchProcessStep;
  title: string;
  dayTarget: number;
  progress: number;
}

export const BATCH_STEPS: BatchStepMeta[] = [
  { step: 'COLLECT', title: '1. Collect Feedstocks', dayTarget: 1, progress: 5 },
  { step: 'CHOP_SHRED', title: '2. Chop & Shred', dayTarget: 1, progress: 14 },
  { step: 'MIX', title: '3. Layer & Mix', dayTarget: 1, progress: 24 },
  { step: 'PILE_UP', title: '4. Aerobic Pile', dayTarget: 2, progress: 34 },
  { step: 'MOISTURE_SET', title: '5. Moisture Set', dayTarget: 2, progress: 44 },
  { step: 'ACTIVE_COMPOSTING', title: '6. Active Thermophilic', dayTarget: 8, progress: 56 },
  { step: 'TURN_AERATE', title: '7. Aeration Turns', dayTarget: 14, progress: 68 },
  { step: 'MATURATION', title: '8. Mesophilic Curing', dayTarget: 22, progress: 80 },
  { step: 'TESTING', title: '9. Quality NPK Test', dayTarget: 24, progress: 88 },
  { step: 'VALIDATION', title: '10. Growth Trial', dayTarget: 28, progress: 94 },
  { step: 'READY', title: '11. Batch Ready & Store', dayTarget: 28, progress: 100 },
];

export const getStepIndex = (step: BatchProcessStep): number =>
  BATCH_STEPS.findIndex((s) => s.step === step);

export const getStepMeta = (step: BatchProcessStep): BatchStepMeta =>
  BATCH_STEPS[Math.max(0, getStepIndex(step))];

/** Steps that may be skipped forward to READY (testing and the growth trial are optional). */
const SKIPPABLE_TO_READY: BatchProcessStep[] = ['MATURATION', 'TESTING', 'VALIDATION'];

/** Valid moves: exactly one step forward, or jump to READY from the maturation stages. */
export const canAdvanceBatch = (current: BatchProcessStep, target: BatchProcessStep): boolean => {
  if (current === 'READY') return false;
  if (target === 'READY' && SKIPPABLE_TO_READY.includes(current)) return true;
  return getStepIndex(target) === getStepIndex(current) + 1;
};

export const getNextStep = (current: BatchProcessStep): BatchProcessStep | null => {
  const idx = getStepIndex(current);
  return idx >= 0 && idx < BATCH_STEPS.length - 1 ? BATCH_STEPS[idx + 1].step : null;
};

export const allMaterialsCollected = (batch: Batch): boolean =>
  batch.materialsCollected.length > 0 && batch.materialsCollected.every((m) => m.isCollected);

export const advanceBatch = (
  batch: Batch,
  target: BatchProcessStep,
  options: { note?: string } = {}
): Batch => {
  if (!canAdvanceBatch(batch.status, target)) {
    throw new Error(`Invalid batch transition: ${batch.status} → ${target}. Steps cannot be skipped.`);
  }
  if (batch.status === 'COLLECT' && !allMaterialsCollected(batch)) {
    throw new Error('Tick every raw material as collected before moving on.');
  }

  const now = new Date().toISOString();
  const done = getStepMeta(batch.status);
  const events = [...batch.events];
  const existing = events.findIndex((e) => e.step === batch.status);
  const completedEvent = {
    id: existing >= 0 ? events[existing].id : `ev_${Date.now()}_${batch.status}`,
    step: batch.status,
    title: `${done.title.replace(/^\d+\.\s*/, '')} completed`,
    completed: true,
    completedAt: now,
    notes: options.note || events[existing]?.notes || 'Completed by the farmer following the KrishiCycle guide.',
  };
  if (existing >= 0) events[existing] = completedEvent;
  else events.push(completedEvent);

  const next: Batch = {
    ...batch,
    status: target,
    progressPercent: getStepMeta(target).progress,
    events,
  };
  if (target === 'READY') next.completedAt = now;
  return next;
};

/** Saving a test record moves MATURATION → TESTING automatically. Never moves a batch backwards. */
export const attachTestRecord = (batch: Batch, test: BatchTest): Batch => {
  const now = new Date().toISOString();
  const events = [
    ...batch.events.filter((e) => e.step !== 'TESTING'),
    {
      id: `ev_test_${Date.now()}`,
      step: 'TESTING' as const,
      title: `Test values recorded (${test.testMethod})`,
      completed: true,
      completedAt: now,
      notes: `NPK ${test.nitrogenPercent}-${test.phosphorusPercent}-${test.potassiumPercent}%, pH ${test.ph}. Source: ${test.testMethod}.`,
    },
  ];
  const status: BatchProcessStep = batch.status === 'MATURATION' ? 'TESTING' : batch.status;
  return {
    ...batch,
    testRecord: test,
    events,
    status,
    progressPercent: Math.max(batch.progressPercent, getStepMeta(status).progress),
  };
};

export const attachGrowthTrial = (batch: Batch, trial: GrowthTrial): Batch => {
  const now = new Date().toISOString();
  const events = [
    ...batch.events.filter((e) => e.step !== 'VALIDATION'),
    {
      id: `ev_val_${Date.now()}`,
      step: 'VALIDATION' as const,
      title: `Growth trial record saved (${trial.dataSource})`,
      completed: true,
      completedAt: now,
      notes: trial.summaryConclusion,
    },
  ];
  const status: BatchProcessStep =
    batch.status === 'MATURATION' || batch.status === 'TESTING' ? 'VALIDATION' : batch.status;
  return {
    ...batch,
    growthTrial: trial,
    events,
    status,
    progressPercent: Math.max(batch.progressPercent, getStepMeta(status).progress),
  };
};

export const logBatchReading = (
  batch: Batch,
  tempC: number,
  moisturePercent: number,
  source: BatchReadingEntry['source']
): Batch => {
  const at = new Date().toISOString();
  const entry: BatchReadingEntry = { id: `rd_${Date.now()}`, at, tempC, moisturePercent, source };
  return {
    ...batch,
    readings: [...batch.readings, entry].slice(-60),
    latestReadings: { temperatureC: tempC, moisturePercent, lastUpdated: at, source },
  };
};

export const logAerationTurn = (batch: Batch): Batch => {
  const now = new Date().toISOString();
  const turns = batch.events.filter((e) => e.id.startsWith('ev_turn_')).length + 1;
  return {
    ...batch,
    events: [
      ...batch.events,
      {
        id: `ev_turn_${Date.now()}`,
        step: 'TURN_AERATE',
        title: `Aeration turn #${turns} logged`,
        completed: true,
        completedAt: now,
        notes: 'Pile turned to bring fresh oxygen into the core.',
      },
    ],
  };
};

export const countAerationTurns = (batch: Batch): number =>
  batch.events.filter((e) => e.id.startsWith('ev_turn_')).length;

export const toggleMaterialCollected = (batch: Batch, materialId: string): Batch => {
  if (batch.status !== 'COLLECT') return batch;
  return {
    ...batch,
    materialsCollected: batch.materialsCollected.map((m) =>
      m.materialId === materialId
        ? { ...m, isCollected: !m.isCollected, collectedKg: !m.isCollected ? m.requiredKg : 0 }
        : m
    ),
  };
};

// ── Creation ─────────────────────────────────────────────────────────────────────────────

export const generateBatchCode = (crop: Crop, existingCodes: string[]): string => {
  const cropCode = crop.id.replace('crop_', '').slice(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  let n = existingCodes.filter((c) => c.startsWith(`KC-${cropCode}-${year}`)).length + 1;
  let code = `KC-${cropCode}-${year}-${String(n).padStart(3, '0')}`;
  while (existingCodes.includes(code)) {
    n += 1;
    code = `KC-${cropCode}-${year}-${String(n).padStart(3, '0')}`;
  }
  return code;
};

export const createBatchFromRecipe = (args: {
  crop: Crop;
  recipe: FertilizerRecipe;
  soilInput: SoilInput;
  userName: string;
  userLocation: string;
  existingCodes: string[];
}): Batch => {
  const { crop, recipe, soilInput, userName, userLocation, existingCodes } = args;
  const batchCode = generateBatchCode(crop, existingCodes);
  const now = new Date().toISOString();
  return {
    id: `batch_${Date.now()}`,
    batchCode,
    userName,
    userLocation,
    cropId: crop.id,
    cropName: crop.nameEn,
    recipe,
    soilInput,
    status: 'COLLECT',
    progressPercent: getStepMeta('COLLECT').progress,
    totalEstimatedDays: crop.durationDays[0] < 60 ? 21 : 28,
    createdAt: now,
    materialsCollected: recipe.materials.map((m) => ({
      materialId: m.materialId,
      collectedKg: 0,
      requiredKg: m.quantityKg,
      isCollected: false,
    })),
    events: [
      {
        id: `ev_${Date.now()}`,
        step: 'COLLECT',
        title: 'Batch created, raw material gathering started',
        completed: false,
        notes: `Batch started for ${soilInput.targetQuantityKg} kg of bio-fertilizer for ${crop.nameEn}.`,
      },
    ],
    readings: [],
    isListedOnMarketplace: false,
    qrCodeValue: `demo-passport:${batchCode}`,
  };
};

// ── Quality, evidence and agronomy helpers ───────────────────────────────────────────────

export const evaluateQualityStatus = (input: {
  testMethod: BatchTestMethod;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  heavyMetalsDeclaredOk: boolean;
  weedSeedsViable: boolean;
}): { status: TestQualityStatus; reason: string } => {
  if (!input.heavyMetalsDeclaredOk || input.weedSeedsViable) {
    return {
      status: 'RED',
      reason: 'Your declared values flag a safety concern (heavy metals or viable weed seeds). Re-check before applying or selling.',
    };
  }
  if (input.testMethod === 'Estimated') {
    return {
      status: 'YELLOW',
      reason: 'Estimated values only. A kit measurement or lab report gives stronger evidence.',
    };
  }
  if (
    input.nitrogen >= 1.5 &&
    input.phosphorus >= 1.0 &&
    input.potassium >= 1.5 &&
    input.ph >= 6.2 &&
    input.ph <= 7.8
  ) {
    return {
      status: 'GREEN',
      reason: 'Values sit inside an illustrative reference range. This is a self-check, not a certification.',
    };
  }
  return {
    status: 'BLUE',
    reason: 'Values recorded; they fall outside the illustrative reference range. See the supplementation note.',
  };
};

export const getSupplementationAdvice = (n: number, p: number, k: number, ph: number): string => {
  const advice: string[] = [];
  if (n < 1.8) advice.push('Nitrogen is below target: top-dress with about 5% fine neem cake before curing.');
  if (p < 1.2) advice.push('Phosphorus is low: blend in about 3% rock phosphate or steamed bone meal.');
  if (k < 2.0) advice.push('Potassium is low: blend in about 3-4% sifted wood ash.');
  if (ph < 6.0) advice.push('Acidic pH (<6.0): discuss agricultural lime with your KVK before adding.');
  if (ph > 8.0) advice.push('Alkaline pH (>8.0): blend in more brown, acidic leaf-litter compost.');
  return advice.length > 0
    ? `Illustrative: ${advice.join(' ')}`
    : 'Nutrient profile sits inside the illustrative range. No supplementation suggested.';
};

export const getBatchEvidenceStatus = (batch: Batch): EvidenceStatus => {
  if (!batch.testRecord) return 'Evidence not provided';
  return batch.testRecord.testMethod;
};

export const getMoistureStatus = (moisture: number) => {
  if (moisture < 45)
    return {
      status: 'TOO DRY',
      tone: 'amber' as const,
      action: 'Sprinkle 1.5 - 2.0 litres of unchlorinated water per 100 kg and blend.',
    };
  if (moisture > 62)
    return {
      status: 'TOO WET',
      tone: 'red' as const,
      action: 'Add dry shredded straw or sawdust and turn the pile.',
    };
  return {
    status: 'OPTIMAL (45-60%)',
    tone: 'lime' as const,
    action: 'Moisture is in the usual range for aerobic composting microbes.',
  };
};

export const getTemperatureMessage = (tempC: number): string => {
  if (tempC >= 55 && tempC <= 65) return '✓ Active thermophilic phase (self-heating, 55–65°C).';
  if (tempC > 65) return '⚠️ Overheating (>65°C): turn the pile now so beneficial microbes are not burnt out.';
  return 'ℹ️ Below 55°C: add nitrogen slurry (fresh dung or greens) and check moisture.';
};

// ── Growth trial (illustrative sample) ───────────────────────────────────────────────────

const pct = (a: number, b: number) => (b > 0 ? Number((((a - b) / b) * 100).toFixed(1)) : 0);

export const computeTrialAdvantages = (obs: TrialObservation[]) => {
  const last = obs[obs.length - 1];
  if (!last) return { heightAdvantagePct: 0, leafCountAdvantagePct: 0 };
  return {
    heightAdvantagePct: pct(last.krishiCycleHeightCm, last.controlHeightCm),
    leafCountAdvantagePct: pct(last.krishiCycleLeafCount, last.controlLeafCount),
  };
};

export const buildDemoTrial = (batch: Batch): GrowthTrial => {
  const observations: TrialObservation[] = [
    { day: 3, date: 'Day 3', controlHeightCm: 2.1, krishiCycleHeightCm: 3.4, comparisonHeightCm: 3.0, controlLeafCount: 2, krishiCycleLeafCount: 2, comparisonLeafCount: 2, controlGerminationPct: 70, krishiCycleGerminationPct: 95, comparisonGerminationPct: 90 },
    { day: 7, date: 'Day 7', controlHeightCm: 6.1, krishiCycleHeightCm: 8.9, comparisonHeightCm: 7.8, controlLeafCount: 5, krishiCycleLeafCount: 6, comparisonLeafCount: 5, controlGerminationPct: 75, krishiCycleGerminationPct: 100, comparisonGerminationPct: 95 },
    { day: 10, date: 'Day 10', controlHeightCm: 10.0, krishiCycleHeightCm: 14.2, comparisonHeightCm: 12.0, controlLeafCount: 7, krishiCycleLeafCount: 10, comparisonLeafCount: 8, controlGerminationPct: 80, krishiCycleGerminationPct: 100, comparisonGerminationPct: 95 },
    { day: 14, date: 'Day 14', controlHeightCm: 13.5, krishiCycleHeightCm: 18.6, comparisonHeightCm: 15.2, controlLeafCount: 10, krishiCycleLeafCount: 14, comparisonLeafCount: 11, controlGerminationPct: 80, krishiCycleGerminationPct: 100, comparisonGerminationPct: 100 },
  ];
  const adv = computeTrialAdvantages(observations);
  return {
    id: `trial_${Date.now()}`,
    batchId: batch.id,
    cropName: batch.cropName,
    seedVariety: 'Sample seed variety',
    startDate: new Date().toISOString().split('T')[0],
    durationDays: 14,
    status: 'Completed',
    observations,
    ...adv,
    dataSource: 'Simulated',
    summaryConclusion: `In this simulated sample, the ${batch.cropName} seedlings given the KrishiCycle batch grew ${adv.heightAdvantagePct}% taller than the unfertilised control by day 14. Sample numbers only, not a real experiment and not a yield claim.`,
  };
};
