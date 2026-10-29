import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RawMaterialStockItem, ResourceInput } from '../types';
import { RAW_MATERIALS } from '../data/rawMaterials';

/**
 * Raw materials the farmer says they have on the farm ("User-provided").
 * Shared by the Make wizard (Step 4 required vs available vs missing).
 */

const DEFAULT_KG: Record<string, number> = {
  mat_dry_leaves: 350,
  mat_veg_waste: 150,
  mat_cow_dung: 500,
  mat_neem_cake: 15,
  mat_wood_ash: 60,
  mat_bone_meal: 10,
};

const buildDefaultStock = (): Record<string, RawMaterialStockItem> => {
  const now = new Date().toISOString();
  const stock: Record<string, RawMaterialStockItem> = {};
  RAW_MATERIALS.forEach((m) => {
    stock[m.id] = { materialId: m.id, inStock: true, quantityKg: DEFAULT_KG[m.id] ?? 0, updatedAt: now };
  });
  return stock;
};

interface InventoryState {
  stock: Record<string, RawMaterialStockItem>;
  setStock: (materialId: string, inStock: boolean, quantityKg: number) => void;
  /** Carries the Module 1 resource plan into the Make wizard ("carried from your farm profile"). */
  syncFromResourcePlan: (input: ResourceInput) => void;
  resetInventoryToDemo: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      stock: buildDefaultStock(),

      setStock: (materialId, inStock, quantityKg) =>
        set((state) => ({
          stock: {
            ...state.stock,
            [materialId]: {
              materialId,
              inStock,
              quantityKg: Math.max(0, quantityKg),
              updatedAt: new Date().toISOString(),
            },
          },
        })),

      syncFromResourcePlan: (input) =>
        set((state) => {
          const now = new Date().toISOString();
          const next = { ...state.stock };
          const put = (id: string, kg: number) => {
            next[id] = { materialId: id, inStock: kg > 0, quantityKg: Math.max(0, kg), updatedAt: now };
          };
          put('mat_dry_leaves', input.cropResidueKg + input.dryLeavesKg);
          put('mat_veg_waste', input.kitchenWasteKg);
          put('mat_cow_dung', input.cowDungKg);
          put('mat_wood_ash', input.woodAshKg);
          return { stock: next };
        }),

      resetInventoryToDemo: () => set({ stock: buildDefaultStock() }),
    }),
    { name: 'krishicycle_inventory_v1' }
  )
);
