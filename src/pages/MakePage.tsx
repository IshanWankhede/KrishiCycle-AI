import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Batch } from '../types';
import { MakeWizard, MakeHandoff } from '../components/make/MakeWizard';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { useBatchStore } from '../store/batchStore';
import { useMakeDraftStore } from '../store/makeDraftStore';
import { useMarketStore } from '../store/marketStore';
import { useUIStore } from '../store/uiStore';
import { useT } from '../i18n/useT';

export const MakePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useT();
  const batches = useBatchStore((s) => s.batches);
  const addBatch = useBatchStore((s) => s.addBatch);
  const clearDraft = useMakeDraftStore((s) => s.clearDraft);
  const setReturnMaterialName = useMakeDraftStore((s) => s.setReturnMaterialName);
  const setSearchQuery = useMarketStore((s) => s.setSearchQuery);
  const setSelectedCategory = useMarketStore((s) => s.setSelectedCategory);
  const { showToast, triggerConfetti } = useUIStore();

  // Crops → Make handoff arrives as router state; read it once so a refresh restores the draft instead.
  const handoff = React.useMemo(
    () => ((location.state as { handoff?: MakeHandoff } | null)?.handoff ?? null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleBatchCreated = (batch: Batch) => {
    addBatch(batch);
    triggerConfetti();
    showToast(`Batch ${batch.batchCode} created. Follow the steps in My Batch.`, 'success');
    navigate('/batches');
  };

  const handleFindInMarketplace = (query: string) => {
    setSelectedCategory('all');
    setSearchQuery(query);
    setReturnMaterialName(query);
    navigate('/market');
  };

  const handleCancel = () => {
    clearDraft();
    navigate(batches.length > 0 ? '/batches' : '/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface-dark py-6 md:py-10 px-4 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-lime font-bold tracking-wide uppercase">Module 2 · Make</span>
            <ProvenanceBadge type="Estimated" size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white">{t('make_title')}</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Pick a crop, confirm soil, get an illustrative recipe, check your raw materials, then create a batch.
          </p>
        </div>
        <button
          onClick={() => navigate('/batches')}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-glass border border-lime/30 text-xs font-bold text-lime hover:bg-white/5 transition"
        >
          My Batches ({batches.length}) →
        </button>
      </div>

      <MakeWizard
        handoff={handoff}
        onBatchCreated={handleBatchCreated}
        onCancel={handleCancel}
        onFindInMarketplace={handleFindInMarketplace}
      />
    </div>
  );
};
