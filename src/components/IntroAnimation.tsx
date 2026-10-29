import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import refVideo from '../assets/videos/REF VIDEO.mp4';
import voiceAudio from '../assets/audio/Voice.mp3';

export interface IntroAnimationProps {
  /** Called when the intro animation finishes or is skipped */
  onComplete: () => void;
  /** Force play regardless of sessionStorage (used for 'Watch Intro' buttons) */
  forcePlay?: boolean;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({
  onComplete,
  forcePlay = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Complete and exit handler with safety guard
  const handleFinish = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);

    // Stop audio immediately
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {
        // Safe guard
      }
    }
    // Pause video
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {
        // Safe guard
      }
    }

    try {
      sessionStorage.setItem('krishicycle_intro_seen', 'true');
    } catch {
      // Ignore sessionStorage issues in restricted private browsing
    }

    // Allow smooth fade out before triggering onComplete
    setTimeout(() => {
      onComplete();
    }, 600);
  }, [isExiting, onComplete]);

  // Synchronized playback trigger with sound on by default
  const playBoth = useCallback(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
    }

    if (audio) {
      audio.muted = false;
      audio.currentTime = video.currentTime;
      const promise = audio.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // In case the browser enforces user gesture policy on initial page load,
          // the global pointerdown/keydown listener will immediately unlock it
        });
      }
    }
  }, []);

  // Unlock audio immediately on first user interaction if browser autoplay blocked it
  useEffect(() => {
    const unlockAudio = () => {
      const audio = audioRef.current;
      const video = videoRef.current;
      if (audio && video) {
        audio.muted = false;
        if (audio.paused) {
          audio.currentTime = video.currentTime;
          audio.play().catch(() => {});
        }
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Session check & reduced motion check on mount
  useEffect(() => {
    if (!forcePlay) {
      try {
        const seen = sessionStorage.getItem('krishicycle_intro_seen');
        if (seen === 'true') {
          onComplete();
          return;
        }
      } catch {
        // Fall through
      }

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        onComplete();
        return;
      }
    }

    // Lock body scroll while intro is playing
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Safety timeout: guaranteed transition after 25 seconds even if video stalls
    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, 25000);

    return () => {
      document.body.style.overflow = origOverflow;
      clearTimeout(safetyTimer);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [forcePlay, handleFinish, onComplete]);

  // Floating ambient organic dust particles in background canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; size: number; speedY: number; speedX: number; opacity: number }[] = [];
    const count = Math.min(36, Math.floor(window.innerWidth / 35));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.2 + 0.8,
        speedY: -(Math.random() * 0.45 + 0.2),
        speedX: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 242, 59, ${p.opacity * 0.7})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#C8F23B';
        ctx.fill();
      });
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Keyboard shortcut listener: ESC or Space to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFinish]);

  // Video time tracking and real-time audio synchronization
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    const dur = video.duration || 10;
    setProgress(Math.min(100, (video.currentTime / dur) * 100));

    // Keep audio tightly synchronized with video
    if (audio && !audio.paused) {
      const drift = Math.abs(audio.currentTime - video.currentTime);
      if (drift > 0.25) {
        audio.currentTime = video.currentTime;
      }
    }
  };

  const handleVideoPlay = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (audio && video) {
      audio.muted = false;
      audio.currentTime = video.currentTime;
      audio.play().catch(() => {});
    }
  };

  const handleVideoPause = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="krishicycle-intro-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[120] w-full h-screen max-h-screen overflow-hidden flex flex-col items-center justify-center bg-[#050D09] text-white select-none"
          style={{
            background: 'radial-gradient(ellipse 90% 90% at 50% 48%, #0C1E14 0%, #050D09 65%, #020604 100%)',
          }}
        >
          {/* Synchronized voiceover audio element — sound active by default */}
          <audio
            ref={audioRef}
            src={voiceAudio}
            preload="auto"
            playsInline
            muted={false}
          />

          {/* Ambient organic pollen particle canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-0 opacity-80"
          />

          {/* Glowing ambient aura behind the video */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-4xl h-[60vh] rounded-full pointer-events-none blur-[90px] opacity-35"
            style={{
              background: 'radial-gradient(circle, rgba(200, 242, 59, 0.28) 0%, rgba(20, 184, 166, 0.15) 50%, transparent 75%)',
            }}
          />

          {/* ─────────────────────────────────────────────────────────────
              CENTER: Cinematic Video Theatre Card (Clean & Immersive)
              ───────────────────────────────────────────────────────────── */}
          <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-6 w-full max-w-6xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_60px_rgba(200,242,59,0.15)] border border-white/15 bg-[#F6F3EB]"
            >
              {/* HTML5 Video element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={true} // Video track stays muted so Voice.mp3 narration delivers crystal-clear audio
                preload="auto"
                onLoadedData={() => {
                  setIsLoaded(true);
                  playBoth();
                }}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleFinish}
                onError={() => {
                  setHasError(true);
                  handleFinish();
                }}
                className={`w-full h-full object-contain transition-opacity duration-500 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <source src={refVideo} type="video/mp4" />
                <source src="/videos/krishicycle-intro.mp4" type="video/mp4" />
                Your browser does not support high-definition video playback.
              </video>

              {/* Loading placeholder prior to video canplay */}
              {!isLoaded && !hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07130C] text-white">
                  <div className="w-10 h-10 rounded-full border-2 border-lime border-t-transparent animate-spin mb-3" />
                  <p className="text-xs font-semibold text-white/60 tracking-wider uppercase">
                    Loading Cinematic Experience...
                  </p>
                </div>
              )}

              {/* Progress bar inside the video frame bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 overflow-hidden">
                <div
                  className="h-full transition-all duration-150 ease-out shadow-[0_0_10px_#C8F23B]"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #14B8A6 0%, #C8F23B 100%)',
                  }}
                />
              </div>
            </motion.div>
          </main>

          {/* Discreet bottom skip hint */}
          <footer className="relative z-20 pb-3 text-center">
            <button
              onClick={handleFinish}
              className="text-[11px] text-white/35 hover:text-white/70 font-medium transition-colors cursor-pointer"
            >
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white/60">ESC</kbd> or click to skip intro
            </button>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
