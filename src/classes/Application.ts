import { createShader, rgbaToId } from "../utils/utils";
import Shape from "./Shape";

class Application {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  shapeList: Shape[];
  selected?: {
    id: number;
    shape: Shape;
  };
  pixelId?: number;
  mode: Mode = "selecting";
  selectProgram: WebGLProgram | null = null;
  frameBuf: WebGLFramebuffer | null = null;
  mousePos: Point = [0, 0];
  mousePosBef: Point = [0, 0];
  mousePressed: boolean = false;

  constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) {
    this.canvas = canvas;
    this.gl = gl;
    this.shapeList = [];

    this.gl.viewport(0, 0, canvas.width, canvas.height);
    this.selectProgram = this.setupSelectProgram();
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

    if (this.selectProgram) {
      this.gl.useProgram(this.selectProgram);

      this.selected?.shape.render(true, this.selectProgram);
      for (const shape of this.shapeList) {
        if (shape.id === this.selected?.shape.id) {
          continue;
        }
        shape.render(false, this.selectProgram);
      }
    }

    const x = this.mousePos[0];
    const y = this.canvas.clientHeight - this.mousePos[1];
    const rgba = new Uint8Array(4);
    this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, rgba);
    this.pixelId = rgbaToId([rgba[0], rgba[1], rgba[2], rgba[3]]);

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.clearColor(1, 1, 1, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.selected?.shape.render(true, null);
    for (const shape of this.shapeList) {
      if (shape.id === this.selected?.shape.id) {
        continue;
      }
      shape.render(false, null);
    }
  }

  onMouseMove(point: Point) {
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
    }
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
        console.log(this.pixelId);
      } else {
        this.selected = undefined;
      }
    }
  }

  onMouseUp(point: Point) {
    this.mousePressed = false;
  }
}

export default Application;
