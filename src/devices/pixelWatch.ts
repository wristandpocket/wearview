import * as THREE from 'three';
import type { DeviceModelResult, DeviceSpec } from './types';
import type { WatchMaterials } from './materials';
import {
  flutedCrownGeometry,
  latheFromProfile,
  pillButtonGeometry,
  placeOnSide,
  sweepBand,
  wrapStrapPath,
} from './geometry';

export const PIXEL_WATCH_1_SPEC: DeviceSpec = {
  id: 'pixel-watch-41',
  name: 'Google Pixel Watch 1/2 (41mm)',
  generation: 'Pixel Watch 1/2 · 41 mm (2022/2023)',
  shortLabel: 'Pixel 41',
  familyGroup: 'google-pixel',
  releaseYear: 2022,
  caseDiameterMm: 41.0,
  caseHeightMm: 41.0,
  caseThicknessMm: 12.3, // total height including rear sensor dome
  displayDiameterMm: 30.48, // 1.20" active display
  activeDisplayDiameterMm: 30.48,
  resolutionPx: { width: 384, height: 384 },
  ppi: 320,
  bezelRadialWidthMm: 5.26, // (41.0 - 30.48) / 2
  lugWidthMm: 20.0,
  archetype: 'domed-pebble',
  glassType: 'domed-pebble-glass',
  caseMaterialName: 'Polished Stainless Steel (Silver)',
  confirmedSources: [
    'Google Store Tech Specs (Pixel Watch 1 & 2)',
    'Google Support Hardware Specifications (41 mm, 12.3 mm height, 384x384 AMOLED, 320 ppi)',
  ],
  notes: 'Circular domed pebble with continuous curved 3D glass rolling into polished steel housing. 5.26 mm black bezel under glass, rotating tactile crown at 3 o\'clock (radius 2.2mm, length 1.8mm), flush button at 2 o\'clock, lugless band.',
};

export const PIXEL_WATCH_3_41_SPEC: DeviceSpec = {
  id: 'pixel-watch-3-41',
  name: 'Google Pixel Watch 3 (41mm)',
  generation: 'Pixel Watch 3 · 41 mm (2024)',
  shortLabel: 'Pixel 3 41',
  familyGroup: 'google-pixel',
  releaseYear: 2024,
  caseDiameterMm: 41.0,
  caseHeightMm: 41.0,
  caseThicknessMm: 12.3,
  displayDiameterMm: 32.20, // 1.27" active display
  activeDisplayDiameterMm: 32.20,
  resolutionPx: { width: 408, height: 408 },
  ppi: 320,
  bezelRadialWidthMm: 4.40, // 16% thinner black bezel than PW1/2
  lugWidthMm: 20.0,
  archetype: 'domed-pebble',
  glassType: 'domed-pebble-glass',
  caseMaterialName: 'Matte Recycled Aluminum (Matte Black)',
  confirmedSources: [
    'Google Store Tech Specs (Pixel Watch 3 41mm)',
    'Google Hardware Specs (1.27" Actua display, 408x408, 320 ppi, 16% smaller bezels)',
  ],
  notes: 'Third-generation 41mm model. Same 41mm glass dome silhouette as PW1/2, but noticeably larger active screen plane (32.2mm) and thinner black bezel border (4.40mm).',
};

export const PIXEL_WATCH_3_45_SPEC: DeviceSpec = {
  id: 'pixel-watch-3-45',
  name: 'Google Pixel Watch 3 (45mm)',
  generation: 'Pixel Watch 3 · 45 mm (2024)',
  shortLabel: 'Pixel 3 45',
  familyGroup: 'google-pixel',
  releaseYear: 2024,
  caseDiameterMm: 45.0,
  caseHeightMm: 45.0,
  caseThicknessMm: 12.3,
  displayDiameterMm: 35.56, // 1.40" active display
  activeDisplayDiameterMm: 35.56,
  resolutionPx: { width: 456, height: 456 },
  ppi: 326,
  bezelRadialWidthMm: 4.72,
  lugWidthMm: 22.0,
  archetype: 'domed-pebble',
  glassType: 'domed-pebble-glass',
  caseMaterialName: 'Matte Recycled Aluminum (Matte Black / Hazel)',
  confirmedSources: [
    'Google Store Tech Specs (Pixel Watch 3 45mm)',
    'Google Hardware Specs (1.40" Actua display, 456x456, 320 ppi, 22mm lug width)',
  ],
  notes: 'Expanded 45mm form factor with 40% more screen area than PW2. Scaled 45mm matte aluminum/glass dome, crown at 3 o\'clock, 22mm band attachment.',
};

/**
 * Procedural Pixel Watch builder (domed-pebble archetype).
 * 1 unit = 1 mm, face up (+Y), 12 o'clock at -Z, crown at +X (3 o'clock).
 */
export function buildPixelWatchModel(materials: WatchMaterials, spec: DeviceSpec): DeviceModelResult {
  const group = new THREE.Group();
  group.name = spec.id;

  const R = spec.caseDiameterMm / 2; // 20.5 or 22.5 mm
  const screenRadius = spec.activeDisplayDiameterMm / 2;
  const backY = -10.1;
  const scaleRatio = R / 20.5;

  const displayY = 1.10;

  // 1. Lower metal housing (polished steel or matte aluminum) below the glass equator (y = +0.2 mm)
  const bodyPoints: Array<[number, number]> = [
    [14.2 * scaleRatio, -9.25],
    [16.8 * scaleRatio, -9.0],
    [18.6 * scaleRatio, -7.8],
    [19.8 * scaleRatio, -5.8],
    [R * 0.985, -3.8],
    [R * 0.998, -1.8],
    [R, 0.0],
    [R, 0.2],
  ];
  const bodyGeo = latheFromProfile(bodyPoints);
  const bodyMat = spec.caseMaterialName.includes('Aluminum') ? materials.caseAluminum : materials.caseStainlessSteel;
  const caseMesh = new THREE.Mesh(bodyGeo, bodyMat);
  caseMesh.name = 'case';
  caseMesh.castShadow = true;
  caseMesh.receiveShadow = true;
  group.add(caseMesh);

  // 2. Black glass substrate following dome underside starting directly at equator (R, 0.15)
  const substratePoints: Array<[number, number]> = [
    [R, 0.15],
    [R * 0.96, 0.45],
    [R * 0.90, 0.70],
    [screenRadius + 0.3, displayY - 0.15],
    [screenRadius, displayY - 0.15],
    [0, displayY - 0.15],
  ];
  const substrateGeo = latheFromProfile(substratePoints);
  const bezelMesh = new THREE.Mesh(substrateGeo, materials.bezelBlack);
  bezelMesh.name = 'bezel';
  bezelMesh.renderOrder = 1;
  group.add(bezelMesh);

  // 3. Active circular OLED display mesh, precisely framed by the bezel
  const displayGeo = new THREE.CircleGeometry(screenRadius, 128);
  displayGeo.rotateX(-Math.PI / 2);
  const displayMesh = new THREE.Mesh(displayGeo, materials.displayEmpty.clone());
  displayMesh.name = 'screen';
  displayMesh.position.y = displayY;
  displayMesh.renderOrder = 2;
  group.add(displayMesh);

  // 4. Domed cover glass: seamless 3D pebble starting directly at equator (R, 0.2) to apex (0, 2.2)
  const domePoints: Array<[number, number]> = [];
  const domeSteps = 24;
  for (let i = 0; i <= domeSteps; i++) {
    const t = i / domeSteps;
    const angle = (t * Math.PI) / 2;
    const r = R * Math.cos(angle);
    const y = 0.2 + 2.0 * Math.sin(angle);
    domePoints.push([Math.max(0, r), y]);
  }
  const domeGeo = latheFromProfile(domePoints);
  const glassMesh = new THREE.Mesh(domeGeo, materials.coverGlass);
  glassMesh.name = 'glass';
  glassMesh.renderOrder = 10;
  group.add(glassMesh);

  // 5. Rear sensor dome
  const sensorGeo = latheFromProfile(
    [
      [0, backY],
      [7.0 * scaleRatio, backY + 0.05],
      [11.6 * scaleRatio, backY + 0.3],
      [14.2 * scaleRatio, backY + 0.75],
      [14.6 * scaleRatio, -9.25],
      [14.3 * scaleRatio, -9.05],
    ],
    96,
    48
  );
  const sensorMesh = new THREE.Mesh(sensorGeo, materials.sensorGlass);
  sensorMesh.name = 'sensor';
  group.add(sensorMesh);

  // 6. Tactile rotating crown at 3 o'clock (+X): recessed neck, knurled wheel, rounded bevel
  const crownRadius = (spec.id === 'pixel-watch-3-45' ? 2.4 : 2.2);
  const crownLength = (spec.id === 'pixel-watch-3-45' ? 2.0 : 1.8);
  const crownGroup = new THREE.Group();
  crownGroup.name = 'crown';

  // Recessed neck
  const neckRadius = crownRadius * 0.58;
  const neckLen = 0.45;
  const neckGeo = new THREE.CylinderGeometry(neckRadius, neckRadius, neckLen, 24);
  neckGeo.rotateZ(Math.PI / 2);
  const neckMesh = new THREE.Mesh(neckGeo, materials.crownSteel);
  neckMesh.position.set(R - 0.2 + neckLen / 2, -4.3, 0);
  neckMesh.castShadow = true;
  crownGroup.add(neckMesh);

  // Knurled wheel
  const wheelLen = crownLength - neckLen;
  const wheelGeo = flutedCrownGeometry(crownRadius, wheelLen, 28, 0.10);
  const wheelMesh = new THREE.Mesh(wheelGeo, materials.crownSteel);
  wheelMesh.position.set(R - 0.2 + neckLen + wheelLen / 2, -4.3, 0);
  wheelMesh.castShadow = true;
  crownGroup.add(wheelMesh);

  // Rounded outer bevel cap
  const capRadius = crownRadius * 0.96;
  const capGeo = new THREE.SphereGeometry(capRadius, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.25);
  capGeo.rotateZ(-Math.PI / 2);
  const capMesh = new THREE.Mesh(capGeo, materials.crownSteel);
  capMesh.position.set(R - 0.2 + crownLength - 0.8, -4.3, 0);
  crownGroup.add(capMesh);
  group.add(crownGroup);

  // 7. Flush side button above crown at 2 o'clock
  const buttonMesh = new THREE.Mesh(pillButtonGeometry(4.8 * scaleRatio, 1.5, 0.5), bodyMat);
  buttonMesh.name = 'button';
  placeOnSide(buttonMesh, R - 0.15, 0.42, -4.3);
  group.add(buttonMesh);

  // 8. Lugless band attachment
  const strapGeo = sweepBand(wrapStrapPath(R - 2.1, -5.6, backY, 2.4), spec.lugWidthMm - 0.5, 2.4);
  const strapMesh = new THREE.Mesh(strapGeo, materials.strapSilicone);
  strapMesh.name = 'strap';
  strapMesh.castShadow = true;
  strapMesh.receiveShadow = true;
  group.add(strapMesh);

  return {
    group,
    displayMesh,
    glassMesh,
    backY,
    spec,
  };
}

// Backwards-compatible builders
export const buildPixelWatch1Model = (m: WatchMaterials) => buildPixelWatchModel(m, PIXEL_WATCH_1_SPEC);
export const buildPixelWatch3_41Model = (m: WatchMaterials) => buildPixelWatchModel(m, PIXEL_WATCH_3_41_SPEC);
export const buildPixelWatch3_45Model = (m: WatchMaterials) => buildPixelWatchModel(m, PIXEL_WATCH_3_45_SPEC);
