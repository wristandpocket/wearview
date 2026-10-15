import { describe, it, expect } from 'vitest';
import { WRIST_SECTION, wrapStrapPath, wristCenterY } from './geometry';

/** Superellipse "radius" test: < 1 inside the wrist section, > 1 outside. */
function sectionValue(z: number, y: number, centerY: number): number {
  const { halfWidth, halfHeight, exponent } = WRIST_SECTION;
  return Math.pow(Math.abs(z) / halfWidth, exponent) + Math.pow(Math.abs(y - centerY) / halfHeight, exponent);
}

describe('strap wrap geometry', () => {
  for (const [label, attachZ, attachY, backY, thickness] of [
    ['Galaxy Watch5', 21.2, -5.0, -11.4, 2.6],
    ['Pixel Watch', 18.4, -5.6, -10.1, 2.4],
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
