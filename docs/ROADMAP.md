# WearView — Product Roadmap

This document outlines planned enhancements, post-MVP capabilities, and future integration milestones. None of the items listed below are considered part of the current MVP release.

---

## 1. Calibrated Pixel Perfect 1:1 Physical Scale Mode — shipped

Implemented: card calibration dialog (`src/components/CalibrationDialog.tsx`), stored px/mm per screen signature
(`src/calibration/calibration.ts`), and a narrow-FOV camera whose distance is solved so the display plane renders at
exactly the calibrated scale (`ThreeViewer.setRealScale`). Possible follow-ups: ruler-based calibration, a
"compare two watches side by side at 1:1" view.

---

## 2. Additional Device Profiles (P1)

Following the strict research-first methodology established in MVP:
- **Samsung Galaxy Watch7 / Ultra:** (Watch6 44 mm and Watch5 40 mm shipped.)
- **Google Pixel Watch 2 & 3 (41 mm and 45 mm variants):** Larger active display areas, curved Actua display specs.
- **OnePlus Watch 2 / 2R:** Dual-engine architecture, 1.43" AMOLED, distinctive asymmetric stainless steel right chassis.
- **Mobvoi TicWatch Pro 5:** Dual-layer display (Ultra-low-power FSTN LCD overlaying OLED).

---

## 3. High-Quality Rigged Hand & Arm Context (P2)

- Optional scanned/rigged 3D hand and arm models with natural skin textures and tone adjustments.
- Plausible arm resting angles (e.g. wrist turned toward face in typical glance posture).
- Ability to toggle between low-poly mannequin reference and high-fidelity arm.

---

## 4. Developer Export & Presets (P2)

- One-click high-resolution screenshot export from current camera angle (PNG with transparent or dark studio background).
- Pre-set camera angles: Top-Down Front Face, $45^\circ$ Hero Angle, Profile Rim View.
- Side-by-side device comparison mode (viewing Galaxy Watch5 and Pixel Watch concurrently).

---

## 5. Wrist & Pocket Integration Seams (P2)

- Embeddable web component / iframe player for game landing pages and store listings.
- Lightweight URL hash or postMessage API for passing game screenshot textures dynamically.
