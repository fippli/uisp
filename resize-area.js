export class ResizeArea {
  isResizing = false;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.isTopBorderActive = false;
  }

  render(ctx, img) {
    ctx.save();
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(img.x, img.y, img.width, img.height);
    ctx.restore();

    this.x = img.x;
    this.y = img.y;
    this.width = img.width;
    this.height = img.height;

    this.renderTopBorder(ctx);
  }

  start(img) {
    this.isResizing = true;
    this.x = img.x;
    this.y = img.y;
    this.width = img.width;
    this.height = img.height;
  }

  static borderWidth = 10;

  collidesWithTopBorder({ x, y }) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y - ResizeArea.borderWidth &&
      y <= this.y + ResizeArea.borderWidth
    );
  }

  renderTopBorder(ctx) {
    if (this.isTopBorderActive) {
      ctx.save();

      ctx.strokeStyle = "#0000ff";
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.width, this.y);
      ctx.stroke();
      ctx.closePath();

      ctx.restore();
    }
  }

  activateCollidedBorder({ x, y }) {
    if (this.collidesWithTopBorder({ x, y })) {
      this.isTopBorderActive = true;
    } else {
      this.isTopBorderActive = false;
    }
  }

  deactivateBorders() {
    this.isTopBorderActive = false;
  }

  collidesWithBorder() {
    return this.collidesWithTopBorder({ x: this.x, y: this.y });
  }
}
