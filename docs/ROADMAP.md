# WearView — Product Roadmap

This document outlines planned enhancements, post-MVP capabilities, and future integration milestones. None of the items listed below are considered part of the current MVP release.

---

## 1. Calibrated Pixel Perfect 1:1 Physical Scale Mode (P1)

### The Challenge
A mathematically correct 3D model does not automatically display at its true physical scale on arbitrary computer screens. Screen pixel density (PPI), OS display scaling factors (e.g. 125%, 150%, 200%), and browser zoom levels vary across setups.

### Proposed Solution
- **Interactive Credit Card / Calibration Ruler Flow:** The developer holds a standard credit/ID card (ISO/IEC 7810 ID-1 standard: $85.60 \times 53.98\text{ mm}$) or a physical ruler against their monitor and adjusts a calibration on-screen slider until the outline matches.
- **DPI Calculation:** Compute the exact CSS pixels per physical millimetre for that specific monitor.
- **1:1 Scale Lock:** Orthographic or fixed-distance perspective camera lock displaying the watch model at true 1:1 real-world size.

---

## 2. Additional Device Profiles (P1)

Following the strict research-first methodology established in MVP:
- **Samsung Galaxy Watch6 / Watch7:** Slimmer bezels, upgraded Sapphire crystal.
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
