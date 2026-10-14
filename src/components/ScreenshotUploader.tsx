import React, { useRef, useState } from 'react';
import type { UploadedImageInfo } from '../types';

interface ScreenshotUploaderProps {
  uploadedImage: UploadedImageInfo | null;
  onImageSelected: (file: File) => void;
  onImageRemoved: () => void;
  errorMessage: string | null;
  onClearError: () => void;
}

export const ScreenshotUploader: React.FC<ScreenshotUploaderProps> = ({
  uploadedImage,
  onImageSelected,
  onImageRemoved,
  errorMessage,
  onClearError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    onClearError();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onImageSelected(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onClearError();
      const file = e.target.files[0];
      onImageSelected(file);
      // Reset input value so re-uploading the exact same file fires change event
      e.target.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getAspectTag = (aspect: number): string => {
    if (Math.abs(aspect - 1.0) < 0.01) return '1:1 Square';
    if (aspect > 1.0) return `${aspect.toFixed(2)}:1 Landscape (Contained)`;
    return `1:${(1 / aspect).toFixed(2)} Portrait (Contained)`;
  };

  return (
    <div className="uploader-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {uploadedImage ? (
        <div className="image-card">
          <div className="image-meta-row">
            <span className="image-name" title={uploadedImage.file.name}>
              {uploadedImage.file.name}
            </span>
            <span className="image-badge">Active</span>
          </div>

          <div className="image-meta-details">
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Dimensions: </span>
              <strong>{uploadedImage.width} × {uploadedImage.height}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>Size: </span>
              <span>{formatFileSize(uploadedImage.file.size)}</span>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            Fit: {getAspectTag(uploadedImage.aspectRatio)}
          </div>

          <div className="image-actions">
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Replace</span>
            </button>

            <button
              type="button"
              className="btn-danger"
              onClick={onImageRemoved}
              title="Remove current screenshot"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
        >
          <svg className="dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <div className="dropzone-prompt">Drop screenshot or browse</div>
          <div className="dropzone-sub">Supports PNG, JPEG, and WebP (up to 20 MB)</div>
        </div>
      )}

      {errorMessage && (
        <div className="alert-error" role="alert">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
