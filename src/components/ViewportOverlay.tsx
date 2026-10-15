import React from 'react';
import type { DeviceSpec } from '../types';

interface ViewportOverlayProps {
  deviceSpec: DeviceSpec;
  hasImage: boolean;
  webglError: string | null;
}

export const ViewportOverlay: React.FC<ViewportOverlayProps> = ({ deviceSpec, hasImage, webglError }) => {
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
      <div className="spec-pill">
        <strong>{deviceSpec.name}</strong>
        <span className="spec-pill-detail">
          {deviceSpec.displayDiameterMm} mm · <span className="spec-highlight">{deviceSpec.resolutionPx.width}×{deviceSpec.resolutionPx.height}</span>
        </span>
      </div>

      {!hasImage && <div className="empty-hint">Add a screenshot to see it on the display</div>}

      <div className="viewport-nav-hint" aria-hidden="true">
        <span className="hint-pointer">Drag to rotate · Scroll to zoom · Right-drag to pan</span>
        <span className="hint-touch">Drag to rotate · Pinch to zoom</span>
      </div>
    </>
  );
};
