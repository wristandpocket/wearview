import * as THREE from 'three';
import type { DeviceModelResult, DeviceSpec } from './types';
import type { WatchMaterials } from './materials';
import { flutedCrownGeometry, latheFromProfile, pillButtonGeometry, placeOnSide, sweepBand, wrapStrapPath } from './geometry';

export const PIXEL_WATCH_1_SPEC: DeviceSpec = {
  id: 'pixel-watch-1-41mm',
  name: 'Google Pixel Watch',
  generation: 'Pixel Watch · 1st gen · 41 mm (2022)',
  shortLabel: 'Pixel 41',
  releaseYear: 2022,
  caseDiameterMm: 41.0,
  caseHeightMm: 41.0,
  caseThicknessMm: 12.3, // official total height including sensor dome
  displayDiameterMm: 33.5, // Estimated active area used for preview
  resolutionPx: { width: 450, height: 450 },
  bezelRadialWidthMm: 3.75, // (41.0 - 33.5) / 2, black glass border under the dome
  glassType: 'domed-pebble-glass',
  caseMaterialName: 'Polished Stainless Steel (Silver)',
  confirmedSources: [
    'Google Store Tech Specs (2022 Pixel Watch 1st Gen)',
    'Google Support Hardware Specifications (41 mm diameter, 12.3 mm height, 36g)'
  ],
  notes: 'First-generation 2022 model. Domed 3D Gorilla Glass 5 rolling over the edge into a polished steel body, wide black glass border, fluted crown at 3 o\'clock with a flush side key above it, lugless band attachment.'
};

/**
 * Procedural Pixel Watch (1st gen, 41 mm). 1 unit = 1 mm, face up, 12 o'clock at -Z.
 * Dome apex at y = 2.2, glass meets the steel at y ≈ -2, sensor dome bottom at y = -10.1 (12.3 mm total).
 */
export function buildPixelWatch1Model(materials: WatchMaterials): DeviceModelResult {
  const group = new THREE.Group();
  group.name = PIXEL_WATCH_1_SPEC.id;

  const screenRadius = PIXEL_WATCH_1_SPEC.displayDiameterMm / 2; // 16.75
  const backY = -10.1;

  // 1. Polished steel body below the glass equator
  const bodyGeo = latheFromProfile([
    [14.2, -9.3],
    [17.6, -9.05],
    [19.6, -7.9],
    [20.4, -5.9],
    [20.5, -3.8],
    [20.35, -2.4],
    [20.0, -2.0],
    [19.6, -1.95],
  ]);
  const body = new THREE.Mesh(bodyGeo, materials.caseStainlessSteel);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 2. Black glass substrate that follows the dome from underneath (the wide Gen 1 border)
  const substrateGeo = latheFromProfile([
    [19.95, -2.05],
    [20.05, -1.55],
    [19.75, -0.85],
    [19.05, -0.05],
    [17.7, 0.55],
    [15.5, 0.92],
    [8, 1.0],
    [0, 1.0],
  ]);
  const substrate = new THREE.Mesh(substrateGeo, materials.bezelBlack);
  group.add(substrate);

  // 3. Active display, flat, sitting under the apex of the dome
  const displayGeo = new THREE.CircleGeometry(screenRadius, 128);
  displayGeo.rotateX(-Math.PI / 2);
  const displayMesh = new THREE.Mesh(displayGeo, materials.displayEmpty.clone());
  displayMesh.name = 'displayMesh';
  displayMesh.position.y = 1.05;
  group.add(displayMesh);

  // 4. Domed cover glass (pebble profile)
  const domeGeo = latheFromProfile([
    [20.1, -2.05],
    [20.5, -1.35],
    [20.35, -0.35],
    [19.7, 0.6],
    [18.3, 1.35],
    [15.0, 1.88],
    [10.0, 2.12],
    [0, 2.2],
  ]);
  const glassMesh = new THREE.Mesh(domeGeo, materials.coverGlass);
  glassMesh.name = 'glassMesh';
  glassMesh.renderOrder = 10;
  group.add(glassMesh);

  // 5. Rear sensor dome
  const sensorGeo = latheFromProfile([
    [0, backY],
    [7.0, backY + 0.05],
    [11.6, backY + 0.3],
    [14.2, backY + 0.75],
    [14.6, -9.25],
    [14.3, -9.05],
  ], 96, 48);
  const sensor = new THREE.Mesh(sensorGeo, materials.sensorGlass);
  group.add(sensor);

  // 6. Fluted crown at 3 o'clock
  const crownLength = 2.4;
  const crown = new THREE.Mesh(flutedCrownGeometry(2.7, crownLength, 30, 0.14), materials.crownSteel);
  crown.position.set(20.1 + crownLength / 2, -4.3, 0);
  crown.castShadow = true;
  group.add(crown);
  const capGeo = new THREE.SphereGeometry(2.6, 32, 12, 0, Math.PI * 2, 0, Math.PI * 0.22);
  capGeo.rotateZ(-Math.PI / 2);
  const cap = new THREE.Mesh(capGeo, materials.caseStainlessSteel);
  cap.position.set(20.1 + crownLength - 2.0, -4.3, 0);
  group.add(cap);

  // 7. Flush side key above the crown (~2 o'clock)
  const key = new THREE.Mesh(pillButtonGeometry(5.0, 1.6, 0.6), materials.caseStainlessSteel);
  placeOnSide(key, 20.35, 0.42, -4.3);
  group.add(key);

  // 8. Lugless band: enters slots in the case at 12 and 6 o'clock
  const strapGeo = sweepBand(wrapStrapPath(18.4, -5.6, backY, 2.4), 19.0, 2.4);
  const strap = new THREE.Mesh(strapGeo, materials.strapSilicone);
  strap.castShadow = true;
  strap.receiveShadow = true;
  group.add(strap);

  return {
    group,
    displayMesh,
    glassMesh,
    backY,
    spec: PIXEL_WATCH_1_SPEC
  };
}
