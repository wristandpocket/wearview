import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { DEVICE_LIST, buildDevice } from '../devices';
import { createWatchMaterials } from '../devices/materials';
import {
  ThreeViewer,
  computeRealSizeCameraDistance,
  computeCameraPresetPose,
  getSafeCameraDirection,
  createSafeZoneOverlay,
  MIN_POLAR_OFFSET_RAD,
} from './ThreeViewer';

describe('Viewer Invariants & Frustum Verification', () => {
  const materials = createWatchMaterials();

  describe('1. Frustum Visibility Invariant', () => {
    const presets: Array<'front' | 'tilt35' | 'side75'> = ['front', 'tilt35', 'side75'];
    const modes: Array<'normal' | 'realSize'> = ['normal', 'realSize'];
    const wristStates: boolean[] = [false, true];

    for (const spec of DEVICE_LIST) {
      for (const onWrist of wristStates) {
        for (const preset of presets) {
          for (const mode of modes) {
            it(`device [${spec.id}] · wrist [${onWrist}] · preset [${preset}] · mode [${mode}] satisfies camera and frustum visibility`, () => {
              const model = buildDevice(spec.id, materials);
              const scene = new THREE.Scene();
              scene.add(model.group);
              scene.updateMatrixWorld(true);

              const displayPos = new THREE.Vector3();
              model.displayMesh.getWorldPosition(displayPos);

              const camera = new THREE.PerspectiveCamera(
                mode === 'realSize' ? 8 : 30,
                16 / 9,
                mode === 'realSize' ? 2.0 : 5.0,
                mode === 'realSize' ? 2500.0 : 1200.0
              );
              camera.up.set(0, 1, 0);

              let minDistance = 40;
              let maxDistance = 520;
              let distance: number;

              if (mode === 'realSize') {
                const viewportHeightPx = 800;
                const pxPerMm = 3.7795;
                distance = computeRealSizeCameraDistance(viewportHeightPx, camera.fov, pxPerMm);
                minDistance = distance;
                maxDistance = distance;
              } else {
                const defaultRadius = 38;
                const vFov = THREE.MathUtils.degToRad(camera.fov);
                const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
                const fov = Math.min(vFov, hFov);
                distance = THREE.MathUtils.clamp(defaultRadius / Math.sin(fov / 2), minDistance, maxDistance);
              }

              const { position, dir } = computeCameraPresetPose(displayPos, preset, distance);
              expect(dir.length()).toBeCloseTo(1.0, 0.001);
              camera.position.copy(position);
              camera.lookAt(displayPos);
              camera.updateMatrixWorld(true);

              // Invariant 1: camera.position has no NaN or Infinity
              expect(Number.isFinite(camera.position.x)).toBe(true);
              expect(Number.isFinite(camera.position.y)).toBe(true);
              expect(Number.isFinite(camera.position.z)).toBe(true);

              // Invariant 2: No gimbal lock (view direction is not collinear with camera.up)
              const viewDir = camera.position.clone().sub(displayPos).normalize();
              expect(Math.abs(viewDir.dot(camera.up))).toBeLessThan(0.99999);

              // Invariant 3: minDistance <= maxDistance
              expect(minDistance).toBeLessThanOrEqual(maxDistance);

              // Invariant 4: THREE.Frustum contains display position and intersects display bounding sphere
              const projScreenMatrix = new THREE.Matrix4().multiplyMatrices(
                camera.projectionMatrix,
                camera.matrixWorldInverse
              );
              const frustum = new THREE.Frustum().setFromProjectionMatrix(projScreenMatrix);

              expect(frustum.containsPoint(displayPos)).toBe(true);

              model.displayMesh.geometry.computeBoundingSphere();
              const sphere = model.displayMesh.geometry.boundingSphere!.clone().applyMatrix4(model.displayMesh.matrixWorld);
              expect(frustum.intersectsSphere(sphere)).toBe(true);
            });
          }
        }
      }
    }
  });

  describe('2. Safe Zone Alignment & Single-Instance Invariant', () => {
    let mockContainer: any;
    let mockCanvas: any;
    let mockCtx: any;
    let viewer: ThreeViewer;
    const originalDocument = globalThis.document;
    const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
    const originalResizeObserver = (globalThis as any).ResizeObserver;

    beforeEach(() => {
      mockCtx = {
        fillStyle: '',
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        strokeStyle: '',
        lineWidth: 0,
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        setLineDash: vi.fn(),
      };

      const doc = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        defaultView: {},
      };

      mockCanvas = {
        width: 1024,
        height: 1024,
        style: {},
        ownerDocument: doc,
        getRootNode: () => doc,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        getContext: vi.fn((type: string) => {
          if (type === '2d') return mockCtx;
          if (type === 'webgl2' || type === 'webgl') return {};
          return null;
        }),
      };

      mockContainer = {
        clientWidth: 800,
        clientHeight: 600,
        replaceChildren: vi.fn(),
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      };

      (globalThis as any).document = {
        createElement: vi.fn((tag: string) => {
          if (tag === 'canvas') return mockCanvas;
          return { style: {} };
        }),
      };

      (globalThis as any).requestAnimationFrame = vi.fn(() => 1);
      (globalThis as any).cancelAnimationFrame = vi.fn();
      (globalThis as any).ResizeObserver = class {
        observe = vi.fn();
        disconnect = vi.fn();
      };

      const mockRenderer = {
        domElement: mockCanvas,
        capabilities: { getMaxAnisotropy: () => 16 },
        setPixelRatio: vi.fn(),
        setClearColor: vi.fn(),
        setSize: vi.fn(),
        render: vi.fn(),
        dispose: vi.fn(),
        outputColorSpace: THREE.SRGBColorSpace,
        toneMapping: THREE.AgXToneMapping,
        toneMappingExposure: 1.0,
        shadowMap: { enabled: true, type: THREE.PCFSoftShadowMap },
      } as unknown as THREE.WebGLRenderer;

      viewer = new ThreeViewer({
        container: mockContainer,
        initialDeviceId: 'pixel-watch-41',
        renderer: mockRenderer,
      });
    });

    afterEach(() => {
      viewer?.dispose();
      vi.restoreAllMocks();
      (globalThis as any).document = originalDocument;
      (globalThis as any).requestAnimationFrame = originalRequestAnimationFrame;
      (globalThis as any).cancelAnimationFrame = originalCancelAnimationFrame;
      (globalThis as any).ResizeObserver = originalResizeObserver;
    });

    it('switching through all 11 devices and toggling safe zones and on-wrist leaves at most ONE safe zone mesh', () => {
      viewer.setSafeZonesEnabled(true);

      for (const spec of DEVICE_LIST) {
        viewer.setDevice(spec.id);
        viewer.setOnWrist(true);
        viewer.setOnWrist(false);
        viewer.setSafeZonesEnabled(false);
        viewer.setSafeZonesEnabled(true);

        const scene = viewer.getScene();
        const safeZoneMeshes: THREE.Mesh[] = [];
        scene.traverse((obj) => {
          if (obj.name === 'safeZonesOverlay') {
            safeZoneMeshes.push(obj as THREE.Mesh);
          }
        });

        // Exactly one safe zone mesh in scene when enabled
        expect(safeZoneMeshes.length).toBe(1);

        const overlay = safeZoneMeshes[0];
        const displayMesh = viewer.getCurrentDeviceModel()!.displayMesh;

        scene.updateMatrixWorld(true);
        const overlayWorldPos = new THREE.Vector3();
        const displayWorldPos = new THREE.Vector3();
        overlay.getWorldPosition(overlayWorldPos);
        displayMesh.getWorldPosition(displayWorldPos);

        // World position matches displayMesh within < 0.02mm (offset is exactly 0.005mm Y)
        const posDiff = overlayWorldPos.distanceTo(displayWorldPos);
        expect(posDiff).toBeLessThan(0.02);

        // Bounding radius matches device.displayDiameterMm / 2 within < 0.01mm
        overlay.geometry.computeBoundingSphere();
        const expectedRadius = spec.displayDiameterMm / 2;
        expect(Math.abs(overlay.geometry.boundingSphere!.radius - expectedRadius)).toBeLessThan(0.01);
      }
    });

    it('toggling safe zones to false hides or leaves at most zero visible safe zone mesh', () => {
      viewer.setSafeZonesEnabled(false);
      const safeZone = viewer.getSafeZoneMesh();
      if (safeZone) {
        expect(safeZone.visible).toBe(false);
      }
    });
  });

  describe('3. Camera Distance and Direction Invariants', () => {
    it('getSafeCameraDirection never returns collinear with camera.up or NaN/zero vector', () => {
      const target = new THREE.Vector3(0, 0, 0);
      const up = new THREE.Vector3(0, 1, 0);

      // Collinear camera above target
      const collinearPos = new THREE.Vector3(0, 50, 0);
      const safeDir1 = getSafeCameraDirection(collinearPos, target, up);
      expect(Number.isFinite(safeDir1.x)).toBe(true);
      expect(Number.isFinite(safeDir1.y)).toBe(true);
      expect(Number.isFinite(safeDir1.z)).toBe(true);
      expect(Math.abs(safeDir1.dot(up))).toBeLessThan(0.99999);

      // Zero-distance camera at target
      const zeroPos = new THREE.Vector3(0, 0, 0);
      const safeDir2 = getSafeCameraDirection(zeroPos, target, up);
      expect(safeDir2.length()).toBeCloseTo(1.0, 0.001);
      expect(Math.abs(safeDir2.dot(up))).toBeLessThan(0.99999);
    });

    it('computeRealSizeCameraDistance produces strictly positive distance with narrow fov', () => {
      const dist = computeRealSizeCameraDistance(800, 8, 3.7795);
      expect(dist).toBeGreaterThan(100);
      expect(dist).toBeLessThan(2000);
      expect(MIN_POLAR_OFFSET_RAD).toBe(0.005);
    });

    it('createSafeZoneOverlay creates a valid mesh with correct radius and depth occlusion enabled', () => {
      const mesh = createSafeZoneOverlay(16.0);
      expect(mesh).toBeInstanceOf(THREE.Mesh);
      expect(mesh.name).toBe('safeZonesOverlay');
      expect(mesh.renderOrder).toBe(20);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      expect(mat.depthTest).toBe(true);
      expect(mat.polygonOffset).toBe(true);
    });
  });

  describe('4. Real-Size (1:1) Camera Angle Preset Invariant & Compare Export', () => {
    let mockContainer: any;
    let mockCanvas: any;
    let mockCtx: any;
    let viewer: ThreeViewer;
    const originalDocument = globalThis.document;
    const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
    const originalResizeObserver = (globalThis as any).ResizeObserver;

    beforeEach(() => {
      mockCtx = {
        fillStyle: '',
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        strokeStyle: '',
        lineWidth: 0,
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        setLineDash: vi.fn(),
      };

      const doc = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        defaultView: {},
      };

      mockCanvas = {
        width: 800,
        height: 600,
        style: {},
        ownerDocument: doc,
        getRootNode: () => doc,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        toBlob: vi.fn(),
        getContext: vi.fn((type: string) => {
          if (type === '2d') return mockCtx;
          if (type === 'webgl2' || type === 'webgl') return {};
          return null;
        }),
      };

      mockContainer = {
        clientWidth: 800,
        clientHeight: 600,
        replaceChildren: vi.fn(),
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      };

      (globalThis as any).document = {
        createElement: vi.fn((tag: string) => {
          if (tag === 'canvas') return { ...mockCanvas, getContext: mockCanvas.getContext, toBlob: mockCanvas.toBlob };
          return { style: {}, click: vi.fn(), remove: vi.fn() };
        }),
        body: { appendChild: vi.fn() },
      };

      (globalThis as any).requestAnimationFrame = vi.fn(() => 1);
      (globalThis as any).cancelAnimationFrame = vi.fn();
      (globalThis as any).ResizeObserver = class {
        observe = vi.fn();
        disconnect = vi.fn();
      };

      const mockRenderer = {
        domElement: mockCanvas,
        capabilities: { getMaxAnisotropy: () => 16 },
        setPixelRatio: vi.fn(),
        setClearColor: vi.fn(),
        setSize: vi.fn(),
        render: vi.fn(),
        dispose: vi.fn(),
        outputColorSpace: THREE.SRGBColorSpace,
        toneMapping: THREE.AgXToneMapping,
        toneMappingExposure: 1.0,
        shadowMap: { enabled: true, type: THREE.PCFSoftShadowMap },
      } as unknown as THREE.WebGLRenderer;

      viewer = new ThreeViewer({
        container: mockContainer,
        initialDeviceId: 'galaxy-watch-7-44',
        renderer: mockRenderer,
      });
    });

    afterEach(() => {
      viewer?.dispose();
      vi.restoreAllMocks();
      (globalThis as any).document = originalDocument;
      (globalThis as any).requestAnimationFrame = originalRequestAnimationFrame;
      (globalThis as any).cancelAnimationFrame = originalCancelAnimationFrame;
      (globalThis as any).ResizeObserver = originalResizeObserver;
    });

    it('preserves 1:1 mode and calibrated physical camera distance across front, tilt (35°), and side (75°) angles', () => {
      const pxPerMm = 4.2;
      viewer.setRealScale(pxPerMm);
      expect(viewer.isRealSize).toBe(true);
      expect(viewer.getCamera().fov).toBe(8);

      const expectedDist = computeRealSizeCameraDistance(600, 8, pxPerMm);
      const initialDist = viewer.getCamera().position.distanceTo(viewer.getControls().target);
      expect(initialDist).toBeCloseTo(expectedDist, 3);

      for (const angle of ['tilt', 'side', 'front'] as const) {
        viewer.setCameraAngle(angle);
        expect(viewer.isRealSize).toBe(true);
        expect(viewer.getCamera().fov).toBe(8);
        expect(viewer.getControls().minDistance).toBeCloseTo(expectedDist, 3);
        expect(viewer.getControls().maxDistance).toBeCloseTo(expectedDist, 3);
        const dist = viewer.getCamera().position.distanceTo(viewer.getControls().target);
        expect(dist).toBeCloseTo(expectedDist, 3);
      }
    });

    it('stitches both viewer canvases onto a single 2D canvas with lighting background in Compare PNG export', () => {
      const secondRenderer = {
        domElement: { ...mockCanvas, width: 800, height: 600 },
        capabilities: { getMaxAnisotropy: () => 16 },
        setPixelRatio: vi.fn(),
        setClearColor: vi.fn(),
        setSize: vi.fn(),
        render: vi.fn(),
        dispose: vi.fn(),
        outputColorSpace: THREE.SRGBColorSpace,
        toneMapping: THREE.AgXToneMapping,
        toneMappingExposure: 1.0,
        shadowMap: { enabled: true, type: THREE.PCFSoftShadowMap },
      } as unknown as THREE.WebGLRenderer;

      const compareViewer = new ThreeViewer({
        container: mockContainer,
        initialDeviceId: 'pixel-watch-3-45',
        renderer: secondRenderer,
      });

      mockCtx.fillRect.mockClear();
      mockCtx.drawImage.mockClear();
      mockCanvas.toBlob.mockClear();

      viewer.exportComparePngSnapshot(compareViewer, 'night');

      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 1600, 600);
      expect(mockCtx.drawImage).toHaveBeenCalledTimes(2);
      expect(mockCtx.drawImage).toHaveBeenNthCalledWith(1, mockCanvas, 0, 0);
      expect(mockCtx.drawImage).toHaveBeenNthCalledWith(2, secondRenderer.domElement, 800, 0);
      expect(mockCanvas.toBlob).toHaveBeenCalledTimes(1);

      compareViewer.dispose();
    });
  });
});
