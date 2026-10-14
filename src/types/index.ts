export type DeviceId = 'galaxy-watch-5-44mm' | 'pixel-watch-1-41mm';

export type LightingPreset = 'studio' | 'sunlight' | 'night';

export type ViewMode = 'watch' | 'wrist';

export interface DeviceSpec {
  id: DeviceId;
  name: string;
  generation: string;
  releaseYear: number;
  caseDiameterMm: number;
  caseHeightMm: number;
  caseThicknessMm: number; // excluding rear sensor dome
  displayDiameterMm: number;
  resolutionPx: { width: number; height: number };
  bezelRadialWidthMm: number;
  glassType: 'flat-sapphire-rim' | 'domed-pebble-glass';
  caseMaterialName: string;
  confirmedSources: string[];
  notes: string;
}

export interface UploadedImageInfo {
  file: File;
  objectUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  texture: import('three').Texture;
}

export interface ViewerState {
  selectedDeviceId: DeviceId;
  viewMode: ViewMode;
  lightingPreset: LightingPreset;
  uploadedImage: UploadedImageInfo | null;
  isLoading: boolean;
  errorMessage: string | null;
}
