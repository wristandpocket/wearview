import { describe, it, expect } from 'vitest';
import {
  WRIST_SECTION,
  wrapStrapPath,
  wristCenterY,
  knurledBezelGeometry,
  squircleCaseGeometry,
  asymmetricCaseGeometry,
  flutedCrownGeometry,
  pillButtonGeometry,
} from './geometry';

/** Superellipse "radius" test: < 1 inside the wrist section, > 1 outside. */
function sectionValue(z: number, y: number, centerY: number): number {
  const { halfWidth, halfHeight, exponent } = WRIST_SECTION;
  return Math.pow(Math.abs(z) / halfWidth, exponent) + Math.pow(Math.abs(y - centerY) / halfHeight, exponent);
}

describe('strap wrap geometry', () => {
  for (const [label, attachZ, attachY, backY, thickness] of [
    ['Galaxy Watch5', 21.2, -5.0, -11.4, 2.6],
    ['Pixel Watch', 18.4, -5.6, -10.1, 2.4],
    ['Galaxy Watch Ultra', 22.8, -5.2, -13.7, 2.8],
    ['TicWatch Pro 5', 24.5, -5.2, -13.7, 2.8],
  ] as const) {
    it(`${label}: band wraps outside the wrist and closes at both attachments`, () => {
      const path = wrapStrapPath(attachZ, attachY, backY, thickness);
      const cy = wristCenterY(backY);

      expect(path[0].z).toBeCloseTo(-attachZ);
      expect(path[path.length - 1].z).toBeCloseTo(attachZ);

      // Every wrap point (excluding the case attachments) sits outside the skin surface
      for (const p of path.slice(2, -2)) {
        expect(sectionValue(p.z, p.y, cy)).toBeGreaterThan(1);
      }
      // Band reaches under the wrist
      const lowest = Math.min(...path.map((p) => p.y));
      expect(lowest).toBeLessThan(cy - WRIST_SECTION.halfHeight);
    });
  }
});

describe('procedural watch geometry generators', () => {
  it('knurledBezelGeometry generates valid 3D notched ring', () => {
    const geo = knurledBezelGeometry(18.0, 22.0, 1.35, 48, 0.35);
    expect(geo.attributes.position).toBeDefined();
    expect(geo.attributes.normal).toBeDefined();
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    expect(bb.max.x).toBeCloseTo(22.0, 0.5);
    expect(bb.min.x).toBeCloseTo(-22.0, 0.5);
    expect(bb.max.y - bb.min.y).toBeCloseTo(1.35, 0.5);
  });

  it('squircleCaseGeometry generates valid cushion body with expected dimensions', () => {
    const geo = squircleCaseGeometry(47.4, 47.4, 11.0, 14.0);
    expect(geo.attributes.position).toBeDefined();
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    expect(bb.max.x - bb.min.x).toBeCloseTo(47.4, 0.5);
    expect(bb.max.z - bb.min.z).toBeCloseTo(47.4, 0.5);
  });

  it('asymmetricCaseGeometry generates flared chassis with right-side bulge', () => {
    const geo = asymmetricCaseGeometry(23.3, 2.8, 11.0);
    expect(geo.attributes.position).toBeDefined();
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    // Right side (+X) bulges more than left side (-X)
    expect(bb.max.x).toBeGreaterThan(Math.abs(bb.min.x));
  });

  it('flutedCrownGeometry and pillButtonGeometry generate valid geometries', () => {
    const crown = flutedCrownGeometry(2.5, 2.0, 28, 0.14);
    expect(crown.attributes.position).toBeDefined();
    const pill = pillButtonGeometry(6.0, 2.0, 1.0);
    expect(pill.attributes.position).toBeDefined();
  });
});
