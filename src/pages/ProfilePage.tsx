import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Globe, 
  Sprout, 
  FlaskConical, 
  ShoppingBag, 
  ShieldCheck, 
  RotateCcw, 
  LogOut, 
  Check, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFarmStore } from '../store/farmStore';
import { useBatchStore } from '../store/batchStore';
import { useMarketStore } from '../store/marketStore';
import { useUIStore } from '../store/uiStore';
import { useT } from '../i18n/useT';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ResetDemoButton } from '../components/ResetDemoButton';
import { Language } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, signOut, language, setLanguage } = useAuthStore();
  const { fields } = useFarmStore();
  const { batches } = useBatchStore();
  const { listings } = useMarketStore();
  const { showToast } = useUIStore();
  const { t } = useT();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || 'Balasaheb Patil');
  const [phone, setPhone] = useState(user?.phone || '9822012345');
  const [district, setDistrict] = useState(user?.district || 'Pune');
  const [taluka, setTaluka] = useState(user?.taluka || 'Haveli');
  const [village, setVillage] = useState(user?.village || 'Wagholi');
  const [gatNumber, setGatNumber] = useState(user?.gatNumber || '142/A');

  // Safety & Provenance notes tab
  const [showProvenanceNotes, setShowProvenanceNotes] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      phone,
      district,
      taluka,
      village,
      gatNumber,
    });
    showToast('Farmer profile details updated successfully.', 'success');
  };

  const handleSignOut = () => {
    signOut();
    showToast('Signed out of KrishiCycle.', 'info');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-surface-dark py-6 md:py-10 px-4 max-w-7xl mx-auto space-y-8">
      {/* 1. TOP HEADER & PROFILE SUMMARY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-lime font-display font-extrabold text-2xl border border-lime/40 shadow-glow-primary">
            {user?.name.charAt(0) || 'B'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-lime font-bold uppercase tracking-wider">
                Farmer Identity Profile
              </span>
              <ProvenanceBadge type="User-provided" size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              {user?.name || 'Balasaheb Patil'}
            </h1>
            <p className="text-xs text-neutral-400">
              {user?.village}, {user?.taluka} Taluka, {user?.district} District · Gat {user?.gatNumber || '142/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <ResetDemoButton />
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-full border border-neutral-700 hover:border-rose-500/50 text-neutral-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('nav_sign_out')}</span>
          </button>
        </div>
      </div>

      {/* 2. PROFILE EDIT FORM & STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* EDIT DETAILS (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Edit Personal & Farm Details</h3>
            <span className="text-xs text-neutral-400 font-mono">Persisted in LocalStorage</span>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-neutral-300 font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-medium block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-neutral-300 font-medium block mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-medium block mb-1">Taluka</label>
                <input
                  type="text"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-medium block mb-1">Village</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-300 font-medium block mb-1">Gat / Survey Number</label>
              <input
                type="text"
                value={gatNumber}
                onChange={(e) => setGatNumber(e.target.value)}
                className="w-full bg-surface-dark border border-neutral-700 rounded-full px-4 py-2 text-white"
              />
            </div>

            {/* Language Switcher in Profile per spec */}
            <div className="pt-2">
              <label className="text-neutral-300 font-medium block mb-2">Preferred Application Language</label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'en', label: 'English' },
                  { id: 'hi', label: 'हिन्दी (Hindi)' },
                  { id: 'mr', label: 'मराठी (Marathi)' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLanguage(l.id as any)}
                    className={`px-4 py-2 rounded-full font-semibold transition-all ${
                      language === l.id
                        ? 'bg-lime text-ink font-bold shadow-glow-lime'
                        : 'bg-surface-dark border border-neutral-700 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* FARM ASSETS & STATS (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-4xl bg-surface-card border border-surface-darkborder shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Connected Farm Assets</h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Registered Fields</div>
                  <div className="text-[11px] text-neutral-400">{fields.length} active plots calibrated</div>
                </div>
                <span className="font-mono text-lime font-bold">
                  {fields.reduce((sum, f) => sum + f.areaAcres, 0)} Acres Total
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Active Bio-Batches</div>
                  <div className="text-[11px] text-neutral-400">{batches.length} bio-compost piles</div>
                </div>
                <span className="font-mono text-teal font-bold">
                  {batches.reduce((sum, b) => sum + b.recipe.targetQuantityKg, 0)} kg
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-dark border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Marketplace Listings</div>
                  <div className="text-[11px] text-neutral-400">
                    {listings.filter(l => l.sellerName === 'Balasaheb Patil').length} items listed
                  </div>
                </div>
                <span className="font-mono text-amber-300 font-bold">Active</span>
              </div>
            </div>

            <button
              onClick={() => setShowProvenanceNotes(!showProvenanceNotes)}
              className="w-full py-2.5 px-4 rounded-full liquid-glass border border-white/10 hover:border-lime/40 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors mt-2"
            >
              <FileText className="w-3.5 h-3.5 text-lime" />
              <span>{showProvenanceNotes ? 'Hide Safety & Provenance Rules' : 'View Safety & Provenance Rules'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. DATA PROVENANCE & SAFETY NOTES ACCORDION / VIEW */}
      {showProvenanceNotes && (
        <div className="p-6 sm:p-8 rounded-4xl bg-surface-card border border-lime/30 shadow-2xl space-y-4 text-xs leading-relaxed text-neutral-300">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-lime" />
              <span>KrishiCycle AI 2.0 — Data Provenance & Safety Specification</span>
            </h3>
            <ProvenanceBadge type="Demo data" size="sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-surface-dark border border-white/5 space-y-1.5">
              <strong className="text-white block font-semibold">1. Provenance Badges on Every Value</strong>
              <p>Every data point throughout the interface displays a provenance badge ("Demo data", "Estimated", "User-provided", "Live (Open-Meteo)", "Simulated") so judges and farmers never mistake illustrative values for laboratory certs.</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-dark border border-white/5 space-y-1.5">
              <strong className="text-white block font-semibold">2. Zero Government API Imitation</strong>
              <p>No official government seals or portals are scraped. Maharashtra district and village sets are curated demonstrations. Disclaimers clearly state informational status.</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-dark border border-white/5 space-y-1.5">
              <strong className="text-white block font-semibold">3. Simulated Payments & Auth</strong>
              <p>All phone OTP codes and order payments are simulated demonstrations. No real credit card or bank credentials are ever requested or stored.</p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-dark border border-white/5 space-y-1.5">
              <strong className="text-white block font-semibold">4. Prohibited Claim Guardrails</strong>
              <p>Terms like "certified", "lab-tested", "government verified", and "guaranteed yield" are strictly banned. Honest alternatives ("Seller-provided", "Not tested", "Evidence not provided") are enforced.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
