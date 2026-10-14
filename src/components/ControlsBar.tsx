import React from 'react';
import type { LightingPreset, ViewMode } from '../types';

interface ControlsBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  lightingPreset: LightingPreset;
  onLightingChange: (preset: LightingPreset) => void;
  onLoadTestPattern: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  viewMode,
  onViewModeChange,
  lightingPreset,
  onLightingChange,
  onLoadTestPattern
}) => {
  return (
    <div className="floating-dock">
      {/* View Mode Switcher */}
      <div className="segmented-bar" role="radiogroup" aria-label="Viewing Mode">
        <button
          type="button"
          className={`segmented-btn ${viewMode === 'watch' ? 'active' : ''}`}
          onClick={() => onViewModeChange('watch')}
          role="radio"
          aria-checked={viewMode === 'watch'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="7" />
            <path d="M12 9v3l1.5 1.5" />
          </svg>
          <span>Watch</span>
        </button>
        <button
          type="button"
          className={`segmented-btn ${viewMode === 'wrist' ? 'active' : ''}`}
          onClick={() => onViewModeChange('wrist')}
          role="radio"
          aria-checked={viewMode === 'wrist'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
          <span>On wrist</span>
        </button>
      </div>

      {/* Lighting Preset Switcher */}
      <div className="segmented-bar" role="radiogroup" aria-label="Environment Lighting Preset">
        <button
          type="button"
          className={`segmented-btn ${lightingPreset === 'studio' ? 'active' : ''}`}
          onClick={() => onLightingChange('studio')}
          title="Studio: Neutral, balanced studio lighting with readable screen"
          role="radio"
          aria-checked={lightingPreset === 'studio'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41" />
          </svg>
          <span>Studio</span>
        </button>
        <button
          type="button"
          className={`segmented-btn ${lightingPreset === 'sunlight' ? 'active' : ''}`}
          onClick={() => onLightingChange('sunlight')}
          title="Sunlight: Bright directional sunlight with specular highlights and shadows"
          role="radio"
          aria-checked={lightingPreset === 'sunlight'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <span>Sunlight</span>
        </button>
        <button
          type="button"
          className={`segmented-btn ${lightingPreset === 'night' ? 'active' : ''}`}
          onClick={() => onLightingChange('night')}
          title="Night: Low-ambient atmosphere with cool cyan/violet rim lighting"
          role="radio"
          aria-checked={lightingPreset === 'night'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <span>Night</span>
        </button>
      </div>

      {/* Quick Test Pattern QA */}
      <button
        type="button"
        className="btn-secondary"
        onClick={onLoadTestPattern}
        title="Load local high-contrast test pattern with safe circles and edge markers"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>Test Pattern</span>
      </button>
    </div>
  );
};
