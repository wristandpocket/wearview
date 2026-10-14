export interface FitDimensions {
  targetSize: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
  isSquare: boolean;
  aspectRatio: number;
}

/**
 * Calculates centered 'contain' bounding box for an image within a square target canvas.
 * Preserves exact aspect ratio and centers the image.
 */
export function calculateContainFit(
  sourceWidth: number,
  sourceHeight: number,
  targetSize = 1024
): FitDimensions {
  if (sourceWidth <= 0 || sourceHeight <= 0 || targetSize <= 0) {
    throw new Error('Image dimensions and target size must be positive numbers.');
  }

  const aspectRatio = sourceWidth / sourceHeight;
  const isSquare = Math.abs(aspectRatio - 1.0) < 0.001;

  if (isSquare) {
    return {
      targetSize,
      dx: 0,
      dy: 0,
      dw: targetSize,
      dh: targetSize,
      isSquare: true,
      aspectRatio: 1.0
    };
  }

  if (sourceWidth > sourceHeight) {
    // Landscape: fit width, center vertically
    const dw = targetSize;
    const dh = Math.round(targetSize / aspectRatio);
    const dx = 0;
    const dy = Math.round((targetSize - dh) / 2);
    return {
      targetSize,
      dx,
      dy,
      dw,
      dh,
      isSquare: false,
      aspectRatio
    };
  } else {
    // Portrait: fit height, center horizontally
    const dh = targetSize;
    const dw = Math.round(targetSize * aspectRatio);
    const dy = 0;
    const dx = Math.round((targetSize - dw) / 2);
    return {
      targetSize,
      dx,
      dy,
      dw,
      dh,
      isSquare: false,
      aspectRatio
    };
  }
}
