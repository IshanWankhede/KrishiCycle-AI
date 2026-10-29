import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CropScoreResult,
  FertilizerPlan,
  FertilizerPlanItem,
  ResourceInput,
  ResourcePlanOutput,
  ScheduledFarmTask,
  FarmResourceItem,
  WeeklyCheckinRecord,
} from '../types';
import { CropEvaluationInputs, rankAllCrops } from '../services/cropScoring';
import { generateFertilizerPlan } from '../services/fertilizerService';
import { calculateResourcePlan, DEFAULT_FARM_RESOURCES } from '../services/resourceService';
import { generateCropCycleTasks, applyWeeklyCheckinAdjustment } from '../services/taskPlanner';
import { FERTILIZER_CATALOG } from '../data/fertilizerCatalog';

interface CropState {
  inputs: CropEvaluationInputs;
  rankedResults: CropScoreResult[];
  selectedCropId: string;
  fertilizerPlan: FertilizerPlan;
  resourceInput: ResourceInput;
  resourceOutput: ResourcePlanOutput;
  farmResources: FarmResourceItem[];
  cropTasks: ScheduledFarmTask[];
  weeklyCheckins: WeeklyCheckinRecord[];
  consumedTaskIds: Record<string, boolean>;

  setInputs: (updates: Partial<CropEvaluationInputs>) => void;
  runScoring: () => void;
  selectCrop: (cropId: string) => void;
  updateResourceInput: (updates: Partial<ResourceInput>) => void;
  updateFertilizerPlan: (updates: Partial<FertilizerPlan>) => void;
  addFertilizerPlanItem: (productId: string, stage: string, ratePerAcre: number) => void;
  removeFertilizerPlanItem: (itemId: string) => void;
  resetFertilizerPlan: () => void;

  updateFarmResource: (id: string, updates: Partial<FarmResourceItem>) => void;
  addFarmResource: (resource: FarmResourceItem) => void;
  resetFarmResources: () => void;

  startCropCycle: (cropId?: string) => void;
  toggleTask: (taskId: string) => void;
  completeTask: (taskId: string, actualQuantityUsed?: number, notes?: string) => void;
  rescheduleTask: (taskId: string, newDate: string, reason?: string) => void;
  addTask: (task: ScheduledFarmTask) => void;
  deleteTask: (taskId: string) => void;

  submitWeeklyCheckin: (checkin: {
    progress: string;
    problems: string;
    waterStatus: 'normal' | 'low' | 'adequate';
    weatherDelay: 'none' | 'rain' | 'heat';
  }) => void;
  resetCropToDemo: () => void;
}

const DEFAULT_INPUTS: CropEvaluationInputs = {
  district: 'Pune',
  state: 'Maharashtra',
  village: 'Khed Shivapur, Haveli',
  season: 'Kharif',
  fieldAreaAcres: 2.5,
  waterAvailability: 'Medium',
  irrigationMethod: 'drip',
  soilType: 'Medium black cotton soil (Regur)',
  soilPh: 7.2,
  soilN: 'Medium',
  soilP: 'Medium',
  soilK: 'High',
  organicCarbonPct: 0.65,
  soilMoisturePct: 28,
  soilDataSource: 'Laboratory Soil Health Card',
  previousCrop: 'Soybean',
  previousCropSeason: 'Kharif',
  residueManagement: 'Incorporated into Soil',
  desiredCropId: 'crop_tomato',
  budgetBand: 'Medium',
  labourAvailable: 'family',
};

const DEFAULT_RESOURCE_INPUT: ResourceInput = {
  cropResidueKg: 400,
  cowDungKg: 500,
  kitchenWasteKg: 150,
  dryLeavesKg: 350,
  woodAshKg: 60,
  waterAvailability: 'adequate',
  landAreaAcres: 2.5,
  budgetBand: 'medium',
  existingFertilizerKg: 200,
  labourAvailable: 'family',
  currentMonth: 'October',
};

export const useCropStore = create<CropState>()(
  persist(
    (set, get) => {
      const initialRankings = rankAllCrops(DEFAULT_INPUTS);
      const initialFertPlan = generateFertilizerPlan(
        'crop_tomato',
        2.5,
        { soilN: 'Medium', soilP: 'Medium', soilK: 'High' },
        'Soybean'
      );
      const initialResourceOut = calculateResourcePlan(DEFAULT_RESOURCE_INPUT);
      const initialTasks = generateCropCycleTasks('crop_tomato', undefined, 2.5);

      return {
        inputs: DEFAULT_INPUTS,
        rankedResults: initialRankings,
        selectedCropId: 'crop_tomato',
        fertilizerPlan: initialFertPlan,
        resourceInput: DEFAULT_RESOURCE_INPUT,
        resourceOutput: initialResourceOut,
        farmResources: DEFAULT_FARM_RESOURCES,
        cropTasks: initialTasks,
        weeklyCheckins: [],
        consumedTaskIds: {
          task_crop_tomato_w1_prep: true,
          task_crop_tomato_w1_beds: true,
        },

        setInputs: (updates) => {
          set((state) => {
            const newInputs = { ...state.inputs, ...updates };
            const newRankings = rankAllCrops(newInputs);

            // If soil or previous crop changed and plan wasn't farmer-customized, recalculate plan
            let fertPlan = state.fertilizerPlan;
            if (!state.fertilizerPlan?.isCustomized) {
              fertPlan = generateFertilizerPlan(
                state.selectedCropId,
                newInputs.fieldAreaAcres,
                { soilN: newInputs.soilN, soilP: newInputs.soilP, soilK: newInputs.soilK },
                newInputs.previousCrop
              );
            }

            return {
              inputs: newInputs,
              rankedResults: newRankings,
              fertilizerPlan: fertPlan,
            };
          });
        },

        runScoring: () => {
          set((state) => ({
            rankedResults: rankAllCrops(state.inputs),
          }));
        },

        selectCrop: (cropId) => {
          const state = get();
          const fertPlan = generateFertilizerPlan(
            cropId,
            state.inputs.fieldAreaAcres,
            { soilN: state.inputs.soilN, soilP: state.inputs.soilP, soilK: state.inputs.soilK },
            state.inputs.previousCrop
          );
          const tasks = generateCropCycleTasks(cropId, undefined, state.inputs.fieldAreaAcres);
          set({
            selectedCropId: cropId,
            fertilizerPlan: fertPlan,
            cropTasks: tasks,
          });
        },

        updateResourceInput: (updates) => {
          set((state) => {
            const newRes = { ...state.resourceInput, ...updates };
            const newOut = calculateResourcePlan(newRes);
            return {
              resourceInput: newRes,
              resourceOutput: newOut,
            };
          });
        },

        updateFertilizerPlan: (updates) => {
          set((state) => {
            const updated = {
              ...state.fertilizerPlan,
              ...updates,
              isCustomized: true,
            };
            return { fertilizerPlan: updated };
          });
        },

        addFertilizerPlanItem: (productId, stage, ratePerAcre) => {
          const state = get();
          const product = FERTILIZER_CATALOG.find((p) => p.id === productId);
          if (!product) return;

          const totalQty = Math.round(ratePerAcre * state.inputs.fieldAreaAcres);
          const avail = product.organicAvailabilityFactor || 1.0;
          const nSupplied = Math.round(totalQty * (product.npkPercent.n / 100) * avail);
          const pSupplied = Math.round(totalQty * (product.npkPercent.p2o5 / 100) * avail);
          const kSupplied = Math.round(totalQty * (product.npkPercent.k2o / 100) * avail);

          const newItem: FertilizerPlanItem = {
            id: `item_${productId}_${Date.now()}`,
            productId: product.id,
            productName: product.nameEn,
            category: product.category,
            stage,
            timing: 'Recommended growth stage',
            ratePerAcre,
            totalQuantity: totalQty,
            unit: product.standardRatePerAcre.unit,
            applicationMethod: product.applicationMethod,
            notes: product.purpose,
            nSuppliedKg: nSupplied,
            p2o5SuppliedKg: pSupplied,
            k2oSuppliedKg: kSupplied,
          };

          const currentItems = state.fertilizerPlan?.items || [];
          const updatedItems = [...currentItems, newItem];

          const totalN = updatedItems.reduce((s, it) => s + (it.nSuppliedKg || 0), 0);
          const totalP = updatedItems.reduce((s, it) => s + (it.p2o5SuppliedKg || 0), 0);
          const totalK = updatedItems.reduce((s, it) => s + (it.k2oSuppliedKg || 0), 0);

          set({
            fertilizerPlan: {
              ...state.fertilizerPlan,
              items: updatedItems,
              totalNSuppliedKg: totalN,
              totalP2O5SuppliedKg: totalP,
              totalK2OSuppliedKg: totalK,
              isCustomized: true,
            },
          });
        },

        removeFertilizerPlanItem: (itemId) => {
          const state = get();
          const updatedItems = (state.fertilizerPlan?.items || []).filter((it) => it.id !== itemId);
          const totalN = updatedItems.reduce((s, it) => s + (it.nSuppliedKg || 0), 0);
          const totalP = updatedItems.reduce((s, it) => s + (it.p2o5SuppliedKg || 0), 0);
          const totalK = updatedItems.reduce((s, it) => s + (it.k2oSuppliedKg || 0), 0);

          set({
            fertilizerPlan: {
              ...state.fertilizerPlan,
              items: updatedItems,
              totalNSuppliedKg: totalN,
              totalP2O5SuppliedKg: totalP,
              totalK2OSuppliedKg: totalK,
              isCustomized: true,
            },
          });
        },

        resetFertilizerPlan: () => {
          const state = get();
          const freshPlan = generateFertilizerPlan(
            state.selectedCropId,
            state.inputs.fieldAreaAcres,
            { soilN: state.inputs.soilN, soilP: state.inputs.soilP, soilK: state.inputs.soilK },
            state.inputs.previousCrop
          );
          set({ fertilizerPlan: freshPlan });
        },

        updateFarmResource: (id, updates) => {
          set((state) => ({
            farmResources: state.farmResources.map((res) =>
              res.id === id ? { ...res, ...updates } : res
            ),
          }));
        },

        addFarmResource: (resource) => {
          set((state) => ({
            farmResources: [...(state.farmResources || DEFAULT_FARM_RESOURCES), resource],
          }));
        },

        resetFarmResources: () => {
          set({
            farmResources: DEFAULT_FARM_RESOURCES,
          });
        },

        startCropCycle: (cropId) => {
          const state = get();
          const id = cropId || state.selectedCropId;
          const tasks = generateCropCycleTasks(id, undefined, state.inputs.fieldAreaAcres);
          set({
            cropTasks: tasks,
            weeklyCheckins: [],
          });
        },

        toggleTask: (taskId) => {
          set((state) => {
            const isCompleted = state.cropTasks.find((t) => t.id === taskId)?.completed;
            const todayStr = new Date().toISOString().split('T')[0];
            return {
              cropTasks: state.cropTasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      completed: !isCompleted,
                      status: !isCompleted ? 'Completed' : 'Pending',
                      completedAt: !isCompleted ? todayStr : undefined,
                    }
                  : t
              ),
            };
          });
        },

        completeTask: (taskId, actualQuantityUsed, notes) => {
          set((state) => {
            const task = state.cropTasks.find((t) => t.id === taskId);
            if (!task) return state;

            const todayStr = new Date().toISOString().split('T')[0];
            const alreadyConsumed = state.consumedTaskIds[taskId];
            const qtyUsed = actualQuantityUsed !== undefined ? actualQuantityUsed : task.plannedQuantity;

            // Deduct from farm inventory if not deducted before
            let updatedResources = state.farmResources;
            const newConsumed = { ...state.consumedTaskIds };

            if (!alreadyConsumed && task.resourceItemId && qtyUsed > 0) {
              updatedResources = state.farmResources.map((res) => {
                if (task.resourceItemId && (res.id === task.resourceItemId || (res.productId && task.resourceItemId.includes(res.productId)))) {
                  const newAvail = Math.max(0, res.availableQty - qtyUsed);
                  const newUsable = Math.max(0, newAvail - res.reservedQty);
                  return {
                    ...res,
                    availableQty: newAvail,
                    usableQty: newUsable,
                    allocatedQty: Math.max(0, res.allocatedQty - qtyUsed),
                    remainingQty: Math.max(0, newUsable - Math.max(0, res.allocatedQty - qtyUsed)),
                  };
                }
                return res;
              });
              newConsumed[taskId] = true;
            }

            const updatedTasks = state.cropTasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    completed: true,
                    status: 'Completed' as const,
                    completedAt: todayStr,
                    actualQuantityUsed: qtyUsed,
                    consumptionLogged: true,
                    notes: notes ? `${t.notes} [Note: ${notes}]` : t.notes,
                    history: [
                      ...(t.history || []),
                      {
                        date: todayStr,
                        action: 'Completed',
                        note: `Completed. Used ${qtyUsed} ${t.resourceUnit}.`,
                      },
                    ],
                  }
                : t
            );

            return {
              cropTasks: updatedTasks,
              farmResources: updatedResources,
              consumedTaskIds: newConsumed,
            };
          });
        },

        rescheduleTask: (taskId, newDate, reason) => {
          set((state) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const updatedTasks = state.cropTasks.map((t) => {
              if (t.id === taskId) {
                const orig = t.originalDate || t.scheduledDate;
                return {
                  ...t,
                  scheduledDate: newDate,
                  dueDate: newDate,
                  originalDate: orig,
                  status: 'Rescheduled' as const,
                  rescheduleReason: reason || 'Farmer rescheduled',
                  notes: `${t.notes} [Rescheduled to ${newDate}${reason ? `: ${reason}` : ''}]`,
                  history: [
                    ...(t.history || []),
                    {
                      date: todayStr,
                      action: 'Rescheduled',
                      note: `Moved from ${orig} to ${newDate}. Reason: ${reason || 'User rescheduled'}`,
                    },
                  ],
                };
              }
              return t;
            });
            return { cropTasks: updatedTasks };
          });
        },

        addTask: (newTask) => {
          set((state) => ({
            cropTasks: [...state.cropTasks, newTask].sort(
              (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
            ),
          }));
        },

        deleteTask: (taskId) => {
          set((state) => ({
            cropTasks: state.cropTasks.filter((t) => t.id !== taskId),
          }));
        },

        submitWeeklyCheckin: (checkin) => {
          set((state) => {
            const { updatedTasks, record } = applyWeeklyCheckinAdjustment(state.cropTasks, checkin);
            return {
              cropTasks: updatedTasks,
              weeklyCheckins: [record, ...state.weeklyCheckins],
            };
          });
        },

        resetCropToDemo: () => {
          set({
            inputs: DEFAULT_INPUTS,
            rankedResults: rankAllCrops(DEFAULT_INPUTS),
            selectedCropId: 'crop_tomato',
            fertilizerPlan: generateFertilizerPlan('crop_tomato', 2.5),
            resourceInput: DEFAULT_RESOURCE_INPUT,
            resourceOutput: calculateResourcePlan(DEFAULT_RESOURCE_INPUT),
            farmResources: DEFAULT_FARM_RESOURCES,
            cropTasks: generateCropCycleTasks('crop_tomato', undefined, 2.5),
            weeklyCheckins: [],
            consumedTaskIds: {
              task_crop_tomato_w1_prep: true,
              task_crop_tomato_w1_beds: true,
            },
          });
        },
      };
    },
    {
      name: 'krishicycle_crops_v2',
      version: 3,
      migrate: (persistedState: any, version: number) => {
        const state = (persistedState && typeof persistedState === 'object') ? persistedState : {};
        if (!state.farmResources || !Array.isArray(state.farmResources) || state.farmResources.length === 0) {
          state.farmResources = DEFAULT_FARM_RESOURCES;
        }
        if (!state.cropTasks || !Array.isArray(state.cropTasks) || state.cropTasks.length === 0) {
          state.cropTasks = generateCropCycleTasks('crop_tomato', undefined, 2.5);
        } else {
          state.cropTasks = state.cropTasks.map((t: any) => ({
            ...t,
            scheduledDate: t.scheduledDate || t.dueDate || new Date().toISOString().split('T')[0],
            dueDate: t.dueDate || t.scheduledDate || new Date().toISOString().split('T')[0],
            cropStage: t.cropStage || t.stageKey || t.stage || 'Land Preparation',
            stage: t.stage || t.cropStage || 'Land Preparation',
            status: t.status || (t.completed ? 'Completed' : 'Upcoming'),
            completed: t.completed !== undefined ? t.completed : t.status === 'Completed',
            plannedQuantity: typeof t.plannedQuantity === 'number' ? t.plannedQuantity : 100,
            resourceRequired: t.resourceRequired || 'Organic amendment',
            resourceUnit: t.resourceUnit || 'kg',
            checklist: Array.isArray(t.checklist) ? t.checklist : ['Complete scheduled operation'],
          }));
        }
        return state;
      },
    }
  )
);
