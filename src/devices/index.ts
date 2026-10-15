import type { DeviceFamilyGroup, DeviceId, DeviceSpec } from '../types';
import type { DeviceEntry, DeviceModelResult } from './types';
import type { WatchMaterials } from './materials';
import {
  PIXEL_WATCH_1_SPEC,
  PIXEL_WATCH_3_41_SPEC,
  PIXEL_WATCH_3_45_SPEC,
  buildPixelWatch1Model,
  buildPixelWatch3_41Model,
  buildPixelWatch3_45Model,
  buildPixelWatchModel,
} from './pixelWatch';
import {
  GALAXY_WATCH_7_40_SPEC,
  GALAXY_WATCH_7_44_SPEC,
  GALAXY_WATCH_5_40_SPEC,
  GALAXY_WATCH_6_CLASSIC_43_SPEC,
  GALAXY_WATCH_6_CLASSIC_47_SPEC,
  GALAXY_WATCH_ULTRA_47_SPEC,
  GALAXY_WATCH_5_SPEC,
  GALAXY_WATCH_6_44_SPEC,
  buildGalaxyWatch7_40Model,
  buildGalaxyWatch7_44Model,
  buildGalaxyWatch5_40Model,
  buildGalaxyWatch6Classic43Model,
  buildGalaxyWatch6Classic47Model,
  buildGalaxyWatchUltraModel,
  buildGalaxyWatch5Model,
  buildGalaxyWatch6Model,
} from './galaxyWatch';
import {
  ONEPLUS_WATCH_2_SPEC,
  TICWATCH_PRO_5_SPEC,
  buildOnePlusWatch2Model,
  buildTicWatchPro5Model,
} from './oemWatches';

export {
  PIXEL_WATCH_1_SPEC,
  PIXEL_WATCH_3_41_SPEC,
  PIXEL_WATCH_3_45_SPEC,
  GALAXY_WATCH_7_40_SPEC,
  GALAXY_WATCH_7_44_SPEC,
  GALAXY_WATCH_5_40_SPEC,
  GALAXY_WATCH_6_CLASSIC_43_SPEC,
  GALAXY_WATCH_6_CLASSIC_47_SPEC,
  GALAXY_WATCH_ULTRA_47_SPEC,
  GALAXY_WATCH_5_SPEC,
  GALAXY_WATCH_6_44_SPEC,
  buildPixelWatchModel,
  ONEPLUS_WATCH_2_SPEC,
  TICWATCH_PRO_5_SPEC,
};

export const DEFAULT_DEVICE_ID: DeviceId = 'galaxy-watch-7-44';

export interface DeviceGroup {
  id: DeviceFamilyGroup;
  name: string;
  devices: DeviceSpec[];
}

export const DEVICE_GROUPS: DeviceGroup[] = [
  {
    id: 'google-pixel',
    name: 'Google Pixel Watch',
    devices: [PIXEL_WATCH_1_SPEC, PIXEL_WATCH_3_41_SPEC, PIXEL_WATCH_3_45_SPEC],
  },
  {
    id: 'galaxy-modern',
    name: 'Samsung Galaxy Watch (Modern Flat)',
    devices: [GALAXY_WATCH_7_40_SPEC, GALAXY_WATCH_7_44_SPEC, GALAXY_WATCH_5_40_SPEC],
  },
  {
    id: 'galaxy-classic-ultra',
    name: 'Samsung Galaxy Watch (Classic & Ultra)',
    devices: [GALAXY_WATCH_6_CLASSIC_43_SPEC, GALAXY_WATCH_6_CLASSIC_47_SPEC, GALAXY_WATCH_ULTRA_47_SPEC],
  },
  {
    id: 'oneplus-mobvoi',
    name: 'OnePlus & Mobvoi',
    devices: [ONEPLUS_WATCH_2_SPEC, TICWATCH_PRO_5_SPEC],
  },
];

/** Flat display order of all primary registered devices. */
export const DEVICE_LIST: DeviceSpec[] = DEVICE_GROUPS.flatMap((group) => group.devices);

export const DEVICE_ENTRIES: Record<DeviceId, DeviceEntry> = {
  // Google Pixel Watch
  'pixel-watch-41': { spec: PIXEL_WATCH_1_SPEC, createModel: buildPixelWatch1Model },
  'pixel-watch-3-41': { spec: PIXEL_WATCH_3_41_SPEC, createModel: buildPixelWatch3_41Model },
  'pixel-watch-3-45': { spec: PIXEL_WATCH_3_45_SPEC, createModel: buildPixelWatch3_45Model },

  // Samsung Galaxy Watch (Modern Flat)
  'galaxy-watch-7-40': { spec: GALAXY_WATCH_7_40_SPEC, createModel: buildGalaxyWatch7_40Model },
  'galaxy-watch-7-44': { spec: GALAXY_WATCH_7_44_SPEC, createModel: buildGalaxyWatch7_44Model },
  'galaxy-watch-5-40': { spec: GALAXY_WATCH_5_40_SPEC, createModel: buildGalaxyWatch5_40Model },

  // Samsung Galaxy Watch (Classic & Ultra)
  'galaxy-watch-6-classic-43': { spec: GALAXY_WATCH_6_CLASSIC_43_SPEC, createModel: buildGalaxyWatch6Classic43Model },
  'galaxy-watch-6-classic-47': { spec: GALAXY_WATCH_6_CLASSIC_47_SPEC, createModel: buildGalaxyWatch6Classic47Model },
  'galaxy-watch-ultra-47': { spec: GALAXY_WATCH_ULTRA_47_SPEC, createModel: buildGalaxyWatchUltraModel },

  // OnePlus & Mobvoi
  'oneplus-watch-2-46': { spec: ONEPLUS_WATCH_2_SPEC, createModel: buildOnePlusWatch2Model },
  'ticwatch-pro-5-48': { spec: TICWATCH_PRO_5_SPEC, createModel: buildTicWatchPro5Model },

  // Legacy ID aliases for backwards compatibility
  'galaxy-watch-5-44mm': { spec: GALAXY_WATCH_5_SPEC, createModel: buildGalaxyWatch5Model },
  'galaxy-watch-5-40mm': { spec: GALAXY_WATCH_5_40_SPEC, createModel: buildGalaxyWatch5_40Model },
  'galaxy-watch-6-44mm': { spec: GALAXY_WATCH_6_44_SPEC, createModel: buildGalaxyWatch6Model },
  'pixel-watch-1-41mm': { spec: PIXEL_WATCH_1_SPEC, createModel: buildPixelWatch1Model },
};

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
