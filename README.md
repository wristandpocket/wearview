# WearView

> **A physically-aware 3D preview tool for Wear OS game developers.**

WearView helps smartwatch developers inspect how game and interactive app screens will look on the active circular display of real Wear OS hardware. Rotate the watch in 3D, inspect bezel and rim clearance, test different lighting conditions, and evaluate scale context on a neutral wrist reference.

---

## Key Features

- **Device-Specific 3D Geometry:**
  - **Samsung Galaxy Watch5 (44 mm):** Accurate squircle aluminum body ($44.4 \times 43.3 \times 9.8\text{ mm}$), flat sapphire crystal with protective raised aluminum rim, dual pill buttons, and 20 mm lugs.
  - **Samsung Galaxy Watch5 (40 mm):** Compact aluminum chassis ($40.4 \times 39.3 \times 9.8\text{ mm}$), $1.2"$ active AMOLED ($30.4\text{ mm}$ diameter, $396 \times 396\text{ px}$), slim $2.3\text{ mm}$ touch-bezel border, micro-chamfered protective rim, and sculpted lugs.
  - **Google Pixel Watch (1st gen, 41 mm, 2022):** Signature continuous 3D domed Corning Gorilla Glass 5 pebble profile, solid sealed substrate floor (zero inside-out void), closed watertight polished stainless steel bucket, rotating digital crown at 3 o'clock, flush button at 2 o'clock, and lugless strap channels.
- **Accurate Display Mapping & Aspect Fit:**
  - Textures are clipped strictly to the active circular display surface without bleeding onto bezels or outer cases.
  - Centered aspect-ratio preserving `contain` fit for non-square screenshots.
  - Native WebP, PNG, JPG, and JPEG support.
  - Correct Three.js `SRGBColorSpace` handling and emissive color fidelity with zero glass bleaching.
- **Interactive WebGL Controls & Macro-to-Life Zoom:**
  - Orbit rotation, smooth damping, bounded pitch clamp ($0.1 \le \theta \le 0.58\pi$), and one-click camera view reset.
  - Extended camera zoom ($15 - 450\text{ mm}$) allowing macro pixel inspection up to real-life size distance comparison.
- **3 Dynamic Lighting Presets:**
  - **Studio:** Clean pure white studio environment (`#ffffff`) with dynamic HDR reflection mapping (`RoomEnvironment`) for realistic metallic sheen on Armor Aluminum and polished steel.
  - **Sunlight:** High-intensity warm directional light ($3.4$) with crisp specular glint and contact shadows.
  - **Night:** Low-ambient atmosphere with cool cyan/violet rim accents while maintaining screen readability.
- **Contextual Wrist View:**
  - Switch between isolated **Watch view** and **On wrist** view to judge device bulk and silhouette on an anatomical reference.
- **Privacy First & Local-Only:**
  - All image processing, canvas compositing, and WebGL texturing occur 100% inside your browser. No server uploads, no accounts, and zero analytics.

---

## Current Scope & Hardware Accuracy

- **Supported Devices:**
  1. Samsung Galaxy Watch5 · 44 mm ($450 \times 450\text{ px}$, $34.6\text{ mm}$ display)
  2. Samsung Galaxy Watch5 · 40 mm ($396 \times 396\text{ px}$, $30.4\text{ mm}$ display)
  3. Google Pixel Watch · 1st gen · 41 mm ($450 \times 450\text{ px}$, $33.5\text{ mm}$ calibrated display)
- **Physical Scale:** Internal 3D scene units are strictly scaled ($1\text{ unit} = 1\text{ mm}$). Camera distances ($15 - 450\text{ mm}$) allow matching real-world wrist proportions. Full monitor PPI calibration is a post-MVP roadmap item.

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

# Run Vitest unit tests (16 tests across image fit, validation, and device profiles)
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
