import type { DeviceId, DeviceSpec } from '../types';
import type { DeviceEntry, DeviceModelResult } from './types';
import type { WatchMaterials } from './materials';
import { GALAXY_WATCH_5_SPEC, buildGalaxyWatch5Model } from './galaxyWatch5';
import { PIXEL_WATCH_1_SPEC, buildPixelWatch1Model } from './pixelWatch1';

export const DEFAULT_DEVICE_ID: DeviceId = 'galaxy-watch-5-44mm';

export const DEVICE_ENTRIES: Record<DeviceId, DeviceEntry> = {
  'galaxy-watch-5-44mm': {
    spec: GALAXY_WATCH_5_SPEC,
    createModel: (materials: WatchMaterials) => buildGalaxyWatch5Model(materials)
  },
  'pixel-watch-1-41mm': {
    spec: PIXEL_WATCH_1_SPEC,
    createModel: (materials: WatchMaterials) => buildPixelWatch1Model(materials)
  }
};

export const DEVICE_LIST: DeviceSpec[] = [
  GALAXY_WATCH_5_SPEC,
  PIXEL_WATCH_1_SPEC
];

export function getDeviceSpec(id: DeviceId): DeviceSpec {
  const entry = DEVICE_ENTRIES[id];
  if (!entry) {
    throw new Error(`Device profile with id "${id}" not found.`);
  }
  return entry.spec;
}

export function buildDevice(id: DeviceId, materials: WatchMaterials): DeviceModelResult {
  const entry = DEVICE_ENTRIES[id];
  if (!entry) {
    throw new Error(`Unsupported device model "${id}".`);
  }
  return entry.createModel(materials);
}
