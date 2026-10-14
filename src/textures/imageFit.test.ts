import { describe, it, expect } from 'vitest';
import { calculateContainFit } from './imageFit';

describe('calculateContainFit', () => {
  it('correctly fits exact square image into square target', () => {
    const fit = calculateContainFit(450, 450, 1024);
    expect(fit.isSquare).toBe(true);
    expect(fit.aspectRatio).toBeCloseTo(1.0, 3);
    expect(fit.dx).toBe(0);
    expect(fit.dy).toBe(0);
    expect(fit.dw).toBe(1024);
    expect(fit.dh).toBe(1024);
  });

  it('correctly centers landscape image vertically without stretching', () => {
    // 1920 x 1080 (16:9 ratio = 1.7777...)
    const fit = calculateContainFit(1920, 1080, 1024);
    expect(fit.isSquare).toBe(false);
    expect(fit.aspectRatio).toBeCloseTo(1.7777, 3);
    expect(fit.dw).toBe(1024);
    expect(fit.dh).toBe(576); // 1024 / (16/9) = 576
    expect(fit.dx).toBe(0);
    expect(fit.dy).toBe(224); // (1024 - 576) / 2 = 224
  });

  it('correctly centers portrait image horizontally without stretching', () => {
    // 1080 x 1920 (9:16 ratio = 0.5625)
    const fit = calculateContainFit(1080, 1920, 1024);
    expect(fit.isSquare).toBe(false);
    expect(fit.aspectRatio).toBeCloseTo(0.5625, 3);
    expect(fit.dh).toBe(1024);
    expect(fit.dw).toBe(576); // 1024 * 0.5625 = 576
    expect(fit.dy).toBe(0);
    expect(fit.dx).toBe(224); // (1024 - 576) / 2 = 224
  });

  it('throws an error for non-positive dimensions', () => {
    expect(() => calculateContainFit(0, 450, 1024)).toThrow();
    expect(() => calculateContainFit(450, -10, 1024)).toThrow();
    expect(() => calculateContainFit(450, 450, 0)).toThrow();
  });
});
