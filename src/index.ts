import Application from "./classes/Application";
import Polygon from "./classes/Polygon";

const canvas = document.getElementById("gl-display") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

if (!gl) {
  alert("Your browser does not support WebGL");
}

const app = new Application(canvas, gl);
const poly = new Polygon(canvas, gl, [1, 0, 0], [0, 1, 0]);
poly.points.push([-0.5, 0]);
poly.points.push([0, -0.5]);
poly.points.push([0.5, 0]);
poly.points.push([0, 0.5]);
app.shapeList.push(poly);
app.selectedShape = poly;
const render = () => {
  app.render();
  window.requestAnimationFrame(render);
};
window.requestAnimationFrame(render);
