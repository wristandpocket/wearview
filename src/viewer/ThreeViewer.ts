import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { DeviceId, LightingPreset, ViewMode } from '../types';
import { createWatchMaterials, type WatchMaterials } from '../devices/materials';
import { buildDevice, DEFAULT_DEVICE_ID } from '../devices';
import type { DeviceModelResult } from '../devices/types';
import { buildWristModel, type WristModelResult } from '../wrist/wristModel';

export interface ViewerOptions {
  container: HTMLElement;
  initialDeviceId?: DeviceId;
  initialLighting?: LightingPreset;
  initialViewMode?: ViewMode;
  onInitSuccess?: () => void;
  onInitError?: (error: Error) => void;
}

export class ThreeViewer {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // Materials & Geometry
  private materials: WatchMaterials;
  private currentDeviceId: DeviceId;
  private currentDeviceModel: DeviceModelResult | null = null;
  private wristModel: WristModelResult | null = null;
  private groundShadowMesh!: THREE.Mesh;

  // Active texture
  private currentTexture: THREE.Texture | null = null;

  // Lighting rigs
  private currentLightingPreset: LightingPreset = 'studio';
  private studioLightsGroup = new THREE.Group();
  private sunlightLightsGroup = new THREE.Group();
  private nightLightsGroup = new THREE.Group();

  // Default camera framing coordinates (elevated three-quarter view showing face, rim, and controls)
  private readonly defaultCameraPosition = new THREE.Vector3(12, 62, 32);
  private readonly defaultCameraTarget = new THREE.Vector3(0, -2, 0);

  constructor(options: ViewerOptions) {
    this.container = options.container;
    this.currentDeviceId = options.initialDeviceId || DEFAULT_DEVICE_ID;
    this.currentLightingPreset = options.initialLighting || 'studio';
    const viewMode = options.initialViewMode || 'watch';

    this.materials = createWatchMaterials();

    try {
      this.initRenderer();
      this.initScene();
      this.initCameraAndControls();
      this.initLighting();
      this.initGroundShadow();

      // Build wrist reference
      this.wristModel = buildWristModel(this.materials);
      this.scene.add(this.wristModel.group);
      this.wristModel.group.visible = (viewMode === 'wrist');

      // Load initial device
      this.loadDevice(this.currentDeviceId);

      // Setup resize observer
      this.setupResizeObserver();

      // Start render loop
      this.animate();

      if (options.onInitSuccess) {
        options.onInitSuccess();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize 3D WebGL scene.');
      if (options.onInitError) {
        options.onInitError(error);
      } else {
        console.error(error);
      }
    }
  }

  private initRenderer(): void {
    // Check WebGL availability
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      throw new Error('WebGL is not supported or disabled in your browser.');
    }

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Attach to DOM
    this.container.replaceChildren(this.renderer.domElement);
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    // Dynamic studio HDR environment map for physically accurate metal and glass specular reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.scene.environment = pmremGenerator.fromScene(roomEnv).texture;
  }

  private initCameraAndControls(): void {
    const aspect = this.container.clientWidth / (this.container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(38, aspect, 1, 600);
    this.camera.position.copy(this.defaultCameraPosition);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.target.copy(this.defaultCameraTarget);

    // Limit camera angles: prevent flipping underneath the ground
    this.controls.minPolarAngle = 0.1;
    this.controls.maxPolarAngle = Math.PI * 0.58;

    // Expanded zoom limits: close inspection (15 mm) to full real-life scale comparison (450 mm)
    this.controls.minDistance = 15;
    this.controls.maxDistance = 450;

    this.controls.update();
  }

  private initLighting(): void {
    // 1. STUDIO PRESET (Clean, crisp white studio lighting)
    this.studioLightsGroup.name = 'studioLights';
    const studioKey = new THREE.DirectionalLight(0xffffff, 2.2);
    studioKey.position.set(35, 65, 45);
    studioKey.castShadow = true;
    studioKey.shadow.mapSize.width = 1024;
    studioKey.shadow.mapSize.height = 1024;
    studioKey.shadow.camera.near = 10;
    studioKey.shadow.camera.far = 150;
    studioKey.shadow.camera.left = -40;
    studioKey.shadow.camera.right = 40;
    studioKey.shadow.camera.top = 40;
    studioKey.shadow.camera.bottom = -40;
    studioKey.shadow.bias = -0.001;
    this.studioLightsGroup.add(studioKey);

    const studioFill = new THREE.DirectionalLight(0xf1f5f9, 1.4);
    studioFill.position.set(-35, 40, -35);
    this.studioLightsGroup.add(studioFill);

    const studioAmbient = new THREE.AmbientLight(0xffffff, 1.2);
    this.studioLightsGroup.add(studioAmbient);

    this.scene.add(this.studioLightsGroup);

    // 2. SUNLIGHT PRESET (Warm directional with crisp shadows)
    this.sunlightLightsGroup.name = 'sunlightLights';
    const sunLight = new THREE.DirectionalLight(0xfffaed, 3.4);
    sunLight.position.set(50, 80, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.001;
    this.sunlightLightsGroup.add(sunLight);

    const sunFill = new THREE.DirectionalLight(0x93c5fd, 0.7);
    sunFill.position.set(-40, 25, -30);
    this.sunlightLightsGroup.add(sunFill);

    const sunAmbient = new THREE.AmbientLight(0xf8fafc, 0.9);
    this.sunlightLightsGroup.add(sunAmbient);

    this.scene.add(this.sunlightLightsGroup);

    // 3. NIGHT PRESET (Atmospheric rim lights, preserves screen readability)
    this.nightLightsGroup.name = 'nightLights';
    const nightRimCyan = new THREE.DirectionalLight(0x38bdf8, 2.2);
    nightRimCyan.position.set(-45, 30, -40);
    this.nightLightsGroup.add(nightRimCyan);

    const nightRimViolet = new THREE.DirectionalLight(0xa855f7, 1.8);
    nightRimViolet.position.set(40, 25, 35);
    this.nightLightsGroup.add(nightRimViolet);

    const nightAmbient = new THREE.AmbientLight(0x0a0f1d, 0.4);
    this.nightLightsGroup.add(nightAmbient);

    this.scene.add(this.nightLightsGroup);

    this.applyLightingPreset(this.currentLightingPreset);
  }

  private initGroundShadow(): void {
    const shadowGeo = new THREE.PlaneGeometry(160, 160);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    this.groundShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.groundShadowMesh.position.set(0, -33.0, 0);
    this.groundShadowMesh.receiveShadow = true;
    this.scene.add(this.groundShadowMesh);
  }

  public setLightingPreset(preset: LightingPreset): void {
    this.currentLightingPreset = preset;
    this.applyLightingPreset(preset);
  }

  private applyLightingPreset(preset: LightingPreset): void {
    this.studioLightsGroup.visible = (preset === 'studio');
    this.sunlightLightsGroup.visible = (preset === 'sunlight');
    this.nightLightsGroup.visible = (preset === 'night');

    // Dynamic background and glass specular response tuning
    if (preset === 'studio') {
      this.scene.background = new THREE.Color(0xffffff);
      this.materials.glassSapphire.opacity = 0.06;
      this.materials.glassDomedPebble.opacity = 0.06;
      this.materials.glassSapphire.roughness = 0.03;
      this.renderer.toneMappingExposure = 1.0;
    } else if (preset === 'sunlight') {
      this.scene.background = new THREE.Color(0xfcfbf9);
      this.materials.glassSapphire.opacity = 0.09;
      this.materials.glassDomedPebble.opacity = 0.09;
      this.materials.glassSapphire.roughness = 0.02;
      this.renderer.toneMappingExposure = 1.05;
    } else if (preset === 'night') {
      this.scene.background = new THREE.Color(0x080c16);
      this.materials.glassSapphire.opacity = 0.07;
      this.materials.glassDomedPebble.opacity = 0.07;
      this.materials.glassSapphire.roughness = 0.05;
      this.renderer.toneMappingExposure = 0.95;
    }
  }

  public setViewMode(mode: ViewMode): void {
    if (this.wristModel) {
      this.wristModel.group.visible = (mode === 'wrist');
    }
  }

  public loadDevice(deviceId: DeviceId): void {
    // Remove existing device model from scene
    if (this.currentDeviceModel) {
      this.scene.remove(this.currentDeviceModel.group);
      this.currentDeviceModel.group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
        }
      });
      this.currentDeviceModel = null;
    }

    this.currentDeviceId = deviceId;
    this.currentDeviceModel = buildDevice(deviceId, this.materials);
    this.scene.add(this.currentDeviceModel.group);

    // Reapply active texture if already loaded
    if (this.currentTexture) {
      this.applyTextureToDisplay(this.currentTexture);
    }
  }

  public setScreenshotTexture(texture: THREE.Texture | null): void {
    this.currentTexture = texture;
    this.applyTextureToDisplay(texture);
  }

  private applyTextureToDisplay(texture: THREE.Texture | null): void {
    if (!this.currentDeviceModel) return;

    const displayMesh = this.currentDeviceModel.displayMesh;
    if (texture) {
      displayMesh.material.map = texture;
      displayMesh.material.color.setHex(0xffffff);
      displayMesh.material.needsUpdate = true;
    } else {
      displayMesh.material.map = null;
      displayMesh.material.color.setHex(0x090b10);
      displayMesh.material.needsUpdate = true;
    }
  }

  public resetCamera(): void {
    this.camera.position.copy(this.defaultCameraPosition);
    this.controls.target.copy(this.defaultCameraTarget);
    this.controls.update();
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        if (width > 0 && height > 0) {
          this.handleResize(width, height);
        }
      }
    });
    this.resizeObserver.observe(this.container);
  }

  private handleResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.controls) {
      this.controls.dispose();
    }

    if (this.currentDeviceModel) {
      this.scene.remove(this.currentDeviceModel.group);
      this.currentDeviceModel.group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
        }
      });
      this.currentDeviceModel = null;
    }

    if (this.wristModel) {
      this.scene.remove(this.wristModel.group);
      this.wristModel.group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
        }
      });
      this.wristModel = null;
    }

    if (this.groundShadowMesh) {
      this.scene.remove(this.groundShadowMesh);
      this.groundShadowMesh.geometry.dispose();
    }

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
    }
  }
}
