import React, { useEffect, useState } from 'react';

interface FingerCalibratorProps {
  enabled: boolean;
  pxPerMm: number | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const FingerCalibrator: React.FC<FingerCalibratorProps> = ({
  enabled,
  pxPerMm,
  containerRef,
}) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isPressing, setIsPressing] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setPos(null);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        setPos(null);
      } else {
        setPos({ x, y });
      }
    };

    const handlePointerDown = () => setIsPressing(true);
    const handlePointerUp = () => setIsPressing(false);
    const handlePointerLeave = () => {
      setPos(null);
      setIsPressing(false);
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [enabled, containerRef]);

  if (!enabled || !pos) return null;

  // 14 mm physical contact pad scaled to monitor pixels
  // If uncalibrated, default to ~3.78 px/mm (standard 96 DPI CSS pixel)
  const scale = pxPerMm && pxPerMm > 0.5 ? pxPerMm : 3.7795;
  const widthPx = Math.round(14 * scale);
  const heightPx = Math.round(15.5 * scale);

  return (
    <div
      className="finger-pad-cursor"
      style={{
        position: 'absolute',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        transform: `translate(-50%, -50%) scale(${isPressing ? 0.96 : 1.0})`,
        borderRadius: '50% 50% 46% 46%',
        background: isPressing
          ? 'radial-gradient(circle at 50% 45%, rgba(56, 189, 248, 0.45) 0%, rgba(14, 165, 233, 0.25) 70%, rgba(2, 132, 199, 0.5) 100%)'
          : 'radial-gradient(circle at 50% 45%, rgba(56, 189, 248, 0.30) 0%, rgba(14, 165, 233, 0.15) 70%, rgba(2, 132, 199, 0.35) 100%)',
        border: '1.5px solid rgba(56, 189, 248, 0.85)',
        boxShadow: isPressing
          ? '0 0 16px rgba(56, 189, 248, 0.6), inset 0 0 8px rgba(56, 189, 248, 0.4)'
          : '0 0 10px rgba(56, 189, 248, 0.35), inset 0 0 4px rgba(56, 189, 248, 0.2)',
        pointerEvents: 'none',
        zIndex: 50,
        transition: 'transform 0.08s ease-out, background 0.08s ease-out',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-hidden="true"
    >
      {/* Center touch crosshair */}
      <div
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 0 4px #38bdf8',
        }}
      />
      <div
        style={{
          marginTop: '3px',
          fontSize: '10px',
          fontWeight: 700,
          color: '#ffffff',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          letterSpacing: '0.02em',
          userSelect: 'none',
        }}
      >
        14 mm
      </div>
    </div>
  );
};
