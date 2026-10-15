import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type * as THREE from 'three';
import type { DeviceId, LightingPreset, ViewMode } from '../types';
import { ThreeViewer } from '../viewer/ThreeViewer';
import type { PixelMode, ScreenSource } from '../textures/screenTexture';

export interface ViewerPaneHandle {
  viewer: ThreeViewer | null;
}

interface ViewerPaneProps {
  deviceId: DeviceId;
  lighting: LightingPreset;
  viewMode: ViewMode;
  safeZones: boolean;
  pxPerMm: number | null;
  source: ScreenSource | null;
  pixelMode: PixelMode;
  onInitError: (message: string) => void;
  onCameraChange?: (position: THREE.Vector3, target: THREE.Vector3) => void;
  /** Exposed on window in dev builds for QA scripts. */
  debugName?: string;
}

/** One 3D viewport. Owns a ThreeViewer and mirrors props into it. */
export const ViewerPane = forwardRef<ViewerPaneHandle, ViewerPaneProps>(function ViewerPane(props, ref) {
  const mountRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ThreeViewer | null>(null);
  const loadedDevice = useRef<DeviceId | null>(null);
  const latest = useRef(props);
  latest.current = props;

  useImperativeHandle(ref, () => ({
    get viewer() {
      return viewerRef.current;
    },
  }), []);

  useEffect(() => {
    if (!mountRef.current) return;
    const p = latest.current;
    const viewer = new ThreeViewer({
      container: mountRef.current,
      initialDeviceId: p.deviceId,
      initialLighting: p.lighting,
      initialViewMode: p.viewMode,
      onInitError: (err) => latest.current.onInitError(err.message),
      onCameraChange: (pos, target) => latest.current.onCameraChange?.(pos, target),
    });
    if (!viewer.ready) {
      viewer.dispose();
      return;
    }
    loadedDevice.current = p.deviceId;
    viewer.setPixelMode(p.pixelMode);
    viewer.setScreenSource(p.source);
    viewer.setSafeZonesEnabled(p.safeZones);
    viewer.setRealScale(p.pxPerMm);
    viewerRef.current = viewer;
    const debugName = p.debugName;
    if (import.meta.env.DEV && debugName) (window as unknown as Record<string, unknown>)[debugName] = viewer;

    return () => {
      viewer.dispose();
      viewerRef.current = null;
      loadedDevice.current = null;
    };
  }, []);

  const { deviceId, lighting, viewMode, safeZones, pxPerMm, source, pixelMode } = props;

  useEffect(() => {
    if (!viewerRef.current || loadedDevice.current === deviceId) return;
    loadedDevice.current = deviceId;
    viewerRef.current.loadDevice(deviceId);
  }, [deviceId]);

  useEffect(() => viewerRef.current?.setLightingPreset(lighting), [lighting]);
  useEffect(() => viewerRef.current?.setViewMode(viewMode), [viewMode]);
  useEffect(() => viewerRef.current?.setSafeZonesEnabled(safeZones), [safeZones]);
  useEffect(() => viewerRef.current?.setRealScale(pxPerMm), [pxPerMm]);
  useEffect(() => viewerRef.current?.setPixelMode(pixelMode), [pixelMode]);
  useEffect(() => viewerRef.current?.setScreenSource(source), [source]);

  return <div ref={mountRef} className="canvas-mount" />;
});
