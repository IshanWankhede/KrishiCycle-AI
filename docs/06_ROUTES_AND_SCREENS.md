# 06 — Routes and Screens

Routes (HashRouter): `/` Landing | `/auth` Sign in + create account | `/guide` Farmer guide (swipeable module cards with images and a Next button) | `/dashboard` | `/farm` | `/crops` (Module 1) | `/make` (Module 2) | `/market` (Module 3: Buy, Sell, My listings) | `/orders` (buyer, seller) | `/health` (Module 4) | `/schemes` | `/profile` | floating AI Agronomist chat widget on all app screens.

## Landing
Per Image 4 + Image 1 cards. Sections: hero, stats row (clearly labelled illustrative numbers, "Demo stats"), problem statement ("The real challenge is not lack of information but lack of personalized, connected, actionable decision support"), four-challenge cards (What to grow? What to use? How to use resources? Where to buy/sell?), the 4 modules carousel, how-the-cycle-works (Crop -> Fertilizer -> Resources -> Market -> Better decisions), language strip, footer with demo disclaimer.

## Auth
- Sign in: phone + simulated OTP (30s resend timer), labelled "Demo sign-in, no real OTP".
- Create account: name, phone, district (Maharashtra list), taluka (text), village, optional Gat/Survey number (user-provided), language. Then Farm basics: total area + unit (acre / hectare / guntha / sq m, with conversion; 1 acre = 40 guntha), irrigation (drip, sprinkler, flood, rainfed, well/borewell), current crops multi-select, farming method (conventional/organic/mixed), role intent (make fertilizer / buy inputs / sell).
- "Continue as demo farmer" loads a seeded Pune-district profile.
- Then the language suggestion modal, then `/guide`.

## Farm context (/farm)
- District/village search from the mock list, zooms the Leaflet map to it.
- Add a field; click points on the map to draw a polygon (implement vertex clicking, undo, close polygon yourself). Show area live in sq m, acres, hectares, guntha using your own spherical/geodesic formula. Name the field; set current crop, previous crop, soil type override, water source.
- Place pins: house, shed, well/borewell, pond, pump, road access.
- Per-field cards: area, crop, last activity, soil (Estimated), mini map thumbnail.
- Label every boundary: "User-drawn estimate, not an official land record."
- Map layer toggle (street / satellite) with attribution.
- Weather panel: Open-Meteo for the field centre (current + 7-day forecast, rainfall chance), retrieved-at time, "Live (Open-Meteo)"; fallback to mock labelled "Demo data".
- Season auto-detected from today's date (Kharif Jun-Oct, Rabi Nov-Feb, Zaid Mar-May).
- "About this area" card from mock data: region (Konkan, Western Maharashtra, Khandesh, Marathwada, Vidarbha), typical rainfall zone, typical soil, commonly grown crops, irrigation notes. Labelled "Demo data / Estimated". No long invented histories.
- "Save farm context" button stores it; Module 1 inputs auto-fill from it.

## Dashboard
Greeting in the chosen language, farm summary card, today's weather chip, season chip, quick actions (Recommend a crop, Plan fertilizer, Make fertilizer, Buy inputs), latest recommendation snapshot, active batch ring, active orders, tasks due soon, "Circular impact" counters (waste diverted kg, fertilizer made kg, estimated external fertilizer avoided) all labelled "Estimated / Demo". Bento-grid with glass and pastel cards.

## Schemes (/schemes)
Informational cards only (e.g. PM-KISAN, Soil Health Card scheme, state agriculture department programmes) with short plain-language descriptions and a "Check official portal" button that explains this is informational only. No eligibility determination, no data submission. Label "Demo content, verify on the official website." No government logos.

## Profile
Edit details, language, farm and fields list, my batches, my listings, sign out, "Reset demo data" button, data provenance and safety notes page.

## AI Agronomist chat (floating glass widget)
Answers in the selected language. Uses Gemini if a key exists, otherwise a rule-based fallback covering compost odour, low pile temperature, recipe questions, crop timing. Shows "AI guidance, verify with local experts". Chat never changes calculations or app data.
