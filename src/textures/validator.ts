export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const ACCEPTED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
]);

const ACCEPTED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp']);

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export function validateScreenshotFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // Validate file size
  if (file.size <= 0) {
    return { valid: false, error: 'The selected file is empty (0 bytes).' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum allowed limit of 20 MB.`
    };
  }

  // Validate extension
  const extensionMatch = file.name.match(/\.([0-9a-z]+)$/i);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : '';

  if (!ACCEPTED_EXTENSIONS.has(extension)) {
    return {
      valid: false,
      error: `Unsupported file format ".${extension || 'unknown'}". Please upload a PNG, JPEG, or WebP screenshot.`
    };
  }

  // Validate MIME type if browser provided it
  if (file.type && !ACCEPTED_MIME_TYPES.has(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported MIME type "${file.type}". Please upload a PNG, JPEG, or WebP image.`
    };
  }

  return { valid: true };
}

export interface ResolutionCheckResult {
  isSquare: boolean;
  matchesNative: boolean;
  aspectRatio: number;
  warning?: string;
}

/**
 * Validates whether an image's resolution matches the target watch screen dimensions.
 * Returns non-blocking advisory feedback if the screenshot is non-square or has
 * a different pixel resolution than the watch hardware.
 */
export function checkScreenshotResolution(
  width: number,
  height: number,
  expectedResolution: { width: number; height: number }
): ResolutionCheckResult {
  const isSquare = width === height;
  const matchesNative = width === expectedResolution.width && height === expectedResolution.height;
  const aspectRatio = width / (height || 1);

  let warning: string | undefined;
  if (!isSquare) {
    warning = `Non-square image (${width}×${height}). Wear OS displays are circular or square and non-square screenshots may be stretched or clipped.`;
  } else if (!matchesNative) {
    warning = `Image resolution (${width}×${height}) differs from device native resolution (${expectedResolution.width}×${expectedResolution.height}). Texture will be resampled by GPU.`;
  }

  return {
    isSquare,
    matchesNative,
    aspectRatio,
    warning,
  };
}
