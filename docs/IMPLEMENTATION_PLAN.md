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
  - **Night:** Low-ambient atmosphere with cool rim/accent lighting, subtle glass specular reflections, preserving screen readability.
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

---

## Phase 5: Post-MVP Audit & Stabilization (Completed)
- [x] **Enforce 2-Device Scope:** Removed Galaxy Watch5 40 mm from active UI selector, types (`DeviceId`), device catalogue exports, and unit tests. Catalogue strictly contains Galaxy Watch5 44 mm and Pixel Watch (1st gen, 41 mm).
- [x] **UI De-bloating (KISS):** Replaced multi-card drawer with a compact, minimal hardware specs summary; removed blocking UI.
- [x] **Startup & Asset Hygiene:** Removed auto-loading of WebP image; app initializes in a clean, informative empty state; test pattern loaded via explicit button; immediate `URL.revokeObjectURL(objectUrl)` on image decode to eliminate blob memory leaks.
- [x] **3D Display Optics:** Configured emissive OLED display (`MeshBasicMaterial`, `toneMapped: false`, `sRGBColorSpace`) for full readability in Night mode without pitch-black dimming, and Sunlight without color washout.
- [x] **Glass Layer Optics:** Reduced glass opacity ($0.05 - 0.07$), set `roughness: 0.03`, `metalness: 0`, `clearcoat: 1.0`, `depthWrite: false` to eliminate transmission bleaching and maintain author contrast.
- [x] **Z-Fighting & Clipping Elimination:**
  - Galaxy Watch5: Calibrated spatial separation ($Y_{\text{case}}=0$, $Y_{\text{bezel}}=0.03$, $Y_{\text{display}}=0.04$, $Y_{\text{glass}}=0.12$, $Y_{\text{rim}}=0.32$) with explicit `renderOrder` (1, 2, 10).
  - Pixel Watch: Modeled continuous super-elliptical dome profile ($y \ge 1.48$ mm at screen perimeter) with display flat at $Y = 1.05$ mm, fully encapsulating screen inside the glass with zero clipping. Added watertight polished steel underbody bowl, digital crown at 3 o'clock, and flush key at 2 o'clock.
- [x] **Wrist Alignment:** Calibrated wrist mesh center ($Y = -27.2$ mm) so dorsal skin sits flush ($Y \approx -10.66$ mm) under caseback and sensors without clipping or hovering.
- [x] **Camera Clamping:** Set OrbitControls `minDistance = 28` mm, `maxDistance = 450` mm, `maxPolarAngle = 0.49 * Math.PI` rad.
- [x] **GPU Memory Management:** Explicit `.dispose()` on textures, geometries, and instance materials during device switching, while preserving the active display texture. Disposed PMREM and RoomEnvironment generators.
- [x] **Comprehensive Verification:** Passed strict TypeScript check, 15/15 Vitest tests, Vite production build, and headless CDP browser runtime checks across all flows.
