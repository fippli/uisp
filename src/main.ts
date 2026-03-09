/**
 * UISP - Usable Image Stuff Program
 * Main entry point
 */

import {
  type CanvasImage,
  loadImage,
  renderImageDeselected,
  renderImageSelected,
  containsPoint,
  containsCropPoint,
  moveImage,
  resizeImage,
  updateCropFrame,
} from "./canvas-image";
import { pan, screenToWorld } from "./viewport";
import {
  findHandleAtPoint,
  getCursorForHandle,
  renderSelectionUI,
  calculateResizeBounds,
  calculateCropFrameBounds,
} from "./transform-handles";
import {
  type EditorState,
  createInitialState,
  addImage,
  updateImage,
  selectImage,
  getSelectedImage,
  startDrag,
  endDrag,
  updateViewport,
} from "./editor-state";

console.log("> Welcome to the Usable Image Stuff Program!");

// State
let state: EditorState = createInitialState();

// DOM elements
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const dropHint = document.getElementById("drop-hint");

// Update drop hint visibility based on whether images are loaded
const updateDropHintVisibility = (): void => {
  if (dropHint !== null) {
    dropHint.classList.toggle("hidden", state.images.length > 0);
  }
};

// Resize canvas to fill window
const resizeCanvas = (): void => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Helper to get world coordinates from mouse event
const getWorldCoords = (event: MouseEvent): { x: number; y: number } =>
  screenToWorld(state.viewport, event.clientX, event.clientY);

// Find image at point (iterate in reverse to get topmost first)
const findImageAtPoint = (
  worldX: number,
  worldY: number
): CanvasImage | undefined =>
  [...state.images].reverse().find((img) => containsPoint(img, worldX, worldY));

// Event handlers
canvas.addEventListener("mousedown", (event: MouseEvent) => {
  if (event.button !== 0) return; // Only left click

  const { x: worldX, y: worldY } = getWorldCoords(event);
  const selectedImage = getSelectedImage(state);

  // Check if clicking on a handle of selected image
  if (selectedImage !== undefined) {
    const handleHit = findHandleAtPoint(selectedImage, worldX, worldY);
    if (handleHit !== null) {
      const dragMode =
        handleHit.layer === "crop" ? "resize-crop" : "resize-image";
      state = startDrag(
        state,
        dragMode,
        worldX,
        worldY,
        selectedImage.x,
        selectedImage.y,
        handleHit.position,
        selectedImage.cropFrame
      );
      return;
    }

    // Check if clicking inside the crop frame area (pan image behind crop)
    if (containsCropPoint(selectedImage, worldX, worldY)) {
      state = startDrag(
        state,
        "pan-image-in-crop",
        worldX,
        worldY,
        selectedImage.x,
        selectedImage.y,
        null,
        selectedImage.cropFrame
      );
      return;
    }
  }

  // Check if clicking on any image
  const clickedImage = findImageAtPoint(worldX, worldY);

  if (clickedImage !== undefined) {
    state = selectImage(state, clickedImage.id);
    state = startDrag(
      state,
      "move-image",
      worldX,
      worldY,
      clickedImage.x,
      clickedImage.y,
      null,
      null
    );
  } else {
    // Clicked on empty space - deselect
    state = selectImage(state, null);
  }
});

canvas.addEventListener("mousemove", (event: MouseEvent) => {
  const { x: worldX, y: worldY } = getWorldCoords(event);
  const selectedImage = getSelectedImage(state);

  // Update cursor based on what's under it
  const updateCursor = (): void => {
    if (selectedImage !== undefined) {
      const handleHit = findHandleAtPoint(selectedImage, worldX, worldY);
      if (handleHit !== null) {
        canvas.style.cursor = getCursorForHandle(handleHit.position);
        return;
      }
      if (containsCropPoint(selectedImage, worldX, worldY)) {
        canvas.style.cursor = "grab";
        return;
      }
      if (containsPoint(selectedImage, worldX, worldY)) {
        canvas.style.cursor = "move";
        return;
      }
    }
    canvas.style.cursor = "default";
  };

  if (state.dragMode === null) {
    updateCursor();
    return;
  }

  if (selectedImage === undefined || state.dragStart === null) return;

  // Handle resize-image
  if (state.dragMode === "resize-image" && state.activeHandle !== null) {
    const maintainAspectRatio = !event.shiftKey;
    const resizeBounds = calculateResizeBounds(
      selectedImage,
      state.activeHandle,
      worldX,
      worldY,
      maintainAspectRatio
    );

    state = updateImage(state, selectedImage.id, (img) =>
      resizeImage(
        img,
        resizeBounds.x,
        resizeBounds.y,
        resizeBounds.width,
        resizeBounds.height
      )
    );
    return;
  }

  // Handle resize-crop
  if (state.dragMode === "resize-crop" && state.activeHandle !== null) {
    const cropBounds = calculateCropFrameBounds(
      selectedImage,
      state.activeHandle,
      worldX,
      worldY
    );

    state = updateImage(state, selectedImage.id, (img) =>
      updateCropFrame(img, cropBounds)
    );
    return;
  }

  // Handle pan-image-in-crop (move image behind the crop frame)
  if (
    state.dragMode === "pan-image-in-crop" &&
    state.dragImageStart !== null &&
    state.dragCropStart !== null
  ) {
    const deltaX = worldX - state.dragStart.x;
    const deltaY = worldY - state.dragStart.y;

    const newImageX = state.dragImageStart.x + deltaX;
    const newImageY = state.dragImageStart.y + deltaY;

    // Adjust crop frame inversely so it stays at the same world position
    const newCropFrame = {
      x: state.dragCropStart.x - deltaX,
      y: state.dragCropStart.y - deltaY,
      width: state.dragCropStart.width,
      height: state.dragCropStart.height,
    };

    state = updateImage(state, selectedImage.id, (img) =>
      updateCropFrame(moveImage(img, newImageX, newImageY), newCropFrame)
    );
    return;
  }

  // Handle image drag (move-image)
  if (
    state.dragMode === "move-image" &&
    state.dragImageStart !== null
  ) {
    const deltaX = worldX - state.dragStart.x;
    const deltaY = worldY - state.dragStart.y;

    state = updateImage(state, selectedImage.id, (img) =>
      moveImage(
        img,
        state.dragImageStart!.x + deltaX,
        state.dragImageStart!.y + deltaY
      )
    );
  }
});

canvas.addEventListener("mouseup", () => {
  state = endDrag(state);
});

// Scroll to pan viewport
canvas.addEventListener(
  "wheel",
  (event: WheelEvent) => {
    event.preventDefault();
    state = updateViewport(
      state,
      pan(state.viewport, event.deltaX, event.deltaY)
    );
  },
  { passive: false }
);

// Drag and drop to load images
canvas.addEventListener("dragover", (event: DragEvent) => {
  event.preventDefault();
});

canvas.addEventListener("drop", async (event: DragEvent) => {
  event.preventDefault();

  const files = Array.from(event.dataTransfer?.files ?? []);
  const imageFiles = files.filter((file) => file.type.startsWith("image/"));

  const loadPromises = imageFiles.map(async (file) => {
    const url = URL.createObjectURL(file);
    const image = await loadImage(url);

    // Center the image in the current viewport
    const centerX =
      -state.viewport.offsetX + canvas.width / 2 - image.width / 2;
    const centerY =
      -state.viewport.offsetY + canvas.height / 2 - image.height / 2;

    return moveImage(image, centerX, centerY);
  });

  const loadedImages = await Promise.all(loadPromises);

  loadedImages.forEach((image) => {
    state = addImage(state, image);
  });

  updateDropHintVisibility();
});

// Disable context menu
canvas.addEventListener("contextmenu", (event: MouseEvent) => {
  event.preventDefault();
});

// Render loop
const render = (): void => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Apply viewport transform
  ctx.save();
  ctx.translate(state.viewport.offsetX, state.viewport.offsetY);

  // Render all images
  state.images.forEach((image) => {
    const isSelected = image.id === state.selectedImageId;
    if (isSelected) {
      renderImageSelected(ctx, image);
    } else {
      renderImageDeselected(ctx, image);
    }
  });

  // Render selection UI for selected image
  const selectedImage = getSelectedImage(state);
  if (selectedImage !== undefined) {
    renderSelectionUI(ctx, selectedImage);
  }

  ctx.restore();

  requestAnimationFrame(render);
};

render();
