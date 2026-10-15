import { describe, it, expect } from 'vitest';
import { validateScreenshotFile, checkScreenshotResolution, MAX_FILE_SIZE_BYTES } from './validator';

describe('validateScreenshotFile', () => {
  it('accepts valid PNG file', () => {
    const file = new File(['dummy binary content'], 'screenshot.png', { type: 'image/png' });
    const result = validateScreenshotFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts valid JPG and JPEG file', () => {
    const jpg = new File(['dummy binary content'], 'capture.jpg', { type: 'image/jpeg' });
    expect(validateScreenshotFile(jpg).valid).toBe(true);

    const jpeg = new File(['dummy binary content'], 'capture.jpeg', { type: 'image/jpeg' });
    expect(validateScreenshotFile(jpeg).valid).toBe(true);
  });

  it('accepts valid WebP file', () => {
    const webp = new File(['dummy binary content'], 'game.webp', { type: 'image/webp' });
    const result = validateScreenshotFile(webp);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects empty (0 byte) file', () => {
    const emptyFile = new File([], 'empty.png', { type: 'image/png' });
    const result = validateScreenshotFile(emptyFile);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/empty/i);
  });

  it('rejects files exceeding maximum size limit', () => {
    // Mock oversized file without allocating 25MB memory
    const oversized = new File(['data'], 'huge.png', { type: 'image/png' });
    Object.defineProperty(oversized, 'size', { value: MAX_FILE_SIZE_BYTES + 1024 });

    const result = validateScreenshotFile(oversized);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/exceeds maximum allowed limit/i);
  });

  it('rejects unsupported extensions', () => {
    const gifFile = new File(['data'], 'anim.gif', { type: 'image/gif' });
    expect(validateScreenshotFile(gifFile).valid).toBe(false);

    const exeFile = new File(['data'], 'malicious.exe', { type: 'application/octet-stream' });
    expect(validateScreenshotFile(exeFile).valid).toBe(false);
  });
});

describe('checkScreenshotResolution', () => {
  const nativeRes = { width: 450, height: 450 };

  it('returns valid matching status for exact resolution match', () => {
    const result = checkScreenshotResolution(450, 450, nativeRes);
    expect(result.isSquare).toBe(true);
    expect(result.matchesNative).toBe(true);
    expect(result.aspectRatio).toBe(1.0);
    expect(result.warning).toBeUndefined();
  });

  it('returns non-blocking warning for square non-matching resolution', () => {
    const result = checkScreenshotResolution(400, 400, nativeRes);
    expect(result.isSquare).toBe(true);
    expect(result.matchesNative).toBe(false);
    expect(result.aspectRatio).toBe(1.0);
    expect(result.warning).toContain('differs from device native resolution');
  });

  it('returns warning for non-square screenshot', () => {
    const result = checkScreenshotResolution(1080, 1920, nativeRes);
    expect(result.isSquare).toBe(false);
    expect(result.matchesNative).toBe(false);
    expect(result.warning).toContain('Non-square image');
  });
});
