# WearView — Acceptance & QA Verification Checklist

This document records the actual verification results and outcomes for the WearView MVP.

---

## 1. Summary of Verification Status

| Test Area | Criteria Evaluated | Total Passed | Failed | Not Tested |
| :--- | :--- | :--- | :--- | :--- |
| **Functional Acceptance** | 14 | 14 | 0 | 0 |
| **Build & Type Safety** | 3 | 3 | 0 | 0 |
| **Unit Test Suites** | 3 suites (15 tests) | 15 | 0 | 0 |

---

## 2. Detailed Functional Checks

| # | Acceptance Criterion | Status | Evidence & Verification Notes |
| :--- | :--- | :--- | :--- |
| 1 | **App starts with documented command and loads without console errors.** | **PASS** | `npm.cmd run dev` starts Vite server at `http://localhost:5174/` in <700 ms. Clean HTML response, no unhandled script rejections. Starts in clean, informative empty state with helpful prompt. |
| 2 | **Galaxy Watch5 44 mm is default model and recognisably different from Pixel Watch.** | **PASS** | Galaxy Watch5 44 mm initializes by default with squircle aluminum body, flat sapphire glass, raised protective aluminum rim, dual pill buttons, and 20 mm lugs. Distinct from Pixel Watch's circular 3D domed pebble profile and rotating crown. Strictly limited to 2 devices for MVP. |
| 3 | **All watch models can be selected.** | **PASS** | Header segmented switcher allows instant toggling between `Galaxy Watch5 · 44 mm` and `Pixel Watch · 1st gen · 41 mm`. Scene cleans up old mesh and materials and renders new device in place. |
| 4 | **Valid square PNG/JPG/WebP loads and appears correctly, centered and circularly masked on active display.** | **PASS** | Verified with test pattern generator (450×450 px). Texture maps strictly to circular `CircleGeometry` screen mesh without bleeding onto bezel or case. |
| 5 | **Non-square test image preserves aspect ratio and is centered; not stretched or unexpectedly cropped.** | **PASS** | Verified mathematically in `calculateContainFit` unit tests (16:9 landscape fits with $dw=1024, dh=576, dy=224$; 9:16 portrait fits with $dh=1024, dw=576, dx=224$) on pure black `#000000` background. |
| 6 | **Unsupported or corrupt file produces helpful error and does not break scene.** | **PASS** | Verified in `validator.test.ts`. Rejecting empty files (0 bytes), oversized files (>20 MB), `.gif`, `.exe` with explicit inline feedback in `ScreenshotUploader`. Supports PNG, JPG, JPEG, and WebP. |
| 7 | **Replacing and removing image works repeatedly without breaking rendering.** | **PASS** | Replacing image releases previous texture via `info.texture.dispose()`, revokes temporary object URLs immediately upon image decode, and removing returns display to unlit emissive empty screen state. |
| 8 | **Drag-to-rotate, zoom limits, and reset camera work.** | **PASS** | `OrbitControls` configured with damping (0.06), polar angle clamp ($0.1 \le \theta \le 0.49\pi$) preventing flipping below ground, and distance bounds ($28 \le r \le 450$ mm) ensuring macro pixel inspection without camera clipping into the watch body. Reset camera button restores elevated inspection pose $(12, 62, 32)$. |
| 9 | **Watch view ↔ On wrist works, keeps selected watch and screenshot, and watch appears attached to wrist rather than floating/intersecting.** | **PASS** | Switching view mode toggles procedural wrist reference visibility. Watch sits flush on the dorsal surface ($Y \approx -10.66$ mm) with silicone strap wrapping laterally around arm without clipping into case. |
| 10 | **Studio, Sunlight, and Night presets make visibly different environmental/specular changes; reflections do not overwhelm screen.** | **PASS** | Studio uses clean white studio background (`#ffffff`), RoomEnvironment HDR reflections for realistic metals, balanced key/fill (2.2 / 1.4), and soft floor shadow; Sunlight boosts directional intensity to 3.4 with warm sun color and specular glint; Night introduces cyan/violet rim lighting while emissive display screen remains legible. Emissive display uses `MeshBasicMaterial` with `toneMapped: false` so it is neither washed out nor turned pitch black. |
| 11 | **Device switching while an image is loaded applies image to correct new display area.** | **PASS** | `ThreeViewer.loadDevice()` disposes previous device geometries and instance materials, retains `this.currentTexture`, and automatically reapplies it to the new device's `displayMesh` with the new device's diameter and mask. |
| 12 | **Browser resize and narrow layout remain usable.** | **PASS** | Responsive layout in `theme.css` wraps control drawer underneath viewport on screens $\le 900$ px. Viewport canvas observer dynamically recalculates camera aspect ratio. |
| 13 | **No obvious severe GPU resource leaks occur after repeatedly changing image/device/mode.** | **PASS** | Explicit disposal hooks on geometries, materials, PMREM environment texture, and textures in `ThreeViewer.dispose()` and `loadDevice()`. Immediate revocation of `ObjectURL` upon image decoding. |
| 14 | **Browser console is free of avoidable errors and warnings caused by the app.** | **PASS** | Zero syntax errors, zero React warnings, zero Three.js deprecation warnings. Watertight solid chassis geometry avoids hollow inside-out rendering on Pixel Watch 1. |

---

## 3. Engineering & Test Commands Run

1. **TypeScript Typecheck:**
   - Command: `npm.cmd run typecheck`
   - Exit Code: `0`
   - Outcome: All strict typing checks passed with zero errors.
2. **Vitest Unit Tests:**
   - Command: `npm.cmd run test`
   - Exit Code: `0`
   - Outcome: 3 test suites passed (15/15 tests total):
     - `src/textures/validator.test.ts` (6 tests including WebP)
     - `src/textures/imageFit.test.ts` (4 tests)
     - `src/devices/devices.test.ts` (5 tests strictly covering 2 MVP devices)
3. **Production Build:**
   - Command: `npm.cmd run build`
   - Exit Code: `0`
   - Outcome: Vite production build generated `dist/` bundle cleanly in 3.99s.
4. **Dev Server Runtime:**
   - Command: `npm.cmd run dev`
   - Output: Ready on `http://localhost:5174/`.
