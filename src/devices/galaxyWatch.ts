import * as THREE from 'three';
import type { DeviceModelResult, DeviceSpec } from './types';
import type { WatchMaterials } from './materials';
import { latheFromProfile, pillButtonGeometry, placeOnSide, sweepBand, wrapStrapPath } from './geometry';

export const GALAXY_WATCH_5_SPEC: DeviceSpec = {
  id: 'galaxy-watch-5-44mm',
  name: 'Samsung Galaxy Watch5',
  generation: 'Galaxy Watch5 · 44 mm',
  shortLabel: 'Watch5 44',
  releaseYear: 2022,
  caseDiameterMm: 44.4,
  caseHeightMm: 43.3,
  caseThicknessMm: 9.8,
  displayDiameterMm: 34.6, // 1.4" active display
  resolutionPx: { width: 450, height: 450 },
  bezelRadialWidthMm: 2.15, // Estimated black border between active area and metal rim
  glassType: 'flat-sapphire-rim',
  caseMaterialName: 'Armor Aluminum (Graphite)',
  confirmedSources: [
    'https://www.samsung.com/uk/business/watches/galaxy-watch/galaxy-watch5-44mm-graphite-lte-sm-r915fzaaeua/',
    'Samsung Developer Documentation (450x450 Super AMOLED, 321 ppi)'
  ],
  notes: 'Flat sapphire glass inside a slightly raised aluminum rim, ~2.2 mm black display border, integrated short lugs, two pill keys at 2 and 4 o\'clock, rounded sensor dome on the back.'
};

export const GALAXY_WATCH_5_40_SPEC: DeviceSpec = {
  id: 'galaxy-watch-5-40mm',
  name: 'Samsung Galaxy Watch5',
  generation: 'Galaxy Watch5 · 40 mm',
  shortLabel: 'Watch5 40',
  releaseYear: 2022,
  caseDiameterMm: 40.4,
  caseHeightMm: 39.3,
  caseThicknessMm: 9.8,
  displayDiameterMm: 30.4, // 1.2" active display
  resolutionPx: { width: 396, height: 396 },
  bezelRadialWidthMm: 2.25, // Estimated
  glassType: 'flat-sapphire-rim',
  caseMaterialName: 'Armor Aluminum (Graphite)',
  confirmedSources: [
    'https://devices.vodafone.com.au/samsung/galaxy-watch5-android-wear-os/specifications/',
    'https://m.gsmarena.com/samsung_galaxy_watch5-11748.php'
  ],
  notes: 'Smaller sibling of the 44 mm: same flat sapphire glass, raised aluminum rim and 20 mm lugs, 1.2" 396 × 396 display.'
};

export const GALAXY_WATCH_6_44_SPEC: DeviceSpec = {
  id: 'galaxy-watch-6-44mm',
  name: 'Samsung Galaxy Watch6',
  generation: 'Galaxy Watch6 · 44 mm',
  shortLabel: 'Watch6 44',
  releaseYear: 2023,
  caseDiameterMm: 44.4,
  caseHeightMm: 42.8,
  caseThicknessMm: 9.0,
  displayDiameterMm: 37.3, // 1.5" active display
  resolutionPx: { width: 480, height: 480 },
  bezelRadialWidthMm: 1.25, // Estimated: Watch6 shrank the bezel vs Watch5
  glassType: 'flat-sapphire-rim',
  caseMaterialName: 'Armor Aluminum (Graphite)',
  confirmedSources: [
    'https://www.samsungmobilepress.com/media-assets/galaxy-watch6?tab=specs',
    'https://m.gsmarena.com/samsung_galaxy_watch6-12437.php'
  ],
  notes: 'Bigger 1.5" 480 × 480 display in almost the same case as the Watch5 44 mm: thinner black border and slimmer metal rim, 9.0 mm body.'
};

interface GalaxyParams {
  spec: DeviceSpec;
  /** Width of the metal rim between the glass edge and the case flank (mm, estimated). */
  rimWidth: number;
}

/**
 * Procedural round Galaxy Watch (Watch5/Watch6 family). 1 unit = 1 mm, face up, 12 o'clock at -Z.
 * Flank radius comes from the published case height (the smaller outline dimension),
 * display radius from the published display diameter; rim, lugs and keys are derived.
 */
function buildGalaxyWatch(materials: WatchMaterials, { spec, rimWidth }: GalaxyParams): DeviceModelResult {
  const group = new THREE.Group();
  group.name = spec.id;

  const C = spec.caseHeightMm / 2; // flank radius
  const W = rimWidth;
  const G = C - W; // glass radius
  const D = spec.caseThicknessMm;
  const s = D / 9.8; // vertical scale vs. the Watch5 reference
  const k = C / 21.65; // horizontal scale vs. the Watch5 44 reference
  const screenRadius = spec.displayDiameterMm / 2;
  const glassY = -0.32;
  const backY = -(D + 1.6);

  // 1. Case: one lathed aluminum shell, rounded flank, raised lip around the glass
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
  caseMesh.castShadow = true;
  caseMesh.receiveShadow = true;
  group.add(caseMesh);

  // 2. Black display border (inactive OLED area) right below the glass
  const borderGeo = new THREE.CircleGeometry(G + 0.05, 128);
  borderGeo.rotateX(-Math.PI / 2);
  const border = new THREE.Mesh(borderGeo, materials.bezelBlack);
  border.position.y = glassY - 0.45;
  group.add(border);

  // 3. Active display
  const displayGeo = new THREE.CircleGeometry(screenRadius, 128);
  displayGeo.rotateX(-Math.PI / 2);
  const displayMesh = new THREE.Mesh(displayGeo, materials.displayEmpty.clone());
  displayMesh.name = 'displayMesh';
  displayMesh.position.y = glassY - 0.4;
  group.add(displayMesh);

  // 4. Flat sapphire cover glass (additive reflections only)
  const glassGeo = new THREE.CircleGeometry(G, 128);
  glassGeo.rotateX(-Math.PI / 2);
  const glassMesh = new THREE.Mesh(glassGeo, materials.coverGlass);
  glassMesh.name = 'glassMesh';
  glassMesh.position.y = glassY;
  glassMesh.renderOrder = 10;
  group.add(glassMesh);

  // 5. Rear BioActive sensor dome
  const sensorGeo = latheFromProfile([
    [0, backY],
    [6.5 * k, backY + 0.06],
    [11.5 * k, backY + 0.45],
    [14.4 * k, backY + 1.15],
    [15.2 * k, -D],
    [14.9 * k, -D + 0.25],
  ], 96, 48);
  group.add(new THREE.Mesh(sensorGeo, materials.sensorGlass));

  // 6. Integrated lugs: short horns at 12 and 6 o'clock, 20 mm strap gap
  const lugThickness = 3.0;
  const lugInner = 10.3;
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
      lug.position.x = side * (lugInner + lugThickness / 2);
      lug.castShadow = true;
      group.add(lug);
    }
  }

  // 7. Two pill keys on the right flank (Home at ~2 o'clock, Back at ~4 o'clock)
  const keyGeo = pillButtonGeometry(6.4 * k, 1.9, 1.1);
  for (const angle of [0.36, -0.36]) {
    const key = new THREE.Mesh(keyGeo, materials.caseAluminum);
    placeOnSide(key, C - 0.2, angle, -4.9 * s);
    key.castShadow = true;
    group.add(key);
  }

  // 8. One-piece sport band wrapped around the shared wrist section
  const strapGeo = sweepBand(wrapStrapPath(C - 0.45, -5.0 * s, backY, 2.6), 19.8, 2.6);
  const strap = new THREE.Mesh(strapGeo, materials.strapSilicone);
  strap.castShadow = true;
  strap.receiveShadow = true;
  group.add(strap);

  return { group, displayMesh, glassMesh, backY, spec };
}

export const buildGalaxyWatch5Model = (m: WatchMaterials) => buildGalaxyWatch(m, { spec: GALAXY_WATCH_5_SPEC, rimWidth: 2.2 });
export const buildGalaxyWatch5_40Model = (m: WatchMaterials) => buildGalaxyWatch(m, { spec: GALAXY_WATCH_5_40_SPEC, rimWidth: 2.2 });
export const buildGalaxyWatch6Model = (m: WatchMaterials) => buildGalaxyWatch(m, { spec: GALAXY_WATCH_6_44_SPEC, rimWidth: 1.5 });
