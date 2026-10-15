export interface KeyboardActions {
  exportPng: () => void;
  toggleSafeZones: () => void;
  resetCamera: () => void;
  toggleViewMode: () => void;
  setCameraAngle: (angle: 'front' | 'tilt' | 'side') => void;
}

/**
 * Dispatches global single-key shortcuts when focus is not inside form inputs.
 * Shortcuts:
 *   [P] - Export high-res PNG snapshot
 *   [S] - Toggle Wear OS Safe Zones (80%/90%/100%)
 *   [R] - Reset camera view
 *   [W] - Toggle view mode (watch vs on-wrist)
 *   [1] - Front perpendicular view (0°)
 *   [2] - Tilt wrist-glance view (35°)
 *   [3] - Side grazing view (75°)
 */
export function handleGlobalKeyDown(
  e: {
    key: string;
    metaKey?: boolean;
    ctrlKey?: boolean;
    altKey?: boolean;
    preventDefault?: () => void;
    target?: EventTarget | null;
  },
  actions: KeyboardActions
): boolean {
  const target = e.target as HTMLElement | null;
  if (
    target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable)
  ) {
    return false;
  }
  if (e.metaKey || e.ctrlKey || e.altKey) return false;

  const key = e.key.toLowerCase();
  switch (key) {
    case 'p':
      e.preventDefault?.();
      actions.exportPng();
      return true;
    case 's':
      e.preventDefault?.();
      actions.toggleSafeZones();
      return true;
    case 'r':
      e.preventDefault?.();
      actions.resetCamera();
      return true;
    case 'w':
      e.preventDefault?.();
      actions.toggleViewMode();
      return true;
    case '1':
      e.preventDefault?.();
      actions.setCameraAngle('front');
      return true;
    case '2':
      e.preventDefault?.();
      actions.setCameraAngle('tilt');
      return true;
    case '3':
      e.preventDefault?.();
      actions.setCameraAngle('side');
      return true;
    default:
      return false;
  }
}
