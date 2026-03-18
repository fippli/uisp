export class CanvasImage {
  x = 0;
  y = 0;
  width = 0;
  height = 0;

  constructor() {
    this.image = new Image();
  }

  load(src) {
    this.image.src = src;

    this.image.onload = () => {
      this.width = this.image.width;
      this.height = this.image.height;
    };
  }

  render(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
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

  resize(resizeArea) {
    this.width = resizeArea.width;
    this.height = resizeArea.height;
  }
}
