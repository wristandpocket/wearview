import * as THREE from 'three';
import type { DeviceModelResult, DeviceSpec } from './types';
import type { WatchMaterials } from './materials';
import {
  asymmetricCaseGeometry,
  flutedCrownGeometry,
  knurledBezelGeometry,
  latheFromProfile,
  pillButtonGeometry,
  placeOnSide,
  sweepBand,
  wrapStrapPath,
} from './geometry';

// ------------------------------------------------------------------ Specs

export const ONEPLUS_WATCH_3_SPEC: DeviceSpec = {
  id: 'oneplus-watch-3-46',
  name: 'OnePlus Watch 3 (46mm)',
  generation: 'OnePlus Watch 3 · 46 mm (2025)',
  shortLabel: 'OnePlus 3',
  familyGroup: 'oneplus-mobvoi',
  releaseYear: 2025,
  caseDiameterMm: 47.6,
  caseHeightMm: 46.6,
  caseThicknessMm: 11.8,
  displayDiameterMm: 38.10, // 1.50" LTPO AMOLED active display
  activeDisplayDiameterMm: 38.10,
  resolutionPx: { width: 466, height: 466 },
  ppi: 310,
  bezelRadialWidthMm: 4.25, // (46.6 - 38.10) / 2
  lugWidthMm: 22.0,
  archetype: 'asymmetric-chrono',
  glassType: '2.5d-sapphire',
  caseMaterialName: 'Stainless Steel Body & Titanium Bezel (Emerald / Obsidian)',
  confirmedSources: [
    'OnePlus Official Specifications (47.6 x 46.6 x 11.8 mm, Stainless Steel + Titanium Bezel)',
    'GSMArena Specs (1.50" 466x466 LTPO AMOLED, 310 ppi, 2200 nits, Sapphire Crystal)',
  ],
  notes: 'Second-gen OnePlus flagship expanding the screen to 1.50" (38.10mm, 466x466 at 310 ppi) framed by a brushed Grade 4 Titanium bezel, right-side ergonomic bridge, and functional rotating conical crown at 2 o\'clock.',
};

export const ONEPLUS_WATCH_2_SPEC: DeviceSpec = {
  id: 'oneplus-watch-2-46',
  name: 'OnePlus Watch 2 (46mm)',
  generation: 'OnePlus Watch 2 · 46 mm (2024)',
  shortLabel: 'OnePlus 2',
  familyGroup: 'oneplus-mobvoi',
  releaseYear: 2024,
  caseDiameterMm: 47.0,
  caseHeightMm: 46.6,
  caseThicknessMm: 12.1,
  displayDiameterMm: 36.32, // 1.43" active display
  activeDisplayDiameterMm: 36.32,
  resolutionPx: { width: 466, height: 466 },
  ppi: 326,
  bezelRadialWidthMm: 5.14,
  lugWidthMm: 22.0,
  archetype: 'asymmetric-chrono',
  glassType: '2.5d-sapphire',
  caseMaterialName: 'Stainless Steel (Black Steel)',
  confirmedSources: [
    'OnePlus Official Specifications (47.0 x 46.6 x 12.1 mm)',
    '1.43" 466x466 AMOLED, 326 ppi, 2.5D sapphire crystal',
  ],
  notes: 'Asymmetric chrono chassis with right-side ergonomic bulge integrating angled action pusher at 2 o\'clock and rotating crown at 4 o\'clock. Flat 2.5D sapphire crystal with printed tachymeter index ring.',
};

export const XIAOMI_WATCH_2_PRO_SPEC: DeviceSpec = {
  id: 'xiaomi-watch-2-pro-46',
  name: 'Xiaomi Watch 2 Pro (46mm)',
  generation: 'Xiaomi Watch 2 Pro · 46 mm (2023)',
  shortLabel: 'Xiaomi 2 Pro',
  familyGroup: 'oneplus-mobvoi',
  releaseYear: 2023,
  caseDiameterMm: 47.6,
  caseHeightMm: 45.9,
  caseThicknessMm: 11.8,
  displayDiameterMm: 36.32, // 1.43" active display
  activeDisplayDiameterMm: 36.32,
  resolutionPx: { width: 466, height: 466 },
  ppi: 326,
  bezelRadialWidthMm: 4.79, // (45.9 - 36.32) / 2
  lugWidthMm: 22.0,
  lugToLugMm: 51.8,
  archetype: 'rugged-tactical',
  glassType: 'flat-sapphire-rim',
  caseMaterialName: 'Stainless Steel (Black / Silver)',
  confirmedSources: [
    'Xiaomi Global Official Specifications (47.6 x 45.9 x 11.8 mm, Stainless Steel)',
    'GSMArena Specs (1.43" 466x466 AMOLED, 326 ppi, Snapdragon W5+ Gen 1)',
  ],
  notes: 'Classical chronograph-inspired stainless steel body with finely textured Parisian hobnail bezel ring, central rotating crown at 3 o\'clock, and twin angled cylindrical pushers at 2 and 4 o\'clock.',
};

export const TICWATCH_PRO_5_SPEC: DeviceSpec = {
  id: 'ticwatch-pro-5-48',
  name: 'Mobvoi TicWatch Pro 5 (48mm)',
  generation: 'TicWatch Pro 5 · 48 mm (2023)',
  shortLabel: 'TicWatch 5',
  familyGroup: 'oneplus-mobvoi',
  releaseYear: 2023,
  caseDiameterMm: 50.1,
  caseHeightMm: 48.0,
  caseThicknessMm: 12.2,
  displayDiameterMm: 36.32, // 1.43" active display
  activeDisplayDiameterMm: 36.32,
  resolutionPx: { width: 466, height: 466 },
  ppi: 326,
  bezelRadialWidthMm: 5.84,
  lugWidthMm: 24.0,
  archetype: 'rugged-tactical',
  glassType: 'flat-sapphire-rim',
  caseMaterialName: '7000-series Aluminum & High-strength Nylon',
  confirmedSources: [
    'Mobvoi Official Specifications (50.1 x 48.0 x 12.2 mm)',
    '1.43" 466x466 Dual Display, 326 ppi, knurled rotating crown',
  ],
  notes: 'Rugged tactical design with knurled metal bezel, large center rotating crown at 3 o\'clock flanked by protective guards, secondary low-profile button at 2 o\'clock, 24mm rugged strap.',
};

// ------------------------------------------------------------------ 3D Model Builders

/**
 * Procedural OnePlus Watch 3 (asymmetric-chrono archetype).
 * Larger 1.50" (38.10mm) screen, raised brushed Grade 4 Titanium bezel, right-side ergonomic bridge
 * with rotating fluted crown at 2 o'clock and flush action pusher at 4 o'clock.
 */
export function buildOnePlusWatch3Model(materials: WatchMaterials): DeviceModelResult {
  const spec = ONEPLUS_WATCH_3_SPEC;
  const group = new THREE.Group();
  group.name = spec.id;

  const baseR = spec.caseHeightMm / 2; // 23.3 mm
  const screenRadius = spec.activeDisplayDiameterMm / 2; // 19.05 mm
  const D = spec.caseThicknessMm; // 11.8 mm
  const backY = -(D + 1.5);
  const displayY = 0.0;
  const glassY = displayY + 0.20;

  // 1. Asymmetric stainless steel chassis with right-side bridge flare
  const caseGeo = asymmetricCaseGeometry(baseR, 3.0, D - 1.0, 0.7);
  const caseMesh = new THREE.Mesh(caseGeo, materials.caseStainlessSteel);
  caseMesh.name = 'case';
  caseMesh.position.y = displayY - 0.35;
  caseMesh.castShadow = true;
  caseMesh.receiveShadow = true;
  group.add(caseMesh);

  // 2. Raised brushed Titanium bezel ring framing the 1.50" sapphire crystal
  const bezelOuterR = baseR - 0.35;
  const bezelInnerR = screenRadius + 0.55;
  const bezelGeo = knurledBezelGeometry(bezelInnerR, bezelOuterR, 0.55, 60, 0.06);
  const bezelMesh = new THREE.Mesh(bezelGeo, materials.caseTitanium);
  bezelMesh.name = 'bezel';
  bezelMesh.position.y = displayY - 0.35;
  bezelMesh.renderOrder = 1;
  bezelMesh.castShadow = true;
  group.add(bezelMesh);

  // 3. Inner tachymeter / chapter ring beneath sapphire crystal
  const borderGeo = new THREE.CircleGeometry(bezelOuterR - 0.2, 128);
  borderGeo.rotateX(-Math.PI / 2);
  const border = new THREE.Mesh(borderGeo, materials.bezelTachymeter);
  border.name = 'bezelSubstrate';
  border.position.y = displayY - 0.15;
  border.renderOrder = 1;
  group.add(border);

  // 4. Active circular LTPO AMOLED display mesh (38.10mm diameter)
  const displayGeo = new THREE.CircleGeometry(screenRadius, 128);
  displayGeo.rotateX(-Math.PI / 2);
  const displayMesh = new THREE.Mesh(displayGeo, materials.displayEmpty.clone());
  displayMesh.name = 'screen';
  displayMesh.position.y = displayY;
  displayMesh.renderOrder = 2;
  group.add(displayMesh);

  // 5. Flat 2.5D sapphire cover glass
  const glassGeo = new THREE.CircleGeometry(bezelInnerR + 0.1, 128);
  glassGeo.rotateX(-Math.PI / 2);
  const glassMesh = new THREE.Mesh(glassGeo, materials.coverGlass);
  glassMesh.name = 'glass';
  glassMesh.position.y = glassY;
  glassMesh.renderOrder = 10;
  group.add(glassMesh);

  // 6. Rear sensor dome
  const sensorGeo = latheFromProfile(
    [
      [0, backY],
      [7.5, backY + 0.06],
      [12.5, backY + 0.5],
      [15.5, backY + 1.2],
      [16.5, -D],
      [16.0, -D + 0.25],
    ],
    96,
    48
  );
  const sensorMesh = new THREE.Mesh(sensorGeo, materials.sensorGlass);
  sensorMesh.name = 'sensor';
  group.add(sensorMesh);

  // 7. Right-side controls on asymmetric bulge:
  // Functional rotating fluted crown at ~2 o'clock (+0.48 rad)
  const crownGeo = flutedCrownGeometry(2.75, 2.2, 30, 0.15);
  const crown = new THREE.Mesh(crownGeo, materials.crownSteel);
  crown.name = 'crown';
  placeOnSide(crown, baseR + 2.35, 0.48, -4.4);
  crown.castShadow = true;
  group.add(crown);

  // Flush action pusher at ~4 o'clock (-0.48 rad)
  const pusherGeo = pillButtonGeometry(6.0, 2.1, 1.05);
  const pusher = new THREE.Mesh(pusherGeo, materials.caseStainlessSteel);
  pusher.name = 'button';
  placeOnSide(pusher, baseR + 2.15, -0.48, -4.4);
  pusher.castShadow = true;
  group.add(pusher);

  // 8. Lugs (22mm strap)
  const lugThickness = 3.2;
  const lugInner = 11.1;
  for (const sign of [-1, 1]) {
    const z = (v: number) => (baseR + v) * sign;
    const shape = new THREE.Shape();
    shape.moveTo(z(-5.5), -1.8);
    shape.lineTo(z(-1.5), -1.6);
    shape.quadraticCurveTo(z(2.0), -2.2, z(3.2), -4.5);
    shape.quadraticCurveTo(z(3.8), -6.6, z(2.2), -7.8);
    shape.quadraticCurveTo(z(-0.2), -9.0, z(-3.0), -9.3);
    shape.lineTo(z(-5.5), -9.3);
    shape.closePath();
    const lugGeo = new THREE.ExtrudeGeometry(shape, {
      depth: lugThickness - 0.8,
      bevelEnabled: true,
      bevelThickness: 0.4,
      bevelSize: 0.45,
      bevelSegments: 4,
      curveSegments: 16,
    });
    lugGeo.translate(0, 0, -(lugThickness - 0.8) / 2);
    lugGeo.rotateY(-Math.PI / 2);
    lugGeo.computeVertexNormals();
    for (const side of [-1, 1]) {
      const lug = new THREE.Mesh(lugGeo, materials.caseStainlessSteel);
      lug.name = 'lug';
      lug.position.x = side * (lugInner + lugThickness / 2);
      lug.castShadow = true;
      group.add(lug);
    }
  }

  // 9. Strap (22mm)
  const strapGeo = sweepBand(wrapStrapPath(baseR - 0.4, -4.9, backY, 2.6), spec.lugWidthMm - 0.2, 2.6);
  const strap = new THREE.Mesh(strapGeo, materials.strapSilicone);
  strap.name = 'strap';
  strap.castShadow = true;
  strap.receiveShadow = true;
  group.add(strap);

  return { group, displayMesh, glassMesh, backY, spec };
}

/**
 * Procedural OnePlus Watch 2 (asymmetric-chrono archetype).
 * Right-side chassis ergonomic bulge, angled action pusher at 2 o'clock, rotating crown at 4 o'clock,
 * printed tachymeter index ring under 2.5D sapphire glass.
 */
export function buildOnePlusWatch2Model(materials: WatchMaterials): DeviceModelResult {
  const spec = ONEPLUS_WATCH_2_SPEC;
  const group = new THREE.Group();
  group.name = spec.id;

  const baseR = spec.caseHeightMm / 2; // 23.3 mm
  const screenRadius = spec.activeDisplayDiameterMm / 2; // 18.16 mm
  const D = spec.caseThicknessMm; // 12.1 mm
  const backY = -(D + 1.5);
  const displayY = 0.0;
  const glassY = displayY + 0.20;

  // 1. Asymmetric sculpted chassis with right-side flare
  // Terminate solid case body top surface at y <= displayY - 0.35 mm
  const caseGeo = asymmetricCaseGeometry(baseR, 2.8, D - 1.0, 0.7);
  const caseMesh = new THREE.Mesh(caseGeo, materials.caseStainlessSteel);
  caseMesh.name = 'case';
  caseMesh.position.y = displayY - 0.35;
  caseMesh.castShadow = true;
  caseMesh.receiveShadow = true;
  group.add(caseMesh);

  // 2. Bezel ring with tachymeter / index styling
  const bezelOuterR = baseR - 0.5;
  const borderGeo = new THREE.CircleGeometry(bezelOuterR, 128);
  borderGeo.rotateX(-Math.PI / 2);
  const border = new THREE.Mesh(borderGeo, materials.bezelTachymeter);
  border.name = 'bezel';
  border.position.y = displayY - 0.15;
  border.renderOrder = 1;
  group.add(border);

  // 3. Active circular OLED display mesh
  const displayGeo = new THREE.CircleGeometry(screenRadius, 128);
  displayGeo.rotateX(-Math.PI / 2);
  const displayMesh = new THREE.Mesh(displayGeo, materials.displayEmpty.clone());
  displayMesh.name = 'screen';
  displayMesh.position.y = displayY;
  displayMesh.renderOrder = 2;
  group.add(displayMesh);

  // 4. Flat 2.5D sapphire cover glass
  const glassGeo = new THREE.CircleGeometry(bezelOuterR, 128);
  glassGeo.rotateX(-Math.PI / 2);
  const glassMesh = new THREE.Mesh(glassGeo, materials.coverGlass);
  glassMesh.name = 'glass';
  glassMesh.position.y = glassY;
  glassMesh.renderOrder = 10;
  group.add(glassMesh);

  // 5. Rear sensor dome
  const sensorGeo = latheFromProfile(
    [
      [0, backY],
      [7.5, backY + 0.06],
      [12.5, backY + 0.5],
      [15.5, backY + 1.2],
      [16.5, -D],
      [16.0, -D + 0.25],
    ],
    96,
    48
  );
  const sensorMesh = new THREE.Mesh(sensorGeo, materials.sensorGlass);
  sensorMesh.name = 'sensor';
  group.add(sensorMesh);

  // 6. Right-side controls on asymmetric bulge:
  // Action pusher at ~2 o'clock (angle +28 deg from 3 o'clock)
  const pusherGeo = pillButtonGeometry(6.0, 2.2, 1.2);
  const pusher = new THREE.Mesh(pusherGeo, materials.caseStainlessSteel);
  pusher.name = 'button';
  placeOnSide(pusher, baseR + 2.1, 0.48, -4.6);
  pusher.castShadow = true;
  group.add(pusher);

  // Fluted rotating crown at ~4 o'clock (angle -28 deg from 3 o'clock)
  const crownGeo = flutedCrownGeometry(2.6, 2.0, 26, 0.14);
  const crown = new THREE.Mesh(crownGeo, materials.crownSteel);
  crown.name = 'crown';
  placeOnSide(crown, baseR + 2.2, -0.48, -4.6);
  crown.castShadow = true;
  group.add(crown);

  // 7. Lugs (22mm strap)
  const lugThickness = 3.2;
  const lugInner = 11.1;
  for (const sign of [-1, 1]) {
    const z = (v: number) => (baseR + v) * sign;
    const shape = new THREE.Shape();
    shape.moveTo(z(-5.5), -1.8);
    shape.lineTo(z(-1.5), -1.6);
    shape.quadraticCurveTo(z(2.0), -2.2, z(3.2), -4.5);
    shape.quadraticCurveTo(z(3.8), -6.6, z(2.2), -7.8);
    shape.quadraticCurveTo(z(-0.2), -9.0, z(-3.0), -9.3);
    shape.lineTo(z(-5.5), -9.3);
    shape.closePath();
    const lugGeo = new THREE.ExtrudeGeometry(shape, {
      depth: lugThickness - 0.8,
      bevelEnabled: true,
      bevelThickness: 0.4,
      bevelSize: 0.45,
      bevelSegments: 4,
      curveSegments: 16,
    });
    lugGeo.translate(0, 0, -(lugThickness - 0.8) / 2);
    lugGeo.rotateY(-Math.PI / 2);
    lugGeo.computeVertexNormals();
    for (const side of [-1, 1]) {
      const lug = new THREE.Mesh(lugGeo, materials.caseStainlessSteel);
      lug.name = 'lug';
      lug.position.x = side * (lugInner + lugThickness / 2);
      lug.castShadow = true;
      group.add(lug);
    }
  }

  // 8. Strap (22mm)
  const strapGeo = sweepBand(wrapStrapPath(baseR - 0.4, -5.0, backY, 2.6), spec.lugWidthMm - 0.2, 2.6);
  const strap = new THREE.Mesh(strapGeo, materials.strapSilicone);
  strap.name = 'strap';
  strap.castShadow = true;
  strap.receiveShadow = true;
  group.add(strap);

  return { group, displayMesh, glassMesh, backY, spec };
}

/**
 * Procedural Xiaomi Watch 2 Pro (46mm).
 * Classic stainless steel chronograph silhouette (47.6 x 45.9 x 11.8 mm) with 72-notch
 * Parisian hobnail bezel, center fluted rotating crown at 3 o'clock, and twin angled cylindrical pushers.
 */
export function buildXiaomiWatch2ProModel(materials: WatchMaterials): DeviceModelResult {
  const spec = XIAOMI_WATCH_2_PRO_SPEC;
  const group = new THREE.Group();
  group.name = spec.id;

  const R = spec.caseHeightMm / 2; // 22.95 mm circular barrel
  const screenRadius = spec.activeDisplayDiameterMm / 2; // 18.16 mm
  const D = spec.caseThicknessMm; // 11.8 mm
  const backY = -(D + 1.5);
  const displayY = -0.50;
  const glassY = -0.30;

  // 1. Brushed & polished stainless steel barrel
  const caseGeo = latheFromProfile([
    [R - 6.8, -D],
    [R - 3.2, -D + 0.3],
    [R - 1.1, -D + 1.2],
    [R, -5.4],
    [R - 0.15, -2.2],
    [R - 0.35, -0.5],
    [R - 0.55, 0.0],
    [R - 3.6, 0.0],
    [R - 3.6, -0.95],
  ]);
  const caseMesh = new THREE.Mesh(caseGeo, materials.caseStainlessSteel);
  caseMesh.name = 'case';
  caseMesh.castShadow = true;
  caseMesh.receiveShadow = true;
  group.add(caseMesh);

  // 2. Parisian hobnail finely knurled bezel ring (72 fine notches)
  const bezelOuterR = R - 0.3;
  const bezelInnerR = screenRadius + 1.1;
  const bezelGeo = knurledBezelGeometry(bezelInnerR, bezelOuterR, 1.05, 72, 0.18);
  const bezelMesh = new THREE.Mesh(bezelGeo, materials.caseStainlessSteel);
  bezelMesh.name = 'bezel';
  bezelMesh.position.y = 0.0;
  bezelMesh.renderOrder = 1;
  bezelMesh.castShadow = true;
  group.add(bezelMesh);

  // 3. Inner dark tachymeter / minute track ring
  const borderGeo = new THREE.CircleGeometry(bezelInnerR + 0.15, 128);
  borderGeo.rotateX(-Math.PI / 2);
  const border = new THREE.Mesh(borderGeo, materials.bezelTachymeter);
  border.name = 'bezelSubstrate';
  border.position.y = displayY - 0.15;
  border.renderOrder = 1;
  group.add(border);

  // 4. Active circular AMOLED display mesh (36.32mm)
  const displayGeo = new THREE.CircleGeometry(screenRadius, 128);
  displayGeo.rotateX(-Math.PI / 2);
  const displayMesh = new THREE.Mesh(displayGeo, materials.displayEmpty.clone());
  displayMesh.name = 'screen';
  displayMesh.position.y = displayY;
  displayMesh.renderOrder = 2;
  group.add(displayMesh);

  // 5. Flat cover glass
  const glassGeo = new THREE.CircleGeometry(bezelInnerR + 0.05, 128);
  glassGeo.rotateX(-Math.PI / 2);
  const glassMesh = new THREE.Mesh(glassGeo, materials.coverGlass);
  glassMesh.name = 'glass';
  glassMesh.position.y = glassY;
  glassMesh.renderOrder = 10;
  group.add(glassMesh);

  // 6. Rear sensor dome
  const sensorGeo = latheFromProfile(
    [
      [0, backY],
      [7.4, backY + 0.06],
      [12.4, backY + 0.48],
      [15.2, backY + 1.15],
      [16.2, -D],
      [15.8, -D + 0.25],
    ],
    96,
    48
  );
  const sensorMesh = new THREE.Mesh(sensorGeo, materials.sensorGlass);
  sensorMesh.name = 'sensor';
  group.add(sensorMesh);

  // 7. Right-side controls: Center fluted rotating crown at 3 o'clock + twin angled chrono pushers at 2 & 4 o'clock
  const crownGeo = flutedCrownGeometry(2.85, 2.2, 30, 0.16);
  const crown = new THREE.Mesh(crownGeo, materials.crownSteel);
  crown.name = 'crown';
  crown.position.set(R + 0.85, -4.8, 0);
  crown.castShadow = true;
  group.add(crown);

  const pusherGeo = pillButtonGeometry(4.4, 2.0, 1.35);
  for (const angle of [0.50, -0.50]) {
    const pusher = new THREE.Mesh(pusherGeo, materials.caseStainlessSteel);
    pusher.name = 'button';
    placeOnSide(pusher, R - 0.1, angle, -4.8);
    pusher.castShadow = true;
    group.add(pusher);
  }

  // 8. Classical straight chronograph lugs (22mm strap gap)
  const lugThickness = 3.2;
  const lugInner = 11.1;
  for (const sign of [-1, 1]) {
    const z = (v: number) => (R + v) * sign;
    const shape = new THREE.Shape();
    shape.moveTo(z(-5.8), -1.6);
    shape.lineTo(z(-1.0), -1.5);
    shape.quadraticCurveTo(z(2.6), -1.9, z(3.9), -4.4);
    shape.quadraticCurveTo(z(4.3), -6.6, z(2.7), -8.0);
    shape.quadraticCurveTo(z(0.1), -9.2, z(-3.0), -9.4);
    shape.lineTo(z(-5.8), -9.4);
    shape.closePath();
    const lugGeo = new THREE.ExtrudeGeometry(shape, {
      depth: lugThickness - 0.8,
      bevelEnabled: true,
      bevelThickness: 0.4,
      bevelSize: 0.45,
      bevelSegments: 4,
      curveSegments: 16,
    });
    lugGeo.translate(0, 0, -(lugThickness - 0.8) / 2);
    lugGeo.rotateY(-Math.PI / 2);
    lugGeo.computeVertexNormals();
    for (const side of [-1, 1]) {
      const lug = new THREE.Mesh(lugGeo, materials.caseStainlessSteel);
      lug.name = 'lug';
      lug.position.x = side * (lugInner + lugThickness / 2);
      lug.castShadow = true;
      group.add(lug);
    }
  }

  // 9. Strap (22mm)
  const strapGeo = sweepBand(wrapStrapPath(R - 0.4, -5.0, backY, 2.6), spec.lugWidthMm - 0.2, 2.6);
  const strap = new THREE.Mesh(strapGeo, materials.strapSilicone);
  strap.name = 'strap';
  strap.castShadow = true;
  strap.receiveShadow = true;
  group.add(strap);

  return { group, displayMesh, glassMesh, backY, spec };
}

/**
 * Procedural TicWatch Pro 5 (rugged-tactical archetype).
 * Raised tactical knurled metal bezel, center rotating crown with crown guards, 24mm strap.
 */
export function buildTicWatchPro5Model(materials: WatchMaterials): DeviceModelResult {
  const spec = TICWATCH_PRO_5_SPEC;
  const group = new THREE.Group();
  group.name = spec.id;

  const R = spec.caseDiameterMm / 2; // 25.05 mm
  const screenRadius = spec.activeDisplayDiameterMm / 2; // 18.16 mm
  const D = spec.caseThicknessMm; // 12.2 mm
  const backY = -(D + 1.5);
  const displayY = -0.65;
  const glassY = -0.45;

  // 1. Tactical aluminum chassis
  const caseGeo = latheFromProfile([
    [R - 7.5, -D],
    [R - 3.5, -D + 0.3],
    [R - 1.2, -D + 1.2],
    [R, -5.5],
    [R - 0.3, -2.5],
    [R - 0.6, -0.6],
    [R - 1.0, 0.0],
    [R - 4.5, 0.0],
    [R - 4.5, -1.05],
  ]);
  const caseMesh = new THREE.Mesh(caseGeo, materials.caseAluminum);
  caseMesh.name = 'case';
  caseMesh.castShadow = true;
  caseMesh.receiveShadow = true;
  group.add(caseMesh);

  // 2. Raised knurled tactical bezel with outer grip notches
  const bezelOuterR = R - 0.4;
  const bezelInnerR = screenRadius + 1.5;
  const bezelHeight = 1.3;
  const bezelGeo = knurledBezelGeometry(bezelInnerR, bezelOuterR, bezelHeight, 40, 0.4);
  const bezelMesh = new THREE.Mesh(bezelGeo, materials.caseAluminum);
  bezelMesh.name = 'bezel';
  bezelMesh.position.y = 0.0;
  bezelMesh.renderOrder = 1;
  bezelMesh.castShadow = true;
  group.add(bezelMesh);

  // 3. Inner dark bezel ring
  const borderGeo = new THREE.CircleGeometry(bezelInnerR + 0.1, 128);
  borderGeo.rotateX(-Math.PI / 2);
  const border = new THREE.Mesh(borderGeo, materials.bezelBlack);
  border.name = 'bezelSubstrate';
  border.position.y = displayY - 0.15;
  border.renderOrder = 1;
  group.add(border);

  // 4. Active circular OLED display mesh
  const displayGeo = new THREE.CircleGeometry(screenRadius, 128);
  displayGeo.rotateX(-Math.PI / 2);
  const displayMesh = new THREE.Mesh(displayGeo, materials.displayEmpty.clone());
  displayMesh.name = 'screen';
  displayMesh.position.y = displayY;
  displayMesh.renderOrder = 2;
  group.add(displayMesh);

  // 5. Sunken sapphire cover glass
  const glassGeo = new THREE.CircleGeometry(bezelInnerR + 0.05, 128);
  glassGeo.rotateX(-Math.PI / 2);
  const glassMesh = new THREE.Mesh(glassGeo, materials.coverGlass);
  glassMesh.name = 'glass';
  glassMesh.position.y = glassY;
  glassMesh.renderOrder = 10;
  group.add(glassMesh);

  // 6. Rear sensor dome
  const sensorGeo = latheFromProfile(
    [
      [0, backY],
      [7.5, backY + 0.06],
      [13.0, backY + 0.5],
      [16.0, backY + 1.2],
      [17.0, -D],
      [16.5, -D + 0.25],
    ],
    96,
    48
  );
  const sensorMesh = new THREE.Mesh(sensorGeo, materials.sensorGlass);
  sensorMesh.name = 'sensor';
  group.add(sensorMesh);

  // 7. Tactical crown with crown guards at 3 o'clock (+X)
  const crownGeo = flutedCrownGeometry(3.0, 2.2, 28, 0.18);
  const crown = new THREE.Mesh(crownGeo, materials.crownSteel);
  crown.name = 'crown';
  crown.position.set(R - 0.2 + 1.1, -5.2, 0);
  crown.castShadow = true;
  group.add(crown);

  // Crown guards (top and bottom of crown)
  for (const zOff of [-4.2, 4.2]) {
    const guardGeo = pillButtonGeometry(3.6, 2.2, 1.4);
    const guard = new THREE.Mesh(guardGeo, materials.caseAluminum);
    guard.name = 'guard';
    guard.position.set(R - 0.3, -5.2, zOff);
    group.add(guard);
  }

  // Secondary tactical button at 2 o'clock
  const keyGeo = pillButtonGeometry(5.2, 1.8, 0.8);
  const key = new THREE.Mesh(keyGeo, materials.caseAluminum);
  key.name = 'button';
  placeOnSide(key, R - 0.2, 0.52, -5.2);
  group.add(key);

  // 8. Rugged lugs (24mm strap)
  const lugThickness = 3.4;
  const lugInner = 12.1;
  for (const sign of [-1, 1]) {
    const z = (v: number) => (R + v) * sign;
    const shape = new THREE.Shape();
    shape.moveTo(z(-6.0), -2.0);
    shape.lineTo(z(-1.5), -1.8);
    shape.quadraticCurveTo(z(2.2), -2.2, z(3.8), -4.5);
    shape.quadraticCurveTo(z(4.4), -6.8, z(2.8), -8.2);
    shape.quadraticCurveTo(z(0.0), -9.5, z(-3.2), -9.8);
    shape.lineTo(z(-6.0), -9.8);
    shape.closePath();
    const lugGeo = new THREE.ExtrudeGeometry(shape, {
      depth: lugThickness - 0.8,
      bevelEnabled: true,
      bevelThickness: 0.4,
      bevelSize: 0.45,
      bevelSegments: 4,
      curveSegments: 16,
    });
    lugGeo.translate(0, 0, -(lugThickness - 0.8) / 2);
    lugGeo.rotateY(-Math.PI / 2);
    lugGeo.computeVertexNormals();
    for (const side of [-1, 1]) {
      const lug = new THREE.Mesh(lugGeo, materials.caseAluminum);
      lug.name = 'lug';
      lug.position.x = side * (lugInner + lugThickness / 2);
      lug.castShadow = true;
      group.add(lug);
    }
  }

  // 9. Rugged tactical strap (24mm)
  const strapGeo = sweepBand(wrapStrapPath(R - 0.5, -5.2, backY, 2.8), spec.lugWidthMm - 0.2, 2.8);
  const strap = new THREE.Mesh(strapGeo, materials.strapSilicone);
  strap.name = 'strap';
  strap.castShadow = true;
  strap.receiveShadow = true;
  group.add(strap);

  return { group, displayMesh, glassMesh, backY, spec };
}
