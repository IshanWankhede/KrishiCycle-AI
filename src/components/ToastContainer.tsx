import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../store/uiStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className={`pointer-events-auto liquid-glass flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl text-sm ${
              toast.type === 'success'
                ? 'border-lime/40 text-emerald-100'
                : toast.type === 'warning'
                ? 'border-amber-400/40 text-amber-100'
                : toast.type === 'error'
                ? 'border-red/40 text-rose-100'
                : 'border-white/10 text-neutral-100'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-lime shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-teal shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs leading-relaxed">{toast.message}</div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-white p-0.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
