/**
 * CropFrame defines the visible region of an image.
 * Coordinates are relative to the image origin.
 */
export type CropFrame = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/**
 * CanvasImage represents an image loaded into the editor.
 * Stored position is in world coordinates.
 */
export type CanvasImage = {
  readonly id: string;
  readonly image: HTMLImageElement | HTMLCanvasElement;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly loaded: boolean;
  readonly cropFrame: CropFrame;
};

let imageIdCounter = 0;

export const createCanvasImage = (): CanvasImage => ({
  id: `image-${++imageIdCounter}`,
  image: new Image(),
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  loaded: false,
  cropFrame: { x: 0, y: 0, width: 0, height: 0 },
});

export const loadImage = (src: string): Promise<CanvasImage> => {
  const img = new Image();

  return new Promise((resolve, reject) => {
    img.onload = () => {
      resolve({
        id: `image-${++imageIdCounter}`,
        image: img,
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
        loaded: true,
        cropFrame: { x: 0, y: 0, width: img.width, height: img.height },
      });
    };
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Clamp the crop frame to stay within image bounds
 */
export const clampCropFrame = (image: CanvasImage): CanvasImage => {
  const clampedX = Math.max(0, Math.min(image.cropFrame.x, image.width));
  const clampedY = Math.max(0, Math.min(image.cropFrame.y, image.height));
  const clampedWidth = Math.min(image.cropFrame.width, image.width - clampedX);
  const clampedHeight = Math.min(
    image.cropFrame.height,
    image.height - clampedY
  );

  return {
    ...image,
    cropFrame: {
      x: clampedX,
      y: clampedY,
      width: Math.max(1, clampedWidth),
      height: Math.max(1, clampedHeight),
    },
  };
};

/**
 * Get crop frame position in world coordinates
 */
export const getCropFrameWorld = (
  image: CanvasImage
): { x: number; y: number; width: number; height: number } => ({
  x: image.x + image.cropFrame.x,
  y: image.y + image.cropFrame.y,
  width: image.cropFrame.width,
  height: image.cropFrame.height,
});

/**
 * Check if a point is inside the crop frame (world coordinates)
 */
export const containsCropPoint = (
  image: CanvasImage,
  worldX: number,
  worldY: number
): boolean => {
  const crop = getCropFrameWorld(image);
  return (
    worldX >= crop.x &&
    worldX <= crop.x + crop.width &&
    worldY >= crop.y &&
    worldY <= crop.y + crop.height
  );
};

/**
 * Render image in deselected mode - only the crop frame region is visible
 */
export const renderImageDeselected = (
  ctx: CanvasRenderingContext2D,
  image: CanvasImage
): void => {
  if (image.loaded !== true) return;

  const scaleX = image.image.width / image.width;
  const scaleY = image.image.height / image.height;
  const crop = getCropFrameWorld(image);

  ctx.drawImage(
    image.image,
    image.cropFrame.x * scaleX,
    image.cropFrame.y * scaleY,
    image.cropFrame.width * scaleX,
    image.cropFrame.height * scaleY,
    crop.x,
    crop.y,
    crop.width,
    crop.height
  );
};

/**
 * Render image in selected mode - full image faded, crop region at full opacity
 */
export const renderImageSelected = (
  ctx: CanvasRenderingContext2D,
  image: CanvasImage
): void => {
  if (image.loaded !== true) return;

  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.drawImage(image.image, image.x, image.y, image.width, image.height);
  ctx.restore();

  renderImageDeselected(ctx, image);
};

export const moveImage = (
  image: CanvasImage,
  x: number,
  y: number
): CanvasImage => ({
  ...image,
  x,
  y,
});

export const resizeImage = (
  image: CanvasImage,
  x: number,
  y: number,
  width: number,
  height: number
): CanvasImage =>
  clampCropFrame({
    ...image,
    x,
    y,
    width: Math.max(1, width),
    height: Math.max(1, height),
  });

/**
 * Update the crop frame on an image (non-destructive)
 */
export const updateCropFrame = (
  image: CanvasImage,
  cropFrame: CropFrame
): CanvasImage =>
  clampCropFrame({
    ...image,
    cropFrame,
  });

/**
 * Check if a point is inside the image bounds
 */
export const containsPoint = (
  image: CanvasImage,
  x: number,
  y: number
): boolean =>
  x >= image.x &&
  x <= image.x + image.width &&
  y >= image.y &&
  y <= image.y + image.height;
