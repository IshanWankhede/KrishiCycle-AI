# KrishiCycle AI 2.0 — Web Application Guide

**Team:** God's Plan · **Event:** PRISM'26 SOCIOTHON · **Theme:** Smarter Agriculture for Small Farmers

KrishiCycle AI 2.0 is a complete, connected agricultural decision support system and circular bio-economy platform built for smallholder farmers in Maharashtra, India.

---

## Quick Start (How to Run)

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. For cotton leaf diagnosis, start the Python inference service in a separate terminal
python inference_server.py

# 3. Start the development server in another terminal
npm run dev

# 4. Build for production (verifies TypeScript & assets)
npm run build

# 5. Preview production build locally
npm run preview
```

On Windows, `start_inference.bat` can be used instead of `python inference_server.py`.
The cotton diagnostic requires the inference service to be running on port `5001`;
Vite forwards `/api` requests to it. If that service is stopped, Vite reports
`ECONNREFUSED 127.0.0.1:5001`. Other crop demo diagnoses do not require it.
The app runs by default at `http://localhost:5173`.

---

## Complete Farmer Journey Walkthrough

1. **Landing Page (`/#/`)**:
   - Hero headline, Cultivo-inspired minimal aesthetic, and circular impact metrics (840 kg CO₂ avoided, 40% input expense reduced).
   - Problem statement tabs and 4-module interactive carousel matching Reference Image 1.
   - Click **"Continue as Demo Farmer (Pune)"** or **"Pitch Demo Tour"**.

2. **Onboarding / Authentication (`/#/auth`)**:
   - Split-screen auth card matching Reference Image 2 with floating glass annotation pills.
   - Simulated mobile OTP sign-in (any 6 digits) and comprehensive farmer registration with Maharashtra district selection.
   - Triggers the location-based language hint modal: *"We suggest Marathi for Pune. Continue in English or switch to Marathi?"*

3. **Farm Land Context (`/#/farm`)**:
   - Interactive Leaflet map with OpenStreetMap Street and Esri Satellite layers.
   - Polygon boundary drawing studio with live WGS-84 geodesic area readout in 4 units: Acres, Guntha (1 Acre = 40 Guntha), Hectares, and Square Meters.
   - Infrastructure pins: House, Compost Shed, Dug Well, Farm Pond, Gate.
   - Live micro-climate weather forecast via Open-Meteo with automatic seasonal detection (Kharif, Rabi, Zaid).
   - "Save Farm Context" button propagates field parameters directly to all subsequent modules.

4. **Module 1: Crop Decision Engine (`/#/crops`)**:
   - Deterministic `cropScoring v1.0` engine (Season 30, Water 25, Soil 20, Budget 15, Rotation 10). Missing parameters decrement the Data Coverage Meter instead of guessing.
   - Suitability tiers: High (≥75), Moderate (50–74), Low (<50).
   - Configurable per-acre fertilizer schedule scaled to field area with organic bio-alternatives.
   - Biomass resource planning calculator with two handoff paths: **"Make Fertilizer"** or **"Buy from Marketplace"**.
   - Sow-to-harvest task timeline with weekly check-in forms that dynamically modify upcoming dates (e.g. monsoon delay shifts sowing +5 days; drought adds mulch task).

5. **Module 2: Make (`/#/make`) → My Batch (`/#/batches`)**:
   - **Make** is a 4-step wizard: select crop → soil & land (carried from your farm profile and Module 1) → formulation (versioned ratio table normalised to 1.00, plain-language AI explanation that never changes the numbers) → raw materials (required vs on-farm vs short, with "Buy from Marketplace" and a "Return to my recipe" path).
   - **Create Batch & Start Step 1** creates a batch (e.g. `KC-TOM-2026-002`) and opens **My Batch**.
   - **My Batch** is the tracker: 11-step timeline enforced by `batchService` (no skipping; locked steps are view-only), a video guide per step (6 clips in `src/assets/videos`), moisture and temperature gauges, a reading log (Manual or Simulated, never shown as real sensor data), aeration-turn log, test values (Estimated / Kit-measured by me / Lab report uploaded), a simulated growth trial, a printable Batch Passport, and "List on Marketplace" once READY.

6. **Module 3: Circular Farm Marketplace (`/#/market`)**:
   - Peer-to-peer catalog: Raw materials, organic bio-compost sold by farmers, and authorized agro centres.
   - Filter by category, district, and crop suitability; sort by rating or price.
   - Product detail drawer with seller location, usage notes, and demo reviews.
   - Checkout modal with simulated UPI/COD payment: strictly decrements stock and creates an order.
   - Sell tab allowing farmers to list surplus compost directly from their completed batches.

7. **Order Fulfillment & Lifecycle (`/#/orders`)**:
   - Dual Buyer and Seller modes.
   - Enforced order state transitions: `PENDING_PAYMENT` → `CONFIRMED` → `PACKED` → `SHIPPED` → `OUT_FOR_DELIVERY` → `DELIVERED` → `COMPLETED`.
   - Cancellation permitted only before `PACKED`.
   - Verified review submission permitted only after `COMPLETED`.

8. **Module 4: Leaf Diagnostic Scanner (`/#/health`)**:
   - Foliage inspection scanner with laser animation identifying common Maharashtra crop blights (Tomato Early Blight, Cotton Leaf Curl, Onion Purple Blotch).
   - Prominent disclaimer: *"Demo AI suggestion, not a diagnosis. Not a validated model."*
   - Recommends organic remedies (Trichoderma, buttermilk spray, neem extract) and local KVK extension consultation.

9. **AI Agronomist Widget (Floating on all pages)**:
   - Trilingual agricultural consultant (English, Hindi, Marathi) answering compost odor, low heat, and NPK questions.
   - Powered by Gemini if `VITE_GEMINI_API_KEY` is present, with an extensive rule-based fallback.

10. **Schemes Directory (`/#/schemes`) & Profile (`/#/profile`)**:
    - Informational directory for PM-KISAN, Soil Health Card, and PKVY.
    - Profile editor, language toggle, and "Reset Demo Data" button to restore all stores to initial seeds.

---

## Folder Map

```
src/
├── App.tsx                     # Main application container, Lenis scroll, layout
├── main.tsx                    # React DOM entry point
├── routes.tsx                  # HashRouter route configuration
├── vite-env.d.ts               # Vite TypeScript declarations
├── components/
│   └── make/                   # MakeWizard, BatchTracker, BatchTestingModal, BatchPassportModal, GrowthTrialView
├── components/                 # Reusable UI & Glassmorphism Components
│   ├── AiAgronomistWidget.tsx  # Floating liquid glass chat widget
│   ├── ConfettiBurst.tsx       # Canvas-free CSS/SVG celebration animation
│   ├── CountUpNumber.tsx       # Smooth animated number counter
│   ├── DemoTourModal.tsx       # Pitch tour modal for evaluators
│   ├── ImageWithFallback.tsx   # Unsplash image component with SVG fallback
│   ├── LanguageSuggestionModal.tsx # Location-based Marathi/English prompt
│   ├── MagneticButton.tsx      # Spring-physics CTA button
│   ├── MobileTabBar.tsx        # Mobile floating bottom tab bar
│   ├── Navbar.tsx              # Desktop liquid-glass pill navigation bar
│   ├── ProvenanceBadge.tsx     # Mandatory honesty classification badge
│   ├── ResetDemoButton.tsx     # One-click button restoring all demo state
│   ├── ScoreRing.tsx           # SVG circular progress ring
│   ├── SpotlightCard.tsx       # Cursor-tracking radial glow card
│   └── ToastContainer.tsx      # Floating liquid glass toast notifications
├── data/                       # Curated Maharashtra Mock Datasets
│   ├── crops.ts                # 10 comprehensive crops (Tomato, Onion, Cotton...)
│   ├── districts.ts            # 14 Maharashtra districts with regions & villages
│   ├── leafIssues.ts           # Mock foliage blights & organic treatments
│   ├── schemes.ts              # Informational agricultural schemes
│   └── seedData.ts             # Seeded farmer (Balasaheb Patil), field, batch, order
├── i18n/                       # Trilingual Internationalization Engine
│   ├── dictionary.ts           # Typed dictionary for EN, HI, MR
│   ├── formatters.ts           # Currency, area, quantity, and date formatters
│   └── useT.ts                 # React hook with safe English fallback
├── pages/                      # 12 Core Screen Views
│   ├── AuthPage.tsx            # Split-screen auth card per Reference Image 2
│   ├── CropsPage.tsx           # Module 1: Recommendation, fertilizer, tasks
│   ├── DashboardPage.tsx       # Bento grid overview per Reference Image 1
│   ├── FarmPage.tsx            # Leaflet GIS boundary studio & weather
│   ├── GuidePage.tsx           # Onboarding module card carousel
│   ├── HealthPage.tsx          # Module 4: Leaf diagnostic scanner
│   ├── LandingPage.tsx         # Minimal landing page per Reference Image 4
│   ├── MakePage.tsx            # Module 2: Make wizard page
│   ├── BatchesPage.tsx         # Module 2: My Batch tracker page
│   ├── MarketPage.tsx          # Module 3: Buy, Sell, and My Listings
│   ├── OrdersPage.tsx          # Buyer & Seller order lifecycle management
│   ├── ProfilePage.tsx         # Farmer details & Data Provenance specifications
│   └── SchemesPage.tsx         # Informational government scheme cards
├── services/                   # Pure Agronomic & Business Logic Engines
│   ├── aiService.ts            # Gemini API caller + trilingual rule fallback
│   ├── batchService.ts         # Step validation & evidence status rules
│   ├── cropScoring.ts          # cropScoring v1.0 deterministic engine
│   ├── fertilizerService.ts    # Configurable per-acre fertilizer schedules
│   ├── geo.ts                  # Spherical geodesic polygon area calculations
│   ├── orderService.ts         # Enforced order state transitions & cancellations
│   ├── recipeConfig.ts         # Versioned base recipe ratios & adjustments
│   ├── recipeService.ts        # Mathematical normalization & shortfall calculus
│   ├── resourceService.ts      # On-farm biomass & fertilizer budgeting
│   ├── taskPlanner.ts          # Sow-to-harvest task generator & check-in logic
│   └── weatherService.ts       # Open-Meteo live API integration with fallback
├── store/                      # Zustand Persistent Stores (localStorage)
│   ├── authStore.ts            # User profile, simulated OTP, language
│   ├── batchStore.ts           # Formulation batches & temperature sparklines
│   ├── cropStore.ts            # Crop scoring results, fertilizer plan, tasks
│   ├── farmStore.ts            # Field polygons, pins, satellite toggle
│   ├── marketStore.ts          # Listings catalog, search/filter, stock decrement
│   ├── orderStore.ts           # Orders list, state advancement, reviews
│   └── uiStore.ts              # Modals, toasts, chat drawer, tour state
└── styles/
    └── index.css               # Design system tokens, glassmorphism, scrollbars
```

---

## Known Limitations & Prototype Boundaries

1. **Simulated OTP and Payment:** OTP codes and payment gateways are simulated for demo safety. Never enter real bank credentials or credit card numbers.
2. **Weather API:** Uses Open-Meteo's free public endpoint. If network access is restricted or offline, the app seamlessly falls back to pre-seeded Maharashtra weather data labelled *"Demo data"*.
3. **AI Agronomist:** If `VITE_GEMINI_API_KEY` is not provided in `.env`, the Agronomist operates entirely on a curated rule-based knowledge base answering compost odors, pile temperatures, and crop NPK requirements in English, Hindi, and Marathi.
