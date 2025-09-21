console.log("Hello World");

// Drag and drop image into the canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.addEventListener("dragover", (e) => {
  e.preventDefault();
});

canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = () => {
    ctx.drawImage(image, 0, 0);
  };
});
