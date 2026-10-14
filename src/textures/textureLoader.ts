import * as THREE from 'three';
import { calculateContainFit } from './imageFit';
import { validateScreenshotFile } from './validator';
import type { UploadedImageInfo } from '../types';

export class TextureLoadingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TextureLoadingError';
  }
}

/**
 * Loads an uploaded File, applies aspect-preserving 'contain' logic onto a canvas,
 * and produces a calibrated Three.js CanvasTexture with correct sRGB color space.
 */
export async function loadScreenshotTexture(file: File): Promise<UploadedImageInfo> {
  const validation = validateScreenshotFile(file);
  if (!validation.valid) {
    throw new TextureLoadingError(validation.error || 'Invalid image file.');
  }

  const objectUrl = URL.createObjectURL(file);

  return new Promise<UploadedImageInfo>((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      // Immediately revoke temporary object URL once image has decoded into memory
      URL.revokeObjectURL(objectUrl);

      try {
        const sourceWidth = img.naturalWidth;
        const sourceHeight = img.naturalHeight;
        const aspectRatio = sourceWidth / sourceHeight;

        // Choose a crisp power-of-two texture resolution (1024x1024)
        const targetSize = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new TextureLoadingError('Unable to create 2D canvas context for texture processing.');
        }

        // Fill neutral dark display background (OLED off)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, targetSize, targetSize);

        // Calculate aspect-preserving fit
        const fit = calculateContainFit(sourceWidth, sourceHeight, targetSize);

        // Draw image centered and contained
        ctx.drawImage(img, fit.dx, fit.dy, fit.dw, fit.dh);

        // Create Three.js Texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        resolve({
          file,
          objectUrl: '',
          width: sourceWidth,
          height: sourceHeight,
          aspectRatio,
          texture
        });
      } catch (err) {
        reject(err instanceof Error ? err : new TextureLoadingError('Failed to process image texture.'));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new TextureLoadingError('Failed to decode image file. File may be corrupted or unreadable.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Safely disposes GPU texture memory and revokes browser object URL.
 */
export function disposeUploadedTexture(info: UploadedImageInfo | null): void {
  if (!info) return;

  try {
    if (info.texture) {
      info.texture.dispose();
    }
  } catch {
    // Ignore disposal errors on unmounted contexts
  }

  try {
    if (info.objectUrl && info.objectUrl.startsWith('blob:')) {
      URL.revokeObjectURL(info.objectUrl);
    }
  } catch {
    // Ignore URL revocation errors
  }
}
