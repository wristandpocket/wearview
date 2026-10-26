# WearView

> **A physically-aware 3D preview tool for Wear OS game developers.**

🌐 **Live Web Application:** [https://wristandpocket.dev/wearview/](https://wristandpocket.dev/wearview/)  
📦 **GitHub Repository:** [wristandpocket/wearview](https://github.com/wristandpocket/wearview)

WearView helps smartwatch developers inspect how game and interactive app screens will look on the active circular display of real Wear OS hardware. Rotate the watch in 3D, inspect bezel and rim clearance, test different lighting conditions, and evaluate scale context on a neutral wrist reference.

### 10-second loop

1. Take a screenshot of your game (Unity Game view, emulator, ShareX, Snipping Tool) so it lands in the clipboard.
2. Press **Ctrl+V** (⌘V) anywhere in WearView. Not square? Press **K** and drag the square over the game area.
3. Or skip screenshots entirely: **Capture window (live)** mirrors the Unity Game view or the Wear OS emulator onto the watch while you play.

---

## Key Features

- **21 smartwatches across 4 grouped families, modeled from published specs:**
  - **Google Pixel Watch:** Pixel Watch 1/2 (41mm), Pixel Watch 3 (41mm & 45mm), Pixel Watch 4 (41mm & 45mm) — 3D domed pebble glass, fluted crown, flush side key.
  - **Samsung Galaxy Watch (Modern Flat):** Galaxy Watch7 (40mm & 44mm), Galaxy Watch6 (40mm & 44mm), Galaxy Watch5 (40mm & 44mm) — flat sapphire crystal, slim chamfered aluminum protective rim, dual pill buttons.
  - **Samsung Galaxy Watch (Classic, Pro & Ultra):** Galaxy Watch8 Classic (46mm), Galaxy Watch6 Classic (43mm & 47mm with physical 48-teeth knurled rotating bezel), Galaxy Watch5 Pro (45mm titanium concave raised rim), Galaxy Watch4 Classic (46mm), Galaxy Watch Ultra (47mm cushion squircle titanium body with orange Quick Button).
  - **OnePlus, Xiaomi & Mobvoi:** OnePlus Watch 3 (46mm), OnePlus Watch 2 (46mm asymmetric chrono chassis), Xiaomi Watch 2 Pro (46mm 72-notch Parisian hobnail bezel), Mobvoi TicWatch Pro 5 (48mm tactical knurled bezel and guarded center crown).
- **Real size (1:1) mode:** a one-time calibration with any bank/ID card (ISO/IEC 7810 ID-1, 85.6 × 53.98 mm) measures CSS pixels per millimetre on your screen; the watch is then drawn at its true physical size. Calibration is stored per screen + browser zoom and re-requested when either changes. Adjust with slider, buttons, mouse wheel, arrow keys or pinch.
- **Fast input:** paste from the clipboard, drop a file anywhere on the 3D view, or pick a file. PNG, JPEG, WebP up to 20 MB.
- **Live window capture:** share a window (Unity Game view, Android emulator, any app) and it plays on the watch screen in real time, cropped to a square you choose. Stopping the share keeps the last frame. Chrome, Edge and Firefox on desktop.
- **Crop:** pick the square game area out of a full-window screenshot or capture; drag, resize from the corner or with the wheel, nudge with arrow keys.
- **Native pixels:** shows the screen resampled to the watch's own panel resolution (e.g. 480×480) with crisp nearest-neighbour pixels, so small text and pixel art look the way they will on the device.
- **Side-by-side compare:** two watches next to each other with their cameras locked together; works in real-size (1:1) mode too.
- **Shareable links:** device, compare device, lighting, view mode, safe zones and pixel mode live in the URL hash; **Copy link** puts it on the clipboard. Screenshots are never part of a link.
- **Screen on the real display surface:** the screenshot is clipped to the active circular area only, aspect ratio preserved (centered `contain` fit for non-square images), correct sRGB handling.
- **Glossy cover glass:** glass reflects a dedicated dark softbox environment, so the screen stays crisp and saturated while highlights sweep across it as you tilt the watch.
- **Lighting presets:** Studio, Sunlight (strong glare on the glass) and Night.
- **Watch / On wrist:** the same watch on a simple neutral arm; the band wraps the wrist cross-section.
- **Wear OS Safe-Zone & Radial Ticks Overlay:** Interactive 3D wireframe overlay showing the 100% outer display border, 90% Action/Button Safe Zone, and 80% Title/Text Safe Zone, plus 15° tick marks and cardinal axes (`12h / 3h / 6h / 9h`) to test against bezel occlusion (toggle in dock or press keyboard shortcut `S`).
- **Quick Camera Angle Presets:** Fast one-click viewing angle presets for inspection:
  - `Front (0°)`: Straight-on perpendicular view directly over the screen face.
  - `Tilt (35°)`: Natural wrist-glance viewing angle to verify edge button clearance on raised bezels.
  - `Side (75°)`: Grazing angle to inspect dome curvature, case thickness (9.7mm vs 12.3mm), and wrist contact.
- **High-Resolution PNG Snapshot Export:** 1-click snapshot export from the dock generating clean PNG renders (`wearview-{deviceId}-{timestamp}.png`) via synchronous frame capture with zero runtime frame-rate penalty (`preserveDrawingBuffer: false`).
- **Hardware-Aware Procedural QA Pattern:** Built-in test pattern showing exact native resolution (e.g. `456×456 px`), physical diameter and density (`35.56 mm • 320 PPI`), and safe margin guides, with instant 1-click toggling between sample game graphics (`Cyberpunk 3D`) and QA calibration rings.
- **Physical Ergonomics Pack:**
  - **14 mm Finger Contact Pad (`👆 14mm Finger`):** Translucent cursor-following human fingertip pad (`14 mm × 15.5 mm`) scaled dynamically to `pxPerMm` in calibrated `1:1` mode to test whether touch targets and close buttons are fat-finger safe.
  - **2-Second Glanceability Test (`⏱ 2s Glance`):** Simulates a realistic wrist raise (`35°` tilt -> `0°` front view for `2.0 s` -> tilt away) to test whether HUD metrics and actions are readable within a two-second glance.
  - **AOD & OLED Burn-In Checker (`☀️ AOD / OPR`):** Computes circular On-Pixel Ratio (`OPR %`), ITU-R BT.709 average luminance, and burn-in hotspots (`> 85%` luminance) with a circular OLED pixel heatmap to verify Google Play `< 10% OPR` ambient compliance.
- **External Tooling `postMessage` Bridge:** Accepts `{ type: 'wearview:frame', image, name }` messages from companion local developer tools (Watch Deploy, UI Blueprint) to load live screenshots directly onto the 3D watch surface without any backend dependency.
- **Responsive:** phones (portrait and landscape), tablets, desktops and ultrawide monitors.
- **Local-only:** images and captured windows never leave the browser. No accounts, no analytics, no backend.

---

### Keyboard Shortcuts

For rapid inspection without taking hands off the keyboard:

| Shortcut | Action | Description |
| :---: | :--- | :--- |
| **`P`** | **PNG Snapshot** | Export high-resolution PNG render (`wearview-{deviceId}-{timestamp}.png`) |
| **`S`** | **Safe Zones** | Toggle 3D Wear OS Safe-Zone wireframe (80% text, 90% action, 100% boundary) |
| **`R`** | **Reset View** | Reset camera angle and distance back to default home pose |
| **`W`** | **Watch / Wrist** | Toggle view between isolated watch and anatomical wrist mount |
| **`1`** | **Front (0°)** | Animate camera to perpendicular top-down screen view |
| **`2`** | **Tilt (35°)** | Animate camera to natural wrist-glance angle (checks raised bezel occlusion) |
| **`3`** | **Side (75°)** | Animate camera to grazing angle (checks dome curvature, thickness, wrist contact) |
| **`C`** | **Compare** | Toggle a second watch side by side (cameras stay in sync) |
| **`N`** | **Native pixels** | Toggle rendering at the watch's real panel resolution |
| **`K`** | **Crop** | Select the square game area of the current screenshot or capture |
| **`Ctrl+V`** | **Paste** | Load an image from the clipboard |

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

# Run Vitest unit tests (1:1 physical math, validation, calibration, crop, URL state, 11 device models)
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
- [Deployment & Cloud Infrastructure](docs/DEPLOYMENT.md) — GitHub Pages setup on the `wristandpocket` organization (`wristandpocket.dev/wearview/`).
- [Roadmap](docs/ROADMAP.md) — Future physical-scale calibration, additional devices, and developer tooling.
- [Agent Operating Guidelines](AGENTS.md) — Development rules and verification protocol for AI agents.
- [Contributing](CONTRIBUTING.md) — How to build, test and add a watch.

---

## License

[MIT](LICENSE)

Bundled fonts (Outfit, Fira Code) are under the [SIL Open Font License 1.1](https://openfontlicense.org).
