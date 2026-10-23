# WearView — Device Research & Geometry Specifications

This document records the exact physical specifications, primary manufacturer sources, secondary references, and architectural approximations used to procedurally model all 21 Wear OS devices in WearView.

---

## Device 1: Samsung Galaxy Watch5 (44 mm) — `galaxy-watch-5-44`

### 1. Model Identification
- **Exact Generation & Model:** Samsung Galaxy Watch5 44 mm (Bluetooth SM-R910 / LTE SM-R915)
- **Release Year:** August 2022
- **Operating System:** Wear OS Powered by Samsung (One UI Watch)
- **Primary Sources:**
  - Samsung Official Business Specifications: [Samsung Galaxy Watch5 44mm Graphite](https://www.samsung.com/uk/business/watches/galaxy-watch/galaxy-watch5-44mm-graphite-lte-sm-r915fzaaeua/) (Accessed October 2026 / verified against official Samsung technical specs).
  - Samsung Developer Documentation & Wear OS Specifications (450x450, ~321–330 ppi).

### 2. Specification Breakdown

| Dimension / Property | Status | Value | Source / Confidence |
| :--- | :--- | :--- | :--- |
| **Case Dimensions (W x H x D)** | Confirmed Manufacturer Spec | 44.4 × 43.3 × 9.8 mm | Official Samsung specifications. Note: 9.8 mm depth excludes the rear BioActive sensor glass protrusion. |
| **Display Diameter** | Confirmed Manufacturer Spec | 1.36" / 1.4" nominal (34.60 mm active diameter) | Official Samsung specifications. |
| **Display Resolution** | Confirmed Manufacturer Spec | 450 × 450 pixels (~330 ppi) | Official Samsung specifications, Super AMOLED. |
| **Case Material** | Confirmed Manufacturer Spec | Armor Aluminum | Official Samsung specifications. |
| **Front Glass Material** | Confirmed Manufacturer Spec | Sapphire Crystal (flat) | Official Samsung specifications. |
| **Bezel / Rim Structure** | Estimated from Product Ref | ~4.90 mm radial border from active display to case edge (~2.70 mm black touch bezel + ~2.20 mm raised aluminum lip) | Visual inspection of hardware & high-res teardowns. Standard Watch5 has a capacitive touch bezel, no physical rotating ring. |
| **Lugs & Strap** | Confirmed Manufacturer Spec | 20 mm standard lug width, integrated curved aluminum horns tapering into the body. | Samsung strap compatibility guide. |

---

## Device 2: Google Pixel Watch 1/2 (41 mm) — `pixel-watch-41`

### 1. Model Identification
- **Exact Generation & Model:** Google Pixel Watch (1st & 2nd Generation, 2022/2023)
- **Release Year:** October 2022 / October 2023
- **Primary Sources:**
  - Google Store Tech Specs & Google Support Hardware Specifications: Diameter 41.0 mm, height 12.3 mm, 384 × 384 px, 320 ppi.

### 2. Specification Breakdown

| Dimension / Property | Status | Value | Source / Confidence |
| :--- | :--- | :--- | :--- |
| **Case Dimensions (Diameter x Depth)** | Confirmed Manufacturer Spec | 41.0 mm diameter × 12.3 mm total height | Official Google specifications. Height includes domed rear sensor housing. |
| **Display Diameter** | Confirmed / Derived Spec | 1.20 inches (30.48 mm active diameter) | Derived from 384 px at 320 ppi (`384 / 320 * 25.4 = 30.48 mm`). |
| **Display Resolution** | Confirmed Manufacturer Spec | 384 × 384 pixels (320 ppi) | Official Wear OS / Google Developer specification. |
| **Bezel Width** | Estimated / Derived | 5.26 mm radial bezel width (`(41.0 - 30.48) / 2`) | Derived from confirmed outer diameter and active display diameter. |
| **Band Attachment** | Confirmed Manufacturer Spec | Proprietary lugless slide-and-lock band (~20 mm strap width). | Google technical guides. |

---

## Device 3: Samsung Galaxy Watch5 (40 mm) — `galaxy-watch-5-40`

- **Sources:** [Samsung Galaxy Watch5 40mm Graphite](https://www.samsung.com/uk/watches/galaxy-watch/galaxy-watch5-40mm-graphite-bt-sm-r900nzaaeua/), Vodafone / GSMArena Tech Specs.
- **Confirmed Dimensions:** 40.4 × 39.3 × 9.8 mm, 1.19" (30.23 mm) Super AMOLED, 396 × 396 px (330 ppi), 20 mm lug width.
- **Estimated Bezel:** 5.085 mm radial border (~3.85 mm wide black touch bezel + ~1.235 mm aluminum rim).

---

## Device 4: Samsung Galaxy Watch6 (40 mm & 44 mm) — `galaxy-watch-6-40`, `galaxy-watch-6-44`

- **Sources:** [Samsung Mobile Press spec sheet](https://www.samsungmobilepress.com/media-assets/galaxy-watch6?tab=specs), [GSMArena](https://www.gsmarena.com/samsung_galaxy_watch6-12437.php).

| Model | Case (W × H × D) | Active Display | Resolution & PPI | Bezel / Rim (Estimated) | Lug Width |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Watch6 40 mm** (`galaxy-watch-6-40`) | 40.4 × 38.8 × 9.0 mm (Confirmed) | 33.27 mm / 1.31" (Confirmed) | 432 × 432 px, 330 ppi (Confirmed) | 3.565 mm radial (~2.065 mm black mask + ~1.50 mm aluminum rim) | 20 mm (Confirmed) |
| **Watch6 44 mm** (`galaxy-watch-6-44`) | 44.4 × 42.8 × 9.0 mm (Confirmed) | 37.34 mm / 1.47" (Confirmed) | 480 × 480 px, 327 ppi (Confirmed) | 3.53 mm radial (~2.03 mm black mask + ~1.50 mm aluminum rim) | 20 mm (Confirmed) |

---

## Newly Added 2021–2025 Flagship & Volume Devices (Devices 12–21)

### 1. Google Pixel Watch 4 (41 mm & 45 mm) — `pixel-watch-4-41`, `pixel-watch-4-45`
- **Sources:** [Google Store Pixel Watch 4 Tech Specs](https://store.google.com/product/pixel_watch_4_specs?hl=en-US), [Google Support Hardware Specs](https://support.google.com/googlepixelwatch/answer/12651869?hl=en), [GSMArena](https://www.gsmarena.com/google_pixel_watch_4-14088.php).
- **Confirmed Specs:**
  - **41 mm (`pixel-watch-4-41`):** 41.0 × 41.0 × 12.3 mm case, 320 ppi Actua 360 LTPO AMOLED (3000 nits), Custom 3D Corning Gorilla Glass 5, Satin Recycled Aluminum housing, 20 mm band. Active display diameter **33.02 mm** (1.30", 416 × 416 px at 320 ppi); radial bezel **3.99 mm** (estimated/derived from 10% larger active area and 16% thinner bezel than PW3 41mm).
  - **45 mm (`pixel-watch-4-45`):** 45.0 × 45.0 × 12.3 mm case, 456 × 456 px (320 ppi) Actua 360 LTPO AMOLED, 22 mm band. Active display diameter **36.20 mm** (1.43"); radial bezel **4.40 mm** (estimated/derived from outer case and Actua 360 border reduction).

### 2. Samsung Galaxy Watch8 Classic (46 mm) — `galaxy-watch-8-classic-46`
- **Sources:** [Samsung UK Official Specs (SM-L500)](https://www.samsung.com/uk/watches/galaxy-watch/galaxy-watch8-classic-46mm-black-bluetooth-sm-l500nzkaeua/), [GSMArena](https://www.gsmarena.com/samsung_galaxy_watch8_classic-13998.php).
- **Confirmed Specs:** 46.4 × 46.0 × 10.6 mm stainless steel cushion-squircle case, 1.34" (**34.04 mm**) Super AMOLED display, **438 × 438 px** (~327 ppi), Sapphire crystal, physical rotating stainless steel bezel, center Quick Button at 3 o'clock.
- **Estimated Geometry:** Rotating bezel outer diameter ~43.2 mm (radial bezel width 6.18 mm from active display to outer case), 48 knurled teeth raised 1.35 mm above the cushion top, 22 mm dynamic lug width.

### 3. Samsung Galaxy Watch5 Pro (45 mm) — `galaxy-watch-5-pro-45`
- **Sources:** [Samsung Business Official Specs (SM-R920)](https://www.samsung.com/my/business/watches/galaxy-watch/galaxy-watch5-pro-black-titanium-bluetooth-sm-r920nzkaxme/), [GSMArena](https://www.gsmarena.com/samsung_galaxy_watch5_pro-11749.php).
- **Confirmed Specs:** 45.4 × 45.4 × 10.5 mm Grade 4 Titanium case, 1.36"/1.4" (**34.60 mm**) Super AMOLED display, **450 × 450 px** (~330 ppi), Sapphire crystal, 20 mm D-Buckle sport band lug width.
- **Estimated Geometry:** Smooth, toothless raised concave titanium protective bezel wall (+1.45 mm above the sunken sapphire glass, 3.50 mm radial wall thickness + 1.90 mm inner touch track = 5.40 mm total radial border) modeled via custom lathe profile in `buildGalaxyWatch5ProModel`.

### 4. Samsung Galaxy Watch4 Classic (46 mm) — `galaxy-watch-4-classic-46`
- **Sources:** [Samsung Business Gulf (SM-R890)](https://www.samsung.com/ae/business/watches/galaxy-watch/galaxy-watch4-classic-sm-r890nzkamea/), [Vodafone Specifications](https://devices.vodafone.com.au/samsung/galaxy-watch4-classic-android-wear-os/specifications), [GSMArena](https://www.gsmarena.com/samsung_galaxy_watch4_classic-11046.php).
- **Confirmed Specs:** 45.5 × 45.5 × 11.0 mm Stainless Steel case, 1.4" (**34.60 mm**) Super AMOLED display, **450 × 450 px** (~330 ppi), physical rotating bezel, 20 mm lug width.
- **Estimated Geometry:** 5.45 mm total radial border (~1.85 mm inner chapter ring + ~3.60 mm wide 48-tooth rotating stainless steel bezel).

### 5. OnePlus Watch 3 (46 mm) — `oneplus-watch-3-46`
- **Sources:** [OnePlus Global Specs](https://www.oneplus.com/global/oneplus-watch-3/specs), [GSMArena](https://www.gsmarena.com/oneplus_watch_3-13668.php).
- **Confirmed Specs:** 47.6 × 46.6 × 11.8 mm Stainless Steel chassis with Grade 4 Titanium bezel, **1.50" (38.10 mm)** LTPO AMOLED display, **466 × 466 px** (310 ppi), 2.5D Sapphire crystal, 22 mm lug width, functional rotating crown at 2 o'clock and flush action pusher at 4 o'clock.
- **Estimated Geometry:** 4.25 mm radial bezel (`(46.6 - 38.10) / 2`), 3.0 mm right-side ergonomic bridge flare, raised brushed titanium bezel ring (`0.55 mm` height) in `buildOnePlusWatch3Model`.

### 6. Xiaomi Watch 2 Pro (46 mm) — `xiaomi-watch-2-pro-46`
- **Sources:** [Xiaomi Global Official Specs](https://www.mi.com/global/product/xiaomi-watch-2-pro/), [GSMArena](https://www.gsmarena.com/xiaomi_watch_2_pro-12587.php).
- **Confirmed Specs:** 47.6 × 45.9 × 11.8 mm Stainless Steel case, **1.43" (36.32 mm)** AMOLED display, **466 × 466 px** (326 ppi), central rotating crown at 3 o'clock flanked by two angled chronograph pushers at 2 and 4 o'clock, 22 mm strap width.
- **Estimated Geometry:** 4.79 mm radial bezel (`(45.9 - 36.32) / 2`), 72-notch Parisian hobnail bezel ring (`1.05 mm` height, `0.18 mm` notch depth), and straight chronograph lugs (`51.8 mm` lug-to-lug) in `buildXiaomiWatch2ProModel`.

---

## 5. Comprehensive 21 Wear OS Smartwatches Reference Table

| # | ID | Device Name | Archetype | Case (W×H×T mm) | Display (mm / in) | Resolution | PPI | Bezel (mm) | Lug (mm) | Glass & Material |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `pixel-watch-41` | Google Pixel Watch 1/2 (41mm) | `domed-pebble` | 41.0 × 41.0 × 12.3 | 30.48 / 1.20" | 384 × 384 | 320 | 5.26 | 20 | 3D domed Gorilla Glass, Polished Steel |
| 2 | `pixel-watch-3-41` | Google Pixel Watch 3 (41mm) | `domed-pebble` | 41.0 × 41.0 × 12.3 | 32.20 / 1.27" | 408 × 408 | 320 | 4.40 | 20 | 3D domed Gorilla Glass, Matte Aluminum |
| 3 | `pixel-watch-3-45` | Google Pixel Watch 3 (45mm) | `domed-pebble` | 45.0 × 45.0 × 12.3 | 35.56 / 1.40" | 456 × 456 | 326 | 4.72 | 22 | 3D domed Gorilla Glass, Matte Aluminum |
| 4 | `pixel-watch-4-41` | Google Pixel Watch 4 (41mm) | `domed-pebble` | 41.0 × 41.0 × 12.3 | 33.02 / 1.30" | 416 × 416 | 320 | 3.99 | 20 | Actua 360 3D Gorilla Glass, Satin Aluminum |
| 5 | `pixel-watch-4-45` | Google Pixel Watch 4 (45mm) | `domed-pebble` | 45.0 × 45.0 × 12.3 | 36.20 / 1.43" | 456 × 456 | 320 | 4.40 | 22 | Actua 360 3D Gorilla Glass, Satin Aluminum |
| 6 | `galaxy-watch-7-40` | Samsung Galaxy Watch7 (40mm) | `flat-minimalist` | 40.4 × 40.4 × 9.7 | 33.27 / 1.31" | 432 × 432 | 330 | 3.565 | 20 | Flat Sapphire with Rim, Armor Aluminum |
| 7 | `galaxy-watch-7-44` | Samsung Galaxy Watch7 (44mm) | `flat-minimalist` | 44.4 × 44.4 × 9.7 | 37.34 / 1.47" | 480 × 480 | 327 | 3.53 | 20 | Flat Sapphire with Rim, Armor Aluminum |
| 8 | `galaxy-watch-6-40` | Samsung Galaxy Watch6 (40mm) | `flat-minimalist` | 40.4 × 38.8 × 9.0 | 33.27 / 1.31" | 432 × 432 | 330 | 3.565 | 20 | Flat Sapphire with Rim, Armor Aluminum |
| 9 | `galaxy-watch-6-44` | Samsung Galaxy Watch6 (44mm) | `flat-minimalist` | 44.4 × 42.8 × 9.0 | 37.34 / 1.47" | 480 × 480 | 327 | 3.53 | 20 | Flat Sapphire with Rim, Armor Aluminum |
| 10 | `galaxy-watch-5-40` | Samsung Galaxy Watch5 (40mm) | `flat-minimalist` | 40.4 × 39.3 × 9.8 | 30.23 / 1.19" | 396 × 396 | 330 | 5.085 | 20 | Flat Sapphire with Rim, Armor Aluminum |
| 11 | `galaxy-watch-5-44` | Samsung Galaxy Watch5 (44mm) | `flat-minimalist` | 44.4 × 43.3 × 9.8 | 34.60 / 1.36" | 450 × 450 | 330 | 4.90 | 20 | Flat Sapphire with Rim, Armor Aluminum |
| 12 | `galaxy-watch-8-classic-46` | Galaxy Watch8 Classic (46mm) | `squircle-cushion-ultra` | 46.4 × 46.0 × 10.6 | 34.04 / 1.34" | 438 × 438 | 327 | 6.18 | 22 | Sunken Sapphire, Steel Cushion + 48-teeth Bezel |
| 13 | `galaxy-watch-6-classic-43` | Galaxy Watch6 Classic (43mm) | `classic-rotating-bezel` | 42.5 × 42.5 × 10.9 | 33.27 / 1.31" | 432 × 432 | 330 | 4.615 | 20 | Sunken Sapphire, Stainless Steel + 48-teeth Bezel |
| 14 | `galaxy-watch-6-classic-47` | Galaxy Watch6 Classic (47mm) | `classic-rotating-bezel` | 46.5 × 46.5 × 10.9 | 37.34 / 1.47" | 480 × 480 | 327 | 4.58 | 20 | Sunken Sapphire, Stainless Steel + 48-teeth Bezel |
| 15 | `galaxy-watch-5-pro-45` | Galaxy Watch5 Pro (45mm) | `classic-rotating-bezel` | 45.4 × 45.4 × 10.5 | 34.60 / 1.36" | 450 × 450 | 330 | 5.40 | 20 | Sunken Sapphire, Grade 4 Titanium Concave Rim |
| 16 | `galaxy-watch-4-classic-46` | Galaxy Watch4 Classic (46mm) | `classic-rotating-bezel` | 45.5 × 45.5 × 11.0 | 34.60 / 1.36" | 450 × 450 | 330 | 5.45 | 20 | Sunken Sapphire, Stainless Steel + 48-teeth Bezel |
| 17 | `galaxy-watch-ultra-47` | Galaxy Watch Ultra (47mm) | `squircle-cushion-ultra` | 47.4 × 47.4 × 12.1 | 37.34 / 1.47" | 480 × 480 | 327 | 5.03 | 22 | Sunken Sapphire, Titanium Cushion + Orange Quick Button |
| 18 | `oneplus-watch-3-46` | OnePlus Watch 3 (46mm) | `asymmetric-chrono` | 47.6 × 46.6 × 11.8 | 38.10 / 1.50" | 466 × 466 | 310 | 4.25 | 22 | 2.5D Sapphire, Steel Case + Titanium Bezel + Crown |
| 19 | `oneplus-watch-2-46` | OnePlus Watch 2 (46mm) | `asymmetric-chrono` | 47.0 × 46.6 × 12.1 | 36.32 / 1.43" | 466 × 466 | 326 | 5.14 | 22 | 2.5D Sapphire with Index Ring, Stainless Steel |
| 20 | `xiaomi-watch-2-pro-46` | Xiaomi Watch 2 Pro (46mm) | `rugged-tactical` | 47.6 × 45.9 × 11.8 | 36.32 / 1.43" | 466 × 466 | 326 | 4.79 | 22 | Flat Glass, Hobnail Bezel + Center Crown & Pushers |
| 21 | `ticwatch-pro-5-48` | Mobvoi TicWatch Pro 5 (48mm) | `rugged-tactical` | 50.1 × 48.0 × 12.2 | 36.32 / 1.43" | 466 × 466 | 326 | 5.84 | 24 | Sunken Sapphire, Knurled Tactical Bezel + Guarded Crown |
