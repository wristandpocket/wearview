# WearView — Implementation Plan

## Phase 0: Inspection & Technical Groundwork (Completed)
- [x] Inspect workspace, runtime environment (Node.js v24.15.0, npm 11.12.1 via `npm.cmd`, Git repository initialized).
- [x] Verify current package versions (React 19, Three.js r174, Vite 6, Vitest 3).
- [x] Research exact device specifications for Samsung Galaxy Watch5 (44 mm) and Google Pixel Watch (1st gen, 2022, 41 mm).
- [x] Create initial documentation: `docs/PRODUCT_BRIEF.md`, `docs/DEVICE_RESEARCH.md`, and `docs/IMPLEMENTATION_PLAN.md`.

---

## Phase 1: Build the Complete Core Loop (Completed)
- [x] Initialize project configuration with strict TypeScript, Vite, React, Three.js, and Vitest.
- [x] Build clean, responsive application shell:
  - Header with app brand, local-privacy indicator, device selector, and view reset.
  - Interactive 3D viewport canvas.
  - Control panel: image upload/dropzone, device switch, lighting preset, view toggle.
- [x] Build typed device profile system (`src/devices/types.ts`):
  - Model definitions with physical dimensions, display parameters, and mesh generator hooks.
- [x] Implement procedural 3D models:
  - `GalaxyWatch5`: 44 mm aluminum chassis, flat sapphire glass, protective raised lip, two side pill buttons, distinct lugs, dark bezel ring.
  - `PixelWatch1`: 41 mm pebble dome glass, polished steel underbody, digital crown at 3 o'clock, flush button at 2 o'clock, lugless band ports.
- [x] Implement Screenshot Pipeline (`src/textures/`):
  - File validation (PNG, JPG/JPEG, defensive file size limits).
  - Client-side image loader and texture creator with `SRGBColorSpace`.
  - Centered aspect-ratio preserving fit logic (`contain` fit with neutral dark backdrop).
  - Circular display masking preventing texture bleed onto bezels/rims.
  - Clean texture disposal and Object URL revocation.
  - Built-in test screenshot generator with center crosshair, quadrant labels, safe circle, and edge guides for immediate QA.
- [x] Implement Three.js Scene & Viewer Lifecycle (`src/viewer/`):
  - WebGLRenderer with capped DPR ($2\times$) and tone mapping.
  - Perspective camera with smooth OrbitControls, elevation clamping (prevent flipping under ground), and zoom limits.
  - Canvas resize observer and clean React mounting/unmounting.
  - View reset button.

---

## Phase 2: Context and Lighting Presets (Completed)
- [x] Implement 3D Wrist Reference (`src/wrist/`):
  - Procedural low-poly neutral wrist/forearm/hand geometry.
  - Neutral skin-tone / mannequin finish without distracting anatomical detail.
  - Calibrated device mounting position for Galaxy Watch5 and Pixel Watch with matching band geometry so watch sits firmly on wrist without clipping or floating.
- [x] Implement View Mode Switch:
  - `Watch view` (isolated floating watch with subtle ground shadow).
  - `On wrist` (watch mounted naturally on wrist reference).
- [x] Implement Lighting Presets:
  - **Studio:** Balanced directional key/fill lights + neutral ambient environment for pure screen inspection.
  - **Sunlight:** Warm high-intensity directional light casting soft contact shadows and crisp specular highlights.
  - **Night:** Low ambient with cool rim/accent lighting, subtle glass specular reflections, preserving screen readability.
- [x] Fine-tune physically based materials (PBR):
  - Proper metalness/roughness for watch metals vs. glossy glass.
  - Subtle Fresnel reflection on screen glass to preserve screenshot legibility.

---

## Phase 3: Validate and Stabilize (Completed)
- [x] Write unit tests for pure logic using Vitest:
  - Image fit calculations (square vs landscape vs portrait).
  - File validator (valid PNG/JPG vs oversized or unsupported MIME types).
  - Device profile definitions integrity.
- [x] Run `npm.cmd run typecheck` (Passed with 0 errors).
- [x] Run `npm.cmd run test` (Passed 14/14 tests across 3 suites).
- [x] Run `npm.cmd run build` (Passed, generated clean `dist/` production bundle).
- [x] Run app in local dev server (`http://localhost:5173/`) and perform functional checks.
- [x] Execute comprehensive QA checklist against acceptance criteria in `docs/QA_CHECKLIST.md`.

---

## Phase 4: Document and Report (Completed)
- [x] Deliver complete `README.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/QA_CHECKLIST.md`, and `docs/ROADMAP.md`.
- [x] Provide final verification report and next priority tasks.
