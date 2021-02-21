import Shape from "./Shape";

class Polygon extends Shape {
  constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) {
    super(canvas, gl);
  }
}

export default Polygon;
