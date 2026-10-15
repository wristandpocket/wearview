import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { DeviceId, LightingPreset, ViewMode, UploadedImageInfo } from './types';
import { DEVICE_ENTRIES, getDeviceSpec } from './devices';
import { guessPxPerMm, loadAnyCalibration, loadCalibration, saveCalibration } from './calibration/calibration';
import { CalibrationDialog } from './components/CalibrationDialog';
import { ThreeViewer } from './viewer/ThreeViewer';
import { loadScreenshotTexture, disposeUploadedTexture } from './textures/textureLoader';
import { createTestPatternFile } from './textures/testPattern';
import { Header } from './components/Header';
import { ControlsBar } from './components/ControlsBar';
import { ScreenshotUploader } from './components/ScreenshotUploader';
import { DeviceSpecDrawer } from './components/DeviceSpecDrawer';
import { ViewportOverlay } from './components/ViewportOverlay';
import './styles/theme.css';

const DEVICE_STORAGE_KEY = 'wearview.device';

function initialDevice(): DeviceId {
  try {
    const saved = window.localStorage.getItem(DEVICE_STORAGE_KEY);
    if (saved && saved in DEVICE_ENTRIES) return saved as DeviceId;
  } catch {
    // ignore unavailable storage
  }
  return 'galaxy-watch-5-44mm';
}

export const App: React.FC = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<DeviceId>(initialDevice);
  const [viewMode, setViewMode] = useState<ViewMode>('watch');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('studio');
  const [uploadedImage, setUploadedImage] = useState<UploadedImageInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [pxPerMm, setPxPerMm] = useState<number | null>(null); // non-null = real-size mode on
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationNotice, setCalibrationNotice] = useState<string | null>(null);

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
    if (import.meta.env.DEV) (window as unknown as { __wearview?: ThreeViewer }).__wearview = viewer;

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
    try {
      window.localStorage.setItem(DEVICE_STORAGE_KEY, selectedDeviceId);
    } catch {
      // ignore unavailable storage
    }
  }, [selectedDeviceId]);

  // Real-size (1:1) mode
  useEffect(() => {
    viewerInstanceRef.current?.setRealScale(pxPerMm);
  }, [pxPerMm]);

  // A calibration is only valid for the zoom level / monitor it was made on
  useEffect(() => {
    if (pxPerMm === null) return;
    const check = () => {
      if (loadCalibration() === null) {
        setPxPerMm(null);
        setCalibrationNotice('Browser zoom or screen changed — calibrate again to see real size.');
      }
    };
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [pxPerMm]);

  const handleToggleRealSize = useCallback(() => {
    setCalibrationNotice(null);
    if (pxPerMm !== null) {
      setPxPerMm(null);
      return;
    }
    const stored = loadCalibration();
    if (stored !== null) setPxPerMm(stored);
    else setCalibrating(true);
  }, [pxPerMm]);

  const handleCalibrated = useCallback((value: number) => {
    saveCalibration(value);
    setCalibrating(false);
    setCalibrationNotice(null);
    setPxPerMm(value);
  }, []);

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
  const loadTokenRef = useRef(0);
  const handleImageSelected = useCallback(async (file: File) => {
    setErrorMessage(null);
    const token = ++loadTokenRef.current;
    try {
      const info = await loadScreenshotTexture(file);
      // A newer pick started while this one was decoding: drop this result
      if (token !== loadTokenRef.current) {
        disposeUploadedTexture(info);
        return;
      }
      setUploadedImage((prev) => {
        // Clean up previous texture
        if (prev) {
          disposeUploadedTexture(prev);
        }
        return info;
      });
    } catch (err) {
      if (token !== loadTokenRef.current) return;
      const msg = err instanceof Error ? err.message : 'Failed to load image file.';
      setErrorMessage(msg);
    }
  }, []);

  // Handle image removal
  const handleImageRemoved = useCallback(() => {
    loadTokenRef.current++;
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
        <section className="stage" aria-label="3D preview">
          <div className="viewport-container" data-lighting={lightingPreset}>
            <div ref={viewportRef} className="canvas-mount" />
            <ViewportOverlay
              deviceSpec={currentDeviceSpec}
              hasImage={uploadedImage !== null}
              webglError={webglError}
              realSize={pxPerMm !== null}
              notice={calibrationNotice}
              onRecalibrate={() => setCalibrating(true)}
              onDismissNotice={() => setCalibrationNotice(null)}
            />
          </div>

          <ControlsBar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            lightingPreset={lightingPreset}
            onLightingChange={setLightingPreset}
            realSize={pxPerMm !== null}
            onToggleRealSize={handleToggleRealSize}
          />
        </section>

        <aside className="sidebar-panel">
          <section className="panel-section">
            <div className="section-label">
              <span>Game screenshot</span>
            </div>
            <ScreenshotUploader
              uploadedImage={uploadedImage}
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
              onLoadTestPattern={handleLoadTestPattern}
              errorMessage={errorMessage}
              onClearError={() => setErrorMessage(null)}
            />
          </section>

          <section className="panel-section">
            <DeviceSpecDrawer spec={currentDeviceSpec} />
          </section>
        </aside>
      </main>

      {calibrating && (
        <CalibrationDialog
          initialPxPerMm={pxPerMm ?? loadAnyCalibration() ?? guessPxPerMm()}
          onConfirm={handleCalibrated}
          onCancel={() => setCalibrating(false)}
        />
      )}
    </div>
  );
};

export default App;
