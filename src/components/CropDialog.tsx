import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  centeredSquareCrop,
  clampCrop,
  elementSize,
  type CropRect,
  type ScreenSource,
} from '../textures/screenTexture';

interface CropDialogProps {
  source: ScreenSource;
  onApply: (crop: CropRect | null) => void;
  onCancel: () => void;
}

type DragState = {
  mode: 'move' | 'resize';
  startX: number;
  startY: number;
  startCrop: CropRect;
} | null;

/** Lets the user pick the square game area inside a screenshot or a captured window. */
export const CropDialog: React.FC<CropDialogProps> = ({ source, onApply, onCancel }) => {
  const frame = elementSize(source.element);
  const [crop, setCrop] = useState<CropRect>(() =>
    clampCrop(source.crop ?? centeredSquareCrop(frame.width, frame.height), frame.width, frame.height)
  );
  const [scale, setScale] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState>(null);

  // Fit the frame into the available stage area
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const fit = () => {
      const s = Math.min(stage.clientWidth / frame.width, stage.clientHeight / frame.height);
      setScale(Number.isFinite(s) && s > 0 ? s : 1);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [frame.width, frame.height]);

  // Draw the frame (continuously for a live capture)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.width = frame.width;
    canvas.height = frame.height;
    let raf = 0;
    const draw = () => {
      ctx.drawImage(source.element, 0, 0);
      if (source.live) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [source, frame.width, frame.height]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const update = useCallback(
    (next: CropRect) => setCrop(clampCrop(next, frame.width, frame.height)),
    [frame.width, frame.height]
  );

  const onPointerDown = (mode: 'move' | 'resize') => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { mode, startX: e.clientX, startY: e.clientY, startCrop: crop };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.startX) / scale;
    const dy = (e.clientY - d.startY) / scale;
    if (d.mode === 'move') {
      update({ ...d.startCrop, x: d.startCrop.x + dx, y: d.startCrop.y + dy });
    } else {
      const maxSize = Math.min(frame.width - d.startCrop.x, frame.height - d.startCrop.y);
      const size = Math.min(maxSize, Math.max(16, d.startCrop.size + Math.max(dx, dy)));
      setCrop({ ...d.startCrop, size: Math.round(size) });
    }
  };

  const onPointerUp = () => {
    drag.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    const delta = -Math.sign(e.deltaY) * Math.max(2, Math.round(crop.size * 0.03));
    const size = Math.max(16, crop.size + delta);
    update({ x: crop.x - (size - crop.size) / 2, y: crop.y - (size - crop.size) / 2, size });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onApply(crop);
    } else if (moves[e.key]) {
      e.preventDefault();
      const [mx, my] = moves[e.key];
      update({ ...crop, x: crop.x + mx, y: crop.y + my });
    } else if (e.key === '+' || e.key === '=' || e.key === '-') {
      e.preventDefault();
      const d = e.key === '-' ? -step * 2 : step * 2;
      update({ x: crop.x - d / 2, y: crop.y - d / 2, size: crop.size + d });
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-title"
      ref={dialogRef}
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <div className="crop-copy">
        <h2 id="crop-title">Select the watch screen area</h2>
        <p>
          Drag the square over the game view, resize it from the corner or with the mouse wheel.
          Arrow keys nudge by 1 px (Shift: 10 px).
        </p>
      </div>

      <div className="crop-stage" ref={stageRef}>
        <div
          className="crop-frame"
          style={{ width: frame.width * scale, height: frame.height * scale }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
        >
          <canvas ref={canvasRef} className="crop-canvas" />
          <div
            className="crop-box"
            style={{
              left: crop.x * scale,
              top: crop.y * scale,
              width: crop.size * scale,
              height: crop.size * scale,
            }}
            onPointerDown={onPointerDown('move')}
          >
            <span className="crop-circle" aria-hidden="true" />
            <span className="crop-handle" onPointerDown={onPointerDown('resize')} aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="crop-controls">
        <span className="crop-readout">
          {crop.size}×{crop.size} px at {crop.x},{crop.y} · frame {frame.width}×{frame.height}
        </span>
        <div className="crop-actions">
          <button type="button" className="btn-secondary" onClick={() => update(centeredSquareCrop(frame.width, frame.height))}>
            Center
          </button>
          <button type="button" className="btn-secondary" onClick={() => onApply(null)} title="Show the whole frame, letterboxed">
            No crop
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn-primary" onClick={() => onApply(crop)}>Apply</button>
        </div>
      </div>
    </div>
  );
};
