import React from 'react';
import type { DeviceSpec } from '../types';

interface DeviceSpecDrawerProps {
  spec: DeviceSpec;
}

export const DeviceSpecDrawer: React.FC<DeviceSpecDrawerProps> = ({ spec }) => {
  return (
    <div className="device-spec-drawer">
      <div className="section-label">
        <span>Device Specifications</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>Research Verified</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '0.875rem' }}>
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Display Diameter</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {spec.displayDiameterMm} mm
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
            {spec.id === 'galaxy-watch-5-44mm' ? '1.4" Active Screen' : '1.2" Active Screen'}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Resolution</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {spec.resolutionPx.width} × {spec.resolutionPx.height}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
            {spec.id === 'galaxy-watch-5-44mm' ? '~321 ppi' : '~320 ppi'}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Case Body</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {spec.id === 'galaxy-watch-5-44mm' ? '44.4 × 43.3 mm' : '41.0 × 41.0 mm'}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
            {spec.caseThicknessMm} mm thickness
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Bezel Border</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
            ~{spec.bezelRadialWidthMm} mm
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
            {spec.id === 'galaxy-watch-5-44mm' ? 'Raised Metal Rim' : 'Hidden Under Dome'}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '2px' }}>Glass & Materials</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>
          <strong>{spec.glassType === 'flat-sapphire-rim' ? 'Flat Sapphire Crystal with Rim' : '3D Domed Corning Gorilla Glass 5'}</strong>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Chassis: {spec.caseMaterialName}
        </div>
      </div>

      <p className="hint-text">
        {spec.notes}
      </p>
    </div>
  );
};
