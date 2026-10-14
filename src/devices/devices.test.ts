import { describe, it, expect } from 'vitest';
import { DEVICE_LIST, DEFAULT_DEVICE_ID, getDeviceSpec, buildDevice } from './index';
import { createWatchMaterials } from './materials';

describe('Device Catalogue & Profiles', () => {
  it('strictly enforces two distinct devices for MVP', () => {
    expect(DEVICE_LIST).toHaveLength(2);
    const ids = DEVICE_LIST.map((d) => d.id);
    expect(ids).toEqual(['galaxy-watch-5-44mm', 'pixel-watch-1-41mm']);
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
