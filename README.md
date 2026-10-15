# WearView

> **A physically-aware 3D preview tool for Wear OS game developers.**

🌐 **Live Web Application:** [https://wristandpocket.dev/wearview/](https://wristandpocket.dev/wearview/)  
📦 **GitHub Repository:** [wristandpocket/wearview](https://github.com/wristandpocket/wearview)

WearView helps smartwatch developers inspect how game and interactive app screens will look on the active circular display of real Wear OS hardware. Rotate the watch in 3D, inspect bezel and rim clearance, test different lighting conditions, and evaluate scale context on a neutral wrist reference.

---

## Key Features

- **Four real watches, modeled from published specs:**
  - **Samsung Galaxy Watch5 · 44 mm** — 34.6 mm, 450 × 450 display; 44.4 × 43.3 × 9.8 mm aluminum case.
  - **Samsung Galaxy Watch5 · 40 mm** — 30.4 mm, 396 × 396 display; 40.4 × 39.3 × 9.8 mm.
  - **Samsung Galaxy Watch6 · 44 mm** — 37.3 mm, 480 × 480 display, thinner bezel; 44.4 × 42.8 × 9.0 mm.
  - **Google Pixel Watch · 1st gen · 41 mm** — domed glass, polished steel, fluted crown; 41 × 12.3 mm.
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

# Run Vitest unit tests (15 tests across image fit, validation, and device profiles)
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
