import * as THREE from 'three';
import type { DeviceModelResult, DeviceSpec } from './types';
import type { WatchMaterials } from './materials';

export const GALAXY_WATCH_5_SPEC: DeviceSpec = {
  id: 'galaxy-watch-5-44mm',
  name: 'Samsung Galaxy Watch5',
  generation: 'Galaxy Watch5 · 44 mm',
  releaseYear: 2022,
  caseDiameterMm: 44.4,
  caseHeightMm: 43.3,
  caseThicknessMm: 9.8,
  displayDiameterMm: 34.6,
  resolutionPx: { width: 450, height: 450 },
  bezelRadialWidthMm: 4.9, // (44.4 - 34.6) / 2
  glassType: 'flat-sapphire-rim',
  caseMaterialName: 'Armor Aluminum (Graphite)',
  confirmedSources: [
    'https://www.samsung.com/uk/business/watches/galaxy-watch/galaxy-watch5-44mm-graphite-lte-sm-r915fzaaeua/',
    'Samsung Developer Documentation (450x450 Super AMOLED, 321 ppi)'
  ],
  notes: 'Confirmed 44.4x43.3x9.8 mm case body, 1.4" (34.6 mm) display, 450x450 px. Flat sapphire crystal with raised aluminum rim, dual pill buttons, 20 mm lugs. No mechanical rotating bezel.'
};

export function buildGalaxyWatch5Model(materials: WatchMaterials): DeviceModelResult {
  const group = new THREE.Group();
  group.name = 'galaxy-watch-5-44mm';

  const screenRadius = 17.3; // 34.6 mm diameter
  const innerRimRadius = 21.3;
  const outerCaseRadiusX = 22.2; // 44.4 mm width
  const outerCaseRadiusZ = 21.65; // 43.3 mm height
  const caseDepth = 9.8;

  // 1. ACTIVE DISPLAY MESH
  // Placed at Y = 0.05, perfectly unobstructed and visible
  const displayGeometry = new THREE.CircleGeometry(screenRadius, 64);
  displayGeometry.rotateX(-Math.PI / 2);
  const displayMesh = new THREE.Mesh(displayGeometry, materials.displayEmpty.clone());
  displayMesh.name = 'displayMesh';
  displayMesh.position.set(0, 0.05, 0);
  displayMesh.receiveShadow = false;
  group.add(displayMesh);

  // 2. INNER DARK BEZEL RING (Between active display and case rim)
  const bezelGeometry = new THREE.RingGeometry(screenRadius, innerRimRadius, 64);
  bezelGeometry.rotateX(-Math.PI / 2);
  const bezelMesh = new THREE.Mesh(bezelGeometry, materials.bezelTexturedRing);
  bezelMesh.position.set(0, 0.04, 0);
  group.add(bezelMesh);

  // 3. FLAT SAPPHIRE GLASS DISC
  const glassGeometry = new THREE.CylinderGeometry(innerRimRadius, innerRimRadius, 0.08, 64);
  const glassMesh = new THREE.Mesh(glassGeometry, materials.glassSapphire.clone());
  glassMesh.name = 'glassMesh';
  glassMesh.position.set(0, 0.12, 0);
  group.add(glassMesh);

  // 4. PROTECTIVE RAISED ALUMINUM RIM
  // A slim raised metal lip (0.7 mm wide, raised 0.35 mm above glass)
  const rimShape = new THREE.Shape();
  rimShape.absarc(0, 0, outerCaseRadiusX * 0.98, 0, Math.PI * 2, false);
  const rimHole = new THREE.Path();
  rimHole.absarc(0, 0, innerRimRadius, 0, Math.PI * 2, true);
  rimShape.holes.push(rimHole);

  const rimExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.45,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.1,
    bevelThickness: 0.1
  };
  const rimGeometry = new THREE.ExtrudeGeometry(rimShape, rimExtrudeSettings);
  rimGeometry.rotateX(Math.PI / 2);
  const rimMesh = new THREE.Mesh(rimGeometry, materials.caseAluminum);
  rimMesh.position.set(0, 0.32, 0);
  rimMesh.castShadow = true;
  group.add(rimMesh);

  // 5. MAIN ALUMINUM CASE BODY (HOLLOW RING WITH OPEN SCREEN CENTER)
  // Squircle profile (44.4 mm X, 43.3 mm Z) with a large center cutout so the display is never obscured
  const caseShape = new THREE.Shape();
  const segments = 64;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.cos(theta) * outerCaseRadiusX;
    const z = Math.sin(theta) * outerCaseRadiusZ;
    if (i === 0) caseShape.moveTo(x, z);
    else caseShape.lineTo(x, z);
  }
  // CRITICAL: Cut out the display center hole
  const caseCenterHole = new THREE.Path();
  caseCenterHole.absarc(0, 0, innerRimRadius, 0, Math.PI * 2, true);
  caseShape.holes.push(caseCenterHole);

  const caseExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: caseDepth - 0.4,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.5,
    bevelThickness: 0.4
  };
  const caseGeometry = new THREE.ExtrudeGeometry(caseShape, caseExtrudeSettings);
  caseGeometry.rotateX(Math.PI / 2);
  const caseMesh = new THREE.Mesh(caseGeometry, materials.caseAluminum);
  caseMesh.position.set(0, 0.0, 0);
  caseMesh.castShadow = true;
  caseMesh.receiveShadow = true;
  group.add(caseMesh);

  // 6. REAR BIOACTIVE SENSOR DOME
  const sensorBase = new THREE.CylinderGeometry(15, 17, 1.8, 48);
  const sensorBaseMesh = new THREE.Mesh(sensorBase, materials.sensorCeramic);
  sensorBaseMesh.position.set(0, -caseDepth - 0.9, 0);
  group.add(sensorBaseMesh);

  const sensorDome = new THREE.SphereGeometry(14, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.35);
  sensorDome.rotateX(Math.PI);
  const sensorDomeMesh = new THREE.Mesh(sensorDome, materials.sensorCeramic);
  sensorDomeMesh.position.set(0, -caseDepth - 1.2, 0);
  group.add(sensorDomeMesh);

  // Sensor optical LED center window
  const sensorWindow = new THREE.CircleGeometry(4.5, 32);
  sensorWindow.rotateX(Math.PI / 2);
  const sensorWindowMesh = new THREE.Mesh(sensorWindow, materials.bezelSubstrate);
  sensorWindowMesh.position.set(0, -caseDepth - 2.8, 0);
  group.add(sensorWindowMesh);

  // 7. SIDE BUTTONS (Right side, +X)
  // Sleek, pill-shaped buttons
  const buttonLength = 7.0;
  const buttonHeight = 1.8;
  const buttonDepth = 1.2;

  // Top Button (Home / Power button at 2H, Z = -7.5 mm)
  const topButtonGeom = new THREE.BoxGeometry(buttonDepth, buttonHeight, buttonLength);
  const topButtonMesh = new THREE.Mesh(topButtonGeom, materials.caseAluminum);
  topButtonMesh.position.set(outerCaseRadiusX + buttonDepth / 2 - 0.2, -3.2, -7.5);
  topButtonMesh.castShadow = true;
  group.add(topButtonMesh);

  // Red accent on Power key
  const accentGeom = new THREE.BoxGeometry(0.12, buttonHeight * 0.8, buttonLength * 0.8);
  const accentMesh = new THREE.Mesh(accentGeom, materials.buttonAccent);
  accentMesh.position.set(outerCaseRadiusX + buttonDepth - 0.1, -3.2, -7.5);
  group.add(accentMesh);

  // Bottom Button (Back button at 4H, Z = +7.5 mm)
  const bottomButtonGeom = new THREE.BoxGeometry(buttonDepth, buttonHeight, buttonLength);
  const bottomButtonMesh = new THREE.Mesh(bottomButtonGeom, materials.caseAluminum);
  bottomButtonMesh.position.set(outerCaseRadiusX + buttonDepth / 2 - 0.2, -3.2, 7.5);
  bottomButtonMesh.castShadow = true;
  group.add(bottomButtonMesh);

  // Mic hole
  const micGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 16);
  micGeom.rotateZ(Math.PI / 2);
  const micMesh = new THREE.Mesh(micGeom, materials.bezelSubstrate);
  micMesh.position.set(outerCaseRadiusX + 0.1, -3.2, 0);
  group.add(micMesh);

  // 8. SCULPTED INTEGRATED LUGS (20 mm inner gap, flowing organically into body)
  const lugGapHalf = 10.0;
  const lugThickness = 2.4;
  const lugReach = 4.8;

  function createSculptedLugs(isNorth: boolean) {
    const sign = isNorth ? -1 : 1;
    const zBase = sign * outerCaseRadiusZ * 0.94;

    [-1, 1].forEach((side) => {
      // Create tapered organic horn
      const lugShape = new THREE.Shape();
      lugShape.moveTo(-lugThickness / 2, 0);
      lugShape.lineTo(lugThickness / 2, 0);
      lugShape.lineTo(lugThickness * 0.35, -lugReach);
      lugShape.lineTo(-lugThickness * 0.35, -lugReach);
      lugShape.closePath();

      const lugExtrude = new THREE.ExtrudeGeometry(lugShape, {
        depth: 3.8,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.3,
        bevelThickness: 0.3
      });
      // Align horizontally
      lugExtrude.rotateY(sign * Math.PI / 2);

      const lug = new THREE.Mesh(lugExtrude, materials.caseAluminum);
      lug.position.set(
        side * (lugGapHalf + lugThickness / 2),
        -4.2,
        zBase + sign * 0.8
      );
      lug.castShadow = true;
      group.add(lug);
    });
  }
  createSculptedLugs(true);  // North (12H)
  createSculptedLugs(false); // South (6H)

  // 9. STRAP SEGMENTS (Realistic dark silicone band wrapping toward wrist)
  function createStrapSegment(isNorth: boolean) {
    const sign = isNorth ? -1 : 1;
    const strapWidth = 19.8;
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, -4.5, sign * (outerCaseRadiusZ + 1.2)),
      new THREE.Vector3(0, -10.5, sign * (outerCaseRadiusZ + 6.5)),
      new THREE.Vector3(0, -22.0, sign * (outerCaseRadiusZ + 3.0))
    );
    const strapGeom = new THREE.TubeGeometry(curve, 20, 1.4, 12, false);
    strapGeom.scale(strapWidth / 2.8, 1, 1);
    const strapMesh = new THREE.Mesh(strapGeom, materials.strapSilicone);
    strapMesh.castShadow = true;
    strapMesh.receiveShadow = true;
    group.add(strapMesh);
  }
  createStrapSegment(true);
  createStrapSegment(false);

  return {
    group,
    displayMesh,
    glassMesh,
    spec: GALAXY_WATCH_5_SPEC
  };
}
