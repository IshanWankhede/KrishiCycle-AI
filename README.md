# KrishiCycle AI

KrishiCycle is a web app prototype for smallholder farmers. It brings farm planning, crop recommendations, compost-making guidance, marketplace workflows, and crop-health tools together in one place.

The project is designed as a practical demonstration: some workflows use sample data or simulated actions, and the app clearly distinguishes those from live services.

## What you can explore

- **Farm planning:** record a field boundary, view its area, and see local weather information.
- **Crop planning:** compare crop suitability, review input estimates, and follow a crop task timeline.
- **Compost making:** create a recipe and track a batch through its preparation steps.
- **Marketplace:** browse sample listings and try the buyer and seller order flows.
- **Crop health:** explore crop-health guidance and, when configured, cotton leaf image inference.
- **Language and guidance:** use the English, Hindi, or Marathi interface and the in-app agronomist assistant.

## Getting started

### Requirements

- Node.js 20 or later
- npm
- Python 3.10 or later (only needed for the optional cotton inference service)

### Run the web app

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

To check the production build:

```bash
npm run build
npm run preview
```

## Optional: cotton leaf inference

The web app can be used without the Python service. To enable the cotton leaf image inference feature, open a second terminal and install the service dependencies:

```bash
python -m pip install flask flask-cors pillow numpy ultralytics
python inference_server.py
```

On Windows, `py` can be used instead of `python`. The service listens on port `5001`; Vite proxies its `/api` requests to it. The model weights should be available at `Models/best.pt` or `Model/best.pt`. On Windows, `start_inference.bat` is also available to start the service.

## Technology

- React, TypeScript, and Vite
- Tailwind CSS
- Zustand for client-side state
- React Router for navigation
- Leaflet for interactive maps
- Flask and Ultralytics YOLO for optional cotton image inference

## Prototype notes

- Sign-in and payment flows are demonstrations; do not enter real payment credentials.
- Marketplace inventory, orders, and batch activity use local demo data.
- Weather information comes from Open-Meteo when available and may fall back to sample data.
- Cotton image results are model-generated suggestions, not a substitute for expert diagnosis.
- App data is stored in the browser and can be reset from the profile controls.

For a more detailed walkthrough of the screens and workflows, see [README_APP.md](./README_APP.md). Product and design notes are available in [docs/](./docs/).
