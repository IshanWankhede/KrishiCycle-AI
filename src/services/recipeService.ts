import {
  BASE_RECIPE_RATIOS,
  CROP_CATEGORY_ADJUSTMENTS,
  SOIL_ADJUSTMENTS,
  RECIPE_CONFIG_VERSION,
  BaseRecipeRatios,
} from './recipeConfig';
import { Crop, CropCategory, FertilizerRecipe, RecipeMaterialItem, SoilInput } from '../types';

export const RECIPE_DISCLAIMER =
  'Illustrative, validate with your local KVK / agriculture officer / Soil Health Card';

/**
 * Pure maths: base ratios + crop-category adjustments + soil adjustments,
 * floored at 1% and normalised so the ratios sum to exactly 1.00.
 * All numbers live in recipeConfig.ts (versioned). AI text never touches this.
 */
export const computeNormalizedRatios = (
  cropCategory: CropCategory,
  soilStatus?: { n?: string; p?: string; k?: string }
): BaseRecipeRatios => {
  const ratios: BaseRecipeRatios = { ...BASE_RECIPE_RATIOS };

  const cropAdj: Partial<Record<keyof BaseRecipeRatios, number>> =
    CROP_CATEGORY_ADJUSTMENTS[cropCategory] || CROP_CATEGORY_ADJUSTMENTS.fruiting;
  (Object.keys(cropAdj) as (keyof BaseRecipeRatios)[]).forEach((key) => {
    ratios[key] += cropAdj[key] ?? 0;
  });

  if (soilStatus?.n === 'Low') {
    ratios.neemCake += SOIL_ADJUSTMENTS.lowN.neemCake;
    ratios.cowDung += SOIL_ADJUSTMENTS.lowN.cowDung;
    ratios.dryLeaves += SOIL_ADJUSTMENTS.lowN.dryLeaves;
  }
  if (soilStatus?.p === 'Low') {
    ratios.rockPhosphate += SOIL_ADJUSTMENTS.lowP.rockPhosphate;
    ratios.dryLeaves += SOIL_ADJUSTMENTS.lowP.dryLeaves;
  }
  if (soilStatus?.k === 'Low') {
    ratios.woodAsh += SOIL_ADJUSTMENTS.lowK.woodAsh;
    ratios.dryLeaves += SOIL_ADJUSTMENTS.lowK.dryLeaves;
  }

  (Object.keys(ratios) as (keyof BaseRecipeRatios)[]).forEach((k) => {
    if (ratios[k] < 0.01) ratios[k] = 0.01;
  });

  const rawSum = Object.values(ratios).reduce((a, b) => a + b, 0);
  return {
    dryLeaves: ratios.dryLeaves / rawSum,
    kitchenScraps: ratios.kitchenScraps / rawSum,
    cowDung: ratios.cowDung / rawSum,
    neemCake: ratios.neemCake / rawSum,
    woodAsh: ratios.woodAsh / rawSum,
    rockPhosphate: ratios.rockPhosphate / rawSum,
  };
};

/** Rounds shares to whole percentages that add up to exactly 100 (largest-remainder method). */
const toWholePercentages = (shares: number[]): number[] => {
  const floors = shares.map((s) => Math.floor(s * 100));
  let remainder = 100 - floors.reduce((a, b) => a + b, 0);
  const order = shares
    .map((s, i) => ({ i, frac: s * 100 - Math.floor(s * 100) }))
    .sort((a, b) => b.frac - a.frac);
  for (let n = 0; remainder > 0 && n < order.length; n++, remainder--) {
    floors[order[n].i] += 1;
  }
  return floors;
};

export interface RecipeSoilInput {
  soilType: string;
  ph: number;
  n: string;
  p: string;
  k: string;
  targetQuantityKg: number;
  landAreaM2: number;
}

/**
 * Deterministic recipe for the Make wizard. Returns exact kg per material (2 decimals)
 * plus preparation steps and safety rules.
 */
export const calculateFertilizerRecipe = (crop: Crop, soil: RecipeSoilInput): FertilizerRecipe => {
  const targetKg = Math.max(5, soil.targetQuantityKg || 10);
  const r = computeNormalizedRatios(crop.category, { n: soil.n, p: soil.p, k: soil.k });

  const defs: { id: string; name: string; share: number; purpose: string }[] = [
    {
      id: 'mat_dry_leaves',
      name: 'Dry Brown Leaves & Straw (Carbon Matrix)',
      share: r.dryLeaves,
      purpose: 'Carbon structure, aeration channels & moisture regulation',
    },
    {
      id: 'mat_veg_waste',
      name: 'Vegetable & Fruit Kitchen Waste',
      share: r.kitchenScraps,
      purpose: 'Rapid nitrogen supply and organic moisture',
    },
    {
      id: 'mat_cow_dung',
      name: 'Aged Cow Dung / Cattle Manure',
      share: r.cowDung,
      purpose: 'Microbial starter and balanced organic base nutrients',
    },
    {
      id: 'mat_neem_cake',
      name: 'Neem Seed Cake Powder',
      share: r.neemCake,
      purpose: 'Slow-release nitrogen and nematode defence',
    },
    {
      id: 'mat_wood_ash',
      name: 'Wood Ash / Bio-Potash',
      share: r.woodAsh,
      purpose: `Organic potassium (K) booster tailored for ${crop.nameEn}`,
    },
    {
      id: 'mat_bone_meal',
      name: 'Rock Phosphate / Steamed Bone Meal',
      share: r.rockPhosphate,
      purpose: 'Phosphorus (P) for sturdy root branching and flowering',
    },
  ];

  const percents = toWholePercentages(defs.map((d) => d.share));
  const materials: RecipeMaterialItem[] = defs.map((d, i) => ({
    materialId: d.id,
    materialName: d.name,
    quantityKg: Number((targetKg * d.share).toFixed(2)),
    purpose: d.purpose,
    percentage: percents[i],
  }));

  return {
    id: `RCP-${crop.id.replace('crop_', '').slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    name: `Formulation for ${crop.nameEn} (${targetKg} kg target)`,
    cropId: crop.id,
    cropName: crop.nameEn,
    version: RECIPE_CONFIG_VERSION,
    targetQuantityKg: targetKg,
    targetUse: `Illustrative mix for ${soil.soilType} soil (pH ${soil.ph}) covering about ${soil.landAreaM2} m²`,
    estimatedCnRatio: 28,
    targetMoistureRange: '48% - 58%',
    materials,
    preparationInstructions: [
      'Chop dry leaves and vegetable scraps to 2-4 cm pieces to expand surface area.',
      'Layer dry browns and moist greens in alternating 3-inch layers.',
      'Blend in cow dung starter slurry and distribute neem cake and rock phosphate uniformly.',
      'Moisten with water until a handful feels like a damp wrung-out sponge (moisture 50-55%).',
      'Maintain an aerobic pile and turn every 5-7 days once the temperature exceeds 55°C.',
      'Cure for 10-14 days at ambient temperature before final testing.',
    ],
    warnings: [
      'Do not add plastic, metal, rubber, or toxic treated wood.',
      'Avoid pet feces, meat, or heavy cooking oils.',
      'Wear protective gloves during mixing and turn the pile if the internal temperature goes above 68°C.',
    ],
    aiExplanation: `This illustrative recipe targets an estimated carbon-to-nitrogen balance of about 25–30:1 for ${crop.nameEn} in ${soil.soilType} soil. Neem cake slows nitrogen loss, while wood ash and rock phosphate add potassium and phosphorus. Validate quantities with your local KVK or Soil Health Card.`,
    createdAt: new Date().toISOString(),
  };
};

export const toSoilInputShape = (s: SoilInput): RecipeSoilInput => ({
  soilType: s.soilType,
  ph: s.ph,
  n: s.n,
  p: s.p,
  k: s.k,
  targetQuantityKg: s.targetQuantityKg,
  landAreaM2: s.landAreaM2,
});
