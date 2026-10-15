import React from 'react';
import type { LightingPreset, ViewMode } from '../types';

interface ControlsBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  lightingPreset: LightingPreset;
  onLightingChange: (preset: LightingPreset) => void;
  realSize: boolean;
  onToggleRealSize: () => void;
}

const VIEW_OPTIONS: Array<{ id: ViewMode; label: string; icon: React.ReactNode }> = [
  {
    id: 'watch',
    label: 'Watch',
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
    icon: (
      <>
        <path d="M2 9h6l2-2h4l2 2h6" />
        <path d="M2 15h6l2 2h4l2-2h6" />
        <rect x="9" y="8.5" width="6" height="7" rx="2" />
      </>
    ),
  },
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
}) => {
  return (
    <div className="controls-dock">
      <div className="segmented-bar" role="radiogroup" aria-label="View mode">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`segmented-btn ${viewMode === opt.id ? 'active' : ''}`}
            onClick={() => onViewModeChange(opt.id)}
            role="radio"
            aria-checked={viewMode === opt.id}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {opt.icon}
            </svg>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="segmented-bar" role="radiogroup" aria-label="Lighting">
        {LIGHT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`segmented-btn ${lightingPreset === opt.id ? 'active' : ''}`}
            onClick={() => onLightingChange(opt.id)}
            role="radio"
            aria-checked={lightingPreset === opt.id}
            title={opt.title}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {opt.icon}
            </svg>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="segmented-bar real-size-bar">
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
      </div>
    </div>
  );
};
