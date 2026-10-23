import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { DeviceId, LightingPreset, ViewMode } from '../types';
import { createWatchMaterials, type WatchMaterials } from '../devices/materials';
import { buildDevice, DEFAULT_DEVICE_ID } from '../devices';
import type { DeviceModelResult } from '../devices/types';
import { WRIST_SECTION } from '../devices/geometry';
import { buildWristModel, type WristModelResult } from '../wrist/wristModel';
import { ScreenTexture, type PixelMode, type ScreenSource } from '../textures/screenTexture';

export interface ViewerOptions {
  container: HTMLElement;
  initialDeviceId?: DeviceId;
  initialLighting?: LightingPreset;
  initialViewMode?: ViewMode;
  renderer?: THREE.WebGLRenderer;
  onInitSuccess?: () => void;
  onInitError?: (error: Error) => void;
  /** Fired while the user drives this viewer's camera, so a second viewer can follow it. */
  onCameraChange?: (position: THREE.Vector3, target: THREE.Vector3) => void;
}

interface LightingConfig {
  keyColor: number;
  keyIntensity: number;
  keyDirection: THREE.Vector3;
  hemiSky: number;
  hemiGround: number;
  hemiIntensity: number;
  envIntensity: number;
  glassReflection: number;
  exposure: number;
  shadowOpacity: number;
}

const LIGHTING: Record<LightingPreset, LightingConfig> = {
  studio: {
    keyColor: 0xffffff,
    keyIntensity: 1.6,
    keyDirection: new THREE.Vector3(0.45, 1.0, 0.55),
    hemiSky: 0xffffff,
    hemiGround: 0x444850,
    hemiIntensity: 0.35,
    envIntensity: 0.9,
    glassReflection: 0.6,
    exposure: 1.0,
    shadowOpacity: 0.28,
  },
  sunlight: {
    keyColor: 0xfff1dc,
    keyIntensity: 4.2,
    keyDirection: new THREE.Vector3(-0.35, 1.0, 0.45),
    hemiSky: 0xbcd6ff,
    hemiGround: 0x6b5e4e,
    hemiIntensity: 0.6,
    envIntensity: 1.25,
    glassReflection: 1.0,
    exposure: 1.0,
    shadowOpacity: 0.42,
  },
  night: {
    keyColor: 0x9fb4ff,
    keyIntensity: 0.35,
    keyDirection: new THREE.Vector3(-0.6, 0.8, -0.4),
    hemiSky: 0x1c2440,
    hemiGround: 0x050608,
    hemiIntensity: 0.2,
    envIntensity: 0.55,
    glassReflection: 0.8,
    exposure: 1.0,
    shadowOpacity: 0.18,
  },
};

interface CameraHome {
  target: THREE.Vector3;
  direction: THREE.Vector3;
  radius: number;
}

// Framing per mode: what must fit in view (sphere radius around target, mm)
const HOMES: Record<ViewMode, CameraHome> = {
  watch: { target: new THREE.Vector3(0, -9, 2), direction: new THREE.Vector3(0.32, 0.9, 0.78).normalize(), radius: 37 },
  wrist: { target: new THREE.Vector3(22, -16, 0), direction: new THREE.Vector3(-0.05, 1.15, 0.85).normalize(), radius: 82 },
};

const FLY_MS = 650;
const MIN_DISTANCE = 40;
const MAX_DISTANCE = 520;
const DEFAULT_FOV = 30;
/** Narrow lens in real-size mode keeps perspective distortion of the 10 mm-deep watch under ~1%. */
const REAL_SIZE_FOV = 8;

export function computeRealSizeCameraDistance(heightCss: number, vFovDeg: number, pxPerMm: number): number {
  const vFov = THREE.MathUtils.degToRad(vFovDeg);
  return heightCss / (2 * Math.tan(vFov / 2) * pxPerMm);
}

export const MIN_POLAR_OFFSET_RAD = 0.005;

export function getSafeCameraDirection(
  cameraPos: THREE.Vector3,
  target: THREE.Vector3,
  up = new THREE.Vector3(0, 1, 0)
): THREE.Vector3 {
  const dir = cameraPos.clone().sub(target);
  if (dir.lengthSq() < 1e-6 || !Number.isFinite(dir.x) || !Number.isFinite(dir.y) || !Number.isFinite(dir.z)) {
    return new THREE.Vector3(0, Math.cos(MIN_POLAR_OFFSET_RAD), Math.sin(MIN_POLAR_OFFSET_RAD)).normalize();
  }
  dir.normalize();
  if (Math.abs(dir.dot(up)) > 0.9999) {
    return new THREE.Vector3(0, Math.cos(MIN_POLAR_OFFSET_RAD), Math.sin(MIN_POLAR_OFFSET_RAD)).normalize();
  }
  return dir;
}

export function computeCameraPresetPose(
  target: THREE.Vector3,
  angle: 'front' | 'tilt' | 'side' | 'tilt35' | 'side75',
  distance: number
): { position: THREE.Vector3; target: THREE.Vector3; dir: THREE.Vector3 } {
  let dir: THREE.Vector3;
  if (angle === 'front') {
    dir = new THREE.Vector3(0, Math.cos(MIN_POLAR_OFFSET_RAD), Math.sin(MIN_POLAR_OFFSET_RAD)).normalize();
  } else if (angle === 'tilt' || angle === 'tilt35') {
    const rad = (35 * Math.PI) / 180;
    dir = new THREE.Vector3(0, Math.cos(rad), Math.sin(rad)).normalize();
  } else {
    const elev = ((90 - 75) * Math.PI) / 180;
    const horiz = Math.cos(elev);
    const azimuth = (28 * Math.PI) / 180;
    dir = new THREE.Vector3(horiz * Math.sin(azimuth), Math.sin(elev), horiz * Math.cos(azimuth)).normalize();
  }
  const position = target.clone().addScaledVector(dir, distance);
  return { position, target: target.clone(), dir };
}

export class ThreeViewer {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private envMaps: Partial<Record<LightingPreset, THREE.Texture>> = {};
  /** Reflection maps for the cover glass: mostly dark with crisp light shapes, so the glass reads glossy, not hazy. */
  private glassEnvMaps: Partial<Record<LightingPreset, THREE.Texture>> = {};
  /** CSS pixels per millimetre when real-size (1:1) mode is on. */
  private realScale: number | null = null;
  private keyLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private groundShadowMesh!: THREE.Mesh<THREE.PlaneGeometry, THREE.ShadowMaterial>;

  private materials: WatchMaterials;
  private currentDeviceModel: DeviceModelResult | null = null;
  private wristModel: WristModelResult | null = null;
  private screen: ScreenTexture | null = null;
  private pixelMode: PixelMode = 'smooth';
  private onCameraChange?: (position: THREE.Vector3, target: THREE.Vector3) => void;
  /** True after the user grabbed this viewer's controls; cleared when another viewer drives. */
  private driving = false;
  private applyingSync = false;
  private currentLightingPreset: LightingPreset;
  private viewMode: ViewMode;
  private safeZoneMesh: THREE.Mesh | null = null;
  private safeZonesEnabled = false;

  /** False when WebGL/scene initialisation failed; every public call is then a no-op. */
  public ready = false;
  private needsRender = true;
  private userMovedCamera = false;
  private fly: {
    fromPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toPos: THREE.Vector3;
    toTarget: THREE.Vector3;
    start: number;
    lockDistance?: number;
  } | null = null;
  private readonly reducedMotion =
    typeof window === 'undefined' || Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  constructor(options: ViewerOptions) {
    this.container = options.container;
    this.currentLightingPreset = options.initialLighting || 'studio';
    this.viewMode = options.initialViewMode || 'watch';
    this.materials = createWatchMaterials();
    this.onCameraChange = options.onCameraChange;

    try {
      this.screen = new ScreenTexture();
      this.initRenderer(options.renderer);
      this.initScene();
      this.initCameraAndControls();
      this.initLighting();

      this.wristModel = buildWristModel(this.materials);
      this.scene.add(this.wristModel.group);
      this.wristModel.group.visible = this.viewMode === 'wrist';

      this.loadDevice(options.initialDeviceId || DEFAULT_DEVICE_ID);
      this.applyLightingPreset(this.currentLightingPreset);
      this.jumpToHome();

      this.setupResizeObserver();
      this.animate();
      this.ready = true;
      options.onInitSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize 3D WebGL scene.');
      if (options.onInitError) options.onInitError(error);
      else console.error(error);
    }
  }

  // ---------------------------------------------------------------- setup

  private initRenderer(customRenderer?: THREE.WebGLRenderer): void {
    if (customRenderer) {
      this.renderer = customRenderer;
      return;
    }

    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) {
      throw new Error('WebGL is not supported or disabled in your browser.');
    }

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.AgXToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = this.renderer.domElement;
    // The canvas always fills its container; the drawing buffer is resized separately
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.addEventListener('webglcontextlost', this.onContextLost);
    canvas.addEventListener('webglcontextrestored', this.onContextRestored);

    this.container.replaceChildren(canvas);
    this.renderer.setSize(Math.max(1, this.container.clientWidth), Math.max(1, this.container.clientHeight), false);
  }

  private initScene(): void {
    this.scene = new THREE.Scene();

    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      const room = new RoomEnvironment();
      this.envMaps.studio = pmrem.fromScene(room, 0.03).texture;
      room.dispose();

      const sun = buildSunlightEnvironment();
      this.envMaps.sunlight = pmrem.fromScene(sun.scene, 0.02).texture;
      sun.dispose();

      const night = buildNightEnvironment();
      this.envMaps.night = pmrem.fromScene(night.scene, 0.02).texture;
      this.glassEnvMaps.night = pmrem.fromScene(night.scene, 0).texture;
      night.dispose();

      const softbox = buildSoftboxEnvironment();
      this.glassEnvMaps.studio = pmrem.fromScene(softbox.scene, 0).texture;
      softbox.dispose();
      this.glassEnvMaps.sunlight = this.envMaps.sunlight;
      pmrem.dispose();
    } catch {
      // In headless test environments without WebGL PMREM compiling support
    }

    const shadowGeo = new THREE.PlaneGeometry(600, 600);
    shadowGeo.rotateX(-Math.PI / 2);
    this.groundShadowMesh = new THREE.Mesh(shadowGeo, new THREE.ShadowMaterial({ opacity: 0.3 }));
    this.groundShadowMesh.receiveShadow = true;
    this.scene.add(this.groundShadowMesh);
  }

  private initCameraAndControls(): void {
    this.camera = new THREE.PerspectiveCamera(DEFAULT_FOV, this.aspect(), 2.0, 1200.0);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.8;
    this.controls.zoomSpeed = 0.9;
    this.controls.minPolarAngle = MIN_POLAR_OFFSET_RAD;
    this.controls.maxPolarAngle = Math.PI * 0.62; // allow a little look from below the face plane
    this.controls.minDistance = MIN_DISTANCE;
    this.controls.maxDistance = MAX_DISTANCE;
    this.controls.screenSpacePanning = true;
    this.controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
    this.controls.addEventListener('start', this.onControlsStart);
    this.controls.addEventListener('change', this.onControlsChange);
  }

  private initLighting(): void {
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.set(2048, 2048);
    const cam = this.keyLight.shadow.camera;
    cam.left = -140;
    cam.right = 220;
    cam.top = 140;
    cam.bottom = -140;
    cam.near = 10;
    cam.far = 600;
    this.keyLight.shadow.bias = -0.0004;
    this.keyLight.shadow.normalBias = 0.4;
    this.keyLight.shadow.radius = 4;
    this.scene.add(this.keyLight);
    this.scene.add(this.keyLight.target);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
    this.scene.add(this.hemiLight);
  }

  // ---------------------------------------------------------------- public API

  public setLightingPreset(preset: LightingPreset): void {
    this.currentLightingPreset = preset;
    this.applyLightingPreset(preset);
  }

  public setViewMode(mode: ViewMode): void {
    if (mode === this.viewMode) return;
    this.viewMode = mode;
    if (this.wristModel) this.wristModel.group.visible = mode === 'wrist';
    this.updateGroundPlane();
    this.updateSafeZoneOverlay();
    this.flyToHome();
  }

  public setOnWrist(onWrist: boolean): void {
    this.setViewMode(onWrist ? 'wrist' : 'watch');
  }

  public loadDevice(deviceId: DeviceId): void {
    if (this.currentDeviceModel) {
      this.scene.remove(this.currentDeviceModel.group);
      this.disposeDeviceModel(this.currentDeviceModel);
      this.currentDeviceModel = null;
    }

    this.currentDeviceModel = buildDevice(deviceId, this.materials);
    this.scene.add(this.currentDeviceModel.group);

    this.updateSafeZoneOverlay();

    this.wristModel?.fitToWatch(this.currentDeviceModel.backY);
    this.updateGroundPlane();
    this.screen?.configure(this.pixelMode, this.currentDeviceModel.spec.resolutionPx.width);
    this.applyTextureToDisplay();
    if (this.realScale !== null) this.handleResize();
    this.requestRender();
  }

  public setDevice(deviceId: DeviceId): void {
    this.loadDevice(deviceId);
  }

  /** Shows an image or live capture on the display (null = screen off). */
  public setScreenSource(source: ScreenSource | null): void {
    if (!this.screen) return;
    this.screen.setSource(source);
    this.applyTextureToDisplay();
  }

  public setPixelMode(mode: PixelMode): void {
    this.pixelMode = mode;
    if (!this.screen || !this.currentDeviceModel) return;
    this.screen.configure(mode, this.currentDeviceModel.spec.resolutionPx.width);
    this.applyTextureToDisplay();
  }

  /** Follows a camera driven by another viewer (side-by-side compare). */
  public syncCamera(position: THREE.Vector3, target: THREE.Vector3): void {
    if (!this.ready) return;
    this.driving = false;
    this.fly = null;
    this.userMovedCamera = true;
    this.applyingSync = true;
    this.camera.position.copy(position);
    this.controls.target.copy(target);
    this.controls.update();
    this.applyingSync = false;
    this.requestRender();
  }

  public resetCamera(): void {
    this.userMovedCamera = false;
    this.flyToHome();
  }

  /**
   * Real-size (1:1) mode. `pxPerMm` is the calibrated number of CSS pixels per physical millimetre
   * on this screen; null turns the mode off. The camera looks straight at the face and its distance
   * is solved so the display plane is drawn at exactly that scale.
   */
  public setRealScale(pxPerMm: number | null): void {
    if (pxPerMm === null) {
      if (this.realScale === null) return;
      this.realScale = null;
      // Exit realSize mode: widen distance bounds, re-enable zoom and pan
      this.controls.minDistance = MIN_DISTANCE;
      this.controls.maxDistance = MAX_DISTANCE;
      this.controls.enableZoom = true;
      this.controls.enablePan = true;
      this.camera.fov = DEFAULT_FOV;
      this.camera.near = 2.0;
      this.camera.far = 1200.0;
      this.camera.updateProjectionMatrix();

      const target = this.displayPlaneTarget();
      const currentDist = this.camera.position.distanceTo(target);
      if (currentDist > 200) {
        const safeDir = getSafeCameraDirection(this.camera.position, target, this.camera.up);
        const comfortableDist = 110;
        this.camera.position.copy(target).addScaledVector(safeDir, comfortableDist);
        this.controls.target.copy(target);
        this.controls.update();
      }
      this.groundShadowMesh.visible = true;
      this.userMovedCamera = false;
      this.requestRender();
      return;
    }

    const validPxPerMm = pxPerMm > 0.5 ? pxPerMm : 3.7795;
    this.realScale = validPxPerMm;
    this.applyRealSize();
  }

  public setRealSizeMode(enabled: boolean, pxPerMm = 3.7795): void {
    this.setRealScale(enabled ? pxPerMm : null);
  }

  private applyRealSize(): void {
    if (this.realScale === null) return;
    const viewportHeightPx = (this.container && this.container.clientHeight > 0)
      ? this.container.clientHeight
      : 600;
    const pxPerMm = this.realScale > 0.5 ? this.realScale : 3.7795;
    this.camera.fov = REAL_SIZE_FOV;
    const distance = computeRealSizeCameraDistance(viewportHeightPx, this.camera.fov, pxPerMm);

    this.camera.near = 2.0;
    this.camera.far = Math.max(2000, distance * 3);
    this.camera.updateProjectionMatrix();

    // CRITICAL ORDER:
    // 1. Unclamp OrbitControls distance bounds first
    this.controls.minDistance = 0;
    this.controls.maxDistance = Infinity;

    // 2. Read target with forced matrix update
    const target = this.displayPlaneTarget();

    // 3. Obtain safe direction without gimbal lock or zero length
    const safeDir = getSafeCameraDirection(this.camera.position, target, this.camera.up);

    // 4. Update controls target and camera position
    this.controls.target.copy(target);
    this.camera.position.copy(target).addScaledVector(safeDir, distance);

    // 5. Lock distance bounds and disable zoom & pan
    this.controls.minDistance = distance;
    this.controls.maxDistance = distance;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.update();

    this.groundShadowMesh.visible = false;
    this.userMovedCamera = false;
    this.requestRender();
  }

  /** QA helper: on-screen diameter of the active display in CSS px (projected from the 3D model). */
  public measureDisplayDiameterPx(): number {
    if (!this.currentDeviceModel) return 0;
    const mesh = this.currentDeviceModel.displayMesh;
    mesh.geometry.computeBoundingSphere();
    const r = mesh.geometry.boundingSphere!.radius;
    mesh.updateWorldMatrix(true, false);
    const a = new THREE.Vector3(-r, 0, 0).applyMatrix4(mesh.matrixWorld).project(this.camera);
    const b = new THREE.Vector3(r, 0, 0).applyMatrix4(mesh.matrixWorld).project(this.camera);
    return (Math.abs(b.x - a.x) / 2) * this.container.clientWidth;
  }

  /** Whether real-size (1:1) mode is on. */
  public get isRealSize(): boolean {
    return this.realScale !== null;
  }

  public setSafeZonesEnabled(enabled: boolean): void {
    this.safeZonesEnabled = enabled;
    if (!this.safeZoneMesh && enabled && this.currentDeviceModel) {
      this.updateSafeZoneOverlay();
    } else if (this.safeZoneMesh) {
      this.safeZoneMesh.visible = enabled;
      this.requestRender();
    }
  }

  public isSafeZonesEnabled(): boolean {
    return this.safeZonesEnabled;
  }

  private updateSafeZoneOverlay(): void {
    if (this.safeZoneMesh) {
      this.scene.remove(this.safeZoneMesh);
      this.safeZoneMesh.geometry.dispose();
      const mat = this.safeZoneMesh.material as THREE.MeshBasicMaterial;
      mat.map?.dispose();
      mat.dispose();
      this.safeZoneMesh = null;
    }

    if (!this.currentDeviceModel) return;

    this.scene.updateMatrixWorld(true);
    const displayPos = new THREE.Vector3();
    this.currentDeviceModel.displayMesh.getWorldPosition(displayPos);
    const screenRadius = this.currentDeviceModel.spec.activeDisplayDiameterMm / 2;

    this.safeZoneMesh = createSafeZoneOverlay(screenRadius);
    this.safeZoneMesh.position.set(displayPos.x, displayPos.y + 0.005, displayPos.z);
    this.safeZoneMesh.visible = this.safeZonesEnabled;
    this.scene.add(this.safeZoneMesh);
  }

  public setCameraAngle(angle: 'front' | 'tilt' | 'side' | 'tilt35' | 'side75'): void {
    const normalizedAngle: 'front' | 'tilt' | 'side' =
      angle === 'tilt35' ? 'tilt' : angle === 'side75' ? 'side' : angle;

    const target = this.displayPlaneTarget();
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * this.camera.aspect);
    const fov = Math.min(vFov, hFov);
    const defaultRadius = 38;
    const isReal = this.realScale !== null;

    let distance: number;
    if (isReal) {
      const viewportHeightPx = (this.container && this.container.clientHeight > 0)
        ? this.container.clientHeight
        : 600;
      const pxPerMm = (this.realScale && this.realScale > 0.5) ? this.realScale : 3.7795;
      distance = computeRealSizeCameraDistance(viewportHeightPx, this.camera.fov, pxPerMm);
      this.controls.minDistance = distance;
      this.controls.maxDistance = distance;
    } else {
      distance = THREE.MathUtils.clamp(
        defaultRadius / Math.sin(fov / 2),
        this.controls.minDistance,
        this.controls.maxDistance
      );
    }

    const { position } = computeCameraPresetPose(target, normalizedAngle, distance);
    this.userMovedCamera = true;

    if (this.reducedMotion) {
      this.fly = null;
      this.camera.position.copy(position);
      this.controls.target.copy(target);
      if (isReal) {
        this.controls.minDistance = distance;
        this.controls.maxDistance = distance;
      }
      this.controls.update();
      this.requestRender();
      return;
    }

    this.flyToPose(position, target, isReal ? distance : undefined);
  }

  public setCameraPreset(angle: 'front' | 'tilt' | 'side' | 'tilt35' | 'side75'): void {
    this.setCameraAngle(angle);
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getControls(): OrbitControls {
    return this.controls;
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCurrentDeviceModel(): DeviceModelResult | null {
    return this.currentDeviceModel;
  }

  public getSafeZoneMesh(): THREE.Mesh | null {
    return this.safeZoneMesh;
  }

  public exportPngSnapshot(filename?: string): void {
    if (!this.ready) return;
    // Render right before reading pixels: with preserveDrawingBuffer: false the buffer is only
    // valid within the same task, so the frame is captured synchronously via toBlob's snapshot.
    this.renderer.render(this.scene, this.camera);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const id = this.currentDeviceModel?.spec.id ?? 'device';
    const name = filename ?? `wearview-${id}-${timestamp}.png`;
    downloadCanvasPng(this.renderer.domElement, name);
  }

  public exportComparePngSnapshot(
    other: ThreeViewer,
    preset: LightingPreset = this.currentLightingPreset,
    filename?: string
  ): void {
    if (!this.ready || !other.ready) return;
    const c1 = this.renderer.domElement;
    const c2 = other.renderer.domElement;
    const width = c1.width + c2.width;
    const height = Math.max(c1.height, c2.height);

    const out = document.createElement('canvas');
    out.width = width;
    out.height = height;
    const ctx = out.getContext('2d');
    if (!ctx) return;

    fillLightingBackground(ctx, width, height, preset);
    this.renderer.render(this.scene, this.camera);
    ctx.drawImage(c1, 0, 0);
    other.renderer.render(other.scene, other.camera);
    ctx.drawImage(c2, c1.width, 0);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const id1 = this.currentDeviceModel?.spec.id ?? 'device1';
    const id2 = other.currentDeviceModel?.spec.id ?? 'device2';
    const name = filename ?? `wearview-${id1}-vs-${id2}-${timestamp}.png`;
    downloadCanvasPng(out, name);
  }

  public captureSnapshot(filename?: string): void {
    this.exportPngSnapshot(filename);
  }

  // ---------------------------------------------------------------- internals

  private aspect(): number {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    return w / h;
  }

  private requestRender = (): void => {
    this.needsRender = true;
  };

  private onControlsStart = (): void => {
    this.userMovedCamera = true;
    this.driving = true;
    this.fly = null;
  };

  private onControlsChange = (): void => {
    this.needsRender = true;
    if (this.driving && !this.applyingSync) {
      this.onCameraChange?.(this.camera.position, this.controls.target);
    }
  };

  private onContextLost = (event: Event): void => {
    event.preventDefault();
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  };

  private onContextRestored = (): void => {
    this.needsRender = true;
    if (this.animationFrameId === null) this.animate();
  };

  private applyLightingPreset(preset: LightingPreset): void {
    const cfg = LIGHTING[preset];
    this.scene.environment = this.envMaps[preset] ?? null;
    this.scene.environmentIntensity = cfg.envIntensity;

    this.keyLight.color.setHex(cfg.keyColor);
    this.keyLight.intensity = cfg.keyIntensity;
    this.keyLight.position.copy(cfg.keyDirection).normalize().multiplyScalar(250);
    this.keyLight.target.position.set(0, 0, 0);

    this.hemiLight.color.setHex(cfg.hemiSky);
    this.hemiLight.groundColor.setHex(cfg.hemiGround);
    this.hemiLight.intensity = cfg.hemiIntensity;

    const glassEnv = this.glassEnvMaps[preset] ?? null;
    this.materials.coverGlass.envMap = glassEnv;
    this.materials.coverGlass.envMapIntensity = cfg.glassReflection;
    this.materials.coverGlass.needsUpdate = true;
    this.materials.bezelBlack.envMap = glassEnv;
    this.materials.bezelBlack.envMapIntensity = cfg.glassReflection * 0.6;
    this.materials.bezelBlack.needsUpdate = true;
    this.materials.bezelTachymeter.envMap = glassEnv;
    this.materials.bezelTachymeter.envMapIntensity = cfg.glassReflection * 0.6;
    this.materials.bezelTachymeter.needsUpdate = true;
    this.renderer.toneMappingExposure = cfg.exposure;
    this.groundShadowMesh.material.opacity = cfg.shadowOpacity;
    this.requestRender();
  }

  private updateGroundPlane(): void {
    const backY = this.currentDeviceModel?.backY ?? -11;
    // Lowest point of the strap loop / arm, plus a little air
    const bottom = backY - WRIST_SECTION.halfHeight * 2 - (this.viewMode === 'wrist' ? 9 : 4);
    this.groundShadowMesh.position.y = bottom;
    this.requestRender();
  }

  private applyTextureToDisplay(): void {
    if (!this.currentDeviceModel) return;
    const mat = this.currentDeviceModel.displayMesh.material;
    const texture = this.screen?.hasSource ? this.screen.texture : null;
    if (texture) {
      texture.anisotropy = this.pixelMode === 'native' ? 1 : this.renderer.capabilities.getMaxAnisotropy();
      mat.map = texture;
      mat.color.setHex(0xffffff);
    } else {
      mat.map = null;
      mat.color.setHex(0x050608);
    }
    mat.needsUpdate = true;
    this.requestRender();
  }

  /** Camera distance at which the display plane is drawn at `realScale` CSS px per mm. */
  private realSizeDistance(): number {
    const heightCss = Math.max(1, this.container.clientHeight);
    return computeRealSizeCameraDistance(heightCss, this.camera.fov, this.realScale ?? 1);
  }

  private displayPlaneTarget(): THREE.Vector3 {
    const target = new THREE.Vector3(0, 0, 0);
    this.scene.updateMatrixWorld(true);
    if (this.currentDeviceModel?.displayMesh) {
      this.currentDeviceModel.displayMesh.getWorldPosition(target);
    }
    return target;
  }

  private homePose(mode: ViewMode): { position: THREE.Vector3; target: THREE.Vector3 } {
    if (this.realScale !== null) {
      // Straight down onto the face with MIN_POLAR_OFFSET_RAD to prevent gimbal lock
      const target = this.displayPlaneTarget();
      const dir = new THREE.Vector3(0, Math.cos(MIN_POLAR_OFFSET_RAD), Math.sin(MIN_POLAR_OFFSET_RAD)).normalize();
      return { target, position: target.clone().addScaledVector(dir, this.realSizeDistance()) };
    }
    const home = HOMES[mode];
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * this.camera.aspect);
    const fov = Math.min(vFov, hFov);
    const distance = THREE.MathUtils.clamp(home.radius / Math.sin(fov / 2), this.controls.minDistance, this.controls.maxDistance);
    return {
      target: home.target.clone(),
      position: home.target.clone().addScaledVector(home.direction, distance),
    };
  }

  private jumpToHome(): void {
    const pose = this.homePose(this.viewMode);
    this.fly = null;
    this.camera.position.copy(pose.position);
    this.controls.target.copy(pose.target);
    this.controls.update();
    this.requestRender();
  }

  private flyToPose(position: THREE.Vector3, target: THREE.Vector3, lockDistance?: number): void {
    if (this.reducedMotion) {
      this.fly = null;
      this.camera.position.copy(position);
      this.controls.target.copy(target);
      if (lockDistance !== undefined) {
        this.controls.minDistance = lockDistance;
        this.controls.maxDistance = lockDistance;
      }
      this.controls.update();
      this.requestRender();
      return;
    }
    this.fly = {
      fromPos: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      toPos: position,
      toTarget: target,
      start: performance.now(),
      lockDistance,
    };
    this.requestRender();
  }

  private flyToHome(): void {
    const pose = this.homePose(this.viewMode);
    this.flyToPose(pose.position, pose.target);
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);
  }

  private handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width <= 0 || height <= 0) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    if (this.realScale !== null) {
      this.applyRealSize();
    } else if (!this.userMovedCamera && !this.fly) {
      // Keep the watch framed while the user hasn't taken over the camera
      this.jumpToHome();
    }
    this.requestRender();
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.fly) {
      const t = Math.min(1, (performance.now() - this.fly.start) / FLY_MS);
      const e = 1 - Math.pow(1 - t, 3);
      this.camera.position.lerpVectors(this.fly.fromPos, this.fly.toPos, e);
      this.controls.target.lerpVectors(this.fly.fromTarget, this.fly.toTarget, e);
      if (t >= 1) {
        if (this.fly.lockDistance !== undefined) {
          this.controls.minDistance = this.fly.lockDistance;
          this.controls.maxDistance = this.fly.lockDistance;
        }
        this.fly = null;
      }
      this.needsRender = true;
    }

    // update() returns true while damping is still moving the camera
    if (this.controls.update()) this.needsRender = true;
    if (this.screen?.tick()) this.needsRender = true;

    if (this.needsRender) {
      this.needsRender = false;
      this.renderer.render(this.scene, this.camera);
    }
  };

  private disposeDeviceModel(model: DeviceModelResult): void {
    const shared = new Set<THREE.Material>(Object.values(this.materials));
    model.group.traverse((obj) => {
      if ('geometry' in obj && (obj as THREE.Mesh).geometry instanceof THREE.BufferGeometry) {
        (obj as THREE.Mesh).geometry.dispose();
      }
      if ('material' in obj && (obj as THREE.Mesh).material) {
        const mats = Array.isArray((obj as THREE.Mesh).material)
          ? ((obj as THREE.Mesh).material as THREE.Material[])
          : [(obj as THREE.Mesh).material as THREE.Material];
        for (const mat of mats) {
          if (shared.has(mat)) continue;
          // Never dispose the user's screenshot texture with the per-device display material
          if ('map' in mat && (mat as THREE.MeshBasicMaterial).map === this.screen?.texture) {
            (mat as THREE.MeshBasicMaterial).map = null;
          }
          mat.dispose();
        }
      }
    });
  }

  public dispose(): void {
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (this.controls) {
      this.controls.removeEventListener('start', this.onControlsStart);
      this.controls.removeEventListener('change', this.onControlsChange);
      this.controls.dispose();
    }

    if (this.currentDeviceModel) {
      this.disposeDeviceModel(this.currentDeviceModel);
      this.currentDeviceModel = null;
    }
    if (this.safeZoneMesh) {
      this.scene.remove(this.safeZoneMesh);
      this.safeZoneMesh.geometry.dispose();
      const mat = this.safeZoneMesh.material as THREE.MeshBasicMaterial;
      mat.map?.dispose();
      mat.dispose();
      this.safeZoneMesh = null;
    }
    if (this.wristModel) {
      this.wristModel.wristMesh.geometry.dispose();
      this.wristModel = null;
    }
    if (this.groundShadowMesh) {
      this.groundShadowMesh.geometry.dispose();
      this.groundShadowMesh.material.dispose();
    }

    this.screen?.dispose();
    this.screen = null;
    Object.values(this.materials).forEach((mat) => mat.dispose());
    const envs = new Set([...Object.values(this.envMaps), ...Object.values(this.glassEnvMaps)]);
    envs.forEach((tex) => tex?.dispose());
    this.envMaps = {};
    this.glassEnvMaps = {};
    this.keyLight?.shadow.map?.dispose();

    if (this.renderer) {
      const canvas = this.renderer.domElement;
      canvas.removeEventListener('webglcontextlost', this.onContextLost);
      canvas.removeEventListener('webglcontextrestored', this.onContextRestored);
      this.renderer.dispose();
      canvas.parentElement?.removeChild(canvas);
    }
  }
}

/**
 * Creates a single-mesh Wear OS Safe Zone overlay with crisp 1024x1024 CanvasTexture.
 * 90%-100% outer danger annulus (evenodd fill), 80%-90% inner warning annulus (evenodd fill),
 * solid red outer rim, solid amber 90% ring, dashed 80% ring, and subtle center crosshair.
 */
export function createSafeZoneOverlay(displayRadiusMm: number): THREE.Mesh {
  let canvas: HTMLCanvasElement | null = null;
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 1024, 1024);
      const cx = 512;
      const cy = 512;
      const R = 510;

      // 1. Outer Danger Annulus (90% to 100% radius) with evenodd fill
      ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
      ctx.beginPath();
      ctx.arc(cx, cy, 1.00 * R, 0, Math.PI * 2, false);
      ctx.arc(cx, cy, 0.90 * R, 0, Math.PI * 2, true);
      ctx.fill('evenodd');

      // 2. Inner Warning Annulus (80% to 90% radius) with evenodd fill
      ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';
      ctx.beginPath();
      ctx.arc(cx, cy, 0.90 * R, 0, Math.PI * 2, false);
      ctx.arc(cx, cy, 0.80 * R, 0, Math.PI * 2, true);
      ctx.fill('evenodd');

      // 3. Crisp outer solid red ring at 0.995 * R (lineWidth = 3, #ef4444)
      ctx.setLineDash([]);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 0.995 * R, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Crisp solid amber ring at 0.90 * R (lineWidth = 2.5, #f59e0b)
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 0.90 * R, 0, Math.PI * 2);
      ctx.stroke();

      // 5. Crisp dashed yellow-green/amber ring at 0.80 * R (lineWidth = 2.5, setLineDash([16, 12]), #eab308)
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([16, 12]);
      ctx.beginPath();
      ctx.arc(cx, cy, 0.80 * R, 0, Math.PI * 2);
      ctx.stroke();

      // 6. Subtle crosshair center ticks at (512, 512) (12px arms, rgba(255, 255, 255, 0.45))
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      const arm = 12;
      ctx.beginPath();
      ctx.moveTo(cx - arm, cy);
      ctx.lineTo(cx + arm, cy);
      ctx.moveTo(cx, cy - arm);
      ctx.lineTo(cx, cy + arm);
      ctx.stroke();
    }
  }

  const texture = canvas ? new THREE.CanvasTexture(canvas) : null;
  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
  }

  const geo = new THREE.CircleGeometry(displayRadiusMm, 96);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
    toneMapped: false,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'safeZonesOverlay';
  mesh.renderOrder = 20;
  return mesh;
}

function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = filename;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}

function fillLightingBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  preset: LightingPreset
): void {
  if (preset === 'sunlight') {
    if (typeof ctx.createLinearGradient === 'function') {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#a9cdf2');
      grad.addColorStop(0.45, '#dcebf7');
      grad.addColorStop(0.75, '#f3ede2');
      grad.addColorStop(1, '#e3dccf');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = '#dcebf7';
    }
  } else if (preset === 'night') {
    if (typeof ctx.createRadialGradient === 'function') {
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.3,
        0,
        width * 0.5,
        height * 0.3,
        Math.hypot(width, height) * 0.7
      );
      grad.addColorStop(0, '#141a2b');
      grad.addColorStop(0.55, '#0a0d17');
      grad.addColorStop(1, '#040509');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = '#0a0d17';
    }
  } else {
    if (typeof ctx.createRadialGradient === 'function') {
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        0,
        width * 0.5,
        height * 0.35,
        Math.hypot(width, height) * 0.75
      );
      grad.addColorStop(0, '#f4f5f7');
      grad.addColorStop(0.55, '#dfe2e7');
      grad.addColorStop(1, '#c9cdd4');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = '#dfe2e7';
    }
  }
  ctx.fillRect(0, 0, width, height);
}

export const buildSafeZoneOverlay = (screenRadius: number, _displayY?: number): THREE.Mesh => {
  return createSafeZoneOverlay(screenRadius);
};

// ---------------------------------------------------------------- environment scenes for reflections

interface EnvScene {
  scene: THREE.Scene;
  dispose: () => void;
}

function disposeScene(scene: THREE.Scene): void {
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      (obj.material as THREE.Material).dispose();
    }
  });
}

/** Gradient sky dome: vertex colours interpolated from zenith → horizon → ground. */
function skyDome(zenith: THREE.Color, horizon: THREE.Color, ground: THREE.Color): THREE.Mesh {
  const geo = new THREE.SphereGeometry(100, 48, 24);
  const colors: number[] = [];
  const pos = geo.attributes.position;
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 100;
    if (y >= 0) c.copy(horizon).lerp(zenith, Math.pow(y, 0.6));
    else c.copy(horizon).lerp(ground, Math.min(1, -y * 4));
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide }));
}

function emissivePanel(color: THREE.Color, w: number, h: number, pos: THREE.Vector3): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
  mesh.position.copy(pos);
  mesh.lookAt(0, 0, 0);
  return mesh;
}

function buildSunlightEnvironment(): EnvScene {
  const scene = new THREE.Scene();
  scene.add(skyDome(
    new THREE.Color(0.32, 0.52, 0.95).multiplyScalar(1.4),
    new THREE.Color(1.0, 0.96, 0.9).multiplyScalar(2.2),
    new THREE.Color(0.32, 0.29, 0.25)
  ));
  const sunDir = LIGHTING.sunlight.keyDirection.clone().normalize();
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(5, 16, 8),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.95, 0.85).multiplyScalar(80) })
  );
  sun.position.copy(sunDir).multiplyScalar(80);
  scene.add(sun);
  return { scene, dispose: () => disposeScene(scene) };
}

/** Dark studio with a few hard-edged softboxes: gives glass crisp, glossy highlights instead of a grey veil. */
function buildSoftboxEnvironment(): EnvScene {
  const scene = new THREE.Scene();
  scene.add(skyDome(
    new THREE.Color(0.035, 0.037, 0.042),
    new THREE.Color(0.05, 0.052, 0.058),
    new THREE.Color(0.012, 0.012, 0.014)
  ));
  // Lights sit off to the sides so the default three-quarter view reflects mostly dark studio
  // (a crisp, readable screen); highlights sweep across the glass as the watch is tilted.
  scene.add(emissivePanel(new THREE.Color(1, 1, 1).multiplyScalar(4), 50, 30, new THREE.Vector3(-75, 40, 25)));
  scene.add(emissivePanel(new THREE.Color(1, 0.98, 0.95).multiplyScalar(2.5), 14, 60, new THREE.Vector3(75, 25, -20)));
  scene.add(emissivePanel(new THREE.Color(0.9, 0.95, 1).multiplyScalar(1.4), 90, 5, new THREE.Vector3(0, 30, 80)));
  return { scene, dispose: () => disposeScene(scene) };
}

function buildNightEnvironment(): EnvScene {
  const scene = new THREE.Scene();
  scene.add(skyDome(
    new THREE.Color(0.012, 0.016, 0.03),
    new THREE.Color(0.03, 0.035, 0.05),
    new THREE.Color(0.006, 0.006, 0.008)
  ));
  // A few distant city / interior lights so the glass and metal still catch highlights
  scene.add(emissivePanel(new THREE.Color(1.0, 0.62, 0.3).multiplyScalar(6), 14, 8, new THREE.Vector3(55, 35, -55)));
  scene.add(emissivePanel(new THREE.Color(0.35, 0.55, 1.0).multiplyScalar(3), 30, 6, new THREE.Vector3(-60, 30, 40)));
  scene.add(emissivePanel(new THREE.Color(1, 1, 1).multiplyScalar(2.5), 70, 2.5, new THREE.Vector3(0, 70, -30)));
  return { scene, dispose: () => disposeScene(scene) };
}
