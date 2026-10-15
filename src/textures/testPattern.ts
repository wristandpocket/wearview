export interface TestPatternOptions {
  size?: number;
  widthPx?: number;
  heightPx?: number;
  displayDiameterMm?: number;
  ppi?: number;
  deviceName?: string;
}

/**
 * Generates a local, non-copyrighted high-contrast test pattern for Wear OS QA.
 * Includes center crosshair, quadrant indicators, circular safe zones (100%, 90%, 80%),
 * 15° degree tick marks, and optional physical hardware metadata.
 */
export function generateTestPatternCanvas(
  sizeOrOptions: number | TestPatternOptions = 450,
  options?: TestPatternOptions
): HTMLCanvasElement {
  let size = 450;
  let opts: TestPatternOptions = {};

  if (typeof sizeOrOptions === 'number') {
    size = sizeOrOptions;
    opts = options || {};
  } else if (sizeOrOptions && typeof sizeOrOptions === 'object') {
    opts = sizeOrOptions;
    size = opts.size || opts.widthPx || 450;
  }

  const width = opts.widthPx || size;
  const height = opts.heightPx || size;
  const diameterMm = opts.displayDiameterMm;
  const ppi = opts.ppi;
  const deviceName = opts.deviceName;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const half = size / 2;

  // 1. Background - dark slate grid
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, size, size);

  // Subtle grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.lineWidth = 1;
  const step = size / 10;
  for (let i = 0; i <= size; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  // 2. Corner indicators (will be masked out on circular screens, confirming masking)
  ctx.fillStyle = '#e11d48'; // Vivid Red
  const cornerSize = step * 1.5;
  ctx.fillRect(0, 0, cornerSize, cornerSize); // Top-left
  ctx.fillRect(size - cornerSize, 0, cornerSize, cornerSize); // Top-right
  ctx.fillRect(0, size - cornerSize, cornerSize, cornerSize); // Bottom-left
  ctx.fillRect(size - cornerSize, size - cornerSize, cornerSize, cornerSize); // Bottom-right

  // 3. Circular safe zones
  // Ring 1: 100% active display boundary
  ctx.strokeStyle = '#38bdf8'; // Sky blue
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(half, half, half - 2, 0, Math.PI * 2);
  ctx.stroke();

  // Ring 2: 90% Action / Button Safe Zone
  ctx.strokeStyle = '#fbbf24'; // Amber
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.arc(half, half, half * 0.9, 0, Math.PI * 2);
  ctx.stroke();

  // Ring 3: 80% Title / Text Safe Zone
  ctx.strokeStyle = '#34d399'; // Emerald
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(half, half, half * 0.8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash

  // 4. Degree tick marks every 15° around the 100% boundary
  const rBoundary = half - 2;
  for (let deg = 0; deg < 360; deg += 15) {
    const rad = (deg - 90) * (Math.PI / 180); // 0° at 12 o'clock (top)
    const isCardinal = deg % 90 === 0;
    const isSemi = deg % 45 === 0;

    let tickLen = 6;
    if (isCardinal) {
      tickLen = 14;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
    } else if (isSemi) {
      tickLen = 10;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.5;
    } else {
      tickLen = 6;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
    }

    const xOuter = half + Math.cos(rad) * rBoundary;
    const yOuter = half + Math.sin(rad) * rBoundary;
    const xInner = half + Math.cos(rad) * (rBoundary - tickLen);
    const yInner = half + Math.sin(rad) * (rBoundary - tickLen);

    ctx.beginPath();
    ctx.moveTo(xOuter, yOuter);
    ctx.lineTo(xInner, yInner);
    ctx.stroke();

    // Cardinal degree text labels (0°, 90°, 180°, 270°)
    if (isCardinal) {
      const textR = rBoundary - tickLen - 10;
      const tx = half + Math.cos(rad) * textR;
      const ty = half + Math.sin(rad) * textR;
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px "JetBrains Mono", monospace, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${deg}°`, tx, ty);
    }
  }

  // 5. Cardinal directional edge markers & labels
  const markerThickness = 12;
  const markerSpan = step * 2;

  // TOP (12 o'clock)
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(half - markerSpan / 2, 0, markerSpan, markerThickness);

  // BOTTOM (6 o'clock)
  ctx.fillStyle = '#10b981';
  ctx.fillRect(half - markerSpan / 2, size - markerThickness, markerSpan, markerThickness);

  // LEFT (9 o'clock)
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(0, half - markerSpan / 2, markerThickness, markerSpan);

  // RIGHT (3 o'clock)
  ctx.fillStyle = '#ec4899';
  ctx.fillRect(size - markerThickness, half - markerSpan / 2, markerThickness, markerSpan);

  // Axes lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(half, 15);
  ctx.lineTo(half, size - 15);
  ctx.moveTo(15, half);
  ctx.lineTo(size - 15, half);
  ctx.stroke();

  // Safe zone indicator badges
  ctx.font = '9px "JetBrains Mono", monospace, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('90% ACTION SAFE', half, half - half * 0.9 + 12);
  ctx.fillStyle = '#34d399';
  ctx.fillText('80% TEXT SAFE', half, half - half * 0.8 + 12);

  // 6. Center badge & hardware metadata
  const badgeR = half * 0.38;
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(half, half, badgeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Center text markings
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 15px "JetBrains Mono", monospace, sans-serif';
  ctx.fillText('WEARVIEW', half, half - 22);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px "JetBrains Mono", monospace, sans-serif';
  ctx.fillText(`${width}×${height} px`, half, half - 4);

  if (diameterMm !== undefined && ppi !== undefined) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = '11px "JetBrains Mono", monospace, sans-serif';
    ctx.fillText(`${diameterMm.toFixed(2)} mm • ${ppi} PPI`, half, half + 14);
  } else {
    ctx.font = '11px "JetBrains Mono", monospace, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('QA TEST PATTERN', half, half + 14);
  }

  if (deviceName) {
    ctx.fillStyle = '#a5b4fc';
    ctx.font = '10px "JetBrains Mono", monospace, sans-serif';
    ctx.fillText(deviceName, half, half + 30);
  }

  // Edge text labels
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('▲ 12H TOP', half, 26);

  ctx.fillStyle = '#10b981';
  ctx.fillText('▼ 6H BTM', half, size - 24);

  ctx.fillStyle = '#06b6d4';
  ctx.save();
  ctx.translate(26, half);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('◄ 9H LEFT', 0, 0);
  ctx.restore();

  ctx.fillStyle = '#ec4899';
  ctx.save();
  ctx.translate(size - 26, half);
  ctx.rotate(Math.PI / 2);
  ctx.fillText('► 3H RIGHT', 0, 0);
  ctx.restore();

  return canvas;
}

export async function createTestPatternFile(
  sizeOrOptions: number | TestPatternOptions = 450,
  options?: TestPatternOptions
): Promise<File> {
  const canvas = generateTestPatternCanvas(sizeOrOptions, options);
  const size = canvas.width;
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create test pattern image blob.'));
        return;
      }
      const file = new File([blob], `wearview-test-pattern-${size}x${size}.png`, {
        type: 'image/png'
      });
      resolve(file);
    }, 'image/png');
  });
}
