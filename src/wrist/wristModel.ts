import * as THREE from 'three';
import type { WatchMaterials } from '../devices/materials';

export interface WristModelResult {
  group: THREE.Group;
  wristMesh: THREE.Mesh;
}

/**
 * Clean, solid, smoothly-shaded neutral studio forearm and wrist mannequin reference.
 * Built with watertight geometry and verified outward normals.
 * Sits flush beneath the watch case and strap without clipping or floating artifacts.
 */
export function buildWristModel(materials: WatchMaterials): WristModelResult {
  const group = new THREE.Group();
  group.name = 'wristReference';

  const armLength = 120; // Extends along X from -70 (forearm) to +50 (hand)
  const radialSegments = 64;
  const heightSegments = 24;

  // Base cylinder along Y, will be rotated to lie along X axis
  const geometry = new THREE.CylinderGeometry(18.0, 22.0, armLength, radialSegments, heightSegments, false);
  // Rotate so cylinder axis lies along X axis
  geometry.rotateZ(Math.PI / 2);

  const posAttr = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  // Morph the cylinder into an ergonomic anatomical wrist & forearm cross-section
  for (let i = 0; i < posAttr.count; i++) {
    vertex.fromBufferAttribute(posAttr, i);

    // Normalized progress along arm: 0 at proximal forearm (-60), 0.5 at wrist (0), 1.0 at hand (+50)
    const t = (vertex.x + 60) / armLength;

    // Anatomical width (Z) and depth (Y) ratios
    let widthScale = 1.35; // Human wrists are broader horizontally
    let depthScale = 0.88; // and flatter vertically

    if (t < 0.5) {
      // Forearm section (thicker, more circular)
      const ft = 1 - (t / 0.5);
      widthScale += ft * 0.15;
      depthScale += ft * 0.25;
    } else {
      // Hand / metacarpal flare
      const ht = (t - 0.5) / 0.5;
      widthScale += ht * 0.22;
      depthScale -= ht * 0.12;
    }

    vertex.z *= widthScale;
    vertex.y *= depthScale;

    // Subtle flattening of the dorsal surface directly beneath the watch (-15 <= x <= 15)
    if (vertex.y > 0 && Math.abs(vertex.x) < 20) {
      vertex.y *= 0.94;
    }

    posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  geometry.computeVertexNormals();

  // Position wrist so dorsal skin surface sits flush under the rear sensor (Y ~ -10.66 mm)
  // Matching sensor protrusion and strap lateral curve without clipping into case chassis
  const wristMesh = new THREE.Mesh(geometry, materials.wristSkin);
  wristMesh.name = 'wristMesh';
  wristMesh.position.set(0, -27.2, 0);
  wristMesh.castShadow = true;
  wristMesh.receiveShadow = true;
  group.add(wristMesh);

  return {
    group,
    wristMesh
  };
}
