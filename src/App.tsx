import React, { useEffect, useRef, useState, useCallback } from 'react';
import type * as THREE from 'three';
import type { DeviceId, LightingPreset, ViewMode } from './types';
import { DEFAULT_DEVICE_ID, DEVICE_LIST, getDeviceSpec, normalizeDeviceId } from './devices';
import { guessPxPerMm, loadAnyCalibration, loadCalibration, saveCalibration } from './calibration/calibration';
import { CalibrationDialog } from './components/CalibrationDialog';
import { CropDialog } from './components/CropDialog';
import {
  fileFromClipboard,
  freezeLiveSource,
  isWindowCaptureSupported,
  loadScreenSource,
  startWindowCapture,
  stopScreenSource,
} from './textures/textureLoader';
import { visibleSize, type CropRect, type PixelMode, type ScreenSource } from './textures/screenTexture';
import { createTestPatternFile } from './textures/testPattern';
import { checkScreenshotResolution } from './textures/validator';
import { DeviceOptions, Header } from './components/Header';
import { ControlsBar } from './components/ControlsBar';
import { ScreenshotUploader, type TextureSource } from './components/ScreenshotUploader';
import { DeviceSpecDrawer } from './components/DeviceSpecDrawer';
import { SpecPill, ViewportOverlay } from './components/ViewportOverlay';
import { ViewerPane, type ViewerPaneHandle } from './components/ViewerPane';
import { FingerCalibrator } from './components/FingerCalibrator';
import { AodDialog } from './components/AodDialog';
import { analyzeScreenElementAod, type AodAnalysisResult } from './utils/aodAnalysis';
import { handleGlobalKeyDown } from './utils/keyboard';
import { parseHash, toHash, type ShareableState } from './utils/urlState';
import 'wrist-pocket-ui/tokens.css';
import './styles/theme.css';

const DEVICE_STORAGE_KEY = 'wearview.device';
type CameraAngle = 'front' | 'tilt' | 'side';

function initialState(): ShareableState {
  let device: DeviceId = DEFAULT_DEVICE_ID;
  try {
    const saved = window.localStorage.getItem(DEVICE_STORAGE_KEY);
    if (saved) device = normalizeDeviceId(saved);
  } catch {
    // ignore unavailable storage
  }
  return parseHash(window.location.hash, {
    device,
    compareDevice: null,
    lighting: 'studio',
    viewMode: 'watch',
    safeZones: false,
    pixelMode: 'smooth',
  });
}

/** A different watch to compare against: the first one from another family, so the contrast is useful. */
function defaultCompareDevice(primary: DeviceId): DeviceId {
  const spec = getDeviceSpec(primary);
  return (DEVICE_LIST.find((d) => d.familyGroup !== spec.familyGroup) ?? DEVICE_LIST[0]).id;
}

function testPatternFor(id: DeviceId): Promise<File> {
  const spec = getDeviceSpec(id);
  return createTestPatternFile({
    size: spec.resolutionPx.width,
    widthPx: spec.resolutionPx.width,
    heightPx: spec.resolutionPx.height,
    displayDiameterMm: spec.activeDisplayDiameterMm,
    ppi: spec.ppi,
    deviceName: spec.shortLabel,
  });
}

export const App: React.FC = () => {
  const [initial] = useState(initialState);
  const [selectedDeviceId, setSelectedDeviceId] = useState<DeviceId>(initial.device);
  const [compareDeviceId, setCompareDeviceId] = useState<DeviceId | null>(initial.compareDevice);
  const [viewMode, setViewMode] = useState<ViewMode>(initial.viewMode);
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>(initial.lighting);
  const [safeZones, setSafeZones] = useState(initial.safeZones);
  const [pixelMode, setPixelMode] = useState<PixelMode>(initial.pixelMode);
  const [source, setSource] = useState<ScreenSource | null>(null);
  const [textureSource, setTextureSource] = useState<TextureSource>('sample');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [pxPerMm, setPxPerMm] = useState<number | null>(null); // non-null = real-size mode on
  const [calibrating, setCalibrating] = useState(false);
  const [cropping, setCropping] = useState(false);
  const [calibrationNotice, setCalibrationNotice] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [fingerPad, setFingerPad] = useState(false);
  const [glancing, setGlancing] = useState(false);
  const [glanceTimeLeft, setGlanceTimeLeft] = useState<number | null>(null);
  const [aodAnalysis, setAodAnalysis] = useState<AodAnalysisResult | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const primaryRef = useRef<ViewerPaneHandle>(null);
  const compareRef = useRef<ViewerPaneHandle>(null);
  const viewers = useCallback(
    () => [primaryRef.current?.viewer, compareRef.current?.viewer].filter((v) => !!v),
    []
  );

  // ---------------------------------------------------------------- screen source

  const sourceRef = useRef(source);
  sourceRef.current = source;

  // Only one source at a time: a replaced live capture is stopped
  const replaceSource = useCallback((next: ScreenSource | null, kind: TextureSource) => {
    const prev = sourceRef.current;
    if (prev && prev !== next) stopScreenSource(prev);
    sourceRef.current = next;
    setSource(next);
    setTextureSource(kind);
  }, []);

  /** Ends a live capture but keeps its last frame on the display. */
  const freezeLive = useCallback(() => {
    const prev = sourceRef.current;
    if (!prev?.live) return;
    const still = freezeLiveSource(prev);
    sourceRef.current = still;
    setSource(still);
  }, []);

  const loadTokenRef = useRef(0);
  const handleLoadImage = useCallback(async (file: File, kind: TextureSource = 'user') => {
    setErrorMessage(null);
    const token = ++loadTokenRef.current;
    try {
      const next = await loadScreenSource(file);
      if (token !== loadTokenRef.current) return;
      replaceSource(next, kind);
    } catch (err) {
      if (token !== loadTokenRef.current) return;
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load image file.');
    }
  }, [replaceSource]);

  const handleImageSelected = useCallback((file: File) => {
    handleLoadImage(file, 'user');
  }, [handleLoadImage]);

  const handleImageRemoved = useCallback(() => {
    loadTokenRef.current++;
    replaceSource(null, null);
    setErrorMessage(null);
  }, [replaceSource]);

  const handleLoadTestPattern = useCallback(async () => {
    setErrorMessage(null);
    try {
      await handleLoadImage(await testPatternFor(selectedDeviceId), 'test-pattern');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to generate test pattern.');
    }
  }, [selectedDeviceId, handleLoadImage]);

  const handleLoadSampleGame = useCallback(async () => {
    setErrorMessage(null);
    try {
      const response = await fetch('./cyberpunk3d-screen2-full.webp');
      if (!response.ok) throw new Error('Could not fetch sample game image.');
      const blob = await response.blob();
      await handleLoadImage(new File([blob], 'cyberpunk3d-screen2-full.webp', { type: 'image/webp' }), 'sample');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load sample game.');
    }
  }, [handleLoadImage]);

  // Sample screen on first load
  useEffect(() => {
    handleLoadSampleGame();
  }, [handleLoadSampleGame]);

  const handleCaptureWindow = useCallback(async () => {
    setErrorMessage(null);
    loadTokenRef.current++;
    try {
      const live = await startWindowCapture();
      // The user pressed "Stop sharing" in the browser: keep the last frame on screen
      live.stream?.getVideoTracks()[0]?.addEventListener('ended', () => {
        if (sourceRef.current?.stream === live.stream) freezeLive();
      });
      replaceSource(live, 'live');
      setCropping(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not start window capture.');
    }
  }, [replaceSource, freezeLive]);

  const handleCropApplied = useCallback((crop: CropRect | null) => {
    setCropping(false);
    setSource((prev) => (prev ? { ...prev, crop } : prev));
  }, []);

  // Stop a running capture when the app goes away
  useEffect(() => () => stopScreenSource(sourceRef.current), []);

  // Paste an image from the clipboard anywhere on the page
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = fileFromClipboard(e.clipboardData);
      if (!file) return;
      e.preventDefault();
      handleLoadImage(file, 'user');
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [handleLoadImage]);

  // Public postMessage frame receiver (WP-1.2) for Watch Deploy and UI Blueprint
  useEffect(() => {
    const onMessage = async (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== 'object') return;

      const payloadImage = data.image || data.blob;
      const payloadName = data.name || data.label || 'imported-frame.png';
      if (data.type === 'wearview:frame' && payloadImage) {
        try {
          let file: File;
          if (typeof payloadImage === 'string') {
            const res = await fetch(payloadImage);
            const blob = await res.blob();
            file = new File([blob], payloadName, { type: blob.type || 'image/png' });
          } else if (payloadImage instanceof Blob) {
            file = new File([payloadImage], payloadName, { type: payloadImage.type || 'image/png' });
          } else if (payloadImage instanceof ArrayBuffer || ArrayBuffer.isView(payloadImage)) {
            const buf = payloadImage instanceof ArrayBuffer
              ? payloadImage
              : (payloadImage.buffer.slice(payloadImage.byteOffset, payloadImage.byteOffset + payloadImage.byteLength) as ArrayBuffer);
            const blob = new Blob([buf], { type: 'image/png' });
            file = new File([blob], payloadName, { type: 'image/png' });
          } else {
            return;
          }
          handleLoadImage(file, 'user');
          if (e.source && 'postMessage' in e.source) {
            (e.source as Window).postMessage({ type: 'wearview:ack', ok: true }, '*');
          }
        } catch (err) {
          console.warn('Failed to load frame from postMessage:', err);
        }
      }

      if (data.type === 'wearview:ping' && e.source && 'postMessage' in e.source) {
        (e.source as Window).postMessage({ type: 'wearview:pong', ready: true }, '*');
      }
    };

    window.addEventListener('message', onMessage);
    if (window.opener) {
      try {
        window.opener.postMessage({ type: 'wearview:ready' }, '*');
      } catch { /* ignore */ }
    }
    return () => window.removeEventListener('message', onMessage);
  }, [handleLoadImage]);

  // 2-Second Glanceability Test (WP-4.1)
  const handleStartGlance = useCallback(() => {
    if (glancing) return;
    setGlancing(true);
    setGlanceTimeLeft(2.0);

    // 1. Tilt away to simulate natural resting position
    viewers().forEach((v) => v.setCameraAngle('tilt'));

    // 2. Wrist raise to front view (0°) after 300ms
    window.setTimeout(() => {
      viewers().forEach((v) => v.setCameraAngle('front'));

      // 3. 2.0s glance window
      const start = Date.now();
      const interval = window.setInterval(() => {
        const elapsed = (Date.now() - start) / 1000;
        const rem = Math.max(0, 2.0 - elapsed);
        setGlanceTimeLeft(Number(rem.toFixed(1)));
        if (rem <= 0) {
          window.clearInterval(interval);
          viewers().forEach((v) => v.setCameraAngle('tilt'));
          setGlancing(false);
          setGlanceTimeLeft(null);
        }
      }, 100);
    }, 350);
  }, [glancing, viewers]);

  // Always-On Display (AOD) OPR% Analysis (WP-4.1)
  const handleOpenAod = useCallback(() => {
    if (!source?.element) {
      setErrorMessage('Load or paste a screenshot first to inspect AOD On-Pixel Ratio (OPR %).');
      return;
    }
    const res = analyzeScreenElementAod(source.element);
    if (res) {
      setAodAnalysis(res);
    } else {
      setErrorMessage('Could not extract pixel data for AOD analysis.');
    }
  }, [source]);

  // ---------------------------------------------------------------- devices

  const currentDeviceSpec = getDeviceSpec(selectedDeviceId);
  const compareSpec = compareDeviceId ? getDeviceSpec(compareDeviceId) : null;

  // The QA pattern is drawn for one panel; regenerate it when the primary watch changes
  const lastDeviceRef = useRef<DeviceId>(selectedDeviceId);
  useEffect(() => {
    if (lastDeviceRef.current === selectedDeviceId) return;
    lastDeviceRef.current = selectedDeviceId;
    try {
      window.localStorage.setItem(DEVICE_STORAGE_KEY, selectedDeviceId);
    } catch {
      // ignore unavailable storage
    }
    if (textureSource === 'test-pattern') {
      testPatternFor(selectedDeviceId)
        .then((file) => handleLoadImage(file, 'test-pattern'))
        .catch((err) => console.warn('Failed to auto-regenerate test pattern:', err));
    }
  }, [selectedDeviceId, textureSource, handleLoadImage]);

  const handleSelectDevice = useCallback((id: DeviceId | string) => {
    setSelectedDeviceId(normalizeDeviceId(id));
  }, []);

  const handleToggleCompare = useCallback(() => {
    setCompareDeviceId((prev) => (prev ? null : defaultCompareDevice(selectedDeviceId)));
  }, [selectedDeviceId]);

  // Keep the two cameras locked together while either one is dragged
  const syncFromPrimary = useCallback((pos: THREE.Vector3, target: THREE.Vector3) => {
    compareRef.current?.viewer?.syncCamera(pos, target);
  }, []);
  const syncFromCompare = useCallback((pos: THREE.Vector3, target: THREE.Vector3) => {
    primaryRef.current?.viewer?.syncCamera(pos, target);
  }, []);

  // ---------------------------------------------------------------- shareable state

  useEffect(() => {
    const hash = toHash({
      device: selectedDeviceId,
      compareDevice: compareDeviceId,
      lighting: lightingPreset,
      viewMode,
      safeZones,
      pixelMode,
    });
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
    }
  }, [selectedDeviceId, compareDeviceId, lightingPreset, viewMode, safeZones, pixelMode]);

  // A shared link pasted into an open tab only changes the hash
  const stateRef = useRef<ShareableState>(initial);
  stateRef.current = {
    device: selectedDeviceId,
    compareDevice: compareDeviceId,
    lighting: lightingPreset,
    viewMode,
    safeZones,
    pixelMode,
  };
  useEffect(() => {
    const onHashChange = () => {
      // Links omit default values, so a missing key means "default", not "keep current"
      const next = parseHash(window.location.hash, {
        device: stateRef.current.device,
        compareDevice: null,
        lighting: 'studio',
        viewMode: 'watch',
        safeZones: false,
        pixelMode: 'smooth',
      });
      setSelectedDeviceId(next.device);
      setCompareDeviceId(next.compareDevice);
      setLightingPreset(next.lighting);
      setViewMode(next.viewMode);
      setSafeZones(next.safeZones);
      setPixelMode(next.pixelMode);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus('Link copied');
    } catch {
      setShareStatus('Copy failed');
    }
    window.setTimeout(() => setShareStatus(null), 2000);
  }, []);

  // ---------------------------------------------------------------- real size (1:1)

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

  // ---------------------------------------------------------------- camera & tools

  const handleResetCamera = useCallback(() => {
    viewers().forEach((v) => v.resetCamera());
  }, [viewers]);

  const handleCameraAngle = useCallback((angle: CameraAngle) => {
    viewers().forEach((v) => v.setCameraAngle(angle));
  }, [viewers]);

  const handleToggleSafeZones = useCallback(() => setSafeZones((prev) => !prev), []);
  const handleTogglePixelMode = useCallback(() => setPixelMode((m) => (m === 'native' ? 'smooth' : 'native')), []);

  const handleExportPng = useCallback(() => {
    const active = viewers();
    if (active.length === 2) {
      active[0].exportComparePngSnapshot(active[1], lightingPreset);
    } else {
      active[0]?.exportPngSnapshot();
    }
  }, [viewers, lightingPreset]);

  const handleOpenCrop = useCallback(() => {
    if (sourceRef.current) setCropping(true);
  }, []);

  // Centralized keyboard shortcuts (disabled while a dialog is open)
  useEffect(() => {
    if (calibrating || cropping) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      handleGlobalKeyDown(e, {
        exportPng: handleExportPng,
        toggleSafeZones: handleToggleSafeZones,
        resetCamera: handleResetCamera,
        toggleViewMode: () => setViewMode((m) => (m === 'watch' ? 'wrist' : 'watch')),
        setCameraAngle: handleCameraAngle,
        toggleCompare: handleToggleCompare,
        togglePixelMode: handleTogglePixelMode,
        openCrop: handleOpenCrop,
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [calibrating, cropping, handleExportPng, handleToggleSafeZones, handleResetCamera, handleCameraAngle,
    handleToggleCompare, handleTogglePixelMode, handleOpenCrop]);

  // ---------------------------------------------------------------- drop onto the 3D view

  const stageDragProps = {
    onDragOver: (e: React.DragEvent) => {
      if (!Array.from(e.dataTransfer.types).includes('Files')) return;
      e.preventDefault();
      setDropActive(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropActive(false);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDropActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleLoadImage(file, 'user');
    },
  };

  const shown = source ? visibleSize(source) : null;
  const resolutionWarning = shown
    ? checkScreenshotResolution(shown.width, shown.height, currentDeviceSpec.resolutionPx).warning
    : null;

  const paneProps = {
    lighting: lightingPreset,
    viewMode,
    safeZones,
    pxPerMm,
    source,
    pixelMode,
    onInitError: setWebglError,
  };

  return (
    <div className="app-container">
      <Header
        selectedDeviceId={selectedDeviceId}
        onSelectDevice={handleSelectDevice}
        onResetCamera={handleResetCamera}
        onShare={handleShare}
        shareStatus={shareStatus}
        onExportPng={handleExportPng}
      />

      <main className="app-workspace">
        <section className="stage" aria-label="3D preview" {...stageDragProps}>
          <div
            ref={viewportRef}
            className={`viewport-container ${compareSpec ? 'compare' : ''}`}
            data-lighting={lightingPreset}
          >
            <FingerCalibrator
              enabled={fingerPad}
              pxPerMm={pxPerMm}
              containerRef={viewportRef}
            />
            {glanceTimeLeft !== null && (
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1.5px solid #3b82f6',
                  borderRadius: '20px',
                  padding: '6px 18px',
                  color: '#38bdf8',
                  fontWeight: 700,
                  fontSize: '13px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                  zIndex: 40,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>⏱ Glance Test:</span>
                <span style={{ color: '#ffffff', minWidth: '32px' }}>{glanceTimeLeft.toFixed(1)}s</span>
              </div>
            )}
            <div className="viewer-slot">
              <ViewerPane
                ref={primaryRef}
                deviceId={selectedDeviceId}
                onCameraChange={compareSpec ? syncFromPrimary : undefined}
                debugName="__wearview"
                {...paneProps}
              />
              {!webglError && <SpecPill spec={currentDeviceSpec} />}
            </div>

            {compareSpec && compareDeviceId && (
              <div className="viewer-slot">
                <ViewerPane
                  ref={compareRef}
                  deviceId={compareDeviceId}
                  onCameraChange={syncFromCompare}
                  debugName="__wearviewCompare"
                  {...paneProps}
                />
                {!webglError && (
                  <SpecPill spec={compareSpec}>
                    <label className="sr-only" htmlFor="compare-device">Compare with</label>
                    <select
                      id="compare-device"
                      className="compare-select"
                      value={compareDeviceId}
                      onChange={(e) => setCompareDeviceId(normalizeDeviceId(e.target.value))}
                    >
                      <DeviceOptions />
                    </select>
                  </SpecPill>
                )}
              </div>
            )}

            <ViewportOverlay
              deviceSpec={currentDeviceSpec}
              hasImage={source !== null}
              webglError={webglError}
              realSize={pxPerMm !== null}
              notice={calibrationNotice}
              onRecalibrate={() => setCalibrating(true)}
              onDismissNotice={() => setCalibrationNotice(null)}
            />

            {dropActive && <div className="drop-overlay">Drop image to preview</div>}
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
            nativePixels={pixelMode === 'native'}
            onToggleNativePixels={handleTogglePixelMode}
            compare={compareSpec !== null}
            onToggleCompare={handleToggleCompare}
            fingerPad={fingerPad}
            onToggleFingerPad={() => setFingerPad((p) => !p)}
            glancing={glancing}
            onStartGlance={handleStartGlance}
            onOpenAod={handleOpenAod}
          />
        </section>

        <aside className="sidebar-panel">
          <section className="panel-section">
            <div className="section-label">
              <span>Game screen</span>
            </div>
            <ScreenshotUploader
              source={source}
              onImageSelected={handleImageSelected}
              onImageRemoved={handleImageRemoved}
              onLoadTestPattern={handleLoadTestPattern}
              onLoadSampleGame={handleLoadSampleGame}
              onCaptureWindow={isWindowCaptureSupported() ? handleCaptureWindow : undefined}
              onStopCapture={freezeLive}
              onCrop={handleOpenCrop}
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

      {cropping && source && (
        <CropDialog source={source} onApply={handleCropApplied} onCancel={() => setCropping(false)} />
      )}

      {aodAnalysis && (
        <AodDialog analysis={aodAnalysis} onClose={() => setAodAnalysis(null)} />
      )}
    </div>
  );
};

export default App;
