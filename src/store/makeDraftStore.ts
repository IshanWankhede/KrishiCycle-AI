import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FertilizerRecipe, SoilInput } from '../types';

/**
 * Holds the in-progress Make wizard so the farmer can jump to the Marketplace for a missing
 * material and come back to the same recipe ("Return to my recipe").
 */
export interface MakeDraft {
  step: 1 | 2 | 3 | 4;
  cropId: string;
  soil: SoilInput;
  recipe: FertilizerRecipe | null;
  aiExplanation: string;
  preparedFromCropModule: boolean;
}

interface MakeDraftState {
  draft: MakeDraft | null;
  /** Set when the Marketplace was opened from a missing-material shortcut. */
  returnMaterialName: string | null;
  setDraft: (draft: MakeDraft | null) => void;
  setReturnMaterialName: (name: string | null) => void;
  clearDraft: () => void;
}

export const useMakeDraftStore = create<MakeDraftState>()(
  persist(
    (set) => ({
      draft: null,
      returnMaterialName: null,
      setDraft: (draft) => set({ draft }),
      setReturnMaterialName: (returnMaterialName) => set({ returnMaterialName }),
      clearDraft: () => set({ draft: null, returnMaterialName: null }),
    }),
    { name: 'krishicycle_make_draft_v1' }
  )
);
