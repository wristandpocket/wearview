/**
 * Generates a local, non-copyrighted high-contrast test pattern for Wear OS QA.
 * Includes center crosshair, quadrant indicators, circular safe zones, and edge markers.
 */
export function generateTestPatternCanvas(size = 450): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const half = size / 2;

  // Background - dark slate grid
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

  // Corner indicators (will be masked out on circular screens, confirming masking)
  ctx.fillStyle = '#e11d48'; // Vivid Red
  const cornerSize = step * 1.5;
  // Top-left
  ctx.fillRect(0, 0, cornerSize, cornerSize);
  // Top-right
  ctx.fillRect(size - cornerSize, 0, cornerSize, cornerSize);
  // Bottom-left
  ctx.fillRect(0, size - cornerSize, cornerSize, cornerSize);
  // Bottom-right
  ctx.fillRect(size - cornerSize, size - cornerSize, cornerSize, cornerSize);

  // Circular guide rings
  // 1. 100% active display boundary
  ctx.strokeStyle = '#38bdf8'; // Sky blue
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(half, half, half - 2, 0, Math.PI * 2);
  ctx.stroke();

  // 2. 90% HUD safe zone
  ctx.strokeStyle = '#fbbf24'; // Amber
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.arc(half, half, half * 0.9, 0, Math.PI * 2);
  ctx.stroke();

  // 3. 75% Text safe area
  ctx.strokeStyle = '#34d399'; // Emerald
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(half, half, half * 0.75, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash

  // Cardinal directional edge markers & labels
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
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(half, 15);
  ctx.lineTo(half, size - 15);
  ctx.moveTo(15, half);
  ctx.lineTo(size - 15, half);
  ctx.stroke();

  // Center crosshair and badge
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(half, half, half * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Text markings
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 15px "JetBrains Mono", monospace, sans-serif';
  ctx.fillText('WEARVIEW', half, half - 18);

  ctx.font = '11px "JetBrains Mono", monospace, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('QA TEST PATTERN', half, half - 2);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px "JetBrains Mono", monospace, sans-serif';
  ctx.fillText(`${size}×${size} SQ`, half, half + 16);

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

export async function createTestPatternFile(size = 450): Promise<File> {
  const canvas = generateTestPatternCanvas(size);
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
