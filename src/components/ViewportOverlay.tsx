import React from 'react';
import type { DeviceSpec } from '../types';

export const SpecPill: React.FC<{ spec: DeviceSpec; children?: React.ReactNode }> = ({ spec, children }) => (
  <div className={`spec-pill ${children ? 'interactive' : ''}`}>
    {children ?? <strong>{spec.name}</strong>}
    <span className="spec-pill-detail">
      {spec.activeDisplayDiameterMm} mm ({(spec.activeDisplayDiameterMm / 25.4).toFixed(2)}&quot;) ·{' '}
      <span className="spec-highlight">{spec.resolutionPx.width}×{spec.resolutionPx.height}</span>{' '}
      ({spec.ppi} PPI) · {spec.caseDiameterMm}×{spec.caseHeightMm} mm
    </span>
  </div>
);

interface ViewportOverlayProps {
  deviceSpec: DeviceSpec;
  hasImage: boolean;
  webglError: string | null;
  realSize: boolean;
  notice: string | null;
  onRecalibrate: () => void;
  onDismissNotice: () => void;
}

export const ViewportOverlay: React.FC<ViewportOverlayProps> = ({
  deviceSpec,
  hasImage,
  webglError,
  realSize,
  notice,
  onRecalibrate,
  onDismissNotice,
}) => {
  if (webglError) {
    return (
      <div className="viewport-error" role="alert">
        <h2>3D view could not start</h2>
        <p>{webglError}</p>
        <p className="viewport-error-hint">Make sure hardware acceleration is enabled in your browser settings.</p>
      </div>
    );
  }

  return (
    <>
      {realSize && (
        <div className="real-size-badge" role="status">
          <span className="real-size-dot" aria-hidden="true" />
          <span>Real size 1:1 · {deviceSpec.caseDiameterMm} mm case · Lug {deviceSpec.lugWidthMm} mm</span>
          <button type="button" className="badge-link" onClick={onRecalibrate}>Recalibrate</button>
        </div>
      )}

      {notice && !realSize && (
        <div className="real-size-badge warning" role="status">
          <span>{notice}</span>
          <button type="button" className="badge-link" onClick={onDismissNotice} aria-label="Dismiss">✕</button>
        </div>
      )}

      {!hasImage && <div className="empty-hint">Paste, drop or capture a screenshot to see it on the display</div>}

      <div className="viewport-nav-hint" aria-hidden="true">
        <span className="hint-pointer">{realSize ? 'Drag to tilt · zoom locked at real size' : 'Drag to rotate · Scroll to zoom · Right-drag to pan'}</span>
        <span className="hint-touch">{realSize ? 'Drag to tilt · zoom locked' : 'Drag to rotate · Pinch to zoom'}</span>
      </div>
    </>
  );
};
