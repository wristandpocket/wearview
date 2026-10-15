import { describe, it, expect } from 'vitest';
import { centeredSquareCrop, clampCrop } from './screenTexture';

describe('crop helpers', () => {
  it('centres the largest square in landscape and portrait frames', () => {
    expect(centeredSquareCrop(1920, 1080)).toEqual({ x: 420, y: 0, size: 1080 });
    expect(centeredSquareCrop(454, 800)).toEqual({ x: 0, y: 173, size: 454 });
    expect(centeredSquareCrop(480, 480)).toEqual({ x: 0, y: 0, size: 480 });
  });

  it('keeps a crop inside the frame', () => {
    expect(clampCrop({ x: -20, y: -5, size: 100 }, 300, 200)).toEqual({ x: 0, y: 0, size: 100 });
    expect(clampCrop({ x: 280, y: 190, size: 100 }, 300, 200)).toEqual({ x: 200, y: 100, size: 100 });
  });

  it('shrinks a crop that no longer fits (captured window got smaller)', () => {
    expect(clampCrop({ x: 50, y: 50, size: 900 }, 640, 480)).toEqual({ x: 50, y: 0, size: 480 });
  });
});
