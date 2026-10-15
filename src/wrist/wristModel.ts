import * as THREE from 'three';
import type { WatchMaterials } from '../devices/materials';
import { WRIST_SECTION, superellipsePoint, wristCenterY } from '../devices/geometry';

export interface WristModelResult {
  group: THREE.Group;
  wristMesh: THREE.Mesh;
  /** Moves the arm so its top surface sits under a watch whose back is at `backY`. */
  fitToWatch: (backY: number) => void;
}

interface SectionKey {
  x: number; // along the arm, hand toward +X
  a: number; // half width (Z)
  b: number; // half height (Y)
  dy: number; // vertical centre offset
}

// Simple neutral reference arm: forearm → wrist (matches WRIST_SECTION at x = 0) → back of hand
const KEYS: SectionKey[] = [
  { x: -200, a: 39, b: 27, dy: 1 },
  { x: -70, a: 36, b: 24.5, dy: 0.5 },
  { x: 0, a: WRIST_SECTION.halfWidth, b: WRIST_SECTION.halfHeight, dy: 0 },
  { x: 38, a: 36, b: 16, dy: 3.5 },
  { x: 75, a: 42, b: 13, dy: 6 },
  { x: 130, a: 41, b: 10.5, dy: 5.5 },
];
const X_START = -200;
const X_END = 130;
const CAP_START = 28;
const CAP_END = 24;

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function sectionAt(x: number): SectionKey {
  for (let i = 0; i < KEYS.length - 1; i++) {
    const k0 = KEYS[i];
    const k1 = KEYS[i + 1];
    if (x <= k1.x) {
      const t = smooth(Math.max(0, Math.min(1, (x - k0.x) / (k1.x - k0.x))));
      return {
        x,
        a: k0.a + (k1.a - k0.a) * t,
        b: k0.b + (k1.b - k0.b) * t,
        dy: k0.dy + (k1.dy - k0.dy) * t,
      };
    }
  }
  return { ...KEYS[KEYS.length - 1], x };
}

/** Rounds the two ends of the arm into domes. */
function endScale(x: number): number {
  const fromStart = x - X_START;
  const fromEnd = X_END - x;
  let s = 1;
  if (fromStart < CAP_START) s = Math.min(s, Math.sqrt(Math.max(0, 1 - Math.pow(1 - fromStart / CAP_START, 2))));
  if (fromEnd < CAP_END) s = Math.min(s, Math.sqrt(Math.max(0, 1 - Math.pow(1 - fromEnd / CAP_END, 2))));
  return s;
}

/**
 * Low-detail lofted arm used purely as a scale/context reference. The wrist cross-section
 * is the same superellipse the strap is wrapped around, so the band always hugs the skin.
 */
export function buildWristModel(materials: WatchMaterials): WristModelResult {
  const group = new THREE.Group();
  group.name = 'wristReference';

  const lengthSteps = 140;
  const ringSteps = 72;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= lengthSteps; i++) {
    // Denser sampling near the rounded ends
    const u = i / lengthSteps;
    const x = X_START + (X_END - X_START) * (0.5 - 0.5 * Math.cos(u * Math.PI));
    const s = sectionAt(x);
    const scale = endScale(x);
    for (let j = 0; j < ringSteps; j++) {
      const theta = (j / ringSteps) * Math.PI * 2;
      const p = superellipsePoint(theta, s.a * scale, s.b * scale, WRIST_SECTION.exponent, s.dy);
      positions.push(x, p.y, p.x);
    }
  }

  for (let i = 0; i < lengthSteps; i++) {
    for (let j = 0; j < ringSteps; j++) {
      const a = i * ringSteps + j;
      const b = i * ringSteps + ((j + 1) % ringSteps);
      const c = (i + 1) * ringSteps + j;
      const d = (i + 1) * ringSteps + ((j + 1) % ringSteps);
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const wristMesh = new THREE.Mesh(geometry, materials.wristSkin);
  wristMesh.name = 'wristMesh';
  wristMesh.castShadow = true;
  wristMesh.receiveShadow = true;
  group.add(wristMesh);

  return {
    group,
    wristMesh,
    fitToWatch: (backY: number) => {
      group.position.y = wristCenterY(backY) + 0.4; // slight press of the sensor into the skin
    },
  };
}
