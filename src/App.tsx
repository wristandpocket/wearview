import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { DeviceId, LightingPreset, ViewMode, UploadedImageInfo } from './types';
import { DEFAULT_DEVICE_ID, getDeviceSpec, normalizeDeviceId } from './devices';
import { guessPxPerMm, loadAnyCalibration, loadCalibration, saveCalibration } from './calibration/calibration';
import { CalibrationDialog } from './components/CalibrationDialog';
import { ThreeViewer } from './viewer/ThreeViewer';
import { loadScreenshotTexture, disposeUploadedTexture } from './textures/textureLoader';
import { createTestPatternFile } from './textures/testPattern';
import { checkScreenshotResolution } from './textures/validator';
import { Header } from './components/Header';
import { ControlsBar } from './components/ControlsBar';
import { ScreenshotUploader, type TextureSource } from './components/ScreenshotUploader';
import { DeviceSpecDrawer } from './components/DeviceSpecDrawer';
import { ViewportOverlay } from './components/ViewportOverlay';
import { handleGlobalKeyDown } from './utils/keyboard';
import './styles/theme.css';

const DEVICE_STORAGE_KEY = 'wearview.device';

function initialDevice(): DeviceId {
  try {
    const saved = window.localStorage.getItem(DEVICE_STORAGE_KEY);
    if (saved) return normalizeDeviceId(saved);
  } catch {
    // ignore unavailable storage
  }
  return DEFAULT_DEVICE_ID;
}

export const App: React.FC = () => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<DeviceId>(initialDevice);
  const [viewMode, setViewMode] = useState<ViewMode>('watch');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('studio');
  const [uploadedImage, setUploadedImage] = useState<UploadedImageInfo | null>(null);
  const [textureSource, setTextureSource] = useState<TextureSource>('sample');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [pxPerMm, setPxPerMm] = useState<number | null>(null); // non-null = real-size mode on
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationNotice, setCalibrationNotice] = useState<string | null>(null);
  const [safeZones, setSafeZones] = useState(false);

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

    if (!viewer.ready) {
      viewer.dispose();
      return;
    }
    viewerInstanceRef.current = viewer;
    if (import.meta.env.DEV) (window as unknown as { __wearview?: ThreeViewer }).__wearview = viewer;

    return () => {
      viewer.dispose();
      viewerInstanceRef.current = null;
    };
  }, []);

  // Handle generalized image loading
  const loadTokenRef = useRef(0);
  const handleLoadImage = useCallback(async (file: File, source: TextureSource = 'user') => {
    setErrorMessage(null);
    const token = ++loadTokenRef.current;
    try {
      const info = await loadScreenshotTexture(file);
      if (token !== loadTokenRef.current) {
        disposeUploadedTexture(info);
        return;
      }
      setUploadedImage((prev) => {
        if (prev) {
          disposeUploadedTexture(prev);
        }
        return info;
      });
      setTextureSource(source);
    } catch (err) {
      if (token !== loadTokenRef.current) return;
      const msg = err instanceof Error ? err.message : 'Failed to load image file.';
      setErrorMessage(msg);
    }
  }, []);

  // Handle user-dropped or picked file
  const handleImageSelected = useCallback((file: File) => {
    handleLoadImage(file, 'user');
  }, [handleLoadImage]);

  // Handle image removal
  const handleImageRemoved = useCallback(() => {
    loadTokenRef.current++;
    setUploadedImage((prev) => {
      if (prev) {
        disposeUploadedTexture(prev);
      }
      return null;
    });
    setTextureSource(null);
    setErrorMessage(null);
  }, []);

  const currentDeviceSpec = getDeviceSpec(selectedDeviceId);

  // Handle QA test pattern loading matching active device screen resolution and physical metadata
  const handleLoadTestPattern = useCallback(async () => {
    setErrorMessage(null);
    try {
      const testFile = await createTestPatternFile({
        size: currentDeviceSpec.resolutionPx.width,
        widthPx: currentDeviceSpec.resolutionPx.width,
        heightPx: currentDeviceSpec.resolutionPx.height,
        displayDiameterMm: currentDeviceSpec.activeDisplayDiameterMm,
        ppi: currentDeviceSpec.ppi,
        deviceName: currentDeviceSpec.shortLabel,
      });
      await handleLoadImage(testFile, 'test-pattern');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate test pattern.';
      setErrorMessage(msg);
    }
  }, [currentDeviceSpec, handleLoadImage]);

  // Handle Sample Game (Cyberpunk 3D) loading
  const handleLoadSampleGame = useCallback(async () => {
    setErrorMessage(null);
    try {
      const response = await fetch('./cyberpunk3d-screen2-full.webp');
      if (!response.ok) throw new Error('Could not fetch sample game image.');
      const blob = await response.blob();
      const defaultFile = new File([blob], 'cyberpunk3d-screen2-full.webp', {
        type: 'image/webp'
      });
      await handleLoadImage(defaultFile, 'sample');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load sample game.';
      setErrorMessage(msg);
    }
  }, [handleLoadImage]);

  // Auto-load default Cyberpunk screenshot on initial mount
  useEffect(() => {
    handleLoadSampleGame();
  }, [handleLoadSampleGame]);

  // Update device model and auto-regenerate test pattern if active
  const lastDeviceRef = useRef<DeviceId | null>(null);
  useEffect(() => {
    const deviceChanged = lastDeviceRef.current !== selectedDeviceId;
    lastDeviceRef.current = selectedDeviceId;
    if (!deviceChanged) return;
    if (viewerInstanceRef.current) {
      viewerInstanceRef.current.loadDevice(selectedDeviceId);
    }
    try {
      window.localStorage.setItem(DEVICE_STORAGE_KEY, selectedDeviceId);
    } catch {
      // ignore unavailable storage
    }

    // Auto-regenerate test pattern for new watch dimensions
    if (textureSource === 'test-pattern') {
      const spec = getDeviceSpec(selectedDeviceId);
      createTestPatternFile({
        size: spec.resolutionPx.width,
        widthPx: spec.resolutionPx.width,
        heightPx: spec.resolutionPx.height,
        displayDiameterMm: spec.activeDisplayDiameterMm,
        ppi: spec.ppi,
        deviceName: spec.shortLabel,
      })
        .then((file) => handleLoadImage(file, 'test-pattern'))
        .catch((err) => console.warn('Failed to auto-regenerate test pattern:', err));
    }
  }, [selectedDeviceId, textureSource, handleLoadImage]);

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

  // Handle camera reset
  const handleResetCamera = useCallback(() => {
    if (viewerInstanceRef.current) {
      viewerInstanceRef.current.resetCamera();
    }
  }, []);

  // Handle camera angle preset
  const handleCameraAngle = useCallback((angle: 'front' | 'tilt' | 'side') => {
    if (pxPerMm !== null && angle !== 'front') {
      setPxPerMm(null);
    }
    viewerInstanceRef.current?.setCameraAngle(angle);
  }, [pxPerMm]);

  // Handle safe-zone overlay toggle
  const handleToggleSafeZones = useCallback(() => {
    setSafeZones((prev) => {
      const next = !prev;
      viewerInstanceRef.current?.setSafeZonesEnabled(next);
      return next;
    });
  }, []);

  // Handle high-resolution PNG snapshot export
  const handleExportPng = useCallback(() => {
    viewerInstanceRef.current?.exportPngSnapshot();
  }, []);

  const handleSelectDevice = useCallback((id: DeviceId | string) => {
    setSelectedDeviceId(normalizeDeviceId(id));
  }, []);

  // Centralized keyboard shortcuts (disabled while the calibration dialog is open)
  useEffect(() => {
    if (calibrating) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      handleGlobalKeyDown(e, {
        exportPng: handleExportPng,
        toggleSafeZones: handleToggleSafeZones,
        resetCamera: handleResetCamera,
        toggleViewMode: () => setViewMode((m) => (m === 'watch' ? 'wrist' : 'watch')),
        setCameraAngle: handleCameraAngle,
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calibrating, handleExportPng, handleToggleSafeZones, handleResetCamera, handleCameraAngle]);

  const resolutionWarning = uploadedImage
    ? checkScreenshotResolution(uploadedImage.width, uploadedImage.height, currentDeviceSpec.resolutionPx).warning
    : null;

  return (
    <div className="app-container">
      <Header
        selectedDeviceId={selectedDeviceId}
        onSelectDevice={handleSelectDevice}
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
            safeZones={safeZones}
            onToggleSafeZones={handleToggleSafeZones}
            onSelectCameraAngle={handleCameraAngle}
            onExportPng={handleExportPng}
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
              onLoadSampleGame={handleLoadSampleGame}
              activeSource={textureSource}
              errorMessage={errorMessage}
              resolutionWarning={resolutionWarning}
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
