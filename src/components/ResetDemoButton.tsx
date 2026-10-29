import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFarmStore } from '../store/farmStore';
import { useCropStore } from '../store/cropStore';
import { useBatchStore } from '../store/batchStore';
import { useInventoryStore } from '../store/inventoryStore';
import { useMakeDraftStore } from '../store/makeDraftStore';
import { useMarketStore } from '../store/marketStore';
import { useOrderStore } from '../store/orderStore';
import { useUIStore } from '../store/uiStore';
import { useT } from '../i18n/useT';

interface ResetDemoButtonProps {
  className?: string;
  variant?: 'outline' | 'pill' | 'minimal';
}

export const ResetDemoButton: React.FC<ResetDemoButtonProps> = ({
  className = '',
  variant = 'outline',
}) => {
  const { t } = useT();
  const resetAuth = useAuthStore((s) => s.resetAllToDemo);
  const resetFarm = useFarmStore((s) => s.resetFarmToDemo);
  const resetCrop = useCropStore((s) => s.resetCropToDemo);
  const resetBatches = useBatchStore((s) => s.resetBatchesToDemo);
  const resetInventory = useInventoryStore((s) => s.resetInventoryToDemo);
  const clearMakeDraft = useMakeDraftStore((s) => s.clearDraft);
  const resetMarket = useMarketStore((s) => s.resetMarketToDemo);
  const resetOrders = useOrderStore((s) => s.resetOrdersToDemo);
  const showToast = useUIStore((s) => s.showToast);

  const handleReset = () => {
    resetAuth();
    resetFarm();
    resetCrop();
    resetBatches();
    resetInventory();
    clearMakeDraft();
    resetMarket();
    resetOrders();
    showToast('All demo data and state have been restored to initial prototype seeds.', 'info');
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleReset}
        title={t('btn_reset_demo')}
        className={`flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors ${className}`}
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>{t('btn_reset_demo')}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleReset}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-full border border-neutral-700 bg-surface-darkcard hover:bg-surface-darkcardhover hover:border-neutral-500 text-neutral-300 transition-all active:scale-95 ${className}`}
    >
      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
      <span>{t('btn_reset_demo')}</span>
    </button>
  );
};
