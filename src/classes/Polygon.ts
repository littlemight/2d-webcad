import Shape from "./Shape";

class Polygon extends Shape {
  renderSelected() {
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

    this.gl.lineWidth(6);

    const u_color = this.gl.getUniformLocation(this.program, "u_color");

    this.gl.uniform3fv(u_color, new Float32Array([0.4, 0.4, 0]));
    this.gl.drawArrays(this.gl.LINE_LOOP, 0, arr.length / 2);

    const arr2 = this.points
      .map((v) => {
        return [
          v[0] + 0.015,
          v[1] + 0.015,
          v[0] - 0.015,
          v[1] + 0.015,
          v[0] + 0.015,
          v[1] - 0.015,
          v[0] - 0.015,
          v[1] - 0.015,
        ];
      })
      .flat();

    // const posBuf2 = this.gl.createBuffer();
    // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuf2);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(arr2),
      this.gl.STATIC_DRAW
    );

    const a_pos2 = this.gl.getAttribLocation(this.program, "a_pos");
    this.gl.enableVertexAttribArray(a_pos2);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuf);
    this.gl.vertexAttribPointer(a_pos2, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.uniform3fv(u_color, new Float32Array(this.selectedColor));
    for (let i = 0; i * 4 < arr2.length; ++i) {
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, i * 4, 4);
    }
  }

  renderShape() {
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
