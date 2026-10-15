# WearView — Acceptance & QA Verification Checklist

This document records the actual verification results and outcomes for WearView.

---

## 1. Summary of Verification Status

| Test Area | Criteria Evaluated | Total Passed | Failed | Not Tested |
| :--- | :--- | :--- | :--- | :--- |
| **Functional Acceptance** | 21 | 21 | 0 | 0 |
| **Deep Engineering Audit & Precision Pass** | 7 | 7 | 0 | 0 |
| **Build & Type Safety** | 3 | 3 | 0 | 0 |
| **Unit Test Suites** | 6 local suites (45 tests) | 45 | 0 | 0 |

---

## 2. Detailed Functional Checks

| # | Acceptance Criterion | Status | Evidence & Verification Notes |
| :--- | :--- | :--- | :--- |
| 1 | **App starts with documented command and loads without console errors.** | **PASS** | `npm.cmd run dev` starts Vite server. Clean HTML response, no unhandled script rejections. Starts in clean, informative empty state with helpful prompt. |
| 2 | **Top 10+ Wear OS devices are registered with exact 1:1 physical millimeter proportions.** | **PASS** | All 11 smartwatches registered in `src/devices/` covering Google Pixel (PW1/2 41mm, PW3 41mm, PW3 45mm), Samsung Galaxy Modern (GW7 40mm, GW7 44mm, GW5 40mm), Samsung Galaxy Classic/Ultra (GW6 Classic 43mm, GW6 Classic 47mm, GW Ultra 47mm), and OEM watches (OnePlus Watch 2 46mm, TicWatch Pro 5 48mm). Exact millimeter values strictly maintained with 1 unit = 1 mm. |
| 3 | **Grouped Device Selector Dropdown in UI.** | **PASS** | Header contains accessible `<select>` dropdown grouped by manufacturer family (`Google Pixel Watch`, `Samsung Galaxy Watch (Modern Flat)`, `Samsung Galaxy Watch (Classic & Ultra)`, `OnePlus & Mobvoi`) displaying inline metadata (screen size in inches and resolution in px). Legacy aliases (`galaxy-watch-5-44mm`, etc.) normalize cleanly to avoid dropdown desynchronization. |
| 4 | **5 Distinct Procedural 3D Archetypes.** | **PASS** | `domed-pebble` (Pixel Watch lathe dome), `flat-minimalist` (flat sapphire with protective lip and dual pill keys), `classic-rotating-bezel` (raised 1.35mm rotating bezel with 48 knurled outer teeth), `squircle-cushion-ultra` (titanium cushion squircle with orange Quick Button and raised circular bezel), and `asymmetric-chrono` / `rugged-tactical` (sculpted asymmetric flank and knurled tactical bezel with guarded center crown). |
| 5 | **Valid square PNG/JPG/WebP loads and appears correctly, centered and circularly masked on active display.** | **PASS** | Verified with test pattern generator matching target device resolution. Texture maps strictly to circular `CircleGeometry` screen mesh without bleeding onto bezel or case. |
| 6 | **Non-square test image preserves aspect ratio and is centered; not stretched or unexpectedly cropped.** | **PASS** | Verified mathematically in `calculateContainFit` unit tests on pure black background. Non-square warning displayed non-blockingly in uploader. |
| 7 | **Unsupported or corrupt file produces helpful error and does not break scene.** | **PASS** | Verified in `validator.test.ts`. Rejecting empty files (0 bytes), oversized files (>20 MB), `.gif`, `.exe` with explicit inline feedback in `ScreenshotUploader`. Supports PNG, JPG, JPEG, and WebP. |
| 8 | **Replacing and removing image works repeatedly without breaking rendering.** | **PASS** | Replacing image releases previous texture via `info.texture.dispose()`, revokes temporary object URLs immediately upon image decode, and removing returns display to unlit emissive empty screen state. |
| 9 | **Drag-to-rotate, zoom limits, and reset camera work.** | **PASS** | `OrbitControls` configured with damping, polar angle clamp preventing flipping below ground, and distance bounds ensuring macro pixel inspection without camera clipping. |
| 10 | **Watch view ↔ On wrist works, keeps selected watch and screenshot, and watch appears attached to wrist rather than floating/intersecting.** | **PASS** | Switching view mode toggles procedural wrist reference visibility. Dynamic `fitToWatch(backY)` vertically aligns wrist surface so rear sensor housing sits flush for all thicknesses (9.7mm to 12.3mm). Straps wrap laterally with exact lug widths (20mm, 22mm, 24mm). |
| 11 | **Studio, Sunlight, and Night presets make visibly different environmental/specular changes; reflections do not overwhelm screen.** | **PASS** | Studio uses clean white studio background and RoomEnvironment reflections; Sunlight boosts directional intensity with warm sun color; Night introduces ambient rim lighting while emissive display screen remains legible with `toneMapped: false`. |
| 12 | **Device switching preserves camera distance and zoom level.** | **PASS** | `ThreeViewer.loadDevice()` swaps the 3D model while preserving existing camera position and zoom distance, immediately revealing the physical 1:1 size difference between smaller (e.g. 40mm) and larger (e.g. 47mm/48mm) watches. In real size (1:1) mode, camera distance is solved strictly to the world coordinate plane of `displayMesh` (`displayMesh.getWorldPosition(...)`). |
| 13 | **Device Spec Drawer and Viewport Overlay show detailed hardware metrics.** | **PASS** | Displays case dimensions (W × H × T mm), active display diameter (mm & inches), native resolution & density (px & PPI), radial bezel border (mm & screen-to-body ratio %), and lug width (mm). Screen-to-body calculation is archetype-aware (rounded rect cushion squircle vs ellipse vs circular). |
| 14 | **Browser resize and narrow layout remain usable.** | **PASS** | Responsive layout in `theme.css` wraps control drawer underneath viewport on narrow screens. Viewport canvas observer dynamically recalculates camera aspect ratio and 1:1 scale distance. |
| 15 | **No obvious severe GPU resource leaks occur after repeatedly changing image/device/mode.** | **PASS** | Outgoing models recursively dispose all `BufferGeometry` instances and cloned `Material` instances while preserving active screenshot `Texture`. |
| 16 | **Browser console is free of avoidable errors and warnings caused by the app.** | **PASS** | Zero syntax errors, zero React warnings, zero Three.js deprecation warnings. Watertight solid chassis geometries. |
| 17 | **Interactive Wear OS Safe-Zone & Cardinal Overlay (Shortcut: S).** | **PASS** | Non-intrusive 3D circular wireframe overlay rendered at `renderOrder: 3` showing 100% boundary (cyan), 90% Action/Button Safe Zone (amber), and 80% Title/Text Safe Zone (emerald), plus cardinal tick marks (12h, 3h, 6h, 9h) to immediately spot bezel occlusion. Toggled via dock button or `S` key. |
| 18 | **Quick Camera Angle Presets (Front 0°, Tilt 35°, Side 75°).** | **PASS** | Dedicated inspection presets smoothly animate (`flyToPose`) the camera to: Front (0° perpendicular, shortcut `1`), Tilt (35° natural wrist glance to verify raised bezel clearance, shortcut `2`), and Side (75° grazing angle to inspect dome curvature, case thickness, and wrist contact, shortcut `3`). |
| 19 | **High-Resolution PNG Snapshot Export (Shortcut: P).** | **PASS** | Canonicalized in the dock controls bar with shortcut `P`. Synchronous `renderer.render()` execution directly before `toDataURL()` with `preserveDrawingBuffer: false` guarantees crisp frame capture with 60fps performance on high-DPI displays and zero browser buffer copy overhead. |
| 20 | **Anatomical Wrist Model Proportional Polish.** | **PASS** | `WRIST_SECTION.halfWidth` set to 33.5mm (67mm breadth) with updated lofting keys in `wristModel.ts`, cleanly accommodating wide 48–52.4mm lug-to-lug watches (e.g. GW6 Classic 47mm and TicWatch Pro 5) without skin clipping or artificial overhang. |
| 21 | **Auto-Regenerate Test Pattern & 1-Click Sample Switching.** | **PASS** | Tracking screen texture source (`sample` vs `test-pattern` vs `user`). When switching smartwatches in the dropdown while `test-pattern` is active, the pattern is automatically regenerated matching the new device's exact resolution, diameter, and PPI. 1-click pills allow toggling between Cyberpunk 3D and QA Pattern. |

---

## 3. Engineering & Test Commands Run

1. **TypeScript Typecheck:**
   - Command: `npm.cmd run typecheck`
   - Exit Code: `0`
   - Outcome: All strict typing checks passed with zero errors (`tsc --noEmit`).
2. **Vitest Unit Tests:**
   - Command: `npm.cmd test -- --run`
   - Exit Code: `0`
   - Outcome: All 6 test suites passed (45 tests):
     - `src/textures/validator.test.ts` (9 tests: format validation, size checks, resolution/square checks)
     - `src/textures/imageFit.test.ts` (4 tests: contain fit calculations)
     - `src/textures/testPattern.test.ts` (7 tests: testPattern options, device switching regeneration, safe zone badges, degree markings, handleGlobalKeyDown shortcuts)
     - `src/calibration/calibration.test.ts` (3 tests: physical calibration storage and math)
     - `src/devices/geometry.test.ts` (10 tests: procedural profiles, lathe, knurled bezel, wrist dimensions, wrap path for 52.4mm lugs)
     - `src/devices/devices.test.ts` (12 tests: all 11 devices, 1:1 mm math, named meshes, legacy aliases, normalizeDeviceId, archetype-aware screen-to-body ratios, vertical separation >= 0.08mm, render orders, and dynamic wrist fit)
3. **Production Build:**
   - Command: `npm.cmd run build`
   - Exit Code: `0`
   - Outcome: Vite production build generated `dist/` bundle cleanly in 2.28s.
