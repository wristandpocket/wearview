import { describe, it, expect } from 'vitest';
import { DEVICE_LIST, DEFAULT_DEVICE_ID, getDeviceSpec, buildDevice } from './index';
import { createWatchMaterials } from './materials';

describe('Device Catalogue & Profiles', () => {
  it('lists every registered device exactly once, in picker order', () => {
    const ids = DEVICE_LIST.map((d) => d.id);
    expect(ids).toEqual(['galaxy-watch-5-44mm', 'galaxy-watch-5-40mm', 'galaxy-watch-6-44mm', 'pixel-watch-1-41mm']);
    expect(new Set(DEVICE_LIST.map((d) => d.shortLabel)).size).toBe(ids.length);
  });

  it('every device builds a model whose display fits inside the case and glass', () => {
    const materials = createWatchMaterials();
    for (const spec of DEVICE_LIST) {
      const model = buildDevice(spec.id, materials);
      model.displayMesh.geometry.computeBoundingSphere();
      const displayR = model.displayMesh.geometry.boundingSphere!.radius;
      expect(displayR).toBeCloseTo(spec.displayDiameterMm / 2, 1);
      expect(displayR).toBeLessThan(spec.caseHeightMm / 2);
      expect(model.backY).toBeLessThan(-spec.caseThicknessMm + 2.3);
    }
  });

  it('Galaxy Watch5 40 mm and Watch6 44 mm carry their published specs', () => {
    const gw540 = getDeviceSpec('galaxy-watch-5-40mm');
    expect(gw540.displayDiameterMm).toBeCloseTo(30.4, 1);
    expect(gw540.resolutionPx).toEqual({ width: 396, height: 396 });
    const gw6 = getDeviceSpec('galaxy-watch-6-44mm');
    expect(gw6.displayDiameterMm).toBeCloseTo(37.3, 1);
    expect(gw6.resolutionPx).toEqual({ width: 480, height: 480 });
    expect(gw6.caseThicknessMm).toBe(9.0);
  });

  it('sets Samsung Galaxy Watch5 44 mm as default device', () => {
    expect(DEFAULT_DEVICE_ID).toBe('galaxy-watch-5-44mm');
  });

  it('Galaxy Watch5 44 mm has verified specs and proportions', () => {
    const gw5 = getDeviceSpec('galaxy-watch-5-44mm');
    expect(gw5.name).toBe('Samsung Galaxy Watch5');
    expect(gw5.caseDiameterMm).toBeCloseTo(44.4, 1);
    expect(gw5.displayDiameterMm).toBeCloseTo(34.6, 1);
    expect(gw5.resolutionPx).toEqual({ width: 450, height: 450 });
    expect(gw5.glassType).toBe('flat-sapphire-rim');
    expect(gw5.confirmedSources.length).toBeGreaterThan(0);
  });

  it('Pixel Watch 1st gen 41 mm has verified specs and proportions', () => {
    const pw1 = getDeviceSpec('pixel-watch-1-41mm');
    expect(pw1.name).toBe('Google Pixel Watch');
    expect(pw1.caseDiameterMm).toBe(41.0);
    expect(pw1.displayDiameterMm).toBeCloseTo(33.5, 1);
    expect(gw5DisplayLarger(pw1.displayDiameterMm)).toBe(true);
    expect(pw1.resolutionPx).toEqual({ width: 450, height: 450 });
    expect(pw1.glassType).toBe('domed-pebble-glass');
    expect(pw1.releaseYear).toBe(2022);
  });

  it('procedurally builds distinct 3D models with display and glass meshes', () => {
    const materials = createWatchMaterials();

    const gw5Model = buildDevice('galaxy-watch-5-44mm', materials);
    expect(gw5Model.group).toBeDefined();
    expect(gw5Model.displayMesh).toBeDefined();
    expect(gw5Model.glassMesh).toBeDefined();
    expect(gw5Model.spec.id).toBe('galaxy-watch-5-44mm');

    const pw1Model = buildDevice('pixel-watch-1-41mm', materials);
    expect(pw1Model.group).toBeDefined();
    expect(pw1Model.displayMesh).toBeDefined();
    expect(pw1Model.glassMesh).toBeDefined();
    expect(pw1Model.spec.id).toBe('pixel-watch-1-41mm');
  });
});

function gw5DisplayLarger(pixelWatchDisplayMm: number): boolean {
  const gw5 = getDeviceSpec('galaxy-watch-5-44mm');
  return gw5.displayDiameterMm > pixelWatchDisplayMm;
}
