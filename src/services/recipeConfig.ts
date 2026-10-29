/**
 * Recipe Configuration (ILLUSTRATIVE v2.4, PRISM'26 Hackathon Prototype)
 * Label: Illustrative, validate with your local KVK / agriculture officer / Soil Health Card
 */

export const RECIPE_CONFIG_VERSION = 'recipeConfig v2.4 (illustrative)';

export interface BaseRecipeRatios {
  dryLeaves: number;      // 0.35
  kitchenScraps: number;  // 0.30
  cowDung: number;        // 0.20
  neemCake: number;       // 0.08
  woodAsh: number;        // 0.04
  rockPhosphate: number;  // 0.03
}

export const BASE_RECIPE_RATIOS: BaseRecipeRatios = {
  dryLeaves: 0.35,
  kitchenScraps: 0.30,
  cowDung: 0.20,
  neemCake: 0.08,
  woodAsh: 0.04,
  rockPhosphate: 0.03,
};

export const CROP_CATEGORY_ADJUSTMENTS = {
  fruiting: {
    woodAsh: +0.03,
    rockPhosphate: +0.02,
    dryLeaves: -0.05,
  },
  leafy: {
    kitchenScraps: +0.05,
    cowDung: +0.03,
    dryLeaves: -0.08,
  },
  root: {
    rockPhosphate: +0.04,
    woodAsh: +0.02,
    kitchenScraps: -0.06,
  },
  cereal: {
    cowDung: +0.03,
    dryLeaves: -0.03,
  },
  pulse: {
    rockPhosphate: +0.03,
    neemCake: -0.01,
    dryLeaves: -0.02,
  }
};

export const SOIL_ADJUSTMENTS = {
  lowN: {
    neemCake: +0.02,
    cowDung: +0.02,
    dryLeaves: -0.04,
  },
  lowP: {
    rockPhosphate: +0.03,
    dryLeaves: -0.03,
  },
  lowK: {
    woodAsh: +0.03,
    dryLeaves: -0.03,
  }
};
