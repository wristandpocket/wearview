import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  DEVICE_LIST,
  DEVICE_GROUPS,
  DEFAULT_DEVICE_ID,
  getDeviceSpec,
  buildDevice,
  normalizeDeviceId,
  calculateFrontalBodyArea,
  calculateScreenToBodyRatio,
} from './index';
import { createWatchMaterials } from './materials';
import { buildWristModel } from '../wrist/wristModel';
import {
  buildSafeZoneOverlay,
  computeRealSizeCameraDistance,
  computeCameraPresetPose,
} from '../viewer/ThreeViewer';

describe('Device Catalogue & Profiles', () => {
  it('lists all 11 registered top Wear OS devices grouped logically', () => {
    const ids = DEVICE_LIST.map((d) => d.id);
    expect(ids).toHaveLength(11);
    expect(ids).toEqual([
      'pixel-watch-41',
      'pixel-watch-3-41',
      'pixel-watch-3-45',
      'galaxy-watch-7-40',
      'galaxy-watch-7-44',
      'galaxy-watch-5-40',
      'galaxy-watch-6-classic-43',
      'galaxy-watch-6-classic-47',
      'galaxy-watch-ultra-47',
      'oneplus-watch-2-46',
      'ticwatch-pro-5-48',
    ]);
    expect(DEVICE_GROUPS).toHaveLength(4);
    expect(new Set(DEVICE_LIST.map((d) => d.shortLabel)).size).toBe(ids.length);
  });

  it('every device has valid 1:1 physical millimeter dimensions (activeDisplayDiameterMm < caseDiameterMm)', () => {
    for (const spec of DEVICE_LIST) {
      expect(spec.activeDisplayDiameterMm).toBeLessThan(spec.caseDiameterMm);
      expect(spec.displayDiameterMm).toBe(spec.activeDisplayDiameterMm);
      expect(spec.caseDiameterMm).toBeGreaterThanOrEqual(40.0);
      expect(spec.caseThicknessMm).toBeGreaterThanOrEqual(9.0);
      expect(spec.bezelRadialWidthMm).toBeGreaterThan(0);
      expect(spec.lugWidthMm).toBeGreaterThanOrEqual(20.0);
      expect(spec.confirmedSources.length).toBeGreaterThan(0);
    }
  });

  it('every device has valid resolution and PPI math', () => {
    for (const spec of DEVICE_LIST) {
      expect(spec.resolutionPx.width).toBeGreaterThanOrEqual(384);
      expect(spec.resolutionPx.height).toBe(spec.resolutionPx.width);
      const calculatedPpi = Math.round((spec.resolutionPx.width * 25.4) / spec.activeDisplayDiameterMm);
      expect(Math.abs(calculatedPpi - spec.ppi)).toBeLessThanOrEqual(5);
    }
  });

  it('every device builds a 3D model with expected named meshes (screen, case, glass, bezel, crown/buttons)', () => {
    const materials = createWatchMaterials();
    for (const spec of DEVICE_LIST) {
      const model = buildDevice(spec.id, materials);
      expect(model.group).toBeDefined();
      expect(model.group.children.length).toBeGreaterThan(0);

      // Verify required named meshes exist in the model group
      const screen = model.group.getObjectByName('screen');
      expect(screen, `${spec.id} missing screen mesh`).toBeDefined();

      const caseMesh = model.group.getObjectByName('case');
      expect(caseMesh, `${spec.id} missing case mesh`).toBeDefined();

      const glassMesh = model.group.getObjectByName('glass');
      expect(glassMesh, `${spec.id} missing glass mesh`).toBeDefined();

      const bezelMesh = model.group.getObjectByName('bezel');
      expect(bezelMesh, `${spec.id} missing bezel mesh`).toBeDefined();

      // Models with crowns must have crown mesh
      if (
        spec.archetype === 'domed-pebble' ||
        spec.archetype === 'asymmetric-chrono' ||
        spec.archetype === 'rugged-tactical' ||
        spec.archetype === 'squircle-cushion-ultra'
      ) {
        const crownMesh = model.group.getObjectByName('crown');
        expect(crownMesh, `${spec.id} missing crown mesh`).toBeDefined();
      }

      // Display dimensions fit inside case
      model.displayMesh.geometry.computeBoundingSphere();
      const displayR = model.displayMesh.geometry.boundingSphere!.radius;
      expect(displayR).toBeCloseTo(spec.activeDisplayDiameterMm / 2, 1);
      expect(displayR).toBeLessThan(spec.caseHeightMm / 2);
      expect(model.backY).toBeLessThan(-spec.caseThicknessMm + 2.5);
    }
  });

  it('resolves the default device cleanly', () => {
    expect(DEFAULT_DEVICE_ID).toBe('galaxy-watch-7-44');
    const spec = getDeviceSpec(DEFAULT_DEVICE_ID);
    expect(spec.name).toBe('Samsung Galaxy Watch7 (44mm)');
    expect(spec.caseDiameterMm).toBe(44.4);
    expect(spec.activeDisplayDiameterMm).toBeCloseTo(37.34, 2);
  });

  it('supports legacy device ID aliases for backward compatibility', () => {
    const materials = createWatchMaterials();

    const gw5Alias = getDeviceSpec('galaxy-watch-5-44mm');
    expect(gw5Alias).toBeDefined();
    const gw5Model = buildDevice('galaxy-watch-5-44mm', materials);
    expect(gw5Model.group).toBeDefined();

    const pw1Alias = getDeviceSpec('pixel-watch-1-41mm');
    expect(pw1Alias).toBeDefined();
    const pw1Model = buildDevice('pixel-watch-1-41mm', materials);
    expect(pw1Model.group).toBeDefined();

    const gw5_40Alias = getDeviceSpec('galaxy-watch-5-40mm');
    expect(gw5_40Alias).toBeDefined();

    const gw6_44Alias = getDeviceSpec('galaxy-watch-6-44mm');
    expect(gw6_44Alias).toBeDefined();
  });

  it('normalizes legacy device IDs to canonical IDs and unknown IDs to default', () => {
    expect(normalizeDeviceId('galaxy-watch-5-44mm')).toBe('galaxy-watch-7-44');
    expect(normalizeDeviceId('galaxy-watch-5-40mm')).toBe('galaxy-watch-5-40');
    expect(normalizeDeviceId('galaxy-watch-6-44mm')).toBe('galaxy-watch-7-44');
    expect(normalizeDeviceId('pixel-watch-1-41mm')).toBe('pixel-watch-41');
    expect(normalizeDeviceId('pixel-watch-3-45')).toBe('pixel-watch-3-45');
    expect(normalizeDeviceId('unknown-device-xyz')).toBe(DEFAULT_DEVICE_ID);
  });

  it('computes archetype-aware screen-to-body ratios', () => {
    const ultra = getDeviceSpec('galaxy-watch-ultra-47');
    const ultraArea = calculateFrontalBodyArea(ultra);
    const ultraRatio = calculateScreenToBodyRatio(ultra);
    // Cushion squircle area is ~2078 mm^2 vs circular 1764 mm^2
    expect(ultraArea).toBeGreaterThan(Math.PI * Math.pow(ultra.caseDiameterMm / 2, 2));
    expect(ultraRatio).toBeGreaterThan(50);
    expect(ultraRatio).toBeLessThan(55);

    const gw7_44 = getDeviceSpec('galaxy-watch-7-44');
    const gw7Ratio = calculateScreenToBodyRatio(gw7_44);
    // Minimalist circular watch has high coverage (~70.7%)
    expect(gw7Ratio).toBeGreaterThan(68);
    expect(gw7Ratio).toBeLessThan(73);

    const oneplus = getDeviceSpec('oneplus-watch-2-46');
    const oneplusArea = calculateFrontalBodyArea(oneplus);
    expect(oneplusArea).toBeGreaterThan(Math.PI * Math.pow(oneplus.caseHeightMm / 2, 2));
  });

  it('every device model has >= 0.08mm vertical separation and ordered render layers', () => {
    const materials = createWatchMaterials();
    for (const spec of DEVICE_LIST) {
      const model = buildDevice(spec.id, materials);
      const screen = model.displayMesh;
      const glass = model.glassMesh;
      const bezel = model.group.getObjectByName('bezel') as THREE.Mesh | undefined;

      expect(glass.renderOrder).toBe(10);
      expect(screen.renderOrder).toBe(2);
      if (bezel) {
        expect(bezel.renderOrder).toBe(1);
      }

      screen.updateWorldMatrix(true, false);
      glass.updateWorldMatrix(true, false);
      const screenWorld = new THREE.Vector3();
      screen.getWorldPosition(screenWorld);

      if (spec.archetype === 'domed-pebble') {
        // Domed glass reaches apex at y = 2.2mm, screen is at y = 1.10mm
        expect(screenWorld.y).toBeGreaterThanOrEqual(1.08);
      } else {
        const glassWorld = new THREE.Vector3();
        glass.getWorldPosition(glassWorld);
        expect(glassWorld.y - screenWorld.y).toBeGreaterThanOrEqual(0.08);
      }
    }
  });

  it('wristModel fitToWatch dynamically offsets based on watchBackY', () => {
    const materials = createWatchMaterials();
    const wrist = buildWristModel(materials);
    wrist.fitToWatch(-10.1); // Pixel Watch (thin back)
    const pwWristY = wrist.group.position.y;
    wrist.fitToWatch(-13.7); // Galaxy Watch Ultra / TicWatch (deep back)
    const ultraWristY = wrist.group.position.y;
    expect(pwWristY).toBeGreaterThan(ultraWristY);
    expect(pwWristY - ultraWristY).toBeCloseTo(3.6, 1);
  });

  it('Galaxy Watch Ultra 47mm has squircle-cushion-ultra archetype with titanium body and orange button', () => {
    const ultra = getDeviceSpec('galaxy-watch-ultra-47');
    expect(ultra.archetype).toBe('squircle-cushion-ultra');
    expect(ultra.caseDiameterMm).toBe(47.4);
    expect(ultra.activeDisplayDiameterMm).toBe(37.34);
    expect(ultra.caseMaterialName).toContain('Titanium');

    const materials = createWatchMaterials();
    const model = buildDevice('galaxy-watch-ultra-47', materials);
    expect(model.group.getObjectByName('crown')).toBeDefined(); // Orange Quick Button
    expect(model.group.getObjectByName('case')).toBeDefined();
    expect(model.group.getObjectByName('bezel')).toBeDefined();
  });

  it('OnePlus Watch 2 has asymmetric-chrono archetype and TicWatch Pro 5 has rugged-tactical archetype', () => {
    const oneplus = getDeviceSpec('oneplus-watch-2-46');
    expect(oneplus.archetype).toBe('asymmetric-chrono');
    expect(oneplus.activeDisplayDiameterMm).toBe(36.32);

    const ticwatch = getDeviceSpec('ticwatch-pro-5-48');
    expect(ticwatch.archetype).toBe('rugged-tactical');
    expect(ticwatch.caseDiameterMm).toBe(50.1);
    expect(ticwatch.lugWidthMm).toBe(24.0);
  });

  it('for every device model, screen world Y is strictly greater than any central case body top surface Y coordinate (screenY > caseDialFloorY)', () => {
    const materials = createWatchMaterials();
    for (const spec of DEVICE_LIST) {
      const model = buildDevice(spec.id, materials);
      const screen = model.displayMesh;
      const caseMesh = model.group.getObjectByName('case') as THREE.Mesh;
      expect(caseMesh, `${spec.id} missing case mesh`).toBeDefined();

      screen.updateWorldMatrix(true, false);
      caseMesh.updateWorldMatrix(true, false);

      const screenWorld = new THREE.Vector3();
      screen.getWorldPosition(screenWorld);

      const pos = caseMesh.geometry.attributes.position;
      const v = new THREE.Vector3();
      let maxCaseYInsideDial = -Infinity;
      const dialRadius = spec.activeDisplayDiameterMm / 2 - 0.2;

      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        v.applyMatrix4(caseMesh.matrixWorld);
        const r = Math.hypot(v.x, v.z);
        if (r <= dialRadius) {
          if (v.y > maxCaseYInsideDial) {
            maxCaseYInsideDial = v.y;
          }
        }
      }

      // If the case geometry has solid vertices inside the central dial,
      // it must terminate at y <= screenY - 0.35 mm (strictly below screen, preventing occlusion)
      if (maxCaseYInsideDial > -Infinity) {
        expect(screenWorld.y, `${spec.id}: screen must be higher than case body top inside dial`).toBeGreaterThan(
          maxCaseYInsideDial
        );
        expect(
          screenWorld.y - maxCaseYInsideDial,
          `${spec.id}: vertical clearance between screen and case body`
        ).toBeGreaterThanOrEqual(0.30);
      }
    }
  });

  it('buildSafeZoneOverlay generates crisp RingGeometry and PlaneGeometry meshes at displayY + 0.08mm with renderOrder 5', () => {
    const screenRadius = 18.0;
    const displayY = 0.5;
    const overlay = buildSafeZoneOverlay(screenRadius, displayY);

    expect(overlay.position.y).toBeCloseTo(displayY + 0.08, 0.001);

    const rings: THREE.Mesh[] = [];
    const ticks: THREE.Mesh[] = [];

    overlay.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        expect(child.renderOrder).toBe(5);
        const mat = child.material as THREE.MeshBasicMaterial;
        expect(mat.depthWrite).toBe(false);
        if (child.geometry instanceof THREE.RingGeometry) {
          rings.push(child);
        } else if (child.geometry instanceof THREE.PlaneGeometry) {
          ticks.push(child);
        }
      }
    });

    // Ring pairs (backing + foreground) for 100%, 90%, 80%
    expect(rings.length).toBeGreaterThanOrEqual(6);
    // 24 ticks with backing + foreground planes
    expect(ticks.length).toBeGreaterThanOrEqual(48);
  });

  it('camera preset angles strictly preserve calibrated 1:1 camera distance to displayPlaneTarget', () => {
    const target = new THREE.Vector3(0, 0, 0);
    const heightCss = 800;
    const vFovDeg = 8;
    const pxPerMm = 3.78; // 96 DPI calibrated

    const calibratedDist = computeRealSizeCameraDistance(heightCss, vFovDeg, pxPerMm);
    expect(calibratedDist).toBeGreaterThan(100);

    const front = computeCameraPresetPose(target, 'front', calibratedDist);
    const tilt = computeCameraPresetPose(target, 'tilt', calibratedDist);
    const side = computeCameraPresetPose(target, 'side', calibratedDist);

    expect(front.position.distanceTo(target)).toBeCloseTo(calibratedDist, 0.01);
    expect(tilt.position.distanceTo(target)).toBeCloseTo(calibratedDist, 0.01);
    expect(side.position.distanceTo(target)).toBeCloseTo(calibratedDist, 0.01);

    // Directions must reflect their respective preset angles
    expect(front.dir.y).toBeCloseTo(1.0, 0.01);
    expect(tilt.dir.y).toBeCloseTo(Math.cos((35 * Math.PI) / 180), 0.01);
    expect(side.dir.y).toBeCloseTo(Math.sin(((90 - 75) * Math.PI) / 180), 0.01);
  });
});
