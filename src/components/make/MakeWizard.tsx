import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { Batch, Crop, FertilizerRecipe, SoilInput, WizardSoilType } from '../../types';
import { CROPS_CATALOG } from '../../data/crops';
import { getRawMaterial } from '../../data/rawMaterials';
import { calculateFertilizerRecipe, RECIPE_DISCLAIMER, toSoilInputShape } from '../../services/recipeService';
import { createBatchFromRecipe } from '../../services/batchService';
import { explainRecipe } from '../../services/aiService';
import { useAuthStore } from '../../store/authStore';
import { useCropStore } from '../../store/cropStore';
import { useFarmStore } from '../../store/farmStore';
import { useBatchStore } from '../../store/batchStore';
import { useInventoryStore } from '../../store/inventoryStore';
import { useMakeDraftStore } from '../../store/makeDraftStore';
import { ProvenanceBadge } from '../ProvenanceBadge';
import { ImageWithFallback } from '../ImageWithFallback';
import { SpecularCard } from '../SpecularCard';
import { ui } from './styles';

export interface MakeHandoff {
  cropId: string;
  targetQuantityKg: number;
}

interface MakeWizardProps {
  handoff?: MakeHandoff | null;
  onBatchCreated: (batch: Batch) => void;
  onCancel: () => void;
  onFindInMarketplace: (materialName: string) => void;
}

const mapSoilType = (raw: string): WizardSoilType => {
  const s = (raw || '').toLowerCase();
  if (s.includes('black')) return 'Black Cotton';
  if (s.includes('clay')) return 'Clay';
  if (s.includes('sandy')) return 'Sandy';
  if (s.includes('red')) return 'Red Soil';
  if (s.includes('alluvial')) return 'Alluvial';
  return 'Loamy';
};

const level = (v: string, fallback: 'Low' | 'Medium' | 'High'): 'Low' | 'Medium' | 'High' =>
  v === 'Low' || v === 'Medium' || v === 'High' ? v : fallback;

const STEP_TITLES = ['1. Select Crop', '2. Soil & Land Info', '3. Formulation', '4. Raw Materials'];

export const MakeWizard: React.FC<MakeWizardProps> = ({ handoff, onBatchCreated, onCancel, onFindInMarketplace }) => {
  const user = useAuthStore((s) => s.user);
  const language = useAuthStore((s) => s.language);
  const cropInputs = useCropStore((s) => s.inputs);
  const selectedCropId = useCropStore((s) => s.selectedCropId);
  const fields = useFarmStore((s) => s.fields);
  const selectedFieldId = useFarmStore((s) => s.selectedFieldId);
  const batches = useBatchStore((s) => s.batches);
  const stock = useInventoryStore((s) => s.stock);
  const setStock = useInventoryStore((s) => s.setStock);
  const draft = useMakeDraftStore((s) => s.draft);
  const setDraft = useMakeDraftStore((s) => s.setDraft);
  const clearDraft = useMakeDraftStore((s) => s.clearDraft);

  // Soil defaults are carried from the farm profile and Module 1, never re-typed by the farmer.
  const defaultSoil = useMemo<SoilInput>(() => {
    const field = fields.find((f) => f.id === selectedFieldId) || fields[0];
    const season: SoilInput['season'] =
      cropInputs.season === 'Rabi' ? 'Rabi (Winter)' : cropInputs.season === 'Zaid' ? 'Zaid (Summer)' : 'Kharif (Monsoon)';
    return {
      soilType: mapSoilType(cropInputs.soilType || field?.soilType || ''),
      ph: typeof cropInputs.soilPh === 'number' ? cropInputs.soilPh : 6.8,
      n: level(cropInputs.soilN, 'Medium'),
      p: level(cropInputs.soilP, 'Medium'),
      k: level(cropInputs.soilK, 'Medium'),
      organicCarbon: 'Medium',
      landAreaM2: Math.round(field?.areaSqM || 4047),
      targetQuantityKg: 100,
      season,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useDraft = !handoff && !!draft;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(useDraft ? draft!.step : 1);
  const [cropId, setCropId] = useState<string>(
    handoff?.cropId || (useDraft ? draft!.cropId : selectedCropId || CROPS_CATALOG[0].id)
  );
  const [soil, setSoil] = useState<SoilInput>(
    useDraft
      ? draft!.soil
      : { ...defaultSoil, targetQuantityKg: handoff?.targetQuantityKg ?? defaultSoil.targetQuantityKg }
  );
  const [recipe, setRecipe] = useState<FertilizerRecipe | null>(useDraft ? draft!.recipe : null);
  const [aiExplanation, setAiExplanation] = useState<string>(useDraft ? draft!.aiExplanation : '');
  const [loadingAi, setLoadingAi] = useState(false);
  const [preparedFromCrops, setPreparedFromCrops] = useState<boolean>(!!handoff || (useDraft && draft!.preparedFromCropModule));
  const [error, setError] = useState<string>('');

  const crop: Crop = CROPS_CATALOG.find((c) => c.id === cropId) || CROPS_CATALOG[0];

  const runFormulation = async (forCrop: Crop, forSoil: SoilInput) => {
    const result = calculateFertilizerRecipe(forCrop, toSoilInputShape(forSoil));
    setRecipe(result);
    setAiExplanation('');
    setStep(3);
    setLoadingAi(true);
    try {
      const text = await explainRecipe(forCrop.nameEn, forSoil.soilType, result.materials, language);
      setAiExplanation(text);
    } finally {
      setLoadingAi(false);
    }
  };

  // Crops → Make handoff: formulate straight away so the farmer lands on the recipe.
  const handoffRan = useRef(false);
  useEffect(() => {
    if (handoff && !handoffRan.current) {
      handoffRan.current = true;
      const c = CROPS_CATALOG.find((x) => x.id === handoff.cropId) || CROPS_CATALOG[0];
      runFormulation(c, { ...defaultSoil, targetQuantityKg: handoff.targetQuantityKg });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the draft so "Return to my recipe" from the Marketplace restores this exact state.
  useEffect(() => {
    setDraft({ step, cropId, soil, recipe, aiExplanation, preparedFromCropModule: preparedFromCrops });
  }, [step, cropId, soil, recipe, aiExplanation, preparedFromCrops, setDraft]);

  const validateSoil = (): string => {
    if (!Number.isFinite(soil.landAreaM2) || soil.landAreaM2 < 10 || soil.landAreaM2 > 400000)
      return 'Land area must be between 10 and 400,000 m².';
    if (!Number.isFinite(soil.targetQuantityKg) || soil.targetQuantityKg < 5 || soil.targetQuantityKg > 5000)
      return 'Target batch size must be between 5 and 5,000 kg.';
    return '';
  };

  const handleRunFormulation = () => {
    const msg = validateSoil();
    setError(msg);
    if (msg) return;
    runFormulation(crop, soil);
  };

  const handleConfirmAndStartBatch = () => {
    if (!recipe) return;
    const batch = createBatchFromRecipe({
      crop,
      recipe,
      soilInput: { ...soil, targetQuantityKg: recipe.targetQuantityKg },
      userName: user?.name || 'Farmer',
      userLocation: [user?.village, user?.district].filter(Boolean).join(', ') || 'Maharashtra',
      existingCodes: batches.map((b) => b.batchCode),
    });
    clearDraft();
    onBatchCreated(batch);
  };

  const stepButtonState = (n: number) =>
    step >= n ? 'bg-primary-dark/70 border-lime/40 text-lime font-bold' : 'bg-black/20 border-white/5 text-neutral-500';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Wizard Header & Progress */}
      <div className={`${ui.card} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={ui.eyebrow}>Step-by-Step Maker Engine</span>
              <ProvenanceBadge type="Estimated" size="sm" />
            </div>
            <h2 className="text-xl font-display font-bold text-white mt-0.5">
              Formulate Crop-Specific Bio-Fertilizer
            </h2>
          </div>
          <button onClick={onCancel} className={ui.btnSecondary}>
            Cancel
          </button>
        </div>

        {preparedFromCrops && (
          <div className={`${ui.info} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-lime shrink-0 mt-0.5" />
              <div>
                <strong className="text-lime block">Carried from your crop plan</strong>
                <span className="text-neutral-300">
                  Crop <strong className="text-white">{crop.nameEn}</strong>, soil values and on-farm materials were
                  carried over from Module 1. Adjust anything you like; nothing needs re-typing.
                </span>
              </div>
            </div>
            <ProvenanceBadge type="User-provided" size="sm" className="shrink-0" />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-medium">
          {STEP_TITLES.map((title, i) => (
            <div key={title} className={`p-2.5 rounded-2xl border text-center transition ${stepButtonState(i + 1)}`}>
              {title}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: CROP SELECTION */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${ui.card} space-y-5`}>
          <div>
            <h3 className="text-base font-bold text-white">Select Your Target Crop</h3>
            <p className={ui.muted}>
              Each crop has a different nutrient curve: leafy greens need more nitrogen; fruiting crops need more
              phosphorus and potash.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CROPS_CATALOG.map((c) => {
              const isSelected = cropId === c.id;
              return (
                <SpecularCard
                  as="button"
                  type="button"
                  key={c.id}
                  onClick={() => setCropId(c.id)}
                  radius={24}
                  lineColor="#C8F23B"
                  intensity={isSelected ? 1.2 : 0.8}
                  idleIntensity={isSelected ? 0.35 : 0.08}
                  className={`text-left p-4 rounded-3xl border-2 transition flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-lime bg-primary-dark/50 shadow-glow-lime'
                      : 'border-white/5 hover:border-lime/40 bg-black/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ImageWithFallback
                      src={c.image}
                      alt={c.nameEn}
                      fallbackTitle={c.nameEn}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className={ui.chip}>{c.category}</span>
                      <h4 className="text-sm font-bold text-white mt-1">{c.nameEn}</h4>
                      <p className="text-[11px] text-neutral-400 italic">{c.scientificName}</p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">{c.whyReason}</p>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>
                      NPK demand:{' '}
                      <strong className="text-white">
                        {c.npkDemand.n}-{c.npkDemand.p}-{c.npkDemand.k}
                      </strong>
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-lime shrink-0" />}
                  </div>
                </SpecularCard>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button onClick={() => setStep(2)} className={ui.btnPrimary}>
              <span>Next: Soil & Quantity Inputs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: SOIL INPUTS & QUANTITIES */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${ui.card} space-y-6`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white">Soil Parameters & Production Scale</h3>
              <p className={ui.muted}>
                Values below are carried from your farm profile. Replace them with soil test kit or Soil Health Card
                results for a better recipe.
              </p>
            </div>
            <ProvenanceBadge type="Estimated" size="sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className={ui.label}>Soil Type</label>
              <select
                value={soil.soilType}
                onChange={(e) => setSoil({ ...soil, soilType: e.target.value as WizardSoilType })}
                className={ui.input}
              >
                <option value="Loamy">Loamy Soil (Balanced humus)</option>
                <option value="Clay">Clay Soil (Heavy, needs aeration)</option>
                <option value="Sandy">Sandy Soil (High leaching)</option>
                <option value="Black Cotton">Black Cotton Soil (Regur)</option>
                <option value="Red Soil">Red Laterite Soil</option>
                <option value="Alluvial">Alluvial Riverbed Soil</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className={ui.label}>Soil pH</label>
                <span className="text-xs font-mono font-bold text-lime">
                  {soil.ph} ({soil.ph < 6.5 ? 'Acidic side' : soil.ph > 7.5 ? 'Alkaline side' : 'Near neutral'})
                </span>
              </div>
              <input
                type="range"
                min="5.0"
                max="8.5"
                step="0.1"
                value={soil.ph}
                onChange={(e) => setSoil({ ...soil, ph: parseFloat(e.target.value) })}
                className="w-full accent-lime"
              />
              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>5.0 Acidic</span>
                <span>7.0 Neutral</span>
                <span>8.5 Alkaline</span>
              </div>
            </div>

            {(
              [
                { key: 'n', label: 'Existing Soil Nitrogen (N)' },
                { key: 'p', label: 'Existing Soil Phosphorus (P)' },
                { key: 'k', label: 'Existing Soil Potassium (K)' },
              ] as const
            ).map(({ key, label }) => (
              <div className="space-y-1.5" key={key}>
                <label className={ui.label}>{label}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Medium', 'High'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSoil({ ...soil, [key]: lvl })}
                      className={`py-2 text-xs font-semibold rounded-full border transition ${
                        soil[key] === lvl
                          ? 'bg-lime text-ink border-lime'
                          : 'bg-black/20 text-neutral-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-1.5">
              <label className={ui.label}>Cropping Season</label>
              <select
                value={soil.season}
                onChange={(e) => setSoil({ ...soil, season: e.target.value as SoilInput['season'] })}
                className={ui.input}
              >
                <option value="Kharif (Monsoon)">Kharif (Monsoon Season)</option>
                <option value="Rabi (Winter)">Rabi (Winter Season)</option>
                <option value="Zaid (Summer)">Zaid (Summer Season)</option>
                <option value="Year-round">Year-round Greenhouse / Terrace</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={ui.label}>Land Area (m²)</label>
              <input
                type="number"
                min={10}
                max={400000}
                value={soil.landAreaM2}
                onChange={(e) => setSoil({ ...soil, landAreaM2: Number(e.target.value) })}
                className={ui.input}
              />
              <p className="text-[10px] text-neutral-500">User-drawn estimate, not an official land record.</p>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className={ui.label}>Target Fertilizer Batch (kg)</label>
              <input
                type="number"
                min={5}
                max={5000}
                value={soil.targetQuantityKg}
                onChange={(e) => setSoil({ ...soil, targetQuantityKg: Number(e.target.value) })}
                className="w-full p-2.5 rounded-2xl border border-lime/40 bg-primary-dark/40 text-xs font-bold text-lime focus:border-lime focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 text-red-300 text-xs p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <button onClick={() => setStep(1)} className={ui.btnSecondary}>
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button onClick={handleRunFormulation} className={ui.btnPrimary}>
              <Sparkles className="w-4 h-4" />
              <span>Run Formulation Engine</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: RECIPE REVIEW & EXPLANATION */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${ui.card} space-y-6`}>
          {recipe ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-white/5">
                <div>
                  <span className={ui.chip}>{recipe.version}</span>
                  <h3 className="text-lg font-bold text-white mt-1">{recipe.name}</h3>
                  <p className={ui.muted}>{recipe.targetUse}</p>
                </div>

                <div className={`flex items-center gap-3 p-2.5 ${ui.tile}`}>
                  <div className="text-center px-2">
                    <p className="text-[10px] text-neutral-400">Target Weight</p>
                    <p className="text-sm font-bold text-lime">{recipe.targetQuantityKg} kg</p>
                  </div>
                  <div className="h-6 w-px bg-white/10" />
                  <div className="text-center px-2">
                    <p className="text-[10px] text-neutral-400">Est. C:N Ratio</p>
                    <p className="text-sm font-bold text-teal">~{recipe.estimatedCnRatio}:1</p>
                  </div>
                  <div className="h-6 w-px bg-white/10" />
                  <div className="text-center px-2">
                    <p className="text-[10px] text-neutral-400">Target Moisture</p>
                    <p className="text-sm font-bold text-amber">{recipe.targetMoistureRange}</p>
                  </div>
                </div>
              </div>

              <div className={ui.note}>
                <strong className="block mb-0.5">{RECIPE_DISCLAIMER}</strong>
                Ratios come from a versioned rule table (ratios sum to 1.00). AI text only explains them and never
                changes the numbers.
              </div>

              <div className={`${ui.info} space-y-2`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-lime">
                    <Sparkles className="w-4 h-4" />
                    <span>Agronomic Reasoning</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">AI guidance, verify with local experts</span>
                </div>
                {loadingAi ? (
                  <div className="flex items-center gap-2 text-neutral-300 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-lime" />
                    <span>Checking C:N balance for {crop.nameEn} in {soil.soilType} soil...</span>
                  </div>
                ) : (
                  <p className="leading-relaxed whitespace-pre-line text-neutral-300 font-normal">
                    {aiExplanation || recipe.aiExplanation}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Calculated Feedstock Quantities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recipe.materials.map((mat) => (
                    <div key={mat.materialId} className={`p-3.5 flex items-start justify-between gap-3 ${ui.tileSolid}`}>
                      <div>
                        <h5 className="text-xs font-bold text-white">{mat.materialName}</h5>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{mat.purpose}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-lime font-mono">{mat.quantityKg} kg</span>
                        <p className="text-[10px] text-neutral-500">{mat.percentage}% of pile</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className={`p-4 space-y-2 ${ui.tileSolid}`}>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-lime" />
                    Preparation Instructions
                  </span>
                  <ul className="space-y-1 text-neutral-300 list-disc list-inside">
                    {recipe.preparationInstructions.map((ins, i) => (
                      <li key={i} className="leading-relaxed">{ins}</li>
                    ))}
                  </ul>
                </div>
                <div className={`p-4 space-y-2 ${ui.note}`}>
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Composting Safety Rules
                  </span>
                  <ul className="space-y-1 text-neutral-200 list-disc list-inside">
                    {recipe.warnings.map((w, i) => (
                      <li key={i} className="leading-relaxed">{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <button onClick={() => setStep(2)} className={ui.btnSecondary}>
                  <ArrowLeft className="w-4 h-4" />
                  <span>Adjust Soil Inputs</span>
                </button>
                <button onClick={() => setStep(4)} className={ui.btnPrimary}>
                  <span>Review Raw Materials</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-lime animate-spin" />
              <p className="text-sm font-bold text-white">Preparing recipe...</p>
            </div>
          )}
        </motion.div>
      )}

      {/* STEP 4: RAW MATERIAL DETAILS & BATCH INITIALIZATION */}
      {step === 4 && recipe && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${ui.card} space-y-6`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white">Raw Materials & Safety Profiles</h3>
              <p className={ui.muted}>
                Tick what you already have on the farm. Anything short can be bought from the Marketplace.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ProvenanceBadge type="User-provided" size="sm" />
              <span className={ui.chip}>{recipe.materials.length} Materials Required</span>
            </div>
          </div>

          <div className="space-y-4">
            {recipe.materials.map((mat) => {
              const info = getRawMaterial(mat.materialId);
              const item = stock[mat.materialId];
              const isInStock = item ? item.inStock : false;
              const availableQty = item ? item.quantityKg : 0;
              const deficit = Math.max(0, Number((mat.quantityKg - (isInStock ? availableQty : 0)).toFixed(1)));
              const hasShortage = deficit > 0;

              return (
                <SpecularCard
                  key={mat.materialId}
                  radius={24}
                  lineColor={hasShortage ? '#F59E0B' : '#C8F23B'}
                  className={`p-4 rounded-3xl border transition-all flex flex-col sm:flex-row items-start gap-4 ${
                    hasShortage ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/5 bg-black/20'
                  }`}
                >
                  {info?.photoUrl && (
                    <ImageWithFallback
                      src={info.photoUrl}
                      alt={mat.materialName}
                      fallbackTitle={mat.materialName}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h5 className="text-sm font-bold text-white">{mat.materialName}</h5>
                        <p className="text-xs text-neutral-400">{info?.description || mat.purpose}</p>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/30 text-neutral-300 border border-white/10">
                          Required: <strong className="text-lime font-mono">{mat.quantityKg} kg</strong>
                        </span>
                        {hasShortage ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {deficit} kg Short
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-lime/15 text-lime border border-lime/30">
                            Available ✓
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-black/30 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInStock}
                          onChange={(e) => setStock(mat.materialId, e.target.checked, availableQty)}
                          className="w-4 h-4 accent-lime"
                        />
                        <span className="font-semibold text-neutral-200">In Stock on Farm</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400 text-xs">Available Qty:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            disabled={!isInStock}
                            value={availableQty}
                            onChange={(e) => setStock(mat.materialId, isInStock, parseFloat(e.target.value) || 0)}
                            className="w-20 p-1.5 rounded-xl border border-white/10 bg-black/40 text-xs font-mono font-bold text-white focus:border-lime/60 focus:outline-none disabled:opacity-40"
                          />
                          <span className="text-neutral-500 text-xs font-semibold">kg</span>
                        </div>
                      </div>

                      {hasShortage && (
                        <button
                          type="button"
                          onClick={() => onFindInMarketplace(info?.marketQuery || mat.materialName)}
                          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover transition cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Buy from Marketplace</span>
                        </button>
                      )}
                    </div>

                    {info && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-neutral-400">
                        <span className="px-2 py-0.5 bg-black/30 rounded-full border border-white/5">
                          C:N = {info.cnRatio}:1
                        </span>
                        <span className="px-2 py-0.5 bg-black/30 rounded-full border border-white/5">
                          N {info.nPercent}% | P {info.pPercent}% | K {info.kPercent}%
                        </span>
                        <span className="px-2 py-0.5 bg-black/30 rounded-full border border-white/5">
                          Moisture {info.moisturePercent}%
                        </span>
                        <ProvenanceBadge type="Demo data" size="sm" />
                      </div>
                    )}
                    {info?.safetyWarnings && (
                      <p className="text-[11px] text-amber-300/90">⚠ {info.safetyWarnings}</p>
                    )}
                  </div>
                </SpecularCard>
              );
            })}
          </div>

          <div className={`${ui.banner} p-5 flex flex-col sm:flex-row items-center justify-between gap-4`}>
            <div>
              <h4 className="text-sm font-bold text-white">Ready to start this batch?</h4>
              <p className="text-xs text-neutral-300 mt-0.5">
                A unique batch code and a demo passport will be created, and you will be taken to My Batch to follow
                collection, shredding, pile layering and temperature logging step by step.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setStep(3)} className={ui.btnSecondary}>
                Back
              </button>
              <button onClick={handleConfirmAndStartBatch} className={ui.btnAmber}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Batch & Start Step 1</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
