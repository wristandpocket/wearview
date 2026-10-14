import React from 'react';
import type { DeviceId } from '../types';

interface HeaderProps {
  selectedDeviceId: DeviceId;
  onSelectDevice: (id: DeviceId) => void;
  onResetCamera: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDeviceId,
  onSelectDevice,
  onResetCamera
}) => {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo" title="WearView 3D Preview">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="7" />
            <polyline points="12 9 12 12 13.5 13.5" />
            <path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83" />
          </svg>
        </div>
        <div className="brand-title">
          <span>WearView</span>
          <span className="brand-badge">MVP</span>
        </div>
        <div className="privacy-pill" title="All screenshot textures and files remain strictly inside your browser memory. No backend or telemetry.">
          <span className="privacy-dot"></span>
          <span>Local-Only</span>
        </div>
      </div>

      <div className="header-actions">
        <div className="device-select-container" role="radiogroup" aria-label="Wear OS Device Selection">
          <button
            type="button"
            className={`device-select-btn ${selectedDeviceId === 'galaxy-watch-5-44mm' ? 'active' : ''}`}
            onClick={() => onSelectDevice('galaxy-watch-5-44mm')}
            role="radio"
            aria-checked={selectedDeviceId === 'galaxy-watch-5-44mm'}
          >
            Galaxy Watch5 · 44 mm
          </button>
          <button
            type="button"
            className={`device-select-btn ${selectedDeviceId === 'pixel-watch-1-41mm' ? 'active' : ''}`}
            onClick={() => onSelectDevice('pixel-watch-1-41mm')}
            role="radio"
            aria-checked={selectedDeviceId === 'pixel-watch-1-41mm'}
          >
            Pixel Watch · 1st gen · 41 mm
          </button>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={onResetCamera}
          title="Reset camera to default three-quarter angle"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          <span>Reset View</span>
        </button>
      </div>
    </header>
  );
};
