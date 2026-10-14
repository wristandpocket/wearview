# WearView

> **A physically-aware 3D preview tool for Wear OS game developers.**

WearView helps smartwatch developers inspect how game and interactive app screens will look on the active circular display of real Wear OS hardware. Rotate the watch in 3D, inspect bezel and rim clearance, test different lighting conditions, and evaluate scale context on a neutral wrist reference.

---

## Key Features

- **Device-Specific 3D Geometry:**
  - **Samsung Galaxy Watch5 (44 mm):** Accurate squircle aluminum body ($44.4 \times 43.3 \times 9.8\text{ mm}$), flat sapphire crystal with protective raised aluminum rim, dual pill buttons, and 20 mm lugs.
  - **Google Pixel Watch (1st gen, 41 mm, 2022):** Signature continuous 3D domed Corning Gorilla Glass 5 pebble profile, polished stainless steel bucket, rotating digital crown at 3 o'clock, flush button at 2 o'clock, and lugless strap channels.
- **Accurate Display Mapping & Aspect Fit:**
  - Textures are clipped strictly to the active circular display surface without bleeding onto bezels or outer cases.
  - Centered aspect-ratio preserving `contain` fit for non-square screenshots.
  - Correct Three.js `SRGBColorSpace` handling and emissive color fidelity.
- **Interactive WebGL Controls:**
  - Orbit rotation, smooth damping, bounded zoom limits, and one-click camera view reset.
- **3 Dynamic Lighting Presets:**
  - **Studio:** Balanced key/fill lighting with neutral reflections for crisp UI inspection.
  - **Sunlight:** High-intensity warm directional light with specular highlights and contact shadows.
  - **Night:** Low-ambient atmosphere with cool cyan/violet rim accents while maintaining screen readability.
- **Contextual Wrist View:**
  - Switch between isolated **Watch view** and **On wrist** view to judge device bulk and silhouette on an anatomical reference.
- **Privacy First & Local-Only:**
  - All image processing, canvas compositing, and WebGL texturing occur 100% inside your browser. No server uploads, no accounts, and zero analytics.

---

## Current Scope & Limitations

- **MVP Devices:** Samsung Galaxy Watch5 (44 mm) and Google Pixel Watch (1st gen, 41 mm). Additional devices are planned for future releases.
- **Monitor Scale Calibration:** True physical 1:1 on-screen monitor calibration (holding a physical reference card or ruler to the screen) is a post-MVP roadmap item. Internal scene units are strictly scaled ($1\text{ unit} = 1\text{ mm}$).

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

# Run Vitest unit tests (14 tests across image fit, validation, and device profiles)
npm run test
```

### Production Build
```bash
npm run build
```
The compiled static assets are output to `dist/`.

---

## Documentation

Detailed project documentation is available in the `docs/` directory:
- [Product Brief](docs/PRODUCT_BRIEF.md) — Product vision, user problem, goals, and non-goals.
- [Device Research](docs/DEVICE_RESEARCH.md) — Exact specifications, manufacturer citations, and visual observations.
- [Architecture](docs/ARCHITECTURE.md) — 3D scene lifecycle, coordinate systems, and Wrist & Pocket integration seams.
- [QA Verification Checklist](docs/QA_CHECKLIST.md) — Detailed acceptance criteria and test outcomes.
- [Roadmap](docs/ROADMAP.md) — Future physical-scale calibration, additional devices, and developer tooling.
- [Agent Operating Guidelines](AGENTS.md) — Development rules and verification protocol for AI agents.
