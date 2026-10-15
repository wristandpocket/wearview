import React, { useRef, useState } from 'react';
import { visibleSize, elementSize, type ScreenSource } from '../textures/screenTexture';

export type TextureSource = 'sample' | 'test-pattern' | 'user' | 'live' | null;

interface ScreenshotUploaderProps {
  source: ScreenSource | null;
  onImageSelected: (file: File) => void;
  onImageRemoved: () => void;
  onLoadTestPattern: () => void;
  onLoadSampleGame?: () => void;
  onCaptureWindow?: () => void;
  onStopCapture: () => void;
  onCrop: () => void;
  activeSource?: TextureSource;
  errorMessage: string | null;
  resolutionWarning?: string | null;
  onClearError: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const PASTE_KEYS = isMac ? '⌘V' : 'Ctrl+V';

export const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({
  source,
  onImageSelected,
  onImageRemoved,
  onLoadTestPattern,
  onLoadSampleGame,
  onCaptureWindow,
  onStopCapture,
  onCrop,
  activeSource,
  errorMessage,
  resolutionWarning,
  onClearError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const openPicker = () => fileInputRef.current?.click();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    onClearError();
    const file = e.dataTransfer.files?.[0];
    if (file) onImageSelected(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onClearError();
      onImageSelected(file);
    }
    // Reset so picking the same file again still fires `change`
    e.target.value = '';
  };

  const dragProps = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setIsDragActive(true); },
    onDragLeave: () => setIsDragActive(false),
    onDrop: handleDrop,
  };

  const frame = source ? elementSize(source.element) : null;
  const shown = source ? visibleSize(source) : null;

  return (
    <div className="uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={handleFileInputChange}
      />

      {source && frame && shown ? (
        <div className={`image-card ${isDragActive ? 'drag-active' : ''}`} {...dragProps}>
          <div className="image-meta-row">
            {source.live && <span className="live-dot" aria-label="Live" />}
            <span className="image-name" title={source.name}>{source.name}</span>
          </div>
          <div className="image-meta-details">
            <span>{shown.width} × {shown.height}{source.crop ? ` of ${frame.width} × ${frame.height}` : ''}</span>
            {source.bytes !== null && <span>{formatFileSize(source.bytes)}</span>}
            <span className="image-fit">
              {source.crop ? 'cropped · fills display' : shown.width === shown.height ? '1:1 · fills display' : 'letterboxed'}
            </span>
          </div>
          <div className="image-actions">
            {source.live ? (
              <button type="button" className="btn-secondary grow" onClick={onStopCapture} title="Stop sharing and keep the last frame">
                Stop live
              </button>
            ) : (
              <button type="button" className="btn-secondary grow" onClick={openPicker}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Replace</span>
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={onCrop} title="Select the square game area [K]">Crop</button>
            <button type="button" className="btn-danger" onClick={onImageRemoved}>Remove</button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
          {...dragProps}
          onClick={openPicker}
        >
          <svg className="dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="dropzone-prompt">Drop a screenshot or tap to browse</span>
          <span className="dropzone-sub">PNG, JPEG or WebP · up to 20 MB · square works best</span>
        </button>
      )}

      <p className="uploader-tip">
        Tip: copy a screenshot (ShareX, Snipping Tool, Unity) and press <kbd>{PASTE_KEYS}</kbd> anywhere. You can also drop files onto the 3D view.
      </p>

      {onCaptureWindow && !source?.live && (
        <button type="button" className="btn-secondary capture-btn" onClick={onCaptureWindow} title="Mirror a window live, e.g. the Unity Game view or the Wear OS emulator">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="4" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 18v3" />
            <circle cx="12" cy="11" r="2.5" />
          </svg>
          <span>Capture window (live)</span>
        </button>
      )}

      {errorMessage && (
        <div className="alert-error" role="alert">
          <span>{errorMessage}</span>
        </div>
      )}

      {resolutionWarning && (
        <div className="alert-warning" role="status">
          <span>{resolutionWarning}</span>
        </div>
      )}

      <div className="preset-screens-row">
        <span className="preset-screens-label">Samples:</span>
        <div className="preset-screens-pills">
          {onLoadSampleGame && (
            <button
              type="button"
              className={`preset-pill-btn ${activeSource === 'sample' ? 'active' : ''}`}
              onClick={onLoadSampleGame}
              title="Load Cyberpunk 3D game screen sample"
            >
              Cyberpunk 3D
            </button>
          )}
          <button
            type="button"
            className={`preset-pill-btn ${activeSource === 'test-pattern' ? 'active' : ''}`}
            onClick={onLoadTestPattern}
            title="Load hardware-accurate QA test pattern (resolution, safe zones, degree ticks)"
          >
            QA pattern
          </button>
        </div>
      </div>
    </div>
  );
};
