import type { DeviceId, LightingPreset, ViewMode } from '../types';
import type { PixelMode } from '../textures/screenTexture';
import { DEVICE_LIST, normalizeDeviceId } from '../devices';

/**
 * View settings that can be shared as a link. Screenshots are never part of the URL:
 * images stay on the machine that loaded them.
 */
export interface ShareableState {
  device: DeviceId;
  compareDevice: DeviceId | null;
  lighting: LightingPreset;
  viewMode: ViewMode;
  safeZones: boolean;
  pixelMode: PixelMode;
}

const LIGHTING: readonly LightingPreset[] = ['studio', 'sunlight', 'night'];
const KNOWN_IDS = new Set<string>(DEVICE_LIST.map((d) => d.id));

function parseDevice(value: string | null): DeviceId | null {
  if (!value) return null;
  const id = normalizeDeviceId(value);
  return KNOWN_IDS.has(id) ? id : null;
}

/** Reads `#d=…&c=…&l=…&v=…&sz=1&px=native`; unknown or missing keys fall back to `defaults`. */
export function parseHash(hash: string, defaults: ShareableState): ShareableState {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const lighting = params.get('l');
  return {
    device: parseDevice(params.get('d')) ?? defaults.device,
    compareDevice: params.has('c') ? parseDevice(params.get('c')) : defaults.compareDevice,
    lighting: LIGHTING.includes(lighting as LightingPreset) ? (lighting as LightingPreset) : defaults.lighting,
    viewMode: params.get('v') === 'wrist' ? 'wrist' : params.get('v') === 'watch' ? 'watch' : defaults.viewMode,
    safeZones: params.has('sz') ? params.get('sz') === '1' : defaults.safeZones,
    pixelMode: params.get('px') === 'native' ? 'native' : params.get('px') === 'smooth' ? 'smooth' : defaults.pixelMode,
  };
}

/** Compact hash; default values are omitted so plain links stay short. */
export function toHash(state: ShareableState): string {
  const params = new URLSearchParams();
  params.set('d', state.device);
  if (state.compareDevice) params.set('c', state.compareDevice);
  if (state.lighting !== 'studio') params.set('l', state.lighting);
  if (state.viewMode !== 'watch') params.set('v', state.viewMode);
  if (state.safeZones) params.set('sz', '1');
  if (state.pixelMode !== 'smooth') params.set('px', state.pixelMode);
  return `#${params.toString()}`;
}
