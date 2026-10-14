import * as THREE from 'three';
import type { DeviceModelResult, DeviceSpec } from './types';
import type { WatchMaterials } from './materials';

export const PIXEL_WATCH_1_SPEC: DeviceSpec = {
  id: 'pixel-watch-1-41mm',
  name: 'Google Pixel Watch',
  generation: 'Pixel Watch · 1st gen · 41 mm (2022)',
  releaseYear: 2022,
  caseDiameterMm: 41.0,
  caseHeightMm: 41.0,
  caseThicknessMm: 12.3, // confirmed official total thickness including sensor dome
  displayDiameterMm: 33.5, // Calibrated active display diameter for proportional UI preview
  resolutionPx: { width: 450, height: 450 },
  bezelRadialWidthMm: 3.75, // Sleek, organic curved pebble border (41.0 - 33.5) / 2
  glassType: 'domed-pebble-glass',
  caseMaterialName: 'Polished Stainless Steel (Silver)',
  confirmedSources: [
    'Google Store Tech Specs (2022 Pixel Watch 1st Gen)',
    'Google Support Hardware Specifications (41 mm diameter, 12.3 mm height, 36g)',
    'iFixit Hardware Teardown (Custom 3D Corning Gorilla Glass 5, AMOLED)'
  ],
  notes: 'First-generation 2022 model. Distinct continuous 3D domed pebble glass curving seamlessly into polished stainless steel bucket. Proportional sleek curved bezel beneath glass. Rotating crown at 3H, flush button at 2H. Lugless band attachment.'
};

/**
 * Builds high-fidelity procedural 3D model of Google Pixel Watch 1st gen (41 mm).
 * Features:
 * - Continuous 3D domed Corning Gorilla Glass 5 pebble
 * - Proportional 33.5 mm active display plateau
 * - Curvature-matched downward bezel substrate
 * - Mirror-polished stainless steel bottom bowl
 * - Tactile fluted digital crown at 3H and flush side key at 2H
 */
export function buildPixelWatch1Model(materials: WatchMaterials): DeviceModelResult {
  const group = new THREE.Group();
  group.name = 'pixel-watch-1-41mm';

  const caseRadius = 20.5; // 41.0 mm diameter
  const screenRadius = 16.75; // 33.5 mm display
  const totalHeight = 12.3;
  const apexY = 1.3;
  const equatorY = -1.4;

  // 1. ACTIVE DISPLAY MESH
  // Sits flat at the apex plateau of the dome
  const displayGeometry = new THREE.CircleGeometry(screenRadius, 96);
  displayGeometry.rotateX(-Math.PI / 2);
  const displayMesh = new THREE.Mesh(displayGeometry, materials.displayEmpty.clone());
  displayMesh.name = 'displayMesh';
  displayMesh.position.set(0, apexY - 0.04, 0);
  displayMesh.receiveShadow = false;
  group.add(displayMesh);

  // 2. CURVED BEZEL SUBSTRATE (Glossy black OLED border flowing down with dome)
  const bezelPoints: THREE.Vector2[] = [];
  const bezelSteps = 24;
  for (let i = 0; i <= bezelSteps; i++) {
    const t = i / bezelSteps;
    const r = screenRadius + t * (caseRadius - 0.15 - screenRadius);
    const y = (apexY - 0.05) - Math.pow(t, 1.8) * (apexY - equatorY - 0.05);
    bezelPoints.push(new THREE.Vector2(r, y));
  }
  const bezelGeometry = new THREE.LatheGeometry(bezelPoints, 96);
  const bezelMesh = new THREE.Mesh(bezelGeometry, materials.bezelSubstrate);
  group.add(bezelMesh);

  // 3. CONTINUOUS 3D DOMED PEBBLE GLASS
  // Custom 3D Corning Gorilla Glass 5 that rolls seamlessly down past the equator
  const domePoints: THREE.Vector2[] = [];
  const domeSteps = 36;

  for (let i = 0; i <= domeSteps; i++) {
    const t = i / domeSteps;
    const angle = t * (Math.PI / 2);
    const r = caseRadius * Math.sin(angle);
    // Smooth super-elliptical dome profile
    const y = apexY * Math.cos(angle * 0.95) + (equatorY * Math.pow(t, 2.2));
    domePoints.push(new THREE.Vector2(Math.max(0.001, r), y));
  }

  const domeGeometry = new THREE.LatheGeometry(domePoints, 96);
  const glassMesh = new THREE.Mesh(domeGeometry, materials.glassDomedPebble.clone());
  glassMesh.name = 'glassMesh';
  glassMesh.castShadow = false;
  glassMesh.receiveShadow = false;
  group.add(glassMesh);

  // 4. POLISHED STAINLESS STEEL BOTTOM BOWL
  const bowlPoints: THREE.Vector2[] = [];
  const bowlSteps = 24;
  const sensorDomeBaseY = -totalHeight + 2.5;

  for (let i = 0; i <= bowlSteps; i++) {
    const t = i / bowlSteps;
    const r = caseRadius * Math.cos(t * Math.PI * 0.35);
    const y = equatorY - (t * (Math.abs(sensorDomeBaseY - equatorY)));
    bowlPoints.push(new THREE.Vector2(Math.max(12.0, r), y));
  }
  bowlPoints.push(new THREE.Vector2(12.0, sensorDomeBaseY));

  const bowlGeometry = new THREE.LatheGeometry(bowlPoints, 96);
  const bowlMesh = new THREE.Mesh(bowlGeometry, materials.caseStainlessSteel);
  bowlMesh.castShadow = true;
  bowlMesh.receiveShadow = true;
  group.add(bowlMesh);

  // 5. REAR SENSOR DOME
  const sensorGeom = new THREE.SphereGeometry(12.0, 48, 20, 0, Math.PI * 2, 0, Math.PI * 0.35);
  sensorGeom.rotateX(Math.PI);
  const sensorMesh = new THREE.Mesh(sensorGeom, materials.sensorCeramic);
  sensorMesh.position.set(0, sensorDomeBaseY + 1.2, 0);
  group.add(sensorMesh);

  // Optical sensor window
  const sensorWindowGeom = new THREE.CircleGeometry(3.5, 32);
  sensorWindowGeom.rotateX(Math.PI / 2);
  const sensorWindowMesh = new THREE.Mesh(sensorWindowGeom, materials.bezelSubstrate);
  sensorWindowMesh.position.set(0, -totalHeight + 0.1, 0);
  group.add(sensorWindowMesh);

  // 6. ROTATING DIGITAL CROWN (3 o'clock, +X at Z = 0)
  const crownRadius = 2.3;
  const crownLength = 1.6;
  const crownGeom = new THREE.CylinderGeometry(crownRadius, crownRadius, crownLength, 32);
  crownGeom.rotateZ(Math.PI / 2);
  const crownMesh = new THREE.Mesh(crownGeom, materials.crownKnurled);
  crownMesh.position.set(caseRadius + crownLength / 2 - 0.2, equatorY + 0.2, 0);
  crownMesh.castShadow = true;
  group.add(crownMesh);

  // Fluted cap on crown end
  const crownCapGeom = new THREE.SphereGeometry(crownRadius * 0.95, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.3);
  crownCapGeom.rotateZ(-Math.PI / 2);
  const crownCapMesh = new THREE.Mesh(crownCapGeom, materials.caseStainlessSteel);
  crownCapMesh.position.set(caseRadius + crownLength - 0.2, equatorY + 0.2, 0);
  group.add(crownCapMesh);

  // 7. FLUSH SIDE BUTTON (2 o'clock, +X at Z = -7.0 mm)
  const buttonAngle = -0.38;
  const btnX = Math.cos(buttonAngle) * caseRadius;
  const btnZ = Math.sin(buttonAngle) * caseRadius;
  const sideBtnGeom = new THREE.BoxGeometry(0.6, 1.3, 4.2);
  const sideBtnMesh = new THREE.Mesh(sideBtnGeom, materials.caseStainlessSteel);
  sideBtnMesh.position.set(btnX - 0.1, equatorY + 0.4, btnZ);
  sideBtnMesh.rotation.y = -buttonAngle;
  group.add(sideBtnMesh);

  // 8. LUGLESS BAND ATTACHMENT & STRAP (Curving naturally)
  function createLuglessStrap(isNorth: boolean) {
    const sign = isNorth ? -1 : 1;
    const strapWidth = 19.5;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, equatorY - 0.4, sign * (caseRadius - 0.5)),
      new THREE.Vector3(0, -4.0, sign * (caseRadius + 2.5)),
      new THREE.Vector3(0, -9.5, sign * (caseRadius + 6.0)),
      new THREE.Vector3(0, -18.0, sign * (caseRadius + 5.0)),
      new THREE.Vector3(0, -25.0, sign * (caseRadius + 2.0))
    ]);

    const strapGeom = new THREE.TubeGeometry(curve, 32, 1.3, 16, false);
    strapGeom.scale(strapWidth / 2.6, 1, 1);
    const strapMesh = new THREE.Mesh(strapGeom, materials.strapSilicone);
    strapMesh.castShadow = true;
    strapMesh.receiveShadow = true;
    group.add(strapMesh);
  }
  createLuglessStrap(true);  // North (12H)
  createLuglessStrap(false); // South (6H)

  return {
    group,
    displayMesh,
    glassMesh,
    spec: PIXEL_WATCH_1_SPEC
  };
}
