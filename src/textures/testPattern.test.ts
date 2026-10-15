import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateTestPatternCanvas, createTestPatternFile } from './testPattern';
import { handleGlobalKeyDown, type KeyboardActions } from '../utils/keyboard';
import { getDeviceSpec } from '../devices';

describe('testPattern generator', () => {
  let mockCtx: any;
  let mockCanvas: any;
  const originalDocument = globalThis.document;

  beforeEach(() => {
    mockCtx = {
      fillStyle: '',
      fillRect: vi.fn(),
      strokeStyle: '',
      lineWidth: 0,
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      setLineDash: vi.fn(),
      fillText: vi.fn(),
      font: '',
      textAlign: '',
      textBaseline: '',
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
    };

    mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn((type: string) => {
        if (type === '2d') return mockCtx;
        return null;
      }),
      toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
        callback(new Blob(['fake-image-bytes'], { type: 'image/png' }));
      }),
    };

    (globalThis as any).document = {
      createElement: vi.fn((tag: string) => {
        if (tag === 'canvas') return mockCanvas;
        return {};
      }),
    };
  });

  afterEach(() => {
    (globalThis as any).document = originalDocument;
  });

  it('generates canvas with numeric size for backwards compatibility', () => {
    const canvas = generateTestPatternCanvas(400);
    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(400);
    expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    expect(mockCtx.fillRect).toHaveBeenCalled();
    expect(mockCtx.arc).toHaveBeenCalled();
  });

  it('generates canvas with rich device options and renders hardware badges', () => {
    const canvas = generateTestPatternCanvas({
      size: 456,
      widthPx: 456,
      heightPx: 456,
      displayDiameterMm: 35.56,
      ppi: 320,
      deviceName: 'Pixel Watch 3 (45mm)',
    });

    expect(canvas.width).toBe(456);
    expect(canvas.height).toBe(456);

    // Verify text markings include resolution, physical diameter, PPI, and device name
    const filledTexts = mockCtx.fillText.mock.calls.map((c: any[]) => c[0]);
    expect(filledTexts).toContain('WEARVIEW');
    expect(filledTexts).toContain('456×456 px');
    expect(filledTexts).toContain('35.56 mm • 320 PPI');
    expect(filledTexts).toContain('Pixel Watch 3 (45mm)');
    expect(filledTexts).toContain('90% ACTION SAFE');
    expect(filledTexts).toContain('80% TEXT SAFE');

    // Verify 15-degree cardinal markers (0°, 90°, 180°, 270°)
    expect(filledTexts).toContain('0°');
    expect(filledTexts).toContain('90°');
    expect(filledTexts).toContain('180°');
    expect(filledTexts).toContain('270°');
  });

  it('re-generates distinctive canvas specs when switching device profiles', () => {
    const ticwatch = getDeviceSpec('ticwatch-pro-5-48');
    generateTestPatternCanvas({
      size: ticwatch.resolutionPx.width,
      widthPx: ticwatch.resolutionPx.width,
      heightPx: ticwatch.resolutionPx.height,
      displayDiameterMm: ticwatch.activeDisplayDiameterMm,
      ppi: ticwatch.ppi,
      deviceName: ticwatch.shortLabel,
    });

    const filledTexts = mockCtx.fillText.mock.calls.map((c: any[]) => c[0]);
    expect(filledTexts).toContain('466×466 px');
    expect(filledTexts).toContain('36.32 mm • 326 PPI');
    expect(filledTexts).toContain(ticwatch.shortLabel);
  });

  it('createTestPatternFile produces a valid PNG File instance', async () => {
    const file = await createTestPatternFile({
      size: 432,
      widthPx: 432,
      heightPx: 432,
      displayDiameterMm: 33.27,
      ppi: 330,
      deviceName: 'Galaxy Watch 7 (40mm)',
    });

    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe('wearview-test-pattern-432x432.png');
    expect(file.type).toBe('image/png');
  });
});

describe('handleGlobalKeyDown keyboard shortcuts', () => {
  let actions: KeyboardActions;

  beforeEach(() => {
    actions = {
      exportPng: vi.fn(),
      toggleSafeZones: vi.fn(),
      resetCamera: vi.fn(),
      toggleViewMode: vi.fn(),
      setCameraAngle: vi.fn(),
    };
  });

  it('dispatches single-key shortcuts: P, S, R, W, 1, 2, 3', () => {
    expect(handleGlobalKeyDown({ key: 'p', preventDefault: vi.fn() }, actions)).toBe(true);
    expect(actions.exportPng).toHaveBeenCalledTimes(1);

    expect(handleGlobalKeyDown({ key: 'S', preventDefault: vi.fn() }, actions)).toBe(true);
    expect(actions.toggleSafeZones).toHaveBeenCalledTimes(1);

    expect(handleGlobalKeyDown({ key: 'r', preventDefault: vi.fn() }, actions)).toBe(true);
    expect(actions.resetCamera).toHaveBeenCalledTimes(1);

    expect(handleGlobalKeyDown({ key: 'w', preventDefault: vi.fn() }, actions)).toBe(true);
    expect(actions.toggleViewMode).toHaveBeenCalledTimes(1);

    expect(handleGlobalKeyDown({ key: '1', preventDefault: vi.fn() }, actions)).toBe(true);
    expect(actions.setCameraAngle).toHaveBeenCalledWith('front');

    expect(handleGlobalKeyDown({ key: '2', preventDefault: vi.fn() }, actions)).toBe(true);
    expect(actions.setCameraAngle).toHaveBeenCalledWith('tilt');

    expect(handleGlobalKeyDown({ key: '3', preventDefault: vi.fn() }, actions)).toBe(true);
    expect(actions.setCameraAngle).toHaveBeenCalledWith('side');
  });

  it('ignores shortcuts when focus is inside form input, select, or textarea', () => {
    const inputTarget = { tagName: 'INPUT' } as unknown as HTMLElement;
    const selectTarget = { tagName: 'SELECT' } as unknown as HTMLElement;
    const textareaTarget = { tagName: 'TEXTAREA' } as unknown as HTMLElement;
    const editableTarget = { tagName: 'DIV', isContentEditable: true } as unknown as HTMLElement;

    expect(handleGlobalKeyDown({ key: 'p', target: inputTarget }, actions)).toBe(false);
    expect(handleGlobalKeyDown({ key: 's', target: selectTarget }, actions)).toBe(false);
    expect(handleGlobalKeyDown({ key: 'r', target: textareaTarget }, actions)).toBe(false);
    expect(handleGlobalKeyDown({ key: 'w', target: editableTarget }, actions)).toBe(false);
    expect(actions.exportPng).not.toHaveBeenCalled();
    expect(actions.toggleSafeZones).not.toHaveBeenCalled();
  });

  it('ignores shortcuts when modifier keys (Ctrl, Meta, Alt) are active', () => {
    expect(handleGlobalKeyDown({ key: 'p', ctrlKey: true }, actions)).toBe(false);
    expect(handleGlobalKeyDown({ key: 'p', metaKey: true }, actions)).toBe(false);
    expect(handleGlobalKeyDown({ key: 'r', ctrlKey: true }, actions)).toBe(false);
    expect(handleGlobalKeyDown({ key: 'w', ctrlKey: true }, actions)).toBe(false);
    expect(actions.exportPng).not.toHaveBeenCalled();
    expect(actions.resetCamera).not.toHaveBeenCalled();
  });
});
