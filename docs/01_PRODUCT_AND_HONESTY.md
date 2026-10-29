# 01 — Product Idea and Honesty Rules

## Product idea
One connected farmer journey: sign in -> farm context (map, weather, soil estimate) -> crop recommendation -> fertilizer plan -> resource planning -> MAKE or BUY decision -> make fertilizer (guided batch) OR marketplace -> orders -> crop-cycle tasks.

The farmer's data is entered once and carried through every module. Never make the farmer re-enter data; show "carried from your farm profile" chips where values are reused.

## HONESTY RULES (MANDATORY)
This is a prototype. Never present simulated things as real.

- Every data value shows a small `ProvenanceBadge`: "Demo data", "Estimated", "User-provided", "Live (Open-Meteo)", "Simulated".
- No real government APIs are called. All government/land/soil/market data is mock Maharashtra data labelled "Demo data". Do not scrape or imitate official portals. Do not use government logos or seals.
- Sign-in OTP is simulated (any 6-digit code works) and labelled "Demo sign-in, no real OTP".
- Do NOT collect Aadhaar, bank, caste or income details.
- Payments are simulated. Show "Demo order, no real payment was taken". Never ask for card numbers.
- Never write "certified", "lab-tested", "government verified", or "guaranteed yield". Use "Seller-provided", "Not tested", "Evidence not provided", "Demo review".
- Fertilizer recipes and quantities are "Illustrative, validate with your local KVK / agriculture officer / Soil Health Card".
- Soil from location is "Estimated from region, not a soil test".
- Crop disease detection results are "Demo AI suggestion, not a diagnosis".
- Land boundaries: "User-drawn estimate, not an official land record."
- Chat and AI never alter calculations or app data.
