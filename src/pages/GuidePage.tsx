import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, 
  Recycle, 
  ShoppingBag, 
  Activity, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useT } from '../i18n/useT';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { SpecularCard } from '../components/SpecularCard';
import { CROP_IMAGES, MODULE_IMAGES, MARKETPLACE_IMAGES } from '../data/imageRegistry';

export const GuidePage: React.FC = () => {
  const { user } = useAuthStore();
  const { t, language } = useT();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      badge: 'Step 1: Farm Boundary & Weather',
      title: 'Map Your Field & Read Micro-Climate',
      marathiTitle: 'शेताची हद्द आखा व हवामान तपासा',
      desc: 'Draw your polygon on the satellite map to compute geodesic acreage in acres, guntha, and square meters. Open-Meteo fetches real-time rain probabilities.',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80',
      icon: MapPin,
      highlight: 'Honesty rule: User-drawn boundaries are estimates, never confused with official 7/12 land records.',
      targetRoute: '/farm',
    },
    {
      id: 2,
      badge: 'Step 2: Crop Suitability & NPK',
      title: 'Run Deterministic cropScoring v1.0',
      marathiTitle: 'हवामान व जमिनीनुसार पीक शिफारस',
      desc: 'Our rule-based engine scores Season (30), Water (25), Soil (20), Budget (15), and Rotation (10). Missing parameters lower the Data Coverage meter rather than being guessed.',
      image: CROP_IMAGES.crop_tomato.url,
      icon: Sprout,
      highlight: 'Generates per-acre organic and inorganic fertilizer schedules scaled directly to your field area.',
      targetRoute: '/crops',
    },
    {
      id: 3,
      badge: 'Step 3: Bio-Fertilizer Formulation',
      title: 'Formulate Balanced Bio-Compost',
      marathiTitle: 'शेतातील अवशेषांमधून सेंद्रिय खत निर्मिती',
      desc: 'Calculate exact required kilograms of dry straw, kitchen greens, cow dung, neem cake, and wood ash. The mathematical algorithm normalizes all ingredients to sum to 100%.',
      image: MODULE_IMAGES.module_bio_formulation.url,
      icon: Recycle,
      highlight: 'Any shortfall can be ordered with a single click from the circular marketplace.',
      targetRoute: '/make',
    },
    {
      id: 4,
      badge: 'Step 4: Circular Trade & Crop Tasks',
      title: 'Track Batches, Orders & Field Cycles',
      marathiTitle: 'खत विक्री, खरेदी व पीक कार्य दिनदर्शिका',
      desc: 'Monitor 7-step thermophilic composting, generate batch QR codes, sell surplus compost, and follow sow-to-harvest tasks with rain-delay adjustments.',
      image: MARKETPLACE_IMAGES.lst_org_01.url,
      icon: ShoppingBag,
      highlight: 'Full traceability: buyers inspect original batch composition before ordering.',
      targetRoute: '/dashboard',
    },
  ];

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  return (
    <div className="min-h-screen bg-surface-dark py-12 px-4 flex items-center justify-center">
      <SpecularCard
        radius={32}
        lineColor="#C8F23B"
        className="w-full max-w-3xl liquid-glass rounded-4xl p-6 sm:p-10 border border-lime/30 shadow-2xl relative overflow-hidden"
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? 'w-10 bg-lime'
                    : idx < currentSlide
                    ? 'w-4 bg-primary'
                    : 'w-4 bg-neutral-800'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Skip to Dashboard →
          </button>
        </div>

        {/* Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold font-mono bg-lime text-ink">
                {slide.badge}
              </span>
              <span className="text-xs text-emerald-300 font-devanagari font-semibold">
                {slide.marathiTitle}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              {slide.title}
            </h2>

            <p className="text-sm text-neutral-300 leading-relaxed">
              {slide.desc}
            </p>

            <div className="h-56 sm:h-72 w-full rounded-3xl overflow-hidden border border-white/10 relative shadow-inner">
              <ImageWithFallback
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/90 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl liquid-glass border border-white/10 text-xs text-emerald-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-lime shrink-0 mt-0.5" />
                <span>{slide.highlight}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="px-5 py-2.5 rounded-full border border-neutral-700 text-xs font-semibold text-neutral-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-7 py-3 rounded-full bg-lime text-ink font-bold text-xs sm:text-sm hover:bg-lime-hover shadow-glow-lime transition-all flex items-center gap-2 active:scale-95"
          >
            <span>{currentSlide === slides.length - 1 ? 'Enter Farm Hub' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4 text-ink" />
          </button>
        </div>
      </SpecularCard>
    </div>
  );
};
