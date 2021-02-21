import Shape from "./Shape";

class Application {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  shapes: Shape[];
  constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) {
    this.canvas = canvas;
    this.gl = gl;
    this.shapes = [];
  }
}

export default Application;
