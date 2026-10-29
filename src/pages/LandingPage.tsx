import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sprout, 
  ArrowRight, 
  Recycle, 
  ShoppingBag, 
  Activity, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  Layers,
  Leaf,
  Check,
  Cpu,
  BarChart3,
  Sun,
  Droplets,
  Flame,
  CheckCircle,
  FlaskConical
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useT } from '../i18n/useT';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { CountUpNumber } from '../components/CountUpNumber';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { ResetDemoButton } from '../components/ResetDemoButton';
import { BrandLogo } from '../components/BrandLogo';
import { MODULE_IMAGES } from '../data/imageRegistry';
import cinematicHeroBg from '../assets/hero_agricultural_cinematic.png';
import { SpecularCard } from '../components/SpecularCard';

// ---------------------------------------------------------------------------
// 3D Interactive Tilt Card Component
// ---------------------------------------------------------------------------
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

const TiltCard: React.FC<TiltCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'rgba(200, 242, 59, 0.15)' 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    setIsReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6.5;
    const rotateY = ((x - centerX) / centerX) * 6.5;

    setTransform({ rotateX, rotateY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1
    });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isReducedMotion ? undefined : `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        transition: glare.opacity === 0 ? 'transform 0.5s ease-out' : 'transform 0.1s ease-out',
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Dynamic Cursor Glare */}
      {!isReducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 rounded-[inherit]"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle 220px at ${glare.x}% ${glare.y}%, ${glowColor}, transparent 75%)`,
          }}
        />
      )}
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main LandingPage Component
// ---------------------------------------------------------------------------
export const LandingPage: React.FC = () => {
  const { t } = useT();
  const { loadDemoUser } = useAuthStore();
  const { showToast } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to hash on page load or hash change
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          const navOffset = 84;
          const targetY = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  const [activeTab, setActiveTab] = useState<'what_to_grow' | 'what_to_use' | 'how_to_use' | 'where_to_trade'>('what_to_grow');
  const [activeGrowthStage, setActiveGrowthStage] = useState<number>(1);
  const [scrollY, setScrollY] = useState(0);

  // Track visibility of Four Pillars section to pause marquee when off-screen
  const pillarsSectionRef = useRef<HTMLElement>(null);
  const [isPillarsVisible, setIsPillarsVisible] = useState(true);

  // Subtle Parallax Scroll listener
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer for pillars marquee
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPillarsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    if (pillarsSectionRef.current) {
      observer.observe(pillarsSectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Auto-advance Growth Sequence preview every 4.5 seconds if user isn't clicking
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGrowthStage((prev) => (prev >= 3 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleDemoFarmerJourney = () => {
    loadDemoUser();
    showToast('Entered Demo Mode as Balasaheb Patil (Pune).', 'success');
    navigate('/dashboard');
  };

  const handleCreateAccount = () => {
    navigate('/auth?mode=signup');
  };

  const challengeTabs = [
    {
      id: 'what_to_grow',
      title: 'What to grow?',
      subtitle: 'Crop Recommendation',
      desc: 'Smallholder farmers in Maharashtra often guess crops based on last year’s prices. KrishiCycle scores season window, soil moisture, market demand and preceding crop synergy.',
      highlight: 'Evaluates Kharif, Rabi & Zaid fit using deterministic agronomic scoring v1.0.',
      icon: Sprout,
    },
    {
      id: 'what_to_use',
      title: 'What to use?',
      subtitle: 'Bio-Fertilizer Formulation',
      desc: 'Commercial chemical fertilizers deplete soil carbon and inflate debt. KrishiCycle converts farm stubble, dry leaves, and cattle dung into customized NPK compost.',
      highlight: 'Mathematical recipe engine normalizes ingredients to 100% with no waste.',
      icon: Recycle,
    },
    {
      id: 'how_to_use',
      title: 'How to use resources?',
      subtitle: 'Resource Planning & Tasks',
      desc: 'Biomass residue is often burned because farmers lack guided timing. KrishiCycle plans seasonal allocation and tracks sow-to-harvest tasks with rain delay adjustments.',
      highlight: 'Eliminates open-field burning with step-by-step aerated pile guidance.',
      icon: Activity,
    },
    {
      id: 'where_to_trade',
      title: 'Where to buy & sell?',
      subtitle: 'Circular Marketplace',
      desc: 'Farmers with surplus organic compost have no local market; others struggle to procure neem cake and pure wood ash. KrishiCycle provides a verified peer-to-peer exchange.',
      highlight: 'Batch QR passport with real-time stock and transparent delivery fees.',
      icon: ShoppingBag,
    },
  ];

  const modules = [
    {
      id: 1,
      badge: 'Module 1',
      title: t('mod_crop_title'),
      marathiTitle: t('mod_crop_marathi'),
      desc: t('mod_crop_desc'),
      color: 'bg-[#0E2018]/85 border-emerald-500/25 text-emerald-200',
      pillColor: 'bg-lime text-ink',
      image: MODULE_IMAGES.module_crop_recommendation.url,
      route: '/crops',
    },
    {
      id: 2,
      badge: 'Module 2',
      title: t('mod_bio_title'),
      marathiTitle: t('mod_bio_marathi'),
      desc: t('mod_bio_desc'),
      color: 'bg-[#18152B]/85 border-purple-500/25 text-purple-200',
      pillColor: 'bg-lilac text-ink',
      image: MODULE_IMAGES.module_bio_formulation.url,
      route: '/make',
    },
    {
      id: 3,
      badge: 'Module 3',
      title: t('mod_market_title'),
      marathiTitle: t('mod_market_marathi'),
      desc: t('mod_market_desc'),
      color: 'bg-[#0F2224]/85 border-teal/25 text-teal-200',
      pillColor: 'bg-teal text-ink',
      image: MODULE_IMAGES.module_marketplace.url,
      route: '/market',
    },
    {
      id: 4,
      badge: 'Module 4',
      title: t('mod_health_title'),
      marathiTitle: t('mod_health_marathi'),
      desc: t('mod_health_desc'),
      color: 'bg-[#221A12]/85 border-amber-500/25 text-amber-200',
      pillColor: 'bg-amber text-ink',
      image: MODULE_IMAGES.module_leaf_scanner.url,
      route: '/health',
    },
  ];

  const marqueeSequence = [...modules, ...modules];

  const growthStages = [
    {
      id: 0,
      step: t('step1_tag'),
      title: t('step1_title'),
      desc: t('step1_desc'),
      stat: t('step1_stat'),
      icon: Leaf,
    },
    {
      id: 1,
      step: t('step2_tag'),
      title: t('step2_title'),
      desc: t('step2_desc'),
      stat: t('step2_stat'),
      icon: Cpu,
    },
    {
      id: 2,
      step: t('step3_tag'),
      title: t('step3_title'),
      desc: t('step3_desc'),
      stat: t('step3_stat'),
      icon: Flame,
    },
    {
      id: 3,
      step: t('step4_tag'),
      title: t('step4_title'),
      desc: t('step4_desc'),
      stat: t('step4_stat'),
      icon: Sprout,
    },
  ];

  const renderModuleCard = (mod: typeof modules[0], key: string, isAriaHidden = false) => (
    <SpecularCard
      key={key}
      aria-hidden={isAriaHidden ? 'true' : undefined}
      radius={32}
      lineColor="#C8F23B"
      className={`p-6 sm:p-7 rounded-3xl sm:rounded-4xl border backdrop-blur-xl flex flex-col justify-between shadow-2xl relative overflow-hidden group/card shrink-0 w-[290px] sm:w-[330px] md:w-[350px] h-[490px] sm:h-[510px] transition-all duration-300 hover:scale-[1.02] hover:border-lime/50 ${mod.color}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-mono tracking-wide ${mod.pillColor}`}>
            {mod.badge}
          </span>
          <ArrowUpRight className="w-4 h-4 opacity-50 group-hover/card:opacity-100 group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5 transition-all text-lime" />
        </div>

        <h3 className="text-xl font-display font-extrabold text-white mb-0.5 tracking-tight">
          {mod.title}
        </h3>
        <div className="text-xs text-lime font-devanagari mb-3">
          {mod.marathiTitle}
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed mb-5">
          {mod.desc}
        </p>
      </div>

      <div>
        <div className="h-32 sm:h-36 w-full rounded-2xl overflow-hidden mb-4 border border-white/10 bg-black/30">
          <ImageWithFallback
            src={mod.image}
            alt={mod.title}
            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
          />
        </div>

        <Link
          to={mod.route}
          tabIndex={isAriaHidden ? -1 : undefined}
          className="w-full py-2.5 px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer group-hover/card:border-lime/40"
        >
          <span>Launch {mod.badge}</span>
          <ArrowRight className="w-3.5 h-3.5 text-lime" />
        </Link>
      </div>
    </SpecularCard>
  );

  return (
    <div className="min-h-screen bg-[#07110D] text-white selection:bg-lime selection:text-ink pb-20 w-full overflow-x-hidden">
      
      {/* ============================================================ */}
      {/* 1. CINEMATIC HERO SECTION                                    */}
      {/* ============================================================ */}
      <section className="relative pt-24 sm:pt-36 pb-20 sm:pb-28 px-4 w-full overflow-hidden isolate">
        
        {/* Full-bleed Realistic Organic Agricultural Background Image */}
        <div 
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
          style={{
            transform: `translateY(${Math.min(scrollY * 0.12, 90)}px)`,
            transition: 'transform 0.1s linear',
          }}
        >
          <img
            src={cinematicHeroBg || '/hero_agricultural_cinematic.png'}
            alt="Golden sunrise over lush organic crop fields with dewdrops on leaves"
            onError={(e) => {
              if (e.currentTarget.src !== window.location.origin + '/hero_agricultural_cinematic.png') {
                e.currentTarget.src = '/hero_agricultural_cinematic.png';
              }
            }}
            className="w-full h-full min-h-full object-cover object-[center_35%] filter brightness-[0.96] contrast-[1.08] saturate-[1.12]"
            loading="eager"
          />

          {/* Layered Cinematic Overlays for Award-Winning Contrast & Agricultural Atmosphere */}
          {/* 1. Top subtle gradient for Navbar contrast and clean readability */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#06120C]/80 via-[#06120C]/35 to-transparent pointer-events-none" />

          {/* 2. Soft centered elliptical radial vignette directly behind the headline so text pops while keeping foliage & sunrise visible */}
          <div 
            className="absolute inset-0 pointer-events-none" 
            style={{
              background: 'radial-gradient(ellipse 65% 55% at 50% 42%, rgba(6, 17, 12, 0.45) 0%, rgba(6, 17, 12, 0.2) 50%, transparent 80%)',
            }}
          />

          {/* 3. Golden sunrise warm aura accent in the top right to enhance the rising morning sun */}
          <div 
            className="absolute top-0 right-0 w-[55%] h-[55%] pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 80% 28%, rgba(254, 240, 138, 0.18) 0%, rgba(200, 242, 59, 0.08) 35%, transparent 65%)',
            }}
          />

          {/* 4. Left dewy foliage ambient shading to frame the lush leaves */}
          <div 
            className="absolute top-0 left-0 w-[42%] h-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 15% 45%, rgba(6, 17, 12, 0.3) 0%, transparent 65%)',
            }}
          />

          {/* 5. Smooth bottom transition melting the photo field seamlessly into the dark section below */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[#07110D]/70 to-[#07110D] pointer-events-none" />
        </div>

        {/* Ambient Radiant Green Spotlight behind Hero CTA */}
        <div 
          aria-hidden="true"
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[700px] h-[350px] sm:h-[450px] bg-lime/20 rounded-full blur-[140px] pointer-events-none z-[1]" 
        />

        {/* Circular AI Soil & Field Intelligence Sensor HUD (as in SocioThon Reference Mockup) */}
        <div className="hidden lg:flex items-center justify-center absolute right-6 sm:right-16 bottom-24 pointer-events-none z-[1] select-none">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            {/* Outer rotating dashed ring */}
            <div 
              className="absolute inset-0 rounded-full border border-lime/30 border-dashed animate-spin" 
              style={{ animationDuration: '28s' }} 
            />
            {/* Middle radar sweep ring */}
            <div className="absolute inset-2.5 rounded-full border border-lime/40 animate-ping opacity-25" style={{ animationDuration: '5s' }} />
            {/* Inner sensor core */}
            <div className="absolute inset-4 rounded-full bg-[#0C1E14]/85 border border-lime/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_24px_rgba(200,242,59,0.35)]">
              <Leaf className="w-5 h-5 text-lime animate-pulse" />
            </div>
            {/* Radar Crosshairs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-lime/60" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-lime/60" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-1 bg-lime/60" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1.5 w-1 bg-lime/60" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10 px-2 sm:px-4">
          
          {/* Subtle Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#122019]/85 border border-lime/30 text-xs font-medium text-neutral-200 backdrop-blur-xl mb-6 shadow-glow-lime cursor-default"
          >
            <span className="w-2 h-2 rounded-full bg-lime animate-ping" />
            <span className="font-mono text-lime text-[11px] font-bold">2.0</span>
            <span className="text-neutral-300">{t('hero_pill_new')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-lime" />
          </motion.div>

          {/* Flanking Floating Glass Cards — outside headline so they never overlap */}
          <div className="relative w-full">
            {/* Left Floating Card: Crop Insight */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden xl:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0A1A12]/80 backdrop-blur-2xl border border-lime/30 shadow-[0_16px_40px_rgba(0,0,0,0.55),0_0_24px_rgba(200,242,59,0.15)] absolute left-0 top-3 pointer-events-none animate-float whitespace-nowrap"
            >
              <div className="w-9 h-9 rounded-xl bg-lime/15 border border-lime/35 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(200,242,59,0.25)]">
                <Sprout className="w-4 h-4 text-lime" />
              </div>
              <div className="text-left">
                <div className="text-xs font-display font-bold text-white tracking-tight">{t('hero_card_crop_fit')}</div>
                <div className="text-[10px] text-lime font-mono font-medium">{t('hero_card_crop_sub')}</div>
              </div>
            </motion.div>

            {/* Right Floating Card: Compost Reactor */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="hidden xl:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0A1A12]/80 backdrop-blur-2xl border border-teal/30 shadow-[0_16px_40px_rgba(0,0,0,0.55),0_0_24px_rgba(20,184,166,0.15)] absolute right-0 top-3 pointer-events-none animate-float whitespace-nowrap"
              style={{ animationDelay: '2s' }}
            >
              <div className="w-9 h-9 rounded-xl bg-teal/15 border border-teal/35 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(20,184,166,0.25)]">
                <Recycle className="w-4 h-4 text-teal" />
              </div>
              <div className="text-left">
                <div className="text-xs font-display font-bold text-white tracking-tight">{t('hero_card_batch_active')}</div>
                <div className="text-[10px] text-teal font-mono font-medium">{t('hero_card_batch_sub')}</div>
              </div>
            </motion.div>

            {/* Majestic Hero Headline — constrained so cards never touch it */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="font-display font-black tracking-tight text-white leading-[1.05] [text-wrap:balance] max-w-3xl mx-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
              style={{ fontSize: 'clamp(2.6rem, 4vw + 1rem, 4.2rem)' }}
            >
              {t('hero_title_line1')}{' '}
              <span className="italic font-serif font-normal text-transparent bg-clip-text bg-gradient-to-r from-lime via-emerald-300 to-teal-200 inline-block pr-1 drop-shadow-[0_2px_18px_rgba(200,242,59,0.35)]">
                {t('hero_title_highlight')}
              </span>
            </motion.h1>
          </div>

          {/* Refined Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-6 text-sm sm:text-base md:text-lg text-neutral-300/90 max-w-2xl mx-auto leading-relaxed"
          >
            {t('hero_subtitle')}
          </motion.p>

          {/* Glowing CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md sm:max-w-xl mx-auto mt-9 mb-6 px-4"
          >
            {/* Primary Glowing Radiant Lime CTA */}
            <button
              onClick={handleDemoFarmerJourney}
              className="w-full sm:w-auto relative group px-8 py-3.5 rounded-full bg-lime text-ink font-display font-black text-sm sm:text-base hover:bg-lime-hover transition-all duration-300 shadow-[0_0_35px_rgba(200,242,59,0.55)] hover:shadow-[0_0_45px_rgba(200,242,59,0.75)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{t('btn_continue_demo_farmer')}</span>
              <ArrowRight className="w-4 h-4 text-ink group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary Translucent Glass CTA */}
            <button
              onClick={handleCreateAccount}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full liquid-glass border border-white/15 text-white font-display font-bold text-sm sm:text-base hover:text-white hover:border-lime/40 hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg"
            >
              <span>{t('btn_create_account')}</span>
            </button>
          </motion.div>

          {/* Trust Indicators Pill Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-neutral-400 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-lime" />
              <span>{t('hero_badge_stubble')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-lime" />
              <span>{t('hero_badge_circular')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-lime" />
              <span>{t('hero_badge_kvk')}</span>
            </div>
          </motion.div>

          {/* Quick Core Modules Ribbon (Directly matching SocioThon Reference Mockup) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mt-12 sm:mt-16 w-full max-w-5xl mx-auto text-left relative z-10">
            <SpecularCard
              as="button"
              type="button"
              onClick={() => navigate('/crops')}
              radius={16}
              lineColor="#C8F23B"
              className="p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-[#0A1A12]/80 hover:bg-[#0E261B] hover:border-lime/40 backdrop-blur-xl shadow-xl transition-all duration-300 group cursor-pointer flex flex-row items-center gap-3.5 active:scale-95 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(200,242,59,0.2)]">
                <Sprout className="w-4 h-4 text-lime" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-display font-black tracking-wider text-white uppercase group-hover:text-lime transition-colors leading-tight">
                  {t('mod_crop_title')}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono mt-0.5 leading-tight">
                  {t('crops_tab_recommendation')}
                </span>
              </div>
            </SpecularCard>

            <SpecularCard
              as="button"
              type="button"
              onClick={() => navigate('/make')}
              radius={16}
              lineColor="#C084FC"
              className="p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-[#0A1A12]/80 hover:bg-[#18152B] hover:border-purple-400/40 backdrop-blur-xl shadow-xl transition-all duration-300 group cursor-pointer flex flex-row items-center gap-3.5 active:scale-95 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                <FlaskConical className="w-4 h-4 text-purple-300" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-display font-black tracking-wider text-white uppercase group-hover:text-purple-300 transition-colors leading-tight">
                  {t('mod_bio_title')}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono mt-0.5 leading-tight">
                  {t('Make Recipe')}
                </span>
              </div>
            </SpecularCard>

            <SpecularCard
              as="button"
              type="button"
              onClick={() => navigate('/market')}
              radius={16}
              lineColor="#14B8A6"
              className="p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-[#0A1A12]/80 hover:bg-[#0E2224] hover:border-teal/40 backdrop-blur-xl shadow-xl transition-all duration-300 group cursor-pointer flex flex-row items-center gap-3.5 active:scale-95 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-teal/15 border border-teal/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(20,184,166,0.2)]">
                <ShoppingBag className="w-4 h-4 text-teal" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-display font-black tracking-wider text-white uppercase group-hover:text-teal transition-colors leading-tight">
                  {t('mod_market_title')}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono mt-0.5 leading-tight">
                  {t('market_title')}
                </span>
              </div>
            </SpecularCard>

            <SpecularCard
              as="button"
              type="button"
              onClick={() => navigate('/health')}
              radius={16}
              lineColor="#F59E0B"
              className="p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-[#0A1A12]/80 hover:bg-[#221A12] hover:border-amber-400/40 backdrop-blur-xl shadow-xl transition-all duration-300 group cursor-pointer flex flex-row items-center gap-3.5 active:scale-95 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                <Activity className="w-4 h-4 text-amber-300" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-display font-black tracking-wider text-white uppercase group-hover:text-amber-300 transition-colors leading-tight">
                  {t('mod_health_title')}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono mt-0.5 leading-tight">
                  {t('health_title')}
                </span>
              </div>
            </SpecularCard>
          </div>

          {/* ============================================================ */}
          {/* THREE ELEVATED GLASSMORPHISM FEATURE CARDS (Image 3 Style)  */}
          {/* ============================================================ */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mt-16 sm:mt-20 text-left scroll-mt-28">
            
            {/* CARD 1: Unify Your Farm Waste (Input Pipeline) */}
            <TiltCard
              glowColor="rgba(200, 242, 59, 0.18)"
              className="p-6 sm:p-7 rounded-3xl sm:rounded-4xl border border-white/10 bg-[#0B1711]/80 backdrop-blur-2xl shadow-2xl flex flex-col justify-between hover:border-lime/40 transition-all duration-300 group"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-lime/10 border border-lime/30 text-lime flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-glow-lime">
                  <Leaf className="w-5 h-5 text-lime" />
                </div>
                <h3 className="text-lg sm:text-xl font-display font-extrabold text-white mb-2 tracking-tight">
                  Unify your farm waste
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300/90 leading-relaxed">
                  Connect all on-farm sources — stubble, cattle dung, dry leaves, and kitchen residue — into a single closed-loop bio-matrix.
                </p>
              </div>

              {/* Graphic Diagram: Converging Node Pipeline */}
              <div className="mt-8 pt-4 border-t border-white/5 relative">
                <div className="flex items-center justify-between">
                  {/* Left stacked source nodes */}
                  <div className="space-y-2">
                    {['Crop Stubble', 'Dry Leaves', 'Cattle Dung', 'Green Waste'].map((source) => (
                      <div
                        key={source}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-300 group-hover:border-lime/30 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-lime/60" />
                        <span>{source}</span>
                      </div>
                    ))}
                  </div>

                  {/* Connecting SVG Flow Curves */}
                  <div className="w-16 h-28 hidden sm:flex items-center justify-center">
                    <svg viewBox="0 0 60 100" className="w-full h-full stroke-lime/50 fill-none">
                      <path d="M 5 15 C 30 15, 30 50, 55 50" strokeWidth="1.5" strokeDasharray="3 3" />
                      <path d="M 5 40 C 30 40, 30 50, 55 50" strokeWidth="1.5" strokeDasharray="3 3" />
                      <path d="M 5 65 C 30 65, 30 50, 55 50" strokeWidth="1.5" strokeDasharray="3 3" />
                      <path d="M 5 90 C 30 90, 30 50, 55 50" strokeWidth="1.5" strokeDasharray="3 3" />
                    </svg>
                  </div>

                  {/* Central Radiant Biomass Node */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime to-emerald-500 text-ink flex flex-col items-center justify-center shadow-[0_0_25px_rgba(200,242,59,0.5)] shrink-0">
                    <Recycle className="w-6 h-6 text-ink animate-spin" style={{ animationDuration: '14s' }} />
                    <span className="text-[8px] font-mono font-black mt-0.5 uppercase tracking-tighter">Bio-Nutrient</span>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* CARD 2: Precision NPK Formulation (Surface What Matters) */}
            <TiltCard
              glowColor="rgba(124, 207, 196, 0.18)"
              className="p-6 sm:p-7 rounded-3xl sm:rounded-4xl border border-white/10 bg-[#0B1711]/80 backdrop-blur-2xl shadow-2xl flex flex-col justify-between hover:border-teal/40 transition-all duration-300 group"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-teal/10 border border-teal/30 text-teal flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-glow-primary">
                  <TrendingUp className="w-5 h-5 text-teal" />
                </div>
                <h3 className="text-lg sm:text-xl font-display font-extrabold text-white mb-2 tracking-tight">
                  Surface what matters
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300/90 leading-relaxed">
                  Mathematical algorithm cuts through guesswork, normalizing ingredient weights and maximizing soil organic carbon retention.
                </p>
              </div>

              {/* Graphic Diagram: Glowing NPK Curve with Peak Pill */}
              <div className="mt-8 pt-4 border-t border-white/5 relative">
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
                  <span>Carbon-Nitrogen Dynamic</span>
                  <span className="text-lime font-bold">Optimal C:N ~28:1</span>
                </div>

                <div className="relative h-24 w-full flex items-end">
                  {/* Floating Glowing Stat Pill */}
                  <div className="absolute top-0 right-1/4 px-2.5 py-1 rounded-full bg-lime text-ink text-[10px] font-mono font-bold shadow-glow-lime flex items-center gap-1 z-10">
                    <span>↑ 34% Soil Carbon</span>
                  </div>

                  {/* Smooth Sine Curves SVG */}
                  <svg viewBox="0 0 200 80" className="w-full h-full fill-none overflow-visible">
                    <defs>
                      <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#C8F23B" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#C8F23B" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Filled Area */}
                    <path
                      d="M 0 65 Q 40 75, 80 40 T 150 15 T 200 50 L 200 80 L 0 80 Z"
                      fill="url(#curveGradient)"
                    />
                    {/* Glowing Stroke */}
                    <path
                      d="M 0 65 Q 40 75, 80 40 T 150 15 T 200 50"
                      stroke="#C8F23B"
                      strokeWidth="2.5"
                    />
                    {/* Peak Marker Dot */}
                    <circle cx="150" cy="15" r="4.5" fill="#FFFFFF" stroke="#C8F23B" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>
            </TiltCard>

            {/* CARD 3: Traceable Batch Passport (Act with Confidence) */}
            <TiltCard
              glowColor="rgba(244, 183, 64, 0.18)"
              className="p-6 sm:p-7 rounded-3xl sm:rounded-4xl border border-white/10 bg-[#0B1711]/80 backdrop-blur-2xl shadow-2xl flex flex-col justify-between hover:border-amber-400/40 transition-all duration-300 group"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-display font-extrabold text-white mb-2 tracking-tight">
                  Act with confidence
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300/90 leading-relaxed">
                  Digital product passports and leaf health scanners verify batch purity and nutrient density for peer marketplace trade.
                </p>
              </div>

              {/* Graphic Diagram: Concentric Orbital Radar Scan */}
              <div className="mt-8 pt-4 border-t border-white/5 relative flex items-center justify-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Outer Radar Ring */}
                  <div className="absolute inset-0 rounded-full border border-lime/20" />
                  {/* Middle Radar Ring */}
                  <div className="absolute inset-3 rounded-full border border-lime/30" />
                  {/* Inner Radar Ring */}
                  <div className="absolute inset-6 rounded-full border border-lime/40" />

                  {/* Orbiting Satellite Nodes */}
                  <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-lime shadow-glow-lime animate-ping" />
                  <span className="absolute bottom-3 left-2 w-2 h-2 rounded-full bg-teal shadow-glow-primary" />
                  <span className="absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full bg-amber-300" />

                  {/* Central Shield Badge */}
                  <div className="w-10 h-10 rounded-xl bg-[#122019] border border-lime/60 flex items-center justify-center text-lime shadow-glow-lime z-10">
                    <ShieldCheck className="w-5 h-5 text-lime" />
                  </div>
                </div>
              </div>
            </TiltCard>

          </div>

          {/* Trusted By Agricultural Research & Institutions */}
          <div className="mt-16 pt-8 border-t border-white/5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-5">
              Verified with Agronomic Research & Agricultural Extensions
            </span>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-neutral-400 text-xs font-semibold">
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Sprout className="w-4 h-4 text-lime" /> ICAR Krishi Vigyan Kendra Pune
              </span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Leaf className="w-4 h-4 text-teal" /> Maharashtra Agro-Climatic Grid
              </span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <BarChart3 className="w-4 h-4 text-amber-300" /> Soil Health Card Standard
              </span>
              <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Cpu className="w-4 h-4 text-lime" /> Open-Meteo GIS Micro-Climate
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. STATS ROW - Animated High-Impact Metrics                  */}
      {/* ============================================================ */}
      <section id="impact" className="py-12 border-y border-white/5 bg-[#091510]/80 px-4 w-full overflow-hidden scroll-mt-24">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-lime font-bold">
                {t('steps_heading_badge')}
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white mt-1">
                {t('steps_title')}
              </h3>
            </div>
            <ProvenanceBadge type="Demo data" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 min-w-0">
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1B14] border border-white/5 text-left relative overflow-hidden min-w-0 hover:border-lime/30 transition-all shadow-xl">
              <div className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-lime mb-1 truncate">
                <CountUpNumber end={840} suffix=" kg" />
              </div>
              <div className="text-sm font-bold text-white">{t('stats_co2_lbl')}</div>
              <p className="text-[11px] text-neutral-400 mt-1">{t('hero_badge_stubble')}</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1B14] border border-white/5 text-left relative overflow-hidden min-w-0 hover:border-teal/30 transition-all shadow-xl">
              <div className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-teal mb-1 truncate">
                <CountUpNumber end={1250} suffix=" kg" />
              </div>
              <div className="text-sm font-bold text-white">{t('stats_batches_lbl')}</div>
              <p className="text-[11px] text-neutral-400 mt-1">{t('hero_badge_circular')}</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1B14] border border-white/5 text-left relative overflow-hidden min-w-0 hover:border-amber-400/30 transition-all shadow-xl">
              <div className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-amber-300 mb-1 truncate">
                <CountUpNumber end={42} suffix="%" />
              </div>
              <div className="text-sm font-bold text-white">{t('stats_savings_lbl')}</div>
              <p className="text-[11px] text-neutral-400 mt-1">{t('hero_badge_kvk')}</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1B14] border border-white/5 text-left relative overflow-hidden min-w-0 hover:border-lilac/30 transition-all shadow-xl">
              <div className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-lilac mb-1 truncate">
                <CountUpNumber end={14} suffix=" Zones" />
              </div>
              <div className="text-sm font-bold text-white">{t('stats_farmers_lbl')}</div>
              <p className="text-[11px] text-neutral-400 mt-1">Pune, Nashik, Solapur, Vidarbha</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. FOUR CORE MODULES: Continuous Auto-Scrolling Architecture  */}
      {/* ============================================================ */}
      <section 
        id="modules"
        ref={pillarsSectionRef}
        aria-label="KrishiCycle AI Core Architecture"
        className="py-16 sm:py-24 bg-[#07110D] border-b border-white/5 w-full overflow-hidden scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto px-4 w-full mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-lime font-bold">
                  {t('steps_heading_badge')}
                </span>
                <ProvenanceBadge type="Demo data" size="sm" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white tracking-tight">
                KrishiCycle AI Core Architecture
              </h2>
            </div>

            {/* Continuous Marquee Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass border border-lime/30 text-xs text-lime font-mono shrink-0 shadow-glow-lime">
              <span className="w-2 h-2 rounded-full bg-lime animate-ping" />
              <span>Continuous Flow · Hover to Pause</span>
            </div>
          </div>
        </div>

        {/* Continuous Auto-Scrolling Marquee with Edge Vignettes */}
        <div className="relative w-full overflow-hidden group-marquee [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
          <div className="flex w-fit">
            {/* Primary Track */}
            <div 
              className="animate-marquee-track gap-5 sm:gap-6 pr-5 sm:pr-6 items-stretch"
              style={{ animationPlayState: isPillarsVisible ? undefined : 'paused' }}
            >
              {marqueeSequence.map((mod, idx) => renderModuleCard(mod, `track1-${idx}`, false))}
            </div>

            {/* Seamless Duplicate Loop Track */}
            <div 
              className="animate-marquee-track gap-5 sm:gap-6 pr-5 sm:pr-6 items-stretch"
              aria-hidden="true"
              style={{ animationPlayState: isPillarsVisible ? undefined : 'paused' }}
            >
              {marqueeSequence.map((mod, idx) => renderModuleCard(mod, `track2-${idx}`, true))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. ANIMATED SEED-TO-SPROUT & CIRCULAR "HOW IT WORKS" FLOW     */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 max-w-7xl mx-auto w-full overflow-hidden scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-lime font-bold">
            {t('steps_heading_badge')}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white mt-1 tracking-tight">
            {t('steps_title')}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2.5 max-w-xl mx-auto">
            {t('steps_subtitle')}
          </p>
        </div>

        {/* Interactive Seed-to-Sprout & Compost Maturation Showcase */}
        <div className="p-6 sm:p-10 rounded-3xl sm:rounded-4xl bg-gradient-to-br from-[#0B1711] via-[#0E2018] to-[#0A1610] border border-white/10 shadow-2xl mb-14 relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[300px] bg-lime/10 rounded-full blur-[100px] pointer-events-none -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Interactive Stage Stepper */}
            <div className="lg:col-span-6 space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-lime font-bold">
                {t('steps_heading_badge')}
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white mb-4">
                {t('steps_title')}
              </h3>

              <div className="space-y-2.5">
                {growthStages.map((stage) => {
                  const Icon = stage.icon;
                  const isCurrent = activeGrowthStage === stage.id;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => setActiveGrowthStage(stage.id)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isCurrent
                          ? 'bg-white/10 border-lime/40 shadow-glow-lime'
                          : 'bg-black/20 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isCurrent ? 'bg-lime text-ink' : 'bg-white/5 text-neutral-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-lime font-bold uppercase">
                            {stage.step}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400">
                            {stage.stat}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-0.5">
                          {stage.title}
                        </h4>
                        <p className="text-xs text-neutral-300/80 leading-relaxed">
                          {stage.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Animated Seed-to-Sprout Visual Diagram */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-[#07110D]/90 border border-white/10 relative min-h-[360px]">
              
              {/* Dynamic Animated Soil Horizon & Plant */}
              <div className="relative w-full h-64 flex flex-col items-center justify-end overflow-hidden rounded-2xl">
                
                {/* Sunlight / Ambient Ray */}
                <div className="absolute top-2 w-32 h-32 bg-amber-300/15 rounded-full blur-2xl" />

                {/* Animated Seedling & Roots Graphic based on active stage */}
                <svg viewBox="0 0 200 220" className="w-48 sm:w-56 h-auto z-10 overflow-visible">
                  <defs>
                    <linearGradient id="sproutGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#1F5A3D" />
                      <stop offset="60%" stopColor="#7CCFC4" />
                      <stop offset="100%" stopColor="#C8F23B" />
                    </linearGradient>
                    <linearGradient id="soilLayerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1B150F" />
                      <stop offset="100%" stopColor="#0B0907" />
                    </linearGradient>
                  </defs>

                  {/* Soil Line Horizon */}
                  <line x1="10" y1="140" x2="190" y2="140" stroke="#3A2D1F" strokeWidth="2.5" strokeDasharray="4 2" />

                  {/* Dark Organic Compost Bed Layer */}
                  <rect x="10" y="140" width="180" height="70" rx="6" fill="url(#soilLayerGradient)" opacity="0.8" />
                  
                  {/* Organic Bio-Carbon Nutrients Floating Particles in Soil */}
                  <circle cx="40" cy="160" r="2.5" fill="#C8F23B" opacity="0.6" className="animate-ping" />
                  <circle cx="85" cy="180" r="2" fill="#7CCFC4" opacity="0.8" />
                  <circle cx="140" cy="165" r="3" fill="#C8F23B" opacity="0.5" />
                  <circle cx="165" cy="190" r="2" fill="#F4B740" opacity="0.6" />

                  {/* STAGE 0: Dormant Seed with Biomass Stubble */}
                  {activeGrowthStage === 0 && (
                    <g className="transition-all duration-500">
                      <ellipse cx="100" cy="145" rx="8" ry="6" fill="#A88B57" stroke="#3A2D1F" strokeWidth="1.5" />
                      {/* Dry field residue scatter */}
                      <line x1="60" y1="135" x2="85" y2="142" stroke="#8C7355" strokeWidth="2" />
                      <line x1="115" y1="138" x2="145" y2="136" stroke="#8C7355" strokeWidth="2" />
                      <text x="100" y="80" textAnchor="middle" fill="#C8F23B" fontSize="11" fontFamily="monospace" fontWeight="bold">
                        Collecting Crop Stubble
                      </text>
                    </g>
                  )}

                  {/* STAGE 1: Seed Imbibition & Taproot Emergence */}
                  {activeGrowthStage === 1 && (
                    <g className="transition-all duration-500">
                      <ellipse cx="100" cy="144" rx="9" ry="7" fill="#7A6840" />
                      {/* Emerging early taproot */}
                      <path d="M 100 148 Q 98 165, 103 180" stroke="#E6F9A2" strokeWidth="2" fill="none" />
                      <circle cx="100" cy="138" r="3" fill="#C8F23B" />
                      <text x="100" y="70" textAnchor="middle" fill="#C8F23B" fontSize="11" fontFamily="monospace" fontWeight="bold">
                        AI C:N Optimization 28:1
                      </text>
                    </g>
                  )}

                  {/* STAGE 2: Deep Root Network & Emerging Sprout */}
                  {activeGrowthStage === 2 && (
                    <g className="transition-all duration-500">
                      {/* Deep fibrous root network */}
                      <path d="M 100 144 Q 95 165, 100 195" stroke="#C8F23B" strokeWidth="2" fill="none" />
                      <path d="M 100 160 Q 80 175, 70 190" stroke="#7CCFC4" strokeWidth="1.5" fill="none" />
                      <path d="M 100 165 Q 120 180, 135 190" stroke="#7CCFC4" strokeWidth="1.5" fill="none" />
                      
                      {/* Sprout Shoot piercing soil */}
                      <path d="M 100 144 Q 100 115, 100 95" stroke="url(#sproutGradient)" strokeWidth="3" fill="none" />
                      {/* Small young cotyledon leaves */}
                      <path d="M 100 95 Q 85 85, 80 95 Q 92 102, 100 95" fill="#C8F23B" />
                      <path d="M 100 95 Q 115 85, 120 95 Q 108 102, 100 95" fill="#7CCFC4" />
                      
                      <text x="100" y="60" textAnchor="middle" fill="#7CCFC4" fontSize="11" fontFamily="monospace" fontWeight="bold">
                        Thermophilic Aeration 56°C
                      </text>
                    </g>
                  )}

                  {/* STAGE 3: Full Canopy Sprouting with Radiant Foliage */}
                  {activeGrowthStage === 3 && (
                    <g className="transition-all duration-500">
                      {/* Powerful organic root network */}
                      <path d="M 100 140 Q 95 168, 100 200" stroke="#C8F23B" strokeWidth="2.5" fill="none" />
                      <path d="M 100 155 Q 75 170, 55 190" stroke="#7CCFC4" strokeWidth="2" fill="none" />
                      <path d="M 100 160 Q 125 175, 145 190" stroke="#7CCFC4" strokeWidth="2" fill="none" />
                      <path d="M 97 175 Q 85 190, 80 205" stroke="#C8F23B" strokeWidth="1.5" fill="none" />
                      <path d="M 103 175 Q 115 190, 120 205" stroke="#C8F23B" strokeWidth="1.5" fill="none" />

                      {/* Vigorous Tall Plant Stem */}
                      <path d="M 100 140 Q 101 90, 100 50" stroke="url(#sproutGradient)" strokeWidth="3.5" fill="none" />
                      
                      {/* Lower Leaves */}
                      <path d="M 100 105 C 70 95, 60 120, 100 115" fill="#2B7A53" stroke="#C8F23B" strokeWidth="0.8" />
                      <path d="M 100 100 C 130 90, 140 115, 100 110" fill="#2B7A53" stroke="#C8F23B" strokeWidth="0.8" />

                      {/* Upper Vibrant Foliage */}
                      <path d="M 100 70 C 65 50, 60 85, 100 75" fill="#7CCFC4" stroke="#C8F23B" strokeWidth="1" />
                      <path d="M 100 65 C 135 45, 140 80, 100 70" fill="#C8F23B" stroke="#1F5A3D" strokeWidth="1" />

                      {/* Top Growth Bud */}
                      <circle cx="100" cy="48" r="4.5" fill="#C8F23B" className="shadow-glow-lime" />

                      <text x="100" y="28" textAnchor="middle" fill="#C8F23B" fontSize="11" fontFamily="monospace" fontWeight="bold">
                        Living Soil & High Yield
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Status pill under visual */}
              <div className="mt-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-xs font-mono text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                <span>Active Cycle: {growthStages[activeGrowthStage].title}</span>
              </div>
            </div>

          </div>
        </div>

        {/* 5 Circular Flow Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 min-w-0">
          {[
            { step: '01', title: t('crops_tab_recommendation'), desc: t('mod_crop_desc'), icon: Sprout },
            { step: '02', title: t('crops_tab_fertilizer'), desc: t('crops_demand_headline'), icon: Recycle },
            { step: '03', title: t('crops_tab_resources'), desc: t('make_subtitle'), icon: Activity },
            { step: '04', title: t('market_title'), desc: t('mod_market_desc'), icon: ShoppingBag },
            { step: '05', title: t('Crops Tasks'), desc: t('crops_sow_harvest_title'), icon: ShieldCheck },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-3xl bg-[#0D1B14] border border-white/5 text-left relative flex flex-col justify-between hover:border-lime/30 transition-all shadow-xl min-w-0 group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-lime">
                      {item.step}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 group-hover:text-lime group-hover:border-lime/40 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-white/5 text-[10px] text-emerald-400 font-mono flex items-center justify-between">
                  <span>Step {item.step}</span>
                  <span>Continuous Flow →</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. PROBLEM & SOLUTION STATEMENT                               */}
      {/* ============================================================ */}
      <section className="py-14 sm:py-20 px-4 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 mb-3">
            <span>{t('prob_badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white leading-tight [text-wrap:balance]">
            {t('prob_title')}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto">
            {t('prob_point1')}
          </p>
        </div>

        {/* Challenge Interactive Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {challengeTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-lime text-ink shadow-glow-lime font-bold'
                    : 'liquid-glass text-neutral-300 hover:text-white border border-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Challenge Spotlight Box */}
        {(() => {
          const tab = challengeTabs.find((t) => t.id === activeTab) || challengeTabs[0];
          return (
            <div className="p-6 sm:p-8 rounded-3xl sm:rounded-4xl bg-gradient-to-br from-[#0D1B14] to-[#12261C] border border-surface-darkborder shadow-2xl max-w-3xl mx-auto text-left w-full min-w-0">
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-lime font-bold">
                  {tab.subtitle}
                </span>
                <ProvenanceBadge type="Demo data" size="sm" />
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-2">
                {tab.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-5">
                {tab.desc}
              </p>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-lime shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-emerald-200">
                  {tab.highlight}
                </span>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ============================================================ */}
      {/* 6. CINEMATIC FINAL CALL TO ACTION (Award-Worthy Banner)       */}
      {/* ============================================================ */}
      <section className="py-14 sm:py-20 px-4 max-w-6xl mx-auto w-full">
        <div className="relative p-8 sm:p-14 rounded-4xl overflow-hidden border border-lime/30 bg-[#0B1711]/90 shadow-2xl backdrop-blur-2xl text-center">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-lime/15 rounded-full blur-[120px] pointer-events-none -z-10" />

          <span className="text-xs font-mono uppercase tracking-wider text-lime font-bold mb-3 block">
            {t('cta_title')}
          </span>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-tight leading-tight max-w-2xl mx-auto">
            {t('hero_title_line1')}{' '}
            <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-lime to-teal-300 font-normal">
              {t('hero_title_highlight')}
            </span>
          </h2>

          <p className="mt-4 text-xs sm:text-base text-neutral-300 max-w-xl mx-auto leading-relaxed">
            {t('cta_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8">
            <button
              onClick={handleDemoFarmerJourney}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-lime text-ink font-display font-black text-sm sm:text-base hover:bg-lime-hover transition-all shadow-[0_0_30px_rgba(200,242,59,0.5)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{t('cta_btn_demo')}</span>
              <ArrowRight className="w-4 h-4 text-ink" />
            </button>
            <button
              onClick={handleCreateAccount}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full liquid-glass border border-white/15 text-white font-display font-bold text-sm sm:text-base hover:border-lime/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t('cta_btn_register')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. CLEAN PROFESSIONAL FOOTER                                 */}
      {/* ============================================================ */}
      <footer className="mt-6 border-t border-white/10 pt-10 pb-6 px-4 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 text-center md:text-left">
          <div className="space-y-2">
            <BrandLogo variant="footer" to="/" showSubtitle={true} />
            <p className="text-xs text-neutral-400 max-w-md">
              {t('footer_tagline')}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <ResetDemoButton />
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <div className="p-4 rounded-2xl bg-[#0D1B14] border border-white/5 text-[10px] sm:text-[11px] text-neutral-400 leading-relaxed text-center">
          <p className="font-semibold text-neutral-300 mb-0.5">
            {t('disclaimer_demo_title')}
          </p>
          <p>
            {t('disclaimer_demo_body')}
          </p>
        </div>
      </footer>
    </div>
  );
};
