import {
  ResourceInput,
  ResourcePlanOutput,
  FarmResourceItem,
  ScheduledFarmTask,
  CropTask,
  FertilizerPlan,
} from '../types';
import { CROPS_CATALOG } from '../data/crops';
import { FERTILIZER_CATALOG } from '../data/fertilizerCatalog';

// Default initial farm resources for a Maharashtra smallholder
export const DEFAULT_FARM_RESOURCES: FarmResourceItem[] = [
  {
    id: 'res_vermicompost',
    category: 'fertilizer',
    name: 'Enriched Vermicompost (Eisenia fetida)',
    productId: 'fert_vermicompost',
    availableQty: 1200,
    unit: 'kg',
    reservedQty: 200,
    allocatedQty: 1000,
    usableQty: 1000,
    expectedDemand: 1500,
    remainingQty: 0,
    replenishmentDate: '2026-11-05',
    replenishmentQty: 500,
    notes: 'Home-produced in 2 windrow beds; cured and sieved through 3mm mesh.',
  },
  {
    id: 'res_neem_cake',
    category: 'fertilizer',
    name: 'Cold Pressed Neem Seed Cake',
    productId: 'fert_neem_cake',
    availableQty: 300,
    unit: 'kg',
    reservedQty: 50,
    allocatedQty: 250,
    usableQty: 250,
    expectedDemand: 375,
    remainingQty: 0,
    notes: 'Procured from local agro-center; store in moisture-proof sacks.',
  },
  {
    id: 'res_fym',
    category: 'biomass',
    name: 'Aged Farmyard Manure (FYM)',
    productId: 'fert_fym',
    availableQty: 5000,
    unit: 'kg',
    reservedQty: 1000,
    allocatedQty: 4000,
    usableQty: 4000,
    expectedDemand: 6000,
    remainingQty: 0,
    notes: 'Decomposed cattle dung heap aged 6 months with dry farm stubble.',
  },
  {
    id: 'res_ssp',
    category: 'fertilizer',
    name: 'Single Superphosphate (SSP 16% P + 11% S)',
    productId: 'fert_ssp',
    availableQty: 200,
    unit: 'kg',
    reservedQty: 0,
    allocatedQty: 200,
    usableQty: 200,
    expectedDemand: 250,
    remainingQty: 0,
    notes: 'Granular grade; 4 bags of 50 kg stored in farm shed.',
  },
  {
    id: 'res_wood_ash',
    category: 'biomass',
    name: 'Hardwood Biomass Ash',
    productId: 'fert_wood_ash',
    availableQty: 150,
    unit: 'kg',
    reservedQty: 0,
    allocatedQty: 150,
    usableQty: 150,
    expectedDemand: 200,
    remainingQty: 0,
    notes: 'Collected from farm boiler & stubble bio-char burner; sieved.',
  },
  {
    id: 'res_water_well',
    category: 'water',
    name: 'Farm Dug Well + Drip System',
    availableQty: 150000,
    unit: 'litres',
    reservedQty: 20000,
    allocatedQty: 130000,
    usableQty: 130000,
    expectedDemand: 280000,
    remainingQty: 0,
    replenishmentDate: 'Daily recharge ~12,000 L',
    replenishmentQty: 12000,
    notes: 'Inline drip laterals at 40cm dripper spacing; 90% water application efficiency.',
  },
  {
    id: 'res_labour',
    category: 'labour',
    name: 'Farm Family Labour & Helpers',
    availableQty: 60,
    unit: 'person-days',
    reservedQty: 10,
    allocatedQty: 45,
    usableQty: 50,
    expectedDemand: 52,
    remainingQty: 5,
    notes: 'Family members (3 active) + 2 hired hands during peak transplanting and harvest.',
  },
  {
    id: 'res_tractor',
    category: 'equipment',
    name: 'Mini-Tractor & Rotavator',
    availableQty: 24,
    unit: 'hours',
    reservedQty: 4,
    allocatedQty: 16,
    usableQty: 20,
    expectedDemand: 18,
    remainingQty: 2,
    notes: 'Available for plowing, bed making, and trailer transport.',
  },
];

/**
 * Calculates seasonal water requirement based on crop, area, duration, and irrigation method
 */
export const calculateCropWaterRequirementLiters = (
  cropId: string,
  fieldAcres: number,
  irrigationMethod: string = 'drip'
): { totalLiters: number; weeklyLiters: number; efficiencyPct: number } => {
  const crop = CROPS_CATALOG.find((c) => c.id === cropId) || CROPS_CATALOG[0];

  // Base depth in mm across season
  let depthMm = 550; // medium baseline
  if (crop.waterNeed === 'Low') depthMm = 350;
  else if (crop.waterNeed === 'High') depthMm = 800;

  // Irrigation system application efficiency
  let efficiency = 0.90; // drip
  if (irrigationMethod === 'sprinkler') efficiency = 0.75;
  else if (irrigationMethod === 'flood') efficiency = 0.50;
  else if (irrigationMethod === 'rainfed') efficiency = 0.60;

  // 1 mm depth over 1 acre = 4,046.86 Liters
  const totalLiters = Math.round((depthMm * 4046.86 * fieldAcres) / efficiency);

  const avgDurationDays = (crop.durationDays[0] + crop.durationDays[1]) / 2;
  const numWeeks = Math.max(6, Math.round(avgDurationDays / 7));
  const weeklyLiters = Math.round(totalLiters / numWeeks);

  return {
    totalLiters,
    weeklyLiters,
    efficiencyPct: Math.round(efficiency * 100),
  };
};

/**
 * Computes resource demand summary comparing inventory vs requirement
 */
export const calculateResourceDemandGrid = (
  resources: FarmResourceItem[] = [],
  fertilizerPlan?: FertilizerPlan,
  fieldAcres: number = 2.5
): {
  items: FarmResourceItem[];
  hasShortages: boolean;
  shortageCount: number;
} => {
  let hasShortages = false;
  let shortageCount = 0;

  const safeResources = Array.isArray(resources) && resources.length > 0 ? resources : DEFAULT_FARM_RESOURCES;

  const updated = safeResources.map((res) => {
    let expectedDemand = res.expectedDemand || 0;

    // If it's a fertilizer product present in the fertilizer plan, sync demand directly!
    if (res.productId && fertilizerPlan?.items) {
      const matchItem = fertilizerPlan.items.find((it) => it.productId === res.productId);
      if (matchItem) {
        expectedDemand = matchItem.totalQuantity || expectedDemand;
      }
    }

    const availableQty = typeof res.availableQty === 'number' ? res.availableQty : 0;
    const reservedQty = typeof res.reservedQty === 'number' ? res.reservedQty : 0;
    const usableQty = Math.max(0, availableQty - reservedQty);
    const allocatedQty = Math.min(usableQty, expectedDemand);
    const remainingQty = Math.max(0, usableQty - allocatedQty);
    const isShortage = usableQty < expectedDemand;

    if (isShortage) {
      hasShortages = true;
      shortageCount++;
    }

    return {
      ...res,
      availableQty,
      reservedQty,
      usableQty,
      expectedDemand,
      allocatedQty,
      remainingQty,
    };
  });

  return {
    items: updated,
    hasShortages,
    shortageCount,
  };
};


/**
 * Generates an end-to-end weekly schedule connected with the fertilizer plan and inventory
 */
export const generateWeeklyFarmSchedule = (
  cropId: string,
  fieldAcres: number = 2.5,
  startDateStr?: string,
  fertilizerPlan?: FertilizerPlan,
  irrigationMethod: string = 'drip'
): ScheduledFarmTask[] => {
  const crop = CROPS_CATALOG.find((c) => c.id === cropId) || CROPS_CATALOG[0];
  const start = startDateStr ? new Date(startDateStr) : new Date();

  const addDays = (d: Date, days: number): string => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + days);
    return copy.toISOString().split('T')[0];
  };

  const waterCalc = calculateCropWaterRequirementLiters(crop.id, fieldAcres, irrigationMethod);

  // Basal fertilizers from plan or default
  const basalItems = fertilizerPlan?.items?.filter((it) => it.stage.toLowerCase().includes('basal')) || [];
  const basalSummary = basalItems.length > 0
    ? basalItems.map((it) => `${it.totalQuantity} kg ${it.productName}`).join(' + ')
    : `${Math.round(600 * fieldAcres)} kg Vermicompost + ${Math.round(150 * fieldAcres)} kg Neem Cake`;

  // Top dressing from plan
  const topDressItems = fertilizerPlan?.items?.filter((it) => it.stage.toLowerCase().includes('vegetative') || it.stage.toLowerCase().includes('dressing')) || [];
  const topDressSummary = topDressItems.length > 0
    ? topDressItems.map((it) => `${it.totalQuantity} kg ${it.productName}`).join(' + ')
    : `${Math.round(200 * fieldAcres)} L Jeevamrut or Water-Soluble NPK`;

  // Potash bulking from plan
  const potashItems = fertilizerPlan?.items?.filter((it) => it.stage.toLowerCase().includes('flowering') || it.stage.toLowerCase().includes('bulbing') || it.stage.toLowerCase().includes('fruit')) || [];
  const potashSummary = potashItems.length > 0
    ? potashItems.map((it) => `${it.totalQuantity} kg ${it.productName}`).join(' + ')
    : `${Math.round(25 * fieldAcres)} kg Sulphate of Potash / Bio-Potash`;

  const durationMid = Math.round((crop.durationDays[0] + crop.durationDays[1]) / 2);

  const tasks: ScheduledFarmTask[] = [
    {
      id: `task_${crop.id}_w1_prep`,
      cropId: crop.id,
      weekNumber: 1,
      scheduledDate: addDays(start, 2),
      cropStage: 'Land Preparation & Basal Dressing',
      stageKey: 'land_prep',
      title: `Deep Tillage & Basal Fertilizer Incorporation for ${crop.nameEn}`,
      description: `Incorporate basal organic fertilizers (${basalSummary}) uniformly into the top 15 cm soil layer.`,
      resourceRequired: basalSummary,
      resourceItemId: 'res_vermicompost',
      plannedQuantity: Math.round(750 * fieldAcres),
      resourceUnit: 'kg',
      waterRequirementLiters: Math.round(waterCalc.weeklyLiters * 0.4),
      labourRequiredDays: 4,
      equipmentRequired: 'Mini-Tractor & Rotavator',
      priority: 'High',
      status: 'Completed',
      completedAt: addDays(start, 1),
      actualQuantityUsed: Math.round(750 * fieldAcres),
      consumptionLogged: true,
      checklist: [
        'Clear weeds and previous crop stubbles',
        `Broadcast ${basalSummary} evenly across ${fieldAcres} acres`,
        'Disk harrow to mix organic matter into the top soil horizon',
        'Level plot to prevent water logging in furrows',
      ],
      guideVideoTitle: 'Deep Soil Tillage & Basal Fertilizer Incorporation',
      notes: 'Applied with moisture present in soil for rapid microbial integration.',
      history: [
        {
          date: addDays(start, 1),
          action: 'Completed',
          note: 'Full basal dose incorporated successfully. Inventory updated.',
        },
      ],
    },
    {
      id: `task_${crop.id}_w1_beds`,
      cropId: crop.id,
      weekNumber: 1,
      scheduledDate: addDays(start, 5),
      cropStage: 'Bed Formation & Irrigation Setup',
      stageKey: 'land_prep',
      title: 'Raised Bed Shaping & Drip Line Laying',
      description: 'Form 1.2 m broad raised beds and lay lateral drip lines with 40 cm dripper spacing.',
      resourceRequired: 'Drip lines & Bed Former',
      resourceItemId: 'res_water_well',
      plannedQuantity: Math.round(waterCalc.weeklyLiters * 0.6),
      resourceUnit: 'litres',
      waterRequirementLiters: Math.round(waterCalc.weeklyLiters * 0.6),
      labourRequiredDays: 3,
      equipmentRequired: 'Bed Maker & Inline Drippers',
      priority: 'High',
      status: 'Completed',
      completedAt: addDays(start, 4),
      actualQuantityUsed: Math.round(waterCalc.weeklyLiters * 0.6),
      consumptionLogged: true,
      checklist: [
        'Shape raised beds 15 cm high with 30 cm drainage furrows',
        'Lay inline drippers and test uniform pressure (1.0–1.2 kg/cm²)',
        'Pre-soak raised beds 24 hours prior to seedling transplanting',
      ],
      guideVideoTitle: 'Laying Drip Lines on Raised Furrow Beds',
      notes: 'Pressure tested at all emitter junctions with zero clogging.',
      history: [
        {
          date: addDays(start, 4),
          action: 'Completed',
          note: 'Beds shaped and pre-soaked.',
        },
      ],
    },
    {
      id: `task_${crop.id}_w2_sowing`,
      cropId: crop.id,
      weekNumber: 2,
      scheduledDate: addDays(start, 9),
      cropStage: 'Sowing / Transplanting',
      stageKey: 'sowing',
      title: `${crop.category === 'fruiting' ? 'Seedling Transplanting' : 'Precision Seed Sowing'} & Bio-Inoculation`,
      description: `Plant disease-free seedlings / certified seed treated with bio-inoculant consortium (Trichoderma + Azotobacter / Rhizobium).`,
      resourceRequired: `Certified ${crop.nameEn} Seedlings + 2 kg Trichoderma`,
      resourceItemId: 'res_labour',
      plannedQuantity: 2,
      resourceUnit: 'kg',
      waterRequirementLiters: waterCalc.weeklyLiters,
      labourRequiredDays: 6,
      priority: 'High',
      status: 'Pending',
      checklist: [
        'Select healthy, vigorous 25-day-old nursery seedlings',
        'Dip seedling roots in 2% Trichoderma viride liquid solution for 15 minutes',
        'Transplant during cool late afternoon hours to minimize transplant shock',
        'Give immediate light drip irrigation for 30 minutes after planting',
      ],
      guideVideoTitle: 'Healthy Seedling Root Dip & Spacing',
      notes: 'Scheduled for evening planting window to ensure high survival rate.',
    },
    {
      id: `task_${crop.id}_w4_fert`,
      cropId: crop.id,
      weekNumber: 4,
      scheduledDate: addDays(start, 24),
      cropStage: 'Vegetative Growth Phase',
      stageKey: 'fertilizer',
      title: 'First Vegetative Nutrient Fertigation / Top Dressing',
      description: `Apply vegetative nutrient formulation (${topDressSummary}) to encourage strong lateral shoots and deep roots.`,
      resourceRequired: topDressSummary,
      resourceItemId: 'res_ssp',
      plannedQuantity: Math.round(50 * fieldAcres),
      resourceUnit: 'kg',
      waterRequirementLiters: waterCalc.weeklyLiters,
      labourRequiredDays: 2,
      priority: 'High',
      status: 'Upcoming',
      checklist: [
        'Strain liquid bio-slurry / fertigation feed through fine mesh',
        'Run clean water through drip lines for 15 minutes first',
        'Inject nutrient feed through Venturi injector during the middle hour',
        'Flush drip lines with clear water for 10 minutes afterwards',
      ],
      guideVideoTitle: 'Drip Fertigation with Organic Bio-Slurry',
      notes: 'Scheduled during rapid canopy expansion stage.',
    },
    {
      id: `task_${crop.id}_w5_weeding`,
      cropId: crop.id,
      weekNumber: 5,
      scheduledDate: addDays(start, 35),
      cropStage: 'Weed Management & Mulching',
      stageKey: 'weeding',
      title: 'Inter-Cultivation Weeding & Soil Mulching',
      description: 'Shallow manual hoeing around crop stems followed by spreading dry straw mulch to preserve soil moisture.',
      resourceRequired: 'Hand Tools + 500 kg Dry Crop Residue Mulch',
      resourceItemId: 'res_labour',
      plannedQuantity: 4,
      resourceUnit: 'person-days',
      waterRequirementLiters: waterCalc.weeklyLiters,
      labourRequiredDays: 4,
      priority: 'Medium',
      status: 'Upcoming',
      checklist: [
        'Remove broadleaf weeds before they reach flowering/seed setting',
        'Lightly loosen soil crust around root crown for aeration',
        'Spread 5 cm dry straw mulch layer over exposed soil between rows',
      ],
      guideVideoTitle: 'Mulch Management & Hand Weeding Techniques',
      notes: 'Mulching reduces evaporative moisture loss by up to 35%.',
    },
    {
      id: `task_${crop.id}_w7_foliar`,
      cropId: crop.id,
      weekNumber: 7,
      scheduledDate: addDays(start, 49),
      cropStage: 'Flowering & Pest Monitoring',
      stageKey: 'pest',
      title: 'Preventive Bio-Pesticide Spray (Neem Extract & Buttermilk)',
      description: 'Early morning foliar spray with 5% cold-pressed neem seed oil to repel sucking pests and fungal spores.',
      resourceRequired: '5 L Neem Oil + 100 L Water + Knapsack Sprayer',
      plannedQuantity: 5,
      resourceUnit: 'litres',
      waterRequirementLiters: 200,
      labourRequiredDays: 2,
      priority: 'Medium',
      status: 'Upcoming',
      checklist: [
        'Emulsify neem oil with 1 ml/L organic soap solution',
        'Spray uniformly covering both upper and lower leaf surfaces',
        'Inspect yellow sticky traps on field borders for thrips or whitefly',
      ],
      guideVideoTitle: 'Formulating 5% Neem Kernel Extract (NSKE)',
      notes: 'Foliar application to be done before 9:00 AM.',
    },
    {
      id: `task_${crop.id}_w9_potash`,
      cropId: crop.id,
      weekNumber: 9,
      scheduledDate: addDays(start, 63),
      cropStage: 'Fruit Setting / Bulbing Phase',
      stageKey: 'fertilizer',
      title: 'Potassium Boost & Micronutrient Application',
      description: `Apply potassium feed (${potashSummary}) to accelerate sugar translocation, fruit sizing, and skin thickness.`,
      resourceRequired: potashSummary,
      resourceItemId: 'res_wood_ash',
      plannedQuantity: Math.round(35 * fieldAcres),
      resourceUnit: 'kg',
      waterRequirementLiters: waterCalc.weeklyLiters,
      labourRequiredDays: 2,
      priority: 'High',
      status: 'Upcoming',
      checklist: [
        'Ensure soil is adequately moist before potassium application',
        'Add Boron (1g/L) to prevent fruit cracking and flower drop',
        'Monitor fruit weight gain and color formation',
      ],
      guideVideoTitle: 'Bio-Potash & Micronutrient Fertigation',
      notes: 'Critical stage for yield tonnage and market grading.',
    },
    {
      id: `task_${crop.id}_w14_harvest`,
      cropId: crop.id,
      weekNumber: Math.max(10, Math.round(durationMid / 7)),
      scheduledDate: addDays(start, durationMid),
      cropStage: 'Harvesting & Post-Harvest Handling',
      stageKey: 'harvest',
      title: `Final Harvesting, Sorting & Crating of ${crop.nameEn}`,
      description: `Selective hand picking at optimal maturity index, sorting into Grade A and Grade B, and packing into ventilated crates.`,
      resourceRequired: 'Harvest Crates & Labour',
      resourceItemId: 'res_labour',
      plannedQuantity: 8,
      resourceUnit: 'person-days',
      waterRequirementLiters: Math.round(waterCalc.weeklyLiters * 0.3),
      labourRequiredDays: 8,
      priority: 'High',
      status: 'Upcoming',
      checklist: [
        'Harvest in the cool morning hours to maintain post-harvest crispness',
        'Sort into Grade A (firm, blemish-free) and Grade B for local processing',
        'Store in ventilated plastic crates in shaded packing area',
        'Collect field crop stubble immediately for next cycle composting in Module 2',
      ],
      guideVideoTitle: 'Harvest Hygiene, Grading & Crating',
      notes: `Expected base yield: ${crop.baseYieldQuintalsPerAcre} on ${fieldAcres} acres. Stubble will be fed into KrishiCycle formulation wizard.`,
    },
  ];

  return tasks;
};

/**
 * Legacy backward compatibility helper
 */
export const calculateResourcePlan = (input: ResourceInput): ResourcePlanOutput => {
  const totalPerAcreRequirement = 600;
  const estimatedTotalFertilizerRequiredKg = Math.round(input.landAreaAcres * totalPerAcreRequirement);

  const organicPotentialKg = Math.round(
    input.cropResidueKg * 0.45 +
    input.dryLeavesKg * 0.45 +
    input.cowDungKg * 0.50 +
    input.kitchenWasteKg * 0.35 +
    input.woodAshKg * 0.90 +
    input.existingFertilizerKg
  );

  const shortfallKg = Math.max(0, estimatedTotalFertilizerRequiredKg - organicPotentialKg);
  const potentialExternalAvoidedKg = Math.min(estimatedTotalFertilizerRequiredKg, organicPotentialKg);

  let waterPriority: 'High' | 'Normal' | 'Critical' = 'Normal';
  if (input.waterAvailability === 'scarce') {
    waterPriority = 'Critical';
  }

  const suggestedAllocation: string[] = [];

  if (organicPotentialKg >= estimatedTotalFertilizerRequiredKg) {
    suggestedAllocation.push('Your farm has sufficient on-farm biomass to achieve 100% self-reliance in basal organic fertilizer!');
    suggestedAllocation.push(`Surplus potential of ${organicPotentialKg - estimatedTotalFertilizerRequiredKg} kg can be packaged and listed on the Marketplace.`);
  } else {
    suggestedAllocation.push(`On-farm organic materials can fulfill ${Math.round((organicPotentialKg / estimatedTotalFertilizerRequiredKg) * 100)}% of your seasonal crop requirement.`);
    suggestedAllocation.push(`Shortfall of ${shortfallKg} kg can be formulated by procuring raw neem cake / biomass ash or purchasing local farmer-made vermicompost.`);
  }

  if (input.waterAvailability === 'scarce') {
    suggestedAllocation.push('Water is scarce: allocate compost as mulch around root zones to minimize evaporative moisture loss by up to 35%.');
  }

  return {
    estimatedTotalFertilizerRequiredKg,
    organicFertilizerPotentialKg: organicPotentialKg,
    shortfallKg,
    waterPriority,
    potentialExternalAvoidedKg,
    suggestedAllocation,
  };
};
