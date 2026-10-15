import React from 'react';
import type { DeviceSpec, GlassType } from '../types';
import { calculateScreenToBodyRatio } from '../devices';

interface DeviceSpecDrawerProps {
  spec: DeviceSpec;
}

const GLASS_LABELS: Record<GlassType, string> = {
  'flat-sapphire-rim': 'Flat sapphire crystal with protective rim',
  'domed-pebble-glass': '3D domed Corning Gorilla Glass',
  'classic-sunken-sapphire': 'Sunken sapphire crystal & rotating bezel',
  'cushion-sunken-sapphire': 'Flat sapphire with titanium bezel',
  '2.5d-sapphire': '2.5D sapphire crystal with index ring',
};

export const DeviceSpecDrawer: React.FC<DeviceSpecDrawerProps> = ({ spec }) => {
  const screenToBodyRatio = calculateScreenToBodyRatio(spec);
  const displayInches = (spec.activeDisplayDiameterMm / 25.4).toFixed(2);

  const rows: Array<{ label: string; value: string; estimated?: boolean; mono?: boolean }> = [
    {
      label: 'Active display',
      value: `${spec.activeDisplayDiameterMm} mm (${displayInches}")`,
      mono: true,
    },
    {
      label: 'Resolution',
      value: `${spec.resolutionPx.width}×${spec.resolutionPx.height} px (${spec.ppi} PPI)`,
      mono: true,
    },
    {
      label: 'Case dimensions',
      value: `${spec.caseDiameterMm} × ${spec.caseHeightMm} × ${spec.caseThicknessMm} mm`,
      mono: true,
    },
    {
      label: 'Bezel border',
      value: `${spec.bezelRadialWidthMm} mm`,
      mono: true,
    },
    {
      label: 'Screen-to-body',
      value: `${screenToBodyRatio.toFixed(1)}%`,
      mono: true,
    },
    {
      label: 'Lug width',
      value: `${spec.lugWidthMm} mm${spec.lugToLugMm ? ` (${spec.lugToLugMm} mm lug-to-lug)` : ''}`,
      mono: true,
    },
    {
      label: 'Architecture',
      value: spec.archetype,
    },
    {
      label: 'Glass',
      value: GLASS_LABELS[spec.glassType] ?? spec.glassType,
    },
    {
      label: 'Case material',
      value: spec.caseMaterialName,
    },
  ];

  return (
    <div className="spec-drawer">
      <div className="section-label">
        <span>Hardware Specifications</span>
        <span className="section-tag">1:1 Physical</span>
      </div>
      <dl className="spec-table">
        {rows.map((row) => (
          <div className="spec-row" key={row.label}>
            <dt>{row.label}</dt>
            <dd className={`spec-value ${row.mono ? 'mono' : ''} ${row.estimated ? 'estimated' : ''}`}>{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="hint-text">{spec.notes}</p>
    </div>
  );
};
