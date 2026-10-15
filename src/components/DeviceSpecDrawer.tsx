import React from 'react';
import type { DeviceSpec } from '../types';

interface DeviceSpecDrawerProps {
  spec: DeviceSpec;
}

export const DeviceSpecDrawer: React.FC<DeviceSpecDrawerProps> = ({ spec }) => {
  const rows: Array<{ label: string; value: string; estimated?: boolean; mono?: boolean }> = [
    { label: 'Display', value: `${spec.displayDiameterMm} mm · ${spec.resolutionPx.width}×${spec.resolutionPx.height}`, mono: true },
    { label: 'Case', value: `${spec.caseDiameterMm} × ${spec.caseHeightMm} × ${spec.caseThicknessMm} mm`, mono: true },
    { label: 'Black border', value: `~${spec.bezelRadialWidthMm} mm`, estimated: true, mono: true },
    { label: 'Glass', value: spec.glassType === 'flat-sapphire-rim' ? 'Flat sapphire' : '3D domed Gorilla Glass 5' },
    { label: 'Case material', value: spec.caseMaterialName },
  ];

  return (
    <div className="spec-drawer">
      <div className="section-label">
        <span>Hardware</span>
        <span className="section-tag">~ = estimated</span>
      </div>
      <dl className="spec-table">
        {rows.map((row) => (
          <div className="spec-row" key={row.label}>
            <dt>{row.label}</dt>
            <dd className={`${row.mono ? 'mono' : ''} ${row.estimated ? 'estimated' : ''}`}>{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="hint-text">{spec.notes}</p>
    </div>
  );
};
