import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layers, Plus } from 'lucide-react';
import { Batch } from '../types';
import { BatchTracker } from '../components/make/BatchTracker';
import { BatchTestingModal } from '../components/make/BatchTestingModal';
import { BatchPassportModal } from '../components/make/BatchPassportModal';
import { GrowthTrialView } from '../components/make/GrowthTrialView';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ui } from '../components/make/styles';
import { useBatchStore } from '../store/batchStore';
import { useUIStore } from '../store/uiStore';
import { useT } from '../i18n/useT';

export const BatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { t } = useT();
  const { batches, activeBatchId, setActiveBatchId, saveTest, saveTrial } = useBatchStore();
  const showToast = useUIStore((s) => s.showToast);

  const [passportBatchId, setPassportBatchId] = useState<string | null>(null);
  const [testingBatchId, setTestingBatchId] = useState<string | null>(null);
  const [trialBatchId, setTrialBatchId] = useState<string | null>(null);

  // Deep links: /batches?code=KC-TOM-2026-001 (Orders, Marketplace) and &passport=1 to open the passport.
  const codeParam = params.get('code');
  useEffect(() => {
    if (!codeParam) return;
    const found = batches.find((b) => b.batchCode === codeParam);
    if (found) {
      setActiveBatchId(found.id);
      if (params.get('passport') === '1') setPassportBatchId(found.id);
    }
    setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeParam]);

  const activeBatch: Batch | undefined = batches.find((b) => b.id === activeBatchId) || batches[0];
  const byId = (id: string | null) => batches.find((b) => b.id === id) || null;
  const passportBatch = byId(passportBatchId);
  const testingBatch = byId(testingBatchId);
  const trialBatch = byId(trialBatchId);

  const handleListForSale = (batch: Batch) => {
    if (batch.isListedOnMarketplace && batch.listingId) {
      navigate('/market', { state: { viewListingId: batch.listingId } });
    } else {
      navigate('/market', { state: { sellBatchId: batch.id } });
    }
  };

  return (
    <div className="min-h-screen bg-surface-dark py-6 md:py-10 px-4 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-lime font-bold tracking-wide uppercase">Module 2 · My Batch</span>
            <ProvenanceBadge type="Demo data" size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white">
            {t('My Fertilizer Batches')}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Step-by-step batch tracker with video guides, temperature and moisture log, test values and a batch passport.
          </p>
        </div>
      </div>

      {trialBatch ? (
        <GrowthTrialView
          key={trialBatch.id}
          batch={trialBatch}
          onSave={(trial) => {
            saveTrial(trialBatch.id, trial);
            showToast('Growth trial record saved to the batch passport.', 'success');
          }}
          onBack={() => setTrialBatchId(null)}
        />
      ) : activeBatch ? (
        <>
          {/* Batch switcher */}
          <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-neutral-400 shrink-0">Your batches:</span>
            {batches.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBatchId(b.id)}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-bold shrink-0 transition cursor-pointer ${activeBatch.id === b.id
                    ? 'bg-lime text-ink border-lime'
                    : 'bg-black/20 text-neutral-300 border-white/10 hover:border-lime/40'
                  }`}
              >
                {b.batchCode} ({b.cropName})
              </button>
            ))}
            <button onClick={() => navigate('/make')} className={`${ui.btnSecondary} shrink-0`}>
              <Plus className="w-3.5 h-3.5" />
              <span>New Batch</span>
            </button>
          </div>

          <BatchTracker
            key={activeBatch.id}
            batch={activeBatch}
            onOpenTestModal={(b) => setTestingBatchId(b.id)}
            onOpenGrowthTrial={(b) => setTrialBatchId(b.id)}
            onOpenPassport={(b) => setPassportBatchId(b.id)}
            onOpenListForSale={handleListForSale}
          />
        </>
      ) : (
        <div className={`${ui.card} max-w-xl mx-auto text-center py-12 space-y-4`}>
          <div className="w-14 h-14 rounded-3xl bg-lime/10 border border-lime/30 text-lime flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No batches yet</h3>
          <p className="text-xs text-neutral-400">
            Formulate a recipe in Make and create a batch. It will appear here for step-by-step tracking.
          </p>
          <button onClick={() => navigate('/make')} className={ui.btnPrimary}>
            Start New Batch
          </button>
        </div>
      )}

      {testingBatch && (
        <BatchTestingModal
          batch={testingBatch}
          onClose={() => setTestingBatchId(null)}
          onSave={(test) => {
            saveTest(testingBatch.id, test);
            setTestingBatchId(null);
            showToast('Test values saved to the batch.', 'success');
          }}
        />
      )}
      {passportBatch && <BatchPassportModal batch={passportBatch} onClose={() => setPassportBatchId(null)} />}
    </div>
  );
};
