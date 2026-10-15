import * as THREE from 'three';
import type { DeviceModelResult, DeviceSpec } from './types';
import type { WatchMaterials } from './materials';
import { latheFromProfile, pillButtonGeometry, placeOnSide, sweepBand, wrapStrapPath } from './geometry';

export const GALAXY_WATCH_5_SPEC: DeviceSpec = {
  id: 'galaxy-watch-5-44mm',
  name: 'Samsung Galaxy Watch5',
  generation: 'Galaxy Watch5 · 44 mm',
  shortLabel: 'Galaxy Watch5 44',
  releaseYear: 2022,
  caseDiameterMm: 44.4,
  caseHeightMm: 43.3,
  caseThicknessMm: 9.8,
  displayDiameterMm: 34.6, // 1.4" active display
  resolutionPx: { width: 450, height: 450 },
  bezelRadialWidthMm: 2.3, // Estimated black border between active area and metal rim
  glassType: 'flat-sapphire-rim',
  caseMaterialName: 'Armor Aluminum (Graphite)',
  confirmedSources: [
    'https://www.samsung.com/uk/business/watches/galaxy-watch/galaxy-watch5-44mm-graphite-lte-sm-r915fzaaeua/',
    'Samsung Developer Documentation (450x450 Super AMOLED, 321 ppi)'
  ],
  notes: 'Flat sapphire glass inside a slightly raised aluminum rim, ~2.2 mm black display border, integrated short lugs, two pill keys at 2 and 4 o\'clock, rounded sensor dome on the back.'
};

/**
 * Procedural Galaxy Watch5 44 mm (1 unit = 1 mm, face up, 12 o'clock at -Z).
 * Display r = 17.3 (34.6 mm), black border to r = 19.45, raised aluminum lip to r ≈ 20.4,
 * rounded case flank peaking at r = 21.65 (43.3 mm), 9.8 mm body + ~1.7 mm sensor dome.
 */
export function buildGalaxyWatch5Model(materials: WatchMaterials): DeviceModelResult {
  const group = new THREE.Group();
  group.name = GALAXY_WATCH_5_SPEC.id;

  const screenRadius = GALAXY_WATCH_5_SPEC.displayDiameterMm / 2; // 17.3
  const glassRadius = 19.45;
  const glassY = -0.32;
  const backY = -11.4;

  // 1. Case: one lathed aluminum shell, rounded flank, raised lip around the glass
  const caseGeo = latheFromProfile([
    [14.8, -9.8],
    [18.6, -9.65],
    [20.6, -8.9],
    [21.45, -7.4],
    [21.65, -5.2],
    [21.55, -3.0],
    [21.2, -1.4],
    [20.75, -0.45],
    [20.3, 0.0],
    [19.85, 0.02],
    [19.55, -0.12],
    [19.45, -0.6],
    [19.4, -1.4],
  ]);
  const caseMesh = new THREE.Mesh(caseGeo, materials.caseAluminum);
  caseMesh.castShadow = true;
  caseMesh.receiveShadow = true;
  group.add(caseMesh);

  // 2. Black display border (inactive OLED area) right below the glass
  const borderGeo = new THREE.CircleGeometry(glassRadius + 0.05, 128);
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
  const glassGeo = new THREE.CircleGeometry(glassRadius, 128);
  glassGeo.rotateX(-Math.PI / 2);
  const glassMesh = new THREE.Mesh(glassGeo, materials.coverGlass);
  glassMesh.name = 'glassMesh';
  glassMesh.position.y = glassY;
  glassMesh.renderOrder = 10;
  group.add(glassMesh);

  // 5. Rear BioActive sensor dome
  const sensorGeo = latheFromProfile([
    [0, backY],
    [6.5, backY + 0.06],
    [11.5, backY + 0.45],
    [14.4, backY + 1.15],
    [15.2, -9.8],
    [14.9, -9.55],
  ], 96, 48);
  const sensor = new THREE.Mesh(sensorGeo, materials.sensorGlass);
  group.add(sensor);

  // 6. Integrated lugs: short horns at 12 and 6 o'clock, 20 mm strap gap
  const lugThickness = 3.0;
  const lugInner = 10.3;
  for (const sign of [-1, 1]) {
    const shape = new THREE.Shape();
    const s = (z: number) => z * sign;
    shape.moveTo(s(15), -1.8);
    shape.lineTo(s(19.6), -1.6);
    shape.quadraticCurveTo(s(23.2), -2.0, s(24.4), -4.2);
    shape.quadraticCurveTo(s(25.0), -6.0, s(23.6), -7.2);
    shape.quadraticCurveTo(s(21.5), -8.6, s(18.5), -8.9);
    shape.lineTo(s(15), -8.9);
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
  const keyGeo = pillButtonGeometry(6.4, 1.9, 1.1);
  for (const angle of [0.36, -0.36]) {
    const key = new THREE.Mesh(keyGeo, materials.caseAluminum);
    placeOnSide(key, 21.45, angle, -4.9);
    key.castShadow = true;
    group.add(key);
  }

  // 8. One-piece sport band wrapped around the shared wrist section
  const strapGeo = sweepBand(wrapStrapPath(21.2, -5.0, backY, 2.6), 19.8, 2.6);
  const strap = new THREE.Mesh(strapGeo, materials.strapSilicone);
  strap.castShadow = true;
  strap.receiveShadow = true;
  group.add(strap);

  return {
    group,
    displayMesh,
    glassMesh,
    backY,
    spec: GALAXY_WATCH_5_SPEC
  };
}
