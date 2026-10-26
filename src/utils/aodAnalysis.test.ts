import { describe, it, expect } from 'vitest';
import { analyzeAod } from './aodAnalysis';

describe('analyzeAod (On-Pixel Ratio & Burn-In Analysis)', () => {
  it('calculates 0% OPR and low risk for fully black screen', () => {
    const width = 100;
    const height = 100;
    const data = new Uint8ClampedArray(width * height * 4); // all zeroes = black
    for (let i = 3; i < data.length; i += 4) data[i] = 255; // opaque alpha

    const result = analyzeAod({ data, width, height });

    expect(result.oprPercent).toBe(0.0);
    expect(result.litPixels).toBe(0);
    expect(result.isCompliant).toBe(true);
    expect(result.burnInRisk).toBe('low');
    expect(result.hotspotCount).toBe(0);
    expect(result.circlePixels).toBeGreaterThan(7000);
  });

  it('calculates 100% OPR and high risk for solid white screen', () => {
    const width = 100;
    const height = 100;
    const data = new Uint8ClampedArray(width * height * 4);
    data.fill(255);

    const result = analyzeAod({ data, width, height });

    expect(result.oprPercent).toBe(100.0);
    expect(result.litPixels).toBe(result.circlePixels);
    expect(result.isCompliant).toBe(false);
    expect(result.burnInRisk).toBe('high');
    expect(result.hotspotCount).toBe(result.circlePixels);
    expect(result.averageLuminance).toBeCloseTo(1.0, 1);
  });

  it('accurately distinguishes compliant ambient screen (~5% lit) from non-compliant (~20% lit)', () => {
    const width = 100;
    const height = 100;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 3; i < data.length; i += 4) data[i] = 255;

    // Draw a small central line / clock hand (small % of circle pixels)
    for (let y = 20; y <= 50; y++) {
      for (let x = 49; x <= 51; x++) {
        const idx = (y * width + x) * 4;
        data[idx] = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
      }
    }

    const result = analyzeAod({ data, width, height });

    expect(result.oprPercent).toBeLessThan(10.0);
    expect(result.isCompliant).toBe(true);
    expect(result.burnInRisk).toBe('low');
  });
});
