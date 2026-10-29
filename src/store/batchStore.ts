import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Batch, BatchProcessStep, BatchTest, GrowthTrial } from '../types';
import { SEEDED_BATCHES } from '../data/seedBatches';
import {
  advanceBatch,
  attachGrowthTrial,
  attachTestRecord,
  logAerationTurn,
  logBatchReading,
  toggleMaterialCollected,
} from '../services/batchService';

interface BatchState {
  batches: Batch[];
  activeBatchId: string;

  setActiveBatchId: (id: string) => void;
  addBatch: (batch: Batch) => void;
  advance: (batchId: string, target: BatchProcessStep, note?: string) => { ok: boolean; error?: string };
  toggleMaterial: (batchId: string, materialId: string) => void;
  logReading: (batchId: string, tempC: number, moisturePercent: number, source: 'Simulated' | 'Manual') => void;
  logTurn: (batchId: string) => void;
  saveTest: (batchId: string, test: BatchTest) => void;
  saveTrial: (batchId: string, trial: GrowthTrial) => void;
  markListed: (batchCode: string, listingId: string) => void;
  resetBatchesToDemo: () => void;
}

const defaultActiveId = (batches: Batch[]) =>
  (batches.find((b) => b.status !== 'READY') || batches[0])?.id ?? '';

const mapBatch = (batches: Batch[], id: string, fn: (b: Batch) => Batch) =>
  batches.map((b) => (b.id === id ? fn(b) : b));

export const useBatchStore = create<BatchState>()(
  persist(
    (set, get) => ({
      batches: SEEDED_BATCHES,
      activeBatchId: defaultActiveId(SEEDED_BATCHES),

      setActiveBatchId: (id) => set({ activeBatchId: id }),

      addBatch: (batch) =>
        set((state) => ({ batches: [batch, ...state.batches], activeBatchId: batch.id })),

      advance: (batchId, target, note) => {
        const batch = get().batches.find((b) => b.id === batchId);
        if (!batch) return { ok: false, error: 'Batch not found.' };
        try {
          const updated = advanceBatch(batch, target, { note });
          set((state) => ({ batches: mapBatch(state.batches, batchId, () => updated) }));
          return { ok: true };
        } catch (err) {
          return { ok: false, error: err instanceof Error ? err.message : 'Invalid transition.' };
        }
      },

      toggleMaterial: (batchId, materialId) =>
        set((state) => ({
          batches: mapBatch(state.batches, batchId, (b) => toggleMaterialCollected(b, materialId)),
        })),

      logReading: (batchId, tempC, moisturePercent, source) =>
        set((state) => ({
          batches: mapBatch(state.batches, batchId, (b) => logBatchReading(b, tempC, moisturePercent, source)),
        })),

      logTurn: (batchId) =>
        set((state) => ({ batches: mapBatch(state.batches, batchId, logAerationTurn) })),

      saveTest: (batchId, test) =>
        set((state) => ({ batches: mapBatch(state.batches, batchId, (b) => attachTestRecord(b, test)) })),

      saveTrial: (batchId, trial) =>
        set((state) => ({ batches: mapBatch(state.batches, batchId, (b) => attachGrowthTrial(b, trial)) })),

      markListed: (batchCode, listingId) =>
        set((state) => ({
          batches: state.batches.map((b) =>
            b.batchCode === batchCode ? { ...b, isListedOnMarketplace: true, listingId } : b
          ),
        })),

      resetBatchesToDemo: () =>
        set({ batches: SEEDED_BATCHES, activeBatchId: defaultActiveId(SEEDED_BATCHES) }),
    }),
    {
      // v3: the batch data model changed (Make + Batch modules ported), so old saved state is discarded.
      name: 'krishicycle_batches_v3',
    }
  )
);
