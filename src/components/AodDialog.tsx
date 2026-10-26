import React from 'react';
import type { AodAnalysisResult } from '../utils/aodAnalysis';

interface AodDialogProps {
  analysis: AodAnalysisResult | null;
  onClose: () => void;
}

export const AodDialog: React.FC<AodDialogProps> = ({ analysis, onClose }) => {
  if (!analysis) return null;

  const { oprPercent, litPixels, circlePixels, averageLuminance, isCompliant, burnInRisk, hotspotCount, heatmapDataUrl } = analysis;

  let badgeColor = '#22c55e'; // green
  let statusText = 'Compliant (< 10% OPR)';
  if (burnInRisk === 'moderate') {
    badgeColor = '#eab308'; // yellow
    statusText = 'Moderate Burn-in Risk (10–15% OPR)';
  } else if (burnInRisk === 'high') {
    badgeColor = '#ef4444'; // red
    statusText = 'Non-compliant: High Burn-in Risk (> 15% OPR)';
  }

  return (
    <div
      className="dialog-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        backdropFilter: 'blur(4px)',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="dialog-card"
        style={{
          background: 'var(--panel-bg, #1e293b)',
          border: '1px solid var(--border-color, #334155)',
          borderRadius: '14px',
          padding: '22px 24px',
          maxWidth: '480px',
          width: '100%',
          color: 'var(--text-main, #f8fafc)',
          boxShadow: '0 20px 45px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        role="dialog"
        aria-labelledby="aod-dialog-title"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 id="aod-dialog-title" style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            ☀️ AOD & Ambient Burn-In Checker
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px',
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              background: badgeColor,
              color: '#000000',
              fontWeight: 700,
              fontSize: '15px',
              letterSpacing: '0.02em',
            }}
          >
            OPR: {oprPercent}%
          </div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: badgeColor }}>
            {statusText}
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
          Google Play and Wear OS guidelines strictly require Always-On Display (AOD) ambient screens to maintain an <b>On-Pixel Ratio (OPR) under 10%</b> (ideally &lt; 5%) to preserve battery life and prevent OLED panel burn-in.
        </p>

        {heatmapDataUrl && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              background: 'var(--bg-card, #0f172a)',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '12px 16px',
            }}
          >
            <img
              src={heatmapDataUrl}
              alt="AOD circular luminance and burn-in hotspot heatmap"
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                border: '1px solid #475569',
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
              <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>OLED Pixel Heatmap</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0a0f1c', border: '1px solid #475569', display: 'inline-block' }} />
                <span>Unlit / Off (&le; 5% lum)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#12c2dc', display: 'inline-block' }} />
                <span>Active Lit Pixels (5–85% lum)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                <span>Burn-in Hotspots (&gt; 85% lum)</span>
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            background: 'var(--bg-card, #0f172a)',
            border: '1px solid #334155',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            fontSize: '13px',
          }}
        >
          <div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>Lit pixels</div>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>
              {litPixels.toLocaleString()} / {circlePixels.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>Average luminance</div>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>
              {(averageLuminance * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>Burn-in hotspots (&gt; 85%)</div>
            <div style={{ fontWeight: 600, marginTop: '2px', color: hotspotCount > 0 ? '#f59e0b' : 'inherit' }}>
              {hotspotCount.toLocaleString()} px
            </div>
          </div>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>Wear OS compliance</div>
            <div style={{ fontWeight: 600, marginTop: '2px', color: isCompliant ? '#22c55e' : '#ef4444' }}>
              {isCompliant ? '✓ Pass (< 10%)' : '✗ Exceeds 10%'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--accent, #3b82f6)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
