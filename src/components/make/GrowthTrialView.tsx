import React, { useState } from 'react';
import { Sprout, Award, CheckCircle2, Info, ShieldCheck } from 'lucide-react';
import { Batch, GrowthTrial } from '../../types';
import { buildDemoTrial } from '../../services/batchService';
import { ProvenanceBadge } from '../ProvenanceBadge';
import { ui } from './styles';

interface Props {
  batch: Batch;
  onSave: (trial: GrowthTrial) => void;
  onBack: () => void;
}

export const GrowthTrialView: React.FC<Props> = ({ batch, onSave, onBack }) => {
  const [trial] = useState<GrowthTrial>(batch.growthTrial || buildDemoTrial(batch));
  const [selectedDay, setSelectedDay] = useState<number>(trial.observations[trial.observations.length - 1]?.day ?? 14);
  const [saved, setSaved] = useState(!!batch.growthTrial);

  const obs = trial.observations.find((o) => o.day === selectedDay) || trial.observations[trial.observations.length - 1];
  const lastObs = trial.observations[trial.observations.length - 1];

  const arms = [
    {
      key: 'control',
      title: 'Arm 1: Control',
      badge: 'No fertilizer',
      height: obs.controlHeightCm,
      leaves: obs.controlLeafCount,
      germ: obs.controlGerminationPct,
      bar: 'bg-neutral-600',
      winner: false,
    },
    {
      key: 'kc',
      title: 'Arm 2: KrishiCycle',
      badge: 'Your bio-compost',
      height: obs.krishiCycleHeightCm,
      leaves: obs.krishiCycleLeafCount,
      germ: obs.krishiCycleGerminationPct,
      bar: 'bg-gradient-to-t from-primary to-lime',
      winner: true,
    },
    {
      key: 'cmp',
      title: 'Arm 3: Commercial',
      badge: 'Standard chemical NPK',
      height: obs.comparisonHeightCm,
      leaves: obs.comparisonLeafCount,
      germ: obs.comparisonGerminationPct,
      bar: 'bg-neutral-500',
      winner: false,
    },
  ];

  const handleSave = () => {
    onSave(trial);
    setSaved(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 text-white">
      <div className={`${ui.card} space-y-6`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-teal/10 border border-teal/30 text-teal font-bold text-xs">
                Growth Trial
              </span>
              <span className="text-xs text-neutral-400 font-mono">Batch: {batch.batchCode}</span>
              <ProvenanceBadge type={trial.dataSource} size="sm" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white mt-1.5 tracking-tight">
              Plant Growth Comparison Trial
            </h2>
            <p className="text-xs text-neutral-300 mt-1">
              3-arm comparison: <strong className="text-white">Control (no fertilizer)</strong> vs{' '}
              <strong className="text-lime">KrishiCycle bio-compost</strong> vs{' '}
              <strong className="text-white">Commercial fertilizer</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button onClick={onBack} className={ui.btnSecondary}>Back to Batch</button>
            <button onClick={handleSave} disabled={saved} className={ui.btnPrimary}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{saved ? 'Trial Record Saved' : 'Save Trial Record'}</span>
            </button>
          </div>
        </div>

        <div className={ui.note}>
          <strong className="block mb-0.5">Simulated sample, not a real experiment.</strong>
          These numbers are illustrative demo data so you can see how a trial comparison looks. They are not a yield
          claim and should not be shown to buyers as proof.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className={`p-5 flex items-center justify-between ${ui.tileSolid} !border-lime/30`}>
            <div>
              <p className="text-xs font-semibold text-lime">Height advantage</p>
              <h3 className="text-3xl font-black text-white mt-1">+{trial.heightAdvantagePct}%</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">vs control, last observation</p>
            </div>
            <Award className="w-8 h-8 text-lime" />
          </div>
          <div className={`p-5 flex items-center justify-between ${ui.tileSolid} !border-teal/30`}>
            <div>
              <p className="text-xs font-semibold text-teal">Leaf count</p>
              <h3 className="text-3xl font-black text-white mt-1">+{trial.leafCountAdvantagePct}%</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">vs control, last observation</p>
            </div>
            <Sprout className="w-8 h-8 text-teal" />
          </div>
          <div className={`p-5 flex items-center justify-between ${ui.tileSolid} !border-amber/30`}>
            <div>
              <p className="text-xs font-semibold text-amber">Germination</p>
              <h3 className="text-3xl font-black text-white mt-1">{lastObs?.krishiCycleGerminationPct ?? 0}%</h3>
              <p className="text-[10px] text-neutral-400 mt-0.5">KrishiCycle arm, last check</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-amber" />
          </div>
        </div>
      </div>

      <div className={`${ui.card} space-y-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-lg font-bold text-white">Day-by-Day Growth Progression</h3>
            <p className={ui.muted}>Select a checkpoint to compare the three arms side by side.</p>
          </div>
          <div className="flex items-center gap-1.5 bg-black/30 p-1.5 rounded-full border border-white/10">
            {trial.observations.map((o) => (
              <button
                key={o.day}
                onClick={() => setSelectedDay(o.day)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  selectedDay === o.day ? 'bg-lime text-ink' : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Day {o.day}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {arms.map((arm) => (
            <div
              key={arm.key}
              className={`p-5 rounded-3xl space-y-4 relative ${
                arm.winner ? 'border-2 border-lime/60 bg-primary-dark/20 shadow-xl' : 'border border-white/5 bg-black/20'
              }`}
            >
              {arm.winner && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-lime text-ink text-[10px] font-black rounded-full tracking-wider uppercase">
                  ★ KrishiCycle batch
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className={`text-xs font-bold uppercase ${arm.winner ? 'text-lime' : 'text-neutral-400'}`}>{arm.title}</span>
                <span className={ui.chip}>{arm.badge}</span>
              </div>

              <div className="h-44 bg-black/30 rounded-2xl flex items-end justify-center p-3 overflow-hidden border border-white/5">
                <div
                  className={`w-16 rounded-t-xl transition-all duration-500 flex items-center justify-center text-xs font-bold font-mono pb-2 ${arm.bar} ${arm.winner ? 'text-ink' : 'text-white'}`}
                  style={{ height: `${Math.min(100, (arm.height / 20) * 100)}%` }}
                >
                  {arm.height}cm
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  ['Plant height', `${arm.height} cm`],
                  ['Leaf count', `${arm.leaves} leaves`],
                  ['Germination', `${arm.germ}%`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-neutral-400">{k}:</span>
                    <span className={`font-bold font-mono ${arm.winner ? 'text-lime' : 'text-white'}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`p-5 text-xs space-y-2 ${ui.tileSolid}`}>
          <div className="flex items-center gap-2 font-bold text-white">
            <Info className="w-4 h-4 text-teal" />
            <span>Trial summary</span>
          </div>
          <p className="text-neutral-300 leading-relaxed">{trial.summaryConclusion}</p>
        </div>
      </div>
    </div>
  );
};
