import React, { useState } from 'react';
import { X, FlaskConical, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { Batch, BatchTest, BatchTestMethod } from '../../types';
import { evaluateQualityStatus, getSupplementationAdvice } from '../../services/batchService';
import { ProvenanceBadge } from '../ProvenanceBadge';
import { ui } from './styles';

interface Props {
  batch: Batch;
  onClose: () => void;
  onSave: (test: BatchTest) => void;
}

const statusTone: Record<string, string> = {
  GREEN: 'bg-lime/10 border-lime/40 text-lime',
  BLUE: 'bg-teal/10 border-teal/40 text-teal',
  YELLOW: 'bg-amber-500/10 border-amber-500/40 text-amber-200',
  RED: 'bg-red-500/10 border-red-500/40 text-red-300',
  GREY: 'bg-white/5 border-white/10 text-neutral-300',
};

export const BatchTestingModal: React.FC<Props> = ({ batch, onClose, onSave }) => {
  const existing = batch.testRecord;

  const [testMethod, setTestMethod] = useState<BatchTestMethod>(existing?.testMethod || 'Kit-measured by me');
  const [nitrogen, setNitrogen] = useState<number>(existing?.nitrogenPercent ?? 2.0);
  const [phosphorus, setPhosphorus] = useState<number>(existing?.phosphorusPercent ?? 1.2);
  const [potassium, setPotassium] = useState<number>(existing?.potassiumPercent ?? 2.0);
  const [ph, setPh] = useState<number>(existing?.ph ?? 6.8);
  const [organicCarbon, setOrganicCarbon] = useState<number>(existing?.organicCarbonPercent ?? 18);
  const [moisture, setMoisture] = useState<number>(existing?.moisturePercent ?? 22);
  const [cnRatio, setCnRatio] = useState<number>(existing?.cnRatio ?? 15);
  const [heavyMetalsOk, setHeavyMetalsOk] = useState<boolean>(existing?.heavyMetalsDeclaredOk ?? false);
  const [weedSeedsViable, setWeedSeedsViable] = useState<boolean>(existing?.weedSeedsViable ?? false);
  const [reportNo, setReportNo] = useState<string>(existing?.reportNumber || '');
  const [testedBy, setTestedBy] = useState<string>(existing?.testedBy || '');
  const [error, setError] = useState('');

  const quality = evaluateQualityStatus({
    testMethod,
    nitrogen,
    phosphorus,
    potassium,
    ph,
    heavyMetalsDeclaredOk: heavyMetalsOk,
    weedSeedsViable,
  });
  const advice = getSupplementationAdvice(nitrogen, phosphorus, potassium, ph);

  const num = (set: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => set(Number(e.target.value));

  const handleSave = () => {
    const values = [nitrogen, phosphorus, potassium, ph, organicCarbon, moisture, cnRatio];
    if (values.some((v) => !Number.isFinite(v) || v < 0)) {
      setError('Enter valid, non-negative numbers for every value.');
      return;
    }
    if (ph < 3 || ph > 11) {
      setError('pH must be between 3 and 11.');
      return;
    }
    onSave({
      id: existing?.id || `test_${Date.now()}`,
      batchId: batch.id,
      testedAt: new Date().toISOString().split('T')[0],
      testMethod,
      nitrogenPercent: nitrogen,
      phosphorusPercent: phosphorus,
      potassiumPercent: potassium,
      ph,
      organicCarbonPercent: organicCarbon,
      moisturePercent: moisture,
      cnRatio,
      heavyMetalsDeclaredOk: heavyMetalsOk,
      weedSeedsViable,
      qualityStatus: quality.status,
      reportNumber: reportNo.trim() || undefined,
      testedBy: testedBy.trim() || undefined,
      supplementationSuggested: advice,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-surface-darkcard rounded-4xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-surface-darkborder space-y-6 my-8 text-white">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-lime/10 border border-lime/30 text-lime">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Record Test Values (NPK & pH)</h2>
              <p className="text-xs text-neutral-400">
                Batch <strong className="text-lime font-mono">{batch.batchCode}</strong> ({batch.cropName})
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={ui.note}>
          <strong className="block mb-0.5">Demo values are prefilled. Replace them with your own readings.</strong>
          KrishiCycle does not test or certify anything. This record only stores what you enter, labelled with its source.
        </div>

        <div className={`p-4 rounded-3xl border flex items-center justify-between gap-3 ${statusTone[quality.status]}`}>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 shrink-0" />
            <div>
              <span className="font-bold text-xs">Self-check status: {quality.status}</span>
              <p className="text-[11px] text-neutral-300">{quality.reason}</p>
            </div>
          </div>
          <ProvenanceBadge type={testMethod} size="sm" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5 sm:col-span-2">
            <label className={ui.label}>Where do these values come from?</label>
            <select value={testMethod} onChange={(e) => setTestMethod(e.target.value as BatchTestMethod)} className={ui.input}>
              <option value="Kit-measured by me">Kit-measured by me (portable kit / colorimeter)</option>
              <option value="Lab report uploaded">Lab report (I hold the report)</option>
              <option value="Estimated">Estimated from the raw material mix</option>
            </select>
          </div>

          {[
            { label: 'Total Nitrogen (N %)', v: nitrogen, set: setNitrogen, step: 0.1, cls: 'text-lime' },
            { label: 'Total Phosphorus (P₂O₅ %)', v: phosphorus, set: setPhosphorus, step: 0.1, cls: 'text-teal' },
            { label: 'Total Potassium (K₂O %)', v: potassium, set: setPotassium, step: 0.1, cls: 'text-amber' },
            { label: 'pH Value (1:5 dilution)', v: ph, set: setPh, step: 0.1, cls: 'text-white' },
            { label: 'Organic Carbon (OC %)', v: organicCarbon, set: setOrganicCarbon, step: 0.5, cls: 'text-white' },
            { label: 'Finished C:N Ratio', v: cnRatio, set: setCnRatio, step: 0.5, cls: 'text-white' },
            { label: 'Moisture (%)', v: moisture, set: setMoisture, step: 0.5, cls: 'text-white' },
          ].map((f) => (
            <div key={f.label} className="space-y-1.5">
              <label className={ui.label}>{f.label}</label>
              <input type="number" step={f.step} min={0} value={f.v} onChange={num(f.set)} className={`${ui.input} font-mono ${f.cls}`} />
            </div>
          ))}

          <div className="space-y-2.5 sm:col-span-2 pt-3 border-t border-white/5">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={heavyMetalsOk} onChange={(e) => setHeavyMetalsOk(e.target.checked)} className="w-4 h-4 mt-0.5 accent-lime" />
              <span className="text-xs font-semibold text-neutral-300">
                I hold a report showing heavy metals within permissible limits (declared by me, not verified).
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={weedSeedsViable} onChange={(e) => setWeedSeedsViable(e.target.checked)} className="w-4 h-4 mt-0.5 accent-red-400" />
              <span className="text-xs font-semibold text-neutral-300">
                I saw viable weed seeds sprouting (tick if the heat phase did not kill them).
              </span>
            </label>
          </div>

          <div className="space-y-1.5">
            <label className={ui.label}>Report number (optional)</label>
            <input type="text" value={reportNo} onChange={(e) => setReportNo(e.target.value)} placeholder="As printed on your report" className={`${ui.input} font-mono`} />
          </div>
          <div className="space-y-1.5">
            <label className={ui.label}>Kit / lab name (optional)</label>
            <input type="text" value={testedBy} onChange={(e) => setTestedBy(e.target.value)} placeholder="e.g. my NPK kit" className={ui.input} />
          </div>
        </div>

        <div className={`p-4 space-y-1.5 text-xs ${ui.tileSolid}`}>
          <span className="font-bold text-white flex items-center gap-1.5">
            <Info className="w-4 h-4 text-lime" />
            Supplementation note
          </span>
          <p className="text-neutral-300 leading-relaxed">{advice}</p>
        </div>

        {error && <div className="rounded-2xl border border-red-500/40 bg-red-500/10 text-red-300 text-xs p-3">{error}</div>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={onClose} className={ui.btnSecondary}>Cancel</button>
          <button onClick={handleSave} className={ui.btnPrimary}>
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Test Record</span>
          </button>
        </div>
      </div>
    </div>
  );
};
