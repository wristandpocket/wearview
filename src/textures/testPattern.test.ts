import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateTestPatternCanvas, createTestPatternFile } from './testPattern';

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
