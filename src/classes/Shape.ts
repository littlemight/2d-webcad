abstract class Shape {
  program: WebGLProgram;
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  color: Color;
  points: Point[];
  constructor(
    canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
    color: Color
  ) {
    this.canvas = canvas;
    this.gl = gl;
    this.program = this.createShaderProgram();
    this.color = color;
    this.points = [];
  }

  createShaderProgram() {
    const program = this.gl.createProgram();
    if (!program) {
      throw new Error("Error on creating program!");
    }
    this.gl.attachShader(
      program,
      this.createShader(
        this.gl.VERTEX_SHADER,
        `
          precision mediump float;
          attribute vec2 a_pos;
          void main() {
            gl_Position = vec4(a_pos, 0, 1);
          }
        `
      )
    );
    this.gl.attachShader(
      program,
      this.createShader(
        this.gl.FRAGMENT_SHADER,
        `
          precision mediump float;
          uniform vec3 u_color;
          void main() {
            gl_FragColor = vec4(u_color, 1);
          }
        `
      )
    );
    this.gl.linkProgram(program);
    return program;
  }

  createShader(type: number, shaderCode: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) {
      throw new Error("Error on creating shader!");
    }
    this.gl.shaderSource(shader, shaderCode);
    this.gl.compileShader(shader);
    return shader;
  }

}

export default Shape;
