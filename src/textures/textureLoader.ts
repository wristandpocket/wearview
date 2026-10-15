import { validateScreenshotFile } from './validator';
import { centeredSquareCrop, type ScreenSource } from './screenTexture';

export class TextureLoadingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TextureLoadingError';
  }
}

/** Validates and decodes an image file into a screen source. Pixels stay in browser memory. */
export async function loadScreenSource(file: File): Promise<ScreenSource> {
  const validation = validateScreenshotFile(file);
  if (!validation.valid) {
    throw new TextureLoadingError(validation.error || 'Invalid image file.');
  }

  const objectUrl = URL.createObjectURL(file);
  const img = new Image();
  try {
    img.src = objectUrl;
    await img.decode();
  } catch {
    throw new TextureLoadingError('Failed to decode image file. File may be corrupted or unreadable.');
  } finally {
    // The decoded bitmap stays alive on the element; the URL is no longer needed
    URL.revokeObjectURL(objectUrl);
  }

  return { element: img, name: file.name, bytes: file.size, live: false, crop: null };
}

/** Clipboard images arrive as "image.png"; give them a readable, valid name. */
export function fileFromClipboard(data: DataTransfer | null): File | null {
  if (!data) return null;
  for (const item of Array.from(data.items ?? [])) {
    if (item.kind !== 'file' || !item.type.startsWith('image/')) continue;
    const blob = item.getAsFile();
    if (!blob) continue;
    const ext = item.type === 'image/jpeg' ? 'jpg' : item.type.split('/')[1] || 'png';
    const stamp = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
    return new File([blob], `pasted-${stamp}.${ext}`, { type: item.type });
  }
  return null;
}

export function isWindowCaptureSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getDisplayMedia === 'function';
}

/**
 * Asks the browser to share a window/screen (e.g. the Unity Game view or the Wear OS
 * emulator) and returns it as a live source. The stream is consumed locally only.
 */
export async function startWindowCapture(): Promise<ScreenSource> {
  if (!isWindowCaptureSupported()) {
    throw new TextureLoadingError('Window capture is not supported in this browser. Use Chrome, Edge or Firefox on desktop.');
  }
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 30 } }, audio: false });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'NotAllowedError') {
      throw new TextureLoadingError('Window capture was cancelled.');
    }
    throw new TextureLoadingError('Could not start window capture.');
  }

  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;
  try {
    await video.play();
    if (video.videoWidth === 0) {
      await new Promise<void>((resolve) => video.addEventListener('loadedmetadata', () => resolve(), { once: true }));
    }
  } catch {
    stream.getTracks().forEach((t) => t.stop());
    throw new TextureLoadingError('Could not play the captured window.');
  }

  // Track labels are browser-internal ids ("window:2304:0"), not window titles
  return {
    element: video,
    name: 'Live: window capture',
    bytes: null,
    live: true,
    crop: centeredSquareCrop(video.videoWidth, video.videoHeight),
    stream,
  };
}

/** Stops a live capture and keeps its last frame as a still image source. */
export function freezeLiveSource(source: ScreenSource): ScreenSource {
  source.stream?.getTracks().forEach((t) => t.stop());
  const video = source.element as HTMLVideoElement;
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1;
  canvas.height = video.videoHeight || 1;
  canvas.getContext('2d')?.drawImage(video, 0, 0);
  video.srcObject = null;
  return { ...source, element: canvas, name: 'Last frame of window capture', live: false, stream: undefined };
}

export function stopScreenSource(source: ScreenSource | null): void {
  if (!source?.stream) return;
  source.stream.getTracks().forEach((t) => t.stop());
  if (source.element instanceof HTMLVideoElement) source.element.srcObject = null;
}
