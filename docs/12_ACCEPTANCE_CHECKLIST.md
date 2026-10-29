# 12 — Acceptance Checklist (agent must verify before finishing)

## Build
- [ ] `npm install` and `npm run build` pass with zero errors; `npm run dev` serves the app
- [ ] State persists across reload (localStorage); "Reset demo data" works
- [ ] No console errors on any route

## Honesty
- [ ] ProvenanceBadge on every data value
- [ ] No use of "certified", "lab-tested", "government verified", "guaranteed yield"
- [ ] No Aadhaar/bank/caste/income fields; no card number fields; no gov logos
- [ ] All required disclaimers present (OTP, payment, soil, boundary, recipe, health, schemes)

## Journey
- [ ] Demo farmer -> language modal -> guide -> dashboard
- [ ] Farm: search, draw polygon (click, undo, close), live area in 4 units, pins, layer toggle, Open-Meteo with fallback, season, area card, save context
- [ ] Crops: scoring v1.0 with coverage meter, tiers, fertilizer plan, resource plan, Make/Buy handoff with prefill, crop cycle with check-ins
- [ ] Make: recipe math normalises to 1, required/available/missing, market handoff and return, valid-transition batch tracker, evidence rules
- [ ] Market: search/filter/sort, drawer, min order/stock, price breakdown, checkout creates exactly ONE order and decrements stock; Sell forms validate; listing statuses
- [ ] Orders: valid transitions only, cancel before PACKED only, review after COMPLETED only (one per order), rating updates
- [ ] Health: upload, scan animation, result, banner
- [ ] Schemes, Profile, floating AI chat (with rule-based fallback)

## Design and motion
- [ ] 4 reference images' language applied (cards, split auth, glass nav, landing)
- [ ] Lenis + GSAP landing (blur-in, parallax, count-up, pinned horizontal modules)
- [ ] Reduced-motion respected; images have fallbacks; mobile bottom tab bar works
- [ ] English/Hindi/Marathi with safe fallback; switcher always visible

## Repair prompts (only if something is off)
- "Run npm run build, fix every error, then re-check docs/12 and fix every unchecked item. Do not stop until all pass."
- "Audit every button and link across all routes for dead controls and wire them up."
- "Search the codebase for banned words (certified, lab-tested, government verified, guaranteed) and any missing disclaimers; fix them."
