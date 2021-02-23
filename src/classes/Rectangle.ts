import Shape from "./Shape";
import { createId, idToRGBA } from "../utils/utils";

class Rectangle extends Shape {
    rectPoints: { id: number; pos: Point }[];
    constructor(
        canvas: HTMLCanvasElement,
        gl: WebGL2RenderingContext,
        color: Color,
        selectedColor: Color,
    ) {
        super(canvas, gl, color, selectedColor);
        this.rectPoints = [];
    }
    renderBorderSelected(program: WebGLProgram | null) {
        const isSelectMode = program !== null;
        if (!program) {
            program = this.program;
        }
        this.gl.useProgram(program);

        const arr = this.points.map((v) => v.pos).flat();

        const posBuf = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuf);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(arr),
            this.gl.STATIC_DRAW
        );

        const a_pos = this.gl.getAttribLocation(program, "a_pos");
        this.gl.enableVertexAttribArray(a_pos);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuf);
        this.gl.vertexAttribPointer(a_pos, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.lineWidth(6);

        const u_color = this.gl.getUniformLocation(program, "u_color");

        if (isSelectMode) {
            this.gl.uniform4fv(u_color, new Float32Array(idToRGBA(this.id)));
        } else {
            this.gl.uniform3fv(u_color, new Float32Array([0.4, 0.4, 0]));
        }
        this.gl.drawArrays(this.gl.LINE_LOOP, 0, arr.length / 2);
    }

    renderPointSelected(program: WebGLProgram | null) {
        const isSelectMode = program !== null;
        if (!program) {
            program = this.program;
        }
        this.gl.useProgram(program);
        const arr = this.rectPoints
            .map((v) => v.pos)
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

        const posBuf = this.gl.createBuffer();
        const a_pos = this.gl.getAttribLocation(program, "a_pos");
        console.log(a_pos);
        this.gl.enableVertexAttribArray(a_pos);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuf);
        this.gl.vertexAttribPointer(a_pos, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(arr),
            this.gl.STATIC_DRAW
        );

        const u_color = this.gl.getUniformLocation(program, "u_color");
        for (let i = 0; i < this.rectPoints.length; ++i) {
            if (isSelectMode) {
                this.gl.uniform4fv(
                    u_color,
                    new Float32Array(idToRGBA(this.rectPoints[i].id))
                );
            } else {
                this.gl.uniform3fv(u_color, new Float32Array(this.selectedColor));
            }
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, i * 4, 4);
        }
    }

    addRectPoint(point: Point, _id: number | null) {
        if (_id) {
            this.rectPoints.push({
                id: _id,
                pos: point,
            });
        } else {
            this.rectPoints.push({
                id: createId(),
                pos: point,
            });
        }
    }
    createAdditionalPoint() {
        while (this.rectPoints.length != 0) {
            this.rectPoints.pop();
        }
        if ((this.points[0].pos[0] == this.points[1].pos[0]) || (this.points[0].pos[1] == this.points[1].pos[1])) {

        }
        else {
            this.addRectPoint(this.points[0].pos, this.points[0].id);
            const temp_1 = Math.abs(this.points[1].pos[0] - this.points[0].pos[0])
            const temp_2 = Math.abs(this.points[1].pos[1] - this.points[0].pos[1])
            let dif1 = (this.points[1].pos[0] - this.points[0].pos[0]) < 0 ? -1 : 1;
            let dif2 = (this.points[1].pos[1] - this.points[0].pos[1]) < 0 ? -1 : 1;
            let delta = 0;
            if (temp_1 < temp_2) {
                delta = temp_1;
            }
            else {
                delta = temp_2;
            }
            this.addRectPoint([this.points[0].pos[0] + (delta * dif1), this.points[0].pos[1]], null);
            this.addRectPoint([this.points[0].pos[0] + (delta * dif1), this.points[0].pos[1] + (delta * dif2)], null);
            this.addRectPoint([this.points[0].pos[0], this.points[0].pos[1] + (delta * dif2)], null)
        }
    }

    render(selected: boolean, program: WebGLProgram | null) {
        const isSelectMode = program !== null;
        this.createAdditionalPoint();
        if (!program) {
            program = this.program;
        }
        if (selected) {
            this.renderPointSelected(isSelectMode ? program : null);
            this.renderBorderSelected(isSelectMode ? program : null);
        }
        this.gl.useProgram(program);
        const arr = this.rectPoints.map((v) => v.pos).flat();

        const posBuf = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuf);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(arr),
            this.gl.STATIC_DRAW
        );

        const a_pos = this.gl.getAttribLocation(program, "a_pos");
        this.gl.enableVertexAttribArray(a_pos);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuf);
        this.gl.vertexAttribPointer(a_pos, 2, this.gl.FLOAT, false, 0, 0);

        const u_color = this.gl.getUniformLocation(program, "u_color");
        if (isSelectMode) {
            this.gl.uniform4fv(u_color, new Float32Array(idToRGBA(this.id)));
        } else {
            this.gl.uniform3fv(u_color, new Float32Array(this.color));
        }

        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, arr.length / 2);
    }
}

export default Rectangle;