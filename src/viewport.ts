/**
 * Viewport manages the pan/scroll offset for the canvas.
 * All rendering is translated by the viewport offset.
 */

export type Viewport = {
  offsetX: number;
  offsetY: number;
};

export const createViewport = (): Viewport => ({
  offsetX: 0,
  offsetY: 0,
});

export const pan = (
  viewport: Viewport,
  deltaX: number,
  deltaY: number
): Viewport => ({
  offsetX: viewport.offsetX - deltaX,
  offsetY: viewport.offsetY - deltaY,
});

/**
 * Convert screen coordinates to world coordinates
 */
export const screenToWorld = (
  viewport: Viewport,
  screenX: number,
  screenY: number
): { x: number; y: number } => ({
  x: screenX - viewport.offsetX,
  y: screenY - viewport.offsetY,
});

/**
 * Convert world coordinates to screen coordinates
 */
export const worldToScreen = (
  viewport: Viewport,
  worldX: number,
  worldY: number
): { x: number; y: number } => ({
  x: worldX + viewport.offsetX,
  y: worldY + viewport.offsetY,
});
