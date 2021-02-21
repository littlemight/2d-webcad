abstract class Shape {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) {
    this.canvas = canvas;
    this.gl = gl;
  }
}

export default Shape;
