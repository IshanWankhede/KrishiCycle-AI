# 04 — Animation (modern, smooth, tasteful)

## Global and landing
- Lenis smooth scroll globally, synced with GSAP ScrollTrigger.
- Landing: hero text blur-in word by word, hero image scale/parallax, stats count up when scrolled into view, the 4 modules as a pinned horizontal-scroll card carousel, section reveals with stagger.

## motion (framer-motion)
Page transitions (fade + slight rise), shared-layout animation for the nav active pill, card hover lift + spotlight glow following the cursor, magnetic CTA buttons, animated progress rings and bars, step-by-step stepper transitions, order timeline animating each stage, toast slide-ins.

## Micro
Button press scale, skeleton shimmer loading, check-mark draw animation on task completion, small canvas-free CSS/SVG confetti burst when an order is placed or a batch is completed.

## Accessibility and performance
Respect `prefers-reduced-motion`: disable parallax and pins, reduce to simple fades. Keep 60fps: no heavy WebGL, limit blur layers. Clean up ScrollTrigger/Lenis on unmount and route change.
