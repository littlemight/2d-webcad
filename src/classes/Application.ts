import {
  createShader,
  rgbaToId,
  hexaToRGBA,
  bulkProgramSetup,
} from "../utils/utils";
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
  applyingColor: Boolean = false;
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
    bulkProgramSetup(selectProgram, this.gl, this.frameBuf);
    return selectProgram;
  }

  changeSelectedColor() {
    let temp_color = "#000000";
    let temp_selectedColor = "#000000";

    const color = document.getElementById("color") as HTMLInputElement;
    const border = document.getElementById("border") as HTMLInputElement;

    temp_color = color.value;
    temp_selectedColor = border.value;
    const color_arr = hexaToRGBA(temp_color);
    const selcolor_arr = hexaToRGBA(temp_selectedColor);
    this.selected?.shape.updateColor(color_arr, selcolor_arr);
  }

  render() {
    if (this.selected && this.mode === "selecting" && this.applyingColor) {
      this.changeSelectedColor();
    }
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
        // console.log("test");
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
    let addNewShape = false;
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
          [Math.random(), Math.random(), Math.random()],
          []
        );
        this.drawingShape = poly;
        addNewShape = true;
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
          []
        );
        this.drawingShape = rect;
        addNewShape = true;
      }
    } else if (this.mode === "line") {
      if (this.drawingShape) {
        this.drawingShape = null;
        this.selected = undefined;
      } else {
        const line = new Line(
          this.canvas,
          this.gl,
          [Math.random(), Math.random(), Math.random()],
          [Math.random(), Math.random(), Math.random()],
          []
        );
        this.drawingShape = line;
        addNewShape = true;
      }
    }
    if (
      ["line", "square", "polygon"].includes(this.mode) &&
      addNewShape &&
      this.drawingShape
    ) {
      this.drawingShape.addPoint(this.mousePos);
      this.drawingShape.addPoint(this.mousePos);
      this.shapeList.push(this.drawingShape);
      this.selected = {
        id: this.drawingShape?.id,
        shape: this.drawingShape,
      };
    }
  }

  onMouseUp(point: Point) {
    this.mousePressed = false;
  }

  onEscKey() {
    if (this.mode != "square") {
      this.drawingShape?.points.pop();
    }
    if (!this.drawingShape) return;
    let str = JSON.stringify(this.drawingShape.toSaveData());
    console.log(this.drawingShape.toSaveData());
    console.log(JSON.stringify(this.drawingShape.toSaveData()));
    console.log(JSON.parse(str));
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

  save(el:any) {
    let str = "" as string;
    let arr = [] as any;
    this.shapeList.forEach(element => {
      arr.push(element.toSaveData());
    });
    str = JSON.stringify(arr);
    console.log(JSON.parse(str));
    var data = "text/json;charset=utf-8," + encodeURIComponent(str);
    el.setAttribute("href", "data:"+data);
    el.setAttribute("download", "data.json");  
  }

  load(res:any)  {
    let arr: Shape[] = [];
    console.log(res);
    res.forEach(element => {
      console.log(element);

      if (element.type === "line") {
        var line = new Line(this.canvas,this.gl,element.color,element.selectedColor,element.points);
        line.id = element.id;
        arr.push(line)
      }
      else if (element.type === "square") {
        var rect = new Rectangle(this.canvas,this.gl,element.color,element.selectedColor, element.points);
        rect.id = element.id;
        arr.push(rect)
      }
      else if (element.type === "polygon") {
        var poly = new Polygon(this.canvas,this.gl,element.color,element.selectedColor,element.points);
        poly.id = element.id;
        arr.push(poly)
      }
    });
    this.shapeList = arr;
    this.render();
  }
}

export default Application;
