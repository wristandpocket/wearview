# WearView

> **A physically-aware 3D preview tool for Wear OS game developers.**

🌐 **Live Web Application:** [https://wristandpocket.dev/wearview/](https://wristandpocket.dev/wearview/)  
📦 **GitHub Repository:** [wristandpocket/wearview](https://github.com/wristandpocket/wearview)

WearView helps smartwatch developers inspect how game and interactive app screens will look on the active circular display of real Wear OS hardware. Rotate the watch in 3D, inspect bezel and rim clearance, test different lighting conditions, and evaluate scale context on a neutral wrist reference.

---

## Key Features

- **Top 10+ smartwatches across 4 grouped families, modeled from published specs:**
  - **Google Pixel Watch:** Pixel Watch 1/2 (41mm), Pixel Watch 3 (41mm & 45mm) — 3D domed pebble glass, fluted crown, flush side key.
  - **Samsung Galaxy Watch (Modern Flat):** Galaxy Watch7 (40mm & 44mm), Galaxy Watch5 (40mm) — flat sapphire crystal, slim chamfered aluminum protective rim, dual pill buttons.
  - **Samsung Galaxy Watch (Classic & Ultra):** Galaxy Watch6 Classic (43mm & 47mm with physical 48-teeth knurled rotating bezel), Galaxy Watch Ultra (47mm cushion squircle titanium body with orange Quick Button).
  - **OnePlus & Mobvoi:** OnePlus Watch 2 (46mm asymmetric chrono chassis), Mobvoi TicWatch Pro 5 (48mm tactical knurled bezel and guarded center crown).
- **Real size (1:1) mode:** a one-time calibration with any bank/ID card (ISO/IEC 7810 ID-1, 85.6 × 53.98 mm) measures CSS pixels per millimetre on your screen; the watch is then drawn at its true physical size. Calibration is stored per screen + browser zoom and re-requested when either changes. Adjust with slider, buttons, mouse wheel, arrow keys or pinch.
- **Screen on the real display surface:** the screenshot is clipped to the active circular area only, aspect ratio preserved (centered `contain` fit for non-square images), correct sRGB handling.
- **Glossy cover glass:** glass reflects a dedicated dark softbox environment, so the screen stays crisp and saturated while highlights sweep across it as you tilt the watch.
- **Lighting presets:** Studio, Sunlight (strong glare on the glass) and Night.
- **Watch / On wrist:** the same watch on a simple neutral arm; the band wraps the wrist cross-section.
- **Responsive:** phones (portrait and landscape), tablets, desktops and ultrawide monitors.
- **Local-only:** images never leave the browser. No accounts, no analytics.

---

## Current Scope & Hardware Accuracy

- Scene units are millimetres (1 unit = 1 mm); confirmed vs. estimated dimensions are tracked in [DEVICE_RESEARCH.md](docs/DEVICE_RESEARCH.md).
- Bezel/rim widths and button positions are estimates from product photos, not CAD data.
- Real-size accuracy depends on the calibration; the projected display diameter is verified to match `diameter × px/mm` to within 0.01 px.

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js v24.15.0)
- Modern web browser with WebGL 2.0 support (Chrome, Edge, Firefox, Safari)

### Installation
```bash
npm install
# Or on Windows PowerShell:
npm.cmd install
```

### Local Development Server
```bash
npm run dev
# Or on Windows PowerShell:
npm.cmd run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Type Check & Unit Tests
```bash
# Type check TypeScript in strict mode
npm run typecheck

# Run Vitest unit tests (covering 1:1 physical math, validation, calibration, and 11 device models)
npm run test
```

### Production Build & Deployment
```bash
npm run build
```
The compiled static assets are output to `dist/`. The project includes an automated GitHub Actions deployment workflow (`.github/workflows/deploy.yml`) for publishing to GitHub Pages on `https://github.com/wristandpocket/wearview`.

---

## Documentation

Detailed project documentation is available in the `docs/` directory:
- [Product Brief](docs/PRODUCT_BRIEF.md) — Product vision, user problem, goals, and non-goals.
- [Device Research](docs/DEVICE_RESEARCH.md) — Exact specifications, manufacturer citations, and visual observations.
- [Architecture](docs/ARCHITECTURE.md) — 3D scene lifecycle, coordinate systems, and Wrist & Pocket integration seams.
- [QA Verification Checklist](docs/QA_CHECKLIST.md) — Detailed acceptance criteria and test outcomes.
- [Deployment & Cloud Infrastructure](docs/DEPLOYMENT.md) — Setup guide for GitHub Pages on `wristandpocket` and custom domain `wearview.sivochka.com`.
- [Roadmap](docs/ROADMAP.md) — Future physical-scale calibration, additional devices, and developer tooling.
- [Agent Operating Guidelines](AGENTS.md) — Development rules and verification protocol for AI agents.
