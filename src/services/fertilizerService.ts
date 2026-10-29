import { FertilizerPlan, FertilizerPlanItem, FertilizerScheduleItem } from '../types';
import { CROPS_CATALOG } from '../data/crops';
import { FERTILIZER_CATALOG } from '../data/fertilizerCatalog';

// Standard agronomic nutrient demand (kg/acre) for representative Maharashtra crops
export interface CropNutrientDemand {
  n: number;
  p2o5: number;
  k2o: number;
  secondaryMicros?: string;
  notes: string;
}

export const CROP_NUTRIENT_DEMANDS: Record<string, CropNutrientDemand> = {
  crop_tomato: {
    n: 110,
    p2o5: 55,
    k2o: 95,
    secondaryMicros: 'Calcium (Blossom-end rot prevention), Boron, Magnesium',
    notes: 'Heavy potassium consumer during fruit development; requires steady calcium availability.',
  },
  crop_onion: {
    n: 95,
    p2o5: 48,
    k2o: 60,
    secondaryMicros: 'Sulphur 15–20 kg/acre (essential for allicin pungency and skin firmness)',
    notes: 'High phosphorus demand for root initiation, high sulphur for bulb development and storage quality.',
  },
  crop_soybean: {
    n: 25, // Starter dose only; fixes 70-80% of its own N via Bradyrhizobium
    p2o5: 65,
    k2o: 40,
    secondaryMicros: 'Sulphur 10 kg/acre, Molybdenum for nitrogenase enzyme',
    notes: 'Avoid excessive nitrogen; focus on phosphorus and Rhizobium seed inoculation.',
  },
  crop_cotton: {
    n: 100,
    p2o5: 50,
    k2o: 60,
    secondaryMicros: 'Magnesium (prevents leaf reddening), Zinc, Boron',
    notes: 'Responsive to split applications; potassium crucial during boll development.',
  },
  crop_spinach: {
    n: 60,
    p2o5: 25,
    k2o: 35,
    secondaryMicros: 'Iron, Zinc for deep green leaf chlorophyll',
    notes: 'Short duration crop (35–45 days); fast-acting organic nitrogen produces tender leaves.',
  },
  crop_pomegranate: {
    n: 80,
    p2o5: 40,
    k2o: 80,
    secondaryMicros: 'Boron (prevents aril cracking), Zinc, Calcium',
    notes: 'Drip fertigation preferred; potassium critical for fruit size and deep ruby aril color.',
  },
  crop_wheat: {
    n: 90,
    p2o5: 45,
    k2o: 35,
    secondaryMicros: 'Zinc (prevents Khaira chlorosis), Sulphur',
    notes: 'Crown root initiation (21 DAS) and tillering are critical nutrient absorption stages.',
  },
  crop_gram: {
    n: 20, // Starter N
    p2o5: 45,
    k2o: 20,
    secondaryMicros: 'Sulphur, Iron',
    notes: 'Winter pulse crop fixing atmospheric nitrogen; needs phosphorus for strong taproots.',
  },
  crop_sugarcane: {
    n: 150,
    p2o5: 65,
    k2o: 85,
    secondaryMicros: 'Iron, Zinc, Sulphur',
    notes: 'High biomass crop requiring heavy organic manure incorporation at furrowing.',
  },
  crop_grapes: {
    n: 75,
    p2o5: 40,
    k2o: 110,
    secondaryMicros: 'Boron, Magnesium, Zinc',
    notes: 'Nashik vineyard standard; high potassium enhances sugar accumulation and berry elongation.',
  },
  default: {
    n: 80,
    p2o5: 40,
    k2o: 40,
    secondaryMicros: 'General organic micro-nutrients',
    notes: 'Standard balanced recommendation for mixed vegetable/cereal cropping.',
  },
};

/**
 * Calculates estimated nutrient balance after the preceding crop
 */
export const calculatePrecedingCropBalance = (
  previousCrop: string,
  residueManagement?: string
): { nCreditKg: number; pCreditKg: number; kCreditKg: number; explanation: string } => {
  const prevLower = (previousCrop || '').toLowerCase();

  // Legumes fix nitrogen and leave residual N
  if (prevLower.includes('soybean') || prevLower.includes('gram') || prevLower.includes('pulse') || prevLower.includes('moong') || prevLower.includes('urad')) {
    const isIncorporated = residueManagement === 'Incorporated into Soil';
    return {
      nCreditKg: isIncorporated ? 18 : 12,
      pCreditKg: 3,
      kCreditKg: isIncorporated ? 8 : 4,
      explanation: `Preceding legume (${previousCrop}) fixed atmospheric nitrogen, contributing ~${isIncorporated ? 18 : 12} kg N/acre residual credit${isIncorporated ? ' with incorporated root nodules and residue' : ''}.`,
    };
  }

  // Heavy biomass cereal or cash crops
  if (prevLower.includes('sugarcane') || prevLower.includes('cotton') || prevLower.includes('maize')) {
    const isIncorporated = residueManagement === 'Incorporated into Soil';
    if (isIncorporated) {
      return {
        nCreditKg: -5, // Initial microbial tie-up
        pCreditKg: 0,
        kCreditKg: 10, // Stubble potash release
        explanation: `Incorporated ${previousCrop} stubble enriches potassium (+10 kg K₂O/acre), but temporary nitrogen tie-up requires a small starter N dose.`,
      };
    }
    return {
      nCreditKg: -8,
      pCreditKg: -3,
      kCreditKg: -5,
      explanation: `Previous heavy-feeder (${previousCrop}) depleted soil reserves; baseline replenishment recommended.`,
    };
  }

  // Standard break crop or fallow
  return {
    nCreditKg: 0,
    pCreditKg: 0,
    kCreditKg: 0,
    explanation: `Standard rotation following ${previousCrop || 'previous crop'}. No significant residual nutrient legacy detected.`,
  };
};

/**
 * Calculates net target nutrient requirements
 */
export const calculateNetNutrientTargets = (
  cropId: string,
  soilStatus?: { soilN?: string; soilP?: string; soilK?: string },
  previousCrop: string = 'Soybean',
  residueManagement?: string
) => {
  const baseDemand = CROP_NUTRIENT_DEMANDS[cropId] || CROP_NUTRIENT_DEMANDS.default;
  const legacy = calculatePrecedingCropBalance(previousCrop, residueManagement);

  // Soil status adjustments
  let soilNAdj = 0;
  if (soilStatus?.soilN === 'High') soilNAdj = -15;
  else if (soilStatus?.soilN === 'Low') soilNAdj = 15;

  let soilPAdj = 0;
  if (soilStatus?.soilP === 'High') soilPAdj = -10;
  else if (soilStatus?.soilP === 'Low') soilPAdj = 12;

  let soilKAdj = 0;
  if (soilStatus?.soilK === 'High') soilKAdj = -18;
  else if (soilStatus?.soilK === 'Low') soilKAdj = 15;

  const targetN = Math.max(15, Math.round(baseDemand.n + soilNAdj - legacy.nCreditKg));
  const targetP = Math.max(15, Math.round(baseDemand.p2o5 + soilPAdj - legacy.pCreditKg));
  const targetK = Math.max(15, Math.round(baseDemand.k2o + soilKAdj - legacy.kCreditKg));

  return {
    baseDemand,
    legacy,
    targetN,
    targetP,
    targetK,
  };
};

/**
 * Builds standard tailored fertilizer items for a crop
 */
export const buildDefaultFertilizerItems = (
  cropId: string,
  fieldAcres: number = 2.5,
  soilStatus?: { soilN?: string; soilP?: string; soilK?: string }
): FertilizerPlanItem[] => {
  const items: FertilizerPlanItem[] = [];

  const getProduct = (id: string) => FERTILIZER_CATALOG.find((p) => p.id === id);

  const addItem = (
    productId: string,
    stage: string,
    timing: string,
    ratePerAcre: number,
    notes: string
  ) => {
    const prod = getProduct(productId);
    if (!prod) return;

    const totalQty = Math.round(ratePerAcre * fieldAcres);
    const nSupplied = Math.round(totalQty * (prod.npkPercent.n / 100) * prod.organicAvailabilityFactor);
    const pSupplied = Math.round(totalQty * (prod.npkPercent.p2o5 / 100) * prod.organicAvailabilityFactor);
    const kSupplied = Math.round(totalQty * (prod.npkPercent.k2o / 100) * prod.organicAvailabilityFactor);

    items.push({
      id: `item_${productId}_${items.length + 1}`,
      productId: prod.id,
      productName: prod.nameEn,
      category: prod.category,
      stage,
      timing,
      ratePerAcre,
      totalQuantity: totalQty,
      unit: prod.standardRatePerAcre.unit,
      applicationMethod: prod.applicationMethod,
      notes,
      nSuppliedKg: nSupplied,
      p2o5SuppliedKg: pSupplied,
      k2oSuppliedKg: kSupplied,
    });
  };

  if (cropId === 'crop_tomato') {
    addItem('fert_vermicompost', 'Basal Field Preparation', '10–14 days before transplanting', 600, 'Broadcast into raised beds with beneficial microorganisms.');
    addItem('fert_neem_cake', 'Basal Field Preparation', 'At bed shaping before mulching', 150, 'Protects against nematode galling and root grubs.');
    addItem('fert_trichoderma', 'Basal Field Preparation', 'Mix with vermicompost', 2, 'Suppresses Fusarium wilt and damping-off fungus.');
    addItem('fert_ws_19_19_19', 'Early Vegetative & Root Establishment', '20–25 days after transplanting', 15, 'Inject via drip line for rapid vegetative stem branching.');
    addItem('fert_sop', 'Flowering & Fruit Setting', '50–65 days after transplanting', 25, 'Chloride-free potassium for firm fruit setting and heavy multi-pick.');
    addItem('fert_borax', 'Flowering & Fruit Setting', 'At 10% flower opening', 1, 'Foliar spray at 1g/L to ensure pollen tube vitality.');
  } else if (cropId === 'crop_onion') {
    addItem('fert_fym', 'Basal Field Preparation', 'Before final plowing & raised bed layout', 2000, 'Improves moisture buffering in clay-loam soils.');
    addItem('fert_ssp', 'Basal Field Preparation', 'During bed preparation', 100, 'Supplies essential phosphorus and 11% sulphur for pungent bulb rings.');
    addItem('fert_neem_cake', 'Basal Field Preparation', 'Broadcast before transplanting', 100, 'Suppresses soil thrips pupae and root rot.');
    addItem('fert_ammonium_sulphate', 'Vegetative Foliage Growth', '30–35 days after transplanting', 45, 'Supplies slow-release ammoniacal nitrogen plus sulphur.');
    addItem('fert_npk_10_26_26', 'Bulb Initiation & Sizing', '60–75 days after transplanting', 50, 'High potassium and phosphorus boost bulb circumference and scale thickness.');
    addItem('fert_psb', 'Basal Field Preparation', 'Soil inoculation with manure', 2, 'Solubilizes locked native soil phosphorus.');
  } else if (cropId === 'crop_soybean') {
    addItem('fert_rhizobium', 'Basal Sowing Application', 'At seed sowing', 1, 'Inoculate seed with 10% jaggery syrup; fixes atmospheric nitrogen.');
    addItem('fert_psb', 'Basal Sowing Application', 'At seed sowing', 1, 'Co-inoculate with Rhizobium for enhanced root nodulation.');
    addItem('fert_ssp', 'Basal Sowing Application', 'Drilled 5 cm below seed', 80, 'Phosphorus and sulphur critical for high oil content in pods.');
    addItem('fert_vermicompost', 'Basal Sowing Application', 'In-furrow application', 400, 'Maintains moisture in root zone during germination.');
    addItem('fert_jeevamrut', 'Pod Formation & Grain Fill', '45–50 days after sowing', 200, 'Liquid spray/fertigation prevents premature pod drop.');
  } else {
    // Default balanced schedule
    addItem('fert_mature_compost', 'Basal Field Preparation', 'During land preparation', 800, 'Incorporate into the top 15 cm soil layer.');
    addItem('fert_neem_cake', 'Basal Field Preparation', 'At sowing bed preparation', 100, 'Soil pest suppression and slow nitrogen release.');
    addItem('fert_dap', 'Basal Field Preparation', 'At sowing', 45, 'Supplies starter nitrogen and phosphorus for vigorous roots.');
    addItem('fert_mop', 'Bulb Initiation & Sizing', 'Peak vegetative / flowering', 35, 'Promotes drought tolerance and disease resistance.');
    addItem('fert_jeevamrut', 'Flowering & Fruit Setting', 'Mid season', 200, 'Microbial boost via irrigation water.');
  }

  return items;
};

/**
 * Main generator for FertilizerPlan
 */
export const generateFertilizerPlan = (
  cropId: string,
  fieldAcres: number = 2.5,
  soilStatus?: { soilN?: string; soilP?: string; soilK?: string },
  previousCrop: string = 'Soybean',
  existingPlan?: Partial<FertilizerPlan>
): FertilizerPlan => {
  const crop = CROPS_CATALOG.find((c) => c.id === cropId) || CROPS_CATALOG[0];
  const { baseDemand, legacy, targetN, targetP, targetK } = calculateNetNutrientTargets(
    crop.id,
    soilStatus,
    previousCrop
  );

  // Use custom items if provided and valid, otherwise build tailored defaults
  const items: FertilizerPlanItem[] =
    existingPlan?.items && existingPlan.items.length > 0
      ? existingPlan.items.map((it) => {
          const totalQty = Math.round(it.ratePerAcre * fieldAcres);
          const prod = FERTILIZER_CATALOG.find((p) => p.id === it.productId);
          const nPct = prod ? prod.npkPercent.n : 0;
          const pPct = prod ? prod.npkPercent.p2o5 : 0;
          const kPct = prod ? prod.npkPercent.k2o : 0;
          const avail = prod ? prod.organicAvailabilityFactor : 1.0;
          return {
            ...it,
            totalQuantity: totalQty,
            nSuppliedKg: Math.round(totalQty * (nPct / 100) * avail),
            p2o5SuppliedKg: Math.round(totalQty * (pPct / 100) * avail),
            k2oSuppliedKg: Math.round(totalQty * (kPct / 100) * avail),
          };
        })
      : buildDefaultFertilizerItems(crop.id, fieldAcres, soilStatus);

  // Compute total supplied nutrients across items
  const totalNSupplied = items.reduce((sum, it) => sum + (it.nSuppliedKg || 0), 0);
  const totalPSupplied = items.reduce((sum, it) => sum + (it.p2o5SuppliedKg || 0), 0);
  const totalKSupplied = items.reduce((sum, it) => sum + (it.k2oSuppliedKg || 0), 0);

  // Total organic vs inorganic kg
  const totalOrganicKg = items
    .filter((it) => it.category === 'organic')
    .reduce((sum, it) => sum + it.totalQuantity, 0);

  const totalInorganicKg = items
    .filter((it) => it.category === 'inorganic')
    .reduce((sum, it) => sum + it.totalQuantity, 0);

  // Backward-compatible schedule table
  const schedule: FertilizerScheduleItem[] = items.map((it) => ({
    stage: it.stage,
    timing: it.timing,
    npkRatio: `${it.productName} (${it.ratePerAcre} ${it.unit})`,
    organicKgPerAcre: it.category === 'organic' ? it.ratePerAcre : 0,
    inorganicKgPerAcre: it.category === 'inorganic' ? it.ratePerAcre : 0,
    notes: `${it.applicationMethod}. ${it.notes}`,
  }));

  return {
    cropId: crop.id,
    cropName: crop.nameEn,
    fieldAcres,
    npkDemandTier: `N:${crop.npkDemand.n} | P:${crop.npkDemand.p} | K:${crop.npkDemand.k}`,
    schedule,
    totalOrganicKg,
    totalInorganicKg,
    organicAlternatives: [
      'Enriched Vermicompost (Eisenia fetida) with Trichoderma viride',
      'Cold-Pressed Neem Seed Cake (Nitrification inhibitor & soil bio-pesticide)',
      'Hardwood Biomass Ash Slurry (Bio-available potash 7.5% K₂O)',
      'Rock Phosphate with Phosphate-Solubilizing Bacteria (PSB) consortium',
      'Aerated Jeevamrut & Panchagavya foliar organic sprays',
    ],
    soilTestNotes: `Calibrated with regional Maharashtra baseline for ${crop.nameEn}. Preceding crop (${previousCrop}) nutrient credit integrated: ${legacy.nCreditKg > 0 ? `+${legacy.nCreditKg} kg N` : '0 kg N'}. Always confirm with an accredited Soil Health Card test.`,
    items,
    targetNRequiredKg: Math.round(targetN * fieldAcres),
    targetP2O5RequiredKg: Math.round(targetP * fieldAcres),
    targetK2ORequiredKg: Math.round(targetK * fieldAcres),
    totalNSuppliedKg: totalNSupplied,
    totalP2O5SuppliedKg: totalPSupplied,
    totalK2OSuppliedKg: totalKSupplied,
    isCustomized: !!existingPlan?.isCustomized,
    unitMode: 'acre',
  };
};
