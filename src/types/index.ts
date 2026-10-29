export type ProvenanceType = 
  | 'Demo data' 
  | 'Estimated' 
  | 'User-provided' 
  | 'Live (Open-Meteo)' 
  | 'Simulated';

export type Language = 'en' | 'hi' | 'mr';

export type PrimaryRole = 'maker' | 'buyer' | 'seller' | 'admin';

export interface BankDetails {
  accountHolder?: string;
  accountNumberMasked?: string;
  ifsc?: string;
  bankName?: string;
  upiId?: string;
}

export interface FarmBasics {
  totalArea: number;
  areaUnit: 'acre' | 'hectare' | 'guntha' | 'sq_m';
  irrigation: ('drip' | 'sprinkler' | 'flood' | 'rainfed' | 'well_borewell')[];
  currentCrops: string[];
  farmingMethod: 'organic' | 'conventional' | 'mixed';
  roleIntent: ('make' | 'buy' | 'sell')[];
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  state?: string;
  district: string;
  taluka: string;
  village: string;
  gatNumber?: string;
  language: Language;
  farmBasics: FarmBasics;
  isDemoUser: boolean;

  // Extended Onboarding & Identity Fields
  farmerId?: string;
  aadhaarMasked?: string;
  aadhaarVerified?: boolean;
  farmLocation?: string;
  soilType?: string;
  waterSource?: string;
  waterAvailability?: 'Plenty' | 'Moderate' | 'Scarce';
  annualIncome?: string;
  bankDetails?: BankDetails;
  casteCategory?: string;
  domicileState?: string;
  documentName?: string;
  primaryRole?: PrimaryRole;
  onboardingComplete?: boolean;
  currentOnboardingStep?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FieldPolygon {
  id: string;
  name: string;
  coordinates: [number, number][]; // [lat, lng]
  areaSqM: number;
  areaAcres: number;
  areaHectares: number;
  areaGuntha: number;
  currentCrop: string;
  previousCrop: string;
  soilType: string;
  waterSource: string;
  lastActivity: string;
  notes?: string;
}

export interface FarmPin {
  id: string;
  type: 'house' | 'shed' | 'well' | 'pond' | 'pump' | 'road';
  name: string;
  lat: number;
  lng: number;
}

export interface DailyWeather {
  day: string;
  tempMax: number;
  tempMin: number;
  rainChance: number;
  condition: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainChance: number;
  windSpeed: number;
  condition: string;
  retrievedAt: string;
  isLive: boolean;
  daily: DailyWeather[];
}

export type CropCategory = 'fruiting' | 'leafy' | 'root' | 'cereal' | 'pulse';

export interface Crop {
  id: string;
  nameEn: string;
  nameHi: string;
  nameMr: string;
  scientificName: string;
  category: CropCategory;
  season: ('Kharif' | 'Rabi' | 'Zaid')[];
  waterNeed: 'Low' | 'Medium' | 'High';
  soilPreference: string[];
  durationDays: [number, number];
  npkDemand: {
    n: 'Low' | 'Medium' | 'High';
    p: 'Low' | 'Medium' | 'High';
    k: 'Low' | 'Medium' | 'High';
  };
  image: string;
  whyReason: string;
  baseYieldQuintalsPerAcre: string;
}

export interface CropScoreResult {
  crop: Crop;
  totalScore: number;
  seasonScore: number;
  waterScore: number;
  soilScore: number;
  budgetScore: number;
  rotationScore: number;
  tier: 'High' | 'Moderate' | 'Low';
  dataCoverage: number;
  whyChips: string[];
}

export interface FertilizerScheduleItem {
  stage: string;
  timing: string;
  npkRatio: string;
  organicKgPerAcre: number;
  inorganicKgPerAcre: number;
  notes: string;
}

export type FertilizerCategory = 'organic' | 'inorganic' | 'biofertilizer';

export interface FertilizerProduct {
  id: string;
  nameEn: string;
  nameHi: string;
  nameMr: string;
  category: FertilizerCategory;
  npkPercent: {
    n: number;
    p2o5: number;
    k2o: number;
    s?: number;
    zn?: number;
    b?: number;
    ca?: number;
    mg?: number;
  };
  compositionLabel: string;
  organicAvailabilityFactor: number;
  suitableCrops: string[];
  suitableStages: string[];
  applicationMethod: string;
  standardRatePerAcre: {
    min: number;
    max: number;
    unit: string;
    defaultRate: number;
  };
  precautions: string;
  purpose: string;
  image?: string;
}

export interface FertilizerPlanItem {
  id: string;
  productId: string;
  productName: string;
  category: FertilizerCategory;
  stage: string;
  timing: string;
  ratePerAcre: number;
  totalQuantity: number;
  unit: string;
  applicationMethod: string;
  notes: string;
  nSuppliedKg: number;
  p2o5SuppliedKg: number;
  k2oSuppliedKg: number;
}

export interface FertilizerPlan {
  cropId: string;
  cropName: string;
  fieldAcres: number;
  npkDemandTier: string;
  schedule: FertilizerScheduleItem[];
  totalOrganicKg: number;
  totalInorganicKg: number;
  organicAlternatives: string[];
  soilTestNotes: string;
  // Enhanced interactive properties
  items?: FertilizerPlanItem[];
  targetNRequiredKg?: number;
  targetP2O5RequiredKg?: number;
  targetK2ORequiredKg?: number;
  totalNSuppliedKg?: number;
  totalP2O5SuppliedKg?: number;
  totalK2OSuppliedKg?: number;
  isCustomized?: boolean;
  unitMode?: 'acre' | 'hectare';
}

export interface ResourceInput {
  cropResidueKg: number;
  cowDungKg: number;
  kitchenWasteKg: number;
  dryLeavesKg: number;
  woodAshKg: number;
  waterAvailability: 'scarce' | 'adequate' | 'abundant';
  landAreaAcres: number;
  budgetBand: 'low' | 'medium' | 'high';
  existingFertilizerKg: number;
  labourAvailable: 'family' | 'hired' | 'minimal';
  currentMonth: string;
}

export interface ResourcePlanOutput {
  estimatedTotalFertilizerRequiredKg: number;
  organicFertilizerPotentialKg: number;
  shortfallKg: number;
  waterPriority: 'High' | 'Normal' | 'Critical';
  potentialExternalAvoidedKg: number;
  suggestedAllocation: string[];
}

export interface FarmResourceItem {
  id: string;
  category: 'fertilizer' | 'biomass' | 'water' | 'seed' | 'labour' | 'equipment';
  name: string;
  productId?: string;
  availableQty: number;
  unit: string;
  reservedQty: number;
  allocatedQty: number;
  usableQty: number;
  expectedDemand: number;
  remainingQty: number;
  replenishmentDate?: string;
  replenishmentQty?: number;
  notes?: string;
}

export interface WaterResourceState {
  source: 'well' | 'borewell' | 'canal' | 'pond' | 'rainfed';
  storageCapacityLiters: number;
  availableLiters: number;
  dailySupplyLiters: number;
  irrigationMethod: 'drip' | 'sprinkler' | 'flood' | 'rainfed';
  electricityHoursPerDay: number;
}

export interface ScheduledFarmTask {
  id: string;
  cropId: string;
  weekNumber: number;
  scheduledDate: string;
  cropStage: string;
  stageKey: 'land_prep' | 'sowing' | 'irrigation' | 'fertilizer' | 'weeding' | 'pest' | 'harvest' | 'mulching';
  title: string;
  description: string;
  resourceRequired: string;
  resourceItemId?: string;
  plannedQuantity: number;
  resourceUnit: string;
  waterRequirementLiters?: number;
  labourRequiredDays?: number;
  equipmentRequired?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Upcoming' | 'Pending' | 'Completed' | 'Overdue' | 'Rescheduled' | 'Skipped';
  completed?: boolean;
  dueDate?: string;
  stage?: string;
  originalDate?: string;
  rescheduleReason?: string;
  completedAt?: string;
  actualQuantityUsed?: number;
  consumptionLogged?: boolean;
  checklist: string[];
  guideVideoTitle?: string;
  notes: string;
  history?: { date: string; action: string; note: string }[];
}

export interface CropTask {
  id: string;
  title: string;
  stage: 'land_prep' | 'sowing' | 'irrigation' | 'fertilizer' | 'weeding' | 'pest' | 'harvest';
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  notes: string;
  photoUrl?: string;
  guideVideoTitle: string;
  checklist: string[];
  // Backwards compatibility with ScheduledFarmTask
  weekNumber?: number;
  cropStage?: string;
  stageKey?: 'land_prep' | 'sowing' | 'irrigation' | 'fertilizer' | 'weeding' | 'pest' | 'harvest' | 'mulching';
  resourceRequired?: string;
  plannedQuantity?: number;
  resourceUnit?: string;
  waterRequirementLiters?: number;
  labourRequiredDays?: number;
  priority?: 'High' | 'Medium' | 'Low';
  status?: 'Upcoming' | 'Pending' | 'Completed' | 'Overdue' | 'Rescheduled' | 'Skipped';
  originalDate?: string;
  rescheduleReason?: string;
  actualQuantityUsed?: number;
  consumptionLogged?: boolean;
}

export interface WeeklyCheckinRecord {
  id: string;
  date: string;
  progress: string;
  problems: string;
  waterStatus: 'normal' | 'low' | 'adequate';
  weatherDelay: 'none' | 'rain' | 'heat';
  explanation: string;
}

export type EvidenceStatus = 
  | 'Evidence not provided' 
  | 'Estimated' 
  | 'Kit-measured by me' 
  | 'Lab report uploaded' 
  | 'Seller-provided' 
  | 'Not tested' 
  | 'Demo review';

// ─────────────────────────────────────────────────────────────
// MAKE + BATCH MODULES (ported from the previous KrishiCycle AI build)
// ─────────────────────────────────────────────────────────────

export type NutrientLevel = 'Low' | 'Medium' | 'High';

export type WizardSoilType =
  | 'Loamy'
  | 'Clay'
  | 'Sandy'
  | 'Black Cotton'
  | 'Red Soil'
  | 'Alluvial';

export type CroppingSeasonLabel =
  | 'Kharif (Monsoon)'
  | 'Rabi (Winter)'
  | 'Zaid (Summer)'
  | 'Year-round';

export interface SoilInput {
  soilType: WizardSoilType;
  ph: number;
  n: NutrientLevel;
  p: NutrientLevel;
  k: NutrientLevel;
  organicCarbon?: NutrientLevel;
  landAreaM2: number;
  targetQuantityKg: number;
  season: CroppingSeasonLabel;
}

export interface RecipeMaterialItem {
  materialId: string;
  materialName: string;
  quantityKg: number;
  purpose: string;
  percentage: number;
}

export interface FertilizerRecipe {
  id: string;
  name: string;
  cropId: string;
  cropName: string;
  version: string;
  targetQuantityKg: number;
  targetUse: string;
  estimatedCnRatio: number;
  targetMoistureRange: string;
  materials: RecipeMaterialItem[];
  preparationInstructions: string[];
  warnings: string[];
  aiExplanation?: string;
  createdAt: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  category: 'Green (Nitrogen)' | 'Brown (Carbon)' | 'Organic Booster' | 'Mineral/Inoculant';
  cnRatio: number;
  nPercent: number;
  pPercent: number;
  kPercent: number;
  moisturePercent: number;
  photoUrl: string;
  description: string;
  purpose: string;
  safetyWarnings?: string;
  /** Text used to pre-filter the Marketplace when this material is short. */
  marketQuery: string;
}

export interface RawMaterialStockItem {
  materialId: string;
  inStock: boolean;
  quantityKg: number;
  updatedAt: string;
}

/** The 11 stages of the batch process state machine (timeline order). */
export type BatchProcessStep =
  | 'COLLECT'
  | 'CHOP_SHRED'
  | 'MIX'
  | 'PILE_UP'
  | 'MOISTURE_SET'
  | 'ACTIVE_COMPOSTING'
  | 'TURN_AERATE'
  | 'MATURATION'
  | 'TESTING'
  | 'VALIDATION'
  | 'READY';

export interface ProcessEvent {
  id: string;
  step: BatchProcessStep;
  title: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface BatchReadingEntry {
  id: string;
  at: string;
  tempC: number;
  moisturePercent: number;
  /** Simulated probe reading, or typed in by the farmer. Never presented as real sensor data. */
  source: 'Simulated' | 'Manual';
}

export type TestQualityStatus = 'GREY' | 'YELLOW' | 'BLUE' | 'GREEN' | 'RED';

/** Honest evidence sources only. No "certified" wording. */
export type BatchTestMethod = 'Estimated' | 'Kit-measured by me' | 'Lab report uploaded';

export interface BatchTest {
  id: string;
  batchId: string;
  testedAt: string;
  testMethod: BatchTestMethod;
  nitrogenPercent: number;
  phosphorusPercent: number;
  potassiumPercent: number;
  ph: number;
  organicCarbonPercent: number;
  moisturePercent: number;
  cnRatio: number;
  /** Declared by the farmer. KrishiCycle does not verify it. */
  heavyMetalsDeclaredOk: boolean;
  weedSeedsViable: boolean;
  qualityStatus: TestQualityStatus;
  reportNumber?: string;
  testedBy?: string;
  supplementationSuggested?: string;
}

export interface TrialObservation {
  day: number;
  date: string;
  controlHeightCm: number;
  krishiCycleHeightCm: number;
  comparisonHeightCm: number;
  controlLeafCount: number;
  krishiCycleLeafCount: number;
  comparisonLeafCount: number;
  controlGerminationPct: number;
  krishiCycleGerminationPct: number;
  comparisonGerminationPct: number;
}

export interface GrowthTrial {
  id: string;
  batchId: string;
  cropName: string;
  seedVariety: string;
  startDate: string;
  durationDays: number;
  status: 'In Progress' | 'Completed';
  observations: TrialObservation[];
  summaryConclusion: string;
  heightAdvantagePct: number;
  leafCountAdvantagePct: number;
  /** The trial in this prototype is illustrative sample data. */
  dataSource: 'Simulated' | 'User-provided';
}

export interface Batch {
  id: string;
  batchCode: string; // e.g. KC-TOM-2026-001
  userName: string;
  userLocation: string;
  cropId: string;
  cropName: string;
  recipe: FertilizerRecipe;
  soilInput: SoilInput;
  status: BatchProcessStep;
  progressPercent: number;
  totalEstimatedDays: number;
  createdAt: string;
  completedAt?: string;
  materialsCollected: {
    materialId: string;
    collectedKg: number;
    requiredKg: number;
    isCollected: boolean;
  }[];
  events: ProcessEvent[];
  readings: BatchReadingEntry[];
  latestReadings?: {
    temperatureC: number;
    moisturePercent: number;
    lastUpdated: string;
    source: 'Simulated' | 'Manual';
  };
  testRecord?: BatchTest;
  growthTrial?: GrowthTrial;
  isListedOnMarketplace: boolean;
  listingId?: string;
  qrCodeValue: string;
}

export interface DemoReview {
  id: string;
  userName: string;
  userDistrict: string;
  rating: number;
  comment: string;
  date: string;
  cropUsedFor: string;
  qualityRating: number;
  packagingRating: number;
  deliveryRating: number;
}

export interface MarketListing {
  id: string;
  title: string;
  category: 'raw_material' | 'organic_fertilizer' | 'inorganic_fertilizer';
  sellerName: string;
  sellerRole: 'Farmer' | 'Agro Centre' | 'Self';
  sellerLocation: string;
  district: string;
  unitPrice: number;
  unit: string;
  availableStock: number;
  minOrder: number;
  deliveryOptions: ('Farm pickup' | 'Local delivery' | 'Parcel')[];
  usageNote: string;
  evidenceStatus: EvidenceStatus;
  batchCode?: string;
  recipeSummary?: string;
  image: string;
  rating: number;
  reviewCount: number;
  reviews: DemoReview[];
  status: 'Active' | 'Draft' | 'Paused' | 'Sold out';
  suitableCrops: string[];
  shelfLife?: string;
  howProduced?: string;
}

export type OrderStatus = 
  | 'PENDING_PAYMENT' 
  | 'CONFIRMED' 
  | 'PACKED' 
  | 'SHIPPED' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface OrderTimelineItem {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  category: string;
  sellerName: string;
  buyerName: string;
  buyerPhone: string;
  buyerDistrict: string;
  buyerAddress: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  deliveryOption: 'Farm pickup' | 'Local delivery' | 'Parcel';
  deliveryFee: number;
  totalAmount: number;
  paymentMode: 'UPI' | 'COD';
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineItem[];
  batchCode?: string;
  reviewSubmitted?: boolean;
}

export interface LeafHealthResult {
  cropName: string;
  issueName: string;
  severity: 'Low' | 'Moderate' | 'High';
  description: string;
  suggestedSteps: string[];
  organicPrevention: string[];
  bannerDisclaimer: string;
}
