export class CropArea {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.isDragging = false;
  }

  render(ctx) {
    // ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // draw a circle at x,y

    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.x + this.width, this.y + this.height, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.closePath();

    ctx.beginPath();
    ctx.arc(this.x, this.y + this.height, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.closePath();

    ctx.beginPath();
    ctx.arc(this.x + this.width, this.y, 5, 0, 2 * Math.PI);
    ctx.fill();

    ctx.closePath();
  }

  start({ x, y }) {
    this.x = x;
    this.y = y;
    this.width = 0;
    this.height = 0;
    this.isDragging = true;
  }

  expand({ x, y }) {
    if (this.isDragging) {
      this.width = x - this.x;
      this.height = y - this.y;
    }
  }

  end() {
    this.isDragging = false;
  }
}
