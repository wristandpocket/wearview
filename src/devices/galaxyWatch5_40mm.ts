import * as THREE from 'three';
import type { DeviceModelResult, DeviceSpec } from './types';
import type { WatchMaterials } from './materials';

export const GALAXY_WATCH_5_40MM_SPEC: DeviceSpec = {
  id: 'galaxy-watch-5-40mm',
  name: 'Samsung Galaxy Watch5 (40 mm)',
  generation: 'Galaxy Watch5 · 40 mm',
  releaseYear: 2022,
  caseDiameterMm: 40.4,
  caseHeightMm: 39.3,
  caseThicknessMm: 9.8,
  displayDiameterMm: 30.4, // 1.2" active display
  resolutionPx: { width: 396, height: 396 },
  bezelRadialWidthMm: 2.3, // Measured visible dial bezel border (~2.2 - 2.4 mm)
  glassType: 'flat-sapphire-rim',
  caseMaterialName: 'Armor Aluminum (Graphite Black)',
  confirmedSources: [
    'https://www.samsung.com/uk/watches/galaxy-watch/galaxy-watch5-40mm-graphite-bt-sm-r900nzaaeua/',
    'Samsung Developer Documentation (396x396 Super AMOLED, 330 ppi, 28.7g)'
  ],
  notes: 'Compact 40 mm case body (40.4x39.3x9.8 mm), 1.2" (30.4 mm) active AMOLED screen, 396x396 px, slim 2.3 mm bezel border, micro-chamfered protective lip, sculpted 20 mm lugs, dual flank rocker buttons.'
};

/**
 * Builds high-fidelity procedural 3D model of Samsung Galaxy Watch5 (40 mm).
 * Modeled with verified 40 mm real-world proportions:
 * - Active screen: R = 15.2 mm (30.4 mm diameter)
 * - Slim inner bezel ring: R = 17.5 mm (2.3 mm border)
 * - Protective aluminum lip: R = 18.2 mm (0.7 mm lip)
 * - Solid beveled case: R = 18.2 mm top, tapering to 17.4 mm base, 9.8 mm depth
 * - Standard 20 mm strap interface with sculpted lugs
 */
export function buildGalaxyWatch5_40mmModel(materials: WatchMaterials): DeviceModelResult {
  const group = new THREE.Group();
  group.name = 'galaxy-watch-5-40mm';

  const screenRadius = 15.2; // 30.4 mm display
  const bezelOuterRadius = 17.5; // Slim 2.3 mm bezel border
  const rimOuterRadius = 18.2; // 0.7 mm protective lip
  const caseEquatorRadiusX = 19.6; // Width across button bumpers (39.2 mm)
  const caseEquatorRadiusZ = 18.8; // Lug-to-lug base
  const caseDepth = 9.8;

  // 1. MAIN SOLID ALUMINUM CASE CHASSIS (100% Watertight Closed Cylinder)
  // Top face is at Y = 0.0, bottom face at Y = -9.8
  const caseGeometry = new THREE.CylinderGeometry(
    rimOuterRadius,
    rimOuterRadius - 0.8,
    caseDepth,
    96,
    1,
    false // Closed watertight caps
  );
  caseGeometry.scale(caseEquatorRadiusX / rimOuterRadius, 1, caseEquatorRadiusZ / rimOuterRadius);
  const caseMesh = new THREE.Mesh(caseGeometry, materials.caseAluminum);
  caseMesh.position.set(0, -caseDepth / 2, 0);
  caseMesh.castShadow = true;
  caseMesh.receiveShadow = true;
  group.add(caseMesh);

  // 2. INNER SLIM BEZEL RING (Glossy OLED touch-bezel border at Y = 0.015)
  const bezelGeometry = new THREE.RingGeometry(screenRadius, bezelOuterRadius, 96);
  bezelGeometry.rotateX(-Math.PI / 2);
  const bezelMesh = new THREE.Mesh(bezelGeometry, materials.bezelTexturedRing);
  bezelMesh.position.set(0, 0.015, 0);
  group.add(bezelMesh);

  // 3. ACTIVE DISPLAY MESH (Sits at Y = 0.02, perfectly visible)
  const displayGeometry = new THREE.CircleGeometry(screenRadius, 96);
  displayGeometry.rotateX(-Math.PI / 2);
  const displayMesh = new THREE.Mesh(displayGeometry, materials.displayEmpty.clone());
  displayMesh.name = 'displayMesh';
  displayMesh.position.set(0, 0.02, 0);
  displayMesh.receiveShadow = false;
  group.add(displayMesh);

  // 4. FLAT SAPPHIRE CRYSTAL DISC (At Y = 0.04)
  const glassGeometry = new THREE.CircleGeometry(bezelOuterRadius, 96);
  glassGeometry.rotateX(-Math.PI / 2);
  const glassMesh = new THREE.Mesh(glassGeometry, materials.glassSapphire.clone());
  glassMesh.name = 'glassMesh';
  glassMesh.position.set(0, 0.04, 0);
  group.add(glassMesh);

  // 5. MICRO-CHAMFERED PROTECTIVE ALUMINUM RIM (Lip raised 0.26 mm above glass)
  const rimShape = new THREE.Shape();
  rimShape.absarc(0, 0, rimOuterRadius, 0, Math.PI * 2, false);
  const rimHole = new THREE.Path();
  rimHole.absarc(0, 0, bezelOuterRadius, 0, Math.PI * 2, true);
  rimShape.holes.push(rimHole);

  const rimExtrude = new THREE.ExtrudeGeometry(rimShape, {
    depth: 0.26,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.05,
    bevelThickness: 0.05
  });
  rimExtrude.rotateX(Math.PI / 2);
  const rimMesh = new THREE.Mesh(rimExtrude, materials.caseAluminum);
  rimMesh.position.set(0, 0.24, 0);
  rimMesh.castShadow = true;
  group.add(rimMesh);

  // 6. REAR BIOACTIVE SENSOR DOME
  const sensorDomeGeom = new THREE.CylinderGeometry(14.0, 15.5, 1.8, 64);
  const sensorDomeMesh = new THREE.Mesh(sensorDomeGeom, materials.sensorCeramic);
  sensorDomeMesh.position.set(0, -caseDepth - 0.9, 0);
  group.add(sensorDomeMesh);

  // Optical sensor glass window
  const sensorWindowGeom = new THREE.CircleGeometry(4.5, 32);
  sensorWindowGeom.rotateX(Math.PI / 2);
  const sensorWindowMesh = new THREE.Mesh(sensorWindowGeom, materials.bezelSubstrate);
  sensorWindowMesh.position.set(0, -caseDepth - 1.82, 0);
  group.add(sensorWindowMesh);

  // 7. INTEGRATED SCULPTED LUGS (Standard 20 mm strap gap)
  const lugGapHalf = 10.0;

  function createSculptedLugPair(isNorth: boolean) {
    const sign = isNorth ? -1 : 1;
    const zBase = sign * (caseEquatorRadiusZ - 1.2);

    [-1, 1].forEach((side) => {
      const lugGeom = new THREE.BoxGeometry(2.2, 3.8, 5.0);
      const lug = new THREE.Mesh(lugGeom, materials.caseAluminum);
      lug.position.set(
        side * (lugGapHalf + 1.1),
        -3.6,
        zBase + sign * 2.0
      );
      lug.rotation.x = sign * 0.22;
      lug.castShadow = true;
      group.add(lug);
    });
  }
  createSculptedLugPair(true);  // North (12H)
  createSculptedLugPair(false); // South (6H)

  // 8. FLUSH-FIT SILICONE STRAP
  function createContouredStrap(isNorth: boolean) {
    const sign = isNorth ? -1 : 1;
    const strapWidth = 19.8;

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -3.2, sign * (caseEquatorRadiusZ - 1.5)),
      new THREE.Vector3(0, -4.8, sign * (caseEquatorRadiusZ + 2.2)),
      new THREE.Vector3(0, -10.0, sign * (caseEquatorRadiusZ + 6.5)),
      new THREE.Vector3(0, -18.0, sign * (caseEquatorRadiusZ + 5.0)),
      new THREE.Vector3(0, -25.0, sign * (caseEquatorRadiusZ + 1.8))
    ]);

    const strapGeom = new THREE.TubeGeometry(curve, 32, 1.35, 16, false);
    strapGeom.scale(strapWidth / 2.7, 1, 1);

    const strapMesh = new THREE.Mesh(strapGeom, materials.strapSilicone);
    strapMesh.castShadow = true;
    strapMesh.receiveShadow = true;
    group.add(strapMesh);
  }
  createContouredStrap(true);
  createContouredStrap(false);

  // 9. SLIM ERGONOMIC SIDE BUTTONS (Right flank at +X)
  const buttonLength = 5.6;
  const buttonHeight = 1.5;
  const buttonDepth = 0.85;
  const flankX = caseEquatorRadiusX - 0.1;

  // Power / Home key (at 2H, Z = -5.8 mm)
  const topBtnGeom = new THREE.BoxGeometry(buttonDepth, buttonHeight, buttonLength);
  const topBtnMesh = new THREE.Mesh(topBtnGeom, materials.caseAluminum);
  topBtnMesh.position.set(flankX + buttonDepth / 2, -3.0, -5.8);
  topBtnMesh.castShadow = true;
  group.add(topBtnMesh);

  // Red accent on Power key
  const redStripeGeom = new THREE.BoxGeometry(0.08, buttonHeight * 0.75, buttonLength * 0.75);
  const redStripeMesh = new THREE.Mesh(redStripeGeom, materials.buttonAccent);
  redStripeMesh.position.set(flankX + buttonDepth - 0.04, -3.0, -5.8);
  group.add(redStripeMesh);

  // Back key (at 4H, Z = +5.8 mm)
  const btmBtnGeom = new THREE.BoxGeometry(buttonDepth, buttonHeight, buttonLength);
  const btmBtnMesh = new THREE.Mesh(btmBtnGeom, materials.caseAluminum);
  btmBtnMesh.position.set(flankX + buttonDepth / 2, -3.0, 5.8);
  btmBtnMesh.castShadow = true;
  group.add(btmBtnMesh);

  return {
    group,
    displayMesh,
    glassMesh,
    spec: GALAXY_WATCH_5_40MM_SPEC
  };
}
