import Shape from "./Shape";

class Polygon extends Shape {
  constructor(
    canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
    color: Color
  ) {
    super(canvas, gl, color);
  }

  render() {
    this.gl.useProgram(this.program);

    const arr = this.points.flat();

    const posBuf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuf);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(arr),
      this.gl.STATIC_DRAW
    );

    const a_pos = this.gl.getAttribLocation(this.program, "a_pos");
    this.gl.enableVertexAttribArray(a_pos);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuf);
    this.gl.vertexAttribPointer(a_pos, 2, this.gl.FLOAT, false, 0, 0);

    const u_color = this.gl.getUniformLocation(this.program, "u_color");
    this.gl.uniform3fv(u_color, new Float32Array(this.color));

    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, arr.length / 2);
  }
}

export default Polygon;
