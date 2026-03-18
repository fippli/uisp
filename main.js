console.log("> Welcome to the Usable Image Stuff Program!");

import { CanvasImage } from "./canvas-image.js";
import { CropArea } from "./crop-area.js";
import { ResizeArea } from "./resize-area.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cropArea = new CropArea(ctx);
const img = new CanvasImage();
const contextMenuElement = document.getElementById("context-menu");
const resizeArea = new ResizeArea();
let selectedTool = "none";
let contextMenu = false;

canvas.addEventListener("mousedown", (event) => {
  if (event.button === 0) {
    switch (selectedTool) {
      case "crop": {
        return cropArea.start({
          x: event.clientX,
          y: event.clientY,
        });
      }
      case "resize": {
        return resizeArea.start({
          x: event.clientX,
          y: event.clientY,
        });
      }
      default: {
        return;
      }
    }
  }

  if (event.button === 2) {
    return;
  }
});

canvas.addEventListener("mousemove", (event) => {
  const mousePosition = { x: event.clientX, y: event.clientY };
  switch (selectedTool) {
    case "crop": {
      return cropArea.expand({
        x: event.clientX,
        y: event.clientY,
      });
    }

    case "resize": {
      if (resizeArea.collidesWithBorder(mousePosition)) {
        resizeArea.activateCollidedBorder(mousePosition);
      } else {
        resizeArea.deactivateBorders();
      }
      return;
    }
    default: {
      return;
    }
  }
});

canvas.addEventListener("mouseup", (event) => {
  if (event.button === 0) {
    contextMenu = false;

    switch (selectedTool) {
      case "crop": {
        return cropArea.end();
      }
    }
  }
  if (event.button === 2) {
    contextMenu = true;
    contextMenuElement.style.top = `${event.clientY}px`;
    contextMenuElement.style.left = `${event.clientX}px`;
    return;
  }
});

canvas.addEventListener("dragover", (event) => {
  event.preventDefault();
});

canvas.addEventListener("drop", (event) => {
  event.preventDefault();

  const file = event.dataTransfer.files[0];

  img.load(URL.createObjectURL(file));
});

// right click on the canvas
canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

const init = () => {
  // calculate the width and height of the browser window
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;

  // set the canvas width and height
  canvas.width = width;
  canvas.height = height;

  // render loop
  const render = () => {
    if (contextMenu) {
      contextMenuElement.style.display = "block";
    } else {
      contextMenuElement.style.display = "none";
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    img.render(ctx);
    if (selectedTool === "resize") {
      resizeArea.render(ctx, img);
    }
    cropArea.render(ctx);
    requestAnimationFrame(render);
  };
  render();
};

init();

const selectCropTool = () => {
  selectedTool = "crop";
  contextMenu = false;
};

const confirmCrop = () => {
  selectedTool = "none";
  contextMenu = false;
  img.crop(cropArea);
};

const selectResizeTool = () => {
  selectedTool = "resize";
  contextMenu = false;
};

window.selectCropTool = selectCropTool;
window.confirmCrop = confirmCrop;
window.selectResizeTool = selectResizeTool;
