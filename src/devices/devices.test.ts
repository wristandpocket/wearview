import { describe, it, expect } from 'vitest';
import {
  DEVICE_LIST,
  DEVICE_GROUPS,
  DEFAULT_DEVICE_ID,
  getDeviceSpec,
  buildDevice,
} from './index';
import { createWatchMaterials } from './materials';

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
});
