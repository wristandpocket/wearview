export type DeviceId =
  | 'pixel-watch-41'
  | 'pixel-watch-3-41'
  | 'pixel-watch-3-45'
  | 'galaxy-watch-7-40'
  | 'galaxy-watch-7-44'
  | 'galaxy-watch-5-40'
  | 'galaxy-watch-6-classic-43'
  | 'galaxy-watch-6-classic-47'
  | 'galaxy-watch-ultra-47'
  | 'oneplus-watch-2-46'
  | 'ticwatch-pro-5-48'
  // Legacy aliases for backwards compatibility
  | 'galaxy-watch-5-44mm'
  | 'galaxy-watch-5-40mm'
  | 'galaxy-watch-6-44mm'
  | 'pixel-watch-1-41mm';

export type DeviceArchetype =
  | 'domed-pebble'
  | 'flat-minimalist'
  | 'classic-rotating-bezel'
  | 'squircle-cushion-ultra'
  | 'asymmetric-chrono'
  | 'rugged-tactical';

export type DeviceFamilyGroup =
  | 'google-pixel'
  | 'galaxy-modern'
  | 'galaxy-classic-ultra'
  | 'oneplus-mobvoi';

export type GlassType =
  | 'flat-sapphire-rim'
  | 'domed-pebble-glass'
  | 'classic-sunken-sapphire'
  | 'cushion-sunken-sapphire'
  | '2.5d-sapphire';

export type LightingPreset = 'studio' | 'sunlight' | 'night';

export type ViewMode = 'watch' | 'wrist';

export interface DeviceSpec {
  id: DeviceId;
  name: string;
  generation: string;
  shortLabel: string;
  familyGroup: DeviceFamilyGroup;
  releaseYear: number;
  caseDiameterMm: number;
  caseHeightMm: number;
  caseThicknessMm: number; // excluding rear sensor dome
  displayDiameterMm: number;
  activeDisplayDiameterMm: number; // exact 1:1 physical alias
  resolutionPx: { width: number; height: number };
  ppi: number;
  bezelRadialWidthMm: number;
  lugWidthMm: number;
  lugToLugMm?: number;
  archetype: DeviceArchetype;
  glassType: GlassType;
  caseMaterialName: string;
  confirmedSources: string[];
  notes: string;
}
