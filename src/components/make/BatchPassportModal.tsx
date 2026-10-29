import React, { useEffect, useRef } from 'react';
import { X, ShieldCheck, Layers, Printer, FileCheck } from 'lucide-react';
import { Batch } from '../../types';
import { getBatchEvidenceStatus } from '../../services/batchService';
import { ProvenanceBadge } from '../ProvenanceBadge';
import { BrandLogo } from '../BrandLogo';
import { ui } from './styles';

interface Props {
  batch: Batch;
  onClose: () => void;
}

export const BatchPassportModal: React.FC<Props> = ({ batch, onClose }) => {
  const test = batch.testRecord;
  const evidence = getBatchEvidenceStatus(batch);
  const modalRef = useRef<HTMLDivElement>(null);

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent background scrolling while modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Close when clicking directly on the backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden bg-[#05110B]/80 backdrop-blur-xl animate-modal-backdrop select-none sm:select-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="passport-modal-title"
    >
      {/* Modal Container: Max width 880-920px, height constrained to viewport, flex column for fixed header & scrolling body */}
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[920px] max-h-[90vh] sm:max-h-[88vh] flex flex-col rounded-3xl sm:rounded-4xl bg-[#0D1B14]/95 border border-emerald-500/20 shadow-2xl backdrop-blur-2xl text-white animate-modal-card overflow-hidden print:p-0 print:border-none print:shadow-none print:max-h-none print:bg-white print:text-black"
      >
        {/* ============================================================ */}
        {/* FIXED / STICKY HEADER                                         */}
        {/* ============================================================ */}
        <div className="shrink-0 px-5 sm:px-7 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between gap-3 bg-[#0D1B14]/90 backdrop-blur-md z-10 print:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime font-bold text-xs shrink-0">
              Batch Passport
            </span>
            <span className="text-xs text-neutral-300 font-mono truncate">
              ID: <strong className="text-white">{batch.batchCode}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-neutral-200 hover:text-white hover:bg-white/5 hover:border-lime/40 transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-lime" />
              <span>Print Bag Label</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Batch Passport"
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SEPARATELY SCROLLABLE BODY (Mouse-wheel, trackpad & touch)    */}
        {/* ============================================================ */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-7 py-5 sm:py-6 space-y-5 sm:space-y-6">
          
          {/* Main Passport Framing Card */}
          <div className="p-5 sm:p-6 rounded-3xl border border-lime/20 bg-surface-dark/70 space-y-5 sm:space-y-6 shadow-inner">
            
            {/* Identity & QR Code Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pb-5 border-b border-white/10">
              
              {/* Left Branding — Official Logo */}
              <BrandLogo variant="passport" to={undefined} />


              {/* Right QR Code Showcase */}
              <div className="text-center shrink-0">
                <div
                  className="w-20 h-20 sm:w-22 sm:h-22 p-2 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg border-2 border-white/80"
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full text-black fill-current">
                    <rect x="0" y="0" width="30" height="30" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="10" y="10" width="10" height="10" />
                    <rect x="70" y="0" width="30" height="30" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="80" y="10" width="10" height="10" />
                    <rect x="0" y="70" width="30" height="30" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="10" y="80" width="10" height="10" />
                    <rect x="40" y="10" width="10" height="20" />
                    <rect x="60" y="40" width="20" height="10" />
                    <rect x="40" y="40" width="10" height="10" />
                    <rect x="40" y="60" width="20" height="20" />
                    <rect x="70" y="70" width="20" height="10" />
                  </svg>
                </div>
                <span className="text-[10px] sm:text-[11px] font-mono text-lime font-bold block mt-1.5 tracking-wider">
                  {batch.batchCode}
                </span>
                <span className="text-[9px] text-neutral-400 block font-medium">
                  QR placeholder, not scannable
                </span>
              </div>
            </div>

            {/* Batch Metadata: 4 Compact Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {[
                { label: 'Target crop', value: batch.cropName, cls: 'text-lime font-bold' },
                { label: 'Maker / farmer', value: batch.userName, cls: 'text-white font-bold' },
                { label: 'Origin', value: batch.userLocation, cls: 'text-white font-semibold' },
                { label: 'Production date', value: batch.createdAt.split('T')[0], cls: 'text-neutral-200 font-mono font-bold' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3.5 rounded-2xl bg-[#13271D]/60 border border-white/5 flex flex-col justify-between"
                >
                  <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">{item.label}</p>
                  <p className={`mt-1 truncate ${item.cls}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Recorded NPK Profile */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#13271D]/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-lime" />
                  Recorded NPK Profile
                </span>
                <ProvenanceBadge type={evidence} size="sm" />
              </div>

              {test ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center font-mono">
                    {[
                      { key: 'Nitrogen (N)', val: `${test.nitrogenPercent}%`, cls: 'border-lime/30 text-lime bg-lime/5' },
                      { key: 'Phosphorus (P)', val: `${test.phosphorusPercent}%`, cls: 'border-teal/30 text-teal bg-teal/5' },
                      { key: 'Potassium (K)', val: `${test.potassiumPercent}%`, cls: 'border-amber-400/30 text-amber-300 bg-amber-400/5' },
                      { key: 'pH', val: `${test.ph}`, cls: 'border-white/10 text-neutral-200 bg-white/5' },
                      { key: 'Organic carbon', val: `${test.organicCarbonPercent}%`, cls: 'border-emerald-500/20 text-emerald-300 bg-emerald-500/5' },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className={`p-2.5 rounded-2xl border ${item.cls} flex flex-col justify-between`}
                      >
                        <p className="text-[10px] opacity-90 truncate">{item.key}</p>
                        <p className="text-sm sm:text-base font-black text-white mt-0.5">{item.val}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-neutral-400 font-mono leading-relaxed pt-2.5 border-t border-white/5">
                    Source: {test.testMethod}
                    {test.reportNumber ? ` • Report no. ${test.reportNumber}` : ''}
                    {test.testedBy ? ` • ${test.testedBy}` : ''} • Values entered by the farmer, not verified by KrishiCycle.
                  </p>
                </>
              ) : (
                <p className="text-xs text-neutral-400">No test values recorded. Evidence not provided.</p>
              )}
            </div>

            {/* Raw Material Profile */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-lime" />
                Raw material profile ({batch.recipe.version})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {batch.recipe.materials.map((mat) => (
                  <div
                    key={mat.materialId}
                    className="p-3.5 rounded-2xl bg-[#13271D]/60 border border-white/5 flex flex-col justify-between gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white truncate">{mat.materialName}</span>
                      <span className="font-bold text-lime font-mono shrink-0">
                        {mat.quantityKg} kg ({mat.percentage}%)
                      </span>
                    </div>
                    {/* Subtle Material Percentage Meter */}
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-lime/60 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, mat.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Trial Record (if present) */}
            {batch.growthTrial && (
              <div className="p-4 rounded-2xl bg-teal/10 border border-teal/30 text-xs flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold block text-teal">Growth trial record</span>
                  <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">
                    {batch.growthTrial.dataSource === 'Simulated' ? 'Simulated sample only: ' : ''}
                    +{batch.growthTrial.heightAdvantagePct}% height and +{batch.growthTrial.leafCountAdvantagePct}% leaf count vs the unfertilised control.
                  </p>
                </div>
                <ProvenanceBadge type={batch.growthTrial.dataSource} size="sm" />
              </div>
            )}

            {/* Bottom Prototype / Legal Disclaimer */}
            <div className="pt-3.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                <ShieldCheck className="w-3.5 h-3.5 text-lime shrink-0" />
                Prototype record. Demo order, no real verification page exists.
              </span>
              <span className="font-mono text-neutral-500">
                Recipe is illustrative: validate with your local KVK
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
