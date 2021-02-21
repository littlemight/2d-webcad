import Shape from "./Shape";

class Application {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  shapeList: Shape[];
  constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) {
    this.canvas = canvas;
    this.gl = gl;
    this.shapeList = [];

    this.gl.viewport(0, 0, canvas.width, canvas.height);
  }

  render() {
    this.gl.clearColor(1, 1, 1, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    for (const shape of this.shapeList) {
      shape.render();
    }
  }
}

export default Application;
