import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { Globe, Check, ArrowRight } from 'lucide-react';

export const LanguageSuggestionModal: React.FC = () => {
  const { isLanguageModalOpen, setLanguageModalOpen, suggestedDistrict } = useUIStore();
  const { setLanguage } = useAuthStore();

  const handleSelect = (lang: 'mr' | 'en') => {
    setLanguage(lang);
    setLanguageModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isLanguageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-md liquid-glass rounded-3xl p-6 border border-lime/30 shadow-2xl relative overflow-hidden text-center"
          >
            {/* Ambient background glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-lime/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/30 rounded-full blur-3xl pointer-events-none" />

            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary-dark/80 border border-lime/40 flex items-center justify-center shadow-lg">
              <Globe className="w-7 h-7 text-lime" />
            </div>

            <h3 className="text-xl font-display font-bold text-white mb-2">
              भाषा निवडा / Language Preference
            </h3>

            <p className="text-sm text-neutral-300 leading-relaxed mb-6">
              We detected you are farming in <span className="text-lime font-semibold">{suggestedDistrict}</span> district. Would you like to switch to <span className="font-semibold text-white">मराठी (Marathi)</span> for local agronomic terms, or continue in English?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleSelect('mr')}
                className="w-full py-3.5 px-5 rounded-full bg-lime text-ink font-bold flex items-center justify-center gap-2 hover:bg-lime-hover active:scale-98 shadow-glow-lime transition-all"
              >
                <Check className="w-5 h-5 text-ink" />
                <span>मराठी मध्ये वापरा (Switch to Marathi)</span>
              </button>

              <button
                onClick={() => handleSelect('en')}
                className="w-full py-3 px-5 rounded-full bg-surface-darkcard hover:bg-surface-darkcardhover border border-neutral-700 text-neutral-200 font-medium flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <span>Continue in English</span>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            <div className="mt-5 text-[11px] text-neutral-400">
              You can toggle between English, हिन्दी and मराठी anytime from the top navigation bar.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
