import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import { Sparkles, ArrowRight, ArrowLeft, X, Sprout, FlaskConical, ShoppingBag, Stethoscope, CheckCircle2 } from 'lucide-react';

export const DemoTourModal: React.FC = () => {
  const { isDemoTourOpen, closeDemoTour } = useUIStore();
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const tourSteps = [
    {
      title: 'Welcome to KrishiCycle AI 2.0',
      subtitle: 'PRISM\'26 SOCIOTHON — Team God\'s Plan',
      icon: <img src="/logo-emblem.png" alt="KrishiCycle AI" className="w-10 h-10 object-contain rounded-full border border-lime/40 p-0.5 shadow-glow-lime/30" />,
      color: 'border-lime/40',
      description: 'One connected journey for Maharashtra smallholder farmers: Convert on-farm crop residues into balanced bio-fertilizer, plan nutrient cycles, and trade locally.',
      route: '/dashboard',
      bullets: [
        'Farm profile carries through every screen without re-entering data',
        'Strict Honesty Rules: All government, soil, and diagnostic data clearly labelled',
        'Works with offline-capable state persisting across page reloads'
      ]
    },
    {
      title: 'Module 1: Crop Decision Engine',
      subtitle: 'Deterministic cropScoring v1.0 & Nutrient Schedule',
      icon: <Sprout className="w-8 h-8 text-emerald-400" />,
      color: 'border-emerald-500/40',
      description: 'Deterministic rule-based scoring (Season 30, Water 25, Soil 20, Budget 15, Rotation 10). Missing inputs lower the visible Data Coverage Meter instead of guessing.',
      route: '/crops',
      bullets: [
        'Ranked crop suitability tiers: High (>=75), Moderate (50-74), Low (<50)',
        'Per-acre fertilizer schedule scaled to your exact field boundary',
        'Sow-to-harvest interactive task timeline with weekly weather delay check-ins'
      ]
    },
    {
      title: 'Module 2: Bio-Fertilizer Formulation',
      subtitle: 'Mathematical Recipe Normalization & Batch Execution',
      icon: <FlaskConical className="w-8 h-8 text-purple-400" />,
      color: 'border-purple-500/40',
      description: 'Custom recipe algorithm adjusts base brown-to-green ratios for crop category and soil status, normalizing exact kilograms needed per raw ingredient.',
      route: '/make',
      bullets: [
        'Required vs Available vs Missing ingredient calculation',
        'One-click "Buy Missing" links directly to filtered marketplace listings',
        '7-Step guided windrow composting stepper with simulated temperature logs'
      ]
    },
    {
      title: 'Module 3: Circular Marketplace & Orders',
      subtitle: 'Biomass Trade, Batch Traceability & Live State Machine',
      icon: <ShoppingBag className="w-8 h-8 text-teal" />,
      color: 'border-teal/40',
      description: 'Buy raw materials or finished organic fertilizers. Farmers can monetize completed batches by listing them directly with zero paperwork.',
      route: '/market',
      bullets: [
        'Checkout strictly decrements stock and creates tracked order',
        'Order state machine: PENDING -> CONFIRMED -> PACKED -> SHIPPED -> DELIVERED -> COMPLETED',
        'Buyer and Seller mode toggle with timestamped status advancement'
      ]
    },
    {
      title: 'Module 4: Leaf Diagnostic Scanner & AI Agronomist',
      subtitle: 'Visual Inspection & Trilingual Assistant',
      icon: <Stethoscope className="w-8 h-8 text-amber-400" />,
      color: 'border-amber-400/40',
      description: 'Scan crop leaf symptoms to receive organic preventive remedies. Floating liquid-glass AI Agronomist answers compost and agronomy questions in English, Hindi, and Marathi.',
      route: '/health',
      bullets: [
        'Prominent disclaimer: "Demo AI suggestion, not a diagnosis. Not a validated model."',
        'Zero toxic dosage claims — focuses on bio-control and KVK consultation',
        'Rule-based agronomist fallback handles compost odor, low heat, and NPK questions'
      ]
    }
  ];

  const step = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeDemoTour();
      navigate('/dashboard');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleJumpRoute = () => {
    closeDemoTour();
    navigate(step.route);
  };

  return (
    <AnimatePresence>
      {isDemoTourOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`w-full max-w-xl liquid-glass rounded-3xl p-6 md:p-8 border ${step.color} shadow-2xl relative overflow-hidden`}
          >
            {/* Top Close Button */}
            <button
              onClick={closeDemoTour}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Step Indicator */}
            <div className="flex items-center gap-1.5 mb-6">
              {tourSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? 'w-8 bg-lime'
                      : idx < currentStep
                      ? 'w-3 bg-primary'
                      : 'w-3 bg-neutral-700'
                  }`}
                />
              ))}
            </div>

            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-surface-darkcard border border-white/10 shadow-inner shrink-0">
                {step.icon}
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-lime">
                  Pitch Step {currentStep + 1} of {tourSteps.length}
                </span>
                <h3 className="text-xl md:text-2xl font-display font-bold text-white mt-0.5">
                  {step.title}
                </h3>
                <p className="text-xs text-neutral-400">{step.subtitle}</p>
              </div>
            </div>

            {/* Body */}
            <p className="text-sm text-neutral-300 leading-relaxed mb-4">
              {step.description}
            </p>

            {/* Bullet points */}
            <div className="space-y-2 mb-6 bg-surface-dark/60 p-4 rounded-2xl border border-white/5">
              {step.bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-lime shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-4 py-2.5 rounded-full border border-neutral-700 text-xs font-medium text-neutral-300 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/5 transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleJumpRoute}
                  className="px-4 py-2.5 rounded-full bg-surface-darkcard border border-primary/50 text-xs font-medium text-emerald-300 hover:bg-surface-darkcardhover transition-all"
                >
                  Visit this screen
                </button>

                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-full bg-lime text-ink text-xs font-bold hover:bg-lime-hover shadow-glow-lime transition-all flex items-center gap-1.5"
                >
                  <span>{currentStep === tourSteps.length - 1 ? 'Start Exploring' : 'Next Step'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
