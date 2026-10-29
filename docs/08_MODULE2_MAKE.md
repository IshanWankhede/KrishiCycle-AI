# 08 — Module 2: Make fertilizer (/make)

## Recipe wizard
- Step 1: crop (prefilled), target quantity in kg, nutrient focus (farmer picks N/P/K emphasis or "Let KrishiCycle choose from my crop plan").
- Step 2: checklist of materials with quantities in hand.
- Step 3: feasibility check + recipe.
- Step 4: step-by-step guidance as an animated stepper.
- Step 5: after making, upload a photo of the finished fertilizer.

## Recipe config (ILLUSTRATIVE, versioned in `recipeConfig.ts`)
Base mix, ratios of target weight: dry leaves/straw 0.35, kitchen/veg scraps 0.30, aged cow dung 0.20, neem cake 0.08, wood ash 0.04, rock phosphate/bone meal 0.03.

Crop category adjustments:
- fruiting: +0.03 ash, +0.02 rock phosphate, -0.05 leaves
- leafy: +0.05 scraps, +0.03 dung, -0.08 leaves
- root: +0.04 rock phosphate, +0.02 ash, -0.06 scraps

Soil adjustments:
- Low N: +0.02 neem, +0.02 dung, -0.04 leaves
- Low P: +0.03 rock phosphate, -0.03 leaves
- Low K: +0.03 ash, -0.03 leaves

Then normalise so ratios sum to 1 and compute kg per material. Show required vs available vs MISSING per material. Missing materials show "Buy from Marketplace" buttons that open `/market` with the material pre-filtered and a "Return to my recipe" path. Label: "Illustrative, validate with your local KVK / agriculture officer / Soil Health Card".

## Guidance steps
Collect, chop to 2-4 cm, mix, build pile, set moisture (squeeze test), active composting with turning reminders, maturation, ready for use. Each step: instruction, expected timing range, checkbox, note, optional photo upload (store as small data URL), timestamp, "Demo guide video" card, and a text checklist.

## Batch tracker
Batch code (e.g. KC-MH-2026-001), progress ring, next task, valid transitions only (no jumping steps), readings (manual or "Simulated" temperature/moisture sparkline, never labelled as real). Reopening a batch restores progress.

When ready: "Use it on my farm" or "Sell it" (opens Sell with batch data imported).

Do NOT mark a batch as certified, pathogen-free or tested from checklist completion. Show "Evidence not provided" unless the user records a test result and chooses its source (Estimated / Kit-measured by me / Lab report uploaded).
