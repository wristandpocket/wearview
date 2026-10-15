# WearView — Device Research & Geometry Specifications

This document records the exact physical specifications, primary manufacturer sources, secondary references, and architectural approximations used to procedurally model devices in WearView.

---

## Device 1: Samsung Galaxy Watch5 (44 mm)

### 1. Model Identification
- **Exact Generation & Model:** Samsung Galaxy Watch5 44 mm (Bluetooth SM-R910 / LTE SM-R915)
- **Release Year:** August 2022
- **Operating System:** Wear OS Powered by Samsung (One UI Watch)
- **Primary Sources:**
  - Samsung Official Business Specifications: [Samsung Galaxy Watch5 44mm Graphite](https://www.samsung.com/uk/business/watches/galaxy-watch/galaxy-watch5-44mm-graphite-lte-sm-r915fzaaeua/) (Accessed October 2026 / verified against official Samsung technical specs).
  - Samsung Developer Documentation & Wear OS Specifications (450x450, 321 ppi).

### 2. Specification Breakdown

| Dimension / Property | Status | Value | Source / Confidence |
| :--- | :--- | :--- | :--- |
| **Case Dimensions (W x H x D)** | Confirmed Manufacturer Spec | 44.4 × 43.3 × 9.8 mm | Official Samsung specifications. Note: 9.8 mm depth excludes the rear BioActive sensor glass protrusion. Total depth with sensor is ~13 mm. |
| **Display Diameter** | Confirmed Manufacturer Spec | 1.4 inches (34.6 mm active diameter) | Official Samsung specifications. |
| **Display Resolution** | Confirmed Manufacturer Spec | 450 × 450 pixels (~321 ppi) | Official Samsung specifications, Super AMOLED. |
| **Case Material** | Confirmed Manufacturer Spec | Armor Aluminum | Official Samsung specifications. |
| **Front Glass Material** | Confirmed Manufacturer Spec | Sapphire Crystal (flat) | Official Samsung specifications. |
| **Bezel / Rim Structure** | Estimated from Product Ref | ~4.4 mm border from active display to case edge; thin raised metal protective lip (~0.3 mm) | Visual inspection of hardware & high-res teardowns. Note: Standard Watch5 has NO physical rotating bezel (only digital touch bezel). |
| **Right Side Buttons** | Estimated from Product Ref | Two elongated pill-shaped buttons: Home/Power button (top) with subtle accent groove, Back button (bottom). Located at approx. 2 o'clock and 4 o'clock. | Product photographs & CAD teardowns. |
| **Lugs & Strap** | Confirmed Manufacturer Spec | 20 mm standard lug width, integrated curved aluminum horns tapering into the body. | Samsung strap compatibility guide. |

### 3. Visual & Architectural Observations
- **Case Silhouette:** The 44 mm Watch5 is subtly non-circular in outer chassis outline: width is 44.4 mm, height (lug-to-lug base) is 43.3 mm (excluding lug extensions). It features gently rounded corners forming an ergonomic squircle-like chassis around a strictly circular dial.
- **Display Layering:** The front sapphire glass is flat. Immediately surrounding the glass is a micro-raised aluminum rim that protects the sapphire face when placed upside down. The active OLED screen sits recessed by approx. 0.2–0.4 mm beneath the glass surface.
- **Finish:** Matte/satin anodized aluminum with subtle anisotropic sheen; buttons match case finish.

### 4. WearView MVP Visual Approximation
Built in `src/devices/galaxyWatch5.ts` (scene units: 1 unit = 1 mm, face up, 12 o'clock = -Z).
- Case: one lathed aluminum shell; flank peaks at r = 21.65 mm (43.3 mm, confirmed), body 9.8 mm (confirmed).
- Active display: r = 17.3 mm (34.6 mm, confirmed), 450 × 450.
- Black display border under the glass: r 17.3 → 19.45 mm (~2.15 mm, estimated from product photos).
- Raised aluminum lip around the flat glass: r 19.45 → ~20.4 mm, glass sits ~0.3 mm below the lip top (estimated).
- Rear sensor dome: ~1.6 mm below the 9.8 mm body (estimated; total ~11.4 mm).
- Lugs: short extruded horns with a 20 mm strap gap (gap confirmed, shape estimated).
- Keys: two flattened pill keys at ~±20° from 3 o'clock (positions estimated).
- Strap: one-piece band swept around the shared wrist cross-section (`WRIST_SECTION`), so the same band hugs the arm in On wrist mode.

---

## Device 2: Google Pixel Watch (1st Generation, 41 mm)

### 1. Model Identification
- **Exact Generation & Model:** Google Pixel Watch (1st Generation, 2022)
- **Model Numbers:** GQF4C / GBZ4S
- **Release Year:** October 2022
- **Operating System:** Wear OS 3.5
- **Primary Sources:**
  - Google Store Tech Specs (2022 archive / technical specifications for 1st Gen Pixel Watch).
  - Google Support Hardware Specifications: Diameter 41 mm, height 12.3 mm, 36 g.
  - iFixit Teardown & Analysis: Custom 3D Corning Gorilla Glass 5, 294 mAh battery, stainless steel bottom bucket.

### 2. Specification Breakdown

| Dimension / Property | Status | Value | Source / Confidence |
| :--- | :--- | :--- | :--- |
| **Case Dimensions (Diameter x Depth)** | Confirmed Manufacturer Spec | 41 mm diameter × 12.3 mm total height | Official Google specifications. Height includes the domed rear sensor housing. |
| **Display Diameter** | Confirmed / Derived Spec | ~1.2 inches (approx. 30.5 mm active diameter) | Confirmed panel diameter 30.48 mm (1.20 in). |
| **Display Resolution** | Confirmed Manufacturer Spec | 450 × 450 pixels (~320 ppi) | Official Google specification (AMOLED, DCI-P3 color). |
| **Case Material** | Confirmed Manufacturer Spec | 80% recycled Stainless Steel bottom bucket | Official Google specifications. Polished silver, matte black, or champagne gold. |
| **Front Glass Material** | Confirmed Manufacturer Spec | Custom 3D Corning Gorilla Glass 5 | Official Google specifications. |
| **Glass Profile** | Confirmed Visual Reference | Extreme curved "pebble" dome. Curves down past the midpoint of the watch edge seamlessly into the steel bottom. | Hardware teardowns, Google industrial design documentation. |
| **Bezel Width** | Estimated from Product Ref / Teardown | ~5.2 mm radial bezel width from active screen edge (30.5 mm) to outer perimeter (41 mm). The bezel is notoriously wide on Gen 1, hidden beneath black OLED UI. | Industry analysis & hardware measurements. |
| **Crown & Button** | Confirmed Visual Reference | Tactile crown at 3 o'clock (fluted cylinder with domed cap). Secondary side button flush against the curved case at ~2 o'clock (above crown). | Google hardware design guidelines. |
| **Band Attachment** | Confirmed Manufacturer Spec | Proprietary lugless slide-and-lock band mechanism built into case perimeter. | Google technical guides. |

### 3. Visual & Architectural Observations
- **Pebble Silhouette:** Unlike the Galaxy Watch5 which has visible metallic lugs and a flat glass face with a protective lip, the Pixel Watch is an organic, water-droplet / river-pebble dome. The glass is dominant from top and side views.
- **Active Display vs. Black Glass:** Because the OLED display is flat and recessed inside the center of the dome, the generous bezel around the 30.5 mm screen is glossy black glass. Any uploaded game screenshot with bright content immediately reveals the circular border!
- **Crown & Button:** Digital crown at 3 o'clock protrudes cleanly (~1.8 mm) with fine knurled ridges; button at 2 o'clock sits almost flush.

### 4. WearView MVP Visual Approximation
Built in `src/devices/pixelWatch1.ts`.
- Polished steel body lathed below the glass, r = 20.5 mm (41 mm, confirmed).
- Total height 12.3 mm (confirmed): dome apex at y = +2.2, sensor dome bottom at y = -10.1.
- Domed cover glass: lathe profile rolling over the edge down to y ≈ -2 (shape estimated from photos).
- Black glass substrate follows the dome from underneath; active display r = 16.75 mm (33.5 mm). **Note:** the display diameter here conflicts with the 30.48 mm (1.2 in) figure in the table above; it needs re-verification before the bezel width can be called accurate.
- Fluted crown at 3 o'clock (r = 2.7 mm), flush pill key at ~2 o'clock (estimated).
- Lugless band entering the case at 12 and 6 o'clock, wrapped around the shared wrist cross-section.

---

## Device 3: Samsung Galaxy Watch5 (40 mm)

### 1. Model Identification
- **Exact Generation & Model:** Samsung Galaxy Watch5 40 mm (Bluetooth SM-R900 / LTE SM-R905)
- **Release Year:** August 2022
- **Operating System:** Wear OS Powered by Samsung (One UI Watch)
- **Primary Sources:**
  - Samsung Official Business Specifications: [Samsung Galaxy Watch5 40mm Graphite](https://www.samsung.com/uk/watches/galaxy-watch/galaxy-watch5-40mm-graphite-bt-sm-r900nzaaeua/)
  - Samsung Developer Documentation & Wear OS Specifications (396x396, 330 ppi, 28.7g).

### 2. Specification Breakdown

| Dimension / Property | Status | Value | Source / Confidence |
| :--- | :--- | :--- | :--- |
| **Case Dimensions (W x H x D)** | Confirmed Manufacturer Spec | 40.4 × 39.3 × 9.8 mm | Official Samsung specifications. Note: 9.8 mm depth excludes rear BioActive sensor glass protrusion. |
| **Display Diameter** | Confirmed Manufacturer Spec | 1.2 inches (30.4 mm active diameter) | Official Samsung specifications. |
| **Display Resolution** | Confirmed Manufacturer Spec | 396 × 396 pixels (~330 ppi) | Official Samsung specifications, Super AMOLED. |
| **Case Material** | Confirmed Manufacturer Spec | Armor Aluminum (Graphite Black / Pink Gold / Silver) | Official Samsung specifications. |
| **Front Glass Material** | Confirmed Manufacturer Spec | Sapphire Crystal (flat) | Official Samsung specifications. |
| **Bezel / Rim Structure** | Estimated from Product Ref | ~2.3 mm border from active display to protective outer rim; raised aluminum lip (~0.26 mm) | Visual inspection of hardware & high-res product renders. Slim touch-bezel border. |
| **Right Side Buttons** | Estimated from Product Ref | Two elongated pill buttons: Power/Home (top with red accent), Back button (bottom). | Product photographs & CAD specs. |
| **Lugs & Strap** | Confirmed Manufacturer Spec | 20 mm standard lug width, integrated sculpted aluminum lugs. | Samsung strap compatibility guide. |

### 3. Visual & Architectural Observations
- **Case Silhouette:** Noticeably more compact than the 44 mm sibling ($40.4 \times 39.3\text{ mm}$ vs $44.4 \times 43.3\text{ mm}$). Proportionally tighter lug stance while retaining standard 20 mm strap gap.
- **Display & Bezel:** 1.2" (30.4 mm) screen with $396 \times 396\text{ px}$. Flat sapphire crystal recessed slightly inside the micro-chamfered protective aluminum outer rim.
- **Finish:** Matte Armor Aluminum with satin sheen.

### 4. WearView 3D Modeling Approximation
- In scene units ($1\text{ unit} = 1\text{ mm}$):
  - Case radius: $R = 18.2\text{ mm}$ top rim, tapering to $17.4\text{ mm}$ base; width across bumpers $39.2\text{ mm}$; depth $9.8\text{ mm}$.
  - Active screen radius: $R_{\text{screen}} = 15.2\text{ mm}$ (diameter $30.4\text{ mm}$).
  - Display resolution: $396 \times 396\text{ px}$.
  - Bezel ring: Inner radius $15.2\text{ mm}$, outer radius $17.5\text{ mm}$ ($2.3\text{ mm}$ slim touch border).
  - Raised outer rim: Extruded aluminum ring raised $+0.26\text{ mm}$ above sapphire glass plane.
  - Buttons: Flank at $+X$, Power button at $Z = -5.8\text{ mm}$ with red accent stripe, Back button at $Z = +5.8\text{ mm}$.
  - Lugs: 20 mm gap ($10.0\text{ mm}$ half-width), extending North/South with downward curvature.

---

## Device 4: Samsung Galaxy Watch6 (44 mm)

- **Sources:** [Samsung Mobile Press spec sheet](https://www.samsungmobilepress.com/media-assets/galaxy-watch6?tab=specs), [GSMArena](https://m.gsmarena.com/samsung_galaxy_watch6-12437.php) (accessed October 2026).

| Property | Status | Value |
| :--- | :--- | :--- |
| Case (W × H × D) | Confirmed (Samsung) | 44.4 × 42.8 × 9.0 mm |
| Display | Confirmed (Samsung) | 1.5" / 37.3 mm Super AMOLED, 480 × 480 (~327 ppi) |
| Glass | Confirmed | Sapphire crystal |
| Black border / metal rim | Estimated | ~1.25 mm border, ~1.5 mm rim (thinner than Watch5) |

Built by the shared Galaxy builder in `src/devices/galaxyWatch.ts` (rim width 1.5 mm). The Watch5 40 mm (Device 3)
uses the same builder with a 2.2 mm rim.

---

## 5. Summary Comparison for 3D Modeling

| Feature | Samsung Galaxy Watch5 (44 mm) | Samsung Galaxy Watch5 (40 mm) | Google Pixel Watch (Gen 1, 41 mm) |
| :--- | :--- | :--- | :--- |
| **Overall Size** | Large ($44.4 \times 43.3 \times 9.8\text{ mm}$) | Compact ($40.4 \times 39.3 \times 9.8\text{ mm}$) | Compact ($41.0 \times 41.0 \times 12.3\text{ mm}$) |
| **Glass Top** | Flat sapphire crystal with raised lip | Flat sapphire crystal with raised lip | Continuous 3D domed Corning Gorilla Glass 5 |
| **Bezel Feel** | Protected sports watch ($4.4\text{ mm}$ border) | Slim sports watch ($2.3\text{ mm}$ border) | Seamless glossy pebble with curved dome bezel |
| **Active Display** | $34.6\text{ mm}$ diameter ($1.4"$) | $30.4\text{ mm}$ diameter ($1.2"$) | $33.5\text{ mm}$ calibrated diameter |
| **Resolution** | $450 \times 450\text{ px}$ | $396 \times 396\text{ px}$ | $450 \times 450\text{ px}$ |
| **Side Controls** | Two pill buttons at 2 and 4 o'clock | Two pill buttons at 2 and 4 o'clock | Rotating crown at 3 o'clock, flush button at 2 o'clock |
| **Strap Mount** | Standard 20 mm sculpted lugs | Standard 20 mm sculpted lugs | Lugless internal slide-and-lock band mechanism |
| **Primary Material** | Matte Armor Aluminum | Matte Armor Aluminum | Polished Stainless Steel & 3D Glass |
