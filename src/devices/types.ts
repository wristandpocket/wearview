import * as THREE from 'three';
import type { DeviceSpec } from '../types';
export type { DeviceSpec };

export interface DeviceModelResult {
  group: THREE.Group;
  displayMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  glassMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
  spec: DeviceSpec;
}

export type DeviceModelBuilder = (materials: import('./materials').WatchMaterials) => DeviceModelResult;

export interface DeviceEntry {
  spec: DeviceSpec;
  createModel: DeviceModelBuilder;
}
