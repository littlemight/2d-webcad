import Shape from "./Shape";
import { createId, idToRGBA } from "../utils/utils";

class Rectangle extends Shape {
    rectPoints: { id: number; pos: Point }[];
    constructor(
        canvas: HTMLCanvasElement,
        gl: WebGL2RenderingContext,
        color: Color,
        selectedColor: Color,
        points: {id: number; pos: Point}[]
    ) {
        super(canvas, gl, color, selectedColor,points);
        this.rectPoints = [];
    }
    renderBorderSelected(program: WebGLProgram | null) {
        const isSelectMode = program !== null;
        if (!program) {
            program = this.program;
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

        this.gl.lineWidth(6);

        const u_color = this.gl.getUniformLocation(program, "u_color");

        if (isSelectMode) {
            this.gl.uniform4fv(u_color, new Float32Array(idToRGBA(this.id)));
        } else {
            this.gl.uniform3fv(u_color, new Float32Array([0, 0, 0]));
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

    addRectPoint(point: Point, _id: number | null, index: number) {
        if (this.rectPoints.length > index) {
            this.rectPoints[index].pos = point;
        } else {
            this.rectPoints.push({
                id: _id ? _id : createId(),
                pos: point,
            });
        }
    }

    createAdditionalPoint() {
        if (this.points.length < 2) {
            return;
        } else {
            const temp_1 = Math.abs(this.points[1].pos[0] - this.points[0].pos[0]);
            const temp_2 = Math.abs(this.points[1].pos[1] - this.points[0].pos[1]);
            let dif1 = this.points[1].pos[0] - this.points[0].pos[0] < 0 ? -1 : 1;
            let dif2 = this.points[1].pos[1] - this.points[0].pos[1] < 0 ? -1 : 1;
            let delta = 0;
            if (temp_1 < temp_2) {
                delta = temp_1;
            } else {
                delta = temp_2;
            }
            this.addRectPoint(this.points[0].pos, this.points[0].id, 0);
            this.addRectPoint(
                [this.points[0].pos[0] + delta * dif1, this.points[0].pos[1]],
                null,
                1
            );
            this.addRectPoint(
                [
                    this.points[0].pos[0] + delta * dif1,
                    this.points[0].pos[1] + delta * dif2,
                ],
                null,
                2
            );
            this.addRectPoint(
                [this.points[0].pos[0], this.points[0].pos[1] + delta * dif2],
                null,
                3
            );
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

    toSaveData() {
        return {
            type: "square" as ShapeType,
            id: this.id,
            color: this.color,
            selectedColor: this.selectedColor,
            points: this.points,
        };
    }
}

export default Rectangle;
