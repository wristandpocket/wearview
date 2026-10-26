import React from 'react';
import type { LightingPreset, ViewMode } from '../types';

export type CameraPreset = 'front' | 'tilt' | 'side';

interface ControlsBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  lightingPreset: LightingPreset;
  onLightingChange: (preset: LightingPreset) => void;
  realSize: boolean;
  onToggleRealSize: () => void;
  safeZones: boolean;
  onToggleSafeZones: () => void;
  onSelectCameraAngle?: (angle: CameraPreset) => void;
  nativePixels: boolean;
  onToggleNativePixels: () => void;
  compare: boolean;
  onToggleCompare: () => void;
  fingerPad?: boolean;
  onToggleFingerPad?: () => void;
  glancing?: boolean;
  onStartGlance?: () => void;
  onOpenAod?: () => void;
}

const VIEW_OPTIONS: Array<{ id: ViewMode; label: string; title: string; icon: React.ReactNode }> = [
  {
    id: 'watch',
    label: 'Watch',
    title: 'Watch view [W]',
    icon: (
      <>
        <circle cx="12" cy="12" r="7" />
        <path d="M12 9v3l1.5 1.5" />
      </>
    ),
  },
  {
    id: 'wrist',
    label: 'On wrist',
    title: 'On wrist view [W]',
    icon: (
      <>
        <path d="M2 9h6l2-2h4l2 2h6" />
        <path d="M2 15h6l2 2h4l2-2h6" />
        <rect x="9" y="8.5" width="6" height="7" rx="2" />
      </>
    ),
  },
];

const CAMERA_PRESETS: Array<{ id: CameraPreset; label: string; title: string }> = [
  { id: 'front', label: 'Front 0°', title: 'Perpendicular top-down view (0°) [1]' },
  { id: 'tilt', label: 'Tilt 35°', title: 'Natural wrist-glance viewing angle (35°) [2]' },
  { id: 'side', label: 'Side 75°', title: 'Grazing angle to inspect dome curvature & case thickness (75°) [3]' },
];

const LIGHT_OPTIONS: Array<{ id: LightingPreset; label: string; title: string; icon: React.ReactNode }> = [
  {
    id: 'studio',
    label: 'Studio',
    title: 'Neutral studio lighting',
    icon: (
      <>
        <rect x="4" y="4" width="16" height="12" rx="2" />
        <path d="M12 16v4M8 20h8" />
      </>
    ),
  },
  {
    id: 'sunlight',
    label: 'Sunlight',
    title: 'Bright outdoor sun: strong highlights and glare on the glass',
    icon: (
      <>
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
      </>
    ),
  },
  {
    id: 'night',
    label: 'Night',
    title: 'Dark surroundings: screen brightness dominates',
    icon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  },
];

export const ControlsBar: React.FC<ControlsBarProps> = ({
  viewMode,
  onViewModeChange,
  lightingPreset,
  onLightingChange,
  realSize,
  onToggleRealSize,
  safeZones,
  onToggleSafeZones,
  onSelectCameraAngle,
  nativePixels,
  onToggleNativePixels,
  compare,
  onToggleCompare,
  fingerPad = false,
  onToggleFingerPad,
  glancing = false,
  onStartGlance,
  onOpenAod,
}) => {
  return (
    <div className="controls-dock">
      <div className="segmented-bar" role="group" aria-label="View mode">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`segmented-btn ${viewMode === opt.id ? 'active' : ''}`}
            onClick={() => onViewModeChange(opt.id)}
            aria-pressed={viewMode === opt.id}
            title={opt.title}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {opt.icon}
            </svg>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {onSelectCameraAngle && (
        <div className="segmented-bar" role="group" aria-label="Camera presets">
          {CAMERA_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="segmented-btn"
              onClick={() => onSelectCameraAngle(preset.id)}
              title={preset.title}
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="segmented-bar" role="group" aria-label="Lighting">
        {LIGHT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`segmented-btn ${lightingPreset === opt.id ? 'active' : ''}`}
            onClick={() => onLightingChange(opt.id)}
            aria-pressed={lightingPreset === opt.id}
            title={opt.title}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {opt.icon}
            </svg>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="segmented-bar" role="group" aria-label="Inspection tools">
        <button
          type="button"
          className={`segmented-btn ${nativePixels ? 'active accent' : ''}`}
          onClick={onToggleNativePixels}
          aria-pressed={nativePixels}
          title="Show the screen at the watch's real pixel resolution with crisp pixels, like on the device [N]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <span>Native px</span>
        </button>
        <button
          type="button"
          className={`segmented-btn ${compare ? 'active accent' : ''}`}
          onClick={onToggleCompare}
          aria-pressed={compare}
          title="Compare two watches side by side; cameras stay in sync [C]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="7" cy="12" r="4.5" />
            <circle cx="17" cy="12" r="4.5" />
          </svg>
          <span>Compare</span>
        </button>
        <button
          type="button"
          className={`segmented-btn ${safeZones ? 'active accent' : ''}`}
          onClick={onToggleSafeZones}
          aria-pressed={safeZones}
          title="Toggle Wear OS Safe Zones (80% / 90% / 100% boundary overlay) [S]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" strokeDasharray="2 2" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <span>Safe Zones</span>
        </button>

        <button
          type="button"
          className={`segmented-btn ${realSize ? 'active accent' : ''}`}
          onClick={onToggleRealSize}
          aria-pressed={realSize}
          title="Show the watch at its real physical size on this screen (one-time card calibration)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="7" width="20" height="10" rx="2" />
            <path d="M6 7v3M10 7v4M14 7v3M18 7v4" />
          </svg>
          <span>1:1</span>
          <span className="real-size-label">Real size</span>
        </button>

        {onToggleFingerPad && (
          <button
            type="button"
            className={`segmented-btn ${fingerPad ? 'active accent' : ''}`}
            onClick={onToggleFingerPad}
            aria-pressed={fingerPad}
            title="Toggle 14 mm human fingertip contact pad overlay for physical touch target calibration"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2a3 3 0 0 0-3 3v8.5a1.5 1.5 0 0 1-3 0V9a1 1 0 0 0-2 0v5.5a6.5 6.5 0 0 0 13 0V5a3 3 0 0 0-3-3z" />
            </svg>
            <span>14mm Finger</span>
          </button>
        )}

        {onStartGlance && (
          <button
            type="button"
            className={`segmented-btn ${glancing ? 'active accent' : ''}`}
            onClick={onStartGlance}
            aria-pressed={glancing}
            disabled={glancing}
            title="2-Second Wrist Raise Glanceability Test: raises the watch to viewing angle for 2.0s to verify glanceability"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{glancing ? 'Glancing…' : '2s Glance'}</span>
          </button>
        )}

        {onOpenAod && (
          <button
            type="button"
            className="segmented-btn"
            onClick={onOpenAod}
            title="Always-On Display (AOD) & Ambient Burn-In Checker: inspects On-Pixel Ratio (OPR %)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <span>AOD / OPR</span>
          </button>
        )}

      </div>
    </div>
  );
};
