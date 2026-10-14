import React from 'react';
import type { DeviceSpec } from '../types';

interface ViewportOverlayProps {
  deviceSpec: DeviceSpec;
  hasImage: boolean;
  webglError: string | null;
}

export const ViewportOverlay: React.FC<ViewportOverlayProps> = ({
  deviceSpec,
  hasImage,
  webglError
}) => {
  if (webglError) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#07090e',
          color: '#f8fafc',
          padding: '2rem',
          textAlign: 'center',
          zIndex: 50
        }}
      >
        <div style={{ color: 'var(--accent-rose)', marginBottom: '1rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>WebGL Initialization Failed</h2>
        <p style={{ maxWidth: '440px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{webglError}</p>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          Please ensure hardware acceleration is enabled in your browser settings.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Top HUD with device badge */}
      <div className="viewport-hud">
        <div className="hud-group">
          <div className="spec-pill">
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{deviceSpec.name}</span>
            <span>·</span>
            <span>{deviceSpec.displayDiameterMm} mm Display</span>
            <span>·</span>
            <span className="spec-highlight">{deviceSpec.resolutionPx.width}×{deviceSpec.resolutionPx.height}</span>
          </div>
        </div>
      </div>

      {/* Navigation hints */}
      <div className="viewport-nav-hint">
        <span>Drag to orbit · Scroll to zoom · Right-click to pan</span>
      </div>

      {/* Empty State Overlay Prompt if no screenshot loaded */}
      {!hasImage && (
        <div
          style={{
            position: 'absolute',
            top: '4.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            background: 'rgba(16, 20, 29, 0.82)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }} />
          <span>Upload screenshot or click <strong>Test Pattern</strong> to inspect screen fit</span>
        </div>
      )}
    </>
  );
};
