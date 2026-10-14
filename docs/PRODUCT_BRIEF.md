# WearView — Product Brief

## 1. Product Identity

- **Product Name:** WearView
- **Tagline:** A physically-aware 3D preview tool for Wear OS game developers.
- **Form Factor:** Client-side, browser-based developer utility.
- **Audience:** Wear OS game and interactive application developers, technical designers, and UI artists.

---

## 2. Problem Statement

Developing games and interactive experiences for smartwatches introduces unique spatial and physical constraints:

1. **Circular Screen Edge Masking:** Square framebuffers are clipped by circular viewports. Developers often lose critical HUD indicators, text, or touch targets at the extreme edges.
2. **Bezel & Case Depth Interference:** A 2D screenshot on a computer screen looks flat. On an actual wrist, the watch's raised rim, domed glass, case bevels, and physical thickness cast shadows and alter perceived proportions.
3. **Wrist Context Disconnect:** Games viewed in isolation on a desktop simulator fail to convey how prominent the device looks on a human arm and how lighting angles impact readability.
4. **Tool Bloat:** Existing mockup generators are either generic marketing templates, heavy CAD suites, or upload-to-cloud marketing platforms with accounts and analytics.

---

## 3. Value Proposition & Vision

WearView provides an immediate, zero-friction, local-first 3D preview:

> Drop a game screenshot into the browser, see it accurately mapped and masked onto a true-to-life 3D model of an exact Wear OS device, inspect the physical rim, rotate in 3D under realistic lighting presets, and check scale on a neutral wrist reference.

---

## 4. MVP Goals

- **Accurate Device Silhouettes:** Procedurally model the Samsung Galaxy Watch5 (44 mm) and the Google Pixel Watch (1st gen, 41 mm) with research-backed proportions, distinct case profiles, glass shapes, and button/crown placements.
- **Reliable Texture Mapping:** Display uploaded PNG/JPEG images mapped strictly to the circular active display area with aspect-ratio preservation (`contain` fit), proper Three.js color space handling (`SRGBColorSpace`), and no texture bleed.
- **Interactive Inspection:** Smooth WebGL orbit controls with responsive zoom limits, camera reset, and no unwanted page scroll hijacking.
- **Lighting & Glass Response:** Provide 3 distinct lighting presets (Studio, Sunlight, Night) with physically plausible glass specular reflections that enhance realism without masking the game UI.
- **Scale Context (Wrist View):** Provide an "On wrist" toggle with a neutral, non-distracting 3D wrist reference so developers can judge device bulk and wrist presence.
- **Local-First & Private:** All image processing occurs in client memory using the HTML5 File API and WebGL textures. Zero telemetry, zero cloud uploads.

---

## 5. Non-Goals for MVP

- **Not a CAD Tool:** Not intended for manufacturing or CNC precision.
- **Not a Marketing Mockup Generator:** No decorative backgrounds, 3D typography, floating isometric social media cards, or preset graphic templates.
- **No Monitor Calibration (P1):** True 1:1 physical scale calibration on arbitrary monitors is deferred to post-MVP.
- **No Backend / Accounts:** No logins, cloud saves, galleries, or user profiles.
- **No Heavy Post-Processing:** No bloom, motion blur, or ray tracing that degrades integrated GPU performance.
- **No Complex Wrist Customization:** No skin scanning, hand morphs, nail details, or jewelry.

---

## 6. User Journey (Core Loop)

1. **Launch:** Developer opens WearView in any modern desktop or mobile browser.
2. **Default State:** Default device (Samsung Galaxy Watch5 44 mm) appears in neutral Studio lighting at a clean 3/4 angle, displaying an informative empty state with safe-area guides.
3. **Upload / Test:** Developer drops a Wear OS screenshot (or selects the built-in test pattern). The image is instantly mapped to the circular screen.
4. **Device Comparison:** Developer toggles between Galaxy Watch5 44 mm and Google Pixel Watch 1st gen to check how different bezel widths and glass curves affect UI readability.
5. **Lighting & Angle Check:** Developer orbits the watch, tests Sunlight mode for outdoor glare, and Night mode for high-contrast visibility.
6. **Wrist Context:** Developer toggles "On wrist" mode to evaluate game UI prominence on a neutral arm.
7. **Iterate:** Developer updates their game asset, re-uploads, and immediately sees the refreshed layout.
