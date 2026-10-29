import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Thermometer,
  Droplet,
  RotateCw,
  FlaskConical,
  Sprout,
  ShoppingBag,
  QrCode,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Check,
  ShieldCheck,
  RefreshCw,
  Lock,
  Layers,
} from 'lucide-react';
import { Batch, BatchProcessStep } from '../../types';
import {
  BATCH_STEPS,
  allMaterialsCollected,
  countAerationTurns,
  getBatchEvidenceStatus,
  getMoistureStatus,
  getStepIndex,
  getTemperatureMessage,
} from '../../services/batchService';
import { useBatchStore } from '../../store/batchStore';
import { useUIStore } from '../../store/uiStore';
import { ProvenanceBadge } from '../ProvenanceBadge';
import { SpecularCard } from '../SpecularCard';
import { ui, toneClasses } from './styles';
import collectVideo from '../../assets/videos/step1-collect.mp4';
import chopShredVideo from '../../assets/videos/step2-chop-shred.mp4';
import mixVideo from '../../assets/videos/step3-mix.mp4';
import moistenVideo from '../../assets/videos/step4-moisten.mp4';
import aerateTempVideo from '../../assets/videos/step5-6-aerate-temp.mp4';
import matureVideo from '../../assets/videos/step7-mature.mp4';

interface BatchTrackerProps {
  batch: Batch;
  onOpenTestModal: (batch: Batch) => void;
  onOpenGrowthTrial: (batch: Batch) => void;
  onOpenPassport: (batch: Batch) => void;
  onOpenListForSale: (batch: Batch) => void;
}

const PROCESS_VIDEOS = [
  { step: 'Step 1', name: 'Collect - Raw materials', source: collectVideo },
  { step: 'Step 2', name: 'Chop & Shred', source: chopShredVideo },
  { step: 'Step 3', name: 'Mix this way', source: mixVideo },
  { step: 'Step 4', name: 'Moisten Up', source: moistenVideo },
  { step: 'Steps 5 & 6', name: 'Aerate and Temperature control', source: aerateTempVideo },
  { step: 'Step 7', name: 'Let it mature', source: matureVideo },
];

const VIDEO_BY_STEP: Record<BatchProcessStep, (typeof PROCESS_VIDEOS)[number]> = {
  COLLECT: PROCESS_VIDEOS[0],
  CHOP_SHRED: PROCESS_VIDEOS[1],
  MIX: PROCESS_VIDEOS[2],
  PILE_UP: PROCESS_VIDEOS[3],
  MOISTURE_SET: PROCESS_VIDEOS[4],
  ACTIVE_COMPOSTING: PROCESS_VIDEOS[4],
  TURN_AERATE: PROCESS_VIDEOS[4],
  MATURATION: PROCESS_VIDEOS[5],
  TESTING: PROCESS_VIDEOS[5],
  VALIDATION: PROCESS_VIDEOS[5],
  READY: PROCESS_VIDEOS[5],
};

/** Which workspace panel a timeline step belongs to, and which batch statuses may act in that panel. */
type Panel = 'COLLECT' | 'CHOP' | 'LAYER' | 'SENSORS' | 'MATURE';
const PANEL_OF: Record<BatchProcessStep, Panel> = {
  COLLECT: 'COLLECT',
  CHOP_SHRED: 'CHOP',
  MIX: 'LAYER',
  PILE_UP: 'LAYER',
  MOISTURE_SET: 'SENSORS',
  ACTIVE_COMPOSTING: 'SENSORS',
  TURN_AERATE: 'SENSORS',
  MATURATION: 'MATURE',
  TESTING: 'MATURE',
  VALIDATION: 'MATURE',
  READY: 'MATURE',
};

const NEXT_ACTION: Partial<Record<BatchProcessStep, { target: BatchProcessStep; label: string }>> = {
  COLLECT: { target: 'CHOP_SHRED', label: 'Mark Collection Complete & Go to Shredding' },
  CHOP_SHRED: { target: 'MIX', label: 'Mark Shredding Complete & Proceed to Layering' },
  MIX: { target: 'PILE_UP', label: 'Confirm Layers Done & Build the Aerobic Pile' },
  PILE_UP: { target: 'MOISTURE_SET', label: 'Pile Built: Go to Moisture Calibration' },
  MOISTURE_SET: { target: 'ACTIVE_COMPOSTING', label: 'Moisture Set: Start Active Composting' },
  ACTIVE_COMPOSTING: { target: 'TURN_AERATE', label: 'Heating Phase Underway: Start Turning Cycles' },
  TURN_AERATE: { target: 'MATURATION', label: 'Cooling Complete: Advance to Maturation Phase' },
  MATURATION: { target: 'READY', label: 'Mark Batch As READY' },
  TESTING: { target: 'READY', label: 'Mark Batch As READY' },
  VALIDATION: { target: 'READY', label: 'Mark Batch As READY' },
};

const Sparkline: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
  if (values.length < 2) return null;
  const w = 220;
  const h = 48;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - 4 - ((v - min) / span) * (h - 8)}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12" role="img" aria-label="Reading trend">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

export const BatchTracker: React.FC<BatchTrackerProps> = ({
  batch,
  onOpenTestModal,
  onOpenGrowthTrial,
  onOpenPassport,
  onOpenListForSale,
}) => {
  const advance = useBatchStore((s) => s.advance);
  const toggleMaterial = useBatchStore((s) => s.toggleMaterial);
  const logReading = useBatchStore((s) => s.logReading);
  const logTurn = useBatchStore((s) => s.logTurn);
  const showToast = useUIStore((s) => s.showToast);

  const [activeTabStep, setActiveTabStep] = useState<BatchProcessStep>(batch.status);
  const [tempInput, setTempInput] = useState<number>(batch.latestReadings?.temperatureC ?? 32);
  const [moistInput, setMoistInput] = useState<number>(batch.latestReadings?.moisturePercent ?? 52);
  const [isSimulating, setIsSimulating] = useState(false);
  const [stepNote, setStepNote] = useState('');

  const currentIdx = getStepIndex(batch.status);
  const panel = PANEL_OF[activeTabStep];
  const panelIsCurrent = PANEL_OF[batch.status] === panel;
  const panelIsDone = !panelIsCurrent && getStepIndex(activeTabStep) < currentIdx;
  const action = NEXT_ACTION[batch.status];
  const moistureInfo = getMoistureStatus(moistInput);
  const video = VIDEO_BY_STEP[activeTabStep];
  const evidence = getBatchEvidenceStatus(batch);
  const turns = countAerationTurns(batch);

  const handleAdvance = () => {
    if (!action) return;
    const result = advance(batch.id, action.target, stepNote.trim() || undefined);
    if (!result.ok) {
      showToast(result.error || 'This step cannot be completed yet.', 'warning');
      return;
    }
    // Persist the probe values shown on screen as a manual reading when moving past a monitoring step.
    if (PANEL_OF[batch.status] === 'SENSORS') logReading(batch.id, tempInput, moistInput, 'Manual');
    setActiveTabStep(action.target);
    setStepNote('');
    showToast(
      action.target === 'READY'
        ? 'Batch marked READY. Evidence stays "Evidence not provided" until you record a test.'
        : 'Step completed. Batch progress updated.',
      'success'
    );
  };

  const handleSimulateReading = () => {
    setIsSimulating(true);
    window.setTimeout(() => {
      const t = Number((54 + Math.random() * 8).toFixed(1));
      const m = Number((50 + Math.random() * 5).toFixed(1));
      setTempInput(t);
      setMoistInput(m);
      logReading(batch.id, t, m, 'Simulated');
      setIsSimulating(false);
      showToast('Simulated probe reading logged. No real device is connected.', 'info');
    }, 700);
  };

  const handleLogManual = () => {
    logReading(batch.id, tempInput, moistInput, 'Manual');
    showToast('Your reading was saved to the batch log.', 'success');
  };

  const handleRecordTurn = () => {
    logTurn(batch.id);
    setTempInput(58.5);
    setMoistInput(52);
    showToast('Aeration turn logged. Temperature usually rebounds within a day.', 'success');
  };

  const renderNoteAndAction = ({ disabled, hint }: { disabled?: boolean; hint?: string } = {}) => {
    if (!panelIsCurrent) return null;
    if (!action) return null;
    return (
      <div className="pt-4 border-t border-white/5 space-y-3">
        <div>
          <label className="text-[11px] font-bold text-neutral-400 block mb-1">Step note (optional)</label>
          <input
            type="text"
            placeholder="e.g. Shredded to 2.5 cm using a hand cutter..."
            value={stepNote}
            onChange={(e) => setStepNote(e.target.value)}
            className={ui.input}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] text-neutral-500">{hint}</span>
          <button onClick={handleAdvance} disabled={disabled} className={ui.btnPrimary}>
            <span>{action.label}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Batch Overview Banner */}
      <div className={`${ui.card} space-y-4`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-black/30 text-lime rounded-full border border-lime/30">
                {batch.batchCode}
              </span>
              <span className={ui.chip}>{batch.recipe.version}</span>
              <span className="text-xs text-neutral-400">• {batch.userLocation}</span>
              <ProvenanceBadge type={evidence} size="sm" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white">{batch.recipe.name}</h2>
            <p className="text-xs text-neutral-400">
              Crop: <strong className="text-lime">{batch.cropName}</strong> | Target:{' '}
              <strong className="text-white">{batch.recipe.targetQuantityKg} kg</strong> | Soil:{' '}
              <strong className="text-white">
                {batch.soilInput.soilType} (pH {batch.soilInput.ph})
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => onOpenPassport(batch)} className={ui.btnSecondary}>
              <QrCode className="w-4 h-4 text-lime" />
              <span>Batch Passport</span>
            </button>
            {batch.status === 'READY' && (
              <button onClick={() => onOpenListForSale(batch)} className={ui.btnAmber}>
                <ShoppingBag className="w-4 h-4" />
                <span>{batch.isListedOnMarketplace ? 'View Marketplace Item' : 'List on Marketplace'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <SpecularCard radius={16} lineColor="#EF4444" className={`p-3.5 flex items-center justify-between ${ui.tileSolid}`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-400">Core Temp</p>
                <p className="text-sm font-bold text-white">{tempInput}°C</p>
              </div>
            </div>
            <span className={`${ui.chip} !text-red-300`}>{tempInput >= 55 ? 'Thermophilic' : 'Mesophilic'}</span>
          </SpecularCard>

          <SpecularCard radius={16} lineColor="#38BDF8" className={`p-3.5 flex items-center justify-between ${ui.tileSolid}`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                <Droplet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-400">Moisture</p>
                <p className="text-sm font-bold text-white">{moistInput}%</p>
              </div>
            </div>
            <span className={`${ui.chip} !text-sky-300`}>
              {moistInput >= 45 && moistInput <= 60 ? 'Optimal' : 'Adjust'}
            </span>
          </SpecularCard>

          <SpecularCard radius={16} lineColor="#C8F23B" className={`p-3.5 flex items-center justify-between ${ui.tileSolid}`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-lime/10 border border-lime/30 text-lime">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-400">Est. C:N</p>
                <p className="text-sm font-bold text-white">~{batch.recipe.estimatedCnRatio}:1</p>
              </div>
            </div>
            <span className={ui.chip}>Aerobic</span>
          </SpecularCard>

          <SpecularCard radius={16} lineColor="#A855F7" className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-purple-300 font-semibold">IoT probe (demo)</p>
              <p className="text-xs font-bold text-white">Simulated • no device</p>
            </div>
            <button
              onClick={handleSimulateReading}
              disabled={isSimulating || batch.status === 'READY'}
              className="p-2 rounded-full bg-lime text-ink hover:bg-lime-hover transition cursor-pointer disabled:opacity-40"
              title="Simulate a probe reading"
              aria-label="Simulate a probe reading"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            </button>
          </SpecularCard>
        </div>
      </div>

      {/* Timeline */}
      <div className={`${ui.card} !p-5 space-y-3`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Batch Process Timeline
          </h3>
          <span className="text-xs font-bold text-lime">{batch.progressPercent}% Overall Lifecycle</span>
        </div>

        <div className="h-1.5 rounded-full bg-black/30 overflow-hidden">
          <div className="h-full bg-lime transition-all duration-500" style={{ width: `${batch.progressPercent}%` }} />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {BATCH_STEPS.map((s, idx) => {
            const isCurrent = batch.status === s.step;
            const isCompleted = idx < currentIdx || batch.status === 'READY';
            const isSelected = activeTabStep === s.step;
            return (
              <button
                key={s.step}
                onClick={() => setActiveTabStep(s.step)}
                className={`px-3 py-2 rounded-2xl border text-left shrink-0 transition cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-lime text-ink border-lime shadow-glow-lime'
                    : isCompleted
                    ? 'bg-primary-dark/50 border-lime/30 text-lime'
                    : isCurrent
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold'
                    : 'bg-black/20 border-white/5 text-neutral-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-ink' : 'text-lime'}`} />
                ) : isCurrent ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 bg-amber-300 animate-pulse shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold leading-tight">{s.title}</p>
                  <p className={`text-[10px] ${isSelected ? 'text-ink/70' : 'text-neutral-400'}`}>Day ~{s.dayTarget}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Workspace */}
      <div className={`${ui.card} space-y-6`}>
        {/* Video guide */}
        <div className={`${ui.tileSolid} overflow-hidden`}>
          <div className="px-4 pt-4">
            <span className="text-xs font-bold text-white">Video guide for this step</span>
            <p className="text-[11px] text-neutral-400 mt-1">
              Watch the matching organic fertilizer process video before completing this step.
            </p>
          </div>
          <div className="p-4">
            <div className="max-w-2xl rounded-2xl overflow-hidden bg-black/40 border border-white/10">
              <video
                key={video.source}
                src={video.source}
                controls
                preload="metadata"
                playsInline
                className="w-full aspect-video object-cover bg-black"
                aria-label={`${video.step}: ${video.name}`}
              />
              <div className="p-3">
                <span className="text-[10px] font-bold uppercase tracking-wide text-lime">{video.step}</span>
                <p className="text-xs font-semibold text-white mt-1">{video.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Locked / done notices */}
        {!panelIsCurrent && (
          <div className={`${ui.info} flex flex-wrap items-center justify-between gap-3`}>
            <div className="flex items-center gap-2">
              {panelIsDone ? <CheckCircle2 className="w-4 h-4 text-lime" /> : <Lock className="w-4 h-4 text-amber-300" />}
              <span>
                {panelIsDone
                  ? 'This step is complete. You are viewing it for reference.'
                  : 'This step is locked until the earlier steps are finished. Steps cannot be skipped.'}
              </span>
            </div>
            <button onClick={() => setActiveTabStep(batch.status)} className={ui.btnSecondary}>
              Go to current step
            </button>
          </div>
        )}

        {/* COLLECT */}
        {panel === 'COLLECT' && (
          <div className="space-y-5">
            <div className="pb-3 border-b border-white/5">
              <span className={ui.eyebrow}>Phase 1</span>
              <h3 className="text-lg font-bold text-white">Gather & Weigh Raw Organic Materials</h3>
              <p className={ui.muted}>
                Keep feedstocks clean and free from plastic or non-biodegradables.
              </p>
            </div>

            <div className="space-y-3">
              {batch.materialsCollected.map((mat) => {
                const recipeMat = batch.recipe.materials.find((m) => m.materialId === mat.materialId);
                const interactive = batch.status === 'COLLECT';
                return (
                  <SpecularCard
                    as="button"
                    type="button"
                    key={mat.materialId}
                    onClick={() => interactive && toggleMaterial(batch.id, mat.materialId)}
                    disabled={!interactive}
                    radius={24}
                    lineColor="#C8F23B"
                    className={`w-full text-left p-4 rounded-3xl border-2 transition flex items-center justify-between gap-4 ${
                      mat.isCollected ? 'border-lime bg-primary-dark/40' : 'border-white/5 hover:border-lime/30 bg-black/20'
                    } ${!interactive ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                          mat.isCollected ? 'bg-lime border-lime text-ink' : 'border-white/20 bg-black/30'
                        }`}
                      >
                        {mat.isCollected && <Check className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{recipeMat?.materialName || mat.materialId}</h4>
                        <p className="text-[11px] text-neutral-400">{recipeMat?.purpose}</p>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-sm font-bold text-lime">{mat.requiredKg} kg</span>
                      <p className="text-[10px] text-neutral-500">
                        {mat.isCollected ? 'Weighed by me' : 'Pending gather'}
                      </p>
                    </div>
                  </SpecularCard>
                );
              })}
            </div>

            <div className={ui.note}>
              <strong className="block mb-1">Safety alert:</strong>
              Do not use dog/cat feces, meat remnants, or heavy fryer oil. Use gloves while handling aged manure.
            </div>

            {renderNoteAndAction({
              disabled: !allMaterialsCollected(batch),
              hint: allMaterialsCollected(batch) ? '' : 'Tick every material as collected to continue.',
            })}
          </div>
        )}

        {/* CHOP & SHRED */}
        {panel === 'CHOP' && (
          <div className="space-y-5">
            <div className="pb-3 border-b border-white/5">
              <span className={ui.eyebrow}>Phase 2</span>
              <h3 className="text-lg font-bold text-white">Particle Size Reduction (Chop to 2-4 cm)</h3>
              <p className={ui.muted}>
                Shredding stalks and dry leaves increases surface area for faster microbial breakdown while keeping
                air channels open.
              </p>
            </div>
            <div className={`${ui.info} space-y-3`}>
              <span className="text-xs font-bold text-lime">Field checklist for Step 2</span>
              <ul className="space-y-2 text-xs text-neutral-300">
                {[
                  'Cut vegetable skins, banana peels and kitchen greens with a garden shear or chaff cutter.',
                  'Crush dry leaves and straw so particle size is uniform (prevents clumping).',
                  'Do NOT grind into fine dust (fine dust seals the air pores).',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-lime shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            {renderNoteAndAction()}
          </div>
        )}

        {/* LAYER & PILE */}
        {panel === 'LAYER' && (
          <div className="space-y-5">
            <div className="pb-3 border-b border-white/5">
              <span className={ui.eyebrow}>Phase 3 & 4</span>
              <h3 className="text-lg font-bold text-white">Layering Sequence & Aerobic Pile Assembly</h3>
              <p className={ui.muted}>
                Layer carbon base, moist kitchen greens, cow dung starter and mineral boosters evenly to feed the
                microbes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-300">Recommended layering order (bottom to top):</span>
                <div className="space-y-2 text-xs">
                  <div className={`p-3 ${ui.tileSolid} text-neutral-300`}>
                    <strong className="text-white">1. Base layer (3-4 inches):</strong> Coarse brown straw and twigs for
                    bottom air intake.
                  </div>
                  <div className="p-3 rounded-2xl bg-lime/10 border border-lime/25 text-neutral-200">
                    <strong className="text-lime">2. Nitrogen green layer (2 inches):</strong> Moist kitchen scraps and
                    vegetable waste.
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-neutral-200">
                    <strong className="text-amber-300">3. Inoculant layer:</strong> Aged cow dung slurry and a jaggery
                    starter.
                  </div>
                  <div className="p-3 rounded-2xl bg-teal/10 border border-teal/25 text-neutral-200">
                    <strong className="text-teal">4. Mineral & protection booster:</strong> Sprinkle neem cake, wood ash
                    and rock phosphate evenly.
                  </div>
                  <div className={`p-3 ${ui.tileSolid} text-neutral-300`}>
                    <strong className="text-white">5. Top cover:</strong> Thin layer of dry brown leaves to retain
                    moisture and deter fruit flies.
                  </div>
                </div>
              </div>

              <div className={`p-4 space-y-3 ${ui.tileSolid}`}>
                <span className="text-xs font-bold text-white">Pile parameters</span>
                <div className="space-y-2 text-xs">
                  {[
                    ['Pile construction', 'Aerobic windrow / bin', 'text-white'],
                    ['Starting weight', `${batch.recipe.targetQuantityKg} kg`, 'text-lime'],
                    ['Shade / protection', 'Covered under agro-net canopy', 'text-white'],
                    ['Probe temp (your entry)', `${tempInput}°C`, 'text-red-300'],
                  ].map(([k, v, cls]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-neutral-400">{k}:</span>
                      <span className={`font-bold ${cls}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {renderNoteAndAction()}
          </div>
        )}

        {/* MOISTURE / SENSORS */}
        {panel === 'SENSORS' && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className={ui.eyebrow}>Phase 5, 6 & 7</span>
                <h3 className="text-lg font-bold text-white">Moisture & Temperature Tracking</h3>
                <p className={ui.muted}>
                  Composting microbes work best at 45-60% moisture and self-heat to about 55°C–65°C.
                </p>
              </div>
              <button onClick={handleSimulateReading} disabled={isSimulating} className={ui.btnPrimary}>
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>Simulate IoT Probe Reading</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className={`p-5 space-y-3 ${ui.tileSolid}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <Droplet className="w-4 h-4" />
                    Moisture Squeeze Gauge
                  </span>
                  <span className="text-sm font-bold font-mono text-white">{moistInput}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={85}
                  step={1}
                  value={moistInput}
                  onChange={(e) => setMoistInput(Number(e.target.value))}
                  className="w-full accent-sky-400"
                  disabled={!panelIsCurrent}
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>20% Dry</span>
                  <span className="font-bold text-lime">45-60% Optimal</span>
                  <span>85% Soggy</span>
                </div>
                <div className={`p-3 text-xs border rounded-2xl ${toneClasses[moistureInfo.tone]}`}>
                  <p className="font-bold">Status: {moistureInfo.status}</p>
                  <p className="text-neutral-300 mt-0.5">{moistureInfo.action}</p>
                </div>
              </div>

              <div className={`p-5 space-y-3 ${ui.tileSolid}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4" />
                    Internal Pile Temperature
                  </span>
                  <span className="text-sm font-bold font-mono text-red-300">{tempInput}°C</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={75}
                  step={0.5}
                  value={tempInput}
                  onChange={(e) => setTempInput(Number(e.target.value))}
                  className="w-full accent-red-400"
                  disabled={!panelIsCurrent}
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>25°C Ambient</span>
                  <span className="font-bold text-lime">55°C+ Hot phase</span>
                  <span>75°C Too hot</span>
                </div>
                <div className="p-3 bg-black/30 rounded-2xl border border-white/5 text-xs">
                  <p className="font-bold text-white">{getTemperatureMessage(tempInput)}</p>
                </div>
              </div>
            </div>

            {/* Log + turning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className={`p-4 space-y-2 ${ui.tileSolid}`}>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <RotateCw className="w-4 h-4 text-lime" />
                  Aeration & Turning
                </span>
                <p className="text-xs text-neutral-400">
                  Turning brings fresh oxygen into the core and moves outer material into the hot centre.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button onClick={handleRecordTurn} disabled={!panelIsCurrent} className={ui.btnSecondary}>
                    + Record Turn Completed Today
                  </button>
                  <span className="text-[11px] text-neutral-400">Turns logged: {turns}</span>
                </div>
              </div>

              <div className={`p-4 space-y-2 ${ui.tileSolid}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Reading log</span>
                  <button onClick={handleLogManual} disabled={!panelIsCurrent} className={ui.btnSecondary}>
                    Save my reading
                  </button>
                </div>
                {batch.readings.length === 0 ? (
                  <p className="text-xs text-neutral-500">No readings yet. Save yours, or simulate a probe reading.</p>
                ) : (
                  <>
                    <Sparkline values={batch.readings.map((r) => r.tempC)} color="#C8F23B" />
                    <ul className="text-[11px] text-neutral-300 space-y-1 max-h-24 overflow-y-auto">
                      {[...batch.readings].reverse().slice(0, 5).map((r) => (
                        <li key={r.id} className="flex items-center justify-between gap-2">
                          <span className="font-mono">
                            {new Date(r.at).toLocaleDateString()} · {r.tempC}°C · {r.moisturePercent}%
                          </span>
                          <ProvenanceBadge type={r.source === 'Simulated' ? 'Simulated' : 'User-provided'} size="sm" />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            {renderNoteAndAction()}
          </div>
        )}

        {/* MATURATION / TESTING / VALIDATION / READY */}
        {panel === 'MATURE' && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-white/5">
              <span className={ui.eyebrow}>Phase 8, 9 & 10</span>
              <h3 className="text-lg font-bold text-white">Maturation, Test Values & Plant Growth Trial</h3>
              <p className={ui.muted}>
                Cure the pile, optionally record NPK and pH values from a kit or a lab report, and compare plant growth
                against an unfertilised control.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className={`p-5 space-y-3 flex flex-col justify-between ${ui.tileSolid}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-lime" />
                      Test values (NPK & pH)
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        batch.testRecord?.qualityStatus === 'GREEN'
                          ? toneClasses.lime
                          : batch.testRecord?.qualityStatus === 'RED'
                          ? toneClasses.red
                          : toneClasses.amber
                      }`}
                    >
                      {batch.testRecord ? batch.testRecord.qualityStatus : 'PENDING'}
                    </span>
                  </div>

                  {batch.testRecord ? (
                    <div className="space-y-1.5 text-xs">
                      <p className="font-mono text-lime font-bold">
                        N {batch.testRecord.nitrogenPercent}% | P {batch.testRecord.phosphorusPercent}% | K{' '}
                        {batch.testRecord.potassiumPercent}%
                      </p>
                      <p className="text-neutral-300 text-[11px]">
                        pH <strong className="text-white">{batch.testRecord.ph}</strong> | Organic carbon{' '}
                        <strong className="text-white">{batch.testRecord.organicCarbonPercent}%</strong>
                      </p>
                      <div className="flex items-center gap-2">
                        <ProvenanceBadge type={batch.testRecord.testMethod} size="sm" />
                        {batch.testRecord.reportNumber && (
                          <span className="text-[10px] text-neutral-500 font-mono">
                            Report no. {batch.testRecord.reportNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-300">
                      Optional. Record values from a portable kit or a lab report you hold. Without a record this batch
                      shows "Evidence not provided".
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onOpenTestModal(batch)}
                  disabled={getStepIndex(batch.status) < getStepIndex('MATURATION')}
                  className={`${ui.btnPrimary} w-full`}
                >
                  <FlaskConical className="w-4 h-4" />
                  <span>{batch.testRecord ? 'Edit Test Record' : 'Record Test Values'}</span>
                </button>
                {getStepIndex(batch.status) < getStepIndex('MATURATION') && (
                  <p className="text-[10px] text-neutral-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Unlocks when the batch reaches maturation.
                  </p>
                )}
              </div>

              <div className={`p-5 space-y-3 flex flex-col justify-between ${ui.tileSolid}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sprout className="w-4 h-4 text-teal" />
                      Plant Growth Trial
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${toneClasses.teal}`}>
                      {batch.growthTrial ? 'TRIAL RECORDED' : 'OPTIONAL'}
                    </span>
                  </div>

                  {batch.growthTrial ? (
                    <div className="space-y-1.5 text-xs">
                      <p className="font-bold text-teal">
                        +{batch.growthTrial.heightAdvantagePct}% height vs control (sample)
                      </p>
                      <p className="text-neutral-300 text-[11px] line-clamp-2">{batch.growthTrial.summaryConclusion}</p>
                      <ProvenanceBadge type={batch.growthTrial.dataSource} size="sm" />
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-300">
                      Run a side-by-side comparison (control vs KrishiCycle vs commercial fertilizer) over 14 days.
                      This prototype shows a simulated sample trial.
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onOpenGrowthTrial(batch)}
                  disabled={getStepIndex(batch.status) < getStepIndex('MATURATION')}
                  className={`${ui.btnSecondary} w-full !bg-teal/10 !border-teal/40 !text-teal hover:!bg-teal/20`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>{batch.growthTrial ? 'View Comparative Growth Charts' : 'Start Growth Trial'}</span>
                </button>
              </div>
            </div>

            <div className={`${ui.banner} p-5 flex flex-col sm:flex-row items-center justify-between gap-4`}>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber" />
                  <span>{batch.status === 'READY' ? 'Batch is READY' : 'Ready to finish this batch?'}</span>
                </h4>
                <p className="text-xs text-neutral-300 mt-0.5">
                  {batch.status === 'READY'
                    ? 'READY only means the steps are complete. Quality is not verified by KrishiCycle.'
                    : 'Mark READY when the pile has cooled, smells earthy and looks dark and crumbly. READY does not mean tested.'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => onOpenPassport(batch)} className={ui.btnSecondary}>
                  View Batch Passport
                </button>
                {batch.status !== 'READY' && panelIsCurrent && action && (
                  <button onClick={handleAdvance} className={ui.btnAmber}>
                    {action.label}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
