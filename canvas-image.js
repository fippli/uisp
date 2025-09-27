export class CanvasImage {
  constructor() {
    this.image = new Image();
  }

  load(src) {
    this.image.src = src;
  }

  render(ctx) {
    ctx.drawImage(this.image, 0, 0);
  }

  crop({ x, y, width, height }) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.image, x, y, width, height, 0, 0, width, height);
    this.image = canvas;
    return canvas;
  }
}
