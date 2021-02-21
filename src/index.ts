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
  return [e.x - canvasBound.left, e.y - canvasBound.top];
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
