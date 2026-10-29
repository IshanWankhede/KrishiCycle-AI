import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout,
  FlaskConical,
  Layers,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Info,
  Sparkles,
  Play,
  Check,
  Sliders,
  AlertCircle,
  Clock,
  Droplet,
  ShoppingBag,
  RotateCcw,
  Search,
  Plus,
  Trash2,
  Percent,
  FileText,
  ShieldCheck,
  RefreshCw,
  Compass,
} from 'lucide-react';
import { useCropStore } from '../store/cropStore';
import { useInventoryStore } from '../store/inventoryStore';
import { useMakeDraftStore } from '../store/makeDraftStore';
import { useFarmStore } from '../store/farmStore';
import { useUIStore } from '../store/uiStore';
import { useT } from '../i18n/useT';
import { CROPS_CATALOG } from '../data/crops';
import { FERTILIZER_CATALOG } from '../data/fertilizerCatalog';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ScoreRing } from '../components/ScoreRing';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { CROP_SCORING_VERSION } from '../services/cropScoring';
import { FarmWeatherPanel } from '../components/FarmWeatherPanel';
import { FarmCalendar } from '../components/FarmCalendar';
import { SpecularCard } from '../components/SpecularCard';
import { calculateNetNutrientTargets } from '../services/fertilizerService';
import { calculateResourceDemandGrid, DEFAULT_FARM_RESOURCES } from '../services/resourceService';
import { generateCropCycleTasks } from '../services/taskPlanner';
import { FertilizerCategory } from '../types';

export const CropsPage: React.FC = () => {
  const {
    inputs,
    setInputs,
    rankedResults,
    selectedCropId,
    selectCrop,
    fertilizerPlan,
    updateFertilizerPlan,
    addFertilizerPlanItem,
    removeFertilizerPlanItem,
    resetFertilizerPlan,
    resourceInput,
    updateResourceInput,
    resourceOutput,
    farmResources,
    updateFarmResource,
    addFarmResource,
    resetFarmResources,
    cropTasks,
    toggleTask,
    completeTask,
    rescheduleTask,
    addTask,
    deleteTask,
    startCropCycle,
    submitWeeklyCheckin,
    weeklyCheckins,
  } = useCropStore();

  const { fields, selectedDistrict, setDistrict } = useFarmStore();
  const { showToast } = useUIStore();
  const { t, getCropName } = useT();
  const navigate = useNavigate();

  // Active tab inside Module 1
  const [activeTab, setActiveTab] = useState<'recommendation' | 'fertilizer' | 'resources' | 'cycle'>('recommendation');

  // Selected crop for detailed view
  const currentCrop = CROPS_CATALOG.find((c) => c.id === selectedCropId) || CROPS_CATALOG[0];

  // Video modal / demo player state
  const [playingVideoTitle, setPlayingVideoTitle] = useState<string | null>(null);

  // Weekly checkin form state
  const [checkinProgress, setCheckinProgress] = useState('Crop growing vigorously; early leaves dark green.');
  const [checkinProblems, setCheckinProblems] = useState('Minor whitefly activity on plot border.');
  const [checkinWater, setCheckinWater] = useState<'normal' | 'low' | 'adequate'>('normal');
  const [checkinDelay, setCheckinDelay] = useState<'none' | 'rain' | 'heat'>('none');

  // Fertilizer Catalog search & category filter
  const [fertCategoryFilter, setFertCategoryFilter] = useState<'all' | FertilizerCategory>('all');
  const [fertSearchQuery, setFertSearchQuery] = useState('');

  // Unit toggle: Acre vs Hectare
  const [unitMode, setUnitMode] = useState<'acre' | 'hectare'>('acre');

  // Editable NPK targets state
  const [isEditingNpkTargets, setIsEditingNpkTargets] = useState(false);
  const [customNTarget, setCustomNTarget] = useState(fertilizerPlan?.targetNRequiredKg || 110);
  const [customPTarget, setCustomPTarget] = useState(fertilizerPlan?.targetP2O5RequiredKg || 55);
  const [customKTarget, setCustomKTarget] = useState(fertilizerPlan?.targetK2ORequiredKg || 95);

  // Handoff to Module 2 Make Draft
  const syncInventoryFromPlan = useInventoryStore((s) => s.syncFromResourcePlan);
  const clearMakeDraft = useMakeDraftStore((s) => s.clearDraft);

  const handleMakeHandoff = () => {
    syncInventoryFromPlan(resourceInput);
    clearMakeDraft();
    const target = Math.min(5000, Math.max(5, Math.round(resourceOutput.estimatedTotalFertilizerRequiredKg || 100)));
    navigate('/make', { state: { handoff: { cropId: selectedCropId, targetQuantityKg: target } } });
  };

  const handleBuyHandoff = () => {
    navigate('/market');
  };

  const handleSelectAndPlan = (cropId: string) => {
    selectCrop(cropId);
    showToast(`Selected ${cropId.replace('crop_', '')}. Fertilizer schedule generated.`, 'success');
    setActiveTab('fertilizer');
  };

  const handleStartCycle = (cropId: string) => {
    startCropCycle(cropId);
    showToast(`Started Sow-to-Harvest crop cycle for ${cropId.replace('crop_', '')}!`, 'success');
    setActiveTab('cycle');
  };

  const handleWeeklyCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitWeeklyCheckin({
      progress: checkinProgress,
      problems: checkinProblems,
      waterStatus: checkinWater,
      weatherDelay: checkinDelay,
    });
    showToast('Weekly check-in submitted! Tasks adjusted according to agronomic rules.', 'info');
  };

  // 4-Pillar Nutrient Baseline Calculations
  const nutrientCalcs = calculateNetNutrientTargets(
    selectedCropId,
    { soilN: inputs.soilN, soilP: inputs.soilP, soilK: inputs.soilK },
    inputs.previousCrop,
    inputs.residueManagement
  );

  // Filtered fertilizer catalog
  const filteredFertilizers = FERTILIZER_CATALOG.filter((item) => {
    if (fertCategoryFilter !== 'all' && item.category !== fertCategoryFilter) return false;
    if (fertSearchQuery) {
      const q = fertSearchQuery.toLowerCase();
      const matchName = item.nameEn.toLowerCase().includes(q) || item.nameMr.toLowerCase().includes(q) || item.nameHi.toLowerCase().includes(q);
      const matchComp = item.compositionLabel.toLowerCase().includes(q);
      const matchPurpose = item.purpose.toLowerCase().includes(q);
      return matchName || matchComp || matchPurpose;
    }
    return true;
  });

  // Resource demand calculations with fail-safes
  const safeFarmResources = Array.isArray(farmResources) && farmResources.length > 0
    ? farmResources
    : DEFAULT_FARM_RESOURCES;

  const safeCropTasks = Array.isArray(cropTasks) && cropTasks.length > 0
    ? cropTasks.map((t) => ({
        ...t,
        scheduledDate: t.scheduledDate || (t as any).dueDate || new Date().toISOString().split('T')[0],
        dueDate: (t as any).dueDate || t.scheduledDate || new Date().toISOString().split('T')[0],
        cropStage: t.cropStage || (t as any).stageKey || (t as any).stage || 'Land Preparation',
        stage: (t as any).stage || t.cropStage || 'Land Preparation',
        status: t.status || ((t as any).completed ? 'Completed' : 'Upcoming'),
        completed: (t as any).completed !== undefined ? (t as any).completed : t.status === 'Completed',
        plannedQuantity: typeof t.plannedQuantity === 'number' ? t.plannedQuantity : 100,
        resourceRequired: t.resourceRequired || 'Organic amendment',
        resourceUnit: t.resourceUnit || 'kg',
        checklist: Array.isArray(t.checklist) ? t.checklist : ['Execute planned operation on field'],
      }))
    : generateCropCycleTasks(selectedCropId || 'crop_tomato', undefined, inputs.fieldAreaAcres || 2.5);

  const resourceGrid = calculateResourceDemandGrid(safeFarmResources, fertilizerPlan, inputs.fieldAreaAcres);

  return (
    <div className="min-h-screen bg-surface-dark py-6 md:py-10 px-4 max-w-7xl mx-auto space-y-8">
      {/* 1. TOP HEADER & CARRIED DATA BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-lime font-bold tracking-wide uppercase">
              {CROP_SCORING_VERSION}
            </span>
            <ProvenanceBadge type="Estimated" size="sm" />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-darkcard border border-white/10 text-emerald-300">
              {t('farm_carried_chip')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white">
            {t('crops_title')}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Deterministic suitability scoring, stage-wise fertilizer scheduling, resource budgeting & interactive calendar.
          </p>
        </div>

        {/* Data Coverage Meter */}
        <div className="liquid-glass p-3 rounded-2xl border border-lime/30 flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              {t('crops_coverage_meter')}
            </div>
            <div className="text-xs font-bold text-lime">
              {rankedResults[0]?.dataCoverage ?? 85}% Inputs Calibrated
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-white">
            {rankedResults[0]?.dataCoverage ?? 85}%
          </div>
        </div>
      </div>

      {/* 2. MODULE 1 TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5 no-scrollbar">
        {[
          { id: 'recommendation', label: t('crops_tab_recommendation'), icon: Sprout },
          { id: 'fertilizer', label: t('crops_tab_fertilizer'), icon: FlaskConical },
          { id: 'resources', label: t('crops_tab_resources'), icon: Layers },
          { id: 'cycle', label: t('crops_tab_cycle'), icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-lime text-ink shadow-glow-lime'
                  : 'liquid-glass text-neutral-300 hover:text-white border border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. SUBMODULE ONE: CROP RECOMMENDATION TAB
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'recommendation' && (
        <div className="space-y-8">
          {/* A. Farm Location & Live Weather Panel */}
          <FarmWeatherPanel
            district={inputs.district}
            currentLocationName={inputs.village ? `${inputs.village}, ${inputs.district}` : undefined}
            onDistrictChange={(newDistrict) => {
              setInputs({ district: newDistrict });
              setDistrict(newDistrict);
            }}
            onWeatherSync={(w) => {
              setInputs({
                weatherTemp: w.temperature,
                weatherHumidity: w.humidity,
                weatherRainChance: w.rainChance,
                weatherWindSpeed: w.windSpeed,
                weatherCondition: w.condition,
              });
            }}
          />

          {/* B. Soil Intelligence & Testing Card */}
          <SpecularCard
            radius={32}
            lineColor="#C8F23B"
            className="p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-lime" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {t('crops_soil_intel_title')}
                  </h3>
                  <span className="text-xs text-neutral-400">
                    {t('crops_soil_intel_sub')}
                  </span>
                </div>
              </div>

              {/* Data Origin Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-400">{t('crops_soil_source')}:</span>
                <select
                  value={inputs.soilDataSource || 'Laboratory Soil Health Card'}
                  onChange={(e) => setInputs({ soilDataSource: e.target.value as any })}
                  className="bg-surface-dark border border-neutral-700 rounded-full px-3 py-1 text-xs text-lime font-medium"
                >
                  <option value="Laboratory Soil Health Card">Laboratory Soil Health Card (Lab)</option>
                  <option value="Farmer-entered">Farmer-entered (Field observation)</option>
                  <option value="Regional Benchmark">Regional Benchmark</option>
                  <option value="Estimated">Estimated</option>
                </select>
              </div>
            </div>

            {/* Soil notice */}
            <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-neutral-300 flex items-center gap-2.5">
              <Info className="w-4 h-4 text-lime shrink-0" />
              <span>{t('crops_soil_notice')}</span>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Soil Classification</label>
                <select
                  value={inputs.soilType}
                  onChange={(e) => setInputs({ soilType: e.target.value })}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white"
                >
                  <option value="Medium black cotton soil (Regur)">Black Cotton Soil (Regur)</option>
                  <option value="Deep clay loam">Deep Clay Loam</option>
                  <option value="Well-drained sandy loam">Sandy Loam</option>
                  <option value="Red laterite soil">Red Laterite Soil</option>
                  <option value="Alluvial riverbed soil">Alluvial Soil</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Soil pH ({inputs.soilPh})</label>
                <input
                  type="number"
                  step="0.1"
                  min="4.5"
                  max="9.5"
                  value={typeof inputs.soilPh === 'number' ? inputs.soilPh : 7.2}
                  onChange={(e) => setInputs({ soilPh: parseFloat(e.target.value) || 7.2 })}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white font-mono"
                />
                <span className="text-[9px] text-emerald-400 mt-0.5 block">
                  {typeof inputs.soilPh === 'number' && inputs.soilPh < 6.2
                    ? 'Acidic'
                    : typeof inputs.soilPh === 'number' && inputs.soilPh > 7.8
                      ? 'Alkaline'
                      : 'Near Neutral (Optimal)'}
                </span>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Soil Nitrogen (N)</label>
                <select
                  value={inputs.soilN}
                  onChange={(e) => setInputs({ soilN: e.target.value as any })}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white"
                >
                  <option value="Medium">Medium (120–200 kg/ac)</option>
                  <option value="High">High (&gt;200 kg/ac)</option>
                  <option value="Low">Low (&lt;120 kg/ac)</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Soil Phosphorus (P)</label>
                <select
                  value={inputs.soilP}
                  onChange={(e) => setInputs({ soilP: e.target.value as any })}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white"
                >
                  <option value="Medium">Medium (15–30 kg/ac)</option>
                  <option value="High">High (&gt;30 kg/ac)</option>
                  <option value="Low">Low (&lt;15 kg/ac)</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Soil Potassium (K)</label>
                <select
                  value={inputs.soilK}
                  onChange={(e) => setInputs({ soilK: e.target.value as any })}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white"
                >
                  <option value="High">High (&gt;150 kg/ac)</option>
                  <option value="Medium">Medium (80–150 kg/ac)</option>
                  <option value="Low">Low (&lt;80 kg/ac)</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block mb-1">Organic Carbon (SOC %)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="2.5"
                  value={typeof inputs.organicCarbonPct === 'number' ? inputs.organicCarbonPct : 0.65}
                  onChange={(e) => setInputs({ organicCarbonPct: parseFloat(e.target.value) || 0.65 })}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white font-mono"
                />
                <span className="text-[9px] text-neutral-400 mt-0.5 block">Target: &gt;0.75%</span>
              </div>
            </div>
          </SpecularCard>

          {/* C. Previous Crop & Crop History Card */}
          <SpecularCard
            radius={32}
            lineColor="#C8F23B"
            className="p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl space-y-4"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <RotateCcw className="w-4 h-4 text-lime" />
              <h3 className="text-base font-bold text-white">{t('crops_prev_crop_title')}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1 font-medium">Previous Crop Grown</label>
                <select
                  value={inputs.previousCrop}
                  onChange={(e) => setInputs({ previousCrop: e.target.value })}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-3 py-2 text-white font-medium"
                >
                  <option value="Soybean">Soybean (Legume - N credit)</option>
                  <option value="Gram">Bengal Gram / Chana (Pulse)</option>
                  <option value="Cotton">Cotton (High Biomass Stubble)</option>
                  <option value="Wheat">Rabi Wheat (Cereal)</option>
                  <option value="Onion">Onion (Allium)</option>
                  <option value="Sugarcane">Sugarcane (Heavy Feeder)</option>
                  <option value="Tomato">Tomato (Solanaceae)</option>
                  <option value="Fallow">Fallow / Green Manure</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-medium">{t('crops_prev_crop_season')}</label>
                <select
                  value={inputs.previousCropSeason || 'Kharif'}
                  onChange={(e) => setInputs({ previousCropSeason: e.target.value as any })}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Kharif">Kharif (Monsoon)</option>
                  <option value="Rabi">Rabi (Winter)</option>
                  <option value="Zaid">Zaid (Summer)</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-medium">{t('crops_residue_mgmt')}</label>
                <select
                  value={inputs.residueManagement || 'Incorporated into Soil'}
                  onChange={(e) => setInputs({ residueManagement: e.target.value as any })}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Incorporated into Soil">Incorporated into Soil (Tillage)</option>
                  <option value="Surface Mulched">Surface Mulched on Beds</option>
                  <option value="Composted on Farm">Composted in Module 2</option>
                  <option value="Burned / Removed">Burned / Removed</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1 font-medium">Field Area & Irrigation</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={inputs.fieldAreaAcres}
                    onChange={(e) => setInputs({ fieldAreaAcres: parseFloat(e.target.value) || 1 })}
                    className="w-1/2 bg-surface-dark border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                  <select
                    value={inputs.irrigationMethod}
                    onChange={(e) => setInputs({ irrigationMethod: e.target.value as any })}
                    className="w-1/2 bg-surface-dark border border-neutral-700 rounded-xl px-2 py-2 text-white text-[11px]"
                  >
                    <option value="drip">Drip Fertigation</option>
                    <option value="sprinkler">Sprinkler</option>
                    <option value="flood">Flood</option>
                    <option value="rainfed">Rainfed</option>
                  </select>
                </div>
              </div>
            </div>
          </SpecularCard>

          {/* D. 4-Pillar Nutrient Estimation Balance Card */}
          <SpecularCard
            radius={32}
            lineColor="#C8F23B"
            className="p-6 rounded-4xl bg-gradient-to-br from-primary-dark/30 to-surface-card border border-lime/30 shadow-xl space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-lime font-bold uppercase tracking-wider">
                  Nutrient Accounting Logic
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {t('crops_npk_calc_title')}
                </h3>
                <p className="text-xs text-neutral-400">
                  Clearly distinguishes elemental soil reserves, preceding crop credit, and net fertilizer recommendations.
                </p>
              </div>

              <button
                onClick={() => setIsEditingNpkTargets(!isEditingNpkTargets)}
                className="px-4 py-1.5 rounded-full liquid-glass hover:bg-white/10 text-xs font-semibold text-lime border border-lime/30 flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isEditingNpkTargets ? 'Done Editing' : 'Customize NPK Targets'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Pillar 1 */}
              <div className="p-4 rounded-3xl bg-surface-dark border border-white/5 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                  {t('crops_npk_soil_base')}
                </span>
                <div className="text-white font-semibold">
                  N: <span className="font-mono text-lime">{inputs.soilN}</span> · P:{' '}
                  <span className="font-mono text-lime">{inputs.soilP}</span> · K:{' '}
                  <span className="font-mono text-lime">{inputs.soilK}</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {inputs.soilDataSource || 'Laboratory Soil Health Card'}
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 rounded-3xl bg-surface-dark border border-white/5 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-teal font-bold block">
                  {t('crops_npk_crop_legacy')}
                </span>
                <div className="text-white font-semibold">
                  N Credit:{' '}
                  <span className="font-mono text-teal">
                    {nutrientCalcs.legacy.nCreditKg > 0 ? `+${nutrientCalcs.legacy.nCreditKg}` : '0'} kg/ac
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">{nutrientCalcs.legacy.explanation}</p>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 rounded-3xl bg-surface-dark border border-white/5 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-amber-300 font-bold block">
                  {t('crops_npk_gross_demand')}
                </span>
                <div className="text-white font-semibold font-mono">
                  N: {nutrientCalcs.baseDemand.n} | P₂O₅: {nutrientCalcs.baseDemand.p2o5} | K₂O: {nutrientCalcs.baseDemand.k2o} kg/ac
                </div>
                <p className="text-[11px] text-neutral-400">{currentCrop.nameEn} requirement</p>
              </div>

              {/* Pillar 4 */}
              <div className="p-4 rounded-3xl bg-primary-dark/40 border border-lime/40 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-lime font-bold block">
                  {t('crops_npk_net_recommended')}
                </span>
                <div className="text-white font-bold font-mono text-sm">
                  {nutrientCalcs.targetN} N : {nutrientCalcs.targetP} P₂O₅ : {nutrientCalcs.targetK} K₂O kg/ac
                </div>
                <div className="text-[11px] text-emerald-300">
                  For {inputs.fieldAreaAcres} ac: {Math.round(nutrientCalcs.targetN * inputs.fieldAreaAcres)} kg N
                </div>
              </div>
            </div>

            {/* Editable NPK Drawer if activated */}
            {isEditingNpkTargets && (
              <div className="p-4 rounded-2xl bg-black/60 border border-lime/30 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Custom Target N (kg/ac)</label>
                  <input
                    type="number"
                    value={customNTarget}
                    onChange={(e) => setCustomNTarget(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Custom Target P₂O₅ (kg/ac)</label>
                  <input
                    type="number"
                    value={customPTarget}
                    onChange={(e) => setCustomPTarget(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">Custom Target K₂O (kg/ac)</label>
                  <input
                    type="number"
                    value={customKTarget}
                    onChange={(e) => setCustomKTarget(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-dark border border-neutral-700 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <button
                    onClick={() => {
                      updateFertilizerPlan({
                        targetNRequiredKg: Math.round(customNTarget * inputs.fieldAreaAcres),
                        targetP2O5RequiredKg: Math.round(customPTarget * inputs.fieldAreaAcres),
                        targetK2ORequiredKg: Math.round(customKTarget * inputs.fieldAreaAcres),
                        isCustomized: true,
                      });
                      setIsEditingNpkTargets(false);
                      showToast('Saved custom NPK targets to your active plan!', 'success');
                    }}
                    className="px-5 py-2 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime"
                  >
                    {t('crops_btn_save_adjustments')}
                  </button>
                </div>
              </div>
            )}
          </SpecularCard>

          {/* Tier Comparison Summary Pill */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl liquid-glass border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-neutral-300 uppercase">
                Suitability Tiers:
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime/20 text-lime border border-lime/30">
                High Match (≥75)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Moderate (50–74)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Low (&lt;50)
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 italic">
              "Calibrated for Maharashtra agro-ecological zones with KVK Pune baselines."
            </div>
          </div>

          {/* Ranked Crop Recommendation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rankedResults.map((item) => {
              const crop = item.crop;
              const isSelected = crop.id === selectedCropId;
              return (
                <SpecularCard
                  key={crop.id}
                  radius={32}
                  lineColor={item.tier === 'High' ? '#C8F23B' : item.tier === 'Moderate' ? '#fbbf24' : 'rgba(200,242,59,0.3)'}
                  intensity={item.tier === 'High' ? 1 : 0.75}
                  className={`p-6 rounded-4xl border flex flex-col justify-between shadow-xl transition-all relative overflow-hidden group ${
                    item.tier === 'High'
                      ? 'bg-gradient-to-br from-surface-card via-primary-dark/30 to-surface-dark border-lime/30'
                      : item.tier === 'Moderate'
                        ? 'bg-surface-card border-amber-400/20'
                        : 'bg-surface-card border-neutral-800 opacity-80'
                  }`}
                >
                  <div>
                    {/* Header: Name, Scientific Name, Tier badge, Score Ring */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                              item.tier === 'High'
                                ? 'bg-lime text-ink'
                                : item.tier === 'Moderate'
                                  ? 'bg-amber-400 text-ink'
                                  : 'bg-neutral-700 text-neutral-200'
                            }`}
                          >
                            {item.tier} Suitability
                          </span>
                          <span className="text-xs text-neutral-400 font-devanagari">
                            {crop.nameMr}
                          </span>
                        </div>

                        <h3 className="text-2xl font-display font-extrabold text-white">
                          {crop.nameEn}
                        </h3>
                        <p className="text-[11px] text-neutral-400 italic font-serif">
                          {crop.scientificName}
                        </p>
                      </div>

                      <ScoreRing score={item.totalScore} size={64} />
                    </div>

                    {/* Image with fallback */}
                    <div className="h-40 w-full rounded-3xl overflow-hidden mb-4 border border-white/10 relative">
                      <ImageWithFallback
                        src={crop.image}
                        alt={crop.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full liquid-glass text-[10px] font-mono text-white font-semibold">
                        Duration: {crop.durationDays[0]}–{crop.durationDays[1]} Days
                      </div>
                    </div>

                    {/* Why reasons as chips */}
                    <div className="space-y-1.5 mb-4">
                      {item.whyChips.map((chip, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-xs text-emerald-200 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-lime shrink-0" />
                          <span className="truncate">{chip}</span>
                        </div>
                      ))}
                    </div>

                    {/* NPK demand breakdown */}
                    <div className="p-3 rounded-2xl bg-surface-dark border border-white/5 text-[11px] grid grid-cols-3 gap-2 text-center mb-4">
                      <div>
                        <span className="text-neutral-400 block">N Demand</span>
                        <span className="font-bold text-white">{crop.npkDemand.n}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">P Demand</span>
                        <span className="font-bold text-white">{crop.npkDemand.p}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">K Demand</span>
                        <span className="font-bold text-lime">{crop.npkDemand.k}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleSelectAndPlan(crop.id)}
                      className="w-full py-2.5 px-4 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>{t('crops_btn_view_fert_plan')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleStartCycle(crop.id)}
                      className="w-full py-2 px-4 rounded-full liquid-glass hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>{t('crops_btn_start_cycle')}</span>
                    </button>
                  </div>
                </SpecularCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. SUBMODULE TWO: FERTILIZER PLAN TAB
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'fertilizer' && fertilizerPlan && (
        <div className="space-y-8">
          {/* Header Card with Unit Toggle */}
          <div className="p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-lime uppercase tracking-wider">
                  {t('crops_fert_plan_heading')}
                </span>
                <h3 className="text-2xl font-display font-bold text-white mt-0.5">
                  Fertilizer & Nutrient Plan for {fertilizerPlan.cropName}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Demand Tier: <span className="text-white font-mono">{fertilizerPlan.npkDemandTier}</span> ·{' '}
                  Field Size: <strong className="text-white">{fertilizerPlan.fieldAcres} Acres</strong>
                </p>
              </div>

              {/* Unit Mode Toggle & Reset */}
              <div className="flex items-center gap-2">
                <div className="bg-surface-dark p-1 rounded-full border border-white/10 flex items-center text-xs">
                  <button
                    onClick={() => setUnitMode('acre')}
                    className={`px-3 py-1 rounded-full font-semibold transition-all ${
                      unitMode === 'acre' ? 'bg-lime text-ink font-bold' : 'text-neutral-400'
                    }`}
                  >
                    Acres
                  </button>
                  <button
                    onClick={() => setUnitMode('hectare')}
                    className={`px-3 py-1 rounded-full font-semibold transition-all ${
                      unitMode === 'hectare' ? 'bg-lime text-ink font-bold' : 'text-neutral-400'
                    }`}
                  >
                    Hectares (ha)
                  </button>
                </div>

                <button
                  onClick={() => {
                    resetFertilizerPlan();
                    showToast('Restored default recommended fertilizer schedule.', 'info');
                  }}
                  className="px-3.5 py-1.5 rounded-full liquid-glass hover:bg-white/10 text-xs text-neutral-300 hover:text-white border border-white/10 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-lime" />
                  <span>{t('crops_fert_btn_reset_recommendation')}</span>
                </button>
              </div>
            </div>

            {/* Nutrient Budget Fulfillment Progress Bars */}
            <div className="p-5 rounded-3xl bg-surface-dark border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-neutral-300 uppercase">
                  {t('crops_fert_budget_comparison')}
                </span>
                <span className="text-[11px] text-neutral-400">
                  Organic availability factors applied
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Nitrogen Progress */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-300">Nitrogen (N)</span>
                    <span className="text-lime font-bold">
                      {fertilizerPlan.totalNSuppliedKg || 0} / {fertilizerPlan.targetNRequiredKg || 100} kg
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-dark overflow-hidden">
                    <div
                      className="h-full bg-lime rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((fertilizerPlan.totalNSuppliedKg || 0) /
                              (fertilizerPlan.targetNRequiredKg || 100)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Phosphorus Progress */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-300">Phosphorus (P₂O₅)</span>
                    <span className="text-teal font-bold">
                      {fertilizerPlan.totalP2O5SuppliedKg || 0} / {fertilizerPlan.targetP2O5RequiredKg || 50} kg
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-dark overflow-hidden">
                    <div
                      className="h-full bg-teal rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((fertilizerPlan.totalP2O5SuppliedKg || 0) /
                              (fertilizerPlan.targetP2O5RequiredKg || 50)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Potassium Progress */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-300">Potassium (K₂O)</span>
                    <span className="text-amber-300 font-bold">
                      {fertilizerPlan.totalK2OSuppliedKg || 0} / {fertilizerPlan.targetK2ORequiredKg || 80} kg
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-dark overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((fertilizerPlan.totalK2OSuppliedKg || 0) /
                              (fertilizerPlan.targetK2ORequiredKg || 80)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Stage-Wise Fertilizer Schedule Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  {t('crops_fert_custom_schedule_title')} ({fertilizerPlan.items?.length || 0} Products Selected)
                </h4>
                <span className="text-xs text-neutral-400">
                  Total Organic: <strong className="text-lime">{fertilizerPlan.totalOrganicKg.toLocaleString()} kg</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-neutral-400 font-mono">
                      <th className="py-3 px-3">Product Name</th>
                      <th className="py-3 px-3">Stage & Timing</th>
                      <th className="py-3 px-3">Application Method</th>
                      <th className="py-3 px-3 text-right">Rate / Acre</th>
                      <th className="py-3 px-3 text-right">Field Total ({fertilizerPlan.fieldAcres} ac)</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(fertilizerPlan.items || []).map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                item.category === 'organic'
                                  ? 'bg-lime'
                                  : item.category === 'inorganic'
                                    ? 'bg-teal'
                                    : 'bg-purple-400'
                              }`}
                            />
                            <span>{item.productName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-white block font-medium">{item.stage}</span>
                          <span className="text-neutral-400 text-[11px]">{item.timing}</span>
                        </td>
                        <td className="py-3 px-3 text-neutral-300">{item.applicationMethod}</td>
                        <td className="py-3 px-3 text-right font-mono text-neutral-200">
                          {item.ratePerAcre} {item.unit}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-lime">
                          {item.totalQuantity} {item.unit}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              removeFertilizerPlanItem(item.id);
                              showToast(`Removed ${item.productName} from plan.`, 'info');
                            }}
                            className="p-1 rounded-full hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors"
                            title="Remove from plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Approved Fertilizer Catalog Browser (At least 23 products verified) */}
          <div className="p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-lime uppercase tracking-wider">
                  Product Catalog
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {t('crops_fert_catalog_title')} ({FERTILIZER_CATALOG.length} Products Available)
                </h3>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={t('crops_fert_search_placeholder')}
                  value={fertSearchQuery}
                  onChange={(e) => setFertSearchQuery(e.target.value)}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-lime outline-none"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { id: 'all', label: t('crops_fert_filter_all') },
                { id: 'organic', label: t('crops_fert_filter_organic') },
                { id: 'inorganic', label: t('crops_fert_filter_inorganic') },
                { id: 'biofertilizer', label: t('crops_fert_filter_bio') },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFertCategoryFilter(f.id as any)}
                  className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
                    fertCategoryFilter === f.id
                      ? 'bg-lime text-ink font-bold shadow-sm'
                      : 'liquid-glass text-neutral-300 hover:text-white border border-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFertilizers.map((product) => {
                const calculatedFieldQty = Math.round(
                  product.standardRatePerAcre.defaultRate * inputs.fieldAreaAcres
                );
                return (
                  <div
                    key={product.id}
                    className="p-5 rounded-3xl bg-surface-dark border border-white/5 hover:border-lime/30 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            product.category === 'organic'
                              ? 'bg-lime/20 text-lime border border-lime/30'
                              : product.category === 'inorganic'
                                ? 'bg-teal/20 text-teal border border-teal/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {product.category}
                        </span>
                        <span className="text-[11px] font-devanagari text-neutral-400">
                          {product.nameMr}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">{product.nameEn}</h4>
                      <p className="text-[11px] font-mono text-lime mt-0.5">
                        {product.compositionLabel}
                      </p>
                      <p className="text-xs text-neutral-300 mt-2 line-clamp-2">{product.purpose}</p>

                      <div className="mt-3 pt-3 border-t border-white/5 text-[11px] space-y-1">
                        <div className="text-neutral-400">
                          Recommended Rate:{' '}
                          <strong className="text-white">
                            {product.standardRatePerAcre.defaultRate} {product.standardRatePerAcre.unit}
                          </strong>
                        </div>
                        <div className="text-neutral-400">
                          Field Quantity ({inputs.fieldAreaAcres} ac):{' '}
                          <strong className="text-lime">{calculatedFieldQty} kg/L</strong>
                        </div>
                        <div className="text-neutral-400 truncate">
                          Method: <span className="text-neutral-200">{product.applicationMethod}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        addFertilizerPlanItem(
                          product.id,
                          product.suitableStages[0] || 'Basal Field Preparation',
                          product.standardRatePerAcre.defaultRate
                        );
                        showToast(`Added ${product.nameEn} to your fertilizer plan!`, 'success');
                      }}
                      className="w-full py-2 px-4 rounded-full liquid-glass hover:bg-lime hover:text-ink text-white font-bold text-xs border border-white/10 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('crops_fert_btn_add_to_plan')}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Proceed Action */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Ready to verify on-farm biomass stock and schedule operations?
              </span>
              <button
                onClick={() => setActiveTab('resources')}
                className="px-6 py-2.5 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime flex items-center gap-1.5"
              >
                <span>Proceed to Resource Planning</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. SUBMODULE THREE: RESOURCE PLANNING TAB
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'resources' && (
        <div className="space-y-8">

          {/* A. My Available Farm Resources Inventory — editable by farmer */}
          <div className="p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-lime uppercase tracking-wider">
                  Your Farm Stock — Enter Actual Quantities
                </span>
                <h3 className="text-2xl font-display font-bold text-white mt-0.5">
                  {t('crops_res_inventory_title')}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed max-w-xl">
                  Enter how much of each resource you actually have on your farm right now. All calculations — usable stock, demand gap, and shortage alerts — update live from your inputs.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ProvenanceBadge type="User-provided" size="sm" />
                <button
                  onClick={() => {
                    resetFarmResources();
                    showToast('Farm resources reset to default template values.', 'info');
                  }}
                  className="px-3 py-1.5 rounded-full liquid-glass hover:bg-white/10 text-xs text-neutral-400 hover:text-white border border-white/10 flex items-center gap-1 transition-all"
                  title="Reset all quantities back to example values"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Info banner */}
            <div className="p-3.5 rounded-2xl bg-black/30 border border-lime/20 flex items-start gap-2.5 text-xs text-neutral-300">
              <Info className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">How to fill this:</strong> In the <em>Available Stock</em> column, type the total quantity you physically have (weighed or measured). In <em>Reserved / Locked</em>, enter any amount already committed elsewhere. We compute Usable = Available − Reserved and compare it to the demand from your fertilizer plan.
              </span>
            </div>

            {/* Shortage Alert Banner */}
            {resourceGrid.hasShortages && (
              <div className="p-5 rounded-3xl bg-rose-950/40 border border-rose-500/40 space-y-3">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{t('crops_res_shortage_alert')}</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {t('crops_res_shortage_sub')}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={handleMakeHandoff}
                    className="px-4 py-2 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime flex items-center gap-1.5"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Make Compost in Module 2 (Zero Cost)</span>
                  </button>
                  <button
                    onClick={handleBuyHandoff}
                    className="px-4 py-2 rounded-full liquid-glass hover:bg-white/10 text-white font-semibold text-xs border border-white/10 flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-teal" />
                    <span>Buy from Marketplace</span>
                  </button>
                </div>
              </div>
            )}

            {/* Editable Inventory Cards */}
            <div className="space-y-3">
              {resourceGrid.items.map((res) => {
                const isShort = res.usableQty < res.expectedDemand;
                const pct = res.expectedDemand > 0
                  ? Math.min(100, Math.round((res.usableQty / res.expectedDemand) * 100))
                  : 100;
                const barColor = isShort ? 'bg-rose-500' : pct > 80 ? 'bg-lime' : 'bg-amber-400';

                return (
                  <div
                    key={res.id}
                    className={`p-5 rounded-3xl border transition-all ${
                      isShort
                        ? 'bg-rose-950/20 border-rose-500/30'
                        : 'bg-surface-dark border-white/10 hover:border-lime/20'
                    }`}
                  >
                    {/* Row: Name + Category + Status badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{res.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-card border border-white/10 text-neutral-400 uppercase">
                            {res.category}
                          </span>
                        </div>
                        {res.notes && (
                          <p className="text-[11px] text-neutral-500 mt-0.5 max-w-md">{res.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isShort ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            ⚠ Shortfall: {(res.expectedDemand - res.usableQty).toLocaleString()} {res.unit}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-lime/20 text-lime border border-lime/30">
                            ✓ Sufficient
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Editable Inputs row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {/* Available Stock — USER INPUT */}
                      <div>
                        <label className="text-[10px] font-mono text-lime font-bold uppercase block mb-1">
                          ✏ Available Stock ({res.unit})
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={res.availableQty === 0 ? '' : res.availableQty}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                            updateFarmResource(res.id, { availableQty: val });
                          }}
                          className="w-full bg-[#0A110D] text-white border-2 border-lime/50 focus:border-lime focus:ring-2 focus:ring-lime/20 focus:bg-[#0E1A13] rounded-xl px-3.5 py-2 text-sm font-mono font-bold placeholder-neutral-500 outline-none transition-all shadow-inner"
                          placeholder="0"
                        />
                        <span className="text-[10px] text-neutral-400 mt-0.5 block">What you physically have</span>
                      </div>

                      {/* Reserved — USER INPUT */}
                      <div>
                        <label className="text-[10px] font-mono text-neutral-400 uppercase block mb-1">
                          Reserved / Locked ({res.unit})
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={res.reservedQty === 0 ? '' : res.reservedQty}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                            updateFarmResource(res.id, { reservedQty: val });
                          }}
                          className="w-full bg-[#0A110D] text-neutral-200 border border-white/15 focus:border-white/40 focus:ring-1 focus:ring-white/20 focus:bg-[#0E1A13] rounded-xl px-3.5 py-2 text-sm font-mono placeholder-neutral-500 outline-none transition-all shadow-inner"
                          placeholder="0"
                        />
                        <span className="text-[10px] text-neutral-500 mt-0.5 block">Committed elsewhere</span>
                      </div>

                      {/* Usable — CALCULATED */}
                      <div>
                        <label className="text-[10px] font-mono text-emerald-400 uppercase block mb-1">
                          Usable Stock ({res.unit})
                        </label>
                        <div className="w-full bg-[#0A110D]/70 border border-emerald-500/25 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-emerald-400 flex items-center min-h-[40px]">
                          {res.usableQty.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-neutral-500 mt-0.5 block">Available − Reserved</span>
                      </div>

                      {/* Season Demand — CALCULATED from plan */}
                      <div>
                        <label className="text-[10px] font-mono text-amber-400 uppercase block mb-1">
                          Season Demand ({res.unit})
                        </label>
                        <div className="w-full bg-[#0A110D]/70 border border-amber-500/25 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-amber-300 flex items-center min-h-[40px]">
                          {res.expectedDemand.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-neutral-500 mt-0.5 block">From fertilizer plan</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                        <span>Stock Coverage</span>
                        <span className={isShort ? 'text-rose-400' : 'text-lime'}>{pct}% covered</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add custom resource */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  const newId = `res_custom_${Date.now()}`;
                  addFarmResource({
                    id: newId,
                    category: 'fertilizer',
                    name: 'New Custom Input',
                    availableQty: 0,
                    unit: 'kg',
                    reservedQty: 0,
                    allocatedQty: 0,
                    usableQty: 0,
                    expectedDemand: 0,
                    remainingQty: 0,
                    notes: 'Enter your resource details above.',
                  });
                  showToast('New resource row added — fill in your quantities.', 'success');
                }}
                className="px-4 py-2 rounded-full liquid-glass hover:bg-white/10 text-white font-semibold text-xs border border-white/10 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-lime" />
                <span>Add Resource Row</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. SUBMODULE FOUR: WEEKLY CROP CYCLE & CHECK-IN TAB
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'cycle' && (
        <div className="space-y-8">
          {/* Weekly Check-in Form Card */}
          <div className="p-6 rounded-4xl bg-gradient-to-br from-surface-card via-primary-dark/30 to-surface-dark border border-lime/30 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-lime uppercase tracking-wider">
                  Weekly Agronomic Feedback Loop
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {t('crops_cycle_checkin_title')}
                </h3>
              </div>
              <ProvenanceBadge type="User-provided" size="sm" />
            </div>

            <form onSubmit={handleWeeklyCheckinSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Current Growth Stage / Progress
                  </label>
                  <input
                    type="text"
                    value={checkinProgress}
                    onChange={(e) => setCheckinProgress(e.target.value)}
                    className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Observed Field Problems (Weeds, Pests)
                  </label>
                  <input
                    type="text"
                    value={checkinProblems}
                    onChange={(e) => setCheckinProblems(e.target.value)}
                    className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Soil Moisture / Water Status
                  </label>
                  <select
                    value={checkinWater}
                    onChange={(e) => setCheckinWater(e.target.value as any)}
                    className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-xs text-white"
                  >
                    <option value="normal">Normal (Optimal soil moisture)</option>
                    <option value="low">Low (Water stress observed)</option>
                    <option value="adequate">Adequate (Canal/Well flowing)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Weather Delay Logged
                  </label>
                  <select
                    value={checkinDelay}
                    onChange={(e) => setCheckinDelay(e.target.value as any)}
                    className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-xs text-white"
                  >
                    <option value="none">No Delay (Clear skies)</option>
                    <option value="rain">Heavy Monsoon Rain (+5 Days Sowing Shift)</option>
                    <option value="heat">Intense Heatwave</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-neutral-400 italic">
                  Rule-based logic adjusts upcoming tasks. Does not claim machine learning.
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime transition-all"
                >
                  Submit Check-in & Recalibrate Timeline
                </button>
              </div>
            </form>

            {/* Past checkin explanations */}
            {weeklyCheckins.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Recent Check-in Calibrations
                </span>
                {weeklyCheckins.map((chk) => (
                  <div key={chk.id} className="p-3 rounded-2xl bg-surface-dark border border-white/5 text-xs">
                    <div className="flex items-center justify-between text-neutral-400 text-[10px] mb-1">
                      <span>Date: {chk.date}</span>
                      <span className="text-lime font-mono">Plan Updated</span>
                    </div>
                    <p className="text-emerald-200">{chk.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sow-to-Harvest Task Timeline with Video cards & Text Checklist */}
          <div className="space-y-4">
            <h3 className="text-xl font-display font-bold text-white">
              Sow-to-Harvest Task Timeline ({safeCropTasks.length} Stages)
            </h3>

            <div className="space-y-4">
              {safeCropTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={`p-6 rounded-4xl border transition-all ${
                    task.completed
                      ? 'bg-surface-card/60 border-emerald-900/40 text-neutral-400'
                      : 'bg-surface-card border-surface-darkborder shadow-md'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          task.completed
                            ? 'bg-lime border-lime text-ink scale-105'
                            : 'border-neutral-600 hover:border-lime bg-surface-dark'
                        }`}
                      >
                        {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-dark border border-white/10 text-lime font-bold">
                            Stage {idx + 1}: {task.cropStage || task.stageKey}
                          </span>
                          <span className="text-xs text-neutral-400 font-mono">
                            Scheduled: {task.scheduledDate || task.dueDate}
                          </span>
                        </div>
                        <h4
                          className={`text-lg font-bold ${
                            task.completed ? 'line-through text-neutral-400' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </h4>
                        <p className="text-xs text-neutral-300 mt-1">{task.description || task.notes}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                          task.completed
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-surface-dark text-neutral-300'
                        }`}
                      >
                        {task.status || (task.completed ? 'Completed' : 'Pending')}
                      </span>
                    </div>
                  </div>

                  {/* Demo Guide Video Card + Text Checklist */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4 pt-4 border-t border-white/5">
                    {task.guideVideoTitle && (
                      <div className="md:col-span-5 p-3 rounded-2xl bg-surface-dark border border-white/10 flex items-center gap-3">
                        <button
                          onClick={() => setPlayingVideoTitle(task.guideVideoTitle || null)}
                          className="w-10 h-10 rounded-full bg-lime text-ink flex items-center justify-center shrink-0 hover:scale-105 transition-transform shadow-glow-lime"
                        >
                          <Play className="w-4 h-4 fill-ink ml-0.5" />
                        </button>
                        <div className="overflow-hidden">
                          <span className="text-[10px] font-mono text-lime font-semibold uppercase block">
                            Field Tutorial
                          </span>
                          <div className="text-xs font-bold text-white truncate">
                            {task.guideVideoTitle}
                          </div>
                          <span className="text-[10px] text-neutral-400">KVK Pune Demonstration</span>
                        </div>
                      </div>
                    )}

                    <div className={`${task.guideVideoTitle ? 'md:col-span-7' : 'md:col-span-12'} p-3 rounded-2xl bg-surface-dark/60 border border-white/5 space-y-1.5`}>
                      <div className="text-[10px] font-mono text-neutral-400 font-semibold uppercase">
                        Low-Bandwidth Action Checklist
                      </div>
                      {(task.checklist || []).map((chkItem, cIdx) => (
                        <div key={cIdx} className="flex items-start gap-2 text-xs text-neutral-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-lime shrink-0 mt-0.5" />
                          <span>{chkItem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Farm Management Calendar */}
          <div>
            <div className="mb-4">
              <span className="text-xs font-mono font-bold text-lime uppercase tracking-wider">
                Farm Operations Schedule
              </span>
              <h3 className="text-xl font-display font-bold text-white mt-0.5">
                Farm Management Calendar
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Schedule, complete and reschedule your crop operations. Tracks inventory consumption automatically.
              </p>
            </div>
            <FarmCalendar
              tasks={safeCropTasks}
              farmResources={safeFarmResources}
              defaultViewMode="cycle"
              weather={useFarmStore.getState().weatherData}
              onCompleteTask={(taskId, qty, notes) => {
                completeTask(taskId, qty, notes);
                showToast('Task completed! Consumed quantity deducted from inventory.', 'success');
              }}
              onRescheduleTask={(taskId, newDate, reason) => {
                rescheduleTask(taskId, newDate, reason);
                showToast(`Task rescheduled to ${newDate}.`, 'info');
              }}
              onAddTask={(task) => {
                addTask(task);
                showToast('Custom task added to farm calendar!', 'success');
              }}
              onPlayVideo={(title) => setPlayingVideoTitle(title)}
            />
          </div>
        </div>
      )}

      {/* Video Modal Player */}
      {playingVideoTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg liquid-glass rounded-3xl p-6 border border-lime/30 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-lime mx-auto">
              <Play className="w-6 h-6 fill-current ml-1" />
            </div>
            <h3 className="text-lg font-bold text-white">{playingVideoTitle}</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Field tutorial simulation recorded at Krishi Vigyan Kendra (KVK Pune).
            </p>
            <div className="h-44 w-full rounded-2xl bg-black/70 flex items-center justify-center border border-white/10 text-neutral-400 text-xs font-mono">
              [ Video Tutorial Stream (Demonstration Asset) ]
            </div>
            <button
              onClick={() => setPlayingVideoTitle(null)}
              className="px-6 py-2 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover"
            >
              Close Video Player
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
