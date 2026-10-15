import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ID1_CARD_MM, PX_PER_MM_MAX, PX_PER_MM_MIN, clampPxPerMm } from '../calibration/calibration';

interface CalibrationDialogProps {
  initialPxPerMm: number;
  onConfirm: (pxPerMm: number) => void;
  onCancel: () => void;
}

const FINE = 1.0025;
const COARSE = 1.02;

/**
 * Full-screen card-matching calibration. The outline is drawn at ID-1 card size using the current
 * px/mm guess; the user resizes it (slider, buttons, wheel, arrow keys or pinch) until a real card
 * held against the screen covers it exactly.
 */
export const CalibrationDialog: React.FC<CalibrationDialogProps> = ({ initialPxPerMm, onConfirm, onCancel }) => {
  const [ppm, setPpm] = useState(() => clampPxPerMm(initialPxPerMm));
  const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const dialogRef = useRef<HTMLDivElement>(null);
  const pinchRef = useRef<{ id1: number; id2: number; startDist: number; startPpm: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());

  const scaleBy = useCallback((factor: number) => setPpm((v) => clampPxPerMm(v * factor)), []);

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    const opener = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, []);

  // Wheel must be non-passive to stop the page from scrolling
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const notches = Math.max(-5, Math.min(5, -e.deltaY / 100));
      scaleBy(Math.pow(e.shiftKey ? COARSE : 1.006, notches));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [scaleBy]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      // Keep focus inside the modal
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button, input');
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'BUTTON') {
      e.preventDefault();
      onConfirm(ppm);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowRight' || e.key === '+' || e.key === '=') {
      e.preventDefault();
      scaleBy(e.shiftKey ? COARSE : FINE);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === '-') {
      e.preventDefault();
      scaleBy(1 / (e.shiftKey ? COARSE : FINE));
    }
  };

  // Two-finger pinch on touch screens
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.entries()];
      pinchRef.current = {
        id1: a[0],
        id2: b[0],
        startDist: Math.hypot(a[1].x - b[1].x, a[1].y - b[1].y),
        startPpm: ppm,
      };
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pinch = pinchRef.current;
    if (!pinch) return;
    const p1 = pointers.current.get(pinch.id1);
    const p2 = pointers.current.get(pinch.id2);
    if (!p1 || !p2 || pinch.startDist < 10) return;
    const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    setPpm(clampPxPerMm(pinch.startPpm * (dist / pinch.startDist)));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
  };

  // Show the card upright when it would not fit across the screen (phones in portrait)
  const longPx = ID1_CARD_MM.width * ppm;
  const shortPx = ID1_CARD_MM.height * ppm;
  const vertical = longPx > viewport.w - 32 && shortPx < viewport.w - 32;
  const cardW = vertical ? shortPx : longPx;
  const cardH = vertical ? longPx : shortPx;

  return (
    <div
      className="calibration-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calibration-title"
      ref={dialogRef}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="calibration-copy">
        <h2 id="calibration-title">Calibrate real size</h2>
        <p>
          Hold any bank or ID card flat against the screen and resize the outline until it matches the card exactly.
        </p>
      </div>

      <div className="calibration-stage">
        <div
          className={`calibration-card ${vertical ? 'vertical' : ''}`}
          style={{ width: `${cardW}px`, height: `${cardH}px`, borderRadius: `${ID1_CARD_MM.cornerRadius * ppm}px` }}
          aria-hidden="true"
        >
          <span className="calibration-chip" style={{ width: `${11 * ppm}px`, height: `${8.5 * ppm}px`, borderRadius: `${1.4 * ppm}px` }} />
          <span className="calibration-size">85.6 × 54 mm</span>
        </div>
      </div>

      <div className="calibration-controls">
        <div className="calibration-row">
          <button type="button" className="btn-secondary icon-btn" onClick={() => scaleBy(1 / COARSE)} aria-label="Much smaller">−−</button>
          <button type="button" className="btn-secondary icon-btn" onClick={() => scaleBy(1 / FINE)} aria-label="Slightly smaller">−</button>
          <input
            type="range"
            className="calibration-slider"
            min={PX_PER_MM_MIN}
            max={PX_PER_MM_MAX}
            step={0.005}
            value={ppm}
            onChange={(e) => setPpm(clampPxPerMm(Number(e.target.value)))}
            aria-label="Outline size"
          />
          <button type="button" className="btn-secondary icon-btn" onClick={() => scaleBy(FINE)} aria-label="Slightly larger">+</button>
          <button type="button" className="btn-secondary icon-btn" onClick={() => scaleBy(COARSE)} aria-label="Much larger">++</button>
        </div>
        <p className="calibration-hint">
          <span className="hint-pointer">Scroll or arrow keys to adjust · Shift for bigger steps</span>
          <span className="hint-touch">Pinch the outline or use the buttons</span>
          {' · '}
          <span className="mono">{ppm.toFixed(3)} px/mm</span>
        </p>
        <p className="calibration-hint subtle">Saved for this screen and browser zoom. Changing zoom or monitor asks you to recalibrate.</p>
        <div className="calibration-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn-primary" onClick={() => onConfirm(ppm)}>Done — show real size</button>
        </div>
      </div>
    </div>
  );
};
