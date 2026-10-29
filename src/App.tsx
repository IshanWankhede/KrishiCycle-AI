import React, { useEffect } from 'react';
import { HashRouter, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AppRoutes } from './routes';
import { Navbar } from './components/Navbar';
import { MobileTabBar } from './components/MobileTabBar';
import { AiAgronomistWidget } from './components/AiAgronomistWidget';
import { ToastContainer } from './components/ToastContainer';
import { LanguageSuggestionModal } from './components/LanguageSuggestionModal';
import { DemoTourModal } from './components/DemoTourModal';
import { ConfettiBurst } from './components/ConfettiBurst';
import { IntroAnimation } from './components/IntroAnimation';
import { useUIStore } from './store/uiStore';

gsap.registerPlugin(ScrollTrigger);

// Route-aware scroll to top
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const AppContent: React.FC = () => {
  const { isConfettiActive, isIntroOpen, openIntro, closeIntro } = useUIStore();
  const location = useLocation();

  // Initial session check: On initial website open on the landing page, trigger intro once
  useEffect(() => {
    const isRoot = location.pathname === '/' || location.pathname === '';
    if (isRoot) {
      try {
        const seen = sessionStorage.getItem('krishicycle_intro_seen');
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (seen !== 'true' && !prefersReducedMotion) {
          openIntro();
        }
      } catch {
        // Safe fallback
      }
    }
  }, []); // Only once per session on mount

  // Lenis Smooth Scrolling synced with GSAP ScrollTrigger
  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let lenis: Lenis | null = null;
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      });

      lenis.on('scroll', ScrollTrigger.update);

      const tickerCb = (time: number) => {
        lenis?.raf(time * 1000);
      };

      gsap.ticker.add(tickerCb);
      gsap.ticker.lagSmoothing(0);

      return () => {
        gsap.ticker.remove(tickerCb);
        lenis?.destroy();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    } catch {
      // Fallback gracefully without smooth scroll
    }
  }, []);

  const isAuthPage = location.pathname === '/auth';
  const isLandingPage = location.pathname === '/' || location.pathname === '';

  return (
    <div className="min-h-screen bg-surface-dark text-white font-sans antialiased flex flex-col selection:bg-lime selection:text-ink max-w-full overflow-x-hidden">
      <ScrollToTop />

      {/* Cinematic Full-Screen Intro Animation */}
      {isIntroOpen && (
        <IntroAnimation onComplete={closeIntro} forcePlay={true} />
      )}

      {/* Global Top Navbar — hidden on auth page and while intro is playing */}
      {!isAuthPage && !isIntroOpen && <Navbar />}

      {/* Main Page Routing */}
      <main className={`w-full max-w-full overflow-x-hidden ${isAuthPage ? '' : 'flex-1'}`}>
        <AppRoutes />
      </main>

      {/* Mobile Floating Bottom Tab Bar (Only inside authenticated dashboard/modules) */}
      {!isAuthPage && !isLandingPage && <MobileTabBar />}

      {/* Floating AI Agronomist Chat Widget (Removed on landing page and auth page) */}
      {!isLandingPage && !isAuthPage && <AiAgronomistWidget />}

      {/* Modals & Portals — Demo tour hidden on auth */}
      <LanguageSuggestionModal />
      {!isAuthPage && <DemoTourModal />}
      <ToastContainer />
      <ConfettiBurst active={isConfettiActive} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
