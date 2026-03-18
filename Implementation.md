# Implementation Guide

## Architecture Overview

The editor follows a canvas-based rendering architecture with the following core concepts:

- **Viewport**: The visible area that can be panned using scroll/wheel
- **Canvas Images**: Individual image objects that can be selected and transformed
- **Selection State**: Tracks which image is currently selected
- **Transform Handles**: Visual controls for resize/crop operations

## User Interactions

### Loading Images

- **Drag & Drop**: Drag an image file onto the canvas to load it
- Images are placed at the center of the current viewport

### Viewport Navigation

- **Scroll/Wheel**: Pan the viewport
  - Vertical scroll: moves viewport up/down
  - Horizontal scroll (Shift + scroll): moves viewport left/right
  - Or use trackpad two-finger scroll for both axes

### Selecting Images

- **Click on image**: Selects the image
- **Click on empty space**: Deselects all images
- Selected images display:
  - A border outline
  - 8 transform handles (4 corners + 4 edge midpoints)

### Moving Images

- **Drag selected image**: Click and drag anywhere inside a selected image to move it
- The cursor changes to `move` when hovering over a selected image's interior

### Resizing Images

- **Drag corner handle**: Resize from corner (maintains aspect ratio by default)
- **Drag edge handle**: Resize from edge (stretches in one direction)
- **Hold Shift while dragging corner**: Free resize (no aspect ratio constraint)

### Cropping Images

- **Hold Shift + drag corner handle**: Crops the image instead of resizing
- The crop removes pixels from the edge being dragged toward

## File Structure

```text
├── main.js           # Entry point, event handling, render loop
├── canvas-image.js   # CanvasImage class - image loading, rendering, transforms
├── viewport.js       # Viewport class - pan/scroll offset management
├── selection.js      # Selection state management
├── transform.js      # Transform handles and hit detection
└── style.css         # Styling
```

## Technical Details

### Coordinate Systems

1. **Screen coordinates**: Mouse position relative to browser window
2. **Canvas coordinates**: Screen coords minus canvas offset
3. **World coordinates**: Canvas coords minus viewport offset

All image positions are stored in world coordinates.

### Transform Handles

Handles are rendered at 8 positions around the selected image:

```text
[NW]----[N]----[NE]
  |             |
[W]           [E]
  |             |
[SW]----[S]----[SE]
```

- Corner handles (NW, NE, SW, SE): 8x8px squares
- Edge handles (N, S, E, W): 6x6px squares

### Hit Testing Order

1. Transform handles (highest priority)
2. Image interior
3. Empty canvas (lowest priority)

## State Management

The application maintains the following state:

- `viewport`: { offsetX, offsetY } - Current pan position
- `images`: CanvasImage[] - All loaded images
- `selectedImage`: CanvasImage | null - Currently selected image
- `activeHandle`: string | null - Handle being dragged ('nw', 'n', 'ne', etc.)
- `isDragging`: boolean - Whether user is dragging an image
- `dragStart`: { x, y } - Mouse position when drag started

## Rendering Pipeline

Each frame:

1. Clear canvas
2. Apply viewport transform (translate by offset)
3. Render all images
4. Render selection UI for selected image (border + handles)
5. Request next frame
