export interface AodAnalysisResult {
  oprPercent: number; // 0..100
  litPixels: number;
  circlePixels: number;
  averageLuminance: number; // 0..1
  isCompliant: boolean;     // oprPercent <= 10.0
  burnInRisk: 'low' | 'moderate' | 'high'; // <= 10.0: low, 10.0-15.0: moderate, > 15.0: high
  hotspotCount: number;     // pixels with luminance > 0.85
}

export interface PixelBuffer {
  data: Uint8ClampedArray | ArrayLike<number>;
  width: number;
  height: number;
}

/**
 * Calculates On-Pixel Ratio (OPR %) and burn-in hotspots on a circular Wear OS watch display.
 * Pure pixel analysis from ImageData or raw pixel buffer.
 */
export function analyzeAod(imageData: PixelBuffer): AodAnalysisResult {
  const { data, width, height } = imageData;
  const radius = Math.min(width, height) / 2;
  const cx = width / 2;
  const cy = height / 2;
  const rSquared = radius * radius;

  let circlePixels = 0;
  let litPixels = 0;
  let totalLuminance = 0;
  let hotspotCount = 0;

  for (let y = 0; y < height; y++) {
    const dy = y - cy + 0.5;
    const dy2 = dy * dy;
    for (let x = 0; x < width; x++) {
      const dx = x - cx + 0.5;
      if (dx * dx + dy2 > rSquared) continue; // Outside circular display

      circlePixels++;
      const idx = (y * width + x) * 4;
      const r = data[idx] / 255;
      const g = data[idx + 1] / 255;
      const b = data[idx + 2] / 255;
      const a = data[idx + 3] / 255;

      // Perceptual luminance ITU-R BT.709
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) * a;
      totalLuminance += lum;

      // A pixel is considered lit if its perceptual luminance exceeds 0.05 (~13/255)
      if (lum > 0.05) {
        litPixels++;
      }
      // Hotspots that accelerate OLED burn-in
      if (lum > 0.85) {
        hotspotCount++;
      }
    }
  }

  const oprPercent = circlePixels > 0
    ? Number(((litPixels / circlePixels) * 100).toFixed(1))
    : 0;
  const averageLuminance = circlePixels > 0
    ? Number((totalLuminance / circlePixels).toFixed(3))
    : 0;
  const isCompliant = oprPercent <= 10.0;
  const burnInRisk: 'low' | 'moderate' | 'high' =
    oprPercent <= 10.0 ? 'low' : oprPercent <= 15.0 ? 'moderate' : 'high';

  return {
    oprPercent,
    litPixels,
    circlePixels,
    averageLuminance,
    isCompliant,
    burnInRisk,
    hotspotCount,
  };
}

/**
 * Extracts ImageData from any ScreenElement (image, video, canvas) and computes AOD analysis.
 */
export function analyzeScreenElementAod(
  element: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  sampleResolution = 256
): AodAnalysisResult | null {
  try {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = sampleResolution;
    canvas.height = sampleResolution;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(element, 0, 0, sampleResolution, sampleResolution);
    const imgData = ctx.getImageData(0, 0, sampleResolution, sampleResolution);
    return analyzeAod(imgData);
  } catch (err) {
    console.warn('AOD analysis failed:', err);
    return null;
  }
}
