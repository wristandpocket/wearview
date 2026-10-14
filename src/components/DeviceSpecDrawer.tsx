import React from 'react';
import type { DeviceSpec } from '../types';

interface DeviceSpecDrawerProps {
  spec: DeviceSpec;
}

export const DeviceSpecDrawer: React.FC<DeviceSpecDrawerProps> = ({ spec }) => {
  return (
    <div className="device-spec-drawer">
      <div className="section-label">
        <span>Hardware Specs</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>Verified</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Display</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {spec.displayDiameterMm} mm ({spec.resolutionPx.width}×{spec.resolutionPx.height})
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Case</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {spec.caseDiameterMm} × {spec.caseHeightMm} × {spec.caseThicknessMm} mm
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Bezel Border</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
            ~{spec.bezelRadialWidthMm} mm
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Front Glass</span>
          <span style={{ color: 'var(--text-secondary)', textAlign: 'right', maxWidth: '170px' }}>
            {spec.glassType === 'flat-sapphire-rim' ? 'Flat Sapphire Crystal' : '3D Domed Gorilla Glass 5'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-tertiary)' }}>Chassis</span>
          <span style={{ color: 'var(--text-secondary)', textAlign: 'right', maxWidth: '170px' }}>
            {spec.caseMaterialName}
          </span>
        </div>
      </div>

      <p className="hint-text" style={{ marginTop: '0.625rem', fontSize: '0.72rem' }}>
        {spec.notes}
      </p>
    </div>
  );
};

