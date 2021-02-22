import Shape from "./Shape";
import { idToRGBA } from "../utils/utils";

class Rectangle extends Shape {

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
        const arr = this.points
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
        for (let i = 0; i < this.points.length; ++i) {
            if (isSelectMode) {
                this.gl.uniform4fv(
                    u_color,
                    new Float32Array(idToRGBA(this.points[i].id))
                );
            } else {
                this.gl.uniform3fv(u_color, new Float32Array(this.selectedColor));
            }
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, i * 4, 4);
        }
    }
    createAdditionalPoint() {
        let add_point = [];
        if ((this.points[0].pos[0] == this.points[1].pos[0]) || (this.points[0].pos[1] == this.points[1].pos[1])) {

        }
        else {
            add_point.push(this.points[0].pos);
            add_point.push(this.points[0].pos[0], this.points[1].pos[1]);
            add_point.push(this.points[1].pos);
            add_point.push(this.points[1].pos[0], this.points[0].pos[1]);
        }
        return add_point;
    }
    render(selected: boolean, program: WebGLProgram | null) {
        const isSelectMode = program !== null;
        if (!program) {
            program = this.program;
        }
        if (selected) {
              this.renderPointSelected(isSelectMode ? program : null);
              this.renderBorderSelected(isSelectMode ? program : null);
        }
        this.gl.useProgram(program);
        const temp_point = this.createAdditionalPoint();
        const arr = temp_point.flat();

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