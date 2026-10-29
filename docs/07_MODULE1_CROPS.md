# 07 — Module 1: Crops (/crops)

Tabs/stepper with carried-forward data from the farm profile.

## a) Crop recommendation
Inputs auto-filled and editable: location, season, field + area, water availability, irrigation, soil (type, pH, N/P/K Low/Med/High, optional organic carbon; each can be "Unknown"), previous crop, desired crop (optional), budget band, labour.

Engine: deterministic, versioned, rule-based scoring in ONE service file (`cropScoring v1.0`): season fit 30, water fit 25, soil fit 20, budget/resource fit 15, rotation/duration fit 10. Score 0-100. >=75 High, 50-74 Moderate, <50 Low. Missing inputs reduce a visible "data coverage" meter instead of being guessed.

Output: ranked crop cards (Image 1 style) with suitability label, score ring, "why" reasons as chips (water fit, season fit, soil fit...), required resources, estimated duration range, and a tier comparison view (Crop A High, Crop B Moderate, Crop C Low). Show assumptions and "follow local agronomic advice". Buttons: View fertilizer plan, Save plan, Edit inputs, Start crop cycle.

## b) Fertilizer recommendation
Auto-redirected after selecting a crop with data prefilled; can also be opened directly (then asks basic info). Flow: nutrient requirement (N/P/K demand tiers from the crop catalog, adjusted by soil values if known) -> fertilizer recommendation -> quantity and application schedule (illustrative ranges per acre from ONE configurable table, scaled to field area) -> organic alternative where possible. Everything marked "Illustrative, validate with Soil Health Card / KVK". Show what needs a soil test.

## c) Resource planning
Inputs: available organic waste (checkboxes with quantities: crop residue, cow dung, kitchen/veg waste, dry leaves, etc.), water availability, land area, budget, fertilizer already available, labour, month.
Outputs: estimated fertilizer requirement, organic fertilizer potential, shortfall, water/resource priority, suggested allocation, potential reduction in external fertilizer dependency (labelled "Estimate").
Then TWO big options: "Make fertilizer" (goes to `/make` with crop, area, target quantity and ticked materials prefilled) or "Buy fertilizer" (goes to `/market` Buy filtered for that crop).

## d) Crop cycle
After "Start crop cycle", generate a sow-to-harvest task timeline (land prep, sowing, irrigation, fertilizer application, weeding, pest scouting, harvest) with estimated dates from the crop's duration; editable; completable with the draw-check animation; notes and optional photo.
Weekly check-in form (progress, problems, water status, weather delay): rule-based logic modifies upcoming tasks (rain delay shifts sowing; low water adds an irrigation task) and shows "Plan updated because...". Each task has a "Demo guide video" card (placeholder player with play state) plus a text checklist for low bandwidth. Do not claim it learns.
