import * as THREE from 'three';
import type { DeviceModelResult, DeviceSpec } from './types';
import type { WatchMaterials } from './materials';
import {
  knurledBezelGeometry,
  latheFromProfile,
  pillButtonGeometry,
  placeOnSide,
  squircleCaseGeometry,
  sweepBand,
  wrapStrapPath,
} from './geometry';

// ------------------------------------------------------------------ Modern Flat Specs

export const GALAXY_WATCH_7_40_SPEC: DeviceSpec = {
  id: 'galaxy-watch-7-40',
  name: 'Samsung Galaxy Watch7 (40mm)',
  generation: 'Galaxy Watch7 · 40 mm (2024)',
  shortLabel: 'Watch7 40',
  familyGroup: 'galaxy-modern',
  releaseYear: 2024,
  caseDiameterMm: 40.4,
  caseHeightMm: 40.4,
  caseThicknessMm: 9.7,
  displayDiameterMm: 33.27, // 1.31" active display
  activeDisplayDiameterMm: 33.27,
  resolutionPx: { width: 432, height: 432 },
  ppi: 330,
  bezelRadialWidthMm: 3.565, // 2.35mm black mask + 1.215mm aluminum rim
  lugWidthMm: 20.0,
  lugToLugMm: 45.4,
  archetype: 'flat-minimalist',
  glassType: 'flat-sapphire-rim',
  caseMaterialName: 'Armor Aluminum (Green / Cream)',
  confirmedSources: [
    'Samsung Mobile Press Galaxy Watch7 Specifications',
    'Samsung Developer Documentation (1.31" 432x432 Super AMOLED, 330 ppi)',
  ],
  notes: 'Modern flat minimalist design. Flat sapphire crystal flush with thin chamfered 1.215mm aluminum rim, 2.35mm black mask, 45.4mm lug-to-lug, dual rectangular side buttons.',
};

export const GALAXY_WATCH_7_44_SPEC: DeviceSpec = {
  id: 'galaxy-watch-7-44',
  name: 'Samsung Galaxy Watch7 (44mm)',
  generation: 'Galaxy Watch7 · 44 mm (2024)',
  shortLabel: 'Watch7 44',
  familyGroup: 'galaxy-modern',
  releaseYear: 2024,
  caseDiameterMm: 44.4,
  caseHeightMm: 44.4,
  caseThicknessMm: 9.7,
  displayDiameterMm: 37.34, // 1.47" active display
  activeDisplayDiameterMm: 37.34,
  resolutionPx: { width: 480, height: 480 },
  ppi: 327,
  bezelRadialWidthMm: 3.53, // 2.30mm black mask + 1.23mm aluminum rim
  lugWidthMm: 20.0,
  lugToLugMm: 49.2,
  archetype: 'flat-minimalist',
  glassType: 'flat-sapphire-rim',
  caseMaterialName: 'Armor Aluminum (Green / Silver)',
  confirmedSources: [
    'Samsung Mobile Press Galaxy Watch7 Specifications',
    'Samsung Developer Documentation (1.47" 480x480 Super AMOLED, 327 ppi)',
  ],
  notes: 'Large 44.4mm modern flat chassis. Flat sapphire crystal flush with 1.23mm aluminum rim, 2.30mm black mask, 49.2mm lug-to-lug, dual rectangular side buttons.',
};

export const GALAXY_WATCH_5_40_SPEC: DeviceSpec = {
  id: 'galaxy-watch-5-40',
  name: 'Samsung Galaxy Watch5 (40mm)',
  generation: 'Galaxy Watch5 · 40 mm (2022)',
  shortLabel: 'Watch5 40',
  familyGroup: 'galaxy-modern',
  releaseYear: 2022,
  caseDiameterMm: 40.4,
  caseHeightMm: 39.3,
  caseThicknessMm: 9.8,
  displayDiameterMm: 30.23, // 1.19" active display
  activeDisplayDiameterMm: 30.23,
  resolutionPx: { width: 396, height: 396 },
  ppi: 330,
  bezelRadialWidthMm: 5.085, // 3.85mm wide black touch bezel + 1.235mm aluminum rim
  lugWidthMm: 20.0,
  lugToLugMm: 45.4,
  archetype: 'flat-minimalist',
  glassType: 'flat-sapphire-rim',
  caseMaterialName: 'Armor Aluminum (Graphite)',
  confirmedSources: [
    'Samsung Galaxy Watch5 40mm Specifications',
    'Vodafone / GSMArena Tech Specs (396x396 Super AMOLED, 330 ppi)',
  ],
  notes: 'Crucial developer reference: wide 3.85mm black touch bezel + 1.235mm aluminum rim clearly demonstrating how much smaller a 1.19" screen looks inside a 40.4mm body compared to Watch6/7.',
};

// ------------------------------------------------------------------ Classic & Ultra Specs

export const GALAXY_WATCH_6_CLASSIC_43_SPEC: DeviceSpec = {
  id: 'galaxy-watch-6-classic-43',
  name: 'Samsung Galaxy Watch6 Classic (43mm)',
  generation: 'Galaxy Watch6 Classic · 43 mm (2023)',
  shortLabel: 'Classic 43',
  familyGroup: 'galaxy-classic-ultra',
  releaseYear: 2023,
  caseDiameterMm: 42.5,
  caseHeightMm: 42.5,
  caseThicknessMm: 10.9,
  displayDiameterMm: 33.27, // 1.31" active display
  activeDisplayDiameterMm: 33.27,
  resolutionPx: { width: 432, height: 432 },
  ppi: 330,
  bezelRadialWidthMm: 4.615, // 1.6mm inner black ring + 3.015mm raised rotating bezel
  lugWidthMm: 20.0,
  lugToLugMm: 49.0,
  archetype: 'classic-rotating-bezel',
  glassType: 'classic-sunken-sapphire',
  caseMaterialName: 'Stainless Steel (Black / Silver)',
  confirmedSources: [
    'Samsung Mobile Press Galaxy Watch6 Classic Specifications',
    'Samsung Developer Documentation (1.31" 432x432 Super AMOLED, 330 ppi)',
  ],
  notes: 'Classic stainless steel case with physical rotating bezel raised 1.35mm above sapphire glass with 48 knurled outer teeth and inner sloped chamfer.',
};

export const GALAXY_WATCH_6_CLASSIC_47_SPEC: DeviceSpec = {
  id: 'galaxy-watch-6-classic-47',
  name: 'Samsung Galaxy Watch6 Classic (47mm)',
  generation: 'Galaxy Watch6 Classic · 47 mm (2023)',
  shortLabel: 'Classic 47',
  familyGroup: 'galaxy-classic-ultra',
  releaseYear: 2023,
  caseDiameterMm: 46.5,
  caseHeightMm: 46.5,
  caseThicknessMm: 10.9,
  displayDiameterMm: 37.34, // 1.47" active display
  activeDisplayDiameterMm: 37.34,
  resolutionPx: { width: 480, height: 480 },
  ppi: 327,
  bezelRadialWidthMm: 4.58, // 1.55mm inner ring + 3.03mm raised rotating bezel
  lugWidthMm: 20.0,
  lugToLugMm: 52.4,
  archetype: 'classic-rotating-bezel',
  glassType: 'classic-sunken-sapphire',
  caseMaterialName: 'Stainless Steel (Black / Silver)',
  confirmedSources: [
    'Samsung Mobile Press Galaxy Watch6 Classic Specifications',
    'Samsung Developer Documentation (1.47" 480x480 Super AMOLED, 327 ppi)',
  ],
  notes: '47mm stainless steel rotating bezel flagship. Raised 3.03mm rotating bezel with 48 teeth, 52.4mm lug-to-lug, sunken sapphire crystal.',
};

export const GALAXY_WATCH_ULTRA_47_SPEC: DeviceSpec = {
  id: 'galaxy-watch-ultra-47',
  name: 'Samsung Galaxy Watch Ultra (47mm)',
  generation: 'Galaxy Watch Ultra · 47 mm (2024)',
  shortLabel: 'Watch Ultra',
  familyGroup: 'galaxy-classic-ultra',
  releaseYear: 2024,
  caseDiameterMm: 47.4,
  caseHeightMm: 47.4,
  caseThicknessMm: 12.1,
  displayDiameterMm: 37.34, // 1.47" active display
  activeDisplayDiameterMm: 37.34,
  resolutionPx: { width: 480, height: 480 },
  ppi: 327,
  bezelRadialWidthMm: 5.03, // raised circular titanium bezel ring outer Ø 43.8mm, inner Ø 37.34mm
  lugWidthMm: 22.0,
  archetype: 'squircle-cushion-ultra',
  glassType: 'cushion-sunken-sapphire',
  caseMaterialName: 'Grade 4 Titanium (Titanium Gray / Orange)',
  confirmedSources: [
    'Samsung Mobile Press Galaxy Watch Ultra Specifications',
    'Samsung Developer Documentation (47.4 x 47.4 x 12.1 mm, 1.47" Super AMOLED, 327 ppi)',
  ],
  notes: 'Rugged cushion squircle titanium body (47.4x47.4mm) with circular raised titanium bezel ring (outer 43.8mm), right-side crown guard with signature orange circular Quick Button at 3 o\'clock flanked by two rectangular buttons.',
};

// ------------------------------------------------------------------ Legacy Aliases for backwards compatibility

export const GALAXY_WATCH_5_SPEC: DeviceSpec = {
  ...GALAXY_WATCH_7_44_SPEC,
  id: 'galaxy-watch-5-44mm',
  name: 'Samsung Galaxy Watch5 (44mm)',
  generation: 'Galaxy Watch5 · 44 mm (2022)',
  shortLabel: 'Watch5 44',
  releaseYear: 2022,
};

export const GALAXY_WATCH_6_44_SPEC: DeviceSpec = {
  ...GALAXY_WATCH_7_44_SPEC,
  id: 'galaxy-watch-6-44mm',
  name: 'Samsung Galaxy Watch6 (44mm)',
  generation: 'Galaxy Watch6 · 44 mm (2023)',
  shortLabel: 'Watch6 44',
  releaseYear: 2023,
};

// ------------------------------------------------------------------ 3D Model Builders

/**
 * Procedural Modern Flat Galaxy Watch (Watch 4/5/6/7 archetype).
 */
export function buildGalaxyFlatWatch(
  materials: WatchMaterials,
  spec: DeviceSpec,
  rimWidth: number
): DeviceModelResult {
  const group = new THREE.Group();
  group.name = spec.id;

  const C = spec.caseHeightMm / 2; // flank radius
  const W = rimWidth;
  const G = C - W; // glass radius
  const D = spec.caseThicknessMm;
  const s = D / 9.8;
  const k = C / 21.65;
  const screenRadius = spec.activeDisplayDiameterMm / 2;
  const glassY = -0.32;
  const backY = -(D + 1.6);

  // 1. Aluminum body shell
  const caseGeo = latheFromProfile([
    [C - 6.85 * k, -D],
    [C - 3.05 * k, -D + 0.15 * s],
    [C - 1.05, -D + 0.9 * s],
    [C - 0.2, -D + 2.4 * s],
    [C, -5.2 * s],
    [C - 0.1, -3.0 * s],
    [C - 0.2 * W, -1.4],
    [C - 0.41 * W, -0.45],
    [G + 0.39 * W, 0.0],
    [G + 0.18 * W, 0.02],
    [G + 0.045 * W, -0.12],
    [G, -0.6],
    [G - 0.05, -1.4],
  ]);
  const caseMesh = new THREE.Mesh(caseGeo, materials.caseAluminum);
  caseMesh.name = 'case';
  caseMesh.castShadow = true;
  caseMesh.receiveShadow = true;
  group.add(caseMesh);

  // 2. Black display border (inactive OLED area)
  const borderGeo = new THREE.CircleGeometry(G + 0.05, 128);
  borderGeo.rotateX(-Math.PI / 2);
  const border = new THREE.Mesh(borderGeo, materials.bezelBlack);
  border.name = 'bezel';
  border.position.y = glassY - 0.20;
  border.renderOrder = 1;
  group.add(border);

  // 3. Active circular display mesh
  const displayGeo = new THREE.CircleGeometry(screenRadius, 128);
  displayGeo.rotateX(-Math.PI / 2);
  const displayMesh = new THREE.Mesh(displayGeo, materials.displayEmpty.clone());
  displayMesh.name = 'screen';
  displayMesh.position.y = glassY - 0.10;
  displayMesh.renderOrder = 2;
  group.add(displayMesh);

  // 4. Flat sapphire cover glass
  const glassGeo = new THREE.CircleGeometry(G, 128);
  glassGeo.rotateX(-Math.PI / 2);
  const glassMesh = new THREE.Mesh(glassGeo, materials.coverGlass);
  glassMesh.name = 'glass';
  glassMesh.position.y = glassY;
  glassMesh.renderOrder = 10;
  group.add(glassMesh);

  // 5. Rear BioActive sensor dome
  const sensorGeo = latheFromProfile(
    [
      [0, backY],
      [6.5 * k, backY + 0.06],
      [11.5 * k, backY + 0.45],
      [14.4 * k, backY + 1.15],
      [15.2 * k, -D],
      [14.9 * k, -D + 0.25],
    ],
    96,
    48
  );
  const sensorMesh = new THREE.Mesh(sensorGeo, materials.sensorGlass);
  sensorMesh.name = 'sensor';
  group.add(sensorMesh);

  // 6. Integrated lugs
  const lugThickness = 3.0;
  const lugInner = 10.1;
  const y = (v: number) => (v < -2 ? v * s : v);
  for (const sign of [-1, 1]) {
    const z = (v: number) => (C + v) * sign;
    const shape = new THREE.Shape();
    shape.moveTo(z(-6.65), y(-1.8));
    shape.lineTo(z(-2.05), y(-1.6));
    shape.quadraticCurveTo(z(1.55), y(-2.0), z(2.75), y(-4.2));
    shape.quadraticCurveTo(z(3.35), y(-6.0), z(1.95), y(-7.2));
    shape.quadraticCurveTo(z(-0.15), y(-8.6), z(-3.15), y(-8.9));
    shape.lineTo(z(-6.65), y(-8.9));
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

  // 7. Dual rectangular pill keys on right flank
  const keyGeo = pillButtonGeometry(6.2 * k, 1.9, 1.0);
  for (const angle of [0.36, -0.36]) {
    const key = new THREE.Mesh(keyGeo, materials.caseAluminum);
    key.name = 'button';
    placeOnSide(key, C - 0.2, angle, -4.9 * s);
    key.castShadow = true;
    group.add(key);
  }

  // 8. Strap
  const strapGeo = sweepBand(wrapStrapPath(C - 0.45, -5.0 * s, backY, 2.6), spec.lugWidthMm - 0.2, 2.6);
  const strap = new THREE.Mesh(strapGeo, materials.strapSilicone);
  strap.name = 'strap';
  strap.castShadow = true;
  strap.receiveShadow = true;
  group.add(strap);

  return { group, displayMesh, glassMesh, backY, spec };
}

/**
 * Procedural Galaxy Watch Classic (Watch 6 Classic archetype).
 * Physical rotating stainless steel bezel raised 1.35mm above sapphire glass with 48 knurled teeth.
 */
export function buildGalaxyClassicWatch(
  materials: WatchMaterials,
  spec: DeviceSpec,
  innerRingMm: number,
  bezelWidthMm: number
): DeviceModelResult {
  const group = new THREE.Group();
  group.name = spec.id;

  const R = spec.caseDiameterMm / 2;
  const D = spec.caseThicknessMm;
  const screenRadius = spec.activeDisplayDiameterMm / 2;
  const glassY = -0.7; // sunken glass plane
  const backY = -(D + 1.6);

  // 1. Polished stainless steel case body
  const caseGeo = latheFromProfile([
    [R - 6.5, -D],
    [R - 3.0, -D + 0.3],
    [R - 1.0, -D + 1.2],
    [R, -5.5],
    [R - 0.2, -2.5],
    [R - 0.4, -0.8],
    [R - 0.6, 0.0],
    [R - bezelWidthMm, 0.0],
    [R - bezelWidthMm, -0.9],
  ]);
  const caseMesh = new THREE.Mesh(caseGeo, materials.caseStainlessSteel);
  caseMesh.name = 'case';
  caseMesh.castShadow = true;
  caseMesh.receiveShadow = true;
  group.add(caseMesh);

  // 2. Physical rotating bezel raised +1.35mm above the glass plane, 48 knurled outer teeth
  const bezelOuterR = R - 0.2;
  const bezelInnerR = screenRadius + innerRingMm;
  const bezelHeight = 1.35;
  const bezelGeo = knurledBezelGeometry(bezelInnerR, bezelOuterR, bezelHeight, 48, 0.35);
  const bezelMesh = new THREE.Mesh(bezelGeo, materials.caseStainlessSteel);
  bezelMesh.name = 'bezel';
  bezelMesh.position.y = 0.0;
  bezelMesh.renderOrder = 1;
  bezelMesh.castShadow = true;
  group.add(bezelMesh);

  // 3. Inner dark bezel ring beneath glass
  const innerRingGeo = new THREE.RingGeometry(screenRadius, bezelInnerR + 0.2, 96);
  innerRingGeo.rotateX(-Math.PI / 2);
  const innerRing = new THREE.Mesh(innerRingGeo, materials.bezelBlack);
  innerRing.position.y = glassY - 0.18;
  innerRing.renderOrder = 1;
  group.add(innerRing);

  // 4. Active circular OLED display mesh
  const displayGeo = new THREE.CircleGeometry(screenRadius, 128);
  displayGeo.rotateX(-Math.PI / 2);
  const displayMesh = new THREE.Mesh(displayGeo, materials.displayEmpty.clone());
  displayMesh.name = 'screen';
  displayMesh.position.y = glassY - 0.09;
  displayMesh.renderOrder = 2;
  group.add(displayMesh);

  // 5. Sunken flat sapphire cover glass
  const glassGeo = new THREE.CircleGeometry(bezelInnerR + 0.1, 128);
  glassGeo.rotateX(-Math.PI / 2);
  const glassMesh = new THREE.Mesh(glassGeo, materials.coverGlass);
  glassMesh.name = 'glass';
  glassMesh.position.y = glassY;
  glassMesh.renderOrder = 10;
  group.add(glassMesh);

  // 6. Rear BioActive sensor dome
  const sensorGeo = latheFromProfile(
    [
      [0, backY],
      [7.0, backY + 0.06],
      [12.0, backY + 0.45],
      [14.5, backY + 1.15],
      [15.5, -D],
      [15.0, -D + 0.25],
    ],
    96,
    48
  );
  const sensorMesh = new THREE.Mesh(sensorGeo, materials.sensorGlass);
  sensorMesh.name = 'sensor';
  group.add(sensorMesh);

  // 7. Classic stainless steel sculpted lugs
  const lugThickness = 3.2;
  const lugInner = 10.1;
  for (const sign of [-1, 1]) {
    const z = (v: number) => (R + v) * sign;
    const shape = new THREE.Shape();
    shape.moveTo(z(-6.0), -2.0);
    shape.lineTo(z(-1.5), -1.8);
    shape.quadraticCurveTo(z(2.2), -2.2, z(3.5), -4.5);
    shape.quadraticCurveTo(z(4.0), -6.8, z(2.5), -8.0);
    shape.quadraticCurveTo(z(0.0), -9.2, z(-3.0), -9.5);
    shape.lineTo(z(-6.0), -9.5);
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

  // 8. Stainless steel side buttons
  const keyGeo = pillButtonGeometry(6.4, 2.0, 1.2);
  for (const angle of [0.34, -0.34]) {
    const key = new THREE.Mesh(keyGeo, materials.caseStainlessSteel);
    key.name = 'button';
    placeOnSide(key, R - 0.2, angle, -5.2);
    key.castShadow = true;
    group.add(key);
  }

  // 9. Strap
  const strapGeo = sweepBand(wrapStrapPath(R - 0.5, -5.2, backY, 2.6), spec.lugWidthMm - 0.2, 2.6);
  const strap = new THREE.Mesh(strapGeo, materials.strapSilicone);
  strap.name = 'strap';
  strap.castShadow = true;
  strap.receiveShadow = true;
  group.add(strap);

  return { group, displayMesh, glassMesh, backY, spec };
}

/**
 * Procedural Galaxy Watch Ultra (squircle-cushion-ultra archetype).
 * Rounded cushion squircle titanium body (47.4x47.4mm) + circular raised bezel ring + orange Quick Button.
 */
export function buildGalaxyUltraWatch(materials: WatchMaterials, spec: DeviceSpec): DeviceModelResult {
  const group = new THREE.Group();
  group.name = spec.id;

  const D = spec.caseThicknessMm; // 12.1 mm
  const screenRadius = spec.activeDisplayDiameterMm / 2; // 18.67 mm
  const bezelOuterR = 43.8 / 2; // 21.9 mm
  const backY = -(D + 1.6);
  const glassY = 0.05;

  // 1. Cushion titanium frame (47.4 x 47.4 mm with ~14mm corner radius)
  const cushionGeo = squircleCaseGeometry(spec.caseDiameterMm, spec.caseHeightMm, D - 1.2, 14.0, 0.9);
  const caseMesh = new THREE.Mesh(cushionGeo, materials.caseTitanium);
  caseMesh.name = 'case';
  caseMesh.castShadow = true;
  caseMesh.receiveShadow = true;
  group.add(caseMesh);

  // 2. Circular raised titanium bezel ring on top of cushion (outer 43.8mm, inner 37.34mm)
  const bezelHeight = 1.35;
  const bezelGeo = knurledBezelGeometry(screenRadius, bezelOuterR, bezelHeight, 36, 0.2);
  const bezelMesh = new THREE.Mesh(bezelGeo, materials.caseTitanium);
  bezelMesh.name = 'bezel';
  bezelMesh.position.y = 0.0;
  bezelMesh.renderOrder = 1;
  bezelMesh.castShadow = true;
  group.add(bezelMesh);

  // 3. Inner dark bezel ring
  const borderGeo = new THREE.RingGeometry(screenRadius, bezelOuterR - 0.4, 96);
  borderGeo.rotateX(-Math.PI / 2);
  const border = new THREE.Mesh(borderGeo, materials.bezelBlack);
  border.position.y = glassY - 0.18;
  border.renderOrder = 1;
  group.add(border);

  // 4. Active circular OLED display mesh
  const displayGeo = new THREE.CircleGeometry(screenRadius, 128);
  displayGeo.rotateX(-Math.PI / 2);
  const displayMesh = new THREE.Mesh(displayGeo, materials.displayEmpty.clone());
  displayMesh.name = 'screen';
  displayMesh.position.y = glassY - 0.09;
  displayMesh.renderOrder = 2;
  group.add(displayMesh);

  // 5. Flat sapphire crystal flush inside the circular titanium bezel
  const glassGeo = new THREE.CircleGeometry(screenRadius + 0.1, 128);
  glassGeo.rotateX(-Math.PI / 2);
  const glassMesh = new THREE.Mesh(glassGeo, materials.coverGlass);
  glassMesh.name = 'glass';
  glassMesh.position.y = glassY;
  glassMesh.renderOrder = 10;
  group.add(glassMesh);

  // 6. Rear BioActive sensor dome
  const sensorGeo = latheFromProfile(
    [
      [0, backY],
      [8.0, backY + 0.08],
      [13.5, backY + 0.55],
      [16.0, backY + 1.25],
      [17.0, -D],
      [16.5, -D + 0.25],
    ],
    96,
    48
  );
  const sensorMesh = new THREE.Mesh(sensorGeo, materials.sensorGlass);
  sensorMesh.name = 'sensor';
  group.add(sensorMesh);

  // 7. Right-side controls: Signature orange circular Quick Button flanked by titanium rectangular buttons
  const orangeButtonGeo = new THREE.CylinderGeometry(2.3, 2.3, 1.4, 32);
  orangeButtonGeo.rotateZ(Math.PI / 2);
  const orangeButton = new THREE.Mesh(orangeButtonGeo, materials.accentOrange);
  orangeButton.name = 'crown';
  orangeButton.position.set(23.7 + 0.7, -4.8, 0);
  orangeButton.castShadow = true;
  group.add(orangeButton);

  // Flanking titanium rectangular pushers at 2 and 4 o'clock
  const sideKeyGeo = pillButtonGeometry(6.2, 2.0, 1.0);
  for (const zOff of [-7.2, 7.2]) {
    const key = new THREE.Mesh(sideKeyGeo, materials.caseTitanium);
    key.name = 'button';
    key.position.set(23.6, -4.8, zOff);
    key.castShadow = true;
    group.add(key);
  }

  // 8. Wide integrated trail strap (22mm)
  const strapGeo = sweepBand(wrapStrapPath(22.8, -5.2, backY, 2.8), spec.lugWidthMm - 0.2, 2.8);
  const strap = new THREE.Mesh(strapGeo, materials.strapSilicone);
  strap.name = 'strap';
  strap.castShadow = true;
  strap.receiveShadow = true;
  group.add(strap);

  return { group, displayMesh, glassMesh, backY, spec };
}

// ------------------------------------------------------------------ Exported Model Builders

export const buildGalaxyWatch7_40Model = (m: WatchMaterials) =>
  buildGalaxyFlatWatch(m, GALAXY_WATCH_7_40_SPEC, 1.215);

export const buildGalaxyWatch7_44Model = (m: WatchMaterials) =>
  buildGalaxyFlatWatch(m, GALAXY_WATCH_7_44_SPEC, 1.23);

export const buildGalaxyWatch5_40Model = (m: WatchMaterials) =>
  buildGalaxyFlatWatch(m, GALAXY_WATCH_5_40_SPEC, 1.235);

export const buildGalaxyWatch6Classic43Model = (m: WatchMaterials) =>
  buildGalaxyClassicWatch(m, GALAXY_WATCH_6_CLASSIC_43_SPEC, 1.6, 3.015);

export const buildGalaxyWatch6Classic47Model = (m: WatchMaterials) =>
  buildGalaxyClassicWatch(m, GALAXY_WATCH_6_CLASSIC_47_SPEC, 1.55, 3.03);

export const buildGalaxyWatchUltraModel = (m: WatchMaterials) =>
  buildGalaxyUltraWatch(m, GALAXY_WATCH_ULTRA_47_SPEC);

// Legacy builder aliases
export const buildGalaxyWatch5Model = (m: WatchMaterials) =>
  buildGalaxyFlatWatch(m, GALAXY_WATCH_5_SPEC, 2.2);

export const buildGalaxyWatch6Model = (m: WatchMaterials) =>
  buildGalaxyFlatWatch(m, GALAXY_WATCH_6_44_SPEC, 1.5);
