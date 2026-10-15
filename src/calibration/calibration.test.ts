import { describe, it, expect } from 'vitest';
import { clampPxPerMm, parseStoredCalibration, signaturesMatch, PX_PER_MM_MAX, PX_PER_MM_MIN } from './calibration';

describe('screen calibration', () => {
  it('clamps px/mm into the supported range and rejects non-numbers', () => {
    expect(clampPxPerMm(0.5)).toBe(PX_PER_MM_MIN);
    expect(clampPxPerMm(99)).toBe(PX_PER_MM_MAX);
    expect(clampPxPerMm(4.2)).toBe(4.2);
    expect(clampPxPerMm(Number.NaN)).toBeCloseTo(96 / 25.4);
  });

  it('only reuses a calibration measured with the same zoom and screen', () => {
    const base = { dpr: 1.25, screenWidth: 2560, screenHeight: 1440 };
    expect(signaturesMatch(base, { ...base })).toBe(true);
    expect(signaturesMatch(base, { ...base, dpr: 1.5 })).toBe(false); // browser zoom changed
    expect(signaturesMatch(base, { ...base, screenWidth: 1920 })).toBe(false); // other monitor
    expect(signaturesMatch(base, { dpr: 1.25, screenWidth: 0, screenHeight: 0 })).toBe(true); // screen size unknown
  });

  it('parses stored records defensively', () => {
    expect(parseStoredCalibration(null)).toBeNull();
    expect(parseStoredCalibration('{not json')).toBeNull();
    expect(parseStoredCalibration(JSON.stringify({ pxPerMm: 500, dpr: 1, screenWidth: 1, screenHeight: 1 }))).toBeNull();
    const ok = parseStoredCalibration(JSON.stringify({ pxPerMm: 3.9, dpr: 1, screenWidth: 1920, screenHeight: 1080 }));
    expect(ok?.pxPerMm).toBe(3.9);
  });
});
