import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sprout, 
  FlaskConical, 
  ShoppingBag, 
  Activity, 
  MapPin, 
  ArrowRight, 
  Calendar, 
  CloudSun, 
  Droplet, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFarmStore } from '../store/farmStore';
import { useCropStore } from '../store/cropStore';
import { useBatchStore } from '../store/batchStore';
import { getBatchEvidenceStatus, getNextStep, getStepMeta } from '../services/batchService';
import { useOrderStore } from '../store/orderStore';
import { useUIStore } from '../store/uiStore';
import { useT } from '../i18n/useT';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ScoreRing } from '../components/ScoreRing';
import { CountUpNumber } from '../components/CountUpNumber';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { detectSeason } from '../services/weatherService';
import { SpecularCard } from '../components/SpecularCard';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { fields, weatherData } = useFarmStore();
  const { rankedResults, selectedCropId, cropTasks, toggleTask } = useCropStore();
  const { batches, activeBatchId } = useBatchStore();
  const { orders } = useOrderStore();
  const { openDemoTour, showToast } = useUIStore();
  const { t, language } = useT();
  const navigate = useNavigate();

  const season = detectSeason();
  const activeBatch = batches.find((b) => b.id === activeBatchId) || batches[0];
  const primaryField = fields[0];
  const topCrop = rankedResults[0]?.crop;
  const topScore = rankedResults[0]?.totalScore ?? 88;

  // Active orders preview
  const activeOrders = orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');

  // Greeting
  const getGreeting = () => {
    const name = user?.name || 'Farmer';
    if (language === 'mr') return `नमस्कार, ${name}!`;
    if (language === 'hi') return `नमस्ते, ${name}!`;
    return `Welcome back, ${name}!`;
  };

  const handleTaskToggle = (taskId: string) => {
    toggleTask(taskId);
    showToast('Task updated in your farm timeline!', 'success');
  };

  return (
    <div className="min-h-screen bg-surface-dark py-6 md:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 w-full overflow-x-hidden">
      {/* 1. TOP HEADER & GREETING */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-surface-darkborder/80">
        <div className="space-y-2 sm:space-y-2.5 max-w-2xl lg:max-w-3xl">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] sm:text-xs font-mono text-lime font-bold tracking-wider uppercase">
              Farmer Operational Hub
            </span>
            <ProvenanceBadge type="User-provided" size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-display font-black text-white tracking-tight leading-[1.15]">
            {getGreeting()}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed">
            {user?.district || 'Pune'} District · {primaryField?.name || 'North Tomato Plot'} ({primaryField?.areaAcres || 2.5} Acres) · {primaryField?.soilType || 'Medium black cotton soil (Regur)'}
          </p>
        </div>

        {/* Live Weather, Season & Pitch Demo Tour Chips */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 lg:shrink-0">
          {/* Season Chip */}
          <div className="liquid-glass px-3.5 py-2 rounded-full border border-lime/30 flex items-center gap-2 text-xs font-semibold text-lime shadow-glow-lime shrink-0">
            <Calendar className="w-4 h-4 text-lime shrink-0" />
            <span>Season: {season}</span>
            <ProvenanceBadge type="Estimated" size="sm" />
          </div>

          {/* Weather Chip */}
          <div className="liquid-glass px-3.5 py-2 rounded-full border border-emerald-500/30 flex items-center gap-2 text-xs font-semibold text-emerald-200 shrink-0">
            <CloudSun className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{weatherData.temperature}°C, {weatherData.condition}</span>
            <ProvenanceBadge type={weatherData.isLive ? 'Live (Open-Meteo)' : 'Demo data'} size="sm" />
          </div>

          {/* Pitch Demo Tour */}
          <button
            onClick={openDemoTour}
            className="px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/25 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Pitch Demo Tour</span>
          </button>
        </div>
      </div>

      {/* 2. BENTO GRID SECTION: Quick Actions, Active Batch, Recommendation, Impact (Per Reference Image 1 & 2) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* BANNER / HERO CARD: Convert Organic Waste into Bio-Fertilizer (Image 1 Style) */}
        <SpecularCard
          radius={32}
          lineColor="#C8F23B"
          intensity={1}
          className="md:col-span-8 p-6 sm:p-8 rounded-4xl bg-gradient-to-br from-surface-card via-primary-dark/40 to-surface-dark border border-lime/20 shadow-2xl relative overflow-hidden flex flex-col justify-between"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-[11px] font-mono font-bold text-lime mb-3">
              <Sparkles className="w-3.5 h-3.5 text-lime" />
              <span>Circular Bio-Economy · Zero Stubble Burning</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-white leading-tight max-w-xl">
              Convert Organic Residue into{' '}
              <span className="text-lime">Crop-Specific Bio-Fertilizer</span>
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 mt-3 max-w-lg leading-relaxed">
              Deterministic NPK recipe formulation, thermophilic windrow logs, and transparent local marketplace listings.
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to="/crops"
                className="px-5 py-2.5 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime transition-all flex items-center gap-1.5"
              >
                <span>Recommend a Crop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/make"
                className="px-5 py-2.5 rounded-full liquid-glass border border-white/20 text-white font-semibold text-xs hover:bg-white/10 transition-all"
              >
                Formulate Bio-Fertilizer
              </Link>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-lime animate-ping" />
              <span>cropScoring v1.0 active</span>
            </div>
          </div>
        </SpecularCard>

        {/* LIVE SYSTEM OVERVIEW (Image 1 Right Widget) */}
        <SpecularCard
          radius={32}
          lineColor="#C8F23B"
          intensity={0.9}
          className="md:col-span-4 p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-xs font-mono font-bold text-lime uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Live System Overview</span>
              </h3>
              <ProvenanceBadge type="Estimated" size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5">
                <div className="text-[11px] text-neutral-400">Active Piles</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">2</div>
                <div className="text-[10px] text-emerald-400 font-medium">In thermophilic stage</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5">
                <div className="text-[11px] text-neutral-400">Market Stock</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">350 kg</div>
                <div className="text-[10px] text-lime font-medium">Ready for dispatch</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5">
                <div className="text-[11px] text-neutral-400">Core Temp Avg</div>
                <div className="text-2xl font-bold font-mono text-amber-300 mt-1">62.4°C</div>
                <div className="text-[10px] text-amber-400/80 font-medium">Weed seeds sanitized</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5">
                <div className="text-[11px] text-neutral-400">CO₂ Avoided</div>
                <div className="text-2xl font-bold font-mono text-teal mt-1">840 kg</div>
                <div className="text-[10px] text-teal/80 font-medium">Zero burn credit</div>
              </div>
            </div>
          </div>

          <Link
            to="/farm"
            className="w-full py-2.5 rounded-full liquid-glass border border-white/10 hover:border-lime/40 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all"
          >
            <span>View Farm Land Context</span>
            <ArrowRight className="w-3.5 h-3.5 text-lime" />
          </Link>
        </SpecularCard>
      </div>

      {/* 3. FOUR ACTION CARDS ROW (Image 1 Bottom Row Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Module 1 Quick Card */}
        <SpecularCard
          radius={24}
          lineColor="#C8F23B"
          className="p-5 rounded-3xl bg-surface-card border border-surface-darkborder hover:border-lime/40 transition-all flex flex-col justify-between shadow-md group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-primary/60 border border-lime/30 text-lime flex items-center justify-center mb-3">
              <Sprout className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
              Crop Engine
            </div>
            <h4 className="text-base font-bold text-white mt-0.5 mb-1.5">
              Crop Recommendation
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              Top Pick: <span className="text-lime font-bold">{topCrop?.nameEn || 'Tomato'}</span> ({topScore}% Match).
            </p>
          </div>
          <Link
            to="/crops"
            className="text-xs font-bold text-lime flex items-center gap-1 group-hover:translate-x-1 transition-transform"
          >
            <span>View Suitability Ranks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </SpecularCard>

        {/* Module 2 Quick Card */}
        <SpecularCard
          radius={24}
          lineColor="#a855f7"
          className="p-5 rounded-3xl bg-surface-card border border-surface-darkborder hover:border-purple-400/40 transition-all flex flex-col justify-between shadow-md group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-purple-950/60 border border-purple-400/30 text-purple-300 flex items-center justify-center mb-3">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
              Bio-Production
            </div>
            <h4 className="text-base font-bold text-white mt-0.5 mb-1.5">
              Make Bio-Fertilizer
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              Active: {activeBatch?.batchCode} ({activeBatch?.progressPercent}% Complete).
            </p>
          </div>
          <Link
            to="/make"
            className="text-xs font-bold text-purple-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
          >
            <span>Open Recipe Wizard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </SpecularCard>

        {/* Module 3 Quick Card */}
        <SpecularCard
          radius={24}
          lineColor="#14b8a6"
          className="p-5 rounded-3xl bg-surface-card border border-surface-darkborder hover:border-teal/40 transition-all flex flex-col justify-between shadow-md group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-teal-950/60 border border-teal/30 text-teal flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
              Marketplace
            </div>
            <h4 className="text-base font-bold text-white mt-0.5 mb-1.5">
              Buy Inputs & Sell
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              {activeOrders.length > 0 ? `${activeOrders.length} active order in transit` : 'Explore peer-to-peer farm trade'}.
            </p>
          </div>
          <Link
            to="/market"
            className="text-xs font-bold text-teal flex items-center gap-1 group-hover:translate-x-1 transition-transform"
          >
            <span>Explore Tested Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </SpecularCard>

        {/* Module 4 Quick Card */}
        <SpecularCard
          radius={24}
          lineColor="#f59e0b"
          className="p-5 rounded-3xl bg-surface-card border border-surface-darkborder hover:border-amber-400/40 transition-all flex flex-col justify-between shadow-md group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-950/60 border border-amber-400/30 text-amber-300 flex items-center justify-center mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
              Crop Protection
            </div>
            <h4 className="text-base font-bold text-white mt-0.5 mb-1.5">
              Leaf Diagnostic Scanner
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              AI leaf photo inspection with organic remedy guidance.
            </p>
          </div>
          <Link
            to="/health"
            className="text-xs font-bold text-amber-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
          >
            <span>Scan Foliage Symptoms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </SpecularCard>
      </div>

      {/* 4. ACTIVE BATCH TRACKER & SOW-TO-HARVEST TIMELINE (Image 2 Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Batch Card */}
        {activeBatch && (
          <SpecularCard
            radius={32}
            lineColor="#C8F23B"
            className="lg:col-span-6 p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl"
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[10px] font-mono text-lime font-bold uppercase tracking-wider">
                  Active Decomposition Batch
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>{activeBatch.cropName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-dark border border-white/10 text-neutral-300">
                    {activeBatch.batchCode}
                  </span>
                </h3>
              </div>
              <ProvenanceBadge type="Simulated" size="sm" />
            </div>

            {/* Progress Bar & Ring */}
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-surface-dark border border-white/5 mb-4">
              <ScoreRing score={activeBatch.progressPercent} size={64} />
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs font-medium text-neutral-300 mb-1">
                  <span>Decomposition Progress</span>
                  <span className="text-lime font-bold">{activeBatch.progressPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-lime rounded-full transition-all duration-500"
                    style={{ width: `${activeBatch.progressPercent}%` }}
                  />
                </div>
                <div className="text-[10px] text-neutral-400 mt-1.5 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-lime" />
                  <span>
                    {getNextStep(activeBatch.status)
                      ? `Next Step: ${getStepMeta(getNextStep(activeBatch.status)!).title.replace(/^\d+\.\s*/, '')} (Day ~${getStepMeta(getNextStep(activeBatch.status)!).dayTarget})`
                      : 'Batch is READY'}
                  </span>
                </div>
              </div>
            </div>

            {/* Readings Sparkline & Evidence Status */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
              <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5">
                <span className="text-[10px] text-neutral-400 block">Core Temp</span>
                <span className="text-base font-bold font-mono text-amber-300">
                  {activeBatch.latestReadings ? `${activeBatch.latestReadings.temperatureC}°C` : '-'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5">
                <span className="text-[10px] text-neutral-400 block">Moisture</span>
                <span className="text-base font-bold font-mono text-teal">
                  {activeBatch.latestReadings ? `${activeBatch.latestReadings.moisturePercent}%` : '-'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5">
                <span className="text-[10px] text-neutral-400 block">Evidence</span>
                <span className="text-[10px] font-bold text-rose-300 block truncate">
                  {getBatchEvidenceStatus(activeBatch)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-xs text-neutral-400">
                Started {activeBatch.createdAt.split('T')[0]} · Target {activeBatch.recipe.targetQuantityKg} kg
              </span>
              <Link
                to="/batches"
                className="px-4 py-1.5 rounded-full bg-lime text-ink text-xs font-bold hover:bg-lime-hover shadow-glow-lime transition-all"
              >
                Open Batch Tracker →
              </Link>
            </div>
          </SpecularCard>
        )}

        {/* Sow-to-Harvest Tasks Timeline */}
        <SpecularCard
          radius={32}
          lineColor="#10b981"
          className="lg:col-span-6 p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Field Operations
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Upcoming Crop Cycle Tasks
                </h3>
              </div>
              <Link
                to="/crops"
                className="text-xs text-lime hover:underline font-semibold"
              >
                View Full Cycle →
              </Link>
            </div>

            {/* Task list with check animation */}
            <div className="space-y-2.5">
              {cropTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskToggle(task.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-surface-dark/50 border-emerald-900/40 text-neutral-400 line-through'
                      : 'bg-surface-dark border-white/5 hover:border-lime/40 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        task.completed
                          ? 'bg-lime border-lime text-ink'
                          : 'border-neutral-600 hover:border-lime'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4 text-ink" />}
                    </button>
                    <div>
                      <div className="text-xs font-semibold leading-tight">{task.title}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-2">
                        <span>Due: {task.dueDate || task.scheduledDate}</span>
                        <span>•</span>
                        <span className="capitalize text-emerald-300">{(task.stage || task.cropStage || '').replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 shrink-0">
                    {task.completed ? 'Done' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Tasks update automatically after weekly check-ins</span>
            <Link to="/crops" className="text-lime font-bold">
              Weekly Check-in →
            </Link>
          </div>
        </SpecularCard>
      </div>
    </div>
  );
};
