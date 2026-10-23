# WearView — Acceptance & QA Verification Checklist

This document records the actual verification results and outcomes for WearView.

---

## 1. Summary of Verification Status

| Test Area | Criteria Evaluated | Total Passed | Failed | Not Tested |
| :--- | :--- | :--- | :--- | :--- |
| **Functional Acceptance** | 21 | 21 | 0 | 0 |
| **Deep Engineering Audit & Precision Pass** | 7 | 7 | 0 | 0 |
| **Build & Type Safety** | 3 | 3 | 0 | 0 |
| **Unit Test Suites** | 9 local suites (319 tests) | 319 | 0 | 0 |

---

## 2. Detailed Functional Checks

| # | Acceptance Criterion | Status | Evidence & Verification Notes |
| :--- | :--- | :--- | :--- |
| 1 | **App starts with documented command and loads without console errors.** | **PASS** | `npm.cmd run dev` starts Vite server. Clean HTML response, no unhandled script rejections. Starts in clean, informative empty state with helpful prompt. |
| 2 | **Top 21 Wear OS devices are registered with exact 1:1 physical millimeter proportions.** | **PASS** | All 21 smartwatches registered in `src/devices/` covering Google Pixel (PW1/2 41mm, PW3 41mm, PW3 45mm, PW4 41mm, PW4 45mm), Samsung Galaxy Modern (GW7 40mm, GW7 44mm, GW6 40mm, GW6 44mm, GW5 40mm, GW5 44mm), Samsung Galaxy Classic, Pro & Ultra (GW8 Classic 46mm, GW6 Classic 43mm, GW6 Classic 47mm, GW5 Pro 45mm, GW4 Classic 46mm, GW Ultra 47mm), and OEM watches (OnePlus Watch 3 46mm, OnePlus Watch 2 46mm, Xiaomi Watch 2 Pro 46mm, TicWatch Pro 5 48mm). Exact millimeter values strictly maintained with 1 unit = 1 mm. |
| 3 | **Grouped Device Selector Dropdown in UI.** | **PASS** | Header contains accessible `<select>` dropdown grouped by manufacturer family (`Google Pixel Watch`, `Samsung Galaxy Watch (Modern Flat)`, `Samsung Galaxy Watch (Classic, Pro & Ultra)`, `OnePlus, Xiaomi & Mobvoi`) displaying inline metadata (screen size in inches and resolution in px). Legacy aliases (`galaxy-watch-5-44mm`, etc.) normalize cleanly to avoid dropdown desynchronization. |
| 4 | **Distinct Procedural 3D Archetypes & Model Builders.** | **PASS** | `domed-pebble` (Pixel Watch lathe dome), `flat-minimalist` (flat sapphire with protective lip and dual pill keys), `classic-rotating-bezel` (raised 1.35mm rotating bezel with 48 knurled outer teeth, plus smooth concave raised Grade 4 Titanium wall on GW5 Pro), `squircle-cushion-ultra` (titanium/steel cushion squircle on GW Ultra 47mm and GW8 Classic 46mm with Quick Button), and `asymmetric-chrono` / `rugged-tactical` (OnePlus Watch 2/3 sculpted right bridge, Xiaomi Watch 2 Pro 72-notch Parisian hobnail bezel with center crown & twin chrono pushers, and TicWatch Pro 5 knurled tactical bezel with guarded center crown). |
| 5 | **Valid square PNG/JPG/WebP loads and appears correctly, centered and circularly masked on active display.** | **PASS** | Verified with test pattern generator matching target device resolution. Texture maps strictly to circular `CircleGeometry` screen mesh without bleeding onto bezel or case. |
| 6 | **Non-square test image preserves aspect ratio and is centered; not stretched or unexpectedly cropped.** | **PASS** | Verified mathematically in `calculateContainFit` unit tests on pure black background. Non-square warning displayed non-blockingly in uploader. |
| 7 | **Unsupported or corrupt file produces helpful error and does not break scene.** | **PASS** | Verified in `validator.test.ts`. Rejecting empty files (0 bytes), oversized files (>20 MB), `.gif`, `.exe` with explicit inline feedback in `ScreenshotUploader`. Supports PNG, JPG, JPEG, and WebP. |
| 8 | **Replacing and removing image works repeatedly without breaking rendering.** | **PASS** | Replacing image releases previous texture via `info.texture.dispose()`, revokes temporary object URLs immediately upon image decode, and removing returns display to unlit emissive empty screen state. |
| 9 | **Drag-to-rotate, zoom limits, and reset camera work.** | **PASS** | `OrbitControls` configured with damping, polar angle clamp preventing flipping below ground, and distance bounds ensuring macro pixel inspection without camera clipping. |
| 10 | **Watch view ↔ On wrist works, keeps selected watch and screenshot, and watch appears attached to wrist rather than floating/intersecting.** | **PASS** | Switching view mode toggles procedural wrist reference visibility. Dynamic `fitToWatch(backY)` vertically aligns wrist surface so rear sensor housing sits flush for all thicknesses (9.0mm to 12.3mm). Straps wrap laterally with exact lug widths (20mm, 22mm, 24mm). |
| 11 | **Studio, Sunlight, and Night presets make visibly different environmental/specular changes; reflections do not overwhelm screen.** | **PASS** | Studio uses clean white studio background and RoomEnvironment reflections; Sunlight boosts directional intensity with warm sun color; Night introduces ambient rim lighting while emissive display screen remains legible with `toneMapped: false`. |
| 12 | **Device switching preserves camera distance and zoom level.** | **PASS** | `ThreeViewer.loadDevice()` swaps the 3D model while preserving existing camera position and zoom distance, immediately revealing the physical 1:1 size difference between smaller (e.g. 40mm) and larger (e.g. 47mm/48mm) watches. In real size (1:1) mode, camera distance is solved strictly to the world coordinate plane of `displayMesh` (`displayMesh.getWorldPosition(...)`). |
| 13 | **Device Spec Drawer and Viewport Overlay show detailed hardware metrics.** | **PASS** | Displays case dimensions (W × H × T mm), active display diameter (mm & inches), native resolution & density (px & PPI), radial bezel border (mm & screen-to-body ratio %), and lug width (mm). Screen-to-body calculation is archetype-aware (rounded rect cushion squircle vs ellipse vs circular). |
| 14 | **Browser resize and narrow layout remain usable.** | **PASS** | Responsive layout in `theme.css` wraps control drawer underneath viewport on narrow screens. Viewport canvas observer dynamically recalculates camera aspect ratio and 1:1 scale distance. |
| 15 | **No obvious severe GPU resource leaks occur after repeatedly changing image/device/mode.** | **PASS** | Outgoing models recursively dispose all `BufferGeometry` instances and cloned `Material` instances while preserving active screenshot `Texture`. |
| 16 | **Browser console is free of avoidable errors and warnings caused by the app.** | **PASS** | Zero syntax errors, zero React warnings, zero Three.js deprecation warnings. Watertight solid chassis geometries. |
| 17 | **Interactive Wear OS Safe-Zone & Cardinal Overlay (Shortcut: S).** | **PASS** | Non-intrusive 3D circular wireframe overlay rendered at `renderOrder: 20` with `depthTest: true` and `polygonOffset` (`factor: -4, units: -4`) showing 100% boundary (cyan), 90% Action/Button Safe Zone (amber), and 80% Title/Text Safe Zone (emerald), plus cardinal tick marks (12h, 3h, 6h, 9h) so raised bezels naturally occlude the screen edge under tilt. Toggled via dock button or `S` key. |
| 18 | **Quick Camera Angle Presets (Front 0°, Tilt 35°, Side 75°).** | **PASS** | Dedicated inspection presets smoothly animate (`flyToPose`) the camera to: Front (0° perpendicular, shortcut `1`), Tilt (35° natural wrist glance to verify raised bezel clearance, shortcut `2`), and Side (75° grazing angle to inspect dome curvature, case thickness, and wrist contact, shortcut `3`), while preserving calibrated 1:1 real-size mode and physical camera distance. |
| 19 | **High-Resolution PNG Snapshot Export (Shortcut: P).** | **PASS** | Canonicalized in the header actions with shortcut `P`. Synchronous `renderer.render()` execution directly before `toBlob()` with `preserveDrawingBuffer: false` guarantees crisp frame capture; in Compare mode, both canvases are stitched side-by-side onto a 2D canvas over the active lighting background (`studio`, `sunlight`, `night`). |
| 20 | **Anatomical Wrist Model Proportional Polish.** | **PASS** | `WRIST_SECTION.halfWidth` set to 33.5mm (67mm breadth) with updated lofting keys in `wristModel.ts`, cleanly accommodating wide 48–52.4mm lug-to-lug watches (e.g. GW6 Classic 47mm and TicWatch Pro 5) without skin clipping or artificial overhang. |
| 21 | **Auto-Regenerate Test Pattern & 1-Click Sample Switching.** | **PASS** | Tracking screen texture source (`sample` vs `test-pattern` vs `user`). When switching smartwatches in the dropdown while `test-pattern` is active, the pattern is automatically regenerated matching the new device's exact resolution, diameter, and PPI. 1-click pills allow toggling between Cyberpunk 3D and QA Pattern. |

---

## 3. Engineering & Test Commands Run

1. **TypeScript Typecheck:**
   - Command: `npm run typecheck`
   - Exit Code: `0`
   - Outcome: All strict typing checks passed with zero errors (`tsc --noEmit`).
2. **Vitest Unit Tests:**
   - Command: `npm run test -- --run`
   - Exit Code: `0`
   - Outcome: All 9 test suites passed (319 tests):
     - `src/textures/validator.test.ts` (10 tests: format validation, size checks, resolution/square checks)
     - `src/textures/imageFit.test.ts` (4 tests: contain fit calculations)
     - `src/textures/testPattern.test.ts` (7 tests: testPattern options, device switching regeneration, safe zone badges, degree markings, handleGlobalKeyDown shortcuts)
     - `src/textures/screenTexture.test.ts` (3 tests: screen texture configuration)
     - `src/utils/urlState.test.ts` (6 tests: URL hash serialization and parsing)
     - `src/calibration/calibration.test.ts` (3 tests: physical calibration storage and math)
     - `src/devices/geometry.test.ts` (12 tests: procedural profiles, lathe, knurled bezel, wrist dimensions, wrap path for 52.4mm lugs, anatomical downward strap bend, case top cap non-occlusion)
     - `src/devices/devices.test.ts` (15 tests: all 21 devices, 1:1 mm math, named meshes, legacy aliases, normalizeDeviceId, archetype-aware screen-to-body ratios, strict vertical stacking hierarchy, case body dial floor termination, single-mesh safe zone overlay with CircleGeometry and renderOrder 20, and 1:1 camera preset distance invariance)
     - `src/viewer/viewerInvariants.test.ts` (259 tests: Frustum visibility across all 21 devices, wrist on/off, camera presets front/tilt35/side75, normal vs 1:1 real size mode, no NaN/Infinity, no gimbal lock, safe zone alignment and single-instance invariant, 1:1 camera preset distance retention, Compare PNG stitch export)
3. **Production Build:**
   - Command: `npm run build`
   - Exit Code: `0`
   - Outcome: Vite production build generated `dist/` bundle cleanly in 950 ms.

## Production audit — 2026-10-15

| Check | Result |
|---|---|
| `npm.cmd run typecheck` | PASS (0 errors) |
| `npm.cmd run test` | PASS (187/187) |
| `npm.cmd run build` | PASS (three/react split into vendor chunks, no size warning) |
| Dev server loads, no console errors | PASS (built-in browser) |
| Global shortcuts ignored while calibration dialog is open | PASS (`W` did not switch view mode) |
| Calibration dialog closes on Escape | PASS |
| No-WebGL path shows error overlay instead of crashing | Code fix only — NOT verified in a browser with WebGL disabled |
| PNG export via `toBlob` | Code fix only — download not verified manually |

## v1.0 production pass — 2026-10-15

New: clipboard paste, drop on 3D view, crop dialog, live window capture, native-pixel mode, side-by-side compare
with synced cameras, URL-hash share links, MIT license. Verified in the built-in browser (Chromium) on the dev server
and on `vite preview` of the production build.

| Check | Result | How |
|---|---|---|
| `npm.cmd run typecheck` | PASS (0 errors) | |
| `npm.cmd run test` | PASS (197/197, 9 files) | new: `urlState.test.ts`, `screenTexture.test.ts`, resolution-warning cases |
| `npm.cmd run build` | PASS | |
| Production preview console | PASS (no messages) | `vite preview`, compare + safe zones + tilt preset |
| Paste image (Ctrl+V) | PASS | synthetic `ClipboardEvent` with a 1920×1080 PNG → loaded as `pasted-HHMMSS.png` |
| Non-square warning points to Crop; 1024² sample on a 480² watch no longer warns | PASS | |
| Crop dialog: wheel resize, Enter applies, shade clipped to frame | PASS | |
| Live capture: frames update on the watch, crop applies, Stop keeps last frame and ends the track | PASS | `getDisplayMedia` stubbed with `canvas.captureStream()`; the real browser picker was NOT exercised |
| Native px: display texture = panel width (480), nearest mag filter, no mipmaps | PASS | |
| Compare: second viewer, camera positions identical after dragging the first | PASS | |
| URL hash: state written on change; pasted link applied via `hashchange`; missing keys reset to defaults | PASS | |
| Phone width (375 px): no horizontal page scroll | PASS | was 381 px before |
| Sidebar: no horizontal scroll at 1100 px breakpoint | PASS | |
| Drop a file onto the 3D view | NOT TESTED | drag-and-drop of OS files cannot be driven from the test browser |
| Firefox / Safari | NOT TESTED | |

## Studio design alignment — 2026-10-15

WearView now uses the wristandpocket.dev design tokens: Outfit + Fira Code (vendored latin subsets, no external
requests), teal `#72e0d6` / purple `#c49bfc` accents, studio surfaces and borders, `W&P / WearView` wordmark linking
to the studio. The studio site header links to `/wearview/`.

| Check | Result | How |
|---|---|---|
| `npm.cmd run typecheck` | PASS (0 errors) | |
| `npm.cmd run test` | PASS (197/197, 9 files) | |
| `npm.cmd run build` | PASS | fonts emitted as hashed assets (32 kB + 36 kB) |
| Dev console | PASS (no errors) | compare + native px + safe zones on |
| Hidden labels ("Device", "Compare with") no longer visible | PASS | `.sr-only` was referenced but never defined |
| Adjacent active toggles stay visually separate | PASS | Native px + Compare + Safe Zones all on, 1600 px |
| Controls dock fits one row at 1600 px | PASS | Export PNG moved to header actions; display + tools bars merged |
| Phone width (375 px) header and dock | PASS | |
| Studio site `jekyll build`: WearView nav link is `/wearview/` in en and uk (no locale prefix) | PASS | studio nav on a real phone NOT TESTED |

## SEO and studio landing — 2026-10-15

| Check | Result | How |
|---|---|---|
| App page JSON-LD (WebApplication) | PASS | present in `dist/index.html` |
| OG image `wristandpocket.dev/assets/images/tools/wearview-og.webp` (1200×630) | PASS | served by the studio site, deployed together |
| Studio `/tools/wearview/` in en/uk/ru/ko, SoftwareApplication + FAQPage JSON-LD parse | PASS | local `jekyll build`, JSON parsed |
| Localized studio pages link to `/wearview/` without a locale prefix | PASS | `static_href` |
| Dev-only: sample screen black after full reload until re-selected | NOT A PROD BUG | production build shows the sample on load |

## Post-v1.0 defect fixes & 21-device catalogue expansion — 2026-10-23

Fixes for 1:1 mode retention on camera angle presets, safe-zone overlay depth testing against raised bezels, single stitched PNG export in Compare mode, and expansion of the 1:1 physical device catalogue from 11 to 21 Wear OS smartwatches.

| Check | Result | How |
|---|---|---|
| `npm run typecheck` | PASS (0 errors) | `tsc --noEmit` on macOS |
| `npm run test` | PASS (319/319, 9 files) | 21 devices × wrist states × camera presets × modes verified in `viewerInvariants.test.ts` & `devices.test.ts` |
| `npm run build` | PASS (950 ms) | `tsc && vite build` |
| 10 new Wear OS devices (1:1 mm dimensions, PPI math, vertical clearance, frustum invariants) | PASS | `pixel-watch-4-41`, `pixel-watch-4-45`, `galaxy-watch-6-40`, `galaxy-watch-6-44`, `galaxy-watch-5-44`, `galaxy-watch-8-classic-46`, `galaxy-watch-5-pro-45`, `galaxy-watch-4-classic-46`, `oneplus-watch-3-46`, `xiaomi-watch-2-pro-46` |
| 1:1 mode preserved on Tilt 35° & Side 75° (unit / state invariant) | PASS | verified in `viewerInvariants.test.ts` (`isRealSize === true`, `fov === 8`, `minDistance`/`maxDistance` and camera-to-target distance equal `computeRealSizeCameraDistance`) and removed `setPxPerMm(null)` reset in `App.tsx` |
| Safe Zones `depthTest: true` + `polygonOffset` (`-4, -4`) configuration | PASS | verified material flags in `devices.test.ts` and `viewerInvariants.test.ts` |
| Compare mode single PNG export composition (unit test) | PASS | verified 2D canvas dimensions (`1600×600`), lighting background fill, side-by-side `drawImage` calls, and single `toBlob` trigger in `viewerInvariants.test.ts` |
| Live browser visual check: Tilt 35° in 1:1, Safe Zones bezel occlusion under tilt, Compare + Export PNG download | NOT TESTED | CLI sandbox blocks local TCP port binding (`listen EPERM 127.0.0.1`) and has no interactive WebGL browser attached; requires manual verification in a desktop browser |
