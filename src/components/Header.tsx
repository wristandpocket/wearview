import React from 'react';
import type { DeviceId } from '../types';
import { DEVICE_GROUPS, normalizeDeviceId } from '../devices';

interface HeaderProps {
  selectedDeviceId: DeviceId;
  onSelectDevice: (id: DeviceId) => void;
  onResetCamera: () => void;
  onShare: () => void;
  shareStatus: string | null;
}

export const DeviceOptions: React.FC = () => (
  <>
    {DEVICE_GROUPS.map((group) => (
      <optgroup key={group.id} label={group.name}>
        {group.devices.map((device) => (
          <option key={device.id} value={device.id}>
            {device.name} — {(device.activeDisplayDiameterMm / 25.4).toFixed(2)}&quot; • {device.resolutionPx.width}×{device.resolutionPx.height}
          </option>
        ))}
      </optgroup>
    ))}
  </>
);

export const Header: React.FC<HeaderProps> = ({ selectedDeviceId, onSelectDevice, onResetCamera, onShare, shareStatus }) => {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="7" />
            <polyline points="12 9 12 12 13.5 13.5" />
            <path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83" />
          </svg>
        </div>
        <div className="brand-title">
          <span>WearView</span>
        </div>
        <div className="privacy-pill" title="Screenshots never leave your browser. No backend, no telemetry.">
          <span className="privacy-dot"></span>
          <span>Local-only</span>
        </div>
      </div>

      <div className="device-dropdown-wrapper device-select">
        <label htmlFor="device-selector" className="device-dropdown-label">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="7" />
            <polyline points="12 9 12 12 13.5 13.5" />
            <path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83" />
          </svg>
          <span className="sr-only">Device</span>
        </label>
        <select
          id="device-selector"
          className="device-dropdown-select"
          value={normalizeDeviceId(selectedDeviceId)}
          onChange={(e) => onSelectDevice(normalizeDeviceId(e.target.value))}
          aria-label="Select smartwatch device"
        >
          <DeviceOptions />
        </select>
        <span className="device-dropdown-arrow" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      <button
        type="button"
        className="btn-secondary reset-btn"
        onClick={onShare}
        title="Copy a link to this view (device, compare, lighting, mode). Screenshots are not included."
        aria-label="Copy link to this view"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span className="reset-label" aria-live="polite">{shareStatus ?? 'Copy link'}</span>
      </button>

      <button
        type="button"
        className="btn-secondary reset-btn"
        onClick={onResetCamera}
        title="Reset camera view [R]"
        aria-label="Reset camera view"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        <span className="reset-label">Reset view</span>
      </button>
    </header>
  );
};
