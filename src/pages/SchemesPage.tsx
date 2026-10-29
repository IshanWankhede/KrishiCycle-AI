import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { AGRI_SCHEMES, AgriScheme } from '../data/schemes';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { SCHEME_IMAGES } from '../data/imageRegistry';
import { SpecularCard } from '../components/SpecularCard';
import { useT } from '../i18n/useT';

export const SchemesPage: React.FC = () => {
  const { t, language, getScheme } = useT();
  const [selectedScheme, setSelectedScheme] = useState<AgriScheme | null>(null);

  return (
    <div className="min-h-screen bg-surface-dark py-6 md:py-10 px-4 max-w-7xl mx-auto space-y-8">
      {/* 1. TOP HEADER & HONESTY BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-lime font-bold tracking-wide uppercase">
              {t('schemes_title')}
            </span>
            <ProvenanceBadge type="Demo data" size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-white">
            {t('nav_schemes')}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {t('schemes_subtitle')}
          </p>
        </div>
      </div>

      {/* Mandatory Honesty Notice per spec */}
      <div className="p-4 rounded-3xl bg-surface-card border border-white/10 text-xs text-neutral-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white block font-semibold mb-0.5">
            {t('schemes_banner_title')}:
          </strong>
          <span>{t('schemes_banner_body')}</span>
        </div>
      </div>

      {/* 2. SCHEMES CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AGRI_SCHEMES.map((scheme) => {
          const localized = getScheme(scheme);
          return (
            <SpecularCard
              key={scheme.id}
              radius={32}
              lineColor="#C8F23B"
              className="p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl hover:border-lime/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Contextual Scheme Visual Banner */}
                {SCHEME_IMAGES[scheme.id] && (
                  <div className="h-36 w-full rounded-3xl overflow-hidden mb-4 border border-white/10 relative">
                    <ImageWithFallback
                      src={SCHEME_IMAGES[scheme.id].url}
                      alt={SCHEME_IMAGES[scheme.id].alt}
                      fallbackTitle={localized.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-black/20 to-transparent" />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary-dark/90 text-lime border border-lime/30 backdrop-blur-md">
                      {scheme.category}
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <ProvenanceBadge type={scheme.provenance} size="sm" />
                    </div>
                  </div>
                )}

                <h3 className="text-xl font-display font-bold text-white mb-1">
                  {localized.title}
                </h3>
                {language !== 'en' && (
                  <div className="text-xs text-emerald-300/80 font-mono mb-2">
                    {scheme.title}
                  </div>
                )}

                <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                  {localized.description}
                </p>

                {/* Key Benefits */}
                <div className="space-y-1.5 mb-4">
                  {scheme.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-neutral-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-lime shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => setSelectedScheme(scheme)}
                  className="w-full py-2.5 px-4 rounded-full liquid-glass border border-white/15 text-xs font-semibold text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t('schemes_btn_view_details')}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-lime" />
                </button>
              </div>
            </SpecularCard>
          );
        })}
      </div>

      {/* MODAL EXPLAINING INFORMATIONAL ONLY */}
      <AnimatePresence>
        {selectedScheme && (() => {
          const selectedLoc = getScheme(selectedScheme);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg liquid-glass rounded-4xl p-6 md:p-8 border border-lime/30 shadow-2xl relative text-left"
              >
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
                  aria-label={t('btn_close')}
                >
                  <X className="w-5 h-5" />
                </button>

                <span className="text-xs font-mono font-bold text-lime uppercase tracking-wider block mb-1">
                  {t('schemes_title')}
                </span>
                <h3 className="text-xl font-display font-bold text-white mb-2">
                  {selectedLoc.title}
                </h3>

                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 mb-4 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-amber-400 inline mr-1" />
                  {t('schemes_banner_body')}
                </div>

                <div className="space-y-3 text-xs text-neutral-300 mb-6">
                  <div>
                    <strong className="text-white block mb-0.5">{t('schemes_eligibility_heading')}:</strong>
                    <span>{selectedScheme.eligibilitySummary}</span>
                  </div>
                  <div>
                    <strong className="text-white block mb-0.5">Portal:</strong>
                    <span className="font-mono text-lime">{selectedScheme.officialPortalName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setSelectedScheme(null)}
                    className="px-5 py-2 rounded-full border border-neutral-700 text-xs text-neutral-300 hover:bg-white/5 cursor-pointer"
                  >
                    {t('btn_close')}
                  </button>
                  <a
                    href={selectedScheme.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{t('schemes_btn_official_portal')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};
