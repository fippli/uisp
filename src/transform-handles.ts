/**
 * Transform handles for resize/crop operations.
 * Two layers: outer image handles (resize) and inner crop corner notches.
 */

import type { CanvasImage } from "./canvas-image";
import { getCropFrameWorld } from "./canvas-image";

export type HandlePosition = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export type HandleLayer = "image" | "crop";

export type Handle = {
  readonly position: HandlePosition;
  readonly x: number;
  readonly y: number;
  readonly size: number;
};

export type HandleHit = {
  readonly position: HandlePosition;
  readonly layer: HandleLayer;
};

const CORNER_HANDLE_SIZE = 10;
const EDGE_HANDLE_SIZE = 8;
const CROP_HANDLE_HIT_SIZE = 14;
const CROP_NOTCH_LENGTH = 16;
const CROP_NOTCH_LINE_WIDTH = 2.5;

/**
 * Get all 8 transform handles for the image bounding box
 */
export const getImageHandles = (image: CanvasImage): Handle[] => {
  const { x, y, width, height } = image;
  const midX = x + width / 2;
  const midY = y + height / 2;
  const right = x + width;
  const bottom = y + height;

  return [
    { position: "nw", x, y, size: CORNER_HANDLE_SIZE },
    { position: "n", x: midX, y, size: EDGE_HANDLE_SIZE },
    { position: "ne", x: right, y, size: CORNER_HANDLE_SIZE },
    { position: "e", x: right, y: midY, size: EDGE_HANDLE_SIZE },
    { position: "se", x: right, y: bottom, size: CORNER_HANDLE_SIZE },
    { position: "s", x: midX, y: bottom, size: EDGE_HANDLE_SIZE },
    { position: "sw", x, y: bottom, size: CORNER_HANDLE_SIZE },
    { position: "w", x, y: midY, size: EDGE_HANDLE_SIZE },
  ];
};

/**
 * Get 4 corner handles for the crop frame (world coordinates)
 */
export const getCropHandles = (image: CanvasImage): Handle[] => {
  const crop = getCropFrameWorld(image);
  const right = crop.x + crop.width;
  const bottom = crop.y + crop.height;

  return [
    { position: "nw", x: crop.x, y: crop.y, size: CROP_HANDLE_HIT_SIZE },
    { position: "ne", x: right, y: crop.y, size: CROP_HANDLE_HIT_SIZE },
    { position: "se", x: right, y: bottom, size: CROP_HANDLE_HIT_SIZE },
    { position: "sw", x: crop.x, y: bottom, size: CROP_HANDLE_HIT_SIZE },
  ];
};

/**
 * Check if a point hits a handle
 */
export const hitTestHandle = (
  handle: Handle,
  pointX: number,
  pointY: number
): boolean => {
  const halfSize = handle.size / 2;
  return (
    pointX >= handle.x - halfSize &&
    pointX <= handle.x + halfSize &&
    pointY >= handle.y - halfSize &&
    pointY <= handle.y + halfSize
  );
};

/**
 * Check if the crop frame differs from the full image bounds
 */
const hasCropOffset = (image: CanvasImage): boolean =>
  Math.abs(image.cropFrame.x) > 1 ||
  Math.abs(image.cropFrame.y) > 1 ||
  Math.abs(image.cropFrame.width - image.width) > 1 ||
  Math.abs(image.cropFrame.height - image.height) > 1;

/**
 * Find which handle (if any) is at the given point.
 * Checks crop handles first (priority), then image handles.
 * When crop frame matches full image, skip crop handle hit testing.
 */
export const findHandleAtPoint = (
  image: CanvasImage,
  pointX: number,
  pointY: number
): HandleHit | null => {
  // Check crop handles first (only if crop frame differs from full image)
  if (hasCropOffset(image)) {
    const cropHandles = getCropHandles(image);
    const cropHit = cropHandles.find((handle) =>
      hitTestHandle(handle, pointX, pointY)
    );
    if (cropHit !== undefined) {
      return { position: cropHit.position, layer: "crop" };
    }
  }

  // Check image handles
  const imageHandles = getImageHandles(image);
  const imageHit = imageHandles.find((handle) =>
    hitTestHandle(handle, pointX, pointY)
  );
  if (imageHit !== undefined) {
    return { position: imageHit.position, layer: "image" };
  }

  return null;
};

/**
 * Get cursor style for a handle position
 */
export const getCursorForHandle = (position: HandlePosition): string => {
  const cursors: Record<HandlePosition, string> = {
    nw: "nwse-resize",
    n: "ns-resize",
    ne: "nesw-resize",
    e: "ew-resize",
    se: "nwse-resize",
    s: "ns-resize",
    sw: "nesw-resize",
    w: "ew-resize",
  };
  return cursors[position];
};

/**
 * Render a single crop corner notch (L-shaped line)
 */
const renderCropNotch = (
  ctx: CanvasRenderingContext2D,
  cornerX: number,
  cornerY: number,
  dirX: number,
  dirY: number
): void => {
  ctx.beginPath();
  ctx.moveTo(cornerX + dirX * CROP_NOTCH_LENGTH, cornerY);
  ctx.lineTo(cornerX, cornerY);
  ctx.lineTo(cornerX, cornerY + dirY * CROP_NOTCH_LENGTH);
  ctx.stroke();
};

/**
 * Render selection UI: image border + handles, crop frame border + notches
 */
export const renderSelectionUI = (
  ctx: CanvasRenderingContext2D,
  image: CanvasImage
): void => {
  const { x, y, width, height } = image;
  const crop = getCropFrameWorld(image);

  ctx.save();

  // Draw image bounding box border
  ctx.strokeStyle = "#0099ff";
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.strokeRect(x, y, width, height);

  // Draw image handles (filled squares)
  const imageHandles = getImageHandles(image);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#0099ff";
  ctx.lineWidth = 1.5;

  imageHandles.forEach((handle) => {
    const halfSize = handle.size / 2;
    ctx.fillRect(
      handle.x - halfSize,
      handle.y - halfSize,
      handle.size,
      handle.size
    );
    ctx.strokeRect(
      handle.x - halfSize,
      handle.y - halfSize,
      handle.size,
      handle.size
    );
  });

  // Draw crop frame border (dashed)
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

  // Draw crop corner notches (solid L-shapes)
  ctx.setLineDash([]);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = CROP_NOTCH_LINE_WIDTH;
  ctx.lineCap = "square";

  const cropRight = crop.x + crop.width;
  const cropBottom = crop.y + crop.height;

  renderCropNotch(ctx, crop.x, crop.y, 1, 1);
  renderCropNotch(ctx, cropRight, crop.y, -1, 1);
  renderCropNotch(ctx, cropRight, cropBottom, -1, -1);
  renderCropNotch(ctx, crop.x, cropBottom, 1, -1);

  ctx.restore();
};

/**
 * Calculate new bounds when resizing from a specific handle
 */
export const calculateResizeBounds = (
  image: CanvasImage,
  handle: HandlePosition,
  mouseX: number,
  mouseY: number,
  maintainAspectRatio: boolean
): { x: number; y: number; width: number; height: number } => {
  const { x, y, width, height } = image;
  const aspectRatio = width / height;

  // Start with current bounds
  let newX = x;
  let newY = y;
  let newWidth = width;
  let newHeight = height;

  // Handle affects different edges
  const affectsLeft = handle.includes("w");
  const affectsRight = handle.includes("e");
  const affectsTop = handle.includes("n");
  const affectsBottom = handle.includes("s");
  const isCorner = ["nw", "ne", "sw", "se"].includes(handle);

  if (affectsLeft) {
    newWidth = x + width - mouseX;
    newX = mouseX;
  }
  if (affectsRight) {
    newWidth = mouseX - x;
  }
  if (affectsTop) {
    newHeight = y + height - mouseY;
    newY = mouseY;
  }
  if (affectsBottom) {
    newHeight = mouseY - y;
  }

  // Maintain aspect ratio for corners (unless shift is held)
  if (isCorner && maintainAspectRatio) {
    const newAspect = newWidth / newHeight;

    if (newAspect > aspectRatio) {
      // Width is too large, adjust it
      const adjustedWidth = newHeight * aspectRatio;
      if (affectsLeft) {
        newX = newX + newWidth - adjustedWidth;
      }
      newWidth = adjustedWidth;
    } else {
      // Height is too large, adjust it
      const adjustedHeight = newWidth / aspectRatio;
      if (affectsTop) {
        newY = newY + newHeight - adjustedHeight;
      }
      newHeight = adjustedHeight;
    }
  }

  // Prevent negative dimensions by swapping
  if (newWidth < 0) {
    newX = newX + newWidth;
    newWidth = Math.abs(newWidth);
  }
  if (newHeight < 0) {
    newY = newY + newHeight;
    newHeight = Math.abs(newHeight);
  }

  return { x: newX, y: newY, width: newWidth, height: newHeight };
};

/**
 * Calculate new crop frame bounds when resizing from a crop corner handle.
 * Returns crop frame in relative coordinates (relative to image origin).
 */
export const calculateCropFrameBounds = (
  image: CanvasImage,
  handle: HandlePosition,
  mouseX: number,
  mouseY: number
): { x: number; y: number; width: number; height: number } => {
  const crop = getCropFrameWorld(image);

  // Clamp mouse to image bounds
  const clampedX = Math.max(image.x, Math.min(mouseX, image.x + image.width));
  const clampedY = Math.max(image.y, Math.min(mouseY, image.y + image.height));

  const newCropWorld = (() => {
    switch (handle) {
      case "nw":
        return {
          x: clampedX,
          y: clampedY,
          width: crop.x + crop.width - clampedX,
          height: crop.y + crop.height - clampedY,
        };
      case "ne":
        return {
          x: crop.x,
          y: clampedY,
          width: clampedX - crop.x,
          height: crop.y + crop.height - clampedY,
        };
      case "sw":
        return {
          x: clampedX,
          y: crop.y,
          width: crop.x + crop.width - clampedX,
          height: clampedY - crop.y,
        };
      case "se":
        return {
          x: crop.x,
          y: crop.y,
          width: clampedX - crop.x,
          height: clampedY - crop.y,
        };
      default:
        return crop;
    }
  })();

  // Convert from world to relative coordinates
  return {
    x: newCropWorld.x - image.x,
    y: newCropWorld.y - image.y,
    width: Math.max(1, newCropWorld.width),
    height: Math.max(1, newCropWorld.height),
  };
};

export const isCornerHandle = (handle: HandlePosition): boolean =>
  ["nw", "ne", "sw", "se"].includes(handle);
