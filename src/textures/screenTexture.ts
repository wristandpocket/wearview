import * as THREE from 'three';
import { calculateContainFit } from './imageFit';

/** Square region of the source, in source pixels. */
export interface CropRect {
  x: number;
  y: number;
  size: number;
}

/**
 * smooth — high-res (1024 px) mipmapped texture: best for judging composition.
 * native — the screen is resampled to the watch's own pixel grid and magnified with
 *          nearest filtering, so text/pixel-art sharpness matches the real panel.
 */
export type PixelMode = 'smooth' | 'native';

export type ScreenElement = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;

/** Anything that can be shown on the watch display: a decoded image or a live window capture. */
export interface ScreenSource {
  element: ScreenElement;
  name: string;
  /** File size in bytes; null for live captures. */
  bytes: number | null;
  live: boolean;
  crop: CropRect | null;
  /** Set for live captures so the stream can be stopped. */
  stream?: MediaStream;
}

export const SMOOTH_TEXTURE_SIZE = 1024;

export function elementSize(el: ScreenElement): { width: number; height: number } {
  if (typeof HTMLVideoElement !== 'undefined' && el instanceof HTMLVideoElement) {
    return { width: el.videoWidth, height: el.videoHeight };
  }
  if (typeof HTMLImageElement !== 'undefined' && el instanceof HTMLImageElement) {
    return { width: el.naturalWidth, height: el.naturalHeight };
  }
  return { width: el.width, height: el.height };
}

/** Largest centred square inside a w×h frame. */
export function centeredSquareCrop(width: number, height: number): CropRect {
  const size = Math.max(1, Math.min(width, height));
  return { x: Math.round((width - size) / 2), y: Math.round((height - size) / 2), size };
}

/** Keeps a crop inside the frame (the frame of a live capture can shrink while streaming). */
export function clampCrop(crop: CropRect, width: number, height: number): CropRect {
  const size = Math.max(1, Math.min(Math.round(crop.size), width, height));
  const x = Math.min(Math.max(0, Math.round(crop.x)), Math.max(0, width - size));
  const y = Math.min(Math.max(0, Math.round(crop.y)), Math.max(0, height - size));
  return { x, y, size };
}

/** Pixel size of what actually lands on the display (the crop, or the whole frame). */
export function visibleSize(source: ScreenSource): { width: number; height: number } {
  if (source.crop) return { width: source.crop.size, height: source.crop.size };
  return elementSize(source.element);
}

/**
 * Draws the source region into a square canvas: a crop fills the canvas, an uncropped
 * non-square frame is contained (centred, letterboxed in black like an OLED that is off).
 */
export function drawScreen(
  ctx: CanvasRenderingContext2D,
  source: ScreenSource,
  canvasSize: number
): boolean {
  const { width, height } = elementSize(source.element);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  if (width <= 0 || height <= 0) return false;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (source.crop) {
    const c = clampCrop(source.crop, width, height);
    ctx.drawImage(source.element, c.x, c.y, c.size, c.size, 0, 0, canvasSize, canvasSize);
  } else {
    const fit = calculateContainFit(width, height, canvasSize);
    ctx.drawImage(source.element, fit.dx, fit.dy, fit.dw, fit.dh);
  }
  return true;
}

/**
 * Owns the display texture of one viewer. Each viewer has its own, so two watches with
 * different panels can show the same source at their own native resolution side by side.
 */
export class ScreenTexture {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private _texture: THREE.CanvasTexture;
  private source: ScreenSource | null = null;
  private mode: PixelMode = 'smooth';
  private nativePx = SMOOTH_TEXTURE_SIZE;
  private lastVideoTime = -1;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = SMOOTH_TEXTURE_SIZE;
    this.ctx = this.canvas.getContext('2d');
    this._texture = this.createTexture();
  }

  get texture(): THREE.CanvasTexture {
    return this._texture;
  }

  get hasSource(): boolean {
    return this.source !== null;
  }

  private targetSize(): number {
    return this.mode === 'native' ? Math.max(16, Math.round(this.nativePx)) : SMOOTH_TEXTURE_SIZE;
  }

  private createTexture(): THREE.CanvasTexture {
    const tex = new THREE.CanvasTexture(this.canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    if (this.mode === 'native') {
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.NearestFilter;
    } else {
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
    }
    return tex;
  }

  /**
   * Sets pixel mode and the panel's native width. Returns true when the texture object was
   * replaced (GPU storage cannot be resized in place), so the caller must re-assign it.
   */
  configure(mode: PixelMode, nativePx: number): boolean {
    const prevSize = this.targetSize();
    const prevMode = this.mode;
    this.mode = mode;
    this.nativePx = nativePx;
    const size = this.targetSize();
    if (size === prevSize && mode === prevMode) return false;

    this.canvas.width = this.canvas.height = size;
    this._texture.dispose();
    this._texture = this.createTexture();
    this.draw();
    return true;
  }

  setSource(source: ScreenSource | null): void {
    this.source = source;
    this.lastVideoTime = -1;
    this.draw();
  }

  draw(): void {
    if (!this.ctx || !this.source) return;
    if (drawScreen(this.ctx, this.source, this.canvas.width)) {
      this._texture.needsUpdate = true;
    }
  }

  /** Call once per animation frame. Returns true when a new live frame was uploaded. */
  tick(): boolean {
    const el = this.source?.element;
    if (!this.source?.live || !(el instanceof HTMLVideoElement)) return false;
    if (el.readyState < 2 || el.currentTime === this.lastVideoTime) return false;
    this.lastVideoTime = el.currentTime;
    this.draw();
    return true;
  }

  dispose(): void {
    this._texture.dispose();
    this.source = null;
  }
}
