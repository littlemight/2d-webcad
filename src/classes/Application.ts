import { createShader, rgbaToId } from "../utils/utils";
import Polygon from "./Polygon";
import Rectangle from "./Rectangle";
import Shape from "./Shape";
import Line from "./Line";

class Application {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  shapeList: Shape[];
  selected?: {
    id: number;
    shape: Shape;
  };
  pixelId?: number; // buat selecting
  mode: Mode = "selecting";
  selectProgram: WebGLProgram | null = null;
  frameBuf: WebGLFramebuffer | null = null;
  mousePos: Point = [0, 0];
  mousePosBef: Point = [0, 0];
  mousePressed: boolean = false;
  drawingShape: Shape | null = null;

  constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) {
    this.canvas = canvas;
    this.gl = gl;
    this.shapeList = [];

    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.selectProgram = this.setupSelectProgram();
  }

  setMode(mode: Mode) {
    if (mode === this.mode) {
      return;
    }
    this.mode = mode;
    this.selected = undefined;
    this.drawingShape = null;
  }

  setupSelectProgram() {
    const selectProgram = this.gl.createProgram();
    if (!selectProgram) {
      throw new Error("Failed when creating hitbox program!");
    }
    this.gl.attachShader(
      selectProgram,
      createShader(
        this.gl,
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
      selectProgram,
      createShader(
        this.gl,
        this.gl.FRAGMENT_SHADER,
        `
          precision mediump float;

          uniform vec4 u_color;

          void main() {
            gl_FragColor = u_color;
          }
        `
      )
    );

    this.gl.linkProgram(selectProgram);

    const texBuf = this.gl.createTexture();
    if (!texBuf) {
      throw new Error("Failed creating texture");
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, texBuf);
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );

    const depBuf = this.gl.createRenderbuffer();
    if (!depBuf) {
      throw new Error("Failed creating render buffer");
    }
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depBuf);

    this.gl.bindTexture(this.gl.TEXTURE_2D, texBuf);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.canvas.width,
      this.gl.canvas.height,
      0,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      null
    );
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depBuf);
    this.gl.renderbufferStorage(
      this.gl.RENDERBUFFER,
      this.gl.DEPTH_COMPONENT16,
      this.gl.canvas.width,
      this.gl.canvas.height
    );

    const frameBuf = this.gl.createFramebuffer();
    if (!frameBuf) {
      throw new Error("Failed creating frame buffer");
    }
    this.frameBuf = frameBuf;

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuf);

    // using the texture and depth buffer with frame buffer
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      texBuf,
      0
    );
    this.gl.framebufferRenderbuffer(
      this.gl.FRAMEBUFFER,
      this.gl.DEPTH_ATTACHMENT,
      this.gl.RENDERBUFFER,
      depBuf
    );

    return selectProgram;
  }

  render() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuf);
    this.gl.enable(this.gl.DEPTH_TEST);

    this.gl.clearColor(1, 1, 1, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // !Hacky code
    // render hitbox (used for identifying selected shape)
    this.gl.useProgram(this.selectProgram);

    this.selected?.shape.render(true, this.selectProgram);
    for (const shape of this.shapeList) {
      if (shape.id === this.selected?.shape.id) {
        continue;
      }
      shape.render(false, this.selectProgram);
    }

    // id = 1, 2, 3
    // RGBA = 0x(FF)(FF)(FF)(FF)
    const x = ((this.mousePos[0] + 1) / 2) * this.canvas.width;
    const y = ((this.mousePos[1] + 1) / 2) * this.canvas.height;
    const rgba = new Uint8Array(4);
    // detect di titik x,y. warnanya apa. trus disimpen di array rgba
    this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, rgba);
    this.pixelId = rgbaToId([rgba[0], rgba[1], rgba[2], rgba[3]]);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.clearColor(1, 1, 1, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    // !Clear canvas so hitbox doesnt show

    // Kode yang gambar bentuk dibawah ini
    this.selected?.shape.render(true, null);
    for (const shape of this.shapeList) {
      if (shape.id === this.selected?.shape.id) {
        continue;
      }
      shape.render(false, null);
    }
  }

  displayPos(document_id: string, point: Point) {
    const doc = document.getElementById(document_id);
    if (doc) {
      // Round to 2 decimal biar rapi lol
      doc.innerText = JSON.stringify(
        point.map((p) => Number(p.toPrecision(2)))
      );
    }
  }

  onMouseMove(point: Point, mouse_point?: Point) {
    if (mouse_point) {
      this.displayPos("mouse-pos", mouse_point);
    }
    this.displayPos("canvas-pos", point);

    this.mousePosBef = this.mousePos;
    this.mousePos = point;
    if (this.mode === "selecting") {
      if (this.mousePressed) {
        this.selected?.shape.onMouseMove(
          this.selected.id,
          this.mousePosBef,
          this.mousePos
        );
      }
    } else {
      this.drawingShape?.updateLastPoint(this.mousePos);
    }

    const canvas_pos = document.getElementById("canvas-pos");
    if (canvas_pos)
      canvas_pos.innerText = JSON.stringify(
        point.map((e) => Number(e.toPrecision(2)))
      );
    const mouse_pos = document.getElementById("mouse-pos");
    if (mouse_pos) mouse_pos.innerText = JSON.stringify(mouse_point);
  }

  onMouseDown(point: Point) {
    this.mousePressed = true;
    if (this.mode === "selecting") {
      if (this.pixelId === undefined) {
        return;
      }
      const shape: Shape | undefined = this.shapeList.filter((v) =>
        v.hasId(this.pixelId!)
      )[0];
      if (shape) {
        this.selected = {
          id: this.pixelId,
          shape,
        };
      } else {
        this.selected = undefined;
      }
    } else if (this.mode === "polygon") {
      if (this.drawingShape) {
        this.drawingShape.addPoint(this.mousePos);
      } else {
        const poly = new Polygon(
          this.canvas,
          this.gl,
          [Math.random(), Math.random(), Math.random()],
          [Math.random(), Math.random(), Math.random()]
        );
        poly.addPoint(this.mousePos);
        poly.addPoint(this.mousePos);
        this.shapeList.push(poly);
        this.drawingShape = poly;
        this.selected = {
          id: poly.id,
          shape: poly,
        };
      }
    } else if (this.mode === "square") {
      if (this.drawingShape) {
        this.drawingShape = null;
        this.selected = undefined;
      } else {
        const rect = new Rectangle(
          this.canvas,
          this.gl,
          [Math.random(), Math.random(), Math.random()],
          [Math.random(), Math.random(), Math.random()],
        );
        rect.addPoint(this.mousePos);
        rect.addPoint(this.mousePos);
        this.shapeList.push(rect);
        this.drawingShape = rect;
        this.selected = {
          id: rect.id,
          shape: rect,
        };
      }
    }
    else if (this.mode === "line") {
      if (this.drawingShape) {
        this.drawingShape.addPoint(this.mousePos);
      } else {
        const line = new Line(
          this.canvas,
          this.gl,
          [Math.random(), Math.random(), Math.random()],
          [Math.random(), Math.random(), Math.random()]
        );
        line.addPoint(this.mousePos);
        this.shapeList.push(line);
        this.selected = {
          id: line.id,
          shape: line,
        };
      }
    }
  }

  onMouseUp(point: Point) {
    this.mousePressed = false;
  }

  onEscKey() {
    if (this.mode != "square") {
      this.drawingShape?.points.pop();
    }
    this.drawingShape = null;
    this.selected = undefined;
  }

  onDelKey() {
    if (this.selected?.shape) {
      const idx = this.shapeList.findIndex((e) => {
        return e.id == this.selected?.id;
      });
      if (idx === -1) return;
      this.shapeList.splice(idx, 1);
      this.selected = undefined;
    }
  }
}

export default Application;
