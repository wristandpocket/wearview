import * as THREE from 'three';
import type { DeviceSpec } from '../types';
export type { DeviceSpec };

export interface DeviceModelResult {
  group: THREE.Group;
  displayMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  glassMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
  /** Y of the lowest point of the case back (where the wrist surface touches). */
  backY: number;
  spec: DeviceSpec;
}

export type DeviceModelBuilder = (materials: import('./materials').WatchMaterials) => DeviceModelResult;

export interface DeviceEntry {
  spec: DeviceSpec;
  createModel: DeviceModelBuilder;
}
