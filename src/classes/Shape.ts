import { createId, createShader } from "../utils/utils";

abstract class Shape {
  program: WebGLProgram;
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  // Info JSON
  color: Color;
  selectedColor: Color;
  points: { id: number; pos: Point }[];
  id: number = createId();
  // End of Info JSON
  constructor(
    canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
    color: Color,
    selectedColor: Color,
    points: {id: number; pos: Point}[]
  ) {
    this.canvas = canvas;
    this.gl = gl;
    this.program = this.createShaderProgram();
    this.color = color;
    this.selectedColor = selectedColor;
    this.points = points;
  }

  createShaderProgram() {
    const program = this.gl.createProgram();
    if (!program) {
      throw new Error("Error on creating program!");
    }
    this.gl.attachShader(
      program,
      createShader(
        this.gl,
        this.gl.VERTEX_SHADER,
        `
          precision mediump float;
          attribute vec2 a_pos;
          uniform mat3 u_proj_mat;

          void main() {
            gl_Position = vec4(a_pos, 0, 1);
          }
        `
      )
    );
    this.gl.attachShader(
      program,
      createShader(
        this.gl,
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

  hasId(id: number) {
    return this.id === id || this.points.filter((v) => v.id === id).length;
  }

  addPoint(point: Point) {
    this.points.push({
      id: createId(),
      pos: point,
    });
  }

  onMouseMove(id: number, bef: Point, pos: Point) {
    const dx = pos[0] - bef[0];
    const dy = pos[1] - bef[1];
    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.points.length / 2);
    if (id === this.id) {
      for (let i = 0; i < this.points.length; ++i) {
        this.points[i].pos[0] += dx;
        this.points[i].pos[1] += dy;
      }
    } else {
      const i = this.points.findIndex((v) => v.id === id);
      if (i >= 0 && i < this.points.length) {
        this.points[i].pos = [
          this.points[i].pos[0] + dx,
          this.points[i].pos[1] + dy,
        ];
      }
    }
  }

  updateLastPoint(pos: Point) {
    const p = this.points[this.points.length - 1];
    if (!p) {
      return;
    }
    this.points[this.points.length - 1] = {
      id: p.id,
      pos,
    };
  }

  updateColor(color: Color, selectedColor: Color) {
    this.color = color;
    this.selectedColor = selectedColor;
  }

  abstract render(selected: boolean, program: WebGLProgram | null): void;
  abstract toSaveData(): {
    type: ShapeType;
    id: number;
    color: Color;
    selectedColor: Color;
    points: { id: number; pos: Point }[];
  };

  // TO DO:
  // array of json buat save sama load:
  // satu json = {type, color, selected color, points, id}
}

export default Shape;
