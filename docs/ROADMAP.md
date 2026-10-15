# WearView — Product Roadmap

This document outlines planned enhancements, post-MVP capabilities, and future integration milestones. None of the items listed below are considered part of the current MVP release.

---

## 1. Calibrated Pixel Perfect 1:1 Physical Scale Mode — shipped

Implemented: card calibration dialog (`src/components/CalibrationDialog.tsx`), stored px/mm per screen signature
(`src/calibration/calibration.ts`), and a narrow-FOV camera whose distance is solved so the display plane renders at
exactly the calibrated scale (`ThreeViewer.setRealScale`). Possible follow-ups: ruler-based calibration, a
"compare two watches side by side at 1:1" view.

---

## 2. Expanded Top 10+ Device Catalog — shipped

Shipped all 11 top Wear OS models with 1:1 millimeter physical proportions, 5 procedural archetypes, and grouped dropdown selector:
- **Google Pixel Watch:** Pixel Watch 1/2 (41mm), Pixel Watch 3 (41mm), Pixel Watch 3 (45mm).
- **Samsung Galaxy Watch (Modern Flat):** Galaxy Watch7 (40mm & 44mm), Galaxy Watch5 (40mm).
- **Samsung Galaxy Watch (Classic & Ultra):** Galaxy Watch6 Classic (43mm & 47mm), Galaxy Watch Ultra (47mm).
- **OnePlus & Mobvoi:** OnePlus Watch 2 (46mm), Mobvoi TicWatch Pro 5 (48mm).

---

## 3. High-Quality Rigged Hand & Arm Context (P2)

- Optional scanned/rigged 3D hand and arm models with natural skin textures and tone adjustments.
- Plausible arm resting angles (e.g. wrist turned toward face in typical glance posture).
- Ability to toggle between low-poly mannequin reference and high-fidelity arm.

---

## 4. Developer Export & Presets — mostly shipped

Shipped: PNG export, camera presets (Front / Tilt 35° / Side 75°), side-by-side compare with synced cameras,
URL-hash shareable view state, clipboard paste, live window capture with crop, native-pixel display.
Open: transparent-background export, watching a folder for new screenshots (File System Access API).

### Original notes

- One-click high-resolution screenshot export from current camera angle (PNG with transparent or dark studio background).
- Pre-set camera angles: Top-Down Front Face, $45^\circ$ Hero Angle, Profile Rim View.
- Side-by-side device comparison mode (viewing Galaxy Watch5 and Pixel Watch concurrently).

---

## 5. Wrist & Pocket Integration Seams (P2)

- Embeddable web component / iframe player for game landing pages and store listings.
- Lightweight URL hash or postMessage API for passing game screenshot textures dynamically.
