import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { DeviceId, LightingPreset, ViewMode, UploadedImageInfo } from './types';
import { getDeviceSpec } from './devices';
import { ThreeViewer } from './viewer/ThreeViewer';
import { loadScreenshotTexture, disposeUploadedTexture } from './textures/textureLoader';
import { createTestPatternFile } from './textures/testPattern';
import { Header } from './components/Header';
import { ControlsBar } from './components/ControlsBar';
import { ScreenshotUploader } from './components/ScreenshotUploader';
import { DeviceSpecDrawer } from './components/DeviceSpecDrawer';
import { ViewportOverlay } from './components/ViewportOverlay';
import './styles/theme.css';

export const App: React.FC = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<DeviceId>('galaxy-watch-5-44mm');
  const [viewMode, setViewMode] = useState<ViewMode>('watch');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('studio');
  const [uploadedImage, setUploadedImage] = useState<UploadedImageInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<ThreeViewer | null>(null);

  // Initialize ThreeViewer on mount
  useEffect(() => {
    if (!viewportRef.current) return;

    const viewer = new ThreeViewer({
      container: viewportRef.current,
      initialDeviceId: selectedDeviceId,
      initialLighting: lightingPreset,
      initialViewMode: viewMode,
      onInitError: (err) => {
        setWebglError(err.message);
      }
    });

    viewerInstanceRef.current = viewer;

    return () => {
      viewer.dispose();
      viewerInstanceRef.current = null;
    };
  }, []);

  // Update device model
  useEffect(() => {
    if (viewerInstanceRef.current) {
      viewerInstanceRef.current.loadDevice(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  // Update lighting preset
  useEffect(() => {
    if (viewerInstanceRef.current) {
      viewerInstanceRef.current.setLightingPreset(lightingPreset);
    }
  }, [lightingPreset]);

  // Update view mode (Watch vs On wrist)
  useEffect(() => {
    if (viewerInstanceRef.current) {
      viewerInstanceRef.current.setViewMode(viewMode);
    }
  }, [viewMode]);

  // Update texture on viewer
  useEffect(() => {
    if (viewerInstanceRef.current) {
      viewerInstanceRef.current.setScreenshotTexture(
        uploadedImage ? uploadedImage.texture : null
      );
    }
  }, [uploadedImage]);

  // Handle image upload
  const handleImageSelected = useCallback(async (file: File) => {
    setErrorMessage(null);
    try {
      const info = await loadScreenshotTexture(file);
      setUploadedImage((prev) => {
        // Clean up previous texture
        if (prev) {
          disposeUploadedTexture(prev);
        }
        return info;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load image file.';
      setErrorMessage(msg);
    }
  }, []);

  // Handle image removal
  const handleImageRemoved = useCallback(() => {
    setUploadedImage((prev) => {
      if (prev) {
        disposeUploadedTexture(prev);
      }
      return null;
    });
    setErrorMessage(null);
  }, []);

  // Handle QA test pattern loading
  const handleLoadTestPattern = useCallback(async () => {
    setErrorMessage(null);
    try {
      const testFile = await createTestPatternFile(450);
      await handleImageSelected(testFile);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate test pattern.';
      setErrorMessage(msg);
    }
  }, [handleImageSelected]);

  // Auto-load default Cyberpunk screenshot on initial mount
  useEffect(() => {
    let isCancelled = false;

    async function loadDefaultScreenshot() {
      try {
        const response = await fetch('./cyberpunk3d-screen2-full.webp');
        if (!response.ok) return;
        const blob = await response.blob();
        if (isCancelled) return;
        const defaultFile = new File([blob], 'cyberpunk3d-screen2-full.webp', {
          type: 'image/webp'
        });
        await handleImageSelected(defaultFile);
      } catch (err) {
        console.warn('Could not load default screenshot:', err);
      }
    }

    loadDefaultScreenshot();

    return () => {
      isCancelled = true;
    };
  }, [handleImageSelected]);

  // Handle camera reset
  const handleResetCamera = useCallback(() => {
    if (viewerInstanceRef.current) {
      viewerInstanceRef.current.resetCamera();
    }
  }, []);

  const currentDeviceSpec = getDeviceSpec(selectedDeviceId);

  return (
    <div className="app-container">
      <Header
        selectedDeviceId={selectedDeviceId}
        onSelectDevice={setSelectedDeviceId}
        onResetCamera={handleResetCamera}
      />

      <main className="app-workspace">
        {/* 3D WebGL Viewport */}
        <div className="viewport-container">
          <div ref={viewportRef} className="canvas-mount" />

          <ViewportOverlay
            deviceSpec={currentDeviceSpec}
            hasImage={uploadedImage !== null}
            webglError={webglError}
          />

          <ControlsBar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            lightingPreset={lightingPreset}
            onLightingChange={setLightingPreset}
            onLoadTestPattern={handleLoadTestPattern}
          />
        </div>

        {/* Right Controls / Spec Panel */}
        <aside className="sidebar-panel">
          <section className="panel-section">
            <div className="section-label">
              <span>Game Screenshot</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)' }}>Active Display</span>
            </div>

            <ScreenshotUploader
              uploadedImage={uploadedImage}
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
              errorMessage={errorMessage}
              onClearError={() => setErrorMessage(null)}
            />
          </section>

          <section className="panel-section" style={{ flex: 1 }}>
            <DeviceSpecDrawer spec={currentDeviceSpec} />
          </section>
        </aside>
      </main>
    </div>
  );
};

export default App;
