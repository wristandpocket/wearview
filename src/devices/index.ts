import type { DeviceFamilyGroup, DeviceId, DeviceSpec } from '../types';
import type { DeviceEntry, DeviceModelResult } from './types';
import type { WatchMaterials } from './materials';
import {
  PIXEL_WATCH_1_SPEC,
  PIXEL_WATCH_3_41_SPEC,
  PIXEL_WATCH_3_45_SPEC,
  PIXEL_WATCH_4_41_SPEC,
  PIXEL_WATCH_4_45_SPEC,
  buildPixelWatch1Model,
  buildPixelWatch3_41Model,
  buildPixelWatch3_45Model,
  buildPixelWatch4_41Model,
  buildPixelWatch4_45Model,
  buildPixelWatchModel,
} from './pixelWatch';
import {
  GALAXY_WATCH_7_40_SPEC,
  GALAXY_WATCH_7_44_SPEC,
  GALAXY_WATCH_6_40_SPEC,
  GALAXY_WATCH_6_44_SPEC,
  GALAXY_WATCH_5_40_SPEC,
  GALAXY_WATCH_5_44_SPEC,
  GALAXY_WATCH_8_CLASSIC_46_SPEC,
  GALAXY_WATCH_6_CLASSIC_43_SPEC,
  GALAXY_WATCH_6_CLASSIC_47_SPEC,
  GALAXY_WATCH_5_PRO_45_SPEC,
  GALAXY_WATCH_4_CLASSIC_46_SPEC,
  GALAXY_WATCH_ULTRA_47_SPEC,
  GALAXY_WATCH_5_SPEC,
  buildGalaxyWatch7_40Model,
  buildGalaxyWatch7_44Model,
  buildGalaxyWatch6_40Model,
  buildGalaxyWatch6_44Model,
  buildGalaxyWatch5_40Model,
  buildGalaxyWatch5_44Model,
  buildGalaxyWatch8ClassicModel,
  buildGalaxyWatch6Classic43Model,
  buildGalaxyWatch6Classic47Model,
  buildGalaxyWatch5ProModel,
  buildGalaxyWatch4Classic46Model,
  buildGalaxyWatchUltraModel,
  buildGalaxyWatch5Model,
  buildGalaxyWatch6Model,
} from './galaxyWatch';
import {
  ONEPLUS_WATCH_3_SPEC,
  ONEPLUS_WATCH_2_SPEC,
  XIAOMI_WATCH_2_PRO_SPEC,
  TICWATCH_PRO_5_SPEC,
  buildOnePlusWatch3Model,
  buildOnePlusWatch2Model,
  buildXiaomiWatch2ProModel,
  buildTicWatchPro5Model,
} from './oemWatches';

export {
  PIXEL_WATCH_1_SPEC,
  PIXEL_WATCH_3_41_SPEC,
  PIXEL_WATCH_3_45_SPEC,
  PIXEL_WATCH_4_41_SPEC,
  PIXEL_WATCH_4_45_SPEC,
  GALAXY_WATCH_7_40_SPEC,
  GALAXY_WATCH_7_44_SPEC,
  GALAXY_WATCH_6_40_SPEC,
  GALAXY_WATCH_6_44_SPEC,
  GALAXY_WATCH_5_40_SPEC,
  GALAXY_WATCH_5_44_SPEC,
  GALAXY_WATCH_8_CLASSIC_46_SPEC,
  GALAXY_WATCH_6_CLASSIC_43_SPEC,
  GALAXY_WATCH_6_CLASSIC_47_SPEC,
  GALAXY_WATCH_5_PRO_45_SPEC,
  GALAXY_WATCH_4_CLASSIC_46_SPEC,
  GALAXY_WATCH_ULTRA_47_SPEC,
  GALAXY_WATCH_5_SPEC,
  buildPixelWatchModel,
  ONEPLUS_WATCH_3_SPEC,
  ONEPLUS_WATCH_2_SPEC,
  XIAOMI_WATCH_2_PRO_SPEC,
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
    devices: [
      PIXEL_WATCH_1_SPEC,
      PIXEL_WATCH_3_41_SPEC,
      PIXEL_WATCH_3_45_SPEC,
      PIXEL_WATCH_4_41_SPEC,
      PIXEL_WATCH_4_45_SPEC,
    ],
  },
  {
    id: 'galaxy-modern',
    name: 'Samsung Galaxy Watch (Modern Flat)',
    devices: [
      GALAXY_WATCH_7_40_SPEC,
      GALAXY_WATCH_7_44_SPEC,
      GALAXY_WATCH_6_40_SPEC,
      GALAXY_WATCH_6_44_SPEC,
      GALAXY_WATCH_5_40_SPEC,
      GALAXY_WATCH_5_44_SPEC,
    ],
  },
  {
    id: 'galaxy-classic-ultra',
    name: 'Samsung Galaxy Watch (Classic, Pro & Ultra)',
    devices: [
      GALAXY_WATCH_8_CLASSIC_46_SPEC,
      GALAXY_WATCH_6_CLASSIC_43_SPEC,
      GALAXY_WATCH_6_CLASSIC_47_SPEC,
      GALAXY_WATCH_5_PRO_45_SPEC,
      GALAXY_WATCH_4_CLASSIC_46_SPEC,
      GALAXY_WATCH_ULTRA_47_SPEC,
    ],
  },
  {
    id: 'oneplus-mobvoi',
    name: 'OnePlus, Xiaomi & Mobvoi',
    devices: [
      ONEPLUS_WATCH_3_SPEC,
      ONEPLUS_WATCH_2_SPEC,
      XIAOMI_WATCH_2_PRO_SPEC,
      TICWATCH_PRO_5_SPEC,
    ],
  },
];

/** Flat display order of all primary registered devices (21 total). */
export const DEVICE_LIST: DeviceSpec[] = DEVICE_GROUPS.flatMap((group) => group.devices);

export const DEVICE_ENTRIES: Record<DeviceId, DeviceEntry> = {
  // Google Pixel Watch
  'pixel-watch-41': { spec: PIXEL_WATCH_1_SPEC, createModel: buildPixelWatch1Model },
  'pixel-watch-3-41': { spec: PIXEL_WATCH_3_41_SPEC, createModel: buildPixelWatch3_41Model },
  'pixel-watch-3-45': { spec: PIXEL_WATCH_3_45_SPEC, createModel: buildPixelWatch3_45Model },
  'pixel-watch-4-41': { spec: PIXEL_WATCH_4_41_SPEC, createModel: buildPixelWatch4_41Model },
  'pixel-watch-4-45': { spec: PIXEL_WATCH_4_45_SPEC, createModel: buildPixelWatch4_45Model },

  // Samsung Galaxy Watch (Modern Flat)
  'galaxy-watch-7-40': { spec: GALAXY_WATCH_7_40_SPEC, createModel: buildGalaxyWatch7_40Model },
  'galaxy-watch-7-44': { spec: GALAXY_WATCH_7_44_SPEC, createModel: buildGalaxyWatch7_44Model },
  'galaxy-watch-6-40': { spec: GALAXY_WATCH_6_40_SPEC, createModel: buildGalaxyWatch6_40Model },
  'galaxy-watch-6-44': { spec: GALAXY_WATCH_6_44_SPEC, createModel: buildGalaxyWatch6_44Model },
  'galaxy-watch-5-40': { spec: GALAXY_WATCH_5_40_SPEC, createModel: buildGalaxyWatch5_40Model },
  'galaxy-watch-5-44': { spec: GALAXY_WATCH_5_44_SPEC, createModel: buildGalaxyWatch5_44Model },

  // Samsung Galaxy Watch (Classic, Pro & Ultra)
  'galaxy-watch-8-classic-46': { spec: GALAXY_WATCH_8_CLASSIC_46_SPEC, createModel: buildGalaxyWatch8ClassicModel },
  'galaxy-watch-6-classic-43': { spec: GALAXY_WATCH_6_CLASSIC_43_SPEC, createModel: buildGalaxyWatch6Classic43Model },
  'galaxy-watch-6-classic-47': { spec: GALAXY_WATCH_6_CLASSIC_47_SPEC, createModel: buildGalaxyWatch6Classic47Model },
  'galaxy-watch-5-pro-45': { spec: GALAXY_WATCH_5_PRO_45_SPEC, createModel: buildGalaxyWatch5ProModel },
  'galaxy-watch-4-classic-46': { spec: GALAXY_WATCH_4_CLASSIC_46_SPEC, createModel: buildGalaxyWatch4Classic46Model },
  'galaxy-watch-ultra-47': { spec: GALAXY_WATCH_ULTRA_47_SPEC, createModel: buildGalaxyWatchUltraModel },

  // OnePlus, Xiaomi & Mobvoi
  'oneplus-watch-3-46': { spec: ONEPLUS_WATCH_3_SPEC, createModel: buildOnePlusWatch3Model },
  'oneplus-watch-2-46': { spec: ONEPLUS_WATCH_2_SPEC, createModel: buildOnePlusWatch2Model },
  'xiaomi-watch-2-pro-46': { spec: XIAOMI_WATCH_2_PRO_SPEC, createModel: buildXiaomiWatch2ProModel },
  'ticwatch-pro-5-48': { spec: TICWATCH_PRO_5_SPEC, createModel: buildTicWatchPro5Model },

  // Legacy ID aliases for backwards compatibility
  'galaxy-watch-5-44mm': { spec: GALAXY_WATCH_5_SPEC, createModel: buildGalaxyWatch5Model },
  'galaxy-watch-5-40mm': { spec: GALAXY_WATCH_5_40_SPEC, createModel: buildGalaxyWatch5_40Model },
  'galaxy-watch-6-44mm': { spec: GALAXY_WATCH_6_44_SPEC, createModel: buildGalaxyWatch6Model },
  'pixel-watch-1-41mm': { spec: PIXEL_WATCH_1_SPEC, createModel: buildPixelWatch1Model },
};

export const LEGACY_TO_CANONICAL_DEVICE_ID: Record<string, DeviceId> = {
  'galaxy-watch-5-44mm': 'galaxy-watch-5-44',
  'galaxy-watch-5-40mm': 'galaxy-watch-5-40',
  'galaxy-watch-6-44mm': 'galaxy-watch-6-44',
  'pixel-watch-1-41mm': 'pixel-watch-41',
};

export function normalizeDeviceId(id: string): DeviceId {
  if (id in LEGACY_TO_CANONICAL_DEVICE_ID) {
    return LEGACY_TO_CANONICAL_DEVICE_ID[id];
  }
  if (id in DEVICE_ENTRIES) {
    return id as DeviceId;
  }
  return DEFAULT_DEVICE_ID;
}

export function getDeviceSpec(id: DeviceId | string): DeviceSpec {
  const entry = DEVICE_ENTRIES[id as DeviceId];
  if (entry) {
    return entry.spec;
  }
  const canonicalId = normalizeDeviceId(id);
  const canonicalEntry = DEVICE_ENTRIES[canonicalId];
  if (canonicalEntry) {
    return canonicalEntry.spec;
  }
  throw new Error(`Device profile with id "${id}" not found.`);
}

export const getDeviceById = getDeviceSpec;

export function buildDevice(id: DeviceId | string, materials: WatchMaterials): DeviceModelResult {
  const entry = DEVICE_ENTRIES[id as DeviceId] ?? DEVICE_ENTRIES[normalizeDeviceId(id)];
  if (!entry) {
    throw new Error(`Unsupported device model "${id}".`);
  }
  return entry.createModel(materials);
}

/**
 * Calculates frontal case body area (mm²) taking into account unique archetypal silhouettes.
 */
export function calculateFrontalBodyArea(spec: DeviceSpec): number {
  const W = spec.caseDiameterMm;
  const H = spec.caseHeightMm;
  switch (spec.archetype) {
    case 'squircle-cushion-ultra': {
      // Rounded rectangle area: W * H - (4 - PI) * r^2 where corner radius r ≈ 14mm
      const r = Math.min(14, W / 2, H / 2);
      return W * H - (4 - Math.PI) * r * r;
    }
    case 'asymmetric-chrono': {
      // Base circle area from vertical diameter + right-side ergonomic flank bulge
      const baseR = H / 2;
      const baseArea = Math.PI * baseR * baseR;
      const bulgeWidth = Math.max(0, W - H);
      // Half-ellipse bulge over height H
      const bulgeArea = 0.5 * Math.PI * baseR * (bulgeWidth > 0 ? bulgeWidth : 2.8);
      return baseArea + bulgeArea;
    }
    case 'rugged-tactical':
    case 'classic-rotating-bezel':
    case 'flat-minimalist':
    case 'domed-pebble':
    default:
      return Math.PI * (W / 2) * (H / 2);
  }
}

/**
 * Calculates accurate physical screen-to-body percentage coverage.
 */
export function calculateScreenToBodyRatio(spec: DeviceSpec): number {
  const screenArea = Math.PI * Math.pow(spec.activeDisplayDiameterMm / 2, 2);
  const bodyArea = calculateFrontalBodyArea(spec);
  if (bodyArea <= 0) return 0;
  return Math.min(100, Math.max(0, (screenArea / bodyArea) * 100));
}
