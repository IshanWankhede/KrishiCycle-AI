import React from 'react';
import { Link } from 'react-router-dom';
import fullLogo from '../assets/logo.png';
import emblemLogo from '../assets/logo-emblem.png';

export interface BrandLogoProps {
  /**
   * Display variant:
   * - 'navbar': Compact lockup with official emblem badge + crisp title & tagline for headers
   * - 'full': Complete standalone official artwork with mark and embedded tagline
   * - 'auth': Generous, high-contrast brand card for sign-in & registration
   * - 'footer': Elegant brand lockup for landing and app footers
   * - 'passport': Certified badge for batch passports and printable labels
   * - 'emblem': Pure circular emblem mark
   */
  variant?: 'navbar' | 'full' | 'auth' | 'footer' | 'passport' | 'emblem';
  /**
   * Optional custom link target. If undefined, renders without Link wrapper (unless clickable)
   */
  to?: string;
  className?: string;
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'navbar',
  to = '/',
  className = '',
  showSubtitle = true,
}) => {
  // Render content based on variant
  const renderContent = () => {
    switch (variant) {
      /* ────────────────────────────────────────────────────────
         FULL: Complete official logo asset with all artwork & text
         ──────────────────────────────────────────────────────── */
      case 'full':
        return (
          <div className={`flex flex-col items-center text-center ${className}`}>
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-3 sm:p-4 shadow-[0_12px_36px_rgba(0,0,0,0.45)] border border-lime/40 max-w-[260px] sm:max-w-[300px] w-full">
              <img
                src={fullLogo}
                alt="KrishiCycle AI - Organic Fertilizer Guide"
                className="w-full h-auto object-contain max-h-36 sm:max-h-44 mx-auto select-none"
                loading="eager"
              />
            </div>
          </div>
        );

      /* ────────────────────────────────────────────────────────
         AUTH: Specialized for Sign In & Onboarding screen headers
         ──────────────────────────────────────────────────────── */
      case 'auth':
        return (
          <div className={`flex items-center gap-2.5 ${className}`}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/95 p-1 flex items-center justify-center shadow-[0_4px_16px_rgba(200,242,59,0.3)] border border-lime/40 shrink-0">
              <img
                src={emblemLogo}
                alt="KrishiCycle AI Emblem"
                className="w-full h-full object-contain select-none"
              />
            </div>
            <div className="text-left leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-sm sm:text-base text-white tracking-tight">
                  KRISHICYCLE
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-lime text-ink font-bold">
                  AI 2.0
                </span>
              </div>
              <span className="text-[9px] text-lime/90 font-medium tracking-wide block">
                Organic Fertilizer Guide
              </span>
            </div>
          </div>
        );

      /* ────────────────────────────────────────────────────────
         PASSPORT: High-contrast certification header for Batch Passports
         ──────────────────────────────────────────────────────── */
      case 'passport':
        return (
          <div className={`flex items-center gap-3.5 text-left ${className}`}>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 shadow-lg border-2 border-lime/50 flex items-center justify-center shrink-0">
              <img
                src={emblemLogo}
                alt="KrishiCycle AI Certified"
                className="w-full h-full object-contain select-none"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight print:text-black">
                  KRISHICYCLE AI
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lime text-ink font-bold print:border print:border-black">
                  OFFICIAL
                </span>
              </div>
              <p className="text-xs text-lime font-bold tracking-wide print:text-emerald-700">
                Organic Fertilizer Guide • Batch Passport
              </p>
              <p className="text-[10px] text-neutral-400 font-mono mt-0.5 print:text-neutral-600">
                Verified Circular Formulation • Agro-Waste Derived
              </p>
            </div>
          </div>
        );

      /* ────────────────────────────────────────────────────────
         FOOTER: Prominent brand representation in landing/app footers
         ──────────────────────────────────────────────────────── */
      case 'footer':
        return (
          <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 ${className}`}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-lime/40 flex items-center justify-center shrink-0">
              <img
                src={emblemLogo}
                alt="KrishiCycle AI Logo"
                className="w-full h-full object-contain select-none"
              />
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                  KRISHICYCLE AI 2.0
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-lime text-ink font-bold">
                  Official
                </span>
              </div>
              <p className="text-xs text-lime font-medium mb-1">
                Organic Fertilizer Guide & Circular Farm Operating System
              </p>
              <p className="text-xs text-neutral-400 max-w-md">
                Empowering smallholder farmers across Maharashtra with deterministic agronomic recommendations, compost batch passports, and peer-to-peer biomass trade.
              </p>
            </div>
          </div>
        );

      /* ────────────────────────────────────────────────────────
         EMBLEM: Standalone circular mark for compact avatars / icons
         ──────────────────────────────────────────────────────── */
      case 'emblem':
        return (
          <div className={`rounded-2xl bg-white/95 p-1 shadow-md border border-lime/30 flex items-center justify-center ${className}`}>
            <img
              src={emblemLogo}
              alt="KrishiCycle AI"
              className="w-full h-full object-contain select-none"
            />
          </div>
        );

      /* ────────────────────────────────────────────────────────
         NAVBAR (Default): Sleek glassmorphism header lockup
         ──────────────────────────────────────────────────────── */
      case 'navbar':
      default:
        return (
          <div className={`flex items-center gap-2.5 shrink-0 group py-1 ${className}`}>
            {/* High-contrast official emblem tile */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-white/95 p-1 flex items-center justify-center border border-lime/50 shadow-[0_0_18px_rgba(200,242,59,0.35)] group-hover:scale-105 transition-transform shrink-0">
              <img
                src={emblemLogo}
                alt="KrishiCycle AI Emblem"
                className="w-full h-full object-contain select-none"
              />
            </div>
            
            <div className="text-left leading-none">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black tracking-tight text-sm sm:text-base text-white">
                  KRISHICYCLE
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-lime text-ink font-bold">
                  AI 2.0
                </span>
              </div>
              {showSubtitle && (
                <span className="text-[9px] text-lime/90 font-medium tracking-wide block mt-1">
                  Organic Fertilizer Guide
                </span>
              )}
            </div>
          </div>
        );
    }
  };

  if (to) {
    return (
      <Link to={to} className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-lime rounded-2xl">
        {renderContent()}
      </Link>
    );
  }

  return renderContent();
};
