# ASSUMPTIONS & DESIGN DECISIONS — KrishiCycle AI 2.0

Team: God's Plan · PRISM'26 SOCIOTHON · Theme: "Smarter Agriculture for Small Farmers"

During the autonomous one-pass build of KrishiCycle AI 2.0, the following sensible defaults and architectural decisions were established:

## 1. Node.js & Environment Runtime
- Node.js LTS (v20.18.0) and npm (10.8.2) were configured locally in the user's environment to allow zero-admin dependency resolution and headless build verification.
- Single-page application routing uses `HashRouter` (`/#/`) to ensure reliable static file previews and client routing across different hosting environments without server-side rewrite dependencies.

## 2. Geo & Land Area Calculations
- Geodesic polygon surface area is implemented using WGS-84 spherical excess integration (`src/services/geo.ts`) rather than projected planar geometry, providing accurate calculations in square meters, acres, hectares, and Maharashtra Gunthas (1 Acre = 40 Guntha).
- All land boundaries are marked with the mandatory banner: *"User-drawn estimate, not an official land record."*

## 3. cropScoring v1.0 Engine
- Implemented as a deterministic, versioned service in `src/services/cropScoring.ts`.
- Weights: Season Fit (30 pts), Water Availability & Irrigation Fit (25 pts), Soil Type & NPK Alignment (20 pts), Budget/Resource Band (15 pts), Preceding Crop Rotation Synergy (10 pts).
- Missing inputs decrement the visible "Data Coverage Meter" rather than substituting imputed or guessed numbers.
- Tiers: High Match (≥75), Moderate (50–74), Low (<50).

## 4. Bio-Fertilizer Mathematical Normalization
- Base compost recipe ratios (`src/services/recipeConfig.ts`): Dry leaves/straw (0.35), kitchen/vegetable scraps (0.30), aged cow dung (0.20), neem cake (0.08), wood ash (0.04), rock phosphate (0.03).
- Adjustments for crop category (fruiting, leafy, root, cereal, pulse) and soil status (low N, low P, low K) are applied dynamically and normalized so the sum of ratios equals exactly 1.00.
- Missing materials display one-click handoff buttons linking to `/market` with the required ingredient pre-filtered.

## 5. Order State Machine & Stock Decrement
- Valid state sequence enforced in `src/services/orderService.ts`:
  `PENDING_PAYMENT` → `CONFIRMED` → `PACKED` → `SHIPPED` → `OUT_FOR_DELIVERY` → `DELIVERED` → `COMPLETED` (plus `CANCELLED`).
- Order cancellation is strictly restricted to stages before `PACKED`.
- Stock is automatically decremented upon placing an order and restored if cancelled.
- Rating and reviews can only be submitted for `COMPLETED` orders (one per order), dynamically recalculating the seller's average rating.

## 6. Trilingual i18n & Honesty Classification
- Central dictionary supports English (`en`), Hindi (`hi`), and Marathi (`mr`) with safe English fallback so missing keys never crash.
- Provenance badges are applied to every data point (`Demo data`, `Estimated`, `User-provided`, `Live (Open-Meteo)`, `Simulated`).
- Prohibited claims ("certified", "lab-tested", "government verified", "guaranteed yield") are banned from all product listings and marketing copy.

## 7. Make + Batch modules (ported from the previous KrishiCycle AI build)
- Wizard, tracker, test modal, passport and growth-trial screens follow the previous project's flow and layout, restyled with the 2.0 tokens.
- Honesty rules still win: "Accredited Lab Certified" became "Lab report uploaded"; "Grade-A / certify / pathogen-free" wording was removed; the IoT probe is labelled "Simulated"; the QR is a non-scannable placeholder; the growth trial is labelled "Simulated sample"; prefilled test numbers are flagged as demo values.
- `batchService` is the only place batch transitions are enforced (the old tracker allowed jumping). Testing and the growth trial stay optional; READY never implies "tested".
- Recipe maths reuses `recipeConfig.ts`; kg are exact to 2 decimals (small batches work) and percentages are rounded to sum to 100.
- Batch data model changed, so the persisted key is now `krishicycle_batches_v3` (old saved batches are ignored).
- Make/Batch body text is English only for now; navigation labels are trilingual.
