import Application from "./classes/Application";
import Polygon from "./classes/Polygon";

const canvas = document.getElementById("gl-display") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

if (!gl) {
  alert("Your browser does not support WebGL");
}

const app = new Application(canvas, gl);

const getCanvasPos = (e: MouseEvent): Point => {
  const canvasBound = canvas.getBoundingClientRect();
  // enforce -1 to 1 axis
  return [
    ((e.x - canvasBound.left) / canvas.width) * 2 - 1,
    -(((e.y - canvasBound.top) / canvas.height) * 2 - 1),
  ];
};

canvas.onmousedown = (e) => {
  app.onMouseDown(getCanvasPos(e));
};

canvas.onmousemove = (e) => {
  app.onMouseMove(getCanvasPos(e), [e.x, e.y]);
};

canvas.onmouseup = (e) => {
  app.onMouseUp(getCanvasPos(e));
};

const selectBtn = document.getElementById("selectBtn") as HTMLButtonElement;
const lineBtn = document.getElementById("lineBtn") as HTMLButtonElement;
const squareBtn = document.getElementById("squareBtn") as HTMLButtonElement;
const polygonBtn = document.getElementById("polygonBtn") as HTMLButtonElement;
const colorBtn = document.getElementById("colorBtn") as HTMLButtonElement;
const btns = [selectBtn, lineBtn, squareBtn, polygonBtn, colorBtn];
selectBtn.disabled = true;
selectBtn.onclick = () => {
  app.setMode("selecting");
  for (const btn of btns) {
    btn.disabled = false;
  }
  selectBtn.disabled = true;
};

lineBtn.onclick = () => {
  app.setMode("line");
  for (const btn of btns) {
    btn.disabled = false;
  }
  lineBtn.disabled = true;
};

squareBtn.onclick = () => {
  app.setMode("square");
  for (const btn of btns) {
    btn.disabled = false;
  }
  squareBtn.disabled = true;
};

polygonBtn.onclick = () => {
  app.setMode("polygon");
  for (const btn of btns) {
    btn.disabled = false;
  }
  polygonBtn.disabled = true;
};

colorBtn.onclick = () => {
  // tambah ubah warna logic di Application.ts
  for (const btn of btns) {
    btn.disabled = false;
  }
  colorBtn.disabled = true;
};

document.onkeyup = (e) => {
  switch (e.key) {
    case "Escape":
      app.onEscKey();
      break;
    case "Delete":
    case "Backspace":
      app.onDelKey();
      break;
    case "1":
    case "2":
    case "3":
    case "4":
      const idx = parseInt(e.key) - 1;
      if (btns[idx]) btns[idx].onclick?.(new MouseEvent("")); // lolololol
      break;
  }
};

const render = () => {
  app.render();
  window.requestAnimationFrame(render);
};
window.requestAnimationFrame(render);
