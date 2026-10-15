import * as THREE from 'three';

/**
 * Shared procedural geometry helpers for watch models.
 * Scene convention: 1 unit = 1 mm, watch face points +Y,
 * 12 o'clock = -Z, 6 o'clock = +Z, 3 o'clock (buttons/crown) = +X.
 */

/** Wrist cross-section used by both the strap loop and the wrist mesh (superellipse in the YZ plane). */
export const WRIST_SECTION = {
  halfWidth: 31, // across the wrist (Z)
  halfHeight: 21, // top-to-bottom (Y)
  exponent: 4, // >2 flattens the top where the watch sits
};

/** Y coordinate of the top of the wrist cross-section, given where the watch back sits. */
export function wristCenterY(watchBackY: number): number {
  return watchBackY - WRIST_SECTION.halfHeight;
}

/** Point on a superellipse at angle theta (0 = top, increasing toward +Z). */
export function superellipsePoint(theta: number, a: number, b: number, p: number, centerY: number): THREE.Vector2 {
  const s = Math.sin(theta);
  const c = Math.cos(theta);
  const z = a * Math.sign(s) * Math.pow(Math.abs(s), 2 / p);
  const y = centerY + b * Math.sign(c) * Math.pow(Math.abs(c), 2 / p);
  return new THREE.Vector2(z, y);
}

/**
 * Builds a lathe (rotational) solid from a list of (radius, y) control points.
 * Corners are rounded with a small Catmull-Rom pass so profiles read as machined, not faceted.
 */
export function latheFromProfile(points: Array<[number, number]>, segments = 128, samples = 96): THREE.LatheGeometry {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([r, y]) => new THREE.Vector3(r, y, 0)),
    false,
    'centripetal',
    0.5
  );
  const pts = curve.getSpacedPoints(samples).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
  // Force exact axis closure at both ends so caps are watertight
  if (points[0][0] === 0) pts[0].x = 0;
  if (points[points.length - 1][0] === 0) pts[pts.length - 1].x = 0;
  const geo = new THREE.LatheGeometry(pts, segments);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Sweeps a rounded-rectangle cross-section (width along X, thickness along the curve normal)
 * along a curve lying in the YZ plane. Used for straps: no Frenet twisting, smooth normals.
 */
export function sweepBand(
  path: THREE.Vector3[],
  width: number,
  thickness: number,
  options: { samples?: number; cornerRadius?: number; closed?: boolean } = {}
): THREE.BufferGeometry {
  const samples = options.samples ?? 160;
  const cornerR = Math.min(options.cornerRadius ?? thickness * 0.45, thickness / 2, width / 2);
  const curve = new THREE.CatmullRomCurve3(path, options.closed ?? false, 'centripetal');

  // Rounded rectangle cross-section in (x, n) coordinates, counter-clockwise
  const section: THREE.Vector2[] = [];
  const hw = width / 2 - cornerR;
  const ht = thickness / 2 - cornerR;
  const cornerSteps = 5;
  const corners: Array<[number, number, number]> = [
    [hw, ht, 0],
    [-hw, ht, Math.PI / 2],
    [-hw, -ht, Math.PI],
    [hw, -ht, Math.PI * 1.5],
  ];
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= cornerSteps; i++) {
      const a = start + (i / cornerSteps) * (Math.PI / 2);
      section.push(new THREE.Vector2(cx + Math.cos(a) * cornerR, cy + Math.sin(a) * cornerR));
    }
  }

  const ring = section.length;
  const positions: number[] = [];
  const indices: number[] = [];
  const xAxis = new THREE.Vector3(1, 0, 0);
  const tangent = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const p = new THREE.Vector3();

  const rings = samples + 1;
  for (let i = 0; i < rings; i++) {
    const t = i / samples;
    curve.getPointAt(Math.min(t, 1), p);
    curve.getTangentAt(Math.min(t, 1), tangent);
    normal.crossVectors(tangent, xAxis).normalize();
    for (const s of section) {
      positions.push(s.x, p.y + normal.y * s.y, p.z + normal.z * s.y);
    }
  }

  for (let i = 0; i < samples; i++) {
    for (let j = 0; j < ring; j++) {
      const a = i * ring + j;
      const b = i * ring + ((j + 1) % ring);
      const c = (i + 1) * ring + j;
      const d = (i + 1) * ring + ((j + 1) % ring);
      indices.push(a, c, b, b, c, d);
    }
  }

  if (!(options.closed ?? false)) {
    // Flat end caps
    const addCap = (ringIndex: number, flip: boolean) => {
      const centerIndex = positions.length / 3;
      let cx = 0, cy = 0, cz = 0;
      for (let j = 0; j < ring; j++) {
        const k = (ringIndex * ring + j) * 3;
        cx += positions[k]; cy += positions[k + 1]; cz += positions[k + 2];
      }
      positions.push(cx / ring, cy / ring, cz / ring);
      for (let j = 0; j < ring; j++) {
        const a = ringIndex * ring + j;
        const b = ringIndex * ring + ((j + 1) % ring);
        if (flip) indices.push(centerIndex, b, a);
        else indices.push(centerIndex, a, b);
      }
    };
    addCap(0, false);
    addCap(samples, true);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Path of a one-piece strap wrapping the shared wrist section, from the 12 o'clock attachment
 * around the underside to the 6 o'clock attachment. Attachments are (z, y) points on the case.
 */
export function wrapStrapPath(attachZ: number, attachY: number, watchBackY: number, strapThickness: number): THREE.Vector3[] {
  const { halfWidth, halfHeight, exponent } = WRIST_SECTION;
  const cy = wristCenterY(watchBackY);
  const off = strapThickness / 2 + 0.15;
  const a = halfWidth + off;
  const b = halfHeight + off;
  const pts: THREE.Vector3[] = [];

  pts.push(new THREE.Vector3(0, attachY, -attachZ));
  pts.push(new THREE.Vector3(0, attachY - 1.6, -attachZ - 3.2));

  // Find where the wrap begins: first angle whose |z| exceeds the attachment reach
  const startTheta = 0.95;
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    // Sweep from -startTheta through PI (bottom) to +startTheta on the other side
    const theta = -startTheta - (i / steps) * (2 * Math.PI - 2 * startTheta);
    const v = superellipsePoint(theta, a, b, exponent, cy);
    pts.push(new THREE.Vector3(0, v.y, v.x));
  }

  pts.push(new THREE.Vector3(0, attachY - 1.6, attachZ + 3.2));
  pts.push(new THREE.Vector3(0, attachY, attachZ));
  return pts;
}

/** Cylinder with fluted (knurled) side, axis along X. */
export function flutedCrownGeometry(radius: number, length: number, flutes = 28, depth = 0.12): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(radius, radius, length, flutes * 4, 1, false);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const r = Math.hypot(v.x, v.z);
    if (r > radius * 0.98) {
      const ang = Math.atan2(v.z, v.x);
      const k = 1 - depth / radius * (0.5 + 0.5 * Math.cos(ang * flutes));
      v.x *= k;
      v.z *= k;
      pos.setXYZ(i, v.x, v.y, v.z);
    }
  }
  geo.computeVertexNormals();
  geo.rotateZ(Math.PI / 2);
  return geo;
}

/** Flattened capsule "pill" button, long axis along Z, protruding along +X. */
export function pillButtonGeometry(length: number, height: number, protrusion: number): THREE.BufferGeometry {
  const geo = new THREE.CapsuleGeometry(height / 2, Math.max(0.01, length - height), 6, 16);
  geo.rotateX(Math.PI / 2);
  geo.scale(protrusion / height * 2, 1, 1);
  return geo;
}

/** Places an object on the case side at a clock angle measured from 3 o'clock (positive toward 12). */
export function placeOnSide(obj: THREE.Object3D, radius: number, angleFrom3: number, y: number): void {
  obj.position.set(Math.cos(angleFrom3) * radius, y, -Math.sin(angleFrom3) * radius);
  obj.rotation.y = angleFrom3;
}
