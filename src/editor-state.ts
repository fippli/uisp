/**
 * Editor state management
 */

import type { CanvasImage, CropFrame } from "./canvas-image";
import type { Viewport } from "./viewport";
import type { HandlePosition } from "./transform-handles";

export type DragMode =
  | "move-image"
  | "resize-image"
  | "resize-crop"
  | "pan-image-in-crop";

export type EditorState = {
  readonly viewport: Viewport;
  readonly images: ReadonlyArray<CanvasImage>;
  readonly selectedImageId: string | null;
  readonly activeHandle: HandlePosition | null;
  readonly dragMode: DragMode | null;
  readonly dragStart: { readonly x: number; readonly y: number } | null;
  readonly dragImageStart: { readonly x: number; readonly y: number } | null;
  readonly dragCropStart: CropFrame | null;
};

export const createInitialState = (): EditorState => ({
  viewport: { offsetX: 0, offsetY: 0 },
  images: [],
  selectedImageId: null,
  activeHandle: null,
  dragMode: null,
  dragStart: null,
  dragImageStart: null,
  dragCropStart: null,
});

export const addImage = (
  state: EditorState,
  image: CanvasImage
): EditorState => ({
  ...state,
  images: [...state.images, image],
  selectedImageId: image.id,
});

export const updateImage = (
  state: EditorState,
  imageId: string,
  updater: (img: CanvasImage) => CanvasImage
): EditorState => ({
  ...state,
  images: state.images.map((img) => (img.id === imageId ? updater(img) : img)),
});

export const selectImage = (
  state: EditorState,
  imageId: string | null
): EditorState => ({
  ...state,
  selectedImageId: imageId,
});

export const getSelectedImage = (state: EditorState): CanvasImage | undefined =>
  state.images.find((img) => img.id === state.selectedImageId);

export const startDrag = (
  state: EditorState,
  dragMode: DragMode,
  mouseX: number,
  mouseY: number,
  imageX: number,
  imageY: number,
  handle: HandlePosition | null,
  cropFrame: CropFrame | null
): EditorState => ({
  ...state,
  dragMode,
  activeHandle: handle,
  dragStart: { x: mouseX, y: mouseY },
  dragImageStart: { x: imageX, y: imageY },
  dragCropStart: cropFrame,
});

export const endDrag = (state: EditorState): EditorState => ({
  ...state,
  dragMode: null,
  activeHandle: null,
  dragStart: null,
  dragImageStart: null,
  dragCropStart: null,
});

export const updateViewport = (
  state: EditorState,
  viewport: Viewport
): EditorState => ({
  ...state,
  viewport,
});
