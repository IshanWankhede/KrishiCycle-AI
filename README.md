# KrishiCycle AI 2.0 — Antigravity One-Shot Build Pack

Team: God's Plan · PRISM'26 SOCIOTHON · Theme: Smarter Agriculture for Small Farmers

This folder is a complete specification pack. Open it in Google Antigravity and the agent builds the whole prototype in ONE run, with no phases and no questions.

## Start in 5 steps

1. Unzip this folder. Install Node.js 20+ if you don't have it.
2. Copy your 4 reference images into `reference-images/` with these exact names:
   - `1-tennis-cards.png` (pastel cards + carousel)
   - `2-voyager-login.png` (split-screen auth)
   - `3-liquid-glass-nav.png` (glass pill nav)
   - `4-cultivo-landing.png` (landing page)
3. Open Antigravity, then File > Open Folder and choose this folder as the workspace.
4. Open the Agent Manager, start a new conversation, pick the strongest model available, and set the agent to run autonomously: use Planning mode, and allow terminal commands to run automatically and artifacts to proceed without review (setting names vary by Antigravity version; choose the most autonomous options).
5. Paste the single line from `START_PROMPT.txt` and send. Then wait. The agent runs `npm install`, builds, and fixes its own errors until `npm run build` passes and `npm run dev` serves the app.

Optional: copy `.env.example` to `.env` and add a Gemini key (AI Studio) for chat explanations. The app works without it.

## What is inside

| File | Purpose |
|---|---|
| `START_PROMPT.txt` | The one line you paste into Antigravity |
| `00_MASTER_PROMPT.md` | Orchestrator: role, one-pass rules, reading order, definition of done |
| `docs/01_PRODUCT_AND_HONESTY.md` | Product idea + mandatory honesty rules |
| `docs/02_TECH_STACK_AND_STRUCTURE.md` | Stack, folder structure, services |
| `docs/03_DESIGN_SYSTEM.md` | Palette, type, the 4 reference images |
| `docs/04_ANIMATION.md` | Lenis, GSAP, motion, micro-interactions |
| `docs/05_LANGUAGE.md` | English / Hindi / Marathi system |
| `docs/06_ROUTES_AND_SCREENS.md` | Landing, auth, farm, dashboard, schemes, profile, chat |
| `docs/07_MODULE1_CROPS.md` | Crop recommendation, fertilizer, resources, crop cycle |
| `docs/08_MODULE2_MAKE.md` | Recipe wizard and batch tracker |
| `docs/09_MODULE3_MARKET_ORDERS.md` | Buy, Sell, Orders |
| `docs/10_MODULE4_HEALTH.md` | Leaf health demo |
| `docs/11_MOCK_DATA.md` | Maharashtra demo data spec |
| `docs/12_ACCEPTANCE_CHECKLIST.md` | What must be true before the agent stops |
| `.agent/rules/krishicycle-rules.md` | Always-on workspace rules for Antigravity |
| `.agent/workflows/build-krishicycle.md` | Reusable `/build-krishicycle` workflow |
| `.env.example` | Optional Gemini key |

## Notes

- Your original prompt was cut off at the end of the MOCK DATA section ("do not present them as ..."). I completed it with the obvious meaning (do not present them as official statistics) in `docs/11_MOCK_DATA.md`.
- This pack cannot guarantee a flawless result from any AI agent. If something is off, use the repair prompts at the bottom of `docs/12_ACCEPTANCE_CHECKLIST.md`.
