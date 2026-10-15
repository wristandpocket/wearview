import { describe, it, expect } from 'vitest';
import { parseHash, toHash, type ShareableState } from './urlState';
import { handleGlobalKeyDown } from './keyboard';
import { vi } from 'vitest';

const defaults: ShareableState = {
  device: 'galaxy-watch-7-44',
  compareDevice: null,
  lighting: 'studio',
  viewMode: 'watch',
  safeZones: false,
  pixelMode: 'smooth',
};

describe('URL hash state', () => {
  it('round-trips every field', () => {
    const state: ShareableState = {
      device: 'pixel-watch-3-45',
      compareDevice: 'ticwatch-pro-5-48',
      lighting: 'sunlight',
      viewMode: 'wrist',
      safeZones: true,
      pixelMode: 'native',
    };
    expect(parseHash(toHash(state), defaults)).toEqual(state);
  });

  it('omits defaults to keep links short', () => {
    expect(toHash(defaults)).toBe('#d=galaxy-watch-7-44');
  });

  it('falls back to defaults on empty or garbage input', () => {
    expect(parseHash('', defaults)).toEqual(defaults);
    expect(parseHash('#d=nope&l=disco&v=moon&px=4k', defaults)).toEqual(defaults);
  });

  it('accepts legacy device aliases', () => {
    expect(parseHash('#d=pixel-watch-1-41mm', defaults).device).toBe('pixel-watch-41');
  });

  it('never carries image data', () => {
    expect(toHash({ ...defaults, compareDevice: 'galaxy-watch-5-40' })).not.toMatch(/data:|blob:/);
  });
});

describe('extra shortcuts', () => {
  it('C, N and K call optional actions and are ignored when absent', () => {
    const base = {
      exportPng: vi.fn(),
      toggleSafeZones: vi.fn(),
      resetCamera: vi.fn(),
      toggleViewMode: vi.fn(),
      setCameraAngle: vi.fn(),
    };
    expect(handleGlobalKeyDown({ key: 'c' }, base)).toBe(false);
    const actions = { ...base, toggleCompare: vi.fn(), togglePixelMode: vi.fn(), openCrop: vi.fn() };
    expect(handleGlobalKeyDown({ key: 'C' }, actions)).toBe(true);
    expect(handleGlobalKeyDown({ key: 'n' }, actions)).toBe(true);
    expect(handleGlobalKeyDown({ key: 'k' }, actions)).toBe(true);
    expect(handleGlobalKeyDown({ key: 'k', ctrlKey: true }, actions)).toBe(false);
    expect(actions.toggleCompare).toHaveBeenCalledTimes(1);
    expect(actions.togglePixelMode).toHaveBeenCalledTimes(1);
    expect(actions.openCrop).toHaveBeenCalledTimes(1);
  });
});
