# 02 — Tech Stack and Structure

## Stack
- React 18/19 + TypeScript + Vite + Tailwind CSS
- react-router-dom with HashRouter
- Zustand with `persist` (localStorage) for all state
- `motion` (framer-motion) for UI animation, layout and page transitions
- GSAP + ScrollTrigger for scroll storytelling
- Lenis smooth scrolling, synced with ScrollTrigger
- lucide-react icons
- Leaflet + OpenStreetMap tiles (proper attribution), optional Esri satellite layer toggle (with attribution)
- recharts for small charts
- Fonts: Manrope or Plus Jakarta Sans (headings), Inter (body), Noto Sans Devanagari (Hindi/Marathi)

Implement React Bits / Skiper UI-style effects yourself as local components (do not fetch them): spotlight/glow cards, blur-text reveal, count-up numbers, magnetic buttons, marquee, tilt cards, aurora/gradient mesh background, shimmer skeletons, animated underline links.

Persist everything in localStorage so reloads keep state.

## Network
Only real network call: Open-Meteo (no key) for weather, with graceful fallback to mock labelled "Demo data".
Optional: if `VITE_GEMINI_API_KEY` is set, use Gemini ONLY for plain-language explanations, chat and the optional leaf-image suggestion. Always have a rule-based fallback. AI must never alter calculations.

## Suggested structure
```
src/
  main.tsx, App.tsx, routes.tsx
  styles/ (tokens, globals)
  i18n/ (dictionary.ts typed, useT.ts, formatters)
  store/ (authStore, farmStore, cropStore, batchStore, marketStore, orderStore, uiStore)
  services/
    cropScoring.ts        (v1.0, ONE file)
    fertilizerService.ts  (configurable per-acre table)
    resourceService.ts
    recipeConfig.ts       (versioned ratios) + recipeService.ts
    orderService.ts       (ONLY place status transitions are enforced)
    batchService.ts       (valid transitions only)
    taskPlanner.ts        (crop-cycle + weekly check-in rules)
    geo.ts                (geodesic polygon area, own code)
    weatherService.ts     (Open-Meteo + fallback)
    aiService.ts          (Gemini optional + rule-based fallback)
  data/ (districts, villages, crops, schemes, listings, outlets, issues)
  components/ (ui, glass, effects, ProvenanceBadge, ImageWithFallback, Stepper, Toast, Confetti, ...)
  pages/ (Landing, Auth, Guide, Dashboard, Farm, Crops, Make, Market, Orders, Health, Schemes, Profile)
```
Keep calculations pure and unit-testable; keep versions (e.g. `cropScoring v1.0`) visible in the UI where relevant.
