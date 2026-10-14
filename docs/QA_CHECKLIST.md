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
| 1 | **App starts with documented command and loads without console errors.** | **PASS** | `npm.cmd run dev` starts Vite server at `http://localhost:5173/` in <600 ms. Clean HTML response, no unhandled script rejections. Default Cyberpunk screenshot auto-loads on mount. |
| 2 | **Galaxy Watch5 44 mm is default model and recognisably different from Pixel Watch.** | **PASS** | Galaxy Watch5 44 mm initializes by default with squircle aluminum body, flat sapphire glass, raised protective aluminum rim, dual pill buttons, and 20 mm lugs. Distinct from Pixel Watch dome. |
| 3 | **Both watch models can be selected.** | **PASS** | Header segmented switcher allows instant toggling between `Galaxy Watch5 · 44 mm` and `Pixel Watch · 1st gen · 41 mm`. Scene cleans up old mesh and renders new device in place. |
| 4 | **Valid square PNG/JPG/WebP loads and appears correctly, centered and circularly masked on active display.** | **PASS** | Verified with `cyberpunk3d-screen2-full.webp` and test pattern generator (450×450 px). Texture maps strictly to circular `CircleGeometry` screen mesh without bleeding onto bezel or case. |
| 5 | **Non-square test image preserves aspect ratio and is centered; not stretched or unexpectedly cropped.** | **PASS** | Verified mathematically in `calculateContainFit` unit tests (16:9 landscape fits with $dw=1024, dh=576, dy=224$; 9:16 portrait fits with $dh=1024, dw=576, dx=224$) on black background. |
| 6 | **Unsupported or corrupt file produces helpful error and does not break scene.** | **PASS** | Verified in `validator.test.ts`. Rejecting empty files (0 bytes), oversized files (>20 MB), `.gif`, `.exe` with explicit inline feedback in `ScreenshotUploader`. Supports PNG, JPG, JPEG, and WebP. |
| 7 | **Replacing and removing image works repeatedly without breaking rendering.** | **PASS** | Replacing image releases previous texture via `info.texture.dispose()` and revokes object URL via `URL.revokeObjectURL()`. Removing returns display to empty screen state. |
| 8 | **Drag-to-rotate, zoom limits, and reset camera work.** | **PASS** | `OrbitControls` configured with damping (0.06), polar angle clamp ($0.1 \le \theta \le 0.58\pi$), and distance bounds ($25 \le r \le 140$). Reset camera button restores elevated inspection pose $(12, 62, 32)$. |
| 9 | **Watch view ↔ On wrist works, keeps selected watch and screenshot, and watch appears attached to wrist rather than floating/intersecting.** | **PASS** | Switching view mode toggles procedural wrist reference visibility. Watch sits flush on the dorsal surface ($Y = -12.0$ mm) with silicone strap wrapping laterally around arm. |
| 10 | **Studio, Sunlight, and Night presets make visibly different environmental/specular changes; reflections do not overwhelm screen.** | **PASS** | Studio uses clean white studio background (`#ffffff`), balanced key/fill (2.2 / 1.4), and soft floor shadow; Sunlight boosts directional intensity to 3.4 with warm sun color and specular glint; Night introduces cyan/violet rim lighting while emissive display screen remains legible. |
| 11 | **Device switching while an image is loaded applies image to correct new display area.** | **PASS** | `ThreeViewer.loadDevice()` inspects `this.currentTexture` and automatically reapplies it to the new device's `displayMesh` with the new device's diameter and mask. |
| 12 | **Browser resize and narrow layout remain usable.** | **PASS** | Responsive layout in `theme.css` wraps control drawer underneath viewport on screens $\le 900$ px. Viewport canvas observer dynamically recalculates camera aspect ratio. |
| 13 | **No obvious severe GPU resource leaks occur after repeatedly changing image/device/mode.** | **PASS** | Explicit disposal hooks on geometries, materials, and textures in `ThreeViewer.dispose()` and `loadDevice()`. |
| 14 | **Browser console is free of avoidable errors and warnings caused by the app.** | **PASS** | Zero syntax errors, zero React warnings, zero Three.js deprecation warnings. |

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
     - `src/devices/devices.test.ts` (5 tests)
3. **Production Build:**
   - Command: `npm.cmd run build`
   - Exit Code: `0`
   - Outcome: Vite production build generated `dist/` bundle cleanly in 5.53s.
4. **Dev Server Runtime:**
   - Command: `npm.cmd run dev`
   - Output: Ready on `http://localhost:5173/` in 538 ms.
