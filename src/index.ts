import Application from "./classes/Application";
import Polygon from "./classes/Polygon";

const canvas = document.getElementById("gl-display") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

if (!gl) {
  alert("Your browser does not support WebGL");
}

const app = new Application(canvas, gl);

function getMouseCoord(e: MouseEvent): Point {
  const canvasBound = canvas.getBoundingClientRect();
  return [
    ((e.x - canvasBound.left) / canvas.width) * 2 - 1,
    -(((e.y - canvasBound.top) / canvas.height) * 2 - 1),
  ];
}

canvas.onmousedown = (e) => {
  app.onMouseDown(getMouseCoord(e));
};

canvas.onmousemove = (e) => {
  app.onMouseMove(getMouseCoord(e));
};

canvas.onmouseup = (e) => {
  app.onMouseUp(getMouseCoord(e));
};

document.onkeyup = (e) => {
  if (e.key === "Escape") {
    app.onEscKey();
  }
};

const selectBtn = document.getElementById("selectBtn") as HTMLButtonElement;
const lineBtn = document.getElementById("lineBtn") as HTMLButtonElement;
const squareBtn = document.getElementById("squareBtn") as HTMLButtonElement;
const polygonBtn = document.getElementById("polygonBtn") as HTMLButtonElement;
const btns = [selectBtn, lineBtn, squareBtn, polygonBtn];
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

const poly = new Polygon(canvas, gl, [1, 0, 0], [0, 1, 0]);
poly.addPoint([-0.5, 0]);
poly.addPoint([0, -0.5]);
poly.addPoint([0.5, 0]);
poly.addPoint([0, 0.5]);
app.shapeList.push(poly);

const render = () => {
  app.render();
  window.requestAnimationFrame(render);
};
window.requestAnimationFrame(render);
