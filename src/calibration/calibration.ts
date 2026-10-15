/**
 * Screen calibration for real-size (1:1) mode.
 *
 * Browsers don't expose the physical size of a CSS pixel, so the user matches an on-screen outline
 * to a physical ISO/IEC 7810 ID-1 card (any bank card). The result — CSS pixels per millimetre — is
 * only valid for the screen, OS scaling and browser zoom it was measured with, so it is stored
 * together with that "screen signature" and discarded when the signature changes.
 */

/** ISO/IEC 7810 ID-1 card (bank cards, most ID cards). */
export const ID1_CARD_MM = { width: 85.6, height: 53.98, cornerRadius: 3.18 } as const;

export const PX_PER_MM_MIN = 2;
export const PX_PER_MM_MAX = 16;

const STORAGE_KEY = 'wearview.calibration.v1';

export interface ScreenSignature {
  dpr: number;
  screenWidth: number;
  screenHeight: number;
}

export interface StoredCalibration extends ScreenSignature {
  pxPerMm: number;
  savedAt: number;
}

export function clampPxPerMm(value: number): number {
  if (!Number.isFinite(value)) return 96 / 25.4;
  return Math.min(PX_PER_MM_MAX, Math.max(PX_PER_MM_MIN, value));
}

export function currentScreenSignature(): ScreenSignature {
  // Browser zoom changes devicePixelRatio on desktop browsers, so it is part of the signature.
  // Screen dimensions are compared orientation-independently (phones rotate).
  const w = window.screen?.width ?? 0;
  const h = window.screen?.height ?? 0;
  return {
    dpr: Math.round((window.devicePixelRatio || 1) * 1000) / 1000,
    screenWidth: Math.max(w, h),
    screenHeight: Math.min(w, h),
  };
}

export function signaturesMatch(a: ScreenSignature, b: ScreenSignature): boolean {
  if (Math.abs(a.dpr - b.dpr) >= 0.01) return false;
  // Some embedded browsers report a 0×0 screen; unknown dimensions can't contradict a match
  const known = a.screenWidth > 0 && a.screenHeight > 0 && b.screenWidth > 0 && b.screenHeight > 0;
  return !known || (a.screenWidth === b.screenWidth && a.screenHeight === b.screenHeight);
}

/** Rough starting point before calibration: CSS reference pixel on desktop, typical phone density on touch. */
export function guessPxPerMm(): number {
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  return coarse ? 6.2 : 96 / 25.4;
}

export function parseStoredCalibration(raw: string | null): StoredCalibration | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<StoredCalibration>;
    if (
      typeof data.pxPerMm !== 'number' ||
      typeof data.dpr !== 'number' ||
      typeof data.screenWidth !== 'number' ||
      typeof data.screenHeight !== 'number' ||
      data.pxPerMm < PX_PER_MM_MIN ||
      data.pxPerMm > PX_PER_MM_MAX
    ) {
      return null;
    }
    return {
      pxPerMm: data.pxPerMm,
      dpr: data.dpr,
      screenWidth: data.screenWidth,
      screenHeight: data.screenHeight,
      savedAt: typeof data.savedAt === 'number' ? data.savedAt : 0,
    };
  } catch {
    return null;
  }
}

/** Returns the stored px/mm if it was measured on this exact screen setup, otherwise null. */
export function loadCalibration(): number | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  const stored = parseStoredCalibration(raw);
  if (!stored || !signaturesMatch(stored, currentScreenSignature())) return null;
  return stored.pxPerMm;
}

/** Last saved value regardless of screen match — a better starting point than a guess. */
export function loadAnyCalibration(): number | null {
  try {
    return parseStoredCalibration(window.localStorage.getItem(STORAGE_KEY))?.pxPerMm ?? null;
  } catch {
    return null;
  }
}

export function saveCalibration(pxPerMm: number): void {
  const record: StoredCalibration = { ...currentScreenSignature(), pxPerMm: clampPxPerMm(pxPerMm), savedAt: Date.now() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage unavailable (private mode): calibration still works for this visit
  }
}
