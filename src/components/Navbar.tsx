import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  FlaskConical,
  ShoppingBag,
  ClipboardList,
  Home,
  User,
  Globe,
  Activity,
  Award,
  Layers,
  LogOut,
  ChevronDown,
  ArrowRight,
  Sprout,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { useT } from '../i18n/useT';
import { Language } from '../types';

interface NavItemDef {
  id: string;
  to: string;
  labelKey: string;
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  isProtected: boolean;
}

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isDemoMode, setLanguage, language, signOut } = useAuthStore();
  const { showToast } = useUIStore();
  const { t } = useT();
  const location = useLocation();
  const navigate = useNavigate();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeLandingSection, setActiveLandingSection] = useState<string>('');

  // Check if current page is the public landing page
  const isLandingPage = location.pathname === '/' || location.pathname === '';

  const landingNavLinks = [
    { id: 'features', label: t('nav_features') },
    { id: 'modules', label: t('nav_crops') },
    { id: 'how-it-works', label: t('nav_how_it_works') },
    { id: 'impact', label: t('nav_testimonials') },
  ];

  // Active section scroll spy for landing page
  useEffect(() => {
    if (!isLandingPage) return;

    const sections = ['features', 'impact', 'modules', 'how-it-works'];
    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      const navOffset = 180;

      let found = '';
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop - navOffset;
          const bottom = top + el.offsetHeight;
          if (scrollY >= top && scrollY < bottom) {
            found = sectionId;
          }
        }
      }
      setActiveLandingSection(found);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLandingPage]);

  const handleLandingNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();

    if (!isLandingPage) {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const target = document.getElementById(sectionId);
        if (target) {
          const navOffset = 84;
          const targetY = target.getBoundingClientRect().top + window.pageYOffset - navOffset;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }, 150);
      return;
    }

    const target = document.getElementById(sectionId);
    if (target) {
      const navOffset = 84;
      const targetY = target.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      window.history.pushState(null, '', `#${sectionId}`);
      setActiveLandingSection(sectionId);
    }
  };

  const navItems: NavItemDef[] = [
    { id: 'home', to: isAuthenticated ? '/dashboard' : '/', labelKey: 'nav_home', defaultLabel: 'Home', icon: Home, isProtected: false },
    { id: 'farm', to: '/farm', labelKey: 'nav_farm', defaultLabel: 'My Farm', icon: MapPin, isProtected: true },
    { id: 'crops', to: '/crops', labelKey: 'nav_crops', defaultLabel: 'Crops', icon: Sprout, isProtected: true },
    { id: 'make', to: '/make', labelKey: 'nav_make', defaultLabel: 'Make', icon: FlaskConical, isProtected: true },
    { id: 'batches', to: '/batches', labelKey: 'nav_batches', defaultLabel: 'My Batch', icon: Layers, isProtected: true },
    { id: 'market', to: '/market', labelKey: 'nav_market', defaultLabel: 'Marketplace', icon: ShoppingBag, isProtected: true },
    { id: 'orders', to: '/orders', labelKey: 'nav_orders', defaultLabel: 'Orders', icon: ClipboardList, isProtected: true },
    { id: 'health', to: '/health', labelKey: 'nav_health', defaultLabel: 'Crop Health', icon: Activity, isProtected: true },
    { id: 'schemes', to: '/schemes', labelKey: 'nav_schemes', defaultLabel: 'Govt Schemes', icon: Award, isProtected: true },
  ];

  const handleNavClick = (e: React.MouseEvent, item: NavItemDef) => {
    e.preventDefault();

    // Check protected navigation
    if (item.isProtected && !isAuthenticated) {
      showToast('Please sign in or create a farmer account to access this feature.', 'warning');
      navigate(`/auth?mode=signin&redirect=${encodeURIComponent(item.to)}`);
      return;
    }

    // Unauthenticated user clicking home stays on public landing page
    if (!isAuthenticated && item.id === 'home') {
      navigate('/');
      return;
    }

    navigate(item.to);
  };

  const handleSignOut = () => {
    signOut();
    setProfileDropdownOpen(false);
    showToast('Signed out successfully. Session ended.', 'info');
    navigate('/');
  };

  return (
    <header className={
      isLandingPage
        ? "fixed top-0 left-0 right-0 z-50 w-full px-3 sm:px-6 pt-3 sm:pt-4 transition-all pointer-events-none"
        : "sticky top-0 z-40 w-full px-2 sm:px-4 md:px-6 py-2.5 transition-all bg-surface-dark/90 backdrop-blur-md border-b border-white/5"
    }>
      <div className={
        isLandingPage
          ? "max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full liquid-glass-pill border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl pointer-events-auto"
          : "max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0"
      }>

        {/* ── Official Brand Logo ── */}
        <BrandLogo
          variant="navbar"
          to="/"
          showSubtitle={!isLandingPage}
        />

        {/* Landing Page Navigation vs Dashboard Navigation */}
        {isLandingPage ? (
          <nav
            aria-label="Landing Navigation"
            className="hidden md:flex items-center gap-1 px-2 py-1"
          >
            {landingNavLinks.map((item) => {
              const isActive = activeLandingSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleLandingNavClick(e, item.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-lime text-ink font-bold shadow-glow-lime'
                      : 'text-neutral-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        ) : (
          /* Compact Icon-First Animated Navbar for Authenticated Pages */
          <nav
            aria-label="Main Navigation"
            className="flex items-center gap-1 liquid-glass-pill px-2 py-1 rounded-full border border-lime/20 shadow-2xl max-w-full overflow-x-auto no-scrollbar scroll-smooth"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const label = t(item.labelKey as any) || item.defaultLabel;
              const isActive = item.to === '/'
                ? location.pathname === '/'
                : location.pathname === item.to || (item.id === 'home' && location.pathname === '/dashboard');

              return (
                <button
                  key={item.id}
                  onClick={(e) => handleNavClick(e, item)}
                  title={label}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center gap-1.5 h-8 sm:h-9 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-lime text-ink font-bold shadow-glow-lime px-3'
                      : 'text-neutral-300 hover:text-white hover:bg-white/10 px-2 sm:px-2.5'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-ink scale-105' : 'text-neutral-300'}`} />

                  {/* Animated Text Label (revealed smoothly when active) */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.span
                        key={item.id}
                        initial={{ width: 0, opacity: 0, scale: 0.9 }}
                        animate={{ width: 'auto', opacity: 1, scale: 1 }}
                        exit={{ width: 0, opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden inline-block text-[11px] sm:text-xs tracking-tight"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Section Controls */}
        {/* Right Section Controls: Language Selector + User Action */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Universal Language Switcher — available on Landing & Dashboard */}
          <div className="flex items-center liquid-glass rounded-full px-1 sm:px-1.5 py-0.5 sm:py-1 border border-white/10 text-[10px] sm:text-[11px] font-semibold text-neutral-300 shadow-sm" role="group" aria-label={t('nav_lang_select')}>
            <Globe className="w-3 h-3 text-lime mr-0.5 sm:mr-1 ml-0.5 shrink-0" />
            {(['en', 'hi', 'mr'] as Language[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                aria-pressed={language === l}
                className={`px-1.5 sm:px-2 py-0.5 rounded-full transition-all text-[10px] sm:text-[11px] cursor-pointer ${
                  language === l
                    ? 'bg-lime text-ink font-bold shadow-sm'
                    : 'hover:text-white text-neutral-300'
                }`}
              >
                {l === 'en' ? 'EN' : l === 'hi' ? 'हिन्दी' : 'मराठी'}
              </button>
            ))}
          </div>

          {/* LANDING PAGE RIGHT CONTROLS */}
          {isLandingPage ? (
            isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="px-3.5 sm:px-4 py-1.5 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{t('nav_dashboard')}</span>
                  {isDemoMode && <span className="text-[10px] bg-ink/20 px-1 rounded font-mono">{t('badge_demo_data')}</span>}
                </Link>
                <button
                  onClick={handleSignOut}
                  title={t('nav_sign_out')}
                  aria-label={t('nav_sign_out')}
                  className="p-1.5 rounded-full liquid-glass border border-white/10 text-neutral-300 hover:text-rose-400 hover:border-rose-400/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => navigate('/auth?mode=signin')}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-full border border-white/15 hover:border-white/30 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  {t('nav_sign_in')}
                </button>
                <button
                  onClick={() => navigate('/auth?mode=signup')}
                  className="px-3 sm:px-4 py-1.5 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <span>{t('nav_get_started')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink" />
                </button>
              </div>
            )
          ) : (
            /* DASHBOARD / AUTHENTICATED PAGES RIGHT CONTROLS */
            <div className="flex items-center gap-2">
              {/* Farmer Profile / Dropdown */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full liquid-glass border border-white/10 hover:border-lime/30 transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-lime font-bold text-xs border border-lime/40">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden md:block text-left text-[11px] leading-tight">
                      <div className="font-bold text-white group-hover:text-lime transition-colors truncate max-w-[90px]">
                        {user.name.split(' ')[0]}
                      </div>
                      <div className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                        <span>{user.district || 'Pune'}</span>
                        {isDemoMode && <span>• {t('badge_demo_data')}</span>}
                      </div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:text-white transition-colors" />
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-48 rounded-2xl liquid-glass border border-lime/30 shadow-2xl py-2 z-50 text-left"
                      >
                        <div className="px-3.5 py-2 border-b border-white/10">
                          <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            {isDemoMode ? 'Demo Session (Pune)' : user.phone}
                          </p>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-xs text-neutral-200 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-lime" />
                          <span>{t('nav_profile')}</span>
                        </Link>

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{t('nav_sign_out')}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/auth?mode=signin')}
                  className="px-3.5 py-1.5 rounded-full bg-lime text-ink font-bold text-xs hover:bg-lime-hover shadow-glow-lime transition-all cursor-pointer"
                >
                  {t('nav_sign_in')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
