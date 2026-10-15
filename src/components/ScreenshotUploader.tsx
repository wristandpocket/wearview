import React, { useRef, useState } from 'react';
import type { UploadedImageInfo } from '../types';

interface ScreenshotUploaderProps {
  uploadedImage: UploadedImageInfo | null;
  onImageSelected: (file: File) => void;
  onImageRemoved: () => void;
  onLoadTestPattern: () => void;
  errorMessage: string | null;
  onClearError: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFitLabel = (aspect: number): string => {
  if (Math.abs(aspect - 1.0) < 0.01) return '1:1 · fills display';
  return `${aspect.toFixed(2)}:1 · centered, not cropped`;
};

export const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({
  uploadedImage,
  onImageSelected,
  onImageRemoved,
  onLoadTestPattern,
  errorMessage,
  onClearError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const openPicker = () => fileInputRef.current?.click();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
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

  return (
    <div className="uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={handleFileInputChange}
      />

      {uploadedImage ? (
        <div
          className={`image-card ${isDragActive ? 'drag-active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={handleDrop}
        >
          <div className="image-meta-row">
            <span className="image-name" title={uploadedImage.file.name}>{uploadedImage.file.name}</span>
          </div>
          <div className="image-meta-details">
            <span>{uploadedImage.width} × {uploadedImage.height}</span>
            <span>{formatFileSize(uploadedImage.file.size)}</span>
            <span className="image-fit">{getFitLabel(uploadedImage.aspectRatio)}</span>
          </div>
          <div className="image-actions">
            <button type="button" className="btn-secondary grow" onClick={openPicker}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Replace</span>
            </button>
            <button type="button" className="btn-danger" onClick={onImageRemoved}>Remove</button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={handleDrop}
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

      {errorMessage && (
        <div className="alert-error" role="alert">
          <span>{errorMessage}</span>
        </div>
      )}

      <button type="button" className="link-btn" onClick={onLoadTestPattern}>
        Load test pattern (edges, centre, orientation)
      </button>
    </div>
  );
};
