# Specification

## Features

### Image Loading

- Drag and drop an image file onto the canvas to load it into the editor
- Multiple images can be loaded simultaneously
- New images are placed at the center of the current viewport

### Viewport Navigation

- Scroll wheel translates the viewport position (panning)
- Vertical scroll moves the view up/down
- Horizontal scroll (or Shift + vertical scroll) moves the view left/right
- This allows viewing images that extend beyond the visible canvas

### Selection

- Clicking on an image selects it (deselects any previously selected image)
- Clicking on empty canvas space deselects all images
- Only one image can be selected at a time

### Selection Indicator

- Selected image displays a visible border (e.g., dashed line or solid color)
- Selected image shows 8 transform handles:
  - 4 corner handles (for proportional resize or crop)
  - 4 edge midpoint handles (for stretch resize)

### Moving Images

- Click and drag anywhere inside a selected image to move it
- The image follows the mouse cursor maintaining the initial click offset

### Resizing Images

- Drag a corner handle to resize proportionally (maintains aspect ratio)
- Drag an edge handle to stretch in one direction only
- Resize is performed from the opposite corner/edge as anchor

### Cropping Images

- Hold Shift while dragging a corner handle to crop instead of resize
- Cropping removes pixels from the image (destructive operation)
- The corner being dragged moves inward, cutting off that portion of the image
