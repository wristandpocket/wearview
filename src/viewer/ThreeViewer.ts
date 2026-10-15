import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { DeviceId, LightingPreset, ViewMode } from '../types';
import { createWatchMaterials, type WatchMaterials } from '../devices/materials';
import { buildDevice, DEFAULT_DEVICE_ID } from '../devices';
import type { DeviceModelResult } from '../devices/types';
import { WRIST_SECTION } from '../devices/geometry';
import { buildWristModel, type WristModelResult } from '../wrist/wristModel';

export interface ViewerOptions {
  container: HTMLElement;
  initialDeviceId?: DeviceId;
  initialLighting?: LightingPreset;
  initialViewMode?: ViewMode;
  onInitSuccess?: () => void;
  onInitError?: (error: Error) => void;
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
const DEFAULT_FOV = 30;
/** Narrow lens in real-size mode keeps perspective distortion of the 10 mm-deep watch under ~1%. */
const REAL_SIZE_FOV = 8;

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
  private currentTexture: THREE.Texture | null = null;
  private currentLightingPreset: LightingPreset;
  private viewMode: ViewMode;

  private needsRender = true;
  private userMovedCamera = false;
  private fly: { fromPos: THREE.Vector3; fromTarget: THREE.Vector3; toPos: THREE.Vector3; toTarget: THREE.Vector3; start: number } | null = null;
  private readonly reducedMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  constructor(options: ViewerOptions) {
    this.container = options.container;
    this.currentLightingPreset = options.initialLighting || 'studio';
    this.viewMode = options.initialViewMode || 'watch';
    this.materials = createWatchMaterials();

    try {
      this.initRenderer();
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
      options.onInitSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize 3D WebGL scene.');
      if (options.onInitError) options.onInitError(error);
      else console.error(error);
    }
  }

  // ---------------------------------------------------------------- setup

  private initRenderer(): void {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) {
      throw new Error('WebGL is not supported or disabled in your browser.');
    }

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
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

    const shadowGeo = new THREE.PlaneGeometry(600, 600);
    shadowGeo.rotateX(-Math.PI / 2);
    this.groundShadowMesh = new THREE.Mesh(shadowGeo, new THREE.ShadowMaterial({ opacity: 0.3 }));
    this.groundShadowMesh.receiveShadow = true;
    this.scene.add(this.groundShadowMesh);
  }

  private initCameraAndControls(): void {
    this.camera = new THREE.PerspectiveCamera(DEFAULT_FOV, this.aspect(), 1, 20000);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.8;
    this.controls.zoomSpeed = 0.9;
    this.controls.minPolarAngle = 0.02;
    this.controls.maxPolarAngle = Math.PI * 0.62; // allow a little look from below the face plane
    this.controls.minDistance = 40;
    this.controls.maxDistance = 520;
    this.controls.screenSpacePanning = true;
    this.controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
    this.controls.addEventListener('start', this.onControlsStart);
    this.controls.addEventListener('change', this.requestRender);
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
    this.flyToHome();
  }

  public loadDevice(deviceId: DeviceId): void {
    if (this.currentDeviceModel) {
      this.scene.remove(this.currentDeviceModel.group);
      this.disposeDeviceModel(this.currentDeviceModel);
      this.currentDeviceModel = null;
    }

    this.currentDeviceModel = buildDevice(deviceId, this.materials);
    this.scene.add(this.currentDeviceModel.group);
    this.wristModel?.fitToWatch(this.currentDeviceModel.backY);
    this.updateGroundPlane();
    this.applyTextureToDisplay(this.currentTexture);
    if (this.realScale !== null) this.handleResize();
    this.requestRender();
  }

  public setScreenshotTexture(texture: THREE.Texture | null): void {
    this.currentTexture = texture;
    this.applyTextureToDisplay(texture);
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
    if (pxPerMm !== null && !(pxPerMm > 0)) return;
    const wasReal = this.realScale !== null;
    this.realScale = pxPerMm;
    const real = pxPerMm !== null;
    this.camera.fov = real ? REAL_SIZE_FOV : DEFAULT_FOV;
    this.camera.updateProjectionMatrix();
    this.controls.enableZoom = !real;
    this.controls.enablePan = !real;
    this.controls.minDistance = real ? 0 : 40;
    this.controls.maxDistance = real ? Infinity : 520;
    this.groundShadowMesh.visible = !real;
    this.userMovedCamera = false;
    if (real || wasReal) this.jumpToHome();
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
    this.fly = null;
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

  private applyTextureToDisplay(texture: THREE.Texture | null): void {
    if (!this.currentDeviceModel) return;
    const mat = this.currentDeviceModel.displayMesh.material;
    if (texture) {
      texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      texture.needsUpdate = true;
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
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    return heightCss / (2 * Math.tan(vFov / 2) * (this.realScale ?? 1));
  }

  private displayPlaneTarget(): THREE.Vector3 {
    const y = this.currentDeviceModel?.displayMesh.position.y ?? 0;
    return new THREE.Vector3(0, y, 0);
  }

  private homePose(mode: ViewMode): { position: THREE.Vector3; target: THREE.Vector3 } {
    if (this.realScale !== null) {
      // Straight down onto the face; the tiny Z offset keeps 12 o'clock at the top of the screen
      const target = this.displayPlaneTarget();
      const dir = new THREE.Vector3(0, 1, 1e-4).normalize();
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

  private flyToHome(): void {
    if (this.reducedMotion) {
      this.jumpToHome();
      return;
    }
    const pose = this.homePose(this.viewMode);
    this.fly = {
      fromPos: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      toPos: pose.position,
      toTarget: pose.target,
      start: performance.now(),
    };
    this.requestRender();
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
      // Scale must stay exact: keep the viewing direction, re-solve the distance
      this.fly = null;
      const target = this.displayPlaneTarget();
      const dir = this.camera.position.clone().sub(this.controls.target).normalize();
      this.controls.target.copy(target);
      this.camera.position.copy(target).addScaledVector(dir, this.realSizeDistance());
      this.controls.update();
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
      if (t >= 1) this.fly = null;
      this.needsRender = true;
    }

    // update() returns true while damping is still moving the camera
    if (this.controls.update()) this.needsRender = true;

    if (this.needsRender) {
      this.needsRender = false;
      this.renderer.render(this.scene, this.camera);
    }
  };

  private disposeDeviceModel(model: DeviceModelResult): void {
    const shared = new Set<THREE.Material>(Object.values(this.materials));
    model.group.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      obj.geometry.dispose();
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const mat of mats) {
        if (shared.has(mat)) continue;
        // Never dispose the user's screenshot texture with the per-device display material
        if ((mat as THREE.MeshBasicMaterial).map === this.currentTexture) (mat as THREE.MeshBasicMaterial).map = null;
        mat.dispose();
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
      this.controls.removeEventListener('change', this.requestRender);
      this.controls.dispose();
    }

    if (this.currentDeviceModel) {
      this.disposeDeviceModel(this.currentDeviceModel);
      this.currentDeviceModel = null;
    }
    if (this.wristModel) {
      this.wristModel.wristMesh.geometry.dispose();
      this.wristModel = null;
    }
    if (this.groundShadowMesh) {
      this.groundShadowMesh.geometry.dispose();
      this.groundShadowMesh.material.dispose();
    }

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
