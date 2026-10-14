# WearView — Architecture Documentation

This document describes the runtime architecture, coordinate conventions, 3D scene lifecycle, texture processing pipeline, and extension seams for WearView.

---

## 1. System Overview & Technology Stack

WearView is built as a zero-backend, client-side developer utility:
- **Core Runtime:** React 19 + TypeScript (strict mode enabled).
- **3D Graphics Engine:** Three.js (r174) with standard `WebGLRenderer`, `PerspectiveCamera`, and `OrbitControls`.
- **Bundler & Build Tool:** Vite 6 with standard ESM output.
- **Test Runner:** Vitest 3 for fast unit testing of pure geometry and image-fit math.

---

## 2. Component Boundaries & Directory Layout

```
wearview/
├── docs/                     # Product, device research, architecture, QA, roadmap
├── src/
│   ├── types/               # App-wide interfaces, DeviceId, LightingPreset, ViewMode
│   ├── devices/             # Device profile registry and procedural 3D model builders
│   │   ├── types.ts         # DeviceSpec and DeviceModelResult interfaces
│   │   ├── materials.ts     # PBR materials factory (aluminum, stainless steel, glass, strap)
│   │   ├── galaxyWatch5.ts  # Samsung Galaxy Watch5 44 mm procedural geometry
│   │   ├── galaxyWatch5_40mm.ts # Samsung Galaxy Watch5 40 mm procedural geometry
│   │   ├── pixelWatch1.ts   # Google Pixel Watch 1st gen 41 mm procedural geometry
│   │   └── index.ts         # Device catalogue registry & model factory dispatch
│   ├── textures/            # Image validation, aspect-fit math, and texture loader
│   │   ├── validator.ts     # Client-side file type and file size validation
│   │   ├── imageFit.ts      # Pure contain-fit algorithm preserving aspect ratio
│   │   ├── textureLoader.ts # Canvas compositor, sRGB Three.js texture generator & disposal
│   │   └── testPattern.ts   # Local non-copyrighted QA test image generator
│   ├── wrist/               # Neutral 3D forearm and dorsal wrist reference
│   │   └── wristModel.ts    # Procedural lofted anatomical wrist geometry
│   ├── viewer/              # Three.js scene, camera, lighting, and render loop
│   │   └── ThreeViewer.ts   # WebGL renderer lifecycle, lights, shadow receiver, controls
│   ├── components/          # React UI components
│   │   ├── Header.tsx       # Brand, local-first indicator, device selector, reset camera
│   │   ├── ControlsBar.tsx  # Watch/Wrist toggle, Studio/Sunlight/Night, test pattern trigger
│   │   ├── ScreenshotUploader.tsx # Drag-and-drop file picker, image metadata, replace/remove
│   │   ├── DeviceSpecDrawer.tsx   # Verified physical specs and visual approximation notes
│   │   └── ViewportOverlay.tsx    # HUD badges, navigation cues, WebGL error fallback
│   ├── styles/              # Design tokens and responsive dark studio CSS
│   │   └── theme.css
│   ├── App.tsx              # Root coordinator wiring UI state to ThreeViewer
│   └── main.tsx             # React DOM entry point
```

---

## 3. 3D Scene Coordinate Conventions & Framing

### Coordinate System
- **Unit Scale:** $1\text{ scene unit} = 1\text{ millimetre (mm)}$.
- **Origin $(0, 0, 0)$:** Center of the watch display surface.
- **Axes Alignment:**
  - $+Y$: Upwards (normal to watch display face).
  - $-Y$: Downwards (towards case back, wrist, and ground shadow plane).
  - $+X$: 3 o'clock (Watch crown and side buttons). Points distally towards the hand on the left wrist.
  - $-X$: 9 o'clock (Watch speaker slit / plain case flank). Points proximally towards the elbow.
  - $-Z$: 12 o'clock (Top of screen / North).
  - $+Z$: 6 o'clock (Bottom of screen / South).

### Camera & Orbit Controls
- **Default Framing:** Camera at $(12, 62, 32)$ looking at target $(0, -2, 0)$. This provides an elevated $3/4$ perspective showing the face, raised rim / domed glass, case profile, and side controls simultaneously.
- **Constraints:**
  - `minPolarAngle = 0.1` rad, `maxPolarAngle = 0.58 \pi` rad: Prevents camera from tumbling below the floor plane.
  - `minDistance = 15` mm, `maxDistance = 450` mm: Extended zoom allows close-up macro pixel inspection down to 15 mm, and zooming out to 450 mm to compare with real-life physical scale on wrist at arm's length.

---

## 4. Screenshot Mapping & Circular Display Masking

### The Active Display Layer
A common flaw in generic mockup tools is stretching rectangular textures across the entire watch front. WearView isolates the display:
1. **Geometric Screen Mask:** The display surface is a dedicated `CircleGeometry` sized to the exact physical active diameter of the selected device:
   - **Galaxy Watch5 (44 mm):** $R = 17.3\text{ mm}$ ($34.6\text{ mm}$ diameter, $450 \times 450\text{ px}$, $321\text{ ppi}$).
   - **Galaxy Watch5 (40 mm):** $R = 15.2\text{ mm}$ ($30.4\text{ mm}$ diameter, $396 \times 396\text{ px}$, $330\text{ ppi}$).
   - **Pixel Watch (1st gen, 41 mm):** $R = 16.75\text{ mm}$ ($33.5\text{ mm}$ calibrated diameter, $450 \times 450\text{ px}$).
2. **Aspect Preservation (`contain` Fit):**
   - If an uploaded screenshot is square ($1:1$), it maps $1:1$ into the circular UV boundary.
   - If non-square (e.g. landscape or portrait), `calculateContainFit` centers the image on a neutral black background ($#000000$) without stretching.
   - Native WebP, PNG, JPG, and JPEG formats supported.
3. **Color Space & Emissive Fidelity:**
   - Textures are tagged with `THREE.SRGBColorSpace`.
   - The screen mesh uses `MeshBasicMaterial` with `toneMapped: true`. This ensures the developer's game UI colors match their source values without being washed out by scene lights.
4. **Front Glass Crystal:**
   - Positioned cleanly above the screen plane with `clearcoat: 1.0`, `roughness: 0.03`, and subtle `opacity: 0.06` with `depthWrite: false`.
   - Zero transmission bleaching: preserves rich author contrast on white studio background.

---

## 5. Lighting Presets & Environmental Response

WearView implements 3 distinct lighting presets via `ThreeViewer.setLightingPreset`:
1. **Studio:**
   - Clean pure white studio background (`#ffffff`).
   - Dynamic equirectangular HDR environment (`RoomEnvironment` compiled via `PMREMGenerator`) providing natural specular reflections on Armor Aluminum and polished steel.
   - Balanced key ($0xffffff, 2.2$) and fill ($0xf1f5f9, 1.4$) lights with soft contact shadow plane.
   - Designed for crisp, unbiased screen inspection.
2. **Sunlight:**
   - High-intensity warm directional sun ($0xfffaed, 3.4$) casting sharp contact shadows.
   - Cool sky ambient bounce ($0x93c5fd, 0.7$).
   - Specular glint simulating outdoor high-glare conditions.
3. **Night:**
   - Low ambient floor ($0xf8fafc, 0.4$).
   - Stylized dual rim lights: cool cyan ($0x38bdf8, 2.2$) and violet ($0xa855f7, 1.8$).
   - Emissive screen remains bright and inspectable, demonstrating high-contrast OLED visibility.

---

## 6. Resource Lifecycle & Memory Discipline

- **Texture Disposal:** Uploading a new image or removing an image invokes `disposeUploadedTexture`:
  - Calls `texture.dispose()` to free GPU VRAM.
  - Invokes `URL.revokeObjectURL()` to release client blob URLs.
- **Geometry Disposal:** When switching devices, `viewer.loadDevice()` unregisters the existing model and iterates through all child meshes calling `geometry.dispose()`.
- **Canvas Resize:** Monitored via a single `ResizeObserver` on the viewport container, updating camera aspect ratio and renderer pixel dimensions without tearing.

---

## 7. Future Integration Seams (Wrist & Pocket)

WearView is engineered to support clean future integration with **Wrist & Pocket**:
- **Pure Function Device Builders:** All device geometry builders accept `WatchMaterials` and return a typed `DeviceModelResult`.
- **Decoupled Viewer Core:** `ThreeViewer` has zero React dependencies and can be instantiated inside an iframe, web component, or vanilla JavaScript application.
- **Standardized Profile Contract:** `DeviceSpec` exposes standard metadata (`displayDiameterMm`, `resolutionPx`, `bezelRadialWidthMm`, `confirmedSources`) allowing external apps to query capabilities programmatically.
